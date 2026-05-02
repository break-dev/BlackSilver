import { Select, TextInput } from "@mantine/core";
import { Calendar, Search } from "lucide-react";
import dayjs from "dayjs";
import { MESES } from "../../../../shared/variables/meses";

interface FiltrosProps {
  mes: string;
  setMes: (val: string) => void;
  yearcito: string;
  setYearcito: (val: string) => void;
  search: string;
  setSearch: (val: string) => void;
}

export const Filtros = ({
  mes,
  setMes,
  yearcito,
  setYearcito,
  search,
  setSearch,
}: FiltrosProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end w-full animate-fade-in">
      {/* Periodo */}
      <div className="w-full sm:w-44">
        <Select
          label="Mes"
          placeholder="Mes"
          leftSection={<Calendar size={16} className="text-zinc-500" />}
          data={MESES}
          value={mes}
          onChange={(val) => setMes(val || "")}
          radius="lg"
          size="sm"
          allowDeselect={false}
          classNames={{
            input: "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 text-white placeholder:text-zinc-500",
            label: "text-zinc-400 text-xs font-semibold mb-1 ml-1",
            dropdown: "bg-zinc-900 border-zinc-800",
            option: "text-zinc-300 hover:bg-zinc-800",
          }}
        />
      </div>

      <div className="w-full sm:w-32">
        <Select
          label="Año"
          placeholder="Año"
          data={Array.from({ length: 5 }, (_, i) => ({
            value: String(dayjs().year() - i),
            label: String(dayjs().year() - i),
          }))}
          value={yearcito}
          onChange={(val) => setYearcito(val || "")}
          radius="lg"
          size="sm"
          allowDeselect={false}
          classNames={{
            input: "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 text-white",
            label: "text-zinc-400 text-xs font-semibold mb-1 ml-1",
            dropdown: "bg-zinc-900 border-zinc-800",
            option: "text-zinc-300 hover:bg-zinc-800",
          }}
        />
      </div>

      {/* Buscador */}
      <div className="flex-1 min-w-[250px] w-full">
        <TextInput
          label="Búsqueda"
          placeholder="Filtrar por código, razón social o cotización..."
          leftSection={<Search size={16} className="text-zinc-500" />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          radius="lg"
          size="sm"
          classNames={{
            input: "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500 transition-all",
            label: "text-zinc-400 text-xs font-semibold mb-1 ml-1",
          }}
        />
      </div>
    </div>
  );
};
