// ── siteService.js ────────────────────────────────────────
// Handles site announcements, review moderation, and settings via Supabase & Firebase
import { getSupabase, isSupabaseConfigured } from './supabase'
import {
  db,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  orderBy
} from '../firebase'

const SETTINGS_DOC = 'general_settings'

export async function getSiteSettings() {
  const supabase = getSupabase()

  // 1. Supabase
  if (supabase && isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('sp_settings')
        .select('*')
        .eq('id', SETTINGS_DOC)
        .single()

      if (!error && data && data.data) {
        return data.data
      }
    } catch (e) {
      console.warn('Supabase settings fetch notice:', e)
    }
  }

  // 2. Firestore
  try {
    const snap = await getDoc(doc(db, 'sp_settings', SETTINGS_DOC))
    if (snap.exists()) {
      return snap.data()
    }
  } catch (e) {
    console.warn('Could not fetch settings from Firestore:', e)
  }

  // 3. Local fallback
  try {
    const local = localStorage.getItem('sp_site_settings_v1')
    if (local) return JSON.parse(local)
  } catch (e) {}

  return {
    announcementEnabled: true,
    announcementText: '🎯 Admissions Open for Academic Year 2026-27 (Class 5th–12th, CBSE & GSEB, NEET & JEE)!',
    announcementBadge: 'NEW ADMISSIONS',
    announcementLink: '/#contact',
    phone1: '+91 98240 06191',
    phone2: '+91 84690 05286',
    email: 'spcoachingc@gmail.com',
    location: 'Silvassa, Dadra and Nagar Haveli, India'
  }
}

export async function updateSiteSettings(newSettings) {
  try {
    localStorage.setItem('sp_site_settings_v1', JSON.stringify(newSettings))
  } catch (e) {}

  const supabase = getSupabase()
  if (supabase && isSupabaseConfigured()) {
    try {
      await supabase.from('sp_settings').upsert({
        id: SETTINGS_DOC,
        data: newSettings,
        updated_at: new Date().toISOString()
      })
    } catch (e) {
      console.warn('Supabase settings update warning:', e)
    }
  }

  try {
    await setDoc(doc(db, 'sp_settings', SETTINGS_DOC), {
      ...newSettings,
      updatedAt: new Date().toISOString()
    })
  } catch (e) {
    console.warn('Firestore settings update failed:', e)
  }
  return newSettings
}

export async function getAllReviews() {
  const supabase = getSupabase()

  // 1. Supabase
  if (supabase && isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('sp_comments')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data && data.length > 0) {
        return data.map(d => ({
          docId: d.id,
          name: d.name,
          course: d.course,
          avatar: d.avatar,
          stars: d.stars,
          text: d.text,
          likes: d.likes,
          date: d.date,
          createdAt: d.created_at
        }))
      }
    } catch (e) {
      console.warn('Supabase reviews fetch warning:', e)
    }
  }

  // 2. Firestore
  try {
    const q = query(collection(db, 'sp_comments'), orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ docId: d.id, ...d.data() }))
  } catch (e) {
    console.warn('Firestore reviews fetch failed:', e)
    return []
  }
}

export async function deleteReview(docId) {
  const supabase = getSupabase()
  if (supabase && isSupabaseConfigured()) {
    try {
      await supabase.from('sp_comments').delete().eq('id', docId)
    } catch (e) {}
  }

  try {
    await deleteDoc(doc(db, 'sp_comments', docId))
    return true
  } catch (e) {
    console.error('Failed to delete review:', e)
    throw e
  }
}
