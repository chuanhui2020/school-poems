import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { lazy, Suspense } from 'react'

const LandingPage = lazy(() => import('./pages/LandingPage.tsx'))
const WorldScene = lazy(() => import('./pages/WorldScene.tsx'))
const PoetEncounter = lazy(() => import('./pages/PoetEncounter.tsx'))
const PoemReveal = lazy(() => import('./pages/PoemReveal.tsx'))

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Suspense
        key={location.pathname}
        fallback={
          <div className="w-screen h-screen bg-bg-deep flex items-center justify-center">
            <span className="text-text-dim text-lg breathing">载入中…</span>
          </div>
        }
      >
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/world" element={<WorldScene />} />
          <Route path="/poet/:id" element={<PoetEncounter />} />
          <Route path="/poem/:id" element={<PoemReveal />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  )
}
