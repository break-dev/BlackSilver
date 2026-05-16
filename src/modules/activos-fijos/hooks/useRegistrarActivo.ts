import { useState, useEffect } from "react";
import { AuxService } from "../../../service/auxiliar.service";
import type { RES_Producto } from "../../../service/responses/producto";
import type { RES_Almacen } from "../../../service/responses/almacen";
import type { RES_Mina } from "../../../service/responses/mina";
import type { RES_Marca } from "../../../service/responses/marca";
import { ActivosService } from "../service/activos.service";
import type { REQ_CrearActivo } from "../service/activos.requests";
import type { RES_ActivoFijoResumen } from "../service/activos.responses";
import { useNotify } from "../../../hooks/useNotify";
import { TipoBien } from "../../../shared/enums/_generic/tipo-bien";

/**
 * Hook para gestionar el registro de un nuevo activo fijo.
 * Controla la carga individual y concurrente de los catálogos maestros necesarios
 * y maneja la lógica de envío de datos del formulario a la API.
 */
export const useRegistrarActivo = () => {
  const { notifySuccess, notifyError } = useNotify();

  const [productos, setProductos] = useState<RES_Producto[]>([]);
  const [almacenes, setAlmacenes] = useState<RES_Almacen[]>([]);
  const [minas, setMinas] = useState<RES_Mina[]>([]);
  const [marcas, setMarcas] = useState<RES_Marca[]>([]);

  // Estados de carga individuales por cada petición API
  const [loadingProductos, setLoadingProductos] = useState(false);
  const [loadingAlmacenes, setLoadingAlmacenes] = useState(false);
  const [loadingMinas, setLoadingMinas] = useState(false);
  const [loadingMarcas, setLoadingMarcas] = useState(false);

  useEffect(() => {
    /**
     * Carga el catálogo de productos base de forma individual y asíncrona.
     */
    const loadProductos = async () => {
      setLoadingProductos(true);
      try {
        const res = await AuxService.get_productos({
          tipo_bien: TipoBien.ActivoFijo,
        });
        if (res.success) setProductos(res.data);
      } catch (error) {
        console.error("Error al cargar productos auxiliares", error);
      } finally {
        setLoadingProductos(false);
      }
    };

    /**
     * Carga el catálogo de almacenes de forma individual y asíncrona.
     */
    const loadAlmacenes = async () => {
      setLoadingAlmacenes(true);
      try {
        const res = await AuxService.get_almacenes();
        if (res.success) setAlmacenes(res.data);
      } catch (error) {
        console.error("Error al cargar almacenes auxiliares", error);
      } finally {
        setLoadingAlmacenes(false);
      }
    };

    /**
     * Carga el catálogo de minas de forma individual y asíncrona.
     */
    const loadMinas = async () => {
      setLoadingMinas(true);
      try {
        const res = await AuxService.get_minas();
        if (res.success) setMinas(res.data);
      } catch (error) {
        console.error("Error al cargar minas auxiliares", error);
      } finally {
        setLoadingMinas(false);
      }
    };

    /**
     * Carga el catálogo de marcas de forma individual y asíncrona.
     */
    const loadMarcas = async () => {
      setLoadingMarcas(true);
      try {
        const res = await AuxService.get_marcas();
        if (res.success) setMarcas(res.data);
      } catch (error) {
        console.error("Error al cargar marcas auxiliares", error);
      } finally {
        setLoadingMarcas(false);
      }
    };

    // Lanzar las peticiones de forma concurrente pero totalmente independiente
    loadProductos();
    loadAlmacenes();
    loadMinas();
    loadMarcas();
  }, []);

  /**
   * Agrega una nueva marca registrada al listado local de marcas disponibles.
   * @param nuevaMarca Objeto de marca devuelto por la API.
   */
  const addMarca = (nuevaMarca: RES_Marca) => {
    setMarcas((prev) => [...prev, nuevaMarca]);
  };

  /**
   * Realiza la llamada al servicio de activos fijos para crear un nuevo registro.
   * @param payload Estructura de datos requerida para crear el activo.
   * @returns RES_ActivoFijoResumen | null El objeto de activo creado o null.
   */
  const crearActivo = async (
    payload: REQ_CrearActivo,
  ): Promise<RES_ActivoFijoResumen | null> => {
    try {
      const res = await ActivosService.crearActivo(payload);
      if (res.success) {
        notifySuccess("Activo registrado correctamente");
        return res.data;
      }
      notifyError(res.message);
    } catch (error) {
      console.error("Error al registrar activo", error);
      notifyError("Error al registrar activo");
    }
    return null;
  };

  return {
    productos,
    almacenes,
    minas,
    marcas,
    loadingProductos,
    loadingAlmacenes,
    loadingMinas,
    loadingMarcas,
    addMarca,
    crearActivo,
  };
};
