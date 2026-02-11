import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextInput, PasswordInput, Button } from "@mantine/core";
import { useUsuario } from "../../services/usuarios/useUsuario";
import { useMenu } from "../../services/menu/useMenu";
import { Schema_Login } from "../../services/usuarios/dtos/requests";

export const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");

  const { login } = useUsuario({ setError });
  const { getMenuNavegacion } = useMenu({ setError });

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
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 
      relative overflow-hidden "
    >
      {/* Login Card */}
      <div className="relative w-full max-w-md mb-20">
        <div
          className="glass rounded-3xl p-8 shadow-2xl border border-zinc-800/50 
          backdrop-blur-2xl py-16"
        >
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div
              className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-linear-to-br from-zinc-100 to-zinc-300 
              flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform"
            >
              <span className="text-xl font-bold text-zinc-900">BS</span>
            </div>
            <h1 className="text-xl font-bold text-white mb-1">Black Silver</h1>
            <p className="text-sm text-zinc-400">Sistema de Gestión Minera</p>
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
                label="Usuario"
                placeholder="Ingresa tu usuario"
                radius="lg"
                size="sm"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
              />
            </div>

            <div>
              <PasswordInput
                label="Contraseña"
                placeholder="Ingresa tu contraseña"
                radius="lg"
                size="sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              fullWidth
              radius="lg"
              size="sm"
              loading={isLoading}
              className="mt-7! bg-linear-to-r! from-zinc-100! to-zinc-300! text-zinc-900! 
              font-semibold! hover:from-white! hover:to-zinc-200! shadow-lg!"
            >
              Iniciar Sesión
            </Button>
          </form>

          {/* Footer */}
          <p className="text-center text-xs text-zinc-500 mt-6">
            &copy; 2026 Black Silver. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};
