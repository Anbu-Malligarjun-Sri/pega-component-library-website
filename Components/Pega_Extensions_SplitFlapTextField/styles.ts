import styled from 'styled-components';

export const FieldShell = styled.div`
  display: grid;
  gap: 0.7rem;
  width: 100%;
`;

export const FieldInput = styled.input`
  width: 100%;
  min-height: 2.75rem;
  padding: 0.65rem 0.8rem;
  border: 0.0625rem solid ${({ theme }) => theme.base.palette['border-line']};
  border-radius: 0.5rem;
  color: inherit;
  background: ${({ theme }) => theme.base.palette['background-color']};
  font: inherit;
  box-sizing: border-box;

  &:focus {
    outline: 0.15rem solid color-mix(in srgb, ${({ theme }) => theme.base.palette['brand-primary']} 45%, transparent);
    outline-offset: 0.1rem;
  }
`;

export const FieldMessage = styled.div<{ error?: boolean }>`
  color: ${({ error }) => (error ? '#b42318' : 'inherit')};
  font-size: 0.8rem;
`;

export const PreviewLabel = styled.div`
  color: color-mix(in srgb, currentColor 68%, transparent);
  font-size: 0.8rem;
`;
