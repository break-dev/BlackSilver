import { api } from '../../../service/_api';
import type { IRespuesta } from '../../../shared/interfaces/_response';
import type { LoteMineral } from './lote-mineral.responses';
import type { RegistrarLoteMineralRequest } from './lote-mineral.requests';

class LoteMineralService {
  private readonly PATH = '/lote-mineral';

  public async getLotes(params: { mes?: number; anio?: number } = {}) {
    const searchParams = new URLSearchParams();
    if (params.mes) searchParams.append('mes', params.mes.toString());
    if (params.anio) searchParams.append('anio', params.anio.toString());

    const queryString = searchParams.toString();
    const url = queryString ? `${this.PATH}?${queryString}` : this.PATH;

    const { data } = await api.get<IRespuesta<LoteMineral[]>>(url);
    return data;
  }

  public async registrarLote(request: RegistrarLoteMineralRequest) {
    const { data } = await api.post<IRespuesta<LoteMineral>>(this.PATH, request);
    return data;
  }
}

export const loteMineralService = new LoteMineralService();
