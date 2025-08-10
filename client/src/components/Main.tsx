import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import { DescendantTree } from './DescendantTree';

export function Main() {
  return (
    <Box sx={{ flex: 1, p: 2 }}>
      <Routes>
        <Route path="/lineages" element={'Hello!'} />
        <Route path="/imports" element={<DescendantTree rowGap={40} />} />
      </Routes>
    </Box>
  );
}
