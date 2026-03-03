import { Button, Select } from "@mantine/core";
import { useEffect, useState, useMemo } from "react";
import { ArrowLeftIcon, BriefcaseIcon } from "@heroicons/react/24/outline";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";

// Services
import { useMinas } from "../../../../services/minas/useMinas";
import { useConcesiones } from "../../../../services/concesiones/useConcesiones";
import type { RES_ContratoConcesion } from "../../../../services/concesiones/dtos/responses";

interface FormAsignarEmpresaMinaProps {
  idMina: number;
  idConcesion: number;
  empresasAsignadasIds: number[];
  onCancel: () => void;
  onSuccess: () => void;
}

export const FormAsignarEmpresaMina = ({
  idMina,
  idConcesion,
  empresasAsignadasIds,
  onCancel,
  onSuccess,
}: FormAsignarEmpresaMinaProps) => {
  const [saving, setSaving] = useState(false);
  const [empresasContrato, setEmpresasContrato] = useState<
    RES_ContratoConcesion[]
  >([]);

  const [, setError] = useState("");

  const { asignarEmpresa } = useMinas({ setError });
  const { listarAsignaciones } = useConcesiones({ setError });

  useEffect(() => {
    let mounted = true;
    listarAsignaciones(idConcesion).then((validEmpresas) => {
      if (mounted && validEmpresas) {
        setEmpresasContrato(validEmpresas);
      }
    });

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idConcesion]);

  // Form
  const form = useForm({
    initialValues: { id_empresa: "" },
    validate: { id_empresa: (val) => (!val ? "Seleccione una empresa" : null) },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setSaving(true);
    const success = await asignarEmpresa({
      id_mina: idMina,
      id_empresa: Number(values.id_empresa),
    });

    if (success) {
      notifications.show({
        title: "Empresa Asignada",
        message: "Empresa vinculada a la mina exitosamente.",
        color: "green",
      });
      form.reset();
      onSuccess();
    }
    setSaving(false);
  };

  // Filter Options: Only show companies with Valid Contract that are NOT yet assigned to this mine
  const selectOptions = useMemo(() => {
    const assignedIds = new Set(empresasAsignadasIds);

    return empresasContrato
      .filter((c) => c.estado === "Activo") // Only active contracts
      .filter((c) => !assignedIds.has(c.id_empresa)) // Not already assigned to mine
      .map((c) => ({
        value: String(c.id_empresa),
        label: c.nombre_comercial || c.razon_social || "",
      }));
  }, [empresasContrato, empresasAsignadasIds]);

  return (
    <div className="space-y-4 animate-fade-in">
      <Button
        variant="subtle"
        color="gray"
        size="xs"
        onClick={onCancel}
        leftSection={<ArrowLeftIcon className="w-3 h-3" />}
        className="hover:text-white text-zinc-400 mb-4"
      >
        Volver al listado
      </Button>

      <div className="p-4 border border-zinc-800 bg-zinc-900/40 rounded-xl">
        <h3 className="text-white font-bold mb-2">
          Asignar Empresa Contratista
        </h3>
        <p className="text-xs text-zinc-500 mb-4">
          Solo se muestran empresas con contrato VIGENTE en la concesión de esta
          mina.
        </p>

        <form onSubmit={form.onSubmit(handleSubmit)} className="space-y-4">
          <Select
            label="Empresa"
            placeholder="Buscar empresa..."
            data={selectOptions}
            searchable
            nothingFoundMessage={
              selectOptions.length === 0
                ? "No hay empresas elegibles"
                : "No encontrado"
            }
            leftSection={<BriefcaseIcon className="w-4 h-4 text-zinc-400" />}
            {...form.getInputProps("id_empresa")}
            radius="lg"
            size="sm"
            classNames={{
              input:
                "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500",
              dropdown: "bg-zinc-900 border-zinc-800",
              option:
                "hover:bg-zinc-800 text-zinc-300 data-[selected]:bg-zinc-100 data-[selected]:text-zinc-900 rounded-md my-1",
              label: "text-zinc-300 mb-1 font-medium",
            }}
          />
          <div className="flex justify-end gap-2 mt-6">
            <Button
              size="sm"
              variant="default"
              onClick={onCancel}
              className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              type="submit"
              loading={saving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20"
            >
              Asignar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
