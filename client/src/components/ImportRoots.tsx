import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Button, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { PersonDetails } from '@shared/models';
import { fetchFileImportRoots } from '../api/importApi';
import { createLineage } from 'src/api/lineageApi';
import LineageContext from '../contexts/LineageContext';

export default function ImportRoots() {
  const { importId } = useParams<{ importId: string }>();
  const [roots, setRoots] = useState<PersonDetails[]>([]);
  const { state, actions } = useContext(LineageContext)!;

  useEffect(() => {
    if (!importId) return;
    fetchFileImportRoots(importId).then(setRoots);
  }, [importId]);

  const handleRootClick = async (root: PersonDetails) => {
    // Ask user for the new lineage name
    const lineageName = window.prompt(
      `Enter a name for the new lineage of ${root.surname}:`
    );
    // Cancelled or empty
    if (!lineageName) {
      return;
    }

    try {
      // Replace with your actual endpoint
      const lineage = await createLineage({
        name: lineageName,
        founderId: root.id,
      });
      console.log('Lineage created:', lineage);

      actions.fetchLineages();
    } catch (err) {
      console.error('Failed to create lineage:', err);
      // TODO: show user an error toast/snackbar
    }
  };

  return (
    <Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Descendants</TableCell>
            <TableCell>Root</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {roots.map((rootInfo, idx) => (
            <TableRow key={idx}>
              <TableCell>{rootInfo.surname}</TableCell>
              <TableCell>{rootInfo.descendantCount}</TableCell>
              <TableCell>
                <Button variant="contained" size="small" onClick={() => handleRootClick(rootInfo)}>
                  Root
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
