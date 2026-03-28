import { Paper, Group, Stack, Text, Badge, Divider } from "@mantine/core";
import { CubeIcon } from "@heroicons/react/24/outline";
import { formatNumber } from "../../../../../presentation/functions/formatNumber";
import type { RES_PrestamoDetalle } from "../../../service/prestamos.responses";
import type { RES_LoteReabastecimiento } from "../../../../solicitudes-reabastecimiento-atencion/service/solicitudes-atencion.responses";
import { LotesTableRepo } from "./LotesTableRepo";

interface ProductoRepoCardProps {
  detalle: RES_PrestamoDetalle;
  lotes: RES_LoteReabastecimiento[];
  reposicionCantidades: Record<number, Record<number, number>>;
  loadingLotes: boolean;
  handleUpdateLoteQuantity: (
    idDetalle: number,
    idLote: number,
    valBase: number,
  ) => void;
}

export const ProductoRepoCard = ({
  detalle,
  lotes,
  reposicionCantidades,
  loadingLotes,
  handleUpdateLoteQuantity,
}: ProductoRepoCardProps) => {
  const currentDetailQuantities =
    reposicionCantidades[detalle.id_prestamo_detalle] || {};
  const totalAsignadoBase = Object.values(currentDetailQuantities).reduce(
    (sum, val) => sum + val,
    0,
  );
  const factor = Number(detalle.contenido_por_presentacion || 1);
  const totalAsignadoSolicitud = totalAsignadoBase / factor;

  const faltanteSolicitud =
    detalle.cantidad_prestada - detalle.cantidad_repuesta;
  const faltanteBase = faltanteSolicitud * factor;

  const esCompletado = totalAsignadoBase >= faltanteBase;

  return (
    <Paper
      p="md"
      radius="xl"
      className="bg-zinc-950 border border-zinc-800 shadow-xl overflow-hidden relative group"
    >
      <div
        className={`absolute top-0 left-0 w-1 h-full transition-colors ${esCompletado ? "bg-teal-500" : "bg-indigo-500"}`}
      />

      <Stack gap="4px">
        <Group justify="space-between" align="center">
          <Group gap="sm">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center border shadow-inner transition-colors ${esCompletado ? "bg-teal-500/10 border-teal-500/20" : "bg-indigo-500/10 border-indigo-500/20"}`}
            >
              <CubeIcon
                className={`w-5 h-5 ${esCompletado ? "text-teal-400" : "text-indigo-400"}`}
              />
            </div>
            <Stack gap={0}>
              <Text
                fw={900}
                className="text-zinc-100 tracking-tight leading-none mb-1"
                size="md"
              >
                {detalle.producto}
              </Text>
            </Stack>
          </Group>

          <Group gap="xs" align="center">
            <Badge
              variant="light"
              color="indigo"
              radius="sm"
              className="font-black px-3 h-7"
              size="sm"
            >
              Prestado: {formatNumber(detalle.cantidad_prestada)}{" "}
              {detalle.unidad_medida_sol_abv}
            </Badge>
            <Badge
              variant="dot"
              color="green"
              radius="sm"
              className="font-bold h-7"
              size="sm"
            >
              Repuesto: {formatNumber(detalle.cantidad_repuesta)}{" "}
              {detalle.unidad_medida_sol_abv}
            </Badge>
            <Badge
              variant="dot"
              color="orange"
              radius="sm"
              className="font-bold h-7"
              size="sm"
            >
              Por reponer: {formatNumber(faltanteSolicitud)}{" "}
              {detalle.unidad_medida_sol_abv}
            </Badge>

            {totalAsignadoBase > 0 && (
              <Badge
                variant="filled"
                color={esCompletado ? "teal" : "indigo"}
                radius="sm"
                className="font-black px-3 h-7"
                size="sm"
              >
                Asignado: {formatNumber(totalAsignadoSolicitud)}{" "}
                {detalle.unidad_medida_sol_abv}
              </Badge>
            )}
          </Group>
        </Group>

        <Divider color="zinc.800" variant="dashed" />

        <LotesTableRepo
          lotes={lotes}
          idDetalle={detalle.id_prestamo_detalle}
          unidadMedidaBaseAbv={detalle.unidad_medida_sol_abv}
          reposicionCantidades={reposicionCantidades}
          pendienteBase={faltanteBase}
          loadingLotes={loadingLotes}
          handleUpdateLoteQuantity={handleUpdateLoteQuantity}
        />
      </Stack>
    </Paper>
  );
};
