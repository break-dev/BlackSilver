import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../../stores/auth.store";
import { useMenuNavegacionStore } from "../../../../stores/menu.store";
import { usePerfilStore } from "../../../../views/perfil/hooks/usePerfilStore";

export const useUserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const usuario = useAuthStore((s) => s.usuario);

  const logout = () => {
    useAuthStore.getState().clearAuth();
    useMenuNavegacionStore.getState().clearMenu();
    usePerfilStore.getState().reset();
    navigate("/login", { viewTransition: true });
  };

  const handleToggle = () => {
    if (isOpen) {
      handleClose();
    } else {
      setIsOpen(true);
      setIsClosing(false);
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 280); // Match Tailwind duration
  };

  // Cerrar menu cuando se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        if (isOpen) {
          handleClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return {
    isOpen,
    isClosing,
    menuRef,
    usuario,
    logout,
    handleToggle,
    handleClose,
  };
};
