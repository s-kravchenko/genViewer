import { useEffect, useState } from 'react';
import { Tree } from '@shared/models/Tree';
import styled from 'styled-components';

const Wrapper = styled.div`
  max-width: 400px;
  margin: 2rem auto;
  font-family: system-ui, sans-serif;
`;

const TreeList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const TreeItem = styled.li<{ selected?: boolean }>`
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

type TreeSelectorProps = {
  refresh: number;
  selected?: string;
  onSelect: (id?: string) => void;
};

// Export the default function TreeSelector
export default function TreeSelector({ refresh, selected, onSelect }: TreeSelectorProps) {
  const [trees, setTrees] = useState<Tree[]>([]);

  useEffect(() => {
    console.log('Fetching trees');
    fetch('/api/trees')
      .then((res) => res.json())
      .then(setTrees);
  }, [refresh]);

  return (
    <Wrapper>
      <TreeList>
        {trees.map((tree) => (
          <TreeItem
            key={tree.id}
            selected={tree.id === selected}
            onClick={() => onSelect(tree.id)}
          >
            {tree.fileName} ({tree.id})
          </TreeItem>
        ))}
      </TreeList>
    </Wrapper>
  );
}
