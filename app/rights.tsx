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

export default function RightsScreen() {
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
              <Ionicons name="shield-checkmark" size={28} color="#2563EB" />
            </View>
            <Text style={styles.title}>Your Rights</Text>
            <Text style={styles.subtitle}>Know your fundamental rights as a Kenyan citizen</Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.paragraph}>
            Every Kenyan citizen is entitled to fundamental rights and freedoms as enshrined in the Constitution of Kenya 2010. These rights are the foundation of our democracy and protect every individual regardless of their background, beliefs, or status in society.
          </Text>
          
          <Text style={styles.paragraph}>
            The right to life is the most basic and fundamental right protected under Article 26 of the Constitution. Every person has the right to life and no one shall be arbitrarily deprived of their life. This right forms the basis for all other rights and freedoms that citizens enjoy.
          </Text>
          
          <Text style={styles.paragraph}>
            Freedom of expression is guaranteed under Article 33, allowing every person to seek, receive, and impart information and ideas. This right is essential for the functioning of a democratic society and enables citizens to participate fully in public discourse and decision-making processes.
          </Text>
          
          <Text style={styles.paragraph}>
            The right to access information held by the State is protected under Article 35. This empowers citizens to hold the government accountable and promotes transparency in public affairs. Every citizen has the right to request and receive information from public bodies without having to demonstrate a specific interest.
          </Text>
          
          <Text style={styles.paragraph}>
            Economic and social rights are also protected, including the right to healthcare, education, housing, and clean water. The government has a responsibility to take legislative and policy measures to progressively realize these rights for all Kenyans.
          </Text>
          
          <Text style={styles.paragraph}>
            The right to equality and freedom from discrimination is guaranteed under Article 27. Every person is equal before the law and has the right to equal protection and benefit of the law. The State shall not discriminate against anyone on grounds such as race, sex, pregnancy, marital status, or ethnic origin.
          </Text>
          
          <Text style={styles.paragraph}>
            Freedom of association allows citizens to form and join groups, including trade unions and political parties. This right is crucial for collective action and enables individuals to pursue common interests and advocate for their rights together.
          </Text>
          
          <Text style={styles.paragraph}>
            The right to privacy is protected under Article 31, ensuring that individuals have control over their personal information and private lives. This includes protection against searches of their person, home, or property without just cause.
          </Text>
          
          <Text style={styles.paragraph}>
            If your rights are violated, you have the right to seek legal redress through the courts. The Constitution provides mechanisms for enforcement of rights, and any person can institute court proceedings claiming that a right has been denied, violated, or threatened.
          </Text>
          
          <Text style={styles.paragraph}>
            Understanding your rights is the first step toward protecting them. As a citizen, it's important to stay informed about constitutional provisions and to actively participate in protecting not only your rights but the rights of others in your community.
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
    backgroundColor: '#EFF6FF',
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