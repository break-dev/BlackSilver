import { useEffect, useMemo, useState } from "react";
import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Grid,
  Group,
  NumberInput,
  Select,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import {
  IconBuildingStore,
  IconCalendar,
  IconCirclePlus,
  IconExclamationCircle,
  IconFlame,
  IconTrash,
  IconUser,
  IconUsers,
  IconUsersGroup,
} from "@tabler/icons-react";

import { useNotify } from "../../../hooks/useNotify";
import { AuxService } from "../../../service/auxiliar.service";
import type { RES_Empresa } from "../../../service/responses/empresa";
import { ProveedoresService } from "../../proveedores/service/proveedores.service";
import type { ProveedorResponse } from "../../proveedores/service/proveedores.responses";
import { TipoCarbonService } from "../../tipo-carbon/service/tipo-carbon.service";
import type { RES_TipoCarbon } from "../../tipo-carbon/service/tipo-carbon.responses";
import { CompraCarbonService } from "../service/compra-carbon.service";
import type { CompraCarbonResumen } from "../service/compra-carbon.responses";
import type { RES_PersonalExterno } from "../../../service/responses/personal-externo";
import { formatNumber } from "../../../shared/functions/formatNumber";
import { TipoEntidad } from "../../../shared/enums/_generic/tipo-entidad";

interface Props {
  onCancel: () => void;
  onCreated: (cabecera: CompraCarbonResumen) => void;
}

interface LineaTemporal {
  id_tipo_carbon: number | null;
  cantidad: number;
  precio_unitario: number;
}

const toBackendDateTime = (d: Date | string | null): string => {
  const date = typeof d === "string" ? new Date(d) : d;
  if (!date) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

// Estilo de inputs, selects y dropdowns alineado con Nuevo Requerimiento.
const inputClasses = {
  input:
    "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500 transition-all",
  dropdown: "bg-zinc-950 border-zinc-800 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl",
  option:
    "text-zinc-300 hover:bg-zinc-800 hover:text-white data-[selected]:bg-indigo-600 data-[selected]:text-white font-medium transition-colors",
  label: "text-zinc-300 mb-1.5 font-semibold tracking-tight",
};

const formatPEN = (n: number) => `S/ ${formatNumber(n)}`;

// SectionHeader estilo "Nuevo Requerimiento": icono amber + divider amber.
const SectionHeader = ({
  icon: Icon,
  title,
}: {
  icon: React.ElementType;
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

export const RegistroCompraCarbon = ({ onCancel, onCreated }: Props) => {
  const { notifyError, notifySuccess } = useNotify();

  const [empresas, setEmpresas] = useState<RES_Empresa[]>([]);
  const [proveedoresNatural, setProveedoresNatural] = useState<ProveedorResponse[]>([]);
  const [proveedoresJuridica, setProveedoresJuridica] = useState<ProveedorResponse[]>([]);
  const [tipos, setTipos] = useState<RES_TipoCarbon[]>([]);
  const [loadingCatalogos, setLoadingCatalogos] = useState(false);

  const [filtroTipoEntidad, setFiltroTipoEntidad] = useState<TipoEntidad>(
    TipoEntidad.Juridica,
  );

  const [idEmpresa, setIdEmpresa] = useState<string | null>(null);
  const [idProveedor, setIdProveedor] = useState<string | null>(null);
  const [idRepresentante, setIdRepresentante] = useState<string | null>(null);
  const [representantes, setRepresentantes] = useState<RES_PersonalExterno[]>([]);
  const [loadingRepresentantes, setLoadingRepresentantes] = useState(false);
  const [fechaHora, setFechaHora] = useState<Date | null>(new Date());

  const [detalles, setDetalles] = useState<LineaTemporal[]>([
    { id_tipo_carbon: null, cantidad: 0, precio_unitario: 0 },
  ]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoadingCatalogos(true);
      const [empresasRes, proveedoresArr, tiposRes] = await Promise.all([
        AuxService.get_empresas(),
        ProveedoresService.getProveedores({ para_carbon: true }),
        TipoCarbonService.getTipos(),
      ]);
      if (cancel) return;
      if (empresasRes.success) setEmpresas(empresasRes.data);
      if (proveedoresArr) {
        setProveedoresNatural(
          proveedoresArr.filter(
            (p) => p.tipo_entidad === TipoEntidad.Natural,
          ),
        );
        setProveedoresJuridica(
          proveedoresArr.filter(
            (p) => p.tipo_entidad === TipoEntidad.Juridica,
          ),
        );
      }
      if (tiposRes.success) setTipos(tiposRes.data);
      setLoadingCatalogos(false);
    })();
    return () => {
      cancel = true;
    };
  }, []);

  useEffect(() => {
    setIdProveedor(null);
    setIdRepresentante(null);
    setRepresentantes([]);
  }, [filtroTipoEntidad]);

  useEffect(() => {
    if (!idProveedor) {
      setRepresentantes([]);
      setIdRepresentante(null);
      return;
    }
    let cancel = false;
    (async () => {
      setLoadingRepresentantes(true);
      try {
        const arr = await ProveedoresService.getRepresentantesPorProveedor(
          Number(idProveedor),
        );
        if (cancel) return;
        const reps = arr.filter((r) => r.es_representante);
        setRepresentantes(reps);
        setIdRepresentante(
          reps.length > 0 ? String(reps[0].id_personal) : null,
        );
      } finally {
        if (!cancel) setLoadingRepresentantes(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [idProveedor]);

  const proveedoresFiltrados = useMemo(
    () =>
      filtroTipoEntidad === TipoEntidad.Natural
        ? proveedoresNatural
        : proveedoresJuridica,
    [filtroTipoEntidad, proveedoresNatural, proveedoresJuridica],
  );

  const opcionesProveedor = useMemo(
    () =>
      proveedoresFiltrados.map((p) => ({
        value: String(p.id_proveedor),
        label: p.razon_social,
      })),
    [proveedoresFiltrados],
  );

  const opcionesRepresentante = useMemo(
    () =>
      representantes.map((r) => ({
        value: String(r.id_personal),
        label: r.nombre_completo,
      })),
    [representantes],
  );

  const opcionesTipos = useMemo(
    () =>
      tipos.map((t) => ({
        value: String(t.id_tipo_carbon),
        label: t.codigo ? `${t.nombre} (${t.codigo})` : t.nombre,
      })),
    [tipos],
  );

  const subtotalBase = useMemo(
    () =>
      detalles.reduce(
        (acc, d) =>
          d.id_tipo_carbon && d.cantidad > 0 && d.precio_unitario >= 0
            ? acc + d.cantidad * d.precio_unitario
            : acc,
        0,
      ),
    [detalles],
  );

  const igvPct = 18;
  const igvMonto = subtotalBase * (igvPct / 100);
  const total = subtotalBase + igvMonto;

  const handleAddLinea = () => {
    setDetalles((prev) => [
      ...prev,
      { id_tipo_carbon: null, cantidad: 0, precio_unitario: 0 },
    ]);
  };

  const handleRemoveLinea = (idx: number) => {
    setDetalles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleLineaChange = <K extends keyof LineaTemporal>(
    idx: number,
    field: K,
    value: LineaTemporal[K],
  ) => {
    setDetalles((prev) =>
      prev.map((d, i) => (i === idx ? { ...d, [field]: value } : d)),
    );
  };

  const handleSubmit = async () => {
    setError(null);

    if (!idEmpresa || !idProveedor) {
      setError("Empresa y proveedor son requeridos");
      return;
    }
    if (!fechaHora) {
      setError("La fecha y hora de la compra es requerida");
      return;
    }
    const detallesValidos = detalles.filter(
      (d) => d.id_tipo_carbon && d.cantidad > 0 && d.precio_unitario >= 0,
    );
    if (detallesValidos.length === 0) {
      setError("Agrega al menos un item valido (tipo, cantidad > 0, precio)");
      return;
    }

    const payload: Parameters<typeof CompraCarbonService.crearCompra>[0] = {
      id_empresa: Number(idEmpresa),
      id_proveedor: Number(idProveedor),
      porcentaje_igv: igvPct,
      fecha_hora_compra: toBackendDateTime(fechaHora),
      detalles: detallesValidos.map((d) => ({
        id_tipo_carbon: d.id_tipo_carbon as number,
        cantidad: d.cantidad,
        precio_unitario: d.precio_unitario,
      })),
    };

    setSaving(true);
    try {
      const resp = await CompraCarbonService.crearCompra(payload);
      if (resp.success) {
        notifySuccess(resp.message || "Compra registrada correctamente");
        const cab = resp.data.cabecera;
        const resumen: CompraCarbonResumen = {
          id_compra_carbon: cab.id_compra_carbon,
          id_empresa: cab.id_empresa,
          empresa: cab.empresa,
          id_proveedor: cab.id_proveedor,
          proveedor: cab.proveedor,
          proveedor_tipo_entidad: cab.proveedor_tipo_entidad,
          proveedor_ruc: cab.proveedor_ruc,
          proveedor_dni: cab.proveedor_dni,
          id_empleado_registro: cab.id_empleado_registro,
          empleado_registro: cab.empleado_registro,
          id_empleado_aprueba: cab.id_empleado_aprueba,
          empleado_aprueba: cab.empleado_aprueba ?? null,
          porcentaje_igv: cab.porcentaje_igv,
          correlativo: cab.correlativo,
          numero_correlativo: cab.numero_correlativo,
          fecha_hora_compra: cab.fecha_hora_compra,
          fecha_hora_aprobacion: cab.fecha_hora_aprobacion,
          total: cab.total,
          created_at: cab.created_at,
          estado: cab.estado,
          cantidad_items: resp.data.detalles.length,
          evidencias_aprobacion: cab.evidencias_aprobacion ?? [],
        };
        onCreated(resumen);
      } else {
        notifyError(resp.message || "No se pudo registrar la compra");
      }
    } catch (e) {
      console.error(e);
      notifyError("Error al registrar la compra de carbon");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack gap={32} p="md" className="animate-fade-in">
      {error && (
        <Alert
          icon={<IconExclamationCircle size={16} />}
          color="red"
          variant="filled"
        >
          {error}
        </Alert>
      )}

      {/* SECCION: Datos de la Compra (incluye Proveedor + Representante) */}
      <section>
        <SectionHeader icon={IconBuildingStore} title="Datos de la Compra" />

        <Grid align="end">
          {/* Fila 1: Empresa + Fecha/hora */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Select
              label="Empresa que compra"
              placeholder={loadingCatalogos ? "Cargando..." : "Seleccione"}
              radius="lg"
              size="sm"
              searchable
              withAsterisk
              data={empresas.map((e) => ({
                value: String(e.id_empresa),
                label: e.razon_social,
              }))}
              value={idEmpresa}
              onChange={setIdEmpresa}
              classNames={inputClasses}
              nothingFoundMessage="Sin empresas"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <DateTimePicker
              label="Fecha y hora de la compra"
              placeholder="Seleccione fecha y hora"
              radius="lg"
              size="sm"
              withAsterisk
              leftSection={<IconCalendar size={16} />}
              value={fechaHora}
              onChange={(v) => {
                if (!v) {
                  setFechaHora(null);
                  return;
                }
                if (typeof v === "string") {
                  setFechaHora(new Date(v));
                } else {
                  setFechaHora(v);
                }
              }}
              classNames={inputClasses}
            />
          </Grid.Col>

          {/* Fila 2: Proveedor (con toggle Natural/Juridica a la derecha) + Representante */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <div className="flex items-end gap-2">
              <Select
                label={`Proveedor (${
                  filtroTipoEntidad === TipoEntidad.Natural
                    ? "Natural"
                    : "Juridica"
                })`}
                placeholder={
                  loadingCatalogos
                    ? "Cargando..."
                    : opcionesProveedor.length === 0
                      ? "Sin proveedores para esta opcion"
                      : "Seleccione"
                }
                radius="lg"
                size="sm"
                searchable
                withAsterisk
                disabled={opcionesProveedor.length === 0}
                data={opcionesProveedor}
                value={idProveedor}
                onChange={setIdProveedor}
                classNames={inputClasses}
                nothingFoundMessage="Sin coincidencias"
                leftSection={
                  <IconBuildingStore size={16} className="text-zinc-400" />
                }
                className="flex-1"
              />
              <Tooltip
                label={
                  filtroTipoEntidad === TipoEntidad.Natural
                    ? "Ver proveedores juridicos"
                    : "Ver proveedores naturales"
                }
                position="top"
                withArrow
              >
                <ActionIcon
                  variant="light"
                  color={
                    filtroTipoEntidad === TipoEntidad.Natural
                      ? "teal"
                      : "indigo"
                  }
                  onClick={() =>
                    setFiltroTipoEntidad((prev) =>
                      prev === TipoEntidad.Natural
                        ? TipoEntidad.Juridica
                        : TipoEntidad.Natural,
                    )
                  }
                  radius="lg"
                  size="lg"
                  className="shrink-0"
                  style={{ height: 36, width: 36 }}
                >
                  {filtroTipoEntidad === TipoEntidad.Natural ? (
                    <IconUsersGroup className="w-5 h-5" />
                  ) : (
                    <IconUsers className="w-5 h-5" />
                  )}
                </ActionIcon>
              </Tooltip>
            </div>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Select
              label="Representante"
              placeholder={
                !idProveedor
                  ? "Seleccione un proveedor"
                  : loadingRepresentantes
                    ? "Cargando..."
                    : opcionesRepresentante.length === 0
                      ? "Sin representantes"
                      : "Seleccione"
              }
              radius="lg"
              size="sm"
              searchable
              clearable
              disabled={!idProveedor || loadingRepresentantes}
              data={opcionesRepresentante}
              value={idRepresentante}
              onChange={setIdRepresentante}
              classNames={inputClasses}
              nothingFoundMessage="Sin representantes"
              leftSection={<IconUser size={16} className="text-zinc-400" />}
            />
          </Grid.Col>
        </Grid>
      </section>

      {/* SECCION: Items a solicitar */}
      <section>
        <Group justify="space-between" align="end" mb="sm">
          <SectionHeader icon={IconFlame} title="Items a solicitar" />
          <Button
            leftSection={<IconCirclePlus size={14} />}
            radius="lg"
            size="xs"
            variant="light"
            color="indigo"
            onClick={handleAddLinea}
            className="font-bold"
          >
            Agregar item
          </Button>
        </Group>

        {detalles.map((linea, idx) => (
          <div
            key={idx}
            className="mb-3"
          >
            <Grid align="end">
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Select
                  label={idx === 0 ? "Tipo de carbon" : undefined}
                  placeholder="Seleccione"
                  radius="lg"
                  size="sm"
                  searchable
                  data={opcionesTipos.filter((o) => {
                    const enUso = detalles.some(
                      (d, i) =>
                        i !== idx && d.id_tipo_carbon === Number(o.value),
                    );
                    return !enUso;
                  })}
                  value={
                    linea.id_tipo_carbon
                      ? String(linea.id_tipo_carbon)
                      : null
                  }
                  onChange={(v) =>
                    handleLineaChange(
                      idx,
                      "id_tipo_carbon",
                      v ? Number(v) : null,
                    )
                  }
                  classNames={inputClasses}
                  nothingFoundMessage="Sin tipos"
                />
              </Grid.Col>
              <Grid.Col span={{ base: 6, md: 2 }}>
                <NumberInput
                  label={idx === 0 ? "Cantidad (Toneladas)" : undefined}
                  radius="lg"
                  size="sm"
                  min={0}
                  decimalScale={2}
                  hideControls={false}
                  value={linea.cantidad}
                  onChange={(v) =>
                    handleLineaChange(
                      idx,
                      "cantidad",
                      typeof v === "number" ? v : Number(v) || 0,
                    )
                  }
                  classNames={inputClasses}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 6, md: 2 }}>
                <NumberInput
                  label={idx === 0 ? "Precio unitario" : undefined}
                  radius="lg"
                  size="sm"
                  min={0}
                  decimalScale={2}
                  fixedDecimalScale
                  hideControls={false}
                  value={linea.precio_unitario}
                  onChange={(v) =>
                    handleLineaChange(
                      idx,
                      "precio_unitario",
                      typeof v === "number" ? v : Number(v) || 0,
                    )
                  }
                  classNames={inputClasses}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 2 }} className="text-right">
                <Button
                  variant="subtle"
                  color="red"
                  size="xs"
                  radius="lg"
                  leftSection={<IconTrash size={14} />}
                  onClick={() => handleRemoveLinea(idx)}
                  disabled={detalles.length <= 1}
                  className="shrink-0"
                >
                  Quitar
                </Button>
              </Grid.Col>
            </Grid>
          </div>
        ))}

        {/* Resumen Tributario al pie */}
        <Grid mt="xs" justify="flex-end">
          <Grid.Col span={{ base: 12, sm: 8, md: 5, lg: 4 }}>
            <div className="bg-zinc-900/30 px-4 py-3 rounded-xl border border-zinc-800/50">
              <div className="flex justify-between items-center mb-1.5">
                <Text
                  size="xs"
                  c="dimmed"
                  fw={700}
                  className="uppercase tracking-wider"
                >
                  Subtotal
                </Text>
                <Text
                  size="xs"
                  fw={700}
                  className="font-mono text-zinc-300 tabular-nums"
                >
                  {formatPEN(subtotalBase)}
                </Text>
              </div>
              <div className="flex justify-between items-center mb-2">
                <Text
                  size="xs"
                  c="dimmed"
                  fw={700}
                  className="uppercase tracking-wider"
                >
                  IGV {igvPct.toFixed(0)}%
                </Text>
                <Text
                  size="xs"
                  fw={700}
                  className="font-mono text-zinc-300 tabular-nums"
                >
                  {formatPEN(igvMonto)}
                </Text>
              </div>
              <div className="h-px bg-zinc-800 mb-2" />
              <div className="flex justify-between items-center">
                <Text
                  fw={900}
                  size="xs"
                  className="uppercase tracking-widest text-zinc-200"
                >
                  Total
                </Text>
                <Badge color="indigo" variant="filled" size="sm" radius="md">
                  <span className="font-mono tabular-nums">
                    {formatPEN(total)}
                  </span>
                </Badge>
              </div>
            </div>
          </Grid.Col>
        </Grid>
      </section>

      {/* Acciones */}
      <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
        <Button variant="subtle" onClick={onCancel} disabled={saving}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          loading={saving}
          disabled={loadingCatalogos}
          className="bg-linear-to-r from-zinc-100 to-zinc-300 text-zinc-900 hover:from-white hover:to-zinc-200 shadow-lg shadow-zinc-900/20"
        >
          Registrar compra
        </Button>
      </div>
    </Stack>
  );
};