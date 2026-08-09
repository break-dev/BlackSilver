import { useState, useMemo } from "react";
import {
  Select,
  Badge,
  ActionIcon,
  Tooltip,
  TextInput,
  Group,
  Stack,
  Text,
  Loader,
} from "@mantine/core";
import {
  CalendarDaysIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  InboxStackIcon,
  BuildingStorefrontIcon,
  PaperClipIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import { MESES } from "../../../shared/variables/meses";
import { useTitlePage } from "../../../hooks/useTitlePage";
import { DataTableEstandar } from "../../../presentation/utils/datatable-estandar";
import { ModalEstandar } from "../../../presentation/utils/modal-estandar";
import { useListarTransferencias } from "../hooks/useListarTransferencias";
import { DetalleTransferencia } from "./detalle-transferencia/detalle-transferencia";
import type { RES_OCTransferencia } from "../../../service/responses/ordenes-compra/orden-compra-transferencia";
import type { DataTableColumn } from "mantine-datatable";
import { Estado_OCTransferencia } from "../../../shared/enums/orden-compra/orden-compra-transferencia";
import { BotonRecargar } from "../../../presentation/utils/boton-recargar";

export const RecepcionTransferenciasOCPage = () => {
  useTitlePage("Recepción de Transferencias");

  const {
    almacenes,
    selectedAlmacenId,
    setSelectedAlmacenId,
    mes,
    setMes,
    anio,
    setAnio,
    transferencias,
    loading,
    loadingAlmacenes,
    selectedTransferencia,
    detallesTransferencia,

    seleccionarTransferencia,
    cerrarDetalle,
    refrescarLista,
    loadingDetalles,
  } = useListarTransferencias();

  const [busqueda, setBusqueda] = useState("");

  const filteredTransferencias = useMemo(() => {
    return transferencias.filter(
      (t) =>
        t.correlativo?.toLowerCase().includes(busqueda.toLowerCase()) ||
        t.almacen_origen?.toLowerCase().includes(busqueda.toLowerCase()) ||
        t.codigo_orden_compra?.toLowerCase().includes(busqueda.toLowerCase()) ||
        t.empleado_transferencia
          ?.toLowerCase()
          .includes(busqueda.toLowerCase()) ||
        t.estado?.toLowerCase().includes(busqueda.toLowerCase()),
    );
  }, [transferencias, busqueda]);

  const getBadgeColor = (estado: Estado_OCTransferencia) => {
    switch (estado) {
      case Estado_OCTransferencia.RecepcionCompleta:
        return "teal";
      case Estado_OCTransferencia.RecepcionadoParcialmente:
        return "orange";
      case Estado_OCTransferencia.EnDespacho:
        return "indigo";
      default:
        return "indigo";
    }
  };

  const onRecepcionSuccess = () => {
    cerrarDetalle();
    refrescarLista();
  };

  const inputClasses = {
    input:
      "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 text-white placeholder:text-zinc-500 transition-all",
    label: "text-zinc-400 text-xs font-semibold mb-1 ml-1",
    dropdown: "bg-zinc-900 border-zinc-800",
    option:
      "text-zinc-300 hover:bg-zinc-800 data-[selected]:bg-indigo-600 data-[selected]:text-white transition-colors",
  };

  const columns: DataTableColumn<RES_OCTransferencia>[] = [
    {
      accessor: "index",
      title: "#",
      textAlign: "center",
      width: 60,
      render: (_record, index) => index + 1,
    },
    {
      accessor: "correlativo",
      title: "Código Transferencia",
      textAlign: "center",
      width: 150,
      render: (r) => (
        <Badge variant="light" color="indigo" radius="sm">
          {r.correlativo}
        </Badge>
      ),
    },
    {
      accessor: "codigo_orden_compra",
      title: "OC/Recepción",
      textAlign: "center",
      width: 220,
      render: (r) => (
        <div className="flex flex-row items-center justify-center gap-2">
          <Badge variant="light" color="lime.4" radius="sm">
            {r.codigo_orden_compra}
          </Badge>
          <Text size="xs" c="dimmed" fw={700}>
            Rec. #{r.numero_recepcion}
          </Text>
        </div>
      ),
    },
    {
      accessor: "almacen_origen",
      title: "Desde (Origen)",
      width: 180,
      textAlign: "center",
      render: (r) => (
        <Group gap="xs" wrap="nowrap" justify="center">
          <BuildingStorefrontIcon className="w-5 h-5 text-zinc-500 shrink-0" />
          <Text size="sm" className="text-zinc-200">
            {r.almacen_origen}
          </Text>
        </Group>
      ),
    },
    {
      accessor: "fechas",
      title: "Programación",
      width: 200,
      render: (r) => (
        <Stack gap={2}>
          <Group gap={6}>
            <CalendarDaysIcon className="w-4 h-4 text-zinc-500" />
            <Text size="xs" fw={600} className="text-zinc-200">
              {dayjs(r.fecha_hora_transferencia).format("DD/MM/YYYY")}
            </Text>
          </Group>
          <Text size="xs" c="dimmed" ml={22}>
            Creado: {dayjs(r.created_at).format("DD/MM/YYYY HH:mm")}
          </Text>
        </Stack>
      ),
    },
    {
      accessor: "empleado_transferencia",
      title: "Encargado Transferencia",
      width: 220,
      render: (r) => (
        <Stack gap={2}>
          <Text size="sm" className="text-zinc-200 font-medium">
            {r.empleado_transferencia}
          </Text>
        </Stack>
      ),
    },
    {
      accessor: "empleado_recepcion",
      title: "Responsable Envío",
      width: 220,
      render: (r) => (
        <Stack gap={2}>
          <Text size="sm" className="text-zinc-200 font-medium">
            {r.empleado_recibe}
          </Text>
          {r.evidencias && r.evidencias.length > 0 && (
            <Group gap={4}>
              <PaperClipIcon className="w-3.5 h-3.5 text-emerald-500" />
              <Text size="11px" fw={600} c="emerald.5">
                {r.evidencias.length} evidencias
              </Text>
            </Group>
          )}
        </Stack>
      ),
    },
    {
      accessor: "estado",
      title: "Estado",
      textAlign: "center",
      width: 160,
      render: (r) => (
        <Badge
          color={getBadgeColor(r.estado)}
          variant="light"
          radius="sm"
          size="sm"
          className="font-semibold uppercase tracking-wider"
        >
          {r.estado}
        </Badge>
      ),
    },
    {
      accessor: "acciones",
      title: "Acciones",
      textAlign: "center",
      width: 150,
      render: (r) => (
        <Tooltip label="Ver Detalle" position="top" withArrow>
          <ActionIcon
            variant="filled"
            color="indigo"
            radius="md"
            onClick={() => seleccionarTransferencia(r)}
            className="shadow-sm hover:scale-110 transition-transform"
          >
            <EyeIcon className="w-5 h-5 text-white" />
          </ActionIcon>
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in text-zinc-100">
      {/* Filtros de Selección */}
      <div className="flex flex-col lg:flex-row gap-4 items-end">
        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
          <div className="w-full sm:w-72">
            <Select
              label="Almacén de Recepción"
              placeholder="Elegir almacén..."
              data={almacenes.map((a) => ({
                value: String(a.id_almacen),
                label: a.nombre,
              }))}
              value={selectedAlmacenId?.toString() || null}
              onChange={(val) => setSelectedAlmacenId(val ? Number(val) : null)}
              searchable
              clearable
              disabled={loadingAlmacenes}
              radius="lg"
              size="sm"
              leftSection={
                <BuildingStorefrontIcon className="w-4 h-4 text-zinc-500" />
              }
              rightSection={
                loadingAlmacenes ? (
                  <Loader size="xs" color="indigo" />
                ) : undefined
              }
              classNames={inputClasses}
            />
          </div>

          <div className="w-full sm:w-40">
            <Select
              label="Mes"
              placeholder="Elegir mes"
              data={MESES}
              value={String(mes)}
              onChange={(val) => setMes(Number(val) || 1)}
              radius="lg"
              size="sm"
              allowDeselect={false}
              leftSection={
                <CalendarDaysIcon className="w-4 h-4 text-zinc-500" />
              }
              classNames={inputClasses}
            />
          </div>

          <div className="w-full sm:w-32">
            <Select
              label="Año"
              placeholder="Elegir año"
              data={Array.from({ length: 5 }, (_, i) => ({
                value: String(dayjs().year() - i),
                label: String(dayjs().year() - i),
              }))}
              value={String(anio)}
              onChange={(val) => setAnio(Number(val) || dayjs().year())}
              radius="lg"
              size="sm"
              allowDeselect={false}
              leftSection={
                <CalendarDaysIcon className="w-4 h-4 text-zinc-500" />
              }
              classNames={inputClasses}
            />
          </div>

        <div className="flex items-end gap-2 flex-1 min-w-[200px]">
            <div className="flex-1 min-w-[200px]">
              <TextInput
                label="Búsqueda"
                placeholder="Transferencia, OC o empleado..."
                leftSection={
                  <MagnifyingGlassIcon className="w-4 h-4 text-zinc-500" />
                }
                value={busqueda}
                onChange={(e) => setBusqueda(e.currentTarget.value)}
                disabled={!selectedAlmacenId}
                radius="lg"
                size="sm"
                classNames={inputClasses}
              />
            </div>
            <BotonRecargar onReload={refrescarLista} loading={loading} />
          </div>
        </div>
      </div>

      {/* Área de Tabla */}
      <div className="transition-all">
        {!selectedAlmacenId ? (
          <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-zinc-800 rounded-3xl bg-zinc-900/10">
            <div className="p-4 rounded-full bg-zinc-900/50 mb-4">
              <InboxStackIcon className="w-12 h-12 text-zinc-700" />
            </div>
            <Text size="lg" fw={600} className="text-zinc-400">
              Recepción de Transferencias de Inventario
            </Text>
            <Text className="text-zinc-500 text-center max-w-sm mt-1">
              Seleccione el almacén de destino para visualizar y gestionar las
              transferencias pendientes de recepción.
            </Text>
          </div>
        ) : filteredTransferencias.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center p-20 text-zinc-500 gap-4">
            <div className="bg-zinc-900/50 p-6 rounded-full border border-zinc-800">
              <CubeIcon className="w-12 h-12 text-zinc-700" />
            </div>
            <div className="text-center">
              <Text fw={600} size="lg" className="text-zinc-400">
                No se encontraron registros
              </Text>
              <Text size="sm" className="text-zinc-600">
                Pruebe cambiando los filtros de búsqueda o el periodo mensual.
              </Text>
            </div>
          </div>
        ) : (
          <DataTableEstandar
            idAccessor="id_transferencia"
            records={filteredTransferencias}
            loading={loading || loadingAlmacenes}
            columns={columns}
          />
        )}
      </div>

      {/* MODAL DETALLES (Nivel 1) */}
      <ModalEstandar
        opened={!!selectedTransferencia}
        close={cerrarDetalle}
        title="Detalle de Transferencia"
        size="65%"
      >
        {selectedTransferencia && selectedAlmacenId && (
          <DetalleTransferencia
            transferencia={{
              ...selectedTransferencia,
              detalles: detallesTransferencia,
            }}
            loading={loadingDetalles}
            idAlmacenRecepcionista={selectedAlmacenId}
            onRecepcionSuccess={onRecepcionSuccess}
          />
        )}
      </ModalEstandar>
    </div>
  );
};
