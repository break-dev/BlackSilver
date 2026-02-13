import { Button, Group, TextInput } from "@mantine/core";
import { useState } from "react";
import {
  Schema_CrearConcesion,
} from "../../../../../services/empresas/concesiones/dtos/requests";
import type { RES_Concesion } from "../../../../../services/empresas/concesiones/dtos/responses";
import { useConcesion } from "../../../../../services/empresas/concesiones/useConcesion";
import { SelectTipoMineral } from "../../../../utils/select-tipo-mineral";

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

  // Form State manual (alineado con Categories)
  const [nombre, setNombre] = useState("");
  const [codigo_concesion, setCodigoConcesion] = useState("");
  const [codigo_reinfo, setCodigoReinfo] = useState("");
  const [ubigeo, setUbigeo] = useState("");
  const [tipo_mineral, setTipoMineral] = useState<"Polimetalico" | "Carbon" | undefined>(undefined);

  // Service
  const { crear_concesion } = useConcesion({ setError });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    try {
      // Validacion manual Zod (alineado con Categories)
      const validation = Schema_CrearConcesion.safeParse({
        nombre,
        codigo_concesion,
        codigo_reinfo,
        ubigeo,
        tipo_mineral,
      });

      if (!validation.success) {
        setError(
          "Por favor complete todos los campos requeridos correctamente."
        );
        console.error(validation.error);
        return;
      }

      setIsLoading(true);
      const response = await crear_concesion(validation.data);
      if (response) {
        onSuccess?.(response);
      }
    } catch (e) {
      console.error(e);
      setError("Ocurrió un error al intentar guardar.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClasses = {
    input: `bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 
    focus:ring-zinc-300 text-white placeholder:text-zinc-500`,
    label: "text-zinc-300 mb-1 font-medium",
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TextInput
        label="Nombre"
        placeholder="Ej. Mina Santa Rosa"
        withAsterisk
        required // HTML5 required
        radius="lg"
        size="sm"
        classNames={inputClasses}
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextInput
          label="Código"
          placeholder="Ej. COD-12345"
          withAsterisk
          required
          radius="lg"
          size="sm"
          classNames={inputClasses}
          value={codigo_concesion}
          onChange={(e) => setCodigoConcesion(e.target.value)}
        />

        <TextInput
          label="Cod. REINFO"
          placeholder="Ej. REINFO-999"
          withAsterisk
          required
          radius="lg"
          size="sm"
          classNames={inputClasses}
          value={codigo_reinfo}
          onChange={(e) => setCodigoReinfo(e.target.value)}
        />
      </div>

      <SelectTipoMineral
        label="Tipo de Mineral"
        placeholder="Seleccionar"
        withAsterisk
        required
        value={tipo_mineral}
        onChange={(val: string | null) => setTipoMineral(val as "Polimetalico" | "Carbon" | undefined)}
      />

      <TextInput
        label="Ubicación (Ubigeo/Coordenadas)"
        placeholder="Ej. -12.043, -77.028"
        radius="lg"
        size="sm"
        classNames={inputClasses}
        value={ubigeo}
        onChange={(e) => setUbigeo(e.target.value)}
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
