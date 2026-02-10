import { Button, Group, TextInput } from "@mantine/core";
import { useState } from "react";
import { Schema_CrearConcesion } from "../../../../../services/empresas/concesiones/dtos/requests";
import type { RES_Concesion } from "../../../../../services/empresas/concesiones/dtos/responses";
import { useConcesion } from "../../../../../services/empresas/concesiones/useConcesion";
import { SelectEmpresas } from "../../../../utils/select-empresas";

interface RegistroConcesionProps {
  onSuccess?: (concesion: RES_Concesion) => void;
  onCancel?: () => void;
}

export const RegistroConcesion = ({
  onSuccess,
  onCancel,
}: RegistroConcesionProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [id_empresa, setIdEmpresa] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const { crear_concesion } = useConcesion({ setIsLoading, setError });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const validation = Schema_CrearConcesion.safeParse({
        id_empresa: parseInt(id_empresa || "0"),
        nombre: nombre,
      });
      if (!validation.success) {
        console.error(validation.error);
        return;
      }

      const response = await crear_concesion(validation.data);
      if (response) {
        onSuccess?.(response);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <SelectEmpresas
        required
        value={id_empresa}
        onChange={(value) => setIdEmpresa(value)}
      />

      <TextInput
        label="Nombre de Concesión"
        placeholder="Ej. Concesión Alfa 1"
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
