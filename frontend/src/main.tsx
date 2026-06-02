import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import './assets/styles/index.css'
import App from './App.tsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/styles/App.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
