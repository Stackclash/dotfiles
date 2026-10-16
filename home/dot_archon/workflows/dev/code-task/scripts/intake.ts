// Route requirements gathering: ADO work item fetch, or interview.
// Prints one JSON document matching the intake node's output_format.

type Ref = { id: string; project: string };

const URL_RE =
  /https?:\/\/(?:dev\.azure\.com\/[^\/\s]+|[^\/\s]+\.visualstudio\.com)\/([^\/\s]+)\/_workitems\/edit\/(\d+)/i;
const AB_RE = /(?:^|[^\w#])AB#(\d+)\b/i;

const workItemInput = (process.env.INPUTS_WORK_ITEM ?? "").trim();
const projectInput = (process.env.INPUTS_ADO_PROJECT ?? "").trim();
const request = process.env.ARGUMENTS ?? "";

function fromUrl(text: string): Ref | null {
  const m = text.match(URL_RE);
  return m ? { id: m[2], project: decodeURIComponent(m[1]) } : null;
}

function resolveRef(): Ref | null {
  if (workItemInput) {
    if (/^\d+$/.test(workItemInput)) return { id: workItemInput, project: "" };
    const ref = fromUrl(workItemInput);
    if (ref) return ref;
    // An explicit input that is malformed is a caller error, not a reason to interview.
    console.error(`intake: work_item input "${workItemInput}" is neither a numeric ID nor an ADO work item URL`);
    process.exit(1);
  }
  const urlRef = fromUrl(request);
  if (urlRef) return urlRef;
  const ab = request.match(AB_RE);
  return ab ? { id: ab[1], project: "" } : null;
}

function probeAdoMcp(): string {
  try {
    const res = Bun.spawnSync(["claude", "mcp", "get", "azure-ado"], { stdout: "pipe", stderr: "pipe" });
    const out = res.stdout.toString() + res.stderr.toString();
    if (res.exitCode !== 0) return "azure-ado MCP is not configured for Claude";
    if (!/Status:\s*\S*\s*Connected/i.test(out)) return "azure-ado MCP is configured but not connected";
    return "";
  } catch (err) {
    return `could not run 'claude mcp get azure-ado': ${(err as Error).message}`;
  }
}

const ref = resolveRef();
let result = { source: "interview", work_item_id: "", project: "", request, fallback_reason: "" };

if (ref) {
  const project = ref.project || projectInput;
  let reason = project ? "" : "no ADO project: pass --input ado_project=<name> or set the AZURE_PROJECT Doppler secret and re-run chezmoi apply";
  if (!reason) reason = probeAdoMcp();
  result = {
    source: reason ? "interview" : "ado",
    work_item_id: ref.id,
    project,
    request,
    fallback_reason: reason,
  };
  if (reason) console.error(`intake: work item ${ref.id} cannot be fetched (${reason}); falling back to interview`);
}

console.log(JSON.stringify(result));
