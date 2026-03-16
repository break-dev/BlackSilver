import {
  ActionIcon,
  Badge,
  Button,
  Group,
  TextInput,
  Text,
  Menu,
} from "@mantine/core";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  TrashIcon,
  PencilSquareIcon,
  EllipsisVerticalIcon,
  BuildingOffice2Icon,
} from "@heroicons/react/24/outline";
import { type DataTableColumn } from "mantine-datatable";
import { useTitlePage } from "../../../hooks/useTitlePage";
import { DataTableEstandar } from "../../../presentation/utils/datatable-estandar";
import { ModalEstandar } from "../../../presentation/utils/modal-estandar";
import { RegistroEmpresa } from "./registro-empresa";
import { useEmpresas } from "../hooks/useEmpresas";
import { useRegistroEmpresa } from "../hooks/useRegistroEmpresa";
import type { RES_Empresa } from "../service/empresas.responses";

export const EmpresasPage = () => {
  useTitlePage("Empresas");

  const {
    loading,
    busqueda,
    setBusqueda,
    empresasFiltradas,
    openedCreate,
    openCreate,
    closeCreate,
    onEmpresaCreada,
  } = useEmpresas();

  const registro = useRegistroEmpresa({
    onSuccess: onEmpresaCreada,
    onClose: closeCreate,
  });

  const columns: DataTableColumn<RES_Empresa>[] = [
    {
      accessor: "index",
      title: "#",
      textAlign: "center",
      width: 50,
      render: (_, index) => index + 1,
    },
    {
      accessor: "nombre_comercial",
      title: "Empresa",
      width: 250,
      render: (record) => {
        return (
          <Group gap="xs">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${record.path_logo
                  ? "bg-indigo-600/10 border-indigo-500/30 overflow-hidden shadow-inner"
                  : "bg-zinc-800/50 border-zinc-700/50"
                }`}
            >
              {record.path_logo ? (
                <img 
                  src={record.path_logo} 
                  alt={record.nombre_comercial} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <BuildingOffice2Icon className="w-5 h-5 text-zinc-500" />
              )}
            </div>
            <div>
              <Text size="sm" fw={500} className="text-zinc-200">
                {record.nombre_comercial}
              </Text>
              <Text size="xs" className="text-zinc-500">
                {record.razon_social}
              </Text>
            </div>
          </Group>
        );
      },
    },
    {
      accessor: "ruc",
      title: "RUC",
      width: 150,
      render: (record) => (
        <Text size="sm" className="text-zinc-400 font-mono">
          {record.ruc}
        </Text>
      ),
    },
    {
      accessor: "abreviatura",
      title: "Abrev.",
      width: 100,
      render: (record) => (
        <Badge variant="light" color="cyan" size="sm" radius="sm">
          {record.abreviatura || "-"}
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
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <TextInput
          placeholder="Buscar empresas por nombre o RUC..."
          leftSection={
            <MagnifyingGlassIcon className="w-4 h-4 text-zinc-400" />
          }
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.currentTarget.value);
          }}
          className="flex-1 min-w-64"
          radius="lg"
          size="sm"
          classNames={{
            input:
              "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500",
          }}
        />
        <Button
          leftSection={<PlusIcon className="w-5 h-5" />}
          onClick={openCreate}
          radius="lg"
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20 shrink-0"
        >
          Nueva Empresa
        </Button>
      </div>

      <DataTableEstandar
        idAccessor="id_empresa"
        columns={columns}
        records={empresasFiltradas}
        loading={loading}
      />

      <ModalEstandar
        opened={openedCreate}
        close={closeCreate}
        title="Registrar Empresa"
      >
        <RegistroEmpresa
          ruc={registro.ruc}
          setRuc={registro.setRuc}
          razonSocial={registro.razonSocial}
          setRazonSocial={registro.setRazonSocial}
          nombreComercial={registro.nombreComercial}
          setNombreComercial={registro.setNombreComercial}
          abreviatura={registro.abreviatura}
          setAbreviatura={registro.setAbreviatura}
          logoFile={registro.logoFile}
          setLogoFile={registro.setLogoFile}
          error={registro.error}
          loading={registro.loading}
          onSave={registro.handleGuardar}
          onCancel={() => {
            closeCreate();
            registro.reset();
          }}
        />
      </ModalEstandar>
    </div>
  );
};

export default EmpresasPage;
