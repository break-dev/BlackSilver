import {
  Group,
  Stack,
  Text,
  NumberInput,
  Select,
  MultiSelect,
  Switch,
  ActionIcon,
  Badge,
  TextInput,
  Checkbox,
  Skeleton,
} from "@mantine/core";
import {
  XMarkIcon,
  ClipboardDocumentCheckIcon,
  IdentificationIcon,
} from "@heroicons/react/24/outline";
import { CustomDatePicker } from "../../../../presentation/utils/date-picker-input";
import { formatNumber } from "../../../../shared/functions/formatNumber";
import type { DTO_CotizacionRequest } from "../../service/cotizaciones.requests";
import { MetodoPago } from "../../../../shared/enums/_generic/metodo-pago";
import { Estado_Cotizacion } from "../../../../shared/enums/cotizacion/cotizacion";

interface CabeceraCotizacionProps {
  cot?: DTO_CotizacionRequest;
  idx: number;
  isCollapsed: boolean;
  proveedores: { id_proveedor: number; razon_social: string }[];
  empresas: { id_empresa: number; razon_social: string }[];
  loadingProveedores?: boolean;
  unidadesMedida: { value: string; label: string; abreviatura: string }[];
  onUpdateHeader: <K extends keyof DTO_CotizacionRequest>(
    index: number,
    field: K,
    value: DTO_CotizacionRequest[K],
  ) => void;
  onRemoveCotizacion: (index: number) => void;
  isSkeleton?: boolean;
}

const inputStyles = {
  input:
    "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-600 !font-normal transition-all",
  label: "text-zinc-300 mb-1.5 font-medium text-xs",
  description: "text-zinc-500 text-[10px] italic mt-1 leading-tight",
};

export const CabeceraCotizacion = ({
  cot,
  idx,
  isCollapsed,
  proveedores,
  empresas,
  loadingProveedores,
  onUpdateHeader,
  onRemoveCotizacion,
  isSkeleton = false,
}: CabeceraCotizacionProps) => {
  if (isSkeleton) {
    if (isCollapsed) {
      return (
        <Stack gap={4} className="py-2.5 px-4 relative">
          <Group justify="space-between" wrap="nowrap" gap="xs">
            <Stack gap={4} className="flex-1 min-w-0">
              <Skeleton h={12} w="70%" radius="sm" />
              <Skeleton h={10} w="40%" radius="sm" />
            </Stack>
            <Skeleton h={24} w={80} radius="md" />
          </Group>
        </Stack>
      );
    }

    return (
      <Stack gap={4} className="pt-0 pb-3 px-4 relative">
        <Group justify="space-between" align="center">
          <Skeleton h={16} w={100} radius="md" />
        </Group>
        <Stack gap="sm">
          <Skeleton h={32} radius="lg" />
          <Group grow gap="md">
            <Skeleton h={32} radius="lg" />
            <Skeleton h={32} radius="lg" />
          </Group>
          <Skeleton h={32} radius="lg" />
          <Group grow gap="xs" mt="md">
            <Skeleton h={40} radius="md" />
            <Skeleton h={40} radius="md" />
            <Skeleton h={40} radius="md" />
          </Group>
        </Stack>
      </Stack>
    );
  }

  // Si no es esqueleto, nos aseguramos de que 'cot' exista para el resto de la lógica
  if (!cot) return null;

  return (
    <Stack
      gap={4}
      className={`${isCollapsed ? "py-2" : "pt-0 pb-3"} px-4 relative group-header`}
    >
      {/* Título y Cerrar - Vista Extendida */}
      {!isCollapsed && (
        <Group justify="space-between" align="center">
          <Text
            size="sm"
            fw={800}
            className="text-white tracking-tight uppercase"
          >
            Cotización #{idx + 1}
          </Text>
          <ActionIcon
            variant="subtle"
            color="red"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onRemoveCotizacion(idx)}
          >
            <XMarkIcon className="w-4 h-4" />
          </ActionIcon>
        </Group>
      )}

      {/* VISTA COLAPSADA */}
      {isCollapsed ? (
        <Group justify="space-between" wrap="nowrap" gap="xs">
          <Stack gap={0} className="flex-1 min-w-0">
            <Text size="xs" fw={800} className="text-white truncate uppercase">
              C#{idx + 1} -{" "}
              {proveedores.find((p) => p.id_proveedor === cot.id_proveedor)
                ?.razon_social || "Sin Proveedor"}
            </Text>
            <Text size="10px" className="text-zinc-500 uppercase font-bold">
              {cot.metodo_pago} • {cot.moneda}
            </Text>
          </Stack>

          <Badge
            variant="light"
            color="cyan"
            size="md"
            className="font-bold shadow-sm h-6"
          >
            {cot.moneda === "Soles" ? "S/. " : "$ "}{" "}
            {formatNumber(cot.total_despues_igv)}
          </Badge>

          <ActionIcon
            variant="subtle"
            color="red"
            size="xs"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onRemoveCotizacion(idx)}
          >
            <XMarkIcon className="w-3 h-3" />
          </ActionIcon>
        </Group>
      ) : (
        <>
          {/* Configuración Principal */}
          <Stack gap="sm">
            <Group align="flex-end" gap="xs">
              <Select
                placeholder={
                  loadingProveedores
                    ? "Buscando proveedores..."
                    : "Seleccione proveedor..."
                }
                data={proveedores.map((p) => ({
                  value: String(p.id_proveedor),
                  label: p.razon_social,
                }))}
                label="Proveedor"
                withAsterisk
                disabled={loadingProveedores}
                leftSection={
                  <IdentificationIcon className="w-4 h-4 text-zinc-500" />
                }
                value={cot.id_proveedor === 0 ? null : String(cot.id_proveedor)}
                onChange={(val) =>
                  onUpdateHeader(idx, "id_proveedor", Number(val))
                }
                searchable
                size="xs"
                radius="lg"
                classNames={inputStyles}
                className="flex-1"
                comboboxProps={{
                  withinPortal: true,
                  zIndex: 9999,
                  transitionProps: { transition: "pop", duration: 200 },
                }}
              />

              <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl px-4 h-[32px] flex items-center justify-center transition-all hover:bg-zinc-900/60 hover:border-green-500/40 group/check cursor-pointer">
                <Group gap="xs" wrap="nowrap" align="center">
                  <Text
                    size="10px"
                    fw={900}
                    className="uppercase tracking-widest text-zinc-400 group-hover/check:text-green-400 transition-colors"
                  >
                    Aprobar
                  </Text>
                  <Checkbox
                    size="xs"
                    color="green"
                    checked={cot.estado === Estado_Cotizacion.Aprobada}
                    onChange={(e) =>
                      onUpdateHeader(
                        idx,
                        "estado",
                        e.currentTarget.checked
                          ? Estado_Cotizacion.Aprobada
                          : Estado_Cotizacion.Generada,
                      )
                    }
                    styles={{
                      input: { cursor: "pointer" },
                    }}
                  />
                </Group>
              </div>
            </Group>

            <MultiSelect
              placeholder={
                loadingProveedores
                  ? "Cargando..."
                  : "Seleccione empresas compradoras..."
              }
              data={empresas.map((e) => ({
                value: String(e.id_empresa),
                label: e.razon_social,
              }))}
              label="Empresas Asociadas"
              withAsterisk
              disabled={loadingProveedores}
              value={cot.empresas_ids.map(String)}
              onChange={(vals) =>
                onUpdateHeader(idx, "empresas_ids", vals.map(Number))
              }
              searchable
              clearable
              size="xs"
              radius="lg"
              classNames={inputStyles}
              className="w-full"
              hidePickedOptions
              maxDropdownHeight={200}
            />

            <Group grow gap="md">
              <Select
                label="Moneda"
                data={["Soles", "Dolares"]}
                value={cot.moneda}
                onChange={(val) =>
                  onUpdateHeader(idx, "moneda", val ?? "Soles")
                }
                classNames={inputStyles}
                size="xs"
                radius="lg"
              />
              <Select
                label="Método de Pago"
                data={[
                  { value: MetodoPago.Contado, label: "Contado" },
                  { value: MetodoPago.Credito, label: "Crédito" },
                ]}
                value={cot.metodo_pago}
                onChange={(val) =>
                  onUpdateHeader(
                    idx,
                    "metodo_pago",
                    (val as MetodoPago) ?? MetodoPago.Contado,
                  )
                }
                classNames={inputStyles}
                size="xs"
                radius="lg"
              />
            </Group>

            {cot.metodo_pago === MetodoPago.Credito && (
              <CustomDatePicker
                label="Fecha de Vencimiento"
                withAsterisk
                placeholder="Seleccione fecha..."
                value={cot.fecha_vencimiento_pago as unknown as Date | null}
                onChange={(val) =>
                  onUpdateHeader(
                    idx,
                    "fecha_vencimiento_pago",
                    val as unknown as string,
                  )
                }
                size="xs"
                radius="lg"
              />
            )}

            <TextInput
              label="Observación (Opcional)"
              placeholder="Escriba alguna observación de la oferta..."
              leftSection={
                <ClipboardDocumentCheckIcon className="w-4 h-4 text-zinc-500" />
              }
              value={cot.observacion || ""}
              onChange={(e) =>
                onUpdateHeader(idx, "observacion", e.currentTarget.value)
              }
              classNames={inputStyles}
              size="xs"
              radius="lg"
            />
          </Stack>

          {/* Resumen de Totales y Tax */}
          <Group grow align="flex-start" gap="md" className="mt-2">
            <Stack gap={2}>
              <Text
                size="xs"
                fw={500}
                className="text-zinc-300 mb-1.5 font-medium"
              >
                Incluye IGV
              </Text>
              <Switch
                checked={cot.incluye_igv}
                onChange={(e) =>
                  onUpdateHeader(idx, "incluye_igv", e.currentTarget.checked)
                }
                size="xs"
                color="indigo"
              />
            </Stack>
            <Stack gap={2}>
              <Text
                size="xs"
                fw={500}
                className="text-zinc-300 mb-1.5 font-medium"
              >
                Porcentaje IGV
              </Text>
              <NumberInput
                value={cot.porcentaje_igv}
                onChange={(val) =>
                  onUpdateHeader(idx, "porcentaje_igv", Number(val))
                }
                disabled
                size="xs"
                radius="lg"
                classNames={inputStyles}
                suffix="%"
              />
            </Stack>
          </Group>

          <Group grow gap="xs">
            {/* Subtotal */}
            <Stack gap={2}>
              <Text
                size="xs"
                fw={500}
                className="text-zinc-300 mb-1.5 font-medium"
              >
                Subtotal (sin igv)
              </Text>
              <Badge
                variant="light"
                color="pink"
                radius="md"
                className="h-[28px] w-full font-medium text-xs lowercase first-letter:uppercase"
              >
                {cot.moneda === "Soles" ? "S/. " : "$ "}{" "}
                {formatNumber(cot.total_antes_igv)}
              </Badge>
            </Stack>

            {/* Monto IGV */}
            <Stack gap={2}>
              <Text
                size="xs"
                fw={500}
                className="text-zinc-300 mb-1.5 font-medium"
              >
                Monto IGV
              </Text>
              <Badge
                variant="light"
                color="grape"
                radius="md"
                className="h-[28px] w-full font-medium text-xs lowercase first-letter:uppercase"
              >
                {cot.moneda === "Soles" ? "S/. " : "$ "}{" "}
                {formatNumber(cot.monto_igv)}
              </Badge>
            </Stack>

            {/* Total final */}
            <Stack gap={2}>
              <Text
                size="xs"
                fw={700}
                className="text-cyan-400 mb-1.5 font-bold"
              >
                Total (con igv)
              </Text>
              <Badge
                variant="filled"
                color="cyan"
                radius="md"
                className="h-[28px] w-full text-xs font-bold shadow-lg shadow-cyan-500/10"
              >
                {cot.moneda === "Soles" ? "S/. " : "$ "}{" "}
                {formatNumber(cot.total_despues_igv)}
              </Badge>
            </Stack>
          </Group>
        </>
      )}
    </Stack>
  );
};
