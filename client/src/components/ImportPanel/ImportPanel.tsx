import { Box, Toolbar } from '@mui/material';
import GedcomImportButton from './GedcomImportButton';
import { ImportSelector } from './ImportSelector';

export default function ImportPanel() {
  return (
    <Box>
      <Toolbar>
        <GedcomImportButton />
      </Toolbar>
      <ImportSelector />
    </Box>
  );
}
