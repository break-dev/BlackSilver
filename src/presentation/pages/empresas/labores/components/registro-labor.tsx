import { Button, Group, TextInput, Select } from "@mantine/core";
import { useState, useEffect } from "react";
import { Schema_CrearLabor } from "../../../../../services/empresas/labores/dtos/requests";
import type { RES_Labor } from "../../../../../services/empresas/labores/dtos/responses";
import { useLabor } from "../../../../../services/empresas/labores/useLabor";
import type { RES_Concesion } from "../../../../../services/empresas/concesiones/dtos/responses";
import { useConcesion } from "../../../../../services/empresas/concesiones/useConcesion";
import { SelectEmpresas } from "../../../../utils/select-empresas";
import { TipoLabor, TipoSostenimiento } from "../../../../../shared/enums";

interface RegistroLaborProps {
  onSuccess?: (labor: RES_Labor) => void;
  onCancel?: () => void;
}

export const RegistroLabor = ({ onSuccess, onCancel }: RegistroLaborProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Form State
  const [id_empresa, setIdEmpresa] = useState<string | null>(null);
  const [id_concesion, setIdConcesion] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [tipo_labor, setTipoLabor] = useState<string | null>(null);
  const [tipo_sostenimiento, setTipoSostenimiento] = useState<string | null>(
    null,
  );
  const [concesiones, setConcesiones] = useState<RES_Concesion[]>([]);

  // Services
  const { crear_labor } = useLabor({ setError });
  const { get_by_empresa } = useConcesion({
    setError: () => {},
  });

  // Cargar concesiones cuando cambia empresa
  useEffect(() => {
    setIsLoading(true);
    setIdConcesion(null);
    setConcesiones([]);

    if (id_empresa) {
      get_by_empresa(parseInt(id_empresa))
        .then((data) => {
          if (data) setConcesiones(data);
        })
        .finally(() => setIsLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id_empresa]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const validation = Schema_CrearLabor.safeParse({
        id_concesion: parseInt(id_concesion || "0"),
        nombre: nombre,
        tipo_labor: tipo_labor,
        tipo_sostenimiento: tipo_sostenimiento,
      });

      if (!validation.success) {
        // Simple error handling for now via console/alert, or improve later
        console.error(validation.error);
        return;
      }

      const response = await crear_labor(validation.data);
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

      <Select
        label="Concesión"
        placeholder={
          id_empresa ? "Seleccione concesión" : "Primero seleccione una empresa"
        }
        data={concesiones.map((c) => ({
          value: c.id_concesion.toString(),
          label: c.nombre,
        }))}
        value={id_concesion}
        onChange={setIdConcesion}
        disabled={!id_empresa}
        searchable
        nothingFoundMessage="No se encontraron concesiones"
        withCheckIcon={false}
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

      <TextInput
        label="Nombre de Labor"
        placeholder="Ej. Nivel 340"
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

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Tipo Labor"
          placeholder="Seleccione tipo"
          data={Object.values(TipoLabor)}
          value={tipo_labor}
          onChange={setTipoLabor}
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

        <Select
          label="Sostenimiento"
          placeholder="Seleccione tipo"
          data={Object.values(TipoSostenimiento)}
          value={tipo_sostenimiento}
          onChange={setTipoSostenimiento}
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
      </div>

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
