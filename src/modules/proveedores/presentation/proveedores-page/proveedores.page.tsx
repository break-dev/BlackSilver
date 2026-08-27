import { Button, rem, Tabs, TextInput } from "@mantine/core";
import {
  IconBuilding,
  IconFlame,
  IconPlus,
  IconSearch,
} from "@tabler/icons-react";
import { useState } from "react";

import { useTitlePage } from "../../../../hooks/useTitlePage";
import { useProveedores } from "../../hooks/useProveedores";
import { RegistroProveedor } from "../registro-proveedor/registro-proveedor";
import { RegistroProveedorCarbon } from "../registro-proveedor-carbon/registro-proveedor-carbon";
import { CuentasBancarias } from "../cuentas-bancarias/cuentas-bancarias";
import { PersonalExternoProveedor } from "../personal-externo-proveedor/personal-externo-proveedor";
import { TiposCarbonProveedor } from "../tipos-carbon-proveedor/tipos-carbon-proveedor";
import { LugaresExtraccionProveedor } from "../lugares-extraccion-proveedor/lugares-extraccion-proveedor";
import type {
  CuentaBancariaResponse,
  LugarExtraccionResponse,
  ProveedorResponse,
  TipoCarbonProveedorResponse,
} from "../../service/proveedores.responses";
import { Proveedor } from "./components/proveedor";
import { ModalEstandar } from "../../../../presentation/utils/modal-estandar";
import { BotonRecargar } from "../../../../presentation/utils/boton-recargar";

type ModoProveedor = "logistica" | "carbon";

export const ProveedoresPage = () => {
  useTitlePage("Proveedores");
  const [modo, setModo] = useState<ModoProveedor>("logistica");
  const modoCarbon = modo === "carbon";

  const {
    proveedores,
    loading,
    insertProveedor,
    updateProveedor,
    recargar,
  } = useProveedores(modoCarbon);

  const [openRegistro, setOpenRegistro] = useState(false);
  const [selectedProveedor, setSelectedProveedor] =
    useState<ProveedorResponse | null>(null);
  const [proveedorPersonal, setProveedorPersonal] =
    useState<ProveedorResponse | null>(null);
  const [proveedorTiposCarbon, setProveedorTiposCarbon] =
    useState<ProveedorResponse | null>(null);
  const [proveedorLugares, setProveedorLugares] =
    useState<ProveedorResponse | null>(null);
  const [busqueda, setBusqueda] = useState("");

  const proveedorEnGestion =
    selectedProveedor
      ? (proveedores.find((p) => p.id_proveedor === selectedProveedor.id_proveedor) ??
        selectedProveedor)
      : null;

  const proveedorPersonalEnGestion =
    proveedorPersonal
      ? (proveedores.find(
          (p) => p.id_proveedor === proveedorPersonal.id_proveedor,
        ) ?? proveedorPersonal)
      : null;

  const proveedorTiposCarbonEnGestion =
    proveedorTiposCarbon
      ? (proveedores.find(
          (p) => p.id_proveedor === proveedorTiposCarbon.id_proveedor,
        ) ?? proveedorTiposCarbon)
      : null;

  const proveedorLugaresEnGestion =
    proveedorLugares
      ? (proveedores.find(
          (p) => p.id_proveedor === proveedorLugares.id_proveedor,
        ) ?? proveedorLugares)
      : null;

  const actualizarCuentas = (
    proveedor: ProveedorResponse,
    cuentas: CuentaBancariaResponse[],
  ): ProveedorResponse => ({
    ...proveedor,
    cuentas_bancarias: cuentas,
    cantidad_cuentas_bancarias: cuentas.length,
  });

  const handleCuentaActualizada = (cuenta: CuentaBancariaResponse) => {
    if (!selectedProveedor) return;

    const cuentasActualizadas = (selectedProveedor.cuentas_bancarias ?? []).map(
      (c) => (c.id_cuenta_bancaria === cuenta.id_cuenta_bancaria ? cuenta : c),
    );

    updateProveedor(
      selectedProveedor.id_proveedor,
      actualizarCuentas(selectedProveedor, cuentasActualizadas),
    );
  };

  const handleCuentaAgregada = (cuenta: CuentaBancariaResponse) => {
    if (!selectedProveedor) return;

    const cuentasActualizadas = [
      cuenta,
      ...(selectedProveedor.cuentas_bancarias ?? []),
    ];

    updateProveedor(
      selectedProveedor.id_proveedor,
      actualizarCuentas(selectedProveedor, cuentasActualizadas),
    );
  };

  const handleTiposCarbonGuardados = (
    proveedor: ProveedorResponse,
    tipos: TipoCarbonProveedorResponse[],
  ) => {
    updateProveedor(proveedor.id_proveedor, {
      cantidad_tipos_carbon: tipos.length,
      tipos_carbon: tipos,
    });
  };

  const handleLugaresGuardados = (
    proveedor: ProveedorResponse,
    lugares: LugarExtraccionResponse[],
  ) => {
    updateProveedor(proveedor.id_proveedor, {
      cantidad_lugares_extraccion: lugares.length,
      lugares_extraccion: lugares,
    });
  };

  const iconStyle = { width: rem(18), height: rem(18) };

  return (
    <div className="animate-fade-in space-y-6">
      <Tabs
        value={modo}
        onChange={(v) => setModo((v as ModoProveedor) ?? "logistica")}
        variant="pills"
        color="pink"
        classNames={{
          root: "space-y-6",
          list: "bg-zinc-950/80 p-0 rounded-[20px] border border-zinc-800 w-fit shrink-0 overflow-hidden gap-0",
          tab: "rounded-none px-8 py-3 transition-all duration-300 data-[active]:bg-pink-600! data-[active]:text-white text-zinc-400 hover:text-zinc-200 font-bold",
        }}
      >
        <div className="flex flex-col lg:flex-row gap-4 items-end justify-between">
          <div className="flex flex-col md:flex-row items-end gap-4 flex-1 w-full">
            <Tabs.List>
              <Tabs.Tab
                value="logistica"
                leftSection={<IconBuilding style={iconStyle} />}
              >
                Logistica
              </Tabs.Tab>
              <Tabs.Tab
                value="carbon"
                leftSection={<IconFlame style={iconStyle} />}
              >
                Carbon
              </Tabs.Tab>
            </Tabs.List>

            <TextInput
              label="Buscar Proveedor"
              placeholder="Buscar por razon social, RUC o DNI..."
              leftSection={<IconSearch size={16} className="text-zinc-400" />}
              radius="lg"
              size="sm"
              value={busqueda}
              onChange={(e) => setBusqueda(e.currentTarget.value)}
              className="flex-1 min-w-50"
              classNames={{
                label: "text-zinc-400 mb-1 font-medium",
                input:
                  "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500 transition-all h-[38px]",
              }}
            />
          </div>

          <div className="flex gap-2 items-center shrink-0 mb-px">
            <BotonRecargar onReload={recargar} loading={loading} />
            <Button
              leftSection={<IconPlus size={18} />}
              radius="lg"
              size="sm"
              onClick={() => setOpenRegistro(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20 shrink-0 h-9.5 px-8"
            >
              {modoCarbon ? "Nuevo Proveedor de Carbon" : "Nuevo Proveedor"}
            </Button>
          </div>
        </div>

        <Tabs.Panel value="logistica">
          <Proveedor
            proveedores={proveedores}
            loading={loading}
            modoCarbon={false}
            onOpenCuentas={(p) => setSelectedProveedor(p)}
            onOpenPersonal={(p) => setProveedorPersonal(p)}
          />
        </Tabs.Panel>

        <Tabs.Panel value="carbon">
          <Proveedor
            proveedores={proveedores}
            loading={loading}
            modoCarbon={true}
            onOpenCuentas={(p) => setSelectedProveedor(p)}
            onOpenPersonal={(p) => setProveedorPersonal(p)}
            onOpenTiposCarbon={(p) => setProveedorTiposCarbon(p)}
            onOpenLugaresExtraccion={(p) => setProveedorLugares(p)}
          />
        </Tabs.Panel>
      </Tabs>

      {/* Modal: Registro de Proveedor */}
      <ModalEstandar
        opened={openRegistro}
        close={() => setOpenRegistro(false)}
        title={modoCarbon ? "Nuevo Proveedor de Carbon" : "Nuevo Proveedor"}
        size="lg"
      >
        {modoCarbon ? (
          <RegistroProveedorCarbon
            onCancel={() => setOpenRegistro(false)}
            onSuccess={(p) => {
              insertProveedor(p);
              setOpenRegistro(false);
            }}
          />
        ) : (
          <RegistroProveedor
            onCancel={() => setOpenRegistro(false)}
            onSuccess={(p) => {
              insertProveedor(p);
              setOpenRegistro(false);
            }}
          />
        )}
      </ModalEstandar>

      {/* Modal: Gestión de Cuentas Bancarias */}
      <ModalEstandar
        opened={!!selectedProveedor}
        close={() => setSelectedProveedor(null)}
        title={
          proveedorEnGestion
            ? `Cuentas Bancarias: ${proveedorEnGestion.razon_social}`
            : ""
        }
        size="xl"
      >
        {proveedorEnGestion && (
          <CuentasBancarias
            proveedor={proveedorEnGestion}
            onCuentaActualizada={handleCuentaActualizada}
            onCuentaAgregada={handleCuentaAgregada}
          />
        )}
      </ModalEstandar>

      {/* Modal: Personal Externo del proveedor (disponible en ambos modos) */}
      <ModalEstandar
        opened={!!proveedorPersonal}
        close={() => setProveedorPersonal(null)}
        title={
          proveedorPersonalEnGestion
            ? `Personal externo: ${proveedorPersonalEnGestion.razon_social}`
            : ""
        }
        size="lg"
      >
        {proveedorPersonalEnGestion && (
          <PersonalExternoProveedor
            proveedor={proveedorPersonalEnGestion}
          />
        )}
      </ModalEstandar>

      {/* Modal: Tipos de carbon del proveedor (solo tab Carbon) */}
      <ModalEstandar
        opened={!!proveedorTiposCarbon}
        close={() => setProveedorTiposCarbon(null)}
        title="Tipos de carbon"
        size="md"
      >
        {proveedorTiposCarbonEnGestion && (
          <TiposCarbonProveedor
            proveedor={proveedorTiposCarbonEnGestion}
            key={proveedorTiposCarbonEnGestion.id_proveedor}
            onGuardados={(tipos) => {
              handleTiposCarbonGuardados(
                proveedorTiposCarbonEnGestion,
                tipos,
              );
              setProveedorTiposCarbon(null);
            }}
          />
        )}
      </ModalEstandar>

      {/* Modal: Lugares de extraccion del proveedor (solo tab Carbon) */}
      <ModalEstandar
        opened={!!proveedorLugares}
        close={() => setProveedorLugares(null)}
        title="Lugares de extraccion"
        size="lg"
      >
        {proveedorLugaresEnGestion && (
          <LugaresExtraccionProveedor
            proveedor={proveedorLugaresEnGestion}
            key={proveedorLugaresEnGestion.id_proveedor}
            onGuardados={(lugares) => {
              handleLugaresGuardados(proveedorLugaresEnGestion, lugares);
              setProveedorLugares(null);
            }}
          />
        )}
      </ModalEstandar>
    </div>
  );
};