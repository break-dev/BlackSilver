import {
  TextInput,
  Textarea,
  Button,
  Stack,
  Text,
  Alert,
  Checkbox,
  Group,
  Accordion,
  ScrollArea,
  Divider,
  Box,
} from "@mantine/core";
import { ExclamationCircleIcon, RectangleGroupIcon, Squares2X2Icon } from "@heroicons/react/24/outline";

interface RegistroRolProps {
  estructura: any[];
  loadingEstructura: boolean;
  nombre: string;
  setNombre: (val: string) => void;
  descripcion: string;
  setDescripcion: (val: string) => void;
  seccionesSeleccionadas: number[];
  onToggleSeccion: (id: number) => void;
  onToggleSubmodulo: (ids: number[], checked: boolean) => void;
  onSave: () => void;
  onCancel: () => void;
  loading: boolean;
  error: string;
  isEdit?: boolean;
}

export const RegistroRol = ({
  estructura,
  loadingEstructura,
  nombre,
  setNombre,
  descripcion,
  setDescripcion,
  seccionesSeleccionadas,
  onToggleSeccion,
  onToggleSubmodulo,
  onSave,
  onCancel,
  loading,
  error,
  isEdit = false,
}: RegistroRolProps) => {
  return (
    <Stack gap="md">
      {error && (
        <Alert
          color="red"
          variant="light"
          icon={<ExclamationCircleIcon className="w-5 h-5" />}
          radius="md"
        >
          {error}
        </Alert>
      )}

      <TextInput
        label="Nombre del Rol"
        placeholder="Ej: Administrador de Almacén"
        value={nombre}
        onChange={(e) => setNombre(e.currentTarget.value)}
        required
        radius="md"
        disabled={isEdit}
        classNames={{
          input: "bg-zinc-900/50 border-zinc-800 text-white focus:border-indigo-500",
          label: "text-zinc-400 mb-1",
        }}
      />

      <Textarea
        label="Descripción (Opcional)"
        placeholder="Breve descripción de las responsabilidades..."
        value={descripcion}
        onChange={(e) => setDescripcion(e.currentTarget.value)}
        radius="md"
        rows={2}
        disabled={isEdit}
        classNames={{
          input: "bg-zinc-900/50 border-zinc-800 text-white focus:border-indigo-500",
          label: "text-zinc-400 mb-1",
        }}
      />

      <Divider label="Configuración de Permisos" labelPosition="center" color="zinc.8" />

      <Text size="xs" fw={700} className="text-zinc-500 uppercase tracking-wider">
        Módulos y Vistas Disponibles
      </Text>

      <ScrollArea h={300} offsetScrollbars scrollbarSize={6} className="bg-zinc-900/30 rounded-xl border border-zinc-800/50 p-2">
        {loadingEstructura ? (
          <Text size="sm" color="dimmed" ta="center" py="xl">
            Cargando estructura de permisos...
          </Text>
        ) : (
          <Accordion variant="separated" classNames={{
            item: "border-zinc-800 bg-transparent mb-2",
            control: "hover:bg-zinc-800/30 text-zinc-300",
            panel: "bg-zinc-900/20 px-4 pb-4"
          }}>
            {estructura.map((modulo) => (
              <Accordion.Item key={modulo.id} value={modulo.nombre}>
                <Accordion.Control icon={<RectangleGroupIcon className="w-5 h-5 text-indigo-400" />}>
                  <Text size="sm" fw={600}>{modulo.nombre}</Text>
                </Accordion.Control>
                <Accordion.Panel>
                  <Stack gap="lg" mt="xs">
                    {modulo.submodulos.map((sub: any) => {
                      const idsSecciones = sub.secciones.map((s: any) => s.id);
                      const todasSeleccionadas = idsSecciones.every((id: number) => seccionesSeleccionadas.includes(id));
                      const algunaSeleccionada = idsSecciones.some((id: number) => seccionesSeleccionadas.includes(id));
                      
                      return (
                        <Box key={sub.id}>
                          <Group justify="space-between" mb="xs">
                            <Group gap="xs">
                              <Squares2X2Icon className="w-4 h-4 text-zinc-500" />
                              <Text size="xs" fw={700} className="text-zinc-400 uppercase">{sub.nombre}</Text>
                            </Group>
                            <Checkbox
                              size="xs"
                              label="Todo"
                              checked={todasSeleccionadas}
                              indeterminate={algunaSeleccionada && !todasSeleccionadas}
                              onChange={(e) => onToggleSubmodulo(idsSecciones, e.currentTarget.checked)}
                              color="indigo"
                            />
                          </Group>
                          
                          <div className="grid grid-cols-2 gap-2">
                            {sub.secciones.map((sec: any) => (
                              <Checkbox
                                key={sec.id}
                                label={sec.nombre}
                                size="xs"
                                checked={seccionesSeleccionadas.includes(sec.id)}
                                onChange={() => onToggleSeccion(sec.id)}
                                color="indigo"
                                classNames={{
                                  label: "text-zinc-300 text-[11px]",
                                  inner: "mt-0.5"
                                }}
                              />
                            ))}
                          </div>
                          <Divider variant="dashed" mt="md" color="zinc.8" />
                        </Box>
                      );
                    })}
                  </Stack>
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
        )}
      </ScrollArea>

      <Group justify="flex-end" mt="lg">
        <Button
          variant="subtle"
          onClick={onCancel}
          color="gray"
          radius="md"
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          onClick={onSave}
          loading={loading}
          color="indigo"
          radius="md"
          className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-900/20 px-8"
        >
          {isEdit ? "Guardar Cambios" : "Registrar Rol"}
        </Button>
      </Group>
    </Stack>
  );
};
