import { useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/auth.store";
import { useMenuNavegacionStore } from "../stores/menu.store";
import { useMemo } from "react";

export const useAuthUser = () => {
  const usuario = useAuthStore((state) => state.usuario);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const menu = useMenuNavegacionStore((state) => state.menu);
  const location = useLocation();

  const isAuthorized = useMemo(() => {
    // Rutas que siempre están permitidas
    const universallyAllowed = ["/", "/home", "/perfil"];
    if (universallyAllowed.includes(location.pathname)) return true;

    // Si el menú aún no carga pero está autenticado, permitimos el paso inicial.
    if (!menu || menu.length === 0) return true;

    // Aplanamos el menú para obtener todas las URLs autorizadas
    const authorizedUrls: string[] = [];
    menu.forEach((modulo) => {
      modulo.submodulos?.forEach((submodulo) => {
        submodulo.secciones?.forEach((seccion) => {
          if (seccion.url) authorizedUrls.push(seccion.url);
        });
      });
    });

    // Verificamos si la ruta actual está autorizada
    return authorizedUrls.some((url) => location.pathname.startsWith(url));
  }, [location.pathname, menu]);

  return {
    usuario,
    isAuthenticated,
    isAuthorized
  };
};
