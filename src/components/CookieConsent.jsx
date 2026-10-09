// ── CookieConsent.jsx ────────────────────────────────────
// Privacy-compliant cookie consent banner for GA4 & analytics
import { useState, useEffect } from 'react'
import styles from './CookieConsent.module.css'

const STORAGE_KEY = 'sp-cookie-consent'

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const consent = localStorage.getItem(STORAGE_KEY)
      if (!consent) {
        // Show after a brief delay so page loads first
        const t = setTimeout(() => setVisible(true), 1200)
        return () => clearTimeout(t)
      }
    } catch {}
  }, [])

  const handleAccept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'accepted')
      if (typeof window.__spInitGA === 'function') {
        window.__spInitGA()
      }
    } catch {}
    setVisible(false)
  }

  const handleDecline = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'declined')
    } catch {}
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className={styles.banner} role="dialog" aria-label="Cookie consent banner">
      <div className={styles.content}>
        <span className={styles.icon}>🍪</span>
        <div className={styles.text}>
          <p className={styles.title}>We value your privacy</p>
          <p className={styles.desc}>
            We use cookies to improve your browsing experience and analyze website traffic.
            Read our <a href="/privacy.html" target="_blank" rel="noopener noreferrer">Privacy Policy</a> to learn more.
          </p>
        </div>
      </div>
      <div className={styles.actions}>
        <button className={styles.btnDecline} onClick={handleDecline}>Decline</button>
        <button className={styles.btnAccept} onClick={handleAccept}>Accept Cookies</button>
      </div>
    </div>
  )
}
