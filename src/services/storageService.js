// ── storageService.js ─────────────────────────────────────
// Manages media uploads to Supabase Storage Buckets
import { getSupabase, isSupabaseConfigured } from './supabase'

const DEFAULT_BUCKET = 'sp_media'

/**
 * Upload a File or Blob directly to Supabase Storage
 * @param {File|Blob} file - The file to upload
 * @param {string} folder - Destination subfolder (e.g. 'gallery', 'blogs', 'logos')
 * @returns {Promise<{success: boolean, url?: string, error?: string}>}
 */
export async function uploadMediaToSupabase(file, folder = 'general') {
  if (!file) {
    return { success: false, error: 'No file provided for upload.' }
  }

  const supabase = getSupabase()
  if (!supabase || !isSupabaseConfigured()) {
    // If Supabase is not yet configured, create local Data URL as instant working fallback
    try {
      const dataUrl = await fileToDataUrl(file)
      return {
        success: true,
        url: dataUrl,
        isLocalFallback: true,
        message: 'Saved locally as image preview (configure Supabase in Admin Settings for cloud hosting).'
      }
    } catch (e) {
      return { success: false, error: 'Failed to process local image file.' }
    }
  }

  try {
    // Clean file name
    const ext = file.name ? file.name.split('.').pop() : 'jpg'
    const cleanName = file.name
      ? file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      : `media_${Date.now()}.${ext}`
    const fileName = `${folder}/${Date.now()}_${cleanName}`

    // 1. Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(DEFAULT_BUCKET)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type || 'image/jpeg'
      })

    if (error) {
      // If bucket does not exist or permission error, handle gracefully
      console.warn('Supabase storage upload error:', error)
      const dataUrl = await fileToDataUrl(file)
      return {
        success: true,
        url: dataUrl,
        isLocalFallback: true,
        error: `Supabase Bucket '${DEFAULT_BUCKET}' note: ${error.message}. Saved preview locally.`
      }
    }

    // 2. Get Public URL
    const { data: publicData } = supabase.storage
      .from(DEFAULT_BUCKET)
      .getPublicUrl(fileName)

    const publicUrl = publicData?.publicUrl || ''

    return {
      success: true,
      url: publicUrl,
      path: data.path,
      isLocalFallback: false
    }
  } catch (err) {
    console.error('Storage upload exception:', err)
    const dataUrl = await fileToDataUrl(file).catch(() => '')
    return {
      success: Boolean(dataUrl),
      url: dataUrl || '',
      isLocalFallback: true,
      error: err.message
    }
  }
}

/**
 * Convert a File object to Data URL (base64)
 */
export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
    reader.readAsDataURL(file)
  })
}

/**
 * List files from Supabase Storage folder
 */
export async function listStorageFiles(folder = '') {
  const supabase = getSupabase()
  if (!supabase) return []

  try {
    const { data, error } = await supabase.storage
      .from(DEFAULT_BUCKET)
      .list(folder, { limit: 100, sortBy: { column: 'created_at', order: 'desc' } })

    if (error) throw error
    return data || []
  } catch (e) {
    console.warn('Failed to list files from Supabase storage:', e)
    return []
  }
}
