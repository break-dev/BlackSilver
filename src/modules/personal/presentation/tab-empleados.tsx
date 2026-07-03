import {
  Group,
  Text,
  Badge,
  Avatar,
  FileButton,
  Stack,
  Loader,
  ActionIcon,
  Tooltip,
  Checkbox,
  Button,
} from "@mantine/core";
import {
  PencilSquareIcon,
  UserGroupIcon,
  CakeIcon,
  CheckBadgeIcon,
  PhoneIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { type DataTableColumn } from "mantine-datatable";

import { useEmpleados } from "../hooks/useEmpleados";
import type { RES_EmpleadoResumen } from "../service/empleados.responses";
import { useNotify } from "../../../hooks/useNotify";

import { DataTableEstandar } from "../../../presentation/utils/datatable-estandar";
import { ModalContratoEmpleado } from "../../contratos-empleado/presentation/modal-contrato-empleado";
import { ModalHistorialContratosEmpleado } from "../../contratos-empleado/presentation/modal-historial-contratos-empleado";
import { ModalFotocheck } from "./modal-fotocheck";
import { IdentificationIcon } from "@heroicons/react/24/outline";

interface TabEmpleadosProps {
  controller: ReturnType<typeof useEmpleados>;
}

export const TabEmpleados = ({ controller }: TabEmpleadosProps) => {
  const { notifySuccess, notifyError } = useNotify();

  const {
    empleados,
    loading,
    actualizarFoto,
    idActualizandoFoto,
    abrirModalContrato,
    cerrarModalContrato,
    modalContratoEmpleado,
    abrirModalHistorial,
    cerrarModalHistorial,
    modalHistorialContratos,
    onContratoCreado,
    // Selección masiva
    seleccionados,
    empleadosSeleccionados,
    toggleSeleccion,
    toggleSeleccionarTodos,
    limpiarSeleccion,
    todosVisiblesSeleccionados,
    algunosVisiblesSeleccionados,
    modalFotocheckAbierto,
    abrirModalFotocheck,
    cerrarModalFotocheck,
  } = controller;

  const handleUpdateFoto = async (id: number, file: File | null) => {
    if (!file) return;
    const ok = await actualizarFoto(id, file);
    if (ok) {
      notifySuccess("Foto de perfil actualizada correctamente");
    } else {
      notifyError("No se pudo actualizar la foto de perfil");
    }
  };

  const columns: DataTableColumn<RES_EmpleadoResumen>[] = [
    {
      accessor: "seleccion",
      title: (
        <Checkbox
          checked={todosVisiblesSeleccionados}
          indeterminate={!todosVisiblesSeleccionados && algunosVisiblesSeleccionados}
          onChange={toggleSeleccionarTodos}
          size="sm"
          color="indigo"
        />
      ),
      textAlign: "center",
      width: 50,
      render: (r) => (
        <Checkbox
          checked={seleccionados.has(r.id_empleado)}
          onChange={() => toggleSeleccion(r.id_empleado)}
          size="sm"
          color="indigo"
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
    {
      accessor: "index",
      title: "#",
      textAlign: "center",
      width: 50,
    },
    {
      accessor: "empleado",
      title: "Empleado",
      width: 280,
      render: (r) => {
        const isUpdatingFoto = r.id_empleado === idActualizandoFoto;
        return (
          <Group gap="sm">
            <div className="relative group overflow-hidden rounded-full w-10 h-10 border border-zinc-800">
              {isUpdatingFoto && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-full z-10">
                  <Loader size="xs" color="indigo" />
                </div>
              )}
              <FileButton
                onChange={(file) => handleUpdateFoto(r.id_empleado, file)}
                accept="image/png,image/jpeg,image/jpg"
                disabled={isUpdatingFoto}
              >
                {(props) => (
                  <div
                    {...props}
                    className={`w-full h-full cursor-pointer ${
                      isUpdatingFoto ? "pointer-events-none" : ""
                    }`}
                  >
                    <Avatar
                      src={r.url_foto}
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
      accessor: "ubicacion",
      title: "Área / Cargo",
      width: 220,
      render: (r) => {
        if (r.con_contrato && !r.cargo) {
          return (
            <Badge
              variant="light"
              color="teal"
              radius="sm"
              size="xs"
              className="font-medium w-fit"
            >
              Cargo asignado por contrato
            </Badge>
          );
        }
        return (
          <Stack gap={4}>
            <Text size="sm" fw={700} className="text-zinc-100 leading-tight">
              {r.cargo ?? "—"}
            </Text>
            {r.area && (
              <Badge
                variant="light"
                color="indigo"
                radius="sm"
                size="xs"
                className="font-medium w-fit"
              >
                {r.area}
              </Badge>
            )}
          </Stack>
        );
      },
    },
    {
      accessor: "contacto",
      title: "Contacto",
      width: 240,
      render: (r) => (
        <Stack gap={2}>
          {r.email && (
            <Group gap={4}>
              <EnvelopeIcon className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <Text size="xs" className="text-zinc-300 truncate max-w-[220px]">
                {r.email}
              </Text>
            </Group>
          )}
          {r.telefono && (
            <Group gap={4}>
              <PhoneIcon className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <Text size="xs" className="text-zinc-300 font-mono">
                {r.telefono}
              </Text>
            </Group>
          )}
          {!r.email && !r.telefono && (
            <Text size="xs" c="dimmed" fs="italic">
              Sin contacto
            </Text>
          )}
        </Stack>
      ),
    },
    {
      accessor: "contrato",
      title: "Contrato",
      width: 240,
      render: (r) => {
        const tieneContratoVigente = r.id_contrato_vigente !== null;
        // Tolerante: backend puede devolver true / 1 / "1" / "true"
        const conContratoRaw = r.con_contrato as unknown;
        const esEmpleadoConContrato = Boolean(
          conContratoRaw === true ||
            conContratoRaw === 1 ||
            conContratoRaw === "1" ||
            conContratoRaw === "true",
        );
        const nombreCompleto = `${r.nombre} ${r.apellido}`;

        // 3 estados:
        // 1) con_contrato=false → "No Aplica" sin botones.
        // 2) con_contrato=true && id_contrato_vigente===null → "Por Asignar" + botón "+".
        // 3) id_contrato_vigente!==null → "Con Contrato" + botón "Documento".

        if (!esEmpleadoConContrato) {
          return (
            <Group gap={4} wrap="nowrap" justify="center">
              <Badge
                variant="light"
                color="gray"
                radius="md"
                className="font-medium"
              >
                No Aplica
              </Badge>
            </Group>
          );
        }

        if (!tieneContratoVigente) {
          return (
            <Group gap={4} wrap="nowrap" justify="center">
              <Badge
                variant="light"
                color="orange"
                radius="md"
                className="font-medium"
              >
                Por Asignar
              </Badge>
              <Tooltip
                label="Agregar contrato al empleado"
                withArrow
                position="top"
                transitionProps={{ duration: 150 }}
              >
                <ActionIcon
                  variant="subtle"
                  color="indigo"
                  radius="md"
                  size="sm"
                  aria-label="Agregar contrato"
                  onClick={() =>
                    abrirModalContrato(r.id_empleado, nombreCompleto)
                  }
                >
                  <PlusIcon className="w-4 h-4" />
                </ActionIcon>
              </Tooltip>
            </Group>
          );
        }

        // Con Contrato: solo botón de ver historial
        return (
          <Group gap={4} wrap="nowrap" justify="center">
            <Badge
              variant="light"
              color="teal"
              radius="md"
              leftSection={<CheckBadgeIcon className="w-3.5 h-3.5" />}
              className="font-medium"
            >
              Con Contrato
            </Badge>
            <Tooltip
              label="Ver historial de contratos"
              withArrow
              position="top"
              transitionProps={{ duration: 150 }}
            >
              <ActionIcon
                variant="subtle"
                color="teal"
                radius="md"
                size="sm"
                aria-label="Ver histórico de contratos"
                onClick={() =>
                  abrirModalHistorial(r.id_empleado, nombreCompleto)
                }
              >
                <DocumentTextIcon className="w-4 h-4" />
              </ActionIcon>
            </Tooltip>
          </Group>
        );
      },
    },
    {
      accessor: "fecha_nacimiento",
      title: "Fecha de Nacimiento",
      width: 160,
      render: (r) => {
        if (!r.fecha_nacimiento) {
          return (
            <Text size="xs" c="dimmed" fs="italic">
              No especificado
            </Text>
          );
        }
        const parts = r.fecha_nacimiento.split("-");
        const formattedDate =
          parts.length === 3
            ? `${parts[2]}/${parts[1]}/${parts[0]}`
            : r.fecha_nacimiento;
        return (
          <Group gap={6}>
            <CakeIcon className="w-4 h-4 text-pink-400 shrink-0" />
            <Text size="xs" fw={500} className="text-zinc-300">
              {formattedDate}
            </Text>
          </Group>
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
    <Stack gap="xl">
      {loading ? (
        <Stack align="center" gap="md" py={100}>
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
            <UserGroupIcon className="w-6 h-6 text-indigo-400 absolute inset-0 m-auto animate-pulse" />
          </div>
          <Text
            size="xs"
            fw={900}
            className="uppercase tracking-[0.3em] text-zinc-500"
          >
            Consultando Personal...
          </Text>
        </Stack>
      ) : empleados.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 border border-dashed border-zinc-800 rounded-[32px] bg-zinc-900/10 backdrop-blur-sm">
          <UserGroupIcon className="w-12 h-12 text-zinc-700 mb-4" />
          <Text
            size="sm"
            fw={700}
            className="text-zinc-400 uppercase tracking-widest"
          >
            Sin resultados
          </Text>
          <Text size="xs" c="dimmed" className="mt-1">
            No se encontraron empleados para los filtros aplicados.
          </Text>
        </div>
      ) : (
        <div className="bg-zinc-900/65 border border-zinc-800 rounded-[24px] shadow-2xl overflow-hidden backdrop-blur-md transition-all duration-300 hover:border-zinc-700/50">
          <DataTableEstandar
            idAccessor="id_empleado"
            columns={columns}
            records={empleados}
            loading={loading}
            initialPageSize={10}
            minHeight={0}
          />
        </div>
      )}

      {/* Modal para crear contrato (standalone desde el listado) */}
      {modalContratoEmpleado && modalContratoEmpleado.idEmpleado && (
        <ModalContratoEmpleado
          idEmpleado={modalContratoEmpleado.idEmpleado}
          opened={modalContratoEmpleado.abierto}
          close={cerrarModalContrato}
        />
      )}

      {/* Botón flotante de selección para fotocheck — Header del listado */}
      {seleccionados.size > 0 && (
        <Group
          justify="space-between"
          className="z-10 mx-auto px-4 py-2.5 rounded-2xl border border-indigo-500/40 bg-indigo-500/5 backdrop-blur-md"
        >
          <Group gap="sm">
            <Badge
              variant="light"
              color="indigo"
              size="md"
              radius="md"
              className="font-bold"
            >
              {seleccionados.size}{" "}
              {seleccionados.size === 1 ? "seleccionado" : "seleccionados"}
            </Badge>
            <Button
              variant="subtle"
              size="xs"
              color="gray"
              onClick={limpiarSeleccion}
              radius="md"
            >
              Limpiar
            </Button>
          </Group>
          <Button
            size="sm"
            radius="lg"
            color="indigo"
            leftSection={<IdentificationIcon className="w-4 h-4" />}
            onClick={abrirModalFotocheck}
            className="font-bold shadow-lg shadow-indigo-900/30"
          >
            Generar Fotocheck
          </Button>
        </Group>
      )}

      {/* Modal de fotocheck */}
      {modalFotocheckAbierto && (
        <ModalFotocheck
          opened={modalFotocheckAbierto}
          close={cerrarModalFotocheck}
          empleados={empleadosSeleccionados}
        />
      )}

      {/* Modal para ver historial de contratos */}
      {modalHistorialContratos && modalHistorialContratos.idEmpleado && (
        <ModalHistorialContratosEmpleado
          idEmpleado={modalHistorialContratos.idEmpleado}
          nombreEmpleado={modalHistorialContratos.nombre}
          opened={modalHistorialContratos.abierto}
          close={cerrarModalHistorial}
          onContratoCreado={(payload) => {
            if (payload?.empleado) {
              onContratoCreado({ empleado: payload.empleado as never });
            } else {
              onContratoCreado();
            }
          }}
        />
      )}
    </Stack>
  );
};
