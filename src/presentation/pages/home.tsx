import {
  Card,
  Title,
  Text,
  SimpleGrid,
  Box,
  Stack,
  Group,
} from "@mantine/core";
import { IconBuilding, IconUsers, IconSettings } from "@tabler/icons-react";
import { AuthStore } from "../../stores/auth.store";

// Pagina de inicio despues del login
export const Home = () => {
  const usuario = AuthStore((state) => state.usuario);

  const quickLinks = [
    {
      title: "Empresas",
      description: "Gestionar empresas, áreas y concesiones",
      icon: IconBuilding,
      color: "#d4a50a",
    },
    {
      title: "Personal",
      description: "Administrar cargos y trabajadores",
      icon: IconUsers,
      color: "#ffd666",
    },
    {
      title: "Configuración",
      description: "Roles y cuentas de usuario",
      icon: IconSettings,
      color: "#b8920a",
    },
  ];

  return (
    <Stack gap="xl">
      {/* Bienvenida */}
      <Box>
        <Title order={2} c="white">
          Bienvenido, {usuario?.nombre || "Usuario"}
        </Title>
        <Text c="dimmed" mt="xs">
          Sistema de Gestión Minera - Black Silver
        </Text>
      </Box>

      {/* Accesos rapidos */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
        {quickLinks.map((link) => (
          <Card
            key={link.title}
            shadow="md"
            padding="lg"
            radius="md"
            style={{
              background: "rgba(30, 30, 30, 0.8)",
              border: "1px solid rgba(212, 165, 10, 0.2)",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(212, 165, 10, 0.5)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(212, 165, 10, 0.2)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <Group>
              <Box
                style={{
                  padding: "10px",
                  borderRadius: "8px",
                  background: `rgba(212, 165, 10, 0.1)`,
                }}
              >
                <link.icon size={24} color={link.color} />
              </Box>
              <Box>
                <Text fw={600} c="white">
                  {link.title}
                </Text>
                <Text size="sm" c="dimmed">
                  {link.description}
                </Text>
              </Box>
            </Group>
          </Card>
        ))}
      </SimpleGrid>
    </Stack>
  );
};
