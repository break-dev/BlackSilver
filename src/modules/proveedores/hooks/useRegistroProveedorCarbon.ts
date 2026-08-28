import { useState } from "react";
import { ProveedoresService } from "../service/proveedores.service";
import { useNotify } from "../../../hooks/useNotify";
import {
  Schema_CrearProveedor,
  type CrearProveedorRequest,
  type CrearPersonalRequest,
} from "../service/proveedores.requests";
import { TipoEntidad } from "../../../shared/enums/_generic/tipo-entidad";
import type { ProveedorResponse } from "../service/proveedores.responses";
import type { RES_PersonalExterno } from "../../../service/responses/personal-externo";
import { AuxService } from "../../../service/auxiliar.service";
import type { PersonalLocal } from "../../../presentation/utils/modal-personal-externo";

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

/**
 * Lugar de extraccion capturado en el formulario antes de persistir.
 * Se guarda con setLugaresExtraccionPorProveedor (PUT que reemplaza todo).
 */
export interface LugarExtraccionTemporal {
  id_departamento: number;
  departamento_nombre: string;
  id_provincia: number;
  provincia_nombre: string;
  id_distrito: number;
  distrito_nombre: string;
  direccion: string;
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
  });

  const [personal, setpersonal] = useState<PersonalLocal[]>([]);

  const [tiposCarbon, setTiposCarbon] = useState<TipoCarbonTemporal[]>([]);

  const [lugaresExtraccion, setLugaresExtraccion] = useState<
    LugarExtraccionTemporal[]
  >([]);

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

  const addpersonal = (r: PersonalLocal) => {
    setpersonal((prev) => [...prev, r]);
  };

  const removepersonal = (idx: number) => {
    setpersonal((prev) => prev.filter((_, i) => i !== idx));
  };

  const setTiposCarbonSeleccionados = (
  ids: number[],
  catalogo: readonly TipoCarbonTemporal[],
) => {
  const mapa = new Map(catalogo.map((t) => [t.id_tipo_carbon, t]));
  const next: TipoCarbonTemporal[] = [];
  for (const id of ids) {
    const t = mapa.get(id);
    if (t) next.push(t);
  }
  setTiposCarbon(next);
};

  const addLugarExtraccion = (l: LugarExtraccionTemporal) => {
    setLugaresExtraccion((prev) => {
      // Evitar duplicados exactos por (dpto+prov+dist+dir normalizada).
      const key = `${l.id_departamento}-${l.id_provincia}-${l.id_distrito}-${l.direccion.trim().toLowerCase()}`;
      if (
        prev.some(
          (x) =>
            `${x.id_departamento}-${x.id_provincia}-${x.id_distrito}-${x.direccion
              .trim()
              .toLowerCase()}` === key,
        )
      ) {
        return prev;
      }
      return [...prev, l];
    });
  };

  const removeLugarExtraccion = (idx: number) => {
    setLugaresExtraccion((prev) => prev.filter((_, i) => i !== idx));
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

      // 2) crear personal en secuencia. Un fallo aqui no revierte
      //    el proveedor (backend no transacciona entre tablas); pero
      //    avisamos al usuario y dejamos la fila pendiente.
      const fallidos: string[] = [];
      for (const r of personal) {
        try {
          const repPayload: CrearPersonalRequest = {
            nombre: r.nombre,
            apellido: r.apellido,
            dni: r.dni,
          };
          await AuxService.crear_personal_externo({
            id_proveedor: created.id_proveedor,
            nombre: repPayload.nombre,
            apellido: repPayload.apellido,
            dni: repPayload.dni,
          });
        } catch (err) {
          console.error(err);
          fallidos.push(`${r.nombre} ${r.apellido ?? ""}`.trim());
        }
      }

      // 3) asociar tipos de carbon. Un fallo aqui no revierte el proveedor
      //    ni los personal; avisamos y dejamos pendiente.
      let tiposFallaron = false;
      if (tiposCarbon.length > 0) {
        try {
          const respTipos = await ProveedoresService.setTiposCarbonPorProveedor(
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

      // 4) asociar lugares de extraccion. Un fallo aqui no revierte nada
      //    previo; avisamos y dejamos pendiente.
      let lugaresFallaron = false;
      if (lugaresExtraccion.length > 0) {
        try {
          const respLugares =
            await ProveedoresService.setLugaresExtraccionPorProveedor(
              created.id_proveedor,
              {
                lugares: lugaresExtraccion.map((l) => ({
                  id_departamento: l.id_departamento,
                  id_provincia: l.id_provincia,
                  id_distrito: l.id_distrito,
                  direccion: l.direccion.trim(),
                })),
              },
            );
          lugaresFallaron = !respLugares.success;
        } catch (err) {
          console.error(err);
          lugaresFallaron = true;
        }
      }

      const piezas: string[] = [];
      if (fallidos.length > 0) {
        piezas.push(`personal: ${fallidos.join(", ")}`);
      }
      if (tiposFallaron) {
        piezas.push("tipos de carbon (completa desde la lista)");
      }
      if (lugaresFallaron) {
        piezas.push("lugares de extraccion (completa desde la lista)");
      }

      if (piezas.length > 0) {
        notifyError(
          `Proveedor guardado, pero no se pudieron registrar ${piezas.join("; ")}.`,
        );
      } else {
        notifySuccess(
          "Proveedor, personal, tipos de carbon y lugares de extraccion registrados correctamente",
        );
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
    personal,
    tiposCarbon,
    lugaresExtraccion,
    loading,
    error,
    handleChange,
    handleSelectChange,
    addpersonal,
    removepersonal,
    setTiposCarbonSeleccionados,
    addLugarExtraccion,
    removeLugarExtraccion,
    submit,
  };
};

// Re-export para no obligar al componente a importar dos lugares.
export type { RES_PersonalExterno };
