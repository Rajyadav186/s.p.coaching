# S.P. Coaching Classes — React Vite Website v3

## Project Structure

```
sp-coaching-v2/
├── index.html
├── package.json
├── vite.config.js
├── README.md
│
├── public/
│   └── gallery/                    ← All 7 coaching photos
│       ├── classroom.jpg
│       ├── farewell1.jpg
│       ├── farewell2.jpg
│       ├── award.jpg
│       ├── childrensday.jpg
│       ├── teachersday1.jpg
│       └── teachersday2.jpg
│
└── src/
    ├── App.jsx                     ← Root – imports all components
    ├── main.jsx                    ← React entry
    ├── index.css                   ← Global CSS variables, keyframes
    │
    ├── hooks/
    │   ├── useScrollReveal.js      ← Scroll reveal animation hook
    │   └── useCountUp.js           ← Animated number counter hook
    │
    └── components/
        ├── Cursor.jsx / .css       ← Custom cursor + click ripple
        ├── Topbar.jsx / .css       ← Scroll progress bar
        ├── Navbar.jsx / .css       ← Fixed navigation
        ├── Hero.jsx / .css         ← Hero with live particle canvas
        ├── About.jsx / .css        ← About section
        ├── Courses.jsx / .css      ← 4 course cards
        ├── WhyUs.jsx / .css        ← Why choose us
        ├── Method.jsx / .css       ← Teaching method
        ├── Timings.jsx / .css      ← Class schedule table
        ├── Results.jsx / .css      ← Stats + 4 toppers with photos
        ├── Gallery.jsx / .css      ← Photo gallery with lightbox + filters
        ├── Comments.jsx / .css     ← Live comment/review section
        ├── Contact.jsx / .css      ← Enquiry form (EmailJS)
        ├── Footer.jsx / .css       ← Footer
        └── FloatingSocial.jsx/.css ← Floating WhatsApp + Instagram buttons
```

## Getting Started

```bash
npm install
npm run dev        # → http://localhost:5173
npm run build      # production build
```

