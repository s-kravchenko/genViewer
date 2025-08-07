import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import { PersonDetails } from '@shared/models';
import { fetchRoots } from '../../api/lineageApi';

type RootsDialogProps = {
  open: boolean;
  onClose: () => void;
};

export default function RootsDialog({ open, onClose }: RootsDialogProps) {
  const [isActive, setIsActive] = useState(open);
  const [roots, setRoots] = useState<PersonDetails[]>([]);

  useEffect(() => {
    setIsActive(open);
    if (!open) return;

    fetchRoots().then((data) => {
      if (!data) return; // TODO: handle error
      setRoots(data);
    });
  }, [open]);

  return (
    <div>
      <Dialog open={isActive} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>User Table</DialogTitle>
        <DialogContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Descendants</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roots.map((rootInfo, idx) => (
                <TableRow key={idx}>
                  <TableCell>{rootInfo.surname}</TableCell>
                  <TableCell>{rootInfo.descendantCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
