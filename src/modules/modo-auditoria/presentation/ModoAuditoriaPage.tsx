import {
  Button,
  Container,
  Stack,
  Title,
  Text,
  Card,
  Group,
  ThemeIcon,
  Badge,
  SimpleGrid,
  Modal,
  Paper,
  Box,
  ActionIcon,
} from "@mantine/core";
import {
  IconShieldLock,
  IconShieldOff,
  IconLockOpen,
  IconLockCode,
  IconTruckDelivery,
  IconShoppingCart,
  IconPick,
  IconUsers,
  IconClockCheck,
  IconPlayerPlay,
  IconArrowRight,
  IconX,
  IconHelpCircle,
  IconInfoCircle,
  IconLayoutGrid,
  IconBuildingFactory2,
  IconBuildingSkyscraper,
  IconLockAccess,
} from "@tabler/icons-react";
import { useAuditoriaStore } from "../../../stores/auditoria.store";
import { ModoAuditoriaService } from "../service/service";
import { useNotify } from "../../../hooks/useNotify";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTitlePage } from "../../../hooks/useTitlePage";
import { BlackcitoAssets } from "../../../presentation/assets/blackcito/blackcito-assets";
import { BlackcitoSinPatitas } from "../../../presentation/assets/imports";

/**
 * Landing Page Corporativa (/about)
 * Corporación de Servicios Cupper & Hannia E.I.R.L.
 *
 * Mantiene intacto el modal del Panel de Auditoría por doble clic en el footer.
 */
export default function ModoAuditoriaPage() {
  useTitlePage("Acerca del Sistema");
  const { en_modo_auditable, setModoAuditoria } = useAuditoriaStore();
  const { notifySuccess, notifyError } = useNotify();
  const [loading, setLoading] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [blackcitoVisible, setBlackcitoVisible] = useState(true);

  const handleToggle = async () => {
    setLoading(true);
    const nuevoEstado = !en_modo_auditable;
    try {
      await ModoAuditoriaService.toggle(nuevoEstado);
      setModoAuditoria(nuevoEstado);
      notifySuccess(
        `Modo auditoría ${nuevoEstado ? "activado" : "desactivado"} con éxito`,
      );
    } catch (error) {
      console.error(error);
      notifyError("No se pudo cambiar el estado del modo auditoría");
    } finally {
      setLoading(false);
    }
  };

  const modulos = [
    {
      titulo: "Gestión de Almacenes e Inventarios",
      desc: "Control de productos, movimientos, lotes en inventario y atención de requerimientos.",
      icon: IconTruckDelivery,
      color: "emerald",
    },
    {
      titulo: "Compras y Cotizaciones",
      desc: "Gestión de solicitudes de reabastecimiento, cotizaciones con proveedores y órdenes de compra.",
      icon: IconShoppingCart,
      color: "blue",
    },
    {
      titulo: "Minas, Labores y Concesiones",
      desc: "Administración de concesiones mineras, frentes de trabajo, zonas de operación y labores.",
      icon: IconPick,
      color: "amber",
    },
    {
      titulo: "Gestión de Personal y Contratistas",
      desc: "Registro completo de trabajadores, contratistas y asignación de labores.",
      icon: IconUsers,
      color: "violet",
    },
    {
      titulo: "Asistencia y Programación de Horarios",
      desc: "Control diario de marcaciones de ingreso/salida, turnos de trabajo y horarios por sede.",
      icon: IconClockCheck,
      color: "cyan",
    },
    {
      titulo: "Socios Comerciales y Proveedores",
      desc: "Directorio centralizado de proveedores, contratistas, datos fiscales y contactos comerciales.",
      icon: IconBuildingFactory2,
      color: "teal",
    },
    {
      titulo: "Estructura Empresarial y Sedes",
      desc: "Configuración de la empresa, sedes operativas y unidades de medida.",
      icon: IconBuildingSkyscraper,
      color: "orange",
    },
    {
      titulo: "Seguridad y Control de Accesos",
      desc: "Administración de usuarios, roles, permisos de navegación y trazabilidad de accesos.",
      icon: IconLockAccess,
      color: "indigo",
    },
  ];

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <Box className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Estilos inline para el efecto de rebote idéntico a login.page.tsx */}
      <style>
        {`
          @keyframes bounceLogo {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-7px); }
          }
          .animate-bounce-logo {
            animation: bounceLogo 2.5s ease-in-out infinite;
          }
        `}
      </style>

      {/* 1. Header / Navbar Superior */}
      <header className="sticky top-0 z-50 bg-zinc-950/85 backdrop-blur-md border-b border-zinc-800/80 px-6 py-3">
        <Container size="xl" className="flex items-center justify-between">
          <Group gap="md" className="cursor-pointer" onClick={() => scrollToSection("inicio")}>
            <div className="w-10 h-10 flex items-center justify-center animate-bounce-logo relative">
              <img
                src={BlackcitoSinPatitas}
                alt="Cupper & Hannia Logo"
                className="w-full h-full object-contain drop-shadow-[0_0_12px_rgba(245,158,11,0.25)]"
              />
            </div>
            <Stack gap={0}>
              <Text fw={900} size="md" className="text-white tracking-wide leading-none">
                Cupper & Hannia
              </Text>
              <Text size="9px" c="zinc.4" className="font-medium tracking-[0.2em] uppercase mt-1">
                SISTEMA DE GESTIÓN MINERA
              </Text>
            </Stack>
          </Group>

          {/* Navegación por Secciones */}
          <Group gap="xl" className="hidden md:flex">
            {[
              { id: "inicio", label: "Inicio" },
              { id: "nosotros", label: "Sobre el Sistema" },
              { id: "modulos", label: "Módulos" },
              { id: "tutoriales", label: "Centro de Ayuda" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="relative py-1 text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer group"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-purple-500 shadow-[0_0_8px_#a855f7] transition-all duration-300 group-hover:w-full group-active:w-full" />
              </button>
            ))}
          </Group>
        </Container>
      </header>

      {/* 2. Cuerpo Principal de la Landing Page */}
      <Container size="xl" py={40} className="w-full">
        <Stack gap={50}>
          {/* Hero / Inicio */}
          <div id="inicio" className="scroll-mt-24">
            <div className="bg-transparent py-4 relative overflow-hidden">
              <div className="absolute -left-10 -bottom-10 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
              <Stack gap="md" className="max-w-3xl">
                <Stack gap={4}>
                  <Title order={1} className="text-white tracking-tight leading-tight" fz={{ base: "3xl", sm: "4xl" }} fw={900}>
                    Corporación de Servicios Cupper & Hannia E.I.R.L.
                  </Title>
                  <Text size="lg" className="mt-1 text-purple-400 font-semibold">
                    Innovación y Soluciones Tecnológicas Logísticas
                  </Text>
                </Stack>

                <Text size="sm" c="zinc.4" className="leading-relaxed">
                  Sistema centralizado de alto rendimiento desarrollado para la gestión eficiente de inventarios, cotizaciones, personal y control operativo de yacimientos mineros.
                </Text>
                <Group gap="sm" mt="sm">
                  <Button
                    variant="gradient"
                    gradient={{ from: "violet.6", to: "indigo.6" }}
                    radius="lg"
                    size="sm"
                    rightSection={<IconArrowRight size={16} />}
                    onClick={() => scrollToSection("modulos")}
                  >
                    Explorar Módulos
                  </Button>
                  <Button
                    variant="default"
                    radius="lg"
                    size="sm"
                    className="border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800"
                    onClick={() => scrollToSection("nosotros")}
                  >
                    Conocer Más
                  </Button>
                </Group>
              </Stack>
            </div>
          </div>

          {/* Sobre el Sistema */}
          <div id="nosotros" className="scroll-mt-24">
            <div className="py-2">
              <Stack gap="sm">
                <Group gap="xs">
                  <ThemeIcon size="md" radius="md" color="violet" variant="light">
                    <IconInfoCircle size={20} />
                  </ThemeIcon>
                  <Text fw={700} size="sm" color="violet">
                    Sobre el Sistema
                  </Text>
                </Group>
                <Title order={2} className="text-white" fz="2xl" fw={800}>
                  Plataforma Centralizada de Gestión Operativa
                </Title>
                <Text size="sm" c="zinc.4" className="leading-relaxed max-w-4xl">
                  El ERP de Corporación de Servicios Cupper & Hannia E.I.R.L. integra el control operativo en tiempo real entre sedes, garantizando trazabilidad en despachos de almacén, órdenes de compra, control de mineral y asistencia del personal.
                </Text>
              </Stack>
            </div>
          </div>

          {/* Módulos del Sistema */}
          <div id="modulos" className="scroll-mt-24">
            <Stack gap="md">
              <Stack gap={2}>
                <Group gap="xs" align="center">
                  <ThemeIcon size="md" radius="md" color="violet" variant="light">
                    <IconLayoutGrid size={20} />
                  </ThemeIcon>
                  <Title order={2} className="text-white" fz="xl" fw={800}>
                    Módulos del Sistema
                  </Title>
                </Group>
                <Text size="xs" c="zinc.4">
                  Componentes especializados diseñados para cada área operativa de la corporación
                </Text>
              </Stack>

              <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
                {modulos.map((m, idx) => {
                  const IconComp = m.icon;
                  return (
                    <Card
                      key={idx}
                      withBorder
                      radius="xl"
                      p="md"
                      className="bg-zinc-900/40 border-zinc-800 hover:border-violet-500/40 transition-all hover:translate-y-[-2px]"
                    >
                      <Stack gap="xs">
                        <Group justify="space-between">
                          <ThemeIcon size="lg" radius="md" color={m.color} variant="light">
                            <IconComp size={22} />
                          </ThemeIcon>
                        </Group>
                        <Text fw={700} size="sm" className="text-white">
                          {m.titulo}
                        </Text>
                        <Text size="xs" c="zinc.4" className="leading-relaxed">
                          {m.desc}
                        </Text>
                      </Stack>
                    </Card>
                  );
                })}
              </SimpleGrid>
            </Stack>
          </div>

          {/* Centro de Ayuda & Tutoriales */}
          <div id="tutoriales" className="scroll-mt-24">
            <Card withBorder radius="2xl" p="lg" className="bg-zinc-900/50 border-zinc-800 shadow-xl">
              <Stack gap="md">
                <Group justify="space-between" align="center">
                  <Group gap="xs">
                    <ThemeIcon size="md" radius="md" color="violet" variant="light">
                      <IconHelpCircle size={20} />
                    </ThemeIcon>
                    <Stack gap={2}>
                      <Text fw={700} size="sm" className="text-white">
                        Centro de Ayuda y Tutoriales
                      </Text>
                      <Text size="xs" c="zinc.4">
                        Videos explicativos organizados por módulos operativos
                      </Text>
                    </Stack>
                  </Group>
                </Group>

                <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
                  {[
                    { modulo: "Almacén", titulo: "Cómo registrar y atender requerimientos" },
                    { modulo: "Compras", titulo: "Generación de cotizaciones y órdenes" },
                    { modulo: "Personal", titulo: "Marcación y control de asistencias" },
                  ].map((vid, i) => (
                    <Paper
                      key={i}
                      withBorder
                      radius="lg"
                      p="sm"
                      className="bg-zinc-950/40 border-zinc-800/80 hover:border-violet-500/40 transition-colors cursor-pointer group"
                    >
                      <Group gap="xs" wrap="nowrap">
                        <ThemeIcon size="md" radius="xl" color="violet" variant="subtle" className="group-hover:scale-110 transition-transform">
                          <IconPlayerPlay size={16} />
                        </ThemeIcon>
                        <Stack gap={1}>
                          <Text size="xs" color="violet" fw={700}>
                            {vid.modulo}
                          </Text>
                          <Text size="xs" fw={600} className="text-zinc-300 line-clamp-1">
                            {vid.titulo}
                          </Text>
                        </Stack>
                      </Group>
                    </Paper>
                  ))}
                </SimpleGrid>
              </Stack>
            </Card>
          </div>
        </Stack>
      </Container>

      {/* 3. Mascot Blackcito Animado (Saludo Limpio) */}
      <AnimatePresence>
        {blackcitoVisible && (
          <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
            {/* Burbuja de Diálogo de Blackcito */}
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative mb-3 mr-4 p-4 max-w-[280px] bg-zinc-900/95 backdrop-blur-md border border-violet-500/40 rounded-2xl shadow-2xl pointer-events-auto"
            >
              <Group justify="space-between" align="center" mb="xs">
                <Text size="xs" fw={800} className="text-white">
                  Hola, soy Blackcito
                </Text>
                <ActionIcon size="xs" variant="subtle" color="gray" onClick={() => setBlackcitoVisible(false)}>
                  <IconX size={14} />
                </ActionIcon>
              </Group>

              <Text size="xs" c="zinc.2" className="leading-relaxed">
                Bienvenido al sistema de Cupper & Hannia
              </Text>

              {/* Triangulito de la burbuja */}
              <div className="absolute -bottom-2 right-6 w-4 h-4 bg-zinc-900/95 border-r border-b border-indigo-500/40 rotate-45 transform" />
            </motion.div>

            {/* Video Animado de Blackcito (El que saluda en Login) */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="relative w-28 h-28 pointer-events-auto cursor-pointer"
              onClick={() => setBlackcitoVisible(false)}
            >
              <video
                src={BlackcitoAssets.feliz}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-contain filter drop-shadow-[0_4px_16px_rgba(79,70,229,0.4)]"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. Footer Institucional (Camuflado: Doble Clic discreto abre Modal de Auditoría) */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950 px-6 py-6 mt-12">
        <Container size="xl" className="flex justify-center">
          <Text
            size="xs"
            c="zinc.5"
            className="cursor-default select-none text-center"
            onDoubleClick={() => setModalAbierto(true)}
          >
            © {new Date().getFullYear()} Corporación de Servicios Cupper & Hannia E.I.R.L. Todos los derechos reservados.
          </Text>
        </Container>
      </footer>

      {/* 5. Modal Oculto: Panel de Auditoría (Directo sin título) */}
      <Modal
        opened={modalAbierto}
        onClose={() => setModalAbierto(false)}
        withCloseButton={false}
        centered
        radius="xl"
        size="md"
        styles={{
          header: { backgroundColor: "rgb(24 24 27)", color: "#fff" },
          content: { backgroundColor: "rgb(24 24 27)", border: "1px solid rgb(39 39 42)" },
        }}
      >
        <Stack align="center" gap="lg" py="md">
          <ThemeIcon
            size={90}
            radius={100}
            variant="gradient"
            gradient={
              en_modo_auditable
                ? { from: "red.6", to: "orange.6" }
                : { from: "indigo.6", to: "cyan.6" }
            }
            className="shadow-lg"
          >
            {en_modo_auditable ? (
              <IconShieldLock size={45} stroke={1.5} />
            ) : (
              <IconShieldOff size={45} stroke={1.5} />
            )}
          </ThemeIcon>

          <Stack align="center" gap={4}>
            <Group gap="xs">
              <Text c="zinc.4" fz="sm" fw={500}>
                Estado actual:
              </Text>
              <Badge
                variant="filled"
                color={en_modo_auditable ? "red" : "indigo"}
                size="sm"
                radius="sm"
                className="animate-pulse"
              >
                {en_modo_auditable ? "ACTIVO" : "INACTIVO"}
              </Badge>
            </Group>
          </Stack>

          <Text c="zinc.4" ta="center" fz="sm" className="max-w-md">
            {en_modo_auditable
              ? "El sistema está filtrando actualmente todos los registros sensibles marcados como auditables."
              : "El sistema está mostrando todos los registros, incluyendo aquellos marcados para auditoría."}
          </Text>

          <Button
            size="md"
            radius="lg"
            variant="gradient"
            gradient={
              en_modo_auditable
                ? { from: "teal.7", to: "teal.9" }
                : { from: "red.7", to: "red.9" }
            }
            onClick={handleToggle}
            loading={loading}
            leftSection={
              en_modo_auditable ? (
                <IconLockOpen size={20} />
              ) : (
                <IconLockCode size={20} />
              )
            }
            className="hover:scale-[1.02] transition-transform active:scale-[0.98] h-12 text-sm px-8"
          >
            {en_modo_auditable
              ? "Desactivar Modo Auditoría"
              : "Activar Modo Auditoría"}
          </Button>

          <Text c="zinc.6" fz="xs" ta="center">
            Esta acción se sincronizará en tiempo real con todos los usuarios conectados.
          </Text>
        </Stack>
      </Modal>
    </Box>
  );
}



