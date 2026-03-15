import { Button, Paper, Select, TextInput } from "@mantine/core";
import {
  InboxStackIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

interface LotesFilterProps {
  almacenes: { id_almacen: number; nombre: string }[];
  idAlmacen: string | null;
  setIdAlmacen: (val: string | null) => void;
  busqueda: string;
  setBusqueda: (val: string) => void;
  categoriasUnicas: (string | { value: string; label: string })[];
  filtroCategoria: string | null;
  setFiltroCategoria: (val: string | null) => void;
  productosUnicos: (string | { value: string; label: string })[];
  filtroProducto: string | null;
  setFiltroProducto: (val: string | null) => void;
  openCreate: () => void;
}

export const LotesFilter = ({
  almacenes,
  idAlmacen,
  setIdAlmacen,
  busqueda,
  setBusqueda,
  categoriasUnicas,
  filtroCategoria,
  setFiltroCategoria,
  productosUnicos,
  filtroProducto,
  setFiltroProducto,
  openCreate,
}: LotesFilterProps) => {
  return (
    <Paper
      withBorder
      p={6}
      radius="lg"
      className="bg-zinc-900/30 border-zinc-800/50 shadow-2xl backdrop-blur-md"
    >
      <div className="flex flex-col lg:flex-row gap-2 items-end">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 flex-1 w-full">
          <Select
            label="Almacén"
            placeholder="Seleccionar..."
            data={almacenes.map((a) => ({
              value: String(a.id_almacen),
              label: a.nombre,
            }))}
            size="xs"
            value={idAlmacen}
            onChange={setIdAlmacen}
            searchable
            clearable
            radius="md"
            leftSection={
              <InboxStackIcon className="w-3.5 h-3.5 text-indigo-400" />
            }
            classNames={{
              root: "flex-1",
              input:
                "bg-zinc-900/80 border-zinc-800 focus:border-indigo-500/50 text-white font-bold h-7 text-[10px] min-h-0",
              label:
                "text-zinc-500 text-[8px] font-black uppercase tracking-widest mb-0.5 px-0.5",
              dropdown:
                "bg-zinc-950 border-zinc-800 rounded-lg shadow-2xl overflow-hidden backdrop-blur-xl",
              option:
                "text-zinc-400 hover:bg-indigo-600 hover:text-white data-[selected]:bg-indigo-500 data-[selected]:text-white py-1 px-2 text-[10px] font-bold transition-colors",
            }}
          />

          <TextInput
            label="Búsqueda Inteligente"
            placeholder="Cód. Lote, Producto..."
            size="xs"
            leftSection={
              <MagnifyingGlassIcon className="w-3.5 h-3.5 text-zinc-500" />
            }
            value={busqueda}
            onChange={(e) => setBusqueda(e.currentTarget.value)}
            disabled={!idAlmacen}
            radius="md"
            classNames={{
              root: "flex-1",
              input:
                "bg-zinc-900/80 border-zinc-800 focus:border-indigo-500/50 text-white font-bold h-7 text-[10px] min-h-0",
              label:
                "text-zinc-500 text-[8px] font-black uppercase tracking-widest mb-0.5 px-0.5",
            }}
          />

          <Select
            label="Por Categoría"
            placeholder="Todas"
            size="xs"
            data={categoriasUnicas}
            value={filtroCategoria}
            onChange={setFiltroCategoria}
            searchable
            clearable
            disabled={!idAlmacen}
            radius="md"
            leftSection={
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-700 ml-1.5" />
            }
            classNames={{
              root: "flex-1",
              input:
                "bg-zinc-900/80 border-zinc-800 focus:border-indigo-500/50 text-white font-bold h-7 text-[10px] min-h-0",
              label:
                "text-zinc-500 text-[8px] font-black uppercase tracking-widest mb-0.5 px-0.5",
              dropdown:
                "bg-zinc-950 border-zinc-800 rounded-lg backdrop-blur-xl",
              option:
                "text-zinc-400 hover:bg-indigo-600 hover:text-white py-1 px-2 text-[10px] font-bold transition-colors",
            }}
          />

          <Select
            label="Por Producto"
            placeholder="Todos"
            size="xs"
            data={productosUnicos}
            value={filtroProducto}
            onChange={setFiltroProducto}
            searchable
            clearable
            disabled={!idAlmacen}
            radius="md"
            leftSection={
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-700 ml-1.5" />
            }
            classNames={{
              root: "flex-1",
              input:
                "bg-zinc-900/80 border-zinc-800 focus:border-indigo-500/50 text-white font-bold h-7 text-[10px] min-h-0",
              label:
                "text-zinc-500 text-[8px] font-black uppercase tracking-widest mb-0.5 px-0.5",
              dropdown:
                "bg-zinc-950 border-zinc-800 rounded-lg backdrop-blur-xl",
              option:
                "text-zinc-400 hover:bg-indigo-600 hover:text-white py-1 px-2 text-[10px] font-bold transition-colors",
            }}
          />
        </div>

        <Button
          leftSection={<PlusIcon className="w-3.5 h-3.5" />}
          onClick={openCreate}
          disabled={!idAlmacen}
          radius="md"
          size="xs"
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-900/50 border-0 h-7 px-4 font-black text-[9px] uppercase tracking-wider transition-all active:scale-95 w-full lg:w-auto"
        >
          Nuevo Lote
        </Button>
      </div>
    </Paper>
  );
};
