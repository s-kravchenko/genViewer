import React, { ChangeEvent } from 'react';
import { importGedcom } from '../../api/importApi';

type GedcomFileUploaderProps = {
  onUploaded: (id: string) => void;
};

export default function GedcomFileUploader({ onUploaded }: GedcomFileUploaderProps) {
  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    // Reset the input so the same file can be processed again
    event.target.value = '';

    if (!file) return;

    const dataImport = await importGedcom(file);
    if (!dataImport) return; // TODO: handle error

    console.log('GEDCOM file uploaded successfully:', dataImport);
    onUploaded(dataImport.id);
  };

  return (
    <div>
      <label htmlFor="gedcom-input">
        <button
          type="button"
          onClick={() => document.getElementById('gedcom-input')?.click()}
        >
          📂 Upload GEDCOM File
        </button>
      </label>
      <input
        id="gedcom-input"
        type="file"
        accept=".ged"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  );
}
