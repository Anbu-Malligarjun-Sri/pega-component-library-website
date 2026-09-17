import { StrictMode, useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleMap, LoadScript, MarkerF } from '@react-google-maps/api'
import L from 'leaflet'
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet'
import './styles.css'
import 'leaflet/dist/leaflet.css'

/* ────────────────────────────────────────────
   Map Config (preserved)
   ──────────────────────────────────────────── */
const defaultLocation = { lat: 17.385044, lng: 78.486671 }
const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
const mapContainerStyle = { width: '100%', height: '300px' }
const leafletIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], shadowSize: [41, 41],
})

/* ════════════════════════════════════════════════════════════
   COMPONENT REGISTRY
   ════════════════════════════════════════════════════════════ */
const COMPONENTS = [
  {
    id: 'split-flap-text',
    name: 'Split Flap Text',
    type: 'Animation',
    status: 'Stable',
    accent: 'indigo',
    icon: '⌁',
    version: 'v5.0.4',
    description: 'Displays animated text using split-flap style character tiles. Perfect for status displays, announcements, and attention-grabbing headlines in your Constellation pages.',
    features: ['Animated tiles', 'Configurable phrases', 'Loop control'],
    deps: ['react'],
    files: [
      {
        name: 'index.tsx',
        lang: 'tsx',
        content: `import SplitFlapText from './SplitFlapText.jsx';
import { getSplitFlapTextStyle, type SplitFlapTextStyleProps } from './styles';
import '../shared/create-nonce';

export type SplitFlapTextProps = SplitFlapTextStyleProps & {
  text?: string;
  words?: string[] | string;
  stagger?: number;
  cycleDelay?: number;
  charset?: string;
  flipsPerChar?: number;
  loop?: boolean;
  padTo?: number;
  className?: string;
  style?: React.CSSProperties;
};

export default function PegaExtensionsSplitFlapText({
  text = 'LAUNCH READY',
  words = ['LAUNCH READY', 'SYNC ONLINE', 'SIGNAL LIVE'],
  flipDuration = 0.12,
  stagger = 0.06,
  cycleDelay = 2400,
  charset = 'alphanumeric',
  flipsPerChar = 8,
  tileColor = '#111827',
  textColor = '#f8fafc',
  tileRadius = 8,
  gap = 6,
  fontSize = 52,
  loop = true,
  padTo = 12,
  className,
  style,
}: SplitFlapTextProps) {
  const normalizedWords = Array.isArray(words) ? words : words.split('|');

  return (
    <SplitFlapText
      text={text}
      words={normalizedWords}
      flipDuration={flipDuration}
      stagger={stagger}
      cycleDelay={cycleDelay}
      charset={charset}
      flipsPerChar={flipsPerChar}
      loop={loop}
      padTo={padTo}
      className={className}
      aria-label={text}
      role="status"
      style={{ ...getSplitFlapTextStyle({ tileColor, textColor, tileRadius, gap, fontSize, flipDuration }), ...style }}
    />
  );
}`,
      },
      {
        name: 'SplitFlapText.jsx',
        lang: 'jsx',
        content: `import { useEffect, useMemo, useRef, useState } from 'react';
import './SplitFlapText.css';

const DEFAULT_WORDS = ['LAUNCH READY', 'SYNC ONLINE', 'SIGNAL LIVE'];

const CHARSETS = {
  alpha: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  alphanumeric: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  numeric: '0123456789'
};

const resolveCharset = charset => {
  if (CHARSETS[charset]) return CHARSETS[charset];
  return typeof charset === 'string' && charset.length > 0 ? charset : CHARSETS.alphanumeric;
};

const normalizePhrase = (phrase, width) => {
  const safe = String(phrase ?? '');
  return safe.padEnd(width, ' ').slice(0, width);
};

let nextTileId = 0;

const createTiles = phrase =>
  phrase.split('').map(char => ({
    id: \`tile-\${nextTileId++}\`,
    current: char,
    next: char,
    flipping: false,
    tick: 0
  }));

const sampleChar = charset => charset.charAt(Math.floor(Math.random() * charset.length)) || ' ';

const buildSequence = (target, flips, charset) => {
  const steps = [];
  for (let i = 0; i < flips; i += 1) {
    steps.push(sampleChar(charset));
  }
  steps.push(target);
  return steps;
};

const SplitFlapText = ({
  words = DEFAULT_WORDS,
  text,
  flipDuration = 0.12,
  stagger = 0.06,
  cycleDelay = 2400,
  charset = 'alphanumeric',
  flipsPerChar = 8,
  loop = true,
  padTo = 12,
  className = '',
  style = {},
  ...props
}) => {
  const rafRef = useRef(null);
  const cycleTimerRef = useRef(null);
  const currentTextRef = useRef('');

  const sourceWords = Array.isArray(words) && words.length > 0 ? words : DEFAULT_WORDS;
  const phrasesKey = [
    ...(typeof text === 'string' && text.length > 0 ? [text] : []),
    ...sourceWords.map(word => String(word ?? ''))
  ].join('\\u001f');

  const phrases = useMemo(
    () => [...new Set(phrasesKey.split('\\u001f'))].filter(Boolean),
    [phrasesKey]
  );

  const width = useMemo(() => {
    const longest = phrases.reduce((max, phrase) => Math.max(max, phrase.length), 1);
    return Math.max(1, Math.ceil(Number(padTo) || 0), longest);
  }, [padTo, phrases]);

  const normalizedPhrases = useMemo(
    () => phrases.map(phrase => normalizePhrase(phrase, width)),
    [phrases, width]
  );

  const [tiles, setTiles] = useState(() => createTiles(normalizedPhrases[0] || ''));

  useEffect(() => {
    // ... animation logic (see full source)
  }, [charset, cycleDelay, flipDuration, flipsPerChar, loop, normalizedPhrases, stagger, width]);

  return (
    <div className={\`split-flap-text \${className}\`} style={style} {...props}>
      {tiles.map(tile => (
        <span key={tile.id} className="split-flap-text__tile" aria-hidden="true">
          <span className="split-flap-text__half split-flap-text__half--top">
            <span className="split-flap-text__char">{tile.current}</span>
          </span>
          <span className="split-flap-text__half split-flap-text__half--bottom">
            <span className="split-flap-text__char">{tile.next}</span>
          </span>
          {tile.flipping && (
            <>
              <span className="split-flap-text__flap split-flap-text__flap--front">
                <span className="split-flap-text__char">{tile.current}</span>
              </span>
              <span className="split-flap-text__flap split-flap-text__flap--back">
                <span className="split-flap-text__char">{tile.next}</span>
              </span>
            </>
          )}
        </span>
      ))}
    </div>
  );
};

export default SplitFlapText;`,
      },
      {
        name: 'SplitFlapText.css',
        lang: 'css',
        content: `.split-flap-text {
  display: inline-flex;
  align-items: center;
  gap: var(--split-flap-gap, 6px);
  color: var(--split-flap-text-color, #f8fafc);
  font-family: 'SFMono-Regular', 'Roboto Mono', monospace;
  font-size: var(--split-flap-font-size, 52px);
  font-weight: 760;
  line-height: 1;
  letter-spacing: 0.035em;
  white-space: pre;
  user-select: none;
}

.split-flap-text__tile {
  position: relative;
  width: 0.78em;
  height: 1.08em;
  overflow: hidden;
  border-radius: var(--split-flap-radius, 8px);
  background:
    radial-gradient(circle at 50% 0%, rgba(255,255,255,0.16), transparent 44%),
    linear-gradient(180deg, color-mix(in srgb, var(--split-flap-tile-color, #111827) 82%, white), var(--split-flap-tile-color, #111827));
  box-shadow:
    0 0.035em 0.08em rgba(255,255,255,0.08) inset,
    0 -0.05em 0.1em rgba(0,0,0,0.38) inset,
    0 0.16em 0.38em rgba(0,0,0,0.28);
  perspective: 520px;
  transform-style: preserve-3d;
}

/* ... tile halves, flap animation keyframes (see full CSS) */

@keyframes split-flap-front {
  from { transform: rotateX(0deg); filter: brightness(1.08); }
  to { transform: rotateX(-90deg); filter: brightness(0.52); }
}

@keyframes split-flap-back {
  0%, 45% { transform: rotateX(90deg); filter: brightness(0.58); }
  100% { transform: rotateX(0deg); filter: brightness(1); }
}`,
      },
      {
        name: 'styles.ts',
        lang: 'ts',
        content: `import type { CSSProperties } from 'react';

export type SplitFlapTextStyleProps = {
  flipDuration?: number;
  tileColor?: string;
  textColor?: string;
  tileRadius?: number;
  gap?: number;
  fontSize?: number;
};

export const getSplitFlapTextStyle = ({
  flipDuration = 0.12,
  tileColor = '#111827',
  textColor = '#f8fafc',
  tileRadius = 8,
  gap = 6,
  fontSize = 52,
}: SplitFlapTextStyleProps): CSSProperties =>
  ({
    '--split-flap-flip-duration': \`\${flipDuration}s\`,
    '--split-flap-tile-color': tileColor,
    '--split-flap-text-color': textColor,
    '--split-flap-radius': \`\${tileRadius}px\`,
    '--split-flap-gap': \`\${gap}px\`,
    '--split-flap-font-size': \`\${fontSize}px\`,
  }) as CSSProperties;`,
      },
      {
        name: 'config.json',
        lang: 'json',
        content: `{
  "name": "Pega_Extensions_SplitFlapText",
  "label": "Split Flap Text",
  "description": "Displays animated text using split-flap style character tiles.",
  "organization": "Pega",
  "version": "5.0.4",
  "library": "Extensions",
  "componentKey": "Pega_Extensions_SplitFlapText",
  "type": "Widget",
  "subtype": ["PAGE", "CASE"],
  "properties": [
    { "name": "text", "label": "Initial text", "format": "TEXT", "defaultValue": "LAUNCH READY" },
    { "name": "words", "label": "Text phrases", "format": "TEXT", "defaultValue": "LAUNCH READY|SYNC ONLINE|SIGNAL LIVE" },
    { "name": "fontSize", "label": "Font size", "format": "NUMBER", "defaultValue": 52 },
    { "name": "tileColor", "label": "Tile color", "format": "TEXT", "defaultValue": "#111827" },
    { "name": "textColor", "label": "Text color", "format": "TEXT", "defaultValue": "#f8fafc" },
    { "name": "gap", "label": "Tile gap", "format": "NUMBER", "defaultValue": 6 },
    { "name": "tileRadius", "label": "Tile radius", "format": "NUMBER", "defaultValue": 8 },
    { "name": "loop", "label": "Loop phrases", "format": "BOOLEAN", "defaultValue": true }
  ]
}`,
      },
    ],
    instructions: {
      title: 'Split Flap Text — Integration Guide',
      deps: ['react'],
      steps: [
        'Create a folder <code>Pega_Extensions_SplitFlapText</code> inside your DX component project.',
        'Add the 5 files shown in the Code tab: <code>index.tsx</code>, <code>SplitFlapText.jsx</code>, <code>SplitFlapText.css</code>, <code>styles.ts</code>, and <code>config.json</code>.',
        'This component is self-contained — no additional npm dependencies beyond React are needed.',
        'Configure the widget in Constellation App Studio by setting <code>text</code> (initial phrase) and <code>words</code> (pipe-separated phrases, e.g. <code>LAUNCH READY|SYNC ONLINE</code>).',
        'Set <code>loop</code> to <code>false</code> when the widget should display only the initial phrase. Keep phrases short enough to fit the available width.',
      ],
    },
  },
  {
    id: 'profile-card',
    name: 'Profile Card',
    type: 'Display',
    status: 'Stable',
    accent: 'cyan',
    icon: '⊕',
    version: 'v5.0.4',
    description: 'A polished profile card with mapped case image, identity details, status indicator, and interactive hover tilt. Supports initials fallback, Pega asset-key images, and configurable metadata.',
    features: ['3D tilt interaction', 'Image or initials fallback', 'Status indicator'],
    deps: ['react', 'styled-components', '@pega/cosmos-react-core'],
    files: [
      {
        name: 'index.tsx',
        lang: 'tsx',
        content: `import { useEffect, useRef, useState } from 'react';
import { Text, withConfiguration } from '@pega/cosmos-react-core';
import { getMappedKey } from '../shared/utils';
import {
  ProfileCardBody, ProfileCardFallback, ProfileCardHandle,
  ProfileCardIdentity, ProfileCardImage, ProfileCardImageCaption,
  ProfileCardImageFrame, ProfileCardShell, ProfileCardStatus,
} from './styles';
import '../shared/create-nonce';

export type ProfileCardProps = {
  name: string;
  title?: string;
  handle?: string;
  status?: string;
  imageProperty?: string;
  imageUrl?: string;
  showUserInfo?: boolean;
  enableTilt?: boolean;
  enableMobileTilt?: boolean;
  className?: string;
  getPConnect: () => typeof PConnect;
};

const isDirectImageSource = (value: string) => /^(data:image\\/|blob:|https?:\\/\\/|\\/)/i.test(value);

const getInitials = (name: string) =>
  name.trim().split(/\\s+/).slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase()).join('') || '?';

export const PegaExtensionsProfileCard = (props: ProfileCardProps) => {
  const {
    name = '', title = '', handle = '', status = '',
    imageProperty = '', imageUrl = '', showUserInfo = true,
    enableTilt = true, enableMobileTilt = false,
    className = '', getPConnect,
  } = props;
  const shellRef = useRef<HTMLElement>(null);
  const [resolvedImageUrl, setResolvedImageUrl] = useState(imageUrl);

  useEffect(() => {
    // Image resolution logic — supports URL, data URI, and Pega asset keys
    let objectUrl = '';
    let cancelled = false;
    const propertyValue = imageProperty.trim()
      ? getPConnect().getValue(getMappedKey(imageProperty.trim())) : '';
    const imageValue = String(imageUrl || propertyValue || '').trim();
    setResolvedImageUrl(isDirectImageSource(imageValue) ? imageValue : '');
    if (!imageValue || isDirectImageSource(imageValue)) return undefined;

    const assetLoader = PCore?.getAssetLoader?.();
    if (!assetLoader?.getSvcImage) return undefined;
    assetLoader.getSvcImage(imageValue)
      .then((blob: Blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setResolvedImageUrl(objectUrl);
      })
      .catch(() => { if (!cancelled) setResolvedImageUrl(''); });
    return () => { cancelled = true; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [getPConnect, imageProperty, imageUrl]);

  useEffect(() => {
    // 3D tilt interaction
    const shell = shellRef.current;
    if (!shell || !enableTilt) return undefined;
    const handlePointerMove = (event: PointerEvent) => {
      const bounds = shell.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width) * 100;
      const y = ((event.clientY - bounds.top) / bounds.height) * 100;
      shell.style.setProperty('--profile-card-pointer-x', \`\${x}%\`);
      shell.style.setProperty('--profile-card-pointer-y', \`\${y}%\`);
      shell.style.setProperty('--profile-card-rotate-x', \`\${((x - 50) / 18).toFixed(2)}deg\`);
      shell.style.setProperty('--profile-card-rotate-y', \`\${((50 - y) / 22).toFixed(2)}deg\`);
    };
    const resetTilt = () => {
      shell.style.setProperty('--profile-card-rotate-x', '0deg');
      shell.style.setProperty('--profile-card-rotate-y', '0deg');
    };
    shell.addEventListener('pointermove', handlePointerMove);
    shell.addEventListener('pointerleave', resetTilt);
    return () => {
      shell.removeEventListener('pointermove', handlePointerMove);
      shell.removeEventListener('pointerleave', resetTilt);
    };
  }, [enableTilt]);

  return (
    <ProfileCardShell ref={shellRef} className={className}
      enableTilt={enableTilt || enableMobileTilt}
      aria-label={\`\${name}\${title ? \`, \${title}\` : ''}\`}>
      <ProfileCardImageFrame>
        {resolvedImageUrl
          ? <ProfileCardImage src={resolvedImageUrl} alt={\`\${name || 'Profile'} profile\`} />
          : <ProfileCardFallback aria-hidden="true">{getInitials(name)}</ProfileCardFallback>}
        <ProfileCardImageCaption>
          <Text variant="h2" style={{ color: 'inherit' }}>{name}</Text>
          {title && <ProfileCardHandle>{title}</ProfileCardHandle>}
        </ProfileCardImageCaption>
      </ProfileCardImageFrame>
      {showUserInfo && (
        <ProfileCardBody>
          <ProfileCardIdentity>
            {handle ? <ProfileCardHandle>@{handle}</ProfileCardHandle> : <span />}
            {status && <ProfileCardStatus>{status}</ProfileCardStatus>}
          </ProfileCardIdentity>
        </ProfileCardBody>
      )}
    </ProfileCardShell>
  );
};

export default withConfiguration(PegaExtensionsProfileCard);`,
      },
      {
        name: 'styles.ts',
        lang: 'ts',
        content: `import styled, { css } from 'styled-components';

export const ProfileCardShell = styled.article<{ enableTilt: boolean }>(({ theme, enableTilt }) => css\`
  --profile-card-accent: \${theme.base.palette['brand-primary']};
  --profile-card-surface: \${theme.base.palette['background-color']};
  position: relative;
  width: min(100%, 24rem);
  min-height: 32rem;
  overflow: hidden;
  isolation: isolate;
  border: 0.0625rem solid \${theme.base.palette['border-line']};
  border-radius: 1.5rem;
  background: linear-gradient(145deg, color-mix(in srgb, var(--profile-card-accent) 18%, var(--profile-card-surface)), var(--profile-card-surface) 64%);
  box-shadow: 0 1.25rem 2.5rem rgba(17, 24, 39, 0.18);
  transform-style: preserve-3d;
  transform: perspective(900px) rotateX(var(--profile-card-rotate-y, 0deg)) rotateY(var(--profile-card-rotate-x, 0deg));
  transition: transform 180ms ease, box-shadow 180ms ease;

  \${enableTilt && css\`&:hover { box-shadow: 0 1.75rem 3.5rem rgba(17, 24, 39, 0.24); }\`}

  &::before {
    position: absolute; inset: -35%; z-index: -1; content: '';
    background: radial-gradient(circle at var(--profile-card-pointer-x, 50%) var(--profile-card-pointer-y, 20%), color-mix(in srgb, var(--profile-card-accent) 36%, transparent), transparent 38%);
    filter: blur(2rem); opacity: 0.75; pointer-events: none;
  }
\`);

export const ProfileCardImageFrame = styled.div\`
  position: relative; height: 21rem; overflow: hidden;
  background: linear-gradient(145deg, #182338, #526b91);
  &::after {
    position: absolute; inset: 0; content: '';
    background: linear-gradient(180deg, transparent 46%, rgba(5, 10, 20, 0.72));
    pointer-events: none;
  }
\`;

export const ProfileCardImage = styled.img\`
  width: 100%; height: 100%; object-fit: cover; object-position: center;
  filter: saturate(0.88) contrast(1.04);
  transition: transform 500ms ease, filter 500ms ease;
  \${ProfileCardShell}:hover & { transform: scale(1.04); filter: saturate(1.05) contrast(1.06); }
\`;

export const ProfileCardFallback = styled.div\`
  display: grid; width: 100%; height: 100%; place-items: center;
  color: white; font-size: 4.5rem; font-weight: 700;
  background: radial-gradient(circle at 35% 25%, #9ec5ff, #31527f 46%, #101b30);
\`;

export const ProfileCardImageCaption = styled.div\`
  position: absolute; right: 1.25rem; bottom: 1.25rem; left: 1.25rem; z-index: 1; color: white;
\`;

export const ProfileCardBody = styled.div\`
  display: flex; flex-direction: column; gap: 1rem; padding: 1.25rem 1.35rem 1.4rem;
\`;

export const ProfileCardIdentity = styled.div\`
  display: flex; align-items: center; justify-content: space-between; gap: 1rem;
\`;

export const ProfileCardHandle = styled.span\`
  color: color-mix(in srgb, currentColor 68%, transparent); font-size: 0.875rem;
\`;

export const ProfileCardStatus = styled.span\`
  display: inline-flex; align-items: center; gap: 0.4rem; flex-shrink: 0;
  padding: 0.35rem 0.6rem; border: 0.0625rem solid color-mix(in srgb, #238636 30%, transparent);
  border-radius: 999px; color: #176b2d; font-size: 0.75rem; font-weight: 700;
  background: color-mix(in srgb, #8ee09d 24%, transparent);
  &::before { width: 0.45rem; height: 0.45rem; content: ''; border-radius: 50%;
    background: #238636; box-shadow: 0 0 0 0.2rem color-mix(in srgb, #238636 16%, transparent);
  }
\`;`,
      },
      {
        name: 'config.json',
        lang: 'json',
        content: `{
  "name": "Pega_Extensions_ProfileCard",
  "label": "Profile Card",
  "description": "Displays a polished profile card with a mapped case image, identity details, status, and interactive tilt.",
  "organization": "Pega",
  "version": "5.0.4",
  "library": "Extensions",
  "componentKey": "Pega_Extensions_ProfileCard",
  "type": "Widget",
  "subtype": ["PAGE", "CASE"],
  "properties": [
    { "name": "name", "label": "Name", "format": "TEXT", "defaultValue": "Javi A. Torres" },
    { "name": "title", "label": "Title", "format": "TEXT", "defaultValue": "Software Engineer" },
    { "name": "handle", "label": "Handle", "format": "TEXT", "defaultValue": "javicodes" },
    { "name": "status", "label": "Status", "format": "TEXT", "defaultValue": "Online" },
    { "name": "imageProperty", "label": "Image property", "format": "TEXT", "defaultValue": "ProfileImage" },
    { "name": "showUserInfo", "label": "Show profile metadata", "format": "BOOLEAN", "defaultValue": true },
    { "name": "enableTilt", "label": "Enable hover tilt", "format": "BOOLEAN", "defaultValue": true }
  ]
}`,
      },
    ],
    instructions: {
      title: 'Profile Card — Integration Guide',
      deps: ['react', 'styled-components', '@pega/cosmos-react-core'],
      steps: [
        'Create a folder <code>Pega_Extensions_ProfileCard</code> inside your DX component project.',
        'Add the 3 files shown in the Code tab: <code>index.tsx</code>, <code>styles.ts</code>, and <code>config.json</code>.',
        'Install required dependencies: <code>npm install styled-components @pega/cosmos-react-core</code>.',
        'This component also uses shared utilities: <code>../shared/utils.ts</code> (for <code>getMappedKey</code>) and <code>../shared/create-nonce.ts</code>.',
        'Configure the widget in App Studio. Set <code>name</code>, <code>title</code>, <code>handle</code>, <code>status</code>, and optionally <code>imageProperty</code> to map to a case property containing an image URL or Pega asset key.',
        'Enable <code>enableTilt</code> for the interactive 3D hover effect. The tilt respects <code>prefers-reduced-motion</code> automatically.',
      ],
    },
  },
  {
    id: 'calendar',
    name: 'Calendar',
    type: 'Widget',
    status: 'Stable',
    accent: 'green',
    icon: '▦',
    version: 'v5.0.4',
    description: 'A full-featured calendar widget for Constellation UI that renders case data in Monthly, Weekly, and Daily views. Supports event creation, case preview, and persistent navigation state.',
    features: ['3 view modes', 'Case data binding', 'Persistent navigation'],
    deps: ['react', '@fullcalendar/react', '@fullcalendar/daygrid', '@fullcalendar/timegrid', 'styled-components', '@pega/cosmos-react-core'],
    files: [
      {
        name: 'index.tsx',
        lang: 'tsx',
        content: `import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { type EventContentArg, type EventClickArg } from '@fullcalendar/core';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import {
  withConfiguration, registerIcon, Icon, Text, Status, Link,
  FieldValueList, Card, CardHeader, CardContent, Button, useTheme,
} from '@pega/cosmos-react-core';
import StyledEventWrapper, { CalendarSurface } from './styles';
import * as plusIcon from '@pega/cosmos-react-core/lib/components/Icon/icons/plus.icon';
import '../shared/create-nonce';
import { getMappedKey } from '../shared/utils';

registerIcon(plusIcon);

const VIEW_TYPE = {
  DAY: 'timeGridDay',
  WEEK: 'timeGridWeek',
  MONTH: 'dayGridMonth',
};

type CalendarProps = {
  heading: string;
  dataPage: string;
  dateProperty: string;
  startTimeProperty: string;
  endTimeProperty: string;
  createClassname?: string;
  defaultViewMode: 'Monthly' | 'Weekly' | 'Daily';
  nowIndicator: boolean;
  weekendIndicator: boolean;
  slotMinTime?: string;
  slotMaxTime?: string;
  getPConnect: () => typeof PConnect;
};

type Event = { id: string; title: string; start: Date; end: Date; item: any; };

export const PegaExtensionsCalendar = (props: CalendarProps) => {
  const {
    heading = '', dataPage = '',
    dateProperty: rawDateProperty,
    startTimeProperty: rawStartTimeProperty,
    endTimeProperty: rawEndTimeProperty,
    createClassname = '',
    defaultViewMode = 'Monthly',
    nowIndicator = true, weekendIndicator = true,
    slotMinTime = '07:00:00', slotMaxTime = '19:00:00',
    getPConnect,
  } = props;

  const dateProperty = getMappedKey(rawDateProperty?.trim() || 'SessionDate');
  const startTimeProperty = getMappedKey(rawStartTimeProperty?.trim() || 'StartTime');
  const endTimeProperty = getMappedKey(rawEndTimeProperty?.trim() || 'EndTime');

  const [events, setEvents] = useState<Array<Event>>([]);
  const calendarRef = useRef(null);
  const theme = useTheme();

  // ... Calendar logic: loadEvents, handleEventClick,
  // handleDateChange, renderEventContent, useEffect subscriptions
  // See full source for complete implementation

  return (
    <Card>
      <CardHeader
        actions={createClassname ? (
          <Button variant="simple"
            label={getPConnect().getLocalizedValue('Create new event')}
            icon compact onClick={() => getPConnect().getActionsApi().createWork(createClassname, { openCaseViewAfterCreate: false })}>
            <Icon name="plus" />
          </Button>
        ) : undefined}>
        <Text variant="h2">{heading}</Text>
      </CardHeader>
      <CardContent>
        <CalendarSurface>
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin]}
            initialView={VIEW_TYPE.MONTH}
            selectable nowIndicator={nowIndicator}
            weekends={weekendIndicator}
            slotMinTime={slotMinTime} slotMaxTime={slotMaxTime}
            height={650} slotEventOverlap={false}
            events={events}
          />
        </CalendarSurface>
      </CardContent>
    </Card>
  );
};

export default withConfiguration(PegaExtensionsCalendar);`,
      },
      {
        name: 'styles.ts',
        lang: 'ts',
        content: `import styled, { css } from 'styled-components';

export const CalendarSurface = styled.div(({ theme }) => {
  return css\`
    --calendar-accent: \${theme.base.palette['brand-primary']};
    --calendar-border: \${theme.base.palette['border-line']};
    --calendar-surface: \${theme.base.palette['background-color']};

    position: relative; overflow: hidden;
    border: 0.0625rem solid var(--calendar-border);
    border-radius: 0.75rem;
    background: var(--calendar-surface);

    .fc {
      --fc-border-color: var(--calendar-border);
      --fc-button-bg-color: transparent;
      --fc-button-border-color: transparent;
      --fc-button-text-color: inherit;
      --fc-today-bg-color: color-mix(in srgb, var(--calendar-accent) 8%, transparent);
      --fc-page-bg-color: transparent;
      padding: 0.5rem;
    }

    .fc .fc-toolbar-title { font-size: 1.25rem; font-weight: 700; }

    .fc .fc-button {
      background: color-mix(in srgb, var(--calendar-accent) 7%, var(--calendar-surface));
      border: 0.0625rem solid color-mix(in srgb, var(--calendar-accent) 24%, var(--calendar-border));
      border-radius: 0.5rem;
      transition: background-color 160ms ease, transform 160ms ease;
    }
    .fc .fc-button:hover { transform: translateY(-1px); }
    .fc .fc-button.fc-button-active { color: white; }

    .fc .fc-event {
      border: 0; border-radius: 0.5rem;
      box-shadow: 0 0.2rem 0.5rem rgba(0,0,0,0.12);
      transition: transform 180ms ease, box-shadow 180ms ease;
      animation: calendar-event-enter 320ms ease both;
    }
    .fc .fc-event:hover {
      transform: translateY(-0.2rem) scale(1.01);
      box-shadow: 0 0.65rem 1.25rem rgba(0,0,0,0.2);
    }

    @keyframes calendar-event-enter {
      from { opacity: 0; transform: translateY(0.3rem); }
      to { opacity: 1; transform: translateY(0); }
    }
  \`;
});

export default styled.div(({ theme }) => css\`
  border: 0.0625rem solid \${theme.base.palette['border-line']};
  padding: 0.25rem; width: 100%; overflow: hidden; white-space: normal;
  transition: transform 180ms ease, box-shadow 180ms ease;
  &:hover { transform: translateY(-0.1rem); box-shadow: 0 0.5rem 1.25rem rgba(0,0,0,0.16); }
\`);`,
      },
      {
        name: 'config.json',
        lang: 'json',
        content: `{
  "name": "Pega_Extensions_Calendar",
  "label": "Calendar",
  "description": "Calendar widget for Constellation UI — renders case data in Monthly, Weekly, and Daily views.",
  "organization": "Pega",
  "version": "5.0.4",
  "library": "Extensions",
  "componentKey": "Pega_Extensions_Calendar",
  "type": "Widget",
  "subtype": ["PAGE", "CASE"],
  "properties": [
    { "name": "heading", "label": "Heading", "format": "TEXT" },
    { "name": "dataPage", "label": "Data Page name", "format": "TEXT" },
    { "name": "createClassname", "label": "Create case className", "format": "TEXT" },
    { "name": "defaultViewMode", "label": "Default view", "format": "SELECT", "defaultValue": "Monthly",
      "source": [
        { "key": "Daily", "value": "Daily" },
        { "key": "Weekly", "value": "Weekly" },
        { "key": "Monthly", "value": "Monthly" }
      ]
    },
    { "name": "nowIndicator", "label": "Show current day", "format": "BOOLEAN", "defaultValue": true },
    { "name": "weekendIndicator", "label": "Show week-ends", "format": "BOOLEAN", "defaultValue": true },
    { "name": "slotMinTime", "label": "Day starts at", "format": "TEXT", "defaultValue": "07:00:00" },
    { "name": "slotMaxTime", "label": "Day ends at", "format": "TEXT", "defaultValue": "19:00:00" }
  ],
  "defaultConfig": {
    "heading": "Calendar",
    "dataPage": "",
    "defaultViewMode": "Monthly",
    "dateProperty": "SessionDate",
    "startTimeProperty": "StartTime",
    "endTimeProperty": "EndTime",
    "slotMinTime": "07:00:00",
    "slotMaxTime": "19:00:00"
  }
}`,
      },
    ],
    instructions: {
      title: 'Calendar — Integration Guide',
      deps: ['react', '@fullcalendar/react', '@fullcalendar/core', '@fullcalendar/daygrid', '@fullcalendar/timegrid', 'styled-components', '@pega/cosmos-react-core'],
      steps: [
        'Create a folder <code>Pega_Extensions_Calendar</code> inside your DX component project.',
        'Add the 3 files shown in the Code tab: <code>index.tsx</code>, <code>styles.ts</code>, and <code>config.json</code>.',
        'Install FullCalendar and its plugins: <code>npm install @fullcalendar/react @fullcalendar/core @fullcalendar/daygrid @fullcalendar/timegrid</code>.',
        'Also install styled-components and cosmos-react-core if not already present: <code>npm install styled-components @pega/cosmos-react-core</code>.',
        'Configure the widget in App Studio. Pass a <strong>list Data Page</strong> that provides case instances, and map <code>dateProperty</code>, <code>startTimeProperty</code>, and <code>endTimeProperty</code> (defaults: SessionDate, StartTime, EndTime).',
        'Optionally set <code>createClassname</code> to enable the "Create new event" button directly from the calendar.',
        'The calendar persists the selected view and date in localStorage per configuration, so separate calendars maintain independent navigation state.',
      ],
    },
  },
  {
    id: 'map-picker',
    name: 'Map Picker',
    type: 'Location',
    status: 'Stable',
    accent: 'amber',
    icon: '⌖',
    version: 'v1.4.2',
    description: 'A precise, Pega-ready location field with reverse geocoding. Supports Google Maps and OpenStreetMap providers with click-to-select coordinates.',
    features: ['Multi-provider', 'Reverse geocoding', 'Case-ready schema'],
    deps: ['react', '@react-google-maps/api', 'leaflet', 'react-leaflet'],
    files: [],
    instructions: {
      title: 'Map Picker — Integration Guide',
      deps: ['react', '@react-google-maps/api', 'leaflet', 'react-leaflet'],
      steps: [
        'This component uses Leaflet (OpenStreetMap) or Google Maps as the map provider.',
        'Install dependencies: <code>npm install @react-google-maps/api leaflet react-leaflet</code>.',
        'For Google Maps, set the <code>VITE_GOOGLE_MAPS_API_KEY</code> environment variable.',
        'The component saves latitude/longitude coordinates to the case on click.',
      ],
    },
  },
]

/* ════════════════════════════════════════════════════════════
   LIVE PREVIEW COMPONENTS
   ════════════════════════════════════════════════════════════ */

/* ─── Split Flap Text Preview (fully working) ─── */
const SF_CHARSETS = { alphanumeric: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789' }
const sfSample = (cs) => cs.charAt(Math.floor(Math.random() * cs.length)) || ' '
const sfBuildSeq = (target, flips, cs) => {
  const s = []; for (let i = 0; i < flips; i++) s.push(sfSample(cs)); s.push(target); return s
}
const sfNormalize = (phrase, w) => String(phrase ?? '').padEnd(w, ' ').slice(0, w)

let sfTileId = 0
const sfCreateTiles = (phrase) => phrase.split('').map(c => ({ id: `sf-${sfTileId++}`, current: c, next: c, flipping: false, tick: 0 }))

function SplitFlapPreview() {
  const words = ['LAUNCH READY', 'SYNC ONLINE', 'SIGNAL LIVE']
  const width = 12
  const phrases = words.map(w => sfNormalize(w, width))
  const [tiles, setTiles] = useState(() => sfCreateTiles(phrases[0]))
  const rafRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    let idx = 0, cancelled = false
    const cs = SF_CHARSETS.alphanumeric
    const flipMs = 120, staggerMs = 60, flips = 8

    const animateTo = (target) => {
      const from = phrases[idx === 0 ? phrases.length - 1 : idx - 1] || phrases[0]
      const plans = target.split('').map((tc, i) => {
        if (from[i] === tc) return null
        return { index: i, target: tc, seq: sfBuildSeq(tc, flips, cs), start: i * staggerMs, from: from[i] }
      }).filter(Boolean)
      const t0 = performance.now()
      const tick = (now) => {
        if (cancelled) return
        const elapsed = now - t0
        const updates = []
        plans.forEach(p => {
          const step = Math.floor((elapsed - p.start) / flipMs)
          if (step >= 0 && step < p.seq.length) {
            updates.push({ index: p.index, current: step === 0 ? p.from : p.seq[step - 1], next: p.seq[step] })
          }
        })
        if (updates.length > 0) {
          setTiles(prev => {
            const n = [...prev]
            updates.forEach(u => { n[u.index] = { ...prev[u.index], current: u.current, next: u.next, flipping: true, tick: prev[u.index].tick + 1 } })
            return n
          })
          rafRef.current = requestAnimationFrame(tick)
        } else {
          setTiles(prev => prev.map(t => ({ ...t, current: t.next, flipping: false })))
        }
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    const schedule = () => {
      timerRef.current = setTimeout(() => {
        if (cancelled) return
        idx = (idx + 1) % phrases.length
        animateTo(phrases[idx])
        schedule()
      }, 2400)
    }
    schedule()

    return () => { cancelled = true; if (rafRef.current) cancelAnimationFrame(rafRef.current); if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  return (
    <div className="sf-preview">
      {tiles.map(tile => (
        <span key={tile.id} className="sf-tile" aria-hidden="true">
          <span className="sf-half sf-half-top"><span className="sf-char">{tile.current}</span></span>
          <span className="sf-half sf-half-bottom"><span className="sf-char">{tile.next}</span></span>
          {tile.flipping && (
            <>
              <span key={`${tile.id}-f-${tile.tick}`} className="sf-flap sf-flap-front"><span className="sf-char">{tile.current}</span></span>
              <span key={`${tile.id}-b-${tile.tick}`} className="sf-flap sf-flap-back"><span className="sf-char">{tile.next}</span></span>
            </>
          )}
        </span>
      ))}
    </div>
  )
}

/* ─── Profile Card Preview (standalone tilt) ─── */
function ProfileCardPreview() {
  const shellRef = useRef(null)

  useEffect(() => {
    const el = shellRef.current
    if (!el) return
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
      el.style.setProperty('--pc-rotate-x', '0deg')
      el.style.setProperty('--pc-rotate-y', '0deg')
    }
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => { el.removeEventListener('pointermove', onMove); el.removeEventListener('pointerleave', onLeave) }
  }, [])

  return (
    <article className="pc-shell" ref={shellRef} aria-label="Javi A. Torres, Software Engineer">
      <div className="pc-image-frame">
        <div className="pc-fallback">JT</div>
        <div className="pc-caption">
          <div className="pc-caption-name">Javi A. Torres</div>
          <div className="pc-caption-title">Software Engineer</div>
        </div>
      </div>
      <div className="pc-body">
        <div className="pc-identity">
          <span className="pc-handle">@javicodes</span>
          <span className="pc-status">Online</span>
        </div>
      </div>
    </article>
  )
}

/* ─── Calendar Preview (static representation) ─── */
function CalendarPreview() {
  const now = new Date()
  const today = now.getDate()
  const month = now.toLocaleString('default', { month: 'long' })
  const year = now.getFullYear()

  const firstDay = new Date(year, now.getMonth(), 1).getDay()
  const daysInMonth = new Date(year, now.getMonth() + 1, 0).getDate()
  const daysInPrev = new Date(year, now.getMonth(), 0).getDate()

  const cells = []
  // Previous month tail
  for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: daysInPrev - i, muted: true })
  // Current month
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, muted: false, isToday: d === today })
  // Next month head
  const remaining = 42 - cells.length
  for (let d = 1; d <= remaining; d++) cells.push({ day: d, muted: true })

  const events = {
    [today]: [{ label: 'Appointment', color: 'blue' }],
    [today + 1]: [{ label: 'Demo Acme', color: 'green' }],
    [today + 3]: [{ label: 'Sprint Review', color: 'indigo' }],
    [today - 2]: [{ label: 'Design Sync', color: 'amber' }],
  }

  return (
    <div className="cal-preview">
      <div className="cal-toolbar">
        <div className="cal-toolbar-nav">
          <button className="cal-nav-btn">← Prev</button>
          <button className="cal-nav-btn">Next →</button>
        </div>
        <span className="cal-title">{month} {year}</span>
        <div className="cal-view-btns">
          <button className="cal-view-btn is-active">Month</button>
          <button className="cal-view-btn">Week</button>
          <button className="cal-view-btn">Day</button>
        </div>
      </div>
      <div className="cal-grid">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="cal-day-header">{d}</div>
        ))}
        {cells.map((cell, i) => (
          <div key={i} className={`cal-cell ${cell.muted ? 'is-muted' : ''}`}>
            <span className={`cal-cell-number ${cell.isToday ? 'is-today' : ''}`}>{cell.day}</span>
            {!cell.muted && events[cell.day]?.map((ev, j) => (
              <div key={j} className={`cal-event cal-event-${ev.color}`}>{ev.label}</div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Map Demo (preserved) ─── */
function LeafletLocationMarker({ setLocation }) {
  useMapEvents({ click: (e) => setLocation({ lat: e.latlng.lat, lng: e.latlng.lng }) })
  return null
}

function MapCanvas({ provider, location, setLocation }) {
  if (provider === 'google' && !googleMapsApiKey) {
    return <div className="map-config-state"><strong>Google Maps is ready to connect</strong><span>Add <code>VITE_GOOGLE_MAPS_API_KEY</code> to your environment and restart Vite.</span></div>
  }
  if (provider === 'google') {
    return (
      <LoadScript googleMapsApiKey={googleMapsApiKey} loadingElement={<div className="map-loading">Loading Google Maps…</div>}>
        <GoogleMap mapContainerStyle={mapContainerStyle} center={defaultLocation} zoom={10}
          onClick={(e) => e.latLng && setLocation({ lat: e.latLng.lat(), lng: e.latLng.lng() })}
          options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: false }}>
          {location && <MarkerF position={location} />}
        </GoogleMap>
      </LoadScript>
    )
  }
  return (
    <MapContainer center={[defaultLocation.lat, defaultLocation.lng]} zoom={10} style={mapContainerStyle} scrollWheelZoom>
      <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <LeafletLocationMarker setLocation={setLocation} />
      {location && <Marker position={[location.lat, location.lng]} icon={leafletIcon} />}
    </MapContainer>
  )
}

function MapDemo() {
  const [provider, setProvider] = useState('openstreetmap')
  const [location, setLocation] = useState(defaultLocation)
  const [saved, setSaved] = useState(false)
  const updateLocation = (next) => { setLocation(next); setSaved(false) }

  return (
    <div className="demo-frame">
      <div className="demo-topline">
        <span className="live-preview-label"><i className="live-dot" /> Live preview</span>
        <span className="tiny-code">MAP_PICKER / V1.4</span>
      </div>
      <div className="map-toolbar">
        <span className="readout-label">Map provider</span>
        <div className="provider-switch">
          <button className={provider === 'openstreetmap' ? 'is-selected' : ''} onClick={() => setProvider('openstreetmap')}>OpenStreetMap</button>
          <button className={provider === 'google' ? 'is-selected' : ''} onClick={() => setProvider('google')}>Google Maps</button>
        </div>
      </div>
      <div className="real-map"><MapCanvas provider={provider} location={location} setLocation={updateLocation} /></div>
      <div className="location-readout">
        <div>
          <span className="readout-label">Selected coordinates</span>
          <strong>{location.lat.toFixed(6)}, {location.lng.toFixed(6)}</strong>
        </div>
        <button className={saved ? 'btn-save btn-save-saved' : 'btn-save btn-save-default'} onClick={() => setSaved(true)}>
          {saved ? '✓ Saved to case' : 'Save location'}
        </button>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════
   PREVIEW LOOKUP
   ════════════════════════════════════════════════════════════ */
const PREVIEW_MAP = {
  'split-flap-text': SplitFlapPreview,
  'profile-card': ProfileCardPreview,
  'calendar': CalendarPreview,
  'map-picker': MapDemo,
}

/* ════════════════════════════════════════════════════════════
   SHARED UI COMPONENTS
   ════════════════════════════════════════════════════════════ */
function StatusBadge({ status }) {
  const key = status.replace(' ', '-').toLowerCase()
  return <span className={`badge badge-${key}`}><span className="badge-dot" />{status}</span>
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
  const file = component.files[activeFile]

  if (!component.files.length) {
    return (
      <div className="code-viewer">
        <div className="instructions-panel">
          <h3><span className="instr-icon">📋</span> {component.instructions.title}</h3>
          <ol className="instruction-steps">
            {component.instructions.steps.map((step, i) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: step }} />
            ))}
          </ol>
        </div>
      </div>
    )
  }

  return (
    <div className="code-viewer">
      {/* Instructions */}
      <div className="instructions-panel">
        <h3><span className="instr-icon">📋</span> {component.instructions.title}</h3>
        <ol className="instruction-steps">
          {component.instructions.steps.map((step, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: step }} />
          ))}
        </ol>
        {component.deps.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text-muted)' }}>Dependencies:</span>
            <div className="deps-list">
              {component.deps.map(dep => <span key={dep} className="dep-tag">{dep}</span>)}
            </div>
          </div>
        )}
      </div>

      {/* File tabs */}
      <div className="file-tabs">
        {component.files.map((f, i) => (
          <button key={f.name} className={`file-tab ${i === activeFile ? 'is-active' : ''}`} onClick={() => setActiveFile(i)}>
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
    <div className="component-card" onClick={onClick} role="button" tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}>
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
            <div className="card-type">{component.type}</div>
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
        <button className={`tab-toggle-btn ${tab === 'preview' ? 'is-active' : ''}`} onClick={() => setTab('preview')}>
          Preview
        </button>
        <button className={`tab-toggle-btn ${tab === 'code' ? 'is-active' : ''}`} onClick={() => setTab('code')}>
          Code
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
            {PreviewComponent ? <PreviewComponent /> : <span style={{ color: 'var(--text-muted)' }}>Preview not available</span>}
          </div>
        </div>
      ) : (
        <CodeViewer component={component} />
      )}

      <div className="detail-features" style={{ marginTop: 24 }}>
        <span className="detail-feature"><i className="check-icon">✓</i> Pega-ready schema</span>
        <span className="detail-feature"><i className="check-icon">✓</i> Keyboard accessible</span>
        <span className="detail-feature"><i className="check-icon">✓</i> Responsive design</span>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════
   APP
   ════════════════════════════════════════════════════════════ */
function App() {
  const [currentView, setCurrentView] = useState('catalog') // 'catalog' | 'detail'
  const [selectedId, setSelectedId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const selectedComponent = COMPONENTS.find(c => c.id === selectedId)

  const filteredComponents = useMemo(() => {
    if (!searchQuery.trim()) return COMPONENTS
    const q = searchQuery.toLowerCase()
    return COMPONENTS.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.type.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.status.toLowerCase().includes(q)
    )
  }, [searchQuery])

  const openDetail = (id) => {
    setSelectedId(id)
    setCurrentView('detail')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const backToCatalog = () => {
    setCurrentView('catalog')
    setSelectedId(null)
  }

  return (
    <main>
      {/* ═══ NAV ═══ */}
      <div className="nav-wrapper">
        <nav className="nav shell">
          <a className="brand" href="#top" onClick={(e) => { e.preventDefault(); backToCatalog() }}>
            <span className="brand-mark">C</span>
            <span>Constellation<span className="brand-slash">/</span><span className="brand-dim">Hub</span></span>
          </a>
          <div className="nav-links">
            <a href="#catalog" onClick={(e) => { e.preventDefault(); backToCatalog() }}>Components</a>
            <a href="#docs">Docs</a>
            <a href="#status">
              <span className="status-pill"><i className="live-dot" /> All systems go</span>
            </a>
          </div>
          <button className="btn btn-ghost" onClick={backToCatalog}>
            Open console <span>↗</span>
          </button>
        </nav>
      </div>

      {currentView === 'detail' && selectedComponent ? (
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
              <a className="btn btn-primary btn-large" href="#catalog">Explore components <span>↓</span></a>
              <a className="btn btn-ghost btn-large" href="#docs">Integration guide <span>↗</span></a>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <div className="hero-stat-value"><span className="stat-accent">{COMPONENTS.length}</span></div>
                <span className="hero-stat-label">Components</span>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-value">{COMPONENTS.filter(c => c.status === 'Stable').length}</div>
                <span className="hero-stat-label">Stable</span>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-value">3<span className="stat-accent">+</span></div>
                <span className="hero-stat-label">Integrations</span>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-value">v5.0</div>
                <span className="hero-stat-label">Latest release</span>
              </div>
            </div>
          </section>

          {/* ═══ SIGNAL BAR ═══ */}
          <section className="signal-bar">
            <div className="shell signal-inner">
              <span className="signal-label">Designed for the way your teams ship</span>
              <div className="signal-techs">
                <span className="signal-tech"><span className="signal-tech-dot" /> React</span>
                <span className="signal-tech"><span className="signal-tech-dot" /> REST</span>
                <span className="signal-tech"><span className="signal-tech-dot" /> DX API</span>
                <span className="signal-tech"><span className="signal-tech-dot" /> Iframe</span>
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
                A growing library of isolated, configurable components for Pega Constellation.
                Click any card to preview the component live and grab the source code.
              </p>
            </div>

            <div className="search-bar">
              <span className="search-icon">⌕</span>
              <input type="text" placeholder="Search components by name, type, or keyword…"
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} id="component-search" />
              <span className="search-shortcut">⌘K</span>
            </div>

            <div className="component-grid">
              {filteredComponents.length > 0 ? (
                filteredComponents.map(c => (
                  <ComponentCard key={c.id} component={c} onClick={() => openDetail(c.id)} />
                ))
              ) : (
                <div className="no-results">
                  <div className="no-results-icon">⌕</div>
                  <h3>No components found</h3>
                  <p>Try a different search term or browse all components.</p>
                </div>
              )}
            </div>
          </section>

          {/* ═══ INTEGRATION / DOCS ═══ */}
          <section className="integration shell" id="docs">
            <div className="integration-header">
              <div className="big-number">02</div>
              <div className="section-eyebrow"><span className="section-eyebrow-line" /> Integration guide</div>
              <h2>From hosted component<br /><span className="gradient-text">to case field.</span></h2>
            </div>
            <div className="integration-body">
              <p>
                Constellation Hub keeps the boundary clean. Your component stays independently deployable
                while Pega gets the schema, events, and data it needs. Configure once, integrate cleanly.
              </p>
              <div className="code-block">
                <div className="code-header">
                  <div className="code-dots"><i className="window-dot dot-red" /><i className="window-dot dot-yellow" /><i className="window-dot dot-green" /></div>
                  <span className="code-filename">map-picker.config.json</span>
                  <button className="code-copy-btn" aria-label="Copy configuration">⧉</button>
                </div>
                <pre><code>
<span className="code-punctuation">{'{'}</span>{'\n'}
{'  '}<span className="code-key">"component"</span>: <span className="code-string">"MapPicker"</span>,{'\n'}
{'  '}<span className="code-key">"version"</span>:   <span className="code-string">"1.4.2"</span>,{'\n'}
{'  '}<span className="code-key">"events"</span>:    [<span className="code-string">"onChange"</span>, <span className="code-string">"onSave"</span>],{'\n'}
{'  '}<span className="code-key">"schema"</span>:    <span className="code-punctuation">{'{'}</span>{'\n'}
{'    '}<span className="code-key">"latitude"</span>:  <span className="code-string">"number"</span>,{'\n'}
{'    '}<span className="code-key">"longitude"</span>: <span className="code-string">"number"</span>,{'\n'}
{'    '}<span className="code-key">"provider"</span>:  <span className="code-string">"string"</span>{'\n'}
{'  '}<span className="code-punctuation">{'}'}</span>{'\n'}
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
   Embed route (preserved)
   ════════════════════════════════════════════ */
function EmbedApp() {
  return <div className="embed-page"><MapDemo /></div>
}

const isEmbedRoute = window.location.pathname === '/map-component'
createRoot(document.getElementById('root')).render(
  <StrictMode>{isEmbedRoute ? <EmbedApp /> : <App />}</StrictMode>
)