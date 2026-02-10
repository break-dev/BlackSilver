import { useEffect, useState } from "react";
import { Button, Group, TextInput, Select, Textarea } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { z } from "zod";
import { EstadoBase, TipoRequerimiento } from "../../../../../shared/enums";
import { useCategoria } from "../../../../../services/inventario/categorias/useCategoria";
import type { RES_Categoria } from "../../../../../services/inventario/categorias/dtos/responses";

// Schema de validación Zod
const schema = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  descripcion: z.string().optional(),
  tipo_requerimiento: z.nativeEnum(TipoRequerimiento, {
    message: "Seleccione un tipo válido",
  }),
});

interface FormularioCategoriaProps {
  categoria?: RES_Categoria | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const FormularioCategoria = ({
  categoria,
  onSuccess,
  onCancel,
}: FormularioCategoriaProps) => {
  const [loading, setLoading] = useState(false);
  const [errorStr, setErrorStr] = useState("");

  const { crear: crearCategoria, editar: editarCategoria } = useCategoria({
    setIsLoading: setLoading,
    setError: setErrorStr,
  });

  const form = useForm({
    initialValues: {
      id: categoria?.id || 0,
      nombre: categoria?.nombre || "",
      descripcion: categoria?.descripcion || "",
      tipo_requerimiento:
        categoria?.tipo_requerimiento || ("" as TipoRequerimiento),
    },
    validate: zodResolver(schema as any),
  });

  useEffect(() => {
    if (categoria) {
      form.setValues({
        id: categoria.id,
        nombre: categoria.nombre,
        descripcion: categoria.descripcion || "",
        tipo_requerimiento: categoria.tipo_requerimiento,
      });
    } else {
      form.reset();
    }
  }, [categoria]);

  const handleSubmit = async (values: typeof form.values) => {
    // Aseguramos que el estado se respeta si ya existe
    const payload = {
      nombre: values.nombre,
      descripcion: values.descripcion || "",
      tipo_requerimiento: values.tipo_requerimiento as TipoRequerimiento,
      estado: categoria ? categoria.estado : EstadoBase.Activo,
    };

    let exito;
    if (categoria) {
      // Edición
      exito = await editarCategoria({ ...payload, id: categoria.id });
    } else {
      // Creación
      exito = await crearCategoria(payload);
    }

    if (exito) {
      notifications.show({
        title: "Éxito",
        message: categoria
          ? "Categoría actualizada correctamente"
          : "Categoría creada correctamente",
        color: "green",
      });
      onSuccess();
    } else {
      notifications.show({
        title: "Error",
        message: errorStr || "Ocurrió un error al guardar",
        color: "red",
      });
    }
  };

  // Opciones para el Select (Value: MAYÚSCULAS para Backend, Label: Title Case para UI)
  const tipoRequerimientoOptions = [
    { value: TipoRequerimiento.Bien, label: "Bien" },
    { value: TipoRequerimiento.Servicio, label: "Servicio" },
  ];

  // Estilos personalizados para los inputs (matching Labores style)
  const inputClasses = {
    input:
      "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500",
    label: "text-zinc-300 mb-1 font-medium",
  };

  const selectClasses = {
    input: inputClasses.input,
    dropdown: "bg-zinc-900 border-zinc-800",
    option:
      "hover:bg-zinc-800 text-zinc-300 data-[selected]:bg-zinc-100 data-[selected]:text-zinc-900 rounded-md my-1",
    label: inputClasses.label,
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)} className="space-y-4">
      <TextInput
        label="Nombre de Categoría"
        placeholder="Ej. Insumos Químicos"
        description="Nombre descriptivo para la nueva categoría"
        required
        radius="lg"
        size="sm"
        classNames={inputClasses}
        {...form.getInputProps("nombre")}
      />

      <Textarea
        label="Descripción"
        placeholder="Descripción opcional..."
        radius="lg"
        size="sm"
        classNames={inputClasses}
        minRows={3}
        autosize
        {...form.getInputProps("descripcion")}
      />

      <Select
        label="Tipo de Requerimiento"
        placeholder="Seleccione tipo"
        description="Define si esta categoría agrupa Bienes o Servicios"
        data={tipoRequerimientoOptions}
        required
        withCheckIcon={false}
        comboboxProps={{
          transitionProps: { transition: "pop", duration: 200 },
        }}
        radius="lg"
        size="sm"
        classNames={selectClasses}
        {...form.getInputProps("tipo_requerimiento")}
      />

      <Group justify="flex-end" gap="md" mt="xl">
        <Button
          variant="subtle"
          onClick={onCancel}
          disabled={loading}
          radius="lg"
          size="sm"
          className="text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          loading={loading}
          radius="lg"
          size="sm"
          className="bg-linear-to-r from-zinc-100 to-zinc-300 text-zinc-900 font-semibold hover:from-white hover:to-zinc-200 shadow-lg border-0"
        >
          Guardar
        </Button>
      </Group>
    </form>
  );
};
