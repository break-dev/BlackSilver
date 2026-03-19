import {
  TextInput,
  Select,
  Button,
  Stack,
  Group,
  PasswordInput,
} from "@mantine/core";
import {
  UserIcon,
  ShieldCheckIcon,
  IdentificationIcon,
  KeyIcon,
} from "@heroicons/react/24/outline";
import { useRegistroCuenta } from "../hooks/useRegistroCuenta";
import type { RES_Cuenta } from "../service/cuentas.responses";

interface RegistroCuentaProps {
  cuentaEdit: RES_Cuenta | null;
  onClose: () => void;
  refresh: () => void;
}

export const RegistroCuenta = ({
  cuentaEdit,
  onClose,
  refresh,
}: RegistroCuentaProps) => {
  const {
    form,
    setForm,
    loading,
    handleGuardar,
    roles,
    empleadosSinCuenta,
    isEdit,
  } = useRegistroCuenta(cuentaEdit, onClose, refresh);

  const fieldClasses = {
    input:
      "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500 transition-all",
    label: "text-zinc-300 mb-1 font-medium",
  };

  return (
    <Stack gap="md">
      <Group grow>
        <Select
          label="Empleado"
          placeholder="Seleccione un empleado"
          data={
            isEdit && cuentaEdit
              ? [
                  {
                    value: cuentaEdit.id_empleado.toString(),
                    label: `${cuentaEdit.nombre_empleado} ${cuentaEdit.apellido_empleado}`,
                  },
                ]
              : empleadosSinCuenta.map((e) => ({
                  value: e.id.toString(),
                  label: `${e.apellido}, ${e.nombre}`,
                }))
          }
          value={form.id_empleado ? form.id_empleado.toString() : null}
          onChange={(val) => setForm({ id_empleado: Number(val) })}
          disabled={isEdit || loading}
          radius="lg"
          required
          withAsterisk
          leftSection={<IdentificationIcon className="w-4 h-4 text-zinc-500" />}
          classNames={fieldClasses}
          searchable
        />

        <Select
          label="Rol de Usuario"
          placeholder="Seleccione un rol"
          data={roles.map((r) => ({ value: r.id.toString(), label: r.nombre }))}
          value={form.id_rol ? form.id_rol.toString() : null}
          onChange={(val) => setForm({ id_rol: Number(val) })}
          radius="lg"
          required
          withAsterisk
          leftSection={<ShieldCheckIcon className="w-4 h-4 text-zinc-500" />}
          classNames={fieldClasses}
          disabled={isEdit || loading}
        />
      </Group>

      <Group grow>
        <TextInput
          label="Nombre de Usuario"
          placeholder="Ej: jdoe"
          value={form.username}
          onChange={(e) => setForm({ username: e.currentTarget.value })}
          radius="lg"
          required
          withAsterisk
          leftSection={<UserIcon className="w-4 h-4 text-zinc-500" />}
          classNames={fieldClasses}
          disabled={isEdit || loading}
        />

        <PasswordInput
          label={isEdit ? "Nueva Contraseña" : "Contraseña"}
          placeholder={isEdit ? "Nueva contraseña..." : "Mínimo 6 caracteres"}
          value={form.password}
          onChange={(e) => setForm({ password: e.currentTarget.value })}
          radius="lg"
          required={!isEdit}
          withAsterisk={!isEdit}
          leftSection={<KeyIcon className="w-4 h-4 text-zinc-500" />}
          classNames={{
            ...fieldClasses,
            innerInput: "text-white placeholder:text-zinc-500",
            visibilityToggle:
              "text-zinc-500 hover:text-zinc-300 transition-colors",
          }}
          disabled={loading}
        />
      </Group>

      <Group justify="flex-end" gap="md" mt="xl">
        <Button
          variant="subtle"
          onClick={onClose}
          disabled={loading}
          radius="lg"
          size="sm"
          className="text-zinc-400 hover:text-white hover:bg-zinc-800/50"
        >
          Cancelar
        </Button>
        <Button
          onClick={handleGuardar}
          loading={loading}
          radius="lg"
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20 px-8"
        >
          {isEdit ? "Guardar Cambios" : "Registrar Cuenta"}
        </Button>
      </Group>
    </Stack>
  );
};
