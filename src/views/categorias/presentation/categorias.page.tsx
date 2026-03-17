import { useMemo } from "react";
import {
  ActionIcon,
  Badge,
  Button,
  TextInput,
  Menu,
  Tooltip,
  Text,
  Stack,
  Group,
  Select,
} from "@mantine/core";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  TrashIcon,
  PencilSquareIcon,
  EllipsisVerticalIcon,
  Squares2X2Icon,
  ClipboardDocumentCheckIcon,
  TruckIcon,
  FireIcon,
  RectangleGroupIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useTitlePage } from "../../../hooks/useTitlePage";
import { ModalEstandar } from "../../../presentation/utils/modal-estandar";
import { RegistroCategoria } from "./registro-categoria";
import { useCategorias } from "../hooks/useCategorias";
import { useRegistroCategoria } from "../hooks/useRegistroCategoria";
import { useDisclosure } from "@mantine/hooks";

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
    categorias,
  } = useCategorias();

  const [openedDestinos, { open: openDestinos, close: closeDestinos }] = useDisclosure(false);

  const categoriasParaConsumo = useMemo(() => 
    categorias.map(c => ({ value: String(c.id_categoria), label: c.nombre })),
  [categorias]);

  const registro = useRegistroCategoria({
    onSuccess: onCategoriaCreada,
    onClose: closeCreate,
  });

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

                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/50 mt-auto">
                  <div className="flex items-center gap-1 overflow-hidden">
                    {cat.para_mina && (
                      <Tooltip label="Área: Mina" position="top">
                         <div className="p-1 rounded bg-zinc-800 border border-zinc-700">
                          <TruckIcon className="w-3.5 h-3.5 text-blue-400" />
                        </div>
                      </Tooltip>
                    )}
                    {cat.para_cocina && (
                      <Tooltip label="Área: Cocina" position="top">
                         <div className="p-1 rounded bg-zinc-800 border border-zinc-700">
                          <FireIcon className="w-3.5 h-3.5 text-orange-400" />
                        </div>
                      </Tooltip>
                    )}
                    {cat.es_consumible && (
                      <Tooltip label={`Abastece a: ${cat.nombres_consumidoras || "Pendiente definir"}`} position="top" multiline w={220}>
                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-900/30 border border-indigo-500/30 text-[10px] text-indigo-300 font-bold uppercase tracking-wider">
                          <RectangleGroupIcon className="w-3 h-3" />
                          Consumible
                        </div>
                      </Tooltip>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-600 font-medium ml-auto">
                    <ClipboardDocumentCheckIcon className="w-4 h-4" />
                    <span className="truncate max-w-[80px]">
                      {cat.clasificacion_bien || "S.C."}
                    </span>
                  </div>

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
          esConsumible={registro.esConsumible}
          setEsConsumible={registro.setEsConsumible}
          paraCocina={registro.paraCocina}
          setParaCocina={registro.setParaCocina}
          paraMina={registro.paraMina}
          setParaMina={registro.setParaMina}
          idsConsumidoras={registro.idsConsumidoras}
          setIdsConsumidoras={registro.setIdsConsumidoras}
          onOpenDestinos={openDestinos}
          error={registro.error}
          loading={registro.loading}
          onSave={registro.handleGuardar}
          onCancel={() => {
            closeCreate();
            registro.reset();
          }}
        />
      </ModalEstandar>

      {/* MODAL GESTIÓN DE DESTINOS (Como en Organigrama) */}
      <ModalEstandar
        opened={openedDestinos}
        close={closeDestinos}
        title="Gestión de Destinos de Consumo"
        size="md"
      >
        <Stack gap="md">
          <div className="p-4 border border-zinc-800 bg-zinc-900/40 rounded-xl">
             <Group gap="sm" align="center" mb="md">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                <RectangleGroupIcon className="w-4 h-4 text-indigo-400" />
              </div>
              <Stack gap={0}>
                <Text size="xs" fw={700} className="text-zinc-300 uppercase tracking-wider">
                  Vincular Categoría
                </Text>
                <Text size="xs" className="text-zinc-500">
                  Seleccione a quién abastece esta categoría
                </Text>
              </Stack>
            </Group>

            <Select
              placeholder="Buscar categoría..."
              data={categoriasParaConsumo.filter(c => !registro.idsConsumidoras.includes(Number(c.value)))}
              searchable
              nothingFoundMessage="No se encontraron más categorías"
              radius="lg"
              classNames={{
                input: "bg-zinc-900/50 border-zinc-800 text-white",
              }}
              onChange={(val) => {
                if (val) {
                  registro.setIdsConsumidoras([...registro.idsConsumidoras, Number(val)]);
                }
              }}
            />
          </div>

          <Stack gap="xs">
            <Text size="xs" fw={700} className="text-zinc-500 uppercase tracking-widest px-1">
              Destinos Seleccionados ({registro.idsConsumidoras.length})
            </Text>
            
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {registro.idsConsumidoras.length === 0 ? (
                <div className="py-8 text-center bg-zinc-900/20 rounded-xl border border-dashed border-zinc-800">
                  <Text size="xs" className="text-zinc-600 italic">No hay destinos seleccionados</Text>
                </div>
              ) : (
                registro.idsConsumidoras.map(id => {
                  const cat = categorias.find(c => c.id_categoria === id);
                  return (
                    <Group key={id} justify="space-between" className="p-2.5 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors">
                      <div className="flex items-center gap-3">
                         <div className="w-2 h-2 rounded-full bg-indigo-500" />
                         <Text size="sm" fw={600} className="text-zinc-300">{cat?.nombre || 'Categoría Desconocida'}</Text>
                      </div>
                      <ActionIcon 
                         variant="subtle" 
                         color="red" 
                         size="sm"
                         onClick={() => registro.setIdsConsumidoras(registro.idsConsumidoras.filter(cid => cid !== id))}
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </ActionIcon>
                    </Group>
                  )
                })
              )}
            </div>
          </Stack>

          <Button 
            fullWidth 
            onClick={closeDestinos} 
            radius="lg"
            className="bg-zinc-200 text-zinc-900 hover:bg-white"
          >
            Aceptar
          </Button>
        </Stack>
      </ModalEstandar>
    </div>
  );
};

export default CategoriasPage;
