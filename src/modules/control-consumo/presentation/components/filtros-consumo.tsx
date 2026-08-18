import { Select, TextInput, Loader, Button } from "@mantine/core";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { IconFileSpreadsheet } from "@tabler/icons-react";
import type { RES_Mina } from "../../../../service/responses/mina";
import type { RES_Almacen } from "../../../../service/responses/almacen";
import { MESES } from "../../../../shared/variables/meses";
import { BotonRecargar } from "../../../../presentation/utils/boton-recargar";

interface FiltrosConsumoProps {
  idMina: string | null;
  setIdMina: (val: string | null) => void;
  minas: RES_Mina[];
  loadingMinas: boolean;
  idAlmacen: string | null;
  setIdAlmacen: (val: string | null) => void;
  almacenes: RES_Almacen[];
  loadingAlmacenes: boolean;
  mes: number;
  setMes: (val: number) => void;
  anio: number;
  setAnio: (val: number) => void;
  busqueda: string;
  setBusqueda: (val: string) => void;
  onReload?: () => void | Promise<void>;
  loading?: boolean;
  onExportExcel?: () => void;
  exportingExcel?: boolean;
  exportDisabled?: boolean;
}

export const FiltrosConsumo = ({
  idMina,
  setIdMina,
  minas,
  loadingMinas,
  idAlmacen,
  setIdAlmacen,
  almacenes,
  loadingAlmacenes,
  mes,
  setMes,
  anio,
  setAnio,
  busqueda,
  setBusqueda,
  onReload,
  loading = false,
  onExportExcel,
  exportingExcel = false,
  exportDisabled = false,
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
    <div className="flex flex-col md:flex-row items-end gap-3 w-full animate-fade-in">
      {/* Seleccionar Mina */}
      <div className="w-full md:w-56">
        <Select
          label="Mina"
          placeholder={
            loadingMinas ? "Cargando minas..." : "Todas las minas"
          }
          data={minas.map((m) => ({
            value: String(m.id_mina),
            label: m.nombre,
          }))}
          value={idMina}
          onChange={setIdMina}
          searchable
          clearable
          disabled={loadingMinas}
          rightSection={
            loadingMinas ? <Loader size={12} color="indigo" /> : null
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

      {/* Seleccionar Almacén */}
      <div className="w-full md:w-56">
        <Select
          label="Almacén"
          placeholder={
            loadingAlmacenes ? "Cargando almacenes..." : "Todos los almacenes"
          }
          data={almacenes.map((a) => ({
            value: String(a.id_almacen),
            label: a.nombre,
          }))}
          value={idAlmacen}
          onChange={setIdAlmacen}
          searchable
          clearable
          disabled={loadingAlmacenes}
          rightSection={
            loadingAlmacenes ? <Loader size={12} color="indigo" /> : null
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
      <div className="w-full md:w-36">
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
      <div className="w-full md:w-28">
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
      <div className="flex-1 min-w-[200px] w-full">
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

      {/* Acciones: recargar y exportar */}
      <div className="flex items-end gap-2">
        {onReload && <BotonRecargar onReload={onReload} loading={loading} />}
        {onExportExcel && (
          <Button
            color="green.7"
            onClick={onExportExcel}
            loading={exportingExcel}
            disabled={exportDisabled || exportingExcel}
            radius="lg"
            className="h-9 transition-all px-4 disabled:opacity-50"
            leftSection={
              !exportingExcel && <IconFileSpreadsheet size={18} />
            }
          >
            Exportar Excel
          </Button>
        )}
      </div>
    </div>
  );
};
