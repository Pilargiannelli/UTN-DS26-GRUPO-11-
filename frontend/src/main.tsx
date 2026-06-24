import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import './assets/styles/index.css'
import { AuthProvider } from './context/AuthContext.tsx';
import App from './App.tsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/styles/App.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
