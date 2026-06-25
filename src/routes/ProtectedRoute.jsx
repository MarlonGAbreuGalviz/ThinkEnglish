import Layout from '../components/Layout.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useRouter } from './RouterContext.jsx';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const { navigate } = useRouter();

  if (!isAuthenticated) {
    navigate('/login', { replace: true });
    return null;
  }

  return <Layout>{children}</Layout>;
}
