import GedcomFileUploader from './GedcomFileUploader';
import { DataImportSelector } from './DataImportSelector';

export default function DataImportPanel() {
  return (
    <>
      <GedcomFileUploader />
      <DataImportSelector />
    </>
  );
}
