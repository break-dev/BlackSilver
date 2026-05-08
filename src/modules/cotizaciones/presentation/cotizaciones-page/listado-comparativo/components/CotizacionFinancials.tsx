import { Group, Text, Badge } from "@mantine/core";
import dayjs from "dayjs";
import {
  BanknotesIcon,
  TruckIcon,
  CurrencyDollarIcon,
  ReceiptPercentIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { formatNumber } from "../../../../../../shared/functions/formatNumber";
import { MetodoPago } from "../../../../../../shared/enums/_generic/metodo-pago";
import type { RES_Cotizacion } from "../../../../../../service/responses/cotizaciones/cotizacion";

interface CotizacionFinancialsProps {
  cot: RES_Cotizacion;
}

export const CotizacionFinancials = ({ cot }: CotizacionFinancialsProps) => {
  const symbol = cot.moneda === "Soles" ? "S/." : "$";

  return (
    <div className="flex flex-wrap gap-x-6 gap-y-2 mb-3 px-1">
      {/* Subtotal */}
      <Group gap="xs">
        <BanknotesIcon className="w-3.5 h-3.5 text-zinc-500" />
        <Text size="xs" c="dimmed">
          Subtotal (sin IGV):{" "}
          <span className="text-zinc-300 font-bold">
            {symbol} {formatNumber(Number(cot.total_antes_igv))}
          </span>
        </Text>
      </Group>

      {/* Costo flete */}
      {Number(cot.costo_flete) > 0 && (
        <Group gap="xs">
          <TruckIcon className="w-3.5 h-3.5 text-amber-500/70" />
          <Text size="xs" c="dimmed">
            Flete:{" "}
            <span className="text-amber-300 font-bold">
              {symbol} {formatNumber(Number(cot.costo_flete))}
            </span>
          </Text>
        </Group>
      )}

      {/* Otros gastos */}
      {Number(cot.otros_gastos) > 0 && (
        <Group gap="xs">
          <CurrencyDollarIcon className="w-3.5 h-3.5 text-amber-500/70" />
          <Text size="xs" c="dimmed">
            Otros gastos:{" "}
            <span className="text-amber-300 font-bold">
              {symbol} {formatNumber(Number(cot.otros_gastos))}
            </span>
          </Text>
        </Group>
      )}

      {/* Incluye IGV */}
      <Group gap="xs">
        <ReceiptPercentIcon className="w-3.5 h-3.5 text-zinc-500" />
        <Text
          size="xs"
          c="dimmed"
          component="div"
          className="flex items-center gap-1"
        >
          IGV incluido:{" "}
          <Badge
            variant="light"
            color={cot.incluye_igv ? "teal" : "orange"}
            size="xs"
          >
            {cot.incluye_igv ? "Sí" : "No"}
          </Badge>
        </Text>
      </Group>

      {/* Monto IGV */}
      <Group gap="xs">
        <CurrencyDollarIcon className="w-3.5 h-3.5 text-zinc-500" />
        <Text size="xs" c="dimmed">
          IGV ({cot.porcentaje_igv}%):{" "}
          <span className="text-zinc-300 font-bold">
            {symbol} {formatNumber(Number(cot.monto_igv))}
          </span>
        </Text>
      </Group>

      {/* Total con IGV */}
      <Group gap="xs">
        <BanknotesIcon className="w-3.5 h-3.5 text-emerald-500/70" />
        <Text size="xs" c="dimmed">
          Total (con IGV):{" "}
          <span className="text-emerald-400 font-bold">
            {symbol} {formatNumber(Number(cot.total_despues_igv))}
          </span>
        </Text>
      </Group>

      {/* Vencimiento crédito */}
      {cot.metodo_pago === MetodoPago.Credito && cot.fecha_vencimiento_pago && (
        <Group gap="xs">
          <ClockIcon className="w-3.5 h-3.5 text-violet-400" />
          <Text size="xs" c="dimmed">
            Vence:{" "}
            <span className="text-violet-300 font-bold">
              {dayjs(cot.fecha_vencimiento_pago).format("DD/MM/YYYY")}
            </span>
          </Text>
        </Group>
      )}

      {/* Tipo de Cambio Referencial */}
      {cot.moneda !== "Soles" && cot.tipo_cambio_venta_referencial !== null && (
        <Group gap="xs">
          <CurrencyDollarIcon className="w-3.5 h-3.5 text-blue-400" />
          <Text size="xs" c="dimmed">
            TC Venta Ref:{" "}
            <span className="text-blue-300 font-bold">
              {cot.tipo_cambio_venta_referencial}
            </span>
          </Text>
        </Group>
      )}
    </div>
  );
};
