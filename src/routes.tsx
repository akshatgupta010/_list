import { createHashRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { RootLayout } from './components/layout/RootLayout';
import { HomePage } from './pages/HomePage';
import { ListPage } from './pages/ListPage';
import { AddEditPage } from './pages/AddEditPage';
import { ItemDetailPage } from './pages/ItemDetailPage';
import { CompletedPage } from './pages/CompletedPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Lazy-loaded routes per PRD Section 5.1 & 11.4
const StatsPage = lazy(() =>
  import('./pages/StatsPage').then((m) => ({ default: m.StatsPage }))
);
const ExplorePage = lazy(() =>
  import('./pages/ExplorePage').then((m) => ({ default: m.ExplorePage }))
);

function PageLoading() {
  return (
    <div className="py-20 flex items-center justify-center text-xs font-mono text-muted tracking-widest uppercase">
      [LOADING HORIZON MODULE...]
    </div>
  );
}

export const router = createHashRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'list',
        element: <ListPage />,
      },
      {
        path: 'add',
        element: <AddEditPage />,
      },
      {
        path: 'edit/:id',
        element: <AddEditPage />,
      },
      {
        path: 'item/:id',
        element: <ItemDetailPage />,
      },
      {
        path: 'completed',
        element: <CompletedPage />,
      },
      {
        path: 'categories',
        element: <CategoriesPage />,
      },
      {
        path: 'explore',
        element: (
          <Suspense fallback={<PageLoading />}>
            <ExplorePage />
          </Suspense>
        ),
      },
      {
        path: 'stats',
        element: (
          <Suspense fallback={<PageLoading />}>
            <StatsPage />
          </Suspense>
        ),
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
