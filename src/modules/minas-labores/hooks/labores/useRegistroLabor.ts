import { useState, useEffect, useCallback } from "react";
import dayjs from "dayjs";
import { useNotify } from "../../../../hooks/useNotify";
import { MinasService } from "../../service/minas.service";
import { Schema_CrearLabor } from "../../service/minas.requests";
import type {
  RES_EmpresaEjecutora,
  RES_Labor,
  RES_TipoLabor,
} from "../../service/minas.responses";

interface Props {
  idMina: number;
  onSuccess: (nueva: RES_Labor) => void;
  onCancel: () => void;
}

export const useRegistroLabor = ({ idMina, onSuccess, onCancel }: Props) => {
  const { notify } = useNotify();

  // Datos para los selects
  const [tiposLabor, setTiposLabor] = useState<RES_TipoLabor[]>([]);
  const [empresasEjecutoras, setEmpresasEjecutoras] = useState<
    RES_EmpresaEjecutora[]
  >([]);
  const [loadingSelects, setLoadingSelects] = useState(false);

  // Form state
  const [idEmpresa, setIdEmpresa] = useState<number | null>(null);
  const [idTipoLabor, setIdTipoLabor] = useState<number | null>(null);
  const [nombre, setNombre] = useState("");
  const [prefijo, setPrefijo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tipoSostenimiento, setTipoSostenimiento] = useState("Convencional");
  const [veta, setVeta] = useState("");
  const [ancho, setAncho] = useState<string>("");
  const [alto, setAlto] = useState<string>("");
  const [nivel, setNivel] = useState("");
  const [fechaInicio, setFechaInicio] = useState<Date | null>(null);
  const [fechaFinEstimada, setFechaFinEstimada] = useState<Date | null>(null);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = useCallback(() => {
    setIdEmpresa(null);
    setIdTipoLabor(null);
    setNombre("");
    setPrefijo("");
    setDescripcion("");
    setTipoSostenimiento("Convencional");
    setVeta("");
    setAncho("");
    setAlto("");
    setNivel("");
    setFechaInicio(null);
    setFechaFinEstimada(null);
    setFormError("");
  }, []);

  const cargarSelects = useCallback(async () => {
    setLoadingSelects(true);
    try {
      const [resTipos, resEmpresas] = await Promise.all([
        MinasService.getTiposLabor(),
        MinasService.getEmpresasEjecutoras(idMina),
      ]);
      if (resTipos.success) setTiposLabor(resTipos.data);
      if (resEmpresas.success)
        setEmpresasEjecutoras(resEmpresas.data);
    } catch {
      notify({
        type: "error",
        content: "Error al cargar los datos del formulario",
      });
    } finally {
      setLoadingSelects(false);
    }
  }, [idMina, notify]);

  useEffect(() => {
    cargarSelects();
  }, [cargarSelects]);

  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  const handleSubmit = async () => {
    setFormError("");

    const validation = Schema_CrearLabor.safeParse({
      id_mina: idMina,
      id_empresa: idEmpresa,
      id_tipo_labor: idTipoLabor,
      nombre: nombre,
      prefijo: prefijo,
      descripcion: descripcion || null,
      tipo_sostenimiento: tipoSostenimiento,
      veta: veta || null,
      ancho: ancho ? parseFloat(ancho) : null,
      alto: alto ? parseFloat(alto) : null,
      nivel: nivel || null,
      fecha_inicio: fechaInicio ? dayjs(fechaInicio).format("YYYY-MM-DD") : null,
      fecha_fin_estimada: fechaFinEstimada ? dayjs(fechaFinEstimada).format("YYYY-MM-DD") : null,
    });

    if (!validation.success) {
      setFormError(validation.error.issues[0].message);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await MinasService.crearLabor(validation.data);
      if (res.success) {
        notify({
          type: "success",
          content: "Labor registrada correctamente",
        });
        onSuccess(res.data);
        resetForm();
      } else {
        setFormError(res.message);
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const msg = err.response?.data?.message || "Error inesperado al crear la labor";
      setFormError(msg);
      notify({
        type: "error",
        content: msg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    // Selects
    tiposLabor,
    empresasEjecutoras,
    loadingSelects,
    // Form
    idEmpresa,
    setIdEmpresa,
    idTipoLabor,
    setIdTipoLabor,
    nombre,
    setNombre,
    prefijo,
    setPrefijo,
    descripcion,
    setDescripcion,
    tipoSostenimiento,
    setTipoSostenimiento,
    veta,
    setVeta,
    ancho,
    setAncho,
    alto,
    setAlto,
    nivel,
    setNivel,
    fechaInicio,
    setFechaInicio,
    fechaFinEstimada,
    setFechaFinEstimada,
    formError,
    isSubmitting,
    handleSubmit,
    handleCancel,
  };
};
