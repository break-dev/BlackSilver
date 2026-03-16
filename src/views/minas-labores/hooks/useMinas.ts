import { useState, useEffect, useMemo, useCallback } from "react";
import { useDisclosure } from "@mantine/hooks";
import { useUIStore } from "../../../stores/ui.store";
import { useNotify } from "../../../hooks/useNotify";
import { MinasService } from "../service/minas.service";
import type {
  RES_ConcesionItem,
  RES_ResumenMina,
} from "../service/minas.responses";

export const useMinas = () => {
  const setTitle = useUIStore((state) => state.setTitle);
  const { notify } = useNotify();

  // Concesiones — solo para el formulario de nueva mina
  const [concesiones, setConcesiones] = useState<RES_ConcesionItem[]>([]);

  // Minas — se cargan TODAS al montar, sin filtro de concesión
  const [minas, setMinas] = useState<RES_ResumenMina[]>([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  // Modales
  const [openedCreate, { open: openCreate, close: closeCreate }] =
    useDisclosure(false);
  const [openedEmpresas, { open: openEmpresas, close: closeEmpresas }] =
    useDisclosure(false);
  const [
    openedResponsables,
    { open: openResponsables, close: closeResponsables },
  ] = useDisclosure(false);
  const [openedLabores, { open: openLabores, close: closeLabores }] =
    useDisclosure(false);

  const [selectedMina, setSelectedMina] = useState<RES_ResumenMina | null>(
    null,
  );

  // Cargar concesiones (para el selector dentro del modal de crear)
  const cargarConcesiones = useCallback(async () => {
    try {
      const { data: res } = await MinasService.getConcesionesSesion();
      if (res.success) {
        setConcesiones(res.data);
      } else {
        notify({ type: "error", content: res.message });
      }
    } catch {
      notify({ type: "error", content: "Error al cargar las concesiones" });
    }
  }, [notify]);

  // Cargar TODAS las minas sin filtro
  const cargarMinas = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res } = await MinasService.getMinasResumen();
      if (res.success) {
        setMinas(res.data);
      } else {
        notify({ type: "error", content: res.message });
      }
    } catch {
      notify({ type: "error", content: "Error al cargar las minas" });
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    setTitle("Minas y Labores");
    cargarConcesiones();
    cargarMinas();
  }, [setTitle, cargarConcesiones, cargarMinas]);

  const minasFiltradas = useMemo(() => {
    const q = busqueda.toLowerCase();
    return minas.filter((m) => !q || m.nombre.toLowerCase().includes(q));
  }, [minas, busqueda]);

  const handleMinaCreada = (nueva: RES_ResumenMina) => {
    setMinas((prev) => [nueva, ...prev]);
    closeCreate();
    notify({ type: "success", content: "Mina creada correctamente" });
  };

  const handleOpenEmpresas = (mina: RES_ResumenMina) => {
    setSelectedMina(mina);
    openEmpresas();
  };

  const handleOpenResponsables = (mina: RES_ResumenMina) => {
    setSelectedMina(mina);
    openResponsables();
  };

  const handleOpenLabores = (mina: RES_ResumenMina) => {
    setSelectedMina(mina);
    openLabores();
  };

  const handleLaborRegistrada = (id_mina: number) => {
    setMinas((prev) =>
      prev.map((m) =>
        m.id_mina === id_mina
          ? { ...m, cantidad_labores: m.cantidad_labores + 1 }
          : m,
      ),
    );
  };

  const handleResponsableAsignado = (
    id_mina: number,
    nuevoNombreResponsable: string,
  ) => {
    setMinas((prev) =>
      prev.map((m) =>
        m.id_mina === id_mina
          ? { ...m, responsable: nuevoNombreResponsable }
          : m,
      ),
    );
  };

  return {
    // Concesiones (solo para formulario de crear)
    concesiones,

    // Minas
    minas,
    minasFiltradas,
    loading,
    busqueda,
    setBusqueda,

    // Modales
    openedCreate,
    openCreate,
    closeCreate,
    openedEmpresas,
    closeEmpresas,
    openedResponsables,
    closeResponsables,
    openedLabores,
    closeLabores,
    selectedMina,

    // Handlers
    handleMinaCreada,
    handleOpenEmpresas,
    handleOpenResponsables,
    handleOpenLabores,
    handleResponsableAsignado,
    handleLaborRegistrada,
  };
};
