import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import { DescendantTree } from './DescendantTree';

export function Main() {
  return (
    <Box sx={{ flex: 1, p: 2 }}>
      <Routes>
        <Route path="/" element={<></>} />
        <Route path="/lineages" element={<></>} />
        <Route path="/imports" element={<></>} />
        <Route path="/imports/:importId" element={<DescendantTree rowGap={40} />} />
      </Routes>
    </Box>
  );
}
