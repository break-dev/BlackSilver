import { useState, useCallback } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import {
  AppShell,
  Burger,
  Group,
  Title,
  Menu,
  Avatar,
  Drawer,
  NavLink,
  Stack,
  Text,
  Divider,
  Box,
  ScrollArea,
} from "@mantine/core";
import {
  UserIcon,
  ArrowRightStartOnRectangleIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { AuthStore } from "../../stores/auth.store";
import { MenuStore } from "../../stores/menu.store";

// Layout para paginas autenticadas
export const AuthLayout = () => {
  const navigate = useNavigate();

  // Estados locales - todos declarados al inicio sin condiciones
  const [drawerOpened, setDrawerOpened] = useState(false);
  const [expandedModulo, setExpandedModulo] = useState<number | null>(null);
  const [expandedSubmodulo, setExpandedSubmodulo] = useState<number | null>(
    null,
  );

  // Handlers con useCallback para evitar recreacion
  const openDrawer = useCallback(() => setDrawerOpened(true), []);
  const closeDrawer = useCallback(() => setDrawerOpened(false), []);

  const handleLogout = useCallback(() => {
    AuthStore.getState().clearAuth();
    MenuStore.getState().clearMenu();
    navigate("/login");
  }, [navigate]);

  const handleNavigate = useCallback(
    (url: string) => {
      setDrawerOpened(false);
      navigate(url);
    },
    [navigate],
  );

  const toggleModulo = useCallback((id: number) => {
    setExpandedModulo((prev) => (prev === id ? null : id));
  }, []);

  const toggleSubmodulo = useCallback((id: number) => {
    setExpandedSubmodulo((prev) => (prev === id ? null : id));
  }, []);

  // Obtener datos de stores (sin hooks, usando getState)
  const usuario = AuthStore.getState().usuario;
  const menu = MenuStore.getState().menu;

  return (
    <AppShell
      header={{ height: 60 }}
      padding="md"
      styles={{
        header: {
          background: "rgba(17, 17, 17, 0.95)",
          borderBottom: "1px solid rgba(212, 165, 10, 0.3)",
          backdropFilter: "blur(10px)",
        },
        main: {
          background: "linear-gradient(180deg, #111 0%, #1a1a1a 100%)",
          minHeight: "calc(100vh - 60px)",
        },
      }}
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          {/* Hamburger menu - izquierda */}
          <Burger
            opened={drawerOpened}
            onClick={openDrawer}
            size="sm"
            color="#d4a50a"
            aria-label="Toggle navigation"
          />

          {/* Titulo - centro */}
          <Title
            order={3}
            style={{
              background: "linear-gradient(135deg, #ffd666 0%, #d4a50a 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: 700,
              letterSpacing: "0.05em",
            }}
          >
            BLACK SILVER
          </Title>

          {/* Menu usuario - derecha */}
          <Menu shadow="md" width={200} position="bottom-end">
            <Menu.Target>
              <Avatar
                radius="xl"
                size="md"
                style={{
                  cursor: "pointer",
                  border: "2px solid rgba(212, 165, 10, 0.5)",
                }}
                color="gold"
              >
                {usuario?.nombre?.charAt(0).toUpperCase() || "U"}
              </Avatar>
            </Menu.Target>

            <Menu.Dropdown
              style={{
                background: "rgba(30, 30, 30, 0.95)",
                border: "1px solid rgba(212, 165, 10, 0.3)",
              }}
            >
              <Menu.Label>
                <Text size="sm" c="dimmed">
                  {usuario?.nombre || "Usuario"}
                </Text>
              </Menu.Label>
              <Menu.Item
                leftSection={<UserIcon className="w-4 h-4" />}
                onClick={() => handleNavigate("/perfil")}
              >
                Ver perfil
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                color="red"
                leftSection={
                  <ArrowRightStartOnRectangleIcon className="w-4 h-4" />
                }
                onClick={handleLogout}
              >
                Cerrar sesión
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </AppShell.Header>

      {/* Drawer de navegacion */}
      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        title={
          <Text fw={600} c="#d4a50a">
            Navegación
          </Text>
        }
        size="xs"
        styles={{
          header: {
            background: "rgba(17, 17, 17, 0.98)",
            borderBottom: "1px solid rgba(212, 165, 10, 0.2)",
          },
          body: {
            background: "rgba(17, 17, 17, 0.98)",
            padding: 0,
          },
          content: {
            background: "rgba(17, 17, 17, 0.98)",
          },
        }}
      >
        <ScrollArea h="calc(100vh - 80px)" type="auto">
          <Stack gap={0}>
            {menu.map((modulo) => (
              <Box key={modulo.id_modulo}>
                <NavLink
                  label={modulo.nombre}
                  childrenOffset={0}
                  opened={expandedModulo === modulo.id_modulo}
                  onClick={() => toggleModulo(modulo.id_modulo)}
                  rightSection={<ChevronRightIcon className="w-4 h-4" />}
                  styles={{
                    root: {
                      borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                    },
                    label: {
                      fontWeight: 600,
                      color: "#d4a50a",
                    },
                  }}
                >
                  {modulo.submodulos.map((submodulo) => (
                    <Box key={submodulo.id_submodulo} pl="md">
                      <NavLink
                        label={submodulo.nombre}
                        childrenOffset={0}
                        opened={expandedSubmodulo === submodulo.id_submodulo}
                        onClick={() => toggleSubmodulo(submodulo.id_submodulo)}
                        styles={{
                          label: {
                            fontWeight: 500,
                            color: "#fbfbfb",
                          },
                        }}
                      >
                        {submodulo.secciones.map((seccion) => (
                          <NavLink
                            key={seccion.id_seccion}
                            label={seccion.nombre}
                            pl="lg"
                            onClick={() => handleNavigate(seccion.url)}
                            styles={{
                              label: {
                                color: "rgba(251, 251, 251, 0.8)",
                              },
                            }}
                          />
                        ))}
                      </NavLink>
                    </Box>
                  ))}
                </NavLink>
                <Divider color="rgba(255, 255, 255, 0.05)" />
              </Box>
            ))}
          </Stack>
        </ScrollArea>
      </Drawer>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
};
