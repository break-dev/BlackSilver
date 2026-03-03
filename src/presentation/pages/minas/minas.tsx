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
  MapPinIcon,
  BriefcaseIcon,
  RectangleStackIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { type DataTableColumn } from "mantine-datatable";
import { useEffect, useState, useMemo } from "react";
import { useUIStore } from "../../../stores/ui.store";
import { DataTableEstandar } from "../../utils/datatable-estandar";
import { ModalEstandar } from "../../utils/modal-estandar";
import { RegistroMina } from "./components/registro-mina";
import { GestionLabores } from "../labores/labores";
import { GestionEmpresasMina } from "./components/gestion-empresas-mina";
import { GestionResponsablesMina } from "./components/gestion-responsables-mina";
import { useMinas } from "../../../services/minas/useMinas";
import type { RES_Mina } from "../../../services/minas/dtos/responses";
import { PAGE_SIZE } from "../../constants";

export const MinasPage = () => {
  const setTitle = useUIStore((state) => state.setTitle);

  // Modals
  const [openedCreate, { open: openCreate, close: closeCreate }] =
    useDisclosure(false);

  // Gestión Labores Modal
  const [openedLabores, { open: openLabores, close: closeLabores }] =
    useDisclosure(false);

  // Gestión Empresas Modal
  const [openedEmpresas, { open: openEmpresas, close: closeEmpresas }] =
    useDisclosure(false);

  // Gestión Responsables Modal
  const [
    openedResponsables,
    { open: openResponsables, close: closeResponsables },
  ] = useDisclosure(false);

  const [selectedMina, setSelectedMina] = useState<RES_Mina | null>(null);

  // Data
  const [minas, setMinas] = useState<RES_Mina[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState("");
  const [page, setPage] = useState(1);

  // Filter States
  const [busqueda, setBusqueda] = useState("");

  // Hooks
  const { listar } = useMinas({ setError });

  // Load Data
  const cargarDatos = async () => {
    setLoading(true);
    const data = await listar();
    if (data) setMinas(data);
    setLoading(false);
  };

  // Initial Load
  useEffect(() => {
    setTitle("Minas y Labores");
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Derived Filters
  const filteredRecords = useMemo(() => {
    return minas.filter((m) => {
      const term = busqueda.toLowerCase();
      return (
        !busqueda ||
        m.nombre.toLowerCase().includes(term) ||
        (m.concesion || "").toLowerCase().includes(term)
      );
    });
  }, [minas, busqueda]);

  const paginatedRecords = useMemo(() => {
    const from = (page - 1) * PAGE_SIZE;
    return filteredRecords.slice(from, from + PAGE_SIZE);
  }, [filteredRecords, page]);

  // Handlers
  const handleSuccessCreate = (nuevaMina: RES_Mina) => {
    closeCreate();
    setMinas((prev) => [nuevaMina, ...prev]);
  };

  const handleOpenLabores = (mina: RES_Mina) => {
    setSelectedMina(mina);
    openLabores();
  };

  const handleOpenEmpresas = (mina: RES_Mina) => {
    setSelectedMina(mina);
    openEmpresas();
  };

  const handleOpenResponsables = (mina: RES_Mina) => {
    setSelectedMina(mina);
    openResponsables();
  };

  // Columns
  const columns: DataTableColumn<RES_Mina>[] = [
    {
      accessor: "index",
      title: "#",
      textAlign: "center",
      width: 50,
      render: (_, index) => (page - 1) * PAGE_SIZE + index + 1,
    },
    {
      accessor: "nombre",
      title: "Mina",
      width: 200,
      render: (record) => (
        <Text size="sm" fw={600} className="text-white">
          {record.nombre}
        </Text>
      ),
    },
    {
      accessor: "concesion",
      title: "Concesión",
      width: 200,
      render: (record) => (
        <div className="flex items-center gap-1.5 text-zinc-300 text-sm">
          <MapPinIcon className="w-4 h-4 text-zinc-500" />
          <span>{record.concesion || "Sin Concesión"}</span>
        </div>
      ),
    },
    {
      accessor: "labores_count",
      title: "Labores",
      width: 130,
      textAlign: "center",
      render: (record) => (
        <Group gap={6} justify="center">
          <Badge variant="light" color="cyan" size="sm" radius="sm">
            {record.labores_count || 0} Asign.
          </Badge>
          <Tooltip label="Ver Labores">
            <ActionIcon
              size="sm"
              variant="subtle"
              color="cyan"
              onClick={() => handleOpenLabores(record)}
            >
              <RectangleStackIcon className="w-4 h-4" />
            </ActionIcon>
          </Tooltip>
        </Group>
      ),
    },
    {
      accessor: "responsable",
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

          <Tooltip label="Gestionar Responsable">
            <ActionIcon
              variant="subtle"
              color="gray"
              size="sm"
              onClick={() => handleOpenResponsables(record)}
            >
              <PencilSquareIcon className="w-4 h-4" />
            </ActionIcon>
          </Tooltip>
        </Group>
      ),
    },
    {
      accessor: "empresas_count",
      title: "Empresas",
      width: 130,
      textAlign: "center",
      render: (record) => (
        <Group gap={6} justify="center">
          <Badge variant="light" color="indigo" size="sm" radius="sm">
            {record.empresas_count || 0} Asign.
          </Badge>
          <Tooltip label="Gestionar Empresas">
            <ActionIcon
              size="sm"
              variant="subtle"
              color="indigo"
              onClick={() => handleOpenEmpresas(record)}
            >
              <BriefcaseIcon className="w-4 h-4" />
            </ActionIcon>
          </Tooltip>
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
      {/* Cabecera y Filtros */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-end sm:items-center">
        <div className="flex gap-4 flex-1 w-full sm:w-auto">
          <TextInput
            placeholder="Buscar por nombre o concesión..."
            leftSection={
              <MagnifyingGlassIcon className="w-4 h-4 text-zinc-400" />
            }
            value={busqueda}
            onChange={(e) => setBusqueda(e.currentTarget.value)}
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
          onClick={openCreate}
          radius="lg"
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20"
        >
          Nueva Mina
        </Button>
      </div>

      {/* Tabla */}
      <DataTableEstandar
        idAccessor="id_mina"
        columns={columns}
        records={paginatedRecords}
        totalRecords={filteredRecords.length}
        page={page}
        onPageChange={setPage}
        loading={loading}
      />

      {/* Modal: Crear Mina */}
      <ModalEstandar
        opened={openedCreate}
        close={closeCreate}
        title="Nueva Mina"
      >
        <RegistroMina onSuccess={handleSuccessCreate} onCancel={closeCreate} />
      </ModalEstandar>

      {/* Modal: Gestión de Labores */}
      <ModalEstandar
        opened={openedLabores}
        close={closeLabores}
        title="Gestión de Labores"
        size="80%"
      >
        {selectedMina ? (
          <GestionLabores
            idMina={selectedMina.id_mina}
            nombreMina={selectedMina.nombre}
          />
        ) : null}
      </ModalEstandar>

      {/* Modal: Gestión de Empresas */}
      <ModalEstandar
        opened={openedEmpresas}
        close={closeEmpresas}
        title="Empresas ejecutoras"
      >
        {selectedMina ? (
          <GestionEmpresasMina
            idMina={selectedMina.id_mina}
            idConcesion={selectedMina.id_concesion} // Required for filtering valid contracts
            nombreMina={selectedMina.nombre}
          />
        ) : null}
      </ModalEstandar>

      {/* Modal: Gestión de Responsables */}
      <ModalEstandar
        opened={openedResponsables}
        close={closeResponsables}
        title="Responsables de Mina"
      >
        {selectedMina ? (
          <GestionResponsablesMina
            idMina={selectedMina.id_mina}
            nombreMina={selectedMina.nombre}
            onResponsableChange={(nuevo) => {
              setMinas((prev) =>
                prev.map((m) =>
                  m.id_mina === selectedMina.id_mina
                    ? {
                        ...m,
                        responsable_actual:
                          `${nuevo.apellidos} ${nuevo.nombres}`.trim(),
                      }
                    : m,
                ),
              );
            }}
          />
        ) : null}
      </ModalEstandar>
    </div>
  );
};

export default MinasPage;
