import { Badge, Button, Group, Paper, Stack, Text } from "@mantine/core";
import {
  BriefcaseIcon,
  MapIcon,
  BoltIcon,
  FlagIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { useState, useMemo } from "react";
import dayjs from "dayjs";
import { useNotify } from "../../../../hooks/useNotify";
import { MinasService } from "../../service/minas.service";
import { CustomDatePicker } from "../../../../presentation/utils/date-picker-input";
import { type DataTableColumn } from "mantine-datatable";
import { DataTableEstandar } from "../../../../presentation/utils/datatable-estandar";
import { ModalEstandar } from "../../../../presentation/utils/modal-estandar";
import { RegistroLabor } from "./registro-labor";
import { useLabores } from "../../hooks/labores/useLabores";
import type { RES_Labor, RES_ResumenMina } from "../../service/minas.responses";

interface GroupedLaborEmpresa {
  empresa: string;
  labores: RES_Labor[];
  total_activas: number;
}

interface Props {
  mina: RES_ResumenMina;
  onLaborCreada?: (id_mina: number) => void;
  onLaborFinalizada?: (id_mina: number) => void;
  busqueda: string;
  setBusqueda: (v: string) => void;
  openCreate: () => void;
  openedCreate: boolean;
  closeCreate: () => void;
}

export const GestionLabores = ({
  mina,
  onLaborCreada,
  onLaborFinalizada,
  busqueda,
  openedCreate,
  closeCreate,
}: Props) => {
  const {
    laboresFiltradas,
    loading,
    handleLaborCreada,
    handleLaborFinalizada,
  } = useLabores({ idMina: mina.id_mina, busqueda, closeCreate });

  const { notify } = useNotify();

  // Estado para finalizar labor
  const [laborAFinalizar, setLaborAFinalizar] = useState<RES_Labor | null>(
    null,
  );
  const [fechaCierre, setFechaCierre] = useState<Date | null>(new Date());
  const [isCerrando, setIsCerrando] = useState(false);

  const handleOpenFinalizar = (labor: RES_Labor) => {
    setLaborAFinalizar(labor);
    setFechaCierre(new Date());
  };

  const handleConfirmarCierre = async () => {
    if (!laborAFinalizar || !fechaCierre) return;

    setIsCerrando(true);
    try {
      const res = await MinasService.finalizarLabor({
        id_labor: laborAFinalizar.id_labor,
        fecha_cierre: dayjs(fechaCierre).format("YYYY-MM-DD"),
      });

      if (res.success) {
        notify({ type: "success", content: res.message });
        handleLaborFinalizada(res.data);
        if (onLaborFinalizada) onLaborFinalizada(mina.id_mina);
        setLaborAFinalizar(null);
      } else {
        notify({ type: "error", content: res.message });
      }
    } catch {
      notify({ type: "error", content: "Error al finalizar la labor" });
    } finally {
      setIsCerrando(false);
    }
  };

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

    return Object.values(groups).sort((a, b) =>
      a.empresa.localeCompare(b.empresa),
    );
  }, [laboresFiltradas]);

  const columns: DataTableColumn<RES_Labor>[] = [
    {
      accessor: "index",
      title: "#",
      textAlign: "center",
      width: 50,
      render: (_, index) => index + 1,
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
      width: 260,
      render: (r) => (
        <div className="flex flex-col gap-1.5 py-2">
          {r.nombre && (
            <Text
              size="sm"
              fw={800}
              className="text-white tracking-tight leading-none mb-1"
            >
              {r.nombre}
            </Text>
          )}

          {/* Detalles técnicos mejorados y más grandes */}
          {(r.veta || r.nivel || r.ancho || r.alto) && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1 bg-zinc-950/30 p-2 rounded-xl border border-zinc-800/50 w-fit">
              {r.veta && (
                <div className="flex items-center gap-1.5">
                  <MapIcon className="w-3 h-3 text-zinc-500" />
                  <Text size="11px" fw={700} className="text-zinc-400">
                    Veta: <span className="text-zinc-200">{r.veta}</span>
                  </Text>
                </div>
              )}
              {r.nivel && (
                <div className="flex items-center gap-1.5">
                  <BoltIcon className="w-3 h-3 text-zinc-500" />
                  <Text size="11px" fw={700} className="text-zinc-400">
                    Nivel: <span className="text-zinc-200">{r.nivel}</span>
                  </Text>
                </div>
              )}
              {r.ancho && (
                <Text
                  size="11px"
                  fw={700}
                  className="text-emerald-500/80 pl-4.5"
                >
                  {r.ancho}m{" "}
                  <span className="text-zinc-600 font-medium">ancho</span>
                </Text>
              )}
              {r.alto && (
                <Text size="11px" fw={700} className="text-amber-500/80 pl-4.5">
                  {r.alto}m{" "}
                  <span className="text-zinc-600 font-medium">alto</span>
                </Text>
              )}
            </div>
          )}
        </div>
      ),
    },
    {
      accessor: "operacion",
      title: "Tipo / Op.",
      width: 150,
      render: (r) => (
        <div className="flex flex-col gap-1.5 py-2">
          <Badge
            variant="filled"
            color="cyan.9"
            size="xs"
            className="font-black px-2 shadow-sm w-fit uppercase tracking-wider"
          >
            {r.tipo_labor}
          </Badge>
          {r.es_de_produccion == 1 && (
            <Badge
              color="pink.7"
              size="xs"
              variant="filled"
              className="font-black px-2 shadow-sm w-fit tracking-wider"
            >
              PRODUCCIÓN
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessor: "fecha_inicio",
      title: "Período Operativo",
      width: 210,
      render: (r) => (
        <Group gap={8} wrap="nowrap" justify="center">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <Text
                size="9px"
                fw={900}
                className="text-zinc-500 uppercase tracking-tighter w-12"
              >
                Desde:
              </Text>
              <Text size="xs" fw={700} className="text-zinc-200">
                {r.fecha_inicio
                  ? dayjs(r.fecha_inicio).format("DD MMM YYYY")
                  : "—"}
              </Text>
            </div>
            <div className="flex items-center gap-1.5">
              <Text
                size="9px"
                fw={900}
                className="text-zinc-500 uppercase tracking-tighter w-12"
              >
                Estimado:
              </Text>
              <Text size="xs" fw={700} className="text-zinc-400">
                {r.fecha_fin_estimada
                  ? dayjs(r.fecha_fin_estimada).format("DD MMM YYYY")
                  : "—"}
              </Text>
            </div>
            {r.fecha_cierre && (
              <div className="flex items-center gap-1.5 mt-0.5 pt-0.5 border-t border-zinc-800/50">
                <Text
                  size="9px"
                  fw={900}
                  className="text-indigo-500 uppercase tracking-tighter w-12 text-right"
                >
                  Cierre:
                </Text>
                <Text size="xs" fw={900} className="text-indigo-400">
                  {dayjs(r.fecha_cierre).format("DD MMM YYYY")}
                </Text>
              </div>
            )}
            {!r.fecha_cierre && (
              <div className="flex items-center gap-1.5 mt-0.5 opacity-50">
                <Text
                  size="9px"
                  fw={900}
                  className="text-zinc-600 uppercase tracking-tighter w-12"
                >
                  Real:
                </Text>
                <Text size="xs" fw={700} className="text-emerald-500 italic">
                  En curso
                </Text>
              </div>
            )}
          </div>
        </Group>
      ),
    },
    {
      accessor: "acciones",
      title: "Acciones",
      textAlign: "right",
      width: 130,
      render: (r) => (
        <Group gap={6} justify="flex-end" wrap="nowrap">
          {r.estado === "Activo" && (
            <Button
              variant="light"
              color="indigo"
              size="compact-xs"
              radius="md"
              leftSection={<FlagIcon className="w-3.5 h-3.5" />}
              onClick={() => handleOpenFinalizar(r)}
              className="font-bold border border-indigo-500/10 hover:border-indigo-500/30 transition-all"
            >
              Finalizar
            </Button>
          )}
          {r.estado === "Inactivo" && (
            <div className="flex items-center gap-1 text-emerald-500/80 bg-emerald-500/5 px-2 py-1 rounded-lg border border-emerald-500/10">
              <CheckCircleIcon className="w-4 h-4" />
              <Text size="10px" fw={900} className="uppercase tracking-widest">
                Finalizada
              </Text>
            </div>
          )}
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
      <Stack gap="xl">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
            <Text
              size="xs"
              fw={700}
              className="text-zinc-500 uppercase tracking-widest"
            >
              Cargando Labores...
            </Text>
          </div>
        ) : groupedLabores.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 border border-dashed border-zinc-800 rounded-4xl bg-zinc-900/10">
            <Text
              size="sm"
              fw={700}
              className="text-zinc-500 uppercase tracking-widest"
            >
              Sin labores registradas
            </Text>
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

      {/* Modal para Crear Labor */}
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

      {/* Modal para Finalizar Labor */}
      <ModalEstandar
        opened={!!laborAFinalizar}
        close={() => setLaborAFinalizar(null)}
        title="Finalizar Labor Operativa"
        size="md"
      >
        <Stack gap="xl" className="py-2">
          <div className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-2xl">
            <Text
              size="xs"
              fw={800}
              className="uppercase tracking-widest text-zinc-500 mb-1"
            >
              Labor a cerrar
            </Text>
            <Group gap={8}>
              <Badge
                variant="light"
                color="indigo"
                radius="md"
                className="font-bold border border-indigo-500/20 py-3"
              >
                {laborAFinalizar?.correlativo}
              </Badge>
              <Text fw={800} className="text-white">
                {laborAFinalizar?.nombre || "Sin nombre"}
              </Text>
            </Group>
          </div>

          <div className="space-y-4">
            <CustomDatePicker
              label="Fecha de Cierre (Real)"
              placeholder="Seleccione fecha real de término"
              value={fechaCierre}
              onChange={(val: unknown) => setFechaCierre(val as Date | null)}
              required
              withAsterisk
            />

            {laborAFinalizar?.fecha_fin_estimada && fechaCierre && (
              <div
                className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                  dayjs(fechaCierre).isAfter(
                    laborAFinalizar.fecha_fin_estimada,
                    "day",
                  )
                    ? "bg-red-500/5 border-red-500/20 text-red-400"
                    : "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
                }`}
              >
                <ClockIcon className="w-5 h-5 shrink-0" />
                <div className="flex-1">
                  <Text
                    size="xs"
                    fw={800}
                    className="uppercase tracking-widest leading-tight"
                  >
                    Estado de cumplimiento
                  </Text>
                  <Text size="sm" fw={700}>
                    {dayjs(fechaCierre).isAfter(
                      laborAFinalizar.fecha_fin_estimada,
                      "day",
                    )
                      ? `Retraso de ${dayjs(fechaCierre).diff(laborAFinalizar.fecha_fin_estimada, "day")} días`
                      : dayjs(fechaCierre).isBefore(
                            laborAFinalizar.fecha_fin_estimada,
                            "day",
                          )
                        ? `Adelantado por ${dayjs(laborAFinalizar.fecha_fin_estimada).diff(fechaCierre, "day")} días`
                        : "Finalizado a tiempo (según plan)"}
                  </Text>
                </div>
              </div>
            )}
          </div>

          <Group justify="flex-end" gap="md">
            <Button
              variant="subtle"
              color="gray"
              onClick={() => setLaborAFinalizar(null)}
              radius="lg"
            >
              Cancelar
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700"
              loading={isCerrando}
              onClick={handleConfirmarCierre}
              radius="lg"
              leftSection={<CheckCircleIcon className="w-5 h-5" />}
            >
              Confirmar Cierre
            </Button>
          </Group>
        </Stack>
      </ModalEstandar>
    </div>
  );
};

interface EmpresaLaborGroupProps {
  group: GroupedLaborEmpresa;
  columns: DataTableColumn<RES_Labor>[];
  loading: boolean;
}

const EmpresaLaborGroup = ({
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
            <BriefcaseIcon className="w-4 h-4 text-indigo-400" />
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
