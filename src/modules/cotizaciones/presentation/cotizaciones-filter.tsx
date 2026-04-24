import { Button, TextInput, Select } from "@mantine/core";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import { MESES } from "../../../shared/variables/meses";

interface CotizacionesFilterProps {
  busqueda: string;
  setBusqueda: (val: string) => void;
  openCreate: () => void;
  mes: number;
  year: number;
  onCambiarPeriodo: (mes: number, year: number) => void;
}

const inputClasses = {
  input:
    "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500 transition-all",
  dropdown:
    "bg-zinc-950 border-zinc-800 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl",
  option:
    "text-zinc-300 hover:bg-zinc-800 hover:text-white data-[selected]:bg-indigo-600 data-[selected]:text-white font-medium transition-colors",
};

const YEARS = Array.from({ length: 5 }, (_, i) => ({
  value: String(dayjs().year() - i),
  label: String(dayjs().year() - i),
}));

export const CotizacionesFilter = ({
  busqueda,
  setBusqueda,
  openCreate,
  mes,
  year,
  onCambiarPeriodo,
}: CotizacionesFilterProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-3 items-center">
      {/* Mes */}
      <div className="w-full md:w-40 shrink-0">
        <Select
          placeholder="Mes"
          leftSection={<CalendarDaysIcon className="w-4 h-4 text-zinc-400" />}
          data={MESES}
          value={String(mes)}
          onChange={(val) => val && onCambiarPeriodo(Number(val), year)}
          radius="lg"
          size="sm"
          classNames={inputClasses}
        />
      </div>

      {/* Año */}
      <div className="w-full md:w-28 shrink-0">
        <Select
          placeholder="Año"
          data={YEARS}
          value={String(year)}
          onChange={(val) => val && onCambiarPeriodo(mes, Number(val))}
          radius="lg"
          size="sm"
          classNames={inputClasses}
        />
      </div>

      {/* Búsqueda */}
      <TextInput
        placeholder="Buscar comparativo por proveedor o correlativo..."
        leftSection={<MagnifyingGlassIcon className="w-4 h-4 text-zinc-500" />}
        value={busqueda}
        onChange={(e) => setBusqueda(e.currentTarget.value)}
        radius="lg"
        size="sm"
        classNames={inputClasses}
        className="flex-1"
      />

      <Button
        leftSection={<PlusIcon className="w-5 h-5" />}
        onClick={openCreate}
        radius="lg"
        size="xs"
        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20 shrink-0 px-6 font-semibold"
      >
        Nueva Cotización
      </Button>
    </div>
  );
};
