// ── Method.jsx ───────────────────────────────────────────
// Teaching methodology steps + tools we use card
import styles from './Method.module.css'

const STEPS = [
  { n: '01', title: 'Concept-First Learning',          desc: 'We ensure students understand the "why" before memorizing formulas. Deep conceptual clarity forms the foundation of all learning at S.P. Coaching.' },
  { n: '02', title: 'Structured Practice & Testing',   desc: 'Regular worksheets, practice problems, and periodic mock tests reinforce learning and help track progress consistently.' },
  { n: '03', title: 'Personalized Learning Plans',     desc: "Each student's strengths and weaknesses are assessed individually. Custom plans target gaps and accelerate improvement in weak areas." },
  { n: '04', title: 'Peer Learning & Group Discussions',desc: 'Collaborative problem-solving sessions encourage students to learn from each other, building both communication skills and academic confidence.' },
  { n: '05', title: 'Exam Strategy & Mental Wellness',  desc: 'Beyond academics, we coach students on time management, exam temperament, stress handling, and a healthy mindset during exam season.' },
]

const TOOLS = [
  'Whiteboard Teaching','Visual Aids','Digital Projectors','Online Test Series',
  'Video Revisions','3D Science Models','Formula Charts','Mind Maps',
  'Previous Year Papers','Study Planners','Flashcard Drills','Live Doubt Sessions',
]

export default function Method() {
  return (
    <section id="method" className={styles.section}>
      <div className="container two-col">

        {/* Left – numbered steps */}
        <div className="reveal-left">
          <span className="section-tag">OUR PEDAGOGY</span>
          <h2>Our Teaching <span className="accent">Method</span></h2>
          <p className="section-intro">A structured, student-first approach that builds understanding from the ground up.</p>
          <div className={styles.stepList}>
            {STEPS.map((s, i) => (
              <div key={s.n} className={`${styles.step} reveal stagger-${i + 1}`}>
                <span className={styles.stepNum}>{s.n}</span>
                <div>
                  <strong>{s.title}</strong>
                  <p>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right – tools card */}
        <div className="reveal-right">
          <div className="dark-card">
            <h3>Tools We Use</h3>
            <p className={styles.toolsIntro}>
              Our teaching combines traditional excellence with contemporary resources for
              maximum effectiveness and student engagement.
            </p>
            <div className={styles.toolsGrid}>
              {TOOLS.map(t => <span key={t} className={styles.toolTag}>{t}</span>)}
            </div>
            <blockquote className={styles.quote}>
              <p>"Education is not just about marks. It is about building curious, confident, and capable individuals who can face any challenge life presents."</p>
              <footer>— S.P. Coaching Classes</footer>
            </blockquote>
          </div>
        </div>

      </div>
    </section>
  )
}
