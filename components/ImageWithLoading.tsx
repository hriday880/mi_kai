'use client';
import { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import styles from './ImageWithLoading.module.css';

export default function ImageWithLoading(props: ImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={styles.wrapper}>
      {!isLoaded && (
        <div className={styles.skeleton}>
          <div className={styles.spinner}></div>
        </div>
      )}
      <Image 
        {...props} 
        onLoad={(e) => {
          setIsLoaded(true);
          if (props.onLoad) props.onLoad(e);
        }}
        className={`${props.className || ''} ${isLoaded ? styles.loaded : styles.loading}`}
      />
    </div>
  );
}
