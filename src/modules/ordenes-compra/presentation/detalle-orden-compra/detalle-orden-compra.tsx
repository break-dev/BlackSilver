import { Loader, Stack } from "@mantine/core";
import dayjs from "dayjs";
import { useState } from "react";
import QRCode from "qrcode";
import type {
  RES_OrdenCompra,
  RES_OrdenCompraDetalle,
} from "../../../../service/responses/ordenes-compra/orden-compra";
import { ModalEstandar } from "../../../../presentation/utils/modal-estandar.tsx";
import { RegistroRecepcionOC } from "../registro-recepcion/registrar-recepcion-oc.tsx";
import { HistorialRecepcionesOC } from "../historial-recepciones/historial-recepciones-oc.tsx";
import { TrazabilidadDetalleOC } from "../trazabilidad-detalle-oc.tsx";
import type { RES_TicketLote } from "../../../../service/responses/lote-producto.ts";
import { usePrint } from "../../../../hooks/usePrint.ts";
import { TicketLotePDF } from "../../../../presentation/utils/ticket-lote-pdf.tsx";

// Sub-componentes factorizados
import { OrdenCompraHeader } from "./components/orden-compra-header";
import { OrdenCompraInfoAdicional } from "./components/orden-compra-info-adicional";
import { OrdenCompraResumenFinanciero } from "./components/orden-compra-resumen-financiero";
import { OrdenCompraProgreso } from "./components/orden-compra-progreso";
import { OrdenCompraTablaDetalle } from "./components/orden-compra-tabla-detalle";

import { type DTO_RecepcionOCItem } from "../../service/recepcion.requests.ts";

interface DetalleOrdenCompraProps {
  orden: RES_OrdenCompra;
  detalles: RES_OrdenCompraDetalle[];
  loading: boolean;
  progresoGeneral?: number;
  onSuccess?: () => void;
  onUpdateLocalState?: (recepcionItems: DTO_RecepcionOCItem[]) => void;
}

export const DetalleOrdenCompra = ({
  orden,
  detalles,
  loading,
  progresoGeneral: propProgreso,
  onSuccess,
  onUpdateLocalState,
}: DetalleOrdenCompraProps) => {
  const [openedRecepcion, setOpenedRecepcion] = useState(false);
  const [openedHistorial, setOpenedHistorial] = useState(false);
  const [openedTrace, setOpenedTrace] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [selectedItemName, setSelectedItemName] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const { print } = usePrint();

  const openTrace = (idDetalle: number, nombre: string) => {
    setSelectedItemId(idDetalle);
    setSelectedItemName(nombre);
    setOpenedTrace(true);
  };

  const closeTrace = () => {
    setSelectedItemId(null);
    setSelectedItemName("");
    setOpenedTrace(false);
  };

  const detallesDisponibles = detalles.filter((d) => {
    const req = Number(d.cantidad_requerida_base) || 0;
    const rec = Number(d.cantidad_recepcionada_base) || 0;
    return rec < req - 0.001;
  });

  const allAvailableSelected =
    detallesDisponibles.length > 0 &&
    selectedIds.length === detallesDisponibles.length;

  const someAvailableSelected =
    selectedIds.length > 0 && selectedIds.length < detallesDisponibles.length;

  const handleSelectAll = () => {
    if (allAvailableSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(detallesDisponibles.map((d) => d.id_orden_compra_detalle));
    }
  };

  const handleSelectOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  // Cálculo interno del progreso si no se recibe por props
  const progresoGeneral =
    propProgreso ??
    (detalles.length > 0
      ? Math.min(
          100,
          Math.round(
            detalles.reduce((acc, d) => {
              const req = Number(d.cantidad_requerida_base) || 1;
              const rec = Number(d.cantidad_recepcionada_base) || 0;
              return acc + (rec / req) * 100;
            }, 0) / detalles.length,
          ),
        )
      : 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader color="indigo" size="lg" />
      </div>
    );
  }

  const symbol = orden.moneda === "Soles" ? "S/." : "$";

  return (
    <Stack gap="xl" className="animate-fade-in pb-10">
      <div className="flex flex-col gap-5">
        <OrdenCompraHeader orden={orden} />

        <OrdenCompraInfoAdicional orden={orden} />

        <OrdenCompraResumenFinanciero orden={orden} symbol={symbol} />

        <OrdenCompraProgreso progresoGeneral={progresoGeneral} />

        <OrdenCompraTablaDetalle
          orden={orden}
          detalles={detalles}
          detallesDisponibles={detallesDisponibles}
          selectedIds={selectedIds}
          allAvailableSelected={allAvailableSelected}
          someAvailableSelected={someAvailableSelected}
          onSelectAll={handleSelectAll}
          onSelectOne={handleSelectOne}
          onOpenHistorial={() => setOpenedHistorial(true)}
          onOpenRecepcion={() => setOpenedRecepcion(true)}
          onOpenTrace={openTrace}
          symbol={symbol}
        />
      </div>

      <ModalEstandar
        opened={openedHistorial}
        close={() => setOpenedHistorial(false)}
        title="Historial de Recepciones"
        size="80%"
      >
        <HistorialRecepcionesOC idOrdenCompra={orden.id_orden_compra} />
      </ModalEstandar>

      <ModalEstandar
        opened={openedRecepcion}
        close={() => setOpenedRecepcion(false)}
        title="Nueva Recepción de Mercancía"
        size="85%"
      >
        <RegistroRecepcionOC
          idOrdenCompra={orden.id_orden_compra}
          detalles={detalles.filter((d) =>
            selectedIds.includes(d.id_orden_compra_detalle),
          )}
          onSuccess={async (
            lotesNuevos?: RES_TicketLote[],
            finalItems?: DTO_RecepcionOCItem[],
          ) => {
            setOpenedRecepcion(false);
            if (onUpdateLocalState && finalItems) {
              onUpdateLocalState(finalItems);
            } else if (onSuccess) {
              onSuccess();
            }

            if (lotesNuevos && lotesNuevos.length > 0) {
              const tickets = await Promise.all(
                lotesNuevos.map(async (t) => {
                  const qrValue = JSON.stringify({
                    id: t.id,
                    producto: t.producto,
                    lote: t.lote,
                    almacen: t.almacen,
                    fecha_ingreso: dayjs(t.fecha_ingreso).format("DD/MM/YY"),
                  });
                  const qrDataUrl = await QRCode.toDataURL(qrValue, {
                    width: 120,
                    margin: 1,
                  });
                  return { ...t, qrDataUrl };
                }),
              );
              print(<TicketLotePDF tickets={tickets} />, {
                documentTitle: "Tickets Lotes",
                target: "TicketLotePrinter",
              });
            }
          }}
        />
      </ModalEstandar>

      <ModalEstandar
        opened={openedTrace}
        close={closeTrace}
        title="Trazabilidad del Producto"
        size="md"
      >
        {selectedItemId && (
          <TrazabilidadDetalleOC
            idDetalle={selectedItemId}
            productoNombre={selectedItemName}
          />
        )}
      </ModalEstandar>
    </Stack>
  );
};
