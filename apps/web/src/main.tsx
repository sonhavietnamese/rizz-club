import { Providers } from '@/components/providers'
import Kols from '@/pages/kols'
import Landing from '@/pages/landing'
import '@/styles/globals.css'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'
import Rizz from './pages/rizz'

createRoot(document.getElementById('root')!).render(
  <Providers>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/kols/:id" element={<Kols />} />
        <Route path="/rizz" element={<Rizz />} />
      </Routes>
    </BrowserRouter>
  </Providers>
)
