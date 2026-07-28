import { Avatar, Badge, Group, Stack, Text } from "@mantine/core";
import dayjs from "dayjs";
import { ModalEstandar } from "../../../presentation/utils/modal-estandar";
import { ArchivoCard } from "../../../presentation/utils/archivo/archivo-card";
import type { IArchivo } from "../../../shared/interfaces/archivo";
import type { RES_Asistencia } from "../service/asistencia.responses";

// Función utilitaria local para dar formato de 12 horas.
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

// Detecta si un marcaje cayó fuera de la tolerancia configurada del turno.
const marcajeFueraDeTolerancia = (m: RES_Asistencia["marcajes"][number]): boolean => {
  if (!Array.isArray(m.evidencias)) return false;
  return m.evidencias.some(
    (e) =>
      typeof e === "object" &&
      e !== null &&
      "tipo" in e &&
      (e as { tipo?: string }).tipo === "fuera_de_tolerancia",
  );
};

interface ModalDetalleAsistenciaDiariaProps {
  opened: boolean;
  onClose: () => void;
  selectedDia: RES_Asistencia | null;
  empleadoNombre: string;
  empleadoDni: string | null;
  empleadoFoto: string | null;
}

export const ModalDetalleAsistenciaDiaria = ({
  opened,
  onClose,
  selectedDia,
  empleadoNombre,
  empleadoDni,
  empleadoFoto,
}: ModalDetalleAsistenciaDiariaProps) => {
  // Sueldo snapshot del día (preferimos el snapshot de la programación sobre el contrato).
  const sueldoBaseEfectivo =
    selectedDia?.programacion_sueldo_base ?? selectedDia?.sueldo_base ?? null;
  const salarioDiarioEfectivo =
    selectedDia?.programacion_sueldo_diario ?? selectedDia?.salario_diario ?? null;
  const tipoEfectivo =
    selectedDia?.programacion_tipo_contrato ?? selectedDia?.tipo_contrato ?? null;

  const huboFueraDeTolerancia =
    selectedDia?.marcajes?.some((m) => marcajeFueraDeTolerancia(m)) ?? false;

  // (Badge de fuera de tolerancia oculto por requerimiento del usuario.)
  void huboFueraDeTolerancia;

  return (
    <ModalEstandar
      opened={opened}
      close={onClose}
      title={
        selectedDia
          ? `Asistencia - ${dayjs(selectedDia.fecha).format("DD [de] MMMM, YYYY")}`
          : "Detalles de Asistencia"
      }
      size="lg"
    >
          {selectedDia && (
        <Stack gap="md" className="pt-2">
          {/* Cabecera del Empleado dentro del Modal */}
          <Group
            justify="space-between"
            align="center"
            className="bg-zinc-900/30 p-4 border border-white/5 rounded-2xl"
          >
            <Group gap="sm">
              <Avatar src={empleadoFoto ?? undefined} radius="xl" size="md" />
              <Stack gap={1}>
                <Text size="sm" fw={800} className="text-white">
                  {empleadoNombre}
                </Text>
                <Text size="10px" c="dimmed">
                  DNI: {empleadoDni ?? "—"}
                </Text>
              </Stack>
            </Group>
            <Badge
              color={tipoEfectivo === "Planilla" ? "indigo" : "teal"}
              variant="light"
              radius="md"
            >
              {tipoEfectivo ?? "S/C"}
            </Badge>
          </Group>

          {/* Ficha Informativa del Contrato y Horario de ese día */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 bg-zinc-900/20 border border-white/5 rounded-2xl space-y-2">
              <Text
                size="xs"
                fw={700}
                c="dimmed"
                className="uppercase tracking-wider"
              >
                Información
              </Text>
              <div className="space-y-1">
                {selectedDia.cargo_nombre && (
                  <Text size="xs" fw={600} className="text-zinc-200">
                    Cargo:{" "}
                    <span className="text-white font-bold">
                      {selectedDia.cargo_nombre}
                    </span>
                  </Text>
                )}
                {selectedDia.area_nombre && (
                  <Text size="xs" className="text-zinc-300">
                    Área: {selectedDia.area_nombre}
                  </Text>
                )}
                <Text size="xs" className="text-zinc-300">
                  Sueldo/Tarifa:{" "}
                  <span className="font-mono text-cyan-400 font-bold">
                    {tipoEfectivo === "Planilla"
                      ? (sueldoBaseEfectivo !== null
                        ? `S/. ${sueldoBaseEfectivo.toFixed(2)} (Mes)`
                        : salarioDiarioEfectivo !== null
                          ? `S/. ${salarioDiarioEfectivo.toFixed(2)} (Mes)`
                          : "—")
                      : tipoEfectivo === "JornadaDiaria"
                        ? (salarioDiarioEfectivo !== null
                          ? `S/. ${salarioDiarioEfectivo.toFixed(2)} (Día)`
                          : sueldoBaseEfectivo !== null
                            ? `S/. ${sueldoBaseEfectivo.toFixed(2)} (Día)`
                            : "—")
                        : "—"}
                  </span>
                </Text>
              </div>
            </div>

            <div className="p-4 bg-zinc-900/20 border border-white/5 rounded-2xl space-y-2">
              <Text
                size="xs"
                fw={700}
                c="dimmed"
                className="uppercase tracking-wider"
              >
                Horario y Lugar
              </Text>
              <div className="space-y-1">
                <Text size="xs" className="text-zinc-200">
                  Turno:{" "}
                  <span className="text-indigo-400 font-bold">
                    {selectedDia.tipo_turno ?? "Sin Turno"}
                  </span>
                </Text>
                {selectedDia.hora_ingreso && (
                  <Text size="xs" className="text-zinc-300">
                    Horario: {format12h(selectedDia.hora_ingreso)} -{" "}
                    {format12h(selectedDia.hora_salida)}
                    {selectedDia.minutos_tolerancia !== null && (
                      <span className="text-zinc-500">
                        {" "}(tol. {selectedDia.minutos_tolerancia} min)
                      </span>
                    )}
                  </Text>
                )}
                {selectedDia.lugar_nombre && (
                  <Text size="xs" className="text-zinc-300">
                    Lugar: {selectedDia.lugar_nombre}{" "}
                    {selectedDia.lugar_tipo ? `(${selectedDia.lugar_tipo})` : ""}
                  </Text>
                )}
              </div>
            </div>
          </div>

          {/* Métricas consolidadas del día */}
          <div className="grid grid-cols-3 gap-2 text-center bg-zinc-900/30 p-3.5 rounded-2xl border border-white/5">
            <div>
              <Text size="9px" c="dimmed" className="uppercase font-semibold">
                Horas Trab.
              </Text>
              <Text size="sm" fw={800} className="text-sky-400 font-mono">
                {selectedDia.total_horas !== null
                  ? `${Number(selectedDia.total_horas).toFixed(2)} h`
                  : "—"}
              </Text>
            </div>
            <div>
              <Text size="9px" c="dimmed" className="uppercase font-semibold">
                Jornada
              </Text>
              <Text size="sm" fw={800} className="text-white font-mono">
                {selectedDia.jornada_trabajada !== null
                  ? Number(selectedDia.jornada_trabajada).toFixed(4)
                  : "—"}
              </Text>
            </div>
            <div>
              <Text size="9px" c="dimmed" className="uppercase font-semibold">
                Tardanza
              </Text>
              <Text
                size="sm"
                fw={800}
                className="font-mono"
                c={Number(selectedDia.minutos_tardanza) > 0 ? "red.4" : "zinc.4"}
              >
                {Number(selectedDia.minutos_tardanza) > 0
                  ? `${selectedDia.minutos_tardanza} min`
                  : "0 min"}
              </Text>
            </div>
          </div>

          {/* Listado de Marcajes y Evidencias */}
          <Stack gap="xs" mt="xs">
            <Text
              size="xs"
              fw={700}
              c="dimmed"
              className="uppercase tracking-wider"
            >
              Evidencias
            </Text>
            {selectedDia.marcajes && selectedDia.marcajes.length > 0 ? (
              <div className="space-y-3">
                {selectedDia.marcajes.map((m) => {
                  let archivos: IArchivo[] = [];
                  if (m.evidencias) {
                    try {
                      archivos =
                        typeof m.evidencias === "string"
                          ? JSON.parse(m.evidencias)
                          : (m.evidencias as IArchivo[]);
                    } catch {
                      /* ignore */
                    }
                  }
                  const fuera = marcajeFueraDeTolerancia(m);
                  void fuera; // (Badge oculto por requerimiento del usuario.)
                  return (
                    <div
                      key={m.id}
                      className="p-4 bg-zinc-900/10 border border-white/5 rounded-2xl space-y-3"
                    >
                      <Group justify="space-between" align="center">
                        <Group gap="xs">
                          <Badge
                            color={m.tipo_marcaje === "Ingreso" ? "emerald" : "blue"}
                            variant="light"
                          >
                            {m.tipo_marcaje ?? "Registro"}
                          </Badge>
                          <Text size="xs" fw={700} className="text-zinc-200 font-mono">
                            {format12h(m.fecha_hora)}
                          </Text>
                        </Group>
                        <Badge
                          color={m.es_manual ? "yellow" : "zinc"}
                          variant="outline"
                          size="xs"
                        >
                          {m.es_manual ? "Manual" : "Lector QR"}
                        </Badge>
                      </Group>

                      {/* Evidencias fotográficas del registro individual */}
                      {archivos.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {archivos.map((file, fIdx) => (
                            <ArchivoCard key={fIdx} archivo={file} />
                          ))}
                        </div>
                      ) : (
                        <Text size="10px" c="zinc.6" className="italic">
                          Sin fotos de evidencia para este registro
                        </Text>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <Text size="xs" c="zinc.5" ta="center" className="py-4">
                No se registran marcas para este día
              </Text>
            )}
          </Stack>
        </Stack>
      )}
    </ModalEstandar>
  );
};
