import { MemberProvider } from './context/MemberContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <MemberProvider>
      <Layout>
        <Dashboard />
      </Layout>
    </MemberProvider>
  );
}

export default App;
