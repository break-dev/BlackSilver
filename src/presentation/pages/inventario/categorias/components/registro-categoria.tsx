import { Button, Group, TextInput, Select, Textarea } from "@mantine/core";
import { useState } from "react";
import { Schema_CrearCategoria } from "../../../../../services/inventario/categorias/dtos/requests";
import type { RES_Categoria } from "../../../../../services/inventario/categorias/dtos/responses";
import { useCategoria } from "../../../../../services/inventario/categorias/useCategoria";
import { EstadoBase, TipoRequerimiento } from "../../../../../shared/enums";

interface RegistroCategoriaProps {
  onSuccess?: (categoria: RES_Categoria) => void;
  onCancel?: () => void;
}

export const RegistroCategoria = ({
  onSuccess,
  onCancel,
}: RegistroCategoriaProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Form State
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tipo_requerimiento, setTipoRequerimiento] = useState<string | null>(
    null,
  );

  // Service
  const { crear_categoria } = useCategoria({ setError });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const validation = Schema_CrearCategoria.safeParse({
        nombre,
        descripcion,
        tipo_requerimiento,
        estado: EstadoBase.Activo,
      });

      if (!validation.success) {
        setError(
          "Por favor complete todos los campos requeridos correctamente.",
        );
        console.error(validation.error);
        return;
      }
      setIsLoading(true);
      const response = await crear_categoria(validation.data);
      if (response) {
        onSuccess?.(response);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <TextInput
        label="Nombre"
        placeholder="Ej. Materiales de Construcción"
        required
        radius="lg"
        size="sm"
        classNames={{
          input: `bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 
          focus:ring-zinc-300 text-white placeholder:text-zinc-500`,
          label: "text-zinc-300 mb-1 font-medium",
        }}
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />

      <Select
        label="Tipo de Requerimiento"
        placeholder="Seleccione tipo (Bien/Servicio)"
        data={Object.values(TipoRequerimiento)}
        value={tipo_requerimiento}
        onChange={setTipoRequerimiento}
        required
        radius="lg"
        size="sm"
        classNames={{
          input: `bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 
          focus:ring-zinc-300 text-white placeholder:text-zinc-500`,
          dropdown: "bg-zinc-900 border-zinc-800",
          option: `hover:bg-zinc-800 text-zinc-300 data-[selected]:bg-zinc-100 
          data-[selected]:text-zinc-900 rounded-md my-1`,
          label: "text-zinc-300 mb-1 font-medium",
        }}
      />

      <Textarea
        label="Descripción"
        placeholder="Breve descripción..."
        radius="lg"
        size="sm"
        minRows={3}
        classNames={{
          input: `bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 
          focus:ring-zinc-300 text-white placeholder:text-zinc-500`,
          label: "text-zinc-300 mb-1 font-medium",
        }}
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
      />

      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}

      <Group justify="flex-end" gap="md" mt="xl">
        {onCancel && (
          <Button
            variant="subtle"
            onClick={onCancel}
            disabled={isLoading}
            radius="lg"
            size="sm"
            className="text-zinc-400 hover:text-white hover:bg-zinc-800/50 
            transition-colors"
          >
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          loading={isLoading}
          radius="lg"
          size="sm"
          className="bg-linear-to-r from-zinc-100 to-zinc-300 text-zinc-900 
          font-semibold hover:from-white hover:to-zinc-200 shadow-lg border-0"
        >
          Guardar
        </Button>
      </Group>
    </form>
  );
};
