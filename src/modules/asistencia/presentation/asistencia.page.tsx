import { useMemo, useState } from "react";
import {
  Avatar,
  Badge,
  Button,
  Group,
  Loader,
  Select,
  Stack,
  Text,
  TextInput,
  Divider,
  Tooltip,
  Table,
} from "@mantine/core";
import {
  CalendarDaysIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import { useTitlePage } from "../../../hooks/useTitlePage";
import { useFiltrosAsistencia } from "../hooks/useFiltrosAsistencia";
import { useAsistencias } from "../hooks/useAsistencias";
import { MESES } from "../../../shared/variables/meses";
import type { RES_Asistencia } from "../service/asistencia.responses";
import { ModalDetalleAsistenciaDiaria } from "./modal-detalle-asistencia-diaria";

const format12h = (timeStr: string | null | undefined) => {
  if (!timeStr) return "-";
  if (timeStr.includes("T") || timeStr.includes("-")) {
    return dayjs(timeStr).format("hh:mm A");
  }
  const parts = timeStr.split(":");
  if (parts.length >= 2) {
    const hours = Number(parts[0]);
    const minutes = parts[1];
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${String(displayHours).padStart(2, "0")}:${minutes} ${ampm}`;
  }
  return timeStr;
};


interface EmpleadoAsistenciaCardProps {
  emp: {
    id_empleado: number;
    empleado: string;
    dni: string | null;
    url_foto: string | null;
    tipo_contrato: string | null;
    sueldo_base: number | null;
    salario_diario: number | null;
    dias_trabajados: number;
    jornada_total: number;
    pago_total: number;
    cargo_nombre?: string | null;
    area_nombre?: string | null;
    marcaciones: RES_Asistencia[];
  };
  dias: number[];
  yearVal: number;
  mesVal: number;
}

const EmpleadoAsistenciaCard = ({
  emp,
  dias,
  yearVal,
  mesVal,
}: EmpleadoAsistenciaCardProps) => {
  const [selectedDia, setSelectedDia] = useState<RES_Asistencia | null>(null);
  const esPlanilla = emp.tipo_contrato === "Planilla";

  return (
    <div className="bg-zinc-900/65 border border-zinc-800 rounded-[24px] shadow-2xl overflow-hidden flex flex-col backdrop-blur-md p-5 space-y-5">
      {/* Cabecera del Empleado */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Avatar
            src={emp.url_foto ?? undefined}
            size="lg"
            radius="xl"
            className="border border-zinc-800"
          >
            {(emp.empleado[0] ?? "").toUpperCase()}
          </Avatar>
          <Stack gap={2}>
            <div className="flex items-center gap-2">
              <Text size="md" fw={900} className="text-white tracking-tight">
                {emp.empleado}
              </Text>
              <Badge variant="outline" color={esPlanilla ? "indigo" : "teal"} size="xs">
                {emp.tipo_contrato ?? "S/C"}
              </Badge>
            </div>
            <Group gap="xs" wrap="wrap">
              <Text size="xs" c="dimmed">
                DNI: <span className="text-zinc-300 font-semibold">{emp.dni ?? "—"}</span>
              </Text>
              <Divider orientation="vertical" h={12} className="border-zinc-800" />
              {emp.cargo_nombre && (
                <Group gap={4} wrap="nowrap">
                  <BriefcaseIcon className="w-3.5 h-3.5 text-zinc-500" />
                  <Text size="xs" c="indigo.4" fw={600}>
                    {emp.cargo_nombre} {emp.area_nombre ? `(${emp.area_nombre})` : ""}
                  </Text>
                </Group>
              )}
            </Group>
          </Stack>
        </div>

        {/* Resumen mensual en badges */}
        <div className="flex flex-wrap items-center gap-4 md:gap-6 w-full md:w-auto">
          <div className="flex items-center gap-4 p-2 bg-zinc-950/40 rounded-xl border border-zinc-800/50 px-4">
            <div className="flex flex-col items-center">
              <Text size="9px" fw={900} className="text-zinc-500 uppercase tracking-wider">
                Días Trab.
              </Text>
              <Text size="xs" fw={900} className="text-indigo-400">
                {emp.dias_trabajados}
              </Text>
            </div>
            <div className="w-px h-6 bg-zinc-800/50" />
            <div className="flex flex-col items-center">
              <Text size="9px" fw={900} className="text-zinc-500 uppercase tracking-wider">
                Jor. Total
              </Text>
              <Text size="xs" fw={900} className="text-sky-400 font-mono">
                {emp.jornada_total.toFixed(4)}
              </Text>
            </div>
            <div className="w-px h-6 bg-zinc-800/50" />
            <div className="flex flex-col items-center">
              <Text size="9px" fw={900} className="text-zinc-500 uppercase tracking-wider">
                Sueldo Base
              </Text>
              <Text size="xs" fw={900} className="text-zinc-300 font-mono">
                {emp.tipo_contrato === "Planilla"
                  ? (emp.sueldo_base !== null ? `S/. ${emp.sueldo_base.toFixed(2)}` : emp.salario_diario !== null ? `S/. ${emp.salario_diario.toFixed(2)}` : "—")
                  : emp.tipo_contrato === "JornadaDiaria"
                    ? (emp.salario_diario !== null ? `S/. ${emp.salario_diario.toFixed(2)}` : emp.sueldo_base !== null ? `S/. ${emp.sueldo_base.toFixed(2)}` : "—")
                    : "—"}
              </Text>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1 ml-auto md:ml-0">
            <Badge
              variant="default"
              radius="md"
              size="lg"
              className="h-9 px-6 border-0 bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-rose-950/20"
            >
              <Text size="xs" fw={900} className="text-center font-mono">
                S/. {emp.pago_total.toFixed(2)}
              </Text>
            </Badge>
            <Text size="9px" c="zinc.5" fw={700} className="uppercase tracking-widest px-1">
              Pago Diario Acum.
            </Text>
          </div>
        </div>
      </div>

      {/* Grilla horizontal de días (1 al 31) */}
      <div className="overflow-x-auto w-full border border-zinc-800/80 rounded-xl bg-zinc-950/40 p-2">
        <Table
          withTableBorder={false}
          withColumnBorders={true}
          classNames={{
            table: "border-collapse min-w-[900px]",
            th: "text-zinc-400 text-xs font-bold text-center border-zinc-800/50 bg-zinc-900/40 p-1.5",
            td: "border-zinc-800/50 p-1 text-center align-middle",
          }}
        >
          <Table.Thead>
            <Table.Tr>
              {dias.map((d) => (
                <Table.Th key={d} className="w-[30px] min-w-[30px]">
                  {d}
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            <Table.Tr>
              {dias.map((d) => {
                const diaStr = String(d).padStart(2, "0");
                const mesStr = String(mesVal).padStart(2, "0");
                const fechaBuscada = `${yearVal}-${mesStr}-${diaStr}`;
                const log = emp.marcaciones.find((m) => m.fecha === fechaBuscada);

                const valorJornada = log ? Number(log.jornada_trabajada) : null;

                return (
                  <Table.Td key={d}>
                    {valorJornada !== null && log ? (
                      <Tooltip
                        label={
                          <Stack gap={2} p={2}>
                            {log.hora_ingreso && (
                              <Text size="10px" fw={700} c="indigo.3">
                                Turno: {format12h(log.hora_ingreso)} - {format12h(log.hora_salida)}
                              </Text>
                            )}
                            <Text size="10px">
                              Ingreso: <span className="font-bold text-rose-400">{format12h(log.fecha_hora_ingreso)}</span>
                            </Text>
                            <Text size="10px">
                              Salida: <span className="font-bold text-rose-400">{format12h(log.fecha_hora_salida)}</span>
                            </Text>
                            {log.total_horas !== null && (
                              <Text size="10px">
                                Horas: <span className="font-mono text-sky-400 font-bold">{Number(log.total_horas).toFixed(2)} h</span>
                              </Text>
                            )}
                            {log.lugar_nombre && (
                              <Text size="10px" c="cyan.4">
                                Lugar: {log.lugar_nombre}
                              </Text>
                            )}
                            <Text size="10px" c="zinc.5" fs="italic" mt={4}>
                              Click para ver detalle y evidencias
                            </Text>
                          </Stack>
                        }
                        withArrow
                        position="top"
                      >
                        <span
                          onClick={() => setSelectedDia(log)}
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-md text-[10px] font-bold cursor-pointer transition-all hover:scale-105 active:scale-95 ${
                            log.tipo_contrato === "Planilla"
                              ? "bg-sky-950/40 text-sky-400 border border-sky-800/40 hover:bg-sky-900/60"
                              : "bg-amber-950/40 text-amber-400 border border-amber-800/40 hover:bg-amber-900/60"
                          }`}
                        >
                          {valorJornada.toString()}
                        </span>
                      </Tooltip>
                    ) : (
                      <span className="text-zinc-600/60">—</span>
                    )}
                  </Table.Td>
                );
              })}
            </Table.Tr>
          </Table.Tbody>
        </Table>
      </div>

      <ModalDetalleAsistenciaDiaria
        opened={selectedDia !== null}
        onClose={() => setSelectedDia(null)}
        selectedDia={selectedDia}
        empleadoNombre={emp.empleado}
        empleadoDni={emp.dni}
        empleadoFoto={emp.url_foto}
      />
    </div>
  );
};

export const AsistenciaPage = () => {
  useTitlePage("Asistencia");

  const filtros = useFiltrosAsistencia();
  const { asistenciasPorEmpleado, loading } = useAsistencias(filtros);

  const aniosOptions = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => {
        const year = dayjs().year() - i;
        return { value: String(year), label: String(year) };
      }),
    [],
  );

  const yearVal = Number(filtros.year) || dayjs().year();
  const mesVal = Number(filtros.mes) || (dayjs().month() + 1);
  const diasMes = dayjs(`${yearVal}-${mesVal}-01`).daysInMonth();
  const dias = Array.from({ length: diasMes }, (_, i) => i + 1);

  return (
    <div className="space-y-6 animate-fade-in text-zinc-100">
      {/* Filtros estilo Kardex */}
      <div className="flex flex-col md:flex-row items-end gap-3 w-full pb-2">
        <div className="w-full md:w-40">
          <Select
            label="Mes"
            placeholder="Mes"
            leftSection={<CalendarDaysIcon className="w-4 h-4 text-zinc-500" />}
            data={MESES}
            value={filtros.mes}
            onChange={(val) => filtros.setMes(val ?? "")}
            allowDeselect={false}
            radius="lg"
            size="sm"
            classNames={{
              input:
                "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 text-white",
              label: "text-zinc-400 text-xs font-semibold mb-1 ml-1",
              dropdown: "bg-zinc-900 border-zinc-800",
              option: "text-zinc-300 hover:bg-zinc-800",
            }}
          />
        </div>

        <div className="w-full md:w-32">
          <Select
            label="Año"
            placeholder="Año"
            data={aniosOptions}
            value={filtros.year}
            onChange={(val) => filtros.setYear(val ?? "")}
            allowDeselect={false}
            radius="lg"
            size="sm"
            classNames={{
              input:
                "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 text-white",
              label: "text-zinc-400 text-xs font-semibold mb-1 ml-1",
              dropdown: "bg-zinc-900 border-zinc-800",
              option: "text-zinc-300 hover:bg-zinc-800",
            }}
          />
        </div>

        <div className="flex-1 min-w-[200px] w-full">
          <TextInput
            label="Búsqueda"
            placeholder="Buscar empleado por nombre o DNI..."
            leftSection={
              <MagnifyingGlassIcon className="w-4 h-4 text-zinc-400" />
            }
            value={filtros.q}
            onChange={(e) => filtros.setQ(e.currentTarget.value)}
            radius="lg"
            size="sm"
            classNames={{
              input:
                "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500 transition-all",
              label: "text-zinc-400 text-xs font-semibold mb-1 ml-1",
            }}
          />
        </div>

        <Divider orientation="vertical" h={36} className="hidden md:block" />

        <Tooltip label="Próximamente" withArrow>
          <Button
            leftSection={<ArrowDownTrayIcon className="w-4 h-4" />}
            radius="lg"
            size="sm"
            variant="default"
            disabled
            className="bg-zinc-800 text-zinc-500 border border-zinc-700 shrink-0 h-[36px] px-3 cursor-not-allowed"
          >
            Exportar
          </Button>
        </Tooltip>
      </div>

      {/* Contenido principal agrupado por Empleado con vista de matriz horizontal */}
      {loading ? (
        <div className="flex items-center justify-center p-16">
          <Loader color="indigo" />
        </div>
      ) : asistenciasPorEmpleado.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 border-2 border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
          <CalendarDaysIcon className="w-12 h-12 text-zinc-600 mb-3" />
          <Text className="text-zinc-400 font-bold text-lg">
            Sin marcaciones en el período
          </Text>
          <Text className="text-zinc-500 text-sm mt-1">
            Ajusta los filtros o espera a que los empleados marquen asistencia.
          </Text>
        </div>
      ) : (
        <div className="space-y-6">
          {asistenciasPorEmpleado.map((emp) => (
            <EmpleadoAsistenciaCard
              key={emp.id_empleado}
              emp={emp}
              dias={dias}
              yearVal={yearVal}
              mesVal={mesVal}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AsistenciaPage;