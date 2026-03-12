import {
  Button,
  TextInput,
  Badge,
} from "@mantine/core";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  Bars2Icon,
} from "@heroicons/react/24/outline";
import { useTitlePage } from "../../../hooks/useTitlePage";
import { ModalEstandar } from "../../../presentation/utils/modal-estandar";
import { useDisclosure } from "@mantine/hooks";

import { useOrganigrama } from "../hooks/useOrganigrama";
import { useRegistroArea } from "../hooks/useRegistroArea";
import { useRegistroCargo } from "../hooks/useRegistroCargo";

import { RegistroArea } from "./registro-area";
import { ListaCargos } from "./lista-cargos";

export const OrganigramaPage = () => {
  useTitlePage("Organigrama");

  const {
    loading,
    loadingCargos,
    busquedaAreas,
    setBusquedaAreas,
    busquedaCargos,
    setBusquedaCargos,
    areasFiltradas,
    cargosFiltrados,
    areaSeleccionada,
    setAreaSeleccionada,
    onAreaCreada,
    onCargoCreado,
  } = useOrganigrama();

  const [openedArea, { open: openArea, close: closeArea }] =
    useDisclosure(false);
  const [openedCargos, { open: openCargos, close: closeCargos }] =
    useDisclosure(false);

  // Hook de Registro de Cargo — Integrado para que no necesite modal extra
  const regCargo = useRegistroCargo(
    onCargoCreado,
    () => {}, 
    areaSeleccionada?.id_area,
  );

  const regArea = useRegistroArea(onAreaCreada, closeArea);

  const inputClasses = {
    input:
      "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header — Estilo unificado con Minas */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <TextInput
          placeholder="Buscar área por nombre..."
          leftSection={
            <MagnifyingGlassIcon className="w-4 h-4 text-zinc-400" />
          }
          value={busquedaAreas}
          onChange={(e) => setBusquedaAreas(e.target.value)}
          className="flex-1 min-w-64"
          radius="lg"
          size="sm"
          classNames={inputClasses}
        />
        <Button
          leftSection={<PlusIcon className="w-5 h-5" />}
          onClick={openArea}
          radius="lg"
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20 shrink-0 px-6"
        >
          Nueva Área
        </Button>
      </div>

      {/* Grid de Tarjetas de Áreas — RESTAURADO AL DISEÑO APROBADO */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 rounded-xl bg-zinc-900/30 animate-pulse border border-zinc-800/50"
            />
          ))}
        </div>
      ) : areasFiltradas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-zinc-900/20 rounded-2xl border border-dashed border-zinc-800">
          <Bars2Icon className="w-10 h-10 text-zinc-700 mb-3" />
          <p className="text-zinc-500 text-sm font-medium">
            No se encontraron áreas registradas
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {areasFiltradas.map((area) => {
            const isActive = area.estado === "Activo";
            return (
              <div
                key={area.id_area}
                className="group relative flex flex-col bg-zinc-900/30 border border-zinc-800/60 rounded-2xl p-4 gap-3 hover:border-zinc-700/80 hover:bg-zinc-900/50 transition-all duration-200"
              >
                {/* Badge de estado flotante */}
                <Badge
                  size="xs"
                  variant="light"
                  color={isActive ? "green" : "gray"}
                  radius="sm"
                  className="absolute top-3 right-3"
                >
                  {area.estado}
                </Badge>

                {/* Header: Icono y Nombre JUNTOS (como pediste) */}
                <div className="flex items-center gap-3 pr-12">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 shrink-0">
                    <Bars2Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white truncate group-hover:text-indigo-300 transition-colors uppercase tracking-tight">
                    {area.nombre}
                  </h3>
                </div>

                {/* Caja central con contador y botón integrado CYAN */}
                <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-zinc-800/40 border border-zinc-800/60 group-hover:border-cyan-500/30 transition-all duration-200">
                  <div className="min-w-0">
                    <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider block leading-none mb-0.5">
                      Personal y Roles
                    </span>
                    <span className="text-xs font-semibold text-zinc-300 truncate block">
                      {area.cantidad_cargos} {area.cantidad_cargos === 1 ? 'Cargo Registrado' : 'Cargos Registrados'}
                    </span>
                  </div>

                  <Button
                    variant="filled"
                    color="cyan"
                    size="xs"
                    leftSection={<PlusIcon className="w-3 h-3" />}
                    radius="md"
                    className="bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-900/20 font-bold px-3 h-7 shrink-0"
                    onClick={() => {
                      setAreaSeleccionada(area);
                      openCargos();
                    }}
                  >
                    Añadir
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL GESTIÓN DE ÁREA */}
      <ModalEstandar opened={openedArea} close={closeArea} title="Nueva Área" size="md">
        <RegistroArea
          nombre={regArea.nombre}
          setNombre={regArea.setNombre}
          loading={regArea.loading}
          error={regArea.error}
          onSave={regArea.handleGuardar}
          onCancel={closeArea}
        />
      </ModalEstandar>

      {/* MODAL GESTIÓN DE CARGOS — Único modal (Lista + Registro) */}
      <ModalEstandar
        opened={openedCargos}
        close={closeCargos}
        title={`Administración de Cargos - ${areaSeleccionada?.nombre}`}
        size="lg"
      >
        <ListaCargos
          cargos={cargosFiltrados}
          loading={loadingCargos}
          busqueda={busquedaCargos}
          setBusqueda={setBusquedaCargos}
          nombre={regCargo.nombre}
          setNombre={regCargo.setNombre}
          loadingGuardar={regCargo.loading}
          onSave={regCargo.handleGuardar}
          error={regCargo.error}
        />
      </ModalEstandar>
    </div>
  );
};

export default OrganigramaPage;
