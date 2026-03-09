import {
  Button,
  Group,
  TextInput,
  Text,
  Badge,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import {
  MagnifyingGlassIcon,
  TicketIcon,
  InformationCircleIcon,
  BuildingOfficeIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { type DataTableColumn } from "mantine-datatable";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";

import { useTitlePage } from "../../../hooks/useTitlePage";
import { DataTableEstandar } from "../../../presentation/utils/datatable-estandar";
import { ModalEstandar } from "../../../presentation/utils/modal-estandar";

import { useConcesiones } from "../hooks/useConcesiones";
import { RegistroConcesion } from "./registro-concesion";
import type { RES_Concesion } from "../service/concesiones.responses";
import { HistorialContratos } from "./historial-contratos";

export const ConcesionesPage = () => {
  useTitlePage("Concesiones");

  const { concesiones, loading, busqueda, setBusqueda, pushNuevaConcesion } =
    useConcesiones();

  const [idSeleccionado, setIdSeleccionado] = useState<number | null>(null);
  const [nombreSeleccionado, setNombreSeleccionado] = useState("");
  const [openedContratos, { open: openContratos, close: closeContratos }] =
    useDisclosure(false);
  const [openedRegistro, { open: openRegistro, close: closeRegistro }] =
    useDisclosure(false);

  const columns: DataTableColumn<RES_Concesion>[] = [
    {
      accessor: "nombre",
      title: "Concesión",
      render: (r) => (
        <Group gap="xs">
          <TicketIcon className="w-5 h-5 text-amber-500" />
          <div>
            <Text size="sm" fw={500} className="text-zinc-200">
              {r.nombre}
            </Text>
            <Text size="xs" className="text-zinc-500">
              Cód: {r.codigo_concesion}
            </Text>
          </div>
        </Group>
      ),
    },
    {
      accessor: "tipo_mineral",
      title: "Tipo Mineral",
      render: (r) => (
        <Badge variant="outline" color="gray" size="sm">
          {r.tipo_mineral}
        </Badge>
      ),
    },
    {
      accessor: "contratos_activos",
      title: "Contratos",
      textAlign: "center",
      render: (r) => (
        <Badge
          variant="light"
          color={r.contratos_activos > 0 ? "indigo" : "gray"}
          radius="md"
        >
          {r.contratos_activos} activo(s)
        </Badge>
      ),
    },
    {
      accessor: "actions",
      title: "",
      width: 100,
      textAlign: "right",
      render: (r) => (
        <Group gap="xs" justify="flex-end">
          <Tooltip label="Gestionar Contratos">
            <ActionIcon
              variant="light"
              color="indigo"
              radius="md"
              onClick={() => {
                setIdSeleccionado(r.id_concesion);
                setNombreSeleccionado(r.nombre);
                openContratos();
              }}
            >
              <BuildingOfficeIcon className="w-5 h-5" />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Más información">
            <ActionIcon variant="subtle" color="gray">
              <InformationCircleIcon className="w-5 h-5" />
            </ActionIcon>
          </Tooltip>
        </Group>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <Group justify="space-between">
        <TextInput
          placeholder="Buscar concesión..."
          leftSection={
            <MagnifyingGlassIcon className="w-4 h-4 text-zinc-400" />
          }
          value={busqueda}
          onChange={(e) => setBusqueda(e.currentTarget.value)}
          radius="lg"
          className="w-full sm:w-80"
          classNames={{
            input:
              "bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-500",
          }}
        />
        <Button
          variant="filled"
          color="indigo"
          radius="lg"
          onClick={openRegistro}
          leftSection={<PlusIcon className="w-5 h-5" />}
        >
          Nueva Concesión
        </Button>
      </Group>

      <DataTableEstandar
        idAccessor="id_concesion"
        columns={columns}
        records={concesiones}
        loading={loading}
      />

      <ModalEstandar
        opened={openedContratos}
        close={closeContratos}
        title={`Contratos - ${nombreSeleccionado}`}
        size="lg"
      >
        {idSeleccionado && <HistorialContratos idConcesion={idSeleccionado} />}
      </ModalEstandar>

      <ModalEstandar
        opened={openedRegistro}
        close={closeRegistro}
        title="Nueva Concesión"
        size="md"
      >
        <RegistroConcesion
          onSuccess={(nueva) => {
            pushNuevaConcesion(nueva);
            closeRegistro();
          }}
        />
      </ModalEstandar>
    </div>
  );
};

export default ConcesionesPage;
