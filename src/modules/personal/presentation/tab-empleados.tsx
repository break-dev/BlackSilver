import {
  Button,
  Group,
  TextInput,
  Text,
  Badge,
  ActionIcon,
  Select,
  Tooltip,
  Avatar,
  FileButton,
  Stack,
  Loader,
} from "@mantine/core";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilSquareIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import { type DataTableColumn } from "mantine-datatable";
import { useDisclosure } from "@mantine/hooks";

import { DataTableEstandar } from "../../../presentation/utils/datatable-estandar";
import { ModalEstandar } from "../../../presentation/utils/modal-estandar";

import { useEmpleados } from "../hooks/useEmpleados";
import { RegistroEmpleado } from "./registro-empleado";
import type { RES_Empleado } from "../service/empleados.responses";
import { useNotify } from "../../../hooks/useNotify";

export const TabEmpleados = () => {
  const { notifySuccess, notifyError } = useNotify();

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
    actualizarFoto,
    idActualizandoFoto,
  } = useEmpleados();

  const [openedRegistro, { open: openRegistro, close: closeRegistro }] =
    useDisclosure(false);

  const handleUpdateFoto = async (id: number, file: File | null) => {
    if (!file) return;
    const ok = await actualizarFoto(id, file);
    if (ok) {
      notifySuccess("Foto de perfil actualizada correctamente");
    } else {
      notifyError("No se pudo actualizar la foto de perfil");
    }
  };

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
      width: 250,
      render: (r) => {
        const isUpdatingFoto = r.id_empleado === idActualizandoFoto;
        return (
          <Group gap="sm">
            <div className="relative group overflow-hidden rounded-full w-10 h-10 border border-zinc-800">
              {isUpdatingFoto && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-full z-10">
                  <Loader size="xs" color="indigo" />
                </div>
              )}
              <FileButton
                onChange={(file) => handleUpdateFoto(r.id_empleado, file)}
                accept="image/png,image/jpeg,image/jpg"
                disabled={isUpdatingFoto}
              >
                {(props) => (
                  <div
                    {...props}
                    className={`w-full h-full cursor-pointer ${isUpdatingFoto ? "pointer-events-none" : ""}`}
                  >
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
                    {!isUpdatingFoto && (
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <PencilSquareIcon className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                )}
              </FileButton>
            </div>
            <div>
              <Text size="sm" fw={500} className="text-zinc-200">
                {r.nombre} {r.apellido}
              </Text>
              <Text size="11px" className="text-zinc-500 font-mono">
                DNI: {r.dni || "---"}
              </Text>
            </div>
          </Group>
        );
      },
    },
    {
      accessor: "empresa",
      title: "Empresa",
      width: 200,
      render: (r) => (
        <Group gap="xs">
          <BuildingOfficeIcon className="w-4 h-4 text-zinc-500" />
          <Text size="sm" className="text-zinc-300">
            {r.empresa}
          </Text>
        </Group>
      ),
    },
    {
      accessor: "ubicacion",
      title: "Área / Cargo",
      width: 200,
      render: (r) => (
        <Stack gap={4}>
          <Text size="sm" fw={700} className="text-zinc-100 leading-tight">
            {r.cargo}
          </Text>
          <Badge
            variant="light"
            color="indigo"
            radius="sm"
            size="xs"
            className="font-medium w-fit"
          >
            {r.area}
          </Badge>
        </Stack>
      ),
    },
    {
      accessor: "estado",
      title: "Estado",
      textAlign: "center",
      width: 110,
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
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-4 items-end justify-between">
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto flex-1">
          <Select
            label="Filtrar por Empresa"
            placeholder={loadingEmpresas ? "Cargando..." : "(Todas)"}
            data={empresas.map((e) => ({
              value: e.id_empresa.toString(),
              label: e.nombre,
            }))}
            value={idEmpresa?.toString() || null}
            onChange={(val) => setIdEmpresa(val ? Number(val) : null)}
            leftSection={<BuildingOfficeIcon className="w-4 h-4 text-zinc-400" />}
            radius="lg"
            size="sm"
            className="w-full sm:w-64"
            classNames={{
              label: "text-zinc-400 mb-1 font-medium",
              input:
                "bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-500 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 transition-all",
            }}
            disabled={loadingEmpresas}
            searchable
            clearable
          />

          <TextInput
            label="Buscar empleado"
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
              label: "text-zinc-400 mb-1 font-medium",
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
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20 shrink-0 w-full lg:w-auto px-6 h-[38px] mb-[1px]"
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

      <ModalEstandar
        opened={openedRegistro}
        close={closeRegistro}
        title="Registrar Empleado de Empresa"
        size="md"
      >
        <RegistroEmpleado
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
