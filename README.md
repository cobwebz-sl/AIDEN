# AIDEN MUSIC — Official Website

Single-page artist website for **A I D E N** (AIDEN MUSIC), progressive house DJ from Negombo, Sri Lanka.
Built entirely with **HTML5**, **CSS** (compiled Tailwind CSS), and **Vanilla JavaScript** (GSAP + Lenis animations).

Zero Node.js runtime, zero npm dependencies, zero build step required.

## Running the Site

Simply open `index.html` in any modern web browser or serve with any static web server (such as VS Code Live Server, Python's `python -m http.server`, GitHub Pages, Vercel, Netlify, Cloudflare Pages, etc.).

## Project Structure

```
├── index.html        # Complete semantic HTML5 markup with inline SVGs, accessible dialogs & forms
├── css/
│   └── style.css     # Standalone compiled stylesheet (Tailwind CSS, design system, keyframes)
├── js/
│   └── main.js       # Vanilla JS animations & interactions (GSAP, ScrollTrigger, Lenis)
└── assets/
    ├── photos/       # One WebP per photo, each used once on the page
    │   ├── event-01..08     # Club night at the decks (photos: duopixel)
    │   ├── event-10..12     # Garden stage, daytime
    │   ├── event-13..19     # Tent stage, daytime
    │   ├── portrait-01..12, 17..20  # Low-light portrait session
    │   └── portrait-13..16, 21      # Studio, black hat
    ├── apple-touch-icon.png
    ├── favicon.svg
    └── og-image.jpg  # 1200x630 share card, cropped from event-01
```

## Features & Motion System
- **GSAP 3 + ScrollTrigger + CustomEase** via fast CDN.
- **Scroll-expansion hero**: the photo opens inside the "AI [ ] DEN" wordmark and grows to full screen while the hero is pinned.
- **Crossing tapes**: two marquee strips that speed up and reverse with scroll velocity.
- **Zoom parallax** (#moments): seven photos scale out at different speeds; the centre one fills the screen.
- **Corner navigation**: logo, live Negombo clock, Book link and a Menu button that opens a full-screen menu on every screen size. The header hides on scroll down and flips to dark text over the light gallery chapter.
- **About**: a scroll-lit statement with inline animated chips (spinning record, equaliser), a sticky portrait and numbered facts.
- **Chapter gallery**: Afterhours (club night), Low Light (portrait session), Bright Side (studio smiles), Open Air (tents and gardens). Each chapter tints the section background as you scroll, a sticky index jumps between chapters, and the giant chapter words drift sideways.
- Word-mask heading reveals, velocity skew on the photo grids, pinned horizontal gig cards, parallax.
- **Lenis Smooth Scroll** synchronized with the GSAP ticker for frame-perfect momentum scrolling.
- **Custom Cursor**: Lagging follower ring + dot with contextual hover labels (`View`, `Play`, `Explore`, `Book`) on fine pointers.
- **Interactive Lightbox & Video Modal**: Fullscreen gallery photo viewer and responsive Instagram reel / video player.
- **Booking Enquiry**: Interactive form with automatic copy-to-clipboard and deep-linking directly to Instagram DM.
- **Accessibility & Responsive**: Full mobile responsiveness, semantic HTML, and `prefers-reduced-motion` compliance.

## Content sources
All artist facts on the site come from AIDEN's public Instagram (@aidenmusic.lk) and Facebook page (Aiden musik). Gigs, the podcast episode and the reels each link to the original post. Do not add bios, releases, venues or contact numbers that are not posted there.
