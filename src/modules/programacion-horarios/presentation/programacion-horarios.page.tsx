import { useEffect, useState } from "react";
import {
  Button,
  Group,
  ActionIcon,
  Tooltip,
  Divider,
  Select,
  Popover,
} from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import "@mantine/dates/styles.css";
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
import { ModalFinalizarProgramacion } from "./modal-finalizar-programacion";
import { GrillaSemanal } from "./grilla-semanal";
import { AuxService } from "../../../service/auxiliar.service";
import type { RES_TurnoLaboral } from "../service/turnos.responses";
import type { RES_ProgramacionAsignada, RES_ProgramacionHorario } from "../service/programacion.responses";

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
    agregarOActualizarProgramaciones,
    tipoLugarFiltro,
    idLugarFiltro,
    setTipoLugarYFiltro,
  } = useProgramaciones();

  const [popoverOpened, setPopoverOpened] = useState(false);
  const [openedRegistroTurno, setOpenedRegistroTurno] = useState(false);
  const [openedListadoTurnos, setOpenedListadoTurnos] = useState(false);
  const [openedAsignarHorario, setOpenedAsignarHorario] = useState(false);
  const [openedFinalizar, setOpenedFinalizar] = useState(false);

  const [turnoEditar, setTurnoEditar] = useState<RES_TurnoLaboral | null>(null);
  const [turnoNuevoCreadoId, setTurnoNuevoCreadoId] = useState<number | null>(null);
  const [programacionAFinalizar, setProgramacionAFinalizar] = useState<RES_ProgramacionHorario | null>(null);
  const [fechaSugeridaFinalizar, setFechaSugeridaFinalizar] = useState<string | null>(null);

  const formatRangoSemanal = (fechaInicioStr: string, fechaFinStr: string): string => {
    if (!fechaInicioStr || !fechaFinStr) return "";
    const mesesAbreviados = [
      "Ene", "Feb", "Mar", "Abr", "May", "Jun",
      "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
    ];

    const [y1, m1, d1] = fechaInicioStr.split("-").map(Number);
    const [y2, m2, d2] = fechaFinStr.split("-").map(Number);

    const mes1 = mesesAbreviados[m1 - 1];
    const mes2 = mesesAbreviados[m2 - 1];

    if (y1 === y2) {
      if (m1 === m2) {
        return `${d1} - ${d2} ${mes1}, ${y1}`;
      }
      return `${d1} ${mes1} - ${d2} ${mes2}, ${y1}`;
    }
    return `${d1} ${mes1} ${y1} - ${d2} ${mes2} ${y2}`;
  };

  const datePickerStyles = {
    calendarHeader: "text-white font-bold",
    calendarHeaderControl: "text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors w-8 h-8 flex items-center justify-center",
    calendarHeaderLevel: "hover:bg-zinc-800 rounded-md px-2 py-1 transition-colors text-white font-bold",
    day: "text-zinc-300 hover:bg-zinc-800/80 hover:text-white rounded-md data-[selected]:bg-indigo-500 data-[selected]:text-white data-[today]:text-amber-400 font-medium",
    month: "text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-md",
    year: "text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-md",
    weekday: "text-zinc-500 font-semibold text-xs uppercase tracking-wide text-center",
  };

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

  const handleSuccessTurno = (nuevoTurno?: RES_TurnoLaboral) => {
    void recargarTurnos();
    if (nuevoTurno?.id) {
      setTurnoNuevoCreadoId(nuevoTurno.id);
    }
  };

  const handleSuccessAsignar = (resultado?: RES_ProgramacionAsignada) => {
    if (resultado?.programaciones && resultado.programaciones.length > 0) {
      // Insertar o actualizar únicamente las cards creadas sin recargar toda la vista
      agregarOActualizarProgramaciones(resultado.programaciones);
    } else {
      void recargarProgramaciones();
    }
    void recargarTurnos();
  };

  const handleSolicitarFinalizar = (prog: RES_ProgramacionHorario, fechaSeleccionada: string) => {
    setProgramacionAFinalizar(prog);
    setFechaSugeridaFinalizar(fechaSeleccionada);
    setOpenedFinalizar(true);
  };

  const handleSuccessFinalizar = (progActualizada: RES_ProgramacionHorario) => {
    agregarOActualizarProgramaciones([progActualizada]);
  };

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
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between pb-2">
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

          <Popover opened={popoverOpened} onChange={setPopoverOpened} position="bottom-start" withArrow trapFocus={false}>
            <Popover.Target>
              <Button
                variant="default"
                onClick={() => setPopoverOpened((o) => !o)}
                leftSection={<CalendarDaysIcon className="w-4 h-4 text-teal-400" />}
                className="!bg-zinc-900/50 hover:!bg-zinc-800/80 !text-zinc-200 !border-zinc-800/60 rounded-full h-[32px] px-4 font-semibold transition-all shadow-md text-xs"
              >
                {formatRangoSemanal(rango.fecha_inicio, rango.fecha_fin)}
              </Button>
            </Popover.Target>
            <Popover.Dropdown className="bg-zinc-950 border-zinc-800 p-3 rounded-2xl shadow-xl" style={{ zIndex: 1000 }}>
              <DatePicker
                value={fechaReferencia}
                onChange={(val) => {
                  if (val) {
                    setFechaReferencia(val as unknown as Date);
                    setPopoverOpened(false);
                  }
                }}
                locale="es"
                classNames={datePickerStyles}
              />
            </Popover.Dropdown>
          </Popover>
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
        onFinalizarProgramacion={handleSolicitarFinalizar}
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
        turnoNuevoCreadoId={turnoNuevoCreadoId}
      />

      <ModalFinalizarProgramacion
        opened={openedFinalizar}
        close={() => setOpenedFinalizar(false)}
        programacion={programacionAFinalizar}
        fechaSugerida={fechaSugeridaFinalizar}
        onSuccess={handleSuccessFinalizar}
      />
    </div>
  );
};

export default ProgramacionHorariosPage;