import { Button, Select, TextInput, Stack } from "@mantine/core";
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
      {/* Fila Inferior: Filtros de Selección */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <Select
          label="Almacén de consulta"
          placeholder="Seleccionar almacén..."
          data={almacenes.map((a) => ({
            value: String(a.id_almacen),
            label: a.nombre,
          }))}
          value={idAlmacen}
          onChange={setIdAlmacen}
          searchable
          clearable
          radius="lg"
          size="sm"
          leftSection={<InboxStackIcon className="w-4 h-4 text-indigo-400" />}
          classNames={inputClasses}
          comboboxProps={{
            withinPortal: true,
            zIndex: 9999,
            transitionProps: { transition: "pop", duration: 200 },
          }}
        />

        <Select
          label="Categoría"
          placeholder="Todas las categorías"
          data={categoriasUnicas}
          value={filtroCategoria}
          onChange={setFiltroCategoria}
          searchable
          clearable
          disabled={!idAlmacen}
          radius="lg"
          size="sm"
          classNames={inputClasses}
          comboboxProps={{
            withinPortal: true,
            zIndex: 9999,
            transitionProps: { transition: "pop", duration: 200 },
          }}
        />

        <Select
          label="Producto"
          placeholder="Todos los productos"
          data={productosUnicos}
          value={filtroProducto}
          onChange={setFiltroProducto}
          searchable
          clearable
          disabled={!idAlmacen}
          radius="lg"
          size="sm"
          classNames={inputClasses}
          comboboxProps={{
            withinPortal: true,
            zIndex: 9999,
            transitionProps: { transition: "pop", duration: 200 },
          }}
        />
        <TextInput
          label="Buscar registro"
          placeholder="Buscar por lote, producto, código..."
          leftSection={
            <MagnifyingGlassIcon className="w-4 h-4 text-zinc-500" />
          }
          value={busqueda}
          onChange={(e) => setBusqueda(e.currentTarget.value)}
          disabled={!idAlmacen}
          radius="lg"
          size="sm"
          classNames={inputClasses}
        />

        <Button
          leftSection={<PlusIcon className="w-5 h-5" />}
          onClick={openCreate}
          disabled={!idAlmacen}
          radius="lg"
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-700 text-white 
          shadow-lg shadow-indigo-900/20 shrink-0 px-6 font-semibold
          mt-7"
        >
          Nuevo Lote
        </Button>
      </div>
    </Stack>
  );
};
