import {
    Avatar,
    Badge,
    Grid,
    Paper,
    Skeleton,
    Stack,
    Text,
    Group,
} from "@mantine/core";
import {
    IdentificationIcon,
    AtSymbolIcon,
    BuildingOfficeIcon,
    MapIcon,
    BriefcaseIcon,
    UserIcon,
} from "@heroicons/react/24/outline";
import { useTitlePage } from "../../../hooks/useTitlePage";
import { usePerfil } from "../hooks/usePerfil";
import { BlackcitoLogo } from "../../../presentation/assets/imports";

export const PerfilPage = () => {
    useTitlePage("Mi Perfil");
    const { perfil, loading } = usePerfil();

    if (loading && !perfil) {
        return (
            <Stack gap="xl" className="animate-fade-in p-6">
                <Paper p="xl" radius={40} className="bg-zinc-900/40 border-zinc-800">
                    <Group gap="xl">
                        <Skeleton height={100} circle />
                        <Stack gap="sm" className="flex-1">
                            <Skeleton height={20} width="30%" radius="xl" />
                            <Skeleton height={14} width="15%" radius="xl" />
                        </Stack>
                    </Group>
                </Paper>
                <Grid gutter="xl">
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <Skeleton height={180} radius={40} />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <Skeleton height={180} radius={40} />
                    </Grid.Col>
                </Grid>
            </Stack>
        );
    }

    if (!perfil) return null;

    return (
        <Stack gap="xl" className="animate-fade-in p-2 md:p-6 mb-10 overflow-hidden relative">
            {/* Cabecera de Perfil Crystallized */}
            <Paper 
                p={{ base: 'xl', md: 40 }}
                radius={40}
                className="bg-[#0f0f12]/90 border border-white/5 backdrop-blur-3xl relative overflow-hidden group/header transition-all duration-500 hover:border-indigo-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
            >
                {/* Fondo Decorativo: Líneas Topográficas y Cristales */}
                <div className="absolute inset-0 opacity-10 pointer-events-none select-none">
                    <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 800 400" fill="none">
                        <path d="M-50,150 Q200,50 400,200 T850,150" stroke="white" strokeWidth="0.5" strokeOpacity="0.4" fill="none" />
                        <path d="M-50,180 Q200,80 400,230 T850,180" stroke="white" strokeWidth="0.5" strokeOpacity="0.3" fill="none" />
                        <path d="M-100,250 Q150,150 350,300 T800,250" stroke="white" strokeWidth="0.5" strokeOpacity="0.2" fill="none" />
                    </svg>
                </div>

                {/* Cristales en la esquina derecha estilo Imagen */}
                <div className="absolute top-0 right-0 w-2/5 h-full opacity-20 pointer-events-none select-none overflow-hidden">
                    <svg viewBox="0 0 200 200" className="w-full h-full translate-x-12 -translate-y-12 group-hover:scale-110 transition-transform duration-1000 rotate-12">
                        <polygon points="120,40 180,60 160,110 100,90" fill="url(#grad-c)" fillOpacity="0.4" />
                        <polygon points="150,20 190,30 185,75 160,10" fill="url(#grad-c)" fillOpacity="0.2" />
                        <polygon points="80,100 130,80 150,130 100,150" fill="url(#grad-c)" fillOpacity="0.3" />
                        <defs>
                            <linearGradient id="grad-c" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#c084fc" />
                                <stop offset="100%" stopColor="#818cf8" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>

                {/* Resplandores de fondo */}
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute -bottom-24 right-24 w-64 h-64 bg-fuchsia-600/10 rounded-full blur-[80px] pointer-events-none" />

                <Group gap={35} align="center" wrap="nowrap" className="relative z-10 flex-col md:flex-row">
                    {/* Avatar con Brillo Neon en los bordes */}
                    <div className="relative shrink-0 group/avatar">
                        {/* Anillo de Color Vibrante (Glow) */}
                        <div className="absolute -inset-2 bg-gradient-to-tr from-[#00ebff] via-[#bf5af2] to-[#ff2d55] rounded-full blur-[4px] opacity-70 group-hover/avatar:opacity-100 transition-opacity duration-500" />
                        <div className="absolute -inset-1 rounded-full border border-white/10" />
                        
                        <Avatar 
                            src={perfil.path_foto} 
                            size={120} 
                            radius={100} 
                            className="relative border-4 border-[#0c0c0e] shadow-2xl bg-[#0c0c0e]"
                        >
                            <span className="text-3xl font-black text-white tracking-widest uppercase drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
                                {perfil.nombre.charAt(0)}{perfil.apellido.charAt(0)}
                            </span>
                        </Avatar>
                        
                        {/* Punto de estado verde con borde grueso */}
                        <div className="absolute bottom-1 right-2 w-7 h-7 bg-[#2ebd59] border-[6px] border-[#0c0c0e] rounded-full shadow-[0_0_15px_rgba(46,189,89,0.5)] z-20" />
                    </div>

                    <Stack gap={10} className="flex-1 text-center md:text-left">
                        <Stack gap={2}>
                            <Text 
                                size="38px" 
                                fw={800} 
                                className="text-white tracking-tighter leading-none"
                            >
                                {perfil.nombre} {perfil.apellido}
                            </Text>
                            <Text size="sm" color="dimmed" fw={600} className="opacity-50">
                                @{perfil.username}
                            </Text>
                        </Stack>

                        <Group gap="xs" className="justify-center md:justify-start">
                            <Badge 
                                size="md" 
                                variant="light" 
                                color="violet"
                                radius="md"
                                className="font-bold border border-violet-500/20"
                            >
                                {perfil.nombre_rol}
                            </Badge>
                            <Badge 
                                size="md" 
                                variant="light" 
                                color="cyan"
                                radius="md"
                                className="font-bold border border-cyan-500/20"
                            >
                                {perfil.empresa_nombre || 'Corporativo'}
                            </Badge>
                        </Group>
                    </Stack>
                </Group>

                {/* Blackcito - Mascot de la App */}
                <div className="absolute -bottom-2 -right-2 w-32 md:w-40 pointer-events-none select-none animate-float opacity-80 z-20 hover:opacity-100 transition-opacity">
                    <img 
                        src={BlackcitoLogo} 
                        alt="Blackcito" 
                        className="w-full h-full drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)] transform -rotate-12 group-hover/header:rotate-0 group-hover/header:scale-110 transition-transform duration-700"
                    />
                </div>
            </Paper>

            <Grid gutter="xl">
                {/* Sección Personal */}
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Paper 
                        p="xl" 
                        radius={40}
                        className="bg-[#0f0f12]/70 border border-white/5 h-full relative overflow-hidden group transition-all duration-300 hover:border-purple-500/20 shadow-2xl"
                    >
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-purple-500 via-fuchsia-400 to-transparent shadow-[0_0_10px_rgba(168,85,247,0.3)]" />
                        
                        <Group mb={30} gap="sm">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shadow-[0_4px_12px_rgba(168,85,247,0.2)]">
                                <UserIcon className="w-6 h-6 text-fuchsia-400" />
                            </div>
                            <Text fw={800} size="sm" className="text-white uppercase tracking-[0.2em] leading-none">Información Personal</Text>
                        </Group>

                        <Stack gap="sm">
                            <CrystallineInfoRow 
                                icon={<IdentificationIcon className="w-5 h-5 text-fuchsia-400" />} 
                                label="Número de Documento" 
                                value={perfil.dni} 
                                color="purple"
                            />
                            <CrystallineInfoRow 
                                icon={<AtSymbolIcon className="w-5 h-5 text-purple-300" />} 
                                label="Nombre de Usuario del Sistema" 
                                value={perfil.username} 
                                color="purple"
                            />
                        </Stack>
                    </Paper>
                </Grid.Col>

                {/* Sección de la Organización */}
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Paper 
                        p="xl" 
                        radius={40}
                        className="bg-[#0f0f12]/70 border border-white/5 h-full relative overflow-hidden group transition-all duration-300 hover:border-cyan-500/20 shadow-2xl"
                    >
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-cyan-400 via-emerald-400 to-transparent shadow-[0_0_10px_rgba(34,211,238,0.3)]" />

                        <Group mb={30} gap="sm">
                            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shadow-[0_4px_12px_rgba(34,211,238,0.2)]">
                                <BriefcaseIcon className="w-6 h-6 text-cyan-400" />
                            </div>
                            <Text fw={800} size="sm" className="text-white uppercase tracking-[0.2em] leading-none">Detalles de la Organización</Text>
                        </Group>

                        <Stack gap="sm">
                            <CrystallineInfoRow 
                                icon={<BuildingOfficeIcon className="w-5 h-5 text-emerald-400" />} 
                                label="Empresa u Organización" 
                                value={perfil.empresa_nombre || 'Consorcio Minero Black Silver'} 
                                subValue={perfil.empresa_ruc ? `RUC: ${perfil.empresa_ruc}` : 'RUC: XXXXXXXXXXX'}
                                color="cyan"
                            />
                            <CrystallineInfoRow 
                                icon={<MapIcon className="w-5 h-5 text-cyan-300" />} 
                                label="Departamento / Área" 
                                value={perfil.nombre_area || 'Gerencia General'} 
                                color="cyan"
                            />
                            <CrystallineInfoRow 
                                icon={<BriefcaseIcon className="w-5 h-5 text-emerald-300" />} 
                                label="Cargo o Posición" 
                                value={perfil.nombre_cargo || 'Especialista / Gerente'} 
                                color="cyan"
                            />
                        </Stack>
                    </Paper>
                </Grid.Col>
            </Grid>
        </Stack>
    );
};

interface CrystallineInfoRowProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    subValue?: string;
    color: 'purple' | 'cyan';
}

const CrystallineInfoRow = ({ icon, label, value, subValue, color }: CrystallineInfoRowProps) => (
    <div className={`bg-[#16161a] border border-white/[0.05] rounded-[22px] p-4 transition-all duration-300 hover:bg-[#1c1c22] group/item ${color === 'purple' ? 'hover:border-purple-500/20' : 'hover:border-cyan-500/20'}`}>
        <Group wrap="nowrap" gap="md">
            <div className={`w-10 h-10 rounded-xl bg-zinc-900/80 border border-white/5 flex items-center justify-center shrink-0 transition-transform group-hover/item:scale-110 ${color === 'purple' ? 'shadow-[0_0_15px_rgba(168,85,247,0.1)]' : 'shadow-[0_0_15px_rgba(34,211,238,0.1)]'}`}>
                {icon}
            </div>
            <Stack gap={0} className="flex-1">
                <Text size="9px" fw={800} className="text-zinc-500 uppercase tracking-[0.2em] mb-1 leading-none">
                    {label}
                </Text>
                <Text size="sm" fw={600} className="text-white group-hover/item:text-white transition-colors">
                    {value}
                </Text>
                {subValue && (
                    <Text size="xs" color="dimmed" className="opacity-60 font-medium">
                        {subValue}
                    </Text>
                )}
            </Stack>
        </Group>
    </div>
);
