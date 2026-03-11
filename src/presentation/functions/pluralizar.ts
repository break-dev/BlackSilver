export const pluralizar = (nombre: string | undefined | null) => {
  if (!nombre) return "";
  const lower = nombre.toLowerCase();
  if (lower.endsWith("s")) return nombre;
  const vocales = ["a", "e", "i", "o", "u"];
  const ultimaLetra = lower.charAt(lower.length - 1);
  return vocales.includes(ultimaLetra) ? `${nombre}s` : `${nombre}es`;
};
