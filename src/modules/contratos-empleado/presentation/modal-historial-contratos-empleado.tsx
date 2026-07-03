import { useState } from "react";
import {
  Stack,
  Group,
  Text,
  Badge,
  Loader,
  Button,
  Paper,
  Collapse,
  UnstyledButton,
  Divider,
} from "@mantine/core";
import {
  CheckBadgeIcon,
  XCircleIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  BriefcaseIcon,
  MapPinIcon,
  UserCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PaperClipIcon,
  PlusIcon,
  ClockIcon,
  DocumentIcon,
} from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import { useHistorialContratosEmpleado } from "../hooks/useHistorialContratosEmpleado";
import { ModalEstandar } from "../../../presentation/utils/modal-estandar";
import { ArchivoCard } from "../../../presentation/utils/archivo/archivo-card";
import type { IArchivo } from "../../../shared/interfaces/archivo";
import { ModalContratoEmpleado } from "./modal-contrato-empleado";

interface ModalHistorialContratosEmpleadoProps {
  idEmpleado: number;
  nombreEmpleado: string;
  opened: boolean;
  close: () => void;
  onContratoCreado?: (payload: { empleado?: unknown }) => void;
}

const formatDate = (iso: string | null | undefined) => {
  if (!iso) return "—";
  return dayjs(iso).format("DD/MM/YYYY");
};

const parseEvidencias = (raw: unknown): IArchivo[] => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as IArchivo[];
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as IArchivo[]) : [];
    } catch {
      return [];
    }
  }
  return [];
};

export const ModalHistorialContratosEmpleado = ({
  idEmpleado,
  nombreEmpleado,
  opened,
  close,
  onContratoCreado,
}: ModalHistorialContratosEmpleadoProps) => {
  const { contratos, loading, reload, getUltimoContrato } =
    useHistorialContratosEmpleado(opened ? idEmpleado : null);

  const [expandedIds, setExpandedIds] = useState<Record<number, boolean>>({});
  const [modalNuevoContratoAbierto, setModalNuevoContratoAbierto] =
    useState(false);

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const isExpanded = (id: number, index: number) => {
    if (expandedIds[id] !== undefined) return expandedIds[id];
    // Por defecto, abrir el primero (el más reciente)
    return index === 0;
  };

  // Al crear un nuevo contrato desde el modal, se refresca el historial
  // y se avisa al padre para que actualice la fila del empleado.
  const handleContratoCreado = (payload?: unknown) => {
    setModalNuevoContratoAbierto(false);
    void reload();
    onContratoCreado?.(payload as { empleado?: unknown });
  };

  // Al abrir el modal de "Nuevo Contrato", se pasa el último contrato
  // del historial para que el form pre-rellene los campos.
  const handleAbrirNuevoContrato = () => {
    setModalNuevoContratoAbierto(true);
  };

  const ultimoContrato = getUltimoContrato();

  return (
    <>
      <ModalEstandar
        opened={opened}
        close={close}
        title="Contratos del Empleado"
        size="xl"
      >
        <Stack gap="md" className="max-h-[78vh] overflow-y-auto px-2 py-2">
          {/* Header con icono + nombre del empleado */}
          <Group
            gap="md"
            className="px-4 py-3 rounded-2xl border border-zinc-800/60 bg-zinc-900/30"
            wrap="nowrap"
          >
            <div className="p-3 rounded-2xl border border-indigo-500/20 bg-indigo-500/10 shrink-0">
              <UserCircleIcon className="w-6 h-6 text-indigo-400" />
            </div>
            <Stack gap={2}>
              <Text
                size="9px"
                fw={800}
                c="zinc.5"
                className="uppercase tracking-widest"
              >
                Empleado
              </Text>
              <Text size="sm" fw={800} className="text-zinc-100">
                {nombreEmpleado}
              </Text>
            </Stack>
          </Group>

          <Group justify="space-between" align="center" wrap="nowrap">
            <Group gap="xs">
              <Text
                size="xs"
                fw={900}
                c="zinc.4"
                className="uppercase tracking-widest"
              >
                Historial
              </Text>
              <Badge
                variant="light"
                color="indigo"
                radius="sm"
                size="sm"
                className="font-bold"
              >
                {contratos.length}{" "}
                {contratos.length === 1 ? "contrato" : "contratos"}
              </Badge>
            </Group>

            <Button
              size="xs"
              radius="lg"
              color="teal"
              variant="light"
              leftSection={<PlusIcon className="w-4 h-4" />}
              onClick={handleAbrirNuevoContrato}
              className="font-bold border border-teal-500/20"
            >
              Nuevo Contrato
            </Button>
          </Group>

          <Divider color="zinc.8" />

          {/* Contenido */}
          {loading ? (
            <Stack align="center" gap="md" py={60}>
              <Loader color="indigo" />
              <Text size="sm" c="dimmed">
                Cargando historial de contratos...
              </Text>
            </Stack>
          ) : contratos.length === 0 ? (
            <Stack align="center" gap="sm" py={60}>
              <CurrencyDollarIcon className="w-12 h-12 text-zinc-700" />
              <Text size="sm" c="dimmed" fw={600}>
                Este empleado no tiene contratos registrados aún.
              </Text>
              <Button
                size="sm"
                radius="lg"
                color="teal"
                variant="light"
                leftSection={<PlusIcon className="w-4 h-4" />}
                onClick={() => setModalNuevoContratoAbierto(true)}
                className="mt-2 font-bold border border-teal-500/20"
              >
                Crear primer contrato
              </Button>
            </Stack>
          ) : (
            <Stack gap="md" className="pb-4">
              {contratos.map((c, index) => {
                const expanded = isExpanded(c.id_contrato, index);
                const esVigente = c.estado === "Activo";
                const evidencias = parseEvidencias(c.evidencias);
                const sueldoMostrar =
                  c.tipo_contrato === "Planilla"
                    ? c.sueldo_base
                    : c.salario_diario;
                const unidad =
                  c.tipo_contrato === "Planilla" ? "" : " / día";
                const tieneCierreAnticipado = !!c.fecha_fin_anticipada;

                return (
                  <Paper
                    key={c.id_contrato}
                    radius="xl"
                    className={`border shadow-[0_4px_30px_rgba(0,0,0,0.1)] transition-all group relative overflow-hidden p-0 shrink-0 ${esVigente
                        ? "bg-teal-500/5 border-teal-500/30 hover:border-teal-500/50"
                        : "bg-zinc-900/30 border-zinc-800/80 hover:bg-zinc-900/50 hover:border-indigo-500/20"
                      }`}
                  >
                    {/* Highlight superior */}
                    <div
                      className={`absolute top-0 left-0 w-full h-1 bg-linear-to-r ${esVigente
                          ? "from-teal-500/40 via-teal-500/60 to-teal-500/10"
                          : "from-zinc-500/20 via-indigo-500/30 to-indigo-500/5"
                        } group-hover:opacity-100 transition-opacity`}
                    />

                    <UnstyledButton
                      className="w-full px-12 py-6"
                      onClick={() => toggleExpand(c.id_contrato)}
                    >
                      <Group
                        justify="space-between"
                        align="center"
                        wrap="nowrap"
                        gap="md"
                        className="pt-2"
                      >
                        <Group
                          gap="md"
                          wrap="nowrap"
                          className="shrink-0 flex-1 min-w-0 items-center"
                        >
                          <div
                            className={`p-3 rounded-xl border shrink-0 ${esVigente
                                ? "bg-teal-500/10 border-teal-500/20"
                                : "bg-indigo-500/10 border-indigo-500/20"
                              }`}
                          >
                            <DocumentIcon
                              className={`w-5 h-5 ${esVigente
                                  ? "text-teal-400"
                                  : "text-indigo-400"
                                }`}
                            />
                          </div>
                          <Stack gap={8} className="min-w-0 flex-1">
                            <Group gap="xs" wrap="nowrap">
                              <Text
                                size="sm"
                                fw={900}
                                className="text-white truncate"
                              >
                                {c.cargo ?? "—"}
                              </Text>
                              <Badge
                                variant="light"
                                color={
                                  c.tipo_contrato === "Planilla"
                                    ? "indigo"
                                    : "teal"
                                }
                                radius="sm"
                                size="xs"
                                className="font-bold"
                              >
                                {c.tipo_contrato === "Planilla"
                                  ? "Planilla"
                                  : "Jornada Diaria"}
                              </Badge>
                              {esVigente && (
                                <Badge
                                  variant="light"
                                  color="green"
                                  radius="sm"
                                  size="xs"
                                  leftSection={
                                    <CheckBadgeIcon className="w-3 h-3" />
                                  }
                                  className="font-bold"
                                >
                                  Vigente
                                </Badge>
                              )}
                            </Group>
                            <Group
                              gap="md"
                              className="text-zinc-400"
                              wrap="nowrap"
                            >
                              <Group gap={4} wrap="nowrap">
                                <CalendarIcon className="w-3.5 h-3.5 text-indigo-400/70" />
                                <Text
                                  size="10px"
                                  fw={700}
                                  className="whitespace-nowrap"
                                >
                                  {formatDate(c.fecha_inicio)}
                                  {c.por_tiempo_indefinido
                                    ? " — Indefinido"
                                    : c.fecha_fin
                                      ? ` → ${formatDate(c.fecha_fin)} (${c.duracion_dias ?? 0} días)`
                                      : ""}
                                </Text>
                              </Group>
                              {sueldoMostrar && (
                                <Group gap={4} wrap="nowrap">
                                  <CurrencyDollarIcon className="w-3.5 h-3.5 text-emerald-400/70" />
                                  <Text
                                    size="10px"
                                    fw={800}
                                    className="text-emerald-400 font-mono whitespace-nowrap"
                                  >
                                    S/ {Number(sueldoMostrar).toFixed(2)}
                                    {unidad}
                                  </Text>
                                </Group>
                              )}
                            </Group>
                          </Stack>
                        </Group>

                        <Group gap="md" wrap="nowrap" className="shrink-0">
                          {!esVigente && (
                            <Badge
                              variant="light"
                              color="gray"
                              radius="sm"
                              size="xs"
                              leftSection={
                                <XCircleIcon className="w-3 h-3" />
                              }
                              className="font-bold"
                            >
                              Finalizado
                            </Badge>
                          )}
                          <div className="w-7 h-7 rounded-full bg-zinc-800/40 flex items-center justify-center shrink-0 border border-zinc-700/50 group-hover:bg-zinc-800/80 transition-colors">
                            {expanded ? (
                              <ChevronUpIcon className="w-4 h-4 text-zinc-400" />
                            ) : (
                              <ChevronDownIcon className="w-4 h-4 text-zinc-400" />
                            )}
                          </div>
                        </Group>
                      </Group>
                    </UnstyledButton>

                    <Collapse in={expanded}>
                      <div className="px-6 pt-4 pb-5 border-t border-zinc-800/40">
                        <Stack gap="md">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                            {/* Cargo */}
                            <div className="bg-zinc-950/40 rounded-xl p-4 border border-zinc-800/40">
                              <Group gap="xs" mb="xs">
                                <BriefcaseIcon className="w-3.5 h-3.5 text-indigo-400" />
                                <Text
                                  size="9px"
                                  fw={800}
                                  c="zinc.5"
                                  className="uppercase tracking-widest"
                                >
                                  Cargo
                                </Text>
                              </Group>
                              <Text size="sm" fw={700} className="text-zinc-200">
                                {c.cargo ?? "—"}
                              </Text>
                            </div>

                            {/* Lugar: Almacén o Labor */}
                            <div className="bg-zinc-950/40 rounded-xl p-4 border border-zinc-800/40">
                              <Group gap="xs" mb="xs">
                                <MapPinIcon className="w-3.5 h-3.5 text-indigo-400" />
                                <Text
                                  size="9px"
                                  fw={800}
                                  c="zinc.5"
                                  className="uppercase tracking-widest"
                                >
                                  {c.almacen
                                    ? "Almacén"
                                    : c.labor
                                      ? "Labor"
                                      : "Lugar"}
                                </Text>
                              </Group>
                              <Text size="sm" fw={600} className="text-zinc-200">
                                {c.almacen ?? c.labor ?? "—"}
                              </Text>
                            </div>
                          </div>

                          {/* Cierre anticipado (si aplica) */}
                          {tieneCierreAnticipado && (
                            <div className="bg-amber-500/5 border border-amber-500/30 rounded-xl p-4">
                              <Group gap="xs" mb="xs">
                                <ClockIcon className="w-3.5 h-3.5 text-amber-400" />
                                <Text
                                  size="9px"
                                  fw={800}
                                  c="amber.4"
                                  className="uppercase tracking-widest"
                                >
                                  Cierre
                                </Text>
                              </Group>
                              <Text size="sm" fw={700} className="text-amber-200">
                                {formatDate(c.fecha_fin_anticipada)}
                              </Text>
                            </div>
                          )}

                          {evidencias.length > 0 && (
                            <div>
                              <Group gap="xs" mb="xs" className="pl-1">
                                <PaperClipIcon className="w-3.5 h-3.5 text-zinc-500" />
                                <Text
                                  size="9px"
                                  fw={800}
                                  c="zinc.4"
                                  className="uppercase tracking-widest"
                                >
                                  Evidencias ({evidencias.length})
                                </Text>
                              </Group>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {evidencias.map((ev, idx) => (
                                  <ArchivoCard
                                    key={`${c.id_contrato}-ev-${idx}`}
                                    archivo={ev}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </Stack>
                      </div>
                    </Collapse>
                  </Paper>
                );
              })}
            </Stack>
          )}
        </Stack>
      </ModalEstandar>

      {/* Modal para crear un nuevo contrato del mismo empleado */}
      {modalNuevoContratoAbierto && (
        <ModalContratoEmpleado
          idEmpleado={idEmpleado}
          opened={modalNuevoContratoAbierto}
          close={() => setModalNuevoContratoAbierto(false)}
          onSuccess={handleContratoCreado}
          contratoAnterior={ultimoContrato ?? undefined}
        />
      )}
    </>
  );
}
