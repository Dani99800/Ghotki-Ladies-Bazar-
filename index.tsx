
import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter as Router } from 'react-router-dom';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("Failed to find root element. The index.html might be missing <div id='root'></div>");
  throw new Error("Could not find root element to mount to");
}

console.log("GLB Bazar: Starting application mount...");

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
);

console.log("GLB Bazar: App mounted successfully.");
