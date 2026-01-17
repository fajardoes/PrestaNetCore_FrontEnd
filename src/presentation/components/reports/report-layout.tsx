import type { ReactNode } from 'react'
import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer'

export interface ReportLayoutProps {
  title: string
  subtitle?: string
  organizationName?: string
  logoUrl?: string
  children: ReactNode
  showPrintMetadata?: boolean
  orientation?: 'portrait' | 'landscape'
}

export const ReportLayout = ({
  title,
  subtitle,
  organizationName,
  logoUrl,
  children,
  showPrintMetadata = true,
  orientation = 'portrait',
}: ReportLayoutProps) => {
  const printedAt = new Date().toLocaleString('es-HN', {
    hour12: false,
  })

  return (
    <Document>
      <Page size="A4" orientation={orientation} style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {logoUrl ? <Image src={logoUrl} style={styles.logo} /> : null}
            <View style={styles.headerTitles}>
              {organizationName ? (
                <Text style={styles.organization}>{organizationName}</Text>
              ) : null}
              <Text style={styles.title}>{title}</Text>
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
          </View>
        </View>

        <View style={styles.content}>{children}</View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {showPrintMetadata
              ? `PrestaNet | Impresion ${printedAt}`
              : 'PrestaNet'}
          </Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) =>
              `Pagina ${pageNumber} de ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  )
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 36,
    paddingHorizontal: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#0f172a',
  },
  header: {
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 56,
    height: 56,
    marginRight: 12,
    objectFit: 'contain',
  },
  headerTitles: {
    flexGrow: 1,
  },
  organization: {
    fontSize: 9,
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: 700,
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 10,
    color: '#475569',
    marginTop: 2,
  },
  content: {
    flexGrow: 1,
  },
  footer: {
    marginTop: 16,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 8,
    color: '#64748b',
  },
})
