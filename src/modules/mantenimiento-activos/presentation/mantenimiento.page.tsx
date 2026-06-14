import { useTitlePage } from "../../../hooks/useTitlePage";

export const MantenimientoPage = () => {
  useTitlePage("Mantenimiento de Activos");

  return (
    <div className="space-y-6 animate-fade-in text-zinc-100">
      <h1>Mantenimiento</h1>
    </div>
  );
};
