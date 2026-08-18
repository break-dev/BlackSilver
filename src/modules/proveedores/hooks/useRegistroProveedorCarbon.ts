import { useState } from "react";
import {
  ProveedoresService,
} from "../service/proveedores.service";
import { useNotify } from "../../../hooks/useNotify";
import {
  Schema_CrearProveedor,
  type CrearProveedorRequest,
  type CrearRepresentanteRequest,
} from "../service/proveedores.requests";
import { TipoEntidad } from "../../../shared/enums/_generic/tipo-entidad";
import type { ProveedorResponse } from "../service/proveedores.responses";
import type { RES_PersonalExterno } from "../../../service/responses/personal-externo";

/**
 * Representante capturado en el formulario de registro antes de
 * enviar al backend. Cuando se guarda el proveedor, el backend los
 * crea secuencialmente con id_proveedor + es_representante=1.
 */
export interface RepresentanteTemporal {
  nombre: string;
  apellido?: string;
  dni?: string;
}

/**
 * Tipo de carbon capturado en el formulario de registro antes de
 * enviar al backend. Al guardar el proveedor, se persiste la asociacion
 * mediante setTiposCarbonPorProveedor (PUT que reemplaza el set completo).
 */
export interface TipoCarbonTemporal {
  id_tipo_carbon: number;
  nombre: string;
  codigo: string | null;
}

export const useRegistroProveedorCarbon = (
  onSuccess: (p: ProveedorResponse) => void,
) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { notifySuccess, notifyError } = useNotify();

  const [payload, setPayload] = useState<CrearProveedorRequest>({
    tipo_entidad: TipoEntidad.Juridica,
    para_mantenimiento: false,
    para_transporte: false,
    para_carbon: true, // forzado: este hook solo se usa en el modulo carbon
    dni: "",
    ruc: "",
    razon_social: "",
    direccion: "",
    telefono: "",
    correo: "",
    id_departamento: null,
    id_provincia: null,
    id_distrito: null,
  });

  const [representantes, setRepresentantes] = useState<RepresentanteTemporal[]>(
    [],
  );

  const [tiposCarbon, setTiposCarbon] = useState<TipoCarbonTemporal[]>([]);

  const handleChange = <K extends keyof CrearProveedorRequest>(
    field: K,
    value: CrearProveedorRequest[K],
  ) => {
    setPayload((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const handleSelectChange = (value: string | null) => {
    if (value) {
      setPayload((prev) => ({
        ...prev,
        tipo_entidad: value as TipoEntidad,
        dni: "",
        ruc: "",
      }));
      if (error) setError(null);
    }
  };

  /**
   * Para los selects numericos de geografia (departamento, provincia,
   * distrito). Si el valor es null o string vacio, vacia el id y limpia
   * los hijos de la cascada.
   */
  const handleSelectNumber = (
    field: "id_departamento" | "id_provincia" | "id_distrito",
    value: string | null,
  ) => {
    setPayload((prev) => {
      const num = value ? Number(value) : null;
      if (field === "id_departamento") {
        return {
          ...prev,
          id_departamento: num,
          // al cambiar de departamento, provincia y distrito dejan de aplicar
          id_provincia: null,
          id_distrito: null,
        };
      }
      if (field === "id_provincia") {
        return {
          ...prev,
          id_provincia: num,
          id_distrito: null,
        };
      }
      return { ...prev, id_distrito: num };
    });
    if (error) setError(null);
  };

  const addRepresentante = (r: RepresentanteTemporal) => {
    setRepresentantes((prev) => [...prev, r]);
  };

  const removeRepresentante = (idx: number) => {
    setRepresentantes((prev) => prev.filter((_, i) => i !== idx));
  };

  const addTipoCarbon = (t: TipoCarbonTemporal) => {
    setTiposCarbon((prev) => {
      if (prev.some((x) => x.id_tipo_carbon === t.id_tipo_carbon)) return prev;
      return [...prev, t];
    });
  };

  const removeTipoCarbon = (id_tipo_carbon: number) => {
    setTiposCarbon((prev) =>
      prev.filter((x) => x.id_tipo_carbon !== id_tipo_carbon),
    );
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const validation = Schema_CrearProveedor.safeParse(payload);
    if (!validation.success) {
      setError(validation.error.issues[0].message);
      return;
    }

    setLoading(true);
    try {
      // 1) crear proveedor (forzamos para_carbon=true aqui tambien
      //    por si el payload lo mutaron fuera del hook).
      const created = await ProveedoresService.crearProveedor({
        ...validation.data,
        para_carbon: true,
      });

      // 2) crear representantes en secuencia. Un fallo aqui no revierte
      //    el proveedor (backend no transacciona entre tablas); pero
      //    avisamos al usuario y dejamos la fila pendiente.
      const fallidos: string[] = [];
      for (const r of representantes) {
        try {
          const repPayload: CrearRepresentanteRequest = {
            nombre: r.nombre,
            apellido: r.apellido,
            dni: r.dni,
          };
          await ProveedoresService.crearRepresentante(
            created.id_proveedor,
            repPayload,
          );
        } catch (err) {
          console.error(err);
          fallidos.push(`${r.nombre} ${r.apellido ?? ""}`.trim());
        }
      }

      // 3) asociar tipos de carbon. Un fallo aqui no revierte el proveedor
      //    ni los representantes; avisamos y dejamos pendiente.
      let tiposFallaron = false;
      if (tiposCarbon.length > 0) {
        try {
          const respTipos =
            await ProveedoresService.setTiposCarbonPorProveedor(
              created.id_proveedor,
              {
                tipos_carbon: tiposCarbon.map((t) => t.id_tipo_carbon),
              },
            );
          tiposFallaron = !respTipos.success;
        } catch (err) {
          console.error(err);
          tiposFallaron = true;
        }
      }

      if (fallidos.length > 0 || tiposFallaron) {
        const piezas: string[] = [];
        if (fallidos.length > 0) {
          piezas.push(`representantes: ${fallidos.join(", ")}`);
        }
        if (tiposFallaron) {
          piezas.push("tipos de carbon (completa desde la lista)");
        }
        notifyError(
          `Proveedor guardado, pero no se pudieron registrar ${piezas.join("; ")}.`,
        );
      } else {
        notifySuccess("Proveedor, representantes y tipos de carbon registrados correctamente");
      }

      onSuccess(created);
    } catch (e) {
      console.error(e);
      notifyError("Ocurrio un error al registrar el proveedor de carbon");
    } finally {
      setLoading(false);
    }
  };

  return {
    payload,
    representantes,
    tiposCarbon,
    loading,
    error,
    handleChange,
    handleSelectChange,
    handleSelectNumber,
    addRepresentante,
    removeRepresentante,
    addTipoCarbon,
    removeTipoCarbon,
    submit,
  };
};

// Re-export para no obligar al componente a importar dos lugares.
export type { RES_PersonalExterno };