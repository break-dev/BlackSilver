import { useNavigate } from "react-router-dom";
import {
  BuildingOffice2Icon,
  UsersIcon,
  Cog6ToothIcon,
  ArrowUpRightIcon,
} from "@heroicons/react/24/outline";
import { AuthStore } from "../../stores/auth.store";

export const Home = () => {
  const navigate = useNavigate();
  const usuario = AuthStore((s) => s.usuario);

  // Accesos rapidos
  const links = [
    {
      title: "Empresas",
      desc: "Gestionar empresas y concesiones",
      icon: BuildingOffice2Icon,
      url: "/configuracion/empresas/empresas",
      gradient: "from-blue-500/20 to-cyan-500/20",
      iconBg: "from-blue-500 to-cyan-500",
    },
    {
      title: "Personal",
      desc: "Administrar trabajadores",
      icon: UsersIcon,
      url: "/configuracion/personal/trabajadores",
      gradient: "from-purple-500/20 to-pink-500/20",
      iconBg: "from-purple-500 to-pink-500",
    },
    {
      title: "Configuración",
      desc: "Roles y cuentas",
      icon: Cog6ToothIcon,
      url: "/configuracion/usuarios/roles",
      gradient: "from-amber-500/20 to-orange-500/20",
      iconBg: "from-amber-500 to-orange-500",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-10 py-4">
      {/* Seccion de bienvenida */}
      <div className="text-center space-y-3">
        <h1
          className="text-2xl font-bold bg-linear-to-r from-white 
          via-zinc-200 to-zinc-400 bg-clip-text text-transparent"
        >
          Hola, {usuario?.nombre || "Usuario"}
        </h1>
        <p className="text-zinc-400 text-sm">¿Qué deseas hacer hoy?</p>
      </div>

      {/* acciones rapidas*/}
      <div className="grid gap-4 md:gap-5">
        {links.map((l) => (
          <button
            key={l.title}
            onClick={() => navigate(l.url)}
            className="group relative flex items-center gap-5 p-6 rounded-2xl 
            bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm text-left 
            hover:border-zinc-700 transition-all duration-300 hover:scale-[1.02] 
            hover:shadow-xl hover:shadow-black/20"
          >
            {/* gradiente */}
            <div
              className={`absolute inset-0 rounded-2xl bg-linear-to-br ${l.gradient} 
              opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
            ></div>

            {/* icono */}
            <div className="relative">
              <div
                className={`w-14 h-14 rounded-xl bg-linear-to-br ${l.iconBg} flex 
                items-center justify-center shadow-lg group-hover:scale-110 
                transition-transform duration-300`}
              >
                <l.icon className="w-7 h-7 text-white" />
              </div>
            </div>

            {/* contenido */}
            <div className="relative flex-1">
              <p
                className="font-semibold text-white text-base mb-1 group-hover:text-white 
                transition-colors"
              >
                {l.title}
              </p>
              <p className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors">
                {l.desc}
              </p>
            </div>

            {/* indicador de flecha */}
            <div className="relative">
              {/* flecha de heroicons */}
              <ArrowUpRightIcon
                className="w-5 h-5 text-zinc-600 group-hover:text-zinc-400 group-hover:translate-x-1 
                transition-all duration-300"
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
