import {
  Button,
  Checkbox,
  Group,
  Select,
  Text,
  TextInput,
  ActionIcon,
  Tooltip,
  NumberInput,
  SimpleGrid,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { useEffect, useState } from "react";
import { notifications } from "@mantine/notifications";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useDisclosure } from "@mantine/hooks";

import { useProductos } from "../../../../services/productos/useProductos";
import { Schema_CrearProducto } from "../../../../services/productos/dtos/requests";
import { useCategoria } from "../../../../services/categorias/useCategoria";
import { ModalEstandar } from "../../../utils/modal-estandar";
import { RegistroCategoria } from "../../categorias/components/registro-categoria";
import { SelectUnidadMedida } from "../../../utils/select-unidad-medida";
import type { RES_Producto } from "../../../../services/productos/dtos/responses";
import { Periodo } from "../../../../shared/enums";

interface RegistroProductoProps {
  onSuccess: (producto: RES_Producto) => void;
  onCancel: () => void;
}

const PERIODOS = [
  { value: Periodo.Diario, label: "Días" },
  { value: Periodo.Semanal, label: "Semanas" },
  { value: Periodo.Mensual, label: "Meses" },
  { value: Periodo.Anual, label: "Años" },
];

const inputStyles = {
  input: "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500",
  label: "text-zinc-300 mb-1 font-medium",
  dropdown: "bg-zinc-900 border-zinc-800",
  option: "hover:bg-zinc-800 text-zinc-300 data-[selected]:bg-zinc-100 data-[selected]:text-zinc-900 rounded-md my-1",
  section: "text-zinc-400",
};

export const RegistroProducto = ({
  onSuccess,
  onCancel,
}: RegistroProductoProps) => {
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState<
    { value: string; label: string }[]
  >([]);
  const [error, setError] = useState("");

  // Category Modal
  const [openedCat, { open: openCat, close: closeCat }] = useDisclosure(false);

  const { crear } = useProductos({ setError });
  const { listar: listarCategorias } = useCategoria({ setError });

  const form = useForm({
    initialValues: {
      id_categoria: "",
      id_unidad_medida_base: "",
      nombre: "",
      es_fiscalizado: false,
      es_perecible: false,
      stock_minimo: 0,
      tiempo_espera_vencimiento: null as number | null,
      periodo_espera_vencimiento: null as string | null,
      dias_espera_vencimiento: null as number | null,
    },
    validate: zodResolver(Schema_CrearProducto as any),
  });

  useEffect(() => {
    const cargarCategorias = async () => {
      const data = await listarCategorias("Bien");
      if (data) {
        setCategorias(
          data.map((c) => ({ value: String(c.id_categoria), label: c.nombre })),
        );
      }
    };
    cargarCategorias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recalcular días de vencimiento automáticamente
  useEffect(() => {
    const tiempo = form.values.tiempo_espera_vencimiento;
    const periodo = form.values.periodo_espera_vencimiento;

    if (tiempo && periodo) {
      let f = 0;
      if (periodo === Periodo.Diario) f = 1;
      if (periodo === Periodo.Semanal) f = 7;
      if (periodo === Periodo.Mensual) f = 30;
      if (periodo === Periodo.Anual) f = 365;

      form.setFieldValue("dias_espera_vencimiento", (tiempo || 0) * f);
    } else {
      form.setFieldValue("dias_espera_vencimiento", null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.values.tiempo_espera_vencimiento, form.values.periodo_espera_vencimiento]);

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    const dto = {
      ...values,
      id_categoria: Number(values.id_categoria),
      id_unidad_medida_base: Number(values.id_unidad_medida_base),
    };

    const result = await crear(dto as any);
    if (result) {
      notifications.show({
        title: "Éxito",
        message: "Producto registrado correctamente.",
        color: "green",
      });
      onSuccess(result);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)} className="space-y-6">
      {/* 1. Categoría (Fila Completa) */}
      <div className="flex items-end gap-2 px-1">
        <Select
          label="Categoría"
          placeholder="Seleccione categoría de bienes"
          data={categorias}
          searchable
          nothingFoundMessage="No hay categorías de este tipo"
          withAsterisk
          className="flex-1"
          radius="lg"
          size="sm"
          key={form.key("id_categoria")}
          {...form.getInputProps("id_categoria")}
          classNames={inputStyles}
        />
        <Tooltip label="Crear nueva categoría" withArrow>
          <ActionIcon
            variant="filled"
            color="indigo"
            size="lg"
            className="mb-[2px] rounded-lg shadow-md hover:scale-105 transition-transform"
            onClick={openCat}
          >
            <PlusIcon className="w-5 h-5" />
          </ActionIcon>
        </Tooltip>
      </div>

      {/* 2. Unidad de Medida (Fila Completa) */}
      <div className="px-1">
        <SelectUnidadMedida
          label="Unidad de Medida"
          placeholder="Seleccione Unidad de Medida"
          withAsterisk
          soloBase={true}
          key={form.key("id_unidad_medida_base")}
          {...form.getInputProps("id_unidad_medida_base")}
          classNames={inputStyles}
        />
      </div>

      {/* 3. Nombre y Stock (Fila Compartida 2:1) */}
      <div className="grid grid-cols-12 gap-4 px-1">
        <div className="col-span-12 sm:col-span-8">
          <TextInput
            label="Nombre del Producto"
            placeholder="Ej: Dinamita 7/8 Famesa"
            withAsterisk
            radius="lg"
            size="sm"
            key={form.key("nombre")}
            {...form.getInputProps("nombre")}
            classNames={inputStyles}
          />
        </div>
        <div className="col-span-12 sm:col-span-4">
          <NumberInput
            label="Stock Mínimo"
            placeholder="0.00"
            min={0}
            decimalScale={2}
            fixedDecimalScale
            radius="lg"
            size="sm"
            key={form.key("stock_minimo")}
            {...form.getInputProps("stock_minimo")}
            classNames={inputStyles}
          />
        </div>
      </div>

      {/* 4. Indicadores y Perecibilidad */}
      <div className="mt-8 p-6 rounded-2xl border border-zinc-800 bg-zinc-900/30 space-y-6 mx-1">
        <Text size="xs" className="font-bold text-zinc-500 uppercase tracking-[0.2em]">Indicadores del Producto</Text>

        <div className="space-y-5 pt-3">
          <Checkbox
            label="Producto Fiscalizado (IQBF)"
            description="Requiere control y reporte a SUCAMEC"
            color="red"
            key={form.key("es_fiscalizado")}
            {...form.getInputProps("es_fiscalizado", { type: "checkbox" })}
            classNames={{ label: "text-zinc-200 font-medium", input: "bg-zinc-100 border-zinc-700 shadow-sm transition-colors", description: "text-zinc-500" }}
          />

          <Checkbox
            label="Producto Perecible"
            description="Habilita campos de vencimiento estimado"
            color="orange"
            key={form.key("es_perecible")}
            {...form.getInputProps("es_perecible", { type: "checkbox" })}
            classNames={{ label: "text-zinc-200 font-medium", input: "bg-zinc-100 border-zinc-700 shadow-sm transition-colors", description: "text-zinc-500" }}
          />
        </div>

        {form.values.es_perecible && (
          <div className="pt-8 mt-6 border-t border-zinc-800/50 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
            <Text size="sm" fw={700} ta="center" className="text-zinc-200 uppercase tracking-widest">Configuración de Vencimiento Estimado</Text>

            <SimpleGrid cols={2} spacing="md">
              <NumberInput
                label="Tiempo de espera"
                placeholder="Ej: 6"
                min={1}
                radius="lg"
                size="sm"
                key={form.key("tiempo_espera_vencimiento")}
                {...form.getInputProps("tiempo_espera_vencimiento")}
                classNames={inputStyles}
              />
              <Select
                label="Periodo"
                placeholder="Seleccione"
                data={PERIODOS}
                radius="lg"
                size="sm"
                key={form.key("periodo_espera_vencimiento")}
                {...form.getInputProps("periodo_espera_vencimiento")}
                classNames={inputStyles}
              />
            </SimpleGrid>

            <div className="space-y-3">
              <Text size="sm" fw={500} className="text-zinc-400 text-center">Total de días estimados</Text>
              <TextInput
                value={form.values.dias_espera_vencimiento?.toString() || "0"}
                readOnly
                radius="lg"
                size="sm"
                classNames={{
                  input: "bg-zinc-800/40 border-zinc-800 text-zinc-400 font-black text-center cursor-default tracking-widest text-lg shadow-inner",
                }}
              />
              <Text size="xs" ta="center" className="text-zinc-600 italic">Calculado automáticamente para trazabilidad</Text>
            </div>
          </div>
        )}
      </div>

      {error && <Text c="red" size="sm" fw={500} ta="center">{error}</Text>}

      <Group justify="flex-end" mt="xl" gap="md">
        <Button variant="subtle" onClick={onCancel} disabled={loading} radius="lg" className="text-zinc-400 hover:text-white">
          Cancelar
        </Button>
        <Button
          type="submit"
          loading={loading}
          radius="lg"
          size="md"
          className="bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg px-8"
        >
          Guardar Producto
        </Button>
      </Group>

      {/* Nested Modal for Category */}
      <ModalEstandar opened={openedCat} close={closeCat} title="Nueva Categoría">
        <RegistroCategoria
          onSuccess={(newCat) => {
            const newItem = { value: String(newCat.id_categoria), label: newCat.nombre };
            setCategorias((prev) => [...prev, newItem]);
            form.setFieldValue("id_categoria", newItem.value);
            closeCat();
          }}
          onCancel={closeCat}
        />
      </ModalEstandar>
    </form>
  );
};
