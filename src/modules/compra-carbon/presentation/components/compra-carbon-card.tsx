import { useEffect, useState } from "react";
import {
  ActionIcon,
  Badge,
  Button,
  Collapse,
  Divider,
  Group,
  Loader,
  Modal,
  Paper,
  Stack,
  Text,
  Textarea,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import {
  CheckBadgeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CubeIcon,
  DocumentArrowDownIcon,
  PaperClipIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import { CompraCarbonService } from "../../service/compra-carbon.service";
import { useNotify } from "../../../../hooks/useNotify";
import { usePrint } from "../../../../hooks/usePrint";
import { useAprobarCompraCarbon } from "../../hooks/useAprobarCompraCarbon";
import { useAnularCompraCarbon } from "../../hooks/useAnularCompraCarbon";
import { ArchivoCard } from "../../../../presentation/utils/archivo/archivo-card";
import { EvidenciasCompraModal } from "../evidencias-compra-modal";
import type {
  CompraCarbonDetalle,
  CompraCarbonResumen,
} from "../../service/compra-carbon.responses";
import { formatNumber } from "../../../../shared/functions/formatNumber";
import { EstadoCompraCarbon } from "../../../../shared/enums/compra-carbon/estado-compra-carbon";
import type { RES_Empresa } from "../../../../service/responses/empresa";

interface Props {
  compra: CompraCarbonResumen;
  isExpanded: boolean;
  onToggle: () => void;
  empresa?: RES_Empresa;
  nombreCreador: string;
  onAprobada?: (cabecera: CompraCarbonResumen) => void;
  onEvidenciasActualizadas?: (cabecera: CompraCarbonResumen) => void;
  onAnulada?: (cabecera: CompraCarbonResumen) => void;
}

const formatPEN = (n: number) => `S/ ${formatNumber(n)}`;

const formatDateTime = (iso: string | null | undefined): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return dayjs(d).format("DD/MM/YYYY HH:mm");
};

const estadoBadge = (estado: string | null): {
  color: string;
  label: string;
} => {
  const e = (estado ?? "").toString();
  if (e === EstadoCompraCarbon.Pendiente) {
    return { color: "yellow", label: "Pendiente" };
  }
  if (e === EstadoCompraCarbon.Aprobado) {
    return { color: "teal", label: "Aprobado" };
  }
  if (e === EstadoCompraCarbon.Anulado) {
    return { color: "red", label: "Anulado" };
  }
  return { color: "gray", label: e || "—" };
};

export const CompraCarbonCard = ({
  compra,
  isExpanded,
  onToggle,
  empresa,
  onAprobada,
  onEvidenciasActualizadas,
  onAnulada,
}: Props) => {
  const { notifyError } = useNotify();
  const { print, prepare } = usePrint();
  const { aprobar, loading: loadingAprobar } = useAprobarCompraCarbon();
  const { anular, loading: loadingAnular } = useAnularCompraCarbon();
  const [detalle, setDetalle] = useState<CompraCarbonDetalle | null>(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [printing] = useState(false);
  const [openAprobarModal, setOpenAprobarModal] = useState(false);
  const [openEvidenciasModal, setOpenEvidenciasModal] = useState(false);
  const [openAnularModal, setOpenAnularModal] = useState(false);
  const [motivoAnular, setMotivoAnular] = useState("");

  const badge = estadoBadge(compra.estado);
  const evidencias = compra.evidencias_aprobacion ?? [];
  const puedeAprobar = compra.estado === EstadoCompraCarbon.Pendiente;
  const puedeAnular =
    compra.estado === EstadoCompraCarbon.Pendiente ||
    compra.estado === EstadoCompraCarbon.Aprobado;

  const handleAprobar = async () => {
    setOpenAprobarModal(false);
    const result = await aprobar(compra.id_compra_carbon);
    if (!result) return;
    onAprobada?.({
      ...compra,
      estado: EstadoCompraCarbon.Aprobado,
      id_empleado_aprueba: result.cabecera.id_empleado_aprueba,
      empleado_aprueba: result.cabecera.empleado_aprueba ?? null,
      fecha_hora_aprobacion: result.cabecera.fecha_hora_aprobacion,
      evidencias_aprobacion: result.cabecera.evidencias_aprobacion ?? [],
    });
  };

  const handleAnular = async () => {
    setOpenAnularModal(false);
    const result = await anular(compra.id_compra_carbon);
    if (!result) return;
    onAnulada?.({
      ...compra,
      estado: EstadoCompraCarbon.Anulado,
      evidencias_aprobacion: result.cabecera.evidencias_aprobacion ?? [],
    });
  };

  const handlePrint = async () => {
    if (!empresa) {
      notifyError("No se encontro la empresa para generar el PDF");
      return;
    }
    try {
      let data = detalle;
      if (!data) {
        const resp = await CompraCarbonService.getCompraConDetalles(
          compra.id_compra_carbon,
        );
        if (!resp.success) {
          notifyError(resp.message || "No se pudo cargar el detalle");
          return;
        }
        data = resp.data;
      }

      const target = `CompraCarbon_${compra.correlativo}_${Date.now()}`;
      prepare(target);
      // Renderiza el PDF con react-pdf via el hook de print global.
      const CompraCarbonPDFModule = await import("../compra-carbon-pdf");
      const CompraCarbonPDF = CompraCarbonPDFModule.CompraCarbonPDF;
      print(
        <CompraCarbonPDF
          compra={{
            cabecera: data.cabecera,
            detalles: data.detalles,
          }}
          empresa={empresa}
          nombreCreador={compra.empleado_registro}
          urlLogoEmpresa={empresa.url_logo ?? null}
        />,
        {
          documentTitle: `Compra de Carbon - ${compra.correlativo}`,
          target,
        },
      );
    } catch (e) {
      console.error(e);
      notifyError("Error al generar el PDF");
    }
  };

  // Carga lazy del detalle la primera vez que se expande.
  useEffect(() => {
    if (!isExpanded || detalle) return;
    let cancel = false;
    (async () => {
      setLoadingDetalle(true);
      try {
        const resp = await CompraCarbonService.getCompraConDetalles(
          compra.id_compra_carbon,
        );
        if (cancel) return;
        if (resp.success) setDetalle(resp.data);
        else notifyError(resp.message || "No se pudo cargar el detalle");
      } catch (e) {
        console.error(e);
        notifyError("Error al cargar el detalle de la compra");
      } finally {
        setLoadingDetalle(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [isExpanded, detalle, compra.id_compra_carbon, notifyError]);

  const subtotalBase = detalle
    ? detalle.detalles.reduce((acc, d) => acc + Number(d.subtotal), 0)
    : null;
  const igvPct = detalle ? Number(detalle.cabecera.porcentaje_igv) : 0;
  const igvMonto = subtotalBase !== null ? subtotalBase * (igvPct / 100) : null;

  return (
    <Paper
      radius="xl"
      className="bg-zinc-950/50 border border-zinc-800/60 transition-all hover:border-zinc-700/60 overflow-hidden"
    >
      <UnstyledButton component="div" className="w-full" onClick={onToggle}>
        <div className="px-4 py-3">
          <Group justify="space-between" wrap="nowrap">
            <Group gap="sm" wrap="nowrap" className="flex-1 min-w-0">
              <div className="font-mono bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl shrink-0">
                <Text size="xs" fw={900} className="text-indigo-300">
                  {compra.correlativo}
                </Text>
              </div>

              <Stack gap={1} className="min-w-0">
                <Group gap="xs" wrap="nowrap">
                  <Text
                    size="sm"
                    fw={800}
                    className="text-white leading-tight truncate"
                  >
                    {compra.empresa}
                  </Text>
                  <Badge
                    color={badge.color}
                    variant="light"
                    size="xs"
                    radius="sm"
                    className="shrink-0"
                  >
                    {badge.label}
                  </Badge>
                </Group>
                <Text size="xs" c="dimmed" className="truncate">
                  Proveedor:{" "}
                  <span className="text-zinc-300">{compra.proveedor}</span>
                  {compra.proveedor_tipo_entidad === "Natural" && compra.proveedor_dni
                    ? ` · DNI: ${compra.proveedor_dni}`
                    : compra.proveedor_ruc
                      ? ` · RUC: ${compra.proveedor_ruc}`
                      : ""}
                </Text>
                <Stack gap={1} mt={1}>
                  <Group gap={4} wrap="nowrap">
                    <Text size="10px" c="dimmed" fw={700} className="uppercase tracking-wider">
                      Generado por:
                    </Text>
                    <Text size="10px" className="text-zinc-300 truncate">
                      {compra.empleado_registro}
                    </Text>
                    <Text size="10px" c="dimmed" className="font-mono">
                      · {formatDateTime(compra.created_at)}
                    </Text>
                  </Group>
                  {compra.empleado_aprueba && (
                    <Group gap={4} wrap="nowrap">
                      <Text
                        size="10px"
                        c="teal.4"
                        fw={700}
                        className="uppercase tracking-wider"
                      >
                        Aprobado por:
                      </Text>
                      <Text size="10px" className="text-teal.3 truncate">
                        {compra.empleado_aprueba}
                      </Text>
                      <Text size="10px" c="dimmed" className="font-mono">
                        · {formatDateTime(compra.fecha_hora_aprobacion)}
                      </Text>
                    </Group>
                  )}
                </Stack>
              </Stack>
            </Group>

            <Group gap="xs" wrap="nowrap">
              <Stack gap={0} align="flex-end" className="hidden sm:flex">
                <Text
                  size="xs"
                  c="dimmed"
                  fw={700}
                  className="uppercase tracking-wider"
                >
                  Total
                </Text>
                <Text size="sm" fw={900} className="text-emerald-400 font-mono">
                  {formatPEN(Number(compra.total))}
                </Text>
              </Stack>

              {/* Boton Aprobar (estilo cotizacion) */}
              {puedeAprobar && (
                <Button
                  size="xs"
                  radius="xl"
                  color="green"
                  variant="filled"
                  leftSection={
                    <CheckBadgeIcon className="w-3.5 h-3.5" />
                  }
                  loading={loadingAprobar}
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenAprobarModal(true);
                  }}
                >
                  Aprobar
                </Button>
              )}

              {compra.estado === EstadoCompraCarbon.Aprobado && (
                <Tooltip
                  label={`Evidencias (${evidencias.length})`}
                  withArrow
                  position="top"
                >
                  <ActionIcon
                    variant="light"
                    color="violet"
                    radius="xl"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenEvidenciasModal(true);
                    }}
                  >
                    <PaperClipIcon className="w-3.5 h-3.5" />
                  </ActionIcon>
                </Tooltip>
              )}

              {puedeAnular && (
                <Tooltip label="Anular compra" withArrow position="top">
                  <ActionIcon
                    variant="light"
                    color="red"
                    radius="xl"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenAnularModal(true);
                    }}
                  >
                    <XCircleIcon className="w-3.5 h-3.5" />
                  </ActionIcon>
                </Tooltip>
              )}

              <Tooltip
                label="Descargar PDF"
                withArrow
                position="top"
              >
                <ActionIcon
                  variant="light"
                  color="indigo"
                  radius="xl"
                  size="sm"
                  loading={printing}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrint();
                  }}
                  disabled={!empresa}
                >
                  <DocumentArrowDownIcon className="w-3.5 h-3.5" />
                </ActionIcon>
              </Tooltip>

              <div className="w-6 h-6 rounded-full bg-zinc-800/40 flex items-center justify-center shrink-0">
                {isExpanded ? (
                  <ChevronUpIcon className="w-3.5 h-3.5 text-zinc-500" />
                ) : (
                  <ChevronDownIcon className="w-3.5 h-3.5 text-zinc-500" />
                )}
              </div>
            </Group>
          </Group>
        </div>
      </UnstyledButton>

      <Collapse in={isExpanded}>
        <div className="px-4 pb-4 pt-0">
          <Divider color="zinc.8" mb="sm" />

          {loadingDetalle && (
            <Group justify="center" my="md">
              <Loader size="sm" color="indigo" />
              <Text size="xs" c="dimmed">
                Cargando detalle...
              </Text>
            </Group>
          )}

          {!loadingDetalle && detalle && (
            <>
              {/* Resumen financiero */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 mb-3 px-1">
                <Group gap="xs">
                  <Text size="xs" c="dimmed">
                    Subtotal (sin IGV):{" "}
                    <span className="text-zinc-300 font-bold">
                      {formatPEN(subtotalBase ?? 0)}
                    </span>
                  </Text>
                </Group>
                <Group gap="xs">
                  <Text size="xs" c="dimmed">
                    IGV ({igvPct.toFixed(2)}%):{" "}
                    <span className="text-zinc-300 font-bold">
                      {formatPEN(igvMonto ?? 0)}
                    </span>
                  </Text>
                </Group>
                <Group gap="xs">
                  <Text size="xs" c="dimmed">
                    Total (con IGV):{" "}
                    <span className="text-emerald-400 font-bold">
                      {formatPEN(Number(detalle.cabecera.total))}
                    </span>
                  </Text>
                </Group>
              </div>

              {/* Items */}
              <Group gap="xs" mb="xs" px="xs">
                <CubeIcon className="w-3.5 h-3.5 text-indigo-400/70" />
                <Text
                  size="xs"
                  fw={800}
                  c="zinc.4"
                  className="uppercase tracking-widest"
                >
                  Items ({detalle.detalles.length})
                </Text>
              </Group>

              <div className="grid grid-cols-1 gap-2">
                {detalle.detalles.map((d) => (
                  <div
                    key={d.id_detalle_compra_carbon}
                    className="bg-zinc-900/70 rounded-xl border border-zinc-800/40 px-4 py-3 hover:border-indigo-500/20 transition-colors"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <Stack gap={3} className="flex-1">
                        <Group gap="xs" align="center">
                          <Text size="sm" fw={800} className="text-zinc-100">
                            {d.tipo_carbon_nombre}
                          </Text>
                          {d.tipo_carbon_codigo && (
                            <Badge
                              size="md"
                              color="cyan"
                              variant="filled"
                              radius="md"
                              className="font-mono font-bold text-xs px-2"
                            >
                              {d.tipo_carbon_codigo}
                            </Badge>
                          )}
                        </Group>
                        <Text size="11px" fw={700} className="text-white">
                          {formatNumber(Number(d.cantidad))} TONELADAS
                        </Text>
                      </Stack>

                      <Group gap="xs" wrap="nowrap" className="shrink-0">
                        <Badge variant="light" color="pink" size="sm" radius="md">
                          S/. {formatNumber(Number(d.precio_unitario))} / TON
                        </Badge>
                        <Badge variant="filled" color="pink" size="sm" radius="md">
                          Sub: S/. {formatNumber(Number(d.subtotal))}
                        </Badge>
                      </Group>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Evidencias de aprobacion (preview) */}
          {evidencias.length > 0 && (
            <>
              <div className="h-px bg-zinc-800 my-2" />
              <Group gap="xs" mb="xs" px="xs">
                <PaperClipIcon className="w-3.5 h-3.5 text-violet-400/70" />
                <Text
                  size="xs"
                  fw={800}
                  c="zinc.4"
                  className="uppercase tracking-widest"
                >
                  Evidencias ({evidencias.length})
                </Text>
                <Button
                  variant="subtle"
                  color="violet"
                  size="xs"
                  radius="xl"
                  ml="auto"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenEvidenciasModal(true);
                  }}
                >
                  Gestionar
                </Button>
              </Group>
              <Stack gap="xs">
                {evidencias.slice(0, 3).map((a) => (
                  <ArchivoCard key={a.path_relativo} archivo={a} />
                ))}
                {evidencias.length > 3 && (
                  <Text size="xs" c="dimmed" className="italic px-1">
                    + {evidencias.length - 3} archivo(s) mas...
                  </Text>
                )}
              </Stack>
            </>
          )}
        </div>
      </Collapse>

      {/* Modal de confirmacion de aprobacion */}
      <Modal
        opened={openAprobarModal}
        onClose={() => setOpenAprobarModal(false)}
        centered
        radius="xl"
        withCloseButton={false}
        size="sm"
        overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
        classNames={{
          content: "bg-zinc-950 border border-white/10 shadow-2xl shadow-black",
        }}
      >
        <Stack gap="md" align="center" className="p-6 text-center">
          <Badge color="teal" variant="light" size="lg" radius="xl">
            <CheckBadgeIcon className="w-5 h-5" />
          </Badge>
          <Text fw={800} size="lg" c="white">
            Aprobar compra {compra.correlativo}
          </Text>
          <Text size="sm" c="zinc.4">
            Al aprobar, la compra cambiara de estado a{" "}
            <Text component="span" fw={700} c="teal.4">
              Aprobado
            </Text>
            , se registrara tu nombre como aprobador y la fecha/hora actual.
            Las evidencias podran subirse despues.
          </Text>
          <Group justify="center" gap="sm" mt="sm" w="100%">
            <Button
              variant="subtle"
              color="gray"
              radius="xl"
              onClick={() => setOpenAprobarModal(false)}
              disabled={loadingAprobar}
              fullWidth
            >
              Cancelar
            </Button>
            <Button
              variant="filled"
              color="teal"
              radius="xl"
              loading={loadingAprobar}
              onClick={handleAprobar}
              fullWidth
              leftSection={<CheckBadgeIcon className="w-4 h-4" />}
            >
              Si, aprobar
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Modal de gestion de evidencias */}
      <EvidenciasCompraModal
        opened={openEvidenciasModal}
        close={() => setOpenEvidenciasModal(false)}
        compra={compra}
        onSaved={(cabeceraActualizada) =>
          onEvidenciasActualizadas?.(cabeceraActualizada)
        }
      />

      {/* Modal de confirmacion de anulacion */}
      <Modal
        opened={openAnularModal}
        onClose={() => setOpenAnularModal(false)}
        centered
        radius="xl"
        withCloseButton={false}
        size="md"
        overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
        classNames={{
          content: "bg-zinc-950 border border-white/10 shadow-2xl shadow-black",
        }}
      >
        <Stack gap="md" align="center" className="p-6">
          <Badge color="red" variant="light" size="lg" radius="xl">
            <XCircleIcon className="w-5 h-5" />
          </Badge>
          <Text fw={800} size="lg" c="white" ta="center">
            Anular compra {compra.correlativo}
          </Text>
          <Text size="sm" c="zinc.4" ta="center">
            Esta accion cambiara el estado a{" "}
            <Text component="span" fw={700} c="red.4">
              Anulado
            </Text>
            . No se podra revertir ni aprobar despues.
          </Text>

          <div className="w-full">
            <Textarea
              label="Motivo (opcional)"
              placeholder="Describe brevemente por que se anula..."
              radius="xl"
              autosize
              minRows={2}
              maxRows={5}
              value={motivoAnular}
              onChange={(e) => setMotivoAnular(e.currentTarget.value)}
              classNames={{
                input:
                  "bg-zinc-900/50 border-zinc-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 text-white placeholder:text-zinc-500 transition-all",
                label: "text-zinc-300 mb-1 font-medium text-xs",
              }}
            />
          </div>

          <Group justify="center" gap="sm" mt="xs" w="100%">
            <Button
              variant="subtle"
              color="gray"
              radius="xl"
              onClick={() => setOpenAnularModal(false)}
              disabled={loadingAnular}
              fullWidth
            >
              Cancelar
            </Button>
            <Button
              variant="filled"
              color="red"
              radius="xl"
              loading={loadingAnular}
              onClick={handleAnular}
              fullWidth
              leftSection={<XCircleIcon className="w-4 h-4" />}
            >
              Si, anular
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Paper>
  );
};