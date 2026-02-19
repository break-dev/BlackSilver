import { Button, Group, TextInput, Textarea, Select } from "@mantine/core";
import { useState } from "react";
import { Schema_CrearLabor } from "../../../../../services/empresas/labores/dtos/requests";
import type { RES_Labor } from "../../../../../services/empresas/labores/dtos/responses";
import { useLabores } from "../../../../../services/empresas/labores/useLabores";
import { SelectEmpresas } from "../../../../utils/select-empresas";
import { SelectConcesionAsignada } from "../../../../utils/select-concesion-asignada";
import { TIPOS_LABOR_OPTIONS, TIPOS_SOSTENIMIENTO_OPTIONS } from "../../../../../services/empresas/labores/constants";

interface RegistroLaborProps {
  onSuccess?: (labor: RES_Labor) => void;
  onCancel?: () => void;
}

export const RegistroLabor = ({
  onSuccess,
  onCancel,
}: RegistroLaborProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Form State
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tipo_labor, setTipoLabor] = useState<string | null>(null);
  const [tipo_sostenimiento, setTipoSostenimiento] = useState<string | null>(null);

  // New Flow Logic: Empresa -> Concesion(id_asignacion)
  const [idEmpresa, setIdEmpresa] = useState<string | null>(null);
  const [idAsignacion, setIdAsignacion] = useState<string | null>(null); // This is id_empresa_concesion

  // Service
  const { crear_labor } = useLabores({ setError });

  const inputClasses = {
    input: `bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 
    focus:ring-zinc-300 text-white placeholder:text-zinc-500`,
    label: "text-zinc-300 mb-1 font-medium",
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      const validation = Schema_CrearLabor.safeParse({
        id_empresa_concesion: Number(idAsignacion),
        nombre,
        descripcion,
        tipo_labor,
        tipo_sostenimiento,
      });

      if (!validation.success) {
        const firstError = validation.error.issues[0]?.message;
        setError(firstError || "Complete todos los campos requeridos.");
        return;
      }

      setIsLoading(true);
      const response = await crear_labor(validation.data);

      if (response) {
        onSuccess?.(response);
      }
    } catch (e) {
      console.error(e);
      setError("Error al guardar.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* 1. Nombre Labor */}
      <TextInput
        label="Nombre Labor"
        placeholder="Ej. Galería Esperanza Nivel 1"
        withAsterisk
        required
        radius="lg"
        size="sm"
        classNames={inputClasses}
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />

      {/* 2. Tipos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Tipo de Labor"
          placeholder="Seleccionar"
          data={TIPOS_LABOR_OPTIONS}
          value={tipo_labor}
          onChange={setTipoLabor}
          required
          radius="lg"
          size="sm"
          classNames={{
            ...inputClasses,
            dropdown: "bg-zinc-900 border-zinc-800",
            option: "hover:bg-zinc-800 text-zinc-300",
          }}
        />

        <Select
          label="Tipo Sostenimiento"
          placeholder="Seleccionar"
          data={TIPOS_SOSTENIMIENTO_OPTIONS}
          value={tipo_sostenimiento}
          onChange={setTipoSostenimiento}
          required
          radius="lg"
          size="sm"
          classNames={{
            ...inputClasses,
            dropdown: "bg-zinc-900 border-zinc-800",
            option: "hover:bg-zinc-800 text-zinc-300",
          }}
        />
      </div>

      {/* 3. Asignación Operativa (Empresa/Concesión) */}
      {/* 3. Asignación Operativa (Empresa/Concesión) */}
      <div className="bg-zinc-900/40 p-3 rounded-xl border border-zinc-800/60 mt-2 space-y-3">
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1 flex items-center gap-2">
          Asignación Operativa
        </p>

        <div className="grid grid-cols-1 gap-3 mobile:gap-2">
          <SelectEmpresas
            label="Empresa"
            required
            withAsterisk
            placeholder="Seleccione Empresa"
            value={idEmpresa}
            onChange={(val) => {
              setIdEmpresa(val);
              setIdAsignacion(null);
            }}
          />

          <SelectConcesionAsignada
            required
            withAsterisk
            label="Concesión"
            idEmpresa={idEmpresa ? Number(idEmpresa) : null}
            value={idAsignacion}
            onChange={setIdAsignacion}
          />
        </div>
      </div>

      {/* 4. Descripción */}
      <Textarea
        label="Descripción / Ubicación"
        placeholder="Detalles adicionales..."
        radius="lg"
        size="sm"
        minRows={3}
        classNames={inputClasses}
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
      />

      {error && <div className="text-red-500 text-sm mt-2 font-medium">{error}</div>}

      <Group justify="flex-end" gap="md" mt="xl">
        {onCancel && (
          <Button
            variant="subtle"
            onClick={onCancel}
            disabled={isLoading}
            radius="lg"
            size="sm"
            className="text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors"
          >
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          loading={isLoading}
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
