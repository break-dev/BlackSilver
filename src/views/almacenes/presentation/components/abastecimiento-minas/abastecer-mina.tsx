import { Select, Button, Loader } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useEffect, useState, useMemo } from "react";
import { CubeIcon } from "@heroicons/react/24/outline";
import type { RES_MinaAbastecida, RES_MinaDisponible } from "../../../service/almacenes.responses";

interface FormVincularMinaProps {
  idAlmacen: number;
  onSuccess: (mina: RES_MinaAbastecida) => void;
  onCancel: () => void;
}

export const AbastecerMina = ({
  idAlmacen,
  minasAsignadas,
  onSuccess,
  onCancel,
}: FormVincularMinaProps) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [minasDisponibles, setMinasDisponibles] = useState<RES_Mina[]>([]);
  const [, setError] = useState("");

  const { listar: listarTodasMinas } = useMinas({ setError });
  const { asignarMina } = useAlmacenes({ setError });

  useEffect(() => {
    let mounted = true;
    listarTodasMinas().then((data) => {
      if (mounted) {
        setMinasDisponibles(data || []);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const form = useForm({
    initialValues: { id_mina: "" },
    validate: { id_mina: (val) => (!val ? "Seleccione una mina" : null) },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setSaving(true);
    const newMinaInfo = await asignarMina({
      id_almacen: idAlmacen,
      id_mina: Number(values.id_mina),
    });

    if (newMinaInfo) {
      notifications.show({
        title: "Asignación Exitosa",
        message: "Mina vinculada al almacén",
        color: "green",
      });
      onSuccess(newMinaInfo as unknown as RES_MinaAsignada);
    }
    setSaving(false);
  };

  const selectOptions = useMemo(() => {
    if (!minasDisponibles || !Array.isArray(minasDisponibles)) return [];

    const assignedNames = new Set((minasAsignadas || []).map((a) => a.mina));

    // 1. Filtramos y preparamos items planos
    const filtered = minasDisponibles
      .filter((m) => !assignedNames.has(m.nombre))
      .map((m) => ({
        value: String(m.id_mina),
        label: m.nombre,
        concesion: m.concesion || "Sin Concesión",
      }));

    // 2. Agrupamos por concesión
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const groups: Record<string, any[]> = {};
    filtered.forEach((item) => {
      if (!groups[item.concesion]) groups[item.concesion] = [];
      groups[item.concesion].push({ value: item.value, label: item.label });
    });

    // 3. Convertimos al formato [{ group, items }, ...]
    return Object.entries(groups).map(([concesion, items]) => ({
      group: concesion,
      items,
    }));
  }, [minasDisponibles, minasAsignadas]);

  if (loading) {
    return (
      <div className="flex justify-center p-10">
        <Loader size="sm" color="gray" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in p-4 border border-zinc-800 bg-zinc-900/40 rounded-xl">
      <form onSubmit={form.onSubmit(handleSubmit)} className="space-y-4">
        <Select
          label="Mina"
          placeholder="Buscar mina..."
          data={selectOptions}
          searchable
          nothingFoundMessage="No hay minas disponibles"
          leftSection={<CubeIcon className="w-4 h-4 text-zinc-400" />}
          {...form.getInputProps("id_mina")}
          radius="lg"
          size="sm"
          classNames={{
            input:
              "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500",
            dropdown: "bg-zinc-900 border-zinc-800",
            option:
              "hover:bg-zinc-800 text-zinc-300 data-[selected]:bg-zinc-100 data-[selected]:text-zinc-900 rounded-md my-1",
            label: "text-zinc-300 mb-1 font-medium",
            groupLabel:
              "text-zinc-500 font-bold text-xs uppercase mt-2 mb-1 pl-2",
          }}
        />
        <div className="flex justify-end gap-2 mt-4">
          <Button size="sm" variant="default" onClick={onCancel}>
            Cancelar
          </Button>
          <Button size="sm" type="submit" loading={saving}>
            Vincular
          </Button>
        </div>
      </form>
    </div>
  );
};
