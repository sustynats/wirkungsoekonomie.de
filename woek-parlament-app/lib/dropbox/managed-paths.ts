const canonicalRoot = "/WOEK";
const forbiddenLegacyRoots = ["/WÖK", "/W�K"] as const;

function normalizedRoot(value: string) {
  return value.trim().replace(/\/+$/, "");
}

export function woekDropboxRoot() {
  const configured = normalizedRoot(process.env.WOEK_DROPBOX_ROOT ?? canonicalRoot);
  if (configured !== canonicalRoot) {
    throw new Error(`WOEK_DROPBOX_ROOT must be exactly ${canonicalRoot}.`);
  }
  return configured;
}

export function validateManagedPath(value: string) {
  const normalized = normalizedRoot(value);
  if (!normalized.startsWith("/") || normalized.includes("..") || normalized.includes("//")) {
    throw new Error("Managed Dropbox path must be absolute and normalized.");
  }
  if (forbiddenLegacyRoots.some((root) => normalized === root || normalized.startsWith(`${root}/`))) {
    throw new Error("Legacy Dropbox roots are forbidden for managed reads and writes.");
  }
  const root = woekDropboxRoot();
  if (normalized !== root && !normalized.startsWith(`${root}/`)) {
    throw new Error(`Managed Dropbox path must stay below ${root}.`);
  }
  return normalized;
}

export function managedDropboxPath(...segments: string[]) {
  const suffix = segments
    .flatMap((segment) => segment.split("/"))
    .map((segment) => segment.trim())
    .filter(Boolean)
    .join("/");
  return validateManagedPath(suffix ? `${woekDropboxRoot()}/${suffix}` : woekDropboxRoot());
}
