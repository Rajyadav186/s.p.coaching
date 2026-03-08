// ── Results.jsx ──────────────────────────────────────────
// Achievement stats + recent toppers with student photos
import styles from './Results.module.css'

const STATS = [
  { num: '98%', label: 'BOARD PASS RATE',   desc: 'Consistent CBSE & GSEB pass rate over 5 years'      },
  { num: '50+', label: 'NEET SELECTIONS',   desc: 'Students admitted to MBBS programs across Silvassa'   },
  { num: '30+', label: 'JEE QUALIFIERS',    desc: 'Students who qualified JEE Main & Advanced recently' },
]

// Replace /gallery/ images with actual individual topper photos
const TOPPERS = [
  { img:'', name:'Riya Agarwal', score:'98.6%',    exam:'CBSE 12th',     tag:'SCIENCE STREAM', badge:'🏆' },
  { img:'', name:'Karan Patel',  score:'720/720',  exam:'NEET UG 2024',  tag:'NEET',           badge:'🩺' },
  { img:'', name:'Arjun Sharma', score:'715/720',  exam:'NEET UG 2024',  tag:'NEET',           badge:'🩺' },
  { img:'', name:'Meera Shah',   score:'99.2%ile', exam:'JEE Main 2024', tag:'JEE MAIN',       badge:'⚙️' },
]

export default function Results() {
  return (
    <section id="results" className={styles.section}>
      <div className="container">
        <span className="section-tag reveal">ACHIEVEMENT</span>
        <h2 className="reveal">Our <span className="accent">Results</span></h2>
        <p className="section-intro reveal">Years of dedication reflected in outstanding outcomes across every examination.</p>

        <div className={styles.statsGrid}>
          {STATS.map((s,i)=>(
            <div key={s.label} className={`${styles.stat} reveal stagger-${i+1}`}>
              <span className={styles.num}>{s.num}</span>
              <strong>{s.label}</strong><p>{s.desc}</p>
            </div>
          ))}
        </div>

        <h3 className={`${styles.toppersHeading} reveal`}>Recent <span className="accent">Toppers</span></h3>
        <div className={styles.toppers}>
          {TOPPERS.map((t,i)=>(
            <div key={t.name} className={`${styles.topper} reveal stagger-${i+1}`}>
              <div className={styles.imgWrap}>
                <img src={t.img} alt={t.name} className={styles.topperImg} />
                <span className={styles.badgeIcon}>{t.badge}</span>
              </div>
              <div className={styles.topperInfo}>
                <strong>{t.name}</strong>
                <span className={styles.score}>{t.score}</span>
                <span className={styles.exam}>{t.exam}</span>
                <span className={styles.tagPill}>{t.tag}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
