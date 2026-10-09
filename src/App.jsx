// ── App.jsx ──────────────────────────────────────────────
// Client Router & Root Architecture for S.P. Coaching Classes
import { Routes, Route } from 'react-router-dom'
import useScrollReveal from './hooks/useScrollReveal'
import useCountUp      from './hooks/useCountUp'

import Topbar         from './components/Topbar'
import Navbar         from './components/Navbar'
import Hero           from './components/Hero'
import About          from './components/About'
import Courses        from './components/Courses'
import WhyUs          from './components/WhyUs'
import Method         from './components/Method'
import Gallery        from './components/Gallery'
import FAQ            from './components/FAQ'
import Comments       from './components/Comments'
import Contact        from './components/Contact'
import Footer         from './components/Footer'
import FloatingSocial from './components/FloatingSocial'
import CookieConsent  from './components/CookieConsent'

// Pages
import BlogListPage   from './pages/BlogListPage'
import BlogPostPage   from './pages/BlogPostPage'
import AdminPage      from './pages/AdminPage'

function HomePage() {
  useScrollReveal()   // activates .reveal scroll animations
  useCountUp()        // animates stat numbers on scroll

  return (
    <>
      {/* Overlays */}
      <Topbar />
      <FloatingSocial />
      <CookieConsent />

      {/* Navigation */}
      <Navbar />

      {/* Page sections */}
      <Hero />
      <About />
      <Courses />
      <WhyUs />
      <Method />
      <Gallery />
      <FAQ />
      <Comments />
      <Contact />
      <Footer />
    </>
  )
}

// 14 Targeted Exact Keyword URLs
const TARGET_URLS = [
  'coaching-centers-silvassa',
  'tuition-classes-silvassa',
  'tuition-tokarkhada',
  'tuition-rakholi',
  'tuition-masat',
  'tuition-near-me',
  'coaching-near-me',
  'tuition-in-silvassa',
  'coaching-classes-silvassa',
  'home-tuitions-silvassa',
  'coaching-centre-silvassa',
  'commerce-coaching-silvassa',
  'commerce-tuition-silvassa',
  'physics-teacher-silvassa'
]

export default function App() {
  return (
    <Routes>
      {/* Main Homepage */}
      <Route path="/" element={<HomePage />} />

      {/* Admin Panel */}
      <Route path="/admin" element={<AdminPage />} />

      {/* Blog & Educational Resources Directory */}
      <Route path="/blog" element={<BlogListPage />} />
      <Route path="/blog/:slug" element={<BlogPostPage />} />

      {/* 14 Targeted Exact Keyword SEO Landing Routes */}
      {TARGET_URLS.map(slug => (
        <Route key={slug} path={`/${slug}`} element={<BlogPostPage />} />
      ))}

      {/* Dynamic Root-level Slug Fallback for custom landing pages */}
      <Route path="/:slug" element={<BlogPostPage />} />
    </Routes>
  )
}
