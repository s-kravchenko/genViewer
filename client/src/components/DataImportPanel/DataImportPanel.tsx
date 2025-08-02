import React, { useState } from 'react';
import GedcomFileUploader from './GedcomFileUploader';
import { DataImportSelector } from './DataImportSelector';

type DataImportPanelProps = {
  onSelect: (dataImportId: string) => void;
};

export default function DataImportPanel(props: DataImportPanelProps) {
  const [dataImportId, setDataImportId] = useState<string>();
  // const [refreshKey, setRefreshKey] = useState<number>(0);

  return (
    <>
      <GedcomFileUploader
        onUploaded={(newId) => {
          setDataImportId(newId);
          props.onSelect(newId);
        }}
      />
      <DataImportSelector
        current={dataImportId}
        onSelect={(newId) => {
          setDataImportId(newId);
          props.onSelect(newId);
        }}
      />
    </>
  );
}
