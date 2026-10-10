// ── Navbar.jsx ───────────────────────────────────────────
// Fixed top navigation with logo, nav links, and blog guides
import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import styles from './Navbar.module.css'

const LINKS = [
  { label: 'About',    hash: '#about'    },
  { label: 'Courses',  hash: '#courses'  },
  { label: 'Why Us',   hash: '#why-us'   },
  { label: 'Gallery',  hash: '#gallery'  },
  { label: 'Students', hash: '#students' },
  { label: 'FAQ',      hash: '#faq'      },
  { label: 'Blogs & Guides', to: '/blog' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const isHome = location.pathname === '/'

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  // Close menu on link click
  const handleLinkClick = () => setMenuOpen(false)

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.inner}>

        {/* Logo */}
        <Link to="/" className={styles.logo} onClick={handleLinkClick}>
          <img
            src="/logo.png"
            alt="S.P. Coaching Classes logo"
            className={styles.logoImg}
            width={42}
            height={42}
            onError={(e) => { e.target.src = '/logo.png' }}
          />
          <div className={styles.logoText}>
            <span className={styles.logoName}>S.P. Coaching Classes</span>
            <span className={styles.logoSub}>Silvassa, D&amp;NH</span>
          </div>
        </Link>

        {/* Hamburger for mobile */}
        <button
          className={`${styles.hamburger} ${menuOpen ? styles.hamburgerOpen : ''}`}
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          <span /><span /><span />
        </button>

        {/* Links */}
        <div className={`${styles.links} ${menuOpen ? styles.linksOpen : ''}`}>
          {LINKS.map(l => {
            if (l.to) {
              return (
                <Link
                  key={l.label}
                  to={l.to}
                  className={styles.link}
                  onClick={handleLinkClick}
                >
                  {l.label}
                </Link>
              )
            }
            const href = isHome ? l.hash : `/${l.hash}`
            return (
              <a
                key={l.label}
                href={href}
                className={styles.link}
                onClick={handleLinkClick}
              >
                {l.label}
              </a>
            )
          })}
          <a
            href={isHome ? '#contact' : '/#contact'}
            className={styles.btnEnroll}
            onClick={handleLinkClick}
          >
            Enroll Now
          </a>
        </div>

      </div>
    </nav>
  )
}
