import {
  Button,
  Group,
  TextInput,
  Text,
  Badge,
  ActionIcon,
  Tooltip,
  Menu,
} from "@mantine/core";
import {
  MagnifyingGlassIcon,
  InformationCircleIcon,
  BuildingOfficeIcon,
  PlusIcon,
  MapPinIcon,
  EllipsisVerticalIcon,
  PencilSquareIcon,
  TrashIcon,
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
      accessor: "index",
      title: "#",
      textAlign: "center",
      width: 50,
      render: (_, index) => index + 1,
    },
    {
      accessor: "nombre",
      title: "Nombre Concesión",
      width: 250,
      render: (r) => (
        <Text size="sm" fw={600} className="text-zinc-100">
          {r.nombre}
        </Text>
      ),
    },
    {
      accessor: "codigo_concesion",
      title: "Cod. Concesión",
      width: 150,
      render: (r) => (
        <Badge
          variant="light"
          color="indigo"
          radius="sm"
          className="bg-indigo-500/10 border border-indigo-500/20 font-mono"
        >
          {r.codigo_concesion}
        </Badge>
      ),
    },
    {
      accessor: "codigo_reinfo",
      title: "Cod. REINFO",
      width: 150,
      render: (r) => (
        <Badge
          variant="light"
          color="pink"
          radius="sm"
          className="bg-pink-500/10 border border-pink-500/20 font-mono"
        >
          {r.codigo_reinfo || "-"}
        </Badge>
      ),
    },
    {
      accessor: "tipo_mineral",
      title: "Tipo De Mineral",
      width: 150,
      render: (r) => (
        <Text size="sm" className="text-zinc-400">
          {r.tipo_mineral}
        </Text>
      ),
    },
    {
      accessor: "ubigeo",
      title: "Ubicación",
      width: 150,
      render: (r) => (
        <Group gap={6}>
          <MapPinIcon className="w-4 h-4 text-emerald-500" />
          <Text size="sm" className="text-zinc-400">
            {r.ubigeo || "-"}
          </Text>
        </Group>
      ),
    },
    {
      accessor: "contratos_activos",
      title: "Contrato",
      width: 150,
      textAlign: "center",
      render: (r) => (
        <Group gap={6} justify="center">
          <Badge
            variant="light"
            color={r.contratos_activos > 0 ? "indigo" : "gray"}
            radius="sm"
            size="sm"
            className="font-bold"
          >
            {r.contratos_activos} ASIGN.
          </Badge>
          <Tooltip label="Gestionar Contratos">
            <ActionIcon
              variant="subtle"
              color="indigo"
              size="sm"
              onClick={() => {
                setIdSeleccionado(r.id_concesion);
                setNombreSeleccionado(r.nombre);
                openContratos();
              }}
            >
              <BuildingOfficeIcon className="w-4 h-4" />
            </ActionIcon>
          </Tooltip>
        </Group>
      ),
    },
    {
      accessor: "estado",
      title: "Estado",
      width: 100,
      textAlign: "center",
      render: (r) => (
        <Badge
          color={r.estado === "Activo" ? "green" : "red"}
          variant="light"
          radius="sm"
          size="sm"
          className="font-bold uppercase"
        >
          {r.estado}
        </Badge>
      ),
    },
    {
      accessor: "actions",
      title: "",
      width: 60,
      textAlign: "right",
      render: () => (
        <Menu shadow="md" width={150} position="left">
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray">
              <EllipsisVerticalIcon className="w-5 h-5" />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown className="bg-zinc-900 border-zinc-800">
            <Menu.Label className="text-zinc-500">Acciones</Menu.Label>
            <Menu.Item
              leftSection={<PencilSquareIcon className="w-4 h-4" />}
              className="text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              Editar
            </Menu.Item>
            <Menu.Item
              leftSection={<InformationCircleIcon className="w-4 h-4" />}
              className="text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              Información
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
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <TextInput
          placeholder="Buscar por nombre, código o REINFO..."
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
          onClick={openRegistro}
          radius="lg"
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20 shrink-0"
        >
          Nueva Concesión
        </Button>
      </div>

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
