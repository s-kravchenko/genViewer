import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { ImportApi } from '../../api/ImportApi';
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
  dataImportId?: string;
  rowGap: number;
}

export default function DescendantTree({ dataImportId, rowGap }: DescendantTreeProps) {
  const treeRef = useRef<HTMLDivElement>(null);
  const [nodeMap, setNodeMap] = useState<Map<string, PositionedNode>>(new Map());

  useEffect(() => {
    if (!dataImportId) return;

    ImportApi.fetchDataImport(dataImportId)
      .then((data) => {
        if (!data) return; // TODO: handle error

        const layoutManager = new LayoutManager(data.dataImport, data.people, data.families);
        const nodes = layoutManager.apply();
        setNodeMap(nodes);
      })
  }, [dataImportId]);

  const getMaxCol = () => {
    if (!nodeMap.size) return 0;
    return Math.max(...Array.from(nodeMap.values()).map((p) => p.gridColumn + p.columnSpan - 1));
  };

  if (!nodeMap.size) return null;

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
