import { QRCodeSVG } from "qrcode.react";
import dayjs from "dayjs";

export interface TicketLoteProps {
  id: number;
  producto: string;
  lote: string;
  almacen: string;
  descripcion: string | null;
  fecha_ingreso: string;
}


/**
 * Componente que organiza uno o múltiples tickets de lote en una cuadrícula.
 * Maneja el layout y el espaciado para asegurar que la impresión use padding en los bordes.
 */
export const TicketLotePrinter = ({ data }: { data: TicketLoteProps[] }) => {
  return (
    <div className="flex gap-3">
      {data.map((lote) => (
        <TicketLote key={lote.id} data={lote} />
      ))}
    </div>
  );
};


export const TicketLote = ({ data }: { data: TicketLoteProps }) => {
  const qrValue = JSON.stringify(
    {
      id: data.id,
      producto: data.producto,
      lote: data.lote,
      almacen: data.almacen,
      descripcion: data.descripcion || "",
      fecha_ingreso: dayjs(data.fecha_ingreso).format("DD/MM/YY"),
    },
    null,
    2,
  );

  return (
    <div
      className="w-full max-w-[60mm] h-auto p-3 bg-white text-black border 
      border-dashed border-zinc-400 rounded-2xl font-sans overflow-hidden"
    >
      <div className="flex flex-col gap-1">
        {/* Titulo / Almacen */}
        <h1 className="text-md font-black leading-tight text-zinc-950 truncate">
          {data.almacen}
        </h1>

        <div className="flex gap-2 items-start">
          {/* QR Code */}
          <div className="bg-white p-0.5 rounded border border-zinc-100 shrink-0">
            <QRCodeSVG value={qrValue} size={80} level="M" />
          </div>

          {/* Detalles */}
          <div className="flex flex-col gap-0.5 text-[10px] leading-tight flex-1 min-w-0">
            <p className="truncate">
              <span className="font-bold">Producto:</span> {data.producto}
            </p>
            <p className="truncate">
              <span className="font-bold">Lote:</span> {data.lote}
            </p>
            <p>
              <span className="font-bold">Fecha de ingreso:</span>{" "}
              {dayjs(data.fecha_ingreso).format("DD/MM/YY")}
            </p>
            <p className="line-clamp-2 italic text-zinc-600">
              {data.descripcion ? `"${data.descripcion}"` : "Sin descripción"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
