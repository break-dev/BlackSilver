import { Button, Select, TextInput } from "@mantine/core";
import {
  CalendarDaysIcon,
  MagnifyingGlassIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import { IconFileSpreadsheet } from "@tabler/icons-react";
import dayjs from "dayjs";
import { MESES } from "../../../../shared/variables/meses";
import { Estado_OrdenCompra } from "../../../../shared/enums/orden-compra/orden-compra";
import { BotonRecargar } from "../../../../presentation/utils/boton-recargar";

interface FiltrosProps {
  mes: string;
  setMes: (val: string) => void;
  yearcito: string;
  setYearcito: (val: string) => void;
  search: string;
  setSearch: (val: string) => void;
  estadoFilter: string | null;
  setEstadoFilter: (val: string | null) => void;
  handleExportExcel: () => void;
  isGeneratingExcel: boolean;
  onReload?: () => void;
  loading?: boolean;
}

export const Filtros = ({
  mes,
  setMes,
  yearcito,
  setYearcito,
  search,
  setSearch,
  estadoFilter,
  setEstadoFilter,
  handleExportExcel,
  isGeneratingExcel,
  onReload,
  loading,
}: FiltrosProps) => {
  const commonClasses = {
    input:
      "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 text-white placeholder:text-zinc-500",
    label: "text-zinc-400 text-xs font-semibold mb-1 ml-1",
    dropdown: "bg-zinc-900 border-zinc-800",
    option: "text-zinc-300 hover:bg-zinc-800",
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-end w-full animate-fade-in">
      {/* Periodo */}
      <div className="w-full sm:w-44">
        <Select
          label="Mes"
          placeholder="Mes"
          leftSection={<CalendarDaysIcon className="w-4 h-4 text-zinc-400" />}
          data={MESES}
          value={mes}
          onChange={(val) => setMes(val || "")}
          radius="lg"
          size="sm"
          allowDeselect={false}
          classNames={commonClasses}
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
          classNames={commonClasses}
        />
      </div>

      <div className="w-full sm:w-48">
        <Select
          label="Estado"
          placeholder="Todos"
          leftSection={<TagIcon className="w-4 h-4 text-zinc-400" />}
          data={[
            { value: "", label: "Todos" },
            ...Object.values(Estado_OrdenCompra).map((est) => ({
              value: est,
              label: est,
            })),
          ]}
          value={estadoFilter || ""}
          onChange={(val) => setEstadoFilter(val || null)}
          radius="lg"
          size="sm"
          clearable
          classNames={commonClasses}
        />
      </div>

      {/* Buscador */}
      <div className="flex-1 min-w-[250px] w-full">
        <TextInput
          label="Búsqueda"
          placeholder="Filtrar por código, razón social o cotización..."
          leftSection={
            <MagnifyingGlassIcon className="w-4 h-4 text-zinc-400" />
          }
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          radius="lg"
          size="sm"
          classNames={{
            input:
              "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500 transition-all",
            label: "text-zinc-400 text-xs font-semibold mb-1 ml-1",
          }}
        />
      </div>

      {/* Exportar a Excel y Recargar */}
      <div className="w-full sm:w-auto mt-2 sm:mt-0 flex gap-2 items-center">
        <BotonRecargar onReload={onReload} loading={loading} />
        <Button
          onClick={handleExportExcel}
          loading={isGeneratingExcel}
          disabled={isGeneratingExcel}
          variant="light"
          color="teal"
          radius="lg"
          size="sm"
          className="w-full transition-all"
          leftSection={!isGeneratingExcel && <IconFileSpreadsheet size={18} />}
        >
          Exportar
        </Button>
      </div>
    </div>
  );
};
