// ── Comments.jsx ─────────────────────────────────────────
// Persistent comment and review section using Supabase Database & Firebase Firestore
import { useState, useEffect, useRef } from 'react'
import { getSupabase, isSupabaseConfigured } from '../services/supabase'
import { initializeApp, getApps } from 'firebase/app'
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  doc,
  increment,
} from 'firebase/firestore'
import styles from './Comments.module.css'

const firebaseConfig = {
  apiKey: "AIzaSyCKrEqQ3YhKgHhuyub5kmaeujcISPqkBS0",
  authDomain: "spcoaching-b452c.firebaseapp.com",
  projectId: "spcoaching-b452c",
  storageBucket: "spcoaching-b452c.firebasestorage.app",
  messagingSenderId: "402179818311",
  appId: "1:402179818311:web:fc61bb8ed287ce0dfe0262",
  measurementId: "G-1JRGQG3PKX"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
const db  = getFirestore(app)

const AVATARS    = ['🧑‍🎓','👩‍🎓','👨‍🎓','🧑‍💼','👩‍💼','👨‍💼','🧑','👩','👨']
const STAR_LABEL = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!']
const BLANK_FORM = { name: '', course: '', stars: 5, text: '', website: '' }
const LIKES_KEY  = 'sp-coaching-likes-v1'

export default function Comments() {
  const [comments, setComments] = useState([])
  const [form,     setForm]     = useState(BLANK_FORM)
  const [status,   setStatus]   = useState('idle')   // idle | submitting | success | error
  const [loading,  setLoading]  = useState(true)
  const [errMsg,   setErrMsg]   = useState('')
  const [likes,    setLikes]    = useState({})        // { [docId]: true }
  const [newId,    setNewId]    = useState(null)       // highlight freshly posted comment
  const [activeSlide, setActiveSlide] = useState(0)   // active review slide for phones
  const [isFormOpenMobile, setIsFormOpenMobile] = useState(true) // write review form visible by default on phones
  const listRef = useRef(null)

  // ── Scroll to specific slide (for phones / slider) ─────
  const scrollToSlide = (index) => {
    if (!listRef.current) return
    const container = listRef.current
    const cards = container.children
    if (cards[index]) {
      const card = cards[index]
      const scrollPos = card.offsetLeft - (container.offsetWidth - card.offsetWidth) / 2
      container.scrollTo({ left: scrollPos, behavior: 'smooth' })
      setActiveSlide(index)
    }
  }

  const handlePrev = () => {
    const prevIdx = Math.max(0, activeSlide - 1)
    scrollToSlide(prevIdx)
  }

  const handleNext = () => {
    const nextIdx = Math.min(comments.length - 1, activeSlide + 1)
    scrollToSlide(nextIdx)
  }

  const handleListScroll = () => {
    if (!listRef.current || typeof window === 'undefined' || window.innerWidth > 640) return
    const container = listRef.current
    const cards = container.children
    if (!cards || cards.length === 0) return

    const containerCenter = container.scrollLeft + container.offsetWidth / 2
    let closestIdx = 0
    let minDiff = Infinity

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i]
      const cardCenter = card.offsetLeft + card.offsetWidth / 2
      const diff = Math.abs(containerCenter - cardCenter)
      if (diff < minDiff) {
        minDiff = diff
        closestIdx = i
      }
    }

    if (closestIdx !== activeSlide) {
      setActiveSlide(closestIdx)
    }
  }

  // ── 1. Load liked-comment IDs from localStorage ────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LIKES_KEY)
      if (saved) setLikes(JSON.parse(saved))
    } catch {}
  }, [])

  // ── 2. Real-time / Fetch listener (Supabase + Firestore) ──
  useEffect(() => {
    let unsubFirestore = null

    async function loadReviews() {
      const supabase = getSupabase()

      // Try Supabase first
      if (supabase && isSupabaseConfigured()) {
        try {
          const { data, error } = await supabase
            .from('sp_comments')
            .select('*')
            .order('created_at', { ascending: false })

          if (!error && data && data.length > 0) {
            setComments(data.map(d => ({
              docId: d.id,
              name: d.name,
              course: d.course,
              avatar: d.avatar,
              stars: d.stars,
              text: d.text,
              likes: d.likes || 0,
              date: d.date,
              createdAt: d.created_at
            })))
            setLoading(false)
          }
        } catch (e) {
          console.warn('Supabase comments fetch notice:', e)
        }
      }

      // Firestore real-time subscription
      try {
        const q = query(
          collection(db, 'sp_comments'),
          orderBy('createdAt', 'desc')
        )
        unsubFirestore = onSnapshot(
          q,
          snap => {
            if (!snap.empty) {
              setComments(snap.docs.map(d => ({ docId: d.id, ...d.data() })))
            }
            setLoading(false)
          },
          err => {
            console.warn('Firestore notice:', err)
            setLoading(false)
          }
        )
      } catch (err) {
        setLoading(false)
      }
    }

    loadReviews()

    return () => {
      if (unsubFirestore) unsubFirestore()
    }
  }, [])

  // ── Helpers ────────────────────────────────────────────
  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const setStars     = n => setForm(f => ({ ...f, stars: n }))

  // ── 3. Post new comment (Supabase + Firestore) ─────────
  const handleSubmit = async e => {
    e.preventDefault()
    if (form.website) return // Honeypot bot protection

    if (!form.name.trim() || !form.text.trim()) {
      setErrMsg('Please fill in your name and comment.')
      return
    }
    setErrMsg('')
    setStatus('submitting')

    const newCommentObj = {
      name:      form.name.trim(),
      course:    form.course.trim() || 'S.P. Coaching Student',
      avatar:    AVATARS[Math.floor(Math.random() * AVATARS.length)],
      stars:     form.stars,
      text:      form.text.trim().slice(0, 500),
      likes:     0,
      createdAt: new Date().toISOString(),
      date:      new Date().toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
      }),
    }

    let createdId = `rev-${Date.now()}`

    try {
      // 1. Post to Supabase
      const supabase = getSupabase()
      if (supabase && isSupabaseConfigured()) {
        const { data, error } = await supabase
          .from('sp_comments')
          .insert([{
            name: newCommentObj.name,
            course: newCommentObj.course,
            avatar: newCommentObj.avatar,
            stars: newCommentObj.stars,
            text: newCommentObj.text,
            likes: 0,
            date: newCommentObj.date
          }])
          .select()

        if (!error && data && data[0]) {
          createdId = data[0].id
        }
      }

      // 2. Post to Firestore
      try {
        const docRef = await addDoc(collection(db, 'sp_comments'), {
          ...newCommentObj,
          createdAt: new Date()
        })
        if (!createdId.startsWith('rev-')) {
          createdId = docRef.id
        }
      } catch (fErr) {
        console.warn('Firestore write notice:', fErr)
      }

      // 3. Optimistic local update
      setComments(prev => [{ docId: createdId, ...newCommentObj }, ...prev])
      setNewId(createdId)
      setForm(BLANK_FORM)
      setStatus('success')
      setTimeout(() => { setStatus('idle'); setNewId(null) }, 4000)
      setTimeout(() => {
        if (typeof window !== 'undefined' && window.innerWidth <= 640) {
          scrollToSlide(0)
        } else {
          listRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
        }
      }, 150)

    } catch (err) {
      console.error('Post error:', err)
      setStatus('error')
      setErrMsg('Could not post comment. Please try again.')
    }
  }

  // ── 4. Like / unlike a comment ──────────────────────────
  const handleLike = async (docId, currentLikes) => {
    const alreadyLiked = likes[docId]
    const updated = { ...likes, [docId]: !alreadyLiked }
    setLikes(updated)
    try { localStorage.setItem(LIKES_KEY, JSON.stringify(updated)) } catch {}

    // Update locally
    setComments(prev => prev.map(c => c.docId === docId ? { ...c, likes: Math.max(0, (c.likes || 0) + (alreadyLiked ? -1 : 1)) } : c))

    // Update in Supabase
    const supabase = getSupabase()
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.rpc('increment_likes', { row_id: docId }).catch(async () => {
          await supabase.from('sp_comments').update({ likes: Math.max(0, currentLikes + (alreadyLiked ? -1 : 1)) }).eq('id', docId)
        })
      } catch (e) {}
    }

    // Update in Firestore
    try {
      await updateDoc(doc(db, 'sp_comments', docId), {
        likes: increment(alreadyLiked ? -1 : 1),
      })
    } catch (e) {}
  }

  // ── Rating summary ─────────────────────────────────────
  const avgRating = comments.length
    ? (comments.reduce((s, c) => s + (c.stars || 5), 0) / comments.length).toFixed(1)
    : '5.0'

  return (
    <section id="students" className={styles.section}>
      <div className="container">
        <span className="section-tag reveal">STUDENT VOICES</span>
        <h2 className="reveal">Comments &amp; <span className="accent">Reviews</span></h2>
        <p className="section-intro reveal">
          Real experiences from our students and parents — visible to everyone, saved permanently.
        </p>

        {/* ── Rating summary bar ── */}
        <div className={`${styles.ratingBar} reveal`}>
          <div className={styles.ratingBig}>
            <span className={styles.ratingNum}>{avgRating}</span>
            <div className={styles.ratingStars}>
              {[1,2,3,4,5].map(n => (
                <span key={n} style={{ color: n <= Math.round(+avgRating) ? '#f5a623' : '#ddd', fontSize: 22 }}>★</span>
              ))}
            </div>
            <span className={styles.ratingLabel}>Overall Rating</span>
          </div>
          <div className={styles.ratingBars}>
            {[5,4,3,2,1].map(star => {
              const cnt = comments.filter(c => c.stars === star).length
              const pct = comments.length ? (cnt / comments.length) * 100 : 0
              return (
                <div key={star} className={styles.ratingRow}>
                  <span>{star}★</span>
                  <div className={styles.ratingTrack}>
                    <div className={styles.ratingFill} style={{ width: pct + '%' }} />
                  </div>
                  <span>{cnt}</span>
                </div>
              )
            })}
          </div>
          <div className={styles.ratingCount}>
            <span className={styles.totalCount}>{comments.length}</span>
            <span>Total Reviews</span>
          </div>
        </div>

        <div className={styles.layout}>

          {/* ── Post form ── */}
          <div className={styles.formCard}>
            <div className={styles.formCardHeader}>
              <h3 className={styles.formTitle}>✍️ Write a Review</h3>
              <span className={styles.formSubtitle}>Share your feedback</span>
            </div>

            <div className={styles.formBody}>
              {status === 'success' && (
                <div className={styles.successMsg}>
                  🎉 Your review is live! Everyone can see it now.
                </div>
              )}
              {errMsg && <div className={styles.errorMsg}>⚠️ {errMsg}</div>}

              <form onSubmit={handleSubmit}>
                {/* Honeypot field for bot protection */}
                <input
                  type="text"
                  name="website"
                  value={form.website}
                  onChange={handleChange}
                  style={{ display: 'none' }}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                />
                <div className={styles.row}>
                  <div className={styles.group}>
                    <label>YOUR NAME *</label>
                    <input
                      name="name" value={form.name} onChange={handleChange}
                      placeholder="e.g. Arjun Patel"
                      disabled={status === 'submitting'}
                    />
                  </div>
                  <div className={styles.group}>
                    <label>COURSE / CLASS</label>
                    <input
                      name="course" value={form.course} onChange={handleChange}
                      placeholder="e.g. NEET 2024, Class 10"
                      disabled={status === 'submitting'}
                    />
                  </div>
                </div>

                <div className={styles.group}>
                  <label>YOUR RATING *</label>
                  <div className={styles.starPicker}>
                    {[1,2,3,4,5].map(n => (
                      <button
                        key={n} type="button"
                        className={`${styles.starBtn} ${n <= form.stars ? styles.starBtnActive : ''}`}
                        onClick={() => setStars(n)}
                        title={STAR_LABEL[n]}
                      >★</button>
                    ))}
                    <span className={styles.starLabel}>{STAR_LABEL[form.stars]}</span>
                  </div>
                </div>

                <div className={styles.group}>
                  <label>YOUR EXPERIENCE *</label>
                  <textarea
                    name="text" value={form.text} onChange={handleChange}
                    rows={3} disabled={status === 'submitting'}
                    maxLength={500}
                    placeholder="Tell us about your learning experience, results achieved, what you loved about S.P. Coaching..."
                  />
                  <span className={styles.charCount}>{form.text.length} / 500</span>
                </div>

                <button
                  type="submit" className={styles.btnPost}
                  disabled={status === 'submitting'}
                >
                  {status === 'submitting' ? '⏳ Posting Review...' : '🚀 Post Your Review'}
                </button>
              </form>
            </div>
          </div>

          {/* ── Live comment feed ── */}
          <div className={`${styles.feed} reveal-right`}>
            <div className={styles.feedHeader}>
              <span className={styles.feedCount}>
                {loading ? '⏳ Loading...' : `💬 ${comments.length} Reviews`}
              </span>
              <span className={styles.feedSort}>Most Recent First</span>
            </div>

            {/* Loading skeletons */}
            {loading && (
              <div className={styles.loadingState}>
                <div className={styles.skeleton} />
                <div className={styles.skeleton} />
                <div className={styles.skeleton} />
              </div>
            )}

            {/* Empty state */}
            {!loading && comments.length === 0 && (
              <div className={styles.emptyState}>
                <span>🌟</span>
                <p>Be the first to share your experience!</p>
              </div>
            )}

            <div
              className={styles.commentList}
              ref={listRef}
              onScroll={handleListScroll}
            >
              {comments.map((c) => (
                <div
                  key={c.docId}
                  className={`${styles.commentCard} ${c.docId === newId ? styles.newComment : ''}`}
                >
                  {c.docId === newId && (
                    <span className={styles.newBadge}>NEW</span>
                  )}

                  <div className={styles.commentTop}>
                    <div className={styles.avatar}>{c.avatar}</div>
                    <div className={styles.commentMeta}>
                      <strong>{c.name}</strong>
                      <span className={styles.courseBadge}>{c.course}</span>
                      <div className={styles.commentStars}>
                        {[1,2,3,4,5].map(n => (
                          <span key={n} style={{ color: n <= (c.stars || 5) ? '#f5a623' : '#e0d0c0' }}>★</span>
                        ))}
                      </div>
                    </div>
                    <span className={styles.commentDate}>{c.date}</span>
                  </div>

                  <p className={styles.commentText}>{c.text}</p>

                  <div className={styles.commentFooter}>
                    <button
                      className={`${styles.likeBtn} ${likes[c.docId] ? styles.liked : ''}`}
                      onClick={() => handleLike(c.docId, c.likes || 0)}
                    >
                      {likes[c.docId] ? '❤️' : '🤍'} Helpful
                      {(c.likes || 0) > 0 && (
                        <span className={styles.likeCount}>{c.likes}</span>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile slider controls for phone screens */}
            {comments.length > 1 && (
              <div className={styles.sliderControls}>
                <button
                  type="button"
                  className={styles.slideNavBtn}
                  onClick={handlePrev}
                  disabled={activeSlide === 0}
                  aria-label="Previous review slide"
                >
                  ‹
                </button>

                <div className={styles.slideIndicators}>
                  <div className={styles.slideDots}>
                    {comments.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`${styles.dot} ${activeSlide === idx ? styles.dotActive : ''}`}
                        onClick={() => scrollToSlide(idx)}
                        aria-label={`Go to review slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                  <span className={styles.slideCountText}>
                    {activeSlide + 1} / {comments.length}
                  </span>
                </div>

                <button
                  type="button"
                  className={styles.slideNavBtn}
                  onClick={handleNext}
                  disabled={activeSlide === comments.length - 1}
                  aria-label="Next review slide"
                >
                  ›
                </button>
              </div>
            )}

            {/* Mobile swipe hint */}
            {comments.length > 1 && (
              <div className={styles.swipeHint}>
                <span>👈</span> Swipe horizontally to browse reviews <span>👉</span>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  )
}
