# PRIFYN Growth OS MVP Blueprint

Status: product direction applied  
Scope: MVP 1 Growth OS, with Business OS-ready architecture

## Product position

PRIFYN is an AI-native Business Operating System, starting with Growth OS.

MVP 1 does not try to become ERP, omnichannel commerce, HRIS, or a creator marketplace. It proves the growth operating loop first:

`PLAN → EXECUTE → MEASURE → UNDERSTAND → IMPROVE → REPEAT`

The core product promise is not “more dashboards.” It is better decisions from connected campaign evidence.

## MVP architecture

```text
Growth OS
├── Campaign Management
│   ├── Ads Campaign
│   └── KOL Campaign
├── Creator Intelligence
├── CRM Lite
│   ├── Lead Capture
│   ├── Lead Source
│   ├── Campaign Attribution
│   └── Customer Status
├── Reporting
│   ├── Campaign
│   ├── Ads
│   ├── KOL
│   └── Leads
└── Growth Intelligence
    ├── Insight
    └── Recommendation
```

Campaign Management is the heart of the MVP. Ads and KOL are execution channels under campaign management, not separate disconnected products.

## Core data model

```text
Workspace
└── Operating Brand
    └── Campaign
        ├── Channel
        │   ├── Ads
        │   └── KOL
        ├── Budget
        ├── Objectives
        ├── Creatives
        ├── Creators
        ├── Deliverables
        ├── Lead Capture
        ├── Performance
        ├── Spend
        ├── Attribution
        └── Insights
```

This model prepares MVP 2 without building it now:

```text
Campaign
↓
Customer
↓
Order
↓
Revenue
↓
Inventory
↓
Profit
```

## Data levels

### Level 1 — Campaign Performance

Use this in MVP 1 immediately from Ads/KOL imports and manual reports:

- Spend
- Impressions
- Reach
- Clicks
- CTR
- CPC
- Results
- Conversions

### Level 2 — Lead Capture

MVP 1 should support this with manual CSV/XLSX import before full API connections:

- Name
- Phone
- Email
- Source
- Campaign
- Ad or creator
- Date
- Status

This lets PRIFYN answer:

- Which campaign generated attention?
- Which campaign generated leads?
- Which ad or creator generated qualified leads?
- Which campaign is likely worth improving?

### Level 3 — Revenue Attribution

MVP 1 prepares for it. MVP 2 deepens it through Commerce OS / ERP / omnichannel integrations:

```text
Lead
↓
Customer
↓
Order
↓
Revenue
```

This lets PRIFYN later answer:

- Which campaign generated customers?
- Which campaign generated money?
- Which creator produced lower reach but higher customer quality?
- Which growth effort created profit after stock and fulfillment costs?

## Creator Intelligence in the KOL lifecycle

Creator Intelligence is not only a profile page. It belongs inside the campaign lifecycle:

```text
Brand
↓
Create Campaign Brief
↓
Set Creator Requirements
↓
Discover / Invite / Open Application
↓
Creators Apply
↓
AI Interview Summary + Match Score
↓
Brand Shortlist
↓
Select Creator
↓
Collaboration
↓
Content Submission
↓
Approval
↓
Performance
↓
Payment
↓
Insight
```

### AI Interview Summary

When a brand reviews applicants, PRIFYN should summarize the creator like a strong recruiter, not only show links and a score.

Required output:

- Creator summary
- Campaign match score
- Why the creator fits
- Potential risks
- Evidence used
- Confidence
- Recommended next action

Example:

> Sarah Foodie — Match 94%. Food creator in Surabaya focused on restaurant and cafe reviews. Engagement is stable at 6.8%, delivery style is natural and educational, and she has worked with 18 F&B brands. Strongest signal is storytelling and viewer retention. Main risk is posting consistency. Based on similar campaign history, PRIFYN expects above-average performance for this brief.

Explainability rule:

- Never show a black-box score.
- Every score must have evidence, confidence, limitation, and suggested action.

## MVP scope

### MUST

Ads:

- Campaign setup
- Manual CSV/XLSX import
- Channel/account readiness
- Creative/copy/CTA
- Campaign result
- Normalized metrics
- Dashboard
- Insight
- Recommendation

KOL:

- Creator profile
- Social links
- Portfolio
- Creator verification
- Campaign creation
- Campaign brief
- Open application
- Creator apply
- Brand shortlist
- Approve/reject
- Deliverables
- Submission
- Performance
- Payment status
- AI creator summary
- AI campaign matching

Reporting:

- Campaign dashboard
- Ads + KOL performance
- Spend
- Result
- Channel comparison
- Basic attribution
- AI insight
- Recommended next action

CRM Lite:

- Lead capture import
- Lead source
- Campaign attribution
- Customer status

### SHOULD

- Creator invitation
- Creator search/filter
- Saved creators
- Campaign templates
- AI brief generator
- AI campaign summary
- AI content/deliverable checking

### LATER

- TikTok API
- Meta API
- Google Ads API
- Automated ad execution
- Automated creator payout/escrow
- Advanced attribution
- Marketplace-scale creator discovery
- ERP
- Inventory
- Finance
- HRIS

## Engineering prioritization guardrail

Do not spend weeks building a technically interesting OAuth integration if the core campaign loop is not functional.

Build order:

1. Campaign lifecycle works manually.
2. Ads and KOL results can be imported.
3. Leads can be captured and attributed.
4. AI can explain what happened and what to do next.
5. API integrations automate proven manual workflows.

The integration layer should reduce manual work, not define the product.
