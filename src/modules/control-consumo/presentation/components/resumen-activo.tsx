import { Stack, Text, Badge } from "@mantine/core";
import { Cog8ToothIcon, MapPinIcon } from "@heroicons/react/24/outline";
import type { RES_ActivoFijoDisponible } from "../../../../service/responses/activo-fijo";

interface ResumenActivoProps {
  asset: RES_ActivoFijoDisponible;
  totalInsumos: number;
}

export const ResumenActivo = ({ asset, totalInsumos }: ResumenActivoProps) => {
  return (
    <div className="p-5 bg-zinc-900/65 border border-zinc-800 rounded-[24px] shadow-2xl flex flex-col md:flex-row justify-between items-center gap-4 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
          <Cog8ToothIcon className="w-5 h-5 text-indigo-400" />
        </div>
        <Stack gap={2}>
          <div className="flex items-center gap-2.5">
            <Text
              fw={800}
              className="uppercase tracking-widest text-zinc-500 text-[10px]!"
            >
              Resumen de Consumo de Activo
            </Text>
            <Badge
              size="sm"
              color="pink"
              variant="light"
              className="font-extrabold border border-pink-500/10"
            >
              {asset.correlativo}
            </Badge>
          </div>
          <Text size="md" fw={900} className="text-white tracking-tight">
            {asset.producto}
          </Text>
        </Stack>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-zinc-500 uppercase font-extrabold tracking-wider">
            Ubicación:{" "}
            {asset.id_mina ? "En Mina" : asset.id_almacen ? "En Almacén" : "-"}
          </span>
          <div className="flex items-center gap-1.5 text-zinc-300 font-semibold text-xs">
            <MapPinIcon className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            {asset.mina || asset.almacen || "-"}
          </div>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-zinc-500 uppercase font-extrabold tracking-wider">
            Total Entregas
          </span>
          <Badge
            size="sm"
            color="indigo"
            variant="light"
            className="font-extrabold"
          >
            {totalInsumos}{" "}
            {totalInsumos === 1 ? "insumo entregado" : "insumos entregados"}
          </Badge>
        </div>
      </div>
    </div>
  );
};
