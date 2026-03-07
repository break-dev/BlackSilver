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
import { useForm } from "@mantine/form";
import { useState, useEffect } from "react";
import { notifications } from "@mantine/notifications";
import {
  PlusIcon,
  TrashIcon,
  BoltIcon,
  FireIcon,
  HandThumbUpIcon,
  BuildingStorefrontIcon,
} from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import {
  ClipboardDocumentListIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/solid";

import { useSolicitudesReabastecimiento } from "../../../../services/solicitudes-reabastecimiento/useSolicitudesReabastecimiento";
import { useLote } from "../../../../services/lote/useLote";
import { Premura } from "../../../../shared/enums";
import { CustomDatePicker } from "../../../utils/date-picker-input";
import type { RES_SolicitudReabastecimiento } from "../../../../services/solicitudes-reabastecimiento/solicitudes-reabastecimiento.requests";
import type {
  RES_ProductoDisponible,
  RES_UnidadMedida,
} from "../../../../services/lote/dtos/responses";
import { useAlmacenes } from "../../../../services/almacenes/useAlmacenes";
import { useAuthStore } from "../../../../stores/auth.store";

interface SolicitudReabastecimientoFormProps {
  onSuccess: (solicitud: RES_SolicitudReabastecimiento) => void;
  onCancel: () => void;
  initialAlmacenId?: number | null;
}

interface ItemDetalle {
  id_producto: string;
  producto_nombre: string;
  id_unidad_medida: string;
  unidad_medida_nombre: string;
  unidad_medida_abbr: string;
  unidad_base_abbr: string;
  cantidad_solicitada: number;
  contenido_por_presentacion: number;
  comentario: string;
}

export const SolicitudReabastecimientoForm = ({
  onSuccess,
  onCancel,
  initialAlmacenId,
}: SolicitudReabastecimientoFormProps) => {
  const { usuario } = useAuthStore();
  const [submitting, setSubmitting] = useState(false);
  const [, setError] = useState("");
  const [items, setItems] = useState<ItemDetalle[]>([]);

  // Maestros
  const [almacenes, setAlmacenes] = useState<
    { id_almacen: number; nombre: string }[]
  >([]);
  const [productosMaster, setProductosMaster] = useState<
    RES_ProductoDisponible[]
  >([]);
  const [unidadesMaster, setUnidadesMaster] = useState<RES_UnidadMedida[]>([]);

  const { crear } = useSolicitudesReabastecimiento({ setError });
  const { listarAlmacenesPropios } = useAlmacenes({ setError: () => {} });
  const { listarProductosDisponibles, listarUnidadesMedida } = useLote({
    setError: () => {},
  });

  const form = useForm({
    initialValues: {
      id_almacen_solicitante: "",
      premura: Premura.Normal,
      observacion: "",
      fecha_hora_entrega_requerida: null as Date | null,
    },
    validate: {
      id_almacen_solicitante: (val) =>
        !val ? "Seleccione un almacén solicitante" : null,
    },
  });

  const formItem = useForm({
    initialValues: {
      id_producto: "",
      id_unidad_medida: "",
      cantidad_solicitada: 0,
      contenido_por_presentacion: 1,
      comentario: "",
    },
    validate: {
      id_producto: (val) => (!val ? "Seleccione un producto" : null),
      id_unidad_medida: (val) => (!val ? "Seleccione unidad" : null),
      cantidad_solicitada: (val) => (val <= 0 ? "Debe ser > 0" : null),
      contenido_por_presentacion: (val) => (val <= 0 ? "Debe ser > 0" : null),
    },
  });

  // Effect load masters
  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        const [prodData, unitData, almacenData] = await Promise.all([
          listarProductosDisponibles(),
          listarUnidadesMedida(),
          listarAlmacenesPropios(),
        ]);
        if (prodData) setProductosMaster(prodData);
        if (unitData) setUnidadesMaster(unitData);
        if (almacenData) {
          setAlmacenes(almacenData);
          // Preselect: prefer initialAlmacenId prop, fallback to auto-select if only one
          if (initialAlmacenId) {
            form.setFieldValue(
              "id_almacen_solicitante",
              String(initialAlmacenId),
            );
          } else if (almacenData.length === 1) {
            form.setFieldValue(
              "id_almacen_solicitante",
              String(almacenData[0].id_almacen),
            );
          }
        }
      } catch (err) {
        console.error("Error loading catalogs", err);
      }
    };
    loadCatalogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario?.id_empleado]);

  const selectedProducto = productosMaster.find(
    (p) => String(p.id_producto) === formItem.values.id_producto,
  );
  const selectedUnidad = unidadesMaster.find(
    (u) => String(u.id_unidad_medida) === formItem.values.id_unidad_medida,
  );

  // Formatear opciones para React Select
  const unidadAbbr = selectedUnidad ? selectedUnidad.abreviatura : "---";

  const baseNombre = selectedProducto?.nombre_unidad_medida_base || "---";
  const baseAbbr = selectedProducto?.unidad_medida_base || "---";

  const totalBase =
    formItem.values.cantidad_solicitada *
    formItem.values.contenido_por_presentacion;

  const esUnidadBase =
    selectedProducto &&
    selectedUnidad &&
    String(selectedProducto.id_unidad_medida_base) ===
      String(formItem.values.id_unidad_medida);

  useEffect(() => {
    if (esUnidadBase) {
      formItem.setFieldValue("contenido_por_presentacion", 1);
    }
  }, [
    formItem.values.id_producto,
    formItem.values.id_unidad_medida,
    esUnidadBase,
    formItem, // Added formItem to dependencies as it's used in setFieldValue
  ]);

  const addItem = () => {
    const validation = formItem.validate();
    if (validation.hasErrors) {
      notifications.show({
        title: "Atención",
        message: "Por favor complete los datos del producto.",
        color: "orange",
      });
      return;
    }

    const {
      id_producto,
      id_unidad_medida,
      cantidad_solicitada,
      contenido_por_presentacion,
      comentario,
    } = formItem.values;

    const existingIndex = items.findIndex(
      (it) =>
        it.id_producto === id_producto &&
        it.id_unidad_medida === id_unidad_medida,
    );

    if (existingIndex > -1) {
      const updated = [...items];
      updated[existingIndex].cantidad_solicitada += cantidad_solicitada;
      setItems(updated);
    } else {
      setItems([
        ...items,
        {
          id_producto,
          producto_nombre: selectedProducto?.nombre || "Producto",
          id_unidad_medida,
          unidad_medida_nombre: selectedUnidad?.nombre || "Unidad",
          unidad_medida_abbr: selectedUnidad?.abreviatura || "---",
          unidad_base_abbr: selectedProducto?.unidad_medida_base || "---",
          cantidad_solicitada,
          contenido_por_presentacion,
          comentario: comentario || "",
        },
      ]);
    }
    formItem.setValues({
      ...formItem.values,
      cantidad_solicitada: 0,
      comentario: "",
    });
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const validation = form.validate();
    if (validation.hasErrors) {
      notifications.show({
        title: "Error",
        message: "Por favor complete los campos requeridos",
        color: "red",
      });
      return;
    }

    if (items.length === 0) {
      notifications.show({
        title: "Error",
        message: "Debe agregar al menos un producto",
        color: "red",
      });
      return;
    }

    setSubmitting(true);
    try {
      const dto = {
        id_almacen_solicitante: Number(form.values.id_almacen_solicitante),
        premura: form.values.premura,
        observacion: form.values.observacion || "",
        fecha_hora_entrega_requerida: form.values.fecha_hora_entrega_requerida
          ? dayjs(form.values.fecha_hora_entrega_requerida).format(
              "YYYY-MM-DD HH:mm:ss",
            )
          : "",
        detalles: items.map((item) => ({
          id_producto: Number(item.id_producto),
          id_unidad_medida: Number(item.id_unidad_medida),
          cantidad_solicitada: item.cantidad_solicitada,
          contenido_por_presentacion: item.contenido_por_presentacion,
          comentario: item.comentario,
        })),
      };

      const res = await crear(dto);
      if (res) {
        notifications.show({
          title: "Éxito",
          message: "Solicitud de Reabastecimiento enviada",
          color: "green",
        });
        onSuccess(res);
      }
    } catch (err) {
      console.error(err);
      setError("Error al enviar la solicitud");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClasses = {
    input:
      "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500 transition-all",
    dropdown: "bg-zinc-900 border-zinc-800 shadow-2xl ",
    option:
      "hover:bg-zinc-800 text-zinc-300 data-[selected]:bg-zinc-100 data-[selected]:text-zinc-900 rounded-md my-1",
    label: "text-zinc-300 mb-1.5 font-semibold tracking-tight",
  };

  const SectionHeader = ({
    icon: Icon,
    title,
  }: {
    icon: any;
    title: string;
  }) => (
    <div className="flex flex-col gap-2 mb-6">
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5 text-amber-500" />
        <Text fw={700} size="sm" c="white" className="tracking-tight uppercase">
          {title}
        </Text>
      </div>
      <div className="h-0.5 w-full bg-linear-to-r from-amber-500/50 to-transparent rounded-full" />
    </div>
  );

  return (
    <Stack gap={32} p="md">
      <section>
        <SectionHeader
          icon={ClipboardDocumentListIcon}
          title="Datos Generales"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-6">
          <Select
            label="Almacén solicitante"
            placeholder="Seleccione el almacén"
            withAsterisk
            data={almacenes.map((a) => ({
              value: String(a.id_almacen),
              label: a.nombre,
            }))}
            key={form.key("id_almacen_solicitante")}
            {...form.getInputProps("id_almacen_solicitante")}
            radius="lg"
            size="sm"
            classNames={inputClasses}
            leftSection={
              <BuildingStorefrontIcon className="w-4 h-4 text-zinc-400" />
            }
          />

          <CustomDatePicker
            label="Fecha de entrega (opc.)"
            placeholder="Seleccione fecha requerida"
            key={form.key("fecha_hora_entrega_requerida")}
            value={form.values.fecha_hora_entrega_requerida}
            onChange={(date) =>
              form.setFieldValue(
                "fecha_hora_entrega_requerida",
                date as unknown as Date,
              )
            }
            radius="lg"
            size="sm"
            minDate={new Date()}
            clearable
          />

          <TextInput
            label="Detalles adicionales"
            placeholder="Algún motivo o comentario general..."
            key={form.key("observacion")}
            {...form.getInputProps("observacion")}
            classNames={inputClasses}
            radius="lg"
            size="sm"
          />

          <div className="lg:col-span-3 bg-zinc-900/30 p-4 rounded-2xl border border-zinc-800/50">
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
                  variant={
                    form.values.premura === Premura.Normal ? "filled" : "light"
                  }
                  color="blue"
                  onClick={() => form.setFieldValue("premura", Premura.Normal)}
                  leftSection={<HandThumbUpIcon className="w-3.5 h-3.5" />}
                  radius="md"
                  className="h-10 px-5 font-bold"
                >
                  NORMAL
                </Button>
                <Button
                  size="xs"
                  variant={
                    form.values.premura === Premura.Urgente ? "filled" : "light"
                  }
                  color="orange"
                  onClick={() => form.setFieldValue("premura", Premura.Urgente)}
                  leftSection={<BoltIcon className="w-3.5 h-3.5" />}
                  radius="md"
                  className="h-10 px-5 font-bold"
                >
                  URGENTE
                </Button>
                <Button
                  size="xs"
                  variant={
                    form.values.premura === Premura.Emergencia
                      ? "filled"
                      : "light"
                  }
                  color="red"
                  onClick={() =>
                    form.setFieldValue("premura", Premura.Emergencia)
                  }
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
              <div className="md:col-span-4">
                <Select
                  label="Producto"
                  placeholder="Selecione bien"
                  data={productosMaster.map((p) => ({
                    value: String(p.id_producto),
                    label: p.nombre,
                  }))}
                  searchable
                  key={formItem.key("id_producto")}
                  {...formItem.getInputProps("id_producto")}
                  classNames={inputClasses}
                  radius="lg"
                  size="sm"
                />
              </div>

              <div className="md:col-span-4">
                <Select
                  label="Unidad de Medida"
                  placeholder="Seleccione medida"
                  data={unidadesMaster.map((u) => ({
                    value: String(u.id_unidad_medida),
                    label: `${u.nombre} (${u.abreviatura})`,
                  }))}
                  searchable
                  key={formItem.key("id_unidad_medida")}
                  {...formItem.getInputProps("id_unidad_medida")}
                  classNames={inputClasses}
                  radius="lg"
                  size="sm"
                />
              </div>

              <div className="md:col-span-2 text-center">
                <NumberInput
                  label={`Cantidad de ${unidadAbbr ? unidadAbbr : "-"}`}
                  placeholder="0.00"
                  min={0}
                  decimalScale={2}
                  decimalSeparator="."
                  hideControls
                  key={formItem.key("cantidad_solicitada")}
                  {...formItem.getInputProps("cantidad_solicitada")}
                  classNames={inputClasses}
                  radius="lg"
                  size="sm"
                />
              </div>

              <div className="md:col-span-2 text-center">
                <NumberInput
                  label={`${baseAbbr} x ${unidadAbbr ? unidadAbbr : "-"}`}
                  placeholder="1.00"
                  min={0.01}
                  decimalScale={2}
                  decimalSeparator="."
                  hideControls
                  disabled={esUnidadBase}
                  key={formItem.key("contenido_por_presentacion")}
                  {...formItem.getInputProps("contenido_por_presentacion")}
                  classNames={inputClasses}
                  radius="lg"
                  size="sm"
                />
              </div>

              <div className="md:col-span-9">
                <TextInput
                  label="Detalles Específicos"
                  placeholder="Marcas, pesos exactos, calidades..."
                  key={formItem.key("comentario")}
                  {...formItem.getInputProps("comentario")}
                  classNames={inputClasses}
                  radius="lg"
                  size="sm"
                />
              </div>

              <div className="md:col-span-3">
                <Button
                  onClick={addItem}
                  variant="filled"
                  color="indigo"
                  size="sm"
                  className="w-full shadow-lg h-10 mb-[2px]"
                  leftSection={<PlusIcon className="w-5 h-5 text-white" />}
                  radius="lg"
                >
                  Agregar
                </Button>
              </div>

              <div className="md:col-span-12 mt-2">
                <div className="bg-zinc-950/50 rounded-xl p-4 border border-zinc-800/50 border-dashed">
                  <Text
                    component="div"
                    size="xs"
                    fw={700}
                    c="zinc.5"
                    mb="xs"
                    className="uppercase tracking-widest flex items-center gap-2"
                  >
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                    Resumen
                  </Text>
                  <Group gap="xl">
                    <Stack gap={2}>
                      <Text
                        size="10px"
                        c="zinc.5"
                        fw={700}
                        className="uppercase"
                      >
                        Solicitando
                      </Text>
                      <div className="flex items-baseline gap-1.5">
                        <Text
                          fw={800}
                          size="xl"
                          className={
                            selectedUnidad ? "text-white" : "text-zinc-700"
                          }
                        >
                          {formItem.values.cantidad_solicitada.toLocaleString(
                            "en-US",
                            { minimumFractionDigits: 2 },
                          )}
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
                        Unidades Base ({baseNombre})
                      </Text>
                      <div className="flex items-baseline gap-1.5">
                        <Text
                          fw={800}
                          size="xl"
                          className={
                            selectedProducto
                              ? "text-emerald-400"
                              : "text-zinc-700"
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
                Comentarios
              </th>
              <th className="px-4 py-3 text-center w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800 bg-zinc-900/40">
            {items.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-zinc-500 italic"
                >
                  No hay productos elegidos.
                </td>
              </tr>
            ) : (
              items.map((item, index) => (
                <tr key={index} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 text-xs text-center text-zinc-500">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-zinc-100">
                    {item.producto_nombre}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <Badge
                      variant="filled"
                      color="cyan"
                      radius="sm"
                      size="sm"
                      className="text-white fw-bold shadow-xs whitespace-nowrap"
                    >
                      {item.cantidad_solicitada.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}{" "}
                      {item.unidad_medida_abbr}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <Badge
                      variant="filled"
                      color="pink"
                      radius="sm"
                      size="sm"
                      className="text-white fw-bold shadow-xs whitespace-nowrap"
                    >
                      {(
                        item.cantidad_solicitada *
                        item.contenido_por_presentacion
                      ).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}{" "}
                      {item.unidad_base_abbr}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-400">
                    {item.comentario || "-"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <ActionIcon
                      color="red"
                      variant="subtle"
                      onClick={() => removeItem(index)}
                      radius="md"
                      size="sm"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </ActionIcon>
                  </td>
                </tr>
              ))
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
          disabled={items.length === 0}
          radius="lg"
          className="bg-linear-to-r from-zinc-100 to-zinc-300 text-zinc-900 font-semibold hover:from-white hover:to-zinc-200 shadow-lg border-0 px-8"
        >
          Guardar Solicitud
        </Button>
      </Group>
    </Stack>
  );
};
