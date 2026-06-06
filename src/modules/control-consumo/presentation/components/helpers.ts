import { TipoBien } from "../../../../shared/enums/_generic/tipo-bien";
import type { RES_ResumenEntregasReq } from "../../service/control-consumo.responses";

export const isActivoFijo = (r: RES_ResumenEntregasReq) =>
  r.tipo_bien === TipoBien.ActivoFijo;

export const isConsumible = (r: RES_ResumenEntregasReq) =>
  r.es_consumible === true || Number(r.es_consumible) === 1;

export const isOtros = (r: RES_ResumenEntregasReq) =>
  !isActivoFijo(r) && !isConsumible(r);
