import { useEffect, useState } from 'react';
import daysjs from 'dayjs';
import styled from 'styled-components';
import { DataImport } from '@shared/models';
import { ImportApi } from '../../api/ImportApi';

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
  current?: string;
  onSelect: (id: string) => void;
};

export function DataImportSelector({ current, onSelect }: DataImportSelectorProps) {
  const [dataImports, setDataImports] = useState<DataImport[]>([]);

  useEffect(() => {
    ImportApi.fetchDataImports()
    .then((data) => {
      if (!data) return; // TODO: handle error
      setDataImports(data);
    });
  }, [current]);

  const tooltip = (dataImport: DataImport) => {
    const createdAt = daysjs(dataImport.createdAt).format('MMMM D YYYY, HH:mm:ss');
    return `Id: ${dataImport.id}\nCreated: ${createdAt}`;
  }

  return (
    <Wrapper>
      <DataImportList>
        {dataImports.map((i) => (
          <DataImportItem key={i.id} selected={i.id === current} onClick={() => onSelect(i.id)}>
            <div title={tooltip(i)}>
              {i.originalFileName}
            </div>
          </DataImportItem>
        ))}
      </DataImportList>
    </Wrapper>
  );
}
