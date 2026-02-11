import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import "mantine-datatable/styles.layer.css";
import "./index.css";
import { App } from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <MantineProvider defaultColorScheme="dark">
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </MantineProvider>,
);
