import {
  Stack,
  Text,
  Badge,
  ActionIcon,
  Paper,
  Group,
  Divider,
  Button,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  ClipboardDocumentListIcon,
  ArrowPathIcon,
  ChevronRightIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";

import { useCotizaciones } from "../hooks/useCotizaciones";
import { useTitlePage } from "../../../hooks/useTitlePage";
import { ModalEstandar } from "../../../presentation/utils/modal-estandar";
import { RegistroCotizacion } from "./registro-cotizacion";
import { CotizacionesFilter } from "./cotizaciones-filter";
import type { RES_Cotizacion } from "../service/cotizaciones.responses";

export const CotizacionesPage = () => {
  useTitlePage("Gestión de Cotizaciones y Comparativos");

  const { cotizaciones, loading, fetchCotizaciones, busqueda, setBusqueda } =
    useCotizaciones();

  const [openedCreate, { open: openCreate, close: closeCreate }] =
    useDisclosure(false);
  const [openedProductos, setOpenedProductos] = useState(false);

  // Agrupamos las cotizaciones por comparativo
  const comparativosAgrupados = cotizaciones.reduce(
    (acc: Record<number, RES_Cotizacion[]>, curr) => {
      if (!acc[curr.id_comparativo]) acc[curr.id_comparativo] = [];
      acc[curr.id_comparativo].push(curr);
      return acc;
    },
    {},
  );

  const idsComparativos = Object.keys(comparativosAgrupados)
    .map(Number)
    .sort((a, b) => b - a);

  const filtrados = idsComparativos.filter((id) => {
    const cots = comparativosAgrupados[id];
    return (
      id.toString().includes(busqueda) ||
      cots.some((c) =>
        c.correlativo.toLowerCase().includes(busqueda.toLowerCase()),
      )
    );
  });

  return (
    <div className="space-y-6 animate-fade-in p-1">
      <CotizacionesFilter
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        openCreate={openCreate}
      />

      {loading ? (
        <Stack align="center" gap="md" py={100}>
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
            <ArrowPathIcon className="w-6 h-6 text-indigo-400 absolute inset-0 m-auto animate-pulse" />
          </div>
          <Text
            size="xs"
            fw={900}
            className="uppercase tracking-[0.3em] text-zinc-500"
          >
            Consultando Comparativos...
          </Text>
        </Stack>
      ) : filtrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 border border-dashed border-zinc-800 rounded-4xl bg-zinc-900/10 backdrop-blur-sm">
          <ClipboardDocumentListIcon className="w-12 h-12 text-zinc-700 mb-4" />
          <Text
            size="sm"
            fw={700}
            className="text-zinc-400 uppercase tracking-widest"
          >
            {busqueda ? "Sin resultados" : "No hay cotizaciones"}
          </Text>
          <Text size="xs" c="dimmed" className="mt-1">
            {busqueda
              ? "Intenta con otro término."
              : "Comience creando una nueva cotización."}
          </Text>
        </div>
      ) : (
        <Stack gap="md">
          {filtrados.map((idComp) => {
            const cots = comparativosAgrupados[idComp];
            const fecha = cots[0]?.comparativo_fecha || cots[0]?.created_at;
            const tieneAprobada = cots.some((c) => c.estado === "Aprobada");

            return (
              <Paper
                key={idComp}
                p="xl"
                radius="2xl"
                className="bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-600 transition-all group"
              >
                <Group justify="space-between" align="center">
                  <Stack gap={0}>
                    <Text
                      size="xs"
                      fw={800}
                      className="text-indigo-400 uppercase tracking-widest mb-1"
                    >
                      Comparativo #{idComp}
                    </Text>
                    <Text size="sm" className="text-zinc-400">
                      Fecha: {new Date(fecha).toLocaleDateString()}
                    </Text>
                  </Stack>

                  <Group gap="xs">
                    <div className="flex -space-x-2 overflow-hidden mr-4">
                      {cots.slice(0, 3).map((cot) => (
                        <Badge
                          key={cot.id}
                          variant="filled"
                          color="zinc"
                          className="border border-zinc-800 h-7"
                          size="sm"
                        >
                          {cot.correlativo}
                        </Badge>
                      ))}
                    </div>
                    <ActionIcon
                      variant="light"
                      color="indigo"
                      radius="xl"
                      size="lg"
                    >
                      <ChevronRightIcon className="w-5 h-5" />
                    </ActionIcon>
                  </Group>
                </Group>

                <Divider my="md" color="zinc.8" />

                <Group gap="xl">
                  <Stack gap={2}>
                    <Text
                      size="10px"
                      c="dimmed"
                      className="uppercase font-bold tracking-widest"
                    >
                      Estado
                    </Text>
                    <Badge
                      color={tieneAprobada ? "emerald" : "orange"}
                      variant="dot"
                      size="sm"
                    >
                      {tieneAprobada ? "COMPLETADO" : "PENDIENTE"}
                    </Badge>
                  </Stack>

                  <Stack gap={2}>
                    <Text
                      size="10px"
                      c="dimmed"
                      className="uppercase font-bold tracking-widest"
                    >
                      Cotizaciones
                    </Text>
                    <Text size="xs" fw={700} className="text-zinc-300">
                      {cots.length} Ofertas recibidas
                    </Text>
                  </Stack>
                </Group>
              </Paper>
            );
          })}
        </Stack>
      )}

      <ModalEstandar
        opened={openedCreate}
        close={closeCreate}
        title="Cotizaciones"
        size="100%"
        rightSection={
          <Button
            variant="light"
            color="indigo"
            leftSection={<CubeIcon className="w-5 h-5" />}
            onClick={() => setOpenedProductos(true)}
            radius="xl"
            size="sm"
          >
            Añadir Productos
          </Button>
        }
      >
        <RegistroCotizacion
          onSuccess={() => {
            closeCreate();
            fetchCotizaciones();
          }}
          onCancel={closeCreate}
          modalProductosOpened={openedProductos}
          setModalProductosOpened={setOpenedProductos}
        />
      </ModalEstandar>
    </div>
  );
};

export default CotizacionesPage;
