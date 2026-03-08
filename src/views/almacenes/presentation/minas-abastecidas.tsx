import { useState } from "react";
import { Button, Loader, Text, ActionIcon, Tooltip } from "@mantine/core";
import { PlusIcon, CubeIcon, TrashIcon } from "@heroicons/react/24/outline";
import { ModalEstandar } from "../../../presentation/utils/modal-estandar";
import { useMinasAbastecidas } from "../hooks/useMinasAbastecidas";
import { AbastecerMina } from "./abastecer-mina";
import type { IMessage } from "../../../shared/enums/message";
import type {
  RES_Almacen,
  RES_MinaAbastecida,
} from "../service/almacenes.responses";

interface MinasAbastecidasProps {
  almacen: RES_Almacen;
  onMessage?: (msg: IMessage) => void;
  onMinasChange?: (delta: number) => void;
}

export const MinasAbastecidas = ({
  almacen,
  onMessage,
  onMinasChange,
}: MinasAbastecidasProps) => {
  const [showForm, setShowForm] = useState(false);
  const { minas, loading, message, desasignar, agregar } = useMinasAbastecidas(
    almacen.id_almacen,
  );

  // Burbujear mensajes hacia el hook de la página
  // useEffect removed intentionally — message is passed via onMessage from operations below

  const handleDesvincular = async (id_almacen_mina: number) => {
    if (!confirm("¿Está seguro de desvincular esta mina del almacén?")) return;
    const success = await desasignar(id_almacen_mina);
    if (success) {
      onMessage?.(message);
      if (onMinasChange) onMinasChange(-1);
    }
  };

  const handleVinculada = (nueva: RES_MinaAbastecida) => {
    agregar(nueva);
    if (onMinasChange) onMinasChange(1);
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-white">Minas asignadas</h3>
          <p className="text-zinc-500 text-sm">{almacen.nombre}</p>
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

      {loading ? (
        <div className="flex justify-center p-10">
          <Loader size="sm" color="gray" />
        </div>
      ) : minas.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-zinc-800 rounded-xl">
          <CubeIcon className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
          <p className="text-zinc-500 text-sm">
            Este almacén no atiende ninguna mina.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {minas.map((item: RES_MinaAbastecida, idx: number) => (
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
                    {item.nombre}
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

      <ModalEstandar
        opened={showForm}
        close={() => setShowForm(false)}
        title="Abastecer otras minas"
      >
        <AbastecerMina
          idAlmacen={almacen.id_almacen}
          onCancel={() => setShowForm(false)}
          onSuccess={handleVinculada}
        />
      </ModalEstandar>
    </div>
  );
};
