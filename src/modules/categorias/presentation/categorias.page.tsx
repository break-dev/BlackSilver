import { Button, TextInput, Stack, Select } from "@mantine/core";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import { ModalEstandar } from "../../../presentation/utils/modal-estandar";
import { RegistroCategoria } from "./registro-categoria";
import { CategoriasDestinos } from "./components/categorias-destinos";
import { useCategoriasPage } from "../hooks/useCategoriasPage";
import { useCategoriasColumns } from "../hooks/useCategoriasColumns";
import { CategoriaGroupCard } from "./components/categoria-group-card";
import { TipoBien } from "../../../shared/enums/_generic/tipo-bien";
import { TipoProducto } from "../../../shared/enums/_generic/tipo-producto";

// Styling configuration for inputs
const INPUT_CLASSES = {
  input:
    "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500 transition-all",
  label: "text-zinc-400 text-xs font-semibold mb-1 ml-1",
  dropdown:
    "bg-zinc-950 border-zinc-800 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl",
  option:
    "text-zinc-300 hover:bg-zinc-800 hover:text-white data-[selected]:bg-indigo-600 data-[selected]:text-white font-medium transition-colors",
};

export const CategoriasPage = () => {
  const {
    loading,
    busqueda,
    setBusqueda,
    filtroClasificacion,
    setFiltroClasificacion,
    filtroDestino,
    setFiltroDestino,
    categoriasFiltradas,
    openedCreate,
    openCreate,
    closeCreate,
    categorias,
    openedDestinos,
    closeDestinos,
    categoriaSeleccionada,
    setCategoriaSeleccionada,
    idsDestinosTemp,
    setIdsDestinosTemp,
    loadingUpdate,
    categoriasParaConsumo,
    handleOpenGestionDestinos,
    handleGuardarDestinos,
    registro,
    openDestinos,
  } = useCategoriasPage();

  // Dynamic columns generator hook
  const { getColumns } = useCategoriasColumns({
    onOpenGestionDestinos: handleOpenGestionDestinos,
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header — Buscador y Filtros en fila única horizontal */}
      <div className="flex flex-col md:flex-row items-end gap-3 w-full animate-fade-in">
        <div className="flex-1 min-w-[240px] w-full">
          <TextInput
            label="Buscar Categoría"
            placeholder="Buscar por nombre, descripción..."
            leftSection={
              <MagnifyingGlassIcon className="w-4 h-4 text-zinc-500" />
            }
            value={busqueda}
            onChange={(e) => setBusqueda(e.currentTarget.value)}
            radius="lg"
            size="sm"
            classNames={INPUT_CLASSES}
          />
        </div>

        <div className="w-full md:w-52">
          <Select
            label="Clasificación"
            placeholder="Todas..."
            data={[
              { value: "all", label: "Todas" },
              { value: TipoBien.ActivoFijo, label: "Activos Fijos" },
              { value: TipoBien.Herramienta, label: "Herramientas" },
              { value: TipoBien.Suministro, label: "Suministros" },
              { value: TipoBien.Repuesto, label: "Repuestos" },
              { value: TipoBien.EPP, label: "EPPs" },
              { value: "Servicio", label: "Servicios" },
            ]}
            value={filtroClasificacion || "all"}
            onChange={(val) =>
              setFiltroClasificacion(val === "all" ? null : val)
            }
            radius="lg"
            size="sm"
            classNames={INPUT_CLASSES}
          />
        </div>

        <div className="w-full md:w-44">
          <Select
            label="Destino de Uso"
            placeholder="Todos..."
            data={[
              { value: "all", label: "Todos" },
              { value: "Mina", label: "Mina" },
              { value: "Cocina", label: "Cocina" },
            ]}
            value={filtroDestino || "all"}
            onChange={(val) => setFiltroDestino(val === "all" ? null : val)}
            radius="lg"
            size="sm"
            classNames={INPUT_CLASSES}
          />
        </div>

        <div className="shrink-0 w-full md:w-auto">
          <Button
            leftSection={<PlusIcon className="w-5 h-5" />}
            onClick={openCreate}
            radius="lg"
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20 px-6 font-semibold h-[38px] w-full md:w-auto transition-all"
          >
            Nueva Categoría
          </Button>
        </div>
      </div>

      {loading && categorias.length === 0 ? (
        <Stack align="center" gap="md" py={100}>
          <div className="relative">
            <div className="size-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
            <TagIcon className="size-6 text-indigo-400 absolute inset-0 m-auto animate-pulse" />
          </div>
          <span className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 block">
            Cargando Categorías...
          </span>
        </Stack>
      ) : categoriasFiltradas.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 border border-dashed border-zinc-800 rounded-[32px] bg-zinc-900/10 backdrop-blur-sm animate-fade-in">
          <TagIcon className="size-12 text-zinc-700 mb-4 animate-pulse" />
          <span className="text-sm font-bold text-zinc-400 uppercase tracking-widest block">
            Sin resultados
          </span>
          <span className="text-xs text-zinc-500 mt-1 block">
            No se encontraron categorías para los filtros aplicados.
          </span>
        </div>
      ) : (
        <Stack gap="xl">
          {[
            TipoBien.ActivoFijo,
            TipoBien.Herramienta,
            TipoBien.Suministro,
            TipoBien.Repuesto,
            TipoBien.EPP,
            TipoProducto.Servicio,
          ].map((clasif) => {
            const grupo = categoriasFiltradas.filter((c) => {
              if (clasif === TipoProducto.Servicio) {
                return c.tipo_producto === TipoProducto.Servicio;
              }
              return (
                c.clasificacion_bien === clasif &&
                c.tipo_producto === TipoProducto.Bien
              );
            });
            if (grupo.length === 0) return null;

            return (
              <CategoriaGroupCard
                key={clasif}
                clasif={clasif}
                grupo={grupo}
                loading={loading}
                columns={getColumns()}
              />
            );
          })}
        </Stack>
      )}

      {/* MODAL CREAR CATEGORÍA */}
      <ModalEstandar
        opened={openedCreate}
        close={closeCreate}
        title="Nueva Categoría"
        size="md"
      >
        <RegistroCategoria
          {...registro}
          onSave={registro.handleGuardar}
          onOpenDestinos={() => {
            setCategoriaSeleccionada(null); // NULL indica que estamos creando
            setIdsDestinosTemp(registro.idsConsumidoras);
            openDestinos();
          }}
          todasCategorias={categorias}
          onCancel={() => {
            closeCreate();
            registro.reset();
          }}
        />
      </ModalEstandar>

      {/* MODAL GESTIÓN DE DESTINOS*/}
      <ModalEstandar
        opened={openedDestinos}
        close={closeDestinos}
        title={
          categoriaSeleccionada
            ? `${categoriaSeleccionada.nombre}`
            : "Categorías de Destino"
        }
        size="md"
      >
        <CategoriasDestinos
          categoriaNombre={categoriaSeleccionada?.nombre || ""}
          idsDestinosTemp={idsDestinosTemp}
          setIdsDestinosTemp={setIdsDestinosTemp}
          categoriasParaConsumo={categoriasParaConsumo.filter((c) =>
            categoriaSeleccionada
              ? Number(c.value) !== categoriaSeleccionada.id_categoria
              : true,
          )}
          todasCategorias={categorias}
          onSave={handleGuardarDestinos}
          onClose={closeDestinos}
          loading={loadingUpdate}
          isCreationMode={!categoriaSeleccionada}
        />
      </ModalEstandar>
    </div>
  );
};
