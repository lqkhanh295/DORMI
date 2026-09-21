import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { Analytics } from '@vercel/analytics/react';
import { useStore } from './store/useStore';
import { signalRService } from './services/signalr';

function App() {
  const currentUser = useStore(state => state.currentUser);

  useEffect(() => {
    if (currentUser?.id) {
      signalRService.startConnection(currentUser.id, currentUser.token, currentUser.role);
    } else {
      signalRService.stopConnection();
    }
  }, [currentUser?.id, currentUser?.token, currentUser?.role]);

  return (
    <BrowserRouter>
      <AppRoutes />
      <Analytics />
    </BrowserRouter>
  );
}

export default App;
