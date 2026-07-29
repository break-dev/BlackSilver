import { Paper, Stack, Text } from "@mantine/core";
import { BriefcaseIcon } from "@heroicons/react/24/outline";
import { type DataTableColumn } from "mantine-datatable";
import { DataTableEstandar } from "../../../../../presentation/utils/datatable-estandar";
import type { RES_ResumenLabor } from "../../../service/minas.responses";

export interface GroupedLaborEmpresa {
  empresa: string;
  labores: RES_ResumenLabor[];
  total_activas: number;
}

interface EmpresaLaborGroupProps {
  group: GroupedLaborEmpresa;
  columns: DataTableColumn<RES_ResumenLabor>[];
  loading: boolean;
}

export const EmpresaLaborGroup = ({
  group,
  columns,
  loading,
}: EmpresaLaborGroupProps) => {
  return (
    <Paper
      withBorder
      radius="24px"
      className="bg-zinc-900/20 border-zinc-800/50 shadow-xl overflow-hidden flex flex-col"
    >
      {/* Header del Grupo por Empresa */}
      <div className="p-4 bg-zinc-900/40 border-b border-zinc-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
            <BriefcaseIcon className="size-4 text-indigo-400" />
          </div>
          <Stack gap={0}>
            <Text
              fw={800}
              className="uppercase tracking-widest text-zinc-500 text-[10px]!"
            >
              Contratista / Empresa
            </Text>
            <Text size="md" fw={900} className="text-white tracking-tight">
              {group.empresa}
            </Text>
          </Stack>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 p-2 bg-zinc-950/40 rounded-xl border border-zinc-800/50 px-5">
            <div className="flex flex-col items-center">
              <Text
                size="8px"
                fw={900}
                className="text-zinc-600 uppercase tracking-widest"
              >
                Activas
              </Text>
              <Text size="xs" fw={900} className="text-emerald-500">
                {group.total_activas}
              </Text>
            </div>
            <div className="w-px h-6 bg-zinc-800/50" />
            <div className="flex flex-col items-center">
              <Text
                size="8px"
                fw={900}
                className="text-zinc-600 uppercase tracking-widest"
              >
                Total de Labores
              </Text>
              <Text size="xs" fw={900} className="text-indigo-400">
                {group.labores.length}
              </Text>
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        <DataTableEstandar
          idAccessor="id_labor"
          columns={columns}
          records={group.labores}
          loading={loading}
          initialPageSize={10}
          minHeight={0}
        />
      </div>
    </Paper>
  );
};
