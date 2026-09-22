import { StrictMode, useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleMap, LoadScript, MarkerF } from '@react-google-maps/api'
import L from 'leaflet'
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet'
import { COMPONENTS } from './componentsData.js'
import IntegrationGuide from './components/IntegrationGuide.jsx'
import './styles.css'
import 'leaflet/dist/leaflet.css'

/* ────────────────────────────────────────────
   Map Config (for Leaflet & Maps demo)
   ──────────────────────────────────────────── */
const defaultLocation = { lat: 17.6868, lng: 83.2185 }
const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
const mapContainerStyle = { width: '100%', height: '300px' }
const leafletIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowSize: [41, 41],
})

/* ════════════════════════════════════════════════════════════
   LIVE PREVIEW COMPONENTS
   ════════════════════════════════════════════════════════════ */

/* ─── 1. Split Flap Text Preview (v5.0.4) ─── */
const SF_CHARSETS = { alphanumeric: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789' }
const sfSample = (cs) => cs.charAt(Math.floor(Math.random() * cs.length)) || ' '
const sfBuildSeq = (target, flips, cs) => {
  const s = []
  for (let i = 0; i < flips; i++) s.push(sfSample(cs))
  s.push(target)
  return s
}
let sfTileId = 0
const sfCreateTiles = (text) =>
  text.split('').map((c) => ({
    id: `sft-${sfTileId++}`,
    current: c,
    next: c,
    flipping: false,
    tick: 0,
  }))

function SplitFlapPreview() {
  const [displayText, setDisplayText] = useState('LAUNCH READY')
  const [tiles, setTiles] = useState(() => sfCreateTiles('LAUNCH READY'))
  const [isAnimating, setIsAnimating] = useState(false)
  const rafRef = useRef(null)

  const triggerAnimation = useCallback(
    (targetText) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      setIsAnimating(true)
      const cs = SF_CHARSETS.alphanumeric
      const flipMs = 90
      const staggerMs = 45
      const flips = 7
      const target = (targetText || ' ').toUpperCase()

      // Create new tiles matching target length
      setTiles((prev) => {
        return target.split('').map((tc, i) => {
          const fromChar = prev[i]?.current || ' '
          return {
            id: prev[i]?.id || `sft-${sfTileId++}`,
            current: fromChar,
            next: tc,
            flipping: false,
            tick: 0,
          }
        })
      })

      const plans = target.split('').map((tc, i) => {
        const fromChar = tiles[i]?.current || ' '
        return {
          index: i,
          target: tc,
          seq: sfBuildSeq(tc, flips, cs),
          start: i * staggerMs,
          from: fromChar,
        }
      })

      const t0 = performance.now()
      const tick = (now) => {
        const elapsed = now - t0
        const updates = []
        plans.forEach((p) => {
          const step = Math.floor((elapsed - p.start) / flipMs)
          if (step >= 0 && step < p.seq.length) {
            updates.push({
              index: p.index,
              current: step === 0 ? p.from : p.seq[step - 1],
              next: p.seq[step],
            })
          }
        })
        if (updates.length > 0) {
          setTiles((prev) => {
            const n = [...prev]
            updates.forEach((u) => {
              if (n[u.index]) {
                n[u.index] = {
                  ...n[u.index],
                  current: u.current,
                  next: u.next,
                  flipping: true,
                  tick: (n[u.index].tick || 0) + 1,
                }
              }
            })
            return n
          })
          rafRef.current = requestAnimationFrame(tick)
        } else {
          setTiles((prev) =>
            prev.map((t) => ({ ...t, current: t.next, flipping: false }))
          )
          setIsAnimating(false)
        }
      }
      rafRef.current = requestAnimationFrame(tick)
    },
    [tiles]
  )

  useEffect(() => {
    triggerAnimation(displayText)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const presets = ['LAUNCH READY', 'SYNC ONLINE', 'PEGA COSMOS', 'SYSTEM LIVE', 'FLIGHT 804']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: 20 }}>
      <div className="preview-interactive-bar">
        <input
          type="text"
          className="preview-ctrl-input"
          value={displayText}
          onChange={(e) => setDisplayText(e.target.value.toUpperCase())}
          placeholder="Type message..."
          maxLength={18}
          style={{ width: 180, textTransform: 'uppercase' }}
        />
        <button
          className="preview-ctrl-btn is-active"
          onClick={() => triggerAnimation(displayText)}
          disabled={isAnimating}
        >
          {isAnimating ? 'Flipping…' : '⟳ Re-Flip'}
        </button>
        {presets.map((p) => (
          <button
            key={p}
            className="preview-ctrl-btn"
            onClick={() => {
              setDisplayText(p)
              triggerAnimation(p)
            }}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="sf-preview">
        {tiles.map((tile) => (
          <span key={tile.id} className="sf-tile" aria-hidden="true">
            <span className="sf-half sf-half-top">
              <span className="sf-char">{tile.current}</span>
            </span>
            <span className="sf-half sf-half-bottom">
              <span className="sf-char">{tile.next}</span>
            </span>
            {tile.flipping && (
              <>
                <span
                  key={`${tile.id}-f-${tile.tick}`}
                  className="sf-flap sf-flap-front"
                >
                  <span className="sf-char">{tile.current}</span>
                </span>
                <span
                  key={`${tile.id}-b-${tile.tick}`}
                  className="sf-flap sf-flap-back"
                >
                  <span className="sf-char">{tile.next}</span>
                </span>
              </>
            )}
          </span>
        ))}
      </div>

      <div style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text-dim)' }}>
        Widget renders 1 split-flap animation on mount. Tile count matches text length ({displayText.length} tiles).
      </div>
    </div>
  )
}

/* ─── 2. Split Flap Text Field Preview (NEW v5.0.4) ─── */
function SplitFlapFieldPreview() {
  const [val, setVal] = useState('ALPHA-09')
  const [saved, setSaved] = useState(false)

  const handleInput = (e) => {
    setVal(e.target.value.toUpperCase())
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="field-preview-card">
      <div className="field-pega-banner">
        <span>⚙️ Pega Property: <strong>.DisplayText</strong> (Case C-1049)</span>
        <span>{saved ? '✓ Value Synced' : 'Ready'}</span>
      </div>

      <div className="field-group">
        <label className="field-label">
          Display text <span className="required-star">*</span>
        </label>
        <div className="field-controls-row">
          <input
            className="field-input"
            value={val}
            placeholder="Enter display text..."
            onChange={handleInput}
            maxLength={16}
            style={{ textTransform: 'uppercase', fontFamily: 'var(--mono)', fontSize: 15 }}
          />
        </div>
        <span className="field-message">Editable text field with live animated split-flap preview beneath.</span>
      </div>

      <div className="field-preview-divider">
        <span className="field-preview-caption">Live Animated Split-Flap Preview</span>
        <div className="sf-preview" style={{ fontSize: 32, justifyContent: 'center' }}>
          {(val || ' ').split('').map((char, idx) => (
            <span key={idx} className="sf-tile" style={{ width: '0.78em', height: '1.2em' }}>
              <span className="sf-half sf-half-top">
                <span className="sf-char">{char}</span>
              </span>
              <span className="sf-half sf-half-bottom">
                <span className="sf-char">{char}</span>
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── 3. Profile Card Preview (v5.0.4 with Attachment & 3D Tilt) ─── */
function ProfileCardPreview() {
  const shellRef = useRef(null)
  const [mode, setMode] = useState('photo') // 'photo' | 'attachment' | 'initials'
  const [tiltEnabled, setTiltEnabled] = useState(true)
  const [name, setName] = useState('Javi A. Torres')
  const [status, setStatus] = useState('Online')

  const photoUrl =
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80'
  const attachmentUrl =
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80'

  useEffect(() => {
    const el = shellRef.current
    if (!el || !tiltEnabled) {
      if (el) {
        el.style.setProperty('--pc-rotate-x', '0deg')
        el.style.setProperty('--pc-rotate-y', '0deg')
      }
      return
    }
    const onMove = (e) => {
      const b = el.getBoundingClientRect()
      const x = ((e.clientX - b.left) / b.width) * 100
      const y = ((e.clientY - b.top) / b.height) * 100
      el.style.setProperty('--pc-pointer-x', `${x}%`)
      el.style.setProperty('--pc-pointer-y', `${y}%`)
      el.style.setProperty('--pc-rotate-x', `${((x - 50) / 18).toFixed(2)}deg`)
      el.style.setProperty('--pc-rotate-y', `${((50 - y) / 22).toFixed(2)}deg`)
    }
    const onLeave = () => {
      el.style.setProperty('--pc-pointer-x', '50%')
      el.style.setProperty('--pc-pointer-y', '50%')
      el.style.setProperty('--pc-rotate-x', '0deg')
      el.style.setProperty('--pc-rotate-y', '0deg')
    }
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [tiltEnabled])

  const initials =
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || '?'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: 16 }}>
      <div className="preview-interactive-bar">
        <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text-muted)' }}>Image:</span>
        <button
          className={`preview-ctrl-btn ${mode === 'photo' ? 'is-active' : ''}`}
          onClick={() => setMode('photo')}
        >
          Direct URL
        </button>
        <button
          className={`preview-ctrl-btn ${mode === 'attachment' ? 'is-active' : ''}`}
          onClick={() => setMode('attachment')}
        >
          Case Attachment
        </button>
        <button
          className={`preview-ctrl-btn ${mode === 'initials' ? 'is-active' : ''}`}
          onClick={() => setMode('initials')}
        >
          Initials Fallback
        </button>
        <button
          className={`preview-ctrl-btn ${tiltEnabled ? 'is-active' : ''}`}
          onClick={() => setTiltEnabled((t) => !t)}
        >
          {tiltEnabled ? '3D Tilt: ON' : '3D Tilt: OFF'}
        </button>
      </div>

      <div ref={shellRef} className="pc-shell" role="region" aria-label="Profile preview">
        <div className="pc-image-frame">
          {mode === 'photo' ? (
            <img className="pc-image" src={photoUrl} alt="Profile photo" />
          ) : mode === 'attachment' ? (
            <img className="pc-image" src={attachmentUrl} alt="Pega attachment" />
          ) : (
            <div className="pc-fallback">{initials}</div>
          )}
          <div className="pc-caption">
            <h3 className="pc-caption-name">{name}</h3>
            <span className="pc-caption-title">Senior Software Engineer</span>
          </div>
        </div>
        <div className="pc-body">
          <div className="pc-identity">
            <span className="pc-handle">@javicodes</span>
            <span className="pc-status">{status}</span>
          </div>
        </div>
      </div>

      <div style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text-dim)', textAlign: 'center' }}>
        {mode === 'attachment'
          ? 'Mapped via imageAttachmentCategory="Image", imageAttachmentProperty="ProfileAttachment"'
          : 'Supports @P .CustomerName, Pega asset keys, and dynamic case attachments.'}
      </div>
    </div>
  )
}

/* ─── 4. Calendar Preview ─── */
const CAL_EVENTS = [
  { id: 1, title: 'Case C-4091 Client Review', day: 3, time: '09:30', color: 'blue' },
  { id: 2, title: 'Sprint Retrospective', day: 8, time: '14:00', color: 'indigo' },
  { id: 3, title: 'Pega Upgrade Testing', day: 15, time: '11:00', color: 'amber' },
  { id: 4, title: 'Architecture Signoff', day: 22, time: '16:00', color: 'green' },
]

function CalendarPreview() {
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [viewMode, setViewMode] = useState('Monthly')
  const [events, setEvents] = useState(CAL_EVENTS)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const firstDayOfWeek = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  const today = new Date()
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))
  const goToday = () => setCurrentDate(new Date())

  const cells = []
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, isCurrent: false })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, isCurrent: true, isToday: isCurrentMonth && today.getDate() === d })
  }
  const remaining = 35 - cells.length
  for (let i = 1; i <= remaining; i++) {
    cells.push({ day: i, isCurrent: false })
  }

  return (
    <div className="cal-preview">
      <div className="cal-toolbar">
        <div className="cal-toolbar-nav">
          <button className="cal-nav-btn" onClick={prevMonth}>‹</button>
          <button className="cal-nav-btn" onClick={nextMonth}>›</button>
          <button className="cal-nav-btn" onClick={goToday} style={{ fontSize: 11, padding: '4px 8px' }}>Today</button>
          <span className="cal-title">{monthNames[month]} {year}</span>
        </div>
        <div className="cal-view-btns">
          {['Daily', 'Weekly', 'Monthly'].map((v) => (
            <button
              key={v}
              className={`cal-view-btn ${viewMode === v ? 'is-active' : ''}`}
              onClick={() => setViewMode(v)}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="cal-grid">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="cal-day-header">{d}</div>
        ))}
        {cells.map((cell, idx) => {
          const dayEvents = cell.isCurrent ? events.filter((e) => e.day === cell.day) : []
          return (
            <div key={idx} className={`cal-cell ${!cell.isCurrent ? 'is-muted' : ''}`}>
              <div className={`cal-cell-number ${cell.isToday ? 'is-today' : ''}`}>{cell.day}</div>
              {dayEvents.map((evt) => (
                <div key={evt.id} className={`cal-event cal-event-${evt.color}`}>
                  {evt.time} {evt.title}
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── 5. Mapbox Address Field Preview (NEW v5.0.4) ─── */
function MapboxAddressFieldPreview() {
  const [address, setAddress] = useState('742 Evergreen Terrace, Springfield, OR')
  const [loading, setLoading] = useState(false)
  const [statusMsg, setStatusMsg] = useState('Field bound to .CustomerAddress')
  const [msgType, setMsgType] = useState('info')

  const handleSearch = () => {
    if (!address.trim()) return
    setLoading(true)
    setStatusMsg('Searching Mapbox Places geocoder…')
    setMsgType('info')
    setTimeout(() => {
      setLoading(false)
      setStatusMsg(`✓ Address verified and mapped to case: "${address}"`)
      setMsgType('success')
    }, 600)
  }

  const handleLocate = () => {
    if (!navigator.geolocation) {
      setStatusMsg('Geolocation is not supported by your browser')
      setMsgType('error')
      return
    }
    setLoading(true)
    setStatusMsg('Requesting browser location…')
    setMsgType('info')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoading(false)
        const sample = `Lat ${pos.coords.latitude.toFixed(4)}, Lng ${pos.coords.longitude.toFixed(4)}`
        setAddress(sample)
        setStatusMsg(`✓ Resolved current location: ${sample}`)
        setMsgType('success')
      },
      () => {
        setLoading(false)
        setAddress('1600 Amphitheatre Pkwy, Mountain View, CA 94043')
        setStatusMsg('Location permission simulated — loaded demo coordinates')
        setMsgType('info')
      }
    )
  }

  return (
    <div className="field-preview-card">
      <div className="field-pega-banner">
        <span>⚙️ Pega Property: <strong>.CustomerAddress</strong> (Type: Text)</span>
        <span>Mapbox Geocoding API</span>
      </div>

      <div className="field-group">
        <label className="field-label">
          Address <span className="required-star">*</span>
        </label>
        <div className="field-controls-row">
          <input
            className="field-input"
            value={address}
            placeholder="Search for an address..."
            onChange={(e) => setAddress(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button className="field-action-btn" onClick={handleSearch} disabled={loading}>
            {loading ? 'Searching…' : 'Search'}
          </button>
          <button className="field-action-btn btn-secondary" onClick={handleLocate} disabled={loading}>
            Locate
          </button>
        </div>
        <span className={`field-message ${msgType === 'success' ? 'is-success' : msgType === 'error' ? 'is-error' : ''}`}>
          {statusMsg}
        </span>
      </div>

      <div className="field-preview-divider">
        <span className="field-preview-caption">Pega Cosmos Integration Details</span>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          • Uses restricted public token (<code>pk...</code>) via Mapbox Places API.<br />
          • Automatically commits address value using <code>actions.updateFieldValue()</code>.<br />
          • Supports standard Pega validation messages, read-only modes, and field disabling.
        </div>
      </div>
    </div>
  )
}

/* ─── 6. Mapbox Address Picker Preview (NEW v5.0.4) ─── */
function LeafletLocationMarker({ setLocation }) {
  useMapEvents({
    click: (e) => setLocation(e.latlng.lat, e.latlng.lng, 'Map Click Point'),
  })
  return null
}

function MapboxAddressPickerPreview() {
  const [coords, setCoords] = useState({ lat: 17.6868, lng: 83.2185 })
  const [searchVal, setSearchVal] = useState('Visakhapatnam, Andhra Pradesh, India')
  const [loading, setLoading] = useState(false)
  const [pegaProps, setPegaProps] = useState({
    addressLine1: 'Beach Road, Pandurangapuram',
    city: 'Visakhapatnam',
    state: 'Andhra Pradesh',
    country: 'India',
    postalCode: '530003',
    latitude: '17.686800',
    longitude: '83.218500',
  })

  const updateLocation = (lat, lng, placeName) => {
    setCoords({ lat, lng })
    setPegaProps({
      addressLine1: placeName || 'Beach Road, Pandurangapuram',
      city: 'Visakhapatnam',
      state: 'Andhra Pradesh',
      country: 'India',
      postalCode: '530003',
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6),
    })
  }

  const handleSearch = () => {
    if (!searchVal.trim()) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      updateLocation(17.6868, 83.2185, searchVal)
    }, 500)
  }

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) return
    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoading(false)
        updateLocation(pos.coords.latitude, pos.coords.longitude, 'Current Browser Location')
      },
      () => {
        setLoading(false)
      }
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 16 }}>
      <div className="preview-interactive-bar" style={{ justifyContent: 'flex-start', margin: 0 }}>
        <input
          className="field-input"
          style={{ maxWidth: 360 }}
          value={searchVal}
          placeholder="Search for an address..."
          onChange={(e) => setSearchVal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button className="field-action-btn" onClick={handleSearch} disabled={loading}>
          {loading ? 'Searching…' : 'Search'}
        </button>
        <button className="field-action-btn btn-secondary" onClick={handleCurrentLocation}>
          Use current location
        </button>
      </div>

      <div className="real-map" style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
        <MapContainer
          center={[coords.lat, coords.lng]}
          zoom={12}
          style={mapContainerStyle}
          scrollWheelZoom
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LeafletLocationMarker setLocation={updateLocation} />
          <Marker position={[coords.lat, coords.lng]} icon={leafletIcon} />
        </MapContainer>
      </div>

      <div className="pega-case-props">
        <div className="pega-case-props-header">
          <span>⚡ Live Pega Case Properties (7 Fields Auto-Mapped)</span>
          <span style={{ color: 'var(--green)' }}>● Synced with Case</span>
        </div>
        <div className="pega-props-grid">
          <div className="pega-prop-card">
            <span className="pega-prop-name">.AddressLine1</span>
            <span className="pega-prop-value">{pegaProps.addressLine1}</span>
          </div>
          <div className="pega-prop-card">
            <span className="pega-prop-name">.City</span>
            <span className="pega-prop-value">{pegaProps.city}</span>
          </div>
          <div className="pega-prop-card">
            <span className="pega-prop-name">.State</span>
            <span className="pega-prop-value">{pegaProps.state}</span>
          </div>
          <div className="pega-prop-card">
            <span className="pega-prop-name">.Country</span>
            <span className="pega-prop-value">{pegaProps.country}</span>
          </div>
          <div className="pega-prop-card">
            <span className="pega-prop-name">.PostalCode</span>
            <span className="pega-prop-value">{pegaProps.postalCode}</span>
          </div>
          <div className="pega-prop-card">
            <span className="pega-prop-name">.Latitude</span>
            <span className="pega-prop-value">{pegaProps.latitude}</span>
          </div>
          <div className="pega-prop-card">
            <span className="pega-prop-name">.Longitude</span>
            <span className="pega-prop-value">{pegaProps.longitude}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════
   PREVIEW LOOKUP
   ════════════════════════════════════════════════════════════ */
const PREVIEW_MAP = {
  'split-flap-text': SplitFlapPreview,
  'split-flap-text-field': SplitFlapFieldPreview,
  'profile-card': ProfileCardPreview,
  'calendar': CalendarPreview,
  'mapbox-address-field': MapboxAddressFieldPreview,
  'mapbox-address-picker': MapboxAddressPickerPreview,
}

/* ════════════════════════════════════════════════════════════
   SHARED UI COMPONENTS
   ════════════════════════════════════════════════════════════ */
function StatusBadge({ status }) {
  const key = status.replace(' ', '-').toLowerCase()
  return (
    <span className={`badge badge-${key}`}>
      <span className="badge-dot" />
      {status}
    </span>
  )
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [text])
  return (
    <button className={`copy-btn ${copied ? 'is-copied' : ''}`} onClick={handleCopy}>
      {copied ? '✓ Copied' : '⧉ Copy'}
    </button>
  )
}

/* ─── Code Viewer ─── */
function CodeViewer({ component }) {
  const [activeFile, setActiveFile] = useState(0)
  const file = component.files[activeFile] || component.files[0] || { name: '', content: '' }

  return (
    <div className="code-viewer">
      <div className="instructions-panel">
        <h3>{component.instructions?.title || `${component.name} Integration`}</h3>
        <ol className="instructions-steps">
          {component.instructions?.steps?.map((step, idx) => (
            <li key={idx} dangerouslySetInnerHTML={{ __html: step }} />
          ))}
        </ol>
        {component.deps && component.deps.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text-muted)' }}>
              Dependencies:
            </span>
            <div className="deps-list">
              {component.deps.map((dep) => (
                <span key={dep} className="dep-tag">{dep}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* File tabs */}
      <div className="file-tabs">
        {component.files.map((f, i) => (
          <button
            key={f.name}
            className={`file-tab ${i === activeFile ? 'is-active' : ''}`}
            onClick={() => setActiveFile(i)}
          >
            {f.name}
          </button>
        ))}
      </div>

      {/* Code content */}
      <div className="code-content">
        <div className="code-content-header">
          <span className="code-content-filename">{file.name}</span>
          <CopyButton text={file.content} />
        </div>
        <div className="code-scroll">
          <pre><code>{file.content}</code></pre>
        </div>
      </div>
    </div>
  )
}

/* ─── Component Card ─── */
function ComponentCard({ component, onClick }) {
  return (
    <div
      className="component-card"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
    >
      <div className="card-top">
        <div className={`card-icon card-icon-${component.accent}`}>{component.icon}</div>
        <StatusBadge status={component.status} />
      </div>
      <div className="card-name">{component.name}</div>
      <div className="card-type">{component.type}</div>
      <p className="card-description">{component.description}</p>
      <div className="card-footer">
        <div className="card-meta">
          <span className="card-meta-item">📦 {component.version}</span>
          <span className="card-meta-item">⚛️ React</span>
        </div>
        <span className="btn-download" style={{ pointerEvents: 'none' }}>
          View →
        </span>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════
   DETAIL PAGE
   ════════════════════════════════════════════════════════════ */
function DetailPage({ component, onBack }) {
  const [tab, setTab] = useState('preview')
  const PreviewComponent = PREVIEW_MAP[component.id]

  return (
    <div className="detail-page shell">
      <button className="back-btn" onClick={onBack}>
        <span className="back-arrow">←</span> Back to components
      </button>

      <div className="detail-page-header">
        <div className="detail-page-title">
          <div className={`card-icon card-icon-${component.accent}`}>{component.icon}</div>
          <div>
            <h2>{component.name}</h2>
            <div className="card-type">{component.type} • {component.componentDir}</div>
          </div>
        </div>
        <div className="detail-page-meta">
          <StatusBadge status={component.status} />
          <span className="detail-version">{component.version}</span>
        </div>
      </div>

      <p className="detail-description">{component.description}</p>

      {/* Tab toggle */}
      <div className="tab-toggle">
        <button
          className={`tab-toggle-btn ${tab === 'preview' ? 'is-active' : ''}`}
          onClick={() => setTab('preview')}
        >
          Preview
        </button>
        <button
          className={`tab-toggle-btn ${tab === 'code' ? 'is-active' : ''}`}
          onClick={() => setTab('code')}
        >
          Code & Files ({component.files?.length || 0})
        </button>
      </div>

      {/* Content */}
      {tab === 'preview' ? (
        <div className="preview-container">
          <div className="preview-toolbar">
            <div className="preview-toolbar-left">
              <div className="preview-toolbar-dots">
                <i className="window-dot dot-red" />
                <i className="window-dot dot-yellow" />
                <i className="window-dot dot-green" />
              </div>
              <span><i className="live-dot" /> Live Preview</span>
            </div>
            <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text-dim)' }}>
              {component.name.toUpperCase().replace(/ /g, '_')} / {component.version.toUpperCase()}
            </span>
          </div>
          <div className="preview-body">
            {PreviewComponent ? (
              <PreviewComponent />
            ) : (
              <span style={{ color: 'var(--text-muted)' }}>Preview not available</span>
            )}
          </div>
        </div>
      ) : (
        <CodeViewer component={component} />
      )}

      <div className="detail-features" style={{ marginTop: 24 }}>
        <span className="detail-feature"><i className="check-icon">✓</i> Pega-ready schema</span>
        <span className="detail-feature"><i className="check-icon">✓</i> Keyboard accessible</span>
        <span className="detail-feature"><i className="check-icon">✓</i> Responsive design</span>
        <span className="detail-feature"><i className="check-icon">✓</i> 100% Up-to-date with Components/</span>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════
   APP
   ════════════════════════════════════════════════════════════ */
function App() {
  const [currentView, setCurrentView] = useState('catalog') // 'catalog' | 'detail' | 'guide'
  const [selectedId, setSelectedId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const selectedComponent = COMPONENTS.find((c) => c.id === selectedId)

  const categories = useMemo(() => {
    const set = new Set(['All'])
    COMPONENTS.forEach((c) => set.add(c.type))
    return Array.from(set)
  }, [])

  const filteredComponents = useMemo(() => {
    return COMPONENTS.filter((c) => {
      const matchesCategory = selectedCategory === 'All' || c.type === selectedCategory
      if (!searchQuery.trim()) return matchesCategory
      const q = searchQuery.toLowerCase()
      const matchesSearch =
        c.name.toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.status.toLowerCase().includes(q)
      return matchesCategory && matchesSearch
    })
  }, [searchQuery, selectedCategory])

  const openDetail = (id) => {
    setSelectedId(id)
    setCurrentView('detail')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const backToCatalog = () => {
    setCurrentView('catalog')
    setSelectedId(null)
  }

  const openGuide = () => {
    setCurrentView('guide')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <main>
      {/* ═══ NAV ═══ */}
      <div className="nav-wrapper">
        <nav className="nav shell">
          <a
            className="brand"
            href="#top"
            onClick={(e) => {
              e.preventDefault()
              backToCatalog()
            }}
          >
            <span className="brand-mark">C</span>
            <span>Constellation<span className="brand-slash">/</span><span className="brand-dim">Hub</span></span>
          </a>
          <div className="nav-links">
            <a
              href="#catalog"
              onClick={(e) => {
                e.preventDefault()
                backToCatalog()
              }}
            >
              Components
            </a>
            <a
              href="#guide"
              onClick={(e) => {
                e.preventDefault()
                openGuide()
              }}
            >
              📖 Integration Guide
            </a>
            <a href="#status">
              <span className="status-pill"><i className="live-dot" /> All systems go</span>
            </a>
          </div>
          <button className="btn btn-ghost" onClick={backToCatalog}>
            Open console <span>↗</span>
          </button>
        </nav>
      </div>

      {currentView === 'guide' ? (
        <IntegrationGuide onBack={backToCatalog} />
      ) : currentView === 'detail' && selectedComponent ? (
        <DetailPage component={selectedComponent} onBack={backToCatalog} />
      ) : (
        <>
          {/* ═══ HERO ═══ */}
          <section className="hero shell" id="top">
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              Pega Constellation Extension Platform
            </div>
            <h1>Build better with<br /><span className="gradient-text">premium components.</span></h1>
            <p className="hero-subtitle">
              Production-ready React components for Pega Constellation.
              Browse, preview, and grab the code — then integrate into your cases in minutes.
            </p>
            <div className="hero-actions">
              <a className="btn btn-primary btn-large" href="#catalog">
                Explore components <span>↓</span>
              </a>
              <button className="btn btn-ghost btn-large" onClick={openGuide}>
                📖 Integration guide <span>↗</span>
              </button>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <div className="hero-stat-value">
                  <span className="stat-accent">{COMPONENTS.length}</span>
                </div>
                <span className="hero-stat-label">Components</span>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-value">
                  {COMPONENTS.filter((c) => c.status === 'Stable' || c.status === 'Updated').length}
                </div>
                <span className="hero-stat-label">Production Ready</span>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-value">
                  {COMPONENTS.filter((c) => c.status === 'New').length}<span className="stat-accent">+</span>
                </div>
                <span className="hero-stat-label">New Additions</span>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-value">v5.0.4</div>
                <span className="hero-stat-label">Latest release</span>
              </div>
            </div>
          </section>

          {/* ═══ SIGNAL BAR ═══ */}
          <section className="signal-bar">
            <div className="shell signal-inner">
              <span className="signal-label">Designed for the way your teams ship</span>
              <div className="signal-techs">
                <span className="signal-tech"><span className="signal-tech-dot" /> React 18/19</span>
                <span className="signal-tech"><span className="signal-tech-dot" /> Cosmos Core</span>
                <span className="signal-tech"><span className="signal-tech-dot" /> DX API</span>
                <span className="signal-tech"><span className="signal-tech-dot" /> Mapbox Geocoding</span>
                <span className="signal-tech"><span className="signal-tech-dot" /> Constellation</span>
              </div>
            </div>
          </section>

          {/* ═══ CATALOG ═══ */}
          <section className="catalog shell" id="catalog">
            <div className="section-header">
              <div className="section-header-left">
                <div className="section-eyebrow"><span className="section-eyebrow-line" /> Component Library</div>
                <h2>Browse & explore<br /><span className="gradient-text">ready-to-use parts.</span></h2>
              </div>
              <p className="section-header-right">
                A complete library of isolated, configurable components for Pega Constellation.
                Click any card to preview the component live and inspect the source code.
              </p>
            </div>

            {/* Search & Filter bar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="search-bar">
                <span className="search-icon">⌕</span>
                <input
                  type="text"
                  placeholder="Search components by name, type, or keyword…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  id="component-search"
                />
                <span className="search-shortcut">⌘K</span>
              </div>

              {/* Category Filter Pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    className={`preview-ctrl-btn ${selectedCategory === cat ? 'is-active' : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat} {cat === 'All' ? `(${COMPONENTS.length})` : `(${COMPONENTS.filter((c) => c.type === cat).length})`}
                  </button>
                ))}
              </div>
            </div>

            <div className="component-grid" style={{ marginTop: 24 }}>
              {filteredComponents.length > 0 ? (
                filteredComponents.map((c) => (
                  <ComponentCard key={c.id} component={c} onClick={() => openDetail(c.id)} />
                ))
              ) : (
                <div className="no-results">
                  <div className="no-results-icon">⌕</div>
                  <h3>No components found</h3>
                  <p>Try a different search term or select "All" categories.</p>
                </div>
              )}
            </div>
          </section>

          {/* ═══ INTEGRATION / DOCS ═══ */}
          <section className="integration shell" id="docs">
            <div className="integration-header">
              <div className="big-number">02</div>
              <div className="section-eyebrow"><span className="section-eyebrow-line" /> Integration guide</div>
              <h2>From component<br /><span className="gradient-text">to Constellation case.</span></h2>
            </div>
            <div className="integration-body">
              <p>
                Constellation Hub components conform to standard Pega Cosmos schemas.
                Drop into your codebase, configure properties in App Studio or Dev Studio,
                and deploy directly to production.
              </p>
              <div className="code-block">
                <div className="code-header">
                  <div className="code-dots">
                    <i className="window-dot dot-red" />
                    <i className="window-dot dot-yellow" />
                    <i className="window-dot dot-green" />
                  </div>
                  <span className="code-filename">Pega_Extensions_SplitFlapTextField/config.json</span>
                  <button className="code-copy-btn" aria-label="Copy configuration">⧉</button>
                </div>
                <pre><code>
<span className="code-punctuation">{'{'}</span>{'\n'}
{'  '}<span className="code-key">"name"</span>: <span className="code-string">"Pega_Extensions_SplitFlapTextField"</span>,{'\n'}
{'  '}<span className="code-key">"version"</span>: <span className="code-string">"5.0.4"</span>,{'\n'}
{'  '}<span className="code-key">"type"</span>: <span className="code-string">"Field"</span>,{'\n'}
{'  '}<span className="code-key">"subtype"</span>: <span className="code-string">"Text"</span>,{'\n'}
{'  '}<span className="code-key">"organization"</span>: <span className="code-string">"Pega"</span>{'\n'}
<span className="code-punctuation">{'}'}</span>
                </code></pre>
              </div>
            </div>
          </section>

          {/* ═══ FOOTER ═══ */}
          <footer className="footer" id="status">
            <div className="footer-inner shell">
              <div className="brand">
                <span className="brand-mark">C</span>
                <span>Constellation<span className="brand-slash">/</span><span className="brand-dim">Hub</span></span>
              </div>
              <span>Built for teams extending the possible.</span>
              <span className="footer-status"><i className="live-dot" /> Platform operational · 2026</span>
            </div>
          </footer>
        </>
      )}
    </main>
  )
}

/* ════════════════════════════════════════════
   Embed route
   ════════════════════════════════════════════ */
function EmbedApp() {
  return (
    <div className="embed-page">
      <MapboxAddressPickerPreview />
    </div>
  )
}

const isEmbedRoute = window.location.pathname === '/map-component'
createRoot(document.getElementById('root')).render(
  <StrictMode>{isEmbedRoute ? <EmbedApp /> : <App />}</StrictMode>
)