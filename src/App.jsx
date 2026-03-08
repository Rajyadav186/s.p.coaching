// ── App.jsx ──────────────────────────────────────────────
// Root component — assembles all sections in order.
// Each section lives in its own file under src/components/
import useScrollReveal from './hooks/useScrollReveal'
import useCountUp      from './hooks/useCountUp'

import Cursor         from './components/Cursor'
import Topbar         from './components/Topbar'
import Navbar         from './components/Navbar'
import Hero           from './components/Hero'
import About          from './components/About'
import Courses        from './components/Courses'
import WhyUs          from './components/WhyUs'
import Method         from './components/Method'
// import Timings        from './components/Timings'
// import Results        from './components/Results'
import Gallery        from './components/Gallery'
import Comments       from './components/Comments'
import Contact        from './components/Contact'
import Footer         from './components/Footer'
import FloatingSocial from './components/FloatingSocial'

export default function App() {
  useScrollReveal()   // activates .reveal scroll animations
  useCountUp()        // animates stat numbers on scroll

  return (
    <>
      {/* Overlays */}
      <Cursor />
      <Topbar />
      <FloatingSocial />

      {/* Navigation */}
      <Navbar />

      {/* Page sections */}
      <Hero />
      <About />
      <Courses />
      <WhyUs />
      <Method />
      {/* <Timings /> */}
      {/* <Results /> */}
      <Gallery />
      <Comments />
      <Contact />
      <Footer />
    </>
  )
}
