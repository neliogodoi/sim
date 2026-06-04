export function toDisplayImageUrl(url?: string): string {
  const value = url?.trim();
  if (!value) {
    return '';
  }

  const driveId = googleDriveFileId(value);
  if (driveId) {
    return `https://drive.google.com/thumbnail?id=${encodeURIComponent(driveId)}&sz=w1600`;
  }

  return value;
}

function googleDriveFileId(url: string): string {
  const fileMatch = url.match(/drive\.google\.com\/file\/d\/([^/?#]+)/);
  if (fileMatch?.[1]) {
    return fileMatch[1];
  }

  const idMatch = url.match(/[?&]id=([^&#]+)/);
  if (url.includes('drive.google.com') && idMatch?.[1]) {
    return decodeURIComponent(idMatch[1]);
  }

  return '';
}
