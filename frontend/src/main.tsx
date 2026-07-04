import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import './assets/styles/index.css'
import { AuthProvider } from './context/AuthContext.tsx';
import App from './App.tsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/styles/App.css'
import { RegistroProvider } from './context/RegistroProvider.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <RegistroProvider>
          <App />
        </RegistroProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
