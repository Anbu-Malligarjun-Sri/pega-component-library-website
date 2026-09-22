import { useEffect, useState, type KeyboardEvent } from 'react';
import { withConfiguration } from '@pega/cosmos-react-core';
import { FieldButton, FieldControls, FieldMessage, FieldShell, AddressInput } from './styles';
import '../shared/create-nonce';

export type MapboxAddressFieldProps = {
  label: string;
  mapboxToken: string;
  value?: string;
  placeholder?: string;
  helperText?: string;
  validatemessage?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  getPConnect: () => typeof PConnect;
};

const searchMapbox = async (query: string, token: string) => {
  const response = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${encodeURIComponent(token)}&limit=1`,
  );
  if (!response.ok) throw new Error('Address search failed.');
  const payload = await response.json();
  return payload.features?.[0]?.place_name || '';
};

const reverseGeocode = async (latitude: number, longitude: number, token: string) =>
  searchMapbox(`${longitude},${latitude}`, token);

export const PegaExtensionsMapboxAddressField = (props: MapboxAddressFieldProps) => {
  const {
    label,
    mapboxToken,
    value = '',
    placeholder = 'Search for an address',
    helperText = '',
    validatemessage = '',
    disabled = false,
    readOnly = false,
    required = false,
    getPConnect,
  } = props;
  const [inputValue, setInputValue] = useState(value);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const actions = getPConnect().getActionsApi();
  const property = getPConnect().getStateProps().value;

  useEffect(() => setInputValue(value), [value]);

  const commitValue = (nextValue: string) => {
    setInputValue(nextValue);
    actions.updateFieldValue(property, nextValue);
    actions.triggerFieldChange(property, nextValue);
  };

  const findAddress = async () => {
    if (!inputValue.trim() || !mapboxToken.trim()) {
      setError('Configure a Mapbox public token before searching.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      commitValue(await searchMapbox(inputValue.trim(), mapboxToken.trim()));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to find that address.');
    } finally {
      setLoading(false);
    }
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError('This browser does not support location services.');
      return;
    }
    if (!mapboxToken.trim()) {
      setError('Configure a Mapbox public token before using your location.');
      return;
    }
    setLoading(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        reverseGeocode(position.coords.latitude, position.coords.longitude, mapboxToken.trim())
          .then(commitValue)
          .catch((caught) => setError(caught instanceof Error ? caught.message : 'Unable to resolve your location.'))
          .finally(() => setLoading(false));
      },
      () => {
        setLoading(false);
        setError('Location permission was denied or unavailable.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    );
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') void findAddress();
  };

  return (
    <FieldShell>
      <label>{label}</label>
      <FieldControls>
        <AddressInput
          value={inputValue}
          required={required}
          readOnly={readOnly}
          disabled={disabled || loading}
          placeholder={placeholder}
          aria-label={label}
          onChange={(event) => setInputValue(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (!readOnly && inputValue !== value) commitValue(inputValue);
          }}
        />
        <FieldButton type='button' disabled={disabled || readOnly || loading} onClick={() => void findAddress()}>
          Search
        </FieldButton>
        <FieldButton type='button' disabled={disabled || readOnly || loading} onClick={requestLocation}>
          Locate
        </FieldButton>
      </FieldControls>
      {loading && <FieldMessage>Finding address...</FieldMessage>}
      {(error || validatemessage) && <FieldMessage error>{error || validatemessage}</FieldMessage>}
      {!error && !validatemessage && helperText && <FieldMessage>{helperText}</FieldMessage>}
    </FieldShell>
  );
};

export default withConfiguration(PegaExtensionsMapboxAddressField);
