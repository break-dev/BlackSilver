import { 
  Table, 
  Group, 
  Stack, 
  Text, 
  Badge, 
  TextInput, 
  NumberInput, 
  Select, 
  Switch
} from "@mantine/core";
import type { 
  DTO_CotizacionRequest, 
  DTO_ProductoComparativo, 
  DTO_CotizacionDetalle 
} from "../service/cotizaciones.requests";
import { EstadoCotizacion, MetodoPago } from "../../../shared/enums/estados";

interface ComparativoTablaProps {
  productos: (DTO_ProductoComparativo & { nombre: string; codigo: string })[];
  cotizaciones: DTO_CotizacionRequest[];
  unidadesMedida: { value: string; label: string }[];
  proveedores: { id_proveedor: number; razon_social: string }[];
  onUpdateHeader: <K extends keyof DTO_CotizacionRequest>(index: number, field: K, value: DTO_CotizacionRequest[K]) => void;
  onUpdateDetail: <K extends keyof DTO_CotizacionDetalle>(cotIndex: number, prodId: number, field: K, value: DTO_CotizacionDetalle[K]) => void;
}

export const ComparativoTabla = ({
  productos,
  cotizaciones,
  unidadesMedida,
  proveedores,
  onUpdateHeader,
  onUpdateDetail,
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

            {cotizaciones.map((cot, idx) => {
              const prov = proveedores.find(p => p.id_proveedor === cot.id_proveedor);
              return (
                <Table.Th key={idx} style={{ minWidth: 320 }} className="p-0">
                  <Stack gap="xs" className="p-4 bg-zinc-900/30">
                    <Group justify="space-between" align="flex-start" wrap="nowrap">
                      <Stack gap={0} className="flex-1">
                        <Text size="xs" className="text-indigo-400 font-bold uppercase tracking-widest mb-1">Cotización #{idx + 1}</Text>
                        <Text size="sm" fw={700} className="text-white truncate">
                          {prov?.razon_social || `Proveedor #${cot.id_proveedor}`}
                        </Text>
                      </Stack>
                      <Badge 
                        color={cot.estado === EstadoCotizacion.Aprobada ? "green" : "gray"} 
                        variant="light"
                        size="sm"
                        className="cursor-pointer"
                        onClick={() => onUpdateHeader(idx, "estado", 
                          cot.estado === EstadoCotizacion.Aprobada ? EstadoCotizacion.Generada : EstadoCotizacion.Aprobada
                        )}
                      >
                        {cot.estado}
                      </Badge>
                    </Group>

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
                        label="Pago"
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
                        label="Vencimiento"
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
                        Total: {cot.total_despues_igv.toFixed(2)}
                      </Badge>
                    </Group>
                  </Stack>
                </Table.Th>
              );
            })}
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
                        label="U. Medida"
                        data={unidadesMedida}
                        value={String(det.id_unidad_medida)}
                        onChange={(val) => onUpdateDetail(cotIdx, prod.id_producto, "id_unidad_medida", Number(val))}
                        size="xs"
                        classNames={inputStyles}
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
                          label="Precio"
                          value={det.precio_unitario}
                          onChange={(val) => onUpdateDetail(cotIdx, prod.id_producto, "precio_unitario", Number(val))}
                          size="xs"
                          classNames={inputStyles}
                          min={0}
                          decimalScale={2}
                        />
                      </Group>

                      <NumberInput
                        label="Contenido x Presentación"
                        value={det.contenido_por_presentacion}
                        onChange={(val) => onUpdateDetail(cotIdx, prod.id_producto, "contenido_por_presentacion", Number(val))}
                        size="xs"
                        placeholder="Ej: 12"
                        classNames={inputStyles}
                        description={<Text size="9px" className="text-zinc-600">Cant. unidades base en esta UOM</Text>}
                      />

                      <div className="pt-2 border-t border-zinc-800/50 mt-1">
                        <Group justify="space-between">
                          <Stack gap={0}>
                            <Text size="10px" className="text-zinc-600 font-bold uppercase">Subtotal</Text>
                            <Text size="xs" fw={700} className="text-indigo-400">
                              {(det.cantidad * det.precio_unitario).toFixed(2)}
                            </Text>
                          </Stack>
                          <Stack gap={0} align="flex-end">
                            <Text size="10px" className="text-zinc-600 font-bold uppercase">Unit. Base</Text>
                            <Text size="xs" className="text-zinc-300">
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
    </div>
  );
};
