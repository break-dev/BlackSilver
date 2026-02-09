import { Outlet } from "react-router-dom";
import { Box, Center } from "@mantine/core";

// Layout para paginas publicas (login)
export const PublicLayout = () => {
  return (
    <Box
      style={{
        width: "100%",
        height: "100%",
        background:
          "radial-gradient(ellipse at top, rgba(212, 165, 10, 0.15) 0%, transparent 50%), linear-gradient(180deg, #111 0%, #1a1a1a 100%)",
      }}
    >
      <Center h="100%">
        <Outlet />
      </Center>
    </Box>
  );
};
