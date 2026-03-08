import { RESPONDER_API_URL } from '@/constants/responder';
import { isDesktopWeb } from '@/constants/runtime';

const explicitAlertUrl = process.env.EXPO_PUBLIC_ALERT_SERVER_URL?.trim() ?? '';
const defaultTailnetUrl = isDesktopWeb() ? 'http://172.29.240.1:8000' : 'http://100.65.246.114:8000';

export const ALERT_SERVER_URL = explicitAlertUrl || RESPONDER_API_URL || defaultTailnetUrl;
export const ALERT_REQUEST_TIMEOUT_MS = 5000;
export const ALERT_POLL_INTERVAL_MS = 6000;
export const ALERT_DEVICE_ID_STORAGE_KEY = 'naloxone.alert.device-id';
