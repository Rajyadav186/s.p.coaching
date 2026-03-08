// ── Gallery.jsx ──────────────────────────────────────────
// Coaching photo gallery with lightbox
import { useState } from 'react'
import styles from './Gallery.module.css'

const PHOTOS = [
  { src: '/gallery/classroom.jpg',    caption: 'Our Smart Classroom',             tag: 'Infrastructure' },
  { src: '/gallery/teachersday1.jpg', caption: "Teachers' Day Celebration",       tag: 'Events'         },
  { src: '/gallery/teachersday2.jpg', caption: "Teacher's Day – Gift Ceremony",   tag: 'Events'         },
  { src: '/gallery/farewell1.jpg',    caption: 'Farewell Cake Cutting Ceremony',  tag: 'Farewell'       },
  { src: '/gallery/farewell2.jpg',    caption: 'Farewell Batch 2024',             tag: 'Farewell'       },
  { src: '/gallery/award.jpg',        caption: 'Academic Excellence Award',       tag: 'Awards'         },
  { src: '/gallery/childrensday.jpg', caption: "Children's Day Celebration",      tag: 'Events'         },
  { src: '/gallery/result.png', caption: "Result",      tag: 'Result'},
  { src: '/gallery/info.png', caption: "Information",      tag: 'Info'},
]

const TAGS = ['All', 'Infrastructure', 'Events', 'Farewell', 'Awards', 'Result', 'Info']

export default function Gallery() {
  const [active, setActive]   = useState('All')
  const [lightbox, setLightbox] = useState(null)

  const filtered = active === 'All' ? PHOTOS : PHOTOS.filter(p => p.tag === active)

  return (
    <section id="gallery" className={styles.section}>
      <div className="container">
        <span className="section-tag reveal">OUR CAMPUS LIFE</span>
        <h2 className="reveal">Coaching <span className="accent">Gallery</span></h2>
        <p className="section-intro reveal">Glimpses of learning, celebrations, and memorable moments at S.P. Coaching Classes.</p>

        {/* Filter tabs */}
        <div className={`${styles.filters} reveal`}>
          {TAGS.map(t => (
            <button key={t} className={`${styles.filterBtn} ${active === t ? styles.filterActive : ''}`}
              onClick={() => setActive(t)}>{t}</button>
          ))}
        </div>

        {/* Photo grid */}
        <div className={styles.grid}>
          {filtered.map((p, i) => (
            <div key={p.src + i} className={`${styles.card} reveal stagger-${(i % 6) + 1}`}
              onClick={() => setLightbox(p)}>
              <div className={styles.imgWrap}>
                <img src={p.src} alt={p.caption} className={styles.img} />
                <div className={styles.overlay}>
                  <span className={styles.overlayTag}>{p.tag}</span>
                  <p className={styles.overlayCaption}>{p.caption}</p>
                  <span className={styles.zoomIcon}>🔍</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className={styles.lightbox} onClick={() => setLightbox(null)}>
          <button className={styles.lbClose} onClick={() => setLightbox(null)}>✕</button>
          <div className={styles.lbContent} onClick={e => e.stopPropagation()}>
            <img src={lightbox.src} alt={lightbox.caption} className={styles.lbImg} />
            <div className={styles.lbCaption}>
              <span className={styles.lbTag}>{lightbox.tag}</span>
              <p>{lightbox.caption}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
