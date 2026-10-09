// ── FAQ.jsx ──────────────────────────────────────────────
// Frequently Asked Questions – Accordion format for SEO & AEO optimization
import { useState } from 'react'
import styles from './FAQ.module.css'

const FAQS = [
  {
    q: 'What courses does S.P. Coaching Classes offer?',
    a: 'We offer comprehensive coaching for CBSE and GSEB boards (Classes 5 to 12), competitive entrance exam preparation for NEET and JEE, as well as a Foundation Course for Classes 5 to 8 to build strong math and science fundamentals.',
  },
  {
    q: 'Where is S.P. Coaching Classes located?',
    a: 'We are located in Silvassa, Dadra and Nagar Haveli, India. Our center is conveniently accessible for students across Silvassa and surrounding areas.',
  },
  {
    q: 'What is the batch size at S.P. Coaching Classes?',
    a: 'We strictly maintain small batches with a maximum of 20 students per batch. This ensures individual attention, regular interaction with teachers, and personalised doubt solving for every learner.',
  },
  {
    q: 'What are the class timings?',
    a: 'We offer flexible morning and evening batches from Monday to Saturday, operating between 7:00 AM and 9:00 PM. Specific batch schedules vary by class and stream — please contact us for details.',
  },
  {
    q: 'How can I enroll at S.P. Coaching Classes?',
    a: 'You can easily enroll by calling us at +91 98240 06191 or +91 84690 05286, emailing spcoachingc@gmail.com, or submitting the enquiry form below on this website. Free counseling sessions are available for all prospective students.',
  },
  {
    q: 'Are doubt-clearing sessions provided?',
    a: 'Yes, we conduct dedicated doubt-clearing sessions 6 days a week. Students can ask questions freely before or after regular classes to ensure no topic remains unclear.',
  },
  {
    q: 'Do you provide study materials and test series?',
    a: 'Yes, all enrolled students receive comprehensive in-house study notes, topic-wise practice sheets, chapter tests, and full-length mock board / entrance test series with detailed performance feedback.',
  },
]

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState(null)

  const toggle = idx => {
    setOpenIdx(openIdx === idx ? null : idx)
  }

  return (
    <section id="faq" className={styles.section}>
      <div className="container">
        <span className="section-tag reveal">GOT QUESTIONS?</span>
        <h2 className="reveal">Frequently Asked <span className="accent">Questions</span></h2>
        <p className="section-intro reveal">
          Find answers to common questions about admissions, courses, batches, and teaching methodology.
        </p>

        <div className={`${styles.faqList} reveal`}>
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx
            return (
              <div
                key={faq.q}
                className={`${styles.item} ${isOpen ? styles.itemOpen : ''}`}
              >
                <button
                  type="button"
                  className={styles.question}
                  onClick={() => toggle(idx)}
                  aria-expanded={isOpen}
                >
                  <span className={styles.qText}>{faq.q}</span>
                  <span className={styles.chevron}>{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen && (
                  <div className={styles.answer}>
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className={`${styles.ctaBox} reveal`}>
          <p>Have a question not answered here?</p>
          <a href="#contact" className={styles.ctaBtn}>Contact Our Team →</a>
        </div>
      </div>
    </section>
  )
}
