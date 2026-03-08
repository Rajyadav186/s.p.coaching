// ── Hero.jsx ─────────────────────────────────────────────
// Full-screen hero with particle canvas, floating shapes, stats
import { useEffect, useRef } from 'react'
import styles from './Hero.module.css'

/* Particle network canvas */
function ParticleCanvas() {
  const ref = useRef(null)
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext('2d')
    let W, H, particles = [], raf
    const resize = () => { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight }
    resize(); window.addEventListener('resize', resize)
    class P {
      constructor() {
        this.reset()
      }
      reset() {
        this.x = Math.random()*W; this.y = Math.random()*H
        this.r = Math.random()*3+1; this.vx = (Math.random()-.5)*.4; this.vy = (Math.random()-.5)*.4
        this.alpha = Math.random()*.4+.1; this.da = (Math.random()-.5)*.005
      }
      update() {
        this.x+=this.vx; this.y+=this.vy; this.alpha+=this.da
        if(this.alpha<.05||this.alpha>.5) this.da*=-1
        if(this.x<0)this.x=W; if(this.x>W)this.x=0
        if(this.y<0)this.y=H; if(this.y>H)this.y=0
      }
    }
    for(let i=0;i<80;i++) particles.push(new P())
    const draw = () => {
      ctx.clearRect(0,0,W,H)
      for(let i=0;i<particles.length;i++){
        const p=particles[i]; p.update()
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2)
        ctx.fillStyle=`rgba(255,200,140,${p.alpha})`; ctx.fill()
        for(let j=i+1;j<particles.length;j++){
          const q=particles[j], dx=p.x-q.x, dy=p.y-q.y, d=Math.sqrt(dx*dx+dy*dy)
          if(d<100){
            ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y)
            ctx.strokeStyle=`rgba(255,200,140,${(1-d/100)*.08})`; ctx.lineWidth=1; ctx.stroke()
          }
        }
      }
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(raf) }
  }, [])
  return <canvas ref={ref} className={styles.canvas} />
}

const STATS = [
  { target: 15,   suffix: '+', label: 'YEARS EXPERIENCE'   },
  { target: 2000, suffix: '+', label: 'STUDENTS TAUGHT'     },
  { target: 98,   suffix: '%', label: 'BOARD SUCCESS RATE'  },
  { target: 50,   suffix: '+', label: 'NEET/JEE SELECTIONS' },
]

export default function Hero() {
  return (
    <section id="home" className={styles.hero}>
      <ParticleCanvas />

      {/* Colour orbs */}
      <div className={`${styles.orb} ${styles.orb1}`} />
      <div className={`${styles.orb} ${styles.orb2}`} />
      <div className={`${styles.orb} ${styles.orb3}`} />

      {/* Decorative floating rings */}
      <div className={`${styles.shape} ${styles.shape1}`} />
      <div className={`${styles.shape} ${styles.shape2}`} />
      <div className={`${styles.shape} ${styles.shape3}`} />
      <div className={`${styles.shape} ${styles.shape4}`} />

      <div className={styles.inner}>
        {/* Left column */}
        <div className={styles.left}>
          <h1 className={styles.title}>S.P. Coaching<br />Classes</h1>
          <p className={styles.sub}>5TH TO 12TH · Silvassa, D&NH</p>
          <div className={styles.tags}>
            {['CBSE','GSEB','NEET','JEE','Foundation'].map(t => (
              <span key={t} className={styles.tag}>{t}</span>
            ))}
          </div>
          <p className={styles.desc}>
            Expert coaching that builds conceptual clarity, exam confidence, and a love for learning —
            from foundation years to competitive exam success.
          </p>
          <div className={styles.btns}>
            <a href="#contact" className={styles.btnPrimary}>Enroll Now →</a>
            <a href="#courses" className={styles.btnOutline}>View Courses</a>
          </div>
        </div>

        {/* Right column */}
        <div className={styles.right}>
          <div className={styles.statsGrid}>
            {STATS.map(s => (
              <div key={s.label} className={styles.statCard}>
                <span className={`${styles.statNum} count-up`} data-target={s.target} data-suffix={s.suffix}>
                  {s.target}{s.suffix}
                </span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </div>
          <div className={styles.contactCard}>
            <div className={styles.contactRow}>📞 +91 98240 06191 · 84690 05286</div>
            <div className={styles.contactRow}>✉ spcoachingc@gmail.com</div>
          </div>
        </div>
      </div>
    </section>
  )
}
