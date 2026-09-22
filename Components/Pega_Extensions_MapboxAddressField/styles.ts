import styled from 'styled-components';

export const FieldShell = styled.div`
  display: grid;
  gap: 0.55rem;
  width: 100%;
`;

export const FieldControls = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: stretch;
`;

export const AddressInput = styled.input`
  min-width: 0;
  flex: 1;
  min-height: 2.75rem;
  padding: 0.65rem 0.8rem;
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

export const FieldButton = styled.button`
  min-width: 2.75rem;
  padding: 0.55rem 0.7rem;
  border: 0.0625rem solid ${({ theme }) => theme.base.palette['brand-primary']};
  border-radius: 0.5rem;
  color: ${({ theme }) => theme.base.palette['brand-primary']};
  background: transparent;
  font: inherit;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }
`;

export const FieldMessage = styled.div<{ error?: boolean }>`
  color: ${({ error }) => (error ? '#b42318' : 'inherit')};
  font-size: 0.8rem;
`;
