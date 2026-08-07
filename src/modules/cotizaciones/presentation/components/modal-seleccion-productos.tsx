import { useState, useMemo } from "react";
import {
  Stack,
  TextInput,
  Checkbox,
  Button,
  Group,
  Text,
  Badge,
  Select,
  Tooltip,
} from "@mantine/core";
import {
  MagnifyingGlassIcon,
  CubeIcon,
  LockClosedIcon,
  Squares2X2Icon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { ModalEstandar } from "../../../../presentation/utils/modal-estandar";
import { DataTableEstandar } from "../../../../presentation/utils/datatable-estandar";
import { RegistroProducto } from "../../../productos/presentation/registro-producto";
import type { RES_Producto } from "../../../../service/responses/producto";
import type { RES_ProductoResumen } from "../../../productos/service/productos.responses";
import { EstadoBase } from "../../../../shared/enums/_generic/estado-base";
import { TipoBien } from "../../../../shared/enums/_generic/tipo-bien";

interface ModalSeleccionProductosProps {
  opened: boolean;
  onClose: () => void;
  onToggle: (id_producto: number) => void;
  seleccionadosActuales: number[];
  productosBloqueados?: number[];
  catalogoProductos: RES_Producto[];
  loading?: boolean;
  soloAuditables?: boolean;
  onProductoCreado?: (producto: RES_Producto) => void;
}

export const ModalSeleccionProductos = ({
  opened,
  onClose,
  onToggle,
  seleccionadosActuales,
  productosBloqueados = [],
  catalogoProductos,
  loading = false,
  soloAuditables = false,
  onProductoCreado,
}: ModalSeleccionProductosProps) => {
  const [busqueda, setBusqueda] = useState("");
  const [categoriaId, setCategoriaId] = useState<string | null>(null);
  const [openedAddProducto, setOpenedAddProducto] = useState(false);

  // Extraemos categorías únicas del catálogo cargado
  const categoriasDisponibles = useMemo(() => {
    const list = catalogoProductos.map((p) => p.categoria);
    const unique = Array.from(new Set(list)).sort();
    return unique.map((c) => ({ value: c, label: c }));
  }, [catalogoProductos]);

  const filtrados = useMemo(() => {
    return catalogoProductos.filter((p) => {
      const matchTexto =
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.id_producto.toString().toLowerCase().includes(busqueda.toLowerCase());
      const matchCategoria = !categoriaId || p.categoria === categoriaId;
      
      const isAuditable = Boolean(p.es_auditable);
      const matchAuditable = soloAuditables ? isAuditable : !isAuditable;

      return matchTexto && matchCategoria && matchAuditable;
    });
  }, [catalogoProductos, busqueda, categoriaId, soloAuditables]);

  const handleToggle = (id: number) => {
    const isChecked = seleccionadosActuales.includes(id);
    const isBlocked = productosBloqueados.includes(id);

    if (isChecked && isBlocked) return;

    onToggle(id);
  };

  const handleProductoCreadoSuccess = (nuevoResumen: RES_ProductoResumen) => {
    setOpenedAddProducto(false);

    // Mapear al tipo de producto completo RES_Producto que espera el catálogo de cotizaciones
    const nuevoProducto: RES_Producto = {
      id_producto: nuevoResumen.id_producto,
      nombre: nuevoResumen.nombre,
      prefijo: nuevoResumen.prefijo,
      id_categoria: nuevoResumen.id_categoria,
      categoria: nuevoResumen.categoria,
      es_consumible: true,
      tipo_bien: nuevoResumen.clasificacion_bien,
      id_unidad_medida_base: nuevoResumen.id_unidad_medida_base,
      unidad_medida_base: nuevoResumen.unidad_medida_base,
      unidad_medida_base_abv: nuevoResumen.unidad_medida_base_abreviatura,
      es_auditable: nuevoResumen.es_auditable,
      es_perecible: nuevoResumen.es_perecible,
      para_mantenimiento: nuevoResumen.para_mantenimiento,
      stock_minimo_base: nuevoResumen.stock_minimo_base,
      costo_promedio_base: nuevoResumen.costo_promedio_base,
      moneda: nuevoResumen.moneda,
      dias_espera_vencimiento: nuevoResumen.dias_espera_vencimiento,
    };

    if (onProductoCreado) {
      onProductoCreado(nuevoProducto);
    }

    // Auto-seleccionar el producto si cumple con el filtro de auditable
    const isAuditable = Boolean(nuevoProducto.es_auditable);
    const cumpleAuditable = soloAuditables ? isAuditable : !isAuditable;
    if (cumpleAuditable && !seleccionadosActuales.includes(nuevoProducto.id_producto)) {
      onToggle(nuevoProducto.id_producto);
    }
  };

  // Convertir catálogo de cotizaciones a lista compatible con RES_ProductoResumen
  const productosExistentesParaModal: RES_ProductoResumen[] = useMemo(() => {
    return catalogoProductos.map((p) => ({
      id_producto: p.id_producto,
      nombre: p.nombre,
      prefijo: p.prefijo,
      id_categoria: p.id_categoria || 0,
      categoria: p.categoria,
      clasificacion_bien: p.tipo_bien || TipoBien.Otros,
      id_unidad_medida_base: p.id_unidad_medida_base || 0,
      unidad_medida_base: p.unidad_medida_base || "",
      unidad_medida_base_abreviatura: p.unidad_medida_base_abv || "",
      es_auditable: Boolean(p.es_auditable),
      es_perecible: Boolean(p.es_perecible),
      para_mantenimiento: Boolean(p.para_mantenimiento),
      stock_minimo_base: Number(p.stock_minimo_base) || 0,
      costo_promedio_base: Number(p.costo_promedio_base) || 0,
      costo_promedio_base_log: null,
      moneda: p.moneda,
      tiempo_espera_vencimiento: null,
      periodo_espera_vencimiento: null,
      dias_espera_vencimiento: p.dias_espera_vencimiento ?? null,
      estado: EstadoBase.Activo,
    }));
  }, [catalogoProductos]);

  const columns = [
    {
      accessor: "seleccion",
      title: "",
      textAlign: "center" as const,
      width: 40,
      render: (p: RES_Producto) => {
        const isBlocked = productosBloqueados.includes(p.id_producto);
        const isChecked = seleccionadosActuales.includes(p.id_producto);
        return (
          <Checkbox
            checked={isChecked}
            onChange={() => handleToggle(p.id_producto)}
            color="indigo"
            radius="sm"
            size="xs"
            disabled={isChecked && isBlocked}
            className={`flex justify-center transition-opacity ${isChecked && isBlocked ? "opacity-40 cursor-no-drop" : ""}`}
          />
        );
      },
    },
    {
      accessor: "index",
      title: "#",
      textAlign: "center" as const,
      width: 40,
    },
    {
      accessor: "nombre",
      title: "Producto",
      render: (p: RES_Producto) => {
        const isChecked = seleccionadosActuales.includes(p.id_producto);
        const isBlocked = productosBloqueados.includes(p.id_producto);
        return (
          <Group
            gap="md"
            wrap="nowrap"
            onClick={() => handleToggle(p.id_producto)}
            className="cursor-pointer group"
          >
            <div
              className={`p-2 rounded-xl border transition-all ${isChecked ? "bg-indigo-500/20 border-indigo-400/50" : "bg-zinc-800/30 border-zinc-700/50"}`}
            >
              <CubeIcon
                className={`w-4 h-4 ${isChecked ? "text-indigo-400" : "text-zinc-500"}`}
              />
            </div>
            <Stack gap={0}>
              <Group gap={6} align="center">
                <Text
                  size="sm"
                  fw={700}
                  className={isChecked ? "text-indigo-200" : "text-zinc-100"}
                >
                  {p.nombre}
                </Text>
                {isChecked && isBlocked && (
                  <LockClosedIcon className="w-3.5 h-3.5 text-red-400 opacity-70" />
                )}
              </Group>
            </Stack>
          </Group>
        );
      },
    },
    {
      accessor: "categoria_nombre",
      title: "Categoría",
      render: (p: RES_Producto) => (
        <Badge
          variant="filled"
          color="violet.7"
          size="xs"
          radius="md"
          className="font-bold uppercase px-3 shadow-md"
          style={{ color: "white" }}
        >
          {p.categoria}
        </Badge>
      ),
    },
  ];

  return (
    <>
      <ModalEstandar
        opened={opened}
        close={onClose}
        title="Añadir Productos al Comparativo"
        size="xl"
        rightSection={
          <Group gap="xs">
            <Tooltip label="Registrar nuevo producto en catálogo" position="bottom" withArrow>
              <Button
                variant="light"
                color="indigo"
                size="xs"
                radius="lg"
                leftSection={<PlusIcon className="w-4 h-4" />}
                onClick={() => setOpenedAddProducto(true)}
                className="font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all"
              >
                Nuevo Producto
              </Button>
            </Tooltip>
            {seleccionadosActuales.length > 0 && (
              <Badge
                variant="light"
                color="indigo"
                radius="md"
                size="sm"
                className="font-bold flex items-center gap-1.5 px-3 py-1 shadow-inner bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                leftSection={<CubeIcon className="w-3.5 h-3.5" />}
              >
                {seleccionadosActuales.length} {seleccionadosActuales.length === 1 ? "seleccionado" : "seleccionados"}
              </Badge>
            )}
          </Group>
        }
      >
        <Stack gap="md" className="relative">
          <Group grow gap="sm">
            <TextInput
              placeholder="Buscar producto por nombre..."
              leftSection={
                <MagnifyingGlassIcon className="w-4 h-4 text-zinc-400" />
              }
              value={busqueda}
              onChange={(e) => setBusqueda(e.currentTarget.value)}
              radius="lg"
              variant="filled"
              classNames={{
                input:
                  "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 text-white placeholder:text-zinc-600 transition-all h-10",
              }}
            />
            <Select
              placeholder="Todas las categorías"
              leftSection={<Squares2X2Icon className="w-4 h-4 text-zinc-400" />}
              data={categoriasDisponibles}
              value={categoriaId}
              onChange={setCategoriaId}
              clearable
              searchable
              radius="lg"
              variant="filled"
              classNames={{
                input:
                  "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 text-white placeholder:text-zinc-600 h-10",
                dropdown: "bg-zinc-900 border-zinc-800 shadow-2xl rounded-xl",
                option:
                  "hover:bg-zinc-800 text-zinc-300 data-[selected]:bg-indigo-600 data-[selected]:text-white rounded-lg my-1 transition-colors mx-2",
              }}
            />
          </Group>

          <DataTableEstandar
            idAccessor="id_producto"
            columns={columns}
            records={filtrados}
            loading={loading}
            initialPageSize={10}
            minHeight={350}
          />

          <Group justify="flex-end" mt="md">
            <Button
              variant="gradient"
              gradient={{ from: "indigo.6", to: "indigo.8" }}
              onClick={onClose}
              radius="xl"
              size="sm"
              className="px-8 font-bold shadow-lg shadow-indigo-900/20"
            >
              Finalizar Selección
            </Button>
          </Group>
        </Stack>
      </ModalEstandar>

      {/* Modal para Crear Producto desde la Cotización (Idéntico a Productos) */}
      <ModalEstandar
        opened={openedAddProducto}
        close={() => setOpenedAddProducto(false)}
        title="Registrar Producto"
        size="lg"
      >
        <RegistroProducto
          productosExistentes={productosExistentesParaModal}
          onSuccess={handleProductoCreadoSuccess}
          onCancel={() => setOpenedAddProducto(false)}
        />
      </ModalEstandar>
    </>
  );
};
