import { Stack, Group, TextInput, Select, Button } from "@mantine/core";
import { UserPlusIcon } from "@heroicons/react/24/outline";
import { useRegistroEmpleado } from "../hooks/useRegistroEmpleado";
import type { RES_Empleado } from "../service/empleados.responses";

interface RegistroEmpleadoProps {
  onSuccess: (nuevo: RES_Empleado) => void;
}

export const RegistroEmpleado = ({ onSuccess }: RegistroEmpleadoProps) => {
  const {
    form,
    setField,
    idArea,
    setIdArea,
    empresas,
    areas,
    cargos,
    loading,
    loadingEmpresas,
    loadingAreas,
    loadingCargos,
    handleSubmit,
  } = useRegistroEmpleado(onSuccess);

  const fieldClasses = {
    input:
      "bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-500",
    label: "text-zinc-400 text-xs mb-1",
  };

  return (
    <Stack gap="lg">
      <Group grow align="flex-start">
        <TextInput
          label="Nombres"
          placeholder="Ej. Juan"
          value={form.nombre}
          onChange={(e) => setField("nombre", e.currentTarget.value)}
          classNames={fieldClasses}
          radius="lg"
          required
        />
        <TextInput
          label="Apellidos"
          placeholder="Ej. Pérez"
          value={form.apellido}
          onChange={(e) => setField("apellido", e.currentTarget.value)}
          classNames={fieldClasses}
          radius="lg"
          required
        />
      </Group>

      <Group grow align="flex-start">
        <TextInput
          label="DNI"
          placeholder="Ej. 12345678"
          value={form.dni || ""}
          onChange={(e) => setField("dni", e.currentTarget.value)}
          classNames={fieldClasses}
          radius="lg"
        />
        <TextInput
          label="Fecha de Nacimiento"
          type="date"
          value={form.fecha_nacimiento || ""}
          onChange={(e) => setField("fecha_nacimiento", e.currentTarget.value)}
          classNames={fieldClasses}
          radius="lg"
        />
      </Group>

      <Select
        label="Empresa"
        placeholder={
          loadingEmpresas ? "Cargando empresas..." : "Seleccione empresa"
        }
        data={empresas.map((e) => ({
          value: e.id_empresa.toString(),
          label: e.nombre_comercial,
        }))}
        value={form.id_empresa === 0 ? null : form.id_empresa.toString()}
        onChange={(val) => setField("id_empresa", Number(val))}
        classNames={fieldClasses}
        radius="lg"
        required
        searchable
        disabled={loadingEmpresas}
      />

      <Group grow align="flex-start">
        <Select
          label="Área"
          placeholder={loadingAreas ? "Cargando áreas..." : "Seleccione área"}
          data={areas.map((a) => ({
            value: a.id_area.toString(),
            label: a.nombre,
          }))}
          value={idArea?.toString() || null}
          onChange={(val) => setIdArea(Number(val))}
          classNames={fieldClasses}
          radius="lg"
          required
          searchable
          disabled={loadingAreas}
        />
        <Select
          label="Cargo"
          placeholder={
            loadingCargos
              ? "Cargando cargos..."
              : idArea
                ? "Seleccione cargo"
                : "Primero seleccione área"
          }
          data={cargos.map((c) => ({
            value: c.id_cargo.toString(),
            label: c.nombre,
          }))}
          value={form.id_cargo === 0 ? null : form.id_cargo.toString()}
          onChange={(val) => setField("id_cargo", Number(val))}
          classNames={fieldClasses}
          radius="lg"
          required
          disabled={!idArea || loadingCargos}
          searchable
        />
      </Group>

      <Button
        fullWidth
        onClick={handleSubmit}
        loading={loading}
        radius="lg"
        className="bg-indigo-600 hover:bg-indigo-700 h-[42px] mt-2"
        leftSection={<UserPlusIcon className="w-5 h-5" />}
      >
        Registrar Empleado
      </Button>
    </Stack>
  );
};
