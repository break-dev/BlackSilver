import { useState, useMemo } from "react";
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
  Paper,
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
import { useAtencionPrestamos } from "../hooks/useAtencionPrestamos";
import type { RES_PrestamoAtencion } from "../service/prestamos-atencion.responses";
import { useTitlePage } from "../../../hooks/useTitlePage";
import { DataTableEstandar } from "../../../presentation/utils/datatable-estandar";
import { ModalEstandar } from "../../../presentation/utils/modal-estandar";
import { MESES } from "../../../presentation/variables/meses";
import { DetallePrestamo } from "./detalle-prestamo";

const ESTADO_COLORS: Record<string, string> = {
  "Generado":   "blue",
  "En Proceso": "indigo",
  "Completado": "teal",
  "Finalizado": "green",
  "Anulado":    "red",
};

export const AtencionPrestamosPage = () => {
  useTitlePage("Atención de Préstamos entre Almacenes");

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
    cargarPrestamos,
  } = useAtencionPrestamos();



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
        width: 140,
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
            <Text size="sm" fw={700} className="text-zinc-200">{item.almacen_solicitante}</Text>
          </Group>
        ),
      },
      {
        accessor: "registrado_por",
        title: "Registrado por",
        width: 180,
        render: (item) => (
          <Text size="xs" fw={600} className="text-zinc-400">{item.registrado_por}</Text>
        ),
      },
      {
        accessor: "fechas",
        title: "Fechas",
        width: 180,
        render: (item) => (
          <Stack gap={2}>
            <Group gap={6}>
              <CalendarDaysIcon className="w-4 h-4 text-zinc-500" />
              <Text size="xs" fw={800} className="text-zinc-200">
                {dayjs(item.fecha_hora_prestamo).format("DD/MM/YYYY HH:mm")}
              </Text>
            </Group>
            {item.fecha_limite_devolucion && (
              <Text size="10px" fw={900} color="orange.6" ml={22} className="uppercase tracking-tighter">
                Devolver: {dayjs(item.fecha_limite_devolucion).format("DD/MM/YYYY")}
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
            radius="md"
            className="font-black uppercase tracking-widest px-2"
          >
            {item.estado}
          </Badge>
        ),
      },
      {
        accessor: "acciones",
        title: "Atención",
        textAlign: "center",
        width: 100,
        render: (item) => (
          <Tooltip label="Gestionar Préstamo" position="top" withArrow>
            <ActionIcon
              variant="filled"
              color="indigo"
              radius="md"
              size="lg"
              onClick={() => {
                setSelectedId(item.id_prestamo);
                openDetalle();
              }}
              className="shadow-md hover:scale-105 transition-all"
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
      <Paper p="lg" radius="xl" className="bg-zinc-900/40 border-zinc-800 border backdrop-blur-md">
        <div className="flex flex-col lg:flex-row justify-between gap-4 items-end lg:items-center">
            <div className="flex flex-wrap gap-4 flex-1 w-full lg:w-auto">
            {/* Almacén */}
            <div className="w-full sm:w-80">
                <Select
                    label="Punto de Atención"
                    placeholder="Seleccione su Almacén"
                    leftSection={loadingAlmacenes ? <Loader size="xs" /> : <BuildingOffice2Icon className="w-4 h-4" />}
                    data={almacenes.map((a) => ({ value: String(a.id_almacen), label: a.nombre }))}
                    value={idAlmacen}
                    onChange={setIdAlmacen}
                    radius="md"
                />
            </div>

            {/* Mes */}
            <div className="w-full sm:w-40">
                <Select
                    label="Mes"
                    placeholder="Mes"
                    leftSection={<CalendarDaysIcon className="w-4 h-4" />}
                    data={MESES}
                    value={mes}
                    onChange={(val) => setMes(val || "")}
                    radius="md"
                />
            </div>

            {/* Año */}
            <div className="w-full sm:w-32">
                <Select
                    label="Año"
                    placeholder="Año"
                    data={Array.from({ length: 5 }, (_, i) => {
                        const y = (dayjs().year() - i).toString();
                        return { value: y, label: y };
                    })}
                    value={yearcito}
                    onChange={(val) => setYearcito(val || "")}
                    radius="md"
                />
            </div>

            {/* Búsqueda */}
            <TextInput
                label="Búsqueda rápida"
                placeholder="Código, solicitante..."
                leftSection={<MagnifyingGlassIcon className="w-4 h-4" />}
                value={busqueda}
                onChange={(e) => setBusqueda(e.currentTarget.value)}
                disabled={!idAlmacen}
                className="flex-1 min-w-[200px]"
                radius="md"
            />
            </div>
        </div>
      </Paper>

      {/* Estado: sin almacén seleccionado */}
      {!idAlmacen ? (
        <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-zinc-800 rounded-3xl bg-zinc-900/10">
          <div className="p-5 rounded-3xl bg-zinc-900/50 mb-4 shadow-xl border border-zinc-800">
            <ArchiveBoxArrowDownIcon className="w-12 h-12 text-zinc-600" />
          </div>
          <Text size="xl" fw={900} className="text-zinc-200 tracking-tight">
            Panel de Atención de Préstamos
          </Text>
          <Text className="text-zinc-500 text-center max-w-sm mt-2 text-sm">
            Para ver los préstamos pendientes, por favor seleccione el almacén del que es responsable en los filtros superiores.
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
        title="Gestión de Préstamo entre Almacenes"
        size="95%"
      >
        {selectedId && selectedPrestamo && (
          <DetallePrestamo
            prestamo={selectedPrestamo}
            idAlmacenPrestamista={Number(idAlmacen)}
            onDespachoRegistrado={() => {
              // No cerramos el modal, solo refrescamos datos internos si es necesario
              // o cerramos si el usuario prefiere
              cargarPrestamos();
            }}
          />
        )}
      </ModalEstandar>
    </div>
  );
};
