import { useState, useEffect, useMemo, useCallback } from "react";
import { useDisclosure } from "@mantine/hooks";
import { useUIStore } from "../../../stores/ui.store";
import { useNotify } from "../../../hooks/useNotify";
import { MinasService } from "../service/minas.service";
import type {
  RES_ConcesionItem,
  RES_ResumenMina,
} from "../service/minas.responses";

export const useMinasPage = () => {
  const setTitle = useUIStore((state) => state.setTitle);
  const { notify } = useNotify();

  // Concesiones
  const [concesiones, setConcesiones] = useState<RES_ConcesionItem[]>([]);
  const [concesionSeleccionada, setConcesionSeleccionada] = useState<
    number | null
  >(null);

  // Minas
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

  // Cargar concesiones al montar
  const cargarConcesiones = useCallback(async () => {
    try {
      const { data: res } = await MinasService.getConcesionesSesion();
      if (res.success) {
        setConcesiones(res.data);
        if (res.data.length > 0) {
          setConcesionSeleccionada(res.data[0].id_concesion);
        }
      } else {
        notify({ type: "error", content: res.message });
      }
    } catch {
      notify({ type: "error", content: "Error al cargar las concesiones" });
    }
  }, [notify]);

  // Cargar minas cuando cambia la concesión
  const cargarMinas = useCallback(
    async (id_concesion: number) => {
      setLoading(true);
      try {
        const { data: res } = await MinasService.getMinasResumen(id_concesion);
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
    },
    [notify],
  );

  useEffect(() => {
    setTitle("Minas y Labores");
    cargarConcesiones();
  }, [setTitle, cargarConcesiones]);

  useEffect(() => {
    if (concesionSeleccionada) {
      cargarMinas(concesionSeleccionada);
    }
  }, [concesionSeleccionada, cargarMinas]);

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
    // Concesiones
    concesiones,
    concesionSeleccionada,
    setConcesionSeleccionada,

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

    // Concesion seleccionada como objeto
    concesionSeleccionadaObj:
      concesiones.find((c) => c.id_concesion === concesionSeleccionada) ?? null,
  };
};
