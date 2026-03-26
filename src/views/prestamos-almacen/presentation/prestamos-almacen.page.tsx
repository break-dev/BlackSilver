import { useState, useMemo } from "react";
import {
  Stack,
  Text,
  Select,
  Badge,
  Group,
  Tooltip,
  ActionIcon,
  TextInput,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  BuildingStorefrontIcon,
  EyeIcon,
  CubeIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { type DataTableColumn } from "mantine-datatable";
import { DataTableEstandar } from "../../../presentation/utils/datatable-estandar";
import { ModalEstandar } from "../../../presentation/utils/modal-estandar";
import { usePrestamosAlmacen } from "../hooks/usePrestamosAlmacen";
import { useDetallePrestamo } from "../hooks/useDetallePrestamo";
import { useTrazabilidadPrestamo } from "../hooks/useTrazabilidadPrestamo";
import { DetallePrestamo } from "./detalle-prestamo";
import { TrazabilidadDetalle } from "./trazabilidad-detalle";
import { HistorialEntregasPrestamo } from "./components/HistorialEntregasPrestamo";
import { MESES } from "../../../presentation/variables/meses";
import type {
  RES_AlmacenSecundario,
  RES_PrestamoResumen,
  RES_PrestamoDetalle,
} from "../service/prestamos.responses";
import { EstadoPrestamo } from "../../../shared/enums/prestamos";
import { getEstadoPrestamoColor } from "./utils/prestamos-render";
import { useTitlePage } from "../../../hooks/useTitlePage";
import dayjs from "dayjs";

const YEARS = Array.from({ length: 5 }, (_, i) => {
  const year = new Date().getFullYear() - i;
  return { value: String(year), label: String(year) };
});

export const PrestamosAlmacenPage = () => {
  useTitlePage("Préstamos Solicitados");
  const {
    almacenes,
    prestamos,
    loading,
    loadingAlmacenes,
    idAlmacen,
    setIdAlmacen,
    mes,
    setMes,
    yearcito,
    setYearcito,
  } = usePrestamosAlmacen();

  const [search, setSearch] = useState("");

  const {
    opened: openedDetail,
    detalles,
    loading: loadingDetail,
    fetchDetalles,
    closeDetail,
    selectedPrestamoId,
  } = useDetallePrestamo();

  const {
    logs,
    loading: loadingLogs,
    opened: openedTrace,
    fetchTrazabilidad,
    closeTrazabilidad,
  } = useTrazabilidadPrestamo();

  const [selectedDetalle, setSelectedDetalle] =
    useState<RES_PrestamoDetalle | null>(null);

  const [openedHistorial, { open: openHistorial, close: closeHistorial }] =
    useDisclosure(false);

  const selectedPrestamo = useMemo(() => {
    return prestamos.find((p) => p.id_prestamo === selectedPrestamoId);
  }, [prestamos, selectedPrestamoId]);

  const progresoGeneral = useMemo(() => {
    if (detalles.length === 0) return 0;
    const totalSolicitado = detalles.reduce(
      (acc, d) => acc + Number(d.cantidad_solicitada_base),
      0,
    );
    const totalPrestado = detalles.reduce(
      (acc, d) => acc + Number(d.cantidad_prestada_base),
      0,
    );
    return Math.round((totalPrestado / totalSolicitado) * 100) || 0;
  }, [detalles]);

  const filteredRecords = useMemo(() => {
    if (!search) return prestamos;
    const s = search.toLowerCase();
    return prestamos.filter(
      (p) =>
        p.correlativo.toLowerCase().includes(s) ||
        p.almacen_solicitante.toLowerCase().includes(s) ||
        p.solicitud_reabastecimiento.toLowerCase().includes(s),
    );
  }, [prestamos, search]);

  const columns: DataTableColumn<RES_PrestamoResumen>[] = useMemo(
    () => [
      {
        accessor: "index",
        title: "#",
        textAlign: "center",
        width: 60,
        render: (_record, index) => index + 1,
      },
      {
        accessor: "correlativo",
        title: "Código",
        width: 140,
        render: (item) => (
          <Badge variant="light" color="indigo" radius="sm">
            {item.correlativo}
          </Badge>
        ),
      },
      {
        accessor: "almacen_solicitante",
        title: "Almacén Destino",
        width: 250,
        render: (item) => (
          <Group gap="xs" wrap="nowrap">
            <BuildingStorefrontIcon className="w-5 h-5 text-zinc-500 shrink-0" />
            <Text size="sm" className="text-zinc-200" fw={500}>
              {item.almacen_solicitante}
            </Text>
          </Group>
        ),
      },
      {
        accessor: "fecha_hora_prestamo",
        title: "Fechas",
        width: 220,
        render: (item) => (
          <Stack gap={2}>
            <Group gap={6}>
              <CalendarDaysIcon className="w-4 h-4 text-zinc-500" />
              <Text size="xs" fw={600} className="text-zinc-200">
                Préstamo: {dayjs(item.fecha_hora_prestamo).format("DD/MM/YYYY")}
              </Text>
            </Group>
            <Text size="11px" className="text-orange-500/80 ml-5.5" fw={500}>
              Devolución:{" "}
              {dayjs(item.fecha_limite_devolucion).format("DD/MM/YYYY")}
            </Text>
          </Stack>
        ),
      },
      {
        accessor: "registrado_por",
        title: "Solicitante",
        width: 200,
        render: (item) => (
          <Group gap="xs" wrap="nowrap">
            <UserCircleIcon className="w-5 h-5 text-emerald-500" />
            <Text size="sm" className="text-zinc-200">
              {item.registrado_por}
            </Text>
          </Group>
        ),
      },
      {
        accessor: "solicitud_reabastecimiento",
        title: "Solicitud Ref.",
        width: 200,
        render: (item) => (
          <Badge variant="light" color="blue" radius="sm">
            {item.solicitud_reabastecimiento}
          </Badge>
        ),
      },
      {
        accessor: "estado",
        title: "Estado",
        width: 150,
        render: (item) => (
          <Badge
            color={getEstadoPrestamoColor(item.estado as EstadoPrestamo)}
            variant="light"
            radius="sm"
            size="sm"
            className="font-semibold uppercase tracking-wider"
          >
            {item.estado}
          </Badge>
        ),
      },
      {
        accessor: "acciones",
        title: "Acciones",
        textAlign: "center",
        width: 100,
        render: (item) => (
          <Group gap="xs" justify="center">
            <Tooltip label="Ver Detalle" position="top" withArrow>
              <ActionIcon
                variant="filled"
                color="indigo"
                radius="md"
                onClick={() => fetchDetalles(item.id_prestamo)}
                className="shadow-sm hover:scale-110 transition-transform"
              >
                <EyeIcon className="w-5 h-5 text-white" />
              </ActionIcon>
            </Tooltip>
          </Group>
        ),
      },
    ],
    [fetchDetalles],
  );

  const inputClasses = {
    input:
      "bg-zinc-900/40 backdrop-blur-md border-zinc-800/50 focus:border-indigo-500/50 transition-all text-zinc-100 placeholder:text-zinc-600 shadow-inner",
    label: "text-zinc-400 font-medium mb-1.5 text-xs uppercase tracking-wider",
  };

  return (
    <div className="space-y-6 animate-fade-in text-zinc-100 p-2">
      {/* Container de Filtros */}
      <div className="bg-zinc-900/30 backdrop-blur-xl border border-zinc-800/50 p-6 rounded-2xl shadow-xl">
        <div className="flex flex-col lg:flex-row justify-between gap-6 items-end">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 flex-1 w-full">
            <Select
              label="Almacén Prestamista"
              placeholder="Seleccionar almacén"
              data={almacenes.map((a: RES_AlmacenSecundario) => ({
                value: String(a.id_almacen),
                label: a.nombre,
              }))}
              value={idAlmacen}
              onChange={setIdAlmacen}
              leftSection={<BuildingStorefrontIcon className="w-4 h-4" />}
              searchable
              disabled={loadingAlmacenes}
              classNames={inputClasses}
              radius="lg"
              size="xs"
            />

            <Select
              label="Mes"
              placeholder="Elegir mes"
              data={MESES}
              value={mes}
              onChange={setMes}
              leftSection={<CalendarDaysIcon className="w-4 h-4" />}
              classNames={inputClasses}
              radius="lg"
              size="xs"
            />

            <Select
              label="Año"
              placeholder="Elegir año"
              data={YEARS}
              value={yearcito}
              onChange={setYearcito}
              leftSection={<CalendarDaysIcon className="w-4 h-4" />}
              classNames={inputClasses}
              radius="lg"
              size="xs"
            />

            <TextInput
              label="Búsqueda rápida"
              placeholder="Código o almacén..."
              leftSection={
                <MagnifyingGlassIcon className="w-4 h-4 text-zinc-500" />
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              classNames={inputClasses}
              radius="lg"
              size="xs"
              className="lg:col-span-2"
            />
          </div>
        </div>
      </div>

      {/* Tabla de Resultados */}
      <div className="bg-zinc-950/20 border border-zinc-800/30 rounded-2xl overflow-hidden shadow-2xl transition-all">
        {filteredRecords.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center p-20 text-zinc-500 gap-4">
            <div className="bg-zinc-900/50 p-6 rounded-full border border-zinc-800 animate-pulse">
              <CubeIcon className="w-12 h-12 text-zinc-700" />
            </div>
            <div className="text-center">
              <Text fw={600} size="lg" className="text-zinc-400">
                No se encontraron préstamos
              </Text>
              <Text size="sm" className="text-zinc-600">
                Intenta cambiando el almacén, periodo o ajustando tu búsqueda
              </Text>
            </div>
          </div>
        ) : (
          <DataTableEstandar
            idAccessor="id_prestamo"
            columns={columns}
            records={filteredRecords}
            loading={loading}
          />
        )}
      </div>

      <ModalEstandar
        opened={openedDetail}
        close={closeDetail}
        title="Detalle del Préstamo"
        size="95%"
      >
        {selectedPrestamo && (
          <DetallePrestamo
            headerData={selectedPrestamo}
            detalles={detalles}
            loading={loadingDetail}
            progresoGeneral={progresoGeneral}
            onOpenTrazabilidad={(det) => {
              setSelectedDetalle(det);
              fetchTrazabilidad(det.id_prestamo_detalle);
            }}
            onOpenHistorial={openHistorial}
          />
        )}
      </ModalEstandar>

      <ModalEstandar
        opened={openedHistorial}
        close={closeHistorial}
        title="Historial de Entregas del Préstamo"
        size="70%"
      >
        {selectedPrestamoId && (
          <HistorialEntregasPrestamo idPrestamo={selectedPrestamoId} />
        )}
      </ModalEstandar>

      <ModalEstandar
        opened={openedTrace}
        close={closeTrazabilidad}
        title="Seguimiento de tu préstamo"
        size="md"
      >
        {selectedDetalle && (
          <TrazabilidadDetalle
            productoNombre={selectedDetalle.producto}
            logs={logs}
            loading={loadingLogs}
          />
        )}
      </ModalEstandar>
    </div>
  );
};
