import { Button, Select, Loader } from "@mantine/core";
import { useRegistroResponsable } from "../hooks/useRegistroResponsable";
import type { RES_HistorialResponsable } from "../service/minas.responses";

interface Props {
  idMina: number;
  onSuccess: (nueva: RES_HistorialResponsable) => void;
  onCancel: () => void;
}

const inputClasses = {
  input: "bg-zinc-900/50 border-zinc-800 text-white",
  label: "text-zinc-300 mb-1 font-medium",
  dropdown: "bg-zinc-900 border-zinc-800",
  option:
    "hover:bg-zinc-800 text-zinc-300 data-[selected]:bg-zinc-700 rounded-md my-0.5",
};

export const RegistroResponsable = ({ idMina, onSuccess, onCancel }: Props) => {
  const {
    empleadosDisponibles,
    loadingDisponibles,
    idEmpleado,
    setIdEmpleado,
    fechaInicio,
    setFechaInicio,
    formError,
    isSubmitting,
    handleSubmit,
    handleCancel,
  } = useRegistroResponsable({ idMina, onSuccess, onCancel });

  return (
    <div className="p-4 rounded-xl border border-zinc-700 bg-zinc-900/50 space-y-4">
      <div className="relative">
        <Select
          label="Empleado"
          placeholder="Seleccione un empleado"
          data={empleadosDisponibles.map((e) => ({
            value: String(e.id_empleado),
            label: e.empleado,
          }))}
          value={idEmpleado ? String(idEmpleado) : null}
          onChange={(v) => setIdEmpleado(v ? parseInt(v) : null)}
          searchable
          nothingFoundMessage="Sin empleados disponibles"
          classNames={inputClasses}
          disabled={loadingDisponibles}
          rightSection={loadingDisponibles && <Loader size={14} color="gray" />}
        />
      </div>

      <div>
        <label className="text-zinc-300 text-sm font-medium block mb-1">
          Fecha de inicio
        </label>
        <input
          type="date"
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.currentTarget.value)}
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 text-white px-3 py-2 text-sm focus:outline-none focus:border-zinc-400"
        />
      </div>

      {formError && <p className="text-red-400 text-sm">{formError}</p>}

      <div className="flex gap-2 justify-end">
        <Button
          size="xs"
          variant="subtle"
          onClick={handleCancel}
          disabled={isSubmitting}
          className="text-zinc-400 hover:text-white"
        >
          Cancelar
        </Button>
        <Button
          size="xs"
          variant="light"
          color="indigo"
          loading={isSubmitting}
          onClick={handleSubmit}
        >
          Confirmar
        </Button>
      </div>
    </div>
  );
};
