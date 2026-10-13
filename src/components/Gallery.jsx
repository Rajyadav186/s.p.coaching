// ── Gallery.jsx ──────────────────────────────────────────
// Coaching photo gallery with dynamic category filtering and live admin updates
import { useState, useEffect } from 'react'
import { getAllGalleryImages } from '../services/galleryService'
import styles from './Gallery.module.css'

export default function Gallery() {
  const [photos, setPhotos] = useState([])
  const [tags, setTags] = useState(['All'])
  const [active, setActive] = useState('All')
  const [lightbox, setLightbox] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await getAllGalleryImages()
        setPhotos(data)
        // Extract unique tags
        const uniqueTags = ['All', ...Array.from(new Set(data.map(p => p.tag || 'Infrastructure')))]
        setTags(uniqueTags)
        setLoading(false)
      } catch (e) {
        console.error('Gallery load error:', e)
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = active === 'All' ? photos : photos.filter(p => p.tag === active)

  return (
    <section id="gallery" className={styles.section}>
      <div className="container">
        <span className="section-tag reveal">OUR CAMPUS LIFE</span>
        <h2 className="reveal">Coaching <span className="accent">Gallery</span></h2>
        <p className="section-intro reveal">Glimpses of learning, celebrations, and memorable moments at S.P. Coaching Classes.</p>

        {/* Filter tabs */}
        <div className={`${styles.filters} reveal`}>
          {tags.map(t => (
            <button
              key={t}
              className={`${styles.filterBtn} ${active === t ? styles.filterActive : ''}`}
              onClick={() => setActive(t)}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Loading state */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#8a6a50' }}>
            Loading gallery moments...
          </div>
        )}

        {/* Photo grid */}
        {!loading && (
          <div className={styles.grid}>
            {filtered.map((p, i) => (
              <div
                key={p.id || p.src + i}
                className={`${styles.card} reveal stagger-${(i % 6) + 1}`}
                onClick={() => setLightbox(p)}
              >
                <div className={styles.imgWrap}>
                  <img
                    src={p.src}
                    alt={p.alt || p.caption}
                    className={styles.img}
                    loading="lazy"
                    width={380}
                    height={260}
                    onError={(e) => {
                      e.target.src = '/gallery/classroom.jpg'
                    }}
                  />
                  <div className={styles.overlay}>
                    <span className={styles.overlayTag}>{p.tag || 'Activity'}</span>
                    <p className={styles.overlayCaption}>{p.caption}</p>
                    <span className={styles.zoomIcon} aria-hidden="true">🔍</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className={styles.lightbox} onClick={() => setLightbox(null)} role="dialog" aria-modal="true">
          <button className={styles.lbClose} onClick={() => setLightbox(null)} aria-label="Close image preview">✕</button>
          <div className={styles.lbContent} onClick={e => e.stopPropagation()}>
            <img src={lightbox.src} alt={lightbox.alt || lightbox.caption} className={styles.lbImg} />
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
