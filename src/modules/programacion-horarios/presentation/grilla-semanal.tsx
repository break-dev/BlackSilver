import { useMemo } from "react";
import { Group, Stack, Text, Avatar, Box, Tooltip } from "@mantine/core";
import {
  SunIcon,
  MoonIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import {
  type RES_ProgramacionHorario,
  lugarDiferenteContrato,
} from "../service/programacion.responses";

const NOMBRES_DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const NOMBRES_DIAS_LARGO = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

interface GrillaSemanalProps {
  fechaInicio: string;
  fechaFin: string;
  programaciones: RES_ProgramacionHorario[];
  loading?: boolean;
}

interface EmpleadoAgrupado {
  id_empleado: number;
  nombre: string;
  url_foto?: string | null;
  /**
   * Para cada día de la semana (0..6) guardamos las programaciones cuyos
   * `dias_laborables` lo marque como activo y que estén vigentes para esa fecha.
   */
  celdas: Array<RES_ProgramacionHorario[]>;
}

export const GrillaSemanal = ({
  fechaInicio,
  programaciones,
  loading,
}: GrillaSemanalProps) => {
  const dias = useMemo(() => {
    const inicio = new Date(`${fechaInicio}T00:00:00`);
    const arr: { fecha: Date; label: string; nombre: string }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(inicio);
      d.setDate(d.getDate() + i);
      arr.push({
        fecha: d,
        label: `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`,
        nombre: NOMBRES_DIAS_LARGO[i],
      });
    }
    return arr;
  }, [fechaInicio]);

  const toYmd = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const empleadosAgrupados: EmpleadoAgrupado[] = useMemo(() => {
    const mapa = new Map<number, EmpleadoAgrupado>();
    for (const prog of programaciones) {
      const id = prog.id_empleado;
      if (!mapa.has(id)) {
        mapa.set(id, {
          id_empleado: id,
          nombre: prog.empleado ?? `Empleado #${id}`,
          url_foto: prog.empleado_url_foto ?? null,
          celdas: [[], [], [], [], [], [], []],
        });
      }
      const grupo = mapa.get(id);
      if (!grupo) continue;
      for (let i = 0; i < 7; i++) {
        const dateStr = toYmd(dias[i].fecha);
        // Validar vigencia de la fecha en la programación
        if (prog.fecha_inicio && dateStr < prog.fecha_inicio) continue;
        if (!prog.por_tiempo_indefinido && prog.fecha_fin && dateStr > prog.fecha_fin) continue;

        const flag = prog.dias_laborables?.[i] === "1";
        if (!flag) continue;
        grupo.celdas[i].push(prog);
      }
    }

    // Ordenar las programaciones dentro de cada celda por hora de ingreso del turno
    // (mañana → noche), de modo que la UI muestre el orden natural día arriba / noche abajo.
    for (const grupo of mapa.values()) {
      for (const celda of grupo.celdas) {
        celda.sort((a, b) =>
          (a.hora_ingreso ?? "").localeCompare(b.hora_ingreso ?? ""),
        );
      }
    }

    return Array.from(mapa.values()).sort((a, b) =>
      a.nombre.localeCompare(b.nombre),
    );
  }, [programaciones, dias]);

  const esHoy = (date: Date): boolean => {
    const hoy = new Date();
    return (
      date.getDate() === hoy.getDate() &&
      date.getMonth() === hoy.getMonth() &&
      date.getFullYear() === hoy.getFullYear()
    );
  };

  return (
    <div className="bg-zinc-900/65 border border-zinc-800 rounded-[24px] shadow-2xl overflow-hidden backdrop-blur-md">
      <div
        className="grid border-b border-zinc-800 bg-zinc-950/80"
        style={{ gridTemplateColumns: "240px repeat(7, minmax(0, 1fr))" }}
      >
        <div className="px-4 py-3 text-zinc-400 text-xs font-bold uppercase tracking-wider border-r border-zinc-800 text-center flex items-center justify-center">
          Empleado
        </div>
        {dias.map((d, i) => {
          const checkHoy = esHoy(d.fecha);
          const nombreDiaAbbr = NOMBRES_DIAS[d.fecha.getDay()].toUpperCase();
          const nroDia = d.fecha.getDate();
          return (
            <div
              key={i}
              className="px-2 py-3 text-center border-r border-zinc-800 last:border-r-0 flex flex-col items-center justify-center min-h-[58px]"
            >
              <Text size="10px" fw={700} className={checkHoy ? "text-pink-400 tracking-wider" : "text-zinc-500 tracking-wider"}>
                {nombreDiaAbbr}
              </Text>
              {checkHoy ? (
                <span className="inline-flex items-center justify-center bg-pink-500 text-white font-bold rounded-full w-6 h-6 text-xs font-mono shadow-md shadow-pink-500/30 mt-1 select-none">
                  {nroDia}
                </span>
              ) : (
                <Text size="sm" fw={700} className="text-zinc-200 font-mono mt-1">
                  {nroDia}
                </Text>
              )}
            </div>
          );
        })}
      </div>

      {loading ? (
        <Stack gap={0}>
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="grid border-b border-zinc-800/60 last:border-b-0 bg-zinc-900/10 animate-pulse"
              style={{ gridTemplateColumns: "240px repeat(7, minmax(0, 1fr))" }}
            >
              <div className="px-3 py-4 border-r border-zinc-800/60 flex items-center justify-center gap-2">
                <div className="w-8 h-8 rounded-full bg-zinc-800 shrink-0" />
                <div className="space-y-1.5 w-24">
                  <div className="h-3 bg-zinc-800 rounded w-full" />
                  <div className="h-2 bg-zinc-800 rounded w-2/3" />
                </div>
              </div>
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="px-1.5 py-3 border-r border-zinc-800/60 last:border-r-0 flex items-center justify-center">
                  <div className="w-16 h-8 bg-zinc-800 rounded-lg" />
                </div>
              ))}
            </div>
          ))}
        </Stack>
      ) : empleadosAgrupados.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
          <Box className="w-12 h-12 rounded-full bg-zinc-900/60 flex items-center justify-center mb-3">
            <CheckCircleIcon className="w-6 h-6 text-zinc-700" />
          </Box>
          <Text size="sm" fw={700} className="text-zinc-400 uppercase tracking-widest">
            Sin programaciones en esta semana
          </Text>
          <Text size="xs" c="dimmed" className="mt-1 max-w-md">
            Use el botón <strong>Asignar Horario</strong> para registrar un turno
            para uno o varios empleados dentro del rango visible.
          </Text>
        </div>
      ) : (
        <Stack gap={0}>
          {empleadosAgrupados.map((emp, idx) => {
            return (
            <div
              key={emp.id_empleado}
              className={`grid border-b border-zinc-800/60 last:border-b-0 ${idx % 2 === 0 ? "bg-zinc-900/30" : "bg-transparent"
                }`}
              style={{ gridTemplateColumns: "240px repeat(7, minmax(0, 1fr))" }}
            >
              <div className="px-3 py-3 border-r border-zinc-800/60 flex items-center justify-center gap-2 min-w-0">
                <Avatar
                  src={emp.url_foto ?? undefined}
                  size={32}
                  radius="xl"
                  color="indigo"
                  variant="light"
                >
                  {emp.nombre?.[0] ?? "?"}
                </Avatar>
                <div className="min-w-0 flex-1">
                  <Text size="xs" fw={700} className="text-zinc-100 truncate leading-tight">
                    {emp.nombre}
                  </Text>
                </div>
              </div>
              {emp.celdas.map((celda, i) => (
                <div
                  key={i}
                  className="px-1.5 py-2 border-r border-zinc-800/60 last:border-r-0 min-h-[64px] flex items-center justify-center"
                >
                  {celda.length > 0 ? (
                    <Stack gap={4} className="w-full">
                      {celda.map((prog) => (
                        <CeldaTurno key={prog.id} programacion={prog} />
                      ))}
                    </Stack>
                  ) : (
                    <CeldaVacia />
                  )}
                </div>
              ))}
            </div>
            );
          })}
        </Stack>
      )}
    </div>
  );
};

interface CeldaTurnoProps {
  programacion: RES_ProgramacionHorario;
}

const format12h = (timeStr: string | null | undefined): string => {
  if (!timeStr) return "";
  const parts = timeStr.split(":");
  if (parts.length < 2) return timeStr;
  let hour = parseInt(parts[0], 10);
  const min = parts[1];
  const ampm = hour >= 12 ? "pm" : "am";
  hour = hour % 12;
  hour = hour ? hour : 12;
  const hourStr = `${hour}`;
  return `${hourStr}:${min} ${ampm}`;
};

const CeldaTurno = ({ programacion }: CeldaTurnoProps) => {
  const esNoche = programacion.tipo_turno === "Noche";
  const hi = format12h(programacion.hora_ingreso);
  const hs = format12h(programacion.hora_salida);
  const tol = programacion.minutos_tolerancia ?? null;
  const lugarTexto =
    programacion.almacen_nombre ??
    programacion.labor_nombre ??
    programacion.oficina_nombre ??
    null;
  return (
    <div
      className={`w-full p-2.5 rounded-r-[12px] rounded-l-[4px] border border-zinc-800/80 border-l-[4px] transition-all hover:scale-[1.03] flex flex-col justify-center items-start gap-1 shadow-sm pl-3.5 ${esNoche
          ? "bg-indigo-950/15 border-l-indigo-500 hover:border-l-indigo-400"
          : "bg-amber-950/15 border-l-amber-500 hover:border-l-amber-400"
        }`}
    >
      <Group gap={4} wrap="nowrap">
        {esNoche ? (
          <MoonIcon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
        ) : (
          <SunIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        )}
        <Text
          size="10px"
          fw={700}
          className={esNoche ? "text-indigo-300 font-mono" : "text-amber-300 font-mono"}
        >
          {hi} - {hs}
        </Text>
      </Group>
      {lugarTexto && (
        <Text
          size="9px"
          fw={600}
          className={`truncate max-w-full leading-none tracking-wide ${esNoche ? "text-indigo-200/80" : "text-amber-200/80"
            }`}
        >
          {lugarTexto}
        </Text>
      )}
      {lugarTexto && lugarDiferenteContrato(programacion) && (
        <Tooltip
          label="Lugar distinto al del contrato."
          w={220}
          withArrow
        >
          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-cyan-500/25 border border-cyan-400/50 text-white text-[9px] font-bold uppercase tracking-wider cursor-help">
            Lugar distinto
          </span>
        </Tooltip>
      )}
      {tol != null && tol > 0 && (
        <Text size="10px" className="text-zinc-500 leading-none mt-0.5 font-medium">
          || Tolerancia {tol}m
        </Text>
      )}
    </div>
  );
};

const CeldaVacia = () => (
  <Text size="xs" c="dimmed" fs="italic" className="opacity-50">
    —
  </Text>
);