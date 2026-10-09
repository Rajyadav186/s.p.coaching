// ── BlogListPage.jsx ───────────────────────────────────────
// Educational blogs, coaching guides, and local tuition directory for Silvassa
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllBlogs } from '../services/blogService'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import FloatingSocial from '../components/FloatingSocial'
import CookieConsent from '../components/CookieConsent'
import styles from './BlogListPage.module.css'

export default function BlogListPage() {
  const [blogs, setBlogs] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = 'Educational Blogs & Coaching Guides in Silvassa | S.P. Coaching Classes'
    window.scrollTo(0, 0)
    async function load() {
      const data = await getAllBlogs()
      setBlogs(data)
      setLoading(false)
    }
    load()
  }, [])

  const categories = ['All', ...Array.from(new Set(blogs.map(b => b.category || 'Coaching Guide')))]

  const filtered = blogs.filter(b => {
    const matchesCat = category === 'All' || b.category === category
    const matchesSearch =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      (b.targetKeyword && b.targetKeyword.toLowerCase().includes(search.toLowerCase())) ||
      (b.excerpt && b.excerpt.toLowerCase().includes(search.toLowerCase()))
    return matchesCat && matchesSearch
  })

  return (
    <div className={styles.pageWrapper}>
      <Navbar />
      <FloatingSocial />
      <CookieConsent />

      {/* Hero */}
      <header className={styles.headerHero}>
        <div className={styles.container}>
          <Link to="/" className={styles.backHome}>← Return to Homepage</Link>
          <br />
          <span className={styles.heroTag}>Silvassa Academic Resources &amp; Guides</span>
          <h1 className={styles.heroTitle}>Educational Insights &amp; Coaching Articles</h1>
          <p className={styles.heroSub}>
            Discover comprehensive preparation guides, local tuition guides for Tokarkhada, Rakholi &amp; Masat, board exam tips, and subject mastery articles.
          </p>

          <div className={styles.searchBarWrap}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search by topic, board, or locality (e.g. Physics, Commerce, Tokarkhada)..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className={styles.container}>
        {/* Category Filter */}
        <div className={styles.categoryNav}>
          {categories.map(c => (
            <button
              key={c}
              className={`${styles.catBtn} ${category === c ? styles.catBtnActive : ''}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Loading state */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px', color: '#8a6a50' }}>
            ⏳ Loading coaching articles &amp; resources...
          </div>
        )}

        {/* Blog Grid */}
        {!loading && filtered.length > 0 && (
          <div className={styles.grid}>
            {filtered.map(blog => (
              <Link
                key={blog.id || blog.slug}
                to={blog.targetUrl || `/${blog.slug}`}
                className={styles.card}
              >
                <div className={styles.cardImgWrap}>
                  <img
                    src={blog.coverImage || '/gallery/classroom.jpg'}
                    alt={blog.title}
                    className={styles.cardImg}
                    loading="lazy"
                    onError={(e) => { e.target.src = '/gallery/classroom.jpg' }}
                  />
                  <span className={styles.cardTag}>{blog.category || 'Guide'}</span>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.cardMeta}>
                    <span>📅 {blog.publishDate || 'Oct 2026'}</span>
                    <span>•</span>
                    <span>⏱️ {blog.readTime || '5 min read'}</span>
                  </div>

                  <h2 className={styles.cardTitle}>{blog.title}</h2>
                  <p className={styles.cardExcerpt}>{blog.excerpt}</p>

                  <div className={styles.cardFooter}>
                    <span>Target: {blog.targetKeyword || 'Silvassa Tuition'}</span>
                    <span className={styles.readLink}>Read Full Article →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className={styles.emptyState}>
            <h3>No articles found</h3>
            <p>Try searching with another keyword or reset the category filter.</p>
            <button
              onClick={() => { setSearch(''); setCategory('All'); }}
              className={styles.catBtn}
              style={{ marginTop: '16px' }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
