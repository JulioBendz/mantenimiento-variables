import { fallbackCopyTextToClipboard } from '../utils/clipboardUtils';

test('fallbackCopyTextToClipboard copia texto usando execCommand', () => {
  document.execCommand = jest.fn();
  fallbackCopyTextToClipboard('hola');
  expect(document.execCommand).toHaveBeenCalledWith('copy');
});