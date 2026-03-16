import {
    Avatar,
    Stack,
    Text,
    Group,
    Box,
    Skeleton,
    SimpleGrid,
    Badge,
} from "@mantine/core";
import {
    UserIcon,
} from "@heroicons/react/24/outline";
import { useTitlePage } from "../../../hooks/useTitlePage";
import { usePerfil } from "../hooks/usePerfil";

export const PerfilPage = () => {
    useTitlePage("Mi Perfil");
    const { perfil, loading } = usePerfil();

    if (loading && !perfil) {
        return (
            <Stack gap={30} className="animate-fade-in p-6 mb-20 max-w-2xl mx-auto">
                {/* Skeleton Avatar Alineado a la Izquierda */}
                <Group gap="lg" className="w-full justify-start">
                    <Skeleton height={80} width={80} radius="md" />
                    <Stack gap={8}>
                        <Skeleton height={16} width={120} radius="xs" />
                        <Group gap={6}>
                            <Skeleton height={20} width={80} radius="sm" />
                            <Skeleton height={20} width={70} radius="sm" />
                        </Group>
                    </Stack>
                </Group>

                {/* Skeleton Grid */}
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={35} className="w-full">
                    {[...Array(10)].map((_, i) => (
                        <div key={i}>
                            <Skeleton height={12} width="35%" mb={14} radius="xs" />
                            <Skeleton height={18} width="80%" radius="xs" />
                        </div>
                    ))}
                </SimpleGrid>
            </Stack>
        );
    }

    if (!perfil) return null;

    return (
        <Stack gap={40} className="animate-fade-in p-6 mb-20 max-w-2xl mx-auto">
            {/* Header / Avatar Alineado a la Izquierda */}
            <Group gap="xl" justify="flex-start" align="center" className="w-full">
                <Avatar
                    src={perfil.path_foto}
                    size={85}
                    radius="md"
                    className="border border-zinc-800 bg-zinc-900 shadow-xl"
                >
                    <UserIcon className="w-10 h-10 text-zinc-700" />
                </Avatar>
                <Stack gap={6}>
                    <Text fw={800} size="lg" className="text-white tracking-tight">@{perfil.username}</Text>
                    <Group gap={8}>
                        <Badge
                            variant="light"
                            color="indigo"
                            radius="sm"
                            size="md"
                            className="font-bold border border-indigo-500/20"
                        >
                            {perfil.nombre_rol}
                        </Badge>
                        {perfil.nombre_cargo && (
                            <Badge
                                variant="light"
                                color="pink"
                                radius="sm"
                                size="md"
                                className="font-bold border border-pink-500/20"
                            >
                                {perfil.nombre_cargo}
                            </Badge>
                        )}
                    </Group>
                </Stack>
            </Group>

            {/* Grid Único de Información Centrado */}
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={35} className="w-full">
                <DataField label="Nombres" value={perfil.nombre} />
                <DataField label="Apellidos" value={perfil.apellido} />
                <DataField label="Documento de Identidad (DNI)" value={perfil.dni} />
                <DataField label="RUC de Persona" value={perfil.ruc || 'No registrado'} />
                <DataField label="Carnet de Extranjería" value={perfil.carnet_extranjeria || 'No registrado'} />
                <DataField label="Pasaporte" value={perfil.pasaporte || 'No registrado'} />
                <DataField label="Fecha de Nacimiento" value={perfil.fecha_nacimiento || 'No registrado'} />
                <DataField label="Empresa / Institución" value={perfil.empresa_nombre || 'Corporativo'} />
                <DataField label="RUC de la Empresa" value={perfil.empresa_ruc || 'No registrado'} />
                <DataField label="Área o Departamento" value={perfil.nombre_area || 'No registrado'} />
                <DataField label="Cargo Desempeñado" value={perfil.nombre_cargo || 'No registrado'} />
                <DataField label="Nivel de Acceso (Rol)" value={perfil.nombre_rol} />
            </SimpleGrid>
        </Stack>
    );
};

// Campo de Datos Estilizado (Minimalista - Sin Inputs)
const DataField = ({ label, value, subValue }: { label: string, value: string, subValue?: string }) => (
    <Stack gap={6} className="group">
        <Text size="13px" fw={700} className="text-zinc-50 transition-colors group-hover:text-indigo-400">
            {label}
        </Text>
        <Box className="ml-6">
            <Text size="12.5px" fw={400} className="text-zinc-500 leading-relaxed italic">
                {value}
            </Text>
            {subValue && (
                <Text size="11px" color="#818cf8" fw={700} className="mt-1 opacity-90 tracking-tight flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    {subValue}
                </Text>
            )}
        </Box>
    </Stack>
);
