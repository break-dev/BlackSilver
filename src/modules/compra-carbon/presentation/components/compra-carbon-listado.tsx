import { useMemo, useState } from "react";
import { Stack, Text } from "@mantine/core";
import { CompraCarbonCard } from "./compra-carbon-card";
import type { CompraCarbonResumen } from "../../service/compra-carbon.responses";
import type { RES_Empresa } from "../../../../service/responses/empresa";
import type { ProveedorResponse } from "../../../../modules/proveedores/service/proveedores.responses";

interface Props {
  compras: CompraCarbonResumen[];
  busqueda: string;
  empresasById: Record<number, RES_Empresa>;
  proveedoresById: Record<number, ProveedorResponse>;
  onAprobada?: (cabecera: CompraCarbonResumen) => void;
  onEvidenciasActualizadas?: (cabecera: CompraCarbonResumen) => void;
  onAnulada?: (cabecera: CompraCarbonResumen) => void;
}

export const CompraCarbonListado = ({
  compras,
  busqueda,
  empresasById,
  proveedoresById,
  onAprobada,
  onEvidenciasActualizadas,
  onAnulada,
}: Props) => {
  const [expandedIds, setExpandedIds] = useState<Record<number, boolean>>({});

  const toggle = (id: number) =>
    setExpandedIds((prev) => {
      const current = prev[id] ?? true;
      return { ...prev, [id]: !current };
    });

  const filtradas = useMemo(() => {
    const term = busqueda.trim().toLowerCase();
    if (!term) return compras;
    return compras.filter(
      (c) =>
        c.correlativo.toLowerCase().includes(term) ||
        c.empresa.toLowerCase().includes(term) ||
        c.proveedor.toLowerCase().includes(term),
    );
  }, [compras, busqueda]);

  // Orden mas reciente primero.
  const ordenadas = useMemo(
    () => filtradas.slice().sort((a, b) => b.id_compra_carbon - a.id_compra_carbon),
    [filtradas],
  );

  if (ordenadas.length === 0) {
    return (
      <div className="border border-dashed border-zinc-800 rounded-xl px-4 py-10 text-center">
        <Text size="sm" c="dimmed" fs="italic">
          {busqueda
            ? "Sin resultados para la busqueda."
            : "Aun no hay compras de carbon registradas."}
        </Text>
      </div>
    );
  }

  return (
    <Stack gap="md">
      {ordenadas.map((c) => (
        <CompraCarbonCard
          key={c.id_compra_carbon}
          compra={c}
          isExpanded={expandedIds[c.id_compra_carbon] ?? true}
          onToggle={() => toggle(c.id_compra_carbon)}
          empresa={empresasById[c.id_empresa]}
          proveedor={proveedoresById[c.id_proveedor]}
          onAprobada={onAprobada}
          onEvidenciasActualizadas={onEvidenciasActualizadas}
          onAnulada={onAnulada}
        />
      ))}
    </Stack>
  );
};