import { TextInput, Button } from "@mantine/core";

export interface FormPersonalExternoProps {
  nombre: string;
  apellido: string;
  dni: string;
  setNombre: (val: string) => void;
  setApellido: (val: string) => void;
  setDni: (val: string) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export const FormPersonalExterno = ({
  nombre,
  apellido,
  dni,
  setNombre,
  setApellido,
  setDni,
  onSubmit,
  isSubmitting,
}: FormPersonalExternoProps) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row gap-3">
        <TextInput
          className="flex-1"
          label="Nombres"
          placeholder="Ej. Juan Carlos"
          withAsterisk
          required
          radius="lg"
          data-autofocus
          value={nombre}
          onChange={(e) => setNombre(e.currentTarget.value)}
          classNames={{
            input:
              "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500 w-full",
            label: "text-zinc-300 mb-1 font-medium text-sm",
          }}
        />
        <TextInput
          className="flex-1"
          label="Apellidos (opc.)"
          radius="lg"
          placeholder="Ej. Perez"
          value={apellido}
          onChange={(e) => setApellido(e.currentTarget.value)}
          classNames={{
            input:
              "bg-zinc-900/50  border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500 w-full",
            label: "text-zinc-300 mb-1 font-medium text-sm",
          }}
        />
      </div>

      <div className="flex flex-row items-end gap-3">
        <TextInput
          className="flex-1"
          label="DNI (opc.)"
          radius="lg"
          placeholder="Ej. 70987654"
          value={dni}
          onChange={(e) => setDni(e.currentTarget.value)}
          classNames={{
            input:
              "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500 w-full",
            label: "text-zinc-300 mb-1 font-medium text-sm",
          }}
        />
        <Button
          className="flex-1 font-bold shadow-lg shadow-indigo-500/20"
          onClick={onSubmit}
          loading={isSubmitting}
          disabled={!nombre.trim()}
          color="indigo"
          radius="lg"
        >
          Registrar
        </Button>
      </div>
    </div>
  );
};
