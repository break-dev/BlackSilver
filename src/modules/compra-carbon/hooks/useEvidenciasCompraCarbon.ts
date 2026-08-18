import { useState } from "react";
import { api } from "../../../service/_api";
import { useNotify } from "../../../hooks/useNotify";
import { CompraCarbonService } from "../service/compra-carbon.service";
import type { IArchivo } from "../../../shared/interfaces/archivo";
import type { CompraCarbonDetalle } from "../service/compra-carbon.responses";

interface IArchivoServer {
  url: string;
  path_relativo: string;
  nombre_original: string | null;
  extension: string | null;
}

/**
 * Sube archivos al storage y reemplaza la lista de evidencias de aprobacion.
 */
export const useEvidenciasCompraCarbon = (idCompraCarbon: number) => {
  const { notifyError, notifySuccess } = useNotify();
  const [loading, setLoading] = useState(false);

  const subirArchivos = async (files: File[]): Promise<IArchivo[]> => {
    const subidos: IArchivo[] = [];
    for (const file of files) {
      const fd = new FormData();
      fd.append("archivo", file, file.name);
      fd.append("carpeta", "evidencias-compra-carbon");
      const { data } = await api.post<{
        success: boolean;
        data: IArchivoServer;
        message?: string;
      }>("/archivos/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (data?.success && data.data) {
        const a = data.data;
        subidos.push({
          url: a.url,
          path_relativo: a.path_relativo,
          nombre_original: a.nombre_original ?? file.name,
          extension: a.extension ?? null,
        });
      } else {
        throw new Error(data?.message ?? `No se pudo subir ${file.name}`);
      }
    }
    return subidos;
  };

  const guardarEvidencias = async (
    archivos: IArchivo[],
  ): Promise<CompraCarbonDetalle | null> => {
    setLoading(true);
    try {
      const resp = await CompraCarbonService.setEvidenciasAprobacion(
        idCompraCarbon,
        archivos,
      );
      if (!resp.success) {
        notifyError(resp.message || "No se pudieron guardar las evidencias");
        return null;
      }
      notifySuccess(resp.message || "Evidencias actualizadas correctamente");
      return resp.data;
    } catch (e) {
      console.error(e);
      notifyError("Error al guardar las evidencias");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const subirYGuardar = async (
    existentes: IArchivo[],
    nuevosArchivos: File[],
  ): Promise<CompraCarbonDetalle | null> => {
    if (nuevosArchivos.length === 0) {
      notifyError("No hay archivos nuevos para subir");
      return null;
    }
    setLoading(true);
    try {
      const subidos = await subirArchivos(nuevosArchivos);
      const todos = [...existentes, ...subidos];
      return await guardarEvidencias(todos);
    } catch (e) {
      console.error(e);
      notifyError("Error al subir archivos");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { subirYGuardar, guardarEvidencias, loading };
};