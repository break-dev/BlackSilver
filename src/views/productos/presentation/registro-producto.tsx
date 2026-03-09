import {
  Stack,
  Group,
  TextInput,
  Select,
  Button,
  Switch,
  NumberInput,
  Text,
  Divider,
} from "@mantine/core";
import { CubeIcon } from "@heroicons/react/24/outline";
import { useRegistroProducto } from "../hooks/useRegistroProducto";
import type { RES_Producto } from "../service/productos.responses";

interface RegistroProductoProps {
  onSuccess: (nuevo: RES_Producto) => void;
}

export const RegistroProducto = ({ onSuccess }: RegistroProductoProps) => {
  const {
    form,
    setField,
    categorias,
    unidades,
    loading,
    loadingCategorias,
    loadingUnidades,
    handleSubmit,
  } = useRegistroProducto(onSuccess);

  const fieldClasses = {
    input:
      "bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-500",
    label: "text-zinc-400 text-xs mb-1",
  };

  return (
    <Stack gap="lg">
      <TextInput
        label="Nombre del Producto"
        placeholder="Ej. Casco de Seguridad MSA"
        value={form.nombre}
        onChange={(e) => setField("nombre", e.currentTarget.value)}
        classNames={fieldClasses}
        radius="lg"
        required
      />

      <Group grow align="flex-start">
        <Select
          label="Categoría"
          placeholder={
            loadingCategorias ? "Cargando..." : "Seleccione categoría"
          }
          data={categorias.map((c) => ({
            value: c.id_categoria.toString(),
            label: c.nombre,
          }))}
          value={form.id_categoria === 0 ? null : form.id_categoria.toString()}
          onChange={(val) => setField("id_categoria", Number(val))}
          classNames={fieldClasses}
          radius="lg"
          required
          searchable
          disabled={loadingCategorias}
        />
        <Select
          label="Unidad de Medida Base"
          placeholder={loadingUnidades ? "Cargando..." : "Seleccione unidad"}
          data={unidades.map((u) => ({
            value: u.id_unidad_medida.toString(),
            label: `${u.nombre} (${u.abreviatura})`,
          }))}
          value={
            form.id_unidad_medida_base === 0
              ? null
              : form.id_unidad_medida_base.toString()
          }
          onChange={(val) => setField("id_unidad_medida_base", Number(val))}
          classNames={fieldClasses}
          radius="lg"
          required
          searchable
          disabled={loadingUnidades}
        />
      </Group>

      <Divider
        label="Configuración de Stock y Control"
        labelPosition="center"
        color="zinc.8"
      />

      <Group grow align="center">
        <NumberInput
          label="Stock Mínimo"
          placeholder="0.00"
          value={form.stock_minimo}
          onChange={(val) => setField("stock_minimo", Number(val))}
          classNames={fieldClasses}
          radius="lg"
          min={0}
          decimalScale={2}
        />
        <Stack gap={4}>
          <Text size="xs" className="text-zinc-400">
            Opciones de Control
          </Text>
          <Group gap="xl">
            <Switch
              label="Fiscalizado"
              checked={form.es_fiscalizado}
              onChange={(e) =>
                setField("es_fiscalizado", e.currentTarget.checked)
              }
              color="indigo"
              size="sm"
              classNames={{ label: "text-zinc-300 text-sm" }}
            />
            <Switch
              label="Perecible"
              checked={form.es_perecible}
              onChange={(e) =>
                setField("es_perecible", e.currentTarget.checked)
              }
              color="indigo"
              size="sm"
              classNames={{ label: "text-zinc-300 text-sm" }}
            />
          </Group>
        </Stack>
      </Group>

      {form.es_perecible && (
        <Group grow align="flex-start" className="animate-fade-in">
          <NumberInput
            label="Tiempo Vencimiento"
            placeholder="Ej. 12"
            value={form.tiempo_espera_vencimiento || undefined}
            onChange={(val) =>
              setField("tiempo_espera_vencimiento", Number(val))
            }
            classNames={fieldClasses}
            radius="lg"
            min={1}
          />
          <Select
            label="Periodo"
            placeholder="Seleccione..."
            data={[
              { value: "diario", label: "Días" },
              { value: "semanal", label: "Semanas" },
              { value: "mensual", label: "Meses" },
              { value: "anual", label: "Años" },
            ]}
            value={form.periodo_espera_vencimiento}
            onChange={(val) => setField("periodo_espera_vencimiento", val)}
            classNames={fieldClasses}
            radius="lg"
          />
        </Group>
      )}

      <Button
        fullWidth
        onClick={handleSubmit}
        loading={loading}
        radius="lg"
        className="bg-indigo-600 hover:bg-indigo-700 h-[42px] mt-2"
        leftSection={<CubeIcon className="w-5 h-5" />}
      >
        Registrar Producto
      </Button>
    </Stack>
  );
};
