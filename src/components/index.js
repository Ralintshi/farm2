import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';  // ✅ Ensure correct import
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>  {/* ✅ Wrap App inside BrowserRouter */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
