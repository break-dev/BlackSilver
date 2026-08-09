import { useState, useEffect, useCallback, useMemo } from "react";
import { OrganigramaService } from "../service/organigrama.service";
import { useNotify } from "../../../hooks/useNotify";
import type {
  RES_Area,
  RES_Cargo,
} from "../../../service/responses/organigrama";
import { EstadoBase } from "../../../shared/enums/_generic/estado-base";

export const useOrganigrama = () => {
  const { notifyError, notifySuccess } = useNotify();

  const [areas, setAreas] = useState<RES_Area[]>([]);
  const [cargosSinArea, setCargosSinArea] = useState<RES_Cargo[]>([]);
  const [loading, setLoading] = useState(false);
  const [busquedaAreas, setBusquedaAreas] = useState("");

  // Cargar áreas con cargos y cargos sin área por separado
  const cargarDatos = useCallback(async () => {
    setLoading(true);
    try {
      const [respAreas, respCargosSinArea] = await Promise.all([
        OrganigramaService.get_areas(true),
        OrganigramaService.get_cargos_sin_area(),
      ]);

      if (respAreas.success) setAreas(respAreas.data);
      if (respCargosSinArea.success) setCargosSinArea(respCargosSinArea.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carga inicial
  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Filtrado de áreas en base a la búsqueda
  const areasFiltradas = useMemo(() => {
    const q = busquedaAreas.toLowerCase().trim();
    if (!q) return areas;
    return areas.filter(
      (area) =>
        area.nombre.toLowerCase().includes(q) ||
        area.cargos?.some((c) => c.nombre.toLowerCase().includes(q)),
    );
  }, [areas, busquedaAreas]);

  // Filtrado de cargos sin área
  const cargosSinAreaFiltrados = useMemo(() => {
    const q = busquedaAreas.toLowerCase().trim();
    if (!q) return cargosSinArea;
    return cargosSinArea.filter((c) => c.nombre.toLowerCase().includes(q));
  }, [cargosSinArea, busquedaAreas]);

  // Al crear un área (ya con sus cargos desde la API)
  const onAreaCreada = (nueva: RES_Area) => {
    setAreas((prev) => [nueva, ...prev]);
  };

  // Al crear un cargo — decide si va a su área o a los sin área
  const onCargoCreado = (nuevo: RES_Cargo) => {
    if (nuevo.id_area === null) {
      setCargosSinArea((prev) => [...prev, nuevo]);
    } else {
      setAreas((prev) =>
        prev.map((area) =>
          area.id_area === nuevo.id_area
            ? { ...area, cargos: [...(area.cargos ?? []), nuevo] }
            : area,
        ),
      );
    }
  };

  // Drag & drop: mover cargo entre áreas (o quitarle el área)
  const handleMoverCargo = async (id_cargo: number, id_area_destino: number | null) => {
    // Buscar el cargo en todas las fuentes
    let cargo: RES_Cargo | undefined;
    let areaOrigen: number | null = null;

    const sinAreaMatch = cargosSinArea.find((c) => c.id_cargo === id_cargo);
    if (sinAreaMatch) {
      cargo = sinAreaMatch;
      areaOrigen = null;
    } else {
      for (const area of areas) {
        const found = area.cargos?.find((c) => c.id_cargo === id_cargo);
        if (found) {
          cargo = found;
          areaOrigen = area.id_area;
          break;
        }
      }
    }

    if (!cargo || areaOrigen === id_area_destino) return;

    try {
      const resp = await OrganigramaService.actualizar_area_cargo(id_cargo, id_area_destino);
      if (!resp.success) {
        notifyError(resp.message);
        return;
      }

      const cargoActualizado: RES_Cargo = { ...cargo, id_area: id_area_destino };

      // Remover del origen
      if (areaOrigen === null) {
        setCargosSinArea((prev) => prev.filter((c) => c.id_cargo !== id_cargo));
      } else {
        setAreas((prev) =>
          prev.map((area) =>
            area.id_area === areaOrigen
              ? { ...area, cargos: area.cargos?.filter((c) => c.id_cargo !== id_cargo) ?? [] }
              : area,
          ),
        );
      }

      // Añadir al destino
      if (id_area_destino === null) {
        setCargosSinArea((prev) => [...prev, cargoActualizado]);
      } else {
        setAreas((prev) =>
          prev.map((area) =>
            area.id_area === id_area_destino
              ? { ...area, cargos: [...(area.cargos ?? []), cargoActualizado] }
              : area,
          ),
        );
      }

      notifySuccess("Cargo movido correctamente");
    } catch (err) {
      console.error(err);
      notifyError("Error al mover el cargo");
    }
  };

  const handleCambiarEstadoCargo = async (id_cargo: number) => {
    try {
      const resp = await OrganigramaService.cambiar_estado_cargo(id_cargo);
      if (!resp.success) return;

      const toggleEstado = (cargo: RES_Cargo): RES_Cargo => ({
        ...cargo,
        estado: cargo.estado === EstadoBase.Activo ? EstadoBase.Inactivo : EstadoBase.Activo,
      });

      setCargosSinArea((prev) =>
        prev.map((c) => (c.id_cargo === id_cargo ? toggleEstado(c) : c)),
      );

      setAreas((prev) =>
        prev.map((area) => ({
          ...area,
          cargos: area.cargos?.map((c) =>
            c.id_cargo === id_cargo ? toggleEstado(c) : c,
          ),
        })),
      );
    } catch (err) {
      console.error(err);
    }
  };

  return {
    areas,
    cargosSinArea,
    busquedaAreas,
    setBusquedaAreas,
    areasFiltradas,
    cargosSinAreaFiltrados,
    loading,
    recargar: cargarDatos,
    onAreaCreada,
    onCargoCreado,
    handleMoverCargo,
    handleCambiarEstadoCargo,
  };
};
