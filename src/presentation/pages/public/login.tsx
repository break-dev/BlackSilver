import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Title,
  Text,
  Alert,
  Box,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconAlertCircle } from "@tabler/icons-react";
import { useUsuario } from "../../../services/usuarios/useUsuario";
import { useMenu } from "../../../services/menu/useMenu";
import type { ErrorResponse } from "../../../shared/response";
import { AuthStore } from "../../../stores/auth.store";

// Pagina de inicio de sesion
export const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ErrorResponse>({});

  const { login } = useUsuario({ setIsLoading, setError });
  const { setMenuNavegacion } = useMenu({ setIsLoading, setError });

  const form = useForm({
    initialValues: {
      usuario: "",
      password: "",
    },
    validate: {
      usuario: (value) => (value.length < 1 ? "Usuario requerido" : null),
      password: (value) => (value.length < 1 ? "Contraseña requerida" : null),
    },
  });

  const handleSubmit = async (values: {
    usuario: string;
    password: string;
  }) => {
    await login(values);

    // Verificar si el login fue exitoso
    const isAuthenticated = AuthStore.getState().isAuthenticated;
    if (isAuthenticated) {
      await setMenuNavegacion();
      navigate("/home");
    }
  };

  const errorMessage =
    typeof error === "string"
      ? error
      : typeof error === "object" && error !== null && "message" in error
        ? String((error as { message: string }).message)
        : null;

  return (
    <Card
      shadow="xl"
      padding="xl"
      radius="lg"
      w={400}
      style={{
        background: "rgba(30, 30, 30, 0.9)",
        border: "1px solid rgba(212, 165, 10, 0.3)",
        backdropFilter: "blur(10px)",
      }}
    >
      <Stack gap="lg">
        {/* Logo y titulo */}
        <Box ta="center">
          <Title
            order={2}
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
          <Text c="dimmed" size="sm" mt="xs">
            Sistema de Gestión Minera
          </Text>
        </Box>

        {/* Mensaje de error */}
        {errorMessage && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Error"
            color="red"
            variant="light"
          >
            {errorMessage}
          </Alert>
        )}

        {/* Formulario */}
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Usuario"
              placeholder="Ingresa tu usuario"
              {...form.getInputProps("usuario")}
              styles={{
                input: {
                  background: "rgba(17, 17, 17, 0.8)",
                  border: "1px solid rgba(212, 165, 10, 0.2)",
                  "&:focus": {
                    borderColor: "#d4a50a",
                  },
                },
              }}
            />

            <PasswordInput
              label="Contraseña"
              placeholder="Ingresa tu contraseña"
              {...form.getInputProps("password")}
              styles={{
                input: {
                  background: "rgba(17, 17, 17, 0.8)",
                  border: "1px solid rgba(212, 165, 10, 0.2)",
                  "&:focus": {
                    borderColor: "#d4a50a",
                  },
                },
              }}
            />

            <Button
              type="submit"
              fullWidth
              loading={isLoading}
              mt="md"
              style={{
                background: "linear-gradient(135deg, #d4a50a 0%, #b8920a 100%)",
                border: "none",
              }}
            >
              Iniciar Sesión
            </Button>
          </Stack>
        </form>
      </Stack>
    </Card>
  );
};
