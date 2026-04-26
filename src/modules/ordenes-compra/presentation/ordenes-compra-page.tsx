import { useTitlePage } from "../../../hooks/useTitlePage.ts";
import { useOrdenesCompraPage } from "../hooks/useOrdenesCompra.tsx";
import { ModalEstandar } from "../../../presentation/utils/modal-estandar.tsx";
import { DetalleOrdenCompra } from "./detalle-orden-compra/detalle-orden-compra.tsx";

// New Components
import { Filtros } from "./orden-compra-page/filtros.tsx";
import { GroupByEmpresa } from "./orden-compra-page/group-by-empresa.tsx";

export const OrdenesCompraPage = () => {
  useTitlePage("Órdenes de Compra");

  const {
    loading,
    filters,
    containerRef,
    selectedOrden,
    detalles,
    loadingDetalle,
    openedDetalle,
    closeDet,
    groupedOrders,
    tableColumns,
  } = useOrdenesCompraPage();

  return (
    <div
      ref={containerRef}
      className="space-y-8 p-4 animate-fade-in text-zinc-100"
    >
      <Filtros {...filters} />

      <GroupByEmpresa
        groupedOrders={groupedOrders}
        tableColumns={tableColumns}
        loading={loading}
      />

      <ModalEstandar
        opened={openedDetalle}
        close={closeDet}
        title="Detalle de Orden de Compra"
        size="95%"
      >
        {selectedOrden && (
          <DetalleOrdenCompra
            orden={selectedOrden}
            detalles={detalles}
            loading={loadingDetalle}
          />
        )}
      </ModalEstandar>
    </div>
  );
};
