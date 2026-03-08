// ── Cursor.jsx ───────────────────────────────────────────
// Custom animated cursor + click ripple effect
import { useEffect, useRef, useState } from 'react'
import styles from './Cursor.module.css'

export default function Cursor() {
  const cursorRef = useRef(null)
  const ringRef   = useRef(null)
  const mouse     = useRef({ x: 0, y: 0 })
  const ring      = useRef({ x: 0, y: 0 })
  const raf       = useRef(null)
  const [ripples, setRipples] = useState([])

  useEffect(() => {
    // Move dot instantly
    const onMove = e => {
      mouse.current = { x: e.clientX, y: e.clientY }
      if (cursorRef.current) {
        cursorRef.current.style.left = e.clientX + 'px'
        cursorRef.current.style.top  = e.clientY + 'px'
      }
    }

    // Lag ring behind
    const animate = () => {
      ring.current.x += (mouse.current.x - ring.current.x) * 0.12
      ring.current.y += (mouse.current.y - ring.current.y) * 0.12
      if (ringRef.current) {
        ringRef.current.style.left = ring.current.x + 'px'
        ringRef.current.style.top  = ring.current.y + 'px'
      }
      raf.current = requestAnimationFrame(animate)
    }

    // Hover enlarge
    const addH = () => { cursorRef.current?.classList.add('hover');   ringRef.current?.classList.add('hover') }
    const rmH  = () => { cursorRef.current?.classList.remove('hover'); ringRef.current?.classList.remove('hover') }
    const bindHover = () => {
      document.querySelectorAll('a,button,.course-card,.why-card,.stat-card,.mv-card,.topper-card').forEach(el => {
        el.addEventListener('mouseenter', addH)
        el.addEventListener('mouseleave', rmH)
      })
    }

    // Click ripple
    const onClick = e => {
      const id = Date.now()
      setRipples(r => [...r, { id, x: e.clientX - 30, y: e.clientY - 30 }])
      setTimeout(() => setRipples(r => r.filter(x => x.id !== id)), 700)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('click', onClick)
    animate()
    // bind after short delay so elements are rendered
    const t = setTimeout(bindHover, 800)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('click', onClick)
      cancelAnimationFrame(raf.current)
      clearTimeout(t)
    }
  }, [])

  return (
    <>
      <div className={styles.cursor}     ref={cursorRef} />
      <div className={styles.cursorRing} ref={ringRef}   />
      <div className={styles.rippleContainer}>
        {ripples.map(r => (
          <div key={r.id} className={styles.ripple}
            style={{ left: r.x, top: r.y, width: 60, height: 60 }} />
        ))}
      </div>
    </>
  )
}
