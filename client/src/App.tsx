import { useEffect, useState } from 'react';
import styled from 'styled-components';
import GedcomFileUploader from './components/GedcomFileUploader';
import TreeSelector from './components/TreeSelector';

const Layout = styled.div`
  display: flex;
  height: 100vh;
  width: 100%;
`;

const LeftPane = styled.div`
  width: 20%;
  background-color: #f5f5f5;
  padding: 1rem;
  border-right: 1px solid #ddd;
  overflow-y: auto;
`;

const RightPane = styled.div`
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
`;

function App() {
  const [treeId, setTreeId] = useState<string>();
  const [refreshKey, setRefreshKey] = useState<number>(0);

  return (
    <Layout>
      <LeftPane>
        <GedcomFileUploader
          onUploaded={(newId) => {
            setTreeId(newId);
            setRefreshKey((prev) => prev + 1);
          }}
        />
        <TreeSelector
          selected={treeId}
          onSelect={(id) => setTreeId(id)}
          refresh={refreshKey}
        />
      </LeftPane>
      <RightPane>Main content for tree "{treeId}" here...</RightPane>
    </Layout>
  );
}

export default App;
