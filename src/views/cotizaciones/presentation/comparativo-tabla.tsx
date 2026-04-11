import {
  Table,
  Group,
  Stack,
  Text,
  TextInput,
  NumberInput,
  Select,
  Switch,
  ActionIcon,
  Badge,
} from "@mantine/core";
import {
  XMarkIcon,
  ChatBubbleBottomCenterTextIcon,
  IdentificationIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";
import { CustomDatePicker } from "../../../presentation/utils/date-picker-input";
import { formatNumber } from "../../../presentation/functions/formatNumber";
import type {
  DTO_CotizacionRequest,
  DTO_ProductoComparativo,
  DTO_CotizacionDetalle,
} from "../service/cotizaciones.requests";
import { MetodoPago } from "../../../shared/enums/estados";

interface ComparativoTablaProps {
  productos: (DTO_ProductoComparativo & {
    nombre: string;
    codigo: string;
    id_unidad_medida_base: number;
    unidad_medida_base: string;
    unidad_medida_abreviatura: string;
  })[];
  cotizaciones: DTO_CotizacionRequest[];
  unidadesMedida: { value: string; label: string; abreviatura: string }[];
  proveedores: { id_proveedor: number; razon_social: string }[];
  loadingProveedores?: boolean;
  onUpdateHeader: <K extends keyof DTO_CotizacionRequest>(
    index: number,
    field: K,
    value: DTO_CotizacionRequest[K],
  ) => void;
  onUpdateDetail: <K extends keyof DTO_CotizacionDetalle>(
    cotIndex: number,
    prodId: number,
    field: K,
    value: DTO_CotizacionDetalle[K],
  ) => void;
  onRemoveCotizacion: (index: number) => void;
  isCollapsed?: boolean;
}

export const ComparativoTabla = ({
  productos,
  cotizaciones,
  unidadesMedida,
  proveedores,
  loadingProveedores,
  onUpdateHeader,
  onUpdateDetail,
  onRemoveCotizacion,
  isCollapsed = false,
}: ComparativoTablaProps) => {
  const inputStyles = {
    input:
      "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-600 !font-normal transition-all",
    label: "text-zinc-300 mb-1.5 font-medium text-xs",
    description: "text-zinc-500 text-[10px] italic mt-1 leading-tight",
  };

  return (
    <div className="h-full overflow-auto rounded-2xl border border-zinc-800 bg-zinc-950/50 shadow-xl custom-scrollbar relative">
      <Table
        withColumnBorders
        withTableBorder={false}
        verticalSpacing="md"
        horizontalSpacing="md"
        className="border-separate border-spacing-0 min-w-full"
      >
        <Table.Thead className="z-50">
          <Table.Tr>
            {/* Esquina PRODUCTOS: Fija vertical y horizontalmente */}
            <Table.Th
              style={{ width: 200, minWidth: 200, verticalAlign: 'middle' }}
              className="bg-zinc-900 border-b border-r border-zinc-800 sticky top-0 left-0 z-[100] p-6 shadow-xl"
            >
              <Text
                size="xs"
                fw={800}
                className="text-white uppercase tracking-widest text-center"
              >
                Productos
              </Text>
            </Table.Th>

            {cotizaciones.map((cot, idx) => (
              <Table.Th
                key={idx}
                style={{ minWidth: 450, verticalAlign: 'top' }}
                className="bg-zinc-900 border-b border-zinc-800 p-0 sticky top-0 z-40"
              >
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

                  {/* VISTA COLAPSADA (Compacta) */}
                  {isCollapsed ? (
                    <Group justify="space-between" wrap="nowrap" gap="xs">
                      <Stack gap={0} className="flex-1 min-w-0">
                        <Text
                          size="xs"
                          fw={800}
                          className="text-white truncate uppercase"
                        >
                          C#{idx + 1} -{" "}
                          {proveedores.find(
                            (p) => p.id_proveedor === cot.id_proveedor,
                          )?.razon_social || "Sin Proveedor"}
                        </Text>
                        <Text
                          size="10px"
                          className="text-zinc-500 uppercase font-bold"
                        >
                          {cot.metodo_pago} • {cot.moneda}
                        </Text>
                      </Stack>

                      <Badge
                        variant="light"
                        color="cyan"
                        size="xs"
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
                          value={
                            cot.id_proveedor === 0
                              ? null
                              : String(cot.id_proveedor)
                          }
                          onChange={(val) =>
                            onUpdateHeader(idx, "id_proveedor", Number(val))
                          }
                          searchable
                          size="xs"
                          radius="lg"
                          classNames={inputStyles}
                          comboboxProps={{
                            withinPortal: true,
                            zIndex: 9999,
                            transitionProps: {
                              transition: "pop",
                              duration: 200,
                            },
                          }}
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
                            value={
                              cot.fecha_vencimiento_pago
                                ? new Date(
                                    cot.fecha_vencimiento_pago + "T00:00:00",
                                  )
                                : null
                            }
                            onChange={(val: unknown) =>
                              onUpdateHeader(
                                idx,
                                "fecha_vencimiento_pago",
                                val instanceof Date
                                  ? val.toISOString().split("T")[0]
                                  : null,
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
                            onUpdateHeader(
                              idx,
                              "observacion",
                              e.currentTarget.value,
                            )
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
                              onUpdateHeader(
                                idx,
                                "incluye_igv",
                                e.currentTarget.checked,
                              )
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
              </Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {productos.map((prod) => (
            <Table.Tr
              key={prod.id_producto}
              className="border-b border-zinc-900 hover:bg-zinc-900/10 transition-colors"
            >
              <Table.Td
                style={{ width: 200, minWidth: 200 }}
                className="border-r border-zinc-800 sticky left-0 z-20 bg-zinc-950/90 shadow-xl backdrop-blur-md"
              >
                <Text size="xs" fw={700} className="text-zinc-200">
                  {prod.nombre}
                </Text>
              </Table.Td>

              {cotizaciones.map((cot, cotIdx) => {
                const det = cot.detalles.find(
                  (d) => d.id_producto === prod.id_producto,
                );
                if (!det)
                  return (
                    <Table.Td
                      key={cotIdx}
                      className="bg-zinc-900/20"
                    ></Table.Td>
                  );

                return (
                  <Table.Td key={cotIdx} className="p-4 align-top">
                    <Stack gap="sm" className="w-full">
                      {(() => {
                        const currentUnit = unidadesMedida.find(
                          (u) => u.value === String(det.id_unidad_medida),
                        );
                        const abrev = currentUnit?.abreviatura || "---";
                        const baseAbrev =
                          prod.unidad_medida_abreviatura || "UND";

                        return (
                          <>
                            {/* Fila 1: Unidad y Cantidad */}
                            <Group grow align="flex-end" gap="xs">
                              <Select
                                label="Und. Medida de Cotización"
                                data={unidadesMedida}
                                value={String(det.id_unidad_medida)}
                                onChange={(val) =>
                                  onUpdateDetail(
                                    cotIdx,
                                    prod.id_producto,
                                    "id_unidad_medida",
                                    Number(val),
                                  )
                                }
                                size="xs"
                                radius="lg"
                                classNames={inputStyles}
                                withAsterisk
                                comboboxProps={{
                                  withinPortal: true,
                                  zIndex: 9999,
                                }}
                              />
                              <NumberInput
                                label={`Cant. x ${abrev}`}
                                value={det.cantidad}
                                onChange={(val) =>
                                  onUpdateDetail(
                                    cotIdx,
                                    prod.id_producto,
                                    "cantidad",
                                    Number(val),
                                  )
                                }
                                min={0}
                                size="xs"
                                radius="lg"
                                withAsterisk
                                classNames={inputStyles}
                              />
                            </Group>

                            {/* Fila 2: Factor y Precio */}
                            <Group grow align="flex-end" gap="xs">
                              <NumberInput
                                label={
                                  <Text
                                    size="xs"
                                    fw={500}
                                    className="text-zinc-300"
                                  >
                                    Und x {abrev}{" "}
                                    <span className="text-red-500">*</span>
                                  </Text>
                                }
                                value={det.contenido_por_presentacion}
                                onChange={(val) =>
                                  onUpdateDetail(
                                    cotIdx,
                                    prod.id_producto,
                                    "contenido_por_presentacion",
                                    Number(val),
                                  )
                                }
                                disabled={
                                  det.id_unidad_medida ===
                                  prod.id_unidad_medida_base
                                }
                                min={1}
                                size="xs"
                                radius="lg"
                                classNames={inputStyles}
                              />

                              <NumberInput
                                label={
                                  <Text
                                    size="xs"
                                    fw={500}
                                    className="text-zinc-300"
                                  >
                                    Precio x {abrev}{" "}
                                    <span className="text-red-500">*</span>
                                  </Text>
                                }
                                value={det.precio_unitario}
                                onChange={(val) =>
                                  onUpdateDetail(
                                    cotIdx,
                                    prod.id_producto,
                                    "precio_unitario",
                                    Number(val),
                                  )
                                }
                                min={0}
                                size="xs"
                                radius="lg"
                                classNames={inputStyles}
                                placeholder="0.00"
                                decimalScale={2}
                              />
                            </Group>

                            {/* Fila 3: Tarjetas de Resultados Financieros */}
                            <Group grow wrap="nowrap" gap="xs">
                              {/* Total Unidades Base (Celeste / Cyan) */}
                              <Stack
                                gap={0}
                                px="xs"
                                py={4}
                                className="bg-cyan-600 rounded-lg shadow-sm border border-cyan-400/20"
                              >
                                <Text
                                  size="9px"
                                  fw={800}
                                  className="text-white uppercase truncate opacity-90"
                                >
                                  Total {baseAbrev}
                                </Text>
                                <Text size="xs" fw={800} className="text-white">
                                  {det.cantidad *
                                    det.contenido_por_presentacion}{" "}
                                  {baseAbrev}
                                </Text>
                              </Stack>

                              {/* Precio x Base (Verde Claro / Teal) */}
                              <Stack
                                gap={0}
                                px="xs"
                                py={4}
                                className="bg-teal-600 rounded-lg shadow-sm border border-teal-400/20"
                              >
                                <Text
                                  size="9px"
                                  fw={800}
                                  className="text-white uppercase truncate opacity-90"
                                >
                                  Precio x {baseAbrev}
                                </Text>
                                <Text size="xs" fw={800} className="text-white">
                                  {cot.moneda === "Soles" ? "S/. " : "$ "}
                                  {formatNumber(det.precio_unitario_base)}
                                </Text>
                              </Stack>

                              {/* Subtotal Final (Verde Oscuro / Emerald) */}
                              <Stack
                                gap={0}
                                px="xs"
                                py={4}
                                className="bg-emerald-700 rounded-lg shadow-md border border-emerald-500/20"
                              >
                                <Text
                                  size="9px"
                                  fw={800}
                                  className="text-white uppercase truncate opacity-90"
                                >
                                  Subtotal
                                </Text>
                                <Text size="xs" fw={800} className="text-white">
                                  {cot.moneda === "Soles" ? "S/. " : "$ "}
                                  {formatNumber(
                                    det.cantidad * det.precio_unitario,
                                  )}
                                </Text>
                              </Stack>
                            </Group>

                            <TextInput
                              label="Comentario (Opcional)"
                              placeholder="Marca, color, etc..."
                              size="xs"
                              radius="lg"
                              classNames={inputStyles}
                              value={det.comentario || ""}
                              onChange={(e) =>
                                onUpdateDetail(
                                  cotIdx,
                                  prod.id_producto,
                                  "comentario",
                                  e.currentTarget.value,
                                )
                              }
                              leftSection={
                                <ChatBubbleBottomCenterTextIcon className="w-3 h-3 text-zinc-600" />
                              }
                            />
                          </>
                        );
                      })()}
                    </Stack>
                  </Table.Td>
                );
              })}
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      {/* Estilos inline para la transición de hover en cabeceras */}
      <style>{`
        .group-header:hover .opacity-0 {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
};
