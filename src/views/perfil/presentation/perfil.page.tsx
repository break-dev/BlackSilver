import {
    Avatar,
    Divider,
    Stack,
    Text,
    Group,
    Box,
    Skeleton,
    SimpleGrid,
    Badge,
    TextInput,
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
            <Stack gap={0} className="p-6 md:p-12 mb-20 max-w-5xl mx-auto">
                <Box mb={40}>
                    <Skeleton height={28} width="30%" mb={10} radius="md" />
                    <Skeleton height={14} width="50%" radius="xs" />
                </Box>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-40">
                    <div className="md:col-span-4">
                        <Skeleton height={16} width="60%" mb={8} radius="xs" />
                        <Skeleton height={40} width="90%" radius="xs" />
                    </div>
                    <div className="md:col-span-8">
                        <Stack gap={25}>
                            <Group gap="lg">
                                <Skeleton height={70} width={70} radius="md" />
                                <Stack gap={8}>
                                    <Skeleton height={16} width={100} radius="xs" />
                                    <Group gap={6}>
                                        <Skeleton height={20} width={80} radius="sm" />
                                        <Skeleton height={20} width={60} radius="sm" />
                                    </Group>
                                </Stack>
                            </Group>
                            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={20}>
                                {[...Array(6)].map((_, i) => (
                                    <div key={i}>
                                        <Skeleton height={10} width="40%" mb={8} radius="xs" />
                                        <Skeleton height={42} radius="lg" />
                                    </div>
                                ))}
                            </SimpleGrid>
                        </Stack>
                    </div>
                </div>
            </Stack>
        );
    }

    if (!perfil) return null;

    return (
        <Stack gap={0} className="animate-fade-in p-2 md:p-6 mb-20 max-w-5xl mx-auto">
            {/* Título de Página Minimalista */}
            <Box mb={25}>
                <Text size="22px" fw={700} className="text-white tracking-tight">Detalles de la Cuenta</Text>
                <Text size="xs" color="dimmed" className="opacity-80 mt-1 font-medium italic">
                    Consulta tu información personal y los privilegios asignados en la plataforma.
                </Text>
            </Box>

            {/* SECCIÓN 1: INFORMACIÓN PERSONAL */}
            <ProfileSection
                title="Información Personal"
                description="Datos de identidad y contacto vinculados a tu perfil de usuario."
            >
                <Stack gap={25}>
                    {/* Fila de Avatar Sobria */}
                    <Group gap="lg">
                        <Avatar
                            src={perfil.path_foto}
                            size={70}
                            radius="md"
                            className="border border-zinc-800 bg-zinc-900 shadow-sm"
                        >
                            <UserIcon className="w-8 h-8 text-zinc-700" />
                        </Avatar>
                        <Stack gap={6}>
                            <Text fw={700} size="sm" className="text-zinc-200">@{perfil.username}</Text>
                            <Group gap={6}>
                                <Badge
                                    variant="light"
                                    color="indigo"
                                    radius="sm"
                                    size="sm"
                                    className="font-bold border border-indigo-500/20"
                                >
                                    {perfil.nombre_rol}
                                </Badge>
                                {perfil.nombre_cargo && (
                                    <Badge
                                        variant="light"
                                        color="pink"
                                        radius="sm"
                                        size="sm"
                                        className="font-bold border border-pink-500/20"
                                    >
                                        {perfil.nombre_cargo}
                                    </Badge>
                                )}
                            </Group>
                        </Stack>
                    </Group>

                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={20}>
                        <DataField label="Nombres" value={perfil.nombre} />
                        <DataField label="Apellidos" value={perfil.apellido} />
                        <DataField label="Documento de Identidad (DNI)" value={perfil.dni} />
                        <DataField label="RUC de Persona" value={perfil.ruc || '—'} />
                        <DataField label="Carnet de Extranjería" value={perfil.carnet_extranjeria || '—'} />
                        <DataField label="Pasaporte" value={perfil.pasaporte || '—'} />
                        <DataField label="Fecha de Nacimiento" value={perfil.fecha_nacimiento || 'No registrada'} />
                    </SimpleGrid>
                </Stack>
            </ProfileSection>

            <Divider my={40} color="zinc.900" />

            {/* SECCIÓN 2: DETALLES DE LA ORGANIZACIÓN */}
            <ProfileSection
                title="Información Laboral"
                description="Detalles sobre tu posición, cargo y empresa asignada."
            >
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={20}>
                    <DataField
                        label="Empresa / Institución"
                        value={perfil.empresa_nombre || 'Corporativo'}
                    />
                    <DataField
                        label="RUC de la Empresa"
                        value={perfil.empresa_ruc || '—'}
                    />
                    <DataField
                        label="Área o Departamento"
                        value={perfil.nombre_area || 'S/A'}
                    />
                    <DataField
                        label="Cargo Desempeñado"
                        value={perfil.nombre_cargo || 'S/C'}
                    />
                    <DataField
                        label="Nivel de Acceso (Rol)"
                        value={perfil.nombre_rol}
                    />
                </SimpleGrid>
            </ProfileSection>

            <Divider my={40} color="zinc.900" />
        </Stack>
    );
};

// Componente de Sección Compacto
const ProfileSection = ({ title, description, children }: { title: string, description: string, children: React.ReactNode }) => (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-4 max-w-[240px]">
            <Text fw={700} size="sm" className="text-zinc-200 mb-1">{title}</Text>
            <Text size="xs" color="dimmed" className="opacity-70 leading-relaxed font-normal">
                {description}
            </Text>
        </div>
        <div className="md:col-span-8">
            {children}
        </div>
    </div>
);

// Campo de Datos Estilizado (Obsidiana Glass - Sincronizado con Mantine Styles)
const DataField = ({ label, value, subValue }: { label: string, value: string, subValue?: string }) => (
    <Box className="select-none pointer-events-none">
        <TextInput
            label={label}
            value={value}
            readOnly
            radius="lg"
            styles={{
                input: {
                    backgroundColor: 'rgba( 19, 20, 27)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 1)',
                    color: 'rgba(255, 255, 255, 0.6)', // zinc-400 con opacidad
                    fontWeight: 500,
                    height: '42px',
                    boxShadow: '0 4px 30px rgba(156, 156, 156, 0.1)',
                },
                label: {
                    color: '#d4d4d8', // zinc-300
                    marginBottom: '4px',
                    fontWeight: 500,
                    fontSize: '13px'
                }
            }}
        />
        {subValue && (
            <Text size="11px" color="#818cf8" fw={700} className="mt-1.5 ml-2 opacity-90 tracking-tight flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                {subValue}
            </Text>
        )}
    </Box>
);
