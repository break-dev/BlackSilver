import { Badge, Button, Loader, Select, Text } from "@mantine/core";
import { PlusIcon, UserIcon, ClockIcon } from "@heroicons/react/24/outline";
import { useGestionResponsablesMina } from "../hooks/useGestionResponsablesMina";
import type { RES_ResumenMina } from "../service/minas.responses";

interface Props {
  mina: RES_ResumenMina;
  onResponsableAsignado?: (nombreResponsable: string) => void;
}

const inputClasses = {
  input: "bg-zinc-900/50 border-zinc-800 text-white",
  label: "text-zinc-300 mb-1 font-medium",
  dropdown: "bg-zinc-900 border-zinc-800",
  option:
    "hover:bg-zinc-800 text-zinc-300 data-[selected]:bg-zinc-700 rounded-md my-0.5",
};

export const GestionResponsablesMina = ({
  mina,
  onResponsableAsignado,
}: Props) => {
  const {
    historial,
    empleadosDisponibles,
    loading,
    openedForm,
    openForm,
    closeForm,
    idEmpleado,
    setIdEmpleado,
    fechaInicio,
    setFechaInicio,
    formError,
    isSubmitting,
    asignarResponsable,
  } = useGestionResponsablesMina({
    idMina: mina.id_mina,
    onResponsableAsignado,
  });

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader size="sm" color="gray" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-white">
            Historial de Responsables
          </h3>
          <p className="text-zinc-500 text-sm">{mina.nombre}</p>
        </div>
        {!openedForm && (
          <Button
            size="xs"
            variant="light"
            color="indigo"
            leftSection={<PlusIcon className="w-4 h-4" />}
            onClick={openForm}
            className="hover:bg-indigo-900/30"
          >
            Asignar Nuevo
          </Button>
        )}
      </div>

      {/* Formulario inline */}
      {openedForm && (
        <div className="p-4 rounded-xl border border-zinc-700 bg-zinc-900/50 space-y-4">
          <Text size="sm" className="text-zinc-300 font-semibold">
            Nuevo Responsable
          </Text>

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
          />

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
              onClick={closeForm}
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
              onClick={asignarResponsable}
            >
              Confirmar
            </Button>
          </div>
        </div>
      )}

      {/* Historial */}
      {historial.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/30">
          <UserIcon className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
          <p className="text-zinc-500 text-sm">
            No hay responsables asignados aún.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {historial.map((item, idx) => {
            const isActive = item.estado?.toUpperCase() === "ACTIVO";
            return (
              <div
                key={item.id_responsable_mina || idx}
                className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 flex items-start gap-4 hover:bg-zinc-900/60 transition-all"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border ${
                    isActive
                      ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                      : "bg-zinc-800/50 text-zinc-500 border-zinc-700/50"
                  }`}
                >
                  <UserIcon className="w-6 h-6" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Text className="text-base font-bold text-white truncate">
                      {item.empleado}
                    </Text>
                    <Badge
                      color={isActive ? "indigo" : "gray"}
                      size="sm"
                      variant={isActive ? "light" : "outline"}
                    >
                      {isActive ? "ACTUAL" : "HISTÓRICO"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-zinc-500">
                    <ClockIcon className="w-4 h-4 shrink-0" />
                    <span>
                      {item.fecha_inicio}
                      <span className="mx-1.5 opacity-40">|</span>
                      {item.fecha_fin ?? "Presente"}
                    </span>
                  </div>
                  {item.dni && (
                    <p className="text-xs text-zinc-600 mt-0.5">
                      DNI: {item.dni}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
