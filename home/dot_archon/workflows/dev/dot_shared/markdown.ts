// Section parsing shared by the proposal and plan gates.

export function section(md: string, heading: string): string | null {
  const lines = md.split(/\r?\n/);
  const start = lines.findIndex((l) => l.trim().toLowerCase() === `## ${heading}`.toLowerCase());
  if (start === -1) return null;
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((l) => /^##\s/.test(l));
  return (end === -1 ? rest : rest.slice(0, end)).join("\n");
}

// "### X-n: title" blocks within a section body.
export function blocks(body: string): { heading: string; text: string }[] {
  return body
    .split(/^(?=###\s)/m)
    .filter((b) => /^###\s/.test(b))
    .map((b) => ({ heading: b.split(/\r?\n/)[0], text: b }));
}

// Top-level "- " bullets, ignoring a "_None._" placeholder.
export function bullets(body: string | null): string[] {
  return (body ?? "")
    .split(/\r?\n/)
    .filter((l) => /^-\s+\S/.test(l))
    .map((l) => l.replace(/^-\s+/, "").trim())
    .filter((l) => !/^_?none\.?_?$/i.test(l));
}
