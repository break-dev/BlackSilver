import { useState } from "react";
import {
  Stack,
  Group,
  Text,
  Button,
  NumberInput,
  Loader,
  Alert,
  Badge,
  Divider,
} from "@mantine/core";
import { IdentificationIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { ModalEstandar } from "../../../presentation/utils/modal-estandar";
import { FotocheckEmpleadoCard } from "./fotocheck/FotocheckEmpleadoCard";
import { useFotocheckEmpleado } from "../hooks/useFotocheckEmpleado";
import type { RES_EmpleadoResumen } from "../service/empleados.responses";

interface ModalFotocheckProps {
  opened: boolean;
  close: () => void;
  empleados: RES_EmpleadoResumen[];
}

export const ModalFotocheck = ({
  opened,
  close,
  empleados,
}: ModalFotocheckProps) => {
  const [ancho, setAncho] = useState<number>(400);
  const [alto, setAlto] = useState<number>(600);

  const { generando, qrDataUrls, descargar } = useFotocheckEmpleado({
    empleados,
  });

  return (
    <>
      <ModalEstandar
        opened={opened}
        close={close}
        title={
          <Group gap="xs">
            <IdentificationIcon className="w-5 h-5 text-indigo-400" />
            <Text fw={900} className="uppercase tracking-wider">
              Generar Fotocheck
            </Text>
            <Badge
              variant="light"
              color="indigo"
              size="sm"
              radius="md"
              className="font-bold ml-2"
            >
              {empleados.length}{" "}
              {empleados.length === 1 ? "empleado" : "empleados"}
            </Badge>
          </Group>
        }
        size="xl"
      >
        <Stack gap="md" className="max-h-[80vh] overflow-y-auto px-2 py-2">
          {/* Configuración */}
          <Alert
            variant="light"
            color="indigo"
            radius="md"
            icon={<IdentificationIcon className="w-4 h-4" />}
            styles={{ message: { fontSize: "12px" } }}
          >
            Configura el tamaño del fotocheck. Si seleccionas 1 empleado, se
            descarga 1 imagen PNG. Si son varios, se descarga 1 archivo ZIP
            con todos los fotochecks.
          </Alert>

          <Group grow>
            <NumberInput
              label="Ancho (px)"
              value={ancho}
              onChange={(v) => setAncho(typeof v === "number" ? v : 0)}
              min={200}
              max={1200}
              step={10}
              hideControls
            />
            <NumberInput
              label="Alto (px)"
              value={alto}
              onChange={(v) => setAlto(typeof v === "number" ? v : 0)}
              min={300}
              max={1800}
              step={10}
              hideControls
            />
          </Group>

          <Divider />

          {/* Lista de empleados seleccionados */}
          <Stack gap="xs">
            <Text
              size="xs"
              fw={900}
              c="zinc.4"
              className="uppercase tracking-widest"
            >
              Empleados seleccionados
            </Text>
            <div className="flex flex-wrap gap-2">
              {empleados.map((emp) => (
                <Badge
                  key={emp.id_empleado}
                  variant="light"
                  color="zinc"
                  size="md"
                  className="font-medium"
                >
                  {emp.nombre} {emp.apellido}
                </Badge>
              ))}
              {empleados.length === 0 && (
                <Text size="xs" c="dimmed" fs="italic">
                  No hay empleados seleccionados.
                </Text>
              )}
            </div>
          </Stack>

          {/* Botón de descarga */}
          <Group justify="flex-end" gap="md" mt="md">
            <Button
              variant="subtle"
              onClick={close}
              disabled={generando}
              radius="lg"
              size="sm"
              className="text-zinc-400 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              loading={generando}
              onClick={() => {
                void descargar(ancho, alto);
              }}
              disabled={empleados.length === 0}
              leftSection={<ArrowDownTrayIcon className="w-4 h-4" />}
              radius="lg"
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20 px-8"
            >
              Descargar{" "}
              {empleados.length === 1
                ? "1 fotocheck"
                : `${empleados.length} fotochecks`}
            </Button>
          </Group>

          {/* Indicador de carga de QRs */}
          {empleados.length > 0 &&
            Object.keys(qrDataUrls).length < empleados.length && (
              <Group gap="xs" className="self-center">
                <Loader size="xs" color="indigo" />
                <Text size="xs" c="dimmed">
                  Generando QRs...
                </Text>
              </Group>
            )}
        </Stack>
      </ModalEstandar>

      {/* Render invisible de todos los fotochecks para que html2canvas
          pueda capturarlos por su id. */}
      {opened &&
        empleados.map((emp) => {
          const qr = qrDataUrls[emp.id_empleado];
          if (!qr) return null;
          return (
            <FotocheckEmpleadoCard
              key={emp.id_empleado}
              id_empleado={emp.id_empleado}
              nombre={emp.nombre}
              apellido={emp.apellido}
              cargo={emp.cargo ?? "—"}
              area={emp.area}
              empresa={emp.empresa}
              empresaUrlLogo={emp.empresa_url_logo}
              urlFoto={emp.url_foto}
              qrDataUrl={qr}
              qrToken={emp.qr_token}
              dni={emp.dni}
              ancho={ancho}
              alto={alto}
            />
          );
        })}
    </>
  );
};
