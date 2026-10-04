// One contract for the form, authenticated intake and image-processing worker.
// More screenshots, not a larger maximum payload than the former 4 x 8 MiB.
export const EDITORIAL_ATTACHMENT_COUNT = 12;
export const EDITORIAL_ATTACHMENT_BYTES = 8 * 1024 * 1024;
export const EDITORIAL_ATTACHMENTS_TOTAL_BYTES = 32 * 1024 * 1024;
export const EDITORIAL_IMAGE_TYPES = Object.freeze(['image/png', 'image/jpeg', 'image/webp']);
export const ATTACHMENT_COUNT_MESSAGE = 'Bitte höchstens 12 Screenshots auswählen.';
export const ATTACHMENT_TOTAL_MESSAGE = 'Die Screenshots dürfen zusammen höchstens 32 MiB groß sein.';
export function attachmentSelectionError(files) {
  if (files.length > EDITORIAL_ATTACHMENT_COUNT) return ATTACHMENT_COUNT_MESSAGE;
  if (files.some(file => !EDITORIAL_IMAGE_TYPES.includes(file.type) || !Number.isInteger(file.size) || file.size < 1 || file.size > EDITORIAL_ATTACHMENT_BYTES)) {
    return 'Bitte PNG-, JPEG- oder WebP-Bilder mit höchstens 8 MiB pro Datei auswählen.';
  }
  if (files.reduce((sum, file) => sum + file.size, 0) > EDITORIAL_ATTACHMENTS_TOTAL_BYTES) return ATTACHMENT_TOTAL_MESSAGE;
  return '';
}
