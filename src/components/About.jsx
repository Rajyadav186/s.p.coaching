// ── About.jsx ────────────────────────────────────────────
// Who we are section with info card and mission/vision
import styles from './About.module.css'

const BULLETS = [
  '7-year legacy of top results in CBSE, GSEB, NEET & JEE.',
  'Highly qualified faculty with deep subject mastery and exam-focused teaching.',
  'Small batch sizes (max 20 students) ensuring individual attention for every student.',
  'Regular parent-teacher interactions and monthly progress reports.',
  'Doubt-clearing sessions available 6 days a week for all enrolled students.',
  'In-house study materials and test series developed by our expert educators.',
]

export default function About() {
  return (
    <section id="about" className={styles.section}>
      <div className="container two-col">

        {/* Left */}
        <div className="reveal-left">
          <span className="section-tag">WHO WE ARE</span>
          <h2>About <span className="accent">S.P. Coaching</span></h2>
          <p className="section-intro">
            S.P. Coaching Classes has been a cornerstone of academic excellence in Silvassa for over
            7 years. We bridge the gap between school learning and competitive exam success through
            expert, personalized coaching.
          </p>
          <ul className={styles.list}>
            {BULLETS.map((b, i) => (
              <li key={i} className={`reveal stagger-${i + 1}`}>{b}</li>
            ))}
          </ul>
          <div className={styles.mvGrid}>
            <div className={`${styles.mvCard} reveal stagger-1`}>
              <h4 className="accent">Our Mission</h4>
              <p>To nurture every student's potential through personalized education that instills confidence and a genuine love for learning.</p>
            </div>
            <div className={`${styles.mvCard} reveal stagger-2`}>
              <h4 className="accent">Our Vision</h4>
              <p>To be Silvassa's most trusted coaching institute — producing students who excel not just in exams but in every aspect of life.</p>
            </div>
          </div>
        </div>

        {/* Right – dark card */}
        <div className="reveal-right">
          <div className="dark-card">
            <div className="ganesh-text">॥ श्री गणेशाय नमः ॥</div>
            <div className="divider" />
            <div className="info-row"><span>📞</span><span>+91 98240 06191 · 84690 05286</span></div>
            <div className="info-row"><span>✉</span><span>spcoachingc@gmail.com</span></div>
            <div className="info-row"><span>📍</span><span>S.P. Coaching Classes, Silvassa, Dadra And Nagar Haveli</span></div>
            <div className="info-row"><span>🕐</span><span>Mon – Sat | 7:00 AM – 9:00 PM</span></div>
            <div className="info-subjects">
              <div>CBSE · GSEB · NEET · JEE · Foundation</div>
              <div>Classes 5th to 12th · Expert Faculty · Proven Results</div>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
