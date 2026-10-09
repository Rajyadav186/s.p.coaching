// ── Topbar.jsx ───────────────────────────────────────────
// Scroll-progress bar pinned at the very top of the page + Admin controllable Announcement Banner
import { useState, useEffect } from 'react'
import { getSiteSettings } from '../services/siteService'
import styles from './Topbar.module.css'

export default function Topbar() {
  const [pct, setPct] = useState(0)
  const [settings, setSettings] = useState(null)

  useEffect(() => {
    const onScroll = () => {
      const max = document.body.scrollHeight - window.innerHeight
      setPct(max > 0 ? (window.scrollY / max) * 100 : 0)
    }
    window.addEventListener('scroll', onScroll)

    async function loadSettings() {
      const data = await getSiteSettings()
      if (data) setSettings(data)
    }
    loadSettings()

    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <div className={styles.bar} style={{ width: pct + '%' }} />
      {settings && settings.announcementEnabled && settings.announcementText && (
        <aside className={styles.announcementBanner} aria-label="Announcement">
          {settings.announcementBadge && (
            <span className={styles.badge}>{settings.announcementBadge}</span>
          )}
          <a href={settings.announcementLink || '/#contact'} className={styles.bannerLink}>
            {settings.announcementText}
          </a>
        </aside>
      )}
    </>
  )
}
