export type ResponderPresencePayload = {
  deviceId: string;
  displayName: string;
  responderModeEnabled: boolean;
  approximateLatitude: number;
  approximateLongitude: number;
  radiusKm: number;
  updatedAt: string;
};

export type EmergencyAlertPayload = {
  senderDeviceId: string;
  latitude: number;
  longitude: number;
  radiusKm?: number;
};

export type EmergencyAlertResponse = {
  alert_id: string;
  matched_count: number;
  created_at: string;
};

export type ResponderAlertMessage = {
  alert_id: string;
  created_at: string;
  sender_device_id: string;
  requester_location: {
    latitude: number;
    longitude: number;
  };
  distance_km: number;
};
