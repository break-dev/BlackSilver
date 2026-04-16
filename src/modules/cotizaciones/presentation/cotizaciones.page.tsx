import { Stack, Text, Button, Group, Divider } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  ClipboardDocumentListIcon,
  ArrowPathIcon,
  CubeIcon,
  PlusIcon,
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
} from "@heroicons/react/24/outline";
import { useState, useRef } from "react";
import { BlackcitoMascot } from "../../../presentation/utils/blackcito-pet";

import { useCotizaciones } from "../hooks/useCotizaciones";
import { useTitlePage } from "../../../hooks/useTitlePage";
import { ModalEstandar } from "../../../presentation/utils/modal-estandar";
import { RegistroCotizacion } from "./registro-cotizacion";
import { CotizacionesFilter } from "./cotizaciones-filter";
import { ListadoComparativos } from "./listado-comparativos";

export const CotizacionesPage = () => {
  useTitlePage("Cotizaciones");

  const {
    cotizaciones,
    detalles,
    empresas,
    loading,
    fetchCotizaciones,
    updateCotizacionLocal,
    busqueda,
    setBusqueda,
  } = useCotizaciones();

  const [openedCreate, { open: openCreate, close: closeCreate }] =
    useDisclosure(false);
  const [openedProductos, setOpenedProductos] = useState(false);
  const [openedProductosHover, setOpenedProductosHover] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const registroRef = useRef<{ agregarCotizacion: () => void } | null>(null);

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
      ) : cotizaciones.length === 0 && !busqueda ? (
        <div className="flex flex-col items-center justify-center p-20 border border-dashed border-zinc-800 rounded-4xl bg-zinc-900/10 backdrop-blur-sm">
          <ClipboardDocumentListIcon className="w-12 h-12 text-zinc-700 mb-4" />
          <Text
            size="sm"
            fw={700}
            className="text-zinc-400 uppercase tracking-widest"
          >
            No hay cotizaciones
          </Text>
          <Text size="xs" c="dimmed" className="mt-1">
            Comience creando un nuevo comparativo.
          </Text>
        </div>
      ) : (
        <ListadoComparativos
          cotizaciones={cotizaciones}
          detalles={detalles}
          empresas={empresas}
          busqueda={busqueda}
          onUpdateLocal={updateCotizacionLocal}
        />
      )}

      <ModalEstandar
        opened={openedCreate}
        close={closeCreate}
        title="Cotizaciones"
        size="100%"
        rightSection={
          <Group gap="sm">
            <BlackcitoMascot
              emotion="feliz"
              message="¡Añade productos al comparativo! Selecciona los ítems para tu cotización. ¡Blackcito esta pendiente de ti!"
              visible={openedProductosHover}
            />
            <Button
              variant="filled"
              color="pink"
              className="shadow-lg shadow-pink-800/20 transition-all duration-300"
              leftSection={<CubeIcon className="w-5 h-5" />}
              onClick={() => setOpenedProductos(true)}
              onMouseEnter={() => setOpenedProductosHover(true)}
              onMouseLeave={() => setOpenedProductosHover(false)}
              radius="xl"
              size="sm"
            >
              Añadir Productos
            </Button>

            {openedCreate && (
              <>
                <Divider orientation="vertical" color="zinc.8" h={20} />

                <Button
                  variant="light"
                  color="emerald"
                  radius="xl"
                  leftSection={<PlusIcon className="w-4 h-4" />}
                  onClick={() => registroRef.current?.agregarCotizacion()}
                  size="xs"
                >
                  Añadir Cotización
                </Button>

                <Button
                  variant="subtle"
                  color="zinc"
                  radius="xl"
                  leftSection={
                    isCollapsed ? (
                      <ArrowsPointingOutIcon className="w-5 h-5 text-zinc-400" />
                    ) : (
                      <ArrowsPointingInIcon className="w-5 h-5 text-zinc-400" />
                    )
                  }
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="hover:bg-white/5"
                  size="xs"
                >
                  {isCollapsed ? "Vista Detallada" : "Vista Resumida"}
                </Button>
              </>
            )}
          </Group>
        }
      >
        <RegistroCotizacion
          ref={registroRef}
          isCollapsed={isCollapsed}
          onAutoCollapse={setIsCollapsed}
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
