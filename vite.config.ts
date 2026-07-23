import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

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
    target: "esnext",
    cssCodeSplit: true,
    chunkSizeWarningLimit: 3000,
    rollupOptions: {
      output: {
        // Objeto explícito para evitar ciclos circulares entre chunks
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-mantine": [
            "@mantine/core",
            "@mantine/hooks",
            "@mantine/dates",
            "@mantine/notifications",
          ],
        },
      },
    },
  },
});
