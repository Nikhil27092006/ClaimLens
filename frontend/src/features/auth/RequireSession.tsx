import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSession } from './session';

/** Route guard: without a session, go to /login and come back here after the demo starts. */
export function RequireSession() {
  const session = useSession();
  const location = useLocation();
  if (!session) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}
