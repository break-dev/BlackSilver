import {
  Button,
  Group,
  NumberInput,
  Select,
  Text,
  TextInput,
  Paper,
  Divider,
} from "@mantine/core";
import { ArchiveBoxIcon, ScaleIcon } from "@heroicons/react/24/outline";
import { pluralizar } from "../../../presentation/functions/pluralizar";
import { useRegistroLote } from "../hooks/useRegistroLote";
import type { RES_Lote, RES_Almacen } from "../service/lotes.responses";
import { CustomDatePicker } from "../../../presentation/utils/date-picker-input";

interface RegistroLoteProps {
  onSuccess: (lote: RES_Lote) => void;
  onCancel: () => void;
  initialAlmacenId?: number | null;
  almacenes: RES_Almacen[];
}

export const RegistroLote = ({
  onSuccess,
  onCancel,
  initialAlmacenId,
  almacenes,
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
    loadingProductos,
    loadingUnidades,
    submitting,
    error,
    catalogs,
    derived,
    handleSubmit,
  } = useRegistroLote({ initialAlmacenId, almacenes, onSuccess });

  const inputClasses = {
    input:
      "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500",
    dropdown: "bg-zinc-900 border-zinc-800",
    option:
      "hover:bg-zinc-800 text-zinc-300 data-[selected]:bg-zinc-100 data-[selected]:text-zinc-900 rounded-md my-1",
    label:
      "text-zinc-300 mb-1.5 font-bold uppercase tracking-widest text-[11px]!",
    description: "text-zinc-500 text-[10px] italic mt-1",
  };


  return (
    <form onSubmit={handleSubmit} className="relative space-y-4 p-1">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Almacén de Destino"
          placeholder="Seleccione almacén"
          withAsterisk
          data={almacenes.map((a) => ({
            value: String(a.id_almacen),
            label: a.nombre,
          }))}
          searchable
          value={idAlmacen ? String(idAlmacen) : null}
          onChange={(val) => setIdAlmacen(Number(val))}
          classNames={inputClasses}
          className="md:col-span-2"
          size="sm"
        />

        <Select
          label="Producto"
          placeholder="Buscar producto..."
          data={catalogs.productos.map((p) => ({
            value: String(p.id_producto),
            label: p.nombre,
          }))}
          searchable
          withAsterisk
          disabled={loadingProductos}
          value={idProducto ? String(idProducto) : null}
          onChange={(val) => setIdProducto(Number(val))}
          classNames={inputClasses}
          className="md:col-span-2"
        />

        <Divider className="md:col-span-2 border-zinc-800/50 my-2" />

        <Select
          label="Und. de Medida del Lote"
          placeholder="Seleccione unidad (ej: Caja, Bolsa)"
          data={catalogs.unidades.map((u) => ({
            value: String(u.id_unidad_medida),
            label: `${u.nombre} (${u.abreviatura})`,
          }))}
          searchable
          withAsterisk
          disabled={loadingUnidades}
          value={idUnidadMedida ? String(idUnidadMedida) : null}
          onChange={(val) => setIdUnidadMedida(Number(val))}
          classNames={inputClasses}
        />

        <NumberInput
          label={`Cantidad de ${pluralizar(derived.unidadSeleccionada?.nombre) || "---"}`}
          min={0}
          placeholder="0"
          fixedDecimalScale
          withAsterisk
          value={stockInicial}
          onChange={(val) => setStockInicial(Number(val))}
          classNames={inputClasses}
          leftSection={<ArchiveBoxIcon className="w-4 h-4 text-zinc-500" />}
        />

        <NumberInput
          label="Contenido"
          placeholder="1.0"
          description={
            derived.sonUnidadesIdenticas
              ? "Misma unidad que la base (Bloqueado)"
              : `Indique cuánt@s ${pluralizar(derived.unidadBase?.nombre) || "unidades"} contiene cada ${derived.unidadSeleccionada?.nombre || "unidad de lote"}`
          }
          min={0.1}
          fixedDecimalScale
          withAsterisk
          disabled={derived.sonUnidadesIdenticas}
          value={contenidoPorPresentacion}
          onChange={(val) => setContenidoPorPresentacion(Number(val))}
          classNames={inputClasses}
          leftSection={<ScaleIcon className="w-4 h-4 text-zinc-500" />}
        />

        <div className="md:col-span-1 self-end">
          <Paper
            withBorder
            p="md"
            radius="lg"
            className="bg-zinc-900/50 border-zinc-800/50 space-y-3"
          >
            <Text
              size="10px"
              fw={800}
              c="dimmed"
              className="uppercase tracking-widest leading-none"
            >
              Resumen de Conversión
            </Text>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Text size="xs" c="cyan.4" fw={600}>
                  Ingreso en Lote
                </Text>
                <Text fw={700} size="xl" className="text-white leading-none">
                  {stockInicial || 0}{" "}
                  <span className="text-xs font-normal text-zinc-500">
                    {derived.unidadSeleccionada?.abreviatura || "---"}
                  </span>
                </Text>
              </div>
              <div className="space-y-1">
                <Text size="xs" c="pink.4" fw={600}>
                  Total Base
                </Text>
                <Text fw={700} size="xl" className="text-pink-500 leading-none">
                  {derived.stockTotalBase}{" "}
                  <span className="text-xs font-normal text-zinc-500">
                    {derived.unidadBase?.abreviatura || "---"}
                  </span>
                </Text>
              </div>
            </div>
          </Paper>
        </div>

        <Divider className="md:col-span-2 border-zinc-800/50 my-2" />

        <CustomDatePicker
          label="Fecha de Ingreso"
          placeholder="Seleccione fecha"
          withAsterisk
          value={fechaHoraIngreso}
          onChange={(date) => setFechaHoraIngreso(date as Date | null)}
        />

        {derived.productoSeleccionado?.es_perecible ? (
          <CustomDatePicker
            label="Fecha de Vencimiento"
            placeholder="Seleccione fecha"
            withAsterisk
            minDate={fechaHoraIngreso || undefined}
            value={fechaVencimiento}
            onChange={(date) => setFechaVencimiento(date as Date | null)}
          />
        ) : (
          <div className="flex items-center justify-center pt-6">
            <Text size="xs" c="dimmed" className="italic">
              Producto no requiere fecha de vencimiento
            </Text>
          </div>
        )}

        <TextInput
          label="Descripción / Referencia"
          placeholder="Ej: Compra Famesa F-504"
          className="md:col-span-2"
          value={descripcion}
          onChange={(e) => setDescripcion(e.currentTarget.value)}
          classNames={inputClasses}
        />
      </div>

      {error && (
        <Text c="red" size="sm" ta="center" fw={600} className="italic">
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
          onClick={onCancel}
          disabled={submitting}
          radius="lg"
          className="text-zinc-500 hover:text-white font-bold"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          loading={submitting}
          radius="lg"
          className="bg-linear-to-r from-zinc-100 to-zinc-300 text-zinc-900 font-bold hover:from-white hover:to-zinc-200 shadow-lg border-0 px-8"
        >
          Confirmar Registro
        </Button>
      </Group>
    </form>
  );
};
