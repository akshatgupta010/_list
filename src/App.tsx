import { RouterProvider } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { router } from './routes';
import { ToastProvider } from './components/ui/Toast';

export function App() {
  return (
    <ToastProvider>
      <RouterProvider router={router} />
      <Analytics />
    </ToastProvider>
  );
}
