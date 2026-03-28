import { Badge, Group, NumberInput, Stack, Text } from "@mantine/core";
import dayjs from "dayjs";
import { formatNumber } from "../../../../../presentation/functions/formatNumber";
import type { RES_LoteReabastecimiento } from "../../../../solicitudes-reabastecimiento-atencion/service/solicitudes-atencion.responses";

interface LoteRowRepoProps {
  lote: RES_LoteReabastecimiento;
  cantBase: number;
  idDetalle: number;
  unidadMedidaBaseAbv: string;
  maxBase: number;
  maxLote: number;
  handleUpdateLoteQuantity: (
    idDetalle: number,
    idLote: number,
    valBase: number,
  ) => void;
}

export const LoteRowRepo = ({
  lote,
  cantBase,
  idDetalle,
  unidadMedidaBaseAbv,
  maxBase,
  maxLote,
  handleUpdateLoteQuantity,
}: LoteRowRepoProps) => {
  const esCritico =
    lote.dias_para_vencer !== null && lote.dias_para_vencer <= 30;
  const esVencido = lote.dias_para_vencer !== null && lote.dias_para_vencer < 0;

  return (
    <tr
      className={`${cantBase > 0 ? "bg-indigo-500/5" : "hover:bg-zinc-800/10"} transition-colors`}
    >
      <td className="py-3 text-center">
        <Badge
          variant="light"
          color="indigo"
          radius="sm"
          className="font-bold border border-indigo-500/20"
        >
          {lote.correlativo}
        </Badge>
      </td>
      <td className="text-center py-3">
        {lote.fecha_vencimiento ? (
          <Stack gap={2} align="center">
            <Text size="xs" fw={800} className="text-zinc-300 font-mono">
              {dayjs(lote.fecha_vencimiento).format("DD MMM YYYY")}
            </Text>
            <Badge
              variant="dot"
              color={esVencido ? "red" : esCritico ? "orange" : "teal"}
              size="xs"
              className="font-bold"
            >
              {esVencido ? "CADUCADO" : `${lote.dias_para_vencer} DÍAS`}
            </Badge>
          </Stack>
        ) : (
          <Text fw={700} c="zinc.5" className="italic" size="10px">
            SIN VENCIMIENTO
          </Text>
        )}
      </td>
      <td className="text-center py-3">
        <Stack align="center" gap={4}>
          <Group gap={4} wrap="nowrap" justify="center">
            <Badge
              variant="light"
              color="zinc.4"
              className="bg-zinc-800/30 font-black"
            >
              {formatNumber(lote.stock_actual_base)} {unidadMedidaBaseAbv}
            </Badge>
          </Group>
          {lote.unidad_medida_abv !== unidadMedidaBaseAbv && (
            <Text
              size="10px"
              c="zinc.5"
              fw={700}
              className="italic uppercase tracking-tight"
            >
              {formatNumber(lote.contenido_por_presentacion)}{" "}
              {unidadMedidaBaseAbv} x {lote.unidad_medida_abv}
            </Text>
          )}
        </Stack>
      </td>
      <td className="py-3 pr-4">
        <div className="flex items-center justify-center gap-3">
          {lote.unidad_medida_abv !== unidadMedidaBaseAbv && (
            <NumberInput
              size="xs"
              radius="xl"
              min={0}
              max={maxLote}
              value={
                cantBase > 0
                  ? Number(
                      (
                        cantBase / (lote.contenido_por_presentacion || 1)
                      ).toFixed(4),
                    )
                  : ""
              }
              onChange={(val) =>
                handleUpdateLoteQuantity(
                  idDetalle,
                  lote.id_lote,
                  Number(val) * (lote.contenido_por_presentacion || 1),
                )
              }
              placeholder="0"
              clampBehavior="strict"
              hideControls
              rightSection={
                <Text size="10px" fw={700} c="zinc.5" className="mr-3">
                  {lote.unidad_medida_abv}
                </Text>
              }
              rightSectionWidth={45}
              className="w-24"
              classNames={{
                input: `bg-zinc-950/50 border-zinc-800 focus:border-indigo-500/50 font-black text-xs h-8 shadow-inner ${cantBase > 0 ? "text-indigo-400 ring-1 ring-indigo-500/20" : "text-white"} text-right pr-12`,
              }}
            />
          )}

          <NumberInput
            size="xs"
            radius="xl"
            min={0}
            max={maxBase}
            value={cantBase || ""}
            onChange={(val) =>
              handleUpdateLoteQuantity(idDetalle, lote.id_lote, Number(val))
            }
            placeholder="0"
            clampBehavior="strict"
            hideControls
            rightSection={
              <Text size="10px" fw={700} c="zinc.5" className="mr-2">
                {unidadMedidaBaseAbv}
              </Text>
            }
            rightSectionWidth={45}
            className="w-24"
            classNames={{
              input: `bg-zinc-950/50 border-zinc-800 focus:border-indigo-500/50 font-black text-xs h-8 shadow-inner ${cantBase > 0 ? "text-indigo-400 ring-1 ring-indigo-500/20" : "text-white"} text-right pr-12`,
            }}
          />
        </div>
      </td>
    </tr>
  );
};
