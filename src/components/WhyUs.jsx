// ── WhyUs.jsx ────────────────────────────────────────────
// Why choose us – 6 feature cards on a dark brown background
import { useEffect, useRef } from 'react'
import styles from './WhyUs.module.css'

/* Animated geometric rings canvas */
function RingCanvas() {
  const ref = useRef(null)
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext('2d')
    let W, H, angle = 0, raf
    const resize = () => { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight }
    resize(); window.addEventListener('resize', resize)
    const draw = () => {
      ctx.clearRect(0, 0, W, H); angle += .003
      for (let i = 0; i < 5; i++) {
        ctx.save(); ctx.translate(W * .75, H * .3)
        ctx.rotate(angle * (i % 2 === 0 ? 1 : -1) * (i + 1) * .3)
        ctx.beginPath()
        for (let d = 0; d < 360; d += 30) {
          const r = 80 + i * 60, rad = d * Math.PI / 180
          const px = Math.cos(rad) * r, py = Math.sin(rad) * r
          d === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
        }
        ctx.closePath()
        ctx.strokeStyle = `rgba(255,180,80,${.04 + i * .01})`; ctx.lineWidth = 1; ctx.stroke(); ctx.restore()
      }
      for (let i = 0; i < 20; i++) {
        const x = Math.sin(angle * (.5 + i * .1) + i) * W * .4 + W * .5
        const y = Math.cos(angle * (.3 + i * .15) + i) * H * .3 + H * .5
        const a = Math.abs(Math.sin(angle * 2 + i)) * .2
        ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,200,100,${a})`; ctx.fill()
      }
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(raf) }
  }, [])
  return <canvas ref={ref} className={styles.canvas} />
}

const CARDS = [
  { icon: '👩‍🏫', title: 'Expert Faculty',       desc: 'Highly qualified teachers with 10+ years in board and competitive exam coaching.' },
  { icon: '🎯',   title: 'Result-Oriented',      desc: 'Proven track record of top board results and NEET/JEE selections every single year.' },
  { icon: '🤝',   title: 'Personal Attention',   desc: 'Small batches (max 20) ensure every student gets individual guidance and support.' },
  { icon: '📖',   title: 'Rich Study Materials', desc: 'Comprehensive in-house notes, practice papers, and test series for all courses.' },
  { icon: '🔄',   title: 'Doubt Sessions',       desc: 'Dedicated doubt-clearing 6 days a week — no student leaves with unanswered questions.' },
  { icon: '👨‍👩‍👧', title: 'Parent Connect',       desc: 'Regular PTMs and monthly progress reports keep families fully informed and involved.' },
]

export default function WhyUs() {
  return (
    <section id="why-us" className={styles.section}>
      <div className={styles.bg} />
      <RingCanvas />
      <div className="container">
        <span className="section-tag light reveal">OUR ADVANTAGE</span>
        <h2 className={`${styles.heading} reveal`}>Why Choose <span className={styles.accent}>Us?</span></h2>
        <p className={`${styles.intro} reveal`}>We don't just teach — we transform students into confident, capable achievers.</p>

        <div className={styles.grid}>
          {CARDS.map((c, i) => (
            <div key={c.title} className={`${styles.card} reveal stagger-${i + 1}`}>
              <span className={styles.icon}>{c.icon}</span>
              <h4 className={styles.title}>{c.title}</h4>
              <p className={styles.desc}>{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
