// ── Topbar.jsx ───────────────────────────────────────────
// Scroll-progress bar pinned at the very top of the page
import { useState, useEffect } from 'react'
import styles from './Topbar.module.css'

export default function Topbar() {
  const [pct, setPct] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const max = document.body.scrollHeight - window.innerHeight
      setPct(max > 0 ? (window.scrollY / max) * 100 : 0)
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return <div className={styles.bar} style={{ width: pct + '%' }} />
}
