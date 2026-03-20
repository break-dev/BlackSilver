import { Badge, NumberInput, Stack, Text, Tooltip } from "@mantine/core";
import dayjs from "dayjs";
import { formatNumber } from "../../../../../presentation/functions/formatNumber";
import type { RES_LoteReabastecimiento } from "../../../service/solicitudes-atencion.responses";

interface LoteRowProps {
  lote: RES_LoteReabastecimiento;
  cant: number;
  idProducto: number;
  unidadMedidaBaseAbv: string;
  handleCantChange: (idLote: number, idProducto: number, val: number) => void;
}

export const LoteRow = ({
  lote,
  cant,
  idProducto,
  unidadMedidaBaseAbv,
  handleCantChange,
}: LoteRowProps) => {
  const isExpired = lote.fecha_vencimiento && dayjs(lote.fecha_vencimiento).isBefore(dayjs());
  const isCritical = lote.dias_para_vencer !== null && lote.dias_para_vencer <= 30;

  return (
    <tr
      className={`transition-all duration-300 ${
        cant > 0 ? "bg-indigo-500/5" : "hover:bg-zinc-800/20"
      }`}
    >
      <td className="py-3.5 pl-6">
        <Stack gap={1}>
          <div className="flex items-center gap-2">
            <Badge
              variant="filled"
              color={cant > 0 ? "indigo" : "zinc"}
              radius="md"
              size="sm"
              className="font-black px-2.5 h-6 tracking-tight shadow-sm"
            >
              {lote.correlativo}
            </Badge>
            {isExpired && (
                <Tooltip label="Lote Vencido">
                    <Badge variant="filled" color="red" size="xs" radius="sm">EXP</Badge>
                </Tooltip>
            )}
            {!isExpired && isCritical && (
                <Tooltip label="Próximo a Vencer">
                    <Badge variant="filled" color="orange" size="xs" radius="sm">CRIT</Badge>
                </Tooltip>
            )}
          </div>
        </Stack>
      </td>

      <td className="text-center py-3.5">
        <div className="flex flex-col items-center">
            <Text size="xs" fw={800} className={isExpired ? "text-red-400" : "text-zinc-300"}>
                {lote.fecha_vencimiento ? dayjs(lote.fecha_vencimiento).format("DD/MM/YYYY") : "S.V."}
            </Text>
            {lote.dias_para_vencer !== null && !isExpired && (
                <Text size="9px" fw={700} c={isCritical ? "orange.5" : "zinc.5"} className="opacity-80">
                    en {lote.dias_para_vencer} días
                </Text>
            )}
        </div>
      </td>

      <td className="text-center py-3.5">
        <Stack gap={0} align="center">
          <div className="flex items-baseline gap-1">
            <Text size="sm" fw={900} className="text-zinc-100 font-mono tracking-tighter">
              {formatNumber(lote.stock_actual_base)}
            </Text>
            <Text size="10px" fw={800} c="zinc.6" className="uppercase opacity-70">
              {unidadMedidaBaseAbv}
            </Text>
          </div>
          {lote.unidad_medida_abv !== unidadMedidaBaseAbv && (
            <Text size="10px" c="zinc.5" fw={700} className="tracking-tight italic mt-[-2px]">
              {formatNumber(lote.stock_actual)} {lote.unidad_medida_abv}
            </Text>
          )}
        </Stack>
      </td>

      <td className="text-right py-3.5 pr-8">
        <div className="flex justify-center ml-auto w-32">
          <NumberInput
            size="sm"
            radius="xl"
            min={0}
            max={lote.stock_actual_base}
            placeholder="0"
            value={cant || ""}
            onChange={(val) =>
              handleCantChange(lote.id_lote, idProducto, Number(val))
            }
            hideControls
            classNames={{
              input: `bg-zinc-900 border-zinc-800 focus:border-indigo-500 font-black text-center transition-all duration-300 ${
                cant > 0 ? "text-indigo-400 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.1)]" : "text-zinc-400 group-hover:border-zinc-700"
              }`,
            }}
          />
        </div>
      </td>
    </tr>
  );
};
