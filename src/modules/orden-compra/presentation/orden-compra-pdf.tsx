import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import dayjs from "dayjs";
import { formatNumber } from "../../../shared/functions/formatNumber";
import { MONEDAS } from "../../../shared/variables/monedas";
import type { RES_OrdenCompra, RES_OrdenCompraDetalle } from "../service/orden-compra.responses";

interface OrdenCompraPDFProps {
  orden: RES_OrdenCompra;
  detalles: RES_OrdenCompraDetalle[];
}

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    color: "#18181b",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#14532d",
    paddingBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: "#16a34a",
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    backgroundColor: "#f0fdf4",
    padding: 3,
    marginBottom: 5,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e4e4e7",
    paddingVertical: 5,
    alignItems: "center",
  },
  tableHeader: {
    backgroundColor: "#14532d",
    color: "#ffffff",
    fontWeight: 700,
  },
  col0: { width: "5%",  textAlign: "center" },
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
  grandTotal: {
    marginTop: 5,
    borderTopWidth: 2,
    borderTopColor: "#16a34a",
    paddingTop: 5,
    fontSize: 12,
    color: "#16a34a",
  },
  signatureSection: {
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 50,
  },
  signatureBox: {
    width: "40%",
    alignItems: "center",
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: "#18181b",
    width: "100%",
    marginBottom: 5,
  },
  signatureName: { fontSize: 10, fontWeight: 700, textAlign: "center" },
  signatureRole: { fontSize: 10, color: "#71717a", textAlign: "center" },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: "center",
    color: "#71717a",
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: "#e4e4e7",
    paddingTop: 10,
  },
});

export const OrdenCompraPDF = ({ orden, detalles }: OrdenCompraPDFProps) => {
  const symbol = Object.values(MONEDAS).find((m) => m.label === orden.moneda)?.symbol ?? "S/";

  return (
    <Document title={`Orden de Compra - ${orden.correlativo}`}>
      <Page size="A4" style={styles.page}>

        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, fontWeight: 700, color: "#18181b" }}>
              {orden.empresa_nombre.toUpperCase()}
            </Text>
            {orden.empresa_ruc && (
              <Text style={{ fontSize: 9, color: "#52525b", marginTop: 2 }}>
                RUC: {orden.empresa_ruc}
              </Text>
            )}
          </View>
          <View style={{ alignItems: "flex-end", flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
              <Text style={{ fontSize: 9, marginBottom: 2, marginRight: 10 }}>
                Fecha: {dayjs(orden.fecha_hora_orden).format("DD/MM/YYYY")}
              </Text>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.title}>ORDEN DE COMPRA</Text>
                <Text style={{ fontSize: 14, fontWeight: 700 }}>
                  N° {orden.correlativo}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Proveedor / Emisión */}
        <View style={{ flexDirection: "row", marginBottom: 20 }}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={styles.sectionTitle}>EMITIR FACTURA A NOMBRE DE:</Text>
            <Text style={{ fontWeight: 700 }}>{orden.empresa_nombre}</Text>
            {orden.empresa_ruc && (
              <Text style={{ fontSize: 9, color: "#52525b" }}>RUC: {orden.empresa_ruc}</Text>
            )}
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.sectionTitle}>REFERENCIA</Text>
            <Text>Cotización origen: {orden.correlativo_cotizacion}</Text>
            <Text>Moneda: {orden.moneda}</Text>
            {orden.observacion && (
              <Text style={{ fontSize: 9, color: "#71717a", marginTop: 3 }}>
                Obs: {orden.observacion}
              </Text>
            )}
          </View>
        </View>

        {/* Tabla */}
        <View style={{ marginBottom: 15 }}>
          <Text style={styles.sectionTitle}>DETALLE DE PRODUCTOS</Text>
          <View style={[styles.row, styles.tableHeader]}>
            <Text style={styles.col0}>#</Text>
            <Text style={styles.col1}>Cant.</Text>
            <Text style={styles.col2}>U.M.</Text>
            <Text style={styles.col3}>Descripción</Text>
            <Text style={styles.col4}>P. Unit.</Text>
            <Text style={styles.col5}>Total</Text>
          </View>
          {detalles.map((det, idx) => {
            const hasEquivalence = det.id_unidad_medida !== det.id_unidad_medida_base;
            const subtotalItem = det.cantidad_requerida * det.precio_unitario;

            return (
              <View key={det.id} style={styles.row}>
                <Text style={styles.col0}>{idx + 1}</Text>
                <Text style={styles.col1}>{formatNumber(det.cantidad_requerida)}</Text>
                <Text style={styles.col2}>{det.unidad_medida_abv}</Text>
                <View style={styles.col3}>
                  <Text style={{ fontWeight: 700 }}>{det.producto_nombre}</Text>
                  {hasEquivalence && (
                    <Text style={{ fontSize: 8, color: "#71717a", marginTop: 2 }}>
                      Eq: {formatNumber(det.contenido_por_presentacion)} {det.unidad_medida_base_abv} x {det.unidad_medida_abv}
                    </Text>
                  )}
                </View>
                <Text style={styles.col4}>{symbol} {formatNumber(det.precio_unitario)}</Text>
                <Text style={styles.col5}>{symbol} {formatNumber(subtotalItem)}</Text>
              </View>
            );
          })}
        </View>

        {/* Totales */}
        <View style={styles.totalsContainer}>
          <View style={styles.totalRow}>
            <Text style={{ fontWeight: 700 }}>Subtotal:</Text>
            <Text>{symbol} {formatNumber(orden.total_antes_igv)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={{ fontWeight: 700 }}>IGV ({orden.porcentaje_igv}%):</Text>
            <Text>{symbol} {formatNumber(orden.monto_igv)}</Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text style={{ fontWeight: 700 }}>TOTAL:</Text>
            <Text style={{ fontWeight: 700 }}>{symbol} {formatNumber(orden.total_despues_igv)}</Text>
          </View>
        </View>

        {/* Firmas */}
        <View style={{ marginTop: 25 }}>
          <Text style={styles.sectionTitle}>AUTORIZADO POR:</Text>
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
          </View>
        </View>

        <View style={{ marginTop: 30 }}>
          <Text style={styles.sectionTitle}>ELABORADO POR:</Text>
          <View style={{ ...styles.signatureSection, justifyContent: "center" }}>
            <View style={styles.signatureBox}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureName}>Ana Haro Culquitante</Text>
              <Text style={styles.signatureRole}>Area Contable</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Este documento es una Orden de Compra oficial de Black Silver S.A.C.</Text>
          <Text>Generado automáticamente el {dayjs().format("DD/MM/YYYY HH:mm:ss")}</Text>
        </View>
      </Page>
    </Document>
  );
};
