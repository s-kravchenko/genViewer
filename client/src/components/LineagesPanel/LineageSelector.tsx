import { useContext } from 'react';
import daysjs from 'dayjs';
import { Box, List, ListItemButton, Tooltip, Typography } from '@mui/material';
import { Lineage } from '@shared/models';
import LineageContext from '../../contexts/LineageContext';

export function LineageSelector() {
  const { state, actions } = useContext(LineageContext)!;

  const tooltip = (lineage: Lineage) => {
    const createdAt = daysjs(lineage.createdAt).format('MMMM D YYYY, HH:mm:ss');
    return `Id: ${lineage.id}\nCreated: ${createdAt}`;
  };

  return (
    <Box sx={{ p: 2 }}>
      <List>
        {state.lineages.map((i) => (
          <Tooltip key={i.id} title={tooltip(i)} placement="right" arrow>
            <ListItemButton
              key={i.id}
              selected={i.id === state.currentLineageId}
              onClick={() => actions.selectLineage(i.id)}
            >
              <Typography>{i.name}</Typography>
            </ListItemButton>
          </Tooltip>
        ))}
      </List>
    </Box>
  );
}
