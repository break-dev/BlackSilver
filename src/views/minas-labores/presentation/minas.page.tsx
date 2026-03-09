import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Menu,
  Select,
  TextInput,
  Text,
  Tooltip,
} from "@mantine/core";
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
import { DataTableEstandar } from "../../../presentation/utils/datatable-estandar";
import { ModalEstandar } from "../../../presentation/utils/modal-estandar";
import { RegistroMina } from "./registro-mina";
import { GestionEmpresasMina } from "./gestion-empresas-mina";
import { GestionResponsablesMina } from "./gestion-responsables-mina";
import { GestionLabores } from "../labores/presentation/labores.page";
import { useMinasPage } from "../hooks/useMinasPage";
import type { RES_ResumenMina } from "../service/minas.responses";

const inputClasses = {
  input:
    "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 text-white placeholder:text-zinc-500",
  dropdown: "bg-zinc-900 border-zinc-800",
  option:
    "hover:bg-zinc-800 text-zinc-300 data-[selected]:bg-zinc-700 rounded-md my-0.5",
};

export const MinasPage = () => {
  const {
    concesiones,
    concesionSeleccionada,
    setConcesionSeleccionada,
    minasFiltradas,
    loading,
    busqueda,
    setBusqueda,
    openedCreate,
    openCreate,
    closeCreate,
    openedEmpresas,
    closeEmpresas,
    openedResponsables,
    closeResponsables,
    openedLabores,
    closeLabores,
    selectedMina,
    handleMinaCreada,
    handleOpenEmpresas,
    handleOpenResponsables,
    handleOpenLabores,
    handleResponsableAsignado,
  } = useMinasPage();

  const columns: DataTableColumn<RES_ResumenMina>[] = [
    {
      accessor: "index",
      title: "#",
      textAlign: "center",
      width: 50,
      render: (_, i) => i + 1,
    },
    {
      accessor: "nombre",
      title: "Mina",
      width: 200,
      render: (r) => (
        <Text size="sm" fw={600} className="text-white">
          {r.nombre}
        </Text>
      ),
    },
    {
      accessor: "responsable",
      title: "Responsable",
      width: 220,
      render: (r) => (
        <Group gap="xs">
          {r.responsable ? (
            <>
              <UserCircleIcon className="w-5 h-5 text-emerald-500 shrink-0" />
              <Text size="sm" className="text-zinc-200">
                {r.responsable}
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
              onClick={() => handleOpenResponsables(r)}
            >
              <PencilSquareIcon className="w-4 h-4" />
            </ActionIcon>
          </Tooltip>
        </Group>
      ),
    },
    {
      accessor: "cantidad_empresas_ejecutoras",
      title: "Empresas",
      width: 130,
      textAlign: "center",
      render: (r) => (
        <Group gap={6} justify="center">
          <Badge variant="light" color="indigo" size="sm" radius="sm">
            {r.cantidad_empresas_ejecutoras ?? 0} Ejec.
          </Badge>
          <Tooltip label="Gestionar Empresas">
            <ActionIcon
              size="sm"
              variant="subtle"
              color="indigo"
              onClick={() => handleOpenEmpresas(r)}
            >
              <BriefcaseIcon className="w-4 h-4" />
            </ActionIcon>
          </Tooltip>
        </Group>
      ),
    },
    {
      accessor: "cantidad_labores",
      title: "Labores",
      width: 130,
      textAlign: "center",
      render: (r) => (
        <Group gap={6} justify="center">
          <Badge variant="light" color="cyan" size="sm" radius="sm">
            {r.cantidad_labores ?? 0} Act.
          </Badge>
          <Tooltip label="Ver Labores">
            <ActionIcon
              size="sm"
              variant="subtle"
              color="cyan"
              onClick={() => handleOpenLabores(r)}
            >
              <RectangleStackIcon className="w-4 h-4" />
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
      render: (r) => (
        <Badge
          color={r.estado === "Activo" ? "green" : "red"}
          variant="light"
          size="sm"
        >
          {r.estado}
        </Badge>
      ),
    },
    {
      accessor: "actions",
      title: "",
      width: 60,
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
    <div className="space-y-5 animate-fade-in">
      {/* Selector de concesión */}
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1 max-w-xs">
          <label className="block text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1.5">
            <MapPinIcon className="w-3.5 h-3.5 inline mr-1" />
            Concesión
          </label>
          <Select
            placeholder="Seleccione una concesión"
            data={concesiones.map((c) => ({
              value: String(c.id_concesion),
              label: c.nombre,
            }))}
            value={concesionSeleccionada ? String(concesionSeleccionada) : null}
            onChange={(v) => setConcesionSeleccionada(v ? parseInt(v) : null)}
            searchable
            nothingFoundMessage="Sin concesiones"
            classNames={inputClasses}
            radius="lg"
          />
        </div>

        <div className="flex gap-3 flex-1">
          <TextInput
            placeholder="Buscar mina..."
            leftSection={
              <MagnifyingGlassIcon className="w-4 h-4 text-zinc-400" />
            }
            value={busqueda}
            onChange={(e) => setBusqueda(e.currentTarget.value)}
            className="flex-1 min-w-[180px]"
            radius="lg"
            classNames={inputClasses}
          />
          <Button
            leftSection={<PlusIcon className="w-5 h-5" />}
            onClick={openCreate}
            radius="lg"
            disabled={!concesionSeleccionada}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20 shrink-0"
          >
            Nueva Mina
          </Button>
        </div>
      </div>

      {/* Tabla */}
      <DataTableEstandar
        idAccessor="id_mina"
        columns={columns}
        records={minasFiltradas}
        loading={loading}
      />

      {/* Modal: Nueva Mina */}
      <ModalEstandar
        opened={openedCreate}
        close={closeCreate}
        title="Nueva Mina"
      >
        {concesionSeleccionada && (
          <RegistroMina
            idConcesion={concesionSeleccionada}
            onSuccess={handleMinaCreada}
            onCancel={closeCreate}
          />
        )}
      </ModalEstandar>

      {/* Modal: Empresas Ejecutoras */}
      <ModalEstandar
        opened={openedEmpresas}
        close={closeEmpresas}
        title="Empresas ejecutoras"
      >
        {selectedMina && (
          <GestionEmpresasMina
            idMina={selectedMina.id_mina}
            idConcesion={concesionSeleccionada ?? 0}
          />
        )}
      </ModalEstandar>

      {/* Modal: Responsables */}
      <ModalEstandar
        opened={openedResponsables}
        close={closeResponsables}
        title="Responsables de Mina"
      >
        {selectedMina && (
          <GestionResponsablesMina
            mina={selectedMina}
            onResponsableAsignado={(nombre) =>
              handleResponsableAsignado(selectedMina.id_mina, nombre)
            }
          />
        )}
      </ModalEstandar>

      {/* Modal: Labores */}
      <ModalEstandar
        opened={openedLabores}
        close={closeLabores}
        title="Labores"
        size="80%"
      >
        {selectedMina && <GestionLabores mina={selectedMina} />}
      </ModalEstandar>
    </div>
  );
};

export default MinasPage;
