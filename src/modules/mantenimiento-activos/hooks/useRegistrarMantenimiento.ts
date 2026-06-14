import { useState, useEffect, useCallback } from "react";
import dayjs from "dayjs";
import { useNotify } from "../../../hooks/useNotify";
import { MantenimientoService } from "../service/mantenimiento.service";
import { AuxService } from "../../../service/auxiliar.service";
import type { DTO_CrearMantenimiento } from "../service/mantenimiento.requests";
import type { RES_ActivoFijoDisponible } from "../../../service/responses/activo-fijo";
import type { RES_Mina } from "../../../service/responses/mina";
import type { RES_Almacen } from "../../../service/responses/almacen";
import type { RES_Empleado } from "../../../service/responses/empleado";
import type { RES_Proveedor } from "../../../service/responses/proveedor";
import type { RES_PersonalExterno } from "../../../service/responses/personal-externo";
import type { RES_ProductoDespachadoPendiente } from "../service/mantenimiento.responses";

interface UseRegistrarMantenimientoProps {
  initialActivoId?: number | null;
  onSuccess: () => void;
}

export interface GastoItem {
  concepto: string;
  costo: number;
}

export interface ProductoConsumidoItem {
  id_entrega_detalle: number;
  producto: string;
  unidad: string;
  maxCantidad: number;
  cantidad: number;
  comentario: string;
}

export const useRegistrarMantenimiento = ({
  initialActivoId,
  onSuccess,
}: UseRegistrarMantenimientoProps) => {
  const { notifySuccess, notifyError } = useNotify();

  // Catalogs loading
  const [loadingCatalogs, setLoadingCatalogs] = useState(false);
  const [loadingPersonal, setLoadingPersonal] = useState(false);
  const [loadingDespachados, setLoadingDespachados] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Catalogs
  const [activos, setActivos] = useState<RES_ActivoFijoDisponible[]>([]);
  const [minas, setMinas] = useState<RES_Mina[]>([]);
  const [almacenes, setAlmacenes] = useState<RES_Almacen[]>([]);
  const [empleados, setEmpleados] = useState<RES_Empleado[]>([]);
  const [proveedores, setProveedores] = useState<RES_Proveedor[]>([]);
  const [personalExterno, setPersonalExterno] = useState<RES_PersonalExterno[]>([]);
  
  // Pending products for selected asset
  const [productosDespachados, setProductosDespachados] = useState<
    RES_ProductoDespachadoPendiente[]
  >([]);

  // Form states
  const [idActivoFijo, setIdActivoFijo] = useState<number | null>(
    initialActivoId || null
  );
  const [tipoLugar, setTipoLugar] = useState<"almacen" | "mina" | "otro" | "">("");
  const [idMina, setIdMina] = useState<number | null>(null);
  const [idAlmacen, setIdAlmacen] = useState<number | null>(null);
  const [lugarOtro, setLugarOtro] = useState("");

  const [tipoEjecutor, setTipoEjecutor] = useState<"interno" | "externo">("interno");
  const [idEmpleadoEjecutor, setIdEmpleadoEjecutor] = useState<number | null>(null);
  const [idProveedor, setIdProveedor] = useState<number | null>(null);
  const [idPersonalExterno, setIdPersonalExterno] = useState<number | null>(null);
  const [idEmpleadoSupervisor, setIdEmpleadoSupervisor] = useState<number | null>(null);

  const [fechaHoraMantenimiento, setFechaHoraMantenimiento] = useState<Date | null>(new Date());
  const [observacion, setObservacion] = useState("");
  const [serieFactura, setSerieFactura] = useState("");
  const [numeroFactura, setNumeroFactura] = useState("");
  const [costoManoObra, setCostoManoObra] = useState<number | string>("");

  const [otrosGastos, setOtrosGastos] = useState<GastoItem[]>([]);
  const [productosConsumidos, setProductosConsumidos] = useState<ProductoConsumidoItem[]>([]);
  const [evidencias, setEvidencias] = useState<File[]>([]);

  // Initial catalogs fetch
  useEffect(() => {
    const loadCatalogs = async () => {
      setLoadingCatalogs(true);
      try {
        const [resActivos, resMinas, resAlmacenes, resEmpleados, resProveedores] =
          await Promise.all([
            AuxService.get_activos_disponibles(),
            AuxService.get_minas(),
            AuxService.get_almacenes(),
            AuxService.get_empleados(),
            AuxService.get_proveedores({ para_mantenimiento: true }),
          ]);

        if (resActivos.success && resActivos.data) setActivos(resActivos.data);
        if (resMinas.success && resMinas.data) setMinas(resMinas.data);
        if (resAlmacenes.success && resAlmacenes.data) setAlmacenes(resAlmacenes.data);
        if (resEmpleados.success && resEmpleados.data) setEmpleados(resEmpleados.data);
        if (resProveedores.success && resProveedores.data) setProveedores(resProveedores.data);
      } catch (err) {
        console.error(err);
        notifyError("Error al cargar catálogos");
      } finally {
        setLoadingCatalogs(false);
      }
    };
    loadCatalogs();
  }, [notifyError]);

  // Load provider personnel when provider changes
  useEffect(() => {
    setIdPersonalExterno(null);
    setPersonalExterno([]);
    if (!idProveedor) return;

    const loadPersonal = async () => {
      setLoadingPersonal(true);
      try {
        const res = await AuxService.get_personal_externo({
          id_proveedor: idProveedor,
        });
        if (res.success && res.data) {
          setPersonalExterno(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingPersonal(false);
      }
    };
    loadPersonal();
  }, [idProveedor]);

  // Handle active asset change: pre-populate location & fetch pending products
  useEffect(() => {
    setProductosDespachados([]);
    setProductosConsumidos([]);
    if (!idActivoFijo) return;

    // Prepopulate location
    const act = activos.find((a) => a.id_activo === idActivoFijo);
    if (act) {
      if (act.id_almacen) {
        setTipoLugar("almacen");
        setIdAlmacen(act.id_almacen);
        setIdMina(null);
        setLugarOtro("");
      } else if (act.id_mina) {
        setTipoLugar("mina");
        setIdMina(act.id_mina);
        setIdAlmacen(null);
        setLugarOtro("");
      } else {
        setTipoLugar("");
        setIdMina(null);
        setIdAlmacen(null);
        setLugarOtro("");
      }
    }

    // Fetch pending products
    const loadDespachados = async () => {
      setLoadingDespachados(true);
      try {
        const res = await MantenimientoService.getProductosDespachados(idActivoFijo);
        if (res.success && res.data) {
          setProductosDespachados(res.data);
          // Auto fill form consumidos with 0
          const items: ProductoConsumidoItem[] = res.data.map((d) => ({
            id_entrega_detalle: d.id_entrega_detalle,
            producto: d.producto,
            unidad: d.unidad_base_abv,
            maxCantidad: d.restante_base,
            cantidad: 0,
            comentario: "",
          }));
          setProductosConsumidos(items);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingDespachados(false);
      }
    };
    loadDespachados();
  }, [idActivoFijo, activos]);

  // Manage otros_gastos
  const agregarGasto = useCallback(() => {
    setOtrosGastos((prev) => [...prev, { concepto: "", costo: 0 }]);
  }, []);

  const eliminarGasto = useCallback((index: number) => {
    setOtrosGastos((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const actualizarGasto = useCallback(
    (index: number, field: keyof GastoItem, value: string | number) => {
      setOtrosGastos((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], [field]: value } as GastoItem;
        return next;
      });
    },
    []
  );

  // Manage products consumidos quantities
  const actualizarCantidadProducto = useCallback(
    (index: number, val: number) => {
      setProductosConsumidos((prev) => {
        const next = [...prev];
        const maxVal = next[index].maxCantidad;
        next[index].cantidad = Math.max(0, Math.min(val, maxVal));
        return next;
      });
    },
    []
  );

  const actualizarComentarioProducto = useCallback(
    (index: number, val: string) => {
      setProductosConsumidos((prev) => {
        const next = [...prev];
        next[index].comentario = val;
        return next;
      });
    },
    []
  );

  const handleConfirmarPersonalExterno = useCallback((nuevo: RES_PersonalExterno) => {
    setPersonalExterno(prev => [...prev, nuevo]);
    setIdPersonalExterno(nuevo.id_personal);
    notifySuccess("Personal registrado y seleccionado.");
  }, [notifySuccess]);

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idActivoFijo || !fechaHoraMantenimiento) {
      notifyError("Complete los campos obligatorios");
      return;
    }

    setSubmitting(true);
    try {
      const gns = otrosGastos.filter((g) => g.concepto.trim() !== "" && g.costo > 0);
      const prs = productosConsumidos.filter((p) => p.cantidad > 0);

      const dto: DTO_CrearMantenimiento = {
        id_activo_fijo: idActivoFijo,
        id_mina: tipoLugar === "mina" ? idMina : null,
        id_almacen: tipoLugar === "almacen" ? idAlmacen : null,
        id_empleado_supervisor: idEmpleadoSupervisor,
        id_proveedor: tipoEjecutor === "externo" ? idProveedor : null,
        id_personal_externo: tipoEjecutor === "externo" ? idPersonalExterno : null,
        id_empleado_ejecutor: tipoEjecutor === "interno" ? idEmpleadoEjecutor : null,
        fecha_hora_mantenimiento: dayjs(fechaHoraMantenimiento).format(
          "YYYY-MM-DD HH:mm:ss"
        ),
        observacion: observacion.trim() || null,
        lugar_trabajo:
          tipoLugar === "otro"
            ? lugarOtro.trim()
            : tipoLugar === "almacen"
              ? almacenes.find((a) => a.id_almacen === idAlmacen)?.nombre || null
              : tipoLugar === "mina"
                ? minas.find((m) => m.id_mina === idMina)?.nombre || null
                : null,
        serie_factura: serieFactura.trim() || null,
        numero_factura: numeroFactura.trim() || null,
        costo_mano_obra: costoManoObra !== "" ? Number(costoManoObra) : null,
        otros_gastos: gns.length > 0 ? gns : null,
        productos_consumidos:
          prs.length > 0
            ? prs.map((p) => ({
                id_entrega_detalle: p.id_entrega_detalle,
                cantidad: p.cantidad,
                comentario: p.comentario.trim() || null,
              }))
            : null,
        evidencias: evidencias.length > 0 ? evidencias : null,
      };

      const res = await MantenimientoService.crearMantenimiento(dto);
      if (res.success) {
        notifySuccess("Mantenimiento registrado con éxito");
        onSuccess();
      } else {
        notifyError(res.message || "Error al registrar mantenimiento");
      }
    } catch (err) {
      console.error(err);
      notifyError("Error de conexión");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    state: {
      activos,
      minas,
      almacenes,
      empleados,
      proveedores,
      personalExterno,
      productosDespachados,
      idActivoFijo,
      setIdActivoFijo,
      tipoLugar,
      setTipoLugar,
      idMina,
      setIdMina,
      idAlmacen,
      setIdAlmacen,
      lugarOtro,
      setLugarOtro,
      tipoEjecutor,
      setTipoEjecutor,
      idEmpleadoEjecutor,
      setIdEmpleadoEjecutor,
      idProveedor,
      setIdProveedor,
      idPersonalExterno,
      setIdPersonalExterno,
      idEmpleadoSupervisor,
      setIdEmpleadoSupervisor,
      fechaHoraMantenimiento,
      setFechaHoraMantenimiento,
      observacion,
      setObservacion,
      serieFactura,
      setSerieFactura,
      numeroFactura,
      setNumeroFactura,
      costoManoObra,
      setCostoManoObra,
      otrosGastos,
      productosConsumidos,
      evidencias,
      setEvidencias,
    },
    status: {
      loadingCatalogs,
      loadingPersonal,
      loadingDespachados,
      submitting,
    },
    actions: {
      agregarGasto,
      eliminarGasto,
      actualizarGasto,
      actualizarCantidadProducto,
      actualizarComentarioProducto,
      handleConfirmarPersonalExterno,
      handleSubmit,
    },
  };
};
