import { api } from './_api';
import type { IRespuesta } from '../shared/interfaces/_response';
import type { RES_LoteMineral } from './responses/lote-mineral';

export interface RegistrarLoteMineralRequest {
  id_contratista: number;
  id_mina: number;
  id_labor?: number | null;
  codigo_interno?: null;
  descripcion?: string | null;
  fecha_inicio_produccion?: string | null;
}

class LoteMineralService {
  private readonly PATH = '/lote-mineral';

  public async getLotes(params: { mes?: number; anio?: number } = {}) {
    const searchParams = new URLSearchParams();
    if (params.mes) searchParams.append('mes', params.mes.toString());
    if (params.anio) searchParams.append('anio', params.anio.toString());

    const queryString = searchParams.toString();
    const url = queryString ? `${this.PATH}?${queryString}` : this.PATH;

    const { data } = await api.get<IRespuesta<RES_LoteMineral[]>>(url);
    return data;
  }

  public async registrarLote(request: RegistrarLoteMineralRequest) {
    const { data } = await api.post<IRespuesta<RES_LoteMineral>>(this.PATH, request);
    return data;
  }
}

export const globalLoteMineralService = new LoteMineralService();
