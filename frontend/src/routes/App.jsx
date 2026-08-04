/**
 * Root application component: layout shell wrapping the sales list screen.
 */
import { Layout } from '../components';
import { SalesList } from '../modules/sales';

/** @returns {JSX.Element} Full app UI (sidebar + sales module). */
export const App = () => {
  return (
    <Layout>
      <SalesList />
    </Layout>
  );
};
