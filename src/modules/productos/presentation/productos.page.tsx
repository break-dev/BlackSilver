import {
  Button,
  Group,
  TextInput,
  Text,
  Badge,
  Stack,
  ThemeIcon,
} from "@mantine/core";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";
import { type DataTableColumn } from "mantine-datatable";
import { useDisclosure } from "@mantine/hooks";
import { useTitlePage } from "../../../hooks/useTitlePage";
import { DataTableEstandar } from "../../../presentation/utils/datatable-estandar";
import { ModalEstandar } from "../../../presentation/utils/modal-estandar";
import { useProductos } from "../hooks/useProductos";
import { RegistroProducto } from "./registro-producto";
import type { RES_Producto } from "../service/productos.responses";
import { formatNumber } from "../../../shared/functions/formatNumber";
import { enPlural } from "../../../shared/functions/en-plural";

export const ProductosPage = () => {
  useTitlePage("Catálogo de Productos");

  const { productos, loading, busqueda, setBusqueda, pushNuevoProducto } =
    useProductos();

  const [openedRegistro, { open: openRegistro, close: closeRegistro }] =
    useDisclosure(false);

  const columns: DataTableColumn<RES_Producto>[] = [
    {
      accessor: "index",
      title: "#",
      textAlign: "center",
      width: 50,
      render: (_, index) => index + 1,
    },
    {
      accessor: "producto",
      title: "Producto",
      render: (r) => (
        <Group gap="sm">
          <ThemeIcon variant="light" color="indigo" radius="md" size="lg">
            <CubeIcon className="w-5 h-5" />
          </ThemeIcon>
          <Text size="sm" fw={500} className="text-zinc-200">
            {r.nombre}
          </Text>
        </Group>
      ),
    },
    {
      accessor: "categoria",
      title: "Categoría",
      render: (r) => (
        <Text size="sm" className="text-zinc-300">
          {r.categoria}
        </Text>
      ),
    },
    {
      accessor: "vencimiento",
      title: "Plazo Alerta Venc.",
      render: (r) => {
        if (!r.es_perecible) {
          return (
            <Text size="sm" className="text-zinc-500 italic">
              No aplica
            </Text>
          );
        }

        if (r.es_perecible && !r.dias_espera_vencimiento) {
          return (
            <Text size="sm" className="text-zinc-500 italic">
              No especificado
            </Text>
          );
        }

        return (
          <Text size="sm" className="text-zinc-300">
            {r.dias_espera_vencimiento} días
          </Text>
        );
      },
    },
    {
      accessor: "stock_minimo_base",
      title: "Stock Mín.",
      textAlign: "center",
      render: (r) => (
        <div className="flex flex-row gap-2 justify-center items-center">
          <Text size="sm" fw={500} className="text-zinc-300">
            {formatNumber(r.stock_minimo_base)}
          </Text>
          <Badge size="sm" className="text-zinc-500">
            {enPlural(r.unidad_medida_base, r.stock_minimo_base)}
          </Badge>
        </div>
      ),
    },
    {
      accessor: "costo_promedio_base",
      title: "Costo Promedio",
      textAlign: "center",
      render: (r) => (
        <Text size="sm" fw={600} className="text-zinc-200">
          S/. {formatNumber(r.costo_promedio_base)}
        </Text>
      ),
    },
    {
      accessor: "indicadores",
      title: "Indicadores",
      textAlign: "center",
      render: (r) => (
        <div className="flex flex-row gap-2 justify-center items-center">
          {r.es_auditable == true && (
            <Badge color="yellow" variant="light" size="xs">
              Auditable
            </Badge>
          )}
          {r.es_perecible == true && (
            <Badge color="red" variant="light" size="xs">
              Perecible
            </Badge>
          )}
          {r.es_auditable == false && r.es_perecible == false && (
            <Text size="xs" className="text-zinc-600 italic">
              Ninguno
            </Text>
          )}
        </div>
      ),
    },
    {
      accessor: "estado",
      title: "Estado",
      width: 100,
      render: (r) => (
        <Badge
          color={r.estado === "Activo" ? "green" : "gray"}
          variant="light"
          size="sm"
        >
          {r.estado}
        </Badge>
      ),
    },
    // {
    //   accessor: "actions",
    //   title: "",
    //   width: 80,
    //   textAlign: "right",
    //   render: () => (
    //     <Menu shadow="md" width={150} position="left">
    //       <Menu.Target>
    //         <ActionIcon variant="subtle" color="gray">
    //           <EllipsisVerticalIcon className="w-5 h-5" />
    //         </ActionIcon>
    //       </Menu.Target>
    //       <Menu.Dropdown className="bg-zinc-900 border-zinc-800">
    //         <Menu.Label className="text-zinc-500">Acciones</Menu.Label>
    //         <Menu.Item
    //           leftSection={<PencilSquareIcon className="w-4 h-4" />}
    //           className="text-zinc-300 hover:bg-zinc-800 hover:text-white"
    //         >
    //           Editar
    //         </Menu.Item>
    //         <Menu.Item
    //           leftSection={<TrashIcon className="w-4 h-4" />}
    //           color="red"
    //           className="hover:bg-red-900/20"
    //         >
    //           Eliminar
    //         </Menu.Item>
    //       </Menu.Dropdown>
    //     </Menu>
    //   ),
    // },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <Stack gap="lg">
        <div className="flex flex-col sm:flex-row gap-4 items-end justify-between">
          <div className="flex-1 gap-4 w-full">
            <TextInput
              label="Buscar Producto"
              placeholder="Buscar por nombre o categoría..."
              leftSection={
                <MagnifyingGlassIcon className="w-4 h-4 text-zinc-400" />
              }
              value={busqueda}
              onChange={(e) => setBusqueda(e.currentTarget.value)}
              className="flex-1 min-w-64"
              radius="lg"
              size="sm"
              classNames={{
                input:
                  "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500",
                label: "text-zinc-400 text-xs font-semibold mb-1 ml-1",
              }}
            />
          </div>
          <Button
            leftSection={<PlusIcon className="w-5 h-5" />}
            onClick={openRegistro}
            radius="lg"
            size="sm"
            loading={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20 shrink-0 px-6 font-semibold h-[38px]"
          >
            Nuevo Producto
          </Button>
        </div>

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
        title="Registrar Producto"
        size="36rem"
      >
        <RegistroProducto
          productosExistentes={productos}
          onSuccess={(nuevo) => {
            pushNuevoProducto(nuevo);
            closeRegistro();
          }}
          onCancel={closeRegistro}
        />
      </ModalEstandar>
    </div>
  );
};

export default ProductosPage;
