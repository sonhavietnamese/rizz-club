import '@/styles/globals.css'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'
import Kols from '@/pages/kols'
import Fans from '@/pages/fans'
import { WepinProvider } from '@/lib/wepin/provider'
import Landing from '@/pages/landing'

createRoot(document.getElementById('root')!).render(
  <WepinProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/kols" element={<Kols />} />
        <Route path="/fans" element={<Fans />} />
      </Routes>
    </BrowserRouter>
  </WepinProvider>
)
