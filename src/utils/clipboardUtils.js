export function copyTextToClipboard(text, onSuccess, onError) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(onSuccess).catch(() => {
      fallbackCopyTextToClipboard(text, onSuccess, onError);
    });
  } else {
    fallbackCopyTextToClipboard(text, onSuccess, onError);
  }
}

function fallbackCopyTextToClipboard(text, onSuccess, onError) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    onSuccess && onSuccess();
  } catch (err) {
    onError && onError();
  }
  document.body.removeChild(textArea);
}