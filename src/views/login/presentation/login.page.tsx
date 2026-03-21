import { useState, useRef } from "react";
import { TextInput, PasswordInput, Button } from "@mantine/core";
import {
  LoginVideo,
  BlackcitoSinPatitas,
} from "../../../presentation/assets/imports";
import { useLogin } from "../hooks/useLogin";

export const LoginPage = () => {
  const {
    isLoading,
    error,
    username,
    setUsername,
    password,
    setPassword,
    handleSubmit,
  } = useLogin();

  const [isVideoEnding, setIsVideoEnding] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    // Iniciar transición suave 1 segundo antes de que termine
    const duration = videoRef.current.duration;
    const currentTime = videoRef.current.currentTime;
    if (duration - currentTime < 1 && !isVideoEnding) {
      setIsVideoEnding(true);
    }
  };

  const handleEnded = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsVideoEnding(false);
    }
  };

  return (
    <div
      className="relative min-h-screen w-full flex items-center 
      justify-center p-4 overflow-hidden bg-black"
    >
      {/* Background Video */}
      <div
        className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
          isVideoEnding ? "opacity-0" : "opacity-100"
        }`}
      >
        <video
          ref={videoRef}
          src={LoginVideo}
          autoPlay
          muted
          playsInline
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          className="w-full h-full object-cover"
        />
      </div>
      {/* Black background to show during transition opacity 0 */}
      <div className="absolute inset-0 bg-black -z-10"></div>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50 z-0"></div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md mb-8 sm:mb-20">
        <div
          className=" rounded-3xl p-8 shadow-2xl shadow-cyan-900/20 
          border border-cyan-500/20 py-12 sm:py-16 
          bg-zinc-900/70"
        >
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div
              className="w-20 h-20 sm:w-28 sm:h-28 mx-auto
              flex items-center justify-center transform hover:scale-105 
              transition-transform duration-300"
            >
              <img
                src={BlackcitoSinPatitas}
                alt="Black Silver Logo"
                className="w-full h-full object-contain 
                drop-shadow-[0_0_15px_rgba(27,205,219,0.4)]"
              />
            </div>
            <h1
              className="text-xl sm:text-2xl font-bold text-white 
              mb-2 tracking-wide"
            >
              Black Silver
            </h1>
            <p
              className="text-[12px]! sm:text-sm text-cyan-400 font-medium 
              tracking-widest uppercase"
            >
              Sistema de Gestión Minera
            </p>
          </div>

          {/* Error Message */}
          {error && typeof error === "string" && error.length > 0 && (
            <div
              className="mb-6 p-4 rounded-xl bg-red-500/10 border 
              border-red-500/30 backdrop-blur-sm animate-slideDown"
            >
              <p className="text-xs text-red-400 text-center">{error}</p>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="space-y-5"
          >
            <div>
              <TextInput
                label={<span className="text-zinc-300">Usuario</span>}
                placeholder="Ingresa tu usuario"
                radius="lg"
                size="sm"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
                size="sm"
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
              size="sm"
              loading={isLoading}
              className="mt-8! bg-linear-to-r! from-cyan-600! to-blue-600! text-white! 
              font-bold! hover:from-cyan-500! hover:to-blue-500! 
              shadow-[0_0_20px_rgba(6,182,212,0.3)]! transition-all duration-300! border-0!"
            >
              Iniciar Sesión
            </Button>
          </form>

          {/* Footer */}
          <p className="text-center text-xs text-zinc-500 mt-8">
            &copy; {new Date().getFullYear()} Black Silver. Todos los derechos
            reservados.
          </p>
        </div>
      </div>
    </div>
  );
};
