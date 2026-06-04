import { useState, useEffect } from "react";
import {
  Stack,
  NumberInput,
  Button,
  Group,
  Text,
  Badge,
} from "@mantine/core";
import { 
  BellIcon, 
  ClockIcon, 
  ArrowTrendingUpIcon, 
  ArrowPathIcon 
} from "@heroicons/react/24/outline";
import { ModalEstandar } from "../../../../presentation/utils/modal-estandar";
import { ActivosService } from "../../service/activos.service";
import { useNotify } from "../../../../hooks/useNotify";
import type { RES_ActivoFijoResumen } from "../../service/activos.responses";

interface Props {
  opened: boolean;
  close: () => void;
  activo: RES_ActivoFijoResumen;
  onSuccess: () => void;
}

export const ActivoConfigAlertasModal = ({ opened, close, activo, onSuccess }: Props) => {
  const { notifySuccess, notifyError } = useNotify();
  const [saving, setSaving] = useState(false);

  const [horas, setHoras] = useState<number | "">(activo.intervalo_mantenimiento_horas ?? "");
  const [kms, setKms] = useState<number | "">(activo.intervalo_mantenimiento_kilometros ?? "");
  const [vueltas, setVueltas] = useState<number | "">(activo.intervalo_mantenimiento_vueltas ?? "");

  useEffect(() => {
    if (opened) {
      setHoras(activo.intervalo_mantenimiento_horas ?? "");
      setKms(activo.intervalo_mantenimiento_kilometros ?? "");
      setVueltas(activo.intervalo_mantenimiento_vueltas ?? "");
    }
  }, [opened, activo]);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const res = await ActivosService.configurarAlertas({
        id_activo: activo.id_activo,
        intervalo_horas: horas === "" ? null : Number(horas),
        intervalo_kilometros: kms === "" ? null : Number(kms),
        intervalo_vueltas: vueltas === "" ? null : Number(vueltas),
      });
      if (res.success) {
        notifySuccess("Alertas configuradas correctamente");
        onSuccess();
        close();
      } else {
        notifyError(res.message);
      }
    } catch (error) {
      console.error(error);
      notifyError("Error al configurar alertas");
    } finally {
      setSaving(false);
    }
  };

  const fieldClasses = {
    input: "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500",
    label: "text-zinc-300 mb-1 font-medium",
  };

  return (
    <ModalEstandar
      opened={opened}
      close={close}
      title="Configurar Alertas de Mantenimiento"
      size="md"
    >
      <Stack gap="md">
        <Text size="sm" c="zinc.4">
          Establece cada cuántas unidades deseas recibir una alerta para el mantenimiento de este activo.
          Deja en blanco si no deseas alerta para un tipo específico.
        </Text>

        <Stack gap="md" className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30">
          <Group justify="space-between" align="center">
            <Group gap="sm">
              <ClockIcon className="w-5 h-5 text-amber-500" />
              <Text size="sm" fw={600} c="white">Horómetro</Text>
            </Group>
            {activo.control_por_horometro ? (
               <NumberInput
                placeholder="Ej. 100"
                value={horas}
                onChange={(val) => setHoras(val === "" ? "" : Number(val))}
                suffix=" horas"
                hideControls
                size="xs"
                radius="md"
                classNames={fieldClasses}
                className="w-32"
               />
            ) : (
              <Badge color="zinc.7" variant="light">No habilitado</Badge>
            )}
          </Group>

          <Group justify="space-between" align="center">
            <Group gap="sm">
              <ArrowTrendingUpIcon className="w-5 h-5 text-emerald-500" />
              <Text size="sm" fw={600} c="white">Odómetro</Text>
            </Group>
            {activo.control_por_odometro ? (
               <NumberInput
                placeholder="Ej. 5000"
                value={kms}
                onChange={(val) => setKms(val === "" ? "" : Number(val))}
                suffix=" km"
                hideControls
                size="xs"
                radius="md"
                classNames={fieldClasses}
                className="w-32"
               />
            ) : (
              <Badge color="zinc.7" variant="light">No habilitado</Badge>
            )}
          </Group>

          <Group justify="space-between" align="center">
            <Group gap="sm">
              <ArrowPathIcon className="w-5 h-5 text-violet-500" />
              <Text size="sm" fw={600} c="white">Vueltas</Text>
            </Group>
            {activo.control_por_vueltas ? (
               <NumberInput
                placeholder="Ej. 50"
                value={vueltas}
                onChange={(val) => setVueltas(val === "" ? "" : Number(val))}
                suffix=" vueltas"
                hideControls
                size="xs"
                radius="md"
                classNames={fieldClasses}
                className="w-32"
               />
            ) : (
              <Badge color="zinc.7" variant="light">No habilitado</Badge>
            )}
          </Group>
        </Stack>

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" color="zinc.5" onClick={close} disabled={saving} size="xs" radius="lg">
            Cancelar
          </Button>
          <Button
            color="indigo.6"
            onClick={handleSubmit}
            loading={saving}
            size="xs"
            radius="lg"
            leftSection={<BellIcon className="w-4 h-4" />}
          >
            Guardar Configuración
          </Button>
        </Group>
      </Stack>
    </ModalEstandar>
  );
};
