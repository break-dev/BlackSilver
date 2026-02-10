import { useEffect, useState } from "react";
import { Button, Group, TextInput, Select, Textarea } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { z } from "zod";
import { useLabor } from "../../../../../services/configuracion/labores/useLabor";
import {
  EstadoBase,
  TipoLabor,
  TipoSostenimiento,
} from "../../../../../shared/enums";
import type { RES_Labor } from "../../../../../services/configuracion/labores/dtos/requests";
import type { RES_Concesion } from "../../../../../services/configuracion/concesiones/dtos/responses";

// 1. Definimos el schema
const schema = z.object({
  id_concesion: z.string().min(1, "Seleccione una concesión"),
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  descripcion: z.string().optional(),
  tipo_labor: z.nativeEnum(TipoLabor, {
    message: "Seleccione un tipo de labor válido",
  }),
  tipo_sostenimiento: z.nativeEnum(TipoSostenimiento, {
    message: "Seleccione un tipo de sostenimiento válido",
  }),
});

interface FormularioLaborProps {
  labor?: RES_Labor | null;
  concesiones: RES_Concesion[];
  onSuccess: () => void;
  onCancel: () => void;
}

export const FormularioLabor = ({
  labor,
  concesiones,
  onSuccess,
  onCancel,
}: FormularioLaborProps) => {
  const [loading, setLoading] = useState(false);
  const [errorStr, setErrorStr] = useState("");
  const safeConcesiones = concesiones || []; // Safe access

  const { crear: crearLabor, editar: editarLabor } = useLabor({
    setIsLoading: setLoading,
    setError: setErrorStr,
  });

  const form = useForm({
    initialValues: {
      id: labor?.id_labor || 0,
      id_concesion: labor?.id_concesion ? String(labor.id_concesion) : "",
      nombre: labor?.nombre || "",
      descripcion: labor?.descripcion || "",
      tipo_labor: labor?.tipo_labor || ("" as TipoLabor),
      tipo_sostenimiento:
        labor?.tipo_sostenimiento || ("" as TipoSostenimiento),
    },
    validate: zodResolver(schema as any),
  });

  useEffect(() => {
    if (labor) {
      form.setValues({
        id: labor.id_labor,
        id_concesion: String(labor.id_concesion),
        nombre: labor.nombre,
        descripcion: labor.descripcion || "",
        tipo_labor: labor.tipo_labor,
        tipo_sostenimiento: labor.tipo_sostenimiento,
      });
    } else {
      form.reset();
    }
  }, [labor]);

  const handleSubmit = async (values: typeof form.values) => {
    const payload = {
      id_concesion: Number(values.id_concesion),
      nombre: values.nombre,
      descripcion: values.descripcion,
      tipo_labor: values.tipo_labor as TipoLabor,
      tipo_sostenimiento: values.tipo_sostenimiento as TipoSostenimiento,
      estado: labor ? labor.estado : EstadoBase.Activo,
    };

    let exito;
    if (labor) {
      exito = await editarLabor({ ...payload, id_labor: labor.id_labor });
    } else {
      exito = await crearLabor(payload);
    }

    if (exito) {
      notifications.show({
        title: "Éxito",
        message: labor
          ? "Labor actualizada correctamente"
          : "Labor creada correctamente",
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

  const concesionesOptions = safeConcesiones.map((c) => ({
    value: String(c.id_concesion),
    label: c.nombre,
  }));

  const tipoLaborOptions = Object.values(TipoLabor).map((val) => ({
    value: val,
    label: val,
  }));

  const tipoSostenimientoOptions = Object.values(TipoSostenimiento).map(
    (val) => ({
      value: val,
      label: val,
    }),
  );

  // Clases comunes para inputs estilo Login
  const inputClasses = {
    input:
      "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500",
    label: "text-zinc-300 mb-1 font-medium",
  };

  // Ensure data is not undefined

  const selectClasses = {
    input: inputClasses.input,
    dropdown: "bg-zinc-900 border-zinc-800",
    option:
      "hover:bg-zinc-800 text-zinc-300 data-[selected]:bg-zinc-100 data-[selected]:text-zinc-900 rounded-md my-1",
    label: inputClasses.label,
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)} className="space-y-4">
      <Select
        label="Concesión"
        placeholder="Seleccione concesión"
        data={concesionesOptions}
        searchable
        nothingFoundMessage="No se encontraron concesiones"
        required
        withCheckIcon={false}
        comboboxProps={{
          transitionProps: { transition: "pop", duration: 200 },
        }}
        radius="lg"
        size="sm"
        classNames={selectClasses}
        {...form.getInputProps("id_concesion")}
      />

      <TextInput
        label="Nombre de Labor"
        placeholder="Ej. Tajeo 105"
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
        minRows={2}
        autosize
        {...form.getInputProps("descripcion")}
      />

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Tipo de Labor"
          placeholder="Seleccione tipo"
          data={tipoLaborOptions}
          required
          withCheckIcon={false}
          comboboxProps={{
            transitionProps: { transition: "pop", duration: 200 },
          }}
          radius="lg"
          size="sm"
          classNames={selectClasses}
          {...form.getInputProps("tipo_labor")}
        />

        <Select
          label="Sostenimiento"
          placeholder="Seleccione tipo"
          data={tipoSostenimientoOptions}
          required
          withCheckIcon={false}
          comboboxProps={{
            transitionProps: { transition: "pop", duration: 200 },
          }}
          radius="lg"
          size="sm"
          classNames={selectClasses}
          {...form.getInputProps("tipo_sostenimiento")}
        />
      </div>

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
