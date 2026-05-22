import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes';
import { Layout } from './layouts/Layout';
import { ThemeProvider } from './contexts/ThemeProvider';

export function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <Layout>
          <AppRoutes />
        </Layout>
      </ThemeProvider>
    </BrowserRouter>
  );
}
