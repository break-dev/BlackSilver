import { Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";
import { InboxStackIcon } from "@heroicons/react/24/outline";

import { useLotesPage } from "../../hooks/useLotesPage";
import type { RES_Lote } from "../../service/lotes.responses";
import { useTitlePage } from "../../../../hooks/useTitlePage";

import { ModalEstandar } from "../../../../presentation/utils/modal-estandar";
import { RegistroLote } from "../registro-lote";
import { AjusteStockModal } from "../ajuste-stock";
import { LotesFilter } from "./lotes-filter";
import { ProductGroupCard } from "./product-group-card";
import { useLotesPrinter } from "../../hooks/useLotesPrinter";
import { useGroupedProducts } from "../../hooks/useGroupedProducts";
import { useLotesColumns } from "../../hooks/useLotesColumns";

export const LotesPage = () => {
  useTitlePage("Gestión de Inventario y Lotes");
  const {
    almacenes,
    records,
    loading,
    loadingAlmacenes,
    idAlmacen,
    setIdAlmacen,
    busqueda,
    setBusqueda,
    filtroCategoria,
    setFiltroCategoria,
    filtroProducto,
    setFiltroProducto,
    categoriasUnicas,
    productosUnicos,
    addLote,
    updateLote,
  } = useLotesPage();

  // Modals Local State (Purely UI)
  const [openedCreate, { open: openCreate, close: closeCreate }] =
    useDisclosure(false);
  const [loteParaAjustar, setLoteParaAjustar] = useState<RES_Lote | null>(null);
  const [openedAjuste, { open: openAjuste, close: closeAjuste }] =
    useDisclosure(false);

  // Instancia de impresión separada en hook
  const { printLotes: handlePrint } = useLotesPrinter(almacenes);

  // Grouping logic concentrada en hook abstracto
  const groupedProducts = useGroupedProducts(records);

  // Definición de las columnas de Mantine DataTable abstraida
  const columns = useLotesColumns({
    onPrint: handlePrint,
    onEditAjuste: (record) => {
      setLoteParaAjustar(record);
      openAjuste();
    },
  });

  return (
    <div className="space-y-6 animate-fade-in p-1">
      <LotesFilter
        almacenes={almacenes}
        loadingAlmacenes={loadingAlmacenes}
        idAlmacen={idAlmacen}
        setIdAlmacen={setIdAlmacen}
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        categoriasUnicas={categoriasUnicas}
        filtroCategoria={filtroCategoria}
        setFiltroCategoria={setFiltroCategoria}
        productosUnicos={productosUnicos}
        filtroProducto={filtroProducto}
        setFiltroProducto={setFiltroProducto}
        openCreate={openCreate}
      />

      {loading ? (
        <Stack align="center" gap="md" py={100}>
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
            <InboxStackIcon className="w-6 h-6 text-indigo-400 absolute inset-0 m-auto animate-pulse" />
          </div>
          <Text
            size="xs"
            fw={900}
            className="uppercase tracking-[0.3em] text-zinc-500"
          >
            Consultando Inventario...
          </Text>
        </Stack>
      ) : groupedProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 border border-dashed border-zinc-800 rounded-4xl bg-zinc-900/10 backdrop-blur-sm">
          <InboxStackIcon className="w-12 h-12 text-zinc-700 mb-4" />
          <Text
            size="sm"
            fw={700}
            className="text-zinc-400 uppercase tracking-widest"
          >
            Sin resultados
          </Text>
          <Text size="xs" c="dimmed" className="mt-1">
            No se encontraron lotes para los filtros aplicados.
          </Text>
        </div>
      ) : (
        <Stack gap="xl">
          {groupedProducts.map((p) => (
            <ProductGroupCard
              key={p.id_producto}
              product={p}
              columns={columns}
              loading={loading}
              onPrint={handlePrint}
            />
          ))}
        </Stack>
      )}

      <ModalEstandar
        opened={openedCreate}
        close={closeCreate}
        title="Ingreso de Mercadería"
        size="lg"
      >
        <RegistroLote
          initialAlmacenId={idAlmacen ? Number(idAlmacen) : null}
          almacenes={almacenes}
          onSuccess={(nuevoLote) => {
            closeCreate();
            addLote(nuevoLote);
            handlePrint(nuevoLote);
          }}
          onCancel={closeCreate}
        />
      </ModalEstandar>

      <ModalEstandar
        opened={openedAjuste}
        close={closeAjuste}
        title="Corrección de Inventario"
        size="lg"
      >
        {loteParaAjustar && (
          <AjusteStockModal
            lote={loteParaAjustar}
            onSuccess={(updatedLote) => {
              updateLote(updatedLote);
              closeAjuste();
            }}
            onCancel={closeAjuste}
          />
        )}
      </ModalEstandar>
    </div>
  );
};
