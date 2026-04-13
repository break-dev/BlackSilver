import pluralize from "pluralize";

// Reglas básicas para robustez en español (evita pluralizaciones incorrectas en inglés)
pluralize.addPluralRule(/([aeiou])$/i, "$1s");
pluralize.addPluralRule(/([bcdfghjklmnpqrstvwxy])$/i, "$1es");
pluralize.addPluralRule(/z$/i, "ces");
pluralize.addIrregularRule("mes", "meses");

export const enPlural = (word: string | undefined | null, count?: number) => {
  if (!word) return "";

  // Si se pasa count, pluralize maneja automáticamente si debe ser singular o plural
  return pluralize(word, count);
};
