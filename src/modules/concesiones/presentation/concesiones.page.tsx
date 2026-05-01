import {
  Button,
  TextInput,
  Skeleton,
  Text,
} from "@mantine/core";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  Square3Stack3DIcon,
} from "@heroicons/react/24/outline";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";

import { useTitlePage } from "../../../hooks/useTitlePage";
import { ModalEstandar } from "../../../presentation/utils/modal-estandar";

import { useConcesiones } from "../hooks/useConcesiones";
import { RegistroConcesion } from "./registro-concesion";
import { HistorialContratos } from "./historial-contratos";
import { ConcesionCard } from "./concesion-card";

export const ConcesionesPage = () => {
  useTitlePage("Concesiones");

  const { concesiones, loading, busqueda, setBusqueda, pushNuevaConcesion, actualizarContratosActivos } =
    useConcesiones();

  const [idSeleccionado, setIdSeleccionado] = useState<number | null>(null);
  const [nombreSeleccionado, setNombreSeleccionado] = useState("");
  const [openedContratos, { open: openContratos, close: closeContratos }] =
    useDisclosure(false);
  const [openedRegistro, { open: openRegistro, close: closeRegistro }] =
    useDisclosure(false);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end justify-between">
        <TextInput
          label="Buscar Concesión"
          placeholder="Buscar por nombre o código..."
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
              "bg-zinc-900/50 border-zinc-800 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 text-white placeholder:text-zinc-500",
          }}
        />
        <Button
          leftSection={<PlusIcon className="w-5 h-5" />}
          onClick={openRegistro}
          radius="lg"
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20 shrink-0 h-[40px]"
        >
          Nueva Concesión
        </Button>
      </div>

      {/* Grid Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-zinc-900/40 border border-zinc-800/60 rounded-[32px] p-5 space-y-4">
              <div className="flex justify-between items-center">
                <Skeleton height={20} width={100} radius="md" />
                <Skeleton height={18} width={60} radius="sm" />
              </div>
              <div className="space-y-2">
                <Skeleton height={12} width="40%" radius="md" />
                <div className="flex gap-2">
                  <Skeleton height={40} width="100%" radius="md" />
                  <Skeleton height={40} width="100%" radius="md" />
                </div>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-zinc-800/50">
                <Skeleton height={30} width={100} radius="lg" />
                <Skeleton height={30} width={120} radius="lg" />
              </div>
            </div>
          ))}
        </div>
      ) : concesiones.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-zinc-900/20 rounded-[32px] border border-dashed border-zinc-800">
          <Square3Stack3DIcon className="w-12 h-12 text-zinc-700 mb-4" />
          <Text size="lg" fw={600} className="text-zinc-500">
            No se encontraron concesiones
          </Text>
          <Text size="sm" className="text-zinc-600 mt-1">
            Intenta con otro término de búsqueda o registra una nueva.
          </Text>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {concesiones.map((concesion) => (
            <ConcesionCard
              key={concesion.id_concesion}
              concesion={concesion}
              onOpenContratos={(c) => {
                setIdSeleccionado(c.id_concesion);
                setNombreSeleccionado(c.nombre);
                openContratos();
              }}
            />
          ))}
        </div>
      )}

      {/* Modal: Contratos */}
      <ModalEstandar
        opened={openedContratos}
        close={closeContratos}
        title="Contratos y Asignaciones"
        size="lg"
      >
        {idSeleccionado && (
          <HistorialContratos
            idConcesion={idSeleccionado}
            nombreConcesion={nombreSeleccionado}
            onContratoCreado={() => actualizarContratosActivos(idSeleccionado, +1)}
            onContratoTerminado={() => actualizarContratosActivos(idSeleccionado, -1)}
          />
        )}
      </ModalEstandar>

      {/* Modal: Registro */}
      <ModalEstandar
        opened={openedRegistro}
        close={closeRegistro}
        title="Registrar Concesión"
        size="md"
      >
        <RegistroConcesion
          onSuccess={(nueva) => {
            pushNuevaConcesion(nueva);
            closeRegistro();
          }}
          onCancel={() => {
            closeRegistro();
          }}
        />
      </ModalEstandar>
    </div>
  );
};

export default ConcesionesPage;
