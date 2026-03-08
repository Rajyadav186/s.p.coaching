// ── Courses.jsx ──────────────────────────────────────────
// 4 course cards: CBSE, GSEB, JEE, Foundation
import styles from './Courses.module.css'

const COURSES = [
  { icon: '📚', name: 'CBSE Coaching',    tag: 'CLASSES 5–12',           desc: 'In-depth coaching following the CBSE curriculum covering all core subjects with board exam–focused preparation, concept building, and regular mock tests.',                                     sched: 'Year-round',       subj: 'Maths, Science, English' },
  { icon: '🎓', name: 'GSEB Coaching',    tag: 'CLASSES 5–12',           desc: 'Specialized coaching for Gujarat State Education Board in Gujarati & English medium, with proven board exam strategies and past paper analysis.',                                                  sched: 'Year-round',       subj: 'All GSEB Subjects'      },
  { icon: '⚙️', name: 'JEE Preparation',  tag: 'CLASS 11–12 + DROPPERS', desc: 'Comprehensive JEE Main & Advanced coaching with deep problem-solving techniques, concept mastery, and intensive mock test series.',                                                              sched: '2-Yr / 1-Yr / Crash', subj: 'PCM Focused'         },
  { icon: '🩺', name: 'NEET Preparation',  tag: 'CLASS 11–12 + DROPPERS', desc: 'Comprehensive NEET UG coaching with Concept clarity, speed-building, and personalized doubt-clearing sessions.',                                                              sched: '2-Yr / 1-Yr / Crash', subj: 'PCM Focused'         },
  { icon: '🌱', name: 'Foundation Course', tag: 'CLASSES 5–10',           desc: 'Early foundation building for future competitive aspirants. Develops conceptual clarity, mathematical aptitude, and scientific reasoning from a young age.',                                       sched: 'Year-round',       subj: 'Maths & Science'        },
]

export default function Courses() {
  return (
    <section id="courses" className={styles.section}>
      <div className="container">
        <span className="section-tag reveal">WHAT WE TEACH</span>
        <h2 className="reveal">Courses We <span className="accent">Offer</span></h2>
        <p className="section-intro reveal">Comprehensive programs from foundational learning to competitive exam mastery.</p>

        <div className={styles.grid}>
          {COURSES.map((c, i) => (
            <div key={c.name} className={`${styles.card} reveal stagger-${i + 1}`}>
              <div className={styles.icon}>{c.icon}</div>
              <h3 className={styles.name}>{c.name}</h3>
              <span className={styles.tag}>{c.tag}</span>
              <p className={styles.desc}>{c.desc}</p>
              <div className={styles.divider} />
              <div className={styles.meta}>
                <span>🗓 {c.sched}</span>
                <span>📖 {c.subj}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
