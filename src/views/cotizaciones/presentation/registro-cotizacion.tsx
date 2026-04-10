import { useState, useEffect } from "react";
import {
  Stack,
  Group,
  Button,
  Text,
  Title,
  Select,
  Paper,
  ActionIcon,
  Badge,
} from "@mantine/core";
import {
  PlusIcon,
  UserPlusIcon,
  BuildingOffice2Icon,
  CubeIcon,
  CheckBadgeIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { useRegistroCotizacion } from "../hooks/useRegistroCotizacion";
import { ComparativoTabla } from "./comparativo-tabla";
import { ModalSeleccionProductos } from "./modal-seleccion-productos";
import { api } from "../../../service/api";

interface RegistroCotizacionProps {
  onSuccess: () => void;
  onCancel: () => void;
}

interface ProveedorMaestro {
  id_proveedor: number;
  razon_social: string;
}

interface UnidadMedidaMaestro {
  id_unidad_medida: number;
  nombre: string;
}

interface ProductoCatalogo {
  id_producto: number;
  nombre: string;
  codigo: string;
}

export const RegistroCotizacion = ({
  onSuccess,
  onCancel,
}: RegistroCotizacionProps) => {
  const {
    productos,
    cotizaciones,
    loading,
    agregarProductoAlComparador,
    agregarProveedor,
    updateCotizacionHeader,
    updateCotizacionDetail,
    handleSave,
  } = useRegistroCotizacion(onSuccess);

  const [modalProdOpened, setModalProdOpened] = useState(false);
  const [idProveedorSel, setIdProveedorSel] = useState<string | null>(null);

  // Datos maestros agrupados en un solo estado para evitar renders en cascada
  const [maestros, setMaestros] = useState<{
    proveedores: ProveedorMaestro[];
    unidades: UnidadMedidaMaestro[];
    catalogo: ProductoCatalogo[];
  }>({
    proveedores: [],
    unidades: [],
    catalogo: [],
  });

  useEffect(() => {
    const ejecutarCarga = async () => {
      try {
        // Ejecutamos por separado para que si falla uno, no mueran todos
        const resProv = await api.get("/proveedores").catch(() => null);
        const resUni = await api.get("/unidades").catch(() => null); // Cambiado de /unidades-medida a /unidades
        const resProd = await api.get("/productos").catch(() => null);

        const getPayload = (res: { data?: unknown } | null): unknown[] => {
          if (!res || !res.data) return [];
          const body = res.data;

          if (
            body &&
            typeof body === "object" &&
            !Array.isArray(body) &&
            "data" in body &&
            Array.isArray((body as { data: unknown[] }).data)
          ) {
            return (body as { data: unknown[] }).data;
          }

          if (Array.isArray(body)) return body;

          return [];
        };

        setMaestros({
          proveedores: getPayload(resProv) as ProveedorMaestro[],
          unidades: getPayload(resUni) as UnidadMedidaMaestro[],
          catalogo: getPayload(resProd) as ProductoCatalogo[],
        });
      } catch (error) {
        console.error("Error crítico al cargar datos maestros", error);
      }
    };

    ejecutarCarga();
  }, []); // Solo al montar

  // Enriquecemos la lista de productos del comparativo con sus nombres/códigos del catálogo
  const productosEnriquecidos = productos.map((p) => {
    const found = maestros.catalogo.find(
      (cp) => cp.id_producto === p.id_producto,
    );
    return {
      ...p,
      nombre: found?.nombre || "Cargando...",
      codigo: found?.codigo || "---",
    };
  });

  return (
    <Stack gap="xl" className="relative">
      {/* Header de la Página */}
      <Group
        justify="space-between"
        align="center"
        className="sticky top-0 z-30 bg-zinc-950/80 backdrop-blur-md py-4"
      >
        <Stack gap={0}>
          <Group gap="xs">
            <ActionIcon variant="subtle" color="gray" onClick={onCancel}>
              <ArrowLeftIcon className="w-5 h-5" />
            </ActionIcon>
            <Title order={2} className="text-white tracking-tight">
              Nuevo Comparativo de Precios
            </Title>
          </Group>
          <Text size="sm" className="text-zinc-500 ml-9">
            Registre y compare cotizaciones de múltiples proveedores
          </Text>
        </Stack>

        <Group gap="md">
          <Button
            variant="default"
            onClick={onCancel}
            radius="xl"
            className="border-zinc-800 bg-transparent text-zinc-400 hover:text-white"
          >
            Cancelar
          </Button>
          <Button
            leftSection={<CheckBadgeIcon className="w-5 h-5" />}
            onClick={handleSave}
            loading={loading}
            radius="xl"
            className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-900/20 px-8"
          >
            Finalizar y Guardar
          </Button>
        </Group>
      </Group>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Panel de Acciones Izquierdo */}
        <Stack gap="md" className="lg:col-span-3">
          <Paper
            p="lg"
            radius="2xl"
            className="bg-zinc-900/40 border border-zinc-800/60 transition-all hover:border-zinc-700"
          >
            <Stack gap="md">
              <Group gap="xs">
                <CubeIcon className="w-5 h-5 text-indigo-400" />
                <Text fw={700} className="text-white italic">
                  Paso 1: Productos
                </Text>
              </Group>
              <Text size="xs" className="text-zinc-500">
                Añada los productos que desea cotizar en este lote.
              </Text>
              <Button
                fullWidth
                variant="light"
                color="indigo"
                onClick={() => setModalProdOpened(true)}
                leftSection={<PlusIcon className="w-4 h-4" />}
                radius="lg"
              >
                Buscar en Catálogo
              </Button>
              {productos.length > 0 && (
                <Badge variant="dot" color="green" size="sm">
                  {productos.length} Productos añadidos
                </Badge>
              )}
            </Stack>
          </Paper>

          <Paper
            p="lg"
            radius="2xl"
            className="bg-zinc-900/40 border border-zinc-800/60 transition-all hover:border-zinc-700"
          >
            <Stack gap="md">
              <Group gap="xs">
                <BuildingOffice2Icon className="w-5 h-5 text-emerald-400" />
                <Text fw={700} className="text-white italic">
                  Paso 2: Proveedores
                </Text>
              </Group>
              <Text size="xs" className="text-zinc-500">
                Elija los proveedores que participan en la comparación.
              </Text>
              <Select
                key={maestros.proveedores.length}
                placeholder="Seleccionar Proveedor"
                data={maestros.proveedores.map((p) => ({
                  value: String(p.id_proveedor),
                  label: p.razon_social,
                }))}
                value={idProveedorSel}
                onChange={setIdProveedorSel}
                searchable
                nothingFoundMessage="No se encontraron proveedores"
                clearable
                radius="lg"
                classNames={{
                  input: "bg-zinc-950 border-zinc-800 focus:border-emerald-500",
                }}
              />
              <Button
                fullWidth
                variant="light"
                color="emerald"
                disabled={!idProveedorSel}
                onClick={() => {
                  if (idProveedorSel) {
                    agregarProveedor(Number(idProveedorSel));
                    setIdProveedorSel(null);
                  }
                }}
                leftSection={<UserPlusIcon className="w-4 h-4" />}
                radius="lg"
              >
                Añadir Columna
              </Button>
            </Stack>
          </Paper>
        </Stack>

        {/* Matriz de Comparación (Derecha) */}
        <div className="lg:col-span-9">
          {productos.length === 0 && cotizaciones.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-zinc-800 rounded-[2.5rem] bg-zinc-900/10">
              <BuildingOffice2Icon className="w-16 h-16 text-zinc-800 mb-4" />
              <Text size="lg" fw={700} className="text-zinc-600">
                Comience añadiendo productos o proveedores
              </Text>
              <Text size="sm" className="text-zinc-700 italic">
                La matriz comparativa aparecerá aquí automáticamente
              </Text>
            </div>
          ) : (
            <ComparativoTabla
              productos={productosEnriquecidos}
              cotizaciones={cotizaciones}
              unidadesMedida={maestros.unidades.map((u) => ({
                value: String(u.id_unidad_medida),
                label: u.nombre,
              }))}
              proveedores={maestros.proveedores}
              onUpdateHeader={updateCotizacionHeader}
              onUpdateDetail={updateCotizacionDetail}
            />
          )}
        </div>
      </div>

      <ModalSeleccionProductos
        opened={modalProdOpened}
        onClose={() => setModalProdOpened(false)}
        onSelect={(id) => agregarProductoAlComparador(id)}
        seleccionadosActuales={productos.map((p) => p.id_producto)}
      />
    </Stack>
  );
};
