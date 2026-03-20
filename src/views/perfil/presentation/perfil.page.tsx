import { Stack } from "@mantine/core";
import { useTitlePage } from "../../../hooks/useTitlePage";
import { usePerfil } from "../hooks/usePerfil";
import { ProfileHeader } from "./components/ProfileHeader";
import { ProfileSection } from "./components/ProfileSection";
import { ProfileDataField } from "./components/ProfileDataField";
import { ProfileSkeleton } from "./components/ProfileSkeleton";

export const PerfilPage = () => {
  useTitlePage("Mi Perfil");
  const { perfil, loading } = usePerfil();

  if (loading && !perfil) {
    return <ProfileSkeleton />;
  }

  if (!perfil) return null;

  return (
    <div className="ml-16">
      <Stack
        gap={45}
        className="animate-fade-in py-10 mb-20 w-full max-w-xl mx-auto"
      >
        {/* Profile Header */}
        <ProfileHeader
          username={perfil.username}
          path_foto={perfil.path_foto}
          nombre_rol={perfil.nombre_rol}
          nombre_cargo={perfil.nombre_cargo}
        />

        {/* SECCIÓN PERSONAL */}
        <ProfileSection title="Información Personal">
          <ProfileDataField label="Nombres" value={perfil.nombre} />
          <ProfileDataField label="Apellidos" value={perfil.apellido} />
          <ProfileDataField
            label="Documento de Identidad (DNI)"
            value={perfil.dni}
          />
          <ProfileDataField
            label="Fecha de Nacimiento"
            value={perfil.fecha_nacimiento}
          />
          <ProfileDataField label="RUC Personal" value={perfil.ruc} />
          <ProfileDataField
            label="Carnet de Extranjería"
            value={perfil.carnet_extranjeria}
          />
          <ProfileDataField label="Pasaporte" value={perfil.pasaporte} />
        </ProfileSection>

        {/* SECCIÓN LABORAL */}
        <ProfileSection title="Información Laboral">
          <ProfileDataField
            label="Empresa / Institución"
            value={perfil.empresa_nombre || "Corporativo"}
          />
          <ProfileDataField
            label="RUC de la Empresa"
            value={perfil.empresa_ruc}
          />
          <ProfileDataField
            label="Área o Departamento"
            value={perfil.nombre_area}
          />
          <ProfileDataField
            label="Cargo Desempeñado"
            value={perfil.nombre_cargo}
          />
          <ProfileDataField
            label="Nivel de Acceso (Rol)"
            value={perfil.nombre_rol}
          />
        </ProfileSection>
      </Stack>
    </div>
  );
};
