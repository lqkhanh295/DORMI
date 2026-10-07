import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { Analytics } from '@vercel/analytics/react';
import { useStore } from './store/useStore';
import { signalRService } from './services/signalr';

import { Toaster } from 'sonner';

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
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          className: 'font-sans text-sm rounded-2xl shadow-clay-card border border-primary-200/50 backdrop-blur-md',
          duration: 3500,
        }}
      />
    </BrowserRouter>
  );
}

export default App;
