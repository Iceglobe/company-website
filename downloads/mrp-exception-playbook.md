# The MRP Exception Playbook

How mid-market manufacturers stop drowning in MRP recommendations they should not act on, and start hearing the ones that matter.

By Philip L. Valentin, Founder of OmniaOps. Practitioner from Novo Nordisk, Ambu, WSA.

---

## Why this playbook exists

Most MRP runs at mid-market manufacturers produce more recommendations than the planning team can act on. The team learns to ignore most of them. Then a real signal gets lost in the noise and produces a stockout or an inventory write-down.

The classical advice — "improve forecast accuracy", "tune your safety stock", "clean your master data" — is correct but useless without a process for working with the exception output that the MRP actually produces.

This playbook is what I would have wanted on my first day running planning at Novo: how to triage MRP exceptions in a way that scales, in a way that doesn't depend on heroic individual planners, and in a way that catches the ones that matter without forcing the team to look at all of them.

---

## The five exception categories

Every MRP recommendation falls into one of five categories. Each category has a different cause and a different action. Most planning teams treat all five the same way — by clicking through them individually. That is the root problem.

### 1. Genuine stockout risk

The MRP recommends a PO because the projected inventory will hit zero before the next planned receipt arrives.

Cause: real signal. Demand is moving faster than supply, or supply is delayed.

Action: this is the one you actually want to see. Approve and act.

The problem: this category is usually 5-15% of all MRP exceptions, but it is hidden inside the other 85-95% that are noise.

### 2. Master-data noise

The MRP recommends a PO because a master data field is wrong. The five usual suspects:

- Safety stock entered as raw quantity when the system expects days
- Lead time set to supplier-quoted value, not observed actual
- MOQ from an outdated contract
- BOM yield set to 100% when real yield is 92-97%
- Item status still active for a phased-out part

Cause: data, not demand.

Action: do not approve the PO. Fix the master data. The exception disappears at the next MRP run.

This category is usually 30-50% of all exceptions. It is the single biggest source of planner workload, and the easiest to eliminate at the source.

### 3. Phantom demand

The MRP recommends a PO because demand exists in the system but it is not real demand. Examples:

- A customer order for a phased-out item is still active in the order book
- A forecast adjustment from 18 months ago is still carrying forward
- A duplicate customer-and-forecast entry is double-counting
- An internal transfer order is being read as external demand

Cause: stale data.

Action: clean the demand signal. The exception disappears.

This category is usually 10-25% of all exceptions.

### 4. Timing distortions

The MRP recommends a PO that is technically correct but at the wrong time. Examples:

- A consolidated supplier order would be more economical if the PO is delayed 2 days to combine with another order
- The recommended PO date falls on a non-receiving day at the warehouse
- Lead time on the item is "average" but the specific supplier always runs 1.5x

Cause: rigid lookahead horizon.

Action: adjust the PO. The exception is real but the action needs human judgment, not just an approval click.

This category is usually 10-20% of all exceptions.

### 5. Ghost dependencies

The MRP recommends a PO for a component because of a BOM relationship that no longer exists. Examples:

- An old product variant is still in the BOM
- A "phantom" item (planning bill) is incorrectly carrying real demand
- A second-tier supplier dependency was removed but the BOM still references it

Cause: BOM hygiene.

Action: fix the BOM. The exception disappears.

This category is usually 5-15% of all exceptions.

---

## The triage process

The shift in the planning team's day is this: instead of clicking through MRP recommendations one by one, the planner walks the exception output through a structured triage. The triage takes 30 minutes for a typical mid-market MRP run, and it surfaces the ~10% of recommendations that actually need human action.

### Step 1: Group by category

Most modern MRP systems can already do this. Pull the exception list, group by exception code, and tag each group with the category above. If your system cannot do this directly, dump the list into Excel and group there.

### Step 2: Triage in priority order

Walk the categories in this order:

1. **Genuine stockout risk** (5-15% of volume): review every line. Approve or escalate.
2. **Timing distortions** (10-20% of volume): review every line. Adjust dates or approve.
3. **Master-data noise** (30-50% of volume): do not review individually. Add to a master-data fix queue. The data correction will eliminate the exception at the next run.
4. **Phantom demand** (10-25% of volume): do not review individually. Add to a demand-cleanup queue.
5. **Ghost dependencies** (5-15% of volume): do not review individually. Add to a BOM-hygiene queue.

By the end of step 2, the planner has spent 20-30 minutes on the 10-15% of recommendations that needed human judgment, and has populated three queues (master data, demand, BOM) for batch cleanup by the next planning cycle.

### Step 3: Batch cleanup

Once a week, the planner spends 60-90 minutes working the three queues. Each item fixed at the source removes between 5 and 50 exception lines from future MRP runs.

After 4-6 weeks of disciplined cleanup, the typical mid-market planning team sees:

- 60-70% reduction in total exception volume
- 30-40% reduction in time spent per MRP run
- Material improvement in the team's confidence in the recommendations (because the ones they see are the ones that matter)

---

## Implementation: the 30-day adoption plan

### Week 1: Categorize

Pull a full MRP exception list from the most recent run. Tag every line with one of the five categories above. Count the percentage in each. This is your baseline.

Expect surprises: most teams discover that "master-data noise" is 40-60% of their exception load, not the 5-10% they assumed.

### Week 2: Build the queues

Set up three simple shared trackers (Excel, Notion, Jira, whatever the team uses):

- Master data fix queue
- Demand cleanup queue
- BOM hygiene queue

Each queue has four columns: item ID, issue description, owner, status.

### Week 3: Run the triage process for one full cycle

Apply the triage above for one full week of MRP runs. Track:

- Time spent on each category
- Number of items added to each queue
- Number of recommendations actually approved

Compare to the prior baseline.

### Week 4: Review and adjust

Most teams find that one of the three queues dominates. Adjust priority of cleanup work to attack the biggest queue first. Re-run the triage for another cycle. Compare.

By the end of week 4, the planning team should have seen a measurable drop in total exception volume.

---

## What this playbook is not

This is not a magic bullet. There are still real planning decisions to make. The triage process surfaces the real decisions and pushes the rest into batch cleanup. It does not remove the decisions.

It is also not a replacement for upstream improvements. The reason 50% of your MRP exceptions are master-data noise is because the master data is not maintained at the source. The triage process helps you survive the noise; the long-term fix is a master-data governance process that prevents the noise from accumulating.

But survival is the first step. Most planning teams I have worked with were buried under MRP exceptions and could not even see what the upstream improvements should be. The triage process is what gives the team the time and the visibility to start the upstream work.

---

## Where OmniaOps fits

We built the OmniaOps planning platform around this exact triage logic. The system automatically categorizes every MRP exception into the five categories above, routes each one to the appropriate queue, and surfaces only the lines that require human judgment.

The day-one experience for a planner moving from spreadsheet MRP to OmniaOps is usually:

- 4-5 hour MRP review cycle becomes 30-45 minutes
- Daily exception count drops 50-70% in the first month, 70-85% by month three
- The planner's job shifts from "click through recommendations" to "make judgment calls on the ones that matter"

If you want to see this on your data, we run 4-6 week paid pilots scoped to one product family or one site.

[Book a 20-minute call](https://omniaops.com/book-call.html?utm_source=magnet&utm_medium=mrp_playbook)

---

## Appendix: the master-data audit (the highest-leverage upstream fix)

If you only do one upstream improvement, do this. The audit takes 30 minutes per planner and can eliminate 30-50% of all MRP exceptions in the first pass.

Pull these five fields across every active SKU:

1. Safety stock (days vs quantity — check the unit on every row)
2. Planned lead time (compare to the actual observed lead time over the last 24 months — if it diverges by >20%, flag)
3. MOQ (cross-reference against current supplier contracts)
4. BOM yield (anything set to 100% — flag)
5. Item status (anything still "active" with no transactions in the last 12 months — flag)

For each flagged row, log the fix to the master data queue with an owner. Work the queue in volume × value priority order. Most teams fix the top 50-100 rows in the first week and see an immediate reduction in exception volume.

This audit is the single highest-leverage planning improvement I have ever seen.

---

OmniaOps · The next major category in supply chain planning is autonomous.
Built by ops practitioners out of Novo Nordisk, Ambu, Pfizer, Ferrosan, WSA.

omniaops.com · philip@omniaops.com · linkedin.com/in/philiplvalentin
