import {
  Button,
  Group,
  NumberInput,
  Stack,
  Textarea,
  Text,
  Badge,
  Card,
  SimpleGrid,
  Select,
  SegmentedControl,
  Center,
  Box,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import { useState, useEffect, useMemo, useRef } from "react";
import { useNotify } from "../../../hooks/useNotify";
import { ControlUsoService } from "../service/control-uso.service";
import { AuxService } from "../../../service/auxiliar.service";
import { MinasService } from "../../../modules/minas-labores/service/minas.service";
import { ClientesService } from "../../../modules/clientes/service/clientes.service";
import type { RES_ControlUsoLog, RES_Tarifa } from "../service/control-uso.responses";
import type { RES_ActivoFijoDisponible } from "../../../service/responses/activo-fijo";
import { Cog8ToothIcon, TruckIcon, ArrowPathRoundedSquareIcon, MapPinIcon, BriefcaseIcon, PlusIcon, QueueListIcon } from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import { TimeInput } from "@mantine/dates";
import "@mantine/dates/styles.css";
import { ModalEstandar } from "../../../presentation/utils/modal-estandar";
import { DataTableEstandar } from "../../../presentation/utils/datatable-estandar";
import { NuevaTarifaModal } from "./nueva-tarifa-modal";
import { CustomDatePicker } from "../../../presentation/utils/date-picker-input";

interface Props {
  asset: RES_ActivoFijoDisponible;
  tipoControl: "horometro" | "odometro" | "vueltas";
  onSuccess: (nuevoLog: RES_ControlUsoLog) => void;
  onCancel: () => void;
}

export const RegistroUso = ({
  asset,
  tipoControl,
  onSuccess,
  onCancel,
}: Props) => {
  const { notifyError } = useNotify();
  const idActivoFijo = asset.id_activo;

  const fieldClasses = {
    input:
      "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500 transition-all",
    label: "text-zinc-300 mb-1 font-medium",
  };

  // Data states
  const [loadingData, setLoadingData] = useState(false);
  const [saving, setSaving] = useState(false);

  const [tarifas, setTarifas] = useState<RES_Tarifa[]>([]);
  const [minas, setMinas] = useState<{ value: string; label: string }[]>([]);
  const [labores, setLabores] = useState<{ value: string; label: string }[]>([]);
  const [lotesMineral, setLotesMineral] = useState<{ value: string; label: string }[]>([]);
  const [clientes, setClientes] = useState<{ value: string; label: string }[]>([]);

  // Form states
  const [esParaMina, setEsParaMina] = useState<boolean>(true);
  const [idMina, setIdMina] = useState<string | null>(null);
  const [idLabor, setIdLabor] = useState<string | null>(null);
  const [idLoteMineral, setIdLoteMineral] = useState<string | null>(null);
  const [idCliente, setIdCliente] = useState<string | null>(null);
  const [tipoCarga, setTipoCarga] = useState<string | null>(null);
  const [idTarifa, setIdTarifa] = useState<string | null>(null);

  const [modalTarifaOpened, setModalTarifaOpened] = useState(false);
  const [modalHistorialOpened, setModalHistorialOpened] = useState(false);

  // Estados de Fecha y Hora para Horómetro
  const [fechaDia, setFechaDia] = useState<Date | null>(new Date());
  const [horaInicioStr, setHoraInicioStr] = useState<string>("08:00");
  const [horaFinStr, setHoraFinStr] = useState<string>("10:00");

  const refInicio = useRef<HTMLInputElement>(null);
  const refFin = useRef<HTMLInputElement>(null);

  const [lecturaInicio, setLecturaInicio] = useState<number | "">("");
  const [lecturaFin, setLecturaFin] = useState<number | "">("");
  const [cantidadVueltas, setCantidadVueltas] = useState<number | "">(0);
  const [cantidadSacos, setCantidadSacos] = useState<number | "">("");
  const [observacion, setObservacion] = useState("");

  const selectedTarifa = useMemo(() => {
    return tarifas.find((t) => t.id.toString() === idTarifa) || null;
  }, [idTarifa, tarifas]);

  const precioUnitario = selectedTarifa ? Number(selectedTarifa.precio_unitario) : 0;

  // Detecta si la tarifa seleccionada es de material Saco (sin precio)
  const esTarifaSaco = selectedTarifa
    ? (selectedTarifa.tipo_material || "").toLowerCase().includes("saco")
    : false;

  // Load initial data
  useEffect(() => {
    if (!idActivoFijo) return;

    const fetchData = async () => {
      setLoadingData(true);
      try {
        // Fetch Tarifas
        const respTarifas = await ControlUsoService.getTarifas(idActivoFijo);
        if (respTarifas.success) {
          setTarifas(respTarifas.data);

          // Auto-select latest tarifa for the current control type
          const tarifasDeTipo = respTarifas.data.filter((t) => t.tipo_control === tipoControl);
          if (tarifasDeTipo.length > 0) {
            const lastTarifa = tarifasDeTipo.reduce((prev, current) => (prev.id > current.id ? prev : current));
            setIdTarifa(lastTarifa.id.toString());
          } else {
            setIdTarifa(null);
          }
        }

        // Fetch Minas
        const respMinas = await AuxService.get_minas();
        if (respMinas.success) {
          setMinas(respMinas.data.map((m: { id_mina: string | number; nombre: string }) => ({
            value: m.id_mina.toString(),
            label: m.nombre,
          })));
        }

        // Fetch Clientes
        const respClientes = await ClientesService.getClientes();
        // Assuming success format or just array
        if (Array.isArray(respClientes)) {
          setClientes(respClientes.map((c: { id_cliente: string | number; razon_social: string }) => ({
            value: c.id_cliente.toString(),
            label: c.razon_social,
          })));
        }

        // Fetch Lotes Mineral (En Producción)
        const respLotes = await AuxService.get_lotes_mineral();
        if (respLotes.success) {
          setLotesMineral(
            respLotes.data.map((lm: { id_lote_mineral: string | number; codigo: string }) => ({
              value: lm.id_lote_mineral.toString(),
              label: lm.codigo,
            }))
          );
        }

        // Lectura (Odometro o Horometro)
        if (tipoControl === "horometro") {
          const resp = await ControlUsoService.getUltimoHorometro(idActivoFijo);
          if (resp.success) {
            setLecturaInicio(resp.data.ultimo_horometro || "");
            setLecturaFin("");
          }
        } else if (tipoControl === "odometro") {
          const resp = await ControlUsoService.getUltimoOdometro(idActivoFijo);
          if (resp.success) {
            setLecturaInicio(resp.data.ultimo_odometro);
            setLecturaFin(0);
          }
        }
      } catch (err) {
        console.error(err);
        notifyError("Error cargando datos iniciales");
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [idActivoFijo, tipoControl, notifyError]);

  // When Mina changes, fetch Labores
  useEffect(() => {
    if (idMina) {
      const fetchLab = async () => {
        try {
          const resp = await MinasService.getLabores(Number(idMina));
          if (resp.success) {
            setLabores(resp.data.map((l: { id_labor: string | number; nombre: string | null }) => ({
              value: l.id_labor.toString(),
              label: l.nombre || "Sin nombre",
            })));
          }
        } catch (e) {
          console.error(e);
        }
      };
      fetchLab();
    } else {
      setLabores([]);
      setIdLabor(null);
    }
  }, [idMina]);

  // Dynamic naming based on control type
  const labelLectura = tipoControl === "horometro" ? "Horómetro" : tipoControl === "odometro" ? "Odómetro" : "Vueltas";
  const labelDiferencia = tipoControl === "vueltas" ? "Vueltas" : tipoControl === "horometro" ? "Horas" : "Km";
  const unitMeasure = tipoControl === "vueltas" ? "vuelta(s)" : tipoControl === "horometro" ? "hrs" : "Km";

  // Calculations in real time
  const totalUso = useMemo(() => {
    if (tipoControl === "vueltas") {
      return Number(cantidadVueltas) || 0;
    }
    if (tipoControl === "horometro") {
      if (!fechaDia || !horaInicioStr || !horaFinStr) return 0;
      const baseDate = dayjs(fechaDia).format("YYYY-MM-DD");
      const dtInicio = dayjs(`${baseDate} ${horaInicioStr}`);
      let dtFin = dayjs(`${baseDate} ${horaFinStr}`);
      if (!dtInicio.isValid() || !dtFin.isValid()) return 0;
      
      // Si la hora de fin es menor o igual a la de inicio, asumimos que cruzó la medianoche (al día siguiente)
      if (dtFin.isBefore(dtInicio) || dtFin.isSame(dtInicio)) {
        dtFin = dtFin.add(1, "day");
      }
      
      const diffSecs = dtFin.diff(dtInicio, "second");
      if (diffSecs <= 0) return 0;
      return Math.round((diffSecs / 3600) * 100) / 100;
    }
    return Math.max(0, (Number(lecturaFin) || 0) - (Number(lecturaInicio) || 0));
  }, [tipoControl, cantidadVueltas, lecturaInicio, lecturaFin, fechaDia, horaInicioStr, horaFinStr]);

  const costoTotal = useMemo(() => {
    return totalUso * precioUnitario;
  }, [totalUso, precioUnitario]);

  // Handle submit form
  const handleSubmit = async () => {
    if (!idActivoFijo) {
      notifyError("Por favor seleccione un activo fijo.");
      return;
    }

    if (tipoControl === "horometro") {
      if (!fechaDia) {
        notifyError("Por favor seleccione la fecha del trabajo.");
        return;
      }
      if (!horaInicioStr || !horaFinStr) {
        notifyError("Por favor ingrese la hora de inicio y fin.");
        return;
      }
      if (totalUso <= 0) {
        notifyError("La hora de fin debe ser posterior a la hora de inicio.");
        return;
      }

      // Validación opcional de lecturas de horómetro si ambas están presentes
      if (
        lecturaInicio !== "" &&
        lecturaFin !== "" &&
        Number(lecturaFin) <= Number(lecturaInicio)
      ) {
        notifyError(
          "El horómetro final no puede ser menor o igual al horómetro inicial."
        );
        return;
      }
    }

    if (tipoControl === "odometro" && (Number(lecturaFin) || 0) < (Number(lecturaInicio) || 0)) {
      notifyError(
        `La lectura final del ${labelLectura} no puede ser menor a la lectura inicial.`
      );
      return;
    }

    setSaving(true);
    try {
      let dtInicioStr = dayjs().format("YYYY-MM-DD HH:mm:ss");
      let dtFinStr: string | null = null;

      if (tipoControl === "horometro" && fechaDia) {
        const baseDate = dayjs(fechaDia).format("YYYY-MM-DD");
        const dtInicio = dayjs(`${baseDate} ${horaInicioStr}`);
        let dtFin = dayjs(`${baseDate} ${horaFinStr}`);
        
        // Si cruza la medianoche, se le suma 1 día a la fecha fin
        if (dtFin.isBefore(dtInicio) || dtFin.isSame(dtInicio)) {
          dtFin = dtFin.add(1, "day");
        }

        dtInicioStr = dtInicio.format("YYYY-MM-DD HH:mm:ss");
        dtFinStr = dtFin.format("YYYY-MM-DD HH:mm:ss");
      } else {
        dtInicioStr = dayjs().format("YYYY-MM-DD HH:mm:ss");
      }

      const resp = await ControlUsoService.registrarUso({
        id_activo_fijo: idActivoFijo,
        fecha_hora_inicio_control: dtInicioStr,
        fecha_hora_fin_control: dtFinStr,

        horometro_inicio: (tipoControl === "horometro" || tipoControl === "vueltas") && lecturaInicio !== "" ? Number(lecturaInicio) : undefined,
        horometro_fin: (tipoControl === "horometro" || tipoControl === "vueltas") && lecturaFin !== "" ? Number(lecturaFin) : undefined,
        odometro_inicio: tipoControl === "odometro" ? (Number(lecturaInicio) || 0) : undefined,
        odometro_fin: tipoControl === "odometro" ? (Number(lecturaFin) || 0) : undefined,
        cantidad_vueltas: tipoControl === "vueltas" ? (Number(cantidadVueltas) || 0) : undefined,
        cantidad_sacos: tipoControl === "vueltas" && esTarifaSaco && cantidadSacos !== "" ? Number(cantidadSacos) : undefined,

        precio_unitario: precioUnitario,
        id_tarifa: idTarifa ? Number(idTarifa) : undefined,

        // Destino (Mina / Labor) para Horómetro y Vueltas
        es_para_mina: (tipoControl === "horometro" || tipoControl === "vueltas") ? (tipoControl === "vueltas" ? true : esParaMina) : undefined,
        id_mina: (tipoControl === "horometro" || tipoControl === "vueltas") && idMina ? Number(idMina) : undefined,
        id_labor: (tipoControl === "horometro" || tipoControl === "vueltas") && idLabor ? Number(idLabor) : undefined,
        id_lote_mineral: tipoControl === "horometro" && idLoteMineral ? Number(idLoteMineral) : undefined,
        id_cliente: tipoControl === "horometro" && !esParaMina && idCliente ? Number(idCliente) : undefined,
        tipo_carga: tipoControl === "horometro" ? (tipoCarga || undefined) : undefined,

        observacion: observacion ? observacion.trim() : null,
      });

      if (resp.success) {
        const enhancedLog = { ...resp.data };
        if (idMina) enhancedLog.mina = minas.find((m) => m.value === String(idMina))?.label || null;
        if (idLabor) enhancedLog.labor = labores.find((l) => l.value === String(idLabor))?.label || null;
        if (idLoteMineral) enhancedLog.lote_mineral = lotesMineral.find((lm) => lm.value === String(idLoteMineral))?.label || null;
        if (idCliente) enhancedLog.cliente = clientes.find((c) => c.value === String(idCliente))?.label || null;

        if (tipoControl === "vueltas") {
          if (idTarifa) {
            const t = tarifas.find((tar) => tar.id === Number(idTarifa));
            if (t) {
              enhancedLog.tarifa_desc = t.descripcion;
              enhancedLog.tipo_material = t.tipo_material;
              enhancedLog.tarifa_material = t.tipo_material;
              enhancedLog.tarifa_distancia_metros = t.distancia_metros;
            }
          }
          if (esTarifaSaco && cantidadSacos !== "") {
            enhancedLog.cantidad_sacos = Number(cantidadSacos);
          }
        }

        onSuccess(enhancedLog);
      } else {
        notifyError(resp.message || "Error al registrar el control de uso");
      }
    } catch (err) {
      notifyError("Error de conexión al guardar el registro.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack gap="md" className="p-1">
      <div className="relative overflow-hidden bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-4 flex gap-3.5 transition-all">
        <div className="absolute -right-8 -top-8 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
        <div className="flex items-center justify-center shrink-0 w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
          {tipoControl === "horometro" ? (
            <Cog8ToothIcon className="w-5 h-5 text-indigo-400" />
          ) : tipoControl === "odometro" ? (
            <TruckIcon className="w-5 h-5 text-indigo-400" />
          ) : (
            <ArrowPathRoundedSquareIcon className="w-5 h-5 text-indigo-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-500">Activo Fijo</span>
            <Badge size="xs" color="pink" variant="light" className="font-bold shrink-0 border border-pink-500/10">{asset.correlativo}</Badge>
          </div>
          <Text size="sm" fw={800} className="text-white leading-snug truncate">{asset.producto}</Text>
          {(asset.almacen || asset.mina) && (
            <Text size="10px" className="text-zinc-500 mt-1.5 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500/50 animate-pulse" />
              <span className="font-medium">Ubicación:</span>
              <span className="text-zinc-400 font-semibold truncate">{asset.almacen || asset.mina}</span>
            </Text>
          )}
        </div>
      </div>

      {/* Tarifa de Uso (siempre arriba) */}
      <SimpleGrid cols={1} spacing="md">
        <Group gap={6} align="flex-end" wrap="nowrap">
          <Select
            className="flex-1"
            label="Tarifa de Uso"
            placeholder="Seleccione tarifa..."
            data={tarifas
              .filter((t) => t.tipo_control === tipoControl)
              .map((t) => {
                const esSaco = (t.tipo_material || "").toLowerCase().includes("saco");
                if (tipoControl === "vueltas") {
                  const parts = [
                    esSaco ? "Sin precio" : `S/. ${Number(t.precio_unitario).toFixed(2)}`,
                    t.distancia_metros ? `x ${t.distancia_metros}m` : null,
                    t.tipo_material ? `x ${t.tipo_material}` : null,
                  ].filter(Boolean);
                  return { value: t.id.toString(), label: parts.join(" ") };
                }
                return {
                  value: t.id.toString(),
                  label: [
                    `S/. ${Number(t.precio_unitario).toFixed(2)}`,
                    t.tipo_material ? `x ${t.tipo_material}` : null,
                    t.descripcion ? `· ${t.descripcion}` : null,
                  ].filter(Boolean).join(" "),
                };
              })}
            classNames={fieldClasses}
            value={idTarifa}
            onChange={setIdTarifa}
            searchable
            clearable
            radius="lg"
            size="xs"
          />
          <Tooltip label="Historial de Tarifas">
            <ActionIcon
              onClick={() => setModalHistorialOpened(true)}
              variant="light"
              color="zinc.4"
              size={32}
              radius="lg"
              className="mb-[3px] border border-zinc-700/50"
            >
              <QueueListIcon className="w-4 h-4" />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Nueva Tarifa">
            <ActionIcon
              onClick={() => setModalTarifaOpened(true)}
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
      </SimpleGrid>

      {/* Bloque Horas / Lecturas según tipoControl */}
      {tipoControl === "horometro" ? (
        <Stack gap="sm">
          {/* Fila 1: Fecha del Trabajo ocupando el ancho completo de la fila */}
          <CustomDatePicker
            label="Fecha del Trabajo"
            placeholder="Seleccione fecha"
            value={fechaDia}
            onChange={(val) => setFechaDia(val as Date | null)}
            radius="lg"
            size="xs"
          />

          {/* Fila 2: Hora Inicio y Hora Fin usando TimeInput de Mantine con size='xs' */}
          <SimpleGrid cols={2} spacing="md">
            <div>
              <TimeInput
                ref={refInicio}
                label="Hora Inicio"
                placeholder="08:00"
                value={horaInicioStr}
                onChange={(event) => {
                  const val = event.currentTarget.value;
                  const match = /^(\d{2}):(\d{2})(?::\d{2})?$/.exec(val ?? "");
                  const formatted = match ? `${match[1]}:${match[2]}` : "";
                  setHoraInicioStr(formatted);
                }}
                onClick={() => refInicio.current?.showPicker?.()}
                classNames={fieldClasses}
                size="xs"
                radius="lg"
                required
              />
              {horaInicioStr && (
                <Text size="10px" c="blue.4" fw={700} mt={3} className="ml-1">
                  ({dayjs(`2000-01-01 ${horaInicioStr}`).format("hh:mm A")})
                </Text>
              )}
            </div>

            <div>
              <TimeInput
                ref={refFin}
                label="Hora Fin"
                placeholder="10:00"
                value={horaFinStr}
                onChange={(event) => {
                  const val = event.currentTarget.value;
                  const match = /^(\d{2}):(\d{2})(?::\d{2})?$/.exec(val ?? "");
                  const formatted = match ? `${match[1]}:${match[2]}` : "";
                  setHoraFinStr(formatted);
                }}
                onClick={() => refFin.current?.showPicker?.()}
                classNames={fieldClasses}
                size="xs"
                radius="lg"
                required
              />
              {horaFinStr && (
                <Text size="10px" c="blue.4" fw={700} mt={3} className="ml-1">
                  ({dayjs(`2000-01-01 ${horaFinStr}`).format("hh:mm A")})
                  {horaInicioStr && horaFinStr && dayjs(`2000-01-01 ${horaFinStr}`).isBefore(dayjs(`2000-01-01 ${horaInicioStr}`)) && (
                    <span className="text-amber-400 font-bold ml-1">(Día siguiente)</span>
                  )}
                </Text>
              )}
            </div>
          </SimpleGrid>

          {/* Fila 3: Lote Mineral Opcional */}
          <Select
            label="Lote Mineral (Opcional)"
            placeholder="Seleccione lote de mineral..."
            data={lotesMineral}
            value={idLoteMineral}
            onChange={setIdLoteMineral}
            searchable
            clearable
            classNames={fieldClasses}
            radius="lg"
            size="xs"
          />

          {/* Fila 4: Lecturas de Horómetro Opcionales */}
          <SimpleGrid cols={2} spacing="md" className="mt-1 opacity-85">
            <NumberInput
              label="Horómetro Inicial (Opcional)"
              placeholder="Ej: 1250.00"
              value={lecturaInicio}
              onChange={(val) => setLecturaInicio(val as number | "")}
              min={0}
              decimalScale={2}
              fixedDecimalScale
              classNames={fieldClasses}
              size="xs"
              radius="lg"
              disabled={loadingData}
            />
            <NumberInput
              label="Horómetro Final (Opcional)"
              placeholder="Ej: 1252.00"
              value={lecturaFin}
              onChange={(val) => setLecturaFin(val as number | "")}
              min={0}
              decimalScale={2}
              fixedDecimalScale
              classNames={fieldClasses}
              size="xs"
              radius="lg"
              disabled={loadingData}
            />
          </SimpleGrid>
        </Stack>
      ) : tipoControl === "odometro" ? (
        <SimpleGrid cols={2} spacing="md">
          <NumberInput
            label={`${labelLectura} Inicial`}
            value={lecturaInicio}
            onChange={(val) => setLecturaInicio(val as number | "")}
            min={0}
            decimalScale={2}
            fixedDecimalScale
            required
            size="xs"
            radius="lg"
            disabled={loadingData}
          />
          <NumberInput
            label={`${labelLectura} Final`}
            value={lecturaFin}
            onChange={(val) => setLecturaFin(val as number | "")}
            min={0}
            decimalScale={2}
            fixedDecimalScale
            required
            size="xs"
            radius="lg"
            disabled={loadingData}
          />
        </SimpleGrid>
      ) : (
        <Stack gap="md">
          {/* Mina y Labor para Control por Vueltas */}
          <SimpleGrid cols={2} spacing="md">
            <Select
              label="Mina"
              placeholder="Seleccione mina"
              data={minas}
              value={idMina}
              onChange={setIdMina}
              searchable
              required
              classNames={fieldClasses}
              radius="lg"
              size="xs"
            />
            <Select
              label="Labor (Opcional)"
              placeholder="Seleccione labor"
              data={labores}
              value={idLabor}
              onChange={setIdLabor}
              searchable
              clearable
              disabled={!idMina}
              classNames={fieldClasses}
              radius="lg"
              size="xs"
            />
          </SimpleGrid>

          <NumberInput
            label="Cantidad de Vueltas"
            value={cantidadVueltas}
            onChange={(val) => setCantidadVueltas(val as number | "")}
            min={0}
            required
            classNames={fieldClasses}
            size="xs"
            radius="lg"
          />
          {esTarifaSaco && (
            <NumberInput
              label="Cantidad de Sacos"
              placeholder="Ej: 30"
              value={cantidadSacos}
              onChange={(val) => setCantidadSacos(val as number | "")}
              min={0}
              allowDecimal={false}
              required
              classNames={fieldClasses}
              size="xs"
              radius="lg"
              description="Ingrese la cantidad de sacos transportados"
            />
          )}

          {/* Horómetro Inicial y Final Opcionales para Control por Vueltas */}
          <SimpleGrid cols={2} spacing="md" className="opacity-85">
            <NumberInput
              label="Horómetro Inicial (Opcional)"
              placeholder="Ej: 1250.00"
              value={lecturaInicio}
              onChange={(val) => setLecturaInicio(val as number | "")}
              min={0}
              decimalScale={2}
              fixedDecimalScale
              classNames={fieldClasses}
              size="xs"
              radius="lg"
              disabled={loadingData}
            />
            <NumberInput
              label="Horómetro Final (Opcional)"
              placeholder="Ej: 1252.00"
              value={lecturaFin}
              onChange={(val) => setLecturaFin(val as number | "")}
              min={0}
              decimalScale={2}
              fixedDecimalScale
              classNames={fieldClasses}
              size="xs"
              radius="lg"
              disabled={loadingData}
            />
          </SimpleGrid>
        </Stack>
      )}

      <Card
        withBorder
        padding="sm"
        radius="lg"
        className="bg-zinc-950/40 border-zinc-800"
      >
        <Group justify="space-between" align="center">
          <Stack gap={2}>
            <Text size="xs" c="zinc-400" fw={600}>
              Total {labelDiferencia}
            </Text>
            <Group gap={6}>
              <Text size="xl" fw={800} className="text-indigo-400">
                {totalUso.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
              <Text size="xs" c="zinc-500" className="mt-1.5 italic">
                {unitMeasure}
              </Text>
            </Group>
          </Stack>

          <Stack gap={2} align="flex-end">
            <Text size="xs" c="zinc-400" fw={600}>
              Costo Operativo Total
            </Text>
            <Badge
              size="lg"
              variant="gradient"
              gradient={{ from: "indigo.5", to: "indigo.8" }}
              radius="lg"
              fw={800}
              h={32}
              className="px-4"
            >
              S/.{" "}
              {costoTotal.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Badge>
          </Stack>
        </Group>
      </Card>

      {tipoControl === "horometro" && (
        <Card withBorder padding="md" radius="lg" className="bg-zinc-950/20 border-zinc-800/60">
          <Group justify="flex-start" align="center" mb="sm" gap="xs">
            <Text size="xs" fw={600} className="text-zinc-300">
              Destino del Trabajo:
            </Text>
            <SegmentedControl
              value={esParaMina ? "mina" : "terceros"}
              onChange={(value) => setEsParaMina(value === "mina")}
              data={[
                {
                  value: "mina",
                  label: (
                    <Center style={{ gap: 6 }}>
                      <MapPinIcon className="w-4 h-4" />
                      <Box>En Mina</Box>
                    </Center>
                  ),
                },
                {
                  value: "terceros",
                  label: (
                    <Center style={{ gap: 6 }}>
                      <BriefcaseIcon className="w-4 h-4" />
                      <Box>Para Terceros</Box>
                    </Center>
                  ),
                },
              ]}
              radius="md"
              size="xs"
              classNames={{
                root: "bg-zinc-900/50 border border-zinc-800",
                control: "border-none",
                indicator: "bg-indigo-600",
                label: "text-zinc-400 data-[active]:text-white font-bold",
              }}
            />
          </Group>

          <SimpleGrid cols={esParaMina ? 2 : 1} spacing="md" mt="md">
            {esParaMina ? (
              <>
                <Select
                  label="Mina"
                  placeholder="Seleccione mina"
                  data={minas}
                  value={idMina}
                  onChange={setIdMina}
                  searchable
                  required
                  classNames={fieldClasses}
                  radius="lg"
                  size="xs"
                />
                <Select
                  label="Labor (Opcional)"
                  placeholder="Seleccione labor"
                  data={labores}
                  value={idLabor}
                  onChange={setIdLabor}
                  searchable
                  clearable
                  disabled={!idMina}
                  classNames={fieldClasses}
                  radius="lg"
                  size="xs"
                />
              </>
            ) : (
              <Select
                label="Cliente"
                placeholder="Seleccione cliente"
                data={clientes}
                value={idCliente}
                onChange={setIdCliente}
                searchable
                required
                classNames={fieldClasses}
                radius="lg"
                size="xs"
              />
            )}
          </SimpleGrid>
        </Card>
      )}

      {tipoControl === "horometro" && (
        <SimpleGrid cols={1} spacing="md">
          <Select
            label="Tipo de Carga"
            placeholder="Seleccione..."
            data={["Arrumaje de Mineral", "Carguio de Mineral"]}
            value={tipoCarga}
            onChange={setTipoCarga}
            clearable
            classNames={fieldClasses}
            radius="lg"
            size="xs"
          />
        </SimpleGrid>
      )}

      <Textarea
        label="Observación"
        placeholder="Ingrese notas u observaciones..."
        value={observacion}
        onChange={(e) => setObservacion(e.target.value)}
        classNames={fieldClasses}
        size="xs"
        radius="lg"
        minRows={2}
      />

      <Group justify="flex-end" mt="lg" gap="xs">
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
          color="indigo"
          onClick={handleSubmit}
          loading={saving}
          size="xs"
          radius="lg"
        >
          Guardar Control
        </Button>
      </Group>

      <ModalEstandar
        opened={modalTarifaOpened}
        close={() => setModalTarifaOpened(false)}
        title={`Tarifas por uso - ${tipoControl.charAt(0).toUpperCase() + tipoControl.slice(1)
          }`}
        size="sm"
      >
        <NuevaTarifaModal
          asset={asset}
          initialTipoControl={tipoControl}
          onCancel={() => setModalTarifaOpened(false)}
          onSuccess={async (nuevaTarifa) => {
            // Recargamos todas las tarifas para obtener los datos completos (con tipo_material via JOIN)
            try {
              const respTarifas = await ControlUsoService.getTarifas(idActivoFijo);
              if (respTarifas.success) {
                setTarifas(respTarifas.data);
              } else {
                setTarifas((prev) => [...prev, nuevaTarifa]);
              }
            } catch {
              setTarifas((prev) => [...prev, nuevaTarifa]);
            }
            setIdTarifa(nuevaTarifa.id.toString());
            setModalTarifaOpened(false);
          }}
        />
      </ModalEstandar>

      {/* Historial de Tarifas Modal */}
      <ModalEstandar
        opened={modalHistorialOpened}
        close={() => setModalHistorialOpened(false)}
        title={`Historial de Tarifas - ${tipoControl.charAt(0).toUpperCase() + tipoControl.slice(1)
          }`}
        size="xl"
      >
        <div className="mt-2 h-[350px]">
          <DataTableEstandar
            idAccessor="id"
            loading={false}
            records={tarifas
              .filter((t) => t.tipo_control === tipoControl)
              .sort((a, b) => b.id - a.id)}
            columns={[
              {
                accessor: "id",
                title: "#",
                width: 50,
                render: (_record, index) => (
                  <span className="text-zinc-500 text-xs font-mono">{(index ?? 0) + 1}</span>
                ),
              },
              {
                accessor: "precio_unitario",
                title: "Precio Unit.",
                render: (record) => {
                  if (Number(record.precio_unitario) === 0) {
                    return <span className="text-zinc-600 text-xs italic">Sin precio</span>;
                  }
                  return (
                    <Badge color="violet" variant="filled" size="sm" radius="sm">
                      S/. {Number(record.precio_unitario).toFixed(2)}
                    </Badge>
                  );
                },
              },
              // Columna Distancia: solo en Vueltas
              ...(tipoControl === "vueltas"
                ? [{
                  accessor: "distancia_metros",
                  title: "Distancia hasta",
                  render: (record: typeof tarifas[0]) =>
                    record.distancia_metros ? (
                      <Badge size="xs" color="teal" variant="filled">
                        {record.distancia_metros} m.
                      </Badge>
                    ) : (
                      <span className="text-zinc-600 text-xs italic">—</span>
                    ),
                }]
                : []),
              // Columna Material: solo en Vueltas
              ...(tipoControl === "vueltas"
                ? [{
                  accessor: "tipo_material",
                  title: "Material",
                  render: (record: typeof tarifas[0]) =>
                    record.tipo_material ? (
                      <Badge size="xs" color="pink" variant="filled">
                        {record.tipo_material}
                      </Badge>
                    ) : (
                      <span className="text-zinc-600 text-xs italic">—</span>
                    ),
                }]
                : []),
              {
                accessor: "descripcion",
                title: "Descripción",
                render: (record) =>
                  record.descripcion ? (
                    <span className="text-zinc-400 text-xs">{record.descripcion}</span>
                  ) : (
                    <span className="text-zinc-600 text-xs italic">Sin descripción</span>
                  ),
              },
              {
                accessor: "created_at",
                title: "Fecha Creación",
                render: (record) => (
                  <span className="text-zinc-400 text-xs">
                    {dayjs(record.created_at).format("DD MMM YYYY, HH:mm")}
                  </span>
                ),
              },
            ]}
          />
        </div>
      </ModalEstandar>
    </Stack>
  );
};

export default RegistroUso;
