import { Title, Text, Stack, Box } from "@mantine/core";

interface PlaceholderPageProps {
  titulo: string;
  descripcion?: string;
}

// Componente placeholder para secciones en desarrollo
export const PlaceholderPage = ({
  titulo,
  descripcion = "Esta sección está en desarrollo",
}: PlaceholderPageProps) => {
  return (
    <Stack gap="md">
      <Box>
        <Title order={3} c="white">
          {titulo}
        </Title>
        <Text c="dimmed" mt="xs">
          {descripcion}
        </Text>
      </Box>

      <Box
        style={{
          padding: "40px",
          borderRadius: "8px",
          background: "rgba(30, 30, 30, 0.5)",
          border: "1px dashed rgba(212, 165, 10, 0.3)",
          textAlign: "center",
        }}
      >
        <Text c="dimmed">Contenido próximamente...</Text>
      </Box>
    </Stack>
  );
};
