import { useState, useEffect } from "react";
import { Stack, Text, Loader } from "@mantine/core";
import { ClipboardDocumentCheckIcon } from "@heroicons/react/24/outline";
import { useListarRecepciones } from "../../hooks/useListarRecepciones";
import { RecepcionHistorialCard } from "./components/recepcion-historial-card";

interface Props {
  idTransferencia: number;
}

export const HistorialRecepcionesTransferencia = ({
  idTransferencia,
}: Props) => {
  const { recepciones, loading, cargarRecepciones } = useListarRecepciones();
  const [expandedIds, setExpandedIds] = useState<Record<number, boolean>>({});

  useEffect(() => {
    cargarRecepciones(idTransferencia);
  }, [idTransferencia, cargarRecepciones]);

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 h-60">
        <Loader color="indigo" size="lg" />
        <Text size="sm" c="zinc.5" fw={600} mt="md">
          Cargando historial...
        </Text>
      </div>
    );
  }

  if (!recepciones || recepciones.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center h-60 bg-zinc-900/10 rounded-2xl border border-dashed border-zinc-800/50">
        <ClipboardDocumentCheckIcon className="w-12 h-12 text-zinc-700 mb-4" />
        <Text size="lg" fw={600} className="text-zinc-400">
          Sin registros de recepción
        </Text>
        <Text size="sm" c="zinc.5" className="max-w-xs mt-1">
          Aún no se han procesado ingresos físicos para esta transferencia.
        </Text>
      </div>
    );
  }

  return (
    <Stack gap="md" p="xs">
      {recepciones.map((recepcion, index) => (
        <RecepcionHistorialCard
          key={recepcion.id_recepcion}
          recepcion={recepcion}
          index={index}
          totalCount={recepciones.length}
          isExpanded={expandedIds[recepcion.id_recepcion] || false}
          onToggle={() => toggleExpand(recepcion.id_recepcion)}
        />
      ))}
    </Stack>
  );
};
