import React from 'react'
import { BrowserRouter } from 'react-router'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast';
import App from './App.jsx'
import './index.css'
import { registerSW } from "virtual:pwa-register";

registerSW({
  immediate: true,
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      
        <App />

        <Toaster
          position="top-right"
          reverseOrder={false}
          gutter={10}
          toastOptions={{
            duration: 3500,

            success: {
              style: {
                background: '#16A34A',
                color: '#fff',
                borderRadius: '12px',
              },
            },

            error: {
              style: {
                background: '#DC2626',
                color: '#fff',
                borderRadius: '12px',
              },
            },

            style: {
              borderRadius: '12px',
              fontSize: '15px',
            },
          }}
        />
    </BrowserRouter>
  </React.StrictMode>,
);
  

