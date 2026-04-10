import { useState } from "react";
import { 
  Stack, 
  Group, 
  Button, 
  Text, 
  Title, 
  Badge, 
  Table, 
  Paper, 
  Loader,
  Tooltip,
  ActionIcon,
  Divider
} from "@mantine/core";
import { 
  DocumentPlusIcon, 
  EyeIcon, 
  CircleStackIcon,
  CalendarDaysIcon,
  TagIcon
} from "@heroicons/react/24/outline";
import { useCotizaciones } from "../hooks/useCotizaciones";
import { RegistroCotizacion } from "./registro-cotizacion";
import { EstadoCotizacion } from "../../../shared/enums/estados";
import type { RES_Cotizacion } from "../service/cotizaciones.responses";

interface GruposCotizacion {
  [key: number]: RES_Cotizacion[];
}

export default function CotizacionesPage() {
  const [view, setView] = useState<"list" | "create">("list");
  const { cotizaciones, loading, refresh } = useCotizaciones();

  // Agrupamos las cotizaciones por comparativo para mostrarlas "juntas"
  const grupos = cotizaciones.reduce((acc: GruposCotizacion, curr) => {
    if (!acc[curr.id_comparativo]) acc[curr.id_comparativo] = [];
    acc[curr.id_comparativo].push(curr);
    return acc;
  }, {});

  if (view === "create") {
    return (
      <div className="p-6">
        <RegistroCotizacion 
          onSuccess={() => { setView("list"); refresh(); }} 
          onCancel={() => setView("list")} 
        />
      </div>
    );
  }

  return (
    <Stack gap="xl" className="p-8 max-w-[1600px] mx-auto">
      {/* Header Principal */}
      <Group justify="space-between" align="center">
        <Stack gap={0}>
          <Title order={1} className="text-white tracking-tighter text-4xl">Cotizaciones</Title>
          <Text size="sm" className="text-zinc-500">Gestión de comparativos y ofertas de proveedores</Text>
        </Stack>

        <Button 
          leftSection={<DocumentPlusIcon className="w-5 h-5" />}
          onClick={() => setView("create")}
          radius="xl"
          size="md"
          className="bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-900/30 px-8 transition-all hover:scale-105"
        >
          Nuevo Comparativo
        </Button>
      </Group>

      {/* Listado con Agrupación */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <Loader color="indigo" size="lg" type="dots" />
          <Text size="sm" className="text-zinc-500 animate-pulse font-medium">Cargando comparativos...</Text>
        </div>
      ) : Object.keys(grupos).length === 0 ? (
        <Paper p={60} radius="3.5rem" className="bg-zinc-900/10 border-2 border-dashed border-zinc-800 flex flex-col items-center gap-4">
          <CircleStackIcon className="w-16 h-16 text-zinc-800" />
          <Text size="lg" fw={700} className="text-zinc-600">No se encontraron cotizaciones</Text>
          <Button variant="subtle" color="indigo" onClick={() => setView("create")}>Crear la primera ahora</Button>
        </Paper>
      ) : (
        <Stack gap="2.5rem">
          {Object.entries(grupos).map(([idComp, cots]) => (
            <Paper key={idComp} p="xl" radius="3rem" className="bg-zinc-900/20 border border-zinc-800/50 backdrop-blur-sm hover:border-zinc-700/50 transition-all overflow-hidden relative group">
              {/* Decoración lateral para indicar agrupación */}
              <div className="absolute left-0 top-0 bottom-0 w-2 bg-indigo-600/30 group-hover:bg-indigo-600 transition-colors" />
              
              <Stack gap="lg">
                <Group justify="space-between">
                  <Group gap="xl">
                    <Stack gap={0}>
                      <Text size="xs" fw={800} className="text-indigo-400 uppercase tracking-widest mb-1">Comparativo</Text>
                      <Title order={3} className="text-white">#{idComp}</Title>
                    </Stack>
                    <Divider orientation="vertical" className="border-zinc-800" />
                    <Stack gap={0}>
                      <Text size="xs" fw={800} className="text-zinc-500 uppercase tracking-widest mb-1">Fecha Registro</Text>
                      <Group gap={6}>
                        <CalendarDaysIcon className="w-4 h-4 text-zinc-500" />
                        <Text size="sm" fw={600} className="text-zinc-300">{new Date(cots[0].comparativo_fecha).toLocaleDateString()}</Text>
                      </Group>
                    </Stack>
                  </Group>
                  <Badge variant="light" color="indigo" size="lg" radius="lg" className="border border-indigo-500/30">
                    {cots.length} Cotizaciones
                  </Badge>
                </Group>

                <div className="rounded-3xl overflow-hidden border border-zinc-800/50 bg-zinc-950/40">
                  <Table verticalSpacing="md" className="text-zinc-300">
                    <Table.Thead className="bg-zinc-900/50">
                      <Table.Tr>
                        <Table.Th>Correlativo</Table.Th>
                        <Table.Th>Proveedor</Table.Th>
                        <Table.Th>Moneda</Table.Th>
                        <Table.Th>Total (inc. IGV)</Table.Th>
                        <Table.Th>Estado</Table.Th>
                        <Table.Th style={{ width: 80 }}></Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {cots.map((cot: RES_Cotizacion) => (
                        <Table.Tr key={cot.id} className="hover:bg-zinc-800/20 transition-all border-b border-zinc-900">
                          <Table.Td>
                            <Group gap="xs">
                              <TagIcon className="w-4 h-4 text-emerald-500" />
                              <Text size="sm" fw={700} className="font-mono">{cot.correlativo}</Text>
                            </Group>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm" fw={600}>{cot.proveedor_nombre}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="xs" className="text-zinc-500">{cot.moneda}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm" fw={800} className="text-zinc-100">
                                {cot.total_despues_igv.toLocaleString('es-PE', { style: 'currency', currency: cot.moneda === 'Soles' ? 'PEN' : 'USD' })}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Badge 
                              variant="dot" 
                              color={cot.estado === EstadoCotizacion.Aprobada ? "green" : cot.estado === EstadoCotizacion.Desestimada ? "red" : "blue"}
                              radius="sm"
                              size="sm"
                            >
                              {cot.estado}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Tooltip label="Ver Detalle">
                              <ActionIcon variant="subtle" color="indigo" radius="md">
                                <EyeIcon className="w-4 h-4" />
                              </ActionIcon>
                            </Tooltip>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </div>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
