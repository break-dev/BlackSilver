import { Button, Loader, Text, ActionIcon, Tooltip } from "@mantine/core";
import { useEffect, useState } from "react";
import { PlusIcon, CubeIcon, TrashIcon } from "@heroicons/react/24/outline";
import { notifications } from "@mantine/notifications";
import type { RES_MinaAbastecida } from "../../../service/almacenes.responses";
import { ModalEstandar } from "../../../../../presentation/utils/modal-estandar";
import { AbastecerMina } from "./abastecer-mina";

interface MinasAbastecidasProps {
  idAlmacen: number;
  nombreAlmacen?: string;
  onMinasChange?: (delta: number) => void;
}

export const MinasAbastecidas = ({
  idAlmacen,
  nombreAlmacen,
  onMinasChange,
}: MinasAbastecidasProps) => {
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [minasAsignadas, setMinasAsignadas] = useState<RES_MinaAbastecida[]>(
    [],
  );
  const [, setError] = useState("");

  const { listarMinas, desasignarMina } = useAlmacenes({ setError });

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const misMinas = await listarMinas(idAlmacen);
      if (misMinas) setMinasAsignadas(misMinas);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idAlmacen]);

  const handleDesvincular = async (id_almacen_mina: number) => {
    if (!confirm("¿Está seguro de desvincular esta mina del almacén?")) return;

    const success = await desasignarMina(id_almacen_mina);
    if (success) {
      notifications.show({
        title: "Mina Desvinculada",
        message: "La mina ha sido retirada del almacén",
        color: "blue",
      });
      // Eliminamos la mina desvinculada del state sin necesidad de hacer refetch
      setMinasAsignadas((prev) =>
        prev.filter((m) => m.id_almacen_mina !== id_almacen_mina),
      );
      if (onMinasChange) onMinasChange(-1);
    }
  };

  const handleVinculacionExitosa = (nuevaMina: RES_MinaAbastecida) => {
    setMinasAsignadas((prev) => {
      // Verificamos si la mina ya está en la lista (generalmente backend ya previene duplicados)
      const exists = prev.some(
        (m) => m.id_almacen_mina === nuevaMina.id_almacen_mina,
      );
      if (exists) return prev;

      if (onMinasChange) onMinasChange(1);

      const newArray = [...prev, nuevaMina];
      // Ordenamos alfabéticamente
      return newArray.sort((a, b) => a.mina.localeCompare(b.mina));
    });
    setShowForm(false);
  };

  if (loading)
    return (
      <div className="flex justify-center p-10">
        <Loader size="sm" color="gray" />
      </div>
    );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-white">Minas asignadas</h3>
          <p className="text-zinc-500 text-sm">{nombreAlmacen}</p>
        </div>
        <Button
          size="xs"
          variant="light"
          color="indigo"
          leftSection={<PlusIcon className="w-4 h-4" />}
          onClick={() => setShowForm(true)}
          className="hover:bg-indigo-900/30 transition-colors"
        >
          Asignar Mina
        </Button>
      </div>

      {minasAsignadas.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-zinc-800 rounded-xl">
          <CubeIcon className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
          <p className="text-zinc-500 text-sm">
            Este almacén no atiende ninguna mina.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {minasAsignadas.map((item, idx) => (
            <div
              key={item.id_almacen_mina || idx}
              className="flex items-center justify-between p-3 bg-zinc-900/30 border border-zinc-800/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-900/20 text-indigo-500 flex items-center justify-center border border-indigo-900/30">
                  <CubeIcon className="w-5 h-5" />
                </div>
                <div>
                  <Text fw={600} className="text-zinc-200">
                    {item.mina}
                  </Text>
                  <Text size="xs" className="text-zinc-500 font-medium mt-0.5">
                    Concesión:{" "}
                    <span className="text-zinc-400 font-normal">
                      {item.concesion}
                    </span>
                  </Text>
                </div>
              </div>
              <Tooltip label="Desvincular Mina">
                <ActionIcon
                  variant="subtle"
                  color="red"
                  size="sm"
                  onClick={() => handleDesvincular(item.id_almacen_mina)}
                >
                  <TrashIcon className="w-4 h-4" />
                </ActionIcon>
              </Tooltip>
            </div>
          ))}
        </div>
      )}

      {/* Modal para vincular la mina */}
      <ModalEstandar
        opened={showForm}
        close={() => setShowForm(false)}
        title="Vincular Mina al Almacén"
      >
        <AbastecerMina
          idAlmacen={idAlmacen}
          minasAsignadas={minasAsignadas}
          onCancel={() => setShowForm(false)}
          onSuccess={handleVinculacionExitosa}
        />
      </ModalEstandar>
    </div>
  );
};
