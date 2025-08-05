import { useEffect, useState } from 'react';
import daysjs from 'dayjs';
import styled from 'styled-components';
import { Lineage } from '@shared/models';
import { LineageApi } from '../../api/LineageApi';

const Wrapper = styled.div`
  max-width: 400px;
  margin: 2rem auto;
  font-family: system-ui, sans-serif;
`;

const LineageList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const LineageItem = styled.li<{ selected?: boolean }>`
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

type LineageSelectorProps = {
  current?: string;
  onSelect: (id: string) => void;
};

export function LineageSelector({ current, onSelect }: LineageSelectorProps) {
  const [lineages, setLineages] = useState<Lineage[]>([]);

  useEffect(() => {
    LineageApi.fetchLineages().then((data) => {
      if (!data) return; // TODO: handle error
      setLineages(data);
    });
  }, [current]);

  const tooltip = (lineage: Lineage) => {
    const createdAt = daysjs(lineage.createdAt).format('MMMM D YYYY, HH:mm:ss');
    return `Id: ${lineage.id}\nCreated: ${createdAt}`;
  };

  return (
    <Wrapper>
      <LineageList>
        {lineages.map((i) => (
          <LineageItem key={i.id} selected={i.id === current} onClick={() => onSelect(i.id)}>
            <div title={tooltip(i)}>{i.name}</div>
          </LineageItem>
        ))}
      </LineageList>
    </Wrapper>
  );
}
