// ── Contact.jsx ──────────────────────────────────────────
// Enquiry form using Web3Forms — NO template setup needed!
//
// SETUP (2 minutes, totally free):
//  1. Go to https://web3forms.com
//  2. Enter spcoachingc@gmail.com → click "Create Access Key"
//  3. Copy the key and paste it below — that's it!
// ─────────────────────────────────────────────────────────
import { useState, useRef, useEffect } from 'react'
import styles from './Contact.module.css'

// ✏️ ONLY THIS ONE LINE TO CHANGE:
const WEB3FORMS_KEY = '380e6955-ee01-4775-ad01-10b632238441'  // from web3forms.com (free)

/* Ring canvas animation */
function RingCanvas() {
  const ref = useRef(null)
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext('2d')
    let W, H, angle = 0, raf
    const resize = () => { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight }
    resize(); window.addEventListener('resize', resize)
    const draw = () => {
      ctx.clearRect(0, 0, W, H); angle += .003
      for (let i = 0; i < 5; i++) {
        ctx.save(); ctx.translate(W * .75, H * .3)
        ctx.rotate(angle * (i % 2 === 0 ? 1 : -1) * (i + 1) * .3)
        ctx.beginPath()
        for (let d = 0; d < 360; d += 30) {
          const r = 80 + i * 60, rad = d * Math.PI / 180
          d === 0 ? ctx.moveTo(Math.cos(rad)*r, Math.sin(rad)*r) : ctx.lineTo(Math.cos(rad)*r, Math.sin(rad)*r)
        }
        ctx.closePath()
        ctx.strokeStyle = `rgba(255,180,80,${.04 + i * .01})`; ctx.lineWidth = 1; ctx.stroke(); ctx.restore()
      }
      for (let i = 0; i < 20; i++) {
        const x = Math.sin(angle*(.5+i*.1)+i)*W*.4+W*.5
        const y = Math.cos(angle*(.3+i*.15)+i)*H*.3+H*.5
        ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI*2)
        ctx.fillStyle = `rgba(255,200,100,${Math.abs(Math.sin(angle*2+i))*.2})`; ctx.fill()
      }
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(raf) }
  }, [])
  return <canvas ref={ref} className={styles.canvas} />
}

const BLANK = { studentName:'', parentName:'', phone:'', email:'', currentClass:'', course:'', message:'', botcheck:'' }

export default function Contact() {
  const [form,   setForm]   = useState(BLANK)
  const [status, setStatus] = useState('idle')  // idle | sending | success | error
  const [errMsg, setErrMsg] = useState('')

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    // Botcheck honeypot field
    if (form.botcheck) return
    setStatus('sending'); setErrMsg('')

    // Build a clean, readable email body — no template needed!
    const emailBody = `
New Enquiry from SP Coaching Website
=====================================

👤 Student Name  : ${form.studentName}
👨‍👩‍👧 Parent Name   : ${form.parentName}
📞 Phone         : ${form.phone}
✉️  Email         : ${form.email}
📚 Current Class : ${form.currentClass}
🎯 Course        : ${form.course}

💬 Message:
${form.message || '(No message provided)'}

=====================================
Sent from SP Coaching Website Contact Form
    `.trim()

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject:    `📩 New Enquiry – ${form.studentName} (${form.course})`,
          from_name:  'SP Coaching Website',
          replyto:    form.email,
          message:    emailBody,

          // These show as clean fields in the email too
          'Student Name':  form.studentName,
          'Parent Name':   form.parentName,
          'Phone':         form.phone,
          'Email':         form.email,
          'Current Class': form.currentClass,
          'Course':        form.course,
          'Message':       form.message || '—',
        }),
      })

      const data = await res.json()
      if (data.success) {
        setStatus('success')
        setForm(BLANK)
      } else {
        throw new Error(data.message || 'Submission failed')
      }
    } catch (err) {
      console.error(err)
      setStatus('error')
      setErrMsg('Could not send message. Please call us or email spcoachingc@gmail.com directly.')
    }
  }

  return (
    <section id="contact" className={styles.section}>
      <div className={styles.bg} /><RingCanvas />
      <div className="container">
        <span className="section-tag light reveal">GET IN TOUCH</span>
        <h2 className={`${styles.heading} reveal`}>Enroll or <span className={styles.accent}>Contact Us</span></h2>
        <p className={`${styles.subtext} reveal`}>Ready to start your journey to excellence? Reach out or fill the form below.</p>

        <div className={styles.inner}>

          {/* ── Info cards ── */}
          <div className={`${styles.info} reveal-left`}>
            <a href="tel:+919824006191" className={styles.ciCard}>
              <span className={styles.ciIcon}>📞</span>
              <div>
                <strong>PHONE</strong>
                <p>+91 98240 06191</p>
                <p>+91 84690 05286</p>
              </div>
            </a>
            <a href="mailto:spcoachingc@gmail.com" className={styles.ciCard}>
              <span className={styles.ciIcon}>✉</span>
              <div>
                <strong>EMAIL</strong>
                <p>spcoachingc@gmail.com</p>
              </div>
            </a>
            <a
              href="https://www.google.com/maps/search/?api=1&query=S.P.+Coaching+Classes+Silvassa"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.ciCard}
            >
              <span className={styles.ciIcon}>📍</span>
              <div>
                <strong>ADDRESS</strong>
                <p>S.P. Coaching Classes</p>
                <p>Silvassa, Dadra and Nagar Haveli</p>
              </div>
            </a>
            <div className={styles.ciCard}>
              <span className={styles.ciIcon}>🕐</span>
              <div>
                <strong>OFFICE HOURS</strong>
                <p>Monday – Saturday</p>
                <p>7:00 AM – 9:00 PM</p>
              </div>
            </div>
            <div className={styles.ganeshCard}>
              <div>॥ श्री गणेशाय नमः ॥</div>
              <p>Free counseling available for new admissions. Walk in any weekday!</p>
            </div>
          </div>

          {/* ── Form ── */}
          <div className={`${styles.formWrap} reveal-right`}>
            {status === 'success' ? (
              <div className={styles.success}>
                <div className={styles.successIcon}>✅</div>
                <h3>Message Sent!</h3>
                <p>Thank you! We'll call you back within 24 hours.</p>
                <button className={styles.btnSubmit} onClick={() => setStatus('idle')}>Send Another Enquiry</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Honeypot field for spam prevention */}
                <input
                  type="checkbox"
                  name="botcheck"
                  checked={!!form.botcheck}
                  onChange={e => setForm(f => ({ ...f, botcheck: e.target.checked }))}
                  style={{ display: 'none' }}
                  tabIndex={-1}
                  autoComplete="off"
                />
                <h3 className={styles.formTitle}>Send Us a Message</h3>
                <p className={styles.formNote}>We'll get back to you within 24 hours. Fields marked * are required.</p>

                {status === 'error' && (
                  <div className={styles.errorBox}>⚠️ {errMsg}</div>
                )}

                <div className={styles.row}>
                  <div className={styles.group}>
                    <label>STUDENT NAME *</label>
                    <input name="studentName" value={form.studentName} onChange={handleChange}
                      placeholder="Full name" required />
                  </div>
                  <div className={styles.group}>
                    <label>PARENT NAME *</label>
                    <input name="parentName" value={form.parentName} onChange={handleChange}
                      placeholder="Parent / guardian name" required />
                  </div>
                </div>

                <div className={styles.row}>
                  <div className={styles.group}>
                    <label>PHONE NUMBER *</label>
                    <input name="phone" value={form.phone} onChange={handleChange}
                      placeholder="+91 XXXXX XXXXX" required />
                  </div>
                  <div className={styles.group}>
                    <label>EMAIL ADDRESS</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange}
                      placeholder="your@email.com" />
                  </div>
                </div>

                <div className={styles.row}>
                  <div className={styles.group}>
                    <label>CURRENT CLASS *</label>
                    <select name="currentClass" value={form.currentClass} onChange={handleChange} required>
                      <option value="">Select Class</option>
                      {['5th','6th','7th','8th','9th','10th','11th','12th','Dropper'].map(c => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.group}>
                    <label>COURSE INTERESTED IN *</label>
                    <select name="course" value={form.course} onChange={handleChange} required>
                      <option value="">Select Course</option>
                      {['CBSE Coaching','GSEB Coaching','NEET Preparation','JEE Preparation','Foundation Course'].map(c => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={styles.group}>
                  <label>MESSAGE</label>
                  <textarea name="message" value={form.message} onChange={handleChange}
                    rows={4} placeholder="Any questions, preferred batch timing, or anything else..." />
                </div>

                <button type="submit" className={styles.btnSubmit} disabled={status === 'sending'}>
                  {status === 'sending' ? '⏳ Sending...' : 'Send Enquiry →'}
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </section>
  )
}
