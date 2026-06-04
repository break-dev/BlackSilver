import { type DataTableColumn } from "mantine-datatable";
import { DataTableEstandar } from "../../../../presentation/utils/datatable-estandar";
import type { RES_ActivoFijoResumen } from "../../service/activos.responses";
import { ProductGroupHeader } from "./product-group-header";
import { Badge, Text, Group, Stack, Tooltip, Button } from "@mantine/core";
import { MapPinIcon, MapIcon, StarIcon, AdjustmentsHorizontalIcon, ClockIcon, ArrowTrendingUpIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

export interface GroupedActivoProducto {
  id_producto: number;
  producto: string;
  categoria: string | null;
  es_auditable: boolean;
  para_transporte: boolean;
  control_por_odometro: boolean;
  control_por_horometro: boolean;
  control_por_vueltas: boolean;
  activos: RES_ActivoFijoResumen[];
}

interface ProductGroupCardProps {
  product: GroupedActivoProducto;
  loading: boolean;
  onMoverActivo: (record: RES_ActivoFijoResumen) => void;
  onVerHistorial: (record: RES_ActivoFijoResumen) => void;
  onConfigurarAlertas: (record: RES_ActivoFijoResumen) => void;
  onResolverMantenimiento: (record: RES_ActivoFijoResumen, tipo: "horometro" | "odometro" | "vueltas") => void;
}

const parseEspecificaciones = (
  raw: { clave: string; valor: string }[] | null,
): { clave: string; valor: string }[] => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed)
        ? (parsed as { clave: string; valor: string }[])
        : [];
    } catch {
      return [];
    }
  }
  return [];
};

export const ProductGroupCard = ({
  product,
  loading,
  //onMoverActivo,
  onConfigurarAlertas,
  onResolverMantenimiento,
}: ProductGroupCardProps) => {
  const columns: DataTableColumn<RES_ActivoFijoResumen>[] = [
    {
      accessor: "index",
      title: "#",
      textAlign: "center",
      width: 50,
    },
    {
      accessor: "correlativo",
      title: "Código",
      width: 140,
      render: (record) => (
        <Stack gap={1}>
          <Badge variant="light" color="indigo" size="sm" radius="sm" fw={700}>
            {record.correlativo}
          </Badge>
          {record.codigo && (
            <Text size="10px" c="dimmed" fw={600} className="ml-1">
              Cód: {record.codigo}
            </Text>
          )}
        </Stack>
      ),
    },
    {
      accessor: "marca_modelo",
      title: "Marca & Modelo",
      width: 220,
      render: (record) => (
        <Stack gap={1}>
          <Text size="xs" fw={700} c="white">
            {record.marca || "Genérica"} {record.modelo || "-"}
          </Text>
          <Text size="xs" c="dimmed">
            Año: {record.yearcito_modelo || "N/A"}{" "}
            {record.numero_serie ? `| S/N: ${record.numero_serie}` : ""}
          </Text>
        </Stack>
      ),
    },
    {
      accessor: "ubicacion",
      title: "Ubicación",
      width: 220,
      render: (record) => {
        const isMina = !!record.id_mina;
        const isAlmacen = !!record.id_almacen;

        if (!isMina && !isAlmacen) {
          return (
            <Text size="xs" c="dimmed" fs="italic">
              Sin ubicación
            </Text>
          );
        }

        return (
          <Group gap="xs" wrap="nowrap">
            <div
              className={`p-1.5 rounded-md ${
                isMina
                  ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                  : "bg-teal-500/10 text-teal-400 border border-teal-500/20"
              }`}
            >
              {isMina ? (
                <MapIcon className="w-3.5 h-3.5" />
              ) : (
                <MapPinIcon className="w-3.5 h-3.5" />
              )}
            </div>
            <Stack gap={0}>
              <Group gap={4} wrap="nowrap">
                <Text
                  size="xs"
                  fw={700}
                  c="white"
                  className="truncate max-w-[140px]"
                >
                  {record.mina || record.almacen}
                </Text>
                {record.en_almacen_principal ? (
                  <Tooltip label="Almacén Principal">
                    <StarIcon className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 shrink-0" />
                  </Tooltip>
                ) : null}
              </Group>
              <Text
                size="10px"
                c="dimmed"
                className="uppercase font-bold tracking-wider"
              >
                {isMina ? "Mina" : "Almacén"}
              </Text>
            </Stack>
          </Group>
        );
      },
    },
    {
      accessor: "especificaciones",
      title: "Especificaciones",
      render: (record) => {
        const specs = parseEspecificaciones(record.especificaciones);
        if (specs.length === 0) {
          return (
            <Text size="sm" c="dimmed">
              -
            </Text>
          );
        }
        return (
          <Group gap={4} wrap="wrap">
            {specs.map((sp, sIdx) => (
              <Badge
                key={sIdx}
                variant="light"
                color="blue"
                size="sm"
                radius="sm"
                classNames={{
                  root: "bg-zinc-800/40 text-zinc-300 border border-zinc-700/30",
                }}
              >
                {sp.clave}: {sp.valor}
              </Badge>
            ))}
          </Group>
        );
      },
    },
    {
      accessor: "control",
      title: "Control de Mantenimiento",
      width: 380,
      render: (record) => {
        const hasWarningH = record.proxima_advertencia_horas && record.total_horas >= record.proxima_advertencia_horas;
        const hasWarningKm = record.proxima_advertencia_kilometros && record.total_kilometros >= record.proxima_advertencia_kilometros;
        const hasWarningV = record.proxima_advertencia_vueltas && record.total_vueltas >= record.proxima_advertencia_vueltas;

        if (!product.control_por_horometro && !product.control_por_odometro && !product.control_por_vueltas) {
          return <Text size="xs" c="dimmed" fs="italic">No aplica</Text>;
        }

        const renderControlRow = (
          icon: React.ReactNode,
          actualVal: number,
          alertVal: number | null,
          hasWarning: boolean,
          unit: string,
          onResolve: () => void
        ) => {
          return (
            <Group gap={8} wrap="nowrap" align="center" className="w-full">
              {/* Icon at left */}
              <div className="p-1.5 bg-zinc-850/60 rounded-xl border border-zinc-800/80 shrink-0 shadow-sm flex items-center justify-center">
                {icon}
              </div>

              {/* Content Group (mimics Costo Operativo) */}
              <Group gap="xs" wrap="nowrap" className="shrink-0 flex-1">
                {/* Lectura Actual Block */}
                <div className="flex flex-col items-start gap-0.5 min-w-[95px]">
                  <Text
                    size="8px"
                    fw={900}
                    className="text-zinc-500 uppercase tracking-widest leading-none"
                  >
                    Uso Actual
                  </Text>
                  <Badge
                    variant="light"
                    color="indigo"
                    radius="sm"
                    size="sm"
                    className="font-bold border border-indigo-500/10 px-1.5 mt-0.5"
                  >
                    {actualVal} {unit}
                  </Badge>
                </div>

                {/* Separator Divider */}
                <div className="w-px h-8 bg-zinc-800/80 self-center shrink-0" />

                {/* Limit Block */}
                <div className="flex flex-col items-start gap-0.5 min-w-[120px] flex-1">
                  <Text
                    size="8px"
                    fw={900}
                    className="text-zinc-500 uppercase tracking-widest leading-none"
                  >
                    Mantenimiento
                  </Text>
                  {hasWarning ? (
                    <Badge
                      variant="filled"
                      color="red"
                      radius="sm"
                      size="sm"
                      onClick={onResolve}
                      className="font-bold px-1.5 mt-0.5 animate-pulse cursor-pointer border border-red-500/20"
                      style={{ cursor: 'pointer' }}
                    >
                      Requiere Mantenimiento
                    </Badge>
                  ) : alertVal ? (
                    <Badge
                      variant="light"
                      color="pink"
                      radius="sm"
                      size="sm"
                      className="font-bold border border-pink-500/10 px-1.5 mt-0.5"
                    >
                      Próx: {alertVal} {unit}
                    </Badge>
                  ) : (
                    <Badge
                      variant="light"
                      color="zinc"
                      radius="sm"
                      size="sm"
                      className="font-bold border border-zinc-700/10 px-1.5 mt-0.5 text-zinc-400"
                    >
                      Sin Alerta
                    </Badge>
                  )}
                </div>
              </Group>
            </Group>
          );
        };

        return (
          <Stack gap={10}>
            {product.control_por_horometro && renderControlRow(
              <ClockIcon className="w-4 h-4 text-zinc-400" />,
              record.total_horas,
              record.proxima_advertencia_horas,
              !!hasWarningH,
              "h.",
              () => onResolverMantenimiento(record, "horometro")
            )}
            {product.control_por_odometro && renderControlRow(
              <ArrowTrendingUpIcon className="w-4 h-4 text-zinc-400" />,
              record.total_kilometros,
              record.proxima_advertencia_kilometros,
              !!hasWarningKm,
              "km",
              () => onResolverMantenimiento(record, "odometro")
            )}
            {product.control_por_vueltas && renderControlRow(
              <ArrowPathIcon className="w-4 h-4 text-zinc-400" />,
              record.total_vueltas,
              record.proxima_advertencia_vueltas,
              !!hasWarningV,
              "vueltas",
              () => onResolverMantenimiento(record, "vueltas")
            )}
          </Stack>
        );
      }
    },
    {
      accessor: "estado",
      title: "Estado",
      textAlign: "center",
      width: 130,
      render: (record) => {
        const colors: Record<string, string> = {
          "En Uso": "green",
          "En Mantenimiento": "orange",
          "En Almacén": "teal",
          "Dado de Baja": "red",
        };
        return (
          <Badge
            variant="light"
            color={colors[record.estado] || "gray"}
            radius="sm"
            size="xs"
            fw={700}
          >
            {record.estado}
          </Badge>
        );
      },
    },
    {
      accessor: "acciones",
      title: "Acciones",
      width: 140,
      textAlign: "center",
      render: (record) => (
        <Group justify="center" gap="xs">
          <Button 
            variant="light" 
            size="compact-xs" 
            color="cyan" 
            leftSection={<AdjustmentsHorizontalIcon className="w-3.5 h-3.5" />}
            onClick={() => onConfigurarAlertas(record)}
          >
            Alertas
          </Button>
        </Group>
      )
    }
  ];

  return (
    <div className="bg-zinc-900/65 border border-zinc-800 rounded-[24px] shadow-2xl overflow-hidden flex flex-col backdrop-blur-md">
      <ProductGroupHeader product={product} />

      <div className="relative shadow-inner">
        <DataTableEstandar
          idAccessor="id_activo"
          columns={columns}
          records={product.activos}
          loading={loading}
          initialPageSize={5}
          minHeight={0}
        />
      </div>
    </div>
  );
};
