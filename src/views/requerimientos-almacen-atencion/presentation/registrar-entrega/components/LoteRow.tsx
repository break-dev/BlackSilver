import { Badge, NumberInput, Text } from "@mantine/core";
import dayjs from "dayjs";
import { formatNumber } from "../../../../../presentation/functions/formatNumber";
import type {
  DetalleRequerimientoExtendido,
  RES_Lote,
} from "../../../service/atencion.responses";

interface LoteRowProps {
  lote: RES_Lote;
  idDetalleReq: number;
  cant: number;
  maxBase: number;
  maxLote: number;
  detalle_req: DetalleRequerimientoExtendido;
  stockAsignable: number;
  handleCantChange: (idDetalle: number, idLote: number, cant: number) => void;
  handleCantLoteChange: (
    idDetalle: number,
    idLote: number,
    cant: number,
  ) => void;
}

export const LoteRow = ({
  lote,
  idDetalleReq,
  cant,
  maxBase,
  maxLote,
  detalle_req,
  stockAsignable,
  handleCantChange,
  handleCantLoteChange,
}: LoteRowProps) => {
  const esCritico =
    lote.dias_para_vencer !== null && lote.dias_para_vencer <= 5;
  const esVencido = lote.dias_para_vencer !== null && lote.dias_para_vencer < 0;

  return (
    <tr
      className={`${cant > 0 ? "bg-indigo-500/5" : "hover:bg-zinc-800/20"} transition-colors`}
    >
      <td className="py-3 text-center">
        <Badge
          variant="light"
          color="indigo"
          radius="sm"
          className="font-bold border border-indigo-500/20 py-3"
        >
          {lote.correlativo}
        </Badge>
      </td>
      <td className="text-center">
        {lote.fecha_vencimiento ? (
          <div className="flex flex-col gap-1 items-center">
            <Text size="xs" fw={800} className="text-zinc-300 font-mono">
              {dayjs(lote.fecha_vencimiento).format("DD MMM YYYY")}
            </Text>
            <Badge
              variant="dot"
              color={esVencido ? "red" : esCritico ? "orange" : "teal"}
              size="xs"
              className="font-bold py-1.5"
            >
              {esVencido ? "CADUCADO" : `${lote.dias_para_vencer} DÍAS`}
            </Badge>
          </div>
        ) : (
          <Text size="10px" fw={700} className="italic text-zinc-500!">
            SIN VENCIMIENTO
          </Text>
        )}
      </td>
      <td className="text-center">
        <div className="flex flex-col gap-1 items-center justify-center">
          <Badge
            variant="light"
            color="zinc.4"
            className="bg-zinc-800/30 font-black h-7"
          >
            {formatNumber(stockAsignable)} {detalle_req.unidad_medida_base_abv}
          </Badge>
          {lote.unidad_medida_abv !== detalle_req.unidad_medida_base_abv && (
            <Text size="10px" c="teal.4" fw={800} className="font-mono">
              (
              {formatNumber(
                stockAsignable / (lote.contenido_por_presentacion || 1),
              )}{" "}
              {lote.unidad_medida_abv})
            </Text>
          )}
        </div>
      </td>
      <td className="pr-8">
        <div className="flex items-center justify-center gap-3">
          {lote.unidad_medida_abv !== detalle_req.unidad_medida_base_abv && (
            <NumberInput
              size="sm"
              radius="xl"
              min={0}
              max={maxLote}
              value={
                cant > 0
                  ? Number(
                      (cant / (lote.contenido_por_presentacion || 1)).toFixed(
                        4,
                      ),
                    )
                  : ""
              }
              onChange={(val) =>
                handleCantLoteChange(idDetalleReq, lote.id_lote, Number(val))
              }
              placeholder="0"
              decimalScale={4}
              clampBehavior="strict"
              hideControls
              rightSection={
                <Text size="xs" fw={900} c="zinc.5" className="mr-3">
                  {lote.unidad_medida_abv}
                </Text>
              }
              rightSectionWidth={60}
              className="w-32"
              classNames={{
                input: `bg-zinc-950/50 border-zinc-800 focus:border-indigo-500/50 font-black text-sm h-10 shadow-inner ${cant > 0 ? "text-indigo-400 ring-1 ring-indigo-500/20" : "text-white"} text-right pr-12`,
              }}
            />
          )}

          <NumberInput
            size="sm"
            radius="xl"
            min={0}
            max={maxBase}
            value={cant || ""}
            onChange={(val) =>
              handleCantChange(idDetalleReq, lote.id_lote, Number(val))
            }
            placeholder="0"
            decimalScale={4}
            clampBehavior="strict"
            hideControls
            rightSection={
              <Text size="xs" fw={900} c="zinc.5" className="mr-3">
                {detalle_req.unidad_medida_base_abv}
              </Text>
            }
            rightSectionWidth={60}
            className="w-32"
            classNames={{
              input: `bg-zinc-950/50 border-zinc-800 focus:border-indigo-500/50 font-black text-sm h-10 shadow-inner ${cant > 0 ? "text-indigo-400 ring-1 ring-indigo-500/20" : "text-white"} text-right pr-12`,
            }}
          />
        </div>
      </td>
    </tr>
  );
};
