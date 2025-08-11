import { useContext } from 'react';
import daysjs from 'dayjs';
import { Box, Divider, List, ListItem, ListItemButton, Toolbar, Tooltip, Typography } from '@mui/material';
import { Lineage } from '@shared/models';
import LineageContext from '../contexts/LineageContext';

export function LineagesPanel() {
  const { state, actions } = useContext(LineageContext)!;

  const tooltip = (lineage: Lineage) => {
    const createdAt = daysjs(lineage.createdAt).format('MMMM D YYYY, HH:mm:ss');
    return `Id: ${lineage.id}\nCreated: ${createdAt}`;
  };

  return (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Lineages
        </Typography>
      </Toolbar>
      <Divider />

      <List>
        {state.lineages.map((i) => (
          <ListItem key={i.id} disablePadding>
            <Tooltip title={tooltip(i)} placement="right" arrow>
              <ListItemButton
                selected={i.id === state.currentLineageId}
                onClick={() => actions.selectLineage(i.id)}
              >
                <Typography>{i.name}</Typography>
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
