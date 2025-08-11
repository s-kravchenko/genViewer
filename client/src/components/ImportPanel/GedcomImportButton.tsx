import { ChangeEvent, useContext } from 'react';
import { Button } from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import { importGedcom } from '../../api/importApi';
import ImportContext from '../../contexts/ImportContext';

export default function GedcomImportButton() {
  const { state, actions } = useContext(ImportContext)!;

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];

    // Reset the input so the same file can be processed again
    event.currentTarget.value = '';

    if (!file) return;

    const dataImport = await importGedcom(file);
    if (!dataImport) return; // TODO: handle error

    console.log('GEDCOM file imported successfully:', dataImport);

    await actions.fetchImports();
    await actions.selectImport(dataImport.id);
  };

  return (
    <>
      <input
        id="gedcom-input"
        type="file"
        accept=".ged"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <label htmlFor="gedcom-input">
        <Button
          startIcon={<UploadIcon />}
          onClick={() => document.getElementById('gedcom-input')?.click()}
        >
          Import GEDCOM
        </Button>
      </label>
    </>
  );
}
