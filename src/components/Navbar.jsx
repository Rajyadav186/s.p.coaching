// ── Navbar.jsx ───────────────────────────────────────────
// Fixed top navigation with logo and nav links
import { useState, useEffect } from 'react'
import styles from './Navbar.module.css'

const LINKS = [
  { label: 'About',    href: '#about'    },
  { label: 'Courses',  href: '#courses'  },
  { label: 'Why Us',   href: '#why-us'   },
  // { label: 'Timings',  href: '#timings'  },
  // { label: 'Results',  href: '#results'  },
  { label: 'Gallery',  href: '#gallery'  },
  { label: 'Students', href: '#students' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.inner}>

        {/* Logo */}
        <a href="#home" className={styles.logo}>
          <div className={styles.logoCircle}>SP</div>
          <div className={styles.logoText}>
            <span className={styles.logoName}>S.P. Coaching Classes</span>
            <span className={styles.logoSub}>Silvassa, D&NH</span>
          </div>
        </a>

        {/* Links */}
        <div className={styles.links}>
          {LINKS.map(l => (
            <a key={l.label} href={l.href} className={styles.link}>{l.label}</a>
          ))}
          <a href="#contact" className={styles.btnEnroll}>Enroll Now</a>
        </div>

      </div>
    </nav>
  )
}
