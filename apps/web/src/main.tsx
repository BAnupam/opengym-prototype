import "../../../design-system/opengym/tokens.css";
import React from "react";
import { createRoot } from "react-dom/client";

const App: React.FC = () => (
  <div className="App">
    <h1>OpenGym</h1>
    <p>Welcome to OpenGym — your personal training journal.</p>
  </div>
);

const rootEl = document.getElementById("root");
if (rootEl) {
  createRoot(rootEl).render(<App />);
}
