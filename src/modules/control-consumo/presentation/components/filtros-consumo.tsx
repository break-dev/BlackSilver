import { Select, TextInput, Loader } from "@mantine/core";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import type { RES_ActivoFijoDisponible } from "../../../../service/responses/activo-fijo";
import { MESES } from "../../../../shared/variables/meses";

interface FiltrosConsumoProps {
  idActivoFijo: string | null;
  setIdActivoFijo: (val: string | null) => void;
  activos: RES_ActivoFijoDisponible[];
  loadingActivos: boolean;
  mes: number;
  setMes: (val: number) => void;
  anio: number;
  setAnio: (val: number) => void;
  busqueda: string;
  setBusqueda: (val: string) => void;
}

export const FiltrosConsumo = ({
  idActivoFijo,
  setIdActivoFijo,
  activos,
  loadingActivos,
  mes,
  setMes,
  anio,
  setAnio,
  busqueda,
  setBusqueda,
}: FiltrosConsumoProps) => {
  const currentYear = new Date().getFullYear();
  const yearsList = Array.from({ length: 6 }, (_, i) => {
    const y = currentYear - 4 + i;
    return { value: String(y), label: String(y) };
  });

  const inputClasses = {
    input:
      "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500 transition-all",
    label: "text-zinc-400 text-xs font-semibold mb-1 ml-1",
    dropdown:
      "bg-zinc-950 border-zinc-800 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl",
    option:
      "text-zinc-300 hover:bg-zinc-800 hover:text-white data-[selected]:bg-indigo-600 data-[selected]:text-white font-medium transition-colors",
  };

  return (
    <div className="flex flex-col xl:flex-row items-end gap-3 w-full animate-fade-in">
      {/* Seleccionar Activo Fijo */}
      <div className="w-full xl:w-80">
        <Select
          label="Activo Fijo"
          placeholder={
            loadingActivos ? "Cargando activos..." : "Seleccione un activo..."
          }
          data={activos.map((a) => ({
            value: String(a.id_activo),
            label: `${a.correlativo} - ${a.producto}`,
          }))}
          value={idActivoFijo}
          onChange={setIdActivoFijo}
          searchable
          disabled={loadingActivos}
          rightSection={
            loadingActivos ? <Loader size={12} color="indigo" /> : null
          }
          radius="lg"
          size="sm"
          classNames={inputClasses}
          comboboxProps={{
            withinPortal: true,
            zIndex: 9999,
            transitionProps: { transition: "pop", duration: 200 },
          }}
        />
      </div>

      {/* Mes */}
      <div className="w-full sm:w-44">
        <Select
          label="Mes"
          data={MESES}
          value={String(mes)}
          onChange={(val) => setMes(val ? Number(val) : 1)}
          radius="lg"
          size="sm"
          classNames={inputClasses}
          comboboxProps={{
            withinPortal: true,
            zIndex: 9999,
            transitionProps: { transition: "pop", duration: 200 },
          }}
        />
      </div>

      {/* Año */}
      <div className="w-full sm:w-28">
        <Select
          label="Año"
          data={yearsList}
          value={String(anio)}
          onChange={(val) => setAnio(val ? Number(val) : currentYear)}
          radius="lg"
          size="sm"
          classNames={inputClasses}
          comboboxProps={{
            withinPortal: true,
            zIndex: 9999,
            transitionProps: { transition: "pop", duration: 200 },
          }}
        />
      </div>

      {/* Buscador (filtra los consumos en tiempo real) */}
      <div className="flex-1 w-full min-w-[200px]">
        <TextInput
          label="Buscar en Consumo"
          placeholder="Buscar producto, requerimiento, contratista..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.currentTarget.value)}
          leftSection={
            <MagnifyingGlassIcon className="w-4 h-4 text-zinc-500" />
          }
          radius="lg"
          size="sm"
          classNames={inputClasses}
        />
      </div>
    </div>
  );
};
