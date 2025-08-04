import React, { useState } from 'react';
import RootsDialog from './RootsDialog';

export default function LineagesPanel() {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <div>Lineages:</div>
      <button onClick={() => setShowDialog(true)}>Show Roots</button>
      <RootsDialog open={showDialog} onClose={() => setShowDialog(false)} />
    </>
  );
}
