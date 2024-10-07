export default function normalizeText(input: string): string {
    let normalized = input.replace(/\s+/g, ' ');
    normalized = normalized.replace(/\n+/g, '\n');
    return normalized.trim();
  }