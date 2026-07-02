import products from '@/data/products.json';
import Link from 'next/link';
import ProductClient from './ProductClient';
import styles from './page.module.css';

// Required for Next.js static export on dynamic routes
export function generateStaticParams() {
  return products.map((product) => ({
    id: product.id,
  }));
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const product = products.find((p) => p.id === resolvedParams.id);

  if (!product) {
    return (
      <div className={styles.notFound}>
        <h1>Product Not Found</h1>
        <Link href="/catalogue" className={styles.backLink}>Return to Catalogue</Link>
      </div>
    );
  }

  return <ProductClient product={product} />;
}
