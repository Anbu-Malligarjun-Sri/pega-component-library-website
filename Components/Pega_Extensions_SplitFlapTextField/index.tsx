import { useEffect, useState } from 'react';
import { withConfiguration } from '@pega/cosmos-react-core';
import SplitFlapText from '../Pega_Extensions_SplitFlapText/SplitFlapText.jsx';
import { getSplitFlapTextStyle, type SplitFlapTextStyleProps } from '../Pega_Extensions_SplitFlapText/styles';
import { FieldInput, FieldMessage, FieldShell, PreviewLabel } from './styles';
import '../shared/create-nonce';

export type SplitFlapTextFieldProps = SplitFlapTextStyleProps & {
  label: string;
  value?: string;
  placeholder?: string;
  helperText?: string;
  validatemessage?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  getPConnect: () => typeof PConnect;
};

export const PegaExtensionsSplitFlapTextField = (props: SplitFlapTextFieldProps) => {
  const {
    label,
    value = '',
    placeholder = 'Enter text',
    helperText = '',
    validatemessage = '',
    disabled = false,
    readOnly = false,
    required = false,
    tileColor = '#111827',
    textColor = '#f8fafc',
    tileRadius = 8,
    gap = 6,
    fontSize = 52,
    getPConnect,
  } = props;
  const [inputValue, setInputValue] = useState(value);
  const pConnect = getPConnect();
  const actions = pConnect.getActionsApi();
  const property = pConnect.getStateProps().value;

  useEffect(() => setInputValue(value), [value]);

  const commitValue = (nextValue: string) => {
    setInputValue(nextValue);
    actions.updateFieldValue(property, nextValue);
    actions.triggerFieldChange(property, nextValue);
  };

  return (
    <FieldShell>
      <label htmlFor={`split-flap-field-${property}`}>{label}</label>
      <FieldInput
        id={`split-flap-field-${property}`}
        value={inputValue}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        aria-label={label}
        onChange={(event) => setInputValue(event.target.value)}
        onBlur={() => {
          if (!readOnly && inputValue !== value) commitValue(inputValue);
        }}
      />
      <PreviewLabel>Animated preview</PreviewLabel>
      <SplitFlapText
        text={inputValue}
        aria-label={`${label} preview`}
        role='status'
        style={getSplitFlapTextStyle({ tileColor, textColor, tileRadius, gap, fontSize })}
      />
      {(validatemessage || helperText) && (
        <FieldMessage error={Boolean(validatemessage)}>{validatemessage || helperText}</FieldMessage>
      )}
    </FieldShell>
  );
};

export default withConfiguration(PegaExtensionsSplitFlapTextField);
