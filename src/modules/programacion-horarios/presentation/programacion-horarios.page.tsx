import { useEffect, useState } from "react";
import {
  Button,
  Group,
  Text,
  ActionIcon,
  Tooltip,
  Badge,
  Divider,
  Select,
} from "@mantine/core";
import {
  PlusIcon,
  EyeIcon,
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  MapPinIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import { useTitlePage } from "../../../hooks/useTitlePage";
import { useTurnos } from "../hooks/useTurnos";
import { useProgramaciones } from "../hooks/useProgramaciones";
import { ModalRegistroTurno } from "./modal-registro-turno";
import { ModalListadoTurnos } from "./modal-listado-turnos";
import { ModalAsignarHorario } from "./modal-asignar-horario";
import { GrillaSemanal } from "./grilla-semanal";
import { CustomDatePicker } from "../../../presentation/utils/date-picker-input";
import { AuxService } from "../../../service/auxiliar.service";
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
    tipoLugarFiltro,
    idLugarFiltro,
    setTipoLugarYFiltro,
  } = useProgramaciones();

  const [openedRegistroTurno, setOpenedRegistroTurno] = useState(false);
  const [openedListadoTurnos, setOpenedListadoTurnos] = useState(false);
  const [openedAsignarHorario, setOpenedAsignarHorario] = useState(false);
  const [turnoEditar, setTurnoEditar] = useState<RES_TurnoLaboral | null>(null);

  // Catálogos de lugares para el filtro.
  const [almacenesOptions, setAlmacenesOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [laboresOptions, setLaboresOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);

  useEffect(() => {
    let cancelado = false;
    const cargar = async () => {
      try {
        const [alm, lab] = await Promise.all([
          AuxService.get_almacenes({ es_principal: false }),
          AuxService.get_labores(),
        ]);
        if (cancelado) return;
        if (alm.success) {
          const data = alm.data as Array<{
            id_almacen: number;
            nombre: string;
            es_principal: number;
          }>;
          setAlmacenesOptions(
            data.map((a) => ({ value: String(a.id_almacen), label: a.nombre })),
          );
        }
        if (lab.success) {
          const data = lab.data as Array<{ id_labor: number; nombre: string }>;
          setLaboresOptions(
            data.map((l) => ({ value: String(l.id_labor), label: l.nombre })),
          );
        }
      } catch (err) {
        console.error(err);
      }
    };
    void cargar();
    return () => {
      cancelado = true;
    };
  }, []);

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

  const lugaresOptions =
    tipoLugarFiltro === "almacen"
      ? almacenesOptions
      : tipoLugarFiltro === "labor"
        ? laboresOptions
        : [];

  const fieldClasses = {
    input:
      "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500 transition-all",
    label: "text-zinc-300 mb-1 font-medium",
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <Group justify="flex-end" gap="sm">
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
      </Group>

      <div className="flex flex-col gap-3 bg-zinc-900/65 border border-zinc-800 rounded-[20px] px-4 py-3 backdrop-blur-md lg:flex-row lg:items-center lg:justify-between">
        <Group gap="md" wrap="nowrap" className="lg:flex-1">
          <Tooltip label="Ir a la semana actual" withArrow position="top">
            <Button
              variant="default"
              className="!bg-teal-950/30 hover:!bg-teal-900/50 !text-teal-400 !border-teal-800/60 h-[32px] px-3 font-semibold transition-all"
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
            className="hidden sm:block"
          />
        </Group>

        <Group gap="sm" wrap="nowrap" className="lg:flex-1 lg:justify-end">
          <Select
            placeholder="Tipo de lugar"
            data={[
              { value: "", label: "Todos" },
              { value: "almacen", label: "Almacén" },
              { value: "labor", label: "Labor" },
            ]}
            value={tipoLugarFiltro || null}
            onChange={(val) =>
              setTipoLugarYFiltro(
                (val as "" | "almacen" | "labor" | null) ?? "",
                null,
              )
            }
            leftSection={<MapPinIcon className="w-4 h-4 text-zinc-500" />}
            classNames={{
              ...fieldClasses,
              wrapper: "w-full sm:w-36",
            }}
            radius="lg"
            size="xs"
            comboboxProps={{ withinPortal: true }}
            clearable
          />
          <Select
            placeholder={
              tipoLugarFiltro === ""
                ? "Todos los lugares"
                : tipoLugarFiltro === "almacen"
                  ? "Seleccione almacén"
                  : "Seleccione labor"
            }
            data={lugaresOptions}
            value={idLugarFiltro ? String(idLugarFiltro) : null}
            onChange={(val) =>
              setTipoLugarYFiltro(
                tipoLugarFiltro,
                val ? Number(val) : null,
              )
            }
            leftSection={
              tipoLugarFiltro === "almacen" ? (
                <BuildingOfficeIcon className="w-4 h-4 text-zinc-500" />
              ) : (
                <MapPinIcon className="w-4 h-4 text-zinc-500" />
              )
            }
            classNames={{
              ...fieldClasses,
              wrapper: "w-full sm:w-44",
            }}
            radius="lg"
            size="xs"
            searchable
            comboboxProps={{ withinPortal: true }}
            clearable
            disabled={!tipoLugarFiltro}
          />

          <Divider
            orientation="vertical"
            h={20}
            className="hidden lg:block"
            color="var(--mantine-color-zinc-7)"
          />

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
        onRegistrarTurnoClick={() => setOpenedRegistroTurno(true)}
      />
    </div>
  );
};

export default ProgramacionHorariosPage;