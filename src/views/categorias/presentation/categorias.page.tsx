import {
  ActionIcon,
  Badge,
  Button,
  TextInput,
  Menu,
  Tooltip,
} from "@mantine/core";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  TrashIcon,
  PencilSquareIcon,
  EllipsisVerticalIcon,
  Squares2X2Icon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";
import { useTitlePage } from "../../../hooks/useTitlePage";
import { ModalEstandar } from "../../../presentation/utils/modal-estandar";
import { RegistroCategoria } from "./registro-categoria";
import { useCategorias } from "../hooks/useCategorias";
import { useRegistroCategoria } from "../hooks/useRegistroCategoria";

export const CategoriasPage = () => {
  useTitlePage("Categorías");

  const {
    loading,
    busqueda,
    setBusqueda,
    categoriasFiltradas,
    openedCreate,
    openCreate,
    closeCreate,
    onCategoriaCreada,
  } = useCategorias();

  const registro = useRegistroCategoria({
    onSuccess: onCategoriaCreada,
    onClose: closeCreate,
  });

  // Eliminamos const columns -> pasamos a vista Card

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <TextInput
          placeholder="Buscar categorías..."
          leftSection={
            <MagnifyingGlassIcon className="w-4 h-4 text-zinc-400" />
          }
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.currentTarget.value);
          }}
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
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20 shrink-0"
        >
          Nueva Categoría
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="h-32 rounded-2xl bg-zinc-900/30 animate-pulse border border-zinc-800/50"
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
                {/* Badge de estado en la esquina */}
                <Badge
                  size="xs"
                  variant="light"
                  color={isActive ? "green" : "red"}
                  radius="sm"
                  className="absolute top-3 right-3"
                >
                  {cat.estado}
                </Badge>

                {/* Header: Titulo + Clasificación */}
                <div className="pr-14">
                  <div className="flex items-center gap-2 mb-1">
                    <Tooltip label="Tipo de Requerimiento">
                      <Badge
                        size="xs"
                        variant="light"
                        color="indigo"
                        radius="sm"
                        className="font-bold border-indigo-500/20"
                      >
                        {cat.tipo_requerimiento || "Sin Tipo"}
                      </Badge>
                    </Tooltip>
                  </div>
                  <h3 className="text-sm font-bold text-white truncate group-hover:text-indigo-300 transition-colors">
                    {cat.nombre}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">
                    {cat.descripcion || "Sin descripción"}
                  </p>
                </div>

                {/* Footer: Stats/Clasificación y Acciones */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/50 mt-auto">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-600 font-medium">
                    <ClipboardDocumentCheckIcon className="w-4 h-4" />
                    <span className="truncate max-w-[120px]">
                      {cat.clasificacion_bien || "Sin Clasificar"}
                    </span>
                  </div>

                  {/* Acciones 3 dots */}
                  <Menu shadow="md" width={150} position="bottom-end">
                    <Menu.Target>
                      <ActionIcon variant="subtle" color="gray" size="sm">
                        <EllipsisVerticalIcon className="w-5 h-5" />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown className="bg-zinc-900 border-zinc-800">
                      <Menu.Label className="text-zinc-500">
                        Acciones
                      </Menu.Label>
                      <Menu.Item
                        leftSection={<PencilSquareIcon className="w-4 h-4" />}
                        className="text-zinc-300 hover:bg-zinc-800 hover:text-white"
                      >
                        Editar Info
                      </Menu.Item>
                      <Menu.Item
                        leftSection={<TrashIcon className="w-4 h-4" />}
                        color="red"
                        className="hover:bg-red-900/20"
                      >
                        Eliminar
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </div>
              </div>
            );
          })}
        </div>
      )}

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
          error={registro.error}
          loading={registro.loading}
          onSave={registro.handleGuardar}
          onCancel={() => {
            closeCreate();
            registro.reset();
          }}
        />
      </ModalEstandar>
    </div>
  );
};

export default CategoriasPage;
