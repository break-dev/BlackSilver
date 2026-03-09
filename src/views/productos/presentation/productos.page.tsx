import {
  Button,
  Group,
  TextInput,
  Text,
  Badge,
  ActionIcon,
  Tooltip,
  Stack,
  Card,
  ThemeIcon,
} from "@mantine/core";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  CubeIcon,
  PencilSquareIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { type DataTableColumn } from "mantine-datatable";
import { useDisclosure } from "@mantine/hooks";

import { useTitlePage } from "../../../hooks/useTitlePage";
import { DataTableEstandar } from "../../../presentation/utils/datatable-estandar";
import { ModalEstandar } from "../../../presentation/utils/modal-estandar";

import { useProductos } from "../hooks/useProductos";
import { RegistroProducto } from "./registro-producto";
import type { RES_Producto } from "../service/productos.responses";

export const ProductosPage = () => {
  useTitlePage("Inventario / Catálogo de Productos");

  const { productos, loading, busqueda, setBusqueda, pushNuevoProducto } =
    useProductos();

  const [openedRegistro, { open: openRegistro, close: closeRegistro }] =
    useDisclosure(false);

  const columns: DataTableColumn<RES_Producto>[] = [
    {
      accessor: "producto",
      title: "Producto",
      render: (r) => (
        <Group gap="sm">
          <ThemeIcon variant="light" color="indigo" radius="md" size="lg">
            <CubeIcon className="w-5 h-5" />
          </ThemeIcon>
          <div>
            <Text size="sm" fw={500} className="text-zinc-200">
              {r.nombre}
            </Text>
            <Text size="xs" className="text-zinc-500">
              ID: {r.id_producto}
            </Text>
          </div>
        </Group>
      ),
    },
    {
      accessor: "categoria",
      title: "Categoría",
      render: (r) => (
        <Badge variant="dot" color="indigo" size="sm">
          {r.categoria}
        </Badge>
      ),
    },
    {
      accessor: "unidad",
      title: "Unidad Base",
      render: (r) => (
        <Text size="sm" className="text-zinc-400">
          {r.unidad_medida_base} ({r.unidad_medida_abreviatura})
        </Text>
      ),
    },
    {
      accessor: "control",
      title: "Control",
      render: (r) => (
        <Group gap={4}>
          {r.es_fiscalizado && (
            <Badge color="yellow" variant="light" size="xs">
              Fiscalizado
            </Badge>
          )}
          {r.es_perecible && (
            <Badge color="red" variant="light" size="xs">
              Perecible
            </Badge>
          )}
          {!r.es_fiscalizado && !r.es_perecible && (
            <Text size="xs" className="text-zinc-600 italic">
              Estándar
            </Text>
          )}
        </Group>
      ),
    },
    {
      accessor: "stock_minimo",
      title: "Stock Mín.",
      textAlign: "right",
      render: (r) => (
        <Text size="sm" fw={500} className="text-right">
          {(Number(r.stock_minimo) || 0).toFixed(2)}
        </Text>
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
          <Tooltip label="Detalles">
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
        <Group justify="space-between">
          <Stack gap={4}>
            <Text size="xl" fw={700} className="text-white">
              Catálogo de Productos
            </Text>
            <Text size="xs" className="text-zinc-500">
              Gestione los bienes y suministros registrados en el sistema
            </Text>
          </Stack>

          <Button
            variant="filled"
            color="indigo"
            radius="lg"
            onClick={openRegistro}
            leftSection={<PlusIcon className="w-5 h-5" />}
          >
            Nuevo Producto
          </Button>
        </Group>
      </Card>

      <Stack gap="md">
        <Group justify="space-between">
          <TextInput
            placeholder="Buscar por nombre o categoría..."
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
          <Text size="xs" className="text-zinc-500">
            Mostrando {productos.length} productos
          </Text>
        </Group>

        <DataTableEstandar
          idAccessor="id_producto"
          columns={columns}
          records={productos}
          loading={loading}
        />
      </Stack>

      <ModalEstandar
        opened={openedRegistro}
        close={closeRegistro}
        title="Registrar Nuevo Producto"
        size="lg"
      >
        <RegistroProducto
          onSuccess={(nuevo) => {
            pushNuevoProducto(nuevo);
            closeRegistro();
          }}
        />
      </ModalEstandar>
    </div>
  );
};

export default ProductosPage;
