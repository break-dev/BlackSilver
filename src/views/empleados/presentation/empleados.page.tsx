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
} from "@mantine/core";
import {
  MagnifyingGlassIcon,
  InformationCircleIcon,
  PencilSquareIcon,
  PlusIcon,
  BuildingOfficeIcon,
  EllipsisVerticalIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { type DataTableColumn } from "mantine-datatable";
import { useDisclosure } from "@mantine/hooks";

import { useTitlePage } from "../../../hooks/useTitlePage";
import { DataTableEstandar } from "../../../presentation/utils/datatable-estandar";
import { ModalEstandar } from "../../../presentation/utils/modal-estandar";

import { useEmpleados } from "../hooks/useEmpleados";
import { RegistroEmpleado } from "./registro-empleado";
import type { RES_Empleado } from "../service/empleados.responses";

export const EmpleadosPage = () => {
  useTitlePage("Personal / Empleados");

  const {
    empresas,
    idEmpresa,
    setIdEmpresa,
    empleados,
    loadingEmpresas,
    loading,
    busqueda,
    setBusqueda,
    pushNuevoEmpleado,
  } = useEmpleados();

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
          <Avatar src={r.path_foto} radius="xl" color="cyan" variant="light">
            {r.nombre[0]}
            {r.apellido[0]}
          </Avatar>
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
      {/* Header — Estilo unificado */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto flex-1">
          <Select
            placeholder={
              loadingEmpresas ? "Cargando..." : "Filtrar por empresa..."
            }
            data={empresas.map((e) => ({
              value: e.id_empresa.toString(),
              label: e.nombre_comercial,
            }))}
            value={idEmpresa?.toString() || null}
            onChange={(val) => setIdEmpresa(val ? Number(val) : null)}
            leftSection={
              <BuildingOfficeIcon className="w-4 h-4 text-zinc-400" />
            }
            radius="lg"
            size="sm"
            className="w-full sm:w-64"
            classNames={{
              input:
                "bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-500 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 transition-all",
            }}
            disabled={loadingEmpresas}
            searchable
          />

          {idEmpresa && (
            <TextInput
              placeholder="Buscar por nombre, DNI o cargo..."
              leftSection={
                <MagnifyingGlassIcon className="w-4 h-4 text-zinc-400" />
              }
              value={busqueda}
              onChange={(e) => setBusqueda(e.currentTarget.value)}
              radius="lg"
              size="sm"
              className="w-full sm:w-80"
              classNames={{
                input:
                  "bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-500 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 transition-all",
              }}
            />
          )}
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

      {idEmpresa ? (
        <DataTableEstandar
          idAccessor="id_empleado"
          columns={columns}
          records={empleados}
          loading={loading}
        />
      ) : (
        <div className="py-10 flex flex-col items-center justify-center border-2 border-dashed border-zinc-800/60 rounded-2xl">
          <div className="w-12 h-12 rounded-2xl bg-zinc-800/50 border border-zinc-700 flex items-center justify-center mb-3">
            <BuildingOfficeIcon className="w-6 h-6 text-zinc-600" />
          </div>
          <Text size="sm" className="text-zinc-500">
            Sin empresa asignada
          </Text>
          <Text size="xs" className="text-zinc-600 mt-0.5">
            Seleccione una empresa para ver el personal
          </Text>
        </div>
      )}

      <ModalEstandar
        opened={openedRegistro}
        close={closeRegistro}
        title="Registrar Empleado"
        size="md"
      >
        <RegistroEmpleado
          idEmpresaDefault={idEmpresa}
          onSuccess={(nuevo) => {
            pushNuevoEmpleado(nuevo);
            closeRegistro();
          }}
          onCancel={closeRegistro}
        />
      </ModalEstandar>
    </div>
  );
};

export default EmpleadosPage;
