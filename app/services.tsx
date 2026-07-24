import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ServicesScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.iconContainer}>
              <Ionicons name="business" size={28} color="#0891B2" />
            </View>
            <Text style={styles.title}>Government Services</Text>
            <Text style={styles.subtitle}>Access essential government services and information</Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.paragraph}>
            The Kenyan government provides a wide range of services to its citizens through various ministries, departments, and agencies. These services are designed to meet the needs of the public and improve the quality of life for all Kenyans across the country.
          </Text>
          
          <Text style={styles.paragraph}>
            Through the eCitizen portal, citizens can access over 5,000 government services online without having to visit government offices physically. This digital platform has revolutionized service delivery and made it easier for Kenyans to access important documents and permits.
          </Text>
          
          <Text style={styles.paragraph}>
            Passport applications and renewals can now be completed online through the Department of Immigration Services. Citizens can fill out forms, upload required documents, make payments, and schedule appointments all from the comfort of their homes or offices.
          </Text>
          
          <Text style={styles.paragraph}>
            Business registration services are available through the Business Registration Service portal. Entrepreneurs can register their companies, search for business names, and obtain certificates of incorporation entirely online, reducing the time and cost of starting a business.
          </Text>
          
          <Text style={styles.paragraph}>
            The National Transport and Safety Authority provides services related to driving licenses, vehicle registration, and public transport regulation. Citizens can apply for and renew driving licenses through the NTSA portal without visiting their offices.
          </Text>
          
          <Text style={styles.paragraph}>
            Healthcare services are provided through public hospitals and health centers across all counties. The government is working to ensure universal health coverage through programs like the National Health Insurance Fund that aims to make healthcare accessible and affordable for all.
          </Text>
          
          <Text style={styles.paragraph}>
            Land registration and management services are available through the Ministry of Lands. Citizens can conduct land searches, register property transactions, and obtain title deeds to secure their property rights and investments.
          </Text>
          
          <Text style={styles.paragraph}>
            The Kenya Revenue Authority provides tax-related services including tax registration, filing returns, and making payments. The iTax platform allows individuals and businesses to manage their tax obligations conveniently online.
          </Text>
          
          <Text style={styles.paragraph}>
            Social protection services including cash transfer programs for vulnerable populations, pensions for senior citizens, and support for persons with disabilities are coordinated through the Ministry of Social Protection.
          </Text>
          
          <Text style={styles.paragraph}>
            To access these services, citizens need to create an eCitizen account and follow the specific requirements for each service. Most services require basic documents such as national ID, KRA PIN, and recent passport photos for identification purposes.
          </Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  header: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingBottom: 8,
    marginBottom: 8,
  },
  headerContent: {
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#ECFEFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    lineHeight: 20,
  },
  content: {
    marginTop: 16,
  },
  paragraph: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 24,
    marginBottom: 16,
  },
  bottomSpacer: {
    height: 40,
  },
});