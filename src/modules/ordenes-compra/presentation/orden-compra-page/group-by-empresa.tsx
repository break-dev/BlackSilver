import { Paper, Stack, Loader, Text, Badge, Group } from "@mantine/core";
import { Building2, ClipboardCheck } from "lucide-react";
import { DataTableEstandar } from "../../../../presentation/utils/datatable-estandar";
import type { RES_OrdenCompra } from "../../../../service/responses/ordenes-compra/orden-compra";
import { type DataTableColumn } from "mantine-datatable";
import { formatNumber } from "../../../../shared/functions/formatNumber";

interface GroupByEmpresaProps {
  groupedOrders: { empresa: string; ruc: string; orders: RES_OrdenCompra[] }[];
  tableColumns: DataTableColumn<RES_OrdenCompra>[];
  loading: boolean;
}

export const GroupByEmpresa = ({
  groupedOrders,
  tableColumns,
  loading,
}: GroupByEmpresaProps) => {
  if (loading) {
    return (
      <Paper
        radius="32px"
        className="bg-zinc-950/40 border border-zinc-800/50 p-20"
      >
        <Stack align="center" gap="md">
          <Loader color="indigo" size="lg" variant="dots" />
          <Text size="xs" fw={900} className="uppercase tracking-[0.3em]">
            Cargando Órdenes...
          </Text>
        </Stack>
      </Paper>
    );
  }

  if (groupedOrders.length === 0) {
    return (
      <Paper
        radius="32px"
        className="bg-zinc-950/40 border border-zinc-800/50 p-20"
      >
        <Stack align="center" justify="center" gap="xl">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full scale-150 animate-pulse" />
            <Paper
              p="xl"
              radius="100%"
              className="bg-zinc-900/80 border border-zinc-800 relative z-10 shadow-2xl"
            >
              <ClipboardCheck size={64} className="text-zinc-700" />
            </Paper>
          </div>
          <Stack gap="xs" align="center">
            <Text fw={900} size="md" className="text-zinc-500 tracking-tighter">
              No se encontraron Órdenes de Compra
            </Text>
            <Text size="sm" c="zinc.6" fw={700} className="italic">
              Intente ajustar los parámetros de búsqueda
            </Text>
          </Stack>
        </Stack>
      </Paper>
    );
  }

  return (
    <div className="gsap-page-table space-y-6">
      {groupedOrders.map((group) => (
        <div
          key={group.ruc}
          className="bg-zinc-900/65 border border-zinc-800 rounded-[24px] shadow-2xl overflow-hidden flex flex-col backdrop-blur-md animate-fade-in"
        >
          {/* Header del Grupo */}
          <div className="p-4 bg-zinc-900/20 border-b border-zinc-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                <Building2 size={14} className="text-indigo-400" />
              </div>
              <Stack gap={2}>
                <Text
                  fw={700}
                  className="uppercase tracking-widest text-zinc-500"
                  size="9px"
                >
                  Empresa
                </Text>
                <Group gap={12}>
                  <Text
                    size="12px"
                    fw={800}
                    className="text-white tracking-tight uppercase"
                  >
                    {group.empresa}
                  </Text>
                  <Badge variant="light" color="indigo" radius="sm">
                    RUC: {group.ruc}
                  </Badge>
                </Group>
              </Stack>
            </div>
            <div className="flex items-center gap-6 px-6 py-2 bg-zinc-950/40 rounded-xl border border-zinc-800/50">
              <div className="flex flex-col items-end border-r border-zinc-800 pr-6">
                <Text
                  size="9px"
                  fw={700}
                  className="text-zinc-600 uppercase tracking-widest"
                >
                  Documentos
                </Text>
                <Text size="xs" fw={800} className="text-indigo-400">
                  {group.orders.length} OC(s)
                </Text>
              </div>
              <div className="flex flex-col items-end">
                <Text
                  size="9px"
                  fw={700}
                  className="text-zinc-600 uppercase tracking-widest"
                >
                  Consolidado Estimado
                </Text>
                <Text size="xs" fw={900} className="text-emerald-500 font-mono">
                  S/. {formatNumber(group.orders.reduce((acc, curr) => acc + Number(curr.total_despues_igv), 0))}
                </Text>
              </div>
            </div>
          </div>

          {/* Tabla de Resultados */}
          <div className="relative shadow-inner">
            <DataTableEstandar
              idAccessor="id_orden_compra"
              columns={tableColumns}
              records={group.orders}
              loading={loading}
              minHeight={0}
              initialPageSize={5}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
