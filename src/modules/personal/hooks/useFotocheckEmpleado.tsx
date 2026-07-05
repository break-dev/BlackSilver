import { useCallback, useEffect, useState } from "react";
import QRCode from "qrcode";

import type { RES_EmpleadoResumen } from "../service/empleados.responses";
import { useNotify } from "../../../hooks/useNotify";
import { usePrint } from "../../../hooks/usePrint";
import { ArchivoService } from "../../../service/archivo.service";
import {
  FotocheckPDF,
  type FotocheckData,
} from "../../../presentation/utils/fotocheck-pdf";

interface UseFotocheckEmpleadoArgs {
  empleados: RES_EmpleadoResumen[];
}

const obtenerUrlAbsoluta = (url: string | null | undefined): string | null => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }
  const apiBase = import.meta.env.VITE_API_URL || "";
  const base = apiBase.endsWith("/") ? apiBase.slice(0, -1) : apiBase;
  const path = url.startsWith("/") ? url : "/" + url;
  return `${base}${path}`;
};

const obtenerPathRelativo = (url: string | null | undefined): string | null => {
  if (!url) return null;
  const storageIndex = url.indexOf("/storage/");
  if (storageIndex !== -1) {
    return url.substring(storageIndex + "/storage/".length);
  }
  return null;
};

const getBase64ImageWithAuth = async (url: string | null | undefined): Promise<string | null> => {
  if (!url) return null;

  if (url.startsWith("data:")) {
    return url;
  }

  const pathRelativo = obtenerPathRelativo(url);
  if (!pathRelativo) {
    // Si no es una URL de storage local, intentamos fetch simple (externa)
    try {
      const fullUrl = obtenerUrlAbsoluta(url);
      if (!fullUrl) return null;
      const res = await fetch(fullUrl);
      if (!res.ok) return null;
      const blob = await res.blob();
      if (blob && blob.type.startsWith("image/")) {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(blob);
        });
      }
      return null;
    } catch {
      return null;
    }
  }

  // En Laravel, el disco 'public' apunta físicamente a 'storage/app/public/'.
  // Intentamos primero con "public/" y luego con la ruta tal cual.
  const pathsToTry = [
    `storage/${pathRelativo}`,
    `public/${pathRelativo}`,
    pathRelativo,
    `storage/app/public/${pathRelativo}`,
    `public/storage/${pathRelativo}`,
  ];

  for (const path of pathsToTry) {
    try {
      const blob = await ArchivoService.descargarArchivo(path, "imagen");
      if (blob && blob.type.startsWith("image/")) {
        return await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(blob);
        });
      }
    } catch {
      // continuar al siguiente intento
    }
  }

  return null;
};

/**
 * Hook para generar y descargar fotochecks de empleados en PDF
 * (1 PDF multi-página, 1 página por empleado).
 */
export const useFotocheckEmpleado = ({
  empleados,
}: UseFotocheckEmpleadoArgs) => {
  const { notifyError, notifySuccess } = useNotify();
  const { print, prepare } = usePrint();
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
            width: 320,
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

  /**
   * Convierte un RES_EmpleadoResumen a FotocheckData.
   * Siempre es tipo "empleado" (el listado excluye contratistas).
   * Las URLs de foto/logo se pasan tal cual (sin fetch ni base64).
   */
  const buildFotocheckData = useCallback(
    (emp: RES_EmpleadoResumen, qrDataUrl: string): FotocheckData => {
      return {
        tipo: "empleado",
        nombre: emp.nombre,
        apellido: emp.apellido,
        cargo: emp.cargo,
        area: emp.area,
        empresa: emp.empresa,
        empresaUrlLogo: emp.empresa_url_logo,
        mina: null,
        labor: null,
        // URL directa (sin fetch, sin base64).
        urlFoto: emp.url_foto ?? null,
        qrDataUrl,
        qrToken: emp.qr_token,
        dni: emp.dni,
        ancho: 400,
        alto: 600,
      };
    },
    [],
  );

  /**
   * Genera y descarga el PDF con todos los fotochecks.
   * (1 página por empleado, 1 documento PDF con N páginas).
   */
  const descargar = useCallback(
    async (ancho: number, alto: number) => {
      if (empleados.length === 0) {
        notifyError("No hay empleados seleccionados para generar fotochecks");
        return;
      }

      // Pre-abrir la pestaña de impresión synchronously en el click del usuario
      const targetName = `PrinterFotocheck_${Date.now()}`;
      const printerWindow = prepare(targetName);

      setGenerando(true);
      try {
        const qrList: Record<number, string> = { ...qrDataUrls };
        for (const emp of empleados) {
          if (!qrList[emp.id_empleado] && emp.qr_token) {
            try {
              qrList[emp.id_empleado] = await QRCode.toDataURL(emp.qr_token, {
                width: 320,
                margin: 1,
                errorCorrectionLevel: "M",
              });
            } catch {
              // continuar
            }
          }
        }

        // Construye los fotochecks (descarga imágenes con token en base64).
        const fotochecks: FotocheckData[] = await Promise.all(
          empleados.map(async (emp) => {
            const qr = qrList[emp.id_empleado] ?? "";
            const fotoBase64 = await getBase64ImageWithAuth(emp.url_foto);
            const logoBase64 = await getBase64ImageWithAuth(emp.empresa_url_logo);

            const fData = buildFotocheckData(emp, qr);
            fData.urlFoto = fotoBase64 || undefined;
            fData.empresaUrlLogo = logoBase64 || undefined;
            return fData;
          })
        );

        fotochecks.forEach((f) => {
          f.ancho = ancho;
          f.alto = alto;
        });

        print(<FotocheckPDF fotochecks={fotochecks} />, {
          documentTitle: "Fotochecks",
          target: targetName,
        });
        notifySuccess("Fotocheck PDF generado correctamente");
      } catch (err) {
        console.error(err);
        notifyError("Error al generar el PDF de fotochecks");
        printerWindow?.close();
      } finally {
        setGenerando(false);
      }
    },
    [empleados, qrDataUrls, print, prepare, buildFotocheckData, notifyError, notifySuccess],
  );

  return {
    generando,
    qrDataUrls,
    descargar,
  };
};
