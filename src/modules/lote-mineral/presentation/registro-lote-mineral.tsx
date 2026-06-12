import { Button, Select, TextInput, Textarea, Group } from "@mantine/core";
import { useState, useMemo, useEffect } from "react";
import { AuxService } from "../../../service/auxiliar.service";
import type { RES_Contratista } from "../../../service/responses/contratista";
import type { RES_Mina } from "../../../service/responses/mina";
import type { RES_Labor } from "../../../service/responses/labor";
import { useRegistrarLoteMineral } from "../hooks/useLoteMineral";
import type { RegistrarLoteMineralRequest } from "../service/lote-mineral.requests";
import type { LoteMineral } from "../service/lote-mineral.responses";

interface Props {
  onSuccess: (newLote?: LoteMineral) => void;
  onCancel: () => void;
}

export const RegistroLoteMineral = ({ onSuccess, onCancel }: Props) => {
  const [idMina, setIdMina] = useState<string | null>(null);
  const [idContratista, setIdContratista] = useState<string | null>(null);
  const [idLabor, setIdLabor] = useState<string | null>(null);
  const [codigoInterno, setCodigoInterno] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const [minas, setMinas] = useState<RES_Mina[]>([]);
  const [contratistas, setContratistas] = useState<RES_Contratista[]>([]);
  const [labores, setLabores] = useState<RES_Labor[]>([]);

  useEffect(() => {
    AuxService.get_minas().then(r => { if(r?.success) setMinas(r.data || []); });
    AuxService.get_contratistas().then(r => { if(r?.success) setContratistas(r.data || []); });
    AuxService.get_labores().then(r => { if(r?.success) setLabores(r.data || []); });
  }, []);

  const { mutate: registrar, isPending } = useRegistrarLoteMineral();

  const contratistasOpciones = useMemo(() => {
    return (contratistas || []).map((c: RES_Contratista) => ({
      value: (c?.id_contratista || c?.id)?.toString() || "",
      label: `${c?.nombre || ""} ${c?.apellido || ""}`.trim(),
    }));
  }, [contratistas]);

  const minasOpciones = useMemo(() => {
    return (minas || []).map((m: RES_Mina) => ({
      value: m?.id_mina?.toString() || "",
      label: m?.nombre || "",
    }));
  }, [minas]);

  const laboresOpciones = useMemo(() => {
    if (!idMina) return [];
    return (labores || [])
      .filter((l: RES_Labor) => l?.id_mina?.toString() === idMina)
      .map((l: RES_Labor) => ({
        value: l?.id_labor?.toString() || "",
        label: l?.nombre || "",
      }));
  }, [labores, idMina]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idContratista || !idMina) return;

    const request: RegistrarLoteMineralRequest = {
      id_contratista: parseInt(idContratista),
      id_mina: parseInt(idMina),
      id_labor: idLabor ? parseInt(idLabor) : null,
      codigo_interno: codigoInterno.trim() || null,
      descripcion: descripcion.trim() || null,
    };

    registrar(request, {
      onSuccess: (newLote) => {
        onSuccess(newLote);
      },
    });
  };

  const inputClasses = {
    input:
      "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500",
    dropdown:
      "bg-zinc-950 border-zinc-800 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl",
    option:
      "text-zinc-300 hover:bg-zinc-800 hover:text-white data-[selected]:bg-indigo-600 data-[selected]:text-white font-medium transition-colors",
    label: "text-zinc-300 mb-1 font-medium",
    description: "text-zinc-500 text-[11px] mt-1",
  };

  return (
    <form onSubmit={handleSubmit} className="relative space-y-4 p-1">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Contratista"
          placeholder="Seleccionar contratista"
          data={contratistasOpciones}
          value={idContratista}
          onChange={setIdContratista}
          searchable
          required
          classNames={inputClasses}
          radius="lg"
          size="sm"
          comboboxProps={{
            withinPortal: true,
            zIndex: 9999,
            transitionProps: { transition: "pop", duration: 200 },
          }}
        />

        <Select
          label="Mina"
          placeholder="Seleccionar mina"
          data={minasOpciones}
          value={idMina}
          onChange={(val) => {
            setIdMina(val);
            setIdLabor(null);
          }}
          searchable
          required
          classNames={inputClasses}
          radius="lg"
          size="sm"
          comboboxProps={{
            withinPortal: true,
            zIndex: 9999,
            transitionProps: { transition: "pop", duration: 200 },
          }}
        />

        <Select
          label="Labor (Opcional)"
          placeholder="Seleccionar labor"
          data={laboresOpciones}
          value={idLabor}
          onChange={setIdLabor}
          searchable
          disabled={!idMina}
          nothingFoundMessage="No hay labores en esta mina"
          classNames={inputClasses}
          radius="lg"
          size="sm"
          comboboxProps={{
            withinPortal: true,
            zIndex: 9999,
            transitionProps: { transition: "pop", duration: 200 },
          }}
        />

        <TextInput
          label="Código Interno (Opcional)"
          placeholder="Ej. LOTE-001"
          value={codigoInterno}
          onChange={(e) => setCodigoInterno(e.currentTarget.value)}
          classNames={inputClasses}
          radius="lg"
          size="sm"
        />

        <Textarea
          label="Descripción (Opcional)"
          placeholder="Detalles adicionales del lote..."
          value={descripcion}
          onChange={(e) => setDescripcion(e.currentTarget.value)}
          minRows={3}
          className="md:col-span-2"
          classNames={inputClasses}
          radius="lg"
          size="sm"
        />
      </div>

      <Group
        justify="flex-end"
        mt="xl"
        className="pt-6 border-t border-zinc-800/40"
      >
        <Button
          variant="subtle"
          onClick={onCancel}
          disabled={isPending}
          radius="lg"
          size="sm"
          className="text-zinc-500 hover:text-white font-bold"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          loading={isPending}
          disabled={!idContratista || !idMina}
          radius="lg"
          size="sm"
          className="bg-linear-to-r from-zinc-100 to-zinc-300 text-zinc-900 font-bold hover:from-white hover:to-zinc-200 shadow-lg border-0 px-8"
        >
          Registrar Lote
        </Button>
      </Group>
    </form>
  );
};
