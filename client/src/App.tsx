
import { BrowserRouter as Router } from 'react-router-dom';
import { Box } from '@mui/material';
import { ImportProvider } from './contexts/ImportContext';
import { LineageProvider } from './contexts/LineageContext';
import { Sidebar } from './components/Sidebar';
import { Main } from './components/Main';

function App() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'row' }}>
      <ImportProvider>
        <LineageProvider>
          <Router>
            <Sidebar />
            <Main />
          </Router>
        </LineageProvider>
      </ImportProvider>
    </Box>
  );
}

export default App;
