import {
  Button,
  TextInput,
  Stack,
  Text,
  Badge,
  ActionIcon,
  Menu,
  Box,
  Group,
} from "@mantine/core";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  BriefcaseIcon,
  TrashIcon,
  PencilSquareIcon,
  EllipsisVerticalIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import type { RES_Cargo } from "../service/organigrama.responses";

interface Props {
  cargos: RES_Cargo[];
  loading: boolean;
  busqueda: string;
  setBusqueda: (v: string) => void;
  // Props para registro integrado
  nombre: string;
  setNombre: (v: string) => void;
  loadingGuardar: boolean;
  onSave: () => void;
  error: string;
}

const inputClasses = {
  input:
    "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500 transition-all",
};

export const ListaCargos = ({
  cargos,
  loading,
  busqueda,
  setBusqueda,
  nombre,
  setNombre,
  loadingGuardar,
  onSave,
  error,
}: Props) => {
  return (
    <Stack gap="xl" className="animate-fade-in">
      {/* SECCIÓN 1: REGISTRO INTEGRADO Estilo Minas */}
      <Box className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-2xl">
        <Stack gap="xs">
          <Group gap="sm" mb={4}>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <PlusIcon className="w-4 h-4" />
            </div>
            <Text size="xs" fw={700} className="text-zinc-300 uppercase tracking-widest font-bold">
              Nuevo Puesto de Trabajo
            </Text>
          </Group>

          <Group align="flex-end" gap="xs">
            <TextInput
              placeholder="Ingresar nombre del cargo..."
              className="flex-1"
              radius="lg"
              classNames={inputClasses}
              value={nombre}
              onChange={(e) => setNombre(e.currentTarget.value)}
              disabled={loadingGuardar}
            />
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/20 px-6"
              radius="lg"
              onClick={onSave}
              loading={loadingGuardar}
              disabled={!nombre.trim()}
            >
              Asignar
            </Button>
          </Group>
          {error && <Text size="xs" color="red" className="mt-1">{error}</Text>}
        </Stack>
      </Box>

      {/* SECCIÓN 2: LISTADO DE CARGOS */}
      <Stack gap="md">
        <div className="flex items-center gap-3">
          <TextInput
            placeholder="Filtrar cargos por nombre..."
            leftSection={<MagnifyingGlassIcon className="w-4 h-4 text-zinc-400" />}
            className="flex-1"
            radius="lg"
            size="sm"
            classNames={inputClasses}
            value={busqueda}
            onChange={(e) => setBusqueda(e.currentTarget.value)}
          />
        </div>

        {loading ? (
          <Group justify="center" gap="xl" py="lg">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-full bg-zinc-900/40 animate-pulse border border-zinc-800" />
                <div className="h-2 w-16 bg-zinc-900/40 animate-pulse rounded" />
              </div>
            ))}
          </Group>
        ) : cargos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-zinc-900/10 rounded-2xl border border-dashed border-zinc-800">
            <BriefcaseIcon className="w-10 h-10 text-zinc-700 mb-2" />
            <p className="text-zinc-500 text-sm font-medium">No hay cargos registrados aún</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-y-8 gap-x-4 py-4">
            {cargos.map((cargo) => {
              const isActive = cargo.estado === "Activo";
              return (
                <div key={cargo.id_cargo} className="group relative flex flex-col items-center gap-3">
                  {/* Menú de acciones absoluto */}
                  <div className="absolute top-0 right-1/2 translate-x-10 z-20">
                     <Menu shadow="md" width={160} position="left-start">
                      <Menu.Target>
                        <ActionIcon 
                          variant="filled" 
                          color="zinc" 
                          size="sm" 
                          radius="xl"
                          className="bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <EllipsisVerticalIcon className="w-3 h-3 text-white" />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown className="bg-zinc-900 border-zinc-800 rounded-xl p-1.5 shadow-2xl">
                        <Menu.Label className="text-[10px] font-bold text-zinc-500 uppercase px-2 mb-1">Opciones</Menu.Label>
                        <Menu.Item leftSection={<PencilSquareIcon className="w-4 h-4" />} className="text-zinc-300 hover:bg-zinc-800 rounded-lg">Editar</Menu.Item>
                        <Menu.Item leftSection={<TrashIcon className="w-4 h-4" />} color="red" className="hover:bg-red-900/20 rounded-lg">Eliminar</Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </div>

                  {/* Círculo / Avatar */}
                  <div className="relative">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 transition-all duration-300 shadow-xl ${
                      isActive 
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 group-hover:border-emerald-400 group-hover:scale-105" 
                        : "bg-zinc-800/50 border-zinc-700 text-zinc-600"
                    }`}>
                      <UserCircleIcon className="w-8 h-8" />
                    </div>

                    {/* Badge de estado flotante */}
                    <Badge
                      size="xs"
                      variant="filled"
                      color={isActive ? "green.7" : "gray.8"}
                      radius="xs"
                      className="absolute -top-1 -right-1 h-4 px-1 text-[8px] font-bold shadow-md border border-zinc-900"
                    >
                      {cargo.estado}
                    </Badge>
                  </div>

                  {/* Nombre del Cargo */}
                  <div className="text-center w-full px-1">
                    <Text className="text-[11px] font-bold text-zinc-300 group-hover:text-white transition-colors uppercase leading-tight tracking-wide">
                      {cargo.nombre}
                    </Text>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Stack>
    </Stack>
  );
};
