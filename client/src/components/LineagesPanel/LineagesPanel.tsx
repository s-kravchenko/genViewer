import React, { useState } from 'react';
import RootsDialog from './RootsDialog';
import { LineageSelector } from './LineageSelector';

type LineagePanelProps = {
  onSelect: (lineageId: string) => void;
};

export default function LineagesPanel(props: LineagePanelProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [lineageId, setLineageId] = useState<string>();

  return (
    <>
      <div>Lineages:</div>
      <button onClick={() => setShowDialog(true)}>Show Roots</button>
      <RootsDialog open={showDialog} onClose={() => setShowDialog(false)} />

      <LineageSelector
        current={lineageId}
        onSelect={(newId) => {
          setLineageId(newId);
          props.onSelect(newId);
        }}
      />
    </>
  );
}
