import {
  Button,
  Group,
  TextInput,
  Text,
  Badge,
  ActionIcon,
  Tooltip,
  Avatar,
  Select,
  Stack,
  Card,
} from "@mantine/core";
import {
  MagnifyingGlassIcon,
  InformationCircleIcon,
  PencilSquareIcon,
  PlusIcon,
  BuildingOfficeIcon,
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
      accessor: "empleado",
      title: "Empleado",
      render: (r) => (
        <Group gap="sm">
          <Avatar src={r.path_foto} radius="xl">
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
      width: 100,
      textAlign: "right",
      render: () => (
        <Group gap="xs" justify="flex-end">
          <Tooltip label="Editar">
            <ActionIcon variant="light" color="indigo" radius="md">
              <PencilSquareIcon className="w-5 h-5" />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Más información">
            <ActionIcon variant="subtle" color="gray">
              <InformationCircleIcon className="w-5 h-5" />
            </ActionIcon>
          </Tooltip>
        </Group>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <Card
        withBorder
        radius="lg"
        className="bg-zinc-900/30 border-zinc-800 p-6"
      >
        <Stack gap="md">
          <Group align="flex-end" justify="space-between">
            <Stack gap={4} className="flex-1 max-w-sm">
              <Text
                size="xs"
                fw={500}
                className="text-zinc-500 uppercase tracking-wider"
              >
                Filtrar por Empresa
              </Text>
              <Select
                placeholder={
                  loadingEmpresas ? "Cargando..." : "Seleccione una empresa"
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
                classNames={{
                  input:
                    "bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-500",
                }}
                disabled={loadingEmpresas}
                searchable
              />
            </Stack>

            <Button
              variant="filled"
              color="indigo"
              radius="lg"
              onClick={openRegistro}
              leftSection={<PlusIcon className="w-5 h-5" />}
              className="mb-[2px]"
            >
              Nuevo Empleado
            </Button>
          </Group>
        </Stack>
      </Card>

      {idEmpresa ? (
        <Stack gap="md">
          <Group justify="space-between">
            <TextInput
              placeholder="Buscar por nombre, DNI o cargo..."
              leftSection={
                <MagnifyingGlassIcon className="w-4 h-4 text-zinc-400" />
              }
              value={busqueda}
              onChange={(e) => setBusqueda(e.currentTarget.value)}
              radius="lg"
              className="w-full sm:w-80"
              classNames={{
                input:
                  "bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-500",
              }}
            />
          </Group>

          <DataTableEstandar
            idAccessor="id_empleado"
            columns={columns}
            records={empleados}
            loading={loading}
          />
        </Stack>
      ) : (
        <Card
          withBorder
          radius="lg"
          className="bg-zinc-900/20 border-zinc-800 border-dashed py-12"
        >
          <Stack align="center" gap="sm">
            <BuildingOfficeIcon className="w-12 h-12 text-zinc-700" />
            <Text className="text-zinc-500" fw={500}>
              Seleccione una empresa para ver el personal
            </Text>
          </Stack>
        </Card>
      )}

      <ModalEstandar
        opened={openedRegistro}
        close={closeRegistro}
        title="Registrar Nuevo Empleado"
        size="md"
      >
        <RegistroEmpleado
          onSuccess={(nuevo) => {
            pushNuevoEmpleado(nuevo);
            closeRegistro();
          }}
        />
      </ModalEstandar>
    </div>
  );
};

export default EmpleadosPage;
