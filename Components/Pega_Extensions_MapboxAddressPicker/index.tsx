import { useEffect, useRef, useState } from 'react';
import { Button, Text, withConfiguration } from '@pega/cosmos-react-core';
import { getMappedKey } from '../shared/utils';
import {
  ActionButton,
  AddressSummary,
  MapCanvas,
  MapViewport,
  PickerShell,
  PickerToolbar,
  SearchInput,
  StatusMessage,
} from './styles';
import '../shared/create-nonce';

type MapboxMap = {
  on: (event: string, callback: (...args: any[]) => void) => void;
  setCenter: (center: [number, number]) => void;
  setZoom: (zoom: number) => void;
  remove: () => void;
};

type MapboxMarker = {
  setLngLat: (coordinates: [number, number]) => MapboxMarker;
  addTo: (map: MapboxMap) => MapboxMarker;
  on: (event: string, callback: (...args: any[]) => void) => void;
  getLngLat: () => { lng: number; lat: number };
};

type MapboxConstructor = new (options: Record<string, unknown>) => MapboxMap;
type MarkerConstructor = new (options?: Record<string, unknown>) => MapboxMarker;

declare global {
  interface Window {
    mapboxgl?: {
      accessToken: string;
      Map: MapboxConstructor;
      Marker: MarkerConstructor;
      NavigationControl?: new () => unknown;
    };
  }
}

export type MapboxAddressPickerProps = {
  heading?: string;
  mapboxToken: string;
  addressLine1Property?: string;
  cityProperty?: string;
  stateProperty?: string;
  countryProperty?: string;
  postalCodeProperty?: string;
  latitudeProperty?: string;
  longitudeProperty?: string;
  initialLatitude?: string;
  initialLongitude?: string;
  height?: string;
  zoom?: string;
  disabled?: boolean;
  getPConnect: () => typeof PConnect;
};

const MAPBOX_SCRIPT = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js';
const MAPBOX_STYLE = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';

const loadMapbox = () =>
  new Promise<NonNullable<typeof window.mapboxgl>>((resolve, reject) => {
    if (window.mapboxgl) {
      resolve(window.mapboxgl);
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${MAPBOX_SCRIPT}"]`);
    const script = existing || document.createElement('script');
    const onLoad = () => (window.mapboxgl ? resolve(window.mapboxgl) : reject(new Error('Mapbox loaded without its API.')));
    const onError = () => reject(new Error('Mapbox could not be loaded.'));
    script.addEventListener('load', onLoad, { once: true });
    script.addEventListener('error', onError, { once: true });
    if (!existing) {
      script.src = MAPBOX_SCRIPT;
      script.async = true;
      document.head.appendChild(script);
    }
  });

const ensureMapboxStyles = () => {
  if (!document.querySelector(`link[href="${MAPBOX_STYLE}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = MAPBOX_STYLE;
    document.head.appendChild(link);
  }
};

const propertyReference = (value: string) => {
  const trimmed = value.trim();
  if (trimmed.startsWith('@P ')) return trimmed.slice(3).trim();
  return trimmed.startsWith('.') ? trimmed : '';
};

const setPegaValue = (pConnect: typeof PConnect, configuredProperty: string, value: string) => {
  if (!configuredProperty.trim() || !value) return;
  const property = propertyReference(configuredProperty) || `.${getMappedKey(configuredProperty.trim())}`;
  pConnect.getActionsApi().updateFieldValue(property, value);
};

const getFeatureContext = (feature: any) => {
  const context = feature?.context || [];
  const get = (types: string[]) =>
    context.find((item: any) => types.some((type) => String(item.id || '').startsWith(`${type}.`)))?.text || '';
  return {
    addressLine1: feature?.text || '',
    city: get(['place', 'locality', 'district']),
    state: get(['region']),
    country: get(['country']),
    postalCode: get(['postcode']),
  };
};

export const PegaExtensionsMapboxAddressPicker = (props: MapboxAddressPickerProps) => {
  const {
    heading = 'Choose an address',
    mapboxToken = '',
    addressLine1Property = '',
    cityProperty = '',
    stateProperty = '',
    countryProperty = '',
    postalCodeProperty = '',
    latitudeProperty = '',
    longitudeProperty = '',
    initialLatitude = '17.6868',
    initialLongitude = '83.2185',
    height = '24rem',
    zoom = '12',
    disabled = false,
    getPConnect,
  } = props;
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapboxMap>();
  const markerRef = useRef<MapboxMarker>();
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedAddress, setSelectedAddress] = useState('');

  const writeAddress = (feature: any, coordinates: [number, number]) => {
    const pConnect = getPConnect();
    const values = getFeatureContext(feature);
    setPegaValue(pConnect, addressLine1Property, values.addressLine1);
    setPegaValue(pConnect, cityProperty, values.city);
    setPegaValue(pConnect, stateProperty, values.state);
    setPegaValue(pConnect, countryProperty, values.country);
    setPegaValue(pConnect, postalCodeProperty, values.postalCode);
    setPegaValue(pConnect, latitudeProperty, String(coordinates[1]));
    setPegaValue(pConnect, longitudeProperty, String(coordinates[0]));
    setSelectedAddress(feature?.place_name || values.addressLine1);
  };

  const moveMarker = (coordinates: [number, number]) => {
    const map = mapRef.current;
    if (!map || !markerRef.current) return;
    markerRef.current.setLngLat(coordinates);
    map.setCenter(coordinates);
  };

  const reverseGeocode = async (coordinates: [number, number]) => {
    if (!mapboxToken.trim()) throw new Error('Configure a Mapbox public token before using the address picker.');
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${coordinates[0]},${coordinates[1]}.json?access_token=${encodeURIComponent(mapboxToken.trim())}&types=address,place,postcode`,
    );
    if (!response.ok) throw new Error('Mapbox could not find an address for this location.');
    const payload = await response.json();
    const feature = payload.features?.[0];
    if (!feature) throw new Error('No address was found for this location.');
    writeAddress(feature, coordinates);
  };

  const searchAddress = async () => {
    if (!search.trim()) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(search.trim())}.json?access_token=${encodeURIComponent(mapboxToken.trim())}&limit=1`,
      );
      if (!response.ok) throw new Error('Mapbox search failed.');
      const payload = await response.json();
      const feature = payload.features?.[0];
      if (!feature?.center) throw new Error('No matching address was found.');
      const coordinates: [number, number] = [feature.center[0], feature.center[1]];
      moveMarker(coordinates);
      writeAddress(feature, coordinates);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to search for that address.');
    } finally {
      setLoading(false);
    }
  };

  const requestCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('This browser does not support location services.');
      return;
    }
    setLoading(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coordinates: [number, number] = [position.coords.longitude, position.coords.latitude];
        moveMarker(coordinates);
        reverseGeocode(coordinates)
          .catch((caught) => setError(caught instanceof Error ? caught.message : 'Unable to resolve your location.'))
          .finally(() => setLoading(false));
      },
      (caught) => {
        setLoading(false);
        setError(
          caught.code === caught.PERMISSION_DENIED
            ? 'Location permission was denied. Allow location access in your browser and try again.'
            : 'Unable to read your current location.',
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    );
  };

  useEffect(() => {
    let disposed = false;
    if (!mapboxToken.trim()) {
      setError('Configure a Mapbox public token to load the map.');
      return undefined;
    }
    ensureMapboxStyles();
    loadMapbox()
      .then((mapbox) => {
        if (disposed || !mapElementRef.current) return;
        mapbox.accessToken = mapboxToken.trim();
        const center: [number, number] = [Number(initialLongitude) || 83.2185, Number(initialLatitude) || 17.6868];
        const map = new mapbox.Map({
          container: mapElementRef.current,
          style: 'mapbox://styles/mapbox/streets-v11',
          center,
          zoom: Number(zoom) || 12,
        });
        mapRef.current = map;
        markerRef.current = new mapbox.Marker({ draggable: true }).setLngLat(center).addTo(map);
        markerRef.current.on('dragend', () => {
          const position = markerRef.current?.getLngLat();
          if (!position) return;
          setLoading(true);
          reverseGeocode([position.lng, position.lat])
            .catch((caught) => setError(caught instanceof Error ? caught.message : 'Unable to resolve the pin location.'))
            .finally(() => setLoading(false));
        });
      })
      .catch((caught) => setError(caught instanceof Error ? caught.message : 'Unable to load the map.'));
    return () => {
      disposed = true;
      mapRef.current?.remove();
      mapRef.current = undefined;
      markerRef.current = undefined;
    };
  }, [initialLatitude, initialLongitude, mapboxToken, zoom]);

  return (
    <PickerShell aria-label={heading}>
      <Text variant='h3'>{heading}</Text>
      <PickerToolbar>
        <SearchInput
          value={search}
          disabled={disabled || loading}
          placeholder='Search for an address'
          aria-label='Search for an address'
          onChange={(event) => setSearch(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') void searchAddress();
          }}
        />
        <ActionButton type='button' disabled={disabled || loading || !search.trim()} onClick={() => void searchAddress()}>
          Search
        </ActionButton>
        <Button
          type='button'
          variant='secondary'
          disabled={disabled || loading}
          onClick={requestCurrentLocation}
        >
          Use current location
        </Button>
      </PickerToolbar>
      <MapViewport height={height}>
        <MapCanvas ref={mapElementRef} />
      </MapViewport>
      {loading && <StatusMessage>Finding the address...</StatusMessage>}
      {error && <StatusMessage error>{error}</StatusMessage>}
      {selectedAddress && (
        <AddressSummary>
          <strong>Selected address</strong>
          <span>{selectedAddress}</span>
        </AddressSummary>
      )}
    </PickerShell>
  );
};

export default withConfiguration(PegaExtensionsMapboxAddressPicker);
