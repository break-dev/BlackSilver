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
  TagIcon,
} from "@heroicons/react/24/outline";
import { type DataTableColumn } from "mantine-datatable";
import { useTitlePage } from "../../../hooks/useTitlePage";
import { DataTableEstandar } from "../../../presentation/utils/datatable-estandar";
import { ModalEstandar } from "../../../presentation/utils/modal-estandar";
import { RegistroCategoria } from "./registro-categoria";
import { useCategorias } from "../hooks/useCategorias";
import { useRegistroCategoria } from "../hooks/useRegistroCategoria";
import type { RES_Categoria } from "../service/categorias.responses";

export const CategoriasPage = () => {
  useTitlePage("Categorías");

  const {
    loading,
    busqueda,
    setBusqueda,
    categoriasFiltradas,
    openedCreate,
    openCreate,
    closeCreate,
    onCategoriaCreada,
  } = useCategorias();

  const registro = useRegistroCategoria({
    onSuccess: onCategoriaCreada,
    onClose: closeCreate,
  });

  const columns: DataTableColumn<RES_Categoria>[] = [
    {
      accessor: "index",
      title: "#",
      textAlign: "center",
      width: 50,
      render: (_, index) => index + 1,
    },
    {
      accessor: "nombre",
      title: "Categoría",
      width: 280,
      render: (record) => (
        <Group gap="xs">
          <TagIcon className="w-5 h-5 text-zinc-500" />
          <div>
            <Text size="sm" fw={500} className="text-zinc-200">
              {record.nombre}
            </Text>
            {record.tipo_requerimiento && (
              <Badge size="xs" variant="light" color="indigo">
                {record.tipo_requerimiento}
              </Badge>
            )}
          </div>
        </Group>
      ),
    },
    {
      accessor: "clasificacion_bien",
      title: "Clasificación",
      width: 200,
      render: (record) => (
        <Text size="sm" className="text-zinc-400">
          {record.clasificacion_bien || "-"}
        </Text>
      ),
    },
    {
      accessor: "descripcion",
      title: "Descripción",
      render: (record) => (
        <Text size="sm" className="text-zinc-400 truncate max-w-xs">
          {record.descripcion || "-"}
        </Text>
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
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <TextInput
          placeholder="Buscar categorías..."
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
          Nueva Categoría
        </Button>
      </div>

      <DataTableEstandar
        idAccessor="id_categoria"
        columns={columns}
        records={categoriasFiltradas}
        loading={loading}
      />

      <ModalEstandar
        opened={openedCreate}
        close={closeCreate}
        title="Nueva Categoría"
      >
        <RegistroCategoria
          nombre={registro.nombre}
          setNombre={registro.setNombre}
          descripcion={registro.descripcion}
          setDescripcion={registro.setDescripcion}
          tipoRequerimiento={registro.tipoRequerimiento}
          setTipoRequerimiento={registro.setTipoRequerimiento}
          clasificacionBien={registro.clasificacionBien}
          setClasificacionBien={registro.setClasificacionBien}
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

export default CategoriasPage;
