import {
  Button,
  Group,
  Stack,
  Table,
  Text,
  TextInput,
  Badge,
  Checkbox,
  NumberInput,
  Tooltip,
  Paper,
} from "@mantine/core";
import {
  BuildingOffice2Icon,
  ArchiveBoxIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { useRegistrarPrestamo, type AlmacenAliado } from "../hooks/useRegistrarPrestamo";
import { CustomDatePicker } from "../../../presentation/utils/date-picker-input";
import type {
  RES_DetalleSolicitud,
  RES_SolicitudReabastecimiento,
  RES_Prestamo
} from "../service/solicitudes-atencion.responses";
import { EstadoSolicitudDetalle } from "../../../shared/enums/estados";
import { formatNumber } from "../../../presentation/functions/formatNumber";
import { useEffect } from "react";

interface RegistrarPrestamoAlmacenProps {
  solicitud: RES_SolicitudReabastecimiento;
  detalles: RES_DetalleSolicitud[];
  onSuccess: (nuevoPrestamo: RES_Prestamo) => void;
  onCancel: () => void;
}

const inputClasses = {
  input:
    "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500 transition-all",
  dropdown: "bg-zinc-900 border-zinc-800 shadow-2xl ",
  option:
    "hover:bg-zinc-800 text-zinc-300 rounded-md my-1",
  label: "text-zinc-300 mb-1.5 font-semibold tracking-tight",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SectionHeader = ({ icon: Icon, title, color = "amber" }: { icon: any; title: string, color?: string }) => (
  <div className="flex flex-col gap-2 mb-4">
    <div className="flex items-center gap-2">
      <Icon className={`w-5 h-5 text-${color}-500`} />
      <Text fw={700} size="sm" c="white" className="tracking-tight uppercase">
        {title}
      </Text>
    </div>
    <div className={`h-0.5 w-full bg-gradient-to-r from-${color}-500/50 to-transparent rounded-full`} />
  </div>
);

export const RegistrarPrestamoAlmacen = ({
  solicitud,
  detalles,
  onSuccess,
  onCancel,
}: RegistrarPrestamoAlmacenProps) => {
  const {
    state: {
      submitting,
      idAlmacenPrestamista,
      fechaLimiteDevolucion,
      selectedItemIds,
      cantidades,
      comentarios,
      almacenesAliados,
      loadingAlmacenes,
      stocksAlmacen
    },
    actions: {
      setIdAlmacenPrestamista,
      setFechaLimiteDevolucion,
      toggleSelection,
      setCantidad,
      setComentario,
      handleRegistrar,
      cargarStockPrestamista
    },
  } = useRegistrarPrestamo({ solicitud, detalles, onSuccess });

  useEffect(() => {
     if (idAlmacenPrestamista) {
        cargarStockPrestamista(parseInt(idAlmacenPrestamista));
     }
  }, [idAlmacenPrestamista, selectedItemIds.length, cargarStockPrestamista]);

  return (
    <Stack gap={24} p="md">
      <section>
        <SectionHeader icon={ArchiveBoxIcon} title="1. Seleccione los ítems a pedir prestados" color="amber" />
        <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950/20">
          <Table variant="unstyled" className="w-full text-zinc-300">
            <thead className="bg-zinc-900 text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-2 text-center w-12">Seleccionar</th>
                <th className="px-4 py-2 text-left">Producto</th>
                <th className="px-4 py-2 text-center">Necesario (Solicitud)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {detalles
                .filter(
                  (item) =>
                    item.estado !== EstadoSolicitudDetalle.Rechazado &&
                    item.estado !== EstadoSolicitudDetalle.Completado &&
                    item.estado !== EstadoSolicitudDetalle.Cerrado
                )
                .map((item) => {
                const isSelected = selectedItemIds.includes(item.id_solicitud_detalle);
                return (
                  <tr key={item.id_solicitud_detalle} className={`${isSelected ? "bg-amber-500/5" : "opacity-50"} transition-all`}>
                    <td className="px-4 py-2 text-center">
                      <Checkbox
                        size="xs"
                        checked={isSelected}
                        onChange={() => toggleSelection(item.id_solicitud_detalle)}
                        color="amber"
                      />
                    </td>
                    <td className="px-4 py-2 font-semibold text-sm">
                      {item.producto}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <Badge variant="light" color="amber" size="sm">
                        {formatNumber(item.cantidad_solicitada)} {item.unidad_medida_sol_abv}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      </section>

      {selectedItemIds.length > 0 && (
        <section className="animate-in fade-in slide-in-from-top-4 duration-500">
          <SectionHeader icon={BuildingOffice2Icon} title="2. Almacenes Aliados con Disponibilidad" color="indigo" />
          {loadingAlmacenes ? (
             <Text size="xs" c="dimmed" fs="italic">Buscando almacenes que puedan ayudarte...</Text>
          ) : almacenesAliados.length > 0 ? (
            <Group gap="sm">
               {almacenesAliados.map((aliado: AlmacenAliado) => {
                 const isPicked = idAlmacenPrestamista === String(aliado.id_almacen);
                 const tooltipContent = aliado.items.map(i => {
                    const detail = detalles.find(d => d.id_producto === i.id_producto);
                    const convertedStock = i.stock_actual_base / (detail?.contenido_por_presentacion || 1);
                    return `${i.nombre_producto}: ${formatNumber(convertedStock)} ${detail?.unidad_medida_sol_abv || 'UND'}`;
                 }).join('\n');

                 return (
                   <Tooltip
                    key={aliado.id_almacen}
                    label={tooltipContent}
                    withArrow
                    position="top"
                    multiline
                    w={250}
                    className="whitespace-pre-line bg-zinc-900 border-zinc-800 shadow-2xl"
                   >
                     <Paper
                        onClick={() => setIdAlmacenPrestamista(String(aliado.id_almacen))}
                        p="xs"
                        radius="md"
                        className={`cursor-pointer border-2 transition-all flex items-center gap-3 pr-4 group
                          ${isPicked ? 'bg-indigo-500/20 border-indigo-400' : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'}
                        `}
                     >
                        <div className={`p-1.5 rounded-lg ${isPicked ? 'bg-indigo-400 text-zinc-950' : 'bg-zinc-800 text-zinc-400 group-hover:text-zinc-200'}`}>
                           <BuildingOffice2Icon className="w-5 h-5" />
                        </div>
                        <Stack gap={0}>
                           <Text size="sm" fw={800}>{aliado.nombre_almacen}</Text>
                           <Text size="xs" c="dimmed">{aliado.items.length} productos disponibles</Text>
                        </Stack>
                        {isPicked && <CheckCircleIcon className="w-5 h-5 text-indigo-400 ml-auto" />}
                     </Paper>
                   </Tooltip>
                 );
               })}
            </Group>
          ) : (
            <Text size="xs" c="red" fw={700}>Ningún otro almacén tiene stock de lo solicitado.</Text>
          )}
        </section>
      )}

      {idAlmacenPrestamista && (
        <section className="animate-in fade-in slide-in-from-top-4 duration-500">
          <SectionHeader icon={ClipboardDocumentListIcon} title="3. Configurar Cantidades para el Préstamo" color="teal" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <CustomDatePicker
              label="Fecha Límite de Devolución"
              value={fechaLimiteDevolucion}
              onChange={(val) => setFechaLimiteDevolucion(val as Date | null)}
              radius="lg"
              minDate={new Date()}
            />
            <Stack gap={2}>
                 <Text size="xs" fw={700} c="zinc.5" className="uppercase tracking-widest">Prestamista seleccionado:</Text>
                 <Text size="lg" fw={900} variant="gradient" gradient={{ from: 'indigo.4', to: 'indigo.6' }}>
                    {almacenesAliados.find(a => String(a.id_almacen) === idAlmacenPrestamista)?.nombre_almacen}
                 </Text>
            </Stack>
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-800 shadow-sm bg-zinc-950/10">
            <Table variant="unstyled" className="w-full text-zinc-300">
               <thead className="bg-zinc-900/50 text-zinc-500 text-[10px] uppercase font-black font-mono">
                  <tr>
                    <th className="px-4 py-3 text-left min-w-[150px]">Producto</th>
                    <th className="px-4 py-3 text-center min-w-[200px]">Cantidad a Pedir</th>
                    <th className="px-4 py-3 text-center">Disponible</th>
                    <th className="px-4 py-3 text-left font-semibold min-w-[220px]">Comentario</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-zinc-800/50 bg-zinc-900/40">
                  {detalles.filter(d => selectedItemIds.includes(d.id_solicitud_detalle)).map(item => {
                     const stockExterno = stocksAlmacen[item.id_solicitud_detalle];
                     const totalStockExternoBase = stockExterno?.reduce((acc, curr) => acc + Number(curr.stock_actual_base), 0) || 0;
                     const totalStockExterno = totalStockExternoBase / (item.contenido_por_presentacion || 1);

                     return (
                       <tr key={item.id_solicitud_detalle} className="hover:bg-white/2 transition-colors">
                          <td className="px-4 py-3">
                             <Text size="sm" fw={800} c="white">{item.producto}</Text>
                             <Text size="9px" c="dimmed" className="uppercase font-bold">Solicitado: {formatNumber(item.cantidad_solicitada)} {item.unidad_medida_sol_abv}</Text>
                          </td>
                          <td className="px-4 py-3 text-center">
                             {/* Estilo inspirado en Nuevo Requerimiento */}
                             <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg border bg-zinc-950/40 border-zinc-800 w-fit mx-auto transition-all focus-within:border-teal-500">
                                <NumberInput
                                  variant="unstyled"
                                  value={cantidades[item.id_solicitud_detalle] || ""}
                                  onChange={(val) => setCantidad(item.id_solicitud_detalle, Number(val))}
                                  size="xs"
                                  hideControls
                                  placeholder="0"
                                  classNames={{
                                      input: "w-fit min-w-[30px] max-w-[70px] text-center font-black text-xs h-5 bg-transparent text-teal-400"
                                  }}
                                />
                                <Text size="9px" fw={900} className="uppercase whitespace-nowrap text-zinc-500 font-mono tracking-tighter">
                                  {item.unidad_medida_sol_abv}
                                </Text>
                             </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                              <Badge color={totalStockExterno > 0 ? "indigo" : "red"} variant="light" size="lg">
                                 {formatNumber(totalStockExterno)} {item.unidad_medida_sol_abv}
                              </Badge>
                          </td>
                          <td className="px-4 py-3">
                             <TextInput
                                placeholder="Nota opcional..."
                                size="xs"
                                radius="md"
                                value={comentarios[item.id_solicitud_detalle] || ""}
                                onChange={(e) => setComentario(item.id_solicitud_detalle, e.target.value)}
                                classNames={inputClasses}
                             />
                          </td>
                       </tr>
                     );
                  })}
               </tbody>
            </Table>
          </div>
        </section>
      )}

      <Group justify="flex-end" mt="xl">
        <Button variant="subtle" onClick={onCancel} radius="lg" className="text-zinc-500 hover:text-white">
          Cancelar
        </Button>
        <Button
          onClick={handleRegistrar}
          loading={submitting}
          disabled={!idAlmacenPrestamista || selectedItemIds.length === 0}
          radius="xl"
          size="md"
          className="bg-zinc-100 text-zinc-900 font-black hover:bg-white px-10 shadow-indigo-500/20 shadow-xl transition-all active:scale-95"
        >
          Generar Pedido de Préstamo
        </Button>
      </Group>
    </Stack>
  );
};
