export function showApiToast(showToast, result, { success, error } = {}) {
  const ok = Boolean(result?.success ?? result?.ok);
  const message = result?.message?.trim();

  if (ok) {
    showToast(message || success || 'Done.', 'success');
    return true;
  }

  showToast(message || error || 'Something went wrong.', 'error');
  return false;
}
