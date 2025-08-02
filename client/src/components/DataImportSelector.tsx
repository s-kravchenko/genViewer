import { useEffect, useState } from 'react';
import { DataImport } from '@shared/models';
import styled from 'styled-components';

const Wrapper = styled.div`
  max-width: 400px;
  margin: 2rem auto;
  font-family: system-ui, sans-serif;
`;

const DataImportList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const DataImportItem = styled.li<{ selected?: boolean }>`
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

type DataImportSelectorProps = {
  refresh: number;
  selected?: string;
  onSelect: (id?: string) => void;
};

export function DataImportSelector({ refresh, selected, onSelect }: DataImportSelectorProps) {
  const [dataImports, setDataImports] = useState<DataImport[]>([]);

  useEffect(() => {
    console.log('Fetching data imports');
    fetch('/api/data-imports')
      .then((res) => res.json())
      .then(setDataImports);
  }, [refresh]);

  return (
    <Wrapper>
      <DataImportList>
        {dataImports.map((i) => (
          <DataImportItem key={i.id} selected={i.id === selected} onClick={() => onSelect(i.id)}>
            <div>
              Name: {i.originalFileName}<br/>
              Imported: {i.createdAt}<br/>
              Id: {i.id}
            </div>
          </DataImportItem>
        ))}
      </DataImportList>
    </Wrapper>
  );
}
