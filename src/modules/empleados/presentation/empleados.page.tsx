import {
  Button,
  Group,
  TextInput,
  Text,
  Badge,
  ActionIcon,
  Avatar,
  Select,
  Menu,
  FileButton,
  Tooltip,
  Stack,
} from "@mantine/core";
import { useNotify } from "../../../hooks/useNotify";
import {
  MagnifyingGlassIcon,
  InformationCircleIcon,
  PencilSquareIcon,
  PlusIcon,
  EllipsisVerticalIcon,
  TrashIcon,
  PencilIcon,
  MapPinIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import { type DataTableColumn } from "mantine-datatable";
import { useDisclosure } from "@mantine/hooks";

import { useTitlePage } from "../../../hooks/useTitlePage";
import { DataTableEstandar } from "../../../presentation/utils/datatable-estandar";
import { ModalEstandar } from "../../../presentation/utils/modal-estandar";

import { useEmpleados } from "../hooks/useEmpleados";
import { useAsignacionLabores } from "../hooks/useAsignacionLabores";
import { RegistroEmpleado } from "./registro-empleado";
import { AsignacionLabores } from "./asignacion-labores";
import type { RES_Empleado } from "../service/empleados.responses";

export const EmpleadosPage = () => {
  useTitlePage("Personal / Empleados");
  const { notifySuccess, notifyError } = useNotify();

  const {
    minas,
    idMina,
    setIdMina,
    empleados,
    loadingMinas,
    loading,
    busqueda,
    setBusqueda,
    pushNuevoEmpleado,
    actualizarFoto,
    actualizarEmpleadoEnLista,
  } = useEmpleados();

  const asignacion = useAsignacionLabores(actualizarEmpleadoEnLista);

  const handleUpdateFoto = async (id: number, file: File | null) => {
    if (!file) return;
    const ok = await actualizarFoto(id, file);
    if (ok) {
      notifySuccess("Foto de perfil actualizada correctamente");
    } else {
      notifyError("No se pudo actualizar la foto de perfil");
    }
  };

  const [openedRegistro, { open: openRegistro, close: closeRegistro }] =
    useDisclosure(false);

  const columns: DataTableColumn<RES_Empleado>[] = [
    {
      accessor: "index",
      title: "#",
      textAlign: "center",
      width: 50,
      render: (_, index) => index + 1,
    },
    {
      accessor: "empleado",
      title: "Empleado",
      render: (r) => (
        <Group gap="sm">
          <div className="relative group overflow-hidden rounded-full w-10 h-10 border border-zinc-800">
            <FileButton
              onChange={(file) => handleUpdateFoto(r.id_empleado, file)}
              accept="image/png,image/jpeg,image/jpg"
            >
              {(props) => (
                <div {...props} className="cursor-pointer">
                  <Avatar
                    src={r.path_foto}
                    radius="xl"
                    color="indigo"
                    variant="light"
                    className="w-full h-full"
                  >
                    {r.nombre[0]}
                    {r.apellido[0]}
                  </Avatar>
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <PencilIcon className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
            </FileButton>
          </div>
          <div>
            <Text size="sm" fw={500} className="text-zinc-200">
              {r.nombre} {r.apellido}
            </Text>
            <Text size="xs" className="text-zinc-500">
              DNI: {r.dni || "---"}
            </Text>
          </div>
        </Group>
      ),
    },
    {
      accessor: "mina",
      title: "Mina",
      width: 180,
      render: (r) => {
        if (!r.id_mina) {
          return (
            <Badge variant="outline" color="pink" radius="sm" size="sm">
              No aplica
            </Badge>
          );
        }
        return (
          <Group gap={6}>
            <MapPinIcon className="w-4 h-4 text-emerald-400" />
            <Text size="sm" fw={600} className="text-zinc-200">
              {r.mina}
            </Text>
          </Group>
        );
      },
    },
    {
      accessor: "labores_asignadas",
      title: "Labores",
      textAlign: "center",
      render: (r) => {
        if (!r.id_mina) {
          return (
            <Badge variant="outline" color="pink" radius="sm" size="sm">
              No aplica
            </Badge>
          );
        }

        const sinAsignar =
          r.labores_asignadas === "Sin asignar" ||
          r.labores_asignadas === "No aplica";

        return (
          <Group gap={6} justify="center" wrap="nowrap">
            <Stack gap={4} align="center">
              {sinAsignar ? (
                <Badge variant="outline" color="gray" radius="sm" size="sm">
                  Sin asignar
                </Badge>
              ) : (
                r.labores_asignadas.split(" | ").map((lab, idx) => (
                  <Badge
                    key={idx}
                    variant="light"
                    color="cyan"
                    radius="sm"
                    size="sm"
                    className="font-bold font-mono"
                  >
                    {lab}
                  </Badge>
                ))
              )}
            </Stack>
            <Tooltip label="Agregar Labores">
              <ActionIcon
                variant="subtle"
                color="indigo"
                size="sm"
                onClick={() => asignacion.abrir(r)}
              >
                <PlusIcon className="w-4 h-4" />
              </ActionIcon>
            </Tooltip>
          </Group>
        );
      },
    },
    {
      accessor: "ubicacion",
      title: "Área / Cargo",
      render: (r) => (
        <div>
          <Text size="sm" className="text-zinc-200">
            {r.cargo}
          </Text>
          <Text size="xs" className="text-zinc-500">
            {r.area}
          </Text>
        </div>
      ),
    },
    {
      accessor: "estado",
      title: "Estado",
      textAlign: "center",
      render: (r) => (
        <Badge
          variant="light"
          color={r.estado === "Activo" ? "green" : "gray"}
          radius="md"
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
      render: (r) => (
        <Menu shadow="md" width={170} position="left">
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray">
              <EllipsisVerticalIcon className="w-5 h-5" />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown className="bg-zinc-900 border-zinc-800">
            <Menu.Label className="text-zinc-500">Acciones</Menu.Label>
            {r.id_mina && (
              <Menu.Item
                leftSection={<WrenchScrewdriverIcon className="w-4 h-4" />}
                className="text-zinc-300 hover:bg-zinc-800 hover:text-white"
                onClick={() => asignacion.abrir(r)}
              >
                Asignar Labor
              </Menu.Item>
            )}
            <Menu.Item
              leftSection={<PencilSquareIcon className="w-4 h-4" />}
              className="text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              Editar
            </Menu.Item>
            <Menu.Item
              leftSection={<InformationCircleIcon className="w-4 h-4" />}
              className="text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              Información
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
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto flex-1">
          <Select
            placeholder={loadingMinas ? "Cargando..." : "(Todas las minas)"}
            data={minas.map((m) => ({
              value: m.id_mina.toString(),
              label: m.nombre,
            }))}
            value={idMina?.toString() || null}
            onChange={(val) => setIdMina(val ? Number(val) : null)}
            leftSection={<MapPinIcon className="w-4 h-4 text-zinc-400" />}
            radius="lg"
            size="sm"
            className="w-full sm:w-64"
            classNames={{
              input:
                "bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-500 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 transition-all",
            }}
            disabled={loadingMinas}
            searchable
            clearable
          />

          <TextInput
            placeholder="Buscar por nombre, DNI o cargo..."
            leftSection={
              <MagnifyingGlassIcon className="w-4 h-4 text-zinc-400" />
            }
            value={busqueda}
            onChange={(e) => setBusqueda(e.currentTarget.value)}
            radius="lg"
            size="sm"
            className="w-full flex-1"
            classNames={{
              input:
                "bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-500 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 transition-all",
            }}
          />
        </div>

        <Button
          leftSection={<PlusIcon className="w-5 h-5" />}
          onClick={openRegistro}
          radius="lg"
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20 shrink-0 w-full lg:w-auto px-6 h-[38px]"
        >
          Nuevo Empleado
        </Button>
      </div>

      <DataTableEstandar
        idAccessor="id_empleado"
        columns={columns}
        records={empleados}
        loading={loading}
      />

      {/* Modal: Registrar Empleado */}
      <ModalEstandar
        opened={openedRegistro}
        close={closeRegistro}
        title="Registrar Empleado"
        size="md"
      >
        <RegistroEmpleado
          onSuccess={() => {
            pushNuevoEmpleado();
            closeRegistro();
          }}
          onCancel={closeRegistro}
        />
      </ModalEstandar>

      {/* Modal: Asignar Labores */}
      <ModalEstandar
        opened={asignacion.opened}
        close={asignacion.cerrar}
        title="Asignar Labores"
        size="sm"
      >
        {asignacion.empleado && (
          <AsignacionLabores
            empleado={asignacion.empleado}
            laboresDisponibles={asignacion.laboresDisponibles}
            seleccionados={asignacion.seleccionados}
            loading={asignacion.loading}
            loadingLabores={asignacion.loadingLabores}
            onToggle={asignacion.toggleSeleccion}
            onAsignar={asignacion.handleAsignar}
            onCancelar={asignacion.cerrar}
          />
        )}
      </ModalEstandar>
    </div>
  );
};

export default EmpleadosPage;
