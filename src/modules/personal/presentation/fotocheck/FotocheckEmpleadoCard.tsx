import { PhotoIcon, IdentificationIcon, BuildingOffice2Icon } from "@heroicons/react/24/outline";

export interface FotocheckEmpleadoCardProps {
  id_empleado: number;
  nombre: string;
  apellido: string;
  cargo: string;
  area?: string | null;
  empresa?: string | null;
  empresaUrlLogo?: string | null;
  urlFoto?: string | null;
  qrDataUrl: string;
  qrToken: string;
  dni?: string | null;
  ancho: number;
  alto: number;
}

/**
 * Render visual del fotocheck.
 * Se monta como un nodo HTML/Tailwind con `position: absolute` y `visibility: hidden`
 * (o `pointer-events: none`) en un `opacity: 0` y un `id` estable para que
 * `html2canvas` pueda capturarlo sin afectar la UI principal.
 *
 * El id del nodo es `fotocheck-card-{id_empleado}`.
 */
export const FotocheckEmpleadoCard = ({
  id_empleado,
  nombre,
  apellido,
  cargo,
  area,
  empresa,
  empresaUrlLogo,
  urlFoto,
  qrDataUrl,
  qrToken,
  dni,
  ancho,
  alto,
}: FotocheckEmpleadoCardProps) => {
  return (
    <div
      id={`fotocheck-card-${id_empleado}`}
      style={{
        position: "absolute",
        top: -10000,
        left: -10000,
        width: `${ancho}px`,
        height: `${alto}px`,
        backgroundColor: "#0a0a0a",
        color: "#fafafa",
        fontFamily: "system-ui, -apple-system, sans-serif",
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {/* Banda superior decorativa */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 8,
          background: "linear-gradient(90deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)",
        }}
      />

      {/* Header: Logo (izq) + Título (centro) + Empresa (der) */}
      <div
        style={{
          position: "absolute",
          top: 24,
          left: 24,
          right: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        {/* Logo de la empresa (esquina superior derecha) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            color: "#a5b4fc",
            fontSize: 14,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 1.5,
          }}
        >
          <BuildingOffice2Icon style={{ width: 20, height: 20 }} />
          {empresa ? empresa : "FOTOCHECK"}
        </div>

        {/* Empresa (esquina superior derecha) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: "#a5b4fc",
            fontSize: 14,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 1.5,
          }}
        >
          {empresaUrlLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={empresaUrlLogo}
              alt="logo"
              style={{
                width: 40,
                height: 40,
                objectFit: "contain",
                background: "#fafafa",
                borderRadius: 8,
                padding: 4,
              }}
              crossOrigin="anonymous"
            />
          ) : null}
          <span style={{ color: "#fafafa" }}>
            {empresa ?? "—"}
          </span>
        </div>
      </div>

      {/* Cuerpo: Foto a la izquierda, datos + QR a la derecha */}
      <div
        style={{
          position: "absolute",
          top: 88,
          left: 32,
          right: 32,
          display: "flex",
          gap: 24,
          alignItems: "center",
        }}
      >
        {/* Foto circular */}
        <div
          style={{
            width: 140,
            height: 140,
            borderRadius: 9999,
            background: "#1f2937",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "4px solid #4f46e5",
            flexShrink: 0,
          }}
        >
          {urlFoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={urlFoto}
              alt={`${nombre} ${apellido}`}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              crossOrigin="anonymous"
            />
          ) : (
            <PhotoIcon
              style={{ width: 64, height: 64, color: "#4b5563" }}
            />
          )}
        </div>

        {/* Datos del empleado */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: 2,
              color: "#a5b4fc",
            }}
          >
            <IdentificationIcon
              style={{
                width: 16,
                height: 16,
                display: "inline",
                marginRight: 6,
                verticalAlign: "middle",
              }}
            />
            Identificación
          </div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: "#fafafa",
              lineHeight: 1.1,
            }}
          >
            {nombre} {apellido}
          </div>
          <div
            style={{
              fontSize: 14,
              color: "#9ca3af",
              lineHeight: 1.2,
            }}
          >
            <span style={{ color: "#d1d5db" }}>{cargo}</span>
            {area ? (
              <>
                <span style={{ margin: "0 6px", color: "#6b7280" }}>·</span>
                <span>{area}</span>
              </>
            ) : null}
          </div>
          {dni ? (
            <div
              style={{
                fontSize: 13,
                color: "#6b7280",
                fontFamily: "monospace",
                letterSpacing: 1,
              }}
            >
              DNI: {dni}
            </div>
          ) : null}
        </div>
      </div>

      {/* QR: bottom-right grande */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          right: 32,
          width: 140,
          height: 140,
          background: "#fafafa",
          borderRadius: 12,
          padding: 10,
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrDataUrl}
          alt="QR"
          style={{ width: "100%", height: "100%" }}
        />
      </div>

      {/* Banda inferior: qr_token */}
      <div
        style={{
          position: "absolute",
          bottom: 24,
          left: 32,
          right: 200,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <div
          style={{
            fontSize: 9,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 2,
            color: "#6b7280",
          }}
        >
          Código de asistencia
        </div>
        <div
          style={{
            fontSize: 13,
            fontFamily: "monospace",
            color: "#d1d5db",
            wordBreak: "break-all",
          }}
        >
          {qrToken}
        </div>
      </div>

      {/* Banda inferior decorativa */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 8,
          background: "linear-gradient(90deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)",
        }}
      />
    </div>
  );
};
