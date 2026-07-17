import { useMemo } from "react";
import {
  Avatar,
  Badge,
  Group,
  Loader,
  Select,
  Stack,
  Text,
  TextInput,
  Divider,
  Table,
} from "@mantine/core";
import {
  CalendarDaysIcon,
  MagnifyingGlassIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import { useTitlePage } from "../../../hooks/useTitlePage";
import { useFiltrosPlanilla } from "../hooks/useFiltrosPlanilla";
import { usePlanilla } from "../hooks/usePlanilla";
import { MESES } from "../../../shared/variables/meses";
import type { RES_PlanillaAsistencia } from "../service/planilla.responses";


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
    marcaciones: RES_PlanillaAsistencia[];
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
                {emp.jornada_total.toFixed(2)}
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
                      <span
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-md text-[10px] font-bold ${
                          log.tipo_contrato === "Planilla"
                            ? "bg-sky-950/40 text-sky-400 border border-sky-800/40"
                            : "bg-amber-950/40 text-amber-400 border border-amber-800/40"
                        }`}
                      >
                        {valorJornada.toFixed(2)}
                      </span>
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
    </div>
  );
};

export const PlanillaPage = () => {
  useTitlePage("Planilla");

  const filtros = useFiltrosPlanilla();
  const { planillaPorEmpleado, loading } = usePlanilla(filtros);

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

  // Agrupar planillaPorEmpleado por lugar
  const planillaAgrupada = useMemo(() => {
    const grupos: Record<string, typeof planillaPorEmpleado> = {};
    for (const emp of planillaPorEmpleado) {
      const lugar = emp.marcaciones.find((m) => m.lugar_nombre)?.lugar_nombre ?? "Sin Lugar Asignado";
      if (!grupos[lugar]) {
        grupos[lugar] = [];
      }
      grupos[lugar].push(emp);
    }
    return grupos;
  }, [planillaPorEmpleado]);

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
                "bg-zinc-950/50 border-zinc-800 focus:border-zinc-300 text-white",
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
                "bg-zinc-950/50 border-zinc-800 focus:border-zinc-300 text-white",
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
                "bg-zinc-950/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500 transition-all",
              label: "text-zinc-400 text-xs font-semibold mb-1 ml-1",
            }}
          />
        </div>
      </div>

      {/* Contenido principal agrupado por Empleado con vista de matriz horizontal */}
      {loading ? (
        <div className="flex items-center justify-center p-16">
          <Loader color="indigo" />
        </div>
      ) : planillaPorEmpleado.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 border-2 border-dashed border-zinc-855 rounded-2xl bg-zinc-900/10">
          <CalendarDaysIcon className="w-12 h-12 text-zinc-650 mb-3" />
          <Text className="text-zinc-400 font-bold text-lg">
            Sin marcaciones en el período
          </Text>
          <Text className="text-zinc-500 text-sm mt-1">
            Ajusta los filtros o espera a que los empleados marquen asistencia.
          </Text>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(planillaAgrupada).map(([lugar, empleados]) => (
            <div key={lugar} className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 ml-1">
                <div className="w-1 h-5 bg-gradient-to-b from-indigo-500 to-pink-500 rounded-full" />
                <Text fw={800} size="xs" className="text-zinc-300 uppercase tracking-widest font-sans">
                  Lugar de Trabajo: {lugar}
                </Text>
                <Badge variant="light" color="indigo" size="xs" className="ml-2 font-bold">
                  {empleados.length} {empleados.length === 1 ? "empleado" : "empleados"}
                </Badge>
              </div>
              <div className="space-y-6">
                {empleados.map((emp) => (
                  <EmpleadoAsistenciaCard
                    key={emp.id_empleado}
                    emp={emp}
                    dias={dias}
                    yearVal={yearVal}
                    mesVal={mesVal}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlanillaPage;
