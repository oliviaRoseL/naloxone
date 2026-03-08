import React, { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { CONTACT_METHOD_LABELS } from '@/constants/responder';
import { TrustIndicators } from '@/components/responder/trust-indicators';
import type { ResponderContactMethod, ResponderProfile } from '@/types/responder';

type ProfileInformationCardProps = {
  profile: ResponderProfile;
  onSaveProfile: (input: { displayName: string; alias: string }) => Promise<void>;
  onSaveKit: (input: { kitType: string; quantity: number }) => Promise<void>;
  onSaveTraining: (input: { cprCertified: boolean; narcanTrained: boolean; notes?: string }) => Promise<void>;
  onSaveContactMethod: (method: ResponderContactMethod) => Promise<void>;
};

const contactOptions: ResponderContactMethod[] = ['chat', 'call', 'either'];

export function ProfileInformationCard({
  profile,
  onSaveProfile,
  onSaveKit,
  onSaveTraining,
  onSaveContactMethod,
}: ProfileInformationCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [alias, setAlias] = useState(profile.alias);
  const [kitType, setKitType] = useState(profile.kit.kitType);
  const [kitQuantity, setKitQuantity] = useState(String(profile.kit.quantity));
  const [cprCertified, setCprCertified] = useState(profile.training.cprCertified);
  const [narcanTrained, setNarcanTrained] = useState(profile.training.narcanTrained);

  const handleSave = async () => {
    await onSaveProfile({ displayName, alias });
    await onSaveKit({
      kitType,
      quantity: Number.parseInt(kitQuantity, 10) || 0,
    });
    await onSaveTraining({ cprCertified, narcanTrained, notes: profile.training.notes });
    setIsEditing(false);
  };

  const initials = (profile.alias || profile.displayName || 'R').slice(0, 2).toUpperCase();

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Feather name="user" size={20} color="#111827" />
          <Text style={styles.headerTitle}>Profile Information</Text>
        </View>
        <Pressable style={styles.editIconButton} onPress={() => setIsEditing((value) => !value)}>
          <Feather name="edit-2" size={18} color="#111827" />
        </Pressable>
      </View>

      <View style={styles.content}>
        <View style={styles.identityRow}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>

          <View style={styles.identityDetails}>
            <Text style={styles.nameText}>{profile.displayName}</Text>
            {profile.trustIndicators.isVerified ? (
              <View style={styles.verifiedRow}>
                <Feather name="shield" size={16} color="#2A7A38" />
                <Text style={styles.verifiedText}>Verified Responder</Text>
              </View>
            ) : null}
          </View>
        </View>

        <TrustIndicators trust={profile.trustIndicators} />

        <View style={styles.contactWrap}>
          <Text style={styles.sectionLabel}>Preferred contact</Text>
          <View style={styles.contactOptionsRow}>
            {contactOptions.map((option) => {
              const selected = profile.preferredContactMethod === option;
              return (
                <Pressable
                  key={option}
                  style={[styles.contactPill, selected && styles.contactPillActive]}
                  onPress={() => {
                    void onSaveContactMethod(option);
                  }}
                >
                  <Text style={[styles.contactPillText, selected && styles.contactPillTextActive]}>
                    {CONTACT_METHOD_LABELS[option]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {isEditing ? (
          <View style={styles.editForm}>
            <Text style={styles.formTitle}>Edit profile details</Text>

            <Text style={styles.inputLabel}>Display name or alias</Text>
            <TextInput value={displayName} onChangeText={setDisplayName} style={styles.input} />

            <Text style={styles.inputLabel}>Initials</Text>
            <TextInput value={alias} onChangeText={setAlias} style={styles.input} maxLength={3} />

            <Text style={styles.inputLabel}>Naloxone kit type</Text>
            <TextInput value={kitType} onChangeText={setKitType} style={styles.input} />

            <Text style={styles.inputLabel}>Quantity on hand</Text>
            <TextInput
              value={kitQuantity}
              onChangeText={setKitQuantity}
              style={styles.input}
              keyboardType="number-pad"
            />

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>CPR certified</Text>
              <Switch value={cprCertified} onValueChange={setCprCertified} />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Narcan trained</Text>
              <Switch value={narcanTrained} onValueChange={setNarcanTrained} />
            </View>

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
    borderColor: '#D89B56',
    backgroundColor: '#F8F8F8',
  },
  header: {
    backgroundColor: '#D7A660',
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
    fontSize: 36 / 2,
    fontWeight: '700',
    color: '#111827',
  },
  editIconButton: {
    padding: 4,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  identityRow: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  avatarCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#E37935',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18 * 2 / 1.5,
    fontWeight: '700',
  },
  identityDetails: {
    gap: 6,
  },
  nameText: {
    color: '#0F1A34',
    fontSize: 36 / 2,
    fontWeight: '700',
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  verifiedText: {
    color: '#2A7A38',
    fontSize: 30 / 2,
    fontWeight: '600',
  },
  contactWrap: {
    gap: 8,
  },
  sectionLabel: {
    color: '#1F2B45',
    fontSize: 14,
    fontWeight: '600',
  },
  contactOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  contactPill: {
    borderWidth: 1,
    borderColor: '#C9D0DB',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
  },
  contactPillActive: {
    borderColor: '#D0712E',
    backgroundColor: '#FFF1E5',
  },
  contactPillText: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '500',
  },
  contactPillTextActive: {
    color: '#A34A0A',
  },
  editForm: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DBE1E8',
    backgroundColor: '#FFFFFF',
    padding: 12,
    gap: 8,
  },
  formTitle: {
    color: '#0F1A34',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
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
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchLabel: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 4,
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
