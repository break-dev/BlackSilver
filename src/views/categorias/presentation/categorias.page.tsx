import { Badge, Button, TextInput, Tooltip, Group } from "@mantine/core";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  Squares2X2Icon,
  ClipboardDocumentCheckIcon,
  TruckIcon,
  FireIcon,
} from "@heroicons/react/24/outline";
import { ModalEstandar } from "../../../presentation/utils/modal-estandar";
import { RegistroCategoria } from "./registro-categoria";
import { CategoriasDestinos } from "./categorias-destinos";
import { useCategoriasPage } from "../hooks/useCategoriasPage";

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
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <TextInput
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
            input:
              "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500",
          }}
        />
        <Button
          leftSection={<PlusIcon className="w-5 h-5" />}
          onClick={openCreate}
          radius="lg"
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20 shrink-0 px-6 font-semibold"
        >
          Nueva Categoría
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="h-44 rounded-2xl bg-zinc-900/30 animate-pulse border border-zinc-800/50"
            />
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categoriasFiltradas.map((cat) => {
            const isActive = cat.estado === "Activo";
            return (
              <div
                key={cat.id_categoria}
                className="group relative flex flex-col bg-zinc-900/30 border border-zinc-800/60 rounded-2xl p-4 gap-3 hover:border-zinc-700/80 hover:bg-zinc-900/50 transition-all duration-200"
              >
                <Badge
                  size="xs"
                  variant="light"
                  color={isActive ? "green" : "red"}
                  radius="sm"
                  className="absolute top-3 right-3"
                >
                  {cat.estado}
                </Badge>

                <div className="pr-14">
                  {/* Áreas Operativas Arriba */}
                  <Group gap={6} mb={8}>
                    {cat.para_mina && (
                      <Badge
                        variant="light"
                        color="blue"
                        size="xs"
                        radius="sm"
                        leftSection={<TruckIcon className="w-3 h-3" />}
                      >
                        Mina
                      </Badge>
                    )}
                    {cat.para_cocina && (
                      <Badge
                        variant="light"
                        color="orange"
                        size="xs"
                        radius="sm"
                        leftSection={<FireIcon className="w-3 h-3" />}
                      >
                        Cocina
                      </Badge>
                    )}
                  </Group>

                  <h3 className="text-sm font-bold text-white truncate group-hover:text-indigo-300 transition-colors uppercase tracking-tight">
                    {cat.nombre}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
                    {cat.descripcion || "Sin descripción proporcionada"}
                  </p>
                </div>

                {/* Control Logístico (Pattern Organigrama) */}
                {cat.es_consumible && (
                  <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 group-hover:border-indigo-400/40 transition-all duration-200 mt-1">
                    <div className="min-w-0">
                      <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block leading-none mb-0.5">
                        Destinos de Consumo
                      </span>
                      <span className="text-xs font-semibold text-zinc-300 truncate block">
                        {cat.ids_categorias_consumidoras
                          ?.split(",")
                          .filter(Boolean).length || 0}{" "}
                        Destinos
                      </span>
                    </div>

                    <Button
                      variant="filled"
                      color="indigo"
                      size="xs"
                      leftSection={<PlusIcon className="w-3 h-3" />}
                      radius="md"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 h-7 shrink-0"
                      onClick={() => handleOpenGestionDestinos(cat)}
                    >
                      Añadir
                    </Button>
                  </div>
                )}

                {/* Footer Reorganizado: Clasificación Izquierda, Tipo Requerimiento Derecha */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/50 mt-auto">
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-600 font-bold uppercase tracking-wider">
                    <ClipboardDocumentCheckIcon className="w-3.5 h-3.5" />
                    <span className="text-zinc-400 italic truncate max-w-[120px]">
                      {cat.clasificacion_bien || (
                        <span className="text-zinc-600">Sin Clasificación</span>
                      )}
                    </span>
                  </div>

                  <Tooltip label="Tipo de Requerimiento">
                    <Badge
                      size="xs"
                      variant="filled"
                      color="pink"
                      radius="md"
                      className="font-bold px-2.5 h-5 text-white shadow-sm shadow-pink-900/20"
                    >
                      {cat.tipo_requerimiento || "S.T."}
                    </Badge>
                  </Tooltip>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL CREAR CATEGORÍA */}
      <ModalEstandar
        opened={openedCreate}
        close={closeCreate}
        title="Nueva Categoría"
      >
        <RegistroCategoria
          nombre={registro.nombre}
          setNombre={registro.setNombre}
          descripcion={registro.descripcion}
          setDescripcion={registro.setDescripcion}
          tipoRequerimiento={registro.tipoRequerimiento}
          setTipoRequerimiento={registro.setTipoRequerimiento}
          clasificacionBien={registro.clasificacionBien}
          setClasificacionBien={registro.setClasificacionBien}
          esConsumible={registro.esConsumible}
          setEsConsumible={registro.setEsConsumible}
          paraCocina={registro.paraCocina}
          setParaCocina={registro.setParaCocina}
          paraMina={registro.paraMina}
          setParaMina={registro.setParaMina}
          idsConsumidoras={registro.idsConsumidoras}
          setIdsConsumidoras={registro.setIdsConsumidoras}
          onOpenDestinos={() => {
            setCategoriaSeleccionada(null); // NULL indica que estamos creando
            setIdsDestinosTemp(registro.idsConsumidoras);
            openDestinos();
          }}
          error={registro.error}
          loading={registro.loading}
          onSave={registro.handleGuardar}
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

export default CategoriasPage;
