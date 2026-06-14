import { Badge, Divider, Stack, Text } from "@mantine/core";
import dayjs from "dayjs";
import { formatNumber } from "../../../../shared/functions/formatNumber";
import type {
  RES_ResumenEntregasReq,
  RES_Consumo,
} from "../../service/control-consumo.responses";
import { isOtros } from "./helpers";


interface HistorialConsumosProps {
  record: RES_ResumenEntregasReq;
}

export const HistorialConsumos = ({ record }: HistorialConsumosProps) => {
  return (
    <div className="p-5 bg-zinc-950/40 border-l-2 border-indigo-500/40 pl-6 py-4 flex flex-col gap-3">
      <Text size="xs" fw={800} className="text-zinc-400 mb-1">
        Historial de Consumo ({record.consumos.length})
      </Text>
      {record.consumos.length === 0 ? (
        <Text size="xs" c="dimmed" fs="italic" className="py-1">
          Sin consumos registrados para esta entrega
        </Text>
      ) : (
        <Stack gap="xs">
          {record.consumos.map((c: RES_Consumo) => {
            const showReqUnit = isOtros(record);
            const qty = showReqUnit
              ? c.cantidad_base_consumida *
                (record.cantidad_entregada_req / record.cantidad_entregada_base)
              : c.cantidad_base_consumida;
            const unit = showReqUnit
              ? record.unidad_medida_req_abv
              : record.unidad_medida_base_abv;
            return (
              <div
                key={c.id_consumo}
                className="bg-zinc-900/45 border border-zinc-800/50 hover:border-zinc-700/50 rounded-xl p-3.5 transition-all duration-200"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  {/* Left details: Badge, consumption quantity and user comments */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 flex-1">
                    <Badge
                      color={
                        c.estado === "Consumo Total" ? "teal.4" : "yellow.4"
                      }
                      size="xs"
                      variant="light"
                      className="font-extrabold uppercase border border-current/10 py-1"
                    >
                      {c.estado}
                    </Badge>
                    <Text
                      size="xs"
                      className="text-zinc-200 font-semibold flex items-center gap-1"
                    >
                      <span className="text-white font-extrabold text-xs">
                        {formatNumber(qty)}
                      </span>
                      <span className="text-white font-extrabold text-xs">
                        {unit}
                      </span>
                    </Text>
                    {c.correlativo_lote_mineral && (
                      <Badge size="xs" color="orange" variant="light" className="font-semibold uppercase tracking-wider py-1 border border-current/15">
                        Lote: {c.correlativo_lote_mineral}
                      </Badge>
                    )}
                    {c.labores_destinos && (
                      <Badge size="xs" color="grape" variant="light" className="font-semibold uppercase tracking-wider py-1 border border-current/15">
                        Labores: {c.labores_destinos}
                      </Badge>
                    )}
                    {c.para_mantenimiento && (
                      <Badge size="xs" color="pink" variant="light" className="font-semibold uppercase tracking-wider py-1 border border-current/15">
                        Mantenimiento
                      </Badge>
                    )}
                    <span className="hidden md:inline text-zinc-700 font-light">
                      |
                    </span>
                    <Text size="xs" className="text-zinc-400 italic">
                      "{c.comentario_consumo || "Sin comentarios"}"
                    </Text>
                  </div>

                  {/* Right details: Who registered the consumption and when */}
                  <div className="flex flex-row items-center md:items-end gap-x-3 gap-y-0.5 text-[11px] text-zinc-500 border-t md:border-t-0 border-zinc-800/40 pt-2 md:pt-0 w-full md:w-auto self-stretch md:self-auto justify-between md:justify-start">
                    <div>
                      <span className="text-[10px] text-zinc-400 uppercase font-bold mr-1">
                        Por:
                      </span>
                      <strong className="text-zinc-300 font-semibold text-xs">
                        {c.empleado_registro}
                      </strong>
                    </div>
                    <Divider orientation="vertical" />
                    <div className="text-zinc-400 font-medium">
                      <span className="text-[10px] text-zinc-400 uppercase font-bold mr-1">
                        Fecha:
                      </span>
                      <strong className="text-zinc-300 font-semibold text-xs">
                        {dayjs(c.fecha_hora_consumo).format("DD/MM/YYYY HH:mm")}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </Stack>
      )}
    </div>
  );
};
