import { useEffect, useRef, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import ImportContext from '../../contexts/ImportContext';
import styled from 'styled-components';
import { LayoutManager, PositionedNode } from './LayoutManager';
import PersonCard from './PersonCard';
import ConnectorsLayer from './ConnectorsLayer';

const TreeWrapper = styled.div`
  position: relative;
`;

const TreeGrid = styled.div<{ $cols: number; $rowGap: number }>`
  display: grid;
  position: relative;
  grid-template-columns: repeat(${(props) => props.$cols}, auto);
  grid-auto-rows: auto;
  row-gap: ${(props) => props.$rowGap}px;
  column-gap: 10px;
  width: fit-content;
  // border: 1px solid #333;
`;

const GridCell = styled.div<{ $row: string | number; $col: string | number }>`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  grid-row: ${(props) => props.$row};
  grid-column: ${(props) => props.$col};
  // border: 1px solid #444;
`;

interface DescendantTreeProps {
  rowGap: number;
}

export default function DescendantTree({ rowGap }: DescendantTreeProps) {
  const { state, actions } = useContext(ImportContext)!;
  const { importId } = useParams<{ importId: string }>();

  const treeRef = useRef<HTMLDivElement>(null);
  const [nodeMap, setNodeMap] = useState<Map<string, PositionedNode>>(new Map());

  useEffect(() => {
    if (!importId) return;
    actions.selectImport(importId);
  }, [importId]);

  useEffect(() => {
    if (!state.currentImport) return;
    const layoutManager = new LayoutManager(state.currentImport);
    const nodes = layoutManager.apply();
    setNodeMap(nodes);
  }, [state.currentImport]);

  if (!state.currentImport || nodeMap.size === 0) {
    return null;
  }

  const getMaxCol = () => {
    if (!nodeMap.size) return 0;
    return Math.max(...Array.from(nodeMap.values()).map((p) => p.gridColumn + p.columnSpan - 1));
  };

  return (
    <TreeWrapper>
      <TreeGrid ref={treeRef} $cols={getMaxCol()} $rowGap={rowGap}>
        {Array.from(nodeMap.values()).map((node) => (
          <GridCell
            key={node.id}
            $row={node.gridRow}
            $col={`${node.gridColumn} / span ${node.columnSpan}`}
          >
            <PersonCard person={node} />
          </GridCell>
        ))}
      </TreeGrid>
      <ConnectorsLayer treeRef={treeRef} nodeMap={nodeMap} rowGap={rowGap} />
    </TreeWrapper>
  );
}
