import { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Button,
  Group,
  Stack,
  Text,
  Select,
  Card,
  Badge,
  Table,
} from "@mantine/core";
import {
  WrenchScrewdriverIcon,
  ChevronDownIcon,
  MapPinIcon,
  CalendarDaysIcon,
  PlusIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { useTitlePage } from "../../../hooks/useTitlePage";
import { useMantenimiento } from "../hooks/_useMantenimiento";
import { RegistroMantenimiento } from "./registro-mantenimiento";
import { formatNumber } from "../../../shared/functions/formatNumber";
import dayjs from "dayjs";
import { MESES } from "../../../shared/variables/meses";

export const MantenimientoPage = () => {
  useTitlePage("Mantenimiento de Activos");
  const location = useLocation();
  const redirectActivoId = location.state?.id_activo
    ? Number(location.state.id_activo)
    : null;

  const [isRegistrando, setIsRegistrando] = useState(!!redirectActivoId);
  const [expandedRecordIds, setExpandedRecordIds] = useState<number[]>([]);

  const {
    state: {
      mes,
      setMes,
      yearcito,
      setYearcito,
      idActivoFijo,
      setIdActivoFijo,
      mantenimientos,
      activos,
    },
    status: { loading, loadingActivos },
    actions: { fetchMantenimientos },
  } = useMantenimiento();

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => {
    const y = currentYear - i;
    return { value: String(y), label: String(y) };
  });

  const inputClasses = {
    input:
      "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500 transition-all",
    label: "text-zinc-400 text-xs font-semibold mb-1 ml-1",
    dropdown:
      "bg-zinc-950 border-zinc-800 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl",
    option:
      "text-zinc-300 hover:bg-zinc-800 hover:text-white data-[selected]:bg-indigo-600 data-[selected]:text-white font-medium transition-colors",
  };

  if (isRegistrando) {
    return (
      <Stack gap="lg" className="animate-fade-in text-zinc-100">
        <div className="flex justify-between items-center pb-4 border-b border-zinc-800/80">
          <Group gap="xs">
            <div className="p-2.5 rounded-xl bg-linear-to-br from-indigo-500/20 to-indigo-600/5 border border-indigo-500/20 shadow-inner">
              <WrenchScrewdriverIcon className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <Text
                size="lg"
                fw={900}
                className="text-white tracking-tight leading-none"
              >
                Registrar Mantenimiento
              </Text>
              <Text size="xs" c="dimmed" mt={2} className="font-semibold">
                Declare las actividades, gastos y consumos realizados.
              </Text>
            </div>
          </Group>
        </div>

        <RegistroMantenimiento
          initialActivoId={redirectActivoId}
          onSuccess={() => {
            setIsRegistrando(false);
            fetchMantenimientos();
          }}
          onCancel={() => setIsRegistrando(false)}
        />
      </Stack>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in text-zinc-100">
      {/* Filtros Principales y Buscador */}
      <div className="flex flex-col md:flex-row items-end gap-3 w-full">
        {/* Mes */}
        <div className="w-full md:w-40">
          <Select
            label="Mes"
            placeholder="Mes..."
            data={MESES}
            value={String(mes)}
            onChange={(val) => setMes(Number(val))}
            classNames={inputClasses}
            radius="lg"
            size="sm"
            leftSection={<CalendarDaysIcon className="w-4 h-4 text-zinc-400" />}
          />
        </div>

        {/* Año */}
        <div className="w-full md:w-32">
          <Select
            label="Año"
            placeholder="Año..."
            data={years}
            value={String(yearcito)}
            onChange={(val) => setYearcito(Number(val))}
            classNames={inputClasses}
            radius="lg"
            size="sm"
            leftSection={<CalendarDaysIcon className="w-4 h-4 text-zinc-400" />}
          />
        </div>

        {/* Activo Fijo */}
        <div className="flex-1 min-w-[240px] w-full">
          <Select
            label="Activo Fijo (opcional)"
            placeholder={
              loadingActivos ? "Cargando activos..." : "Filtrar por activo..."
            }
            data={activos.map((a) => ({
              value: String(a.id_activo),
              label: `${a.correlativo} - ${a.producto}`,
            }))}
            value={idActivoFijo ? String(idActivoFijo) : null}
            onChange={(val) => setIdActivoFijo(val ? Number(val) : null)}
            searchable
            clearable
            radius="lg"
            size="sm"
            classNames={inputClasses}
            leftSection={
              <WrenchScrewdriverIcon className="w-4 h-4 text-zinc-400" />
            }
          />
        </div>

        {/* Botón Registrar */}
        <div className="shrink-0">
          <Button
            leftSection={<PlusIcon className="w-5 h-5" />}
            onClick={() => setIsRegistrando(true)}
            radius="lg"
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20 px-6 font-semibold h-[38px] transition-all"
          >
            Registrar Mantenimiento
          </Button>
        </div>
      </div>

      {/* Content list */}
      {loading ? (
        <Stack align="center" gap="md" py={100}>
          <div className="relative">
            <div className="size-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
            <WrenchScrewdriverIcon className="size-6 text-indigo-400 absolute inset-0 m-auto animate-pulse" />
          </div>
          <Text
            size="xs"
            fw={900}
            className="uppercase tracking-[0.3em] text-zinc-500"
          >
            Buscando Mantenimientos...
          </Text>
        </Stack>
      ) : mantenimientos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-zinc-900/20 rounded-4xl border border-dashed border-zinc-800 backdrop-blur-sm animate-fade-in">
          <WrenchScrewdriverIcon className="size-12 text-zinc-700 mb-4 animate-pulse" />
          <Text
            size="sm"
            fw={800}
            className="text-zinc-400 uppercase tracking-widest"
          >
            Sin mantenimientos registrados
          </Text>
          <Text size="xs" c="dimmed" className="mt-1 max-w-xs text-center">
            No se encontraron mantenimientos para el periodo seleccionado.
            ¡Declare uno nuevo usando el botón superior!
          </Text>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {mantenimientos.map((m) => {
            const gastos: { concepto: string; costo: number }[] =
              typeof m.otros_gastos === "string"
                ? JSON.parse(m.otros_gastos)
                : Array.isArray(m.otros_gastos)
                  ? m.otros_gastos
                  : [];

            const evids: string[] =
              typeof m.evidencias === "string"
                ? JSON.parse(m.evidencias)
                : m.evidencias || [];

            const isExpanded = expandedRecordIds.includes(m.id_mantenimiento);

            return (
              <Card
                key={m.id_mantenimiento}
                radius="24px"
                className="bg-zinc-900/40 border border-zinc-800/85 hover:border-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-900/10 shadow-xl transition-all duration-300 flex flex-col gap-4 p-5 backdrop-blur-sm group relative overflow-hidden"
              >
                {/* Card Header */}
                <div className="flex justify-between items-start border-b border-zinc-800/60 pb-3 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                      <WrenchScrewdriverIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <Text
                        size="sm"
                        fw={900}
                        className="text-white tracking-tight leading-none group-hover:text-indigo-300 transition-colors"
                      >
                        {m.producto_activo_fijo}
                      </Text>
                      <Text
                        size="10px"
                        className="font-mono text-zinc-500 mt-1 block"
                      >
                        {m.correlativo_activo_fijo}{" "}
                        {m.codigo_activo_fijo
                          ? `[${m.codigo_activo_fijo}]`
                          : ""}
                      </Text>
                    </div>
                  </div>
                  <Badge
                    color={m.id_proveedor ? "orange" : "teal"}
                    variant="light"
                    size="xs"
                    className="font-extrabold uppercase tracking-wider py-1 px-2 shrink-0"
                  >
                    {m.id_proveedor ? "Externo" : "Interno"}
                  </Badge>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs bg-zinc-950/20 p-3.5 rounded-2xl border border-zinc-800/30">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] text-zinc-500 font-black uppercase tracking-wider">
                      Fecha / Hora
                    </span>
                    <span className="text-zinc-300 font-bold font-mono">
                      {dayjs(m.fecha_hora_mantenimiento).format(
                        "DD/MM/YYYY HH:mm",
                      )}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] text-zinc-500 font-black uppercase tracking-wider">
                      Lugar
                    </span>
                    <span className="text-zinc-300 font-bold truncate flex items-center gap-1">
                      <MapPinIcon className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      {m.lugar_trabajo || "No indicado"}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5 col-span-2 border-t border-zinc-800/40 pt-2 mt-1">
                    <span className="text-[9px] text-zinc-500 font-black uppercase tracking-wider">
                      Ejecutor
                    </span>
                    <span className="text-zinc-300 font-bold truncate">
                      {m.ejecutor_nombre ||
                        m.proveedor_razon_social ||
                        "No indicado"}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5 col-span-2 border-t border-zinc-800/40 pt-2 mt-1">
                    <span className="text-[9px] text-zinc-500 font-black uppercase tracking-wider">
                      Supervisor
                    </span>
                    <span className="text-zinc-300 font-bold truncate">
                      {m.supervisor_nombre || "No asignado"}
                    </span>
                  </div>
                </div>

                {/* Costs & Collapse Controls */}
                <div className="flex justify-between items-center border-t border-zinc-800/40 pt-3 mt-auto">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-zinc-500 font-black uppercase tracking-wider">
                      Costo Mano de Obra
                    </span>
                    <span className="text-sm font-extrabold text-white font-mono">
                      {m.costo_mano_obra !== null
                        ? `$${formatNumber(Number(m.costo_mano_obra))}`
                        : "-"}
                    </span>
                  </div>

                  <Button
                    size="xs"
                    variant="subtle"
                    color="indigo"
                    rightSection={
                      <ChevronDownIcon
                        className={`w-3.5 h-3.5 transition-transform duration-250 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    }
                    onClick={() =>
                      setExpandedRecordIds((prev) =>
                        isExpanded
                          ? prev.filter((id) => id !== m.id_mantenimiento)
                          : [...prev, m.id_mantenimiento],
                      )
                    }
                    className="font-bold text-xs hover:bg-zinc-800/40 px-3 py-1.5 h-8 rounded-lg"
                  >
                    {isExpanded ? "Ocultar" : "Detalles"}
                  </Button>
                </div>

                {/* Collapsed content */}
                {isExpanded && (
                  <div className="mt-2 pt-4 border-t border-zinc-800/60 flex flex-col gap-4 animate-fade-in">
                    {/* Diagnosis / Observacion */}
                    {m.observacion && (
                      <div className="flex flex-col gap-1.5 bg-zinc-950/35 p-3 rounded-xl border border-zinc-800/30">
                        <span className="text-[9px] text-zinc-500 font-black uppercase tracking-wider">
                          Observaciones / Diagnóstico
                        </span>
                        <p className="text-xs text-zinc-300 italic m-0 font-medium leading-relaxed">
                          "{m.observacion}"
                        </p>
                      </div>
                    )}

                    {/* Gastos Adicionales table */}
                    <div className="flex flex-col gap-2">
                      <span className="text-[9px] text-zinc-500 font-black uppercase tracking-wider">
                        Gastos Adicionales ({gastos.length})
                      </span>
                      {gastos.length === 0 ? (
                        <Text size="xs" c="dimmed" className="italic pl-1">
                          Sin gastos adicionales.
                        </Text>
                      ) : (
                        <div className="border border-zinc-800/60 rounded-xl overflow-hidden bg-zinc-950/20">
                          <Table
                            variant="unstyled"
                            className="w-full text-zinc-300 text-xs"
                          >
                            <thead className="bg-zinc-950 font-bold border-b border-zinc-800/50">
                              <tr>
                                <th className="px-3 py-1.5 text-left">
                                  Concepto
                                </th>
                                <th className="px-3 py-1.5 text-right w-24">
                                  Costo
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-900 bg-zinc-900/10">
                              {gastos.map((g, idx) => (
                                <tr
                                  key={idx}
                                  className="hover:bg-white/5 transition-colors"
                                >
                                  <td className="px-3 py-1.5 font-medium">
                                    {g.concepto}
                                  </td>
                                  <td className="px-3 py-1.5 text-right font-mono font-bold text-white">
                                    ${formatNumber(Number(g.costo))}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </div>
                      )}
                    </div>

                    {/* Evidencias files list */}
                    <div className="flex flex-col gap-2">
                      <span className="text-[9px] text-zinc-500 font-black uppercase tracking-wider">
                        Documentos y Evidencias ({evids.length})
                      </span>
                      {evids.length === 0 ? (
                        <Text size="xs" c="dimmed" className="italic pl-1">
                          Sin archivos adjuntos.
                        </Text>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {evids.map((url, idx) => {
                            const fileName = url.substring(
                              url.lastIndexOf("/") + 1,
                            );
                            return (
                              <a
                                key={idx}
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/50 hover:bg-zinc-800/80 hover:border-zinc-700/50 text-zinc-300 hover:text-white transition-all"
                              >
                                <DocumentTextIcon className="w-4 h-4 text-indigo-400 shrink-0" />
                                <Text
                                  size="xs"
                                  className="truncate flex-1 font-semibold"
                                >
                                  {fileName}
                                </Text>
                              </a>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
