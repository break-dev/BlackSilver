import {
  TextInput,
  Textarea,
  Button,
  Stack,
  Text,
  Checkbox,
  Group,
  Accordion,
  Box,
} from "@mantine/core";
import { RectangleGroupIcon, ShieldCheckIcon, DocumentTextIcon, CheckBadgeIcon } from "@heroicons/react/24/outline";

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
  isEdit = false,
}: RegistroRolProps) => {
  const fieldClasses = {
    input:
      "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500 transition-all",
    label: "text-zinc-300 mb-1 font-medium",
  };

  return (
    <Stack gap="md">

      <TextInput
        label="Nombre del Rol"
        placeholder="Ej: Administrador de Almacén"
        value={nombre}
        onChange={(e) => setNombre(e.currentTarget.value)}
        required
        withAsterisk
        radius="lg"
        disabled={isEdit}
        leftSection={<ShieldCheckIcon className="w-4 h-4 text-zinc-500" />}
        classNames={fieldClasses}
      />

      <Textarea
        label="Descripción (Opcional)"
        placeholder="Breve descripción de las responsabilidades..."
        value={descripcion}
        onChange={(e) => setDescripcion(e.currentTarget.value)}
        radius="lg"
        rows={2}
        disabled={isEdit}
        leftSection={<DocumentTextIcon className="w-4 h-4 text-zinc-500" />}
        classNames={fieldClasses}
      />

      <div className="mt-2 space-y-1 px-1">
        <Text fw={800} size="sm" className="text-white flex items-center gap-2">
          <CheckBadgeIcon className="w-5 h-5 text-indigo-500" />
          Configuración de Permisos
        </Text>
        <Text size="xs" color="dimmed">
          Seleccione los módulos y vistas a las que este rol tendrá acceso
        </Text>
      </div>

      <div>
        {loadingEstructura ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
             <div className="w-8 h-8 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
             <Text size="xs" fw={500} color="dimmed">Cargando estructura...</Text>
          </div>
        ) : (
          <Accordion 
            variant="separated" 
            defaultValue={estructura[0]?.nombre}
            classNames={{
              item: "border-zinc-800/50 bg-zinc-900/20 mb-3 rounded-xl overflow-hidden transition-all hover:border-zinc-700/50",
              control: "py-3 px-4 hover:bg-zinc-800/20",
              panel: "px-4 pb-4 pt-2",
              chevron: "text-zinc-500"
            }}
          >
            {estructura.map((modulo) => (
              <Accordion.Item key={modulo.id} value={modulo.nombre} className="group">
                <Accordion.Control icon={<RectangleGroupIcon className="w-5 h-5 text-indigo-400 group-data-[active]:text-indigo-300" />}>
                  <Text size="sm" fw={700} className="text-zinc-300 group-data-[active]:text-white transition-colors">{modulo.nombre}</Text>
                </Accordion.Control>
                <Accordion.Panel>
                  <Stack gap="md">
                    {modulo.submodulos.map((sub: any) => {
                      const idsSecciones = sub.secciones.map((s: any) => s.id);
                      const todasSeleccionadas = idsSecciones.every((id: number) => seccionesSeleccionadas.includes(id));
                      const algunaSeleccionada = idsSecciones.some((id: number) => seccionesSeleccionadas.includes(id));
                      
                      return (
                        <Box 
                          key={sub.id} 
                          className="bg-zinc-900/40 rounded-2xl border border-zinc-800/40 p-4 relative overflow-hidden group/sub"
                        >
                          <div className={`absolute inset-0 bg-indigo-500/[0.03] transition-opacity ${algunaSeleccionada ? 'opacity-100' : 'opacity-0'}`} />

                          <Group justify="space-between" mb="xs" className="relative z-10">
                            <Group gap="xs">
                              <div className={`w-2 h-2 rounded-full transition-colors ${todasSeleccionadas ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]' : algunaSeleccionada ? 'bg-indigo-500/50' : 'bg-zinc-700'}`} />
                              <Text size="xs" fw={800} className="text-zinc-400 uppercase tracking-tighter transition-colors group-hover/sub:text-zinc-200">{sub.nombre}</Text>
                            </Group>
                            
                            <Checkbox
                              size="xs"
                              label="Seleccionar Todo"
                              checked={todasSeleccionadas}
                              indeterminate={algunaSeleccionada && !todasSeleccionadas}
                              onChange={(e) => onToggleSubmodulo(idsSecciones, e.currentTarget.checked)}
                              color="indigo"
                              styles={{
                                label: { fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: '#71717a' },
                                input: { cursor: 'pointer', borderWidth: '1.5px' },
                                icon: { width: '80% !important', height: '80% !important' }
                              }}
                            />
                          </Group>
                          
                          <div className="grid grid-cols-2 gap-3 relative z-10">
                            {sub.secciones.map((sec: any) => (
                              <div 
                                key={sec.id}
                                className={`flex items-center gap-2 p-2 rounded-lg border transition-all cursor-pointer ${
                                  seccionesSeleccionadas.includes(sec.id) 
                                    ? 'bg-indigo-500/10 border-indigo-500/20' 
                                    : 'bg-zinc-950/20 border-transparent hover:bg-zinc-800/30'
                                }`}
                                onClick={() => onToggleSeccion(sec.id)}
                              >
                                <Checkbox
                                  checked={seccionesSeleccionadas.includes(sec.id)}
                                  onChange={() => {}} 
                                  size="xs"
                                  color="indigo"
                                  styles={{
                                    input: { cursor: 'pointer' }
                                  }}
                                />
                                <Text size="xs" fw={500} className={seccionesSeleccionadas.includes(sec.id) ? 'text-indigo-200' : 'text-zinc-400'}>
                                  {sec.nombre}
                                </Text>
                              </div>
                            ))}
                          </div>
                        </Box>
                      );
                    })}
                  </Stack>
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
        )}
      </div>

      <Group justify="flex-end" gap="md" mt="xl">
        <Button
          variant="subtle"
          onClick={onCancel}
          disabled={loading}
          radius="lg"
          size="sm"
          className="text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors"
        >
          Cancelar
        </Button>
        <Button
          onClick={onSave}
          loading={loading}
          radius="lg"
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20 px-8"
        >
          {isEdit ? "Guardar Cambios" : "Registrar Rol"}
        </Button>
      </Group>
    </Stack>
  );
};
