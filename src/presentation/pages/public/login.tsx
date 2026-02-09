import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextInput, PasswordInput, Button } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useUsuario } from "../../../services/usuarios/useUsuario";
import { useMenu } from "../../../services/menu/useMenu";
import { AuthStore } from "../../../stores/auth.store";
import { MenuStore } from "../../../stores/menu.store";

export const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const { login } = useUsuario({ setIsLoading, setError });
  const { setMenuNavegacion } = useMenu({ setIsLoading, setError });

  const form = useForm({
    initialValues: { usuario: "", password: "" },
    validate: {
      usuario: (v) => (v ? null : "Requerido"),
      password: (v) => (v ? null : "Requerido"),
    },
  });

  const handleSubmit = async (values: {
    usuario: string;
    password: string;
  }) => {
    try {
      // 1. First, login
      await login(values);

      // 2. Check if login was successful
      if (AuthStore.getState().isAuthenticated) {
        // 3. Load menu navigation and wait
        await setMenuNavegacion();

        // 4. Navigate to home
        navigate("/home");
      }
    } catch (error) {
      console.error("❌ Error en login:", error);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-zinc-800/30 rounded-full blur-3xl animate-float"></div>
        <div
          className="absolute bottom-1/4 -right-20 w-96 h-96 bg-zinc-700/20 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-3/4 left-1/3 w-64 h-64 bg-zinc-600/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        <div className="glass rounded-3xl p-8 shadow-2xl border border-zinc-800/50 backdrop-blur-2xl">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-zinc-100 to-zinc-300 flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
              <span className="text-2xl font-bold text-zinc-900">BS</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Black Silver</h1>
            <p className="text-sm text-zinc-400">Sistema de Gestión Minera</p>
          </div>

          {/* Error Message */}
          {error && typeof error === "string" && error.length > 0 && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 backdrop-blur-sm animate-slideDown">
              <p className="text-sm text-red-400 text-center">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={form.onSubmit(handleSubmit)} className="space-y-5">
            <div>
              <TextInput
                label="Usuario"
                placeholder="Ingresa tu usuario"
                radius="lg"
                size="md"
                {...form.getInputProps("usuario")}
              />
            </div>

            <div>
              <PasswordInput
                label="Contraseña"
                placeholder="Ingresa tu contraseña"
                radius="lg"
                size="md"
                {...form.getInputProps("password")}
              />
            </div>

            <Button
              type="submit"
              fullWidth
              radius="lg"
              size="md"
              loading={isLoading}
              className="!mt-7 !bg-gradient-to-r !from-zinc-100 !to-zinc-300 !text-zinc-900 !font-semibold hover:!from-white hover:!to-zinc-200 !shadow-lg"
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
