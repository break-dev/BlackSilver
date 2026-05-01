import {
  ActionIcon,
  Badge,
  Button,
  TextInput,
  Tooltip,
  ScrollArea,
  Skeleton,
} from "@mantine/core";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  UserIcon,
  BuildingStorefrontIcon,
  RectangleStackIcon,
} from "@heroicons/react/24/outline";
import { useTitlePage } from "../../../hooks/useTitlePage";
import { ModalEstandar } from "../../../presentation/utils/modal-estandar";
import { RegistroAlmacen } from "./registro-almacen";
import { HistorialResponsables } from "./historial-responsables";
import { MinasAbastecidas } from "./minas-abastecidas";
import { useAlmacenes } from "../hooks/useAlmacenes";
import type { RES_Almacen } from "../service/almacenes.responses";

export const AlmacenesPage = () => {
  useTitlePage("Almacenes");

  const {
    loading,
    setAlmacenes,
    handleChildMessage,
    busqueda,
    setBusqueda,
    almacenesFiltrados,
    // Modales y Selección
    openedCreate,
    openCreate,
    closeCreate,
    openedResponsables,
    openResponsables,
    closeResponsables,
    openedAlcance,
    openAlcance,
    closeAlcance,
    selectedAlmacen,
    setSelectedAlmacen,
    // Registro
    formNombre,
    setFormNombre,
    formDescripcion,
    setFormDescripcion,
    formEsPrincipal,
    setFormEsPrincipal,
    formError,
    isRegistering,
    handleCrearAlmacen,
    resetForm,
  } = useAlmacenes();

  const handleOpenResponsables = (alm: RES_Almacen) => {
    setSelectedAlmacen(alm);
    openResponsables();
  };

  const handleOpenAlcance = (alm: RES_Almacen) => {
    setSelectedAlmacen(alm);
    openAlcance();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header — igual que Minas */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <TextInput
          placeholder="Buscar almacén por nombre o responsable..."
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
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20 shrink-0"
        >
          Nuevo Almacén
        </Button>
      </div>

      {/* Grid de tarjetas */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="flex flex-col bg-zinc-900/30 border border-zinc-800/60 rounded-2xl p-4 gap-4"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2 flex-1">
                  <Skeleton height={14} width="30%" radius="sm" />
                  <Skeleton height={18} width="70%" radius="sm" />
                  <Skeleton height={12} width="50%" radius="sm" />
                </div>
                <Skeleton height={16} width={45} radius="sm" />
              </div>

              <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-zinc-800/40 border border-zinc-800/60">
                <Skeleton height={28} width={28} circle />
                <div className="space-y-1 fex-1">
                  <Skeleton height={8} width={60} radius="xs" />
                  <Skeleton height={12} width={100} radius="xs" />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-zinc-800/50">
                <Skeleton height={12} width={100} radius="xs" />
                <div className="flex gap-1.5">
                  <Skeleton height={26} width={26} radius="md" />
                  <Skeleton height={26} width={26} radius="md" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : almacenesFiltrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-zinc-900/20 rounded-2xl border border-dashed border-zinc-800">
          <BuildingStorefrontIcon className="w-10 h-10 text-zinc-700 mb-3" />
          <p className="text-zinc-500 text-sm font-medium">
            No se encontraron almacenes registrados
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {almacenesFiltrados.map((alm) => {
            const isActive = alm.estado === "Activo";
            const isPrincipal = Number(alm.es_principal) === 1;

            return (
              <div
                key={alm.id_almacen}
                className="group relative flex flex-col bg-zinc-900/30 border border-zinc-800/60 rounded-2xl p-4 gap-3 hover:border-zinc-700/80 hover:bg-zinc-900/50 transition-all duration-200"
              >
                {/* Badge de estado */}
                <Badge
                  size="xs"
                  variant="light"
                  color={isActive ? "green" : "red"}
                  radius="sm"
                  className="absolute top-3 right-3"
                >
                  {alm.estado}
                </Badge>

                {/* Header: icono + tipo + nombre */}
                <div className="pr-14">
                  <div className="flex items-center gap-2 mb-1 text-zinc-400">
                    <BuildingStorefrontIcon className="w-4 h-4" />
                    {isPrincipal && (
                      <Badge
                        size="xs"
                        variant="light"
                        color="pink"
                        radius="sm"
                        className="font-bold border-pink-500/20 px-1.5"
                      >
                        PRINCIPAL
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-white truncate group-hover:text-indigo-300 transition-colors">
                    {alm.nombre}
                  </h3>
                  <p className="text-xs text-zinc-500 truncate mt-0.5">
                    {alm.descripcion || "Sin descripción"}
                  </p>
                </div>

                {/* Responsables */}
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-zinc-800/40 border border-zinc-800/60">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border ${
                      alm.responsables
                        ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                        : "bg-zinc-800/50 text-zinc-600 border-zinc-700/50"
                    }`}
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider block mb-1">
                      Responsables
                    </span>
                    {alm.responsables ? (
                      <ScrollArea
                        w="100%"
                        type="never"
                        scrollbarSize={0}
                        offsetScrollbars={false}
                      >
                        <div className="flex items-center gap-1.5 pb-0.5">
                          {alm.responsables.split(", ").map((resp, idx) => (
                            <Badge
                              key={idx}
                              variant="filled"
                              color="indigo.9"
                              size="xs"
                              radius="sm"
                              className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 lowercase first-letter:uppercase shrink-0"
                            >
                              {resp}
                            </Badge>
                          ))}
                        </div>
                      </ScrollArea>
                    ) : (
                      <span className="text-xs font-semibold text-zinc-600 italic block">
                        Sin asignar
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer: stats + botones */}
                <div className="flex items-center justify-between pt-1 border-t border-zinc-800/50">
                  {/* Stats */}
                  <div className="flex items-center gap-3 text-xs text-zinc-600">
                    {!isPrincipal && (
                      <span className="flex items-center gap-1">
                        <RectangleStackIcon className="w-3.5 h-3.5 text-zinc-700" />
                        {alm.minas_count || 0}{" "}
                        {alm.minas_count === 1 ? "mina" : "minas"}
                      </span>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-1.5">
                    <Tooltip label="Gestionar Responsables">
                      <ActionIcon
                        variant="filled"
                        color="violet"
                        size="sm"
                        radius="md"
                        onClick={() => handleOpenResponsables(alm)}
                      >
                        <UserIcon className="w-4 h-4" />
                      </ActionIcon>
                    </Tooltip>
                    {!isPrincipal && (
                      <Tooltip label="Gestionar Alcance (Minas)">
                        <ActionIcon
                          variant="filled"
                          color="pink"
                          size="sm"
                          radius="md"
                          onClick={() => handleOpenAlcance(alm)}
                        >
                          <RectangleStackIcon className="w-4 h-4" />
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Crear Almacén */}
      <ModalEstandar
        opened={openedCreate}
        close={closeCreate}
        title="Nuevo Almacén"
      >
        <RegistroAlmacen
          nombre={formNombre}
          setNombre={setFormNombre}
          descripcion={formDescripcion}
          setDescripcion={setFormDescripcion}
          esPrincipal={formEsPrincipal}
          setEsPrincipal={setFormEsPrincipal}
          formError={formError}
          loading={isRegistering}
          onSubmit={handleCrearAlmacen}
          onCancel={() => {
            closeCreate();
            resetForm();
          }}
        />
      </ModalEstandar>

      {/* Modal: Historial de Responsables */}
      <ModalEstandar
        opened={openedResponsables}
        close={closeResponsables}
        title="Gestión de Responsables"
      >
        {selectedAlmacen && (
          <HistorialResponsables
            almacen={selectedAlmacen}
            onMessage={handleChildMessage}
            onUpdateResponsable={(nombre) =>
              setAlmacenes((prev) =>
                prev.map((alm) =>
                  alm.id_almacen === selectedAlmacen.id_almacen
                    ? {
                      ...alm,
                      responsables: alm.responsables
                        ? `${nombre}, ${alm.responsables}`
                        : nombre,
                    }
                    : alm,
                ),
              )
            }
          />
        )}
      </ModalEstandar>

      {/* Modal: Abastecimiento a Minas */}
      <ModalEstandar
        opened={openedAlcance}
        close={closeAlcance}
        title="Gestión de Minas"
      >
        {selectedAlmacen && (
          <MinasAbastecidas
            almacen={selectedAlmacen}
            onMessage={handleChildMessage}
            onMinasChange={(delta) => {
              setAlmacenes((prev) =>
                prev.map((alm) =>
                  alm.id_almacen === selectedAlmacen.id_almacen
                    ? { ...alm, minas_count: (alm.minas_count || 0) + delta }
                    : alm,
                ),
              );
              setSelectedAlmacen((prev: RES_Almacen | null) =>
                prev
                  ? { ...prev, minas_count: (prev.minas_count || 0) + delta }
                  : null,
              );
            }}
          />
        )}
      </ModalEstandar>
    </div>
  );
};

export default AlmacenesPage;
