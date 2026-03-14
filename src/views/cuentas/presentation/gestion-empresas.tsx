import { ActionIcon, Badge, Group, ScrollArea, Select, Stack, Text } from '@mantine/core';
import { BuildingOffice2Icon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useGestionEmpresas } from '../hooks/useGestionEmpresas';

interface GestionEmpresasProps {
    id_usuario: number;
    id_empresa_pertenece: number;
    nombre_empleado: string;
    refreshParent: () => void;
}

export const GestionEmpresas = ({ id_usuario, id_empresa_pertenece, nombre_empleado, refreshParent }: GestionEmpresasProps) => {
    const { asignadas, todas, loading, handleVincular, handleDesvincular } = 
        useGestionEmpresas(id_usuario, refreshParent);

    const selectClasses = {
        input: "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500 transition-all",
        label: "text-zinc-300 mb-1 font-bold text-xs uppercase tracking-wider"
    };

    return (
        <Stack gap="md">
            <div>
                <Text size="sm" color="dimmed" mb="xs">
                    Gestiona las empresas a las que <span className="text-white font-bold">{nombre_empleado}</span> tiene permiso para ver información.
                </Text>
            </div>

            <div className="bg-zinc-900/40 rounded-2xl border border-zinc-800/80 p-4">
                <Select
                    label="Vincular Nueva Empresa"
                    placeholder="Busca y selecciona una empresa"
                    data={(todas || [])
                        .filter(t => t.id !== id_empresa_pertenece && !asignadas.find(a => a.id_empresa === t.id))
                        .map(t => ({ value: t.id.toString(), label: t.nombre_comercial || t.razon_social }))}
                    leftSection={<PlusIcon className="w-4 h-4 text-indigo-400" />}
                    radius="lg"
                    classNames={selectClasses}
                    searchable
                    onChange={(val) => val && handleVincular(Number(val))}
                    nothingFoundMessage="No hay más empresas disponibles"
                />
            </div>

            <div className="space-y-2">
                <Text size="xs" fw={800} className="text-zinc-500 uppercase tracking-widest px-1">
                    Empresas con Acceso ({asignadas.length})
                </Text>
                <ScrollArea.Autosize mah={300} type="scroll" scrollbarSize={4}>
                    <Stack gap="xs">
                        {asignadas.map((emp) => (
                            <div 
                                key={emp.id_empresa}
                                className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/20 border border-zinc-800/50 hover:border-zinc-700/50 transition-colors group"
                            >
                                <Group gap="sm" className="min-w-0 flex-1">
                                    <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shrink-0">
                                        <BuildingOffice2Icon className="w-5 h-5 text-indigo-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <Text size="sm" fw={700} className="text-zinc-200 line-clamp-1">
                                            {emp.nombre_comercial || emp.razon_social}
                                        </Text>
                                        <Text size="xs" color="dimmed" className="line-clamp-1">
                                            {emp.razon_social}
                                        </Text>
                                    </div>
                                </Group>

                                <div className="flex items-center gap-2">
                                    <Badge size="xs" variant="dot" color="green" className="border-green-500/20">
                                        Vinculado
                                    </Badge>
                                    <ActionIcon 
                                        variant="subtle" 
                                        color="red" 
                                        radius="md" 
                                        size="lg"
                                        onClick={() => handleDesvincular(emp.id_empresa)}
                                        className="hover:bg-red-500/10"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </ActionIcon>
                                </div>
                            </div>
                        ))}
                        {asignadas.length === 0 && !loading && (
                            <div className="py-8 text-center bg-zinc-900/10 rounded-xl border border-dashed border-zinc-800">
                                <Text size="xs" color="dimmed">No se encontraron empresas vinculadas</Text>
                            </div>
                        )}
                    </Stack>
                </ScrollArea.Autosize>
            </div>
        </Stack>
    );
};
