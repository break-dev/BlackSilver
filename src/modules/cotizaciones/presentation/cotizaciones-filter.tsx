import { Button, TextInput, Stack } from "@mantine/core";
import {
  MagnifyingGlassIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

interface CotizacionesFilterProps {
  busqueda: string;
  setBusqueda: (val: string) => void;
  openCreate: () => void;
}

export const CotizacionesFilter = ({
  busqueda,
  setBusqueda,
  openCreate,
}: CotizacionesFilterProps) => {
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
    <Stack gap="md">
      <div className="flex flex-col md:flex-row gap-3 items-center">
        <TextInput
          placeholder="Buscar comparativo por correlativo o referencia..."
          leftSection={
            <MagnifyingGlassIcon className="w-4 h-4 text-zinc-500" />
          }
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
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-700 text-white 
          shadow-lg shadow-indigo-900/20 shrink-0 px-6 font-semibold"
        >
          Nueva Cotización
        </Button>
      </div>
    </Stack>
  );
};
