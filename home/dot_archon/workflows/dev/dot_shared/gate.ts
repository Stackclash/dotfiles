// An approval gate's whole output, as bound into a script, is a JSON object
// ({ decision, text }). Reading the whole output avoids a hard failure when a
// gate produced no structured fields; an unparseable value is "no decision".
export function gateDecision(raw: string | undefined): { decision: string; text: string } {
  try {
    const v = JSON.parse(raw ?? "");
    return { decision: String(v?.decision ?? ""), text: String(v?.text ?? "") };
  } catch {
    return { decision: "", text: "" };
  }
}
