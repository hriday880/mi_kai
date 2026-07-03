'use client';

import { useState } from 'react';
import productsData from '../../data/products.json';
import styles from '../../app/studio/page.module.css';
import Image from 'next/image';

interface ProductPickerProps {
  onSelect: (productId: string) => void;
  selectedId: string | null;
}

export default function ProductPicker({ onSelect, selectedId }: ProductPickerProps) {
  const [search, setSearch] = useState('');
  
  const filteredProducts = productsData.filter(p => 
    p.category.toLowerCase().includes(search.toLowerCase()) || 
    p.id.includes(search)
  );

  return (
    <div className={styles.section}>
      <h2>Catalogue</h2>
      <div className={styles.inputGroup} style={{ marginBottom: '1rem' }}>
        <input 
          type="text" 
          placeholder="Search products..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className={styles.productList}>
        {filteredProducts.map(product => (
          <div 
            key={product.id}
            className={`${styles.productCard} ${selectedId === product.id ? styles.selected : ''}`}
            onClick={() => onSelect(product.id)}
          >
            <div className={styles.productHeader}>
              <div className={styles.productImage}>
                <Image 
                  src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/images/products/${product.id}-main.png`}
                  alt={`Product ${product.id}`}
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>
              <div className={styles.productInfo}>
                <h3>Product {product.id}</h3>
                <p>{product.category}</p>
                {product.specifications && product.specifications.length > 0 && (
                  <p>{product.specifications[0].wattage} | {product.specifications[0].beamAngle}°</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
