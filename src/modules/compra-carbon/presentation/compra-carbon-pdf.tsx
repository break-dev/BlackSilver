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

interface CompraCarbonPDFProps {
  compra: {
    cabecera: CompraCarbonDetalle["cabecera"];
    detalles: DetalleCompraCarbon[];
  };
  empresa: RES_Empresa;
  nombreCreador: string;
  urlLogoEmpresa?: string | null;
}

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
    borderBottomColor: "#52525b",
    paddingBottom: 8,
  },
  companyName: {
    fontSize: 12,
    fontWeight: 700,
    color: "#18181b",
  },
  companyAddress: {
    fontSize: 8,
    color: "#64748b",
    marginTop: 2,
  },
  documentType: {
    fontSize: 18,
    fontWeight: 700,
    color: "#52525b",
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
    color: "#71717a",
    textTransform: "uppercase",
    letterSpacing: 1,
    borderLeftWidth: 3,
    borderLeftColor: "#52525b",
    paddingLeft: 6,
    marginBottom: 4,
    marginTop: 6,
  },
  infoBox: {
    backgroundColor: "#f8fafc",
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  infoBoxLabel: { fontSize: 7, color: "#64748b" },
  infoBoxValue: { fontSize: 9, fontWeight: 700, color: "#18181b" },
  tableHeader: {
    backgroundColor: "#1e293b",
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
    borderBottomColor: "#f4f4f5",
    paddingVertical: 5,
    paddingHorizontal: 6,
  },
  col0: { width: "5%", textAlign: "center" },
  col1: { width: "50%", textAlign: "left" },
  col2: { width: "15%", textAlign: "right" },
  col3: { width: "15%", textAlign: "right" },
  col4: { width: "15%", textAlign: "right" },
  totalsContainer: {
    marginTop: 10,
    alignSelf: "flex-end",
    width: "40%",
    backgroundColor: "#f8fafc",
    padding: 10,
    borderRadius: 4,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  totalLabel: { fontWeight: 700, color: "#64748b", fontSize: 9 },
  totalValue: { fontWeight: 700, fontSize: 9 },
  grandTotal: {
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#52525b",
    paddingTop: 6,
    fontSize: 11,
    color: "#27272a",
    fontWeight: 700,
  },
  observaciones: {
    marginTop: 12,
    padding: 10,
    backgroundColor: "#fef9c3",
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: "#ca8a04",
  },
  observacionesTitle: {
    fontSize: 8,
    fontWeight: 700,
    color: "#92400e",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  observacionesText: {
    fontSize: 7,
    color: "#78350f",
    lineHeight: 1.5,
  },
  signatureSection: {
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signatureBox: { width: "40%", alignItems: "center" },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: "#94a3b8",
    width: "100%",
    marginBottom: 4,
  },
  signatureName: { fontSize: 8, fontWeight: 700, textAlign: "center" },
  signatureRole: {
    fontSize: 7,
    color: "#64748b",
    textAlign: "center",
    textTransform: "uppercase",
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 30,
    right: 30,
    textAlign: "center",
    color: "#94a3b8",
    fontSize: 7,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 8,
  },
});

const formatPEN = (n: number) => `S/ ${formatNumber(n)}`;

/**
 * Bloque de observaciones: combina texto fijo con variables dinamicas que
 * dependen de la empresa seleccionada al crear la compra de carbon.
 */
const ObservacionesBlock = ({
  nombreEmpresa,
  direccion,
}: {
  nombreEmpresa: string;
  direccion: string;
}) => (
  <View style={styles.observaciones}>
    <Text style={styles.observacionesTitle}>Observaciones</Text>
    <Text style={styles.observacionesText}>
      {`1. El precio de la orden de compra es puesto en Mina y/o Parque Industrial del Carbon AV. 01 Mz.K LT 10 C.P. EL Milagro-Huanchaco-Trujillo-La Libertad, deposito de Consorcio Minero Black Silver SAC.\n`}
      {`1.1. La unidad de transporte debe llegar totalmente encarpado con lona, para evitar la contaminacion ambiental durante el trayecto del despacho.\n`}
      {`1.2. La fecha de recepcion de unidades de transporte es en horario de Lunes a domingo de 7 am a 5 pm. En caso de requerir entregar cargas fuera de horario, debe ser coordinado previamente con el personal de planta.\n`}
      {`1.3. El material transportado debe cumplir con todos los documentos legales de procedencia. La aceptacion de esta orden de compra cuenta como una declaracion jurada de que el material entregado es de legal procedencia.\n`}
      {`1.4. El material no sera de Uso Energetico.\n`}
      {`2. ${nombreEmpresa} dejara constancia de la recepcion del material a traves de sello y V°B° de la gerencia en la guia de Remision Remitente proporcionada por el proveedor, una vez sea verificado el correcto llenado de todos los datos de conformidad con la exigencia de La factura debe ser electronica y debe ser enviada via email junto al archivo XML. En caso aplique la entrega de guias de remision y transportista, estos documentos son indispensables para poder emitir el pago.\n`}
      {`2.1. La presente orden de compra tiene una tolerancia de +/- 10%.`}
    </Text>
    <Text style={[styles.observacionesText, { marginTop: 6, fontStyle: "italic" }]}>
      {`Emitida para: ${nombreEmpresa}${direccion ? ` - ${direccion}` : ""}.`}
    </Text>
  </View>
);

export const CompraCarbonPDF = ({
  compra,
  empresa,
  nombreCreador,
  urlLogoEmpresa,
}: CompraCarbonPDFProps) => {
  const { cabecera, detalles } = compra;
  const subtotalBase = detalles.reduce(
    (acc, d) => acc + Number(d.subtotal),
    0,
  );
  const igvPct = Number(cabecera.porcentaje_igv);
  const igvMonto = subtotalBase * (igvPct / 100);
  const total = Number(cabecera.total);

  return (
    <Document title={`Compra de Carbon - ${cabecera.correlativo}`}>
      <Page size="A4" style={styles.page}>
        {/* Logo + titulo */}
        {urlLogoEmpresa && (
          <View style={{ alignItems: "flex-end", marginBottom: 6 }}>
            <Image src={urlLogoEmpresa} style={{ width: 100, height: 50, objectFit: "contain" }} />
          </View>
        )}

        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1.5 }}>
            <Text style={styles.companyName}>{empresa.razon_social.toUpperCase()}</Text>
            {empresa.domicilio_fiscal && (
              <Text style={styles.companyAddress}>{empresa.domicilio_fiscal}</Text>
            )}
            <Text style={{ fontSize: 7, color: "#64748b", marginTop: 4 }}>
              Por: {empresa.razon_social} | Creado por: {nombreCreador}
            </Text>
          </View>
          <View style={{ flex: 1, alignItems: "flex-end" }}>
            <Text style={styles.documentType}>ORDEN DE COMPRA</Text>
            <Text style={styles.documentNumber}>N° {cabecera.correlativo}</Text>
            <Text style={{ fontSize: 8, color: "#64748b", marginTop: 4 }}>
              Fecha de Emision:{" "}
              {dayjs(cabecera.fecha_hora_compra).format("DD/MM/YYYY HH:mm")}
            </Text>
          </View>
        </View>

        {/* Proveedor y Receptor */}
        <View style={{ flexDirection: "row", gap: 12 }}>
          <View style={[styles.infoBox, { flex: 1 }]}>
            <Text style={styles.sectionTitle}>PROVEEDOR</Text>
            <Text style={styles.infoBoxValue}>{cabecera.proveedor}</Text>
          </View>
          <View style={[styles.infoBox, { flex: 1 }]}>
            <Text style={styles.sectionTitle}>REGISTRADO POR</Text>
            <Text style={styles.infoBoxValue}>{cabecera.empleado_registro}</Text>
          </View>
        </View>

        {/* Tabla de items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalle de la Compra</Text>
          <View style={styles.tableHeader}>
            <Text style={styles.col0}>#</Text>
            <Text style={styles.col1}>Tipo de Carbon</Text>
            <Text style={styles.col2}>Cantidad (TN)</Text>
            <Text style={styles.col3}>Precio Unit.</Text>
            <Text style={styles.col4}>Subtotal</Text>
          </View>
          {detalles.map((d, i) => (
            <View key={d.id_detalle_compra_carbon} style={styles.tableRow}>
              <Text style={styles.col0}>{i + 1}</Text>
              <View style={styles.col1}>
                <Text style={{ fontWeight: 700, fontSize: 8 }}>
                  {d.tipo_carbon_nombre}
                </Text>
                {d.tipo_carbon_codigo && (
                  <Text style={{ fontSize: 7, color: "#64748b" }}>
                    Codigo: {d.tipo_carbon_codigo}
                  </Text>
                )}
              </View>
              <Text style={styles.col2}>{formatNumber(Number(d.cantidad))}</Text>
              <Text style={styles.col3}>{formatPEN(Number(d.precio_unitario))}</Text>
              <Text style={styles.col4}>{formatPEN(Number(d.subtotal))}</Text>
            </View>
          ))}
        </View>

        {/* Totales */}
        <View style={styles.totalsContainer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Inafecta</Text>
            <Text style={styles.totalValue}>{formatPEN(0)}</Text>
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
          direccion={empresa.domicilio_fiscal ?? ""}
        />

        {/* Firmas */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureName}>{cabecera.empleado_registro}</Text>
            <Text style={styles.signatureRole}>Emitido por</Text>
          </View>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureName}>{cabecera.proveedor}</Text>
            <Text style={styles.signatureRole}>Recibido por el proveedor</Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer} fixed>
          Documento generado automaticamente por el sistema - BlackSilver
        </Text>
      </Page>
    </Document>
  );
};