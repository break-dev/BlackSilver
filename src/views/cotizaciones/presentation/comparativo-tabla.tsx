import { 
  Table, 
  Group, 
  Stack, 
  Text, 
  Badge, 
  TextInput, 
  NumberInput, 
  Select, 
  Switch,
  ActionIcon
} from "@mantine/core";
import { XMarkIcon } from "@heroicons/react/24/outline";
import type { 
  DTO_CotizacionRequest, 
  DTO_ProductoComparativo, 
  DTO_CotizacionDetalle 
} from "../service/cotizaciones.requests";
import { MetodoPago } from "../../../shared/enums/estados";

interface ComparativoTablaProps {
  productos: (DTO_ProductoComparativo & { nombre: string; codigo: string })[];
  cotizaciones: DTO_CotizacionRequest[];
  unidadesMedida: { value: string; label: string }[];
  proveedores: { id_proveedor: number; razon_social: string }[];
  onUpdateHeader: <K extends keyof DTO_CotizacionRequest>(index: number, field: K, value: DTO_CotizacionRequest[K]) => void;
  onUpdateDetail: <K extends keyof DTO_CotizacionDetalle>(cotIndex: number, prodId: number, field: K, value: DTO_CotizacionDetalle[K]) => void;
  onRemoveCotizacion: (index: number) => void;
}

export const ComparativoTabla = ({
  productos,
  cotizaciones,
  unidadesMedida,
  proveedores,
  onUpdateHeader,
  onUpdateDetail,
  onRemoveCotizacion,
}: ComparativoTablaProps) => {

  const inputStyles = {
    input: "bg-zinc-900 border-zinc-800 text-white focus:border-indigo-500 transition-all",
    label: "text-zinc-500 text-[10px] uppercase font-bold tracking-tighter mb-1"
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-950/50 shadow-xl custom-scrollbar mt-4">
      <Table withColumnBorders withTableBorder={false} verticalSpacing="md" horizontalSpacing="md">
        <Table.Thead className="bg-zinc-950">
          <Table.Tr>
            <Table.Th style={{ minWidth: 280 }} className="border-r border-zinc-800 sticky left-0 z-20 bg-zinc-950 shadow-2xl">
              <Group gap="xs">
                <Text size="xs" fw={800} className="text-zinc-500 uppercase tracking-widest">Lista de Productos</Text>
              </Group>
            </Table.Th>

            {cotizaciones.map((cot, idx) => (
              <Table.Th key={idx} style={{ minWidth: 320 }} className="p-0 align-top">
                <Stack gap="xs" className="p-4 bg-zinc-900/30 relative group-header">
                  {/* Botón Eliminar Columna */}
                  <ActionIcon 
                    variant="subtle" 
                    color="red" 
                    size="sm" 
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ zIndex: 5 }}
                    onClick={() => onRemoveCotizacion(idx)}
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </ActionIcon>

                  <Stack gap={4} mb="xs">
                    <Text size="10px" className="text-indigo-400 font-bold uppercase tracking-widest">Oferta Recibida #{idx + 1}</Text>
                    <Select
                      placeholder="Seleccionar Proveedor..."
                      data={proveedores.map(p => ({
                        value: String(p.id_proveedor),
                        label: p.razon_social
                      }))}
                      value={cot.id_proveedor === 0 ? null : String(cot.id_proveedor)}
                      onChange={(val) => onUpdateHeader(idx, "id_proveedor", Number(val))}
                      searchable
                      size="sm"
                      radius="md"
                      classNames={{
                        input: "bg-zinc-950 border-zinc-700 focus:border-indigo-500 font-bold text-white",
                      }}
                    />
                  </Stack>

                  <Group grow gap="xs">
                    <Select
                      label="Moneda"
                      data={["Soles", "Dolares"]}
                      value={cot.moneda}
                      onChange={(val) => onUpdateHeader(idx, "moneda", val ?? "Soles")}
                      classNames={inputStyles}
                      size="xs"
                    />
                    <Select
                      label="Método Pago"
                      data={[
                        { value: MetodoPago.Contado, label: "Contado" },
                        { value: MetodoPago.Credito, label: "Crédito" }
                      ]}
                      value={cot.metodo_pago}
                      onChange={(val) => onUpdateHeader(idx, "metodo_pago", (val as MetodoPago) ?? MetodoPago.Contado)}
                      classNames={inputStyles}
                      size="xs"
                    />
                  </Group>

                  {cot.metodo_pago === MetodoPago.Credito && (
                    <TextInput
                      label="Fecha Vencimiento"
                      type="date"
                      value={cot.fecha_vencimiento_pago || ""}
                      onChange={(e) => onUpdateHeader(idx, "fecha_vencimiento_pago", e.currentTarget.value)}
                      classNames={inputStyles}
                      size="xs"
                    />
                  )}

                  <Group grow align="flex-end">
                    <div className="flex flex-col gap-1">
                      <Text size="10px" className="text-zinc-500 uppercase font-bold">Incluye IGV</Text>
                      <Switch 
                        checked={cot.incluye_igv}
                        onChange={(e) => onUpdateHeader(idx, "incluye_igv", e.currentTarget.checked)}
                        size="sm"
                        color="indigo"
                      />
                    </div>
                    <Badge 
                      variant="filled" 
                      color="violet" 
                      size="lg" 
                      radius="lg"
                      className="h-9 px-4 shadow-lg shadow-violet-900/20"
                    >
                      Total: {cot.total_despues_igv.toLocaleString('es-PE', { style: 'currency', currency: cot.moneda === 'Soles' ? 'PEN' : 'USD' })}
                    </Badge>
                  </Group>
                </Stack>
              </Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {productos.map((prod) => (
            <Table.Tr key={prod.id_producto} className="border-b border-zinc-900 hover:bg-zinc-900/10 transition-colors">
              <Table.Td className="border-r border-zinc-800 sticky left-0 z-20 bg-zinc-950/90 shadow-xl backdrop-blur-md">
                <Stack gap={2}>
                  <Text size="sm" fw={700} className="text-zinc-200">{prod.nombre}</Text>
                  <Text size="xs" className="text-zinc-500 font-mono italic">{prod.codigo}</Text>
                </Stack>
              </Table.Td>

              {cotizaciones.map((cot, cotIdx) => {
                const det = cot.detalles.find(d => d.id_producto === prod.id_producto);
                if (!det) return <Table.Td key={cotIdx} className="bg-zinc-900/20"></Table.Td>;

                return (
                  <Table.Td key={cotIdx} className="p-4 align-top">
                    <Stack gap="xs">
                      <Select
                        label="Unidad Cotizada"
                        data={unidadesMedida}
                        value={String(det.id_unidad_medida)}
                        onChange={(val) => onUpdateDetail(cotIdx, prod.id_producto, "id_unidad_medida", Number(val))}
                        size="xs"
                        classNames={inputStyles}
                        placeholder="Elegir..."
                      />
                      
                      <Group grow gap="xs">
                        <NumberInput
                          label="Cantidad"
                          value={det.cantidad}
                          onChange={(val) => onUpdateDetail(cotIdx, prod.id_producto, "cantidad", Number(val))}
                          size="xs"
                          classNames={inputStyles}
                          min={0}
                        />
                        <NumberInput
                          label="Precio Unit."
                          value={det.precio_unitario || 0}
                          onChange={(val) => onUpdateDetail(cotIdx, prod.id_producto, "precio_unitario", Number(val))}
                          size="xs"
                          classNames={inputStyles}
                          min={0}
                          decimalScale={2}
                          placeholder="0.00"
                        />
                      </Group>

                      <NumberInput
                        label="Equivalencia"
                        value={det.contenido_por_presentacion}
                        onChange={(val) => onUpdateDetail(cotIdx, prod.id_producto, "contenido_por_presentacion", Number(val))}
                        size="xs"
                        placeholder="Contenido..."
                        classNames={inputStyles}
                        description={<Text size="9px" className="text-zinc-600">Cant. de unid. base por esta presentación</Text>}
                      />

                      <div className="pt-2 border-t border-zinc-800/50 mt-1">
                        <Group justify="space-between">
                          <Stack gap={0}>
                            <Text size="10px" className="text-zinc-600 font-bold uppercase truncate">Subtotal Oferta</Text>
                            <Text size="xs" fw={700} className="text-indigo-400">
                              {(det.cantidad * (det.precio_unitario || 0)).toFixed(2)}
                            </Text>
                          </Stack>
                          <Stack gap={0} align="flex-end">
                            <Text size="10px" className="text-zinc-600 font-bold uppercase">Precio x Base</Text>
                            <Text size="xs" className="text-emerald-400 fw-bold">
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
