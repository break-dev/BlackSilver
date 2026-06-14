import { api } from "../../../service/_api";
import type { IRespuesta } from "../../../shared/interfaces/_response";
import type { DTO_CrearMantenimiento } from "./mantenimiento.requests";
import type {
  RES_Mantenimiento,
  RES_ProductoDespachadoPendiente,
} from "./mantenimiento.responses";

const path = "/mantenimiento-activos";

export const MantenimientoService = {
  getMantenimientos: async (
    mes: number,
    yearcito: number,
    id_activo_fijo?: number | null
  ) => {
    const { data } = await api.get<IRespuesta<RES_Mantenimiento[]>>(path, {
      params: { mes, yearcito, id_activo_fijo },
    });
    return data;
  },

  getProductosDespachados: async (id_activo_fijo: number) => {
    const { data } = await api.get<
      IRespuesta<RES_ProductoDespachadoPendiente[]>
    >(`${path}/productos-despachados`, {
      params: { id_activo_fijo },
    });
    return data;
  },

  crearMantenimiento: async (dto: DTO_CrearMantenimiento) => {
    const fd = new FormData();
    fd.append("id_activo_fijo", String(dto.id_activo_fijo));
    if (dto.id_mina) fd.append("id_mina", String(dto.id_mina));
    if (dto.id_almacen) fd.append("id_almacen", String(dto.id_almacen));
    if (dto.id_empleado_supervisor)
      fd.append("id_empleado_supervisor", String(dto.id_empleado_supervisor));
    if (dto.id_proveedor) fd.append("id_proveedor", String(dto.id_proveedor));
    if (dto.id_personal_externo)
      fd.append("id_personal_externo", String(dto.id_personal_externo));
    if (dto.id_empleado_ejecutor)
      fd.append("id_empleado_ejecutor", String(dto.id_empleado_ejecutor));
    fd.append("fecha_hora_mantenimiento", dto.fecha_hora_mantenimiento);
    if (dto.observacion) fd.append("observacion", dto.observacion);
    if (dto.lugar_trabajo) fd.append("lugar_trabajo", dto.lugar_trabajo);
    if (dto.serie_factura) fd.append("serie_factura", dto.serie_factura);
    if (dto.numero_factura) fd.append("numero_factura", dto.numero_factura);
    if (dto.costo_mano_obra !== undefined && dto.costo_mano_obra !== null)
      fd.append("costo_mano_obra", String(dto.costo_mano_obra));

    if (dto.otros_gastos) {
      dto.otros_gastos.forEach((g, index) => {
        fd.append(`otros_gastos[${index}][concepto]`, g.concepto);
        fd.append(`otros_gastos[${index}][costo]`, String(g.costo));
      });
    }

    if (dto.productos_consumidos) {
      dto.productos_consumidos.forEach((p, index) => {
        fd.append(
          `productos_consumidos[${index}][id_entrega_detalle]`,
          String(p.id_entrega_detalle)
        );
        fd.append(
          `productos_consumidos[${index}][cantidad]`,
          String(p.cantidad)
        );
        if (p.comentario) {
          fd.append(
            `productos_consumidos[${index}][comentario]`,
            p.comentario
          );
        }
      });
    }

    if (dto.evidencias) {
      dto.evidencias.forEach((file) => {
        fd.append("evidencias[]", file);
      });
    }

    const { data } = await api.post<IRespuesta<unknown>>(path, fd, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  },
};
