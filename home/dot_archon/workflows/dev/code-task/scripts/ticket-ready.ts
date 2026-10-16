// A fetched ticket skips the interview only when it has no gaps and no
// conflicts with the code, glossary or ADRs.
const gaps: string[] = JSON.parse(process.env.INPUTS_GAPS || "[]");
const conflicts: string[] = JSON.parse(process.env.INPUTS_CONFLICTS || "[]");

console.error(`ticket-ready: ${gaps.length} gap(s), ${conflicts.length} conflict(s)`);
console.log(JSON.stringify({ complete: gaps.length === 0 && conflicts.length === 0 }));
