import { useContext } from 'react';
import daysjs from 'dayjs';
import styled from 'styled-components';
import { FileImport } from '@shared/models';
import ImportContext from '../../contexts/ImportContext';

const Wrapper = styled.div`
  max-width: 400px;
  margin: 2rem auto;
  font-family: system-ui, sans-serif;
`;

const ImportList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ImportItem = styled.li<{ selected?: boolean }>`
  padding: 10px 12px;
  margin-bottom: 6px;
  border-radius: 4px;
  background: ${({ selected }) => (selected ? '#cce5ff' : '#f5f5f5')};
  font-weight: ${({ selected }) => (selected ? '600' : 'normal')};
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #e0e0e0;
  }
`;

export function ImportSelector() {
  const { state, actions } = useContext(ImportContext)!;

  const tooltip = (fileImport: FileImport) => {
    const createdAt = daysjs(fileImport.createdAt).format('MMMM D YYYY, HH:mm:ss');
    return `Id: ${fileImport.id}\nCreated: ${createdAt}`;
  };

  return (
    <Wrapper>
      <ImportList>
        {state.imports.map((i) => (
          <ImportItem
            key={i.id}
            selected={i.id === state.currentImportId}
            onClick={() => {
              actions.selectImport(i.id);
            }}
          >
            <div title={tooltip(i)}>{i.originalFileName}</div>
          </ImportItem>
        ))}
      </ImportList>
    </Wrapper>
  );
}
