import StudioClient from './StudioClient';
import styles from './page.module.css';

export const metadata = {
  title: 'Mi-KAI Light Studio',
  description: 'Design and visualize your lighting with Mi-KAI Tokyo.',
};

export default function StudioPage() {
  return (
    <main className={styles.main}>
      <StudioClient />
    </main>
  );
}
