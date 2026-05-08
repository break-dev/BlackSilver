import {
  Button,
  Group,
  TextInput,
  Text,
  Badge,
  ActionIcon,
  Select,
  Tooltip,
  Avatar,
  FileButton,
  Stack,
  Loader,
} from "@mantine/core";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilSquareIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { type DataTableColumn } from "mantine-datatable";
import { useDisclosure } from "@mantine/hooks";

import { DataTableEstandar } from "../../../presentation/utils/datatable-estandar";
import { ModalEstandar } from "../../../presentation/utils/modal-estandar";

import { useContratistas } from "../hooks/useContratistas";
import { useAsignacionLaboresContratista } from "../hooks/useAsignacionLaboresContratista";
import { RegistroContratista } from "./registro-contratista";
import { AsignacionLaboresContratista } from "./asignacion-labores-contratista";
import type { RES_Contratista } from "../service/empleados.responses";
import { useNotify } from "../../../hooks/useNotify";

export const TabContratistas = () => {
  const { notifySuccess, notifyError } = useNotify();

  const {
    minas,
    idMina,
    setIdMina,
    contratistas,
    loadingMinas,
    loading,
    busqueda,
    setBusqueda,
    pushNuevoContratista,
    actualizarFoto,
    actualizarContratistaEnLista,
    idActualizandoFoto,
  } = useContratistas();

  const asignacion = useAsignacionLaboresContratista(actualizarContratistaEnLista);

  const [openedRegistro, { open: openRegistro, close: closeRegistro }] =
    useDisclosure(false);

  const handleUpdateFoto = async (id: number, file: File | null) => {
    if (!file) return;
    const ok = await actualizarFoto(id, file);
    if (ok) {
      notifySuccess("Foto de perfil actualizada correctamente");
    } else {
      notifyError("No se pudo actualizar la foto de perfil");
    }
  };

  const columns: DataTableColumn<RES_Contratista>[] = [
    {
      accessor: "index",
      title: "#",
      textAlign: "center",
      width: 50,
      render: (_, index) => index + 1,
    },
    {
      accessor: "contratista",
      title: "Contratista / Minero",
      width: 230,
      render: (r) => {
        const isUpdatingFoto = r.id_contratista === idActualizandoFoto;
        return (
          <Group gap="sm">
            <div className="relative group overflow-hidden rounded-full w-10 h-10 border border-zinc-800">
              {isUpdatingFoto && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-full z-10">
                  <Loader size="xs" color="indigo" />
                </div>
              )}
              <FileButton
                onChange={(file) => handleUpdateFoto(r.id_contratista, file)}
                accept="image/png,image/jpeg,image/jpg"
                disabled={isUpdatingFoto}
              >
                {(props) => (
                  <div
                    {...props}
                    className={`w-full h-full cursor-pointer ${isUpdatingFoto ? "pointer-events-none" : ""}`}
                  >
                    <Avatar
                      src={r.path_foto}
                      radius="xl"
                      color="indigo"
                      variant="light"
                      className="w-full h-full"
                    >
                      {r.nombre[0]}
                      {r.apellido[0]}
                    </Avatar>
                    {!isUpdatingFoto && (
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <PencilSquareIcon className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                )}
              </FileButton>
            </div>
            <div>
              <Text size="sm" fw={500} className="text-zinc-200">
                {r.nombre} {r.apellido}
              </Text>
              <Text size="11px" className="text-zinc-500 font-mono">
                DNI: {r.dni || "---"}
              </Text>
            </div>
          </Group>
        );
      },
    },
    {
      accessor: "operativo",
      title: "Mina y Labores",
      width: 380,
      textAlign: "center",
      render: (r) => {
        const hasMina = r.id_mina && r.id_mina > 0;
        const sinLabores =
          r.labores_asignadas === "Sin asignar" ||
          r.labores_asignadas === "No aplica" ||
          !r.labores_asignadas;

        return (
          <div className="flex flex-row justify-center">
            <Group gap="lg" wrap="nowrap" justify="center" align="center">
              {!hasMina ? (
                <Text size="xs" c="dimmed" fs="italic" className="min-w-[130px]">
                  Sin asignar
                </Text>
              ) : (
                <>
                  <Badge
                    variant="light"
                    color="pink.6"
                    radius="md"
                    size="md"
                    className="font-bold h-7 border border-pink-500/20"
                    leftSection={<MapPinIcon className="w-3.5 h-3.5 text-pink-400" />}
                  >
                    {r.mina}
                  </Badge>

                  <Stack gap={4} align="center">
                    {sinLabores ? (
                      <Text size="xs" c="dimmed" fs="italic">
                        Sin asignar
                      </Text>
                    ) : (
                      r.labores_asignadas.split(" | ").map((lab, idx) => (
                        <Badge
                          key={idx}
                          variant="light"
                          color="cyan.6"
                          radius="sm"
                          size="xs"
                          className="font-bold h-6 border border-cyan-500/10"
                        >
                          {lab}
                        </Badge>
                      ))
                    )}
                  </Stack>
                </>
              )}

              <Tooltip label="Asignación de Mina y Labores">
                <ActionIcon
                  variant="subtle"
                  color="zinc"
                  size="lg"
                  onClick={() => asignacion.abrir(r)}
                  className="hover:bg-zinc-800 transition-colors rounded-xl"
                >
                  <PencilSquareIcon className="w-5 h-5 text-zinc-400" />
                </ActionIcon>
              </Tooltip>
            </Group>
          </div>
        );
      },
    },
    {
      accessor: "estado",
      title: "Estado",
      textAlign: "center",
      width: 110,
      render: (r) => (
        <Badge
          variant="light"
          color={r.estado === "Activo" ? "green" : "gray"}
          radius="md"
        >
          {r.estado}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-4 items-end justify-between">
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto flex-1">
          <Select
            label="Filtrar por Mina"
            placeholder={loadingMinas ? "Cargando..." : "(Todas)"}
            data={minas.map((m) => ({
              value: m.id_mina.toString(),
              label: m.nombre,
            }))}
            value={idMina?.toString() || null}
            onChange={(val) => setIdMina(val ? Number(val) : null)}
            leftSection={<MapPinIcon className="w-4 h-4 text-zinc-400" />}
            radius="lg"
            size="sm"
            className="w-full sm:w-64"
            classNames={{
              label: "text-zinc-400 mb-1 font-medium",
              input:
                "bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-500 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 transition-all",
            }}
            disabled={loadingMinas}
            searchable
            clearable
          />

          <TextInput
            label="Buscar contratista"
            placeholder="Buscar por nombre o DNI..."
            leftSection={
              <MagnifyingGlassIcon className="w-4 h-4 text-zinc-400" />
            }
            value={busqueda}
            onChange={(e) => setBusqueda(e.currentTarget.value)}
            radius="lg"
            size="sm"
            className="w-full flex-1"
            classNames={{
              label: "text-zinc-400 mb-1 font-medium",
              input:
                "bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-500 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 transition-all",
            }}
          />
        </div>

        <Button
          leftSection={<PlusIcon className="w-5 h-5" />}
          onClick={openRegistro}
          radius="lg"
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20 shrink-0 w-full lg:w-auto px-6 h-[38px] mb-[1px]"
        >
          Nuevo Contratista
        </Button>
      </div>

      <DataTableEstandar
        idAccessor="id_contratista"
        columns={columns}
        records={contratistas}
        loading={loading}
      />

      <ModalEstandar
        opened={openedRegistro}
        close={closeRegistro}
        title="Registrar Contratista / Minero"
        size="md"
      >
        <RegistroContratista
          onSuccess={(nuevo) => {
            pushNuevoContratista(nuevo);
            closeRegistro();
          }}
          onCancel={closeRegistro}
        />
      </ModalEstandar>

      <ModalEstandar
        opened={asignacion.opened}
        close={asignacion.cerrar}
        title="Asignación de Mina y Labores"
        size="sm"
      >
        {asignacion.contratista && (
          <AsignacionLaboresContratista
            contratista={asignacion.contratista}
            minas={minas}
            idMina={asignacion.idMina}
            onMinaChange={asignacion.onMinaChange}
            laboresDisponibles={asignacion.laboresDisponibles}
            seleccionados={asignacion.seleccionados}
            loading={asignacion.loading}
            loadingLabores={asignacion.loadingLabores}
            onToggle={asignacion.toggleSeleccion}
            onAsignar={asignacion.handleAsignar}
            onCancelar={asignacion.cerrar}
          />
        )}
      </ModalEstandar>
    </div>
  );
};
