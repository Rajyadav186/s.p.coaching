// ── blogService.js ────────────────────────────────────────
// Manages blog retrieval, creation, updating, and syncing with Supabase & Firebase Firestore
import { getSupabase, isSupabaseConfigured } from './supabase'
import {
  db,
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy
} from '../firebase'
import { DEFAULT_BLOGS } from '../data/defaultBlogs'

const BLOGS_COLLECTION = 'sp_blogs'
const LOCAL_STORAGE_KEY = 'sp_local_blogs_v1'

// Helper to normalize Supabase record to camelCase frontend schema
function formatSupabaseBlog(row) {
  if (!row) return null
  const targetKeyword = row.primary_keyword || ''
  const metaDescription = row.meta_desc || row.excerpt || ''
  const readTime = row.reading_time || '5 min read'
  const coverImage = row.image || '/gallery/classroom.jpg'

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    targetUrl: row.target_url || `/${row.slug}`,
    targetKeyword,
    primaryKeyword: targetKeyword,
    excerpt: row.excerpt || '',
    content: row.content || '',
    metaTitle: row.meta_title || row.title,
    metaDescription,
    metaDesc: metaDescription,
    category: row.category || 'General',
    readTime,
    readingTime: readTime,
    publishDate: row.publish_date || '',
    coverImage,
    image: coverImage,
    backlinks: Array.isArray(row.backlinks) ? row.backlinks : [],
    faqs: Array.isArray(row.faqs) ? row.faqs : [],
    updatedAt: row.updated_at
  }
}

// Helper to format frontend object to Supabase database columns
function formatForSupabase(blog) {
  return {
    id: blog.id,
    title: blog.title,
    slug: blog.slug,
    target_url: blog.targetUrl || `/${blog.slug}`,
    primary_keyword: blog.targetKeyword || blog.primaryKeyword || '',
    excerpt: blog.excerpt || '',
    content: blog.content || '',
    meta_title: blog.metaTitle || blog.title,
    meta_desc: blog.metaDescription || blog.metaDesc || blog.excerpt,
    category: blog.category || 'General',
    reading_time: blog.readTime || blog.readingTime || '5 min read',
    publish_date: blog.publishDate || new Date().toISOString().split('T')[0],
    image: blog.coverImage || blog.image || '/gallery/classroom.jpg',
    backlinks: blog.backlinks || [],
    faqs: blog.faqs || [],
    updated_at: new Date().toISOString()
  }
}

// Helper to get local fallback blogs
export function getLocalBlogs() {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (e) {
    console.warn('Could not read local blogs from storage', e)
  }
  return DEFAULT_BLOGS
}

export function saveLocalBlogs(blogs) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(blogs))
  } catch (e) {}
}

// Fetch all blogs (Try Supabase -> Try Firestore -> Local Fallback)
export async function getAllBlogs() {
  const supabase = getSupabase()

  // 1. Try Supabase
  if (supabase && isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('sp_blogs')
        .select('*')
        .order('publish_date', { ascending: false })

      if (!error && data) {
        const formatted = data.map(formatSupabaseBlog)
        saveLocalBlogs(formatted)
        return formatted
      }
    } catch (err) {
      console.warn('Supabase blog fetch failed, trying Firestore:', err)
    }
  }

  // 2. Try Firestore
  try {
    const q = query(collection(db, BLOGS_COLLECTION), orderBy('publishDate', 'desc'))
    const snap = await getDocs(q)
    if (!snap.empty) {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      saveLocalBlogs(list)
      return list
    }
  } catch (err) {
    console.warn('Firestore blog fetch failed, using local/default store:', err)
  }

  // 3. Fallback to Local Storage / Default Built-in Blogs
  return getLocalBlogs()
}

// Fetch single blog by slug (e.g. "coaching-centers-silvassa")
export async function getBlogBySlug(slug) {
  const cleanSlug = slug.replace(/^\//, '').trim().toLowerCase()
  const all = await getAllBlogs()
  return all.find(b => b.slug.toLowerCase() === cleanSlug || (b.targetUrl && b.targetUrl.replace(/^\//, '').toLowerCase() === cleanSlug)) || null
}

// Save or Update a Blog in Supabase, Firestore & localStorage
export async function saveBlog(blogData) {
  const id = blogData.id || `blog-${Date.now()}`
  const slug = (blogData.slug || blogData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')).replace(/^\//, '')

  const payload = {
    ...blogData,
    id,
    slug,
    targetUrl: blogData.targetUrl || `/${slug}`,
    targetKeyword: blogData.targetKeyword || blogData.primaryKeyword || '',
    primaryKeyword: blogData.targetKeyword || blogData.primaryKeyword || '',
    metaDescription: blogData.metaDescription || blogData.metaDesc || blogData.excerpt || '',
    metaDesc: blogData.metaDescription || blogData.metaDesc || blogData.excerpt || '',
    readTime: blogData.readTime || blogData.readingTime || '5 min read',
    readingTime: blogData.readTime || blogData.readingTime || '5 min read',
    coverImage: blogData.coverImage || blogData.image || '/gallery/classroom.jpg',
    image: blogData.coverImage || blogData.image || '/gallery/classroom.jpg',
    publishDate: blogData.publishDate || new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString()
  }

  // 1. Save to Supabase
  const supabase = getSupabase()
  if (supabase && isSupabaseConfigured()) {
    try {
      const row = formatForSupabase(payload)
      const { error } = await supabase.from('sp_blogs').upsert(row)
      if (error) console.warn('Supabase blog upsert notice:', error.message)
    } catch (e) {
      console.warn('Supabase write exception:', e)
    }
  }

  // 2. Save to Firestore
  try {
    await setDoc(doc(db, BLOGS_COLLECTION, id), payload)
  } catch (err) {
    console.warn('Firestore write notice:', err)
  }

  // 3. Update local cache
  const local = getLocalBlogs()
  const index = local.findIndex(b => b.id === id || b.slug === slug)
  if (index >= 0) {
    local[index] = payload
  } else {
    local.unshift(payload)
  }
  saveLocalBlogs(local)

  return payload
}

// Delete a Blog
export async function deleteBlog(id) {
  const supabase = getSupabase()
  if (supabase && isSupabaseConfigured()) {
    try {
      await supabase.from('sp_blogs').delete().eq('id', id)
    } catch (e) {}
  }

  try {
    await deleteDoc(doc(db, BLOGS_COLLECTION, id))
  } catch (err) {}

  const local = getLocalBlogs().filter(b => b.id !== id)
  saveLocalBlogs(local)
  return true
}

// Sync all 14 default SEO blogs to Supabase & Firestore
export async function syncDefaultBlogsToCloud() {
  let count = 0
  const supabase = getSupabase()

  // Supabase sync
  if (supabase && isSupabaseConfigured()) {
    try {
      const rows = DEFAULT_BLOGS.map(formatForSupabase)
      const { error } = await supabase.from('sp_blogs').upsert(rows)
      if (!error) count += DEFAULT_BLOGS.length
    } catch (e) {
      console.warn('Supabase sync error:', e)
    }
  }

  // Firestore sync
  for (const b of DEFAULT_BLOGS) {
    try {
      await setDoc(doc(db, BLOGS_COLLECTION, b.id), b)
      if (!supabase) count++
    } catch (e) {
      console.error('Error syncing blog to Firestore:', b.id, e)
    }
  }

  saveLocalBlogs(DEFAULT_BLOGS)
  return count
}
