import { api } from "../../api";
import type { IRespuesta } from "../../../shared/response";
import type { IUseHook } from "../../hook.interface";
import type { RES_Concesion, RES_Asignacion } from "./dtos/responses";
import type {
  DTO_CrearConcesion,
  DTO_EditarConcesion,
  DTO_AsignarEmpresa,
} from "./dtos/requests";

export const useConcesiones = ({ setError }: IUseHook) => {
  const path = "/concesiones";

  // Listar concesiones
  const listar = async () => {
    setError("");
    try {
      const response = await api.get<IRespuesta<RES_Concesion[]>>(path);
      const result = response.data;

      if (result.success) {
        return result.data;
      } else {
        setError(result.message);
        return [];
      }
    } catch (error) {
      setError(String(error));
      return [];
    }
  };

  // Listar concesiones por empresa (para obtener id_asignacion)
  const listarPorEmpresa = async (id_empresa: number) => {
    setError("");
    try {
      const response = await api.post<IRespuesta<RES_Concesion[]>>(
        `${path}/by-empresa`,
        { id_empresa }
      );
      const result = response.data;

      if (result.success) {
        return result.data;
      } else {
        // setError(result.error); // Optional: silent fail for selects
        return [];
      }
    } catch (error) {
      console.error(String(error));
      return [];
    }
  };

  // Crear concesion
  const crearConcesion = async (dto: DTO_CrearConcesion) => {
    setError("");
    try {
      const response = await api.post<IRespuesta<RES_Concesion>>(path, dto);
      const result = response.data;

      if (result.success) {
        return result.data;
      } else {
        setError(result.message);
        return null;
      }
    } catch (error) {
      setError(String(error));
      return null;
    }
  };

  // Editar concesion
  const editar = async (dto: DTO_EditarConcesion) => {
    setError("");
    try {
      const response = await api.put<IRespuesta<RES_Concesion>>(path, dto);
      const result = response.data;

      if (result.success) {
        return result.data;
      } else {
        setError(result.message);
        return null;
      }
    } catch (error) {
      setError(String(error));
      return null;
    }
  };

  // Eliminar concesion
  const eliminar = async (id: number) => {
    setError("");
    try {
      const response = await api.delete<IRespuesta<boolean>>(path, {
        data: { id: id },
      });
      const result = response.data;

      if (result.success) {
        return true;
      } else {
        setError(result.message);
        return false;
      }
    } catch (error) {
      setError(String(error));
      return false;
    }
  };

  // --- Asignaciones ---

  // Listar asignaciones
  const listarAsignaciones = async (id_concesion: number) => {
    try {
      const response = await api.post<IRespuesta<RES_Asignacion[]>>(
        `${path}/asignaciones`,
        { id_concesion }
      );
      const result = response.data;

      if (result.success) {
        return result.data;
      } else {
        console.error(result.message);
        return [];
      }
    } catch (error) {
      console.error(String(error));
      return [];
    }
  };

  // Asignar empresa
  const asignarEmpresa = async (dto: DTO_AsignarEmpresa) => {
    setError("");
    try {
      const response = await api.post<IRespuesta<boolean>>(
        `${path}/asignar`,
        dto
      );
      const result = response.data;

      if (result.success) {
        return true;
      } else {
        setError(result.message);
        return false;
      }
    } catch (error) {
      setError(String(error));
      return false;
    }
  };

  // Desasignar empresa
  const desasignarEmpresa = async (id_asignacion: number) => {
    setError("");
    try {
      const response = await api.post<IRespuesta<boolean>>(
        `${path}/desasignar`,
        { id_asignacion }
      );
      const result = response.data;

      if (result.success) {
        return true;
      } else {
        setError(result.message);
        return false;
      }
    } catch (error) {
      setError(String(error));
      return false;
    }
  };

  // Listar tipos de mineral
  const listarTiposMineral = async () => {
    try {
      const response = await api.get<IRespuesta<string[]>>(
        `${path}/tipos-mineral`
      );
      const result = response.data;
      if (result.success) return result.data;
      return [];
    } catch (error) {
      console.error(String(error));
      return [];
    }
  };

  return {
    listar,
    listarPorEmpresa,
    crearConcesion,
    editar,
    eliminar,
    listarAsignaciones,
    asignarEmpresa,
    desasignarEmpresa,
    listarTiposMineral,
  };
};
