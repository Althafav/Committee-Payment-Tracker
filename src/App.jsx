import { AuthProvider, useAuth } from './context/AuthContext';
import { MemberProvider } from './context/MemberContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Login from './components/Login';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // While checking session, we can show nothing or a spinner
  // Since it's usually fast, null is fine to prevent flash
  if (loading) return null;

  if (!user) {
    return <Login />;
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <MemberProvider>
          <Layout>
            <Dashboard />
          </Layout>
        </MemberProvider>
      </ProtectedRoute>
    </AuthProvider>
  );
}

export default App;
