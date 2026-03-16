# Daily-quote

A modern React app delivering inspiring quotes with glassmorphism UI, smooth animations, and smart data persistence. Features quote fetching from Quotable API, like/save functionality, search filtering, sharing capabilities, and real-time stats tracking. Built with Vite, Tailwind CSS, and Framer Motion.

## ✨ Features

- **Dynamic Quote System** – Fetches from the Quotable API with intelligent fallback quotes
- **Glassmorphism Design** – Sleek frosted glass cards with Night Noir theme
- **Smooth Animations** – Framer Motion staggered transitions, hover effects, floating particles
- **Like & Save** – Persist favorite quotes with localStorage
- **Search & Filter** – Find saved quotes by text or author
- **Smart Sharing** – Copy to clipboard or share via native API
- **Stats Dashboard** – Track daily views, streak count, total saved quotes
- **Premium Typography** – Playfair Display serif for quotes, Poppins for UI
- **Interactive Effects** – Mouse-following glow, particle animations, hover states

## 🛠️ Tech Stack

- React 18 + Vite
- Tailwind CSS 3
- Framer Motion
- Lucide React
- Quotable API

## 🚀 Getting Started

```bash
npm install
npm run dev
```

Visit `http://localhost:5173`

## 📦 Build for Production

```bash
npm run build
```

## 💾 Data Persistence

All user data (liked quotes, daily streak, view count) automatically syncs to localStorage.
