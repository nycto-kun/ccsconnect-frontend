import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Import global CSS files (these will be created later)
import './assets/index.css';
import './assets/style.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);