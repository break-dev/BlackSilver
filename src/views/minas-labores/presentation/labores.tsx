import { Badge, Button, Group, Paper, Stack, Text, TextInput } from "@mantine/core";
import { PlusIcon, MagnifyingGlassIcon, BriefcaseIcon, MapIcon, BoltIcon, CalendarDaysIcon, InboxStackIcon } from "@heroicons/react/24/outline";
import { useMemo } from "react";
import { type DataTableColumn } from "mantine-datatable";
import { DataTableEstandar } from "../../../presentation/utils/datatable-estandar";
import { ModalEstandar } from "../../../presentation/utils/modal-estandar";
import { RegistroLabor } from "./registro-labor";
import { useLabores } from "../hooks/useLabores";
import type { RES_Labor, RES_ResumenMina } from "../service/minas.responses";

interface GroupedLaborEmpresa {
  empresa: string;
  labores: RES_Labor[];
  total_activas: number;
}

interface Props {
  mina: RES_ResumenMina;
  onLaborCreada?: (id_mina: number) => void;
}

export const GestionLabores = ({ mina, onLaborCreada }: Props) => {
  const {
    laboresFiltradas,
    loading,
    busqueda,
    setBusqueda,
    openedCreate,
    openCreate,
    closeCreate,
    handleLaborCreada,
  } = useLabores({ idMina: mina.id_mina });

  // Lógica de agrupación por empresa
  const groupedLabores = useMemo(() => {
    const groups: Record<string, GroupedLaborEmpresa> = {};

    laboresFiltradas.forEach((l) => {
      const key = l.empresa || "Sin asignar";
      if (!groups[key]) {
        groups[key] = {
          empresa: key,
          labores: [],
          total_activas: 0,
        };
      }
      groups[key].labores.push(l);
      if (l.estado === "Activo") groups[key].total_activas++;
    });

    return Object.values(groups).sort((a, b) => a.empresa.localeCompare(b.empresa));
  }, [laboresFiltradas]);

  const columns: DataTableColumn<RES_Labor>[] = [
    {
      accessor: "index",
      title: "#",
      textAlign: "center",
      width: 50,
    },
    {
      accessor: "correlativo",
      title: "Cod. Labor",
      textAlign: "center",
      width: 130,
      render: (r) => (
        <Badge
          variant="light"
          color="indigo"
          radius="md"
          className="font-bold border border-indigo-500/20 py-3 mx-auto"
        >
          {r.correlativo}
        </Badge>
      ),
    },
    {
      accessor: "nombre",
      title: "Labor",
      width: 280,
      render: (r) => (
        <div className="flex flex-col gap-1.5 py-2">
          <Text size="sm" fw={800} className="text-white tracking-tight leading-none">
            {r.nombre}
          </Text>
          


          {/* Detalles técnicos mejorados y más grandes */}
          {(r.veta || r.nivel || r.ancho || r.alto) && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1 bg-zinc-950/30 p-2 rounded-xl border border-zinc-800/50 w-fit">
              {r.veta && (
                <div className="flex items-center gap-1.5">
                  <MapIcon className="w-3 h-3 text-zinc-500" />
                  <Text size="11px" fw={700} className="text-zinc-400">Veta: <span className="text-zinc-200">{r.veta}</span></Text>
                </div>
              )}
              {r.nivel && (
                <div className="flex items-center gap-1.5">
                  <BoltIcon className="w-3 h-3 text-zinc-500" />
                  <Text size="11px" fw={700} className="text-zinc-400">Nivel: <span className="text-zinc-200">{r.nivel}</span></Text>
                </div>
              )}
              {r.ancho && (
                <Text size="11px" fw={700} className="text-emerald-500/80 pl-4.5">{r.ancho}m <span className="text-zinc-600 font-medium">ancho</span></Text>
              )}
              {r.alto && (
                <Text size="11px" fw={700} className="text-amber-500/80 pl-4.5">{r.alto}m <span className="text-zinc-600 font-medium">alto</span></Text>
              )}
            </div>
          )}
        </div>
      ),
    },
    {
      accessor: "operacion",
      title: "Tipo y Operación",
      width: 200,
      render: (r) => (
        <div className="flex flex-col gap-1.5 py-2">
          <Badge variant="filled" color="cyan.9" size="xs" className="font-black px-2 shadow-sm w-fit uppercase tracking-wider">
            {r.tipo_labor}
          </Badge>
          {r.es_de_produccion == 1 && (
            <Badge color="pink.7" size="xs" variant="filled" className="font-black px-2 shadow-sm w-fit tracking-wider">
              PRODUCCIÓN
            </Badge>
          )}
          {r.tipo_sostenimiento && (
            <Badge variant="outline" color="white" size="xs" className="font-bold border-zinc-200/50 text-white px-2 w-fit uppercase bg-white/5 shadow-sm">
              {r.tipo_sostenimiento}
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessor: "fecha_inicio",
      title: "Período Operativo",
      width: 180,
      render: (r) => (
        <Group gap={8} wrap="nowrap" justify="center">
          <div className="p-1.5 bg-zinc-800/50 rounded-lg border border-zinc-700/30">
            <CalendarDaysIcon className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <Text size="9px" fw={900} className="text-zinc-500 uppercase tracking-tighter w-12">Desde:</Text>
              <Text size="xs" fw={700} className="text-zinc-200">
                {r.fecha_inicio ? new Date(r.fecha_inicio).toLocaleDateString("es-PE", { day: '2-digit', month: 'short', year: 'numeric' }) : "—"}
              </Text>
            </div>
            <div className="flex items-center gap-1.5">
              <Text size="9px" fw={900} className="text-zinc-500 uppercase tracking-tighter w-12">Hasta:</Text>
              <Text size="xs" fw={700} className={r.fecha_fin ? "text-zinc-300" : "text-emerald-500 font-bold"}>
                {r.fecha_fin ? new Date(r.fecha_fin).toLocaleDateString("es-PE", { day: '2-digit', month: 'short', year: 'numeric' }) : "En curso"}
              </Text>
            </div>
          </div>
        </Group>
      ),
    },
    {
      accessor: "estado",
      title: "Estado",
      textAlign: "center",
      width: 110,
      render: (r) => (
        <Badge
          color={r.estado === "Activo" ? "teal.9" : "zinc.7"}
          variant="filled"
          size="sm"
          radius="md"
          className="font-black border border-zinc-800/50 shadow-md"
        >
          {r.estado === "Activo" ? "ACTIVA" : "TERMINADA"}
        </Badge>
      ),
    },
  ];

  const handleLocalLaborCreada = (nueva: RES_Labor) => {
    handleLaborCreada(nueva);
    if (onLaborCreada) onLaborCreada(mina.id_mina);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-end gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white leading-tight">
            Labores Operativas
          </h3>
          <div className="flex items-center gap-2 mt-0.5">
            <Text size="xs" color="dimmed" fw={500}>{mina.nombre}</Text>
            {mina.almacenes_suministradores && (
              <>
                <div className="w-1 h-1 rounded-full bg-zinc-700" />
                <Badge 
                  variant="transparent" 
                  color="cyan" 
                  size="xs" 
                  className="p-0 h-auto font-bold lowercase italic text-zinc-500"
                  leftSection={<InboxStackIcon className="w-3 h-3" />}
                >
                  abastecido por: {mina.almacenes_suministradores}
                </Badge>
              </>
            )}
          </div>
        </div>

        <div className="flex w-full sm:w-auto items-center gap-3">
          <TextInput
            placeholder="Buscar por nombre, veta o nivel..."
            leftSection={
              <MagnifyingGlassIcon className="w-4 h-4 text-zinc-400" />
            }
            value={busqueda}
            onChange={(e) => setBusqueda(e.currentTarget.value)}
            className="flex-1"
            radius="lg"
            size="sm"
            classNames={{
              input:
                "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500",
            }}
          />
          <Button
            leftSection={<PlusIcon className="w-5 h-5" />}
            onClick={openCreate}
            radius="lg"
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20 shrink-0"
          >
            Nueva Labor
          </Button>
        </div>
      </div>

      <Stack gap="xl">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
             <div className="w-10 h-10 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
             <Text size="xs" fw={700} className="text-zinc-500 uppercase tracking-widest">Cargando Labores...</Text>
          </div>
        ) : groupedLabores.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 border border-dashed border-zinc-800 rounded-4xl bg-zinc-900/10">
            <Text size="sm" fw={700} className="text-zinc-500 uppercase tracking-widest">Sin labores registradas</Text>
          </div>
        ) : (
          groupedLabores.map((group) => (
            <EmpresaLaborGroup
              key={group.empresa}
              group={group}
              columns={columns}
              loading={loading}
            />
          ))
        )}
      </Stack>

      <ModalEstandar
        opened={openedCreate}
        close={closeCreate}
        title="Registrar Labor"
        size="lg"
      >
        <RegistroLabor
          idMina={mina.id_mina}
          onSuccess={handleLocalLaborCreada}
          onCancel={closeCreate}
        />
      </ModalEstandar>
    </div>
  );
};

interface EmpresaLaborGroupProps {
  group: GroupedLaborEmpresa;
  columns: DataTableColumn<RES_Labor>[];
  loading: boolean;
}

const EmpresaLaborGroup = ({ group, columns, loading }: EmpresaLaborGroupProps) => {
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
            <BriefcaseIcon className="w-4 h-4 text-indigo-400" />
          </div>
          <Stack gap={0}>
            <Text fw={800} className="uppercase tracking-widest text-zinc-500 text-[10px]!">
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
              <Text size="8px" fw={900} className="text-zinc-600 uppercase tracking-widest">
                Activas
              </Text>
              <Text size="xs" fw={900} className="text-emerald-500">
                {group.total_activas}
              </Text>
            </div>
            <div className="w-px h-6 bg-zinc-800/50" />
            <div className="flex flex-col items-center">
              <Text size="8px" fw={900} className="text-zinc-600 uppercase tracking-widest">
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

