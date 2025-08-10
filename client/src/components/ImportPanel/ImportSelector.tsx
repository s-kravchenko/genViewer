import { useContext } from 'react';
import daysjs from 'dayjs';
import { FileImport } from '@shared/models';
import ImportContext from '../../contexts/ImportContext';
import { Box, List, ListItemButton, Tooltip, Typography } from '@mui/material';

export function ImportSelector() {
  const { state, actions } = useContext(ImportContext)!;

  const tooltip = (fileImport: FileImport) => {
    const createdAt = daysjs(fileImport.createdAt).format('MMMM D YYYY, HH:mm:ss');
    return `Id: ${fileImport.id}\nCreated: ${createdAt}`;
  };

  return (
    <Box sx={{ p: 2 }}>
      <List>
        {state.imports.map((i) => (
          <Tooltip key={i.id} title={tooltip(i)} placement="right" arrow>
            <ListItemButton
              key={i.id}
              selected={i.id === state.currentImportId}
              onClick={() => {
                actions.selectImport(i.id);
              }}
            >
              <Typography>{i.originalFileName}</Typography>
            </ListItemButton>
          </Tooltip>
        ))}
      </List>
    </Box>
  );
}
