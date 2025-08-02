import React, { ChangeEvent } from 'react';

type GedcomFileUploaderProps = {
  onUploaded: (id: string) => void;
};

export default function GedcomFileUploader({ onUploaded }: GedcomFileUploaderProps) {
  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('gedcom', file);

    try {
      const response = await fetch('/api/import/gedcom', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      console.log('Upload result:', result);

      onUploaded(result.id);
    } catch (error) {
      console.error('Upload failed:', error);
    }

    // Reset the input so the same file can be processed again
    event.target.value = '';
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
