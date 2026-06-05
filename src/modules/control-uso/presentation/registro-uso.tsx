import {
  Button,
  Group,
  NumberInput,
  Stack,
  Textarea,
  Text,
  Badge,
  Card,
  SimpleGrid,
  Select,
  SegmentedControl,
  Center,
  Box,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import { useState, useEffect, useMemo } from "react";
import { useNotify } from "../../../hooks/useNotify";
import { ControlUsoService } from "../service/control-uso.service";
import { AuxService } from "../../../service/auxiliar.service";
import { MinasService } from "../../../modules/minas-labores/service/minas.service";
import { ClientesService } from "../../../modules/clientes/service/clientes.service";
import type { RES_ControlUsoLog, RES_Tarifa } from "../service/control-uso.responses";
import type { RES_ActivoFijoDisponible } from "../../../service/responses/activo-fijo";
import { Cog8ToothIcon, TruckIcon, ArrowPathRoundedSquareIcon, MapPinIcon, BriefcaseIcon, PlusIcon, QueueListIcon } from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import { ModalEstandar } from "../../../presentation/utils/modal-estandar";
import { DataTableEstandar } from "../../../presentation/utils/datatable-estandar";
import { NuevaTarifaModal } from "./nueva-tarifa-modal";

interface Props {
  asset: RES_ActivoFijoDisponible;
  tipoControl: "horometro" | "odometro" | "vueltas";
  onSuccess: (nuevoLog: RES_ControlUsoLog) => void;
  onCancel: () => void;
}

export const RegistroUso = ({
  asset,
  tipoControl,
  onSuccess,
  onCancel,
}: Props) => {
  const { notifyError } = useNotify();
  const idActivoFijo = asset.id_activo;

  // Data states
  const [loadingData, setLoadingData] = useState(false);
  const [saving, setSaving] = useState(false);

  const [tarifas, setTarifas] = useState<RES_Tarifa[]>([]);
  const [minas, setMinas] = useState<{ value: string; label: string }[]>([]);
  const [labores, setLabores] = useState<{ value: string; label: string }[]>([]);
  const [clientes, setClientes] = useState<{ value: string; label: string }[]>([]);

  // Form states
  const [esParaMina, setEsParaMina] = useState<boolean>(true);
  const [idMina, setIdMina] = useState<string | null>(null);
  const [idLabor, setIdLabor] = useState<string | null>(null);
  const [idCliente, setIdCliente] = useState<string | null>(null);
  const [tipoCarga, setTipoCarga] = useState<string | null>(null);
  const [idTarifa, setIdTarifa] = useState<string | null>(null);

  const [modalTarifaOpened, setModalTarifaOpened] = useState(false);
  const [modalHistorialOpened, setModalHistorialOpened] = useState(false);

  const [lecturaInicio, setLecturaInicio] = useState<number | "">(0);
  const [lecturaFin, setLecturaFin] = useState<number | "">(0);
  const [cantidadVueltas, setCantidadVueltas] = useState<number | "">(0);
  const [observacion, setObservacion] = useState("");

  const selectedTarifa = useMemo(() => {
    return tarifas.find((t) => t.id.toString() === idTarifa) || null;
  }, [idTarifa, tarifas]);

  const precioUnitario = selectedTarifa ? Number(selectedTarifa.precio_unitario) : 0;

  // Load initial data
  useEffect(() => {
    if (!idActivoFijo) return;

    const fetchData = async () => {
      setLoadingData(true);
      try {
        // Fetch Tarifas
        const respTarifas = await ControlUsoService.getTarifas(idActivoFijo);
        if (respTarifas.success) {
          setTarifas(respTarifas.data);
          
          // Auto-select latest tarifa for the current control type
          const tarifasDeTipo = respTarifas.data.filter((t) => t.tipo_control === tipoControl);
          if (tarifasDeTipo.length > 0) {
            const lastTarifa = tarifasDeTipo.reduce((prev, current) => (prev.id > current.id ? prev : current));
            setIdTarifa(lastTarifa.id.toString());
          } else {
            setIdTarifa(null);
          }
        }

        // Fetch Minas
        const respMinas = await AuxService.get_minas();
        if (respMinas.success) {
          setMinas(respMinas.data.map((m: { id_mina: string | number; nombre: string }) => ({
            value: m.id_mina.toString(),
            label: m.nombre,
          })));
        }

        // Fetch Clientes
        const respClientes = await ClientesService.getClientes();
        // Assuming success format or just array
        if (Array.isArray(respClientes)) {
          setClientes(respClientes.map((c: { id_cliente: string | number; razon_social: string }) => ({
            value: c.id_cliente.toString(),
            label: c.razon_social,
          })));
        }

        // Lectura (Odometro o Horometro)
        if (tipoControl === "horometro") {
          const resp = await ControlUsoService.getUltimoHorometro(idActivoFijo);
          if (resp.success) {
            setLecturaInicio(resp.data.ultimo_horometro);
            setLecturaFin(0);
          }
        } else if (tipoControl === "odometro") {
          const resp = await ControlUsoService.getUltimoOdometro(idActivoFijo);
          if (resp.success) {
            setLecturaInicio(resp.data.ultimo_odometro);
            setLecturaFin(0);
          }
        }
      } catch (err) {
        console.error(err);
        notifyError("Error cargando datos iniciales");
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [idActivoFijo, tipoControl, notifyError]);

  // When Mina changes, fetch Labores
  useEffect(() => {
    if (idMina) {
      const fetchLab = async () => {
        try {
          const resp = await MinasService.getLabores(Number(idMina));
          if (resp.success) {
            setLabores(resp.data.map((l: { id_labor: string | number; nombre: string | null }) => ({
              value: l.id_labor.toString(),
              label: l.nombre || "Sin nombre",
            })));
          }
        } catch (e) {
          console.error(e);
        }
      };
      fetchLab();
    } else {
      setLabores([]);
      setIdLabor(null);
    }
  }, [idMina]);

  // Dynamic naming based on control type
  const labelLectura = tipoControl === "horometro" ? "Horómetro" : tipoControl === "odometro" ? "Odómetro" : "Vueltas";
  const labelDiferencia = tipoControl === "vueltas" ? "Vueltas" : tipoControl === "horometro" ? "Horas" : "Km";
  const unitMeasure = tipoControl === "vueltas" ? "vuelta(s)" : tipoControl === "horometro" ? "hrs" : "Km";

  // Calculations in real time
  const totalUso = useMemo(() => {
    if (tipoControl === "vueltas") {
      return Number(cantidadVueltas) || 0;
    }
    return Math.max(0, (Number(lecturaFin) || 0) - (Number(lecturaInicio) || 0));
  }, [tipoControl, cantidadVueltas, lecturaInicio, lecturaFin]);

  const costoTotal = useMemo(() => {
    return totalUso * precioUnitario;
  }, [totalUso, precioUnitario]);

  // Handle submit form
  const handleSubmit = async () => {
    if (!idActivoFijo) {
      notifyError("Por favor seleccione un activo fijo.");
      return;
    }

    if (tipoControl !== "vueltas" && (Number(lecturaFin) || 0) < (Number(lecturaInicio) || 0)) {
      notifyError(
        `La lectura final del ${labelLectura} no puede ser menor a la lectura inicial.`
      );
      return;
    }

    setSaving(true);
    try {
      const ahora = new Date();
      const resp = await ControlUsoService.registrarUso({
        id_activo_fijo: idActivoFijo,
        fecha_hora_inicio_control: dayjs(ahora).format("YYYY-MM-DD HH:mm:ss"),
        fecha_hora_fin_control: null,
        
        horometro_inicio: tipoControl === "horometro" ? (Number(lecturaInicio) || 0) : undefined,
        horometro_fin: tipoControl === "horometro" ? (Number(lecturaFin) || 0) : undefined,
        odometro_inicio: tipoControl === "odometro" ? (Number(lecturaInicio) || 0) : undefined,
        odometro_fin: tipoControl === "odometro" ? (Number(lecturaFin) || 0) : undefined,
        cantidad_vueltas: tipoControl === "vueltas" ? (Number(cantidadVueltas) || 0) : undefined,

        precio_unitario: precioUnitario,
        id_tarifa: idTarifa ? Number(idTarifa) : undefined,
        
        // Destino solo aplica para horómetro
        es_para_mina: tipoControl === "horometro" ? esParaMina : undefined,
        id_mina: tipoControl === "horometro" && esParaMina && idMina ? Number(idMina) : undefined,
        id_labor: tipoControl === "horometro" && esParaMina && idLabor ? Number(idLabor) : undefined,
        id_cliente: tipoControl === "horometro" && !esParaMina && idCliente ? Number(idCliente) : undefined,
        tipo_carga: tipoControl === "horometro" ? (tipoCarga || undefined) : undefined,
        
        observacion: observacion ? observacion.trim() : null,
      });

      if (resp.success) {
        const enhancedLog = { ...resp.data };
        if (idMina) enhancedLog.mina = minas.find((m) => m.value === String(idMina))?.label || null;
        if (idLabor) enhancedLog.labor = labores.find((l) => l.value === String(idLabor))?.label || null;
        if (idCliente) enhancedLog.cliente = clientes.find((c) => c.value === String(idCliente))?.label || null;
        onSuccess(enhancedLog);
      } else {
        notifyError(resp.message || "Error al registrar el control de uso");
      }
    } catch (err) {
      notifyError("Error de conexión al guardar el registro.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack gap="md" className="p-1">
      <div className="relative overflow-hidden bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-4 flex gap-3.5 transition-all">
        <div className="absolute -right-8 -top-8 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
        <div className="flex items-center justify-center shrink-0 w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
          {tipoControl === "horometro" ? (
            <Cog8ToothIcon className="w-5 h-5 text-indigo-400" />
          ) : tipoControl === "odometro" ? (
            <TruckIcon className="w-5 h-5 text-indigo-400" />
          ) : (
            <ArrowPathRoundedSquareIcon className="w-5 h-5 text-indigo-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-500">Activo Fijo</span>
            <Badge size="xs" color="pink" variant="light" className="font-bold shrink-0 border border-pink-500/10">{asset.correlativo}</Badge>
          </div>
          <Text size="sm" fw={800} className="text-white leading-snug truncate">{asset.producto}</Text>
          {(asset.almacen || asset.mina) && (
            <Text size="10px" className="text-zinc-500 mt-1.5 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500/50 animate-pulse" />
              <span className="font-medium">Ubicación:</span>
              <span className="text-zinc-400 font-semibold truncate">{asset.almacen || asset.mina}</span>
            </Text>
          )}
        </div>
      </div>

      {/* Lecturas: Inicial / Final  (horómetro u odómetro) */}
      {tipoControl !== "vueltas" && (
        <SimpleGrid cols={2} spacing="md">
          <NumberInput
            label={`${labelLectura} Inicial`}
            value={lecturaInicio}
            onChange={(val) => setLecturaInicio(val as number | "")}
            min={0}
            decimalScale={2}
            fixedDecimalScale
            required
            size="xs"
            radius="lg"
            disabled={loadingData}
          />
          <NumberInput
            label={`${labelLectura} Final`}
            value={lecturaFin}
            onChange={(val) => setLecturaFin(val as number | "")}
            min={0}
            decimalScale={2}
            fixedDecimalScale
            required
            size="xs"
            radius="lg"
            disabled={loadingData}
          />
        </SimpleGrid>
      )}

      {/* Tarifa (+ vueltas cuando aplica) */}
      <SimpleGrid cols={tipoControl === "vueltas" ? 2 : 1} spacing="md">
        <Group gap={6} align="flex-end" wrap="nowrap">
          <Select
            className="flex-1"
            label="Tarifa de Uso"
            placeholder="Seleccione tarifa..."
            data={tarifas
              .filter((t) => t.tipo_control === tipoControl)
              .map((t) => ({
                value: t.id.toString(),
                label: [
                  `S/. ${Number(t.precio_unitario).toFixed(2)}`,
                  t.tipo_material ? `x ${t.tipo_material}` : null,
                  t.descripcion ? `· ${t.descripcion}` : null,
                ].filter(Boolean).join(" "),
              }))}
            value={idTarifa}
            onChange={setIdTarifa}
            searchable
            clearable
            radius="lg"
            size="xs"
          />
          <Tooltip label="Historial de Tarifas">
            <ActionIcon
              onClick={() => setModalHistorialOpened(true)}
              variant="light"
              color="zinc.4"
              size={32}
              radius="lg"
              className="mb-[3px] border border-zinc-700/50"
            >
              <QueueListIcon className="w-4 h-4" />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Nueva Tarifa">
            <ActionIcon
              onClick={() => setModalTarifaOpened(true)}
              variant="filled"
              color="indigo.6"
              size={32}
              radius="lg"
              className="mb-[3px]"
            >
              <PlusIcon className="w-4 h-4" />
            </ActionIcon>
          </Tooltip>
        </Group>

        {tipoControl === "vueltas" && (
          <NumberInput
            label="Cantidad de Vueltas"
            value={cantidadVueltas}
            onChange={(val) => setCantidadVueltas(val as number | "")}
            min={0}
            required
            size="xs"
            radius="lg"
          />
        )}
      </SimpleGrid>

      <Card
        withBorder
        padding="sm"
        radius="lg"
        className="bg-zinc-950/40 border-zinc-800"
      >
        <Group justify="space-between" align="center">
          <Stack gap={2}>
            <Text size="xs" c="zinc-400" fw={600}>
              Total {labelDiferencia}
            </Text>
            <Group gap={6}>
              <Text size="xl" fw={800} className="text-indigo-400">
                {totalUso.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
              <Text size="xs" c="zinc-500" className="mt-1.5 italic">
                {unitMeasure}
              </Text>
            </Group>
          </Stack>

          <Stack gap={2} align="flex-end">
            <Text size="xs" c="zinc-400" fw={600}>
              Costo Operativo Total
            </Text>
            <Badge
              size="lg"
              variant="gradient"
              gradient={{ from: "indigo.5", to: "indigo.8" }}
              radius="lg"
              fw={800}
              h={32}
              className="px-4"
            >
              S/.{" "}
              {costoTotal.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Badge>
          </Stack>
        </Group>
      </Card>

      {tipoControl === "horometro" && (
        <Card withBorder padding="md" radius="lg" className="bg-zinc-950/20 border-zinc-800/60">
          <Group justify="flex-start" align="center" mb="sm" gap="xs">
            <Text size="xs" fw={600} className="text-zinc-300">
              Destino del Trabajo:
            </Text>
            <SegmentedControl
              value={esParaMina ? "mina" : "terceros"}
              onChange={(value) => setEsParaMina(value === "mina")}
              data={[
                {
                  value: "mina",
                  label: (
                    <Center style={{ gap: 6 }}>
                      <MapPinIcon className="w-4 h-4" />
                      <Box>En Mina</Box>
                    </Center>
                  ),
                },
                {
                  value: "terceros",
                  label: (
                    <Center style={{ gap: 6 }}>
                      <BriefcaseIcon className="w-4 h-4" />
                      <Box>Para Terceros</Box>
                    </Center>
                  ),
                },
              ]}
              radius="md"
              size="xs"
              classNames={{
                root: "bg-zinc-900/50 border border-zinc-800",
                control: "border-none",
                indicator: "bg-indigo-600",
                label: "text-zinc-400 data-[active]:text-white font-bold",
              }}
            />
          </Group>

          <SimpleGrid cols={esParaMina ? 2 : 1} spacing="md" mt="md">
            {esParaMina ? (
              <>
                <Select
                  label="Mina"
                  placeholder="Seleccione mina"
                  data={minas}
                  value={idMina}
                  onChange={setIdMina}
                  searchable
                  required
                  radius="lg"
                  size="xs"
                />
                <Select
                  label="Labor (Opcional)"
                  placeholder="Seleccione labor"
                  data={labores}
                  value={idLabor}
                  onChange={setIdLabor}
                  searchable
                  clearable
                  disabled={!idMina}
                  radius="lg"
                  size="xs"
                />
              </>
            ) : (
              <Select
                label="Cliente"
                placeholder="Seleccione cliente"
                data={clientes}
                value={idCliente}
                onChange={setIdCliente}
                searchable
                required
                radius="lg"
                size="xs"
              />
            )}
          </SimpleGrid>
        </Card>
      )}

      {tipoControl === "horometro" && (
        <SimpleGrid cols={1} spacing="md">
          <Select
            label="Tipo de Carga"
            placeholder="Seleccione..."
            data={["Arrumaje de Mineral", "Carguio de Mineral"]}
            value={tipoCarga}
            onChange={setTipoCarga}
            clearable
            radius="lg"
            size="xs"
          />
        </SimpleGrid>
      )}

      <Textarea
        label="Observación"
        placeholder="Ingrese notas u observaciones..."
        value={observacion}
        onChange={(e) => setObservacion(e.target.value)}
        size="xs"
        radius="lg"
        minRows={2}
      />

      <Group justify="flex-end" mt="lg" gap="xs">
        <Button
          variant="subtle"
          color="zinc.5"
          onClick={onCancel}
          disabled={saving}
          size="xs"
          radius="lg"
        >
          Cancelar
        </Button>
        <Button
          color="indigo"
          onClick={handleSubmit}
          loading={saving}
          size="xs"
          radius="lg"
        >
          Guardar Control
        </Button>
      </Group>

      <ModalEstandar
        opened={modalTarifaOpened}
        close={() => setModalTarifaOpened(false)}
        title={`Tarifas por uso - ${
          tipoControl.charAt(0).toUpperCase() + tipoControl.slice(1)
        }`}
        size="sm"
      >
        <NuevaTarifaModal
          asset={asset}
          initialTipoControl={tipoControl}
          onCancel={() => setModalTarifaOpened(false)}
          onSuccess={(nuevaTarifa) => {
            setTarifas((prev) => [...prev, nuevaTarifa]);
            setIdTarifa(nuevaTarifa.id.toString());
            setModalTarifaOpened(false);
          }}
        />
      </ModalEstandar>

      {/* Historial de Tarifas Modal */}
      <ModalEstandar
        opened={modalHistorialOpened}
        close={() => setModalHistorialOpened(false)}
        title={`Historial de Tarifas - ${
          tipoControl.charAt(0).toUpperCase() + tipoControl.slice(1)
        }`}
        size="lg"
      >
        <div className="mt-2 h-[350px]">
          <DataTableEstandar
            idAccessor="id"
            loading={false}
            records={tarifas
              .filter((t) => t.tipo_control === tipoControl)
              .sort((a, b) => b.id - a.id)}
            columns={[
              {
                accessor: "precio_unitario",
                title: "Precio Unit.",
                render: (record) => (
                  <Badge color="violet" variant="light" size="sm" radius="sm">
                    S/. {Number(record.precio_unitario).toFixed(2)}
                  </Badge>
                ),
              },
              {
                accessor: "tipo_material",
                title: "Material",
                render: (record) =>
                  record.tipo_material ? (
                    <Badge size="xs" color="gray" variant="dot">
                      {record.tipo_material}
                    </Badge>
                  ) : (
                    <span className="text-zinc-600 text-xs italic">N/A</span>
                  ),
              },
              {
                accessor: "descripcion",
                title: "Descripción",
                render: (record) =>
                  record.descripcion ? (
                    <span className="text-zinc-300 text-sm">{record.descripcion}</span>
                  ) : (
                    <span className="text-zinc-600 text-xs italic">Sin descripción</span>
                  ),
              },
              {
                accessor: "created_at",
                title: "Fecha Creación",
                render: (record) => (
                  <span className="text-zinc-400 text-xs">
                    {dayjs(record.created_at).format("DD MMM YYYY, HH:mm")}
                  </span>
                ),
              },
            ]}
          />
        </div>
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={() => setModalHistorialOpened(false)} size="xs" radius="lg">
            Cerrar
          </Button>
        </Group>
      </ModalEstandar>
    </Stack>
  );
};

export default RegistroUso;
