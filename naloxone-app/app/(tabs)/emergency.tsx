import React from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function EmergencyScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Naloxone Emergency</Text>
        <Text style={styles.headerSubtitle}>Overdose response guide</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Emergency Contacts Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Feather name="phone" size={20} color="#fff" />
            <Text style={styles.cardTitle}>Emergency Contacts</Text>
          </View>
          
          <Pressable 
            style={styles.callButton} 
            onPress={() => Linking.openURL('tel:911')}
          >
            <View style={styles.callButtonIconContainer}>
              <Feather name="phone" size={24} color="#fff" />
            </View>
            <View>
              <Text style={styles.callButtonTitle}>Call 911</Text>
              <Text style={styles.callButtonSubtitle}>Emergency Services</Text>
            </View>
          </Pressable>
        </View>

        {/* What to Do Card */}
        <View style={styles.stepsCard}>
          <View style={styles.stepsHeader}>
            <Feather name="alert-circle" size={20} color="#fff" />
            <Text style={styles.cardTitle}>If Someone is Overdosing</Text>
          </View>
          
          <View style={styles.stepsContent}>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
              <View style={styles.stepTextContainer}>
                <Text style={styles.stepTitle}>Check for signs</Text>
                <Text style={styles.stepDescription}>Unconscious, slow/no breathing, blue lips or nails</Text>
              </View>
            </View>
            
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
              <View style={styles.stepTextContainer}>
                <Text style={styles.stepTitle}>Call 911 immediately</Text>
                <Text style={styles.stepDescription}>Give exact location, stay on the line</Text>
              </View>
            </View>
            
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
              <View style={styles.stepTextContainer}>
                <Text style={styles.stepTitle}>Give naloxone</Text>
                <Text style={styles.stepDescription}>Administer nasal spray or injection if available</Text>
              </View>
            </View>
            
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>4</Text></View>
              <View style={styles.stepTextContainer}>
                <Text style={styles.stepTitle}>Turn on side (recovery position)</Text>
                <Text style={styles.stepDescription}>Keep airway clear, monitor breathing</Text>
              </View>
            </View>

            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>5</Text></View>
              <View style={styles.stepTextContainer}>
                <Text style={styles.stepTitle}>Stay until help arrives</Text>
                <Text style={styles.stepDescription}>Give 2nd dose after 2-3 min if no response</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFDFCC',
  },
  header: {
    backgroundColor: '#FC6B0F',
    padding: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff5eb',
    marginTop: 2,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: '#FC6B0F',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  callButton: {
    backgroundColor: '#ffffff',
    borderRadius: 6,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  callButtonIconContainer: {
    width: 44,
    height: 44,
    backgroundColor: '#b91c1c',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callButtonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  callButtonSubtitle: {
    fontSize: 12,
    color: '#4b5563',
  },
  stepsCard: {
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#F58E40',
    backgroundColor: '#ffffff',
  },
  stepsHeader: {
    backgroundColor: '#F58E40',
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepsContent: {
    padding: 16,
    gap: 12,
  },
  stepItem: {
    flexDirection: 'row',
    gap: 10,
  },
  stepNumber: {
    width: 24,
    height: 24,
    backgroundColor: '#FC6B0F',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepNumberText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepTextContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  stepDescription: {
    fontSize: 12,
    color: '#374151',
    marginTop: 2,
  },
});
