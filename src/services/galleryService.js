// ── galleryService.js ─────────────────────────────────────
// Manages gallery photos, sections/tags, and Supabase / Firestore persistence
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
import { DEFAULT_GALLERY_IMAGES } from '../data/defaultGallery'

const GALLERY_COLLECTION = 'sp_gallery'
const LOCAL_GALLERY_KEY = 'sp_local_gallery_v1'

function formatSupabaseGallery(row) {
  if (!row) return null
  return {
    id: row.id,
    src: row.src,
    caption: row.caption || '',
    alt: row.alt || row.caption || '',
    tag: row.tag || 'Campus',
    order: row.order !== undefined ? Number(row.order) : 99,
    updatedAt: row.updated_at
  }
}

function formatForSupabase(item) {
  return {
    id: item.id,
    src: item.src,
    caption: item.caption || '',
    alt: item.alt || item.caption || '',
    tag: item.tag || 'Campus',
    order: item.order !== undefined ? Number(item.order) : 99,
    updated_at: new Date().toISOString()
  }
}

export function getLocalGallery() {
  try {
    const saved = localStorage.getItem(LOCAL_GALLERY_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (e) {}
  return DEFAULT_GALLERY_IMAGES
}

export function saveLocalGallery(items) {
  try {
    localStorage.setItem(LOCAL_GALLERY_KEY, JSON.stringify(items))
  } catch (e) {}
}

// Fetch all gallery images (Supabase -> Firestore -> Local)
export async function getAllGalleryImages() {
  const supabase = getSupabase()

  // 1. Supabase
  if (supabase && isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('sp_gallery')
        .select('*')
        .order('order', { ascending: true })

      if (!error && data && data.length > 0) {
        const formatted = data.map(formatSupabaseGallery)
        saveLocalGallery(formatted)
        return formatted
      }
    } catch (err) {
      console.warn('Supabase gallery fetch warning:', err)
    }
  }

  // 2. Firestore
  try {
    const q = query(collection(db, GALLERY_COLLECTION), orderBy('order', 'asc'))
    const snap = await getDocs(q)
    if (!snap.empty) {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      saveLocalGallery(list)
      return list
    }
  } catch (err) {
    console.warn('Firestore gallery fetch warning:', err)
  }

  // 3. Local
  return getLocalGallery()
}

// Save or Update a Gallery Item
export async function saveGalleryItem(item) {
  const id = item.id || `gal-${Date.now()}`
  const payload = {
    ...item,
    id,
    src: item.src || '/gallery/classroom.jpg',
    caption: item.caption || 'S.P. Coaching Classes Silvassa',
    alt: item.alt || item.caption || 'S.P. Coaching photo',
    tag: item.tag || 'Classroom',
    order: item.order !== undefined ? Number(item.order) : 99,
    updatedAt: new Date().toISOString()
  }

  // Supabase
  const supabase = getSupabase()
  if (supabase && isSupabaseConfigured()) {
    try {
      const row = formatForSupabase(payload)
      await supabase.from('sp_gallery').upsert(row)
    } catch (e) {
      console.warn('Supabase gallery save warning:', e)
    }
  }

  // Firestore
  try {
    await setDoc(doc(db, GALLERY_COLLECTION, id), payload)
  } catch (e) {
    console.warn('Firestore write warning for gallery:', e)
  }

  // Local
  const local = getLocalGallery()
  const idx = local.findIndex(g => g.id === id)
  if (idx >= 0) {
    local[idx] = payload
  } else {
    local.push(payload)
  }
  saveLocalGallery(local)
  return payload
}

// Delete a Gallery Item
export async function deleteGalleryItem(id) {
  const supabase = getSupabase()
  if (supabase && isSupabaseConfigured()) {
    try {
      await supabase.from('sp_gallery').delete().eq('id', id)
    } catch (e) {}
  }

  try {
    await deleteDoc(doc(db, GALLERY_COLLECTION, id))
  } catch (e) {}

  const local = getLocalGallery().filter(g => g.id !== id)
  saveLocalGallery(local)
  return true
}

// Sync default gallery items to Cloud
export async function syncDefaultGalleryToCloud() {
  let count = 0
  const supabase = getSupabase()

  // Supabase sync
  if (supabase && isSupabaseConfigured()) {
    try {
      const rows = DEFAULT_GALLERY_IMAGES.map(formatForSupabase)
      const { error } = await supabase.from('sp_gallery').upsert(rows)
      if (!error) count += DEFAULT_GALLERY_IMAGES.length
    } catch (e) {
      console.warn('Supabase gallery sync error:', e)
    }
  }

  // Firestore sync
  for (const item of DEFAULT_GALLERY_IMAGES) {
    try {
      await setDoc(doc(db, GALLERY_COLLECTION, item.id), item)
      if (!supabase) count++
    } catch (e) {
      console.error('Error syncing gallery item:', item.id, e)
    }
  }

  saveLocalGallery(DEFAULT_GALLERY_IMAGES)
  return count
}
