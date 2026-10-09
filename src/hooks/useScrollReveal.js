// ── useScrollReveal ──────────────────────────────────────
// Adds .visible class to elements with .reveal / .reveal-left / .reveal-right
// when they enter the viewport and watches for dynamic DOM updates.
import { useEffect } from 'react'

export default function useScrollReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('visible')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.08 }
    )

    const observeElements = () => {
      const els = document.querySelectorAll('.reveal:not(.visible), .reveal-left:not(.visible), .reveal-right:not(.visible)')
      els.forEach(el => io.observe(el))
    }

    observeElements()

    // Watch for DOM changes (dynamic content, React state re-renders)
    const mo = new MutationObserver(() => {
      observeElements()
    })
    mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] })

    return () => {
      io.disconnect()
      mo.disconnect()
    }
  }, [])
}
