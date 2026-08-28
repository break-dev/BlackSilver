import {
  Button,
  Grid,
  Group,
  NumberInput,
  Select,
  Stack,
  TagsInput,
  TextInput,
  Textarea,
  Divider,
  Loader,
  Box,
  Badge,
} from "@mantine/core";
import { useState, useMemo } from "react";
import { MapPinIcon, MapIcon, CubeIcon } from "@heroicons/react/24/outline";

import type { REQ_ActualizarActivo } from "../../service/activos.requests";
import type { RES_ActivoFijoResumen } from "../../service/activos.responses";
import { useEditarActivo } from "../../hooks/useEditarActivo";
import { useNotify } from "../../../../hooks/useNotify";
import { getCoincidencias } from "../../../../shared/functions/get-coincidencias";
import { EstadoActivoFijo } from "../../../../shared/enums/activo-fijo";

type LocationType = "almacen" | "mina" | "labor" | "none";

const OPCIONES_TIPO_UBICACION: { value: LocationType; label: string }[] = [
  { value: "none", label: "Sin ubicación" },
  { value: "labor", label: "Labor" },
  { value: "mina", label: "Mina" },
  { value: "almacen", label: "Almacén" },
];

const OPCIONES_ESTADO: { value: EstadoActivoFijo; label: string }[] = [
  { value: EstadoActivoFijo.EnUso, label: "En Uso" },
  { value: EstadoActivoFijo.EnMantenimiento, label: "En Mantenimiento" },
  { value: EstadoActivoFijo.EnAlmacen, label: "En Almacén" },
  { value: EstadoActivoFijo.DadoDeBaja, label: "Dado de Baja" },
];

interface Props {
  activo: RES_ActivoFijoResumen;
  onSuccess: (editado: RES_ActivoFijoResumen) => void;
  onCancel: () => void;
}

/**
 * Componente para editar un activo fijo existente.
 * Alcance:
 *   - Datos básicos: codigo, numero_serie, modelo, yearcito_modelo,
 *     descripcion, serie_placa, numero_placa.
 *   - Estado (En Uso / En Mantenimiento / En Almacén / Dado de Baja).
 *   - Especificaciones como tags libres (estilo hashtags), separados por
 *     coma o Enter. Internamente se almacenan como `string[]` en la
 *     columna JSON.
 *   - Ubicación física: almacen / mina / labor (opcional, puede quedar sin ubicación).
 *
 * NO edita: id_producto, marca, empleado responsable, evidencias,
 * datos de compra, labores abastecidas.
 *
 * Si cambia la ubicación, el backend registra el movimiento en
 * activo_fijo_ubicacion_log con el MovimientoActivoFijo derivado.
 * El estado enviado por el usuario tiene prioridad sobre el cálculo
 * automático de new_ubicacion.
 */
export const EditarActivo = ({ activo, onSuccess, onCancel }: Props) => {
  const {
    almacenes,
    minas,
    labores,
    loadingAlmacenes,
    loadingMinas,
    loadingLabores,
    getLaboresPorMina,
    actualizarActivo,
  } = useEditarActivo();

  const { notifyError } = useNotify();
  const [saving, setSaving] = useState(false);

  /**
   * Determina el tipo de ubicación inicial según el activo recibido.
   */
  const initialLocationType = useMemo<LocationType>(() => {
    if (activo.id_almacen) return "almacen";
    if (activo.id_mina) return "mina";
    if (activo.id_labor) return "labor";
    return "none";
  }, [activo]);

  const [locationType, setLocationType] =
    useState<LocationType>(initialLocationType);

  const [form, setForm] = useState<REQ_ActualizarActivo>({
    codigo: activo.codigo ?? "",
    numero_serie: activo.numero_serie ?? "",
    modelo: activo.modelo ?? "",
    yearcito_modelo: activo.yearcito_modelo ?? null,
    descripcion: activo.descripcion ?? "",
    serie_placa: activo.serie_placa ?? "",
    numero_placa: activo.numero_placa ?? "",
    id_labor: activo.id_labor ?? null,
    id_almacen: activo.id_almacen ?? null,
    id_mina: activo.id_mina ?? null,
    estado: activo.estado,
  });

  /**
   * Etiquetas / tags libres del activo. Asumimos siempre `string[]`
   * (estilo hashtags). Si viniera null, se trata como lista vacía.
   */
  const [especificaciones, setEspecificaciones] = useState<string[]>(
    activo.especificaciones ?? [],
  );

  /**
   * El producto base es inmutable; lo mostramos como contexto.
   */
  const esTransporte = activo.para_transporte === true;

  /**
   * Al cambiar tipo de ubicación, limpia los 3 campos para evitar
   * que queden residuos del tipo anterior (el activo solo puede estar
   * físicamente en UNO de ellos).
   */
  const handleLocationTypeChange = (type: LocationType) => {
    setLocationType(type);
    setForm((prev) => ({
      ...prev,
      id_almacen: null,
      id_mina: null,
      id_labor: null,
    }));
  };

  /**
   * Labores filtradas por mina (para el SingleSelect).
   * Si el activo actual está en una mina, priorizamos las de esa mina.
   */
  const opcionesLabor = useMemo(() => {
    const base = form.id_mina
      ? getLaboresPorMina(form.id_mina)
      : [...labores].sort(
          (a, b) =>
            a.mina.localeCompare(b.mina) || a.nombre.localeCompare(b.nombre),
        );
    return base;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.id_mina, labores]);

  const [busquedaLabor, setBusquedaLabor] = useState("");
  const opcionesLaborFiltradas = useMemo(() => {
    const q = busquedaLabor.trim();
    if (!q) return opcionesLabor;
    return getCoincidencias(opcionesLabor, q, {
      keys: ["nombre", "mina"],
      fuseThreshold: 0.4,
    }).map((r) => r.item);
  }, [opcionesLabor, busquedaLabor]);

  const fieldClasses = {
    input:
      "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500 transition-all",
    label: "text-zinc-300 mb-1 font-medium",
    description: "text-[12px] text-zinc-400",
  };

  const handleSubmit = async () => {
    if (esTransporte) {
      if (!form.serie_placa?.trim() || !form.numero_placa?.trim()) {
        notifyError(
          "La serie y el número de placa son obligatorios para activos de transporte.",
        );
        return;
      }
    }

    // Limpiar tags vacíos antes de enviar.
    const tagsLimpios = especificaciones
      .map((t) => t.trim())
      .filter((t) => t !== "");

    setSaving(true);
    try {
      const payload: REQ_ActualizarActivo = {
        ...form,
        especificaciones: tagsLimpios.length > 0 ? tagsLimpios : null,
      };
      const editado = await actualizarActivo(activo.id_activo, payload);
      if (editado) {
        onSuccess(editado);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack gap="md">
      {/* Contexto del producto base (inmutable) */}
      <Box className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 flex items-center gap-3">
        <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
          <CubeIcon className="w-4 h-4 text-indigo-400" />
        </div>
        <Stack gap={2} className="flex-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Producto base (no editable)
          </span>
          <Group gap="xs">
            <span className="text-sm font-bold text-white">
              {activo.producto}
            </span>
            {activo.categoria && (
              <Badge variant="light" color="zinc" size="xs" radius="sm">
                {activo.categoria}
              </Badge>
            )}
            {esTransporte && (
              <Badge variant="light" color="teal" size="xs" radius="sm">
                Vehículo
              </Badge>
            )}
          </Group>
        </Stack>
        <Stack gap={2} align="flex-end">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Correlativo
          </span>
          <Badge variant="light" color="indigo" size="sm" radius="sm" fw={700}>
            {activo.correlativo}
          </Badge>
        </Stack>
      </Box>

      <Grid gutter="md">
        <Grid.Col span={4}>
          <Select
            label="Tipo de Ubicación"
            data={OPCIONES_TIPO_UBICACION}
            value={locationType}
            onChange={(val) =>
              val && handleLocationTypeChange(val as LocationType)
            }
            allowDeselect={false}
            size="xs"
            radius="lg"
            classNames={fieldClasses}
          />
        </Grid.Col>

        <Grid.Col span={8}>
          {locationType === "almacen" ? (
            <Select
              label={
                <Group gap={4} align="center">
                  <MapPinIcon className="w-3.5 h-3.5 text-teal-400" />
                  <span>Almacén</span>
                </Group>
              }
              placeholder={
                loadingAlmacenes ? "Cargando..." : "Seleccione almacén..."
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
                  id_labor: null,
                })
              }
              clearable
              searchable
              disabled={loadingAlmacenes}
              rightSection={
                loadingAlmacenes ? (
                  <Loader size="xs" color="indigo" />
                ) : undefined
              }
              nothingFoundMessage="Sin coincidencias"
              size="xs"
              radius="lg"
              classNames={fieldClasses}
            />
          ) : locationType === "mina" ? (
            <Select
              label={
                <Group gap={4} align="center">
                  <MapIcon className="w-3.5 h-3.5 text-orange-400" />
                  <span>Mina</span>
                </Group>
              }
              placeholder={loadingMinas ? "Cargando..." : "Seleccione mina..."}
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
                  id_labor: null,
                })
              }
              clearable
              searchable
              disabled={loadingMinas}
              rightSection={
                loadingMinas ? <Loader size="xs" color="indigo" /> : undefined
              }
              nothingFoundMessage="Sin coincidencias"
              size="xs"
              radius="lg"
              classNames={fieldClasses}
            />
          ) : locationType === "labor" ? (
            <Select
              label={
                <Group gap={4} align="center">
                  <MapPinIcon className="w-3.5 h-3.5 text-violet-400" />
                  <span>Labor Minera</span>
                </Group>
              }
              placeholder={
                loadingLabores ? "Cargando..." : "Seleccione labor..."
              }
              data={opcionesLaborFiltradas.map((l) => ({
                value: String(l.id_labor),
                label: `${l.nombre} — ${l.mina}`,
              }))}
              value={form.id_labor ? String(form.id_labor) : null}
              onChange={(val) =>
                setForm({
                  ...form,
                  id_labor: val ? Number(val) : null,
                  id_almacen: null,
                  id_mina: null,
                })
              }
              onSearchChange={setBusquedaLabor}
              searchValue={busquedaLabor}
              clearable
              searchable
              disabled={loadingLabores}
              rightSection={
                loadingLabores ? <Loader size="xs" color="indigo" /> : undefined
              }
              nothingFoundMessage="Sin coincidencias"
              size="xs"
              radius="lg"
              classNames={fieldClasses}
            />
          ) : (
            <Box className="h-full flex items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-900/20 p-3">
              <span className="text-xs text-zinc-500 italic">
                El activo quedará sin ubicación asignada.
              </span>
            </Box>
          )}
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
            onChange={(e) => setForm({ ...form, numero_serie: e.target.value })}
            size="xs"
            radius="lg"
            classNames={fieldClasses}
          />
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
          <NumberInput
            label="Año del Modelo"
            value={form.yearcito_modelo ?? undefined}
            onChange={(val) =>
              setForm({
                ...form,
                yearcito_modelo:
                  val === "" || val === null ? null : Number(val),
              })
            }
            hideControls
            size="xs"
            radius="lg"
            classNames={fieldClasses}
          />
        </Grid.Col>

        {esTransporte && (
          <>
            <Grid.Col span={6}>
              <TextInput
                label="Serie de Placa"
                placeholder="Ej. AAA"
                value={form.serie_placa || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    serie_placa: e.target.value.toUpperCase(),
                  })
                }
                maxLength={3}
                required={esTransporte}
                disabled={!esTransporte}
                size="xs"
                radius="lg"
                classNames={fieldClasses}
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <TextInput
                label="Número de Placa"
                placeholder="Ej. 123"
                value={form.numero_placa || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    numero_placa: e.target.value.toUpperCase(),
                  })
                }
                maxLength={3}
                required={esTransporte}
                disabled={!esTransporte}
                size="xs"
                radius="lg"
                classNames={fieldClasses}
              />
            </Grid.Col>
          </>
        )}

        <Grid.Col span={12}>
          <Select
            label="Estado del Activo"
            data={OPCIONES_ESTADO}
            value={form.estado ?? null}
            onChange={(val) =>
              setForm({
                ...form,
                estado: (val as EstadoActivoFijo) ?? null,
              })
            }
            allowDeselect={false}
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
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            size="xs"
            radius="lg"
            minRows={2}
            classNames={fieldClasses}
          />
        </Grid.Col>
      </Grid>

      <Divider
        label="Especificaciones / Etiquetas"
        labelPosition="center"
        color="zinc.8"
      />

      <TagsInput
        label="Especificaciones"
        description="Escribe cada etiqueta y sepáralas con coma o Enter."
        placeholder={
          especificaciones.length === 0
            ? "Ej: motor 2.8L, diesel, 4x4"
            : "Añadir otra etiqueta..."
        }
        value={especificaciones}
        onChange={setEspecificaciones}
        acceptValueOnBlur
        clearable
        size="sm"
        radius="lg"
        classNames={fieldClasses}
      />

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
          loading={saving}
          size="xs"
          radius="lg"
        >
          Guardar Cambios
        </Button>
      </Group>
    </Stack>
  );
};
