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
  Select,
} from "@mantine/core";
import {
  BuildingOffice2Icon,
  ArchiveBoxIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import { useRegistrarPrestamo } from "../hooks/useRegistrarPrestamo";
import { CustomDatePicker } from "../../../presentation/utils/date-picker-input";
import type {
  RES_DetalleSolicitud,
  RES_SolicitudReabastecimiento,
  RES_Prestamo
} from "../service/solicitudes-atencion.responses";
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
    "hover:bg-zinc-800 text-zinc-300 data-[selected]:bg-zinc-100 data-[selected]:text-zinc-900 rounded-md my-1",
  label: "text-zinc-300 mb-1.5 font-semibold tracking-tight",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SectionHeader = ({ icon: Icon, title, color = "amber" }: { icon: any; title: string, color?: string }) => (
  <div className="flex flex-col gap-2 mb-6">
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
      almacenesDisponibles,
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
      cargarAlmacenesConStock,
      cargarStockPrestamista
    },
  } = useRegistrarPrestamo({ solicitud, detalles, onSuccess });

  // Cargar almacenes que tengan stock del primer item por defecto o al abrir
  useEffect(() => {
    if (detalles.length > 0) {
      cargarAlmacenesConStock(detalles[0].id_producto);
    }
  }, [detalles, cargarAlmacenesConStock]);

  // Al seleccionar almacén, cargar stock de lo seleccionado
  useEffect(() => {
     if (idAlmacenPrestamista) {
        cargarStockPrestamista(parseInt(idAlmacenPrestamista));
     }
  }, [idAlmacenPrestamista, selectedItemIds.length, cargarStockPrestamista]);

  return (
    <Stack gap={32} p="md">
      <section>
        <SectionHeader
          icon={ClipboardDocumentListIcon}
          title="Configuración de Préstamo"
          color="indigo"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
          <Select
            label="Almacén Prestamista"
            placeholder="Seleccione un almacén con stock"
            data={almacenesDisponibles.map(a => ({
              value: String(a.id_almacen),
              label: a.nombre_almacen
            }))}
            value={idAlmacenPrestamista}
            onChange={setIdAlmacenPrestamista}
            classNames={inputClasses}
            radius="lg"
            searchable
            clearable
            leftSection={<BuildingOffice2Icon className="w-5 h-5 text-indigo-400" />}
            disabled={loadingAlmacenes}
          />

          <CustomDatePicker
            label="Fecha Límite de Devolución"
            placeholder="¿Cuándo se devolverá?"
            value={fechaLimiteDevolucion}
            onChange={(val) => setFechaLimiteDevolucion(val as Date | null)}
            radius="lg"
            minDate={new Date()}
          />
        </div>
      </section>

      <section>
        <SectionHeader icon={ArchiveBoxIcon} title="Productos a pedir prestados" color="amber" />
        <div className="overflow-x-auto rounded-xl border border-zinc-800 shadow-sm">
          <Table variant="unstyled" className="w-full text-zinc-300">
            <thead className="bg-zinc-900 text-zinc-400 text-xs font-medium uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-center w-12">Action</th>
                <th className="px-4 py-3 text-left min-w-[180px]">Producto</th>
                <th className="px-4 py-3 text-center min-w-[120px]">Stock Externo</th>
                <th className="px-4 py-3 text-center min-w-[150px]">Cant. Solicitada</th>
                <th className="px-4 py-3 text-left min-w-[200px]">Comentario</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 bg-zinc-900/40">
              {detalles.map((item) => {
                const isSelected = selectedItemIds.includes(item.id_solicitud_detalle);
                const stockExterno = stocksAlmacen[item.id_solicitud_detalle];
                const totalStockExternoBase = stockExterno?.reduce((acc, curr) => acc + Number(curr.stock_actual_base), 0) || 0;
                const totalStockExterno = totalStockExternoBase / (item.contenido_por_presentacion || 1);

                return (
                  <tr
                    key={item.id_solicitud_detalle}
                    className={`${isSelected ? "hover:bg-white/5" : "opacity-40"} transition-colors`}
                  >
                    <td className="px-4 py-3 text-center">
                      <Checkbox
                        size="xs"
                        checked={isSelected}
                        onChange={() => toggleSelection(item.id_solicitud_detalle)}
                        color="indigo"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Text size="sm" fw={700} className="text-zinc-100">
                        {item.producto}
                      </Text>
                      <Text size="xs" className="text-zinc-500">
                        Solicitados: {formatNumber(item.cantidad_solicitada)} {item.unidad_medida_sol_abv}
                      </Text>
                    </td>
                    <td className="px-4 py-3 text-center">
                       {idAlmacenPrestamista ? (
                         <Badge color={totalStockExterno > 0 ? "indigo" : "red"} variant="light" radius="sm">
                            {formatNumber(totalStockExterno)} {item.unidad_medida_sol_abv}
                         </Badge>
                       ) : (
                         <Text size="xs" c="dimmed">Seleccione almacén</Text>
                       )}
                    </td>
                    <td className="px-4 py-3">
                      <NumberInput
                        size="xs"
                        radius="md"
                        disabled={!isSelected}
                        value={cantidades[item.id_solicitud_detalle] || ""}
                        onChange={(val) => setCantidad(item.id_solicitud_detalle, Number(val))}
                        min={0.01}
                        max={totalStockExterno > 0 ? totalStockExterno : undefined}
                        placeholder="0"
                        classNames={{
                          input: "bg-zinc-900 border-zinc-800 text-right font-bold text-xs h-9",
                        }}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <TextInput
                        placeholder="Motivo del préstamo..."
                        size="sm"
                        radius="lg"
                        disabled={!isSelected}
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

      <Group justify="flex-end" mt="md">
        <Button
          variant="subtle"
          onClick={onCancel}
          disabled={submitting}
          radius="lg"
          className="text-zinc-400 hover:text-white"
        >
          Cancelar
        </Button>
        <Button
          onClick={handleRegistrar}
          loading={submitting}
          disabled={selectedItemIds.length === 0}
          radius="lg"
          className="bg-zinc-100 text-zinc-900 font-semibold hover:bg-white shadow-lg border-0 px-8"
        >
          Generar Préstamo
        </Button>
      </Group>
    </Stack>
  );
};
