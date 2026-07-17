import { useCallback, useEffect, useRef, useState } from "react";
import {
  Button,
  Container,
  Stack,
  Title,
  Text,
  Card,
  Group,
  ThemeIcon,
  Badge,
  Avatar,
  Modal,
  Progress,
  Alert,
  Loader,
} from "@mantine/core";
import {
  IconClock,
  IconCheck,
  IconAlertCircle,
  IconCamera,
  IconCameraOff,
  IconRefresh,
  IconQrcode,
  IconLogin,
  IconLogout,
  IconTrash,
  IconCalendar,
} from "@tabler/icons-react";
import { Scanner, type IDetectedBarcode } from "@yudiel/react-qr-scanner";
import { motion, AnimatePresence } from "motion/react";
import { useNotify } from "../../../hooks/useNotify";
import { AsistenciaService } from "../service/asistencia.service";
import { useSessionTimeout } from "../hooks/useSessionTimeout";
import { api } from "../../../service/_api";
import type { IArchivo } from "../../../shared/interfaces/archivo";

type Paso = 1 | 2 | 3 | 4;

interface SesionMarcaje {
  id_sesion: string;
  siguiente_tipo_marcaje: "Ingreso" | "Salida";
  empleado: {
    id_empleado: number;
    nombre: string;
    apellido: string;
    nombre_completo: string;
    dni: string | null;
    url_foto: string | null;
  };
  programacion_vigente: {
    id_programacion_horario: number;
    lugar_nombre: string | null;
    turno: {
      id: number;
      tipo_turno: string;
      hora_ingreso: string;
      hora_salida: string;
      minutos_tolerancia: number;
      total_horas: number | null;
    };
  } | null;
  evidencia_inicial?: IArchivo | null;
}

const TIMEOUT_SESION_MS = 60_000;
const WARNING_SESION_MS = 30_000;

/**
 * Página plana (sin layout) del flujo de marcaje por QR.
 *
 * Implementa los 4 pasos:
 *  1. Iniciar proceso
 *  2. Capturar QR (con @yudiel/react-qr-scanner)
 *  3. Validar identidad (mostrar datos + cámara selfie opcional)
 *  4. Confirmar proceso
 *
 * Incluye session timeout (60s inactividad -> modal "¿Sigues activo?"
 * con countdown de 30s -> cancelación automática del proceso).
 */
export default function MarcarAsistenciaPage() {
  const { notifyError } = useNotify();

  const [paso, setPaso] = useState<Paso>(1);
  const [sesion, setSesion] = useState<SesionMarcaje | null>(null);
  const [qrEscaneadoAt, setQrEscaneadoAt] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showExitModal, setShowExitModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const scannerRef = useRef<{ stop: () => void } | null>(null);

  // Indica si hay un proceso en curso (entre paso 2 y paso 4).
  const procesoEnCurso = paso >= 2 && paso < 4;

  const resetTodo = useCallback(() => {
    setSesion(null);
    setErrorMessage(null);
    setQrEscaneadoAt(null);
    setPaso(1);
    try {
      scannerRef.current?.stop();
    } catch {
      /* ignore */
    }
  }, []);

  // Timeout de sesión: a los 60s sin actividad, pregunta; a los 90s cancela.
  const sessionTimeout = useSessionTimeout({
    timeoutMs: TIMEOUT_SESION_MS + WARNING_SESION_MS,
    warningMs: WARNING_SESION_MS,
    onTimeout: () => {
      // Si el usuario está en un proceso, crear un marcaje incompleto.
      void notificarCancelacion("Tiempo agotado por inactividad");
      resetTodo();
    },
    enabled: procesoEnCurso,
  });

  /**
   * Notifica al backend que se canceló un proceso en curso (crea un marcaje
   * incompleto con proceso_confirmado=false). Llamado desde:
   *  - El botón "Cancelar" del usuario en cualquier paso.
   *  - El session timeout (60s sin actividad).
   *  - El modal "¿Salir sin completar?" cuando el usuario cierra la pestaña.
   */
  const notificarCancelacion = useCallback(
    async (motivo: string) => {
      if (sesion) {
        try {
          await AsistenciaService.cancelar_proceso({
            id_empleado: sesion.empleado.id_empleado,
            llego_al_qr: paso >= 3,
            id_sesion: sesion.id_sesion,
            motivo,
            evidencia_qr: sesion.evidencia_inicial ?? undefined,
          });
        } catch (err) {
          console.error(err);
        }
      }
    },
    [sesion, paso],
  );

  const handleIniciar = useCallback(() => {
    setErrorMessage(null);
    setPaso(2);
    sessionTimeout.cancelTimeout();
    sessionTimeout.resetTimer();
  }, [sessionTimeout]);

  const handleQrDetectado = useCallback(
    async (detected: IDetectedBarcode[]) => {
      const raw = detected[0]?.rawValue;
      if (!raw || loading) return;

      // Pausamos el scanner para no procesar el mismo QR varias veces.
      try {
        scannerRef.current?.stop();
      } catch {
        /* ignore */
      }

      setLoading(true);
      setErrorMessage(null);

      let evidenciaQr: IArchivo | null = null;
      const video = document.querySelector("video");
      if (video) {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth || 480;
          canvas.height = video.videoHeight || 480;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const blob = await new Promise<Blob | null>((resolve) =>
              canvas.toBlob(resolve, "image/jpeg", 0.85),
            );
            if (blob) {
              const fd = new FormData();
              fd.append("archivo", blob, "qr_capture.jpg");
              fd.append("carpeta", "evidencias-asistencia");
              const { data } = await api.post<{ success: boolean; data: IArchivo }>(
                "/archivos/upload",
                fd,
                { headers: { "Content-Type": "multipart/form-data" } },
              );
              if (data?.success && data.data) {
                evidenciaQr = data.data;
              }
            }
          }
        } catch (err) {
          console.error("Error capturing QR frame:", err);
        }
      }

      try {
        const resp = await AsistenciaService.resolver_qr({
          qr_token: raw,
          evidencia_inicial: evidenciaQr ?? undefined,
        });
        if (resp.success) {
          const sesionConQr = {
            ...(resp.data as SesionMarcaje),
            evidencia_inicial: evidenciaQr,
          };
          setQrEscaneadoAt(new Date());
          setSesion(sesionConQr);
          setPaso(3);
          sessionTimeout.resetTimer();
        } else {
          setErrorMessage(resp.message ?? "No se pudo procesar el QR");
          // Reanuda el scanner para permitir reintento.
          setPaso(2);
        }
      } catch (err) {
        console.error(err);
        notifyError("Error de conexión con el servidor");
        setPaso(2);
      } finally {
        setLoading(false);
      }
    },
    [loading, notifyError, sessionTimeout],
  );

  const handleConfirmar = useCallback(
    async (evidencia_rostro: IArchivo | null) => {
      if (!sesion) return;

      setLoading(true);
      try {
        const resp = await AsistenciaService.confirmar_asistencia({
          id_sesion: sesion.id_sesion,
          id_empleado: sesion.empleado.id_empleado,
          evidencia_rostro,
          evidencia_qr: sesion.evidencia_inicial ?? undefined,
        });
        if (resp.success) {
          sessionTimeout.cancelTimeout();
          setPaso(4);
        } else {
          setErrorMessage(resp.message ?? "No se pudo confirmar");
        }
      } catch (err) {
        console.error(err);
        notifyError("Error al confirmar asistencia");
      } finally {
        setLoading(false);
      }
    },
    [sesion, notifyError, sessionTimeout],
  );

  const cancelarProceso = useCallback(() => {
    if (procesoEnCurso) {
      setShowExitModal(true);
    } else {
      resetTodo();
    }
  }, [procesoEnCurso, resetTodo]);

  // Detección de cierre de pestaña / refresh / navegación a otra URL.
  // Si hay un proceso en curso y el usuario intenta salir, mostramos un
  // aviso nativo del navegador. Si decide salir, el evento pagehide notificará al servidor.
  useEffect(() => {
    const handlerBeforeUnload = (e: BeforeUnloadEvent) => {
      if (procesoEnCurso) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    const handlerUnload = () => {
      if (procesoEnCurso && sesion) {
        const baseURL = api.defaults.baseURL || "";
        const payload = JSON.stringify({
          id_empleado: sesion.empleado.id_empleado,
          llego_al_qr: paso >= 3,
          id_sesion: sesion.id_sesion,
          motivo: "Cierre de pestaña / F5",
          evidencia_qr: sesion.evidencia_inicial ?? null,
        });

        if (navigator.sendBeacon) {
          navigator.sendBeacon(`${baseURL}/asistencia-public/cancelar-proceso`, new Blob([payload], { type: "application/json" }));
        } else {
          void fetch(`${baseURL}/asistencia-public/cancelar-proceso`, {
            method: "POST",
            keepalive: true,
            headers: { "Content-Type": "application/json" },
            body: payload,
          });
        }
      }
    };

    window.addEventListener("beforeunload", handlerBeforeUnload);
    window.addEventListener("pagehide", handlerUnload);

    return () => {
      window.removeEventListener("beforeunload", handlerBeforeUnload);
      window.removeEventListener("pagehide", handlerUnload);
    };
  }, [procesoEnCurso, sesion, paso]);

  const confirmarSalida = useCallback(async () => {
    if (sesion) {
      await notificarCancelacion("Cancelado por el usuario");
    }
    setShowExitModal(false);
    resetTodo();
  }, [sesion, notificarCancelacion, resetTodo]);

  // Aseguramos detener el scanner al desmontar.
  // Capturamos scannerRef.current en una variable local al momento del effect
  // para evitar el warning de React sobre refs cambiantes en el cleanup.
  useEffect(() => {
    const handle = scannerRef.current;
    return () => {
      try {
        handle?.stop();
      } catch {
        /* ignore */
      }
    };
  }, []);

  return (
    <div className="relative min-h-[85vh] w-full flex items-center justify-center py-10 overflow-hidden bg-zinc-950 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]">
      {/* Glow blobs para un estilo glassmorphism ultra premium */}
      <div className="absolute top-12 left-12 w-80 h-80 rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-12 right-12 w-96 h-96 rounded-full bg-cyan-600/10 blur-[140px] pointer-events-none animate-pulse" style={{ animationDelay: "2.5s" }} />

      <Container className="w-full max-w-4xl z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card
            withBorder
            radius="28px"
            p={36}
            className="bg-zinc-950/40 backdrop-blur-xl border-zinc-800/80 shadow-[0_25px_60px_rgba(0,0,0,0.5)] shadow-indigo-950/5 relative overflow-hidden"
          >
            {/* Línea de brillo en el borde superior estilo cristal */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-zinc-700/30 to-transparent" />

            <Stack gap="xl">
              <Stack gap="xs" align="center" className="mb-2">
                <Title order={1} className="text-white tracking-tight text-center" fz="1.8rem" fw={900}>
                  Registrar Asistencia
                </Title>
                <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 rounded-full shadow-inner mt-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <Text c="cyan.3" fw={700} size="sm" className="font-mono tracking-wider">
                    {currentTime.toLocaleDateString("es-PE", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                    {" · "}
                    {currentTime.toLocaleTimeString("es-PE", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: true,
                    })}
                  </Text>
                </div>
              </Stack>

              {/* Riel visual interactivo de Pasos (Asistente) */}
              <div className="flex items-center justify-between px-4 mb-6 relative select-none">
                <div className="absolute top-[17px] left-6 right-6 h-[2px] bg-zinc-800/60 -translate-y-1/2 z-0 rounded-full" />
                <div 
                  className="absolute top-[17px] left-6 h-[2px] bg-gradient-to-r from-indigo-500 to-cyan-500 -translate-y-1/2 z-0 rounded-full transition-all duration-500" 
                  style={{ 
                    width: paso === 1 ? "0%" : paso === 2 ? "33%" : paso === 3 ? "66%" : "90%" 
                  }}
                />
                {[1, 2, 3, 4].map((s) => {
                  const isCompleted = s < paso;
                  const isActive = s === paso;
                  return (
                    <div key={s} className="z-10 flex flex-col items-center gap-1.5">
                      <div 
                        className={`w-[34px] h-[34px] rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 border ${
                          isCompleted 
                            ? "bg-indigo-600 border-indigo-500 text-white shadow-[0_0_12px_rgba(99,102,241,0.5)]" 
                            : isActive
                              ? "bg-zinc-950 border-cyan-400 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)] scale-110"
                              : "bg-zinc-900 border-zinc-800/80 text-zinc-500"
                        }`}
                      >
                        {isCompleted ? <IconCheck size={14} stroke={3} /> : s}
                      </div>
                      <span 
                        className={`text-[9px] font-bold tracking-wider uppercase transition-colors duration-500 ${
                          isActive ? "text-cyan-400" : "text-zinc-500"
                        }`}
                      >
                        {s === 1 ? "Inicio" : s === 2 ? "Escanear" : s === 3 ? "Validar" : "Listo"}
                      </span>
                    </div>
                  );
                })}
              </div>

              {errorMessage && (
                <Alert
                  color="red"
                  variant="light"
                  icon={<IconAlertCircle size={18} />}
                  radius="lg"
                  className="border border-red-900/30 bg-red-950/20 text-red-200"
                >
                  {errorMessage}
                </Alert>
              )}

              <AnimatePresence mode="wait">
                <motion.div
                  key={paso}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.22, ease: "easeInOut" }}
                >
                  {paso === 1 && <PasoIniciar onIniciar={handleIniciar} />}
                  {paso === 2 && (
                    <PasoQr
                      loading={loading}
                      scannerRef={scannerRef}
                      onDetect={handleQrDetectado}
                      onCancelar={cancelarProceso}
                    />
                  )}
                  {paso === 3 && sesion && qrEscaneadoAt && (
                    <PasoValidar
                      sesion={sesion}
                      loading={loading}
                      onConfirmar={handleConfirmar}
                      onCancelar={cancelarProceso}
                      qrEscaneadoAt={qrEscaneadoAt}
                    />
                  )}
                  {paso === 4 && sesion && (
                    <PasoConfirmado sesion={sesion} onReiniciar={resetTodo} />
                  )}
                </motion.div>
              </AnimatePresence>
            </Stack>
          </Card>
        </motion.div>
      </Container>

      {/* Modal "¿Sigues activo?" del session timeout */}
      <Modal
        opened={sessionTimeout.warningVisible}
        onClose={() => {}}
        centered
        withCloseButton={false}
        radius="xl"
        classNames={{
          content: "bg-zinc-950 border border-amber-700/50",
          body: "p-6",
        }}
      >
        <Stack align="center" gap="md">
          <ThemeIcon
            size={64}
            radius={100}
            variant="gradient"
            gradient={{ from: "amber.6", to: "orange.6" }}
          >
            <IconClock size={32} stroke={1.5} />
          </ThemeIcon>
          <Title order={3} className="text-white text-center">
            ¿Sigues activo?
          </Title>
          <Text c="zinc.4" ta="center" size="sm">
            Detectamos inactividad en el proceso de marcaje.
          </Text>

          {/* Countdown prominente */}
          <div className="flex items-baseline justify-center gap-1 my-1">
            <Text
              className="text-7xl font-black text-amber-400 leading-none tabular-nums"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {sessionTimeout.remainingSeconds}
            </Text>
            <Text className="text-2xl text-amber-400/70 font-bold mb-2">s</Text>
          </div>

          <Progress
            value={(sessionTimeout.remainingSeconds / (WARNING_SESION_MS / 1000)) * 100}
            size="md"
            color="amber"
            className="w-full"
            animated
          />

          <Text c="zinc.5" ta="center" size="xs">
            El proceso se cancelará automáticamente si no respondes.
          </Text>

          <Group gap="sm" mt="sm">
            <Button
              variant="default"
              className="!bg-zinc-800 !text-zinc-300 !border-zinc-700"
              radius="lg"
              size="xs"
              onClick={cancelarProceso}
            >
              Cancelar
            </Button>
            <Button
              leftSection={<IconCheck size={16} />}
              radius="lg"
              size="xs"
              className="bg-amber-600 hover:bg-amber-700 text-white"
              onClick={sessionTimeout.extend}
            >
              Sí, continuar
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Modal "¿Salir sin completar?" — disparado por beforeunload */}
      <Modal
        opened={showExitModal}
        onClose={() => setShowExitModal(false)}
        centered
        withCloseButton={false}
        radius="xl"
        classNames={{
          content: "bg-zinc-950 border border-red-700/50",
          body: "p-6",
        }}
      >
        <Stack align="center" gap="md">
          <ThemeIcon
            size={64}
            radius={100}
            variant="gradient"
            gradient={{ from: "red.6", to: "orange.6" }}
          >
            <IconAlertCircle size={32} stroke={1.5} />
          </ThemeIcon>
          <Title order={3} className="text-white text-center">
            ¿Salir sin completar?
          </Title>
          <Text c="zinc.4" ta="center" size="sm">
            Tienes un proceso de marcaje en curso. Si sales ahora, se registrará
            un marcaje incompleto para mantener la trazabilidad.
          </Text>
          <Group gap="sm" mt="sm">
            <Button
              variant="default"
              className="!bg-zinc-800 !text-zinc-300 !border-zinc-700"
              radius="lg"
              size="xs"
              onClick={() => setShowExitModal(false)}
            >
              Cancelar
            </Button>
            <Button
              leftSection={<IconCheck size={16} />}
              radius="lg"
              size="xs"
              color="red"
              onClick={() => void confirmarSalida()}
            >
              Sí, salir
            </Button>
          </Group>
        </Stack>
      </Modal>
    </div>
  );
}

// ========== PASO 1: Iniciar ==========
const PasoIniciar = ({ onIniciar }: { onIniciar: () => void }) => (
  <Stack align="center" gap="xl" py="lg">
    <style>{`
      @keyframes scan-laser {
        0% { transform: translateY(-70px); }
        50% { transform: translateY(70px); }
        100% { transform: translateY(-70px); }
      }
      .animate-laser {
        animation: scan-laser 2.5s infinite ease-in-out;
      }
    `}</style>
    
    <div
      className="w-36 h-36 rounded-[36px] bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 border border-zinc-800/80 flex items-center justify-center shadow-[inset_0_4px_12px_rgba(255,255,255,0.05),0_15px_30px_rgba(0,0,0,0.4)] backdrop-blur-md relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <IconQrcode size={84} className="text-indigo-400 drop-shadow-[0_4px_12px_rgba(99,102,241,0.4)]" stroke={1.1} />
      {/* Línea Láser Animada */}
      <div className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_10px_#22d3ee] animate-laser z-20" />
    </div>

    <Stack align="center" gap="xs">
      <Title order={3} className="text-white text-center font-bold tracking-tight">
        ¡Hola! Registrar asistencia
      </Title>
      <Text c="zinc.4" ta="center" size="sm" className="max-w-xs leading-relaxed font-medium">
        Presiona el botón para escanear el código QR de tu fotocheck físico o digital.
      </Text>
    </Stack>

    <Button
      size="lg"
      radius="xl"
      variant="gradient"
      gradient={{ from: "indigo.5", to: "cyan.5" }}
      leftSection={<IconQrcode size={22} />}
      onClick={onIniciar}
      className="h-14 px-12 text-base font-bold text-white shadow-lg shadow-indigo-500/25 hover:scale-[1.02] hover:shadow-indigo-500/35 active:scale-[0.98] transition-all"
    >
      Iniciar proceso
    </Button>
  </Stack>
);

// ========== PASO 2: Capturar QR ==========
const PasoQr = ({
  loading,
  scannerRef,
  onDetect,
  onCancelar,
}: {
  loading: boolean;
  scannerRef: React.MutableRefObject<{ stop: () => void } | null>;
  onDetect: (d: IDetectedBarcode[]) => void;
  onCancelar: () => void;
}) => {
  return (
    <Stack gap="lg" align="center" className="w-full">
      <style>{`
        @keyframes scan-laser-qr {
          0% { top: 10%; }
          50% { top: 90%; }
          100% { top: 10%; }
        }
        .animate-laser-qr {
          animation: scan-laser-qr 2s infinite ease-in-out;
        }
      `}</style>
      <Text c="zinc.4" ta="center" size="sm" className="font-medium">
        Coloca tu código QR frente a la cámara para escanearlo.
      </Text>
      <div
        className="relative w-full max-w-[340px] aspect-square 
          rounded-[24px] overflow-hidden border-2 border-indigo-500/30
          shadow-[0_20px_40px_rgba(0,0,0,0.6)] bg-zinc-950/80 backdrop-blur-md"
      >
        {loading ? (
          <div className="flex flex-col gap-3 items-center justify-center w-full h-full">
            <Loader color="indigo" size="md" />
            <Text size="xs" c="indigo.3" className="animate-pulse">Procesando código...</Text>
          </div>
        ) : (
          <>
            <Scanner
              onScan={onDetect}
              formats={["qr_code"]}
              paused={loading}
              sound
              allowMultiple={false}
              scanDelay={1500}
              components={{
                finder: true,
                torch: false,
                zoom: false,
              }}
              classNames={{
                container: "w-full h-full object-cover",
                video: "w-full h-full object-cover",
              }}
              onError={(err) => {
                console.error("Scanner error:", err);
              }}
              // @ts-expect-error - el ref del Scanner expone stop() en runtime.
              ref={scannerRef}
            />
            {/* Línea láser de escaneo activa sobre la cámara */}
            <div className="absolute left-6 right-6 h-0.5 bg-gradient-to-r from-transparent via-indigo-400 to-transparent shadow-[0_0_8px_#818cf8] animate-laser-qr z-20 pointer-events-none" />
          </>
        )}
        <div className="absolute inset-0 pointer-events-none border-8 border-indigo-500/10 rounded-[24px] z-10" />
      </div>
      <Button
        variant="default"
        className="!bg-zinc-900/60 !text-zinc-300 !border-zinc-800/80 hover:!bg-zinc-800/80 transition-colors"
        radius="xl"
        size="xs"
        onClick={onCancelar}
        disabled={loading}
      >
        Cancelar
      </Button>
    </Stack>
  );
};

// ========== PASO 3: Validar Identidad (con selfie) ==========
const PasoValidar = ({
  sesion,
  loading,
  onConfirmar,
  onCancelar,
  qrEscaneadoAt,
}: {
  sesion: SesionMarcaje;
  loading: boolean;
  onConfirmar: (evidencia_rostro: IArchivo | null) => void;
  onCancelar: () => void;
  qrEscaneadoAt: Date;
}) => {
  const esIngreso = sesion.siguiente_tipo_marcaje === "Ingreso";
  const turno = sesion.programacion_vigente?.turno ?? null;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [camaraActiva, setCamaraActiva] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [selfieBlob, setSelfieBlob] = useState<Blob | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [subioError, setSubioError] = useState<string | null>(null);
  const [mostrarCamara, setMostrarCamara] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const detenerCamara = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCamaraActiva(false);
  }, []);

  const iniciarCamara = useCallback(async () => {
    setSubioError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 480, height: 480 },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCamaraActiva(true);
    } catch (err) {
      console.error(err);
      setSubioError(
        "No se pudo acceder a la cámara. Verifica los permisos del navegador.",
      );
    }
  }, []);

  const capturarSelfie = useCallback(() => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 480;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        if (selfiePreview) URL.revokeObjectURL(selfiePreview);
        setSelfieBlob(blob);
        setSelfiePreview(URL.createObjectURL(blob));
        detenerCamara();
      },
      "image/jpeg",
      0.85,
    );
  }, [detenerCamara, selfiePreview]);

  const descartarSelfie = useCallback(() => {
    if (selfiePreview) URL.revokeObjectURL(selfiePreview);
    setSelfieBlob(null);
    setSelfiePreview(null);
  }, [selfiePreview]);

  // Cleanup del stream al desmontar o cambiar de paso.
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const handleConfirmarClick = useCallback(async () => {
    if (!selfieBlob) {
      return;
    }
    setSubiendo(true);
    setSubioError(null);
    try {
      const fd = new FormData();
      fd.append("archivo", selfieBlob, "selfie.jpg");
      fd.append("carpeta", "evidencias-asistencia");
      const { data } = await api.post<{ success: boolean; data: IArchivo }>(
        "/archivos/upload",
        fd,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      if (data?.success && data.data) {
        onConfirmar(data.data);
      } else {
        setSubioError("No se pudo subir la foto. Intenta de nuevo.");
      }
    } catch (err) {
      console.error(err);
      setSubioError("Error de red al subir la foto. Por favor, reintenta.");
    } finally {
      setSubiendo(false);
    }
  }, [selfieBlob, onConfirmar]);

  return (
    <Stack gap="md">
      <Group justify="space-between" align="flex-start">
        <Stack gap={4}>
          <Title order={4} className="text-white">
            Validar Identidad
          </Title>
          <Text size="xs" c="zinc.5">
            Confirma que eres tú antes de registrar la asistencia.
          </Text>
        </Stack>
        <Badge
          color={esIngreso ? "teal" : "orange"}
          variant="filled"
          size="lg"
          leftSection={
            esIngreso ? (
              <IconLogin size={16} />
            ) : (
              <IconLogout size={16} />
            )
          }
        >
          {esIngreso ? "INGRESO" : "SALIDA"}
        </Badge>
      </Group>

      {/* Grid responsivo: Lado a Lado en pantallas medianas/grandes */}
      <div className={mostrarCamara || selfiePreview ? "grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch" : "flex flex-col gap-4"}>
        <div className={mostrarCamara || selfiePreview ? "md:col-span-6 flex flex-col justify-between" : "w-full"}>
          <div className="space-y-4">
            <Card withBorder radius="xl" p="md" className="bg-zinc-950/30 border-zinc-800/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)]">
              <Group align="center" wrap="wrap">
                <Avatar
                  src={sesion.empleado.url_foto ?? undefined}
                  size="xl"
                  radius="xl"
                  className="border border-zinc-800 shadow-md"
                >
                  {sesion.empleado.nombre_completo[0]?.toUpperCase()}
                </Avatar>
                <Stack gap={4} style={{ flex: 1 }}>
                  <Text fw={800} size="lg" className="text-white tracking-tight">
                    {sesion.empleado.nombre_completo}
                  </Text>
                  <Text size="xs" c="zinc.5" fw={600}>
                    DNI: <span className="text-zinc-300">{sesion.empleado.dni ?? "-"}</span>
                  </Text>
                  <Group gap="xs" mt="xs" wrap="wrap">
                    {turno ? (
                      <>
                        <Badge variant="light" color="indigo" radius="md">
                          Turno: {turno.tipo_turno}
                        </Badge>
                        <Badge variant="light" color="gray" radius="md">
                          {turno.hora_ingreso} - {turno.hora_salida}
                        </Badge>
                        <Badge variant="light" color="teal" radius="md">
                          Tolerancia: {turno.minutos_tolerancia}m
                        </Badge>
                      </>
                    ) : (
                      <Badge variant="light" color="yellow" radius="md" className="border border-yellow-500/20 bg-yellow-950/20 text-yellow-400">
                        Sin programación pendiente
                      </Badge>
                    )}
                    {sesion.programacion_vigente?.lugar_nombre && (
                      <Badge variant="light" color="cyan" radius="md">
                        {sesion.programacion_vigente.lugar_nombre}
                      </Badge>
                    )}
                  </Group>
                </Stack>
              </Group>
            </Card>

            {/* Hora de Registro Oficial (congelada desde el escaneo del QR) */}
            <Card withBorder radius="lg" p="sm" className="bg-indigo-950/10 border-indigo-500/10 shadow-sm mt-1">
              <Group gap="md" justify="space-between" align="center" wrap="nowrap">
                <Stack gap={2} style={{ flex: 1 }}>
                  <Text size="10px" c="cyan.4" fw={700} className="uppercase tracking-wider">
                    Fecha de Registro
                  </Text>
                  <Group gap={6} align="center">
                    <IconCalendar size={14} className="text-zinc-400" />
                    <Text size="xs" fw={600} className="text-zinc-200 capitalize">
                      {qrEscaneadoAt.toLocaleDateString("es-PE", { weekday: 'long', day: 'numeric', month: 'long' })}
                    </Text>
                  </Group>
                </Stack>
                
                <div className="h-8 w-px bg-zinc-800" />

                <Stack gap={2} style={{ flex: 1 }}>
                  <Text size="10px" c="cyan.4" fw={700} className="uppercase tracking-wider">
                    Hora de Registro
                  </Text>
                  <Group gap={6} align="center">
                    <IconClock size={14} className="text-cyan-400" />
                    <Text size="xs" fw={700} className="text-cyan-400 font-mono">
                      {qrEscaneadoAt.toLocaleTimeString("es-PE", { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                    </Text>
                  </Group>
                </Stack>
              </Group>
            </Card>

            {!mostrarCamara && !selfiePreview && (
              <Button
                size="md"
                radius="xl"
                variant="gradient"
                gradient={{ from: "indigo.5", to: "cyan.5" }}
                leftSection={<IconCamera size={18} />}
                onClick={async () => {
                  setMostrarCamara(true);
                  await iniciarCamara();
                }}
                className="w-full h-12 text-white shadow-lg hover:scale-[1.02] transition-all font-bold"
              >
                Validar Asistencia (Tomar Foto)
              </Button>
            )}
          </div>

          {/* En desktop, mostramos los botones de confirmación/cancelación de esta columna */}
          <div className="hidden md:flex justify-between items-center mt-6 gap-2">
            <Button
              variant="default"
              className="!bg-zinc-800 !text-zinc-300 !border-zinc-700 h-12 px-6"
              radius="lg"
              size="sm"
              onClick={() => {
                detenerCamara();
                onCancelar();
              }}
              disabled={loading || subiendo}
            >
              Cancelar
            </Button>
            <Button
              leftSection={!loading && !subiendo && <IconCheck size={18} />}
              loading={loading || subiendo}
              onClick={selfiePreview ? handleConfirmarClick : undefined}
              radius="lg"
              size="md"
              className="h-12 px-8 font-bold border-0 transition-all duration-300"
              style={
                selfiePreview
                  ? {
                      background: esIngreso
                        ? "linear-gradient(to right, #10b981, #0d9488)"
                        : "linear-gradient(to right, #f43f5e, #ea580c)",
                      color: "#fff",
                      cursor: "pointer",
                      boxShadow: esIngreso
                        ? "0 10px 15px -3px rgba(16, 185, 129, 0.2)"
                        : "0 10px 15px -3px rgba(244, 63, 94, 0.2)",
                    }
                  : {
                      backgroundColor: "#27272a",
                      color: "#71717a",
                      border: "1px solid #3f3f46",
                      cursor: "not-allowed",
                      opacity: 0.6,
                    }
              }
            >
              {esIngreso ? "Confirmar Ingreso" : "Confirmar Salida"}
            </Button>
          </div>
        </div>

        {/* Cámara / Vista previa en la derecha */}
        {(mostrarCamara || selfiePreview) && (
          <div className="md:col-span-6">
            <Card
              withBorder
              radius="xl"
              p="md"
              className="bg-zinc-950/20 border-white/5 h-full flex flex-col justify-between shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)]"
            >
              <Stack gap="sm" className="h-full justify-between">
                <Group justify="space-between" align="center" wrap="wrap">
                  <Group gap="xs">
                    <IconCamera size={18} className="text-indigo-400" />
                    <Text size="xs" fw={700} c="dimmed" className="uppercase tracking-wider">
                      Cámara
                    </Text>
                  </Group>
                  {!selfiePreview && !camaraActiva && (
                    <Button
                      size="xs"
                      radius="lg"
                      variant="light"
                      color="indigo"
                      leftSection={<IconCamera size={14} />}
                      onClick={iniciarCamara}
                      disabled={loading || subiendo}
                    >
                      Activar cámara
                    </Button>
                  )}
                  {camaraActiva && !selfiePreview && (
                    <Group gap="xs">
                      <Button
                        size="xs"
                        radius="lg"
                        variant="light"
                        color="red"
                        leftSection={<IconCameraOff size={14} />}
                        onClick={() => {
                          detenerCamara();
                          setMostrarCamara(false);
                        }}
                      >
                        Atrás
                      </Button>
                      <Button
                        size="xs"
                        radius="lg"
                        color="indigo"
                        onClick={capturarSelfie}
                      >
                        Capturar
                      </Button>
                    </Group>
                  )}
                  {selfiePreview && (
                    <Group gap="xs">
                      <Button
                        size="xs"
                        radius="lg"
                        variant="light"
                        color="red"
                        leftSection={<IconTrash size={14} />}
                        onClick={async () => {
                          descartarSelfie();
                          setMostrarCamara(true);
                          await iniciarCamara();
                        }}
                        disabled={loading || subiendo}
                      >
                        Repetir
                      </Button>
                      <Badge color="teal" variant="light" leftSection={<IconCheck size={12} />}>
                        Capturada
                      </Badge>
                    </Group>
                  )}
                </Group>

                <div className="relative w-full max-w-[240px] mx-auto aspect-square rounded-2xl overflow-hidden border border-white/5 bg-zinc-950 shadow-inner my-2">
                  {selfiePreview ? (
                    <img
                      src={selfiePreview}
                      alt="Selfie de validación"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                      style={{ display: camaraActiva ? "block" : "none" }}
                    />
                  )}
                  {!camaraActiva && !selfiePreview && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Stack align="center" gap="xs">
                        <IconCameraOff size={36} className="text-zinc-700" />
                        <Text c="zinc.6" size="xs" ta="center">
                          Apagada
                        </Text>
                      </Stack>
                    </div>
                  )}
                  {subiendo && (
                    <div className="absolute inset-0 bg-zinc-950/80 flex items-center justify-center">
                      <Stack align="center" gap="xs">
                        <Loader color="indigo" size="sm" />
                        <Text c="indigo.3" size="xs">
                          Subiendo...
                        </Text>
                      </Stack>
                    </div>
                  )}
                </div>

                {subioError && (
                  <Alert
                    color="yellow"
                    variant="light"
                    radius="md"
                    icon={<IconAlertCircle size={16} />}
                    styles={{ message: { fontSize: "12px" } }}
                  >
                    {subioError}
                  </Alert>
                )}

                <Text c="zinc.6" size="10px" ta="center" className="italic">
                  La foto se guarda como evidencia.
                </Text>
              </Stack>
            </Card>
          </div>
        )}
      </div>

      {/* En mobile, mostramos los botones abajo de todo */}
      <div className={mostrarCamara || selfiePreview ? "flex md:hidden justify-between items-center mt-2 w-full" : "hidden"}>
        <Button
          variant="default"
          className="!bg-zinc-800 !text-zinc-300 !border-zinc-700"
          radius="lg"
          size="xs"
          onClick={() => {
            detenerCamara();
            onCancelar();
          }}
          disabled={loading || subiendo}
        >
          Cancelar
        </Button>
        <Button
          leftSection={!loading && !subiendo && <IconCheck size={18} />}
          loading={loading || subiendo}
          onClick={selfiePreview ? handleConfirmarClick : undefined}
          radius="lg"
          size="sm"
          className="h-10 px-6 font-bold border-0 transition-all duration-300"
          style={
            selfiePreview
              ? {
                  background: esIngreso
                    ? "linear-gradient(to right, #10b981, #0d9488)"
                    : "linear-gradient(to right, #f43f5e, #ea580c)",
                  color: "#fff",
                  cursor: "pointer",
                  boxShadow: esIngreso
                    ? "0 10px 15px -3px rgba(16, 185, 129, 0.2)"
                    : "0 10px 15px -3px rgba(244, 63, 94, 0.2)",
                }
              : {
                  backgroundColor: "#27272a",
                  color: "#71717a",
                  border: "1px solid #3f3f46",
                  cursor: "not-allowed",
                  opacity: 0.6,
                }
          }
        >
          {esIngreso ? "Confirmar Ingreso" : "Confirmar Salida"}
        </Button>
      </div>
    </Stack>
  );
};

// ========== PASO 4: Confirmado ==========
const PasoConfirmado = ({
  sesion,
  onReiniciar,
}: {
  sesion: SesionMarcaje;
  onReiniciar: () => void;
}) => {
  return (
    <Stack align="center" gap="lg" py="lg">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      >
        <ThemeIcon
          size={120}
          radius={100}
          variant="gradient"
          gradient={{ from: "teal.6", to: "lime.6" }}
          className="shadow-lg shadow-teal-900/40"
        >
          <IconCheck size={64} stroke={2} />
        </ThemeIcon>
      </motion.div>
      <Stack align="center" gap="xs">
        <Title order={2} className="text-white text-center">
          ¡Asistencia Registrada!
        </Title>
        <Text c="zinc.4" ta="center" size="md">
          {sesion.empleado.nombre_completo} · {sesion.siguiente_tipo_marcaje}
        </Text>
      </Stack>
      <Group gap="sm" mt="md">
        <Button
          leftSection={<IconQrcode size={18} />}
          radius="xl"
          size="md"
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/30"
          onClick={onReiniciar}
        >
          Nuevo Registro
        </Button>
        <Button
          leftSection={<IconRefresh size={18} />}
          variant="default"
          className="!bg-zinc-800 !text-zinc-300 !border-zinc-700"
          radius="xl"
          size="md"
          onClick={onReiniciar}
        >
          Finalizar
        </Button>
      </Group>
    </Stack>
  );
};