import { useEffect, useState, useMemo } from "react";
import {
  Badge,
  Group,
  Stack,
  Text,
  TextInput,
  ActionIcon,
  Tooltip,
  Select,
  Loader,
} from "@mantine/core";
import {
  MagnifyingGlassIcon,
  BuildingOffice2Icon,
  CalendarDaysIcon,
  EyeIcon,
  ArchiveBoxArrowDownIcon,
} from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import { type DataTableColumn } from "mantine-datatable";
import { useDisclosure } from "@mantine/hooks";
import { usePrestamosAtencion } from "../hooks/usePrestamosAtencion";
import type { RES_PrestamoAtencion } from "../service/prestamos-atencion.responses";
import { useUIStore } from "../../../stores/ui.store";
import { DataTableEstandar } from "../../../presentation/utils/datatable-estandar";
import { ModalEstandar } from "../../../presentation/utils/modal-estandar";
import { MESES } from "../../../presentation/variables/meses";
import { DetallePrestamoPrestamista } from "./detalle-prestamo-prestamista.tsx";

const ESTADO_COLORS: Record<string, string> = {
  "Generado":   "blue",
  "En Proceso": "indigo",
  "Completado": "teal",
  "Finalizado": "green",
  "Anulado":    "red",
};

export const PrestamosAtencionPage = () => {
  const setTitle = useUIStore((state) => state.setTitle);

  const [openedDetalle, { open: openDetalle, close: closeDetalle }] = useDisclosure(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const {
    almacenes,
    loadingAlmacenes,
    idAlmacen,
    setIdAlmacen,
    mes,
    setMes,
    yearcito,
    setYearcito,
    busqueda,
    setBusqueda,
    filteredRecords,
    loading,
    obtenerAlmacenesAutorizados,
    cargarPrestamos,
  } = usePrestamosAtencion();

  useEffect(() => {
    setTitle("Atención de Préstamos entre Almacenes");
    obtenerAlmacenesAutorizados();
  }, [setTitle, obtenerAlmacenesAutorizados]);

  const selectedPrestamo = useMemo(
    () => filteredRecords.find((p) => p.id_prestamo === selectedId) ?? null,
    [filteredRecords, selectedId]
  );

  const columns: DataTableColumn<RES_PrestamoAtencion>[] = useMemo(
    () => [
      {
        accessor: "index",
        title: "#",
        textAlign: "center",
        width: 60,
        render: (_, index) => index + 1,
      },
      {
        accessor: "correlativo",
        title: "Código",
        width: 150,
        render: (item) => (
          <Badge variant="light" color="indigo" radius="sm" className="font-mono font-bold">
            {item.correlativo}
          </Badge>
        ),
      },
      {
        accessor: "almacen_solicitante",
        title: "Almacén Solicitante",
        width: 200,
        render: (item) => (
          <Group gap="xs" wrap="nowrap">
            <BuildingOffice2Icon className="w-4 h-4 text-zinc-500 shrink-0" />
            <Text size="sm" className="text-zinc-200">{item.almacen_solicitante}</Text>
          </Group>
        ),
      },
      {
        accessor: "registrado_por",
        title: "Registrado por",
        width: 180,
        render: (item) => (
          <Text size="sm" className="text-zinc-300">{item.registrado_por}</Text>
        ),
      },
      {
        accessor: "fechas",
        title: "Fechas",
        width: 200,
        render: (item) => (
          <Stack gap={2}>
            <Group gap={6}>
              <CalendarDaysIcon className="w-4 h-4 text-zinc-500" />
              <Text size="xs" fw={600} className="text-zinc-200">
                {dayjs(item.fecha_hora_prestamo).format("DD/MM/YYYY HH:mm")}
              </Text>
            </Group>
            {item.fecha_limite_devolucion && (
              <Text size="xs" c="dimmed" ml={22}>
                Dev: {dayjs(item.fecha_limite_devolucion).format("DD/MM/YYYY")}
              </Text>
            )}
          </Stack>
        ),
      },
      {
        accessor: "estado",
        title: "Estado",
        width: 130,
        render: (item) => (
          <Badge
            color={ESTADO_COLORS[item.estado] ?? "gray"}
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
        width: 80,
        render: (item) => (
          <Tooltip label="Ver y Despachar" position="top" withArrow>
            <ActionIcon
              variant="filled"
              color="indigo"
              radius="md"
              onClick={() => {
                setSelectedId(item.id_prestamo);
                openDetalle();
              }}
              className="shadow-md hover:scale-105 transition-transform"
            >
              <EyeIcon className="w-5 h-5 text-white" />
            </ActionIcon>
          </Tooltip>
        ),
      },
    ],
    [openDetalle]
  );

  return (
    <div className="space-y-6 animate-fade-in text-zinc-100">
      {/* Filtros */}
      <div className="flex flex-col lg:flex-row justify-between gap-4 items-end lg:items-center">
        <div className="flex flex-wrap gap-4 flex-1 w-full lg:w-auto">
          {/* Select de Almacén */}
          <div className="w-full sm:w-72">
            <Select
              placeholder="Seleccione su Almacén"
              leftSection={
                loadingAlmacenes ? (
                  <Loader size="xs" />
                ) : (
                  <BuildingOffice2Icon className="w-4 h-4 text-zinc-400" />
                )
              }
              data={almacenes.map((a) => ({
                value: String(a.id_almacen),
                label: a.nombre,
              }))}
              value={idAlmacen}
              onChange={setIdAlmacen}
              radius="lg"
              classNames={{
                input: "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 text-white placeholder:text-zinc-500",
                dropdown: "bg-zinc-900 border-zinc-800",
                option: "text-zinc-300 hover:bg-zinc-800",
              }}
            />
          </div>

          {/* Mes */}
          <div className="w-full sm:w-40">
            <Select
              placeholder="Mes"
              leftSection={<CalendarDaysIcon className="w-4 h-4 text-zinc-400" />}
              data={MESES}
              value={mes}
              onChange={(val) => setMes(val || "")}
              radius="lg"
              classNames={{
                input: "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 text-white",
                dropdown: "bg-zinc-900 border-zinc-800",
                option: "text-zinc-300 hover:bg-zinc-800",
              }}
            />
          </div>

          {/* Año */}
          <div className="w-full sm:w-32">
            <Select
              placeholder="Año"
              data={Array.from({ length: 5 }, (_, i) => {
                const y = (dayjs().year() - i).toString();
                return { value: y, label: y };
              })}
              value={yearcito}
              onChange={(val) => setYearcito(val || "")}
              radius="lg"
              classNames={{
                input: "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 text-white",
                dropdown: "bg-zinc-900 border-zinc-800",
                option: "text-zinc-300 hover:bg-zinc-800",
              }}
            />
          </div>

          {/* Búsqueda */}
          <TextInput
            placeholder="Buscar por código, almacén..."
            leftSection={<MagnifyingGlassIcon className="w-4 h-4 text-zinc-400" />}
            value={busqueda}
            onChange={(e) => setBusqueda(e.currentTarget.value)}
            disabled={!idAlmacen}
            className="flex-1 min-w-[200px]"
            radius="lg"
            classNames={{
              input: "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 text-white placeholder:text-zinc-500",
            }}
          />
        </div>
      </div>

      {/* Estado: sin almacén seleccionado */}
      {!idAlmacen ? (
        <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-zinc-800 rounded-3xl bg-zinc-900/10">
          <div className="p-4 rounded-full bg-zinc-900/50 mb-4">
            <ArchiveBoxArrowDownIcon className="w-12 h-12 text-zinc-600" />
          </div>
          <Text size="lg" fw={600} className="text-zinc-400">
            Panel de Atención de Préstamos
          </Text>
          <Text className="text-zinc-500 text-center max-w-sm mt-1">
            Seleccione el almacén del que es responsable para visualizar los préstamos recibidos.
          </Text>
        </div>
      ) : (
        <DataTableEstandar
          idAccessor="id_prestamo"
          columns={columns}
          records={filteredRecords}
          loading={loading}
        />
      )}

      {/* Modal Detalle / Despacho */}
      <ModalEstandar
        opened={openedDetalle}
        close={() => {
          closeDetalle();
          setTimeout(() => setSelectedId(null), 300);
        }}
        title="Atender Préstamo de Almacén"
        size="95%"
      >
        {selectedId && selectedPrestamo && (
          <DetallePrestamoPrestamista
            prestamo={selectedPrestamo}
            idAlmacenPrestamista={Number(idAlmacen)}
            onDespachoRegistrado={() => {
              closeDetalle();
              cargarPrestamos();
            }}
          />
        )}
      </ModalEstandar>
    </div>
  );
};
