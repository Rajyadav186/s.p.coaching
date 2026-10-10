// ── AdminPage.jsx ──────────────────────────────────────────
// Complete Admin Panel for S.P. Coaching Classes
// Full control over Blogs, SEO Backlinks, Gallery Sections, Reviews, Announcements, & Supabase Storage
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  isUserAdminLoggedIn,
  verifyAdminPassword,
  setAdminSession,
  changeAdminPassword
} from '../services/authService'
import {
  getAllBlogs,
  saveBlog,
  deleteBlog,
  syncDefaultBlogsToCloud
} from '../services/blogService'
import {
  getAllGalleryImages,
  saveGalleryItem,
  deleteGalleryItem,
  syncDefaultGalleryToCloud
} from '../services/galleryService'
import {
  getSiteSettings,
  updateSiteSettings,
  getAllReviews,
  deleteReview
} from '../services/siteService'
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  testSupabaseConnection,
  SUPABASE_SQL_SCHEMA,
  isSupabaseConfigured
} from '../services/supabase'
import {
  uploadMediaToSupabase
} from '../services/storageService'
import styles from './AdminPage.module.css'

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loginPass, setLoginPass] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [loginError, setLoginError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  // Notification Banner
  const [bannerMsg, setBannerMsg] = useState('')

  // Data states
  const [blogs, setBlogs] = useState([])
  const [gallery, setGallery] = useState([])
  const [reviews, setReviews] = useState([])
  const [settings, setSettings] = useState({
    announcementEnabled: true,
    announcementText: '',
    announcementBadge: '',
    announcementLink: '',
    phone1: '',
    phone2: '',
    email: '',
    location: ''
  })
  const [loading, setLoading] = useState(true)

  // Supabase & Storage states
  const [supabaseConfig, setSupabaseConfig] = useState(getSupabaseConfig())
  const [supabaseStatus, setSupabaseStatus] = useState({
    testing: false,
    tested: false,
    success: false,
    message: '',
    tables: null
  })
  const [copiedSql, setCopiedSql] = useState(false)
  const [quickUploadUrl, setQuickUploadUrl] = useState('')
  const [quickUploading, setQuickUploading] = useState(false)
  const [uploadingGalleryImg, setUploadingGalleryImg] = useState(false)
  const [uploadingBlogImg, setUploadingBlogImg] = useState(false)

  // Modals state
  const [blogModalOpen, setBlogModalOpen] = useState(false)
  const [editingBlog, setEditingBlog] = useState(null)

  const [galleryModalOpen, setGalleryModalOpen] = useState(false)
  const [editingGallery, setEditingGallery] = useState(null)

  const [passwordModalOpen, setPasswordModalOpen] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Blog Search in Admin
  const [blogSearch, setBlogSearch] = useState('')

  // ── Initial check ──
  useEffect(() => {
    document.title = 'Admin Panel Control Center | S.P. Coaching Classes'
    const authed = isUserAdminLoggedIn()
    setIsAuthenticated(authed)
    if (authed) {
      loadAllData()
    } else {
      setLoading(false)
    }
  }, [])

  async function loadAllData() {
    setLoading(true)
    try {
      const [blogList, galleryList, reviewList, siteSet] = await Promise.all([
        getAllBlogs(),
        getAllGalleryImages(),
        getAllReviews(),
        getSiteSettings()
      ])
      setBlogs(blogList)
      setGallery(galleryList)
      setReviews(reviewList)
      if (siteSet) setSettings(siteSet)
    } catch (e) {
      console.error('Data load error:', e)
    } finally {
      setLoading(false)
    }
  }

  const showNotification = (msg) => {
    setBannerMsg(msg)
    setTimeout(() => setBannerMsg(''), 4000)
  }

  // ── Auth Handlers ──
  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginError('')
    const isValid = await verifyAdminPassword(loginPass)
    if (isValid) {
      setAdminSession(true, rememberMe)
      setIsAuthenticated(true)
      loadAllData()
      showNotification('✅ Successfully logged into Admin Panel')
    } else {
      setLoginError('❌ Incorrect password. Please try again.')
    }
  }

  const handleLogout = () => {
    setAdminSession(false)
    setIsAuthenticated(false)
    setLoginPass('')
  }

  const handlePasswordChangeSubmit = async (e) => {
    e.preventDefault()
    if (!newPassword || newPassword.length < 4) {
      alert('Password must be at least 4 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match.')
      return
    }
    await changeAdminPassword(newPassword)
    setPasswordModalOpen(false)
    setNewPassword('')
    setConfirmPassword('')
    showNotification('🔒 Admin password updated successfully!')
  }

  // ── Blog Handlers ──
  const handleOpenNewBlog = () => {
    setEditingBlog({
      title: '',
      slug: '',
      targetUrl: '',
      targetKeyword: '',
      category: 'Coaching Guide',
      excerpt: '',
      coverImage: '/gallery/classroom.jpg',
      coverAlt: '',
      metaDescription: '',
      readTime: '5 min read',
      author: 'S.P. Academic Panel',
      publishDate: new Date().toISOString().split('T')[0],
      backlinks: [
        { anchorText: 'Best Coaching in Silvassa', url: '/coaching-centers-silvassa', rel: 'dofollow' }
      ],
      content: '<h2>Introduction</h2>\n<p>Start writing your localized coaching guide or subject mastery tips here...</p>\n\n<div class="highlight-box">\n  <h4>🎯 Key Highlights</h4>\n  <p>• Concept-first teaching<br>• Regular doubt solving</p>\n</div>'
    })
    setBlogModalOpen(true)
  }

  const handleOpenEditBlog = (b) => {
    setEditingBlog({
      ...b,
      backlinks: b.backlinks && b.backlinks.length > 0 ? b.backlinks : []
    })
    setBlogModalOpen(true)
  }

  const handleSaveBlog = async (e) => {
    e.preventDefault()
    if (!editingBlog.title || !editingBlog.slug) {
      alert('Title and Slug are required.')
      return
    }

    // Auto fix slug and targetUrl
    const cleanedSlug = editingBlog.slug.toLowerCase().replace(/[^a-z0-9-_]/g, '-')
    const formattedUrl = editingBlog.targetUrl || `/${cleanedSlug}`

    const payload = {
      ...editingBlog,
      slug: cleanedSlug,
      targetUrl: formattedUrl
    }

    await saveBlog(payload)
    setBlogModalOpen(false)
    setEditingBlog(null)
    await loadAllData()
    showNotification('🎉 Blog post saved & updated successfully!')
  }

  const handleDeleteBlog = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete the blog "${title}"?`)) {
      await deleteBlog(id)
      await loadAllData()
      showNotification('🗑️ Blog deleted.')
    }
  }

  const handleSyncBlogsCloud = async () => {
    if (window.confirm('Sync/Reset all 14 target keyword landing blogs to Firestore & Local Storage? This ensures all 14 SEO pages are active.')) {
      setLoading(true)
      await syncDefaultBlogsToCloud()
      await loadAllData()
      showNotification('⚡ All 14 Target SEO Landing Pages synced successfully to Cloud!')
    }
  }

  // ── Gallery Handlers ──
  const handleOpenNewGallery = () => {
    setEditingGallery({
      src: '/gallery/classroom.jpg',
      caption: '',
      tag: 'Classroom',
      alt: 'S.P. Coaching Classes Silvassa',
      order: gallery.length + 1
    })
    setGalleryModalOpen(true)
  }

  const handleOpenEditGallery = (item) => {
    setEditingGallery({ ...item })
    setGalleryModalOpen(true)
  }

  const handleSaveGallery = async (e) => {
    e.preventDefault()
    if (!editingGallery.src || !editingGallery.caption) {
      alert('Image URL and Caption are required.')
      return
    }
    await saveGalleryItem(editingGallery)
    setGalleryModalOpen(false)
    setEditingGallery(null)
    await loadAllData()
    showNotification('🖼️ Gallery photo saved successfully!')
  }

  const handleDeleteGallery = async (id) => {
    if (window.confirm('Are you sure you want to delete this gallery photo?')) {
      await deleteGalleryItem(id)
      await loadAllData()
      showNotification('🗑️ Gallery item deleted.')
    }
  }

  const handleSyncGalleryCloud = async () => {
    if (window.confirm('Sync default campus images to Firestore?')) {
      setLoading(true)
      await syncDefaultGalleryToCloud()
      await loadAllData()
      showNotification('⚡ Default Gallery synced to Cloud!')
    }
  }

  // ── Review Moderation Handlers ──
  const handleDeleteReview = async (docId) => {
    if (window.confirm('Are you sure you want to delete this review? This removes fake/spam reviews immediately.')) {
      try {
        await deleteReview(docId)
        setReviews(reviews.filter(r => r.docId !== docId))
        showNotification('🗑️ Review removed permanently.')
      } catch (e) {
        alert('Failed to delete review: ' + e.message)
      }
    }
  }

  // ── Settings Handlers ──
  const handleSaveSettings = async (e) => {
    e.preventDefault()
    await updateSiteSettings(settings)
    showNotification('✅ Site settings & announcements updated live!')
  }

  // ── Supabase & Storage Handlers ──
  const handleSaveSupabaseConfig = (e) => {
    e?.preventDefault()
    saveSupabaseConfig(supabaseConfig)
    showNotification('💾 Supabase credentials saved! Testing connection...')
    handleTestSupabaseConnection()
  }

  const handleTestSupabaseConnection = async () => {
    setSupabaseStatus({ testing: true, tested: false, success: false, message: 'Testing connection to Supabase...', tables: null })
    try {
      const result = await testSupabaseConnection()
      setSupabaseStatus({
        testing: false,
        tested: true,
        success: result.success,
        message: result.message,
        tables: result.tables || null
      })
      if (result.success) {
        showNotification('⚡ Connected to Supabase successfully!')
        loadAllData()
      } else {
        showNotification('⚠️ Supabase notice: ' + result.message)
      }
    } catch (err) {
      setSupabaseStatus({
        testing: false,
        tested: true,
        success: false,
        message: err.message,
        tables: null
      })
    }
  }

  const handleCopySql = () => {
    try {
      navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA)
      setCopiedSql(true)
      showNotification('📋 Complete Supabase SQL setup script copied to clipboard!')
      setTimeout(() => setCopiedSql(false), 3000)
    } catch (e) {
      alert('Please select and copy the SQL code from the schema box below.')
    }
  }

  const handleGalleryFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingGalleryImg(true)
    try {
      const res = await uploadMediaToSupabase(file, 'gallery')
      if (res.success && res.url) {
        setEditingGallery(prev => ({
          ...prev,
          src: res.url,
          caption: prev.caption || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
        }))
        showNotification(res.isLocalFallback ? '📷 Image loaded (Local fallback mode)' : '☁️ Image uploaded to Supabase Storage!')
      } else {
        showNotification('⚠️ Upload notice: ' + (res.error || 'Failed'))
      }
    } catch (err) {
      showNotification('❌ Upload failed: ' + err.message)
    } finally {
      setUploadingGalleryImg(false)
    }
  }

  const handleBlogCoverUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingBlogImg(true)
    try {
      const res = await uploadMediaToSupabase(file, 'blogs')
      if (res.success && res.url) {
        setEditingBlog(prev => ({ ...prev, coverImage: res.url }))
        showNotification(res.isLocalFallback ? '📷 Cover image loaded (Local fallback)' : '☁️ Cover image uploaded to Supabase Storage!')
      } else {
        showNotification('⚠️ Upload notice: ' + (res.error || 'Failed'))
      }
    } catch (err) {
      showNotification('❌ Upload failed: ' + err.message)
    } finally {
      setUploadingBlogImg(false)
    }
  }

  const handleQuickImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setQuickUploading(true)
    try {
      const res = await uploadMediaToSupabase(file, 'general')
      if (res.success && res.url) {
        setQuickUploadUrl(res.url)
        showNotification(res.isLocalFallback ? '📷 Local URL generated' : '☁️ File uploaded to Supabase Storage!')
      } else {
        showNotification('⚠️ Notice: ' + (res.error || 'Check configuration'))
      }
    } catch (err) {
      showNotification('❌ Upload error: ' + err.message)
    } finally {
      setQuickUploading(false)
    }
  }

  // ── Editor Helper Tools for Blog ──
  const insertTextAtCursor = (before, after = '') => {
    const textarea = document.getElementById('blogContentTextarea')
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const current = editingBlog.content || ''
    const selected = current.substring(start, end) || 'Sample text'
    const replacement = `${before}${selected}${after}`
    const updated = current.substring(0, start) + replacement + current.substring(end)
    setEditingBlog({ ...editingBlog, content: updated })
  }

  // ── Filtered Blogs for Table ──
  const filteredBlogs = blogs.filter(b =>
    b.title.toLowerCase().includes(blogSearch.toLowerCase()) ||
    (b.targetKeyword && b.targetKeyword.toLowerCase().includes(blogSearch.toLowerCase())) ||
    (b.slug && b.slug.toLowerCase().includes(blogSearch.toLowerCase()))
  )

  // ── LOGIN SCREEN ──
  if (!isAuthenticated) {
    return (
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <img
            src="/logo.png"
            alt="S.P. Coaching Logo"
            className={styles.loginLogo}
            onError={(e) => { e.target.src = '/logo.png' }}
          />
          <h1 className={styles.loginTitle}>Admin Control Center</h1>
          <p className={styles.loginSubtitle}>S.P. Coaching Classes • Silvassa</p>

          {loginError && <div className={styles.errorBanner}>{loginError}</div>}

          <form onSubmit={handleLogin} className={styles.loginForm}>
            <div className={styles.inputGroup}>
              <label>Enter Admin Password</label>
              <input
                type="password"
                className={styles.input}
                placeholder="Enter password (default: spcoaching2026)"
                value={loginPass}
                onChange={e => setLoginPass(e.target.value)}
                autoFocus
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#5c3b1e' }}>
              <input
                type="checkbox"
                id="rememberMeCheck"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
              />
              <label htmlFor="rememberMeCheck" style={{ cursor: 'pointer' }}>Keep me logged in</label>
            </div>

            <button type="submit" className={styles.primaryBtn} style={{ width: '100%', marginTop: '8px' }}>
              Unlock Control Center 🔐
            </button>
          </form>

          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f0e4d2' }}>
            <Link to="/" style={{ color: '#b84a0a', fontSize: '13.5px', textDecoration: 'none', fontWeight: 600 }}>
              ← Return to Main Website
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── AUTHENTICATED DASHBOARD ──
  return (
    <div className={styles.adminWrapper}>
      {/* Top Bar */}
      <header className={styles.topNav}>
        <div className={styles.navBrand}>
          <img
            src="/logo.png"
            alt="S.P. Coaching Logo"
            className={styles.navLogo}
            onError={(e) => { e.target.src = '/logo.png' }}
          />
          <span>S.P. Coaching Admin Panel</span>
        </div>

        <div className={styles.navActions}>
          <Link to="/" target="_blank" className={styles.viewSiteLink}>
            🌐 View Live Site ↗
          </Link>
          <Link to="/blog" target="_blank" className={styles.viewSiteLink}>
            📚 View Blogs ↗
          </Link>
          <button
            onClick={() => setPasswordModalOpen(true)}
            className={styles.secondaryBtn}
            style={{ padding: '6px 14px', fontSize: '12.5px' }}
          >
            🔑 Change Password
          </button>
          <button
            onClick={handleLogout}
            className={styles.dangerBtn}
            style={{ padding: '6px 14px' }}
          >
            Logout 🚪
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className={styles.dashboardLayout}>
        {/* Sidebar Nav */}
        <aside className={styles.sidebar}>
          <button
            className={`${styles.tabBtn} ${activeTab === 'overview' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <span className={styles.tabIcon}>📊</span> Overview &amp; Cloud Sync
          </button>

          <button
            className={`${styles.tabBtn} ${activeTab === 'blogs' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('blogs')}
          >
            <span className={styles.tabIcon}>📝</span> SEO Blogs &amp; Backlinks ({blogs.length})
          </button>

          <button
            className={`${styles.tabBtn} ${activeTab === 'gallery' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('gallery')}
          >
            <span className={styles.tabIcon}>🖼️</span> Gallery Sections ({gallery.length})
          </button>

          <button
            className={`${styles.tabBtn} ${activeTab === 'reviews' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            <span className={styles.tabIcon}>⭐</span> Review Moderation ({reviews.length})
          </button>

          <button
            className={`${styles.tabBtn} ${activeTab === 'settings' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <span className={styles.tabIcon}>📢</span> Announcements &amp; Info
          </button>

          <button
            className={`${styles.tabBtn} ${activeTab === 'supabase' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('supabase')}
          >
            <span className={styles.tabIcon}>⚡</span> Supabase &amp; Storage
          </button>
        </aside>

        {/* Main Content Area */}
        <main className={styles.mainPanel}>
          {/* Notification Banner */}
          {bannerMsg && (
            <div className={styles.successBanner}>
              <span>{bannerMsg}</span>
              <button
                onClick={() => setBannerMsg('')}
                style={{ background: 'none', border: 'none', color: '#15803d', cursor: 'pointer', fontWeight: 'bold' }}
              >
                ✕
              </button>
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div>
              <div className={styles.panelHeader}>
                <div>
                  <h1 className={styles.panelTitle}>System Overview</h1>
                  <p className={styles.panelSubtitle}>Real-time status of your Silvassa coaching portal content &amp; SEO hubs</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={loadAllData} className={styles.secondaryBtn}>
                    🔄 Refresh Data
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>📝</div>
                  <div>
                    <div className={styles.statNumber}>{blogs.length}</div>
                    <div className={styles.statLabel}>Target SEO Blogs Active</div>
                  </div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statIcon}>🖼️</div>
                  <div>
                    <div className={styles.statNumber}>{gallery.length}</div>
                    <div className={styles.statLabel}>Campus Photos Listed</div>
                  </div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statIcon}>⭐</div>
                  <div>
                    <div className={styles.statNumber}>{reviews.length}</div>
                    <div className={styles.statLabel}>Student Reviews Received</div>
                  </div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statIcon}>🎯</div>
                  <div>
                    <div className={styles.statNumber}>14/14</div>
                    <div className={styles.statLabel}>Target Keywords Mapped</div>
                  </div>
                </div>
              </div>

              {/* Quick Actions & Cloud Sync */}
              <div className={styles.cardSection}>
                <div className={styles.cardSectionHeader}>
                  <h2 className={styles.cardSectionTitle}>⚡ 1-Click Cloud Sync &amp; Auto-Provisioning</h2>
                </div>
                <p style={{ color: '#5c3b1e', fontSize: '14.5px', marginBottom: '20px' }}>
                  Ensure all 14 targeted keyword landing pages (Tokarkhada, Masat, Rakholi, Commerce, Physics, etc.) and high-res campus gallery images are provisioned and synchronized between Firestore Cloud and offline storage.
                </p>

                <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                  <button onClick={handleSyncBlogsCloud} className={styles.primaryBtn}>
                    🚀 Provision / Sync 14 Target Blogs to Cloud
                  </button>
                  <button onClick={handleSyncGalleryCloud} className={styles.secondaryBtn}>
                    🖼️ Sync Default Gallery to Cloud
                  </button>
                  <button onClick={handleOpenNewBlog} className={styles.successBtn}>
                    ➕ Write New Article
                  </button>
                </div>
              </div>

              {/* 14 Targeted Keywords Reference Table */}
              <div className={styles.cardSection}>
                <div className={styles.cardSectionHeader}>
                  <h2 className={styles.cardSectionTitle}>📍 14 Targeted Keywords &amp; Direct URLs</h2>
                </div>
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Target Keyword</th>
                        <th>Target URL</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {blogs.slice(0, 14).map((b, idx) => (
                        <tr key={b.id || idx}>
                          <td>{idx + 1}</td>
                          <td>
                            <strong>{b.targetKeyword || b.title}</strong>
                          </td>
                          <td>
                            <code style={{ background: '#faf5ed', padding: '3px 8px', borderRadius: '6px', color: '#b84a0a' }}>
                              {b.targetUrl || `/${b.slug}`}
                            </code>
                          </td>
                          <td>
                            <span style={{ color: '#16a34a', fontWeight: 600, fontSize: '13px' }}>● Live &amp; Indexed</span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <Link
                                to={b.targetUrl || `/${b.slug}`}
                                target="_blank"
                                className={styles.secondaryBtn}
                                style={{ padding: '4px 10px', fontSize: '12px' }}
                              >
                                View ↗
                              </Link>
                              <button
                                onClick={() => handleOpenEditBlog(b)}
                                className={styles.secondaryBtn}
                                style={{ padding: '4px 10px', fontSize: '12px' }}
                              >
                                Edit ✏️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BLOG & SEO CMS */}
          {activeTab === 'blogs' && (
            <div>
              <div className={styles.panelHeader}>
                <div>
                  <h1 className={styles.panelTitle}>Blog &amp; SEO Article CMS</h1>
                  <p className={styles.panelSubtitle}>Add, edit, inject backlinks, and optimize keyword landing pages</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={handleSyncBlogsCloud} className={styles.secondaryBtn}>
                    🔄 Cloud Sync 14 Defaults
                  </button>
                  <button onClick={handleOpenNewBlog} className={styles.primaryBtn}>
                    ➕ Create New Blog
                  </button>
                </div>
              </div>

              {/* Search bar */}
              <div style={{ marginBottom: '20px' }}>
                <input
                  type="text"
                  placeholder="Filter articles by title, target keyword, or slug..."
                  value={blogSearch}
                  onChange={e => setBlogSearch(e.target.value)}
                  className={styles.input}
                  style={{ maxWidth: '480px' }}
                />
              </div>

              {/* Blogs Table */}
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Cover</th>
                      <th>Title &amp; Target Keyword</th>
                      <th>Target URL</th>
                      <th>Category</th>
                      <th>Backlinks</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBlogs.map((b) => (
                      <tr key={b.id || b.slug}>
                        <td style={{ width: '80px' }}>
                          <img
                            src={b.coverImage || '/gallery/classroom.jpg'}
                            alt={b.title}
                            style={{ width: '70px', height: '46px', objectFit: 'cover', borderRadius: '6px' }}
                            onError={(e) => { e.target.src = '/gallery/classroom.jpg' }}
                          />
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: '#1a1006', marginBottom: '4px' }}>{b.title}</div>
                          <span style={{ fontSize: '12px', background: '#faf5ed', padding: '2px 8px', borderRadius: '12px', color: '#8b3507', border: '1px solid #e8d9c5' }}>
                            🎯 {b.targetKeyword || 'No keyword assigned'}
                          </span>
                        </td>
                        <td>
                          <code style={{ fontSize: '13px', color: '#b84a0a' }}>
                            {b.targetUrl || `/${b.slug}`}
                          </code>
                        </td>
                        <td>{b.category || 'Guide'}</td>
                        <td>
                          <span style={{ fontWeight: 600, color: '#6b401e' }}>
                            {b.backlinks ? b.backlinks.length : 0} links
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <Link
                              to={b.targetUrl || `/${b.slug}`}
                              target="_blank"
                              className={styles.secondaryBtn}
                              style={{ padding: '4px 10px', fontSize: '12px' }}
                            >
                              View ↗
                            </Link>
                            <button
                              onClick={() => handleOpenEditBlog(b)}
                              className={styles.secondaryBtn}
                              style={{ padding: '4px 10px', fontSize: '12px' }}
                            >
                              Edit ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteBlog(b.id, b.title)}
                              className={styles.dangerBtn}
                              style={{ padding: '4px 10px', fontSize: '12px' }}
                            >
                              Delete 🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: GALLERY MANAGER */}
          {activeTab === 'gallery' && (
            <div>
              <div className={styles.panelHeader}>
                <div>
                  <h1 className={styles.panelTitle}>Campus Gallery Manager</h1>
                  <p className={styles.panelSubtitle}>Upload, organize by section/tag, update alt texts, and reorder campus photos</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={handleSyncGalleryCloud} className={styles.secondaryBtn}>
                    🔄 Restore Defaults
                  </button>
                  <button onClick={handleOpenNewGallery} className={styles.primaryBtn}>
                    ➕ Add Photo
                  </button>
                </div>
              </div>

              {/* Gallery Grid */}
              <div className={styles.galleryAdminGrid}>
                {gallery.map((item, idx) => (
                  <div key={item.id || idx} className={styles.galleryAdminCard}>
                    <img
                      src={item.src}
                      alt={item.alt || item.caption}
                      className={styles.galleryCardImg}
                      onError={(e) => { e.target.src = '/gallery/classroom.jpg' }}
                    />
                    <div className={styles.galleryCardBody}>
                      <span className={styles.galleryCardTag}>{item.tag || 'Infrastructure'}</span>
                      <div className={styles.galleryCardCaption}>{item.caption}</div>
                      <div style={{ fontSize: '12px', color: '#8a6a50', marginBottom: '12px' }}>
                        Alt: <em>{item.alt || 'S.P. Coaching'}</em>
                      </div>
                      <div className={styles.galleryCardActions}>
                        <button
                          onClick={() => handleOpenEditGallery(item)}
                          className={styles.secondaryBtn}
                          style={{ flex: 1, padding: '6px', fontSize: '12px', justifyContent: 'center' }}
                        >
                          Edit ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteGallery(item.id)}
                          className={styles.dangerBtn}
                          style={{ padding: '6px 12px' }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: REVIEW MODERATION */}
          {activeTab === 'reviews' && (
            <div>
              <div className={styles.panelHeader}>
                <div>
                  <h1 className={styles.panelTitle}>Student Review Moderation</h1>
                  <p className={styles.panelSubtitle}>Keep authentic student experiences and remove spam/fake submissions</p>
                </div>
                <button onClick={loadAllData} className={styles.secondaryBtn}>
                  🔄 Refresh Reviews
                </button>
              </div>

              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Rating &amp; Class</th>
                      <th>Comment / Review</th>
                      <th>Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviews.map((rev) => (
                      <tr key={rev.docId || rev.id}>
                        <td>
                          <strong>{rev.name || 'Anonymous Student'}</strong>
                        </td>
                        <td>
                          <div style={{ color: '#f5a623', fontSize: '14px' }}>
                            {'★'.repeat(rev.rating || 5)}
                          </div>
                          <span style={{ fontSize: '12px', color: '#6b401e' }}>{rev.studentClass || rev.grade || 'CBSE/GSEB'}</span>
                        </td>
                        <td style={{ maxWidth: '400px' }}>
                          <p style={{ margin: 0, fontSize: '13.5px', color: '#3d2310', lineHeight: 1.5 }}>
                            "{rev.comment || rev.text}"
                          </p>
                        </td>
                        <td style={{ fontSize: '12px', color: '#8a6a50', whiteSpace: 'nowrap' }}>
                          {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Recent'}
                        </td>
                        <td>
                          <button
                            onClick={() => handleDeleteReview(rev.docId)}
                            className={styles.dangerBtn}
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                          >
                            Delete Spam 🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                    {reviews.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#8a6a50' }}>
                          No reviews found. Submit from the front-end reviews section to moderate here.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: ANNOUNCEMENTS & SITE SETTINGS */}
          {activeTab === 'settings' && (
            <div>
              <div className={styles.panelHeader}>
                <div>
                  <h1 className={styles.panelTitle}>Site Announcements &amp; Contact Info</h1>
                  <p className={styles.panelSubtitle}>Update the top emergency banner, admission notifications, and official phone numbers</p>
                </div>
              </div>

              <div className={styles.cardSection}>
                <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="checkbox"
                      id="announcementToggle"
                      checked={settings.announcementEnabled}
                      onChange={e => setSettings({ ...settings, announcementEnabled: e.target.checked })}
                      style={{ width: '18px', height: '18px', accentColor: '#b84a0a' }}
                    />
                    <label htmlFor="announcementToggle" style={{ fontWeight: 700, fontSize: '15px', color: '#8b3507', cursor: 'pointer' }}>
                      Enable Top Announcement Banner on Live Website
                    </label>
                  </div>

                  <div className={styles.grid2}>
                    <div className={styles.inputGroup}>
                      <label>Announcement Text</label>
                      <input
                        type="text"
                        className={styles.input}
                        value={settings.announcementText}
                        onChange={e => setSettings({ ...settings, announcementText: e.target.value })}
                        placeholder="🎯 Admissions Open for Academic Year 2026-27..."
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label>Badge Tag (e.g. NEW ADMISSIONS)</label>
                      <input
                        type="text"
                        className={styles.input}
                        value={settings.announcementBadge}
                        onChange={e => setSettings({ ...settings, announcementBadge: e.target.value })}
                        placeholder="NEW ADMISSIONS"
                      />
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label>Announcement Link (Where clicks will go)</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={settings.announcementLink}
                      onChange={e => setSettings({ ...settings, announcementLink: e.target.value })}
                      placeholder="/#contact or /coaching-centers-silvassa"
                    />
                  </div>

                  <hr style={{ border: 'none', borderTop: '1.5px solid #e8d9c5', margin: '10px 0' }} />

                  <h3 style={{ fontFamily: 'DM Serif Display', fontSize: '1.3rem', color: '#8b3507', margin: '0' }}>
                    Official Contact &amp; Location Details
                  </h3>

                  <div className={styles.grid2}>
                    <div className={styles.inputGroup}>
                      <label>Primary Phone</label>
                      <input
                        type="text"
                        className={styles.input}
                        value={settings.phone1}
                        onChange={e => setSettings({ ...settings, phone1: e.target.value })}
                        placeholder="+91 98240 06191"
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label>Secondary Phone / WhatsApp</label>
                      <input
                        type="text"
                        className={styles.input}
                        value={settings.phone2}
                        onChange={e => setSettings({ ...settings, phone2: e.target.value })}
                        placeholder="+91 84690 05286"
                      />
                    </div>
                  </div>

                  <div className={styles.grid2}>
                    <div className={styles.inputGroup}>
                      <label>Official Email</label>
                      <input
                        type="email"
                        className={styles.input}
                        value={settings.email}
                        onChange={e => setSettings({ ...settings, email: e.target.value })}
                        placeholder="spcoachingc@gmail.com"
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label>Physical Address</label>
                      <input
                        type="text"
                        className={styles.input}
                        value={settings.location}
                        onChange={e => setSettings({ ...settings, location: e.target.value })}
                        placeholder="Silvassa, Dadra and Nagar Haveli, India"
                      />
                    </div>
                  </div>

                  <button type="submit" className={styles.primaryBtn} style={{ width: 'fit-content', marginTop: '10px' }}>
                    💾 Save All Site Settings &amp; Banner
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 6: SUPABASE & STORAGE CONFIGURATION */}
          {activeTab === 'supabase' && (
            <div>
              <div className={styles.panelHeader}>
                <div>
                  <h1 className={styles.panelTitle}>Supabase Cloud Database &amp; Storage</h1>
                  <p className={styles.panelSubtitle}>Configure Supabase credentials, test live connection, and upload media assets</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={handleTestSupabaseConnection} className={styles.secondaryBtn} disabled={supabaseStatus.testing}>
                    {supabaseStatus.testing ? '⏳ Testing Connection...' : '⚡ Test Connection'}
                  </button>
                  <button onClick={handleCopySql} className={styles.primaryBtn}>
                    {copiedSql ? '✅ SQL Copied!' : '📋 Copy Supabase SQL Schema'}
                  </button>
                </div>
              </div>

              {/* Status Banner */}
              <div className={styles.cardSection} style={{ background: '#faf5ed' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '24px' }}>
                      {isSupabaseConfigured() ? '🟢' : '🟡'}
                    </span>
                    <div>
                      <h3 style={{ margin: 0, color: '#8b3507', fontSize: '1.1rem' }}>
                        {isSupabaseConfigured() ? 'Supabase Credentials Configured' : 'Supabase Not Yet Configured (Using Offline Local & Firestore Fallback)'}
                      </h3>
                      <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6b401e' }}>
                        {supabaseStatus.message || (isSupabaseConfigured() ? 'Connected to Supabase project.' : 'Provide Supabase URL and Anon Key below to enable cloud media storage and PostgreSQL tables.')}
                      </p>
                    </div>
                  </div>
                  <div>
                    {supabaseStatus.tested && (
                      <span className={`${styles.statusPill} ${supabaseStatus.success ? styles.statusSuccess : styles.statusError}`}>
                        {supabaseStatus.success ? '✓ Connected to Supabase' : '✗ Connection Failed'}
                      </span>
                    )}
                  </div>
                </div>

                {supabaseStatus.tables && (
                  <div style={{ marginTop: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {Object.entries(supabaseStatus.tables).map(([tableName, isOk]) => (
                      <span
                        key={tableName}
                        className={`${styles.statusPill} ${isOk ? styles.statusSuccess : styles.statusWarning}`}
                      >
                        {isOk ? '✓' : '⚠️'} {tableName}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Supabase Credentials Form */}
              <div className={styles.cardSection}>
                <div className={styles.cardSectionHeader}>
                  <h2 className={styles.cardSectionTitle}>🔑 Supabase API Credentials</h2>
                </div>
                <form onSubmit={handleSaveSupabaseConfig} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className={styles.inputGroup}>
                    <label>Supabase Project URL (e.g. https://xyzcompany.supabase.co)</label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="https://your-project-ref.supabase.co"
                      value={supabaseConfig.url}
                      onChange={e => setSupabaseConfig({ ...supabaseConfig, url: e.target.value.trim() })}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label>Supabase Anon Public Key</label>
                    <input
                      type="password"
                      className={styles.input}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      value={supabaseConfig.anonKey}
                      onChange={e => setSupabaseConfig({ ...supabaseConfig, anonKey: e.target.value.trim() })}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '8px' }}>
                    <button type="submit" className={styles.primaryBtn}>
                      💾 Save Supabase Credentials
                    </button>
                    <button
                      type="button"
                      onClick={handleTestSupabaseConnection}
                      className={styles.secondaryBtn}
                      disabled={supabaseStatus.testing}
                    >
                      {supabaseStatus.testing ? '⏳ Testing...' : '⚡ Test Connection'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Quick Image & Media Uploader */}
              <div className={styles.cardSection}>
                <div className={styles.cardSectionHeader}>
                  <h2 className={styles.cardSectionTitle}>☁️ Quick Media Asset Uploader</h2>
                </div>
                <p style={{ color: '#5c3b1e', fontSize: '14px', marginBottom: '16px' }}>
                  Upload photos, laboratory charts, topper banners, or syllabus PDFs directly to Supabase Storage bucket <code>sp_media</code>.
                </p>

                <div className={styles.uploadZone}>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleQuickImageUpload}
                    className={styles.fileInputHidden}
                    disabled={quickUploading}
                  />
                  <div className={styles.uploadIcon}>{quickUploading ? '⏳' : '📁'}</div>
                  <div className={styles.uploadText}>
                    {quickUploading ? 'Uploading to Supabase Storage CDN...' : 'Click or Drag & Drop image file to upload'}
                  </div>
                  <div className={styles.uploadSubtext}>Supports JPG, PNG, WEBP, SVG, and PDF (Max 10MB)</div>
                </div>

                {quickUploadUrl && (
                  <div style={{ marginTop: '16px', background: '#fdfbf7', padding: '16px', borderRadius: '10px', border: '1px solid #e8d9c5' }}>
                    <div style={{ fontWeight: 700, color: '#15803d', fontSize: '13px', marginBottom: '8px' }}>
                      ✅ File Ready (Public URL):
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="text"
                        readOnly
                        value={quickUploadUrl}
                        className={styles.input}
                        style={{ fontSize: '12.5px', background: '#fff' }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(quickUploadUrl)
                          showNotification('📋 URL copied to clipboard!')
                        }}
                        className={styles.secondaryBtn}
                        style={{ whiteSpace: 'nowrap' }}
                      >
                        Copy URL 📋
                      </button>
                    </div>
                    {quickUploadUrl.startsWith('data:') === false && (
                      <div style={{ marginTop: '10px' }}>
                        <img
                          src={quickUploadUrl}
                          alt="Uploaded Preview"
                          style={{ maxHeight: '120px', borderRadius: '8px', objectFit: 'contain' }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Complete Supabase SQL Setup Script */}
              <div className={styles.cardSection}>
                <div className={styles.cardSectionHeader}>
                  <h2 className={styles.cardSectionTitle}>🛠️ 1-Click PostgreSQL Database &amp; Storage Schema</h2>
                  <button onClick={handleCopySql} className={styles.secondaryBtn} style={{ fontSize: '12.5px' }}>
                    {copiedSql ? '✅ Copied!' : '📋 Copy SQL Code'}
                  </button>
                </div>
                <p style={{ color: '#5c3b1e', fontSize: '14px' }}>
                  If setting up a fresh Supabase project, go to your <strong>Supabase Dashboard → SQL Editor → New Query</strong>, paste the script below, and click <strong>Run</strong>:
                </p>
                <div className={styles.codeBox}>
                  {SUPABASE_SQL_SCHEMA}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── MODAL: BLOG ADD / EDIT CMS ── */}
      {blogModalOpen && editingBlog && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editingBlog.id ? '✏️ Edit SEO Blog & Backlinks' : '➕ Create New SEO Blog & Landing Page'}
              </h2>
              <button onClick={() => setBlogModalOpen(false)} className={styles.modalClose}>✕</button>
            </div>

            <form onSubmit={handleSaveBlog} className={styles.modalBody}>
              <div className={styles.grid2}>
                <div className={styles.inputGroup}>
                  <label>Article Title *</label>
                  <input
                    type="text"
                    required
                    className={styles.input}
                    value={editingBlog.title}
                    onChange={e => setEditingBlog({ ...editingBlog, title: e.target.value })}
                    placeholder="e.g. Best Tuition Classes in Silvassa (CBSE & GSEB)"
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>URL Slug (e.g. tuition-classes-silvassa) *</label>
                  <input
                    type="text"
                    required
                    className={styles.input}
                    value={editingBlog.slug}
                    onChange={e => setEditingBlog({ ...editingBlog, slug: e.target.value })}
                    placeholder="tuition-classes-silvassa"
                  />
                </div>
              </div>

              <div className={styles.grid3}>
                <div className={styles.inputGroup}>
                  <label>Target URL (e.g. /tuition-classes-silvassa)</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={editingBlog.targetUrl}
                    onChange={e => setEditingBlog({ ...editingBlog, targetUrl: e.target.value })}
                    placeholder="/tuition-classes-silvassa"
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>Target Keyword (Rank Focus)</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={editingBlog.targetKeyword}
                    onChange={e => setEditingBlog({ ...editingBlog, targetKeyword: e.target.value })}
                    placeholder="best tuition classes in silvassa"
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>Category</label>
                  <select
                    className={styles.input}
                    value={editingBlog.category}
                    onChange={e => setEditingBlog({ ...editingBlog, category: e.target.value })}
                  >
                    <option value="Coaching Guide">Coaching Guide</option>
                    <option value="Tuition Directory">Tuition Directory</option>
                    <option value="Area Guide">Area Guide (Tokarkhada / Masat / Rakholi)</option>
                    <option value="Subject Mastery">Subject Mastery (Physics / Commerce)</option>
                    <option value="Board Exam Prep">Board Exam Prep (CBSE / GSEB)</option>
                  </select>
                </div>
              </div>

              <div className={styles.grid2}>
                <div className={styles.inputGroup}>
                  <label>Cover Image URL (Direct link or upload below)</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={editingBlog.coverImage}
                    onChange={e => setEditingBlog({ ...editingBlog, coverImage: e.target.value })}
                    placeholder="/gallery/classroom.jpg or https://..."
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>Cover Image Alt Text (SEO)</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={editingBlog.coverAlt}
                    onChange={e => setEditingBlog({ ...editingBlog, coverAlt: e.target.value })}
                    placeholder="S.P. Coaching Tuition Classes Silvassa"
                  />
                </div>
              </div>

              {/* Upload zone for Blog Cover */}
              <div className={styles.uploadZone} style={{ padding: '14px', margin: '0' }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBlogCoverUpload}
                  className={styles.fileInputHidden}
                  disabled={uploadingBlogImg}
                />
                <div style={{ fontSize: '1.4rem' }}>{uploadingBlogImg ? '⏳' : '📷'}</div>
                <div className={styles.uploadText} style={{ fontSize: '12.5px' }}>
                  {uploadingBlogImg ? 'Uploading cover to Supabase Storage...' : 'Click or drop file to upload cover image directly to Supabase'}
                </div>
              </div>

              {editingBlog.coverImage && (
                <div style={{ width: '100%', height: '140px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #e8d9c5' }}>
                  <img
                    src={editingBlog.coverImage}
                    alt="Cover Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.src = '/gallery/classroom.jpg' }}
                  />
                </div>
              )}

              <div className={styles.inputGroup}>
                <label>Article Excerpt (Short preview snippet)</label>
                <textarea
                  className={styles.textarea}
                  style={{ minHeight: '60px' }}
                  value={editingBlog.excerpt}
                  onChange={e => setEditingBlog({ ...editingBlog, excerpt: e.target.value })}
                  placeholder="Short summary for Google search snippet and social sharing..."
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Meta Description (SEO snippet)</label>
                <input
                  type="text"
                  className={styles.input}
                  value={editingBlog.metaDescription}
                  onChange={e => setEditingBlog({ ...editingBlog, metaDescription: e.target.value })}
                  placeholder="Meta description for search engine ranking (150-160 chars)"
                />
              </div>

              {/* ── BACKLINKS & INTERLINKS BUILDER ── */}
              <div style={{ background: '#faf5ed', padding: '16px', borderRadius: '12px', border: '1.5px solid #e8d9c5' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <label style={{ fontWeight: 700, color: '#8b3507', fontSize: '13px', textTransform: 'uppercase' }}>
                    🔗 Embedded Backlinks &amp; Internal References ({editingBlog.backlinks?.length || 0})
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const list = editingBlog.backlinks ? [...editingBlog.backlinks] : []
                      list.push({ anchorText: '', url: '/', rel: 'dofollow' })
                      setEditingBlog({ ...editingBlog, backlinks: list })
                    }}
                    className={styles.secondaryBtn}
                    style={{ padding: '4px 10px', fontSize: '12px' }}
                  >
                    ➕ Add Backlink
                  </button>
                </div>

                {editingBlog.backlinks && editingBlog.backlinks.map((link, lIdx) => (
                  <div key={lIdx} className={styles.backlinkItem}>
                    <input
                      type="text"
                      className={styles.input}
                      style={{ padding: '8px 12px', fontSize: '13px' }}
                      placeholder="Anchor Text (e.g. Best Commerce Coaching)"
                      value={link.anchorText}
                      onChange={e => {
                        const updated = [...editingBlog.backlinks]
                        updated[lIdx].anchorText = e.target.value
                        setEditingBlog({ ...editingBlog, backlinks: updated })
                      }}
                    />
                    <input
                      type="text"
                      className={styles.input}
                      style={{ padding: '8px 12px', fontSize: '13px' }}
                      placeholder="Target URL (e.g. /commerce-coaching-silvassa)"
                      value={link.url}
                      onChange={e => {
                        const updated = [...editingBlog.backlinks]
                        updated[lIdx].url = e.target.value
                        setEditingBlog({ ...editingBlog, backlinks: updated })
                      }}
                    />
                    <select
                      className={styles.input}
                      style={{ padding: '8px 12px', fontSize: '13px' }}
                      value={link.rel || 'dofollow'}
                      onChange={e => {
                        const updated = [...editingBlog.backlinks]
                        updated[lIdx].rel = e.target.value
                        setEditingBlog({ ...editingBlog, backlinks: updated })
                      }}
                    >
                      <option value="dofollow">dofollow</option>
                      <option value="nofollow">nofollow</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = editingBlog.backlinks.filter((_, i) => i !== lIdx)
                        setEditingBlog({ ...editingBlog, backlinks: updated })
                      }}
                      className={styles.dangerBtn}
                      style={{ padding: '6px' }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {/* ── RICH HTML ARTICLE CONTENT EDITOR ── */}
              <div className={styles.inputGroup}>
                <label>Article Body Content (HTML &amp; Rich Components)</label>

                {/* Editor Quick Toolbar */}
                <div className={styles.editorToolbar}>
                  <button type="button" className={styles.toolBtn} onClick={() => insertTextAtCursor('<h2>', '</h2>')}>H2 Heading</button>
                  <button type="button" className={styles.toolBtn} onClick={() => insertTextAtCursor('<h3>', '</h3>')}>H3 Subheading</button>
                  <button type="button" className={styles.toolBtn} onClick={() => insertTextAtCursor('<strong>', '</strong>')}>Bold</button>
                  <button type="button" className={styles.toolBtn} onClick={() => insertTextAtCursor('<em>', '</em>')}>Italic</button>
                  <button type="button" className={styles.toolBtn} onClick={() => insertTextAtCursor('<p>', '</p>')}>Paragraph</button>
                  <button type="button" className={styles.toolBtn} onClick={() => insertTextAtCursor('<ul>\n  <li>', '</li>\n  <li>Second point</li>\n</ul>')}>Bullet List</button>
                  <button type="button" className={styles.toolBtn} onClick={() => insertTextAtCursor('<div class="highlight-box">\n  <h4>💡 Pro Tip</h4>\n  <p>', '</p>\n</div>')}>Highlight Box</button>
                  <button type="button" className={styles.toolBtn} onClick={() => insertTextAtCursor('<div class="cta-banner">\n  <h3>Ready to Excel in Board Exams?</h3>\n  <p>Join S.P. Coaching Classes Silvassa today.</p>\n  <a href="/#contact" class="btn-cta">Book Free Demo</a>\n</div>')}>CTA Banner</button>
                  <button type="button" className={styles.toolBtn} onClick={() => insertTextAtCursor('<a href="/tuition-classes-silvassa" rel="dofollow">', '</a>')}>Insert Backlink</button>
                  <button type="button" className={styles.toolBtn} onClick={() => insertTextAtCursor('<img src="/gallery/classroom.jpg" alt="S.P. Coaching Classroom" style="width:100%; border-radius:12px; margin:20px 0;" />')}>Insert Image</button>
                </div>

                <textarea
                  id="blogContentTextarea"
                  className={styles.textarea}
                  style={{ minHeight: '300px', borderRadius: '0 0 10px 10px', fontFamily: 'monospace', fontSize: '13.5px' }}
                  value={editingBlog.content}
                  onChange={e => setEditingBlog({ ...editingBlog, content: e.target.value })}
                  placeholder="<h2>Section Title</h2><p>Article body...</p>"
                  required
                />
              </div>

              <div className={styles.modalFooter}>
                <button type="button" onClick={() => setBlogModalOpen(false)} className={styles.secondaryBtn}>
                  Cancel
                </button>
                <button type="submit" className={styles.primaryBtn}>
                  💾 Save &amp; Publish Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: GALLERY ADD / EDIT ── */}
      {galleryModalOpen && editingGallery && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard} style={{ maxWidth: '560px' }}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editingGallery.id ? '✏️ Edit Gallery Image' : '➕ Add Campus Image'}
              </h2>
              <button onClick={() => setGalleryModalOpen(false)} className={styles.modalClose}>✕</button>
            </div>

            <form onSubmit={handleSaveGallery} className={styles.modalBody}>
              <div className={styles.uploadZone}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleGalleryFileUpload}
                  className={styles.fileInputHidden}
                  disabled={uploadingGalleryImg}
                />
                <div className={styles.uploadIcon}>{uploadingGalleryImg ? '⏳' : '📷'}</div>
                <div className={styles.uploadText}>
                  {uploadingGalleryImg ? 'Uploading to Supabase Storage...' : 'Upload Image File to Supabase Storage'}
                </div>
                <div className={styles.uploadSubtext}>JPG, PNG, WEBP supported</div>
              </div>

              <div className={styles.inputGroup}>
                <label>Image Source / Path (Auto-filled upon upload) *</label>
                <input
                  type="text"
                  required
                  className={styles.input}
                  value={editingGallery.src}
                  onChange={e => setEditingGallery({ ...editingGallery, src: e.target.value })}
                  placeholder="/gallery/classroom.jpg or https://..."
                />
              </div>

              {/* Preview */}
              {editingGallery.src && (
                <div style={{ width: '100%', height: '160px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #e8d9c5' }}>
                  <img
                    src={editingGallery.src}
                    alt="Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.src = '/gallery/classroom.jpg' }}
                  />
                </div>
              )}

              <div className={styles.inputGroup}>
                <label>Caption / Title *</label>
                <input
                  type="text"
                  required
                  className={styles.input}
                  value={editingGallery.caption}
                  onChange={e => setEditingGallery({ ...editingGallery, caption: e.target.value })}
                  placeholder="e.g. Modern Air-Conditioned Classrooms"
                />
              </div>

              <div className={styles.grid2}>
                <div className={styles.inputGroup}>
                  <label>Section / Category Tag</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={editingGallery.tag}
                    onChange={e => setEditingGallery({ ...editingGallery, tag: e.target.value })}
                    placeholder="Classroom / Lab / Events / Sports"
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>Display Order</label>
                  <input
                    type="number"
                    className={styles.input}
                    value={editingGallery.order || 1}
                    onChange={e => setEditingGallery({ ...editingGallery, order: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>Alt Text for SEO</label>
                <input
                  type="text"
                  className={styles.input}
                  value={editingGallery.alt}
                  onChange={e => setEditingGallery({ ...editingGallery, alt: e.target.value })}
                  placeholder="S.P. Coaching Classes Silvassa Classroom"
                />
              </div>

              <div className={styles.modalFooter}>
                <button type="button" onClick={() => setGalleryModalOpen(false)} className={styles.secondaryBtn}>
                  Cancel
                </button>
                <button type="submit" className={styles.primaryBtn}>
                  💾 Save Image
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: CHANGE ADMIN PASSWORD ── */}
      {passwordModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard} style={{ maxWidth: '440px' }}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>🔑 Change Admin Password</h2>
              <button onClick={() => setPasswordModalOpen(false)} className={styles.modalClose}>✕</button>
            </div>

            <form onSubmit={handlePasswordChangeSubmit} className={styles.modalBody}>
              <div className={styles.inputGroup}>
                <label>New Password</label>
                <input
                  type="password"
                  required
                  className={styles.input}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Confirm New Password</label>
                <input
                  type="password"
                  required
                  className={styles.input}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                />
              </div>

              <div className={styles.modalFooter}>
                <button type="button" onClick={() => setPasswordModalOpen(false)} className={styles.secondaryBtn}>
                  Cancel
                </button>
                <button type="submit" className={styles.primaryBtn}>
                  Update Password 🔒
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
