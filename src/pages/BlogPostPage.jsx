// ── BlogPostPage.jsx ────────────────────────────────────────
// Dynamic SEO Landing Page & Article View for S.P. Coaching Classes
import { useState, useEffect, useMemo } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import DOMPurify from 'dompurify'
import { getBlogBySlug, getAllBlogs } from '../services/blogService'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import FloatingSocial from '../components/FloatingSocial'
import CookieConsent from '../components/CookieConsent'
import styles from './BlogPostPage.module.css'

export default function BlogPostPage() {
  const { slug: paramSlug } = useParams()
  const location = useLocation()

  // Extract slug from URL parameter or root path (e.g. /coaching-centers-silvassa -> coaching-centers-silvassa)
  const currentSlug = useMemo(() => {
    if (paramSlug) return paramSlug
    const cleaned = location.pathname.replace(/^\/+|\/+$/g, '')
    return cleaned || 'coaching-centers-silvassa'
  }, [paramSlug, location.pathname])

  const [blog, setBlog] = useState(null)
  const [allBlogs, setAllBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    let isMounted = true

    async function load() {
      setLoading(true)
      const data = await getBlogBySlug(currentSlug)
      const list = await getAllBlogs()

      if (isMounted) {
        setBlog(data)
        setAllBlogs(list)
        setLoading(false)

        if (data) {
          document.title = `${data.title} | S.P. Coaching Classes Silvassa`
          const metaDesc = document.querySelector('meta[name="description"]')
          if (metaDesc) {
            metaDesc.setAttribute('content', data.metaDescription || data.excerpt || '')
          }
        }
      }
    }

    load()
    return () => { isMounted = false }
  }, [currentSlug])

  // Extract Table of Contents from HTML content
  const tableOfContents = useMemo(() => {
    if (!blog || !blog.content) return []
    const regex = /<h([23])[^>]*>(.*?)<\/h[23]>/gi
    const items = []
    let match
    while ((match = regex.exec(blog.content)) !== null) {
      const level = match[1]
      const text = match[2].replace(/<[^>]*>?/gm, '').trim()
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      if (text) {
        items.push({ level, text, id })
      }
    }
    return items
  }, [blog])

  // Inject IDs into content headings dynamically for smooth scrolling & sanitize against XSS
  const formattedContent = useMemo(() => {
    if (!blog || !blog.content) return ''
    let html = blog.content
    tableOfContents.forEach(item => {
      const targetTag = new RegExp(`(<h${item.level}[^>]*>)(${item.text})(</h${item.level}>)`, 'i')
      html = html.replace(targetTag, `<h${item.level} id="${item.id}">$2</h${item.level}>`)
    })
    return DOMPurify.sanitize(html, {
      ADD_TAGS: ['iframe'],
      ADD_ATTR: ['target', 'id', 'rel', 'allowfullscreen', 'frameborder']
    })
  }, [blog, tableOfContents])

  // Related / Interlinking articles (exclude current)
  const relatedArticles = useMemo(() => {
    return allBlogs
      .filter(b => b.slug !== currentSlug && (b.targetUrl !== `/${currentSlug}`))
      .slice(0, 8)
  }, [allBlogs, currentSlug])

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  return (
    <div className={styles.pageWrapper}>
      <Navbar />
      <FloatingSocial />
      <CookieConsent />

      {/* Schema Structured Data for SEO */}
      {blog && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Article',
              headline: blog.title,
              description: blog.metaDescription || blog.excerpt,
              image: blog.coverImage ? `https://spclasses.site${blog.coverImage}` : 'https://spclasses.site/gallery/classroom.jpg',
              author: {
                '@type': 'Organization',
                name: 'S.P. Coaching Academic Team',
                url: 'https://spclasses.site'
              },
              publisher: {
                '@type': 'Organization',
                name: 'S.P. Coaching Classes Silvassa',
                logo: {
                  '@type': 'ImageObject',
                  url: 'https://spclasses.site/gallery/website-logo.png'
                }
              },
              datePublished: blog.publishDate || '2026-10-01',
              dateModified: blog.updatedAt || new Date().toISOString().split('T')[0],
              mainEntityOfPage: {
                '@type': 'WebPage',
                '@id': `https://spclasses.site${blog.targetUrl || `/${blog.slug}`}`
              }
            })
          }}
        />
      )}

      {/* Loading state */}
      {loading && (
        <div style={{ padding: '160px 20px', textAlign: 'center', color: '#8a6a50', fontSize: '1.2rem' }}>
          ⏳ Loading coaching article &amp; localized study resources...
        </div>
      )}

      {/* Not Found state */}
      {!loading && !blog && (
        <div className={styles.container} style={{ padding: '140px 20px 80px', textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '2.4rem', color: '#8b3507', marginBottom: '16px' }}>
            Article Not Found
          </h1>
          <p style={{ color: '#5c3b1e', maxWidth: '500px', margin: '0 auto 24px' }}>
            The requested coaching resource or locality guide could not be located. Please explore our blog directory for all Silvassa academic guides.
          </p>
          <Link
            to="/blog"
            style={{
              display: 'inline-block',
              background: '#b84a0a',
              color: '#ffffff',
              padding: '12px 28px',
              borderRadius: '8px',
              fontWeight: 700,
              textDecoration: 'none'
            }}
          >
            ← View All Coaching Articles
          </Link>
        </div>
      )}

      {/* Article Content */}
      {!loading && blog && (
        <>
          {/* Hero header */}
          <header className={styles.articleHero}>
            <div className={styles.container}>
              <nav className={styles.breadcrumb} aria-label="Breadcrumb">
                <Link to="/">Home</Link>
                <span>/</span>
                <Link to="/blog">Coaching Resources</Link>
                <span>/</span>
                <span style={{ color: '#ffffff' }}>{blog.category || 'Guide'}</span>
              </nav>

              {blog.targetKeyword && (
                <span className={styles.keywordBadge}>
                  🎯 Targeted Keyword: {blog.targetKeyword}
                </span>
              )}

              <h1 className={styles.articleTitle}>{blog.title}</h1>

              <div className={styles.metaRow}>
                <span className={styles.metaItem}>✍️ By {blog.author || 'S.P. Academic Panel'}</span>
                <span className={styles.metaItem}>📅 Published {blog.publishDate || 'Oct 2026'}</span>
                <span className={styles.metaItem}>⏱️ {blog.readTime || '6 min read'}</span>
                <span className={styles.metaItem}>📍 Silvassa, DNH</span>
                <button
                  onClick={handleShare}
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: '#ffffff',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  {copied ? '✓ Link Copied!' : '🔗 Share Article'}
                </button>
              </div>
            </div>
          </header>

          {/* Main Layout */}
          <main className={styles.container}>
            <div className={styles.layout}>
              {/* Left Main Article Column */}
              <article className={styles.mainContent}>
                {/* Cover Image */}
                {blog.coverImage && (
                  <div className={styles.coverImageWrap}>
                    <img
                      src={blog.coverImage}
                      alt={blog.coverAlt || blog.title}
                      className={styles.coverImage}
                      onError={(e) => { e.target.src = '/gallery/classroom.jpg' }}
                    />
                  </div>
                )}

                {/* Table of Contents */}
                {tableOfContents.length > 0 && (
                  <div className={styles.tocBox}>
                    <div className={styles.tocTitle}>
                      <span>📑</span> Table of Contents
                    </div>
                    <ul className={styles.tocList}>
                      {tableOfContents.map((item, idx) => (
                        <li
                          key={idx}
                          style={{ paddingLeft: item.level === '3' ? '18px' : '0' }}
                        >
                          <a href={`#${item.id}`}>
                            {item.level === '3' ? '↳ ' : '• '} {item.text}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Article Body HTML */}
                <div
                  className={styles.articleBody}
                  dangerouslySetInnerHTML={{ __html: formattedContent }}
                />

                {/* Explicit Backlinks & Canonical Cluster */}
                {blog.backlinks && blog.backlinks.length > 0 && (
                  <div className={styles.interlinksHub}>
                    <h3>🔗 Key Internal References &amp; Authoritative Sources</h3>
                    <div className={styles.interlinksList}>
                      {blog.backlinks.map((link, idx) => (
                        <a
                          key={idx}
                          href={link.url}
                          rel={link.rel || 'dofollow'}
                          className={styles.interlinkTag}
                        >
                          📌 {link.anchorText}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Local Topical Authority Cluster (Interlinking other targeted hubs) */}
                <div className={styles.interlinksHub} style={{ marginTop: '30px' }}>
                  <h3>📍 Explore Silvassa Coaching &amp; Tuition Hubs</h3>
                  <p style={{ fontSize: '13.5px', color: '#5c3b1e', marginBottom: '14px' }}>
                    S.P. Coaching Classes serves students across Dadra &amp; Nagar Haveli. Explore detailed curriculum guides for your nearby area:
                  </p>
                  <div className={styles.interlinksList}>
                    {relatedArticles.map((rel) => (
                      <Link
                        key={rel.slug}
                        to={rel.targetUrl || `/${rel.slug}`}
                        className={styles.interlinkTag}
                      >
                        {rel.targetKeyword || rel.title}
                      </Link>
                    ))}
                    <Link to="/#contact" className={styles.interlinkTag} style={{ background: '#b84a0a', color: '#ffffff' }}>
                      🎓 Admissions Open 2026-27
                    </Link>
                  </div>
                </div>

                {/* Author Information Box */}
                <div className={styles.authorBox}>
                  <div className={styles.authorAvatar}>👨‍🏫</div>
                  <div className={styles.authorDetails}>
                    <h4>S.P. Coaching Academic Mentorship Cell</h4>
                    <p>
                      Committed to delivering high-impact coaching for 5th–12th (CBSE &amp; GSEB), NEET, JEE, and Commerce streams in Silvassa with concept-first methodology and dedicated doubt clearing.
                    </p>
                  </div>
                </div>
              </article>

              {/* Sticky Sidebar */}
              <aside className={styles.sidebar}>
                <div className={styles.sidebarCard}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#b84a0a', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>
                    ADMISSIONS 2026-27
                  </span>
                  <h3>Join Silvassa's Premier Coaching</h3>
                  <p>
                    Experience personalized attention, small batch sizes (max 15 students), and proven 95%+ board scoring strategies.
                  </p>

                  <a href="/#contact" className={styles.sidebarBtn}>
                    Book Free Demo Class 🎯
                  </a>

                  <a
                    href="https://wa.me/919824006191?text=Hello%20S.P.%20Coaching%20Classes,%20I%20read%20your%20article%20and%20would%20like%20to%20inquire%20about%20admissions"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.sidebarWaBtn}
                  >
                    <span>💬</span> WhatsApp Inquiry
                  </a>

                  <div className={styles.infoRow}>
                    <span>📞</span>
                    <div>
                      <strong>Direct Phone:</strong><br />
                      <a href="tel:+919824006191" style={{ color: '#b84a0a', textDecoration: 'none' }}>+91 98240 06191</a> / <a href="tel:+918469005286" style={{ color: '#b84a0a', textDecoration: 'none' }}>+91 84690 05286</a>
                    </div>
                  </div>

                  <div className={styles.infoRow}>
                    <span>📍</span>
                    <div>
                      <strong>Location:</strong><br />
                      Silvassa, Dadra &amp; Nagar Haveli
                    </div>
                  </div>

                  <div className={styles.infoRow}>
                    <span>⭐</span>
                    <div>
                      <strong>Google Rating:</strong> 4.9/5 (100+ Verified Student Reviews)
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </main>
        </>
      )}

      <Footer />
    </div>
  )
}
