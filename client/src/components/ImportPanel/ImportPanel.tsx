import { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Box,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import daysjs from 'dayjs';
import { FileImport } from '@shared/models';
import ImportContext from '../../contexts/ImportContext';
import GedcomImportButton from './GedcomImportButton';

export function ImportPanel() {
  const { state, actions } = useContext(ImportContext)!;

  const tooltip = (fileImport: FileImport) => {
    const createdAt = daysjs(fileImport.createdAt).format('MMMM D YYYY, HH:mm:ss');
    return `Id: ${fileImport.id}\nCreated: ${createdAt}`;
  };

  return (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Imports
        </Typography>
      </Toolbar>
      <Divider />

      <Toolbar>
        <GedcomImportButton />
      </Toolbar>

      <List>
        {state.imports.map((i) => (
          <ListItem
            key={i.id}
            disablePadding
            secondaryAction={
              <IconButton
                component={NavLink}
                to={`/imports/${i.id}/roots`}
                edge="end"
                onClick={(e) => e.stopPropagation()}
              >
                R
              </IconButton>
            }
          >
            <ListItemButton
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                px: 2,
                '&.active': {
                  bgcolor: 'action.selected',
                },
              }}
              component={NavLink}
              to={`/imports/${i.id}`}
            >
              <Tooltip
                title={tooltip(i)}
                enterDelay={1000}
                enterNextDelay={1000}
                placement="right"
                arrow
              >
                <ListItemText primary={i.originalFileName} />
              </Tooltip>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
