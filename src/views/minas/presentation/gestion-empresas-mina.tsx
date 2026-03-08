import { Button, Loader, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import {
  PlusIcon,
  BriefcaseIcon,
  IdentificationIcon,
} from "@heroicons/react/24/outline";
import { useMinas } from "../../../../services/minas/useMinas";
import type { RES_Empresa } from "../../../../services/empresas/dtos/responses";
import { FormAsignarEmpresaMina } from "./form-asignar-empresa-mina";

interface GestionEmpresasMinaProps {
  idMina: number;
  idConcesion: number; // Required to filter valid companies
  nombreMina?: string;
}

export const GestionEmpresasMina = ({
  idMina,
  idConcesion,
  nombreMina,
}: GestionEmpresasMinaProps) => {
  // States
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Lists
  const [empresasAsignadas, setEmpresasAsignadas] = useState<RES_Empresa[]>([]);

  const [, setError] = useState("");

  // Services
  const { listarEmpresasAsignadas } = useMinas({ setError });

  // Load Data
  const cargarDatos = async () => {
    setLoading(true);
    try {
      const misEmpresas = await (listarEmpresasAsignadas
        ? listarEmpresasAsignadas(idMina)
        : Promise.resolve([]));

      if (misEmpresas) setEmpresasAsignadas(misEmpresas);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (idMina && idConcesion) {
      cargarDatos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idMina, idConcesion]);

  // UI
  if (showForm) {
    return (
      <FormAsignarEmpresaMina
        idMina={idMina}
        idConcesion={idConcesion}
        empresasAsignadasIds={empresasAsignadas.map((e) => e.id_empresa)}
        onCancel={() => setShowForm(false)}
        onSuccess={() => {
          setShowForm(false);
          cargarDatos(); // Reload after assigning a new company
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h3 className="text-lg font-bold text-white leading-tight">
            {nombreMina}
          </h3>
        </div>
        <Button
          size="xs"
          variant="light"
          color="indigo"
          leftSection={<PlusIcon className="w-4 h-4" />}
          onClick={() => setShowForm(true)}
          className="hover:bg-indigo-900/30 transition-colors"
        >
          Asignar
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader size="sm" color="gray" />
        </div>
      ) : empresasAsignadas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/20">
          <div className="w-12 h-12 rounded-full bg-zinc-800/50 flex items-center justify-center mb-3">
            <BriefcaseIcon className="w-6 h-6 text-zinc-600" />
          </div>
          <Text size="sm" className="text-zinc-500 font-medium">
            No hay empresas asignadas
          </Text>
          <Text size="xs" className="text-zinc-600 mt-1">
            Asigne una empresa para comenzar.
          </Text>
        </div>
      ) : (
        <div className="space-y-3 animate-fade-in">
          {empresasAsignadas.map((emp) => (
            <div
              key={emp.id_empresa}
              className="relative p-4 rounded-xl border flex items-start gap-4 transition-all border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/60"
            >
              <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 shrink-0">
                <BriefcaseIcon className="w-6 h-6" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                  <Text className="text-base font-bold text-white truncate">
                    {emp.nombre_comercial || emp.razon_social}
                  </Text>
                </div>

                <div className="flex items-center gap-1.5 text-sm text-zinc-500">
                  <IdentificationIcon className="w-4 h-4 shrink-0" />
                  <span>RUC: {emp.ruc}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
