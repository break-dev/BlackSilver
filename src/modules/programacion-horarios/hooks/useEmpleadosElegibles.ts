import { useCallback, useEffect, useMemo, useState } from "react";
import { ProgramacionHorarioService } from "../service/programacion.service";
import type { RES_EmpleadoElegible } from "../service/programacion.responses";
import { useNotify } from "../../../hooks/useNotify";
import { useAuditoriaStore } from "../../../stores/auditoria.store";

/**
 * Carga los empleados con contrato vigente Activo, y opcionalmente anota
 * `puede_cubrir = false` para aquellos cuyo contrato culmina antes de la
 * `fechaFinProgramacion` indicada (o cuyo contrato no es por tiempo indefinido
 * y ya venció).
 *
 * Si se pasan `idLugar` y `tipoLugar`, el endpoint prioriza los empleados que
 * YA tienen programaciones en ese lugar (campo `matchea_lugar`).
 */
export const useEmpleadosElegibles = (
  fechaFinProgramacion: string | null,
  idLugar: number | null = null,
  tipoLugar: "" | "almacen" | "labor" | "oficina" | null = null,
) => {
  const { notifyError } = useNotify();
  const { en_modo_auditable } = useAuditoriaStore();
  const [empleados, setEmpleados] = useState<RES_EmpleadoElegible[]>([]);
  const [loading, setLoading] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await ProgramacionHorarioService.get_empleados_elegibles(
        fechaFinProgramacion,
        idLugar,
        tipoLugar,
      );
      if (resp.success) {
        setEmpleados(resp.data as RES_EmpleadoElegible[]);
      }
    } catch (err) {
      console.error(err);
      notifyError("No se pudieron cargar los empleados elegibles");
    } finally {
      setLoading(false);
    }
  }, [fechaFinProgramacion, idLugar, tipoLugar, notifyError]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const empleadosFiltrados = useMemo(() => {
    if (!en_modo_auditable) return empleados;
    return empleados.filter((emp) => {
      const tipo = emp.tipo_contrato_vigente;
      return tipo === "Planilla" || tipo === "PeriodoPrueba";
    });
  }, [empleados, en_modo_auditable]);

  return { empleados: empleadosFiltrados, loading, recargar: cargar };
};