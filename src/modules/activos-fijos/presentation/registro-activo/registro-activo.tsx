import {
  Button,
  Grid,
  Group,
  NumberInput,
  Select,
  Stack,
  TextInput,
  Textarea,
  Divider,
  ActionIcon,
  Tooltip,
  Loader,
  SegmentedControl,
  Center,
  Input,
  Box,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import {
  PlusIcon,
  TrashIcon,
  BuildingStorefrontIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { useState, useMemo, useEffect } from "react";
import { useDisclosure } from "@mantine/hooks";
import dayjs from "dayjs";

import type { REQ_CrearActivo } from "../../service/activos.requests";
import type { RES_ActivoFijoResumen } from "../../service/activos.responses";
import { TipoBien } from "../../../../shared/enums/_generic/tipo-bien";
import { useRegistrarActivo } from "../../hooks/useRegistrarActivo";
import { EstadoActivoFijo } from "../../../../shared/enums/activo-fijo";
import { useNotify } from "../../../../hooks/useNotify";
import { FormMarca } from "../../../../presentation/utils/form-marca";
import { ModalEstandar } from "../../../../presentation/utils/modal-estandar";

interface Props {
  onSuccess: (activo: RES_ActivoFijoResumen) => void;
  onCancel: () => void;
}

/**
 * Componente de formulario para el registro de un nuevo Activo Fijo.
 * Permite seleccionar el producto base, definir la ubicación inicial (Almacén o Mina),
 * asociar una marca, ingresar modelo, serie, código interno, especificaciones y fecha de ingreso.
 */
export const RegistroActivo = ({ onSuccess, onCancel }: Props) => {
  const {
    productos,
    almacenes,
    minas,
    marcas,
    empleados,
    loadingProductos,
    loadingAlmacenes,
    loadingMinas,
    loadingMarcas,
    loadingEmpleados,
    addMarca,
    crearActivo,
  } = useRegistrarActivo();

  const { notifyError } = useNotify();

  // Modal de Marca
  const [openedMarca, { open: openMarca, close: closeMarca }] =
    useDisclosure(false);
  const [nombreMarca, setNombreMarca] = useState("");

  // Tipo de ubicación seleccionada (Almacén o Mina)
  const [locationType, setLocationType] = useState<"almacen" | "mina">(
    "almacen",
  );

  const [saving, setSaving] = useState(false);

  // Clave dinámica para forzar el redibujado del SegmentedControl después del pintado inicial.
  // Esto soluciona el problema de desalineación del indicador flotante en modales durante su animación de apertura.
  const [segmentedKey, setSegmentedKey] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSegmentedKey((prev) => prev + 1);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  /**
   * Cambia el tipo de ubicación inicial y limpia la ubicación contraria para evitar duplicados.
   * @param type Tipo de ubicación seleccionada ("almacen" o "mina").
   */
  const handleLocationTypeChange = (type: "almacen" | "mina") => {
    setLocationType(type);
    if (type === "almacen") {
      setForm((prev) => ({ ...prev, id_mina: null }));
    } else {
      setForm((prev) => ({ ...prev, id_almacen: null }));
    }
  };

  // Filtrar solo productos que son activos fijos
  const productosAF = useMemo(
    () => productos.filter((p) => p.tipo_bien === TipoBien.ActivoFijo),
    [productos],
  );

  const [fechaIngreso, setFechaIngreso] = useState<Date | null>(new Date());

  const [form, setForm] = useState<REQ_CrearActivo>({
    id_producto: 0,
    id_almacen: null,
    id_mina: null,
    id_marca: null,
    codigo: "",
    numero_serie: "",
    modelo: "",
    serie_placa: "",
    numero_placa: "",
    yearcito_modelo: null,
    descripcion: "",
    especificaciones: [],
    fecha_hora_ingreso: null,
    estado: EstadoActivoFijo.EnUso,
    id_empleado_responsable: null,
    serie_factura_compra: "",
    numero_factura_compra: "",
    costo_compra: null,
  });

  const [especificaciones, setEspecificaciones] = useState<
    { clave: string; valor: string }[]
  >([]);

  const selectedProd = useMemo(
    () => productosAF.find((p) => p.id_producto === form.id_producto),
    [productosAF, form.id_producto],
  );

  const isTransport = useMemo(
    () =>
      selectedProd?.para_transporte === true ||
      selectedProd?.para_transporte === 1,
    [selectedProd],
  );

  const fieldClasses = {
    input:
      "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500 transition-all",
    label: "text-zinc-300 mb-1 font-medium",
  };

  /**
   * Añade una nueva fila de especificación técnica clave-valor en blanco.
   */
  const handleAddEspecificacion = () => {
    setEspecificaciones([...especificaciones, { clave: "", valor: "" }]);
  };

  /**
   * Elimina una fila de especificación técnica del listado local por su índice.
   * @param index Índice de la especificación a remover.
   */
  const handleRemoveEspecificacion = (index: number) => {
    setEspecificaciones(especificaciones.filter((_, i) => i !== index));
  };

  /**
   * Maneja el cambio de producto base, auto-agregando "Placa" si es para transporte.
   */
  const handleProductChange = (val: string | null) => {
    const idProd = val ? Number(val) : 0;
    setForm((prev) => ({ ...prev, id_producto: idProd }));
  };

  /**
   * Procesa y envía los datos del activo fijo al servicio para registrarlo.
   */
  const handleSubmit = async () => {
    if (isTransport) {
      if (!form.serie_placa?.trim() || !form.numero_placa?.trim()) {
        notifyError(
          "La serie y el número de placa son obligatorios para activos de transporte.",
        );
        return;
      }
    }

    setSaving(true);
    try {
      const nuevoActivo = await crearActivo({
        ...form,
        fecha_hora_ingreso:
          fechaIngreso && !isNaN(fechaIngreso.getTime())
            ? dayjs(fechaIngreso).format("YYYY-MM-DD HH:mm:ss")
            : null,
        especificaciones: especificaciones.length > 0 ? especificaciones : null,
      });
      if (nuevoActivo) {
        onSuccess(nuevoActivo);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Stack gap="md">
        <Grid gutter="md">
          <Grid.Col span={12}>
            <Select
              label="Producto Base"
              placeholder={
                loadingProductos
                  ? "Cargando productos..."
                  : "Seleccione el tipo de activo..."
              }
              data={productosAF.map((p) => ({
                value: String(p.id_producto),
                label: p.nombre,
              }))}
              value={form.id_producto ? String(form.id_producto) : null}
              onChange={handleProductChange}
              searchable
              required
              disabled={loadingProductos}
              rightSection={
                loadingProductos ? (
                  <Loader size="xs" color="indigo" />
                ) : undefined
              }
              size="xs"
              radius="lg"
              classNames={fieldClasses}
            />
          </Grid.Col>

          <Grid.Col span={5}>
            <Input.Wrapper
              label="Tipo de Ubicación"
              size="xs"
              classNames={{
                label: "text-zinc-300 mb-1 font-medium",
              }}
            >
              <SegmentedControl
                key={segmentedKey}
                value={locationType}
                onChange={(value) =>
                  handleLocationTypeChange(value as "almacen" | "mina")
                }
                data={[
                  {
                    value: "almacen",
                    label: (
                      <Center style={{ gap: 6 }}>
                        <BuildingStorefrontIcon className="w-3.5 h-3.5" />
                        <Box>Almacén</Box>
                      </Center>
                    ),
                  },
                  {
                    value: "mina",
                    label: (
                      <Center style={{ gap: 6 }}>
                        <MapPinIcon className="w-3.5 h-3.5" />
                        <Box>Mina</Box>
                      </Center>
                    ),
                  },
                ]}
                radius="md"
                size="xs"
                fullWidth
                classNames={{
                  root: "bg-zinc-900/50 border border-zinc-800",
                  control: "border-none",
                  indicator: "bg-indigo-600",
                  label: "text-zinc-400 data-[active]:text-white font-bold",
                }}
              />
            </Input.Wrapper>
          </Grid.Col>

          <Grid.Col span={7}>
            {locationType === "almacen" ? (
              <Select
                label="Ubicación Inicial (Almacén)"
                placeholder={
                  loadingAlmacenes ? "Cargando almacenes..." : "Opcional..."
                }
                data={almacenes.map((a) => ({
                  value: String(a.id_almacen),
                  label: a.nombre,
                }))}
                value={form.id_almacen ? String(form.id_almacen) : null}
                onChange={(val) =>
                  setForm({
                    ...form,
                    id_almacen: val ? Number(val) : null,
                    id_mina: null,
                    estado: val ? EstadoActivoFijo.EnAlmacen : form.estado,
                  })
                }
                clearable
                disabled={loadingAlmacenes}
                rightSection={
                  loadingAlmacenes ? (
                    <Loader size="xs" color="indigo" />
                  ) : undefined
                }
                size="xs"
                radius="lg"
                classNames={fieldClasses}
              />
            ) : (
              <Select
                label="Ubicación Inicial (Mina)"
                placeholder={loadingMinas ? "Cargando minas..." : "Opcional..."}
                data={minas.map((m) => ({
                  value: String(m.id_mina),
                  label: m.nombre,
                }))}
                value={form.id_mina ? String(form.id_mina) : null}
                onChange={(val) =>
                  setForm({
                    ...form,
                    id_mina: val ? Number(val) : null,
                    id_almacen: null,
                    estado: val ? EstadoActivoFijo.EnUso : form.estado,
                  })
                }
                clearable
                disabled={loadingMinas}
                rightSection={
                  loadingMinas ? <Loader size="xs" color="indigo" /> : undefined
                }
                size="xs"
                radius="lg"
                classNames={fieldClasses}
              />
            )}
          </Grid.Col>

          <Grid.Col span={6}>
            <Group gap={6} align="flex-end" wrap="nowrap">
              <Select
                className="flex-1"
                label="Marca"
                placeholder={
                  loadingMarcas ? "Cargando marcas..." : "Seleccione o cree..."
                }
                data={marcas.map((m) => ({
                  value: String(m.id_marca),
                  label: m.nombre,
                }))}
                value={form.id_marca ? String(form.id_marca) : null}
                onChange={(val) =>
                  setForm({ ...form, id_marca: val ? Number(val) : null })
                }
                searchable
                disabled={loadingMarcas}
                rightSection={
                  loadingMarcas ? (
                    <Loader size="xs" color="indigo" />
                  ) : undefined
                }
                size="xs"
                radius="lg"
                classNames={fieldClasses}
              />
              <Tooltip label="Nueva Marca">
                <ActionIcon
                  onClick={openMarca}
                  variant="filled"
                  color="indigo.6"
                  size={32}
                  radius="lg"
                  className="mb-[3px]"
                >
                  <PlusIcon className="w-4 h-4" />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Grid.Col>

          <Grid.Col span={6}>
            <TextInput
              label="Modelo"
              placeholder="Ej. Hilux 4x4"
              value={form.modelo || ""}
              onChange={(e) => setForm({ ...form, modelo: e.target.value })}
              size="xs"
              radius="lg"
              classNames={fieldClasses}
            />
          </Grid.Col>

          <Grid.Col span={6}>
            <TextInput
              label="Código Interno"
              placeholder="Ej: AF-001"
              value={form.codigo || ""}
              onChange={(e) => setForm({ ...form, codigo: e.target.value })}
              size="xs"
              radius="lg"
              classNames={fieldClasses}
            />
          </Grid.Col>

          <Grid.Col span={6}>
            <TextInput
              label="Número de Serie"
              placeholder="S/N del fabricante"
              value={form.numero_serie || ""}
              onChange={(e) =>
                setForm({ ...form, numero_serie: e.target.value })
              }
              size="xs"
              radius="lg"
              classNames={fieldClasses}
            />
          </Grid.Col>

          <Grid.Col span={4}>
            <NumberInput
              label="Año del Modelo"
              value={form.yearcito_modelo || undefined}
              onChange={(val) =>
                setForm({ ...form, yearcito_modelo: Number(val) })
              }
              hideControls
              size="xs"
              radius="lg"
              classNames={fieldClasses}
            />
          </Grid.Col>

          <Grid.Col span={4}>
            <TextInput
              label="Serie de Placa"
              placeholder="Ej. AAA"
              value={form.serie_placa || ""}
              onChange={(e) =>
                setForm({ ...form, serie_placa: e.target.value.toUpperCase() })
              }
              maxLength={3}
              required={isTransport}
              disabled={!isTransport}
              size="xs"
              radius="lg"
              classNames={fieldClasses}
            />
          </Grid.Col>

          <Grid.Col span={4}>
            <TextInput
              label="Número de Placa"
              placeholder="Ej. 123"
              value={form.numero_placa || ""}
              onChange={(e) =>
                setForm({ ...form, numero_placa: e.target.value.toUpperCase() })
              }
              maxLength={3}
              required={isTransport}
              disabled={!isTransport}
              size="xs"
              radius="lg"
              classNames={fieldClasses}
            />
          </Grid.Col>

          <Grid.Col span={6}>
            <DateTimePicker
              label="Fecha de Ingreso"
              value={fechaIngreso}
              onChange={(val) => setFechaIngreso(val ? new Date(val) : null)}
              size="xs"
              radius="lg"
              classNames={fieldClasses}
            />
          </Grid.Col>

          <Grid.Col span={6}>
            <Select
              label="Estado Inicial"
              placeholder="Seleccione el estado..."
              data={[
                { value: EstadoActivoFijo.EnUso, label: "En Uso" },
                {
                  value: EstadoActivoFijo.EnMantenimiento,
                  label: "En Mantenimiento",
                },
                { value: EstadoActivoFijo.EnAlmacen, label: "En Almacén" },
                { value: EstadoActivoFijo.DadoDeBaja, label: "Dado de Baja" },
              ]}
              value={form.estado || EstadoActivoFijo.EnUso}
              onChange={(val) =>
                setForm({ ...form, estado: val as EstadoActivoFijo })
              }
              required
              size="xs"
              radius="lg"
              classNames={fieldClasses}
            />
          </Grid.Col>

          <Grid.Col span={6}>
            <Select
              label="Empleado Responsable"
              placeholder={
                loadingEmpleados
                  ? "Cargando empleados..."
                  : "Seleccione un responsable..."
              }
              data={empleados.map((e) => ({
                value: String(e.id_empleado),
                label: e.nombre_completo,
              }))}
              value={
                form.id_empleado_responsable
                  ? String(form.id_empleado_responsable)
                  : null
              }
              onChange={(val) =>
                setForm({
                  ...form,
                  id_empleado_responsable: val ? Number(val) : null,
                })
              }
              clearable
              searchable
              disabled={loadingEmpleados}
              rightSection={
                loadingEmpleados ? (
                  <Loader size="xs" color="indigo" />
                ) : undefined
              }
              size="xs"
              radius="lg"
              classNames={fieldClasses}
            />
          </Grid.Col>

          <Grid.Col span={6}>
            <NumberInput
              label="Costo de Compra"
              placeholder="Costo en Soles"
              value={
                form.costo_compra !== null && form.costo_compra !== undefined
                  ? form.costo_compra
                  : ""
              }
              onChange={(val) =>
                setForm({ ...form, costo_compra: val ? Number(val) : null })
              }
              hideControls
              decimalScale={2}
              min={0}
              size="xs"
              radius="lg"
              classNames={fieldClasses}
            />
          </Grid.Col>

          <Grid.Col span={6}>
            <TextInput
              label="Serie Factura"
              placeholder="Ej. F001"
              value={form.serie_factura_compra || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  serie_factura_compra: e.target.value.toUpperCase(),
                })
              }
              size="xs"
              radius="lg"
              classNames={fieldClasses}
            />
          </Grid.Col>

          <Grid.Col span={6}>
            <TextInput
              label="Número Factura"
              placeholder="Ej. 000123"
              value={form.numero_factura_compra || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  numero_factura_compra: e.target.value.toUpperCase(),
                })
              }
              size="xs"
              radius="lg"
              classNames={fieldClasses}
            />
          </Grid.Col>

          <Grid.Col span={12}>
            <Textarea
              label="Descripción / Notas"
              placeholder="Detalles adicionales del activo..."
              value={form.descripcion || ""}
              onChange={(e) =>
                setForm({ ...form, descripcion: e.target.value })
              }
              size="xs"
              radius="lg"
              minRows={2}
              classNames={fieldClasses}
            />
          </Grid.Col>
        </Grid>

        <Divider
          label="Especificaciones Técnicas"
          labelPosition="center"
          color="zinc.8"
        />

        <Stack gap="xs">
          {especificaciones.map((esp, index) => {
            return (
              <Group key={index} gap="xs" align="flex-end">
                <TextInput
                  placeholder="Clave (ej: Motor)"
                  value={esp.clave}
                  onChange={(e) => {
                    const newEsp = [...especificaciones];
                    newEsp[index].clave = e.target.value;
                    setEspecificaciones(newEsp);
                  }}
                  size="xs"
                  radius="lg"
                  className="flex-1"
                  classNames={fieldClasses}
                />
                <TextInput
                  placeholder="Valor (ej: 2.8L)"
                  value={esp.valor}
                  onChange={(e) => {
                    const newEsp = [...especificaciones];
                    newEsp[index].valor = e.target.value;
                    setEspecificaciones(newEsp);
                  }}
                  size="xs"
                  radius="lg"
                  className="flex-1"
                  classNames={fieldClasses}
                />
                <ActionIcon
                  color="red.8"
                  variant="light"
                  onClick={() => handleRemoveEspecificacion(index)}
                  size="sm"
                  radius="md"
                >
                  <TrashIcon className="w-4 h-4" />
                </ActionIcon>
              </Group>
            );
          })}

          <Button
            variant="light"
            color="zinc.6"
            size="xs"
            radius="lg"
            leftSection={<PlusIcon className="w-4 h-4" />}
            onClick={handleAddEspecificacion}
            className="w-fit"
          >
            Añadir Especificación
          </Button>
        </Stack>

        <Group justify="flex-end" mt="xl">
          <Button
            variant="subtle"
            color="zinc.5"
            onClick={onCancel}
            disabled={saving}
            size="xs"
            radius="lg"
          >
            Cancelar
          </Button>
          <Button
            color="indigo.6"
            onClick={handleSubmit}
            disabled={!form.id_producto}
            loading={saving}
            size="xs"
            radius="lg"
          >
            Guardar Activo
          </Button>
        </Group>
      </Stack>

      {/* Modal para Crear Marca */}
      <ModalEstandar
        opened={openedMarca}
        close={closeMarca}
        title="Registrar Nueva Marca"
        size="sm"
      >
        <FormMarca
          nombre={nombreMarca}
          setNombre={setNombreMarca}
          marcasExistentes={marcas}
          onSuccess={(nuevaMarca) => {
            addMarca(nuevaMarca);
            setForm((prev) => ({ ...prev, id_marca: nuevaMarca.id_marca }));
            closeMarca();
            setNombreMarca("");
          }}
        />
      </ModalEstandar>
    </>
  );
};
