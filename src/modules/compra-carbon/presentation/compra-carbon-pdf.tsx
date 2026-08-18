import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import dayjs from "dayjs";
import { formatNumber } from "../../../shared/functions/formatNumber";
import type {
  CompraCarbonDetalle,
  DetalleCompraCarbon,
} from "../service/compra-carbon.responses";
import type { RES_Empresa } from "../../../service/responses/empresa";
import type { ProveedorResponse } from "../../proveedores/service/proveedores.responses";
import {
  darkenHex,
  getPdfAccent,
  lightenHex,
} from "../../../presentation/utils/pdf/pdf-theme";

interface CompraCarbonPDFProps {
  compra: {
    cabecera: CompraCarbonDetalle["cabecera"];
    detalles: DetalleCompraCarbon[];
  };
  empresa: RES_Empresa;
  proveedor?: ProveedorResponse | null;
  urlLogoEmpresa?: string | null;
  colorPredominante?: string | null;
}

const formatPEN = (n: number) => `S/ ${formatNumber(n)}`;

/**
 * Estilos dedicados para el bloque de Observaciones. Mantenemos una paleta
 * zinc/gris independiente del accent corporativo porque es un bloque
 * semantico legal/advertencia y debe distinguirse del resto.
 */
const observacionesStyles = StyleSheet.create({
  observaciones: {
    marginTop: 12,
    padding: 10,
    backgroundColor: "#f4f4f5",
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: "#a1a1aa",
  },
  observacionesTitle: {
    fontSize: 8,
    fontWeight: 700,
    color: "#52525b",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  observacionesText: {
    fontSize: 7,
    color: "#3f3f46",
    lineHeight: 1.5,
  },
});

/**
 * Bloque de observaciones: combina texto fijo con variables dinamicas que
 * dependen de la empresa seleccionada al crear la compra de carbon.
 *
 * - `direccionFiscal`: si no existe, se renderiza como "-" en el punto 1.
 * - `nombreEmpresa`: se usa en el punto 1 (deposito de) y en el punto 2.
 */
const ObservacionesBlock = ({
  nombreEmpresa,
  direccionFiscal,
}: {
  nombreEmpresa: string;
  direccionFiscal: string;
}) => {
  const direccionTexto = direccionFiscal?.trim() ? direccionFiscal : "-";

  return (
    <View style={observacionesStyles.observaciones}>
      <Text style={observacionesStyles.observacionesTitle}>Observaciones</Text>
      <Text style={observacionesStyles.observacionesText}>
        {`1. El precio de la orden de compra es puesto en Mina y/o Parque Industrial del Carbon ${direccionTexto}, deposito de ${nombreEmpresa}.\n`}
        {`1.1. La unidad de transporte debe llegar totalmente encarpado con lona, para evitar la contaminacion ambiental durante el trayecto del despacho.\n`}
        {`1.2. La fecha de recepcion de unidades de transporte es en horario de Lunes a domingo de 7 am a 5 pm. En caso de requerir entregar cargas fuera de horario, debe ser coordinado previamente con el personal de planta.\n`}
        {`1.3. El material transportado debe cumplir con todos los documentos legales de procedencia. La aceptacion de esta orden de compra cuenta como una declaracion jurada de que el material entregado es de legal procedencia.\n`}
        {`1.4. El material no sera de Uso Energetico.\n`}
        {`2. ${nombreEmpresa} dejara constancia de la recepcion del material a traves de sello y V°B° de la gerencia en la guia de Remision Remitente proporcionada por el proveedor, una vez sea verificado el correcto llenado de todos los datos de conformidad con la exigencia de La factura debe ser electronica y debe ser enviada via email junto al archivo XML. En caso aplique la entrega de guias de remision y transportista, estos documentos son indispensables para poder emitir el pago.\n`}
        {`2.1. La presente orden de compra tiene una tolerancia de +/- 10%.`}
      </Text>
    </View>
  );
};

export const CompraCarbonPDF = ({
  compra,
  empresa,
  proveedor,
  urlLogoEmpresa,
  colorPredominante,
}: CompraCarbonPDFProps) => {
  const { cabecera, detalles } = compra;
  const subtotalBase = detalles.reduce(
    (acc, d) => acc + Number(d.subtotal),
    0,
  );
  const igvPct = Number(cabecera.porcentaje_igv);
  const igvMonto = subtotalBase * (igvPct / 100);
  const total = Number(cabecera.total);

  // Datos del proveedor: priorizamos el record completo (incluye
  // direccion + ubigeo), fallback a lo que ya viaja en cabecera.
  const proveedorNombre =
    proveedor?.razon_social?.trim() || cabecera.proveedor || "—";
  const proveedorDocumento = proveedor
    ? (proveedor.tipo_entidad === "Natural" ? proveedor.dni : proveedor.ruc)
    : cabecera.proveedor_tipo_entidad === "Natural"
      ? cabecera.proveedor_dni
      : cabecera.proveedor_ruc;
  const direccionCompleta = [
    proveedor?.direccion,
    proveedor?.departamento_nombre,
    proveedor?.provincia_nombre,
    proveedor?.distrito_nombre,
  ]
    .filter((s): s is string => !!s && s.trim().length > 0)
    .join(" - ");

  const accent = getPdfAccent(colorPredominante);
  const accentDark = darkenHex(accent, 0.3);
  const accentVeryDark = darkenHex(accent, 0.45);
  const accentSoft = lightenHex(accent, 0.55);

  const styles = StyleSheet.create({
    page: {
      paddingTop: 20,
      paddingBottom: 40,
      paddingHorizontal: 30,
      fontSize: 9,
      color: "#27272a",
      fontFamily: "Helvetica",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: accentSoft,
      paddingBottom: 8,
    },
    companyName: {
      fontSize: 12,
      fontWeight: 700,
      color: "#18181b",
    },
    companyAddress: {
      fontSize: 8,
      color: accentDark,
      marginTop: 2,
    },
    documentType: {
      fontSize: 18,
      fontWeight: 700,
      color: accent,
      textAlign: "right",
    },
    documentNumber: {
      fontSize: 12,
      fontWeight: 700,
      textAlign: "right",
      marginTop: 2,
    },
    section: { marginBottom: 12 },
    sectionTitle: {
      fontSize: 8,
      fontWeight: 700,
      color: accentVeryDark,
      textTransform: "uppercase",
      letterSpacing: 1,
      borderLeftWidth: 3,
      borderLeftColor: accent,
      paddingLeft: 6,
      marginBottom: 4,
      marginTop: 6,
    },
    infoBox: {
      backgroundColor: accentSoft,
      padding: 8,
      borderRadius: 4,
      marginBottom: 8,
    },
    infoBoxLabel: { fontSize: 7, color: accentDark },
    infoBoxValue: { fontSize: 9, fontWeight: 700, color: "#18181b" },
    tableHeader: {
      backgroundColor: accentVeryDark,
      color: "#ffffff",
      fontWeight: 700,
      fontSize: 8,
      paddingVertical: 5,
      paddingHorizontal: 6,
      flexDirection: "row",
    },
    tableRow: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: accentSoft,
      paddingVertical: 5,
      paddingHorizontal: 6,
    },
    // Tabla detalle: # | Cantidad | UM (hardcoded "TON") | Tipo de Carbon |
    //                Descripcion (slot vacio por ahora) | Precio Unit. | Importe
    col0: { width: "4%", textAlign: "center" },
    colCant: { width: "12%", textAlign: "right", paddingRight: 6 },
    colUm: { width: "6%", textAlign: "center" },
    colTipo: { width: "33%", textAlign: "left", paddingLeft: 8 },
    colDesc: { width: "14%", textAlign: "left", paddingLeft: 8 },
    colPrecio: { width: "14%", textAlign: "right", paddingRight: 6 },
    colImporte: { width: "17%", textAlign: "right", paddingRight: 4 },
    totalsContainer: {
      marginTop: 10,
      alignSelf: "flex-end",
      width: "40%",
      backgroundColor: accentSoft,
      padding: 10,
      borderRadius: 4,
    },
    totalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 2,
    },
    totalLabel: { fontWeight: 700, color: accentDark, fontSize: 9 },
    totalValue: { fontWeight: 700, fontSize: 9 },
    grandTotal: {
      marginTop: 6,
      borderTopWidth: 1,
      borderTopColor: accent,
      paddingTop: 6,
      fontSize: 11,
      color: accentVeryDark,
      fontWeight: 700,
    },
    footer: {
      position: "absolute",
      bottom: 20,
      left: 30,
      right: 30,
      textAlign: "center",
      color: accentDark,
      fontSize: 7,
      borderTopWidth: 1,
      borderTopColor: accentSoft,
      paddingTop: 8,
    },
  });

  const isCupper =
    empresa.razon_social.toUpperCase().includes("CUPPER") ||
    empresa.razon_social.toUpperCase().includes("HANNIA");

  return (
    <Document title={`Compra de Carbon - ${cabecera.correlativo}`}>
      <Page size="A4" style={styles.page}>
        {/* Cabecera: logo (izq) | domicilio fiscal (centro) | ORDEN DE COMPRA + datos (der) */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            borderBottomWidth: 1,
            borderBottomColor: accentSoft,
            paddingBottom: 8,
            marginBottom: 12,
          }}
        >
          {/* LEFT: logo */}
          <View style={{ width: 150, marginRight: 20, paddingTop: 6 }}>
            {urlLogoEmpresa && (
              <Image
                src={urlLogoEmpresa}
                style={
                  isCupper
                    ? { width: 80, height: 80, objectFit: "contain" }
                    : { width: 130, height: 50, objectFit: "contain" }
                }
              />
            )}
          </View>

          {/* CENTER: domicilio fiscal */}
          <View style={{ flex: 1, paddingHorizontal: 8, paddingTop: 6 }}>
            {empresa.domicilio_fiscal && (
              <Text
                style={{
                  fontSize: 8,
                  color: accentDark,
                  lineHeight: 1.4,
                }}
              >
                {empresa.domicilio_fiscal}
              </Text>
            )}
          </View>

          {/* RIGHT: ORDEN DE COMPRA + datos del receptor */}
          <View style={{ alignItems: "flex-end", minWidth: 220 }}>
            <Text style={styles.documentType}>ORDEN DE COMPRA</Text>
            <Text
              style={{
                fontSize: 10,
                fontWeight: 700,
                textAlign: "right",
                color: "#18181b",
                marginTop: 6,
                maxWidth: 220,
              }}
            >
              {empresa.razon_social.toUpperCase()}
            </Text>
            <Text style={{ fontSize: 9, color: accentDark, marginTop: 2 }}>
              {`RUC: ${empresa.ruc}`}
            </Text>
            <Text style={styles.documentNumber}>N° {cabecera.correlativo}</Text>
          </View>
        </View>

        {/* Proveedor */}
        <View style={[styles.infoBox, { marginBottom: 12 }]}>
          <Text style={styles.sectionTitle}>PROVEEDOR</Text>
          <Text style={styles.infoBoxValue}>{proveedorNombre}</Text>
          {proveedorDocumento && (
            <Text
              style={{ fontSize: 8, color: accentDark, marginTop: 2 }}
            >
              {cabecera.proveedor_tipo_entidad === "Natural" ||
              proveedor?.tipo_entidad === "Natural"
                ? `DNI: ${proveedorDocumento}`
                : `RUC: ${proveedorDocumento}`}
            </Text>
          )}
          {direccionCompleta && (
            <Text
              style={{ fontSize: 8, color: accentDark, marginTop: 2 }}
            >
              {direccionCompleta}
            </Text>
          )}
          {/*
            Slot "Atención:" dejado vacio a proposito. Cuando se defina el
            dato en cabecera o proveedor, basta con bindearlo aqui (no
            requiere tocar el resto del PDF).
          */}
          <Text
            style={{ fontSize: 8, color: accentDark, marginTop: 2 }}
          >
            {"Atención:"}
          </Text>
        </View>

        {/* Tabla de items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalle de la Compra</Text>
          <View style={styles.tableHeader}>
            <Text style={styles.col0}>#</Text>
            <Text style={styles.colCant}>Cantidad</Text>
            <Text style={styles.colUm}>UM</Text>
            <Text style={styles.colTipo}>Tipo de Carbon</Text>
            <Text style={styles.colDesc}>Descripcion</Text>
            <Text style={styles.colPrecio}>Precio Unit.</Text>
            <Text style={styles.colImporte}>Importe</Text>
          </View>
          {detalles.map((d, i) => (
            <View key={d.id_detalle_compra_carbon} style={styles.tableRow}>
              <Text style={styles.col0}>{i + 1}</Text>
              <Text style={styles.colCant}>{formatNumber(Number(d.cantidad))}</Text>
              <Text style={styles.colUm}>TON</Text>
              <View style={styles.colTipo}>
                <Text style={{ fontWeight: 700, fontSize: 8 }}>
                  {d.tipo_carbon_nombre}
                </Text>
                {d.tipo_carbon_codigo && (
                  <Text style={{ fontSize: 7, color: accentDark }}>
                    Codigo: {d.tipo_carbon_codigo}
                  </Text>
                )}
              </View>
              {/* Slot Descripcion: vacio a proposito hasta que el dato se defina. */}
              <Text style={styles.colDesc}> </Text>
              <Text style={styles.colPrecio}>{formatPEN(Number(d.precio_unitario))}</Text>
              <Text style={styles.colImporte}>{formatPEN(Number(d.subtotal))}</Text>
            </View>
          ))}
        </View>

        {/* Totales */}
        <View style={styles.totalsContainer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Inafecta</Text>
            {/* Valor vacio a proposito (slot reservado para uso futuro). */}
            <Text style={styles.totalValue}> </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Gravada</Text>
            <Text style={styles.totalValue}>{formatPEN(subtotalBase)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>IGV {igvPct.toFixed(2)}%</Text>
            <Text style={styles.totalValue}>{formatPEN(igvMonto)}</Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.totalValue}>{formatPEN(total)}</Text>
          </View>
        </View>

        {/* Observaciones dinamicas */}
        <ObservacionesBlock
          nombreEmpresa={empresa.razon_social}
          direccionFiscal={empresa.domicilio_fiscal ?? ""}
        />

        {/* Metadata del documento (izquierda) + slots vacios (derecha) */}
        <View
          style={{
            flexDirection: "row",
            marginTop: 12,
            marginBottom: 12,
          }}
        >
          {/* LEFT: Por / Creado / Aprobado / Fechas */}
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 8 }}>
              {`Por: ${empresa.razon_social}`}
            </Text>
            <Text style={{ fontSize: 8, marginTop: 4 }}>
              {`Creado por: ${cabecera.empleado_registro}`}
            </Text>
            <Text style={{ fontSize: 8, marginTop: 4 }}>
              {`Aprobado por: ${cabecera.empleado_aprueba ?? "—"}`}
            </Text>
            <Text style={{ fontSize: 8, marginTop: 4 }}>
              {`Fecha de emision: ${dayjs(cabecera.fecha_hora_compra).format(
                "DD/MM/YYYY HH:mm",
              )}`}
            </Text>
            {cabecera.fecha_hora_aprobacion && (
              <Text style={{ fontSize: 8, marginTop: 4 }}>
                {`Fecha de aprobacion: ${dayjs(
                  cabecera.fecha_hora_aprobacion,
                ).format("DD/MM/YYYY HH:mm")}`}
              </Text>
            )}
          </View>

          {/* RIGHT: 4 labels sin valor (slots reservados para uso futuro) */}
          <View style={{ flex: 1, paddingLeft: 24 }}>
            <Text style={{ fontSize: 8 }}>{"Proveedor:"}</Text>
            <Text style={{ fontSize: 8, marginTop: 10 }}>{"Nombre y apellido:"}</Text>
            <Text style={{ fontSize: 8, marginTop: 10 }}>{"DNI:"}</Text>
            <Text style={{ fontSize: 8, marginTop: 10 }}>{"Fecha:"}</Text>
          </View>
        </View>

        {/* Doble caja de firma + sello */}
        <View style={{ flexDirection: "row", gap: 16 }}>
          {[0, 1].map((idx) => (
            <View
              key={idx}
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: accentSoft,
                minHeight: 120,
                padding: 8,
                justifyContent: "flex-start",
              }}
            >
              <Text
                style={{
                  fontSize: 8,
                  color: accentDark,
                  textAlign: "center",
                  fontStyle: "italic",
                }}
              >
                {"Firma y Sello"}
              </Text>
            </View>
          ))}
        </View>

        {/* Etiquetas debajo de cada caja */}
        <View style={{ flexDirection: "row", gap: 16 }}>
          {[0, 1].map((idx) => (
            <View
              key={idx}
              style={{ flex: 1, alignItems: "center", marginTop: 8 }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: accentVeryDark,
                  marginTop: 6,
                  letterSpacing: 1,
                }}
              >
                {idx === 0 ? "APROBADO" : "ACEPTADA"}
              </Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <Text style={styles.footer} fixed>
          {`Documento generado automaticamente por el sistema ${empresa.razon_social}`}
        </Text>
      </Page>
    </Document>
  );
};