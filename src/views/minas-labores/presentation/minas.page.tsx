import {
  Badge,
  Button,
  Select,
  Text,
  TextInput,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  UserIcon,
  BriefcaseIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import { useMinas } from "../hooks/useMinas";
import { ModalEstandar } from "../../../presentation/utils/modal-estandar";
import { RegistroMina } from "./registro-mina";
import { EmpresasEjecutoras } from "./empresas-ejecutoras";
import { HistorialResponsables } from "./historial-responsables";
import { GestionLabores } from "./labores";

export const MinasPage = () => {
  const {
    concesiones,
    concesionSeleccionada,
    setConcesionSeleccionada,
    minasFiltradas,
    loading,
    busqueda,
    setBusqueda,
    openedCreate,
    openCreate,
    closeCreate,
    openedEmpresas,
    closeEmpresas,
    openedResponsables,
    closeResponsables,
    openedLabores,
    closeLabores,
    selectedMina,
    handleMinaCreada,
    handleOpenEmpresas,
    handleOpenResponsables,
    handleOpenLabores,
    handleResponsableAsignado,
  } = useMinas();

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-10">
      {/* Header & Concesión Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-zinc-900/40 p-6 rounded-3xl border border-zinc-800/50 backdrop-blur-sm shadow-2xl">

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="w-full sm:w-72">
            <Select
              placeholder="Seleccione Concesión"
              data={concesiones.map((c) => ({
                value: String(c.id_concesion),
                label: c.nombre,
              }))}
              value={
                concesionSeleccionada ? String(concesionSeleccionada) : null
              }
              onChange={(v) => setConcesionSeleccionada(v ? parseInt(v) : null)}
              label={
                <span className="text-zinc-500 text-xs font-bold uppercase mb-1 block">
                  Concesión Activa
                </span>
              }
              classNames={{
                input:
                  "bg-zinc-950/50 border-zinc-800 text-white font-semibold focus:border-indigo-500/50 h-11 rounded-xl",
                dropdown: "bg-zinc-900 border-zinc-800 shadow-2xl",
                option:
                  "hover:bg-zinc-800 text-zinc-300 rounded-lg mx-1 my-0.5",
              }}
            />
          </div>
          <Button
            onClick={openCreate}
            size="lg"
            radius="xl"
            leftSection={<PlusIcon className="w-5 h-5" />}
            className="w-full sm:w-auto bg-linear-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 border-0 shadow-lg shadow-indigo-500/20"
            disabled={!concesionSeleccionada}
          >
            Nueva Mina
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">Minas Registradas</h2>
            <Badge variant="filled" color="indigo" radius="sm">
              {minasFiltradas.length}
            </Badge>
          </div>
          <div className="relative w-full max-w-xs">
            <TextInput
              placeholder="Buscar mina..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.currentTarget.value)}
              leftSection={
                <MagnifyingGlassIcon className="w-4 h-4 text-zinc-600" />
              }
              classNames={{
                input:
                  "bg-zinc-900/40 border-zinc-800 text-white rounded-xl focus:border-zinc-500 h-10 w-full pl-10",
              }}
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-48 rounded-3xl bg-zinc-900/20 animate-pulse border border-zinc-800/50"
              />
            ))}
          </div>
        ) : minasFiltradas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-zinc-900/20 rounded-3xl border border-dashed border-zinc-800">
            <Squares2X2Icon className="w-12 h-12 text-zinc-700 mb-4" />
            <p className="text-zinc-500 font-medium">
              No se encontraron minas registradas
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {minasFiltradas.map((mina) => (
              <div
                key={mina.id_mina}
                className="group relative bg-zinc-900/30 rounded-3xl border border-zinc-800/60 p-6 hover:bg-zinc-900/50 hover:border-indigo-500/30 transition-all duration-300 shadow-xl"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {mina.nombre}
                    </h3>
                    <div className="flex items-center gap-1.5 text-zinc-500 text-sm font-medium">
                      <MapPinIcon className="w-4 h-4 shrink-0" />
                      <span className="truncate">
                        {mina.descripcion || "Sin ubicación"}
                      </span>
                    </div>
                  </div>
                  <ThemeIcon
                    variant="light"
                    color="indigo"
                    size="lg"
                    radius="xl"
                    className="shrink-0 shadow-inner"
                  >
                    <Squares2X2Icon className="w-5 h-5" />
                  </ThemeIcon>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-950/30 border border-zinc-800/50">
                    <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0 border border-orange-500/10">
                      <UserIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-600 font-bold uppercase block tracking-tighter">
                        Responsable Actual
                      </span>
                      <Text
                        size="sm"
                        className="text-zinc-300 font-bold leading-tight"
                      >
                        {mina.responsable || "No asignado"}
                      </Text>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Tooltip label="Gestionar Labores">
                    <Button
                      fullWidth
                      variant="light"
                      color="indigo"
                      size="md"
                      radius="xl"
                      className="bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 font-bold border border-indigo-500/10"
                      onClick={() => handleOpenLabores(mina)}
                    >
                      Labores
                    </Button>
                  </Tooltip>
                  <Tooltip label="Responsables">
                    <Button
                      variant="light"
                      color="orange"
                      size="md"
                      radius="xl"
                      className="px-3 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 border border-orange-500/10"
                      onClick={() => handleOpenResponsables(mina)}
                    >
                      <UserIcon className="w-5 h-5" />
                    </Button>
                  </Tooltip>
                  <Tooltip label="Empresas">
                    <Button
                      variant="light"
                      color="cyan"
                      size="md"
                      radius="xl"
                      className="px-3 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/10"
                      onClick={() => handleOpenEmpresas(mina)}
                    >
                      <BriefcaseIcon className="w-5 h-5" />
                    </Button>
                  </Tooltip>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modales */}
      <ModalEstandar
        opened={openedCreate}
        close={closeCreate}
        title={"Nueva Mina"}
        size="md"
      >
        {concesionSeleccionada && (
          <RegistroMina
            idConcesion={concesionSeleccionada}
            onSuccess={handleMinaCreada}
            onCancel={closeCreate}
          />
        )}
      </ModalEstandar>

      <ModalEstandar
        opened={openedEmpresas}
        close={closeEmpresas}
        title={"Empresas Ejecutoras"}
        size="lg"
      >
        {selectedMina && concesionSeleccionada && (
          <EmpresasEjecutoras
            idMina={selectedMina.id_mina}
            idConcesion={concesionSeleccionada}
          />
        )}
      </ModalEstandar>

      <ModalEstandar
        opened={openedResponsables}
        close={closeResponsables}
        title={"Responsables"}
        size="lg"
      >
        {selectedMina && (
          <HistorialResponsables
            mina={selectedMina}
            onResponsableAsignado={(nombre) =>
              handleResponsableAsignado(selectedMina.id_mina, nombre)
            }
          />
        )}
      </ModalEstandar>

      <ModalEstandar
        opened={openedLabores}
        close={closeLabores}
        title={"Labores"}
        size="xl"
      >
        {selectedMina && <GestionLabores mina={selectedMina} />}
      </ModalEstandar>
    </div>
  );
};

export default MinasPage;
