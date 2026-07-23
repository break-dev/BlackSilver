import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
    tailwindcss(),
  ],
  build: {
    chunkSizeWarningLimit: 5000, // Subir el límite de la advertencia a 5MB
    rollupOptions: {
      output: {
        // Divide dependencias pesadas en chunks independientes
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("exceljs")) return "vendor-exceljs";
            if (id.includes("react") || id.includes("react-dom"))
              return "vendor-react";
            if (id.includes("lucide-react") || id.includes("@heroicons"))
              return "vendor-icons";
            return "vendor";
          }
        },
      },
    },
  },
});
