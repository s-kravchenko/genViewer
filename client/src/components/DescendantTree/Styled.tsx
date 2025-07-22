import styled from 'styled-components';

export const TreeContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2rem;
  position: relative;
`;

export const GenerationRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
`;

export const PersonWrapper = styled.div`
  position: relative;
`;

export const PersonBox = styled.div`
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #f8f8f8;
  padding: 0.5rem 1rem;
  min-width: 120px;
  text-align: center;
  font-family: sans-serif;
  font-size: 0.95rem;
`;
