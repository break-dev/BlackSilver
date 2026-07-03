import { useCallback, useEffect, useState } from "react";
import QRCode from "qrcode";
import JSZip from "jszip";

import type { RES_EmpleadoResumen } from "../service/empleados.responses";
import { useNotify } from "../../../hooks/useNotify";

export interface FotocheckInput {
  empleado: RES_EmpleadoResumen;
  qrDataUrl: string;
}

interface UseFotocheckEmpleadoArgs {
  empleados: RES_EmpleadoResumen[];
}

const triggerDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

/**
 * Convierte un nombre de archivo en algo seguro para el filesystem.
 * Quita acentos, caracteres no-ASCII y reemplaza espacios por guiones.
 */
const sanitizeFilename = (input: string): string => {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
};

export const useFotocheckEmpleado = ({
  empleados,
}: UseFotocheckEmpleadoArgs) => {
  const { notifyError } = useNotify();
  const [generando, setGenerando] = useState(false);
  const [qrDataUrls, setQrDataUrls] = useState<Record<number, string>>({});

  // Genera los QR data URLs de cada empleado.
  useEffect(() => {
    let cancelado = false;
    const generarQrs = async () => {
      const nuevosQr: Record<number, string> = {};
      for (const emp of empleados) {
        if (!emp.qr_token) continue;
        try {
          const dataUrl = await QRCode.toDataURL(emp.qr_token, {
            width: 240,
            margin: 1,
            errorCorrectionLevel: "M",
          });
          nuevosQr[emp.id_empleado] = dataUrl;
        } catch {
          // No interrumpe el flujo si un QR falla.
        }
      }
      if (!cancelado) setQrDataUrls(nuevosQr);
    };
    if (empleados.length > 0) {
      void generarQrs();
    } else {
      setQrDataUrls({});
    }
    return () => {
      cancelado = true;
    };
  }, [empleados]);

  // Genera una imagen PNG de un solo empleado (usa el card del DOM
  // con id `fotocheck-card-{id_empleado}` que el componente renderiza
  // como oculto/absolute en el preview).
  const generarPngEmpleado = useCallback(
    async (id_empleado: number, ancho: number, alto: number): Promise<Blob> => {
      const html2canvas = (await import("html2canvas")).default;
      const node = document.getElementById(
        `fotocheck-card-${id_empleado}`,
      );
      if (!node) {
        throw new Error(`No se encontró el nodo del fotocheck para ${id_empleado}`);
      }
      const canvas = await html2canvas(node, {
        width: ancho,
        height: alto,
        scale: 2,
        backgroundColor: null,
        useCORS: true,
        logging: false,
      });
      return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else
              reject(new Error("No se pudo generar el blob de la imagen"));
          },
          "image/png",
        );
      });
    },
    [],
  );

  // Genera un ZIP con los fotochecks de los empleados seleccionados.
  const generarZip = useCallback(
    async (ancho: number, alto: number): Promise<Blob> => {
      const zip = new JSZip();
      for (const emp of empleados) {
        try {
          const blob = await generarPngEmpleado(emp.id_empleado, ancho, alto);
          const fileName = `fotocheck-${sanitizeFilename(
            `${emp.nombre}-${emp.apellido}-${emp.dni ?? emp.id_empleado}`,
          )}.png`;
          zip.file(fileName, blob);
        } catch (err) {
          // Continúa con los demás aunque uno falle.
          console.error("Error generando fotocheck", emp.id_empleado, err);
        }
      }
      return zip.generateAsync({ type: "blob" });
    },
    [empleados, generarPngEmpleado],
  );

  // Descarga directa: 1 empleado → PNG; varios → ZIP.
  const descargar = useCallback(
    async (ancho: number, alto: number) => {
      if (empleados.length === 0) {
        notifyError("No hay empleados seleccionados para generar fotochecks");
        return;
      }
      setGenerando(true);
      try {
        if (empleados.length === 1) {
          const emp = empleados[0];
          const blob = await generarPngEmpleado(
            emp.id_empleado,
            ancho,
            alto,
          );
          const fileName = `fotocheck-${sanitizeFilename(
            `${emp.nombre}-${emp.apellido}-${emp.dni ?? emp.id_empleado}`,
          )}.png`;
          triggerDownload(blob, fileName);
        } else {
          const zipBlob = await generarZip(ancho, alto);
          triggerDownload(
            zipBlob,
            `fotochecks-${new Date().toISOString().slice(0, 10)}.zip`,
          );
        }
      } catch (err) {
        console.error(err);
        notifyError("Error al generar los fotochecks");
      } finally {
        setGenerando(false);
      }
    },
    [empleados, generarPngEmpleado, generarZip, notifyError],
  );

  return {
    generando,
    qrDataUrls,
    descargar,
  };
};
