# Student report source integration

This project now exposes a server-to-server student report feed for `orunhomework`. The browser never receives the source service-role key or the stable source student id.

## Data model

- `report_cards.exam_date` is the real exam date. Existing `created_at` and submission dates are never substituted for it.
- `report_students.id` is the stable source identity used after a verified link.
- `report_student_identity_keys` stores exact school, grade and student-name keys. Normalization is limited to NFC, trim, repeated whitespace and case. It does not remove school suffixes, reinterpret grades or fuzzy-match names.
- `report_school_aliases` contains the only permitted school aliases. It has no public API policy.
- `student_submissions.source_student_id` attaches revisions and historical reports to one stable source identity.

The migration backfills one candidate identity for each existing exact three-field key. Candidate keys have `approved_at = null` and do not become visible to the integration until an administrator verifies them. This avoids treating legacy free-form text as proof of identity. Because the legacy data has no original person identifier, same-name students already collapsed into an identical three-field key cannot be separated automatically; verify those records against enrollment data before approval.

For a verified grade progression, merge the old candidate into the chosen stable identity with the service-role-only `merge_report_students(primary_id, duplicate_id)` function. The source feed then includes the approved current key and every historical report already attached to that stable id. Never merge on school and name alone.

## Deployment order

1. Apply `supabase/migrations/20260912090000_student_report_integration.sql`.
2. Enter real exam dates in the report editor. Undated reports remain in history and are excluded from the latest-two calculation.
3. Review candidate identities and set `approved_at` only for verified keys. Add school aliases only after explicit approval, using normalized exact alias and canonical keys.
4. Configure `REPORT_INTEGRATION_SHARED_SECRET` with a long random value and set the same value on the homework project. Do not expose or log it.
5. Set `REPORT_FEED_ENABLED=true`, then deploy `student-report-feed`.

The feed chooses the latest valid complete submission for each distinct `report_id`, sorts distinct reports by `exam_date DESC`, and analyzes the latest two. It aggregates wrong/total question counts, ranks eligible types with at least three questions by wrong rate, keeps lower samples separate, labels partial answers separately, and returns at most three types. Every historical distinct report remains in the viewer. A source identity with more than 10,000 submission revisions fails explicitly instead of returning truncated history.

