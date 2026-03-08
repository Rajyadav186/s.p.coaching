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

---

## Configure WhatsApp & Instagram

Open `src/components/FloatingSocial.jsx` and update lines 7–9:

```js
const WHATSAPP_NUMBER  = '919824006191'        // your number with country code
const WHATSAPP_MESSAGE = encodeURIComponent('Hello! I want to know more...')
const INSTAGRAM_URL    = 'https://instagram.com/your_profile'
```

---

## Activate Contact Form (EmailJS – Free, 5 min)

Open `src/components/Contact.jsx` and replace lines 14–16:

```js
const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID'
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID'
const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY'
```

Setup: https://www.emailjs.com → Add Service → Create Template → Copy keys.

---

## Replace Topper Photos

Put individual student photos in `public/gallery/` and update the `img` paths in
`src/components/Results.jsx` (the `TOPPERS` array).
