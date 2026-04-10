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
  ScaleIcon,
  ArchiveBoxIcon,
  BanknotesIcon,
  IdentificationIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";
import { pluralizar } from "../../../presentation/functions/pluralizar";
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
  })[];
  cotizaciones: DTO_CotizacionRequest[];
  unidadesMedida: { value: string; label: string }[];
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
}: ComparativoTablaProps) => {
  const inputStyles = {
    input:
      "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-600 !font-normal transition-all",
    label: "text-zinc-300 mb-1.5 font-medium text-xs",
    description: "text-zinc-500 text-[10px] italic mt-1 leading-tight",
  };

  return (
    <div className="max-h-[750px] overflow-auto rounded-2xl border border-zinc-800 bg-zinc-950/50 shadow-xl custom-scrollbar mt-4">
      <Table
        stickyHeader
        stickyHeaderOffset={0}
        withColumnBorders
        withTableBorder={false}
        verticalSpacing="md"
        horizontalSpacing="md"
      >
        <Table.Thead className="bg-zinc-950 z-30">
          <Table.Tr>
            <Table.Th
              style={{ width: 260, minWidth: 260 }}
              className="border-r border-zinc-800 sticky top-0 left-0 z-40 bg-zinc-950 shadow-2xl"
            >
              <Group gap="xs">
                <Text
                  size="xs"
                  fw={800}
                  className="text-zinc-500 uppercase tracking-widest"
                >
                  Productos
                </Text>
              </Group>
            </Table.Th>

            {cotizaciones.map((cot, idx) => (
              <Table.Th
                key={idx}
                style={{ minWidth: 450 }}
                className="p-0 align-top"
              >
                <Stack
                  gap={4}
                  className="pt-0 px-4 pb-3 relative group-header"
                >
                  {/* Título y Cerrar */}
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
                        cot.id_proveedor === 0 ? null : String(cot.id_proveedor)
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
                        transitionProps: { transition: "pop", duration: 200 },
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
                            ? new Date(cot.fecha_vencimiento_pago + "T00:00:00")
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
                style={{ width: 260, minWidth: 260 }}
                className="border-r border-zinc-800 sticky left-0 z-20 bg-zinc-950/90 shadow-xl backdrop-blur-md"
              >
                <Text size="sm" fw={700} className="text-zinc-200">
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
                    <Stack gap="xs">
                      <Select
                        label="Unidad de medida de la Cotización"
                        withAsterisk
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
                        placeholder="Elegir..."
                      />

                      {(() => {
                        const unidadSel = unidadesMedida.find(
                          (u) => u.value === String(det.id_unidad_medida),
                        );
                        const nombrePlural = pluralizar(
                          unidadSel?.label || "unidades",
                        );
                        const esMismaUnidad =
                          det.id_unidad_medida === prod.id_unidad_medida_base;

                        return (
                          <>
                            <Group grow gap="xs">
                              <NumberInput
                                label={`Cantidad de ${nombrePlural}`}
                                withAsterisk
                                value={det.cantidad}
                                onChange={(val) =>
                                  onUpdateDetail(
                                    cotIdx,
                                    prod.id_producto,
                                    "cantidad",
                                    Number(val),
                                  )
                                }
                                size="xs"
                                radius="lg"
                                classNames={inputStyles}
                                min={0}
                                leftSection={
                                  <ArchiveBoxIcon className="w-3 h-3 text-zinc-500" />
                                }
                              />
                              <NumberInput
                                label={`Precio por ${unidadSel?.label || "unidad"}`}
                                withAsterisk
                                value={det.precio_unitario || 0}
                                onChange={(val) =>
                                  onUpdateDetail(
                                    cotIdx,
                                    prod.id_producto,
                                    "precio_unitario",
                                    Number(val),
                                  )
                                }
                                size="xs"
                                radius="lg"
                                classNames={inputStyles}
                                min={0}
                                decimalScale={2}
                                placeholder="0.00"
                                leftSection={
                                  <BanknotesIcon className="w-3 h-3 text-zinc-500" />
                                }
                              />
                            </Group>

                            <Stack gap={2}>
                              <Group justify="space-between" align="center" className="mb-0.5">
                                <Text size="xs" fw={500} className="text-zinc-300 font-medium">Contenido por unidad <span className="text-red-500">*</span></Text>
                                <Badge color="orange" variant="filled" size="xs" className="text-[10px] h-5">
                                  Ingreso total: {det.cantidad * det.contenido_por_presentacion} {pluralizar(prod.unidad_medida_base)}
                                </Badge>
                              </Group>
                              <NumberInput
                                value={det.contenido_por_presentacion}
                                onChange={(val) =>
                                  onUpdateDetail(
                                    cotIdx,
                                    prod.id_producto,
                                    "contenido_por_presentacion",
                                    Number(val),
                                  )
                                }
                                size="xs"
                                radius="lg"
                                placeholder="Contenido..."
                                classNames={inputStyles}
                                disabled={esMismaUnidad}
                                leftSection={
                                  <ScaleIcon className="w-3 h-3 text-zinc-500" />
                                }
                                description={
                                  <Text size="9px" className="text-zinc-600">
                                    {esMismaUnidad
                                      ? "Misma unidad que la base (Bloqueado)"
                                      : `Indique cuánt@s ${pluralizar(prod.unidad_medida_base) || "unidades base"} contiene cada ${unidadSel?.label || "unidad"}`}
                                  </Text>
                                }
                              />
                            </Stack>
                          </>
                        );
                      })()}

                      <TextInput
                        label="Comentario del ítem"
                        placeholder="Ej: Marca específica, color, etc..."
                        leftSection={
                          <ChatBubbleBottomCenterTextIcon className="w-3 h-3 text-zinc-600" />
                        }
                        value={det.comentario || ""}
                        onChange={(e) =>
                          onUpdateDetail(
                            cotIdx,
                            prod.id_producto,
                            "comentario",
                            e.currentTarget.value,
                          )
                        }
                        size="xs"
                        radius="lg"
                        classNames={inputStyles}
                      />

                      <div className="pt-2 border-t border-zinc-800/50 mt-1">
                        <Group justify="space-between">
                          <Stack gap={0}>
                            <Text
                              size="10px"
                              className="text-zinc-600 font-bold uppercase truncate"
                            >
                              Subtotal Oferta
                            </Text>
                            <Text
                              size="xs"
                              fw={700}
                              className="text-indigo-400"
                            >
                              {(
                                det.cantidad * (det.precio_unitario || 0)
                              ).toFixed(2)}
                            </Text>
                          </Stack>
                          <Stack gap={0} align="flex-end">
                            <Text
                              size="10px"
                              className="text-zinc-600 font-bold uppercase"
                            >
                              Precio x Base
                            </Text>
                            <Text
                              size="xs"
                              className="text-emerald-400 fw-bold"
                            >
                              {det.precio_unitario_base.toFixed(4)}
                            </Text>
                          </Stack>
                        </Group>
                      </div>
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
