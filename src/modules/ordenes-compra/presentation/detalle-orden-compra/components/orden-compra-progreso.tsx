import { Text } from "@mantine/core";

interface OrdenCompraProgresoProps {
  progresoGeneral: number;
}

export const OrdenCompraProgreso = ({
  progresoGeneral,
}: OrdenCompraProgresoProps) => {
  return (
    <div className="px-2">
      <div className="bg-zinc-900/50 border border-zinc-800 p-1.5 rounded-lg">
        <div className="flex justify-between items-center mb-1 px-4">
          <Text
            size="xs"
            fw={800}
            c="zinc.5"
            className="uppercase tracking-tighter"
          >
            Progreso de Recepción
          </Text>
          <Text size="xs" fw={900} c="indigo.4">
            {progresoGeneral}%
          </Text>
        </div>
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 transition-all duration-1000"
            style={{ width: `${progresoGeneral}%` }}
          />
        </div>
      </div>
    </div>
  );
};
