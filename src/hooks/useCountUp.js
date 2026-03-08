// ── useCountUp ───────────────────────────────────────────
// Animates [data-target] elements with class .count-up
// when they scroll into view.
import { useEffect } from 'react'

export default function useCountUp() {
  useEffect(() => {
    const els = document.querySelectorAll('.count-up')
    const io = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (!e.isIntersecting) return
        const el      = e.target
        const target  = parseInt(el.dataset.target)
        const suffix  = el.dataset.suffix || ''
        const dur     = 1500
        let   start   = null
        const step    = ts => {
          if (!start) start = ts
          const p = Math.min((ts - start) / dur, 1)
          el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * target) + suffix
          if (p < 1) requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
        io.unobserve(el)
      }),
      { threshold: 0.5 }
    )
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])
}
