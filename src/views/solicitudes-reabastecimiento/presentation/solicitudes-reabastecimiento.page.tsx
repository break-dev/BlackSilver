import {
  Badge,
  Button,
  Stack,
  Select,
  Text,
  TextInput,
  Group,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import { useEffect, useState, useMemo } from "react";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  BuildingStorefrontIcon,
  UserCircleIcon,
  CalendarDaysIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import { type DataTableColumn } from "mantine-datatable";

import { useUIStore } from "../../../stores/ui.store";
import { DataTableEstandar } from "../../utils/datatable-estandar";
import { ModalEstandar } from "../../utils/modal-estandar";
import { useAlmacenes } from "../../../services/almacenes/useAlmacenes";
import { useSolicitudesReabastecimiento } from "../../../services/solicitudes-reabastecimiento/useSolicitudesReabastecimiento";
import type { RES_SolicitudReabastecimiento } from "../service/solicitudes.requests";
import { SolicitudReabastecimientoForm } from "./components/solicitud-reabastecimiento-form";
import { DetalleSolicitudReabastecimiento } from "./components/detalle-solicitud";

const PAGE_SIZE = 35;

export const SolicitudesReabastecimiento = () => {
  const { setTitle } = useUIStore();
  const [, setError] = useState("");
  const [data, setData] = useState<RES_SolicitudReabastecimiento[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [busqueda, setBusqueda] = useState("");

  // Almacén seleccionado (obligatorio para cargar)
  const [almacenId, setAlmacenId] = useState<string | null>(null);
  const [almacenesPropios, setAlmacenesPropios] = useState<
    { id_almacen: number; nombre: string }[]
  >([]);

  const [openedCreate, setOpenedCreate] = useState(false);
  const [openedDetalle, setOpenedDetalle] = useState(false);
  const [selectedSolicitud, setSelectedSolicitud] =
    useState<RES_SolicitudReabastecimiento | null>(null);

  const { listar } = useSolicitudesReabastecimiento({ setError });
  const { listarAlmacenesPropios } = useAlmacenes({ setError: () => {} });

  useEffect(() => {
    setTitle("Solicitudes de Reabastecimiento");
  }, [setTitle]);

  useEffect(() => {
    listarAlmacenesPropios().then((res) => {
      if (res) setAlmacenesPropios(res);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!almacenId) {
      setData([]);
      setLoading(false);
      return;
    }

    let isCancelled = false;
    setLoading(true);

    listar({ id_almacen_solicitante: Number(almacenId) })
      .then((res) => {
        if (!isCancelled && res) setData(res);
      })
      .finally(() => {
        if (!isCancelled) setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [almacenId]);

  const filteredRecords = useMemo(() => {
    const q = busqueda.toLowerCase().trim();
    const source = Array.isArray(data) ? data : [];
    if (!q) return source;
    return source.filter(
      (item) =>
        (item.correlativo || "").toLowerCase().includes(q) ||
        (item.empleado_solicitante || "").toLowerCase().includes(q),
    );
  }, [data, busqueda]);

  const paginatedRecords = useMemo(() => {
    const from = (page - 1) * PAGE_SIZE;
    return filteredRecords.slice(from, from + PAGE_SIZE);
  }, [filteredRecords, page]);

  const columns: DataTableColumn<RES_SolicitudReabastecimiento>[] = useMemo(
    () => [
      {
        accessor: "index",
        title: "#",
        textAlign: "center",
        width: 52,
        render: (_record, index) => (page - 1) * PAGE_SIZE + index + 1,
      },
      {
        accessor: "correlativo",
        title: "Código",
        width: 155,
        render: (item) => (
          <Badge variant="light" color="violet" radius="sm">
            {item.correlativo}
          </Badge>
        ),
      },
      {
        accessor: "premura",
        title: "Prioridad",
        width: 125,
        render: (item) => {
          const colors: Record<string, string> = {
            Normal: "cyan",
            Urgente: "orange",
            Emergencia: "red",
          };
          return (
            <Badge
              color={colors[item.premura] ?? "gray"}
              variant="light"
              radius="sm"
              size="sm"
              className="font-semibold uppercase tracking-wider"
            >
              {item.premura}
            </Badge>
          );
        },
      },
      {
        accessor: "empleado_solicitante",
        title: "Solicitante",
        render: (item) => (
          <Group gap="xs" wrap="nowrap">
            <UserCircleIcon className="w-5 h-5 text-emerald-500 shrink-0" />
            <Text size="sm" className="text-zinc-200 truncate">
              {item.empleado_solicitante}
            </Text>
          </Group>
        ),
      },
      {
        accessor: "fecha_hora_entrega_requerida",
        title: "Programación",
        width: 195,
        render: (item) => {
          const fechaReq =
            item.fecha_hora_entrega_requerida &&
            dayjs(item.fecha_hora_entrega_requerida).isValid()
              ? dayjs(item.fecha_hora_entrega_requerida).format("DD/MM/YYYY")
              : "No especificada";
          return (
            <Stack gap={2}>
              <Group gap={6}>
                <CalendarDaysIcon className="w-4 h-4 text-zinc-500" />
                <Text size="xs" fw={600} className="text-zinc-200">
                  Entrega: {fechaReq}
                </Text>
              </Group>
              <Text size="10px" c="zinc.5" ml={22}>
                Creado: {dayjs(item.created_at).format("DD/MM/YYYY HH:mm")}
              </Text>
            </Stack>
          );
        },
      },
      {
        accessor: "estado",
        title: "Estado",
        width: 130,
        render: (item) => {
          const colors: Record<string, string> = {
            Generada: "blue",
            "En Proceso": "orange",
            Completada: "green",
            Anulada: "red",
            Cerrada: "gray",
          };
          return (
            <Badge
              color={colors[item.estado] ?? "gray"}
              variant="light"
              radius="sm"
              size="sm"
              className="font-semibold uppercase tracking-wider"
            >
              {item.estado}
            </Badge>
          );
        },
      },
      {
        accessor: "acciones",
        title: "Acciones",
        textAlign: "center",
        width: 80,
        render: (item) => (
          <Tooltip label="Ver Detalle" position="top" withArrow>
            <ActionIcon
              variant="filled"
              color="violet"
              radius="md"
              onClick={() => {
                setSelectedSolicitud(item);
                setOpenedDetalle(true);
              }}
              className="shadow-md hover:scale-105 transition-transform"
            >
              <EyeIcon className="w-5 h-5 text-white" />
            </ActionIcon>
          </Tooltip>
        ),
      },
    ],
    [page],
  );

  return (
    <div className="space-y-6 animate-fade-in text-zinc-100">
      {/* Filtros */}
      <div className="flex flex-col lg:flex-row justify-between gap-4 items-end lg:items-center">
        <div className="flex flex-wrap gap-4 flex-1 w-full lg:w-auto">
          <div className="w-full sm:w-64">
            <Select
              data={almacenesPropios.map((a) => ({
                value: String(a.id_almacen),
                label: a.nombre,
              }))}
              value={almacenId}
              onChange={(val) => {
                setAlmacenId(val);
                setPage(1);
                setBusqueda("");
              }}
              placeholder="Seleccione un almacén"
              radius="lg"
              classNames={{
                input:
                  "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500",
              }}
            />
          </div>

          <TextInput
            placeholder="Buscar código o solicitante..."
            leftSection={
              <MagnifyingGlassIcon className="w-4 h-4 text-zinc-400" />
            }
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.currentTarget.value);
              setPage(1);
            }}
            disabled={!almacenId}
            className="flex-1 min-w-[200px]"
            radius="lg"
            classNames={{
              input:
                "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500",
            }}
          />
        </div>

        <Button
          leftSection={<PlusIcon className="w-5 h-5" />}
          onClick={() => setOpenedCreate(true)}
          disabled={!almacenId}
          radius="lg"
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20 border-0 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed w-full lg:w-auto"
        >
          Nueva Solicitud
        </Button>
      </div>

      {/* Listado o placeholder */}
      {!almacenId ? (
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
          <BuildingStorefrontIcon className="w-12 h-12 text-zinc-600 mb-4" />
          <Text className="text-zinc-400 font-medium text-center">
            Seleccione un almacén para visualizar sus solicitudes de
            reabastecimiento.
          </Text>
        </div>
      ) : (
        <DataTableEstandar
          idAccessor="id_solicitud_reabastecimiento"
          columns={columns}
          records={paginatedRecords}
          totalRecords={filteredRecords.length}
          page={page}
          onPageChange={setPage}
          loading={loading}
        />
      )}

      {/* Modal Crear */}
      <ModalEstandar
        opened={openedCreate}
        close={() => setOpenedCreate(false)}
        title="Nueva Solicitud de Reabastecimiento"
        size="70%"
      >
        <SolicitudReabastecimientoForm
          initialAlmacenId={almacenId ? Number(almacenId) : null}
          onSuccess={(nueva) => {
            setData((prev) => [nueva, ...prev]);
            setOpenedCreate(false);
          }}
          onCancel={() => setOpenedCreate(false)}
        />
      </ModalEstandar>

      {/* Modal Detalle */}
      <ModalEstandar
        opened={openedDetalle}
        close={() => {
          setOpenedDetalle(false);
          setSelectedSolicitud(null);
        }}
        title="Detalle de la Solicitud"
        size="80%"
      >
        {selectedSolicitud && (
          <DetalleSolicitudReabastecimiento solicitud={selectedSolicitud} />
        )}
      </ModalEstandar>
    </div>
  );
};
