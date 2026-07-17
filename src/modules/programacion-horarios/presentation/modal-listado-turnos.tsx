import { Stack, Badge, Text } from "@mantine/core";
import {
  SunIcon,
  MoonIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import type { DataTableColumn } from "mantine-datatable";
import { DataTableEstandar } from "../../../presentation/utils/datatable-estandar";
import { ModalEstandar } from "../../../presentation/utils/modal-estandar";
import type { RES_TurnoLaboral } from "../service/turnos.responses";


interface ModalListadoTurnosProps {
  opened: boolean;
  close: () => void;
  turnos: RES_TurnoLaboral[];
  loading: boolean;
  onEditar: (turno: RES_TurnoLaboral) => void;
}

const format12h = (timeStr: string | null | undefined): string => {
  if (!timeStr) return "";
  const parts = timeStr.split(":");
  if (parts.length < 2) return timeStr;
  let hour = parseInt(parts[0], 10);
  const min = parts[1];
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;
  hour = hour ? hour : 12;
  const hourStr = hour < 10 ? `0${hour}` : `${hour}`;
  return `${hourStr}:${min} ${ampm}`;
};

export const ModalListadoTurnos = ({
  opened,
  close,
  turnos,
  loading,
}: ModalListadoTurnosProps) => {
  // const { notifySuccess, notifyError } = useNotify();
  // const [togglingId, setTogglingId] = useState<number | null>(null);

  // const handleCambiarEstado = async (turno: RES_TurnoLaboral) => {
  //   const nuevoEstado = turno.estado === "Activo" ? "Inactivo" : "Activo";
  //   setTogglingId(turno.id);
  //   try {
  //     const resp = await TurnoLaboralService.cambiar_estado(turno.id, {
  //       estado: nuevoEstado,
  //     });
  //     if (resp.success) {
  //       notifySuccess(`Turno ${nuevoEstado === "Activo" ? "activado" : "desactivado"}`);
  //     } else {
  //       notifyError(resp.message ?? "No se pudo cambiar el estado");
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     notifyError("Error inesperado al cambiar el estado del turno");
  //   } finally {
  //     setTogglingId(null);
  //   }
  // };

  const columns: DataTableColumn<RES_TurnoLaboral>[] = [
    {
      accessor: "index",
      title: "#",
      textAlign: "center",
      width: 50,
    },
    {
      accessor: "tipo_turno",
      title: "Tipo",
      width: 120,
      render: (r) => (
        <Badge
          leftSection={
            r.tipo_turno === "Noche" ? (
              <MoonIcon className="w-3 h-3" />
            ) : (
              <SunIcon className="w-3 h-3" />
            )
          }
          color={r.tipo_turno === "Noche" ? "indigo" : "orange"}
          variant="light"
          radius="md"
          size="sm"
          className="font-medium"
        >
          {r.tipo_turno}
        </Badge>
      ),
    },
    {
      accessor: "hora_ingreso",
      title: "Ingreso",
      width: 110,
      render: (r) => (
        <Text size="xs" fw={700} className="text-zinc-100 font-mono">
          {format12h(r.hora_ingreso)}
        </Text>
      ),
    },
    {
      accessor: "hora_salida",
      title: "Salida",
      width: 110,
      render: (r) => (
        <Text size="xs" fw={700} className="text-zinc-100 font-mono">
          {format12h(r.hora_salida)}
        </Text>
      ),
    },
    {
      accessor: "minutos_tolerancia",
      title: "Tolerancia",
      width: 120,
      render: (r) =>
        r.minutos_tolerancia != null ? (
          <Badge variant="light" color="grape" radius="md" size="xs">
            {r.minutos_tolerancia} min
          </Badge>
        ) : (
          <Text size="xs" c="dimmed" fs="italic">
            Sin tolerancia
          </Text>
        ),
    },
    {
      accessor: "total_horas",
      title: "Total Horas",
      width: 130,
      textAlign: "center",
      render: (r) =>
        r.total_horas != null ? (
          <Badge
            variant="light"
            color="indigo"
            radius="md"
            size="sm"
            className="font-medium"
            leftSection={<ClockIcon className="w-3 h-3" />}
          >
            {Number(r.total_horas).toFixed(2)} h
          </Badge>
        ) : (
          <Text size="xs" c="dimmed" fs="italic">
            —
          </Text>
        ),
    },
    {
      accessor: "estado",
      title: "Estado",
      textAlign: "center",
      width: 120,
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
    // {
    //   accessor: "acciones",
    //   title: "Acciones",
    //   textAlign: "center",
    //   width: 110,
    //   render: (r) => (
    //     <Group gap={4} wrap="nowrap" justify="center">
    //       <Tooltip label="Editar turno" withArrow position="top">
    //         <ActionIcon
    //           variant="subtle"
    //           color="indigo"
    //           radius="md"
    //           size="sm"
    //           aria-label="Editar"
    //           onClick={() => onEditar(r)}
    //         >
    //           <PencilSquareIcon className="w-4 h-4" />
    //         </ActionIcon>
    //       </Tooltip>
    //       <Tooltip
    //         label={r.estado === "Activo" ? "Desactivar" : "Activar"}
    //         withArrow
    //         position="top"
    //       >
    //         <ActionIcon
    //           variant="subtle"
    //           color={r.estado === "Activo" ? "red" : "green"}
    //           radius="md"
    //           size="sm"
    //           aria-label="Cambiar estado"
    //           loading={togglingId === r.id}
    //           onClick={() => {
    //             void handleCambiarEstado(r);
    //           }}
    //         >
    //           <PowerIcon className="w-4 h-4" />
    //         </ActionIcon>
    //       </Tooltip>
    //     </Group>
    //   ),
    // },
  ];

  return (
    <ModalEstandar
      opened={opened}
      close={close}
      title="Turnos Laborales Registrados"
      size={1100}
    >
      <Stack gap="md">
        <Text size="xs" c="dimmed">
          Aquí puede ver todos los turnos configurados.
        </Text>
        {turnos.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center p-16 border border-dashed border-zinc-800 rounded-[24px] bg-zinc-900/10">
            <SunIcon className="w-10 h-10 text-zinc-700 mb-3" />
            <Text size="sm" fw={700} className="text-zinc-400 uppercase tracking-widest">
              Sin turnos registrados
            </Text>
            <Text size="xs" c="dimmed" className="mt-1">
              Cree el primer turno con el botón "Registrar Turnos".
            </Text>
          </div>
        ) : (
          <DataTableEstandar
            idAccessor="id"
            columns={columns}
            records={turnos}
            loading={loading}
            initialPageSize={10}
            minHeight={0}
          />
        )}
      </Stack>
    </ModalEstandar>
  );
};