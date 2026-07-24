# Break PRD

Read the PRD at the path the invoking prompt names (e.g. "Read the PRD file at `<path>`"),
then break it into issues. This mode does **not** edit the PRD body — it reads the PRD and
produces issue files from it.

- Break the PRD into issues. The number of issues should match the PRD: one per behavior or feature. Do not pad with extra issues, and do not invent requirements that are not in the PRD.
- Each issue is just the title and a brief overview. The **build** skill turns each one into a full plan and implements it later.
- Issues follow this naming convention (use Title Case for behavior and page names, converting kebab-case to space-separated words):
  - Implement [Behavior Name] Behavior in [Page Name] Page
  - Change [Behavior Name] Behavior in [Page Name] Page to [What Change We Want]
  - Fix [Behavior Name] Behavior in [Page Name] Page

## Writing the issue files

Write each issue as a separate file in the staging directory the invoking prompt names (for
example as `$ISSUES_DIR`). That directory is a scratch area, not a source of truth — the CLI
reads these files back after you finish, creates the issues on the backend in dependency
order, and discards the directory. This skill does not call the API and does not choose the
directory or filenames itself: the invoking prompt's own **Issue File Format** section is
authoritative for the filename pattern, the front matter fields, and the concrete ID prefix
and `prd_id` for this batch — follow it exactly rather than inventing a format here.

## Using Flows for Ordering and Dependencies

If the PRD includes a **Flows** section or describes user journeys, use it to:

1. **Order issues correctly**: behaviors that appear earlier in a flow must be implemented before behaviors that appear later.
2. **Populate each issue's `depends_on` field**: list the issue IDs (from this same batch) that must be completed before this issue can start. Use `depends_on: []` for issues with no dependencies. `depends_on` is the only source of truth for ordering — `epic project build` reads it to schedule work.

Rules for determining dependencies:

- Within a flow, each behavior depends on the behaviors listed before it in that flow.
- If a behavior appears in multiple flows, combine all dependencies.
- Only list **direct** dependencies (not transitive ones).
- Reference dependencies by their placeholder issue ID from this batch (e.g. `PROJ-1`), not by title.
- All IDs in `depends_on` must refer to issues created in this same batch.

Order issues in implementation sequence: foundational behaviors before dependent behaviors. Use the Flows section to determine the correct order when available.

## When invoked directly

If nothing in the request names a PRD to read or a staging directory to write into, this
skill does not break the PRD itself: tell the user that `epic prd break <PRD-id>` owns the
breakdown — it stages the issue files, creates each issue on the backend in dependency
order, and discards the staging directory when done.
