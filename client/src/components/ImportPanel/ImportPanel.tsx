import GedcomFileUploader from './GedcomFileUploader';
import { ImportSelector } from './ImportSelector';

export default function ImportPanel() {
  return (
    <>
      <GedcomFileUploader />
      <ImportSelector />
    </>
  );
}
