// ── Timings.jsx ──────────────────────────────────────────
// Class schedule table
import styles from './Timings.module.css'

const ROWS = [
  ['Foundation (5th–8th)',        'Batch A',    'Mon – Sat', '7:00 AM – 8:30 AM',  '1.5 hrs/day', 'Morning', '#e07a20'],
  ['Foundation (5th–8th)',        'Batch B',    'Mon – Sat', '5:00 PM – 6:30 PM',  '1.5 hrs/day', 'Evening', '#7b5cf0'],
  ['CBSE / GSEB (9th–10th)',      'Batch A',    'Mon – Sat', '6:30 AM – 8:00 AM',  '1.5 hrs/day', 'Morning', '#e07a20'],
  ['CBSE / GSEB (9th–10th)',      'Batch B',    'Mon – Sat', '6:30 PM – 8:00 PM',  '1.5 hrs/day', 'Evening', '#7b5cf0'],
  ['CBSE / GSEB (11th–12th)',     'Batch A',    'Mon – Sat', '7:00 AM – 9:00 AM',  '2 hrs/day',   'Morning', '#e07a20'],
  ['CBSE / GSEB (11th–12th)',     'Batch B',    'Mon – Sat', '5:00 PM – 7:00 PM',  '2 hrs/day',   'Evening', '#7b5cf0'],
  ['NEET / JEE Preparation',      'Regular',    'Mon – Sat', '8:00 AM – 11:00 AM', '3 hrs/day',   'Morning', '#e07a20'],
  ['NEET / JEE Preparation',      'Regular',    'Mon – Sat', '4:00 PM – 7:00 PM',  '3 hrs/day',   'Evening', '#7b5cf0'],
  ['Doubt Clearing Sessions',     'All Batches','Mon – Sat', '8:00 PM – 9:00 PM',  '1 hr',        'Evening', '#7b5cf0'],
  ['Crash Courses / Test Series', '—',          'Sat & Sun', '9:00 AM – 1:00 PM',  '4 hrs',       'Weekend','#2a9d5c'],
]

export default function Timings() {
  return (
    <section id="timings" className={styles.section}>
      <div className="container">
        <span className="section-tag reveal">SCHEDULE</span>
        <h2 className="reveal">Class <span className="accent">Timings</span></h2>
        <p className="section-intro reveal">Flexible batch timings designed around school schedules and personal commitments.</p>

        <div className={`${styles.tableWrap} reveal`}>
          <table className={styles.table}>
            <thead>
              <tr>
                {['COURSE','BATCH','DAYS','TIMING','DURATION','TYPE'].map(h => <th key={h}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r, i) => (
                <tr key={i}>
                  <td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td><td>{r[4]}</td>
                  <td><span className={styles.badge} style={{ color: r[6] }}>🗓 {r[5]}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={`${styles.note} reveal`}>* Timings may vary. Please contact us to confirm current batch availability.</p>
      </div>
    </section>
  )
}
