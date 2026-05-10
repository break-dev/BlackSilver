import { useState, useEffect } from "react";
import {
  Stack,
  Text,
  Group,
  Paper,
  Badge,
  Loader,
  Collapse,
  Divider,
} from "@mantine/core";
import {
  DocumentTextIcon,
  PaperClipIcon,
  UserIcon,
  CalendarIcon,
  BanknotesIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";
import type { RES_OCComprobante } from "../../../../service/responses/ordenes-compra/orden-compra-comprobante";
import { OrdenCompraService } from "../../service/orden-compra.service";
import { ArchivoCard } from "../../../../presentation/utils/archivo/archivo-card";
import { CalendarDaysIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import dayjs from "dayjs";

interface Props {
  idOrdenCompra: number;
}

export const ListadoComprobantesOC = ({ idOrdenCompra }: Props) => {
  const [comprobantes, setComprobantes] = useState<RES_OCComprobante[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Record<number, boolean>>({});

  useEffect(() => {
    let isMounted = true;
    OrdenCompraService.getComprobantes(idOrdenCompra)
      .then((res) => {
        if (isMounted && res.success && res.data) {
          setComprobantes(res.data);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [idOrdenCompra]);

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader color="indigo" size="lg" />
      </div>
    );
  }

  if (comprobantes.length === 0) {
    return (
      <div className="text-center flex flex-col items-center gap-3 py-12">
        <div className="p-4 bg-zinc-900/30 rounded-full border border-zinc-800/50">
          <CalendarDaysIcon className="w-8 h-8 text-zinc-600" />
        </div>
        <Text c="zinc.5" size="sm" fw={600}>
          Aún no se han registrado comprobantes de pago para esta orden de
          compra.
        </Text>
      </div>
    );
  }

  return (
    <Stack
      gap="xl"
      className="font-sans pt-2 pb-6 max-h-[70vh] overflow-y-auto px-2"
    >
      {comprobantes.map((c, index) => {
        const expanded = expandedIds[c.id_comprobante] ?? index === 0;
        const symbol = c.moneda === "Soles" ? "S/ " : "$ ";

        return (
          <Paper
            key={c.id_comprobante}
            radius="xl"
            className="bg-zinc-900/30 border border-zinc-800/80 shadow-[0_4px_30px_rgba(0,0,0,0.1)] transition-all hover:bg-zinc-900/50 hover:border-indigo-500/20 group relative overflow-hidden p-4 shrink-0"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-cyan-500/20 via-indigo-500/40 to-indigo-500/5 group-hover:from-cyan-500/40 group-hover:via-indigo-500/60 transition-colors" />

            <Group
              justify="space-between"
              align="center"
              className="cursor-pointer"
              onClick={() => toggleExpand(c.id_comprobante)}
            >
              <Group gap="md">
                <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                  <DocumentTextIcon className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <Text
                    fw={900}
                    size="lg"
                    className="text-white tracking-tight leading-tight"
                  >
                    {c.tipo_comprobante} {c.serie}-{c.numero}
                  </Text>
                  <Group gap="xs" mt={2}>
                    <CalendarIcon className="w-3.5 h-3.5 text-zinc-500" />
                    <Text
                      size="xs"
                      c="zinc.5"
                      fw={700}
                      className="uppercase tracking-widest"
                    >
                      Emisión: {dayjs(c.fecha_emision).format("DD MMM YYYY")}
                    </Text>
                  </Group>
                </div>
              </Group>

              <Group gap="lg">
                <div className="text-right hidden sm:block">
                  <Text
                    size="10px"
                    fw={900}
                    c="zinc.5"
                    className="uppercase tracking-[0.2em] mb-1"
                  >
                    Total Comprobante
                  </Text>
                  <Text
                    fw={900}
                    size="xl"
                    className="text-indigo-400 tracking-tighter"
                  >
                    {symbol}{" "}
                    {Number(c.total_despues_igv).toLocaleString("es-PE", {
                      minimumFractionDigits: 2,
                    })}
                  </Text>
                </div>
                <Badge
                  variant="light"
                  color={c.estado === "Generado" ? "indigo" : "emerald"}
                  radius="md"
                  size="sm"
                  className="font-black py-3 px-4 uppercase tracking-widest border border-indigo-500/20"
                >
                  {c.estado}
                </Badge>
                <div className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500">
                  {expanded ? (
                    <ChevronUpIcon size={20} />
                  ) : (
                    <ChevronDownIcon size={20} />
                  )}
                </div>
              </Group>
            </Group>

            <Collapse in={expanded}>
              <div className="mt-5 pt-5 border-t border-zinc-800/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Información Financiera */}
                  <Stack gap="md">
                    <Group gap="xs">
                      <BanknotesIcon className="w-4 h-4 text-zinc-500" />
                      <Text
                        size="xs"
                        fw={900}
                        c="zinc.4"
                        className="uppercase tracking-widest"
                      >
                        Resumen Financiero
                      </Text>
                    </Group>
                    <Paper className="bg-zinc-950/40 border border-zinc-800/40 p-4 rounded-2xl shadow-inner">
                      <Stack gap="xs">
                        <Group justify="space-between">
                          <Text size="xs" c="zinc.5" fw={600}>
                            Total Antes IGV
                          </Text>
                          <Text size="sm" fw={800} c="zinc.2">
                            {symbol}{" "}
                            {Number(c.total_antes_igv).toLocaleString("es-PE", {
                              minimumFractionDigits: 2,
                            })}
                          </Text>
                        </Group>
                        <Group justify="space-between">
                          <Text size="xs" c="zinc.5" fw={600}>
                            IGV ({c.porcentaje_igv}%)
                          </Text>
                          <Text size="sm" fw={800} c="indigo.4">
                            +{symbol}{" "}
                            {Number(c.monto_igv).toLocaleString("es-PE", {
                              minimumFractionDigits: 2,
                            })}
                          </Text>
                        </Group>
                        <Divider my={4} color="zinc.8" />
                        <Group justify="space-between">
                          <Text size="sm" fw={900} c="zinc.1">
                            Total Después IGV
                          </Text>
                          <Text size="lg" fw={900} className="text-white">
                            {symbol}{" "}
                            {Number(c.total_despues_igv).toLocaleString(
                              "es-PE",
                              { minimumFractionDigits: 2 },
                            )}
                          </Text>
                        </Group>
                        {c.moneda !== "Soles" && (
                          <div className="mt-3 p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
                            <Group justify="space-between">
                              <Text
                                size="xs"
                                c="zinc.5"
                                fw={800}
                                className="uppercase tracking-tighter"
                              >
                                Tipo Cambio Venta
                              </Text>
                              <Text size="xs" fw={900} c="amber.5">
                                S/{" "}
                                {Number(c.tipo_cambio_venta_aplicado).toFixed(
                                  3,
                                )}
                              </Text>
                            </Group>
                            <Group justify="space-between" mt={4}>
                              <Text
                                size="xs"
                                c="zinc.5"
                                fw={800}
                                className="uppercase tracking-tighter"
                              >
                                Equivalente Soles
                              </Text>
                              <Text size="sm" fw={900} c="zinc.2">
                                S/{" "}
                                {Number(
                                  c.total_despues_igv_soles,
                                ).toLocaleString("es-PE", {
                                  minimumFractionDigits: 2,
                                })}
                              </Text>
                            </Group>
                          </div>
                        )}
                      </Stack>
                    </Paper>
                  </Stack>

                  {/* Detalles del Registro y Recepciones */}
                  <Stack gap="md">
                    <Group gap="xs">
                      <UserIcon className="w-4 h-4 text-zinc-500" />
                      <Text
                        size="xs"
                        fw={900}
                        c="zinc.4"
                        className="uppercase tracking-widest"
                      >
                        Registro y Trazabilidad
                      </Text>
                    </Group>
                    <Stack gap="xs">
                      <Paper className="bg-zinc-950/20 border border-zinc-800/40 p-3 rounded-xl">
                        <Group gap="sm">
                          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">
                            {c.empleado_registro.substring(0, 1)}
                          </div>
                          <div>
                            <Text
                              size="xs"
                              c="zinc.5"
                              fw={700}
                              className="uppercase text-[9px] tracking-widest"
                            >
                              Registrado por
                            </Text>
                            <Text size="sm" fw={800} c="zinc.2">
                              {c.empleado_registro}
                            </Text>
                          </div>
                        </Group>
                      </Paper>

                      <Group gap="xs" mt="sm">
                        <LinkIcon className="w-4 h-4 text-zinc-500" />
                        <Text
                          size="xs"
                          fw={900}
                          c="zinc.4"
                          className="uppercase tracking-widest"
                        >
                          Recepciones Vinculadas
                        </Text>
                      </Group>
                      <Group gap="xs">
                        {c.recepciones_agrupadas.map((r) => (
                          <Badge
                            key={r.id_orden_compra_recepcion}
                            variant="light"
                            color="indigo"
                            radius="md"
                            size="sm"
                            className="font-bold border border-indigo-500/10 px-3"
                          >
                            Rec. #{r.numero_correlativo}
                          </Badge>
                        ))}
                      </Group>
                    </Stack>
                  </Stack>
                </div>

                {c.observacion && (
                  <div className="mt-8 bg-zinc-950/40 rounded-xl p-4 border border-zinc-800/40 flex gap-3 items-start shadow-inner">
                    <Text
                      size="sm"
                      c="zinc.3"
                      className="italic max-w-4xl leading-relaxed"
                    >
                      "{c.observacion}"
                    </Text>
                  </div>
                )}

                {c.evidencias && c.evidencias.length > 0 && (
                  <div className="mt-8">
                    <Group gap="xs" mb="md">
                      <PaperClipIcon className="w-4 h-4 text-zinc-500" />
                      <Text
                        size="xs"
                        fw={900}
                        c="zinc.4"
                        className="uppercase tracking-widest"
                      >
                        Documentos Adjuntos ({c.evidencias.length})
                      </Text>
                    </Group>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {c.evidencias.map((ev, idx) => (
                        <ArchivoCard
                          key={`${c.id_comprobante}-ev-${idx}`}
                          archivo={ev}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Collapse>
          </Paper>
        );
      })}
    </Stack>
  );
};
