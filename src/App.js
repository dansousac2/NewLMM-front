import React from 'react';
import './App.css';
import 'toastr/build/toastr.css';
import 'toastr/build/toastr.min.js';
import SessionProvider from './main/SessionProvider';
import AppRoutes from './main/AppRoutes';
import { BrowserRouter } from 'react-router-dom';

export default function App() {
  return (
    <div>
      <BrowserRouter>
        <SessionProvider>
          <AppRoutes />
        </SessionProvider>
      </BrowserRouter>
    </div>
  );
}