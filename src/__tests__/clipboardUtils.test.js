import { fallbackCopyTextToClipboard } from '../utils/clipboardUtils';

test('fallbackCopyTextToClipboard copia texto usando execCommand', () => {
  document.execCommand = jest.fn();
  fallbackCopyTextToClipboard('hola');
  expect(document.execCommand).toHaveBeenCalledWith('copy');
});

test('fallbackCopyTextToClipboard llama onError si execCommand lanza error', () => {
  document.execCommand = jest.fn(() => { throw new Error('fail'); });
  const onError = jest.fn();
  fallbackCopyTextToClipboard('hola', undefined, onError);
  expect(onError).toHaveBeenCalled();
});

test('fallbackCopyTextToClipboard llama onSuccess si execCommand funciona', () => {
  document.execCommand = jest.fn();
  const onSuccess = jest.fn();
  fallbackCopyTextToClipboard('hola', onSuccess);
  expect(onSuccess).toHaveBeenCalled();
});