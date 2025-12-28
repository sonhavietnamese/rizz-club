import { Providers } from '@/components/providers'
import Fans from '@/pages/fans'
import Kols from '@/pages/kols'
import Landing from '@/pages/landing'
import '@/styles/globals.css'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'

createRoot(document.getElementById('root')!).render(
  <Providers>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/kols" element={<Kols />} />
        <Route path="/fans" element={<Fans />} />
      </Routes>
    </BrowserRouter>
  </Providers>
)
