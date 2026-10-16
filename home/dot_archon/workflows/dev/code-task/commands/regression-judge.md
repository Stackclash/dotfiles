# Judge new failures against the baseline

Some repository checks already failed before this change began. They still
fail after the latest implementation attempt. Decide whether the change
introduced any **new** failures. Pre-existing failures are not the change's
fault and must not be reported.

## Inputs

For each check listed in `$ARTIFACTS_DIR/green-report.md` under "Needs
regression judgment":

- **Before the change:** `$ARTIFACTS_DIR/baseline-<check>.log`
- **After the latest attempt:** `$ARTIFACTS_DIR/build-<check>.log`

## Method

1. From each log, extract the individual failures: failing test names, lint
   rule + file + line, compiler errors with file + line.
2. A failure is **new** if it appears after but not before. Match on identity,
   not exact text: the same test failing with a different line number or
   timestamp is the same failure; the same lint rule in a file this change
   touched at a different line is new only if the count for that rule and file
   grew.
3. If a log cannot be parsed into individual failures (crash, truncated
   output), and the after-log's failure is not plainly the same as the
   before-log's, report it as new and say why.

Evidence bar: every reported new failure quotes the line from the after-log
that shows it. Do not report anything you cannot quote.

Do not modify any file.

## Output

`new_failures`: one string per new failure, `<check>: <quoted failure line>`;
`[]` when there are none.
