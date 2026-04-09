import { Badge } from "@mantine/core";
import { MONEDAS } from "../../../../../shared/variables/monedas";
import type { CuentaBancariaResponse } from "../../../service/proveedores.responses";

interface Props {
  cuenta: CuentaBancariaResponse;
}

export const CuentaBancaria = ({ cuenta }: Props) => {
  return (
    <div className="flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:bg-zinc-800/50 transition-colors">
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <span className="text-white font-medium">{cuenta.banco_nombre}</span>
          <span className="text-sm text-zinc-400 font-mono mt-0.5">
            {cuenta.numero_cuenta}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex flex-col items-end">
          <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">
            Moneda
          </span>
          <Badge
            color={cuenta.moneda === MONEDAS.PEN.label ? "blue.8" : "emerald.8"}
            variant="light"
            size="sm"
          >
            {cuenta.moneda}
          </Badge>
        </div>

        <div className="flex flex-col items-end min-w-[120px]">
          <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">
            CCI
          </span>
          <span className="text-sm text-zinc-300 font-mono">
            {cuenta.cci || "No registrado"}
          </span>
        </div>

        <div className="flex flex-col items-end min-w-[80px]">
          <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">
            Detracción
          </span>
          {cuenta.es_para_detraccion === 1 ? (
            <Badge color="yellow.8" variant="dot" size="sm">
              Sí
            </Badge>
          ) : (
            <span className="text-sm text-zinc-500">-</span>
          )}
        </div>
      </div>
    </div>
  );
};
