import {
  ActionIcon,
  Button,
  Group,
  NumberInput,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  MultiSelect,
} from "@mantine/core";
import {
  TrashIcon,
  ClipboardDocumentListIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";
import { useRegistroRequerimiento } from "../hooks/useRegistroRequerimiento";
import { Premura } from "../../../shared/enums/otros";
import { CustomDatePicker } from "../../../presentation/utils/date-picker-input";

interface RegistroRequerimientoProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const SectionHeader = ({ icon: Icon, title }: { icon: any; title: string }) => (
  <div className="flex flex-col gap-2 mb-4">
    <div className="flex items-center gap-2">
      <Icon className="w-5 h-5 text-amber-500" />
      <Text fw={700} size="sm" c="white" className="uppercase tracking-tight">
        {title}
      </Text>
    </div>
    <div className="h-0.5 w-full bg-linear-to-r from-amber-500/50 to-transparent" />
  </div>
);

export const RegistroRequerimiento = ({
  onSuccess,
  onCancel,
}: RegistroRequerimientoProps) => {
  const {
    state: {
      minas,
      almacenes,
      labores,
      productos,
      unidades,
      idMina,
      setIdMina,
      idAlmacenDestino,
      setIdAlmacenDestino,
      idLabores,
      setIdLabores,
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
    },
    derived: { sonUnidadesIdenticas, canAdd },
    status: { submitting, error },
    actions: { agregarItem, eliminarItem, handleSubmit },
  } = useRegistroRequerimiento({ onSuccess });

  const inputClasses = {
    input:
      "bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-500",
    label: "text-zinc-300 font-semibold mb-1",
  };

  return (
    <Stack gap={24} p="sm">
      <section>
        <SectionHeader
          icon={ClipboardDocumentListIcon}
          title="Datos de la solicitud"
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Select
            label="Mina"
            placeholder="Seleccione mina"
            data={minas.map((m) => ({
              value: String(m.id_mina),
              label: m.nombre,
            }))}
            value={idMina ? String(idMina) : null}
            onChange={(val) => setIdMina(Number(val))}
            classNames={inputClasses}
            radius="lg"
            searchable
          />

          <Select
            label="Almacén Destino"
            placeholder="Seleccione almacén"
            data={almacenes.map((a) => ({
              value: String(a.id_almacen),
              label: a.nombre,
            }))}
            value={idAlmacenDestino ? String(idAlmacenDestino) : null}
            onChange={(val) => setIdAlmacenDestino(Number(val))}
            disabled={!idMina}
            classNames={inputClasses}
            radius="lg"
          />

          <CustomDatePicker
            label="Fecha de Entrega"
            placeholder="Seleccione fecha"
            value={fechaEntregaRequerida}
            onChange={(val) => setFechaEntregaRequerida(val as Date | null)}
            radius="lg"
          />

          <div className="lg:col-span-3">
            <MultiSelect
              label="Labores Destino"
              placeholder="Asigne labores..."
              data={labores.map((l) => ({
                value: String(l.id_labor),
                label: l.nombre,
              }))}
              value={idLabores.map(String)}
              onChange={(vals) => setIdLabores(vals.map(Number))}
              disabled={!idMina}
              classNames={inputClasses}
              radius="lg"
            />
          </div>

          <div className="lg:col-span-3 bg-zinc-900/30 p-4 rounded-xl border border-zinc-800">
            <Group justify="space-between">
              <Text size="sm" fw={600}>
                Prioridad
              </Text>
              <Group gap="xs">
                {Object.values(Premura).map((p) => (
                  <Button
                    key={p}
                    size="xs"
                    variant={premura === p ? "filled" : "light"}
                    color={
                      p === Premura.Normal
                        ? "blue"
                        : p === Premura.Urgente
                          ? "orange"
                          : "red"
                    }
                    onClick={() => setPremura(p)}
                  >
                    {p.toUpperCase()}
                  </Button>
                ))}
              </Group>
            </Group>
          </div>
        </div>
      </section>

      <section>
        <SectionHeader icon={ShoppingCartIcon} title="Productos" />
        <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-800 grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-5">
            <Select
              label="Producto"
              data={productos.map((p) => ({
                value: String(p.id_producto),
                label: p.nombre,
              }))}
              value={idProducto ? String(idProducto) : null}
              onChange={(val) => setIdProducto(Number(val))}
              searchable
              classNames={inputClasses}
            />
          </div>
          <div className="md:col-span-4">
            <Select
              label="Unidad"
              data={unidades.map((u) => ({
                value: String(u.id_unidad_medida),
                label: u.nombre,
              }))}
              value={idUnidadMedida ? String(idUnidadMedida) : null}
              onChange={(val) => setIdUnidadMedida(Number(val))}
              classNames={inputClasses}
            />
          </div>
          <div className="md:col-span-3">
            <NumberInput
              label="Cantidad"
              value={cantidad}
              onChange={(val) => setCantidad(Number(val))}
              min={0}
              classNames={inputClasses}
            />
          </div>
          {!sonUnidadesIdenticas && idProducto > 0 && idUnidadMedida > 0 && (
            <div className="md:col-span-3">
              <NumberInput
                label={`Contenido por ${unidades.find((u) => u.id_unidad_medida === idUnidadMedida)?.nombre}`}
                value={contenido}
                onChange={(val) => setContenido(Number(val))}
                min={0}
                classNames={inputClasses}
              />
            </div>
          )}
          <div
            className={
              sonUnidadesIdenticas ? "md:col-span-12" : "md:col-span-9"
            }
          >
            <TextInput
              label="Comentario"
              value={comentarioItem}
              onChange={(e) => setComentarioItem(e.target.value)}
              classNames={inputClasses}
            />
          </div>
          <div className="md:col-span-12">
            <Button
              onClick={agregarItem}
              disabled={!canAdd}
              fullWidth
              radius="lg"
              color="indigo"
            >
              Agregar Producto
            </Button>
          </div>
        </div>
      </section>

      <Table variant="unstyled" className="text-zinc-300">
        <thead>
          <tr className="bg-zinc-900 text-zinc-400 text-xs">
            <th className="p-3">ITEM</th>
            <th className="p-3">CANTIDAD</th>
            <th className="p-3">EQUIVALENCIA BASE</th>
            <th className="p-3">ACCIÓN</th>
          </tr>
        </thead>
        <tbody>
          {detalles.map((det, idx) => (
            <tr key={idx} className="border-t border-zinc-800">
              <td className="p-3">
                {
                  productos.find((p) => p.id_producto === det.id_producto)
                    ?.nombre
                }
              </td>
              <td className="p-3">
                {det.cantidad_solicitada}{" "}
                {
                  unidades.find(
                    (u) => u.id_unidad_medida === det.id_unidad_medida,
                  )?.abreviatura
                }
              </td>
              <td className="p-3">
                {det.cantidad_solicitada * det.contenido_por_presentacion}{" "}
                {
                  productos.find((p) => p.id_producto === det.id_producto)
                    ?.unidad_medida_base
                }
              </td>
              <td className="p-3">
                <ActionIcon color="red" onClick={() => eliminarItem(idx)}>
                  <TrashIcon className="w-4 h-4" />
                </ActionIcon>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Group justify="flex-end" mt="xl">
        <Button variant="outline" color="gray" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} loading={submitting} color="teal">
          Registrar Requerimiento
        </Button>
      </Group>

      {error && (
        <Text c="red" size="sm">
          {error}
        </Text>
      )}
    </Stack>
  );
};
