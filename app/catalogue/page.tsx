'use client';

import styles from './page.module.css';
import products from '@/data/products.json';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/lib/LanguageContext';

export default function CataloguePage() {
  const { t } = useLanguage();

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className="text-heading text-4xl text-bright">{t('catalogue.title')}</h1>
        <p className="text-body text-muted text-lg mt-4 max-w-2xl mx-auto">
          {t('catalogue.desc')}
        </p>
      </header>
      
      <section className={styles.grid}>
        {products.map((product) => (
          <Link href={`/catalogue/${product.id}`} key={product.id} className={styles.card}>
            <article>
              <div className={styles.imageWrapper}>
                <Image
                  src={`/images/products/${product.id}-main.png`}
                  alt={`Product ${product.id}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  style={{ objectFit: 'contain', padding: '2rem' }}
                />
              </div>
              <div className={styles.content}>
                <span className={styles.category}>{t(`categories.${product.category}`)}</span>
                <h2 className={styles.title}>{t('catalogue.model')} #{product.id}</h2>
                <span className={styles.viewLink}>{t('catalogue.viewDetails')} &rarr;</span>
              </div>
            </article>
          </Link>
        ))}
      </section>
    </main>
  );
}
