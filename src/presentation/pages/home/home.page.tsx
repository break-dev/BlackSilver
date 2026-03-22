import { useNavigate } from "react-router-dom";
import { ArrowUpRightIcon } from "@heroicons/react/24/outline";
import { useAuthUser } from "../../../hooks/useAuthUser";
import { useTitlePage } from "../../../hooks/useTitlePage";
import { useRandomLinks, type ILinkView } from "./useRandomLinks";

export const HomePage = () => {
  useTitlePage("");
  const navigate = useNavigate();
  const { usuario } = useAuthUser();

  const { randomLinks } = useRandomLinks();

  return (
    <div className="max-w-6xl mx-auto space-y-10 py-6 px-4">
      {/* Seccion de bienvenida */}
      <div className="text-center space-y-4 pt-10">
        <h1 className="text-2xl md:text-3xl font-extrabold bg-linear-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent tracking-tight">
          Hola, {usuario?.nombre || "Usuario"}
        </h1>
        <p className="text-zinc-400 text-sm md:text-base max-w-lg mx-auto">
          ¿Qué deseas hacer hoy? Aquí tienes algunas vistas de acceso rápido que
          podrían interesarte.
        </p>
      </div>

      {/* acciones rapidas */}
      {randomLinks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 mt-12 pb-10">
          {randomLinks.map((l: ILinkView, idx: number) => {
            const Icon = l.icon;
            return (
              <button
                key={`${l.title}-${idx}`}
                onClick={() => navigate(l.url)}
                className={`group relative flex flex-col justify-between p-7 rounded-3xl 
                bg-zinc-900/40 border border-zinc-800/60 backdrop-blur-md text-left 
                transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl 
                hover:shadow-black/40 overflow-hidden ${l.border}`}
              >
                {/* gradiente fondo */}
                <div
                  className={`absolute inset-0 bg-linear-to-br ${l.gradient} 
                  opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out`}
                ></div>

                {/* contenido superior */}
                <div className="relative z-10 flex items-start justify-between w-full mb-8">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-linear-to-br ${l.iconBg} flex 
                    items-center justify-center shadow-[0_8px_16px_rgba(0,0,0,0.4)] 
                    group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}
                  >
                    <Icon className="w-5 h-5 text-white drop-shadow-md" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center backdrop-blur-xl group-hover:bg-white/10 transition-colors duration-300">
                    <ArrowUpRightIcon className="w-4 h-4 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
                  </div>
                </div>

                {/* textos */}
                <div className="relative z-10 mt-auto">
                  <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2 group-hover:text-zinc-400 transition-colors">
                    {l.desc}
                  </p>
                  <p className="font-bold text-white text-lg group-hover:text-white transition-colors leading-tight">
                    {l.title}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 text-zinc-500 border border-zinc-800/50 rounded-3xl bg-zinc-900/20 backdrop-blur-sm">
          <p>No tienes vistas configuradas disponibles.</p>
        </div>
      )}
    </div>
  );
};
