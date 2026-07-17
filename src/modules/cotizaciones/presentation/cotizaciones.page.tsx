import { Stack, Text, Button, Group, Divider, Select } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  ClipboardDocumentListIcon,
  ArrowPathIcon,
  CubeIcon,
  PlusIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { ShieldCheckIcon } from "@heroicons/react/24/solid";
import { useState, useRef } from "react";
import { useBlackcito } from "../../../hooks/useBlackcito";

import { useCotizaciones } from "../hooks/useCotizaciones";
import { useTitlePage } from "../../../hooks/useTitlePage";
import { ModalEstandar } from "../../../presentation/utils/modal-estandar";
import { RegistroCotizacion } from "./registro-cotizacion/registro-cotizacion";
import { CotizacionesFilter } from "./cotizaciones-page/cotizaciones-filter";
import { ListadoComparativos } from "./cotizaciones-page/listado-comparativo/listado-comparativos";

export const CotizacionesPage = () => {
  useTitlePage("Cotizaciones");

  const {
    comparativos,
    loading,
    //fetchCotizaciones,
    updateCotizacionLocal,
    busqueda,
    setBusqueda,
    mes,
    year,
    cambiarPeriodo,
    addComparativosLocal,
    replaceComparativosLocal,
  } = useCotizaciones();

  const [openedCreate, { open: openCreate, close: closeCreate }] =
    useDisclosure(false);
  const [openedProductos, setOpenedProductos] = useState(false);
  const [esAuditableGlobal, setEsAuditableGlobal] = useState(false);
  const [openedConfirm, setOpenedConfirm] = useState(false);
  const [productosEnCotizacion, setProductosEnCotizacion] = useState<{ id_producto: number; nombre: string }[]>([]);

  const { happy, close } = useBlackcito();
  const registroRef = useRef<{
    agregarCotizacion: () => void;
    limpiarComparativo: () => void;
    hasProductos: () => boolean;
  } | null>(null);

  const handleToggleAuditable = () => {
    if (registroRef.current?.hasProductos()) {
      setOpenedConfirm(true);
    } else {
      setEsAuditableGlobal(!esAuditableGlobal);
    }
  };

  const confirmarToggle = () => {
    registroRef.current?.limpiarComparativo();
    setEsAuditableGlobal(!esAuditableGlobal);
    setOpenedConfirm(false);
  };

  return (
    <div className="space-y-6 animate-fade-in p-1">
      <CotizacionesFilter
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        openCreate={openCreate}
        mes={mes}
        year={year}
        onCambiarPeriodo={cambiarPeriodo}
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
      ) : comparativos.length === 0 && !busqueda ? (
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
          comparativos={comparativos}
          busqueda={busqueda}
          onUpdateLocal={updateCotizacionLocal}
          onReplaceLocal={replaceComparativosLocal}
        />
      )}

      <ModalEstandar
        opened={openedCreate}
        close={closeCreate}
        title="Cotizaciones"
        size="100%"
        rightSection={
          <Group gap="sm">
            {openedCreate && (
              <>
                {productosEnCotizacion.length > 0 && (
                  <Select
                    placeholder="Buscar producto..."
                    data={productosEnCotizacion.map((p) => ({
                      value: String(p.id_producto),
                      label: p.nombre,
                    }))}
                    searchable
                    clearable
                    size="xs"
                    radius="xl"
                    classNames={{
                      input: "bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 w-52 focus:border-zinc-500",
                      dropdown: "bg-zinc-900 border-zinc-800",
                      option: "text-zinc-300 hover:bg-zinc-800 data-[selected]:bg-indigo-600 data-[selected]:text-white",
                    }}
                    comboboxProps={{
                      zIndex: 10002,
                    }}
                    onChange={(val) => {
                      if (val) {
                        const element = document.getElementById(`producto-fila-${val}`);
                        if (element) {
                          element.scrollIntoView({ behavior: "smooth", block: "center" });
                          element.classList.add("bg-indigo-500/10");
                          setTimeout(() => {
                            element.classList.remove("bg-indigo-500/10");
                          }, 2000);
                        }
                      }
                    }}
                  />
                )}
                <Button
                  variant={esAuditableGlobal ? "filled" : "light"}
                  color="red"
                  radius="xl"
                  leftSection={<ShieldCheckIcon className="w-4 h-4" />}
                  onClick={handleToggleAuditable}
                  size="xs"
                >
                  {esAuditableGlobal ? "Modo Auditable Activo" : "Hacer Auditable"}
                </Button>
                <Divider orientation="vertical" color="zinc.8" h={20} />
              </>
            )}

            <Button
              variant="filled"
              color="indigo"
              className="shadow-lg shadow-pink-800/20 transition-all duration-300"
              leftSection={<CubeIcon className="w-5 h-5" />}
              onClick={() => setOpenedProductos(true)}
              onMouseEnter={() =>
                happy(
                  "¡Añade productos al comparativo! Selecciona los ítems para tu cotización.",
                  { persistent: true },
                )
              }
              onMouseLeave={close}
              radius="xl"
              size="xs"
            >
              Añadir Productos
            </Button>

            {openedCreate && (
              <>
                <Divider orientation="vertical" color="zinc.8" h={20} />

                <Button
                  variant="light"
                  color="teal"
                  radius="xl"
                  leftSection={<PlusIcon className="w-4 h-4" />}
                  onClick={() => registroRef.current?.agregarCotizacion()}
                  size="xs"
                >
                  Añadir Cotización
                </Button>
              </>
            )}
          </Group>
        }
      >
        <RegistroCotizacion
          ref={registroRef}
          onSuccess={(data) => {
            closeCreate();
            addComparativosLocal(data);
          }}
          onCancel={closeCreate}
          modalProductosOpened={openedProductos}
          setModalProductosOpened={setOpenedProductos}
          esAuditableGlobal={esAuditableGlobal}
          onProductosChange={setProductosEnCotizacion}
        />
      </ModalEstandar>

      <ModalEstandar
        opened={openedConfirm}
        close={() => setOpenedConfirm(false)}
        title="Advertencia"
        size="md"
      >
        <Stack gap="md" align="center" className="p-4 text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500" />
          <Text size="sm" fw={800} className="text-zinc-100">
            Al cambiar el tipo de cotización, se limpiará la grilla actual de
            productos. ¿Deseas continuar?
          </Text>
          <Group justify="center" gap="sm" mt="md">
            <Button
              variant="subtle"
              color="zinc"
              onClick={() => setOpenedConfirm(false)}
              radius="xl"
            >
              Cancelar
            </Button>
            <Button
              variant="filled"
              color="red"
              onClick={confirmarToggle}
              radius="xl"
              className="shadow-lg shadow-red-900/20"
            >
              Continuar y Limpiar
            </Button>
          </Group>
        </Stack>
      </ModalEstandar>
    </div>
  );
};

export default CotizacionesPage;
