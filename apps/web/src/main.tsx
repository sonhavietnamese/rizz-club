import '@/styles/globals.css'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'
import App from '@/pages/app'
import { WepinProvider } from '@/lib/wepin/provider'

createRoot(document.getElementById('root')!).render(
  <WepinProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
      </Routes>
    </BrowserRouter>
  </WepinProvider>
)
