import { useEffect, useMemo, useState, useCallback } from "react";
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
  ActionIcon,
  Tooltip,
  Popover,
} from "@mantine/core";
import { ArchivoCard } from "../../../presentation/utils/archivo/archivo-card";
import type { IArchivo } from "../../../shared/interfaces/archivo";
import {
  CalendarDaysIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  CheckIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import { useTitlePage } from "../../../hooks/useTitlePage";
import { useFiltrosAsistencia } from "../hooks/useFiltrosAsistencia";
import { useAsistencias } from "../hooks/useAsistencias";
import { MESES } from "../../../shared/variables/meses";
import type { RES_Asistencia, RES_IntentoFallidoAnonimo } from "../service/asistencia.responses";
import { ModalDetalleAsistenciaDiaria } from "./modal-detalle-asistencia-diaria";
import { DataTableEstandar } from "../../../presentation/utils/datatable-estandar";
import { AsistenciaService } from "../service/asistencia.service";
import { ModalEstandar } from "../../../presentation/utils/modal-estandar";
import { BotonRecargar } from "../../../presentation/utils/boton-recargar";

const format12h = (timeStr: string | null | undefined) => {
  if (!timeStr) return "—";
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

interface IEvidenciaDetalle {
  tipo: string;
  motivo?: string;
  qr_token?: string;
}

const getMotivoCancelacion = (evidenciasStr: string | unknown[] | null) => {
  if (!evidenciasStr) return "Desconocido / Cancelado por usuario";
  try {
    const list = typeof evidenciasStr === "string" ? JSON.parse(evidenciasStr) : evidenciasStr;
    if (Array.isArray(list)) {
      const errorItem = list.find((e: IEvidenciaDetalle) => e.tipo === "error_sistema");
      if (errorItem) return errorItem.motivo || "Error de sistema";
      const cancelItem = list.find((e: IEvidenciaDetalle) => e.tipo === "cancelacion");
      if (cancelItem) return cancelItem.motivo || "Cancelado por usuario";
    }
  } catch {
    // ignore
  }
  return "Cancelado por usuario";
};

const getQrTokenFromEvidencias = (item: RES_IntentoFallidoAnonimo) => {
  const evidenciasStr = item.evidencias;
  if (evidenciasStr) {
    try {
      const list = typeof evidenciasStr === "string" ? JSON.parse(evidenciasStr) : evidenciasStr;
      if (Array.isArray(list)) {
        const found = list.find((e: IEvidenciaDetalle) => e.qr_token);
        if (found?.qr_token) return found.qr_token;
      }
    } catch {
      // ignore
    }
  }
  return (item as RES_IntentoFallidoAnonimo & { empleado_qr_token?: string | null }).empleado_qr_token || "—";
};

const getArchivosFromEvidencias = (evidenciasStr: string | unknown[] | null): IArchivo[] => {
  if (!evidenciasStr) return [];
  try {
    const list = typeof evidenciasStr === "string" ? JSON.parse(evidenciasStr) : evidenciasStr;
    if (Array.isArray(list)) {
      return list.filter((e: IArchivo) => e.url) as IArchivo[];
    }
  } catch {
    // ignore
  }
  return [];
};

interface ModalIntentosFallidosAnonimosProps {
  opened: boolean;
  onClose: () => void;
  mes: number;
  year: number;
}

const ModalIntentosFallidosAnonimos = ({
  opened,
  onClose,
  mes,
  year,
}: ModalIntentosFallidosAnonimosProps) => {
  const [loading, setLoading] = useState(false);
  const [intentos, setIntentos] = useState<RES_IntentoFallidoAnonimo[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const recargar = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (!opened) return;
    let active = true;

    Promise.resolve().then(() => {
      if (active) setLoading(true);
    });

    AsistenciaService.get_intentos_fallidos_anonimos(mes, year)
      .then((resp) => {
        if (active && resp.success) {
          setIntentos(resp.data || []);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [opened, mes, year, refreshKey]);

  const columns = useMemo(
    () => [
      {
        accessor: "index",
        title: "#",
        width: 50,
      },
      {
        accessor: "fecha_hora",
        title: "Fecha / Hora",
        render: (item: RES_IntentoFallidoAnonimo) => (
          <Group gap={4}>
            <ClockIcon className="w-3.5 h-3.5 text-zinc-550" />
            <Text size="xs" className="font-mono text-zinc-400">
              {dayjs(item.fecha_hora).format("DD/MM/YYYY hh:mm A")}
            </Text>
          </Group>
        ),
      },
      {
        accessor: "empleado_nombre",
        title: "Empleado",
        render: (item: RES_IntentoFallidoAnonimo) => {
          const typedItem = item as RES_IntentoFallidoAnonimo & { empleado_nombre?: string | null; empleado_url_foto?: string | null };
          const empNombre = typedItem.empleado_nombre || "Anónimo";
          const inicial = empNombre[0] ?? "?";
          return (
            <Group gap="sm">
              <Avatar src={typedItem.empleado_url_foto ?? undefined} size="sm" radius="xl" color="indigo" variant="light">
                {inicial}
              </Avatar>
              <Text size="xs" fw={700} className="text-zinc-300">
                {empNombre}
              </Text>
            </Group>
          );
        },
      },
      {
        accessor: "motivo",
        title: "Motivo",
        render: (item: RES_IntentoFallidoAnonimo) => {
          const motivo = getMotivoCancelacion(item.evidencias);
          return (
            <Text size="xs" fw={600} className="text-red-400">
              {motivo}
            </Text>
          );
        },
      },
      {
        accessor: "qr_token",
        title: "Código QR Token",
        render: (item: RES_IntentoFallidoAnonimo) => {
          const token = getQrTokenFromEvidencias(item);
          return token !== "—" ? (
            <Badge color="pink" variant="light" size="xs" className="font-mono lowercase">
              {token}
            </Badge>
          ) : (
            <Text size="xs" c="dimmed">
              —
            </Text>
          );
        },
      },
      {
        accessor: "evidencia",
        title: "Evidencia",
        textAlign: "center" as const,
        render: (item: RES_IntentoFallidoAnonimo) => {
          const archivos = getArchivosFromEvidencias(item.evidencias);
          if (archivos.length === 0) return <Text size="xs" className="text-zinc-650">—</Text>;
          return (
            <Group justify="center">
              <Popover width={320} position="bottom" withArrow shadow="md">
                <Popover.Target>
                  <ActionIcon variant="light" color="indigo" size="sm" radius="md">
                    <EyeIcon className="w-3.5 h-3.5" />
                  </ActionIcon>
                </Popover.Target>
                <Popover.Dropdown className="bg-zinc-900 border-zinc-800 p-2">
                  <div className="space-y-2">
                    <Text size="xs" fw={700} className="text-zinc-300 mb-1 text-left">
                      Fotos de Evidencia:
                    </Text>
                    {archivos.map((file, fIdx) => (
                      <ArchivoCard key={fIdx} archivo={file} />
                    ))}
                  </div>
                </Popover.Dropdown>
              </Popover>
            </Group>
          );
        },
      },
    ],
    []
  );

  return (
    <ModalEstandar
      opened={opened}
      close={onClose}
      title="Intentos Fallidos"
      size="75rem"
      rightSection={<BotonRecargar onReload={recargar} loading={loading} />}
    >
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader color="red" />
        </div>
      ) : intentos.length === 0 ? (
        <div className="text-center p-12 text-zinc-550 italic">
          No hay intentos fallidos registrados en este período.
        </div>
      ) : (
        <div className="bg-zinc-900/65 border border-zinc-800 rounded-[24px] shadow-2xl overflow-hidden backdrop-blur-md">
          <DataTableEstandar
            idAccessor="id"
            columns={columns}
            records={intentos}
            loading={loading}
            initialPageSize={10}
          />
        </div>
      )}
    </ModalEstandar>
  );
};

export const AsistenciaPage = () => {
  useTitlePage("Asistencia");

  const filtros = useFiltrosAsistencia();
  const { asistencias, loading, recargar } = useAsistencias(filtros);
  const [selectedDia, setSelectedDia] = useState<RES_Asistencia | null>(null);
  const [intentosFallidosOpened, setIntentosFallidosOpened] = useState(false);

  const aniosOptions = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => {
        const year = dayjs().year() - i;
        return { value: String(year), label: String(year) };
      }),
    [],
  );

  const asistenciasFiltradas = useMemo(() => {
    const query = (filtros.q ?? "").toLowerCase().trim();
    if (!query) return asistencias;

    return asistencias.filter((a) => {
      const nomCompleto = `${a.nombre ?? ""} ${a.apellido ?? ""}`.toLowerCase();
      const dni = (a.dni ?? "").toLowerCase();
      return nomCompleto.includes(query) || dni.includes(query);
    });
  }, [asistencias, filtros.q]);

  // 1 fila por (empleado, día, id_programacion_horario). Si el empleado tuvo
  // 2 turnos en el día, se muestran 2 filas naturalmente.
  const registrosParaTabla = useMemo(() => {
    return asistenciasFiltradas;
  }, [asistenciasFiltradas]);

  const columns = useMemo(
    () => [
      {
        accessor: "index",
        title: "#",
        width: 50,
      },
      {
        accessor: "empleado",
        title: "Empleado",
        render: (a: RES_Asistencia) => {
          const empNombre = `${a.nombre ?? ""} ${a.apellido ?? ""}`.trim();
          const inicial = a.nombre?.[0] ?? "?";
          return (
            <Group gap="sm">
              <Avatar src={a.url_foto ?? undefined} size="sm" radius="xl" color="indigo" variant="light">
                {inicial}
              </Avatar>
              <Stack gap={1}>
                <Text size="xs" fw={700} className="text-white">
                  {empNombre}
                </Text>
                <Text size="9px" c="dimmed">
                  DNI: {a.dni ?? "—"}
                </Text>
              </Stack>
            </Group>
          );
        },
      },
      {
        accessor: "tipo_contrato",
        title: "Contrato",
        render: (a: RES_Asistencia) => {
          const tc = a.tipo_contrato;
          const label =
            tc === "PeriodoPrueba"
              ? "Periodo de Prueba"
              : tc === "JornadaDiaria"
                ? "Jornada Diaria"
                : tc ?? "S/C";
          const color =
            tc === "PeriodoPrueba"
              ? "violet"
              : tc === "Planilla"
                ? "indigo"
                : "teal";
          return (
            <Badge variant="light" color={color} size="xs">
              {label}
            </Badge>
          );
        },
      },
      {
        accessor: "fecha",
        title: "Fecha",
        render: (a: RES_Asistencia) => (
          <Text size="xs" fw={600} className="text-zinc-300">
            {dayjs(a.fecha).format("DD/MM/YYYY")}
          </Text>
        ),
      },
      {
        accessor: "fecha_hora_ingreso",
        title: "Ingreso / Intento",
        render: (a: RES_Asistencia) => (
          <Text size="xs" fw={700} className="text-rose-400 font-mono">
            {format12h(a.fecha_hora_ingreso)}
          </Text>
        ),
      },
      {
        accessor: "fecha_hora_salida",
        title: "Salida",
        render: (a: RES_Asistencia) => (
          <Text size="xs" fw={700} className="text-rose-400 font-mono">
            {format12h(a.fecha_hora_salida)}
          </Text>
        ),
      },
      {
        accessor: "total_horas",
        title: "Horas Trab.",
        render: (a: RES_Asistencia) => (
          a.total_horas !== null && Number(a.total_horas) > 0 ? (
            <Group gap={4}>
              <ClockIcon className="w-3.5 h-3.5 text-zinc-555" />
              <Text size="xs" fw={700} className="text-sky-400 font-mono">
                {Number(a.total_horas).toFixed(2)} h
              </Text>
            </Group>
          ) : (
            <Text size="xs" c="dimmed">
              —
            </Text>
          )
        ),
      },
      {
        accessor: "tardanza",
        title: "Tardanza",
        render: (a: RES_Asistencia) => (
          a.minutos_tardanza !== null && Number(a.minutos_tardanza) > 0 ? (
            <Badge color="red" variant="light" size="xs">
              {a.minutos_tardanza} min
            </Badge>
          ) : (
            <Text size="xs" className="text-zinc-500">
              0 min
            </Text>
          )
        ),
      },
      {
        accessor: "lugar_nombre",
        title: "Lugar",
        render: (a: RES_Asistencia) => (
          a.lugar_nombre ? (
            <Group gap={4}>
              <MapPinIcon className="w-3.5 h-3.5 text-zinc-555" />
              <Text size="xs" className="text-zinc-300">
                {a.lugar_nombre}
              </Text>
            </Group>
          ) : (
            <Text size="xs" c="dimmed">
              —
            </Text>
          )
        ),
      },
      {
        accessor: "estado",
        title: "Estado",
        render: (a: RES_Asistencia & { estado?: string }) => {
          const est = a.estado ?? "Exitoso";
          const isExitoso = est === "Exitoso";
          return (
            <Badge
              color={isExitoso ? "green" : "red"}
              variant="light"
              size="xs"
              leftSection={
                isExitoso ? (
                  <CheckIcon className="w-3 h-3 text-green-400 mr-0.5" />
                ) : (
                  <XCircleIcon className="w-3 h-3 text-red-400 mr-0.5" />
                )
              }
            >
              {est}
            </Badge>
          );
        },
      },
      {
        accessor: "registro",
        title: "Registro",
        render: (a: RES_Asistencia) => (
          <Badge
            color={a.asistencia_es_manual ? "yellow" : "zinc"}
            variant="outline"
            size="xs"
          >
            {a.asistencia_es_manual ? "Manual" : "QR"}
          </Badge>
        ),
      },
      {
        accessor: "acciones",
        title: "Acciones",
        textAlign: "center" as const,
        render: (a: RES_Asistencia) => (
          <Group justify="center">
            <Tooltip label="Ver detalles y evidencias" withArrow position="top" radius="md">
              <ActionIcon
                variant="light"
                color="indigo"
                size="md"
                radius="md"
                onClick={() => setSelectedDia(a)}
                className="bg-indigo-950/30 hover:bg-indigo-900/40 text-indigo-400 border border-indigo-900/30"
              >
                <EyeIcon className="w-4 h-4" />
              </ActionIcon>
            </Tooltip>
          </Group>
        ),
      },
    ],
    [],
  );

  const yearVal = Number(filtros.year) || dayjs().year();
  const mesVal = Number(filtros.mes) || dayjs().month() + 1;

  return (
    <div className="space-y-6 animate-fade-in text-zinc-100">
      <div className="flex flex-col sm:flex-row gap-4 items-end justify-between w-full pb-2">
        <div className="flex flex-col sm:flex-row gap-3 flex-grow w-full">
          <div className="w-full sm:w-40">
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

          <div className="w-full sm:w-32">
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

          <div className="flex-grow min-w-[200px] w-full">
            <TextInput
              label="Búsqueda"
              placeholder="Buscar por empleado o DNI..."
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

        <div className="flex gap-2 items-center shrink-0">
          <BotonRecargar onReload={recargar} loading={loading} />
          <Button
            leftSection={<ExclamationTriangleIcon className="w-4 h-4 text-white" />}
            radius="lg"
            size="sm"
            onClick={() => setIntentosFallidosOpened(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold h-[38px] px-6 rounded-xl shrink-0 border-none shadow-md shadow-orange-950/20 w-full sm:w-auto"
          >
            Ver Intentos Fallidos
          </Button>
        </div>
      </div>

      <div className="bg-zinc-900/65 border border-zinc-800 rounded-[24px] shadow-2xl overflow-hidden backdrop-blur-md">
        <DataTableEstandar
          idAccessor="id"
          columns={columns}
          records={registrosParaTabla}
          loading={loading}
          initialPageSize={25}
        />
      </div>

      <ModalDetalleAsistenciaDiaria
        opened={selectedDia !== null}
        onClose={() => setSelectedDia(null)}
        selectedDia={selectedDia}
        empleadoNombre={
          selectedDia
            ? `${selectedDia.nombre ?? ""} ${selectedDia.apellido ?? ""}`.trim()
            : ""
        }
        empleadoDni={selectedDia ? selectedDia.dni : ""}
        empleadoFoto={selectedDia ? selectedDia.url_foto : ""}
      />

      <ModalIntentosFallidosAnonimos
        opened={intentosFallidosOpened}
        onClose={() => setIntentosFallidosOpened(false)}
        mes={mesVal}
        year={yearVal}
      />
    </div>
  );
};

export default AsistenciaPage;