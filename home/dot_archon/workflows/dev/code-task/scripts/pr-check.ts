// Whether a PR can be offered: only when this branch has commits beyond the
// base branch. Also identifies the forge from the origin remote.
const git = (...args: string[]) => {
  const res = Bun.spawnSync(["git", ...args], { stdout: "pipe", stderr: "pipe" });
  return { code: res.exitCode, out: res.stdout.toString().trim() };
};

const base = process.env.BASE_BRANCH ?? "";
const count = base ? Number(git("rev-list", "--count", `${base}..HEAD`).out) || 0 : 0;
const remote = git("remote", "get-url", "origin");
const url = remote.code === 0 ? remote.out : "";
const forge = /github\.com/i.test(url)
  ? "github"
  : /dev\.azure\.com|visualstudio\.com/i.test(url)
    ? "azure-devops"
    : url
      ? "other"
      : "none";

console.log(JSON.stringify({ commits: count, forge, branch: git("branch", "--show-current").out }));
