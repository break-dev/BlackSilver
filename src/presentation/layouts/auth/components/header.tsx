import { Bars3Icon } from "@heroicons/react/24/outline";
import { UserMenu } from "./user-menu";
import { useTitlePage } from "../../../../hooks/useTitlePage";

interface HeaderProps {
  onMenuToggle: () => void;
}

export const Header = ({ onMenuToggle }: HeaderProps) => {
  const { title } = useTitlePage();

  return (
    <header
      className="fixed top-4 left-4 right-4 flex items-center 
      justify-between px-5 h-11 bg-zinc-900/80 backdrop-blur-xl 
      rounded-xl border border-zinc-800/50 shadow-lg z-10"
    >
      {/* Icono de menu de navegacion */}
      <button
        onClick={onMenuToggle}
        className="p-1.5 text-zinc-400 hover:text-white transition-colors 
        hover:bg-white/5 rounded-lg"
        aria-label="Abrir menú"
      >
        <Bars3Icon className="w-5 h-5" />
      </button>

      {/* Logo/Brand */}
      <div className="flex items-center gap-2">
        <div
          className="w-6 h-6 rounded-md bg-linear-to-br from-zinc-100 
          to-zinc-300 flex items-center justify-center shadow-sm"
        >
          {/* Reducido de 10px a 8px */}
          <span className="text-[8px] font-bold text-zinc-900">BS</span>
        </div>
        <span
          /* Reducido de text-base (16px) a text-sm (14px) */
          className="text-sm font-semibold text-white tracking-wide 
          hidden sm:block"
        >
          {title ? title : "Black Silver"}
        </span>
      </div>

      {/* Menu de usuario */}
      <UserMenu />
    </header>
  );
};
