import { useState } from "react";
import { Badge, Group, Paper, Stack, Text } from "@mantine/core";
import { InboxStackIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { BlackcitoMascot } from "../../../../presentation/components/BlackcitoMascot";
import { type DataTableColumn } from "mantine-datatable";
import { DataTableEstandar } from "../../../../presentation/utils/datatable-estandar";
import type { RES_Lote } from "../../service/lotes.responses";
import type { GroupedProduct } from "./types";
import { formatNumber } from "../../../../presentation/functions/formatNumber";

interface ProductGroupCardProps {
  product: GroupedProduct;
  columns: DataTableColumn<RES_Lote>[];
  loading: boolean;
}

export const ProductGroupCard = ({
  product,
  columns,
  loading,
}: ProductGroupCardProps) => {
  const [showBlackcito, setShowBlackcito] = useState(false);

  const isBajoStock =
    Number(product.total_stock_base) <= Number(product.stock_minimo);

  return (
    <Paper
      withBorder
      radius="24px"
      className="bg-zinc-900/20 border-zinc-800/50 shadow-xl overflow-hidden flex flex-col"
    >
      {/* Product Summary Header */}
      <div className="p-4 bg-zinc-900/40 border-b border-zinc-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
            <InboxStackIcon className="w-4 h-4 text-indigo-400" />
          </div>
          <Stack gap={0}>
            <Text
              fw={800}
              className="uppercase tracking-widest text-zinc-500 text-[10px]!"
            >
              {product.categoria || "S/C"}
            </Text>
            <div className="flex flex-row gap-3">
              <Text size="md" fw={900} className="text-white tracking-tight">
                {product.producto}
              </Text>
              <Group gap={4} className="flex flex-row self-end gap-3 mb-0.5">
                {product.es_fiscalizado && (
                  <Badge color="yellow" variant="light" size="xs">
                    Fiscalizado
                  </Badge>
                )}
                {product.es_perecible && (
                  <Badge color="red" variant="light" size="xs">
                    Perecible
                  </Badge>
                )}
                {isBajoStock && (
                  <>
                    <div 
                      className="bg-orange-500/20 border-2 border-orange-500/60 rounded-md py-1 px-2.5 w-fit animate-pulse flex items-center gap-1.5 shadow-[0_0_12px_rgba(249,115,22,0.4)] cursor-help"
                      onMouseEnter={() => setShowBlackcito(true)}
                      onMouseLeave={() => setShowBlackcito(false)}
                    >
                      <ExclamationTriangleIcon className="w-4 h-4 text-orange-400" />
                      <Text
                        size="10px"
                        c="white"
                        fw={900}
                        className="uppercase tracking-widest leading-none"
                        style={{ textShadow: "0px 1px 2px rgba(0,0,0,0.8)" }}
                      >
                        ¡Stock crítico!
                      </Text>
                    </div>

                    <BlackcitoMascot 
                      emotion="enojado" 
                      message={`¡Oye! El inventario de ${product.producto} está por debajo del límite de seguridad. ¡Se sugiere solicitar reabastecimiento urgente!`}
                      visible={showBlackcito}
                    />
                  </>
                )}
              </Group>
            </div>
          </Stack>
        </div>

        <div className="flex items-center gap-6">
          {/* Expiration Mini-Summary */}
          {product.es_perecible == true && (
            <div className="hidden sm:flex items-center gap-4 p-2 bg-zinc-950/40 rounded-xl border border-zinc-800/50 px-4">
              <div className="flex flex-col items-center">
                <Text size="8px" fw={900} className="text-zinc-600 uppercase">
                  Vigentes
                </Text>
                <Text size="xs" fw={900} className="text-emerald-500">
                  {product.vigentes}
                </Text>
              </div>
              <div className="w-px h-6 bg-zinc-800/50" />
              <div className="flex flex-col items-center">
                <Text size="8px" fw={900} className="text-zinc-600 uppercase">
                  Por Vencer
                </Text>
                <Text size="xs" fw={900} className="text-amber-500">
                  {product.por_vencer}
                </Text>
              </div>
              <div className="w-px h-6 bg-zinc-800/50" />
              <div className="flex flex-col items-center">
                <Text size="8px" fw={900} className="text-zinc-600 uppercase">
                  Vencidos
                </Text>
                <Text size="xs" fw={900} className="text-red-500">
                  {product.vencidos}
                </Text>
              </div>
            </div>
          )}

          <div className="flex flex-col items-end gap-2">
            <Badge
              variant="gradient"
              gradient={{ from: "indigo.8", to: "cyan.8" }}
              radius="md"
              size="md"
              className="h-9 px-6 border-0 shadow-lg shadow-indigo-900/20"
            >
              <Text size="xs" fw={800} className="text-center">
                {product.total_stock_base} {product.unidad_medida_base}
              </Text>
            </Badge>
            <div className="flex items-center gap-1 px-1">
              <Text size="10px" c="zinc.5" fw={700}>
                Mínimo:
              </Text>
              <Text size="10px" c="pink.5" fw={800}>
                {formatNumber(product.stock_minimo)}{" "}
                {product.unidad_medida_base}
              </Text>
            </div>
          </div>
        </div>
      </div>

      {/* DataTable for lots of this product */}
      <div className="relative">
        <DataTableEstandar
          idAccessor="id_lote"
          columns={columns}
          records={product.lotes}
          loading={loading}
          initialPageSize={5}
          minHeight={0} // Allows shrinking
          // Using a style for max height control
          // style={{ maxHeight: 350 }}
        />
      </div>
    </Paper>
  );
};
