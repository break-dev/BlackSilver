import { Button, Select, Textarea, Group, ActionIcon, Tooltip } from "@mantine/core";
import { useState, useMemo, useEffect } from "react";
import { AuxService } from "../../../service/auxiliar.service";
import type { RES_Contratista } from "../../../service/responses/contratista";
import type { RES_Labor } from "../../../service/responses/labor";
import { useRegistrarLoteMineralResumen } from "../hooks/useLoteMineral";
import type { LoteMineralResumen } from "../service/lote-mineral.responses";
import { CustomDatePicker } from "../../../presentation/utils/date-picker-input";
import dayjs from "dayjs";
import { EstadoLoteMineral } from "../../../shared/enums/lote-mineral";
import { PlusIcon } from "@heroicons/react/24/outline";
import { FormContratista } from "../../../presentation/utils/form-contratista";
import type { RES_ContratistaResumen } from "../../personal/service/empleados.responses";

interface Props {
  onSuccess: (newLote?: LoteMineralResumen) => void;
  onCancel: () => void;
  isFromProduccion?: boolean;
}

export const RegistroLoteMineral = ({
  onSuccess,
  onCancel,
  isFromProduccion = false,
}: Props) => {
  const [idMina, setIdMina] = useState<string | null>(null);
  const [idContratista, setIdContratista] = useState<string | null>(null);
  const [idLabor, setIdLabor] = useState<string | null>(null);
  const [descripcion, setDescripcion] = useState("");
  const [fechaInicio, setFechaInicio] = useState<Date | null>(new Date());
  const [openedAddContratista, setOpenedAddContratista] = useState(false);

  const [contratistas, setContratistas] = useState<RES_Contratista[]>([]);
  const [labores, setLabores] = useState<RES_Labor[]>([]);

  useEffect(() => {
    let mounted = true;
    AuxService.get_contratistas().then((r) => {
      if (mounted && r?.data) setContratistas(r.data);
    });
    AuxService.get_labores().then((r) => {
      if (mounted && r?.data) setLabores(r.data);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const { mutate: registrar, isPending } = useRegistrarLoteMineralResumen();

  const contratistasOpciones = useMemo(() => {
    return (contratistas || []).map((c: RES_Contratista) => {
      const id = (c.id_contratista ?? c.id)?.toString() ?? "";
      const nombre = c.nombre_completo;
      return { value: id, label: nombre || `Contratista #${id}` };
    });
  }, [contratistas]);

  const laboresAgrupadas = useMemo(() => {
    const groups: { [minaName: string]: { value: string; label: string }[] } =
      {};

    (labores || []).forEach((l: RES_Labor) => {
      const minaName = l.mina || "Mina Desconocida";
      if (!groups[minaName]) {
        groups[minaName] = [];
      }
      const label = [l.nombre].filter(Boolean).join(" | ");
      groups[minaName].push({
        value: l.id_labor.toString(),
        label: label || `Labor #${l.id_labor}`,
      });
    });

    return Object.entries(groups).map(([minaName, items]) => ({
      group: minaName,
      items,
    }));
  }, [labores]);

  // Manejar autocompletado de Labor cuando se selecciona un Contratista
  const handleContratistaChange = (val: string | null) => {
    setIdContratista(val);
    if (!val) {
      setIdLabor(null);
      setIdMina(null);
      return;
    }

    const contratistaSeleccionado = contratistas.find(
      (c) => (c.id_contratista ?? c.id)?.toString() === val
    );

    if (contratistaSeleccionado && contratistaSeleccionado.ids_labores_activas) {
      const idsLabores = contratistaSeleccionado.ids_labores_activas
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      if (idsLabores.length > 0) {
        const primeraLaborId = idsLabores[0];
        const laborEncontrada = labores.find(
          (l) => l.id_labor.toString() === primeraLaborId
        );

        if (laborEncontrada) {
          setIdLabor(laborEncontrada.id_labor.toString());
          setIdMina(laborEncontrada.id_mina.toString());
        }
      }
    }
  };

  const handleContratistaCreadoExitoso = async (nuevo: RES_ContratistaResumen) => {
    const r = await AuxService.get_contratistas();
    if (r?.data) {
      setContratistas(r.data);
      if (nuevo && nuevo.id_contratista) {
        handleContratistaChange(nuevo.id_contratista.toString());
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idContratista || !idMina || !idLabor || !fechaInicio) return;

    const request = {
      id_contratista: parseInt(idContratista),
      id_mina: parseInt(idMina),
      id_labor: parseInt(idLabor),
      descripcion: descripcion.trim() || null,
      fecha_inicio_produccion: dayjs(fechaInicio).format("YYYY-MM-DD"),
      estado_inicial: EstadoLoteMineral.Pendiente,
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
    <>
      <form onSubmit={handleSubmit} className="relative space-y-4 p-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-zinc-300 font-medium text-xs mb-1 block">
              Contratista <span className="text-red-400">*</span>
            </label>
            <Group gap="xs" wrap="nowrap" align="center">
              <Select
                placeholder="Seleccionar contratista"
                data={contratistasOpciones}
                value={idContratista}
                onChange={handleContratistaChange}
                searchable
                required
                classNames={inputClasses}
                radius="lg"
                size="sm"
                className="flex-1"
                comboboxProps={{
                  withinPortal: true,
                  zIndex: 9999,
                  transitionProps: { transition: "pop", duration: 200 },
                }}
              />
              <Tooltip label="Registrar nuevo contratista" position="top" withArrow>
                <ActionIcon
                  size="md"
                  color="indigo"
                  variant="filled"
                  radius="lg"
                  onClick={() => setOpenedAddContratista(true)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white shrink-0 shadow-md h-[38px] w-[38px]"
                >
                  <PlusIcon className="w-5 h-5 font-bold" />
                </ActionIcon>
              </Tooltip>
            </Group>
          </div>

          <Select
            label="Labor"
            placeholder="Seleccionar labor"
            data={laboresAgrupadas}
            value={idLabor}
            onChange={(val) => {
              setIdLabor(val);
              if (val) {
                const selectedLabor = labores.find(
                  (l) => l.id_labor.toString() === val,
                );
                if (selectedLabor) {
                  setIdMina(selectedLabor.id_mina.toString());
                }
              } else {
                setIdMina(null);
              }
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

          <div className="md:col-span-2">
            <CustomDatePicker
              label="Fecha Inicio Producción"
              placeholder="Seleccione fecha"
              value={fechaInicio}
              onChange={(val: unknown) => setFechaInicio(val as Date | null)}
              maxDate={isFromProduccion ? new Date() : undefined}
              required
            />
          </div>

          <Textarea
            label="Descripción (opc.)"
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
            disabled={!idContratista || !idLabor || !idMina || !fechaInicio}
            radius="lg"
            size="sm"
            className="bg-linear-to-r from-zinc-100 to-zinc-300 text-zinc-900 font-bold hover:from-white hover:to-zinc-200 shadow-lg border-0 px-8"
          >
            Registrar Lote
          </Button>
        </Group>
      </form>

      {/* Modal para Crear Contratista desde Registro de Lote */}
      <FormContratista
        opened={openedAddContratista}
        onClose={() => setOpenedAddContratista(false)}
        onSuccess={handleContratistaCreadoExitoso}
      />
    </>
  );
};
