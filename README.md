# Signal — SMB prospecting playbook

An interview companion for a Salesforce AE & Growth SMB application. All accounts, buying signals and results are fictional. This is an independent demonstration, not a Salesforce product or a claim of prior performance.

## Run

Requires Node.js 20 or later; no dependencies or API keys.

```sh
npm start
```

Open port 3000 in your development environment. Set `PORT` to change the listening port. Run `npm test` for data integrity checks.

## Interview walkthrough

1. Explain the tiering model and 50/35/15 effort allocation in Territory plan. Potential is a discovery hypothesis, not a forecast.
2. Select Evergreen Home to demonstrate an expansion sequence based on support hiring. Select Orbit Analytics for acquisition following funding and sales hiring.
3. Walk through the nine clickable touches over 30 days, stakeholder strategy and first email. Explain how replies, opt-outs and existing customer adoption change the plan.
4. Use Performance filters to discuss conversion and qualified pipeline. Open rate is only directional. Export a filtered CSV if useful.
5. Open My approach to explain what you would stop, test and delegate to AI. Describe personal experience separately; the sample results do not prove what has worked for you.

The app uses curated AI-assisted examples, not live AI generation. Research verification, account judgement and message approval remain human responsibilities. Metrics use a fictional 90-day contact cohort; all monetary values are AUD. Google Fonts is optional and falls back to local sans-serif fonts.

## Files

- `data.js`: illustrative accounts and coherent cohort metrics.
- `app.js`: tabs, account navigation, filters, sequences and CSV export.
- `style.css`: responsive visual design.
- `server.js`: dependency-free static development server.

No outreach is sent, and no CRM or external data source is connected.

## Decision tools and interview mode

Use **Interview mode** in the header for a three-screen presentation: Prioritise → Engage → Learn. The selected example account stays consistent across all screens. The Engage screen opens all nine touch drafts.

- **Tier badges** open account-specific evidence, promotion/downgrade criteria, a separate renewal-risk assessment and a scoring sandbox.
- Proposed score: 40% revenue potential, 40% signal strength, 20% timing; T1 ≥4.2, T2 ≥2.5, T3 below 2.5. Revenue bands and thresholds are illustrative, not Salesforce policy. The sandbox does not change the account book.
- **Why this account, why now** connects signals to a challenge, business outcome, stakeholder and next action.
- **Customer response paths** explain what happens on a reply, objection, silence or opt-out. These are simulations; no outreach or CRM updates occur.
- **Performance → What worked / what didn’t** contains proposed lessons and measurement plans. Add a verified personal example in the expandable editor; it is saved only in that browser's local storage and can be cleared. It is also shown in Interview mode, separately from fictional metrics.
- All detailed framework, learning and response sections are collapsed initially to keep the dashboard easy to scan.

`strategy.js` renders the new decision tools; account-specific priority evidence and tested score functions are in `data.js`. Existing account metrics remain fictional. Even a strong external trigger is not proof of intent; the examples explicitly distinguish plausible signals from illustrative validated needs.

Low adoption is now an explicit customer-value priority, independent of the growth score and renewal date. The territory callout, account badges, priority dialog, sequence guidance and interview mode distinguish growth tier from adoption / retention action. Bloom Wellness demonstrates high account attention alongside T2 expansion; low adoption calls for diagnosis and enablement, not an automatic upsell or a claim of churn.

## Outreach effort by tier

- **T1:** highly personalised drafts, account-specific business hypotheses, stakeholder mapping and individual message review.
- **T2:** reusable playbooks with verified signal and role edits; discovery establishes need and timing.
- **T3:** signal-segment templates with `company`, `first_name` and `sender_name` merge fields. Proposed automation schedules eligible emails and creates tasks; calls and LinkedIn actions remain human-led. Replies or opt-outs stop the cadence. This demo does not connect to an automation system or send outreach.

The touch dialog shows the execution mode and, for T3, the reusable template behind the example preview. Low-adoption accounts use customer-value drafts and require account-team review before any expansion outreach. All tiers retain the planned nine touches across 30 days.

The growth framework has two groups: existing customers (internal and external evidence combined) and new business (public signals plus relevant first-party discovery). Bullet lists show T1 Strong, T2 Moderate and T3 Weak signals; final tiers still depend on revenue potential and timing.
