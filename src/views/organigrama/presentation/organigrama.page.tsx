import {
  Button,
  Group,
  TextInput,
  ActionIcon,
  Text,
  Badge,
} from "@mantine/core";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  BriefcaseIcon,
  RectangleGroupIcon,
} from "@heroicons/react/24/outline";
import { type DataTableColumn } from "mantine-datatable";
import { useTitlePage } from "../../../hooks/useTitlePage";
import { DataTableEstandar } from "../../../presentation/utils/datatable-estandar";
import { ModalEstandar } from "../../../presentation/utils/modal-estandar";
import { useDisclosure } from "@mantine/hooks";

import { useOrganigrama } from "../hooks/useOrganigrama";
import { useRegistroArea } from "../hooks/useRegistroArea";
import { useRegistroCargo } from "../hooks/useRegistroCargo";

import { RegistroArea } from "./registro-area";
import { ListaCargos } from "./lista-cargos";
import { RegistroCargo } from "./registro-cargo";

import type { RES_Area } from "../service/organigrama.responses";

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
  const [openedNuevoCargo, { open: openNuevoCargo, close: closeNuevoCargo }] =
    useDisclosure(false);

  const regArea = useRegistroArea(onAreaCreada, closeArea);
  const regCargo = useRegistroCargo(
    onCargoCreado,
    closeNuevoCargo,
    areaSeleccionada?.id_area,
  );

  const colAreas: DataTableColumn<RES_Area>[] = [
    { accessor: "id_area", title: "#", width: 60, textAlign: "center" },
    {
      accessor: "nombre",
      title: "Nombre del Área",
      render: (r) => (
        <Group gap="xs">
          <RectangleGroupIcon className="w-5 h-5 text-indigo-400" />
          <Text size="sm" fw={500} className="text-zinc-200">
            {r.nombre}
          </Text>
        </Group>
      ),
    },
    {
      accessor: "estado",
      title: "Estado",
      textAlign: "center",
      width: 100,
      render: (r) => (
        <Badge color={r.estado === "Activo" ? "green" : "red"} variant="light">
          {r.estado}
        </Badge>
      ),
    },
    {
      accessor: "actions",
      title: "Cargos",
      width: 100,
      textAlign: "center",
      render: (r) => (
        <ActionIcon
          variant="light"
          color="indigo"
          radius="md"
          onClick={() => {
            setAreaSeleccionada(r);
            openCargos();
          }}
        >
          <BriefcaseIcon className="w-5 h-5" />
        </ActionIcon>
      ),
    },
  ];

  const inputClasses = {
    input:
      "bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-500",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Group justify="space-between">
        <TextInput
          placeholder="Buscar área..."
          leftSection={
            <MagnifyingGlassIcon className="w-4 h-4 text-zinc-400" />
          }
          value={busquedaAreas}
          onChange={(e) => setBusquedaAreas(e.target.value)}
          classNames={inputClasses}
          radius="lg"
          className="w-full sm:w-80"
        />
        <Button
          leftSection={<PlusIcon className="w-5 h-5" />}
          onClick={openArea}
          radius="lg"
          className="bg-indigo-600"
        >
          Nueva Área
        </Button>
      </Group>

      <DataTableEstandar
        idAccessor="id_area"
        columns={colAreas}
        records={areasFiltradas}
        loading={loading}
      />

      {/* MODAL GESTIÓN DE ÁREA */}
      <ModalEstandar opened={openedArea} close={closeArea} title="Nueva Área">
        <RegistroArea
          nombre={regArea.nombre}
          setNombre={regArea.setNombre}
          loading={regArea.loading}
          error={regArea.error}
          onSave={regArea.handleGuardar}
          onCancel={closeArea}
        />
      </ModalEstandar>

      {/* MODAL LISTADO DE CARGOS POR ÁREA */}
      <ModalEstandar
        opened={openedCargos}
        close={closeCargos}
        title={`Cargos - ${areaSeleccionada?.nombre}`}
        size="lg"
      >
        <ListaCargos
          cargos={cargosFiltrados}
          loading={loadingCargos}
          busqueda={busquedaCargos}
          setBusqueda={setBusquedaCargos}
          onNuevo={openNuevoCargo}
        />
      </ModalEstandar>

      {/* MODAL REGISTRO DE CARGO */}
      <ModalEstandar
        opened={openedNuevoCargo}
        close={closeNuevoCargo}
        title={`Nuevo Cargo en ${areaSeleccionada?.nombre}`}
      >
        <RegistroCargo
          nombre={regCargo.nombre}
          setNombre={regCargo.setNombre}
          idArea={regCargo.idArea}
          setIdArea={regCargo.setIdArea}
          areas={[areaSeleccionada!]}
          loading={regCargo.loading}
          error={regCargo.error}
          onSave={regCargo.handleGuardar}
          onCancel={closeNuevoCargo}
        />
      </ModalEstandar>
    </div>
  );
};

export default OrganigramaPage;
