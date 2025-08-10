import { Routes, Route, Link } from 'react-router-dom';
import { Drawer, IconButton, Toolbar, Tooltip } from '@mui/material';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import MoveToInboxIcon from '@mui/icons-material/MoveToInbox';
import { ImportPanel } from './ImportPanel';
import { LineagesPanel } from './LineagesPanel';

export function Sidebar() {
  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: 250,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 250,
          boxSizing: 'border-box',
        },
      }}
    >
      <Toolbar
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Tooltip title="Lineages" arrow>
          <IconButton component={Link} to="/lineages">
            <AccountTreeIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Imports" arrow>
          <IconButton component={Link} to="/imports">
            <MoveToInboxIcon />
          </IconButton>
        </Tooltip>
      </Toolbar>
      <Routes>
        <Route path="/lineages" element={<LineagesPanel />} />
        <Route path="/imports" element={<ImportPanel />} />
      </Routes>
    </Drawer>
  );
}
