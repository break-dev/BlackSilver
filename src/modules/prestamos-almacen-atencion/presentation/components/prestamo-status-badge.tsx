import { Badge } from "@mantine/core";

interface Props {
  estado: string;
}

export const PrestamoStatusBadge = ({ estado }: Props) => {
  const getStatusStyles = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("generado"))
      return { color: "green", variant: "light" as const };
    if (s.includes("pendiente"))
      return { color: "blue", variant: "light" as const };
    if (s.includes("aprobado"))
      return { color: "violet", variant: "light" as const };
    if (s.includes("despacho") || s.includes("entregando"))
      return { color: "orange", variant: "light" as const };
    if (s.includes("entrega") || s.includes("completad"))
      return { color: "emerald", variant: "light" as const };
    if (s.includes("rechazado"))
      return { color: "red", variant: "filled" as const };
    if (s.includes("cerrado"))
      return { color: "zinc", variant: "filled" as const };
    return { color: "gray", variant: "light" as const };
  };

  const style = getStatusStyles(estado);

  return (
    <Badge
      variant={style.variant}
      color={style.color}
      radius="md"
      size="sm"
      className={`font-black tracking-wider uppercase px-3 py-3 border ${style.variant === "light" ? "border-current/20" : "border-transparent"}`}
    >
      {estado}
    </Badge>
  );
};
