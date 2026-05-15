import { Button, TextInput, Group, Skeleton, Stack } from "@mantine/core";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import { ModalEstandar } from "../../../presentation/utils/modal-estandar";
import { RegistroCategoria } from "./registro-categoria";
import { CategoriasDestinos } from "./components/categorias-destinos";
import { CategoriaCard } from "./components/categoria-card";
import { useCategoriasPage } from "../hooks/useCategoriasPage";
import { TipoBien } from "../../../shared/enums/_generic/tipo-bien";
import { enPlural } from "../../../shared/functions/en-plural";
import { TipoProducto } from "../../../shared/enums/_generic/tipo-producto";

export const CategoriasPage = () => {
  const {
    loading,
    busqueda,
    setBusqueda,
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header — Buscador y Nueva Categoría */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end justify-between">
        <TextInput
          label="Buscar Categoría"
          placeholder="Buscar categorías por nombre..."
          leftSection={
            <MagnifyingGlassIcon className="w-4 h-4 text-zinc-400" />
          }
          value={busqueda}
          onChange={(e) => setBusqueda(e.currentTarget.value)}
          className="flex-1 min-w-64"
          radius="lg"
          size="sm"
          classNames={{
            label: "text-zinc-400 text-xs font-semibold mb-1 ml-1",
            input:
              "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500 transition-all",
          }}
        />
        <Button
          leftSection={<PlusIcon className="w-5 h-5" />}
          onClick={openCreate}
          radius="lg"
          size="sm"
          loading={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20 shrink-0 px-6 font-semibold h-[38px]"
        >
          Nueva Categoría
        </Button>
      </div>

      {loading && categorias.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="h-44 rounded-2xl bg-zinc-900/30 border border-zinc-800/50 p-4"
            >
              <Stack gap="xs">
                <Group justify="space-between">
                  <Skeleton h={14} w={80} radius="sm" />
                  <Skeleton h={16} w={40} radius="sm" />
                </Group>
                <Skeleton h={18} w="90%" radius="sm" mt={10} />
                <Skeleton h={12} w="100%" radius="sm" />
                <Skeleton h={12} w="60%" radius="sm" />

                <div className="mt-auto pt-2 border-t border-zinc-800/50">
                  <Group justify="space-between">
                    <Skeleton h={10} w={60} radius="sm" />
                    <Skeleton h={16} w={30} radius="sm" />
                  </Group>
                </div>
              </Stack>
            </div>
          ))}
        </div>
      ) : categoriasFiltradas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-zinc-900/20 rounded-2xl border border-dashed border-zinc-800">
          <Squares2X2Icon className="w-10 h-10 text-zinc-700 mb-3" />
          <p className="text-zinc-500 text-sm font-medium">
            No se encontraron categorías registradas
          </p>
        </div>
      ) : (
        <Stack gap="xl">
          {[
            TipoBien.ActivoFijo,
            TipoBien.Herramienta,
            TipoBien.Suministro,
            TipoBien.Repuesto,
            // TipoBien.Material,
            TipoBien.EPP,
            TipoProducto.Servicio,
          ].map((clasif) => {
            const grupo = categoriasFiltradas.filter((c) => {
              if (clasif === TipoProducto.Servicio)
                return c.tipo_producto === TipoProducto.Servicio;
              return (
                c.clasificacion_bien === clasif &&
                c.tipo_producto === TipoProducto.Bien
              );
            });
            if (grupo.length === 0) return null;

            const labelClasif =
              clasif === TipoProducto.Servicio ? "Servicios" : clasif;

            return (
              <Stack key={clasif} gap="md">
                <div className="flex items-center gap-3 px-1">
                  <div className="h-px flex-1 bg-zinc-800" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                    {enPlural(labelClasif)} ({grupo.length})
                  </span>
                  <div className="h-px flex-1 bg-zinc-800" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {grupo.map((cat) => (
                    <CategoriaCard
                      key={cat.id_categoria}
                      cat={cat}
                      onAddDestino={handleOpenGestionDestinos}
                    />
                  ))}
                </div>
              </Stack>
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
