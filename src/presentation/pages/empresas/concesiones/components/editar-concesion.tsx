import { useEffect, useState } from "react";
import { Button, Group, TextInput, Select } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import type { RES_Concesion } from "../../../../../services/empresas/concesiones/dtos/responses";

// Formulario para registrar o editar una concesión
interface FormularioConcesionProps {
  concesion?: RES_Concesion | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const FormularioConcesion = ({
  concesion,
  empresas,
  onSuccess,
  onCancel,
}: FormularioConcesionProps) => {
  const [loading, setLoading] = useState(false);
  const [errorStr, setErrorStr] = useState("");

  const { crear: crearConcesion, editar: editarConcesion } = useConcesion({
    setIsLoading: setLoading,
    setError: setErrorStr,
  });

  const form = useForm({
    initialValues: {
      id: concesion?.id_concesion || 0,
      id_empresa: concesion?.id_empresa ? String(concesion.id_empresa) : "",
      nombre: concesion?.nombre || "",
    },
    validate: zodResolver(schema as any),
  });

  useEffect(() => {
    if (concesion) {
      form.setValues({
        id: concesion.id_concesion,
        id_empresa: String(concesion.id_empresa),
        nombre: concesion.nombre,
      });
    } else {
      form.reset();
    }
  }, [concesion]);

  const handleSubmit = async (values: typeof form.values) => {
    const payload = {
      id_empresa: Number(values.id_empresa),
      nombre: values.nombre,
      estado: concesion ? concesion.estado : EstadoBase.Activo,
    };

    let exito;
    if (concesion) {
      const dto: DTO_EditarConcesion = {
        ...payload,
        id_concesion: concesion.id_concesion,
      };
      const resultado = await editarConcesion(dto);
      exito = !!resultado;
    } else {
      const nuevaConcesion = await crearConcesion(payload);
      exito = !!nuevaConcesion;
    }

    if (exito) {
      notifications.show({
        title: "Éxito",
        message: concesion
          ? "Actualizada correctamente"
          : "Creada correctamente",
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

  const empresasOptions = empresas.map((e) => ({
    value: String(e.id),
    label: `${e.nombre_comercial} (${e.ruc})`,
  }));

  return (
    <form onSubmit={form.onSubmit(handleSubmit)} className="space-y-6">
      <Select
        label="Empresa"
        placeholder="Seleccione empresa"
        data={empresasOptions}
        searchable
        nothingFoundMessage="No se encontraron empresas"
        required
        withCheckIcon={false}
        comboboxProps={{
          transitionProps: { transition: "pop", duration: 200 },
        }}
        radius="lg"
        size="sm"
        classNames={{
          input:
            "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500",
          dropdown: "bg-zinc-900 border-zinc-800",
          option:
            "hover:bg-zinc-800 text-zinc-300 data-[selected]:bg-zinc-100 data-[selected]:text-zinc-900 rounded-md my-1",
          label: "text-zinc-300 mb-1 font-medium",
        }}
        {...form.getInputProps("id_empresa")}
      />

      <TextInput
        label="Nombre de Concesión"
        placeholder="Ej. Concesión Alfa 1"
        required
        radius="lg"
        size="sm"
        classNames={{
          input:
            "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500",
          label: "text-zinc-300 mb-1 font-medium",
        }}
        {...form.getInputProps("nombre")}
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
