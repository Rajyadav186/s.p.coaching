// ── Testimonials.jsx ─────────────────────────────────────
// Student & parent reviews
import styles from './Testimonials.module.css'

const ITEMS = [
  { av: '👨‍🦱', name: 'Vihaan Trivedi', info: 'NEET 2023 — 680/720',       text: 'The teachers are incredibly dedicated. They explained difficult NEET concepts in the simplest way. I scored 680 in my first attempt — impossible without their guidance.' },
  { av: '👩‍🦰', name: 'Priya Desai',   info: 'CBSE Class 10 — 96.8%',     text: 'The structured approach, weekly tests, and personal attention helped me score 96.8% in boards. I highly recommend S.P. Coaching to every student wanting top results!' },
  { av: '👩‍💼', name: 'Meera Shah',    info: 'JEE Main — 99.2 Percentile', text: "The JEE preparation here is top-notch. The faculty's problem-solving approach and rigorous mock tests prepared me thoroughly for the exam." },
  { av: '👩',   name: 'Sunita Mehta',  info: 'Parent of Class 8 Student',  text: 'My son always struggled with Maths. After joining the Foundation course, his conceptual clarity improved dramatically. Great faculty and caring environment.' },
]

export default function Testimonials() {
  return (
    <section id="students" className={styles.section}>
      <div className="container">
        <span className="section-tag reveal">STUDENT VOICES</span>
        <h2 className="reveal">What Our <span className="accent">Students</span> Say</h2>
        <p className="section-intro reveal">Real feedback from students and parents who trusted S.P. Coaching Classes.</p>

        <div className={styles.grid}>
          {ITEMS.map((t, i) => (
            <div key={t.name} className={`${styles.card} reveal stagger-${i + 1}`}>
              <div className={styles.header}>
                <div className={styles.avatar}>{t.av}</div>
                <div>
                  <strong>{t.name}</strong>
                  <p className={styles.info}>{t.info}</p>
                  <div className={styles.stars}>★★★★★</div>
                </div>
              </div>
              <span className={styles.quote}>"</span>
              <p className={styles.text}>{t.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
