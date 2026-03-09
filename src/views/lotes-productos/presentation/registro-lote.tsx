import {
  Button,
  Group,
  NumberInput,
  Select,
  Text,
  TextInput,
  Stack,
  Divider,
  Paper,
  Loader,
  Center,
} from "@mantine/core";
import {
  CalendarIcon,
  ArchiveBoxIcon,
  ScaleIcon,
} from "@heroicons/react/24/outline";
import { DatePickerInput } from "@mantine/dates";

import { useRegistroLote } from "../hooks/useRegistroLote";
import type { RES_Lote } from "../service/lotes.responses";

interface RegistroLoteProps {
  onSuccess: (lote: RES_Lote) => void;
  onCancel: () => void;
  initialAlmacenId?: number | null;
}

export const RegistroLote = ({
  onSuccess,
  onCancel,
  initialAlmacenId,
}: RegistroLoteProps) => {
  const {
    idAlmacen,
    setIdAlmacen,
    idProducto,
    setIdProducto,
    idUnidadMedida,
    setIdUnidadMedida,
    stockInicial,
    setStockInicial,
    contenidoPorPresentacion,
    setContenidoPorPresentacion,
    fechaHoraIngreso,
    setFechaHoraIngreso,
    fechaVencimiento,
    setFechaVencimiento,
    descripcion,
    setDescripcion,
    loading,
    submitting,
    error,
    catalogs,
    derived,
    handleSubmit,
  } = useRegistroLote({ initialAlmacenId, onSuccess });

  const inputStyles = {
    input: "bg-zinc-900 border-zinc-800 text-white focus:border-indigo-500",
    label:
      "text-zinc-400 font-bold uppercase tracking-widest text-[10px] mb-1.5",
    dropdown: "bg-zinc-900 border-zinc-800",
    option: "text-zinc-300 hover:bg-zinc-800",
  };

  if (loading) {
    return (
      <Center p="xl">
        <Stack align="center" gap="sm">
          <Loader color="indigo" size="sm" />
          <Text
            size="xs"
            c="dimmed"
            fw={700}
            className="uppercase tracking-widest"
          >
            Cargando catálogos...
          </Text>
        </Stack>
      </Center>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-1 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Select
          label="Almacén de Destino"
          placeholder="Elegir almacén..."
          data={catalogs.almacenes.map((a) => ({
            value: String(a.id_almacen),
            label: a.nombre,
          }))}
          searchable
          value={idAlmacen ? String(idAlmacen) : null}
          onChange={(val) => setIdAlmacen(Number(val))}
          classNames={inputStyles}
        />

        <Select
          label="Producto"
          placeholder="Buscar producto..."
          data={catalogs.productos.map((p) => ({
            value: String(p.id_producto),
            label: p.nombre,
          }))}
          searchable
          value={idProducto ? String(idProducto) : null}
          onChange={(val) => setIdProducto(Number(val))}
          classNames={inputStyles}
        />

        <Divider className="md:col-span-2 border-zinc-800/50" />

        <Select
          label="Unidad del Lote"
          placeholder="Ej: Caja, Saco, etc."
          data={catalogs.unidades.map((u) => ({
            value: String(u.id_unidad_medida),
            label: `${u.nombre} (${u.abreviatura})`,
          }))}
          value={idUnidadMedida ? String(idUnidadMedida) : null}
          onChange={(val) => setIdUnidadMedida(Number(val))}
          classNames={inputStyles}
        />

        <NumberInput
          label="Stock de Ingreso"
          placeholder="0.00"
          decimalScale={2}
          min={0}
          value={stockInicial}
          onChange={(val) => setStockInicial(Number(val))}
          classNames={inputStyles}
          leftSection={<ArchiveBoxIcon className="w-4 h-4 text-zinc-500" />}
        />

        <NumberInput
          label="Contenido por Unidad"
          placeholder="1.00"
          disabled={derived.sonUnidadesIdenticas}
          decimalScale={4}
          min={0.0001}
          value={contenidoPorPresentacion}
          onChange={(val) => setContenidoPorPresentacion(Number(val))}
          classNames={inputStyles}
          leftSection={<ScaleIcon className="w-4 h-4 text-zinc-500" />}
          description={
            derived.productoSeleccionado
              ? `Indique la cantidad de unidades base por empaque.`
              : ""
          }
        />

        <Paper
          withBorder
          p="md"
          radius="lg"
          bg="indigo.9/5"
          className="border-indigo-500/10 self-end"
        >
          <Stack gap={0} align="center">
            <Text
              size="10px"
              fw={800}
              c="indigo.4"
              className="uppercase tracking-widest leading-none mb-1"
            >
              Stock Base Proyectado
            </Text>
            <Group gap="xs" align="baseline">
              <Text size="xl" fw={900} className="text-white leading-none">
                {derived.stockTotalBase}
              </Text>
              <Text size="xs" fw={700} c="dimmed" className="italic">
                UNIDADES
              </Text>
            </Group>
          </Stack>
        </Paper>

        <Divider className="md:col-span-2 border-zinc-800/50" />

        <DatePickerInput
          label="Fecha de Ingreso"
          placeholder="Seleccionar..."
          value={fechaHoraIngreso}
          onChange={(val) => setFechaHoraIngreso(val as Date | null)}
          leftSection={<CalendarIcon className="w-4 h-4 text-zinc-500" />}
          classNames={inputStyles}
        />

        {derived.productoSeleccionado?.es_perecible ? (
          <DatePickerInput
            label="Fecha de Vencimiento"
            placeholder="Seleccionar..."
            value={fechaVencimiento}
            onChange={(val) => setFechaVencimiento(val as Date | null)}
            leftSection={<CalendarIcon className="w-4 h-4 text-red-500" />}
            classNames={inputStyles}
            minDate={fechaHoraIngreso || undefined}
          />
        ) : (
          <Paper
            p="sm"
            radius="lg"
            bg="zinc.9/5"
            className="flex items-center justify-center border border-dashed border-zinc-800 opacity-50"
          >
            <Text size="xs" c="dimmed" className="italic">
              Producto no perecible
            </Text>
          </Paper>
        )}

        <TextInput
          label="Observaciones / Documento"
          placeholder="Ej: Factura F-001, etc."
          className="md:col-span-2"
          value={descripcion}
          onChange={(e) => setDescripcion(e.currentTarget.value)}
          classNames={inputStyles}
        />
      </div>

      {error && (
        <Text
          color="red"
          size="sm"
          ta="center"
          fw={700}
          className="italic animate-pulse"
        >
          {error}
        </Text>
      )}

      <Group
        justify="flex-end"
        mt="xl"
        className="pt-6 border-t border-zinc-800/50"
      >
        <Button
          variant="subtle"
          color="zinc"
          onClick={onCancel}
          radius="lg"
          className="text-zinc-500 font-bold"
        >
          Descartar
        </Button>
        <Button
          type="submit"
          loading={submitting}
          radius="lg"
          className="bg-zinc-100 hover:bg-white text-zinc-900 font-black px-8 shadow-xl"
        >
          Confirmar Registro
        </Button>
      </Group>
    </form>
  );
};
