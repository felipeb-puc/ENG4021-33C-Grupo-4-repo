import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./estilos/styles.css";
import { EstadoProvider } from "./estado/EstadoProvider.jsx";
import App from "./App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <EstadoProvider>
        <App />
      </EstadoProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
