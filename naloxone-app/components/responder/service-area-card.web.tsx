import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import type { ResponderProfile } from '@/types/responder';

type ServiceAreaCardProps = {
  profile: ResponderProfile;
  onSaveServiceArea: (input: {
    label: string;
    radiusKm: number;
    approximateLatitude: number | null;
    approximateLongitude: number | null;
  }) => Promise<void>;
  onUseCurrentApproximateLocation: () => Promise<void>;
};

export function ServiceAreaCard({
  profile,
  onSaveServiceArea,
  onUseCurrentApproximateLocation,
}: ServiceAreaCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(profile.serviceArea.label);
  const [radiusKm, setRadiusKm] = useState(String(profile.serviceArea.radiusKm));

  const handleSave = async () => {
    await onSaveServiceArea({
      label,
      radiusKm: Number.parseFloat(radiusKm) || profile.serviceArea.radiusKm,
      approximateLatitude: profile.serviceArea.approximateLatitude,
      approximateLongitude: profile.serviceArea.approximateLongitude,
    });
    setIsEditing(false);
  };

  const hasCoordinates =
    profile.serviceArea.approximateLatitude != null && profile.serviceArea.approximateLongitude != null;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Feather name="map-pin" size={20} color="#FFFFFF" />
          <Text style={styles.headerTitle}>Service Area</Text>
        </View>
        <Pressable style={styles.editIconButton} onPress={() => setIsEditing((value) => !value)}>
          <Feather name="edit-2" size={18} color="#FFFFFF" />
        </Pressable>
      </View>

      <View style={styles.content}>
        <View style={styles.mapFallback}>
          <Feather name="map" size={22} color="#8B5E34" />
          {hasCoordinates ? (
            <Text style={styles.mapFallbackText}>
              Approximate center: {profile.serviceArea.approximateLatitude?.toFixed(4)},{' '}
              {profile.serviceArea.approximateLongitude?.toFixed(4)}
            </Text>
          ) : (
            <Text style={styles.mapFallbackText}>Location not set yet. Use current approximate area.</Text>
          )}
        </View>

        <View style={styles.serviceAreaSummary}>
          <View style={styles.pinRow}>
            <Feather name="map-pin" size={16} color="#D86E2C" />
            <Text style={styles.serviceTitle}>{profile.serviceArea.label}</Text>
          </View>
          <Text style={styles.serviceDetail}>
            Approx. {profile.serviceArea.radiusKm.toFixed(1)} km radius from your location
          </Text>
          <Text style={styles.privacyText}>Your exact location is never shared with others.</Text>
        </View>

        {isEditing ? (
          <View style={styles.editForm}>
            <Text style={styles.inputLabel}>Area label</Text>
            <TextInput value={label} onChangeText={setLabel} style={styles.input} />

            <Text style={styles.inputLabel}>Approximate radius (km)</Text>
            <TextInput
              value={radiusKm}
              onChangeText={setRadiusKm}
              keyboardType="decimal-pad"
              style={styles.input}
            />

            <Pressable style={styles.locationButton} onPress={() => void onUseCurrentApproximateLocation()}>
              <Feather name="navigation" size={14} color="#9A4A11" />
              <Text style={styles.locationButtonLabel}>Use current approximate area</Text>
            </Pressable>

            <View style={styles.actionsRow}>
              <Pressable style={styles.secondaryButton} onPress={() => setIsEditing(false)}>
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.primaryButton} onPress={() => void handleSave()}>
                <Text style={styles.primaryButtonText}>Save</Text>
              </Pressable>
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#D88B48',
    backgroundColor: '#F8F8F8',
  },
  header: {
    backgroundColor: '#D88B48',
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  editIconButton: {
    padding: 4,
  },
  content: {
    padding: 16,
    gap: 14,
  },
  mapFallback: {
    minHeight: 120,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D8B797',
    backgroundColor: '#EBD5BF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    gap: 8,
  },
  mapFallbackText: {
    textAlign: 'center',
    color: '#7A4B22',
    fontSize: 12,
  },
  serviceAreaSummary: {
    gap: 4,
  },
  pinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  serviceTitle: {
    color: '#0F1A34',
    fontSize: 17,
    fontWeight: '700',
  },
  serviceDetail: {
    color: '#445068',
    fontSize: 16,
  },
  privacyText: {
    color: '#59657B',
    fontSize: 15,
    marginTop: 6,
  },
  editForm: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DBE1E8',
    backgroundColor: '#FFFFFF',
    padding: 12,
    gap: 8,
  },
  inputLabel: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D3D9E2',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  locationButton: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F4C6A0',
    backgroundColor: '#FFF3E8',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  locationButtonLabel: {
    color: '#9A4A11',
    fontSize: 12,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 6,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#C4CBD6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  secondaryButtonText: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '600',
  },
  primaryButton: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#D86E2C',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
