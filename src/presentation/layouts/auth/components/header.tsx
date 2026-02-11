import { Bars3Icon } from "@heroicons/react/24/outline";
import { UserMenu } from "./user-menu";

interface HeaderProps {
  onMenuToggle: () => void;
}

export const Header = ({ onMenuToggle }: HeaderProps) => {
  return (
    <header
      className="fixed top-4 left-4 right-4 flex items-center 
      justify-between px-5 h-14 bg-zinc-900/80 backdrop-blur-xl 
      rounded-2xl border border-zinc-800/50 shadow-lg z-10"
    >
      {/* Icono de menu de navegacion */}
      <button
        onClick={onMenuToggle}
        className="p-2 text-zinc-400 hover:text-white transition-colors 
        hover:bg-white/5 rounded-lg"
        aria-label="Abrir menú"
      >
        <Bars3Icon className="w-5 h-5" />
      </button>

      {/* Logo/Brand */}
      <div className="flex items-center gap-2">
        <div
          className="w-7 h-7 rounded-lg bg-linear-to-br from-zinc-100 
          to-zinc-300 flex items-center justify-center shadow-sm"
        >
          <span className="text-[10px] font-bold text-zinc-900">BS</span>
        </div>
        <span
          className="text-base font-semibold text-white tracking-wide 
          hidden sm:block"
        >
          Black Silver
        </span>
      </div>

      {/* Menu de usuario */}
      <UserMenu />
    </header>
  );
};
