export const notify = (message: string, type: 'success' | 'error' = 'success') =>
  window.dispatchEvent(new CustomEvent('worldsphere:notice', { detail: { message, type } }));