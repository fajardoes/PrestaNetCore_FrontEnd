import type { ReactNode } from 'react'
import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer'

import defaultReportLogo from '../../../assets/logo_light.png'
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
  const resolvedLogoUrl = logoUrl || defaultReportLogo

  return (
    <Document>
      <Page size="A4" orientation={orientation} style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerTitles}>
              <Text style={styles.title}>{title}</Text>
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
          </View>
          <View style={styles.headerBrand}>
            <Image src={resolvedLogoUrl} style={styles.logo} />
            {organizationName ? (
              <Text style={styles.organization}>{organizationName}</Text>
            ) : null}
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
    paddingTop: 28,
    paddingBottom: 36,
    paddingHorizontal: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#0f172a',
  },
  header: {
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerLeft: {
    flex: 1,
    paddingRight: 16,
  },
  headerTitles: {
    flexGrow: 1,
  },
  headerBrand: {
    width: 92,
    alignItems: 'center',
  },
  logo: {
    width: 52,
    height: 52,
    objectFit: 'contain',
  },
  organization: {
    fontSize: 9,
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    marginTop: 4,
    textAlign: 'center',
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
