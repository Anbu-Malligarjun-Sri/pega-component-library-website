import styled from 'styled-components';

export const PickerShell = styled.section`
  display: grid;
  gap: 0.75rem;
  width: 100%;
`;

export const PickerToolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

export const SearchInput = styled.input`
  min-width: 14rem;
  flex: 1;
  min-height: 2.5rem;
  padding: 0.55rem 0.75rem;
  border: 0.0625rem solid ${({ theme }) => theme.base.palette['border-line']};
  border-radius: 0.5rem;
  color: inherit;
  background: ${({ theme }) => theme.base.palette['background-color']};
  font: inherit;

  &:focus {
    outline: 0.15rem solid color-mix(in srgb, ${({ theme }) => theme.base.palette['brand-primary']} 45%, transparent);
    outline-offset: 0.1rem;
  }
`;

export const ActionButton = styled.button`
  min-height: 2.5rem;
  padding: 0.55rem 0.8rem;
  border: 0.0625rem solid ${({ theme }) => theme.base.palette['brand-primary']};
  border-radius: 0.5rem;
  color: ${({ theme }) => theme.base.palette['brand-primary']};
  background: transparent;
  font: inherit;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: color-mix(in srgb, ${({ theme }) => theme.base.palette['brand-primary']} 10%, transparent);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }
`;

export const MapViewport = styled.div<{ height: string }>`
  position: relative;
  height: ${({ height }) => height};
  min-height: 16rem;
  overflow: hidden;
  border: 0.0625rem solid ${({ theme }) => theme.base.palette['border-line']};
  border-radius: 0.75rem;
  background: color-mix(in srgb, currentColor 7%, transparent);
`;

export const MapCanvas = styled.div`
  width: 100%;
  height: 100%;
`;

export const StatusMessage = styled.p<{ error?: boolean }>`
  margin: 0;
  color: ${({ error }) => (error ? '#b42318' : 'inherit')};
  font-size: 0.875rem;
`;

export const AddressSummary = styled.div`
  display: grid;
  gap: 0.2rem;
  padding: 0.7rem 0.8rem;
  border-radius: 0.5rem;
  background: color-mix(in srgb, currentColor 6%, transparent);
  font-size: 0.875rem;
`;
