'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import Link from 'next/link';
import Image from 'next/image';
import styles from './contact.module.css';
import logoGold from '@/public/logo-gold.svg';

export default function ContactPage() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          access_key: 'd9807d09-a4af-45c3-9058-074c7102c45c',
          name: formData.name,
          email: formData.email,
          subject: formData.subject || 'New message from Mi-KAI Tokyo Contact Form',
          message: formData.message,
        }),
      });

      const result = await res.json();

      if (result.success) {
        setStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => setStatus('idle'), 5000);
      } else {
        console.error('Web3Forms Error:', result);
        setStatus('error');
      }
    } catch (err) {
      console.error('Fetch Error:', err);
      setStatus('error');
    }
  };

  return (
    <div className={styles.contactPage}>
      {/* Background decorative elements */}
      <div className={styles.bgGlow} />
      <div className={styles.bgKanji}>連</div>

      {/* Back to Home */}
      <Link href="/" className={styles.backLink}>
        ← {t('nav.home')}
      </Link>

      <div className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <Image
            src={logoGold}
            alt="Mi-KAI Tokyo"
            width={180}
            height={60}
            className={styles.logo}
          />
          <h1 className={styles.title}>{t('contact.title')}</h1>
          <p className={styles.tagline}>{t('contact.tagline')}</p>
          <div className={styles.divider} />
        </header>

        <div className={styles.content}>
          {/* Contact Form */}
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <input
                type="text"
                id="contact-name"
                className={styles.input}
                placeholder={t('contact.namePlaceholder')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <div className={styles.inputLine} />
            </div>

            <div className={styles.formGroup}>
              <input
                type="email"
                id="contact-email"
                className={styles.input}
                placeholder={t('contact.emailPlaceholder')}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <div className={styles.inputLine} />
            </div>

            <div className={styles.formGroup}>
              <input
                type="text"
                id="contact-subject"
                className={styles.input}
                placeholder={t('contact.subjectPlaceholder')}
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
              <div className={styles.inputLine} />
            </div>

            <div className={styles.formGroup}>
              <textarea
                id="contact-message"
                className={styles.textarea}
                placeholder={t('contact.messagePlaceholder')}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={6}
                required
              />
              <div className={styles.inputLine} />
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={status === 'sending'}
            >
              {status === 'sending' ? '...' : t('contact.send')}
            </button>

            {status === 'success' && (
              <p className={styles.successMsg}>{t('contact.success')}</p>
            )}

            {status === 'error' && (
              <p className={styles.errorMsg}>{t('contact.error')}</p>
            )}
          </form>

          {/* HQ Info */}
          <div className={styles.hqInfo}>
            <h2 className={styles.hqTitle}>{t('contact.hq')}</h2>
            <div className={styles.hqDivider} />
            <div className={styles.hqDetail}>
              <span className={styles.hqLabel}>Address</span>
              <p>MiKai Innovations Vast</p>
              <p>Navi Mumbai — 400701</p>
              <p>Maharashtra, India</p>
            </div>
            <div className={styles.hqDetail}>
              <span className={styles.hqLabel}>Web</span>
              <p>www.mikaitokyo.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
