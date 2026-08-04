/** Left navigation sidebar with brand and primary module links. */
import { useEffect, useRef, useState } from 'react';
import { Cart } from '../../icons';
import styles from './Sidebar.module.css';

const NAV = [
  { id: 'ventas', label: 'Ventas', icon: Cart, active: true },
];

export const Sidebar = () => {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    if (!profileOpen) return undefined;

    const onPointerDown = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [profileOpen]);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.brandMark}>C</div>
        <div>
          <p className={styles.brandName}>Colppy</p>
          <p className={styles.brandSub}>Business Case</p>
        </div>
      </div>

      <div className={styles.section}>
        <p className={styles.sectionLabel}>Principal</p>
        <nav className={styles.nav}>
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <span
                key={item.id}
                className={`${styles.link} ${item.active ? styles.linkActive : ''}`}
              >
                <Icon width={18} height={18} />
                {item.label}
              </span>
            );
          })}
        </nav>
      </div>

      <div
        ref={profileRef}
        className={`${styles.profile} ${profileOpen ? styles.profileOpen : ''}`}
      >
        <button
          type="button"
          className={styles.avatarBtn}
          aria-expanded={profileOpen}
          aria-haspopup="true"
          aria-label="Perfil de usuario"
          onClick={() => {
            if (window.matchMedia('(max-width: 425px)').matches) {
              setProfileOpen((open) => !open);
            }
          }}
        >
          <span className={styles.avatar}>JL</span>
        </button>
        <div className={styles.profileInfo}>
          <p className={styles.profileName}>Jorge Levy</p>
          <p className={styles.profileRole}>Dueño · Plan Pro</p>
        </div>
      </div>
    </aside>
  );
};
