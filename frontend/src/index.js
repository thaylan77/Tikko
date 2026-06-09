import React from "react";
import { createRoot } from "react-dom/client";
import CssBaseline from "@mui/material/CssBaseline";

import App from "./App";

// Nota: não usamos React.StrictMode porque o @mui/styles (makeStyles legado)
// não é compatível com o StrictMode do React 18. Migrar para tss-react/sx
// permitirá reativar o StrictMode no futuro.
const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <CssBaseline>
    <App />
  </CssBaseline>
);
