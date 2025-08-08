import styled from 'styled-components';
import { ImportPanel } from './components/ImportPanel';
import { LineagesPanel } from './components/LineagesPanel';
import { DescendantTree } from './components/DescendantTree';
import { ImportProvider } from './contexts/ImportContext';
import { LineageProvider } from './contexts/LineageContext';

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
  return (
    <Layout>
      <ImportProvider>
        <LineageProvider>
          <LeftPane>
            <ImportPanel />
            <LineagesPanel />
          </LeftPane>
          <RightPane>
            <DescendantTree rowGap={40} />
          </RightPane>
        </LineageProvider>
      </ImportProvider>
    </Layout>
  );
}

export default App;
