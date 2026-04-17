import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import dayjs from "dayjs";
import { formatNumber } from "../../../shared/functions/formatNumber";
import type {
  RES_Cotizacion,
  RES_CotizacionDetalle,
} from "../service/cotizaciones.responses";

interface CotizacionData {
  cotizacion: RES_Cotizacion;
  detalles: RES_CotizacionDetalle[];
  empresas?: string[]; // Nombres de las empresas compradoras
}

interface CotizacionPDFProps {
  cotizaciones: CotizacionData[];
}

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    color: "#18181b", // zinc-900
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#3f3f46", // zinc-700
    paddingBottom: 10,
  },
  companyInfo: {
    flexDirection: "column",
  },
  poTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#6366f1", // indigo-500
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    backgroundColor: "#f4f4f5", // zinc-100
    padding: 4,
    marginBottom: 5,
    textTransform: "uppercase",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e4e4e7", // zinc-200
    paddingVertical: 5,
    alignItems: "center",
  },
  tableHeader: {
    backgroundColor: "#27272a", // zinc-800
    color: "#ffffff",
    fontWeight: "bold",
  },
  col0: { width: "5%", textAlign: "center" },
  col1: { width: "10%", textAlign: "center" },
  col2: { width: "10%", textAlign: "center" },
  col3: { width: "45%", textAlign: "left", paddingLeft: 5 },
  col4: { width: "15%", textAlign: "right", paddingRight: 5 },
  col5: { width: "15%", textAlign: "right", paddingRight: 5 },
  totalsContainer: {
    marginTop: 20,
    alignSelf: "flex-end",
    width: "40%",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  totalLabel: {
    fontWeight: "bold",
  },
  grandTotal: {
    marginTop: 5,
    borderTopWidth: 2,
    borderTopColor: "#6366f1",
    paddingTop: 5,
    fontSize: 12,
    color: "#6366f1",
  },
  signatureSection: {
    marginTop: 40,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signatureBox: {
    width: "30%",
    alignItems: "center",
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: "#18181b",
    width: "100%",
    marginBottom: 5,
  },
  signatureName: {
    fontSize: 8,
    fontWeight: "bold",
    textAlign: "center",
  },
  signatureRole: {
    fontSize: 7,
    color: "#71717a",
    textAlign: "center",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: "center",
    color: "#71717a", // zinc-500
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: "#e4e4e7",
    paddingTop: 10,
  },
});

export const CotizacionPDF = ({ cotizaciones }: CotizacionPDFProps) => {
  return (
    <Document
      title={
        cotizaciones.length === 1
          ? `Cotización - ${cotizaciones[0].cotizacion.correlativo}`
          : "Cotizaciones por Comparativo"
      }
    >
      {cotizaciones.map(({ cotizacion, detalles, empresas }) => {
        const symbol = cotizacion.moneda === "Soles" ? "S/." : "$";

        return (
          <Page key={cotizacion.id} size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
              <View style={[styles.companyInfo, { flex: 1 }]}>
                <Text
                  style={{ fontSize: 13, fontWeight: 700, color: "#18181b" }}
                >
                  {(empresas && empresas.length > 0 ? empresas.join(" - ") : "BLACK SILVER S.A.C.").toUpperCase()}
                </Text>
                <View style={{ marginTop: 10, flexDirection: 'row', gap: 10 }}>
                   {/* Espacio reservado o info extra si se requiere luego */}
                </View>
              </View>
              <View style={{ alignItems: "flex-end", flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 15 }}>
                  <Text style={{ fontSize: 9, marginBottom: 2 }}>
                    Fecha: {dayjs(cotizacion.fecha_hora_cotizacion).format("DD/MM/YYYY")}
                  </Text>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.poTitle}>COTIZACIÓN</Text>
                    <Text style={{ fontSize: 14, fontWeight: "bold" }}>
                      N° {cotizacion.correlativo}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Info Proveedor y Pago */}
            <View style={{ flexDirection: "row", marginBottom: 20 }}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.sectionTitle}>Proveedor</Text>
                <Text style={{ fontWeight: 700 }}>
                  {cotizacion.proveedor_nombre}
                </Text>
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.sectionTitle}>Condiciones de Pago</Text>
                <Text>Método: {cotizacion.metodo_pago}</Text>
                <Text>Moneda: {cotizacion.moneda}</Text>
                {cotizacion.metodo_pago === "Crédito" && cotizacion.fecha_vencimiento_pago && (
                  <Text style={{ fontWeight: 700, color: "#ef4444" }}>
                    Fecha de Vencimiento:{" "}
                    {dayjs(cotizacion.fecha_vencimiento_pago).format(
                      "DD/MM/YYYY",
                    )}
                  </Text>
                )}
              </View>
            </View>

            {/* Tabla de Productos */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Detalle de Productos</Text>

              {/* Header Tabla */}
              <View style={[styles.row, styles.tableHeader]}>
                <Text style={styles.col0}>#</Text>
                <Text style={styles.col1}>Cant.</Text>
                <Text style={styles.col2}>U.M.</Text>
                <Text style={styles.col3}>Descripción</Text>
                <Text style={styles.col4}>P. Unit.</Text>
                <Text style={styles.col5}>Total</Text>
              </View>

              {/* Filas */}
              {detalles.map((det, idx) => (
                <View key={det.id} style={styles.row}>
                  <Text style={styles.col0}>{idx + 1}</Text>
                  <Text style={styles.col1}>{formatNumber(det.cantidad)}</Text>
                  <Text style={styles.col2}>{det.unidad_medida_abv}</Text>
                  <View style={styles.col3}>
                    <Text style={{ fontWeight: 600 }}>
                      {det.producto_nombre}
                    </Text>
                    {det.comentario && (
                      <Text
                        style={{
                          fontSize: 8,
                          color: "#71717a",
                        }}
                      >
                        Obs: {det.comentario}
                      </Text>
                    )}
                  </View>
                  <Text style={styles.col4}>
                    {symbol} {formatNumber(det.precio_unitario)}
                  </Text>
                  <Text style={styles.col5}>
                    {symbol} {formatNumber(det.cantidad * det.precio_unitario)}
                  </Text>
                </View>
              ))}
            </View>

            {/* Totales */}
            <View style={styles.totalsContainer}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal:</Text>
                <Text>
                  {symbol} {formatNumber(cotizacion.total_antes_igv)}
                </Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>
                  IGV ({cotizacion.porcentaje_igv}%):
                </Text>
                <Text>
                  {symbol} {formatNumber(cotizacion.monto_igv)}
                </Text>
              </View>
              <View style={[styles.totalRow, styles.grandTotal]}>
                <Text style={{ fontWeight: 700 }}>TOTAL:</Text>
                <Text style={{ fontWeight: 700 }}>
                  {symbol} {formatNumber(cotizacion.total_despues_igv)}
                </Text>
              </View>
            </View>

            {/* Firmas */}
            <View style={{ marginTop: 30 }}>
              <Text style={styles.sectionTitle}>Autorizado por:</Text>
              <View style={styles.signatureSection}>
                <View style={styles.signatureBox}>
                  <View style={styles.signatureLine} />
                  <Text style={styles.signatureName}>Rosa Maria Henriquez Acosta</Text>
                  <Text style={styles.signatureRole}>Gerencia</Text>
                </View>
                <View style={styles.signatureBox}>
                  <View style={styles.signatureLine} />
                  <Text style={styles.signatureName}>Carlos Avalos</Text>
                  <Text style={styles.signatureRole}>Area Logistica</Text>
                </View>
                <View style={{ width: "30%" }} />
              </View>
            </View>

            <View style={{ marginTop: 40 }}>
              <Text style={styles.sectionTitle}>Elaborado por:</Text>
              <View style={styles.signatureSection}>
                <View style={styles.signatureBox}>
                  <View style={styles.signatureLine} />
                  <Text style={styles.signatureName}>Ana Haro Culquitante</Text>
                  <Text style={styles.signatureRole}>Area Contable</Text>
                </View>
                <View style={{ flex: 1 }} />
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text>
                Este documento es un reporte de Cotización de Black Silver
                S.A.C.
              </Text>
              <Text>
                Generado automáticamente el{" "}
                {dayjs().format("DD/MM/YYYY HH:mm:ss")}
              </Text>
            </View>
          </Page>
        );
      })}
    </Document>
  );
};
