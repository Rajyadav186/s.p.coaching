// ── Footer.jsx ───────────────────────────────────────────
// Dark footer with logo, nav links and copyright
import styles from './Footer.module.css'

const NAV = [
  ['ABOUT',    '#about'],    ['COURSES',  '#courses'],
  ['WHY US',   '#why-us'],   ['METHOD',   '#method'],
  // ['TIMINGS',  '#timings'],  ['RESULTS',  '#results'],
  ['GALLERY',  '#gallery' ],
  ['STUDENTS', '#students'], ['CONTACT',  '#contact'],
]

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.logo}>S.P. Coaching Classes</div>
        <p className={styles.sub}>॥ श्री गणेशाय नमः ॥ — Excellence in Education Since 2009</p>
        <nav className={styles.nav}>
          {NAV.map(([label, href]) => (
            <a key={label} href={href}>{label}</a>
          ))}
        </nav>
        <p className={styles.copy}>© 2025 S.P. Coaching Classes, Silvassa, Dadra And Nagar Haveli. All rights reserved.</p>
      </div>
    </footer>
  )
}
