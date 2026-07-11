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
  Tooltip,
} from "@mantine/core";
import {
  CheckBadgeIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  UserCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PaperClipIcon,
  PlusIcon,
  ClockIcon,
  DocumentIcon,
  BuildingOfficeIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import { useHistorialContratosEmpleado } from "../hooks/useHistorialContratosEmpleado";
import { ModalEstandar } from "../../../presentation/utils/modal-estandar";
import { ArchivoCard } from "../../../presentation/utils/archivo/archivo-card";
import type { IArchivo } from "../../../shared/interfaces/archivo";
import type { RES_ContratoEmpleado } from "../../../service/responses/contrato-empleado";
import { ModalContratoEmpleado } from "./modal-contrato-empleado";
import { EstadoContrato } from "../../../shared/enums/contrato/estado-contrato";
import { ContratosEmpleadoService } from "../service/contratos-empleado.service";
import { useNotify } from "../../../hooks/useNotify";

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
  const { notifySuccess, notifyError } = useNotify();
  const { contratos, loading, reload, getUltimoContrato } =
    useHistorialContratosEmpleado(opened ? idEmpleado : null);

  const [expandedIds, setExpandedIds] = useState<Record<number, boolean>>({});
  const [modalNuevoContratoAbierto, setModalNuevoContratoAbierto] =
    useState(false);
  const [finalizandoId, setFinalizandoId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const isExpanded = (id: number, index: number) => {
    if (expandedIds[id] !== undefined) return expandedIds[id];
    // Por defecto, abrir el primero (el más reciente)
    return index === 0;
  };

  // Detecta si hay un contrato Vigente por tiempo indefinido.
  // En ese caso, NO se permite crear uno nuevo: primero hay que finalizarlo.
  const vigenteIndefinido = contratos.find(
    (c) => c.estado === EstadoContrato.Vigente && c.por_tiempo_indefinido,
  );

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
    if (vigenteIndefinido) return; // Doble seguridad: no abrir si hay vigente indefinido.
    setModalNuevoContratoAbierto(true);
  };

  // Cierra anticipadamente el contrato (Vigente → Término Anticipado) usando
  // la fecha de hoy como fecha_fin_anticipada. Una vez cerrado, el botón
  // "Nuevo Contrato" se habilita automáticamente.
  const handleFinalizar = async (idContrato: number) => {
    setFinalizandoId(idContrato);
    try {
      const resp = await ContratosEmpleadoService.finalizar_anticipado(
        idContrato,
        dayjs().format("YYYY-MM-DD"),
      );
      if (resp.success) {
        notifySuccess("Contrato finalizado anticipadamente");
        void reload();
        if (resp.data?.empleado) {
          onContratoCreado?.({ empleado: resp.data.empleado });
        }
      } else {
        notifyError(resp.message ?? "No se pudo finalizar el contrato");
      }
    } catch (err) {
      console.error(err);
      notifyError("Error al finalizar el contrato");
    } finally {
      setFinalizandoId(null);
    }
  };

  // Calcula la fecha sugerida para el nuevo contrato en base al último.
  //  - Si el último es Término Anticipado: usa fecha_fin_anticipada + 1 día.
  //  - Si el último es Vigente/Finalizado y tiene fecha_fin: usa fecha_fin + 1 día.
  //  - Si es indefinido o sin fecha_fin: retorna "" (sin restricción).
  const calcularFechaInicioSugerida = (
    c: RES_ContratoEmpleado | undefined,
  ): string => {
    if (!c) return "";

    let base: string | null = null;
    if (c.estado === EstadoContrato.TerminoAnticipado && c.fecha_fin_anticipada) {
      base = c.fecha_fin_anticipada;
    } else if (c.estado !== EstadoContrato.TerminoAnticipado && c.fecha_fin) {
      base = c.fecha_fin;
    }
    if (!base) return "";

    // +1 día en zona local para evitar desfase por timezone con toISOString.
    const [y, m, d] = base.split("-").map(Number);
    const fecha = new Date(y, m - 1, d + 1);
    return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`;
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

            {vigenteIndefinido ? (
              <Tooltip
                label="Debes finalizar el contrato indefinido actual antes de crear uno nuevo."
                withArrow
                position="top"
              >
                <Button
                  size="xs"
                  radius="lg"
                  color="teal"
                  variant="light"
                  leftSection={<PlusIcon className="w-4 h-4" />}
                  onClick={handleAbrirNuevoContrato}
                  disabled
                  className="font-bold border border-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Nuevo Contrato
                </Button>
              </Tooltip>
            ) : (
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
            )}
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
            </Stack>
          ) : (
            <Stack gap="md" className="pb-4">
              {contratos.map((c, index) => {
                const expanded = isExpanded(c.id_contrato, index);
                const evidencias = parseEvidencias(c.evidencias);
                const sueldoMostrar =
                  c.tipo_contrato === "Planilla"
                    ? c.sueldo_base
                    : c.salario_diario;
                const unidad =
                  c.tipo_contrato === "Planilla" ? "" : " / día";
                const tieneCierreAnticipado = !!c.fecha_fin_anticipada;
                const estadoBadge = contratoEstadoBadge(c.estado);

                return (
                  <Paper
                    key={c.id_contrato}
                    radius="xl"
                    className={`border shadow-[0_4px_30px_rgba(0,0,0,0.1)] transition-all group relative overflow-hidden p-4 shrink-0 ${
                      estadoBadge.paperClass
                    }`}
                  >
                    {/* Highlight superior */}
                    <div
                      className={`absolute top-0 left-0 w-full h-1 bg-linear-to-r ${estadoBadge.barClass} group-hover:opacity-100 transition-opacity`}
                    />

                      <UnstyledButton
                        className="w-full"
                        onClick={() => toggleExpand(c.id_contrato)}
                      >
                        <Group justify="space-between" wrap="nowrap">
                          <Group gap="md" wrap="nowrap" className="min-w-0 flex-1">
                            <div
                              className={`p-3 rounded-2xl border shrink-0 ${estadoBadge.iconWrapperClass}`}
                            >
                              <DocumentIcon
                                className={`w-6 h-6 ${estadoBadge.iconClass}`}
                              />
                            </div>
                            <Stack gap={1} className="min-w-0 flex-1">
                              <Group gap="xs" wrap="nowrap" className="min-w-0">
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
                                <Badge
                                  variant="light"
                                  color={estadoBadge.color}
                                  radius="sm"
                                  size="xs"
                                  leftSection={<CheckBadgeIcon className="w-3 h-3" />}
                                  className="font-bold"
                                >
                                  {estadoBadge.label}
                                </Badge>
                              </Group>

                              <Group gap="md" className="text-zinc-400 flex-wrap">
                                <Group gap={4} wrap="nowrap">
                                  <CalendarIcon className="w-4 h-4 text-indigo-400/70" />
                                  <Text
                                    size="xs"
                                    fw={600}
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
                                    <CurrencyDollarIcon className="w-4 h-4 text-emerald-400/70" />
                                    <Text
                                      size="xs"
                                      fw={800}
                                      className="text-emerald-400 font-mono whitespace-nowrap"
                                    >
                                      S/ {Number(sueldoMostrar).toFixed(2)}
                                      {unidad}
                                    </Text>
                                  </Group>
                                )}
                                {c.empresa && (
                                  <Group gap={4} wrap="nowrap">
                                    <BuildingOfficeIcon className="w-4 h-4 text-indigo-400/70" />
                                    <Text
                                      size="xs"
                                      fw={700}
                                      className="text-zinc-300 whitespace-nowrap"
                                    >
                                      {c.empresa}
                                    </Text>
                                  </Group>
                                )}
                              </Group>
                            </Stack>
                          </Group>

                          {c.estado === EstadoContrato.Vigente && (
                            <Tooltip
                              label="Cerrar anticipadamente"
                              withArrow
                              position="top"
                            >
                              <Button
                                size="xs"
                                radius="md"
                                color="orange"
                                variant="light"
                                leftSection={<XCircleIcon className="w-3.5 h-3.5" />}
                                loading={finalizandoId === c.id_contrato}
                                onClick={(ev) => {
                                  ev.stopPropagation();
                                  void handleFinalizar(c.id_contrato);
                                }}
                                className="font-bold border border-orange-500/20"
                              >
                                Finalizar
                              </Button>
                            </Tooltip>
                          )}

                          <div className="w-8 h-8 rounded-full bg-zinc-800/40 flex items-center justify-center shrink-0 border border-zinc-700/50 group-hover:bg-zinc-800/80 transition-colors">
                            {expanded ? (
                              <ChevronUpIcon className="w-4 h-4 text-zinc-400" />
                            ) : (
                              <ChevronDownIcon className="w-4 h-4 text-zinc-400" />
                            )}
                          </div>
                        </Group>
                      </UnstyledButton>

                      <Collapse in={expanded}>
                        <div className="mt-4 pt-4 border-t border-zinc-800/30">
                          <Stack gap="md">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {/* Almacén */}
                              {c.almacen && (
                                <div className="bg-zinc-950/40 rounded-xl p-4 border border-zinc-800/40">
                                  <Group gap="xs" mb="xs">
                                    <MapPinIcon className="w-3.5 h-3.5 text-indigo-400" />
                                    <Text
                                      size="9px"
                                      fw={800}
                                      c="zinc.5"
                                      className="uppercase tracking-widest"
                                    >
                                      Almacén
                                    </Text>
                                  </Group>
                                  <Text size="sm" fw={600} className="text-zinc-200">
                                    {c.almacen}
                                  </Text>
                                </div>
                              )}

                              {/* Labor */}
                              {c.labor && (
                                <div className="bg-zinc-950/40 rounded-xl p-4 border border-zinc-800/40">
                                  <Group gap="xs" mb="xs">
                                    <MapPinIcon className="w-3.5 h-3.5 text-indigo-400" />
                                    <Text
                                      size="9px"
                                      fw={800}
                                      c="zinc.5"
                                      className="uppercase tracking-widest"
                                    >
                                      Labor
                                    </Text>
                                  </Group>
                                  <Text size="sm" fw={600} className="text-zinc-200">
                                    {c.labor} {c.mina_nombre ? `(${c.mina_nombre})` : ""}
                                  </Text>
                                </div>
                              )}

                              {/* Fallback si no hay almacén ni labor */}
                              {!c.almacen && !c.labor && (
                                <div className="bg-zinc-950/40 rounded-xl p-4 border border-zinc-800/40 col-span-full">
                                  <Group gap="xs" mb="xs">
                                    <MapPinIcon className="w-3.5 h-3.5 text-indigo-400" />
                                    <Text
                                      size="9px"
                                      fw={800}
                                      c="zinc.5"
                                      className="uppercase tracking-widest"
                                    >
                                      Lugar
                                    </Text>
                                  </Group>
                                  <Text size="sm" fw={600} className="text-zinc-200">
                                    —
                                  </Text>
                                </div>
                              )}
                            </div>

                            {/* Cierre anticipado como badge */}
                            {tieneCierreAnticipado && (
                              <Group gap="xs">
                                <ClockIcon className="w-3.5 h-3.5 text-amber-400" />
                                <Text
                                  size="9px"
                                  fw={800}
                                  c="amber.4"
                                  className="uppercase tracking-widest"
                                >
                                  Cierre
                                </Text>
                                <Badge
                                  variant="light"
                                  color="amber"
                                  size="md"
                                  radius="md"
                                  className="font-mono font-bold"
                                >
                                  {formatDate(c.fecha_fin_anticipada)}
                                </Badge>
                              </Group>
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
          fechaInicioSugerida={calcularFechaInicioSugerida(ultimoContrato ?? undefined)}
          nombreEmpleado={nombreEmpleado}
        />
      )}
    </>
  );
};

/**
 * Helper que mapea el estado del contrato a un set de clases y label
 * consistente para los badges y paper backgrounds.
 */
const contratoEstadoBadge = (estado: string): {
  label: string;
  color: string;
  paperClass: string;
  barClass: string;
  iconWrapperClass: string;
  iconClass: string;
} => {
  switch (estado) {
    case EstadoContrato.Vigente:
      return {
        label: "Vigente",
        color: "green",
        paperClass: "bg-teal-500/5 border-teal-500/30 hover:border-teal-500/50",
        barClass: "from-teal-500/40 via-teal-500/60 to-teal-500/10",
        iconWrapperClass: "bg-teal-500/10 border-teal-500/20",
        iconClass: "text-teal-400",
      };
    case EstadoContrato.Pendiente:
      return {
        label: "Pendiente",
        color: "blue",
        paperClass: "bg-blue-500/5 border-blue-500/30 hover:border-blue-500/50",
        barClass: "from-blue-500/40 via-blue-500/60 to-blue-500/10",
        iconWrapperClass: "bg-blue-500/10 border-blue-500/20",
        iconClass: "text-blue-400",
      };
    case EstadoContrato.TerminoAnticipado:
      return {
        label: "Término Anticipado",
        color: "orange",
        paperClass: "bg-orange-500/5 border-orange-500/30 hover:border-orange-500/50",
        barClass: "from-orange-500/40 via-orange-500/60 to-orange-500/10",
        iconWrapperClass: "bg-orange-500/10 border-orange-500/20",
        iconClass: "text-orange-400",
      };
    case EstadoContrato.Finalizado:
    default:
      return {
        label: "Finalizado",
        color: "gray",
        paperClass: "bg-zinc-900/30 border-zinc-800/80 hover:bg-zinc-900/50 hover:border-indigo-500/20",
        barClass: "from-zinc-500/20 via-indigo-500/30 to-indigo-500/5",
        iconWrapperClass: "bg-indigo-500/10 border-indigo-500/20",
        iconClass: "text-indigo-400",
      };
  }
};
