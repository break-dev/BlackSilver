import { useState } from "react";
import {
  Button,
  Group,
  TextInput,
  Text,
  Badge,
  Stack,
  ThemeIcon,
  ActionIcon,
  Tooltip,
  Menu,
} from "@mantine/core";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  CubeIcon,
  ClockIcon,
  EllipsisVerticalIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { type DataTableColumn } from "mantine-datatable";
import { useDisclosure } from "@mantine/hooks";
import { useTitlePage } from "../../../hooks/useTitlePage";
import { DataTableEstandar } from "../../../presentation/utils/datatable-estandar";
import { ModalEstandar } from "../../../presentation/utils/modal-estandar";
import { useProductos } from "../hooks/useProductos";
import { RegistroProducto } from "./registro-producto";
import { HistorialCostos } from "./components/historial-costos";
import type {
  RES_LogCostoPromedio,
  RES_ProductoResumen,
} from "../service/productos.responses";
import { formatNumber } from "../../../shared/functions/formatNumber";
import { enPlural } from "../../../shared/functions/en-plural";
import { TipoBien } from "../../../shared/enums/_generic/tipo-bien";
import { BotonRecargar } from "../../../presentation/utils/boton-recargar";
import dayjs from "dayjs";
import "dayjs/locale/es";

dayjs.locale("es");

export const ProductosPage = () => {
  useTitlePage("Catálogo de Productos");

  const {
    productos,
    loading,
    busqueda,
    setBusqueda,
    recargar,
    pushNuevoProducto,
    actualizarProducto,
    eliminarProducto,
    eliminandoId,
  } = useProductos();

  const [openedRegistro, { open: openRegistro, close: closeRegistro }] =
    useDisclosure(false);
  const [openedEdicion, { open: openEdicion, close: closeEdicion }] =
    useDisclosure(false);
  const [productoEnEdicion, setProductoEnEdicion] =
    useState<RES_ProductoResumen | null>(null);

  const [openedHistory, { open: openHistory, close: closeHistory }] =
    useDisclosure(false);
  const [selectedLog, setSelectedLog] = useState<RES_LogCostoPromedio[]>([]);
  const [selectedProdName, setSelectedProdName] = useState("");

  const handleOpenHistory = (r: RES_ProductoResumen) => {
    try {
      const logs =
        typeof r.costo_promedio_base_log === "string"
          ? JSON.parse(r.costo_promedio_base_log)
          : r.costo_promedio_base_log;

      setSelectedLog(logs || []);
      setSelectedProdName(r.nombre);
      openHistory();
    } catch (e) {
      console.error("Error al parsear logs", e);
    }
  };

  const handleOpenEdit = (r: RES_ProductoResumen) => {
    setProductoEnEdicion(r);
    openEdicion();
  };

  const handleCloseEdicion = () => {
    setProductoEnEdicion(null);
    closeEdicion();
  };

  const handleDelete = (r: RES_ProductoResumen) => {
    void eliminarProducto(r.id_producto);
  };

  const columns: DataTableColumn<RES_ProductoResumen>[] = [
    {
      accessor: "index",
      title: "#",
      textAlign: "center",
      width: 50,
    },
    {
      accessor: "producto",
      title: "Producto",
      render: (r) => (
        <Group gap="sm">
          <ThemeIcon variant="light" color="indigo" radius="md" size="lg">
            <CubeIcon className="w-5 h-5" />
          </ThemeIcon>
          <Stack gap={2}>
            <Group gap="xs">
              <Text size="sm" fw={500} className="text-zinc-200">
                {r.nombre}
              </Text>
              {r.prefijo && (
                <Badge color="pink" variant="light" size="xs" radius="sm">
                  {r.prefijo}
                </Badge>
              )}
            </Group>
          </Stack>
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
      render: (r) => {
        if (r.clasificacion_bien === TipoBien.ActivoFijo) {
          return (
            <Text size="sm" className="text-zinc-500 italic">
              No aplica
            </Text>
          );
        }
        return (
          <div className="flex flex-row gap-2 justify-center items-center">
            <Text size="sm" fw={500} className="text-zinc-300">
              {formatNumber(r.stock_minimo_base)}
            </Text>
            <Badge
              size="sm"
              variant="gradient"
              gradient={{ from: "violet", to: "cyan", deg: 135 }}
              className="text-white font-semibold"
            >
              {enPlural(r.unidad_medida_base, r.stock_minimo_base)}
            </Badge>
          </div>
        );
      },
    },
    {
      accessor: "costo_promedio_base",
      title: "Costo Promedio",
      textAlign: "center",
      render: (r) => (
        <Group gap="xs" justify="center">
          <Text size="sm" fw={600} className="text-zinc-200">
            S/. {formatNumber(r.costo_promedio_base)}
          </Text>
          <Tooltip label="Ver historial de costos" position="top" withArrow>
            <ActionIcon
              variant="transparent"
              color="violet"
              radius="xl"
              size="sm"
              onClick={() => handleOpenHistory(r)}
              disabled={
                !r.costo_promedio_base_log ||
                (typeof r.costo_promedio_base_log === "string" &&
                  r.costo_promedio_base_log === "[]")
              }
              className="hover:bg-violet-500/10 transition-colors"
            >
              <ClockIcon className="w-4 h-4 text-violet-400 hover:text-violet-300" />
            </ActionIcon>
          </Tooltip>
        </Group>
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
          {r.para_mantenimiento == true && (
            <Badge color="blue" variant="light" size="xs">
              Para Mantenimiento
            </Badge>
          )}
          {r.es_auditable == false &&
            r.es_perecible == false &&
            r.para_mantenimiento == false && (
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
    {
      accessor: "actions",
      title: "",
      width: 70,
      textAlign: "right",
      render: (r) => {
        const estaEliminando = eliminandoId === r.id_producto;
        return (
          <Menu shadow="md" width={170} position="bottom-end" withArrow>
            <Menu.Target>
              <ActionIcon
                variant="subtle"
                color="gray"
                loading={estaEliminando}
                aria-label="Abrir acciones del producto"
              >
                <EllipsisVerticalIcon className="w-5 h-5" />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown className="bg-zinc-900 border-zinc-800">
              <Menu.Label className="text-zinc-500">Acciones</Menu.Label>
              <Menu.Item
                leftSection={<PencilSquareIcon className="w-4 h-4" />}
                onClick={() => handleOpenEdit(r)}
                className="text-zinc-300 hover:bg-zinc-800 hover:text-white"
              >
                Editar
              </Menu.Item>
              <Menu.Item
                leftSection={<TrashIcon className="w-4 h-4" />}
                color="red"
                onClick={() => handleDelete(r)}
                className="hover:bg-red-900/20"
              >
                Eliminar
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        );
      },
    },
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
          <div className="flex gap-2 items-center shrink-0">
            <BotonRecargar onReload={recargar} loading={loading} />
            <Button
              leftSection={<PlusIcon className="w-5 h-5" />}
              onClick={openRegistro}
              radius="lg"
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20 shrink-0 px-6 font-semibold h-9.5"
            >
              Nuevo Producto
            </Button>
          </div>
        </div>

        <DataTableEstandar
          idAccessor="id_producto"
          columns={columns}
          records={productos}
          loading={loading}
        />
      </Stack>

      <ModalEstandar
        opened={openedHistory}
        close={closeHistory}
        title="Historial de Costos"
        size="lg"
      >
        <HistorialCostos logs={selectedLog} productoNombre={selectedProdName} />
      </ModalEstandar>

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

      <ModalEstandar
        opened={openedEdicion}
        close={handleCloseEdicion}
        title={
          productoEnEdicion
            ? `Editar: ${productoEnEdicion.nombre}`
            : "Editar Producto"
        }
        size="36rem"
      >
        {productoEnEdicion && (
          <RegistroProducto
            productosExistentes={productos}
            productoEdicion={productoEnEdicion}
            onSuccess={() => {
              // En modo edición no se invoca este callback, pero se exige por tipado
            }}
            onEditSuccess={(editado) => {
              actualizarProducto(editado);
              handleCloseEdicion();
            }}
            onCancel={handleCloseEdicion}
          />
        )}
      </ModalEstandar>
    </div>
  );
};

export default ProductosPage;
