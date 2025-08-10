import React, { useState } from 'react';
import RootsDialog from './RootsDialog';
import { LineageSelector } from './LineageSelector';
import { Box, Button, Toolbar, Tooltip } from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';

export default function LineagesPanel() {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <Box>
      <div>Lineages:</div>
      <Toolbar>
        <Button startIcon={<ShieldIcon />} onClick={() => setShowDialog(true)}>
          Select Roots
        </Button>
      </Toolbar>
      <RootsDialog open={showDialog} onClose={() => setShowDialog(false)} />
      <LineageSelector />
    </Box>
  );
}
