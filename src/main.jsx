import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.jsx'
import './index.css'

import VitrinePage from './pages/VitrinePage.jsx'
import CategoryPage from './pages/CategoryPage.jsx'
import CompanyPage from './pages/CompanyPage.jsx'





createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<VitrinePage />} />
        <Route path="/categories/:slug" element={<CategoryPage />} />
        <Route path="/entreprise/:entrepriseSlug" element={<CompanyPage />} /> {/* Affichage d'une page entreprise */}
        <Route path="*" element={<h1>Page non trouvée</h1>} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);