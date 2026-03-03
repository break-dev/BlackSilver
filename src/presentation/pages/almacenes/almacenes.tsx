import { useState, useMemo, useEffect } from "react";
import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Menu,
  TextInput,
  Text,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  TrashIcon,
  PencilSquareIcon,
  EllipsisVerticalIcon,
  BuildingStorefrontIcon,
  UserCircleIcon,
  RectangleStackIcon,
} from "@heroicons/react/24/outline";
import { type DataTableColumn } from "mantine-datatable";
import { useUIStore } from "../../../stores/ui.store";
import { DataTableEstandar } from "../../utils/datatable-estandar";
import { ModalEstandar } from "../../utils/modal-estandar";
import { RegistroAlmacen } from "./components/registro-almacen";
import { GestionResponsables } from "./components/gestion-responsables";
import { AsignarMinaAlmacen } from "./components/asignar-mina-almacen";
import { useAlmacenes } from "../../../services/almacenes/useAlmacenes";
import type { RES_Almacen } from "../../../services/almacenes/dtos/responses";
import { PAGE_SIZE } from "../../constants";

export const AlmacenesPage = () => {
  const setTitle = useUIStore((state) => state.setTitle);

  // Estado local
  const [almacenes, setAlmacenes] = useState<RES_Almacen[]>([]);
  const [loading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  // Filtros
  const [busqueda, setBusqueda] = useState("");

  // Modales
  const [openedCreate, { open: openCreate, close: closeCreate }] =
    useDisclosure(false);
  const [
    openedResponsables,
    { open: openResponsables, close: closeResponsables },
  ] = useDisclosure(false);
  const [openedAlcance, { open: openAlcance, close: closeAlcance }] =
    useDisclosure(false);

  // Selección
  const [selectedAlmacen, setSelectedAlmacen] = useState<RES_Almacen | null>(
    null,
  );

  // Servicio
  const { listar } = useAlmacenes({ setError });

  // Carga inicial
  useEffect(() => {
    let cancelled = false;
    listar()
      .then((data) => {
        if (!cancelled) setAlmacenes(data || []);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Title
  useEffect(() => {
    setTimeout(() => {
      setTitle("Almacenes");
    }, 0);
  }, [setTitle]);

  // Datos filtrados
  const almacenesFiltrados = useMemo(() => {
    return almacenes.filter((alm) => {
      const matchBusqueda =
        !busqueda ||
        alm.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        (alm.responsable_actual || "")
          .toLowerCase()
          .includes(busqueda.toLowerCase());

      return matchBusqueda;
    });
  }, [almacenes, busqueda]);

  // Paginación
  const registrosPaginados = useMemo(() => {
    const inicio = (page - 1) * PAGE_SIZE;
    return almacenesFiltrados.slice(inicio, inicio + PAGE_SIZE);
  }, [almacenesFiltrados, page]);

  // Callback al registrar exitosamente
  const handleRegistroExitoso = (nuevoAlmacen: RES_Almacen) => {
    closeCreate();
    setAlmacenes((prev) => [nuevoAlmacen, ...prev]);
  };

  const isPrincipal = (val: boolean | number) => val === true || val === 1;

  const columns: DataTableColumn<RES_Almacen>[] = [
    {
      accessor: "index",
      title: "#",
      textAlign: "center",
      width: 50,
      render: (_record, index) => (page - 1) * PAGE_SIZE + index + 1,
    },
    {
      accessor: "nombre",
      title: "Almacén",
      width: 250,
      render: (record) => (
        <Group gap="xs">
          <BuildingStorefrontIcon className="w-5 h-5 text-zinc-500" />
          <div>
            <Text size="sm" fw={500} className="text-zinc-200">
              {record.nombre}
            </Text>
            {isPrincipal(record.es_principal) && (
              <Badge size="xs" variant="light" color="pink">
                Principal
              </Badge>
            )}
          </div>
        </Group>
      ),
    },
    {
      accessor: "minas_count",
      title: "Minas",
      width: 130,
      textAlign: "center",
      render: (record) => (
        <Group gap={6} justify="center">
          <Badge variant="light" color="cyan" size="sm" radius="sm">
            {record.minas_count || 0} Minas
          </Badge>

          <Tooltip label="Ver Minas">
            <ActionIcon
              variant="subtle"
              color="cyan"
              size="sm"
              onClick={() => {
                setSelectedAlmacen(record);
                openAlcance();
              }}
            >
              <RectangleStackIcon className="w-4 h-4" />
            </ActionIcon>
          </Tooltip>
        </Group>
      ),
    },
    {
      accessor: "responsable_actual",
      title: "Responsable",
      width: 200,
      render: (record) => (
        <Group gap="xs">
          {record.responsable_actual ? (
            <>
              <UserCircleIcon className="w-5 h-5 text-emerald-500" />
              <Text size="sm" className="text-zinc-200">
                {record.responsable_actual}
              </Text>
            </>
          ) : (
            <Badge variant="outline" color="gray" size="sm">
              Sin Asignar
            </Badge>
          )}

          <ActionIcon
            variant="subtle"
            color="gray"
            size="sm"
            onClick={() => {
              setSelectedAlmacen(record);
              openResponsables();
            }}
            title="Gestionar Responsable"
          >
            <PencilSquareIcon className="w-4 h-4" />
          </ActionIcon>
        </Group>
      ),
    },
    {
      accessor: "estado",
      title: "Estado",
      textAlign: "center",
      width: 100,
      render: (record) => (
        <Badge
          color={record.estado === "Activo" ? "green" : "red"}
          variant="light"
          radius="sm"
          size="sm"
        >
          {record.estado}
        </Badge>
      ),
    },
    {
      accessor: "actions",
      title: "",
      width: 80,
      textAlign: "right",
      render: () => (
        <Menu shadow="md" width={150} position="left">
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray">
              <EllipsisVerticalIcon className="w-5 h-5" />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown className="bg-zinc-900 border-zinc-800">
            <Menu.Label className="text-zinc-500">Acciones</Menu.Label>
            <Menu.Item
              leftSection={<PencilSquareIcon className="w-4 h-4" />}
              className="text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              Editar
            </Menu.Item>
            <Menu.Item
              leftSection={<TrashIcon className="w-4 h-4" />}
              color="red"
              className="hover:bg-red-900/20"
            >
              Eliminar
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Encabezado y Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-4 flex-1">
          <TextInput
            placeholder="Buscar por nombre o responsable..."
            leftSection={
              <MagnifyingGlassIcon className="w-4 h-4 text-zinc-400" />
            }
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.currentTarget.value);
              setPage(1);
            }}
            className="flex-1 min-w-64"
            radius="lg"
            size="sm"
            classNames={{
              input: `bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 
            focus:ring-zinc-300 text-white placeholder:text-zinc-500`,
            }}
          />
        </div>

        <Button
          leftSection={<PlusIcon className="w-5 h-5" />}
          onClick={openCreate}
          radius="lg"
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20 shrink-0"
        >
          Nuevo Almacén
        </Button>
      </div>

      {/* DataTable */}
      <DataTableEstandar
        idAccessor="id_almacen"
        columns={columns}
        records={registrosPaginados}
        totalRecords={almacenesFiltrados.length}
        page={page}
        onPageChange={setPage}
        loading={loading}
      />

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      {/* Modal: Crear Almacén */}
      <ModalEstandar
        opened={openedCreate}
        close={closeCreate}
        title="Nuevo Almacén"
      >
        <RegistroAlmacen
          onSuccess={handleRegistroExitoso}
          onCancel={closeCreate}
        />
      </ModalEstandar>

      {/* Modal: Gestionar Responsables */}
      <ModalEstandar
        opened={openedResponsables}
        close={closeResponsables}
        title="Gestión de Responsables"
      >
        {selectedAlmacen && (
          <GestionResponsables
            idAlmacen={selectedAlmacen.id_almacen}
            nombreAlmacen={selectedAlmacen.nombre}
          />
        )}
      </ModalEstandar>

      {/* Modal: Gestionar Alcance */}
      <ModalEstandar
        opened={openedAlcance}
        close={closeAlcance}
        title="Gestión de Minas"
      >
        {selectedAlmacen && (
          <AsignarMinaAlmacen
            idAlmacen={selectedAlmacen.id_almacen}
            nombreAlmacen={selectedAlmacen.nombre}
          />
        )}
      </ModalEstandar>
    </div>
  );
};

export default AlmacenesPage;
