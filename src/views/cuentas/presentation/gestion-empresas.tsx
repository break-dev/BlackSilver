import { ActionIcon, Badge, Group, ScrollArea, Select, Stack, Text, Skeleton, Tooltip, Box, Button } from '@mantine/core';
import { BuildingOffice2Icon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useGestionEmpresas } from '../hooks/useGestionEmpresas';
import { useState } from 'react';

interface GestionEmpresasProps {
    id_usuario: number;
    id_empresa_pertenece: number;
    nombre_empleado: string;
    refreshParent: () => void;
}

export const GestionEmpresas = ({ id_usuario, id_empresa_pertenece, nombre_empleado, refreshParent }: GestionEmpresasProps) => {
    const { asignadas, todas, loading, loadingId, handleVincular, handleDesvincular } = 
        useGestionEmpresas(id_usuario, refreshParent);

    const [idEmpresa, setIdEmpresa] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!idEmpresa) return;
        await handleVincular(Number(idEmpresa));
        setIdEmpresa(null);
    };

    return (
        <Stack gap="lg">
            {/* Formulario de Vinculación (Estilo NuevoContrato) */}
            <Stack 
                gap="md" 
                className="bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800/50"
            >
                <Group gap="sm" align="center">
                    <Box className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                        <BuildingOffice2Icon className="w-4 h-4 text-indigo-400" />
                    </Box>
                    <Stack gap={0}>
                        <Text size="xs" fw={700} className="text-zinc-300 uppercase tracking-wider">
                            Vincular Nueva Empresa
                        </Text>
                        <Text size="xs" className="text-zinc-500">
                            {nombre_empleado}
                        </Text>
                    </Stack>
                </Group>

                <Select
                    placeholder="Seleccione empresa"
                    data={(todas || [])
                        .filter(t => t.id !== id_empresa_pertenece && !asignadas.find(a => a.id_empresa === t.id))
                        .map(t => ({ value: t.id.toString(), label: t.nombre_comercial || t.razon_social }))}
                    value={idEmpresa}
                    onChange={setIdEmpresa}
                    radius="lg"
                    size="sm"
                    searchable
                    classNames={{
                        input: "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500",
                        dropdown: "bg-zinc-900 border-zinc-800",
                        option: "hover:bg-zinc-800 text-zinc-300 data-[selected]:bg-zinc-100 data-[selected]:text-zinc-900 rounded-md my-1",
                    }}
                    nothingFoundMessage="No hay más empresas"
                />

                <Group justify="flex-end">
                    <Button
                        onClick={handleSubmit}
                        disabled={!idEmpresa || loading}
                        radius="lg"
                        size="sm"
                        leftSection={<PlusIcon className="w-4 h-4" />}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20"
                    >
                        Vincular Empresa
                    </Button>
                </Group>
            </Stack>

            {/* Lista de Empresas (Estilo HistorialContratos) */}
            <Stack gap="sm">
                <Group gap="xs" align="center">
                    <div className="h-px flex-1 bg-zinc-800" />
                    <Text size="xs" fw={700} className="text-zinc-500 uppercase tracking-widest px-2">
                        Empresas Asignadas
                    </Text>
                    <div className="h-px flex-1 bg-zinc-800" />
                </Group>

                <ScrollArea.Autosize mah={400} type="scroll" scrollbarSize={4}>
                    <Stack gap="sm">
                        {loading && (
                            <Stack gap="sm">
                                {[1, 2].map((i) => (
                                    <Group key={i} wrap="nowrap" className="p-3 bg-zinc-900/30 border border-zinc-800/50 rounded-lg">
                                        <Skeleton height={40} width={40} radius="xl" />
                                        <Stack gap={6} className="flex-1">
                                            <Skeleton height={13} width="50%" radius="sm" />
                                            <Skeleton height={10} width="35%" radius="sm" />
                                        </Stack>
                                    </Group>
                                ))}
                            </Stack>
                        )}

                        {!loading && asignadas.length === 0 && (
                            <div className="py-10 flex flex-col items-center justify-center border-2 border-dashed border-zinc-800/60 rounded-2xl bg-zinc-900/10">
                                <div className="w-12 h-12 rounded-2xl bg-zinc-800/50 border border-zinc-700 flex items-center justify-center mb-3">
                                    <BuildingOffice2Icon className="w-6 h-6 text-zinc-600" />
                                </div>
                                <Text size="sm" className="text-zinc-500 text-center">Sin empresas asignadas</Text>
                            </div>
                        )}

                        {!loading && asignadas.map((emp) => {
                            const isDeleting = loadingId === emp.id_empresa;
                            return (
                                <div 
                                    key={emp.id_empresa}
                                    className={`flex items-center gap-3 p-3 border rounded-lg transition-all duration-300 ${
                                        isDeleting 
                                        ? "opacity-50 scale-[0.99] border-red-500/20 bg-red-900/5" 
                                        : "bg-zinc-900/30 border-zinc-800/50"
                                    }`}
                                >
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                                        <BuildingOffice2Icon className="w-5 h-5" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <Text className="text-sm font-bold text-white truncate">
                                                {emp.nombre_comercial || emp.razon_social}
                                            </Text>
                                            <Badge color="indigo" size="sm" variant="light">
                                                ACTIVO
                                            </Badge>
                                        </div>
                                        <Text size="xs" color="dimmed" className="truncate">
                                            {emp.razon_social}
                                        </Text>
                                    </div>

                                    <Tooltip label="Desvincular Empresa" position="left" withArrow radius="md">
                                        <ActionIcon 
                                            variant="subtle" 
                                            color="red" 
                                            size="sm"
                                            onClick={() => handleDesvincular(emp.id_empresa)}
                                            loading={isDeleting}
                                            className="shrink-0"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </ActionIcon>
                                    </Tooltip>
                                </div>
                            );
                        })}
                    </Stack>
                </ScrollArea.Autosize>
            </Stack>
        </Stack>
    );
};
