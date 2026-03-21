import { useEffect } from "react";
import { notifications } from "@mantine/notifications";
import {
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/solid";
import { useUIStore } from "../../../../stores/ui.store";

export const GlobalNotification = () => {
  const message = useUIStore((state) => state.message);
  const clearMessage = useUIStore((state) => state.clearMessage);

  useEffect(() => {
    if (!message.type || !message.content) return;

    const titleMap: Record<string, string> = {
      success: "Operación Exitosa",
      error: "Ha ocurrido un error",
      info: "Información",
    };

    const iconMap: Record<string, React.ReactNode> = {
      success: (
        <CheckCircleIcon
          style={{
            width: 28,
            height: 28,
            color: "#34d399",
            filter: "drop-shadow(0 0 8px rgba(52,211,153,0.4))",
          }}
        />
      ),
      error: (
        <XCircleIcon
          style={{
            width: 28,
            height: 28,
            color: "#fb7185",
            filter: "drop-shadow(0 0 8px rgba(251,113,133,0.4))",
          }}
        />
      ),
      info: (
        <InformationCircleIcon
          style={{
            width: 28,
            height: 28,
            color: "#60a5fa",
            filter: "drop-shadow(0 0 8px rgba(96,165,250,0.4))",
          }}
        />
      ),
    };

    notifications.show({
      title: titleMap[message.type] || "Aviso",
      message: message.content,
      icon: iconMap[message.type],
      autoClose: 5000,
      withBorder: true,
      withCloseButton: true,
      styles: () => ({
        root: {
          backgroundColor: "rgba(9, 9, 11, 0.75)", // zinc-950 w/ opacity
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderColor: "rgba(255, 255, 255, 0.08)",
          borderWidth: "1px",
          boxShadow:
            "0 30px 60px -12px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0,0,0,0.3) inset",
          borderRadius: "20px",
          padding: "12px 16px",
          "&::before": { display: "none" }, // Remove default left color bar if present
        },
        title: {
          color: "#f4f4f5", // zinc-100
          fontWeight: 800,
          fontSize: "14px",
          letterSpacing: "-0.01em",
          marginBottom: "4px",
        },
        description: {
          color: "#a1a1aa", // zinc-400
          fontSize: "12px",
          lineHeight: "1.5",
          fontWeight: 500,
        },
        closeButton: {
          color: "#71717a", // zinc-500
          transition: "all 0.3s",
          borderRadius: "10px",
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            color: "#fff",
          },
        },
        icon: {
          backgroundColor: "transparent",
          border: "none",
          boxShadow: "none",
          marginRight: "16px",
        },
      }),
    });

    clearMessage();
  }, [message, clearMessage]);

  return null;
};
