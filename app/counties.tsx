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

export default function CountiesScreen() {
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
              <Ionicons name="map" size={28} color="#059669" />
            </View>
            <Text style={styles.title}>Counties</Text>
            <Text style={styles.subtitle}>Learn about Kenya's 47 county governments</Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.paragraph}>
            Kenya is divided into 47 counties, each with its own government as established by the Constitution of Kenya 2010. This system of devolution was created to bring services and decision-making closer to the people and ensure equitable development across all regions.
          </Text>
          
          <Text style={styles.paragraph}>
            Each county is headed by a Governor who serves as the chief executive, elected directly by the people of that county. The Governor works alongside a Deputy Governor and a County Executive Committee to implement policies and manage county affairs.
          </Text>
          
          <Text style={styles.paragraph}>
            County Assemblies serve as the legislative arm of county governments. They are responsible for making laws, approving budgets, and providing oversight of the county executive. Each county assembly is composed of elected and nominated members representing various wards.
          </Text>
          
          <Text style={styles.paragraph}>
            Counties are responsible for key services including healthcare delivery through county hospitals and health centers. They manage agricultural development programs, county roads and transport infrastructure, and early childhood education facilities.
          </Text>
          
          <Text style={styles.paragraph}>
            Trade and business licensing is handled at the county level, making it easier for entrepreneurs to obtain necessary permits and operate legally within their localities. Each county has its own revenue collection systems and business regulatory framework.
          </Text>
          
          <Text style={styles.paragraph}>
            Nairobi City County serves as the capital and is the most populous county with over four million residents. It's the economic hub of the country and hosts major government offices, international organizations, and business headquarters.
          </Text>
          
          <Text style={styles.paragraph}>
            Mombasa County is Kenya's coastal city and a major tourism destination. The county government works to manage beaches, promote tourism, and maintain the port city's infrastructure which is vital for international trade and commerce.
          </Text>
          
          <Text style={styles.paragraph}>
            Counties receive funding from the national government through equitable share allocations based on population, poverty levels, land area, and other factors. They also generate their own revenue through various fees, licenses, and property taxes.
          </Text>
          
          <Text style={styles.paragraph}>
            The Council of Governors provides a forum for consultation among county governments and coordination with the national government. This body helps resolve intergovernmental disputes and promotes best practices in county governance.
          </Text>
          
          <Text style={styles.paragraph}>
            Citizens can participate in county governance through public participation forums, budget hearings, and by engaging with their ward representatives. Active citizen involvement is essential for accountable and responsive county governments that truly serve the people.
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
    backgroundColor: '#ECFDF5',
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