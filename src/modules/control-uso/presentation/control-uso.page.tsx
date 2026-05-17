import { useDisclosure } from "@mantine/hooks";
import { useTitlePage } from "../../../hooks/useTitlePage";
import { useControlUso } from "../hooks/useControlUso";
import dayjs from "dayjs";
import { ModalEstandar } from "../../../presentation/utils/modal-estandar";
import { DataTableEstandar } from "../../../presentation/utils/datatable-estandar";
import { RegistroUso } from "./registro-uso";
import {
  Button,
  Group,
  Stack,
  Text,
  Badge,
  TextInput,
  Select,
  Tooltip,
  Loader,
} from "@mantine/core";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  InboxStackIcon,
  Cog8ToothIcon,
  TruckIcon,
  CalendarDaysIcon,
  ClockIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";
import { type DataTableColumn } from "mantine-datatable";
import type { RES_ControlUsoLog } from "../service/control-uso.responses";

const MESES = [
  { value: "1", label: "Enero" },
  { value: "2", label: "Febrero" },
  { value: "3", label: "Marzo" },
  { value: "4", label: "Abril" },
  { value: "5", label: "Mayo" },
  { value: "6", label: "Junio" },
  { value: "7", label: "Julio" },
  { value: "8", label: "Agosto" },
  { value: "9", label: "Septiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" },
];

export const ControlUsoPage = () => {
  useTitlePage("Control de Uso");

  // Load custom hook states
  const {
    logs,
    loading,
    busqueda,
    setBusqueda,
    tipoControl,
    setTipoControl,
    mes,
    setMes,
    anio,
    setAnio,
    activos,
    idActivoFijo,
    setIdActivoFijo,
    loadingActivos,
    pushNuevoLog,
  } = useControlUso();

  // Registration modal controller
  const [opened, { open, close }] = useDisclosure(false);

  // Generate years list
  const currentYear = new Date().getFullYear();
  const yearsList = Array.from({ length: 6 }, (_, i) => {
    const y = currentYear - 4 + i;
    return { value: String(y), label: String(y) };
  });



  // Helper to parse floats safely for display
  const formatDecimal = (val: string | number) => {
    const num = typeof val === "string" ? parseFloat(val) : val;
    return isNaN(num)
      ? "0.00"
      : num.toLocaleString("es-PE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
  };

  // Table columns definition (inspired by Lotes layout and styling patterns)
  const columns: DataTableColumn<RES_ControlUsoLog>[] = [
    {
      accessor: "index",
      title: "#",
      textAlign: "center",
      width: 50,
      render: (_, index) => index + 1,
    },
    {
      accessor: "periodo",
      title: "Periodo de Uso",
      textAlign: "center",
      width: 300,
      render: (r) => {
        const inicioDate = dayjs(r.fecha_hora_inicio_control);
        const finDate = r.fecha_hora_fin_control ? dayjs(r.fecha_hora_fin_control) : null;

        return (
          <Group gap={8} wrap="nowrap" justify="center" className="mx-auto w-fit">
            {/* Single Calendar Icon at the left */}
            <div className="p-1.5 bg-zinc-850/60 rounded-xl border border-zinc-800/80 shrink-0 shadow-sm flex items-center justify-center">
              <CalendarDaysIcon className="w-4 h-4 text-zinc-400" />
            </div>

            {/* Inner Content holding Inicio | Fin */}
            <Group gap="xs" wrap="nowrap" className="shrink-0">
              {/* Inicio Block */}
              <div className="flex flex-col items-start gap-0.5 min-w-[75px]">
                <Text size="8px" fw={900} className="text-zinc-500 uppercase tracking-widest leading-none">
                  Inicio
                </Text>
                <Text size="11px" fw={800} className="text-zinc-200">
                  {inicioDate.format("DD MMM YYYY")}
                </Text>
                <Text size="10px" c="dimmed" fw={700} className="tracking-tighter">
                  {inicioDate.format("HH:mm")}
                </Text>
              </div>

              {/* Separator Divider */}
              <div className="w-px h-8 bg-zinc-800/80 self-center shrink-0" />

              {/* Fin Block */}
              <div className="min-w-[95px] flex flex-col items-start justify-center">
                {finDate ? (
                  <div className="flex flex-col items-start gap-0.5">
                    <Text size="8px" fw={900} className="text-zinc-500 uppercase tracking-widest leading-none">
                      Fin
                    </Text>
                    <Text size="11px" fw={800} className="text-zinc-200">
                      {finDate.format("DD MMM YYYY")}
                    </Text>
                    <Text size="10px" c="dimmed" fw={700} className="tracking-tighter">
                      {finDate.format("HH:mm")}
                    </Text>
                  </div>
                ) : (
                  <Badge size="xs" color="blue" variant="light" className="font-black animate-pulse border border-blue-500/10 px-2 py-2.5">
                    En ejecución
                  </Badge>
                )}
              </div>
            </Group>
          </Group>
        );
      },
    },
    {
      accessor: "lecturas",
      title: tipoControl === "horometro" ? "Horómetro" : "Odómetro",
      width: 180,
      render: (r) => (
        <Group gap={8} wrap="nowrap">
          <div className="p-1.5 bg-zinc-850/60 rounded-xl border border-zinc-800/80 shrink-0 shadow-sm flex items-center justify-center">
            <ClockIcon className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="flex flex-col items-start gap-0.5">
            <Text size="11px" fw={700} className="text-zinc-200">
              <span className="text-zinc-500 font-extrabold uppercase tracking-wider text-[9px] mr-1">Inicio:</span>
              {formatDecimal(r.horometro_inicio)}
            </Text>
            <Text size="11px" fw={700} className="text-zinc-200">
              <span className="text-zinc-500 font-extrabold uppercase tracking-wider text-[9px] mr-1">Fin:</span>
              {formatDecimal(r.horometro_fin)}
            </Text>
          </div>
        </Group>
      ),
    },
    {
      accessor: "total_horas",
      title: tipoControl === "horometro" ? "Total Horas" : "Total Km",
      textAlign: "center",
      width: 140,
      render: (r) => {
        const value = formatDecimal(r.total_horas);
        const unit = tipoControl === "horometro" ? "hrs" : "Km";
        return (
          <Badge
            variant="light"
            color="violet"
            radius="md"
            className="font-bold border border-violet-500/20 py-2.5 h-7 shadow-sm mx-auto shrink-0"
          >
            {value} {unit}
          </Badge>
        );
      },
    },
    {
      accessor: "costo",
      title: "Costo Operativo",
      textAlign: "center",
      width: 270,
      render: (r) => (
        <Group gap={8} wrap="nowrap" justify="center" className="mx-auto w-fit">
          {/* Single Banknotes Icon at the left */}
          <div className="p-1.5 bg-zinc-850/60 rounded-xl border border-zinc-800/80 shrink-0 shadow-sm flex items-center justify-center">
            <BanknotesIcon className="w-4 h-4 text-zinc-400" />
          </div>

          {/* Inner Content holding Unitario | Total */}
          <Group gap="xs" wrap="nowrap" className="shrink-0">
            {/* Unitario Block */}
            <div className="flex flex-col items-start gap-0.5 min-w-[95px]">
              <Text size="8px" fw={900} className="text-zinc-500 uppercase tracking-widest leading-none">
                Precio Unit.
              </Text>
              <Badge
                variant="light"
                color="indigo"
                radius="sm"
                size="sm"
                className="font-bold border border-indigo-500/10 px-1.5 mt-0.5"
              >
                S/. {formatDecimal(r.precio_unitario)}
              </Badge>
            </div>

            {/* Separator Divider */}
            <div className="w-px h-8 bg-zinc-800/80 self-center shrink-0" />

            {/* Total Block */}
            <div className="flex flex-col items-start gap-0.5 min-w-[95px]">
              <Text size="8px" fw={900} className="text-zinc-500 uppercase tracking-widest leading-none">
                Costo Total
              </Text>
              <Badge
                variant="light"
                color="pink"
                radius="sm"
                size="sm"
                className="font-bold border border-pink-500/10 px-1.5 mt-0.5"
              >
                S/. {formatDecimal(r.costo_total)}
              </Badge>
            </div>
          </Group>
        </Group>
      ),
    },
    {
      accessor: "observacion",
      title: "Observaciones",
      width: 280,
      render: (r) =>
        r.observacion ? (
          <Tooltip label={r.observacion} multiline w={245} withArrow>
            <Text size="xs" className="text-zinc-400 truncate max-w-[250px] cursor-help">
              {r.observacion}
            </Text>
          </Tooltip>
        ) : (
          <Text size="xs" c="zinc.5" fs="italic">
            Sin observaciones
          </Text>
        ),
    },
  ];

  const fieldClasses = {
    input:
      "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500 transition-all",
    label: "text-zinc-400 text-xs font-semibold mb-1 ml-1",
  };

  // Find the selected asset object to build a friendly label in the modal
  const selectedAssetObj = activos.find((a) => String(a.id_activo) === idActivoFijo);

  return (
    <Stack gap="lg" className="animate-fade-in text-zinc-100">
      {/* Filter Horizontal Box */}
      <div className="flex flex-col md:flex-row items-end gap-3 w-full">
        {/* Tipo de control */}
        <div className="w-full md:w-44">
          <Select
            label="Tipo de control"
            data={[
              { value: "horometro", label: "Horómetro" },
              { value: "odometro", label: "Odómetro" },
            ]}
            value={tipoControl}
            onChange={(val) => setTipoControl(val as "horometro" | "odometro" || "horometro")}
            radius="lg"
            size="sm"
            classNames={{
              ...fieldClasses,
              dropdown: "bg-zinc-900 border-zinc-800",
              option: "text-zinc-300 hover:bg-zinc-800",
            }}
          />
        </div>

        {/* Seleccionar Activo Fijo */}
        <div className="w-full md:w-64">
          <Select
            label="Activo Fijo"
            placeholder={
              loadingActivos
                ? "Cargando activos..."
                : "Seleccione un activo..."
            }
            data={activos.map((a) => ({
              value: String(a.id_activo),
              label: `${a.correlativo} - ${a.producto}`,
            }))}
            value={idActivoFijo}
            onChange={setIdActivoFijo}
            searchable
            disabled={loadingActivos}
            rightSection={
              loadingActivos ? <Loader size={12} color="indigo" /> : null
            }
            radius="lg"
            size="sm"
            classNames={{
              ...fieldClasses,
              dropdown: "bg-zinc-900 border-zinc-800",
              option: "text-zinc-300 hover:bg-zinc-800",
            }}
          />
        </div>

        {/* Mes */}
        <div className="w-full md:w-36">
          <Select
            label="Mes"
            data={MESES}
            value={String(mes)}
            onChange={(val) => setMes(val ? Number(val) : 1)}
            radius="lg"
            size="sm"
            classNames={{
              ...fieldClasses,
              dropdown: "bg-zinc-900 border-zinc-800",
              option: "text-zinc-300 hover:bg-zinc-800",
            }}
          />
        </div>

        {/* Año */}
        <div className="w-full md:w-28">
          <Select
            label="Año"
            data={yearsList}
            value={String(anio)}
            onChange={(val) => setAnio(val ? Number(val) : currentYear)}
            radius="lg"
            size="sm"
            classNames={{
              ...fieldClasses,
              dropdown: "bg-zinc-900 border-zinc-800",
              option: "text-zinc-300 hover:bg-zinc-800",
            }}
          />
        </div>

        {/* Buscador (flex-1 para que sea el más grande) */}
        <div className="flex-1 min-w-[200px] w-full">
          <TextInput
            label="Buscar Registro"
            placeholder="Buscar correlativo, fecha..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            leftSection={<MagnifyingGlassIcon className="w-4 h-4 text-zinc-500" />}
            radius="lg"
            size="sm"
            classNames={fieldClasses}
          />
        </div>

        {/* Botón Registrar Uso */}
        <div className="w-full md:w-auto">
          <Button
            color="blue.6"
            leftSection={<PlusIcon className="w-4 h-4" />}
            onClick={open}
            radius="lg"
            disabled={!idActivoFijo}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-9 shadow-lg shadow-blue-900/20 transition-all px-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Registrar Uso
          </Button>
        </div>
      </div>

      {/* Unified Table Card Container (Matches Lotes, Activos Fijos, and Ordenes de Compra) */}
      <div className="bg-zinc-900/65 border border-zinc-800 rounded-[24px] shadow-2xl overflow-hidden flex flex-col backdrop-blur-md">
        {/* Header Block (Unified header layout) */}
        {selectedAssetObj && (
          <div className="p-4 bg-zinc-900/20 border-b border-zinc-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                {tipoControl === "horometro" ? (
                  <Cog8ToothIcon className="w-5 h-5 text-indigo-400" />
                ) : (
                  <TruckIcon className="w-5 h-5 text-indigo-400" />
                )}
              </div>
              <Stack gap={2}>
                <div className="flex items-center gap-2.5">
                  <Text fw={800} className="uppercase tracking-widest text-zinc-500 text-[10px]!">
                    {tipoControl === "horometro" ? "Control por Horómetro" : "Control por Odómetro"}
                  </Text>
                  <Badge size="xs" color="pink" variant="light" className="font-extrabold border border-pink-500/10">
                    {selectedAssetObj.correlativo}
                  </Badge>
                </div>
                <Text size="md" fw={900} className="text-white tracking-tight">
                  {selectedAssetObj.producto}
                </Text>
              </Stack>
            </div>

            <div className="flex items-center gap-6">
              {(selectedAssetObj.almacen || selectedAssetObj.mina) && (
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-zinc-500 uppercase font-extrabold tracking-wider">Ubicación</span>
                  <div className="flex items-center gap-1.5 text-zinc-300 font-semibold text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {selectedAssetObj.almacen || selectedAssetObj.mina}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-zinc-500 uppercase font-extrabold tracking-wider">Registros del Mes</span>
                <Badge size="sm" color="indigo" variant="light" className="font-extrabold">
                  {logs.length} {logs.length === 1 ? "registro" : "registros"}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Table inside the shadow card */}
        <div className="relative shadow-inner">
          {loading ? (
            <Stack align="center" gap="md" py={100}>
              <div className="relative">
                <div className="size-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                <InboxStackIcon className="size-6 text-indigo-400 absolute inset-0 m-auto animate-pulse" />
              </div>
              <Text size="xs" fw={900} className="uppercase tracking-[0.3em] text-zinc-500">
                Consultando registros...
              </Text>
            </Stack>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20">
              <InboxStackIcon className="size-12 text-zinc-700 mb-4" />
              <Text size="sm" fw={700} className="text-zinc-400 uppercase tracking-widest">
                Sin resultados
              </Text>
              <Text size="xs" c="dimmed" className="mt-1">
                No se encontraron registros de uso para los filtros aplicados.
              </Text>
            </div>
          ) : (
            <DataTableEstandar
              idAccessor="id_log"
              columns={columns}
              records={logs}
              loading={loading}
              minHeight={0}
            />
          )}
        </div>
      </div>

      {/* Register Use Modal */}
      <ModalEstandar
        opened={opened}
        close={close}
        title={`Registrar Control por ${tipoControl === "horometro" ? "Horómetro" : "Odómetro"}`}
        size="md"
      >
        {selectedAssetObj && (
          <RegistroUso
            asset={selectedAssetObj}
            tipoControl={tipoControl}
            onSuccess={(nuevoLog) => {
              pushNuevoLog(nuevoLog);
              close();
            }}
            onCancel={close}
          />
        )}
      </ModalEstandar>
    </Stack>
  );
};

export default ControlUsoPage;
