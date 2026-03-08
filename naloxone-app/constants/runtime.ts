const MOBILE_USER_AGENT_PATTERN = /Android|iPhone|iPad|iPod|Mobile/i;

function getUserAgent() {
  if (typeof navigator === 'undefined') {
    return '';
  }

  return navigator.userAgent || '';
}

export function isDesktopWeb() {
  if (typeof window === 'undefined') {
    return false;
  }

  return !MOBILE_USER_AGENT_PATTERN.test(getUserAgent());
}
