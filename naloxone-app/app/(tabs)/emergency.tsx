import React from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getOrCreateAlertDeviceId, sendEmergencyAlert } from '@/services/alerting/client';

async function getBestAvailablePosition() {
  const lastKnown = await Location.getLastKnownPositionAsync();
  if (lastKnown) {
    return lastKnown;
  }

  return Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
}

export default function EmergencyScreen() {
  const insets = useSafeAreaInsets();
  const [alertStatus, setAlertStatus] = React.useState<string | null>(null);
  const [isSendingAlert, setIsSendingAlert] = React.useState(false);

  const handleAlertNearbyResponders = async () => {
    if (isSendingAlert) {
      return;
    }

    setIsSendingAlert(true);
    setAlertStatus(null);

    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        setAlertStatus('Location permission is needed to alert nearby kit holders.');
        return;
      }

      const current = await getBestAvailablePosition();
      if (!current) {
        setAlertStatus('Could not get your location. Try again in a few seconds.');
        return;
      }

      const deviceId = await getOrCreateAlertDeviceId();
      const result = await sendEmergencyAlert({
        senderDeviceId: deviceId,
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
      });

      if (result.matched_count > 0) {
        setAlertStatus(`Alert sent to ${result.matched_count} nearby responder(s).`);
      } else {
        setAlertStatus('Alert sent, but no nearby responders are currently active.');
      }
    } catch {
      setAlertStatus('Unable to send alert right now. Check server connection and try again.');
    } finally {
      setIsSendingAlert(false);
    }
  };

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

          <Pressable
            style={[styles.alertNearbyButton, isSendingAlert && styles.alertNearbyButtonDisabled]}
            onPress={() => {
              void handleAlertNearbyResponders();
            }}
            disabled={isSendingAlert}
          >
            <View style={styles.alertNearbyIconContainer}>
              <Feather name="bell" size={18} color="#ffffff" />
            </View>
            <View style={styles.alertNearbyTextWrap}>
              <Text style={styles.alertNearbyTitle}>Alert nearby kits holders</Text>
              <Text style={styles.alertNearbySubtitle}>
                {isSendingAlert ? 'Sending alert...' : 'Send your location to nearby active responders'}
              </Text>
            </View>
          </Pressable>

          {alertStatus ? <Text style={styles.alertStatusText}>{alertStatus}</Text> : null}
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

        <View style={styles.naloxoneCard}>
          <View style={styles.naloxoneHeader}>
            <Feather name="book-open" size={22} color="#14213D" />
            <Text style={styles.naloxoneHeaderTitle}>How to Give Naloxone</Text>
          </View>

          <View style={styles.naloxoneBody}>
            <Text style={styles.naloxoneSubtitle}>Nasal Spray Instructions</Text>

            <View style={styles.naloxoneStepRow}>
              <View style={styles.naloxoneStepBadge}>
                <Text style={styles.naloxoneStepBadgeText}>1</Text>
              </View>
              <View style={styles.naloxoneStepTextWrap}>
                <Text style={styles.naloxoneStepTitle}>Position the person</Text>
                <Text style={styles.naloxoneStepDescription}>Lay person on back, tilt head back slightly</Text>
              </View>
            </View>

            <View style={styles.naloxoneStepRow}>
              <View style={styles.naloxoneStepBadge}>
                <Text style={styles.naloxoneStepBadgeText}>2</Text>
              </View>
              <View style={styles.naloxoneStepTextWrap}>
                <Text style={styles.naloxoneStepTitle}>Prepare the spray</Text>
                <Text style={styles.naloxoneStepDescription}>Remove spray from package, do not test it</Text>
              </View>
            </View>

            <View style={styles.naloxoneStepRow}>
              <View style={styles.naloxoneStepBadge}>
                <Text style={styles.naloxoneStepBadgeText}>3</Text>
              </View>
              <View style={styles.naloxoneStepTextWrap}>
                <Text style={styles.naloxoneStepTitle}>Administer naloxone</Text>
                <Text style={styles.naloxoneStepDescription}>Insert tip into one nostril, press plunger firmly</Text>
              </View>
            </View>

            <View style={styles.naloxoneStepRow}>
              <View style={styles.naloxoneStepBadge}>
                <Text style={styles.naloxoneStepBadgeText}>4</Text>
              </View>
              <View style={styles.naloxoneStepTextWrap}>
                <Text style={styles.naloxoneStepTitle}>Wait and repeat if needed</Text>
                <Text style={styles.naloxoneStepDescription}>
                  If no response after 2-3 minutes, give 2nd dose in other nostril
                </Text>
              </View>
            </View>

            <View style={styles.naloxoneImportantBox}>
              <Feather name="alert-circle" size={20} color="#DE6F2A" style={styles.naloxoneImportantIcon} />
              <Text style={styles.naloxoneImportantText}>
                <Text style={styles.naloxoneImportantStrong}>Important:</Text> Naloxone is safe. It only works on
                opioid overdoses and will not harm someone if they are not overdosing.
              </Text>
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
  alertNearbyButton: {
    marginTop: 10,
    backgroundColor: '#1d4ed8',
    borderRadius: 6,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  alertNearbyButtonDisabled: {
    opacity: 0.7,
  },
  alertNearbyIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: '#1e40af',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertNearbyTextWrap: {
    flex: 1,
  },
  alertNearbyTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  alertNearbySubtitle: {
    color: '#dbeafe',
    fontSize: 12,
    marginTop: 2,
  },
  alertStatusText: {
    marginTop: 8,
    color: '#fff7ed',
    fontSize: 12,
    lineHeight: 18,
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
  naloxoneCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#D7A25E',
    backgroundColor: '#E9D6C6',
  },
  naloxoneHeader: {
    backgroundColor: '#D7A25E',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  naloxoneHeaderTitle: {
    color: '#14213D',
    fontSize: 35 / 2,
    fontWeight: '700',
  },
  naloxoneBody: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: 14,
  },
  naloxoneSubtitle: {
    color: '#111827',
    fontSize: 38 / 2,
    fontWeight: '700',
    marginBottom: 2,
  },
  naloxoneStepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  naloxoneStepBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#E07933',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  naloxoneStepBadgeText: {
    color: '#FFFFFF',
    fontSize: 17 / 2,
    fontWeight: '700',
  },
  naloxoneStepTextWrap: {
    flex: 1,
  },
  naloxoneStepTitle: {
    color: '#111827',
    fontSize: 35 / 2,
    fontWeight: '700',
  },
  naloxoneStepDescription: {
    color: '#25324B',
    fontSize: 34 / 2,
    marginTop: 2,
    lineHeight: 26,
  },
  naloxoneImportantBox: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#DE9B66',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    gap: 10,
  },
  naloxoneImportantIcon: {
    marginTop: 2,
  },
  naloxoneImportantText: {
    flex: 1,
    color: '#0F172A',
    fontSize: 35 / 2,
    lineHeight: 28,
  },
  naloxoneImportantStrong: {
    fontWeight: '700',
  },
});
