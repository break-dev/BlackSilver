import { useEffect } from "react";
import {
  ActionIcon,
  Badge,
  Button,
  Group,
  NumberInput,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
} from "@mantine/core";
import {
  TrashIcon,
  PlusIcon,
  BoltIcon,
  FireIcon,
  HandThumbUpIcon,
  BuildingStorefrontIcon,
  ClipboardDocumentListIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";
import { useRegistroSolicitud } from "../hooks/useRegistroSolicitud";
import { Premura } from "../../../shared/enums/otros";
import { CustomDatePicker } from "../../../presentation/utils/date-picker-input";
import { pluralizar } from "../../../presentation/functions/pluralizar";
import type { RES_SolicitudReabastecimiento } from "../services/reabastecimiento.responses";

interface RegistroSolicitudProps {
  onSuccess: (item: RES_SolicitudReabastecimiento) => void;
  onCancel: () => void;
}

const SectionHeader = ({
  icon: Icon,
  title,
}: {
  icon: React.ElementType;
  title: string;
}) => (
  <div className="flex flex-col gap-2 mb-6">
    <div className="flex items-center gap-2">
      <Icon className="w-5 h-5 text-indigo-500" />
      <Text fw={700} size="sm" c="white" className="tracking-tight uppercase">
        {title}
      </Text>
    </div>
    <div className="h-0.5 w-full bg-linear-to-r from-indigo-500/50 to-transparent rounded-full" />
  </div>
);

export const RegistroSolicitud = ({
  onSuccess,
  onCancel,
}: RegistroSolicitudProps) => {
  const {
    state: {
      almacenes,
      productos,
      productosFiltrados,
      unidades,
      idAlmacenSolicitante,
      setIdAlmacenSolicitante,
      premura,
      setPremura,
      fechaEntregaRequerida,
      setFechaEntregaRequerida,
      idProducto,
      setIdProducto,
      idUnidadMedida,
      setIdUnidadMedida,
      cantidad,
      setCantidad,
      contenido,
      setContenido,
      comentarioItem,
      setComentarioItem,
      detalles,
      observacion,
      setObservacion,
    },
    derived: { sonUnidadesIdenticas, productoSeleccionado, canAdd },
    status: { submitting, loadingCatalogs, error },
    actions: { agregarItem, eliminarItem, handleSubmit, cargarCatalogos },
  } = useRegistroSolicitud({ onSuccess });

  useEffect(() => {
    cargarCatalogos();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const inputClasses = {
    input:
      "bg-zinc-900/50 border-zinc-800 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 text-white placeholder:text-zinc-500 transition-all",
    dropdown: "bg-zinc-900 border-zinc-800 shadow-2xl ",
    option:
      "hover:bg-zinc-800 text-zinc-300 data-[selected]:bg-zinc-100 data-[selected]:text-zinc-900 rounded-md my-1",
    label: "text-zinc-300 mb-1.5 font-semibold tracking-tight",
  };

  const unidadSeleccionada = unidades.find(
    (u) => u.id_unidad_medida === idUnidadMedida,
  );
  const unidadNombre = unidadSeleccionada?.nombre || "";
  const unidadAbbr = unidadSeleccionada?.abreviatura || "---";
  const baseAbbr = productoSeleccionado?.unidad_medida_base_abv || "---";
  const totalBase = cantidad * contenido;

  return (
    <Stack gap={32} p="md" className="animate-fade-in">
      <section>
        <SectionHeader
          icon={ClipboardDocumentListIcon}
          title="Datos de la solicitud"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-8">
          <Select
            label="Almacén Solicitante"
            placeholder="Seleccione almacén"
            withAsterisk
            data={almacenes.map((a) => ({
              value: String(a.id_almacen),
              label: a.nombre,
            }))}
            value={idAlmacenSolicitante ? String(idAlmacenSolicitante) : null}
            onChange={(val) => setIdAlmacenSolicitante(Number(val))}
            classNames={inputClasses}
            radius="lg"
            leftSection={
              <BuildingStorefrontIcon className="w-4 h-4 text-zinc-400" />
            }
            disabled={loadingCatalogs}
          />

          <CustomDatePicker
            label="Fecha Requerida de Entrega"
            placeholder="Seleccione fecha"
            withAsterisk
            value={fechaEntregaRequerida}
            onChange={(val) => setFechaEntregaRequerida(val as Date | null)}
            radius="lg"
            minDate={new Date()}
          />

          <div className="lg:col-span-2">
            <TextInput
              label="Observación General"
              placeholder="Indique algún detalle sobre este reabastecimiento..."
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              classNames={inputClasses}
              radius="lg"
            />
          </div>

          <div className="lg:col-span-2 bg-zinc-900/30 p-4 rounded-2xl border border-zinc-800/50">
            <Group justify="space-between" align="center" wrap="nowrap">
              <Stack gap={0}>
                <Text
                  size="xs"
                  fw={700}
                  className="text-zinc-400 uppercase tracking-widest"
                >
                  Prioridad
                </Text>
                <Text size="sm" fw={600} className="text-white">
                  Nivel de Urgencia
                </Text>
              </Stack>
              <Group gap="xs">
                <Button
                  size="xs"
                  variant={premura === Premura.Normal ? "filled" : "light"}
                  color="blue"
                  onClick={() => setPremura(Premura.Normal)}
                  leftSection={<HandThumbUpIcon className="w-3.5 h-3.5" />}
                  radius="md"
                  className="h-10 px-5 font-bold"
                >
                  NORMAL
                </Button>
                <Button
                  size="xs"
                  variant={premura === Premura.Urgente ? "filled" : "light"}
                  color="orange"
                  onClick={() => setPremura(Premura.Urgente)}
                  leftSection={<BoltIcon className="w-3.5 h-3.5" />}
                  radius="md"
                  className="h-10 px-5 font-bold"
                >
                  URGENTE
                </Button>
                <Button
                  size="xs"
                  variant={premura === Premura.Emergencia ? "filled" : "light"}
                  color="red"
                  onClick={() => setPremura(Premura.Emergencia)}
                  leftSection={<FireIcon className="w-3.5 h-3.5" />}
                  radius="md"
                  className="h-10 px-5 font-bold"
                >
                  EMERGENCIA
                </Button>
              </Group>
            </Group>
          </div>
        </div>
      </section>

      <section>
        <SectionHeader icon={ShoppingCartIcon} title="Items a solicitar" />

        <div className="space-y-6">
          <div className="bg-zinc-900/40 p-5 rounded-2xl border border-zinc-800 shadow-inner">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-x-4 gap-y-6 items-end">
              <div className="md:col-span-5">
                <Select
                  label="Producto"
                  placeholder="Seleccione producto"
                  data={productosFiltrados.map((p) => ({
                    value: String(p.id_producto),
                    label: p.nombre,
                  }))}
                  value={idProducto ? String(idProducto) : null}
                  onChange={(val) => setIdProducto(Number(val))}
                  searchable
                  classNames={inputClasses}
                  radius="lg"
                  size="sm"
                />
              </div>

              <div className="md:col-span-3">
                <Select
                  label="Unidad de Medida"
                  placeholder="Seleccione unidad"
                  data={unidades.map((u) => ({
                    value: String(u.id_unidad_medida),
                    label: `${u.nombre} (${u.abreviatura})`,
                  }))}
                  value={idUnidadMedida ? String(idUnidadMedida) : null}
                  onChange={(val) => setIdUnidadMedida(Number(val))}
                  classNames={inputClasses}
                  radius="lg"
                  size="sm"
                />
              </div>

              <div className="md:col-span-2">
                <NumberInput
                  label={`Cantidad`}
                  placeholder="0"
                  value={cantidad}
                  onChange={(val) => setCantidad(Number(val))}
                  min={0}
                  classNames={inputClasses}
                  radius="lg"
                  size="sm"
                />
              </div>

              <div className="md:col-span-2">
                <NumberInput
                  label={`${productoSeleccionado?.unidad_medida_base_abv || "---"} x ${unidadAbbr}`}
                  placeholder="Ej: 10"
                  value={contenido}
                  onChange={(val) => setContenido(Number(val))}
                  min={0.01}
                  disabled={sonUnidadesIdenticas}
                  classNames={inputClasses}
                  radius="lg"
                  size="sm"
                />
              </div>

              <div className="md:col-span-6 mb-10">
                <TextInput
                  label="Comentario"
                  placeholder="Detalles adicionales..."
                  value={comentarioItem}
                  onChange={(e) => setComentarioItem(e.target.value)}
                  classNames={inputClasses}
                  radius="lg"
                  size="sm"
                  mt="0"
                />
              </div>

              <div className="md:col-span-2 mb-10">
                <Button
                  onClick={agregarItem}
                  disabled={!canAdd}
                  variant="filled"
                  color="indigo"
                  size="sm"
                  fullWidth
                  className="shadow-lg h-10 mb-[2px]"
                  leftSection={<PlusIcon className="w-5 h-5 text-white" />}
                  radius="lg"
                >
                  Agregar
                </Button>
              </div>

              <div className="md:col-span-4">
                <div className="bg-zinc-950/50 rounded-xl p-4 border border-zinc-800/50 border-dashed">
                  <Text
                    component="div"
                    size="xs"
                    fw={700}
                    c="zinc.5"
                    mb="xs"
                    className="uppercase tracking-widest flex items-center gap-2"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    Resumen del item
                  </Text>

                  <Group gap="xl" wrap="nowrap">
                    <Stack gap={2}>
                      <Text
                        size="10px"
                        c="zinc.5"
                        fw={700}
                        className="uppercase"
                      >
                        En {pluralizar(unidadNombre || "---")}
                      </Text>
                      <div className="flex items-baseline gap-1.5">
                        <Text
                          fw={800}
                          size="xl"
                          className={
                            idUnidadMedida > 0 ? "text-white" : "text-zinc-700"
                          }
                        >
                          {cantidad.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                        </Text>
                        <Text
                          size="xs"
                          fw={700}
                          c="zinc.5"
                          className="uppercase tracking-wider"
                        >
                          {unidadAbbr}
                        </Text>
                      </div>
                    </Stack>

                    <div className="h-10 w-px bg-zinc-800" />

                    <Stack gap={2}>
                      <Text
                        size="10px"
                        c="zinc.5"
                        fw={700}
                        className="uppercase"
                      >
                        En{" "}
                        {pluralizar(
                          productoSeleccionado?.unidad_medida_base || "---",
                        )}
                      </Text>
                      <div className="flex items-baseline gap-1.5">
                        <Text
                          fw={800}
                          size="xl"
                          className={
                            idProducto > 0 ? "text-indigo-400" : "text-zinc-700"
                          }
                        >
                          {totalBase.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                        </Text>
                        <Text
                          size="xs"
                          fw={700}
                          c="zinc.5"
                          className="uppercase tracking-wider"
                        >
                          {baseAbbr}
                        </Text>
                      </div>
                    </Stack>
                  </Group>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="overflow-x-auto rounded-xl border border-zinc-800 shadow-sm">
        <Table variant="unstyled" className="w-full text-zinc-300">
          <thead className="bg-zinc-900 text-zinc-400 text-xs font-medium">
            <tr>
              <th className="px-4 py-3 text-center w-12">#</th>
              <th className="px-4 py-3 text-left font-semibold min-w-[220px]">
                Producto
              </th>
              <th className="px-4 py-3 text-right font-semibold w-32">
                Cant. Solicitada
              </th>
              <th className="px-4 py-3 text-right font-semibold w-32">
                Equivalencia
              </th>
              <th className="px-4 py-3 text-left font-semibold min-w-[280px]">
                Comentario
              </th>
              <th className="px-4 py-3 text-center w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800 bg-zinc-900/40">
            {detalles.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-zinc-500 italic"
                >
                  No hay productos agregados a la solicitud
                </td>
              </tr>
            ) : (
              detalles.map((det, index) => {
                const prod = productos.find(
                  (p) => p.id_producto === det.id_producto,
                );
                const uni = unidades.find(
                  (u) => u.id_unidad_medida === det.id_unidad_medida,
                );

                return (
                  <tr
                    key={index}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-3 text-xs text-center text-zinc-500">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-zinc-100">
                      {prod?.nombre}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <Badge
                        variant="filled"
                        color="indigo"
                        radius="sm"
                        size="sm"
                        className="font-bold shadow-xs whitespace-nowrap"
                      >
                        {det.cantidad_solicitada.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}{" "}
                        {uni?.abreviatura}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <Badge
                        variant="filled"
                        color="violet"
                        radius="sm"
                        size="sm"
                        className="font-bold shadow-xs whitespace-nowrap"
                      >
                        {(
                          det.cantidad_solicitada *
                          det.contenido_por_presentacion
                        ).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}{" "}
                        {prod?.unidad_medida_base_abv}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-400">
                      {det.comentario || "-"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <ActionIcon
                        color="red"
                        variant="subtle"
                        onClick={() => eliminarItem(index)}
                        radius="md"
                        size="sm"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </ActionIcon>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </Table>
      </div>

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
          onClick={handleSubmit}
          loading={submitting}
          disabled={detalles.length === 0}
          radius="lg"
          className="bg-linear-to-r from-indigo-500 to-violet-600 text-white font-semibold hover:from-indigo-600 hover:to-violet-700 shadow-lg border-0 px-8"
        >
          Guardar Solicitud
        </Button>
      </Group>

      {error && (
        <Text c="red" size="sm" fw={600} className="text-center animate-pulse">
          {error}
        </Text>
      )}
    </Stack>
  );
};
