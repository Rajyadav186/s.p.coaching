// ── Footer.jsx ───────────────────────────────────────────
// Dark footer with logo, nav links, SEO keyword directory, and admin login
import { Link } from 'react-router-dom'
import styles from './Footer.module.css'

const NAV = [
  ['ABOUT',    '/#about'],    ['COURSES',  '/#courses'],
  ['WHY US',   '/#why-us'],   ['METHOD',   '/#method'],
  ['GALLERY',  '/#gallery' ],
  ['STUDENTS', '/#students'], ['FAQ', '/#faq'],
  ['CONTACT',  '/#contact'],
]

const SEO_HUBS = [
  { label: 'Best Coaching in Silvassa', url: '/coaching-centers-silvassa' },
  { label: 'Tuition Classes Silvassa', url: '/tuition-classes-silvassa' },
  { label: 'Tuition in Tokarkhada', url: '/tuition-tokarkhada' },
  { label: 'Tuition in Rakholi', url: '/tuition-rakholi' },
  { label: 'Tuition in Masat', url: '/tuition-masat' },
  { label: 'Tuition Near Me', url: '/tuition-near-me' },
  { label: 'Commerce Coaching Silvassa', url: '/commerce-coaching-silvassa' },
  { label: 'Physics Teacher Silvassa', url: '/physics-teacher-silvassa' },
  { label: 'Home Tuitions Silvassa', url: '/home-tuitions-silvassa' },
]

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.logoWrap}>
          <img
            src="/logo.png"
            alt="S.P. Coaching Classes logo"
            className={styles.logoImg}
            width={48}
            height={48}
            onError={(e) => { e.target.src = '/logo.png' }}
          />
          <div className={styles.logo}>S.P. Coaching Classes</div>
        </div>
        <p className={styles.sub}>॥ श्री गणेशाय नमः ॥ — Excellence in Education • Silvassa (D&amp;NH)</p>

        {/* Main Section Nav */}
        <nav className={styles.nav} aria-label="Footer Main Navigation">
          {NAV.map(([label, href]) => (
            <a key={label} href={href}>{label}</a>
          ))}
          <Link to="/blog">BLOGS &amp; GUIDES</Link>
        </nav>

        {/* Local Area & SEO Keyword Hubs Directory */}
        <div style={{ margin: '24px 0', padding: '16px 0', borderTop: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '11px', color: '#f5a623', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>
            LOCALITY COACHING &amp; TUITION DIRECTORY (DADRA &amp; NAGAR HAVELI)
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px 16px' }}>
            {SEO_HUBS.map((hub) => (
              <Link
                key={hub.url}
                to={hub.url}
                style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={(e) => e.target.style.color = '#f5a623'}
                onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.6)'}
              >
                • {hub.label}
              </Link>
            ))}
            <Link
              to="/blog"
              style={{ fontSize: '12px', color: '#f5a623', fontWeight: 600, textDecoration: 'none' }}
            >
              • View All 14 Academic Guides →
            </Link>
          </div>
        </div>

        {/* Footer Meta & Admin Access */}
        <div className={styles.footerLinks} style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <a href="/privacy.html" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
          <Link to="/admin" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', textDecoration: 'none' }}>
            🔒 Staff / Admin Portal
          </Link>
        </div>

        <p className={styles.copy}>© 2026 S.P. Coaching Classes, Silvassa, Dadra And Nagar Haveli. All rights reserved.</p>
      </div>
    </footer>
  )
}
