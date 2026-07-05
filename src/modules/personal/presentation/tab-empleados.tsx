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
  IdentificationIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";
import { type DataTableColumn } from "mantine-datatable";

import { useEmpleados } from "../hooks/useEmpleados";
import type { RES_EmpleadoResumen } from "../service/empleados.responses";
import { useNotify } from "../../../hooks/useNotify";

import { DataTableEstandar } from "../../../presentation/utils/datatable-estandar";
import { ModalContratoEmpleado } from "../../contratos-empleado/presentation/modal-contrato-empleado";
import { ModalHistorialContratosEmpleado } from "../../contratos-empleado/presentation/modal-historial-contratos-empleado";

interface TabEmpleadosProps {
  controller: ReturnType<typeof useEmpleados>;
  onOpenCuentas: (empleado: RES_EmpleadoResumen) => void;
}

export const TabEmpleados = ({ controller, onOpenCuentas }: TabEmpleadosProps) => {
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
    // Selección masiva (usada en la columna de checkbox)
    seleccionados,
    toggleSeleccion,
    toggleSeleccionarTodos,
    todosVisiblesSeleccionados,
    algunosVisiblesSeleccionados,
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
      accessor: "index",
      title: "#",
      textAlign: "center",
      width: 50,
    },
    {
      accessor: "seleccion",
      title: (
        <Group gap="4px" wrap="nowrap" align="center" justify="center">
          <Checkbox
            checked={todosVisiblesSeleccionados}
            indeterminate={!todosVisiblesSeleccionados && algunosVisiblesSeleccionados}
            onChange={toggleSeleccionarTodos}
            size="xs"
            color="indigo"
          />
          {seleccionados.size > 0 && (
            <Tooltip label={`Fotocheck (${seleccionados.size})`}>
              <ActionIcon
                variant="filled"
                color="indigo"
                size="xs"
                radius="md"
                onClick={controller.abrirModalFotocheck}
              >
                <IdentificationIcon className="w-3.5 h-3.5 text-white" />
              </ActionIcon>
            </Tooltip>
          )}
        </Group>
      ),
      textAlign: "center",
      width: 75,
      render: (r) => (
        <Group gap="4px" wrap="nowrap" align="center" justify="center">
          <Checkbox
            checked={seleccionados.has(r.id_empleado)}
            onChange={() => toggleSeleccion(r.id_empleado)}
            size="xs"
            color="indigo"
            onClick={(e) => e.stopPropagation()}
          />
          <Tooltip label="Fotocheck">
            <ActionIcon
              variant="light"
              color="indigo"
              size="xs"
              radius="md"
              onClick={(e) => {
                e.stopPropagation();
                controller.abrirModalFotocheckIndividual(r);
              }}
            >
              <IdentificationIcon className="w-3.5 h-3.5" />
            </ActionIcon>
          </Tooltip>
        </Group>
      ),
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
            <div className="min-w-0 flex-1">
              <Text
                size="xs"
                fw={700}
                className="text-zinc-200 truncate leading-tight"
              >
                {r.nombre} {r.apellido}
              </Text>
              <Text size="10px" className="text-zinc-500 font-mono truncate">
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
            <Text
              size="xs"
              fw={700}
              className="text-zinc-100 truncate leading-tight"
            >
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
      width: 170,
      textAlign: "center",
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
            <Group justify="center">
              <Text size="xs" c="dimmed" fs="italic">
                No Aplica
              </Text>
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
      accessor: "cantidad_cuentas_bancarias",
      title: "Cuentas",
      width: 140,
      render: (r) => {
        const count = r.cantidad_cuentas_bancarias ?? 0;
        return (
          <Group gap={4} wrap="nowrap" justify="center">
            <Badge
              color={count > 0 ? "blue" : "gray"}
              variant="light"
              radius="md"
              size="xs"
              className="font-medium"
            >
              {count === 1 ? "1 cuenta" : `${count} cuentas`}
            </Badge>
            <Tooltip label="Gestionar Cuentas" withArrow position="top">
              <ActionIcon
                variant="subtle"
                color="blue"
                radius="md"
                size="sm"
                aria-label="Gestionar Cuentas"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenCuentas(r);
                }}
              >
                <CreditCardIcon className="w-4 h-4" />
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
          onSuccess={(payload) => {
            onContratoCreado(payload as Parameters<typeof onContratoCreado>[0]);
          }}
        />
      )}

      {/* El botón de fotocheck y su modal están en personal.page.tsx, */}

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
