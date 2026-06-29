import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
      <Analytics />
    </BrowserRouter>
  );
}

export default App;
