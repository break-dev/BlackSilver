import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../stores/auth.store";
import { LoginService } from "../service/login.service";
import { Schema_Login } from "../service/login.requests";
import { Wallpapers } from "../../../presentation/assets/imports";
import { useTitlePage } from "../../../hooks/useTitlePage";

export const useLogin = () => {
  useTitlePage("Inicio de Sesión");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (Wallpapers.length === 0) return;
    const intervalId = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % Wallpapers.length);
    }, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const handleSubmit = async () => {
    const validation = Schema_Login.safeParse({ username, password });
    if (!validation.success) {
      setError(validation.error.issues[0].message);
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const result = await LoginService.login(validation.data);

      if (result.success) {
        useAuthStore.getState().updateAuth(result.data);
        navigate("/home");
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error("Error en login:", error);
      setError("Error inesperado en el inicio de sesión");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    username,
    setUsername,
    password,
    setPassword,
    currentImageIndex,
    handleSubmit,
  };
};
