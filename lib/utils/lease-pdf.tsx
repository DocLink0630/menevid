import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: "Helvetica" },
  header: { marginBottom: 30, textAlign: "center" },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
  subtitle: { fontSize: 12, color: "#666" },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 13, fontWeight: "bold", marginBottom: 8, borderBottom: "1 solid #ccc", paddingBottom: 4 },
  row: { flexDirection: "row", marginBottom: 4 },
  label: { width: 140, color: "#666" },
  value: { flex: 1 },
  signatures: { marginTop: 60, flexDirection: "row", justifyContent: "space-between" },
  sigBlock: { width: "40%", borderTop: "1 solid #000", paddingTop: 8, textAlign: "center" },
});

type LeasePDFProps = {
  propertyName: string;
  unitNumber: string | null;
  tenantName: string;
  tenantNic: string | null;
  tenantPhone: string | null;
  tenantEmail: string | null;
  startDate: string;
  endDate: string;
  rentAmount: string;
  depositAmount: string;
  paymentDueDay: number;
  paymentFrequency: string;
};

export function LeaseAgreementPDF({
  propertyName,
  unitNumber,
  tenantName,
  tenantNic,
  tenantPhone,
  tenantEmail,
  startDate,
  endDate,
  rentAmount,
  depositAmount,
  paymentDueDay,
  paymentFrequency,
}: LeasePDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Menavid Realtors</Text>
          <Text style={styles.subtitle}>Lease Agreement</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Property Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Property:</Text>
            <Text style={styles.value}>{propertyName}</Text>
          </View>
          {unitNumber ? (
            <View style={styles.row}>
              <Text style={styles.label}>Unit Number:</Text>
              <Text style={styles.value}>{unitNumber}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tenant Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{tenantName}</Text>
          </View>
          {tenantNic ? (
            <View style={styles.row}>
              <Text style={styles.label}>NIC/Passport:</Text>
              <Text style={styles.value}>{tenantNic}</Text>
            </View>
          ) : null}
          {tenantPhone ? (
            <View style={styles.row}>
              <Text style={styles.label}>Phone:</Text>
              <Text style={styles.value}>{tenantPhone}</Text>
            </View>
          ) : null}
          {tenantEmail ? (
            <View style={styles.row}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{tenantEmail}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lease Terms</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Lease Period:</Text>
            <Text style={styles.value}>{startDate} to {endDate}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Rent Amount:</Text>
            <Text style={styles.value}>LKR {rentAmount}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Deposit:</Text>
            <Text style={styles.value}>LKR {depositAmount}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Payment Frequency:</Text>
            <Text style={styles.value}>{paymentFrequency}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Payment Due Day:</Text>
            <Text style={styles.value}>Day {paymentDueDay} of the period</Text>
          </View>
        </View>

        <View style={styles.signatures}>
          <View style={styles.sigBlock}>
            <Text>Tenant Signature</Text>
            <Text>{tenantName}</Text>
          </View>
          <View style={styles.sigBlock}>
            <Text>Menavid Realtors</Text>
            <Text>Authorized Signatory</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
