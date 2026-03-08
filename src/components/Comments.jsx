// ── Comments.jsx ─────────────────────────────────────────
// Fully working persistent comment section using Firebase Firestore
// Comments are shared across ALL visitors and saved permanently.
//
// ── SETUP (5 minutes, totally free) ─────────────────────
//  1. Go to https://console.firebase.google.com
//  2. Click "Add project" → name it "sp-coaching" → Create
//  3. Left sidebar → "Firestore Database" → Create database
//     → Start in TEST MODE → choose any location → Done
//  4. Left sidebar → Project Settings (⚙️ gear icon)
//     → "Your apps" → click </> (Web) → Register app
//     → Copy the firebaseConfig object shown
//  5. Paste your config values into the FIREBASE CONFIG
//     section below (replace the placeholder values)
//  6. Run:  npm install firebase
// ─────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react'
import { initializeApp, getApps }      from 'firebase/app'
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

// ── 🔥 FIREBASE CONFIG — paste your values here ──────────
// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCKrEqQ3YhKgHhuyub5kmaeujcISPqkBS0",
  authDomain: "spcoaching-b452c.firebaseapp.com",
  projectId: "spcoaching-b452c",
  storageBucket: "spcoaching-b452c.firebasestorage.app",
  messagingSenderId: "402179818311",
  appId: "1:402179818311:web:fc61bb8ed287ce0dfe0262",
  measurementId: "G-1JRGQG3PKX"
};

// Initialise Firebase (safe to call multiple times in dev hot-reload)
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
const db  = getFirestore(app)

const AVATARS    = ['🧑‍🎓','👩‍🎓','👨‍🎓','🧑‍💼','👩‍💼','👨‍💼','🧑','👩','👨']
const STAR_LABEL = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!']
const BLANK_FORM = { name: '', course: '', stars: 5, text: '' }
const LIKES_KEY  = 'sp-coaching-likes-v1'

export default function Comments() {
  const [comments, setComments] = useState([])
  const [form,     setForm]     = useState(BLANK_FORM)
  const [status,   setStatus]   = useState('idle')   // idle | submitting | success | error
  const [loading,  setLoading]  = useState(true)
  const [errMsg,   setErrMsg]   = useState('')
  const [likes,    setLikes]    = useState({})        // { [docId]: true } — stored in localStorage
  const [newId,    setNewId]    = useState(null)       // highlight freshly posted comment
  const listRef = useRef(null)

  // ── 1. Load liked-comment IDs from localStorage ────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LIKES_KEY)
      if (saved) setLikes(JSON.parse(saved))
    } catch {}
  }, [])

  // ── 2. Real-time listener — Firestore → state ──────────
  useEffect(() => {
    const q = query(
      collection(db, 'sp_comments'),
      orderBy('createdAt', 'desc')
    )
    const unsub = onSnapshot(
      q,
      snap => {
        setComments(snap.docs.map(d => ({ docId: d.id, ...d.data() })))
        setLoading(false)
      },
      err => {
        console.error('Firestore error:', err)
        setLoading(false)
      }
    )
    return () => unsub()
  }, [])

  // ── Helpers ────────────────────────────────────────────
  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const setStars     = n => setForm(f => ({ ...f, stars: n }))

  // ── 3. Post new comment → Firestore ───────────────────
  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.name.trim() || !form.text.trim()) {
      setErrMsg('Please fill in your name and comment.')
      return
    }
    setErrMsg('')
    setStatus('submitting')

    try {
      const docRef = await addDoc(collection(db, 'sp_comments'), {
        name:      form.name.trim(),
        course:    form.course.trim() || 'S.P. Coaching Student',
        avatar:    AVATARS[Math.floor(Math.random() * AVATARS.length)],
        stars:     form.stars,
        text:      form.text.trim().slice(0, 500),
        likes:     0,
        createdAt: new Date(),
        date:      new Date().toLocaleDateString('en-IN', {
          day: 'numeric', month: 'short', year: 'numeric',
        }),
      })

      setNewId(docRef.id)
      setForm(BLANK_FORM)
      setStatus('success')
      setTimeout(() => { setStatus('idle'); setNewId(null) }, 4000)
      setTimeout(() => listRef.current?.scrollTo({ top: 0, behavior: 'smooth' }), 150)

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

    // Update the likes counter in Firestore
    await updateDoc(doc(db, 'sp_comments', docId), {
      likes: increment(alreadyLiked ? -1 : 1),
    })
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
          <div className={`${styles.formCard} reveal-left`}>
            <h3 className={styles.formTitle}>✍️ Write a Review</h3>

            {status === 'success' && (
              <div className={styles.successMsg}>
                🎉 Your review is live! Everyone can see it now.
              </div>
            )}
            {errMsg && <div className={styles.errorMsg}>⚠️ {errMsg}</div>}

            <form onSubmit={handleSubmit}>
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
                  rows={5} disabled={status === 'submitting'}
                  maxLength={500}
                  placeholder="Tell us about your learning experience, results achieved, what you loved about S.P. Coaching..."
                />
                <span className={styles.charCount}>{form.text.length} / 500</span>
              </div>

              <button
                type="submit" className={styles.btnPost}
                disabled={status === 'submitting'}
              >
                {status === 'submitting' ? '⏳ Posting...' : '🚀 Post Your Review'}
              </button>
            </form>
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

            <div className={styles.commentList} ref={listRef}>
              {comments.map((c, idx) => (
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
                    <span className={styles.verifiedBadge}>✓ Verified Student</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
