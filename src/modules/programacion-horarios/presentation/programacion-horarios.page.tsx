import { useState } from "react";
import {
  Button,
  Group,
  Text,
  ActionIcon,
  Tooltip,
  Badge,
  Divider,
} from "@mantine/core";
import {
  PlusIcon,
  EyeIcon,
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { useTitlePage } from "../../../hooks/useTitlePage";
import { useTurnos } from "../hooks/useTurnos";
import { useProgramaciones } from "../hooks/useProgramaciones";
import { ModalRegistroTurno } from "./modal-registro-turno";
import { ModalListadoTurnos } from "./modal-listado-turnos";
import { ModalAsignarHorario } from "./modal-asignar-horario";
import { GrillaSemanal } from "./grilla-semanal";
import { CustomDatePicker } from "../../../presentation/utils/date-picker-input";
import type { RES_TurnoLaboral } from "../service/turnos.responses";

export const ProgramacionHorariosPage = () => {
  useTitlePage("Programación de Horarios");

  const { turnos, loading: loadingTurnos, recargar: recargarTurnos } = useTurnos();
  const {
    rango,
    programaciones,
    loading: loadingProgramaciones,
    fechaReferencia,
    setFechaReferencia,
    irSemanaAnterior,
    irSemanaSiguiente,
    irSemanaActual,
    recargar: recargarProgramaciones,
  } = useProgramaciones();

  const [openedRegistroTurno, setOpenedRegistroTurno] = useState(false);
  const [openedListadoTurnos, setOpenedListadoTurnos] = useState(false);
  const [openedAsignarHorario, setOpenedAsignarHorario] = useState(false);
  const [turnoEditar, setTurnoEditar] = useState<RES_TurnoLaboral | null>(null);

  const handleNuevoTurno = () => {
    setTurnoEditar(null);
    setOpenedRegistroTurno(true);
  };

  const handleEditarTurno = (turno: RES_TurnoLaboral) => {
    setTurnoEditar(turno);
    setOpenedRegistroTurno(true);
  };

  const handleSuccessTurno = () => {
    void recargarTurnos();
  };

  const handleSuccessAsignar = () => {
    void recargarProgramaciones();
    void recargarTurnos();
  };

  const formatMesAnio = (fecha: Date): string => {
    const meses = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    return `${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
  };

  const turnosActivos = turnos.filter((t) => t.estado === "Activo").length;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-wrap items-center gap-3 justify-between bg-zinc-900/65 border border-zinc-800 rounded-[20px] px-4 py-3 backdrop-blur-md">
        <Group gap="md" wrap="nowrap">
          <Tooltip label="Ir a la semana actual" withArrow position="top">
            <Button
              variant="default"
              className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 h-[32px] px-3 font-semibold"
              radius="md"
              size="xs"
              onClick={irSemanaActual}
            >
              Hoy
            </Button>
          </Tooltip>

          <Group gap={4} wrap="nowrap">
            <Tooltip label="Semana anterior" withArrow position="top">
              <ActionIcon
                variant="subtle"
                color="gray"
                radius="md"
                size="md"
                onClick={irSemanaAnterior}
                aria-label="Semana anterior"
              >
                <ChevronLeftIcon className="w-4 h-4 text-zinc-300" />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Semana siguiente" withArrow position="top">
              <ActionIcon
                variant="subtle"
                color="gray"
                radius="md"
                size="md"
                onClick={irSemanaSiguiente}
                aria-label="Semana siguiente"
              >
                <ChevronRightIcon className="w-4 h-4 text-zinc-300" />
              </ActionIcon>
            </Tooltip>
          </Group>

          <Text size="sm" fw={700} className="text-zinc-100 min-w-[100px] select-none text-center sm:text-left">
            {formatMesAnio(fechaReferencia)}
          </Text>

          <Divider
            orientation="vertical"
            h={20}
            color="var(--mantine-color-zinc-7)"
            className="hidden sm:block"
          />
          <CustomDatePicker
            value={fechaReferencia}
            onChange={(val) => {
              if (val) setFechaReferencia(val);
            }}
            placeholder="Ir a fecha..."
            size="xs"
            w={110}
            radius="md"
          />
        </Group>

        <Divider
          orientation="vertical"
          className="hidden md:block"
          color="var(--mantine-color-zinc-7)"
        />

        <Group gap="sm" wrap="wrap">
          <Badge
            color="teal"
            variant="light"
            radius="md"
            leftSection={<CalendarDaysIcon className="w-3 h-3" />}
          >
            Turnos: {turnosActivos} activos
          </Badge>
          <Badge
            color="indigo"
            variant="light"
            radius="md"
            leftSection={<CalendarDaysIcon className="w-3 h-3" />}
          >
            Programaciones: {programaciones.length}
          </Badge>

          <Button
            leftSection={<PlusIcon className="w-4 h-4" />}
            onClick={handleNuevoTurno}
            radius="lg"
            size="xs"
            variant="light"
            color="pink"
            className="shrink-0 h-[32px] px-3"
          >
            Registrar Turnos
          </Button>
          <Button
            leftSection={<EyeIcon className="w-4 h-4" />}
            onClick={() => setOpenedListadoTurnos(true)}
            radius="lg"
            size="xs"
            variant="default"
            className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 shrink-0 h-[32px] px-3"
          >
            Ver Turnos
          </Button>
          <Button
            leftSection={<ClockIcon className="w-4 h-4" />}
            onClick={() => setOpenedAsignarHorario(true)}
            radius="lg"
            size="xs"
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20 shrink-0 h-[32px] px-3"
          >
            Asignar Horario
          </Button>
        </Group>
      </div>

      <GrillaSemanal
        fechaInicio={rango.fecha_inicio}
        fechaFin={rango.fecha_fin}
        programaciones={programaciones}
        loading={loadingProgramaciones}
      />

      <ModalRegistroTurno
        opened={openedRegistroTurno}
        close={() => setOpenedRegistroTurno(false)}
        turnoEditar={turnoEditar}
        onSuccess={handleSuccessTurno}
        zIndex={2100}
      />

      <ModalListadoTurnos
        opened={openedListadoTurnos}
        close={() => setOpenedListadoTurnos(false)}
        turnos={turnos}
        loading={loadingTurnos}
        onEditar={handleEditarTurno}
      />

      <ModalAsignarHorario
        opened={openedAsignarHorario}
        close={() => setOpenedAsignarHorario(false)}
        turnos={turnos.filter((t) => t.estado === "Activo")}
        onSuccess={handleSuccessAsignar}
      />
    </div>
  );
};

export default ProgramacionHorariosPage;