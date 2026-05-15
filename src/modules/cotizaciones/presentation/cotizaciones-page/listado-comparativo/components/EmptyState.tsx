import { Text } from "@mantine/core";
import { DocumentMagnifyingGlassIcon } from "@heroicons/react/24/outline";

interface EmptyStateProps {
  busqueda: string;
}

export const EmptyState = ({ busqueda }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-20 border border-dashed border-zinc-800 rounded-4xl bg-zinc-900/10 backdrop-blur-sm">
      <DocumentMagnifyingGlassIcon className="size-12 text-zinc-700 mb-4" />
      <Text
        size="sm"
        fw={700}
        className="text-zinc-400 uppercase tracking-widest"
      >
        {busqueda ? "Sin resultados" : "No hay cotizaciones"}
      </Text>
      <Text size="xs" c="dimmed" className="mt-1">
        {busqueda
          ? "Intenta con otro término."
          : "Comience creando un nuevo comparativo."}
      </Text>
    </div>
  );
};
