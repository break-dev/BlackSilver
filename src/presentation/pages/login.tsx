import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TextInput, PasswordInput, Button } from "@mantine/core";
import { useUsuario } from "../../services/usuarios/useUsuario";
import { useMenuNavegacion } from "../../services/menu-navegacion/useMenuNavegacion";
import { Schema_Login } from "../../services/usuarios/dtos/requests";
import { Wallpapers, BlackcitoLogo } from "../assets/imports";

export const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { login } = useUsuario({ setError });
  const { getMenuNavegacion } = useMenuNavegacion({ setError });

  useEffect(() => {
    if (Wallpapers.length === 0) return;
    const intervalId = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % Wallpapers.length);
    }, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validation = Schema_Login.safeParse({ usuario, password });
    if (!validation.success) {
      setError(validation.error.issues[0].message);
      return;
    }

    try {
      // inicia sesion
      setIsLoading(true);
      const success = await login(validation.data);

      if (success) {
        // Cargar menu de navegacion
        await getMenuNavegacion();
        // Navegar a home
        navigate("/home");
      }
    } catch (error) {
      console.error("Error en login:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-black">
      {/* Background Images */}
      {Wallpapers.map((bg, index) => (
        <div
          key={index}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            index === currentImageIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={bg}
            alt={`Background ${index + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
      ))}

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50 z-0"></div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md mb-8 sm:mb-20">
        <div
          className="glass rounded-3xl p-8 shadow-2xl shadow-cyan-900/20 border border-cyan-500/20 
          backdrop-blur-2xl py-12 sm:py-16 bg-zinc-950/50"
        >
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div
              className="w-20 h-20 sm:w-28 sm:h-28 mx-auto
              flex items-center justify-center transform hover:scale-105 transition-transform duration-300"
            >
              <img
                src={BlackcitoLogo}
                alt="Black Silver Logo"
                className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(27,205,219,0.4)]"
              />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-wide">
              Black Silver
            </h1>
            <p className="text-xs sm:text-sm text-cyan-400 font-medium tracking-widest uppercase">
              Sistema de Gestión Minera
            </p>
          </div>

          {/* Error Message */}
          {error && typeof error === "string" && error.length > 0 && (
            <div
              className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 backdrop-blur-sm 
              animate-slideDown"
            >
              <p className="text-xs text-red-400 text-center">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={(e) => handleSubmit(e)} className="space-y-5">
            <div>
              <TextInput
                label={<span className="text-zinc-300">Usuario</span>}
                placeholder="Ingresa tu usuario"
                radius="lg"
                size="md"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                styles={{
                  input: {
                    backgroundColor: "rgba(24, 24, 27, 0.5)",
                    borderColor: "rgba(6, 182, 212, 0.2)",
                    color: "white",
                    transition: "border-color 0.2s ease",
                    "&:focus": {
                      borderColor: "rgba(6, 182, 212, 0.8)",
                    },
                  },
                }}
              />
            </div>

            <div>
              <PasswordInput
                label={<span className="text-zinc-300">Contraseña</span>}
                placeholder="Ingresa tu contraseña"
                radius="lg"
                size="md"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                styles={{
                  input: {
                    backgroundColor: "rgba(24, 24, 27, 0.5)",
                    borderColor: "rgba(6, 182, 212, 0.2)",
                    color: "white",
                    transition: "border-color 0.2s ease",
                    "&:focusWithin": {
                      borderColor: "rgba(6, 182, 212, 0.8)",
                    },
                  },
                }}
              />
            </div>

            <Button
              type="submit"
              fullWidth
              radius="lg"
              size="md"
              loading={isLoading}
              className="mt-8! bg-linear-to-r! from-cyan-600! to-blue-600! text-white! 
              font-bold! hover:from-cyan-500! hover:to-blue-500! shadow-[0_0_20px_rgba(6,182,212,0.3)]! transition-all duration-300! border-0!"
            >
              Iniciar Sesión
            </Button>
          </form>

          {/* Footer */}
          <p className="text-center text-xs text-zinc-500 mt-8">
            &copy; 2026 Black Silver. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};
