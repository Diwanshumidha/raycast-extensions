import { fileURLToPath } from "url";

export function resolveUriToPath(uri: string): string {
  if (!uri) {
    throw new Error("URI cannot be empty");
  }

  try {
    if (uri.startsWith("file://")) {
      return fileURLToPath(uri);
    }
    return decodeURIComponent(uri.replace(/^file:\/+/, ""));
  } catch (error) {
    console.error(`Failed to resolve URI: ${uri}`, error);
    return uri;
  }
}
