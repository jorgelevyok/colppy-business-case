/**
 * App shell: fixed sidebar and scrollable main content area.
 * @param {object} props
 * @param {React.ReactNode} props.children - Page content (e.g. SalesList).
 */
import { Sidebar } from './Sidebar';
import styles from './Layout.module.css';

export const Layout = ({ children }) => {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <section className={styles.screen}>
        <div className={`special-scroll ${styles.body}`}>{children}</div>
      </section>
    </div>
  );
};
