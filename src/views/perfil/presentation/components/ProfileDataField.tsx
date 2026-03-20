import { Stack, Text, Box } from "@mantine/core";

interface ProfileDataFieldProps {
  label: string;
  value: string | null | undefined;
}

export const ProfileDataField = ({ label, value }: ProfileDataFieldProps) => {
  return (
    <Stack gap={6} className="group">
      <Text
        size="13px"
        fw={700}
        className="text-zinc-500 transition-colors group-hover:text-indigo-400"
      >
        {label}
      </Text>
      <Box className="ml-6">
        <Text size="12.5px" fw={400} className="text-zinc-400 leading-relaxed font-secondary">
          {value || "No registrado"}
        </Text>
      </Box>
    </Stack>
  );
};
