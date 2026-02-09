import { createTheme } from "@mantine/core";

// Paleta dorada para acentos - estética minera elegante
const gold = [
  "#fff9e6",
  "#fff1cc",
  "#ffe499",
  "#ffd666",
  "#ffc933",
  "#d4a50a", // color principal
  "#b8920a",
  "#997a08",
  "#7a6107",
  "#5c4905",
] as const;

// Tema personalizado Black Silver
export const theme = createTheme({
  primaryColor: "gold",
  colors: {
    gold,
  },
  fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  headings: {
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  defaultRadius: "md",
  black: "#111",
  white: "#fbfbfb",
  other: {
    // Colores personalizados para uso en componentes
    navbarBg: "rgba(17, 17, 17, 0.95)",
    cardBg: "rgba(30, 30, 30, 0.8)",
    borderColor: "rgba(212, 165, 10, 0.3)",
  },
});
