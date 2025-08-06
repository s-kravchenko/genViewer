import { useContext } from 'react';
import LineageContext from '../../contexts/LineageContext';
import daysjs from 'dayjs';
import styled from 'styled-components';
import { Lineage } from '@shared/models';

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

export function LineageSelector() {
  const { state, actions } = useContext(LineageContext)!;

  const tooltip = (lineage: Lineage) => {
    const createdAt = daysjs(lineage.createdAt).format('MMMM D YYYY, HH:mm:ss');
    return `Id: ${lineage.id}\nCreated: ${createdAt}`;
  };

  return (
    <Wrapper>
      <LineageList>
        {state.lineages.map((i) => (
          <LineageItem key={i.id} selected={i.id === state.currentLineageId} onClick={() => actions.selectLineage(i.id)}>
            <div title={tooltip(i)}>{i.name}</div>
          </LineageItem>
        ))}
      </LineageList>
    </Wrapper>
  );
}
