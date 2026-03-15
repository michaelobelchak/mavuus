import Database from 'better-sqlite3'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import bcrypt from 'bcryptjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const db = new Database(join(__dirname, 'mavuus.db'))

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL')

// Run schema
const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8')
db.exec(schema)

// Seed users (IDs 1-12, with avatar_url)
const passwordHash = bcrypt.hashSync('demo123', 10)
const insertUser = db.prepare(`
  INSERT OR IGNORE INTO users (email, password_hash, name, title, company, avatar_url, role, membership_tier)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`)

const users = [
  ['sarah@techflow.com', passwordHash, 'Sarah Chen', 'VP of Marketing', 'TechFlow', 'https://i.pravatar.cc/150?u=sarah@techflow.com', 'member', 'pro'],
  ['marcus@growthbase.com', passwordHash, 'Marcus Johnson', 'CMO', 'GrowthBase', 'https://i.pravatar.cc/150?u=marcus@growthbase.com', 'member', 'pro'],
  ['priya@cloudscale.com', passwordHash, 'Priya Patel', 'Director of Demand Gen', 'CloudScale', 'https://i.pravatar.cc/150?u=priya@cloudscale.com', 'member', 'pro'],
  ['elena@drift.com', passwordHash, 'Elena Rodriguez', 'CMO', 'Drift', 'https://i.pravatar.cc/150?u=elena@drift.com', 'member', 'pro'],
  ['david@twilio.com', passwordHash, 'David Kim', 'SVP Marketing', 'Twilio', 'https://i.pravatar.cc/150?u=david@twilio.com', 'member', 'pro'],
  ['aisha@figma.com', passwordHash, 'Aisha Okafor', 'Head of Marketing', 'Figma', 'https://i.pravatar.cc/150?u=aisha@figma.com', 'member', 'pro'],
  ['demo@mavuus.com', passwordHash, 'Demo User', 'Marketing Director', 'Mavuus', 'https://i.pravatar.cc/150?u=demo@mavuus.com', 'admin', 'pro'],
  ['jennifer@hubspot.com', passwordHash, 'Jennifer Martinez', 'VP Marketing', 'HubSpot', 'https://i.pravatar.cc/150?u=jennifer@hubspot.com', 'member', 'pro'],
  ['alex@stripe.com', passwordHash, 'Alex Thompson', 'Head of Growth', 'Stripe', 'https://i.pravatar.cc/150?u=alex@stripe.com', 'member', 'pro'],
  ['maya@spotify.com', passwordHash, 'Maya Williams', 'Director of Brand', 'Spotify', 'https://i.pravatar.cc/150?u=maya@spotify.com', 'member', 'free'],
  ['ryan@shopify.com', passwordHash, 'Ryan Cooper', 'CMO', 'Shopify', 'https://i.pravatar.cc/150?u=ryan@shopify.com', 'member', 'pro'],
  ['lisa@notion.com', passwordHash, 'Lisa Park', 'VP Demand Gen', 'Notion', 'https://i.pravatar.cc/150?u=lisa@notion.com', 'member', 'free'],
  ['tom@datadog.com', passwordHash, 'Tom Bradley', 'Director of Marketing', 'Datadog', 'https://i.pravatar.cc/150?u=tom@datadog.com', 'member', 'pro'],
  ['nina@intercom.com', passwordHash, 'Nina Vasquez', 'VP Growth Marketing', 'Intercom', 'https://i.pravatar.cc/150?u=nina@intercom.com', 'member', 'pro'],
  ['james@amplitude.com', passwordHash, 'James Wright', 'VP Growth', 'Amplitude', 'https://i.pravatar.cc/150?u=james@amplitude.com', 'member', 'pro'],
  ['omar@canva.com', passwordHash, 'Omar Hassan', 'VP Brand', 'Canva', 'https://i.pravatar.cc/150?u=omar@canva.com', 'member', 'pro'],
  ['rachel@asana.com', passwordHash, 'Rachel Foster', 'Head of Content', 'Asana', 'https://i.pravatar.cc/150?u=rachel@asana.com', 'member', 'free'],
]

users.forEach(u => insertUser.run(...u))

// Seed sessions (live + on-demand with thumbnails and views)
const insertSession = db.prepare(`
  INSERT OR IGNORE INTO sessions (title, description, speaker_name, speaker_title, speaker_avatar, thumbnail_url, type, category, scheduled_date, duration, views)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`)

const sessions = [
  // Live sessions
  ['Building a Content Engine That Scales', 'Learn how to build a scalable content machine that drives organic growth. We\'ll cover editorial calendars, content repurposing frameworks, and team scaling strategies that took TechFlow from 3 to 30 content pieces per week.', 'Sarah Chen', 'VP of Marketing, TechFlow', 'https://i.pravatar.cc/150?u=sarah@techflow.com', 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=340&fit=crop', 'live', 'Content Strategy', '2026-03-20T14:00:00Z', '60 min', 0],
  ['ABM Playbook: From 0 to Enterprise Pipeline', 'A practical guide to implementing account-based marketing from scratch. Learn how GrowthBase built a $10M pipeline using targeted ABM strategies, intent data, and personalized outreach.', 'Marcus Johnson', 'CMO, GrowthBase', 'https://i.pravatar.cc/150?u=marcus@growthbase.com', 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=340&fit=crop', 'live', 'ABM', '2026-03-22T16:00:00Z', '45 min', 0],
  ['The Future of AI in B2B Marketing', 'Exploring how AI is reshaping demand generation and customer engagement. From predictive lead scoring to AI-generated content at scale — what\'s real and what\'s hype.', 'Priya Patel', 'Director of Demand Gen, CloudScale', 'https://i.pravatar.cc/150?u=priya@cloudscale.com', 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=340&fit=crop', 'live', 'AI & Tech', '2026-03-25T15:00:00Z', '60 min', 0],
  ['Product-Led Growth for B2B Marketers', 'How to align marketing with product-led growth motions. Covers free trial optimization, activation funnels, and the role of marketing in PLG companies.', 'Alex Thompson', 'Head of Growth, Stripe', 'https://i.pravatar.cc/150?u=alex@stripe.com', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=340&fit=crop', 'live', 'Growth', '2026-03-28T17:00:00Z', '50 min', 0],
  // On-demand sessions
  ['Mastering LinkedIn Ads for B2B', 'Deep dive into LinkedIn advertising strategies that drive quality leads. Learn campaign structure, audience targeting, creative best practices, and budget optimization techniques that reduced our CPL by 40%.', 'Elena Rodriguez', 'CMO, Drift', 'https://i.pravatar.cc/150?u=elena@drift.com', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=340&fit=crop', 'on-demand', 'Paid Media', null, '42 min', 1240],
  ['Brand Storytelling Workshop', 'Craft compelling brand narratives that resonate with your audience. This hands-on workshop covers story frameworks, emotional positioning, and how to translate brand values into marketing campaigns that convert.', 'Omar Hassan', 'VP Brand, Canva', 'https://i.pravatar.cc/150?u=omar@canva.com', 'https://images.unsplash.com/photo-1523289333742-be1143f6b766?w=600&h=340&fit=crop', 'on-demand', 'Branding', null, '55 min', 2870],
  ['Data-Driven Campaign Optimization', 'Use analytics and data to continuously improve campaign performance. Learn attribution modeling, multi-touch analysis, and how to build dashboards that give actionable insights to your entire team.', 'James Wright', 'VP Growth, Amplitude', 'https://i.pravatar.cc/150?u=james@amplitude.com', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=340&fit=crop', 'on-demand', 'Analytics', null, '38 min', 956],
  ['SEO Strategy for B2B SaaS in 2026', 'A comprehensive look at modern B2B SEO — from programmatic pages to AI-powered content briefs. Covers technical SEO audits, content clusters, and link building strategies that moved Asana from page 3 to page 1.', 'Rachel Foster', 'Head of Content, Asana', 'https://i.pravatar.cc/150?u=rachel@asana.com', 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=600&h=340&fit=crop', 'on-demand', 'SEO', null, '47 min', 1830],
  ['Retention Marketing Masterclass', 'How to reduce churn and increase LTV through lifecycle marketing. Covers email nurture sequences, in-app messaging, customer health scoring, and win-back campaigns that recovered 15% of churned accounts.', 'Ryan Cooper', 'CMO, Shopify', 'https://i.pravatar.cc/150?u=ryan@shopify.com', 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=600&h=340&fit=crop', 'on-demand', 'Growth', null, '51 min', 2150],
  ['Building a Marketing Tech Stack That Scales', 'Navigate the martech landscape and build a stack that grows with your company. Covers evaluation frameworks, integration strategies, and how to avoid the common pitfalls of tool sprawl.', 'Nina Vasquez', 'VP Growth Marketing, Intercom', 'https://i.pravatar.cc/150?u=nina@intercom.com', 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=340&fit=crop', 'on-demand', 'MarTech', null, '44 min', 1580],
  // Additional on-demand sessions
  ['Scaling Organic Growth Without Burning Out Your Team', 'Discover sustainable growth strategies that compound over time without exhausting your marketing team. Learn frameworks for prioritizing high-impact initiatives, automating repetitive workflows, and building a growth engine that runs on systems rather than heroics.', 'Danielle Park', 'VP of Growth, Notion', 'https://i.pravatar.cc/150?u=danielle@notion.com', 'https://picsum.photos/seed/video7/800/450', 'on-demand', 'Growth', null, '48 min', 2340],
  ['Rebranding in Public: Lessons from a $500M Company Rebrand', 'A candid behind-the-scenes look at what it takes to rebrand a well-known B2B company while keeping customers, employees, and investors aligned. Covers timeline planning, stakeholder management, creative development, and the rollout strategy that kept churn below 1%.', 'Tomás Guerrero', 'Chief Brand Officer, Zendesk', 'https://i.pravatar.cc/150?u=tomas@zendesk.com', 'https://picsum.photos/seed/video8/800/450', 'on-demand', 'Brand', null, '55 min', 1870],
  ['Content Repurposing at Scale: One Idea, Ten Formats', 'Stop creating content from scratch every time. This session walks through a repeatable content atomization framework that turns a single piece of long-form content into ten or more assets across channels — blog posts, social snippets, email sequences, video clips, and more.', 'Keiko Tanaka', 'Head of Content, HubSpot', 'https://i.pravatar.cc/150?u=keiko@hubspot.com', 'https://picsum.photos/seed/video9/800/450', 'on-demand', 'Content', null, '37 min', 2780],
  ['Marketing Attribution Beyond Last Touch', 'Multi-touch attribution is broken — but you still need to prove ROI. This session explores practical alternatives including incrementality testing, media mix modeling, and self-reported attribution. Learn how top B2B teams are measuring what actually drives pipeline in a privacy-first world.', 'Andre Williams', 'VP Analytics, Salesforce', 'https://i.pravatar.cc/150?u=andre@salesforce.com', 'https://picsum.photos/seed/video10/800/450', 'on-demand', 'Analytics', null, '42 min', 1560],
  ['Technical SEO for B2B: Beyond the Basics', 'Go past keyword research and on-page optimization into the technical foundations that separate page-one results from the rest. Covers site architecture for enterprise sites, Core Web Vitals optimization, JavaScript rendering strategies, and international SEO structures that doubled organic traffic at Moz.', 'Laura Chen', 'Director of SEO, Moz', 'https://i.pravatar.cc/150?u=laura@moz.com', 'https://picsum.photos/seed/video11/800/450', 'on-demand', 'SEO', null, '52 min', 980],
  ['Launching Products That Stick: A Product Marketing Masterclass', 'Most product launches fail to move the needle. This masterclass covers the end-to-end product launch process — from positioning and messaging to sales enablement and post-launch measurement. Includes real examples from launches that generated over $20M in first-year pipeline.', 'Simone Adler', 'VP of Product Marketing, Slack', 'https://i.pravatar.cc/150?u=simone@slack.com', 'https://picsum.photos/seed/video12/800/450', 'on-demand', 'Product Marketing', null, '60 min', 2150],
]

sessions.forEach(s => insertSession.run(...s))

// Seed resources (with content and thumbnails)
const insertResource = db.prepare(`
  INSERT OR IGNORE INTO resources (title, description, content, author, thumbnail_url, category, type, read_time)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`)

const resources = [
  [
    'The Ultimate Marketing Budget Template',
    'A comprehensive spreadsheet template for planning and tracking your marketing budget across channels.',
    `Planning your marketing budget doesn't have to be a headache. This template breaks down budget allocation across all major channels — paid media, content, events, tools, and team — so you can plan with confidence.

## What's Included

- **Channel Allocation Worksheet**: Pre-built formulas for distributing budget across paid, organic, events, and brand channels based on industry benchmarks.
- **Monthly Tracking Sheet**: Track actual spend vs. planned spend with automatic variance calculations and visual charts.
- **ROI Calculator**: Input your conversion metrics to see projected ROI by channel, helping you make data-driven reallocation decisions.
- **Headcount Planner**: Model different team sizes and their impact on your overall budget, including salary bands by role and region.

## How to Use It

1. Start with your total annual budget in the Summary tab.
2. Use the Channel Allocation sheet to distribute based on your growth stage (we include benchmarks for Seed, Series A, Series B+, and Enterprise).
3. Update the Monthly Tracking sheet as you spend — the dashboard updates automatically.
4. Review quarterly and use the ROI Calculator to optimize future allocations.

This template has been used by 200+ marketing leaders in the Mavuus community and is updated quarterly with the latest benchmark data.`,
    'Mavuus Team',
    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=340&fit=crop',
    'Template',
    'template',
    '5 min read',
  ],
  [
    'State of B2B Marketing 2026 Report',
    'Key insights and trends from surveying 500+ marketing leaders across industries.',
    `Our annual survey of 500+ marketing leaders reveals shifting priorities, emerging channels, and the strategies driving the most pipeline growth in 2026.

## Key Findings

### 1. AI Adoption Has Reached a Tipping Point
78% of marketing teams now use AI tools daily, up from 34% in 2024. The biggest use cases are content generation (62%), personalization (55%), and predictive analytics (48%). However, only 23% have a formal AI governance policy in place.

### 2. Community-Led Growth Is the Fastest-Growing Channel
Community programs are now the #3 pipeline source for B2B companies, behind only organic search and paid media. Companies with active community programs report 2.3x higher retention rates and 40% lower CAC.

### 3. Budget Shifts Toward Brand
After years of heavy performance marketing investment, 61% of CMOs are increasing brand spend in 2026. The average brand-to-demand ratio has shifted from 30/70 to 40/60, with enterprise companies leading the way at 50/50.

### 4. The Rise of the Revenue Marketing Leader
Marketing leaders are increasingly measured on revenue outcomes rather than MQL targets. 67% now have direct pipeline or revenue targets, and the CMO role is more likely to report to the CEO (72%) than ever before.

### 5. Content Quality Over Quantity
Despite AI enabling more content production, top-performing teams are producing fewer, higher-quality pieces. The average top-quartile team publishes 60% fewer articles but generates 3x more organic traffic per piece.

## Methodology

We surveyed 523 marketing leaders (VP+ level) across SaaS, Fintech, Healthcare, and E-commerce between January and February 2026. Respondents represent companies ranging from $5M to $500M+ in annual revenue.`,
    'Mavuus Research',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=340&fit=crop',
    'Report',
    'guide',
    '15 min read',
  ],
  [
    'How to Build a Marketing Team from Scratch',
    'A step-by-step guide to hiring, structuring, and scaling your marketing organization.',
    `Building a marketing team from zero is one of the most impactful things a startup leader can do — and one of the easiest to get wrong. This guide walks you through the stages of team building, from your first marketing hire to a 20-person org.

## Stage 1: The First Hire (You + 1)

Your first marketing hire should be a generalist — someone who can write, run campaigns, and analyze data. Don't hire a specialist first. Look for someone with 3-5 years of experience who has worked at a similar-stage company.

**Key qualities to look for:**
- Strong writing skills (ask for samples)
- Comfortable with data and analytics tools
- Self-directed and entrepreneurial
- Experience with your target audience

## Stage 2: Building the Core (3-5 people)

Once you've validated your channels, start adding specialists. A typical Series A marketing team looks like:
- **Content Marketer**: Owns blog, SEO, and thought leadership
- **Demand Gen Manager**: Owns paid channels, email, and lead flow
- **Marketing Ops / Analytics**: Owns the tech stack, reporting, and attribution
- **Designer (or agency)**: Produces creative assets across channels

## Stage 3: Scaling Up (6-15 people)

At this stage, you're adding team leads and going deeper into channels:
- Hire a Head of Marketing or VP to manage the team
- Add product marketing to support sales enablement
- Build out content with dedicated writers and an editor
- Consider brand marketing if you're entering new markets

## Stage 4: The Full Org (15-30+ people)

Now you're building specialized teams with managers:
- Content team (4-6 people with an editorial lead)
- Demand gen team (3-5 people across channels)
- Product marketing team (2-4 people by product line)
- Brand and creative team (2-4 people)
- Marketing ops and analytics (2-3 people)
- Events and community (1-2 people)

## Common Mistakes to Avoid

1. **Hiring too senior too early** — A VP with no team to manage will get frustrated
2. **Hiring too many specialists** — You need generalists until you have channel-market fit
3. **Ignoring culture** — Your first 5 hires set the tone for the entire org
4. **Not investing in ops early** — Without good data infrastructure, you can't measure anything`,
    'Rachel Foster',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=340&fit=crop',
    'Guide',
    'article',
    '10 min read',
  ],
  [
    'The CMO\'s Guide to Board Reporting',
    'How to create board-ready marketing reports that demonstrate business impact and earn executive trust.',
    `Most CMOs dread board meetings. The questions feel adversarial, the metrics feel insufficient, and the time is always too short. This guide helps you build a reporting framework that tells your story clearly.

## The Framework: Impact, Efficiency, Momentum

Every board report should cover three areas:

### Impact
What did marketing contribute to the business?
- Pipeline generated and influenced ($$)
- Revenue attributed to marketing
- Customer acquisition cost (CAC) and trends
- Marketing-sourced vs. sales-sourced pipeline ratio

### Efficiency
Are we spending wisely?
- CAC payback period
- Channel-level ROI
- Budget utilization vs. plan
- Cost per opportunity by channel

### Momentum
Are we building for the future?
- Brand awareness metrics (share of voice, branded search)
- Content engagement trends
- Community growth and engagement
- Pipeline coverage ratio for next quarter

## Tips for the Presentation

1. **Lead with the number they care about most** — usually pipeline or revenue contribution
2. **Show trends, not snapshots** — 3-quarter trend lines beat single data points
3. **Address the elephant in the room** — if something isn't working, say so before they ask
4. **Keep it to 5-7 slides** — if you need more, you're not being focused enough
5. **Have a "deep dive" appendix** — for when board members want to drill into specifics`,
    'Marcus Johnson',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=340&fit=crop',
    'Guide',
    'guide',
    '12 min read',
  ],
  [
    'ABM Campaign Playbook: Enterprise Edition',
    'A step-by-step playbook for running account-based marketing campaigns targeting enterprise accounts.',
    `Account-based marketing is the most effective strategy for landing enterprise deals — but only if you do it right. This playbook covers the entire ABM lifecycle from account selection to closed-won attribution.

## Phase 1: Account Selection

Start with your ICP (Ideal Customer Profile) and use these data sources to build your target account list:
- **Firmographic data**: Industry, company size, revenue, geography
- **Technographic data**: What tools they currently use (check with your sales team or use tools like BuiltWith)
- **Intent data**: Are they actively researching your category? Use Bombora, G2, or TrustRadius intent signals
- **Relationship data**: Do you have any warm connections? Check LinkedIn and your CRM

**Pro tip**: Start with 25-50 accounts, not 500. Quality over quantity.

## Phase 2: Research & Personalization

For each target account, build a brief that covers:
- Key stakeholders and their roles
- Current challenges (check earnings calls, press releases, job postings)
- Competitive landscape
- Potential use cases for your product

## Phase 3: Multi-Channel Orchestration

Run coordinated campaigns across:
- **LinkedIn Ads**: Targeted by company name and job title
- **Direct mail**: Personalized gifts or content packages
- **Email sequences**: Personalized outreach from SDRs
- **Content**: Custom landing pages and case studies
- **Events**: Invite to exclusive dinners or webinars

## Phase 4: Measurement

Track these ABM-specific metrics:
- Account engagement score (across all channels)
- Pipeline created from target accounts
- Deal velocity vs. non-ABM deals
- Win rate vs. non-ABM deals
- Average deal size vs. non-ABM deals`,
    'Jennifer Martinez',
    'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&h=340&fit=crop',
    'Playbook',
    'guide',
    '14 min read',
  ],
  [
    'Marketing Analytics Dashboard Template',
    'Build a marketing analytics dashboard that your whole team will actually use. Includes KPI frameworks and visualization best practices.',
    `A good dashboard tells you what's working, what's not, and what to do about it — in under 30 seconds. Here's how to build one.

## The 4-Layer Dashboard Framework

### Layer 1: Executive Summary (1 page)
- Total pipeline generated (this month vs. last month vs. target)
- Marketing-sourced revenue
- CAC trend (3-month rolling average)
- Top 3 wins and top 3 risks

### Layer 2: Channel Performance (1 page per channel)
For each channel (Paid, Organic, Email, Events, etc.):
- Spend and budget utilization
- Key volume metrics (impressions, clicks, leads)
- Conversion rates at each funnel stage
- Cost per lead / cost per opportunity
- Month-over-month trends

### Layer 3: Campaign Deep Dives
Individual campaign performance with:
- A/B test results
- Audience segment breakdowns
- Creative performance rankings
- Attribution by touch point

### Layer 4: Operational Metrics
- Lead response time
- MQL-to-SQL conversion rate and velocity
- Content production velocity
- Tech stack utilization rates

## Visualization Best Practices

1. **Use sparklines** for trends — they convey direction without taking up space
2. **Color code to targets** — green/yellow/red makes status instantly clear
3. **Limit to 6-8 metrics per view** — cognitive overload kills dashboards
4. **Update automatically** — if people have to manually refresh, they won't use it`,
    'James Wright',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=340&fit=crop',
    'Template',
    'template',
    '8 min read',
  ],
  // Additional resources
  [
    'The Content Strategy Playbook for Lean Teams',
    'How to produce high-impact content with a small team by focusing on strategy, systems, and smart repurposing.',
    `Running content marketing with a lean team is not about doing less — it is about doing the right things. This playbook shows you how to build a content strategy that punches above its weight, even with limited headcount and budget.

**Why Most Small Teams Struggle with Content**

The biggest mistake lean content teams make is trying to compete with larger organizations on volume. You will never out-publish a team with ten writers, and you should not try. Instead, focus on creating fewer pieces that are significantly better than anything else in your space. Depth, originality, and distribution are your competitive advantages.

**Step 1: Define Your Content Pillars**

Start by identifying three to five core topics that sit at the intersection of what your audience cares about and what your product solves. These pillars should be broad enough to generate dozens of subtopics but specific enough that you can build genuine authority. For example, if you sell a project management tool, your pillars might be remote team productivity, agile workflows, and cross-functional collaboration.

- Map each pillar to a stage in the buyer journey (awareness, consideration, decision)
- Assign ownership of each pillar to a team member
- Create a keyword universe for each pillar using tools like Ahrefs or SEMrush
- Build a quarterly editorial calendar with two to three pieces per pillar per month

**Step 2: Create Cornerstone Content First**

Each pillar should have one comprehensive cornerstone piece — a definitive guide, original research report, or interactive tool that becomes the anchor for everything else. These pieces should be 3,000 to 5,000 words, thoroughly researched, and better than anything else ranking for the same terms.

**Step 3: Atomize Everything**

Once you have a cornerstone piece, break it into smaller assets. A single 4,000-word guide can yield a LinkedIn carousel summarizing the key frameworks, three to five blog posts diving deeper into individual sections, an email nurture sequence introducing each concept over a week, pull quotes and statistics formatted as social media graphics, and a short video walkthrough covering the highlights.

**Step 4: Build Distribution Into Your Process**

Content without distribution is just a file on a server. Allocate at least 30 percent of your content time to distribution. This includes sharing on social channels multiple times with different angles, submitting to relevant newsletters and communities, repurposing into guest posts for partner blogs, sending to your email list segmented by interest, and having your sales team share relevant pieces with prospects.

**Step 5: Measure and Iterate**

Track these metrics monthly to understand what is working. Monitor organic traffic by pillar to see which topics resonate, track conversion rate from content to email subscriber or demo request, measure time on page and scroll depth to gauge content quality, and watch social engagement rates to understand what your audience shares.

Review your metrics quarterly and double down on what works. Kill content formats that consistently underperform and reallocate that time to your winners.

**Common Traps to Avoid**

First, do not chase trends at the expense of your pillars. It is tempting to write about the hot topic of the week, but consistency in your core topics builds compounding authority. Second, do not skip the editing process. One well-edited piece outperforms three rushed ones. Third, do not neglect internal linking. Every new piece should link to and from your cornerstone content, strengthening your topical authority signals.`,
    'Keiko Tanaka',
    'https://picsum.photos/seed/resource7/800/450',
    'Content Strategy',
    'guide',
    '12 min read',
  ],
  [
    'Growth Experimentation Framework for B2B',
    'A structured approach to running growth experiments that generate learnings and pipeline, not just vanity metrics.',
    `Growth in B2B does not happen by accident. The most effective marketing teams treat growth as a disciplined practice of hypothesis formation, experimentation, measurement, and iteration. This framework gives you the structure to run experiments that actually move the needle.

**The Problem with Ad Hoc Growth Tactics**

Most B2B teams approach growth in one of two dysfunctional ways. Either they copy tactics they saw at a conference without adapting them to their context, or they run scattered experiments without a clear hypothesis or measurement plan. Both approaches waste time and budget while producing unreliable results.

**The Experiment Lifecycle**

Every growth experiment should follow five stages: Hypothesis, Design, Execution, Analysis, and Documentation.

**Stage 1: Hypothesis Formation**

A good hypothesis has three components — an observation about current performance, a proposed change, and a predicted outcome. For example: We have observed that our trial-to-paid conversion rate drops significantly after day three. We believe that adding an in-app onboarding checklist will increase activation. We predict this will improve trial-to-paid conversion by 15 percent within 30 days.

- Base hypotheses on data, not gut feelings
- Prioritize experiments using an ICE framework (Impact, Confidence, Ease)
- Maintain a backlog of at least 20 experiment ideas at all times
- Limit active experiments to three to five at a time to maintain rigor

**Stage 2: Experiment Design**

Before you start building anything, document the following details. Define the specific metric you are trying to move and what constitutes success. Determine sample size requirements and experiment duration. Identify control and variant groups. List potential confounding variables and how you will account for them. Specify who owns execution and who owns analysis.

**Stage 3: Execution**

Run the experiment with discipline. Do not change variables mid-experiment. Ensure tracking is properly implemented before launch. Communicate with sales and customer success so they are not surprised by what prospects or customers experience. Set calendar reminders for check-in points and the final analysis date.

**Stage 4: Analysis**

When the experiment concludes, analyze results honestly. Check for statistical significance before drawing conclusions. Look at secondary metrics to understand the full impact. Consider whether external factors may have influenced results. Document both what you expected and what actually happened.

**Stage 5: Documentation**

This is the most skipped and most important step. Create a one-page experiment brief that covers the original hypothesis, what you did, the results with supporting data, what you learned, and what you will do next. Store these briefs in a shared experiment library that the whole team can reference.

**Building an Experimentation Culture**

The framework only works if your team embraces experimentation as a core practice. Celebrate learnings from failed experiments, not just wins. Share experiment results in weekly team meetings. Give team members autonomy to propose and run their own experiments. Track your experiment velocity as a team KPI — aim for 8 to 12 completed experiments per quarter.

**Metrics That Matter**

Focus your experiments on metrics that directly impact revenue. Pipeline velocity measures how fast deals move through stages. Activation rate tracks the percentage of new users who reach a key value moment. Expansion revenue measures upsell and cross-sell influenced by marketing. Win rate improvement tracks the impact of sales enablement experiments.`,
    'Andre Williams',
    'https://picsum.photos/seed/resource8/800/450',
    'Growth',
    'article',
    '14 min read',
  ],
  [
    'Marketing Analytics Maturity Model',
    'Assess where your marketing analytics practice stands today and build a roadmap to data-driven decision making.',
    `Most marketing teams think they are more data-driven than they actually are. This maturity model helps you honestly assess your current analytics capabilities and provides a clear path to improvement across five stages of maturity.

**Stage 1: Reactive Reporting**

At this stage, analytics is mostly backward-looking and manual. Someone pulls numbers into a spreadsheet when leadership asks for them. There is no consistent cadence, no standard definitions, and different people often report different numbers for the same metric.

Signs you are at Stage 1 include spending more than two hours per week compiling marketing reports manually, having no agreed-upon definitions for key terms like MQL or marketing-sourced pipeline, relying on platform-native dashboards without any centralization, and not tracking marketing influence on revenue at all.

How to move to Stage 2: Start by agreeing on definitions. Get marketing, sales, and finance in a room and align on what counts as a lead, an MQL, an opportunity, and marketing-sourced versus marketing-influenced pipeline. Document these definitions and make them accessible to everyone.

**Stage 2: Consistent Tracking**

Your team now has agreed-upon metrics and a regular reporting cadence. You have basic dashboards that update automatically, and you can answer questions like how much pipeline marketing generated last month without scrambling.

Key capabilities at this stage include a weekly or monthly reporting cadence with consistent metrics, basic funnel tracking from lead to opportunity, channel-level spend and performance tracking, and simple attribution using first-touch or last-touch models.

How to move to Stage 3: Invest in your data infrastructure. Connect your CRM, marketing automation, and advertising platforms into a central data warehouse. Hire or train someone who can build and maintain data pipelines.

**Stage 3: Integrated Analytics**

Data from multiple systems flows into a central location, and you can analyze the full customer journey rather than isolated channel metrics. You start to understand how channels interact and influence each other.

Key capabilities include a centralized data warehouse connecting marketing, sales, and product data, multi-touch attribution models providing credit across the funnel, cohort analysis tracking customer behavior over time, and automated alerting when key metrics deviate from targets.

How to move to Stage 4: Start using data to predict, not just report. Build models that forecast pipeline based on current activity levels and historical conversion rates.

**Stage 4: Predictive Analytics**

Your team uses data to forecast future outcomes and make proactive decisions. You can predict pipeline shortfalls before they happen and reallocate resources accordingly. Marketing planning is driven by models rather than intuition.

Key capabilities include pipeline forecasting models with 85 percent or higher accuracy, predictive lead scoring that prioritizes based on likelihood to convert, scenario planning for budget allocation using historical data, and churn prediction models that trigger proactive outreach.

**Stage 5: Prescriptive Analytics**

At the highest level of maturity, your analytics practice does not just predict what will happen — it recommends what to do about it. Machine learning models optimize channel mix in real time, content recommendations are personalized based on behavioral data, and budget reallocation happens dynamically based on performance signals.

Few teams reach this stage fully, but the organizations that do see dramatically better efficiency and predictability in their marketing performance.

**Assessment Checklist**

Rate your team on each of the following dimensions from one to five. Data infrastructure covers how well your systems are connected and how accessible your data is. Metric alignment measures whether the whole organization agrees on definitions and targets. Reporting cadence assesses how regularly and reliably you report on marketing performance. Attribution sophistication evaluates how well you understand which activities drive results. Predictive capability measures your ability to forecast outcomes and take proactive action.

Add up your scores. A total of 5 to 10 indicates Stage 1, 11 to 15 indicates Stage 2, 16 to 20 indicates Stage 3, and 21 to 25 indicates Stages 4 or 5. Use this assessment quarterly to track your progress.`,
    'James Wright',
    'https://picsum.photos/seed/resource9/800/450',
    'Analytics',
    'guide',
    '15 min read',
  ],
  [
    'Building a B2B Brand That Commands Premium Pricing',
    'Why brand investment is the most underleveraged growth lever in B2B, and how to build one that justifies higher prices.',
    `In B2B marketing, brand is often treated as a nice-to-have — something you invest in after the demand gen machine is humming. This is backwards. A strong brand does not just build awareness. It reduces sales cycles, increases win rates, and lets you charge more than competitors. Here is how to build one.

**The Business Case for Brand Investment**

B2B buyers are not the rational decision-makers we pretend they are. Research from LinkedIn's B2B Institute shows that emotional factors drive B2B purchase decisions just as much as rational ones. Buyers choose vendors they trust, recognize, and feel good about — especially when the stakes are high and the products are complex.

Companies with strong brands enjoy measurable advantages. They see 20 to 30 percent higher win rates in competitive deals. Their sales cycles are 15 to 25 percent shorter because trust is established earlier. They can charge 10 to 20 percent price premiums versus undifferentiated competitors. They experience lower customer acquisition costs because reputation does the heavy lifting. And they attract better talent, which compounds all of the above.

**The Three Pillars of B2B Brand Building**

A strong B2B brand rests on three pillars: Positioning, Consistency, and Distinctiveness.

**Pillar 1: Positioning That Resonates**

Your positioning must answer three questions clearly. What category do you compete in? How are you different from alternatives? Why should your specific audience care? The best B2B positioning is simple enough that any employee can articulate it and specific enough that it excludes customers who are not a good fit.

Avoid the trap of positioning by features. Features are easy to copy and hard to remember. Instead, position around the outcome you deliver or the belief you hold about how your category should work. Salesforce positioned around the end of on-premise software before the product was mature. Slack positioned around the end of email overload. These positions created categories, not just products.

**Pillar 2: Consistency Across Every Touchpoint**

Brand consistency is not just about using the same logo and colors — though that matters. It is about delivering a consistent experience, tone, and message everywhere a prospect or customer encounters you. This includes your website, sales decks, email sequences, customer support interactions, social media presence, event booths, and even your job postings.

Create a brand guidelines document that covers visual identity including logo, color, typography, and photography style. Define your voice and tone with examples of how you sound in different contexts. Establish messaging frameworks including your value proposition, proof points, and objection handling. And provide templates for common assets so that everyone on the team produces on-brand work without needing designer approval for every piece.

**Pillar 3: Distinctiveness That Gets Remembered**

Most B2B brands look and sound identical to their competitors. Blue logos, stock photography of diverse teams in conference rooms, and messaging about being the leading platform for something. If you swapped the logo on most B2B websites, nobody would notice. This is a massive missed opportunity.

Distinctive brand assets — unique colors, visual styles, characters, sounds, or phrases — create mental shortcuts that help buyers remember you when they enter a buying cycle. Think about the brands you remember most easily. They look and sound like nobody else in their category.

Invest in at least two to three distinctive brand assets. A signature color that is different from your category default. A visual style for illustrations or photography that is immediately recognizable. A verbal device like a tagline, naming convention, or editorial voice that stands out. These assets take time to build recognition, so commit to them for years rather than changing with every campaign.

**Measuring Brand Impact**

Brand investment is notoriously hard to measure, but it is not impossible. Track these metrics over time. Share of voice measures your brand mentions relative to competitors across media, social, and analyst coverage. Branded search volume tracks how many people search for your company name each month — this is a direct proxy for awareness. Win rate improvement in competitive deals shows whether brand recognition is giving your sales team an edge. Inbound pipeline percentage measures the proportion of pipeline that comes to you rather than requiring outbound outreach. And premium pricing sustainability tracks whether you can maintain or increase prices without losing deal volume.

Brand building is a long game. Expect to invest consistently for 12 to 18 months before seeing significant movement in these metrics. But when the flywheel starts spinning, the compound returns make it one of the highest-ROI investments in marketing.`,
    'Tomás Guerrero',
    'https://picsum.photos/seed/resource10/800/450',
    'Brand',
    'article',
    '13 min read',
  ],
  [
    'Technical SEO Audit Checklist for B2B Websites',
    'A comprehensive checklist to identify and fix the technical SEO issues that are costing your B2B site organic traffic and pipeline.',
    `Technical SEO is the foundation everything else is built on. You can have the best content in the world, but if search engines cannot crawl, index, and render your pages efficiently, you are leaving traffic and pipeline on the table. This checklist covers the most common and impactful technical SEO issues we see on B2B websites.

**Section 1: Crawlability and Indexation**

Search engines need to discover and access your pages before they can rank them. Start your audit here because problems in this section make everything else irrelevant.

Check your robots.txt file to ensure you are not accidentally blocking important pages or directories. We have seen B2B sites accidentally block their entire blog or product pages through overly aggressive robots.txt rules. Review your XML sitemap to confirm it includes all important pages, excludes pages you do not want indexed like thank-you pages or internal search results, returns a 200 status code, and is referenced in your robots.txt file. Verify your site has no orphan pages — pages that exist but are not linked from anywhere on the site. These pages are difficult for search engines to discover and typically receive very little organic traffic.

Run a crawl using Screaming Frog or Sitebulb and check for the following issues. Pages returning 4xx or 5xx status codes need to be fixed or redirected. Redirect chains where one redirect points to another redirect should be simplified to direct redirects. Pages with noindex tags should be reviewed to ensure you intentionally want them excluded from search results. And canonical tags should be checked to make sure they point to the correct preferred version of each page.

**Section 2: Site Speed and Core Web Vitals**

Google uses page experience signals as a ranking factor, and slow sites also hurt conversion rates. B2B sites are particularly susceptible to speed issues because of heavy JavaScript frameworks, unoptimized images, and third-party scripts from analytics, chat widgets, and tracking tools.

Measure your Core Web Vitals using Google PageSpeed Insights or the Chrome User Experience Report. Focus on three metrics. Largest Contentful Paint measures how quickly the main content loads and should be under 2.5 seconds. First Input Delay measures interactivity and should be under 100 milliseconds. Cumulative Layout Shift measures visual stability and should be under 0.1.

Common fixes for B2B sites include implementing lazy loading for images below the fold, deferring non-critical JavaScript especially third-party scripts, using a CDN for static assets, compressing images and serving them in modern formats like WebP or AVIF, and reducing the number of render-blocking resources in the document head.

**Section 3: Site Architecture and Internal Linking**

How your site is structured affects both crawlability and the distribution of link authority across your pages. A flat architecture where important pages are reachable within three clicks from the homepage performs better than deeply nested structures.

Review your URL structure for consistency and clarity. URLs should be descriptive, use hyphens rather than underscores, and follow a logical hierarchy. Avoid dynamically generated URLs with excessive query parameters. Check your internal linking strategy to ensure that high-priority pages receive the most internal links. Your cornerstone content and product pages should be linked from multiple relevant pages throughout the site. Use descriptive anchor text rather than generic phrases like click here or learn more.

**Section 4: Structured Data and Rich Results**

Structured data helps search engines understand the content and context of your pages, which can lead to rich results in search that improve click-through rates. For B2B sites, the most relevant schema types include Organization schema on your homepage with company name, logo, and social profiles. FAQ schema on product pages and help articles to capture featured snippet opportunities. Article schema on blog posts with author, date published, and date modified. BreadcrumbList schema to enhance navigation display in search results. And JobPosting schema if you have a careers page, which can surface listings in Google for Jobs.

**Section 5: International and Multi-Language Considerations**

If your B2B site serves multiple countries or languages, implement hreflang tags correctly to ensure the right version of each page appears in the right regional search results. Incorrect hreflang implementation is one of the most common technical SEO errors on international B2B sites. Ensure each language version has a self-referencing hreflang tag, all hreflang annotations are reciprocal between language versions, you include an x-default tag pointing to your primary version, and hreflang tags are implemented consistently either in the HTML head, HTTP headers, or XML sitemap.

**Post-Audit Action Plan**

After completing the audit, prioritize fixes using this framework. Critical issues that are blocking indexation or causing significant traffic loss should be fixed immediately. High-impact issues affecting site speed or large sections of the site should be addressed within two weeks. Medium-impact issues that represent optimization opportunities should be scheduled within the current quarter. Low-impact issues that are nice-to-have improvements can be added to the backlog. Run this audit quarterly to catch new issues before they compound.`,
    'Laura Chen',
    'https://picsum.photos/seed/resource11/800/450',
    'SEO',
    'guide',
    '15 min read',
  ],
  [
    'The Marketing Campaign Brief Template',
    'A ready-to-use campaign brief template that aligns creative, demand gen, and product marketing teams before a single asset is produced.',
    `A great campaign starts with a great brief. Without one, teams waste time building the wrong things, creative goes off-strategy, and launches miss their targets. This template has been battle-tested across hundreds of B2B campaigns and ensures everyone is aligned before work begins.

**Why Briefs Matter More Than You Think**

The number one reason campaigns underperform is not bad creative or insufficient budget — it is misalignment. The demand gen team optimizes for leads while the brand team optimizes for awareness. Product marketing wants to highlight features while creative wants to tell a story. The brief is where these tensions get resolved, before anyone opens a design tool or writes a single line of copy.

A good brief takes two to four hours to write and saves dozens of hours of rework, misaligned feedback, and missed deadlines. It is the single highest-leverage document in the campaign process.

**Section 1: Campaign Overview**

Start every brief with the basics. Give the campaign a working name that the whole team can reference. State the business objective in one sentence — for example, generate 500 marketing-qualified leads for the new enterprise product tier in Q2. Define the campaign type, whether it is a product launch, seasonal promotion, thought leadership play, or event-driven campaign. List the campaign owner and key stakeholders by name.

**Section 2: Target Audience**

Define exactly who you are trying to reach. Specify the primary persona including their job title, seniority level, company size, and industry. Describe their key pain points that this campaign addresses — be specific rather than generic. Explain what they are currently doing about this problem today, whether that is using a competitor, using an internal workaround, or doing nothing. And define the desired action you want them to take after encountering the campaign, such as requesting a demo, downloading a resource, or attending an event.

**Section 3: Messaging and Positioning**

This section prevents the most common source of campaign misalignment. State the single most important message. If the audience remembers only one thing from this campaign, what should it be? Write this in one sentence. Provide three supporting proof points — data, customer quotes, or product capabilities that back up the main message. Define the tone of voice for this campaign with specific examples of what it should and should not sound like. And note any messaging guardrails, including claims you cannot make, competitors you should not name, or topics to avoid.

**Section 4: Channel Strategy and Asset List**

Map out every channel and asset the campaign requires. For each channel, define the specific asset needed, the format and dimensions, the audience targeting parameters, the budget allocation, and the owner responsible for production. Common B2B campaign channels include paid social on LinkedIn and Meta, search advertising for branded and non-branded terms, email marketing to segmented lists, organic social across company and employee channels, content marketing including blog posts and resources, webinars or virtual events, direct mail for high-value accounts, and sales enablement materials.

**Section 5: Timeline and Milestones**

Work backward from the launch date. Define key milestones including brief approval date, creative concept review date, first draft review for all assets, final approval date, build and QA period, launch date, and mid-campaign optimization check-in. Build in buffer time. Campaigns always take longer than planned, especially when multiple teams are involved. Add 20 percent buffer to your initial timeline estimate.

**Section 6: Budget**

Break budget into three categories. Media spend covers paid distribution across channels. Production costs cover design, copywriting, video, and development. Tools and technology covers any software or platform costs specific to this campaign. Include a contingency line of 10 to 15 percent for unplanned needs that inevitably arise.

**Section 7: Success Metrics**

Define how you will measure success before the campaign launches, not after. List primary KPIs with specific numeric targets and a measurement timeframe. List secondary metrics you will monitor but that are not the primary measure of success. Define what constitutes a successful campaign, what would be a home run, and what would be a failure. Specify when and how you will report on results and who is responsible for the post-campaign analysis.

**How to Use This Template**

The campaign owner fills out the brief and circulates it for feedback from all stakeholders before any production begins. Schedule a 30-minute brief review meeting where everyone can ask questions and raise concerns. Do not start creative work until the brief is signed off by all stakeholders. If the strategy changes mid-campaign, update the brief and re-circulate rather than relying on verbal communication.

Save completed briefs in a shared folder so the team can reference past campaigns when planning new ones. Over time, this library becomes an invaluable resource for understanding what worked and why.`,
    'Mavuus Team',
    'https://picsum.photos/seed/resource12/800/450',
    'Template',
    'template',
    '10 min read',
  ],
]

resources.forEach(r => insertResource.run(...r))

// Seed vendors (expanded)
const insertVendor = db.prepare(`
  INSERT OR IGNORE INTO vendors (company_name, description, categories, rating, reviews_count, location, website)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`)

const vendorData = [
  ['ContentPro Agency', 'Full-service content marketing agency specializing in B2B SaaS companies. From strategy to execution, we help you build a content engine that drives organic pipeline.', 'Content Marketing,SEO', 4.8, 24, 'New York, NY', 'https://contentpro.example.com'],
  ['PipelineHQ', 'Demand generation and ABM strategy consultancy for enterprise companies. We\'ve helped 50+ companies build predictable pipeline machines.', 'Demand Gen,ABM', 4.9, 18, 'San Francisco, CA', 'https://pipelinehq.example.com'],
  ['BrandSpark Studio', 'Creative branding and design agency with a focus on tech startups. We turn complex products into compelling visual stories.', 'Branding,Design', 4.7, 31, 'Austin, TX', 'https://brandspark.example.com'],
  ['GrowthLab Analytics', 'Marketing analytics and attribution consultancy. We help B2B teams prove marketing ROI and optimize spend across channels.', 'Analytics,Marketing Ops', 4.6, 15, 'Chicago, IL', 'https://growthlab.example.com'],
  ['Elevate PR', 'B2B public relations and communications firm specializing in tech and SaaS companies. Earned media, analyst relations, and executive thought leadership.', 'PR,Communications', 4.5, 22, 'Boston, MA', 'https://elevatepr.example.com'],
  ['PixelCraft Creative', 'Video production and motion design studio for B2B brands. We create product demos, customer stories, and brand films that convert.', 'Video Production,Creative', 4.8, 19, 'Los Angeles, CA', 'https://pixelcraft.example.com'],
]

vendorData.forEach(v => insertVendor.run(...v))

// Seed jobs (with seniority and expanded descriptions)
const insertJob = db.prepare(`
  INSERT OR IGNORE INTO jobs (title, company, description, location, type, category, salary_range, seniority, status, hired_user_id, posted_by, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`)

const jobData = [
  ['Senior Content Strategist', 'TechFlow', `Lead content strategy for a fast-growing B2B SaaS company. You'll own the editorial calendar, manage a team of 3 writers, and drive organic pipeline through SEO-optimized content.

**Responsibilities:**
- Develop and execute content strategy aligned with business goals
- Manage editorial calendar and content production workflow
- Lead a team of 3 content writers and 1 editor
- Collaborate with product marketing on messaging and positioning
- Track content performance and report on pipeline attribution
- Build and maintain content style guide and brand voice

**Requirements:**
- 5+ years of content marketing experience in B2B SaaS
- Proven track record of driving organic traffic growth
- Experience managing a content team
- Strong SEO knowledge and experience with tools like Ahrefs or SEMrush
- Excellent writing and editing skills

**Benefits:**
- Competitive equity package
- Unlimited PTO
- Remote-first culture
- $2,000 annual learning budget
- Health, dental, and vision insurance`, 'Remote', 'full-time', 'Content', '$120k - $150k', 'Senior', 'completed', 3, 1, '2026-02-28T10:00:00Z'],

  ['Growth Marketing Manager', 'GrowthBase', `Drive pipeline growth through multi-channel marketing campaigns. You'll own paid acquisition, email nurture, and conversion optimization across the full funnel.

**Responsibilities:**
- Plan and execute paid media campaigns across Google, LinkedIn, and Meta
- Build and optimize email nurture sequences for different buyer personas
- Run A/B tests on landing pages, ads, and email copy
- Manage $500K+ quarterly paid media budget
- Report on campaign performance and ROI to leadership

**Requirements:**
- 4-6 years of B2B demand generation experience
- Experience managing $1M+ annual paid media budgets
- Proficiency with marketing automation (HubSpot, Marketo, or similar)
- Strong analytical skills and experience with attribution modeling
- Proven track record of hitting pipeline targets

**Benefits:**
- Performance bonuses tied to pipeline targets
- Flexible hybrid work (2 days in office)
- 401(k) with 4% match
- Comprehensive health benefits`, 'New York, NY', 'full-time', 'Growth', '$130k - $160k', 'Mid', 'completed', 5, 2, '2026-03-01T09:00:00Z'],

  ['Freelance Brand Designer', 'BrandSpark Studio', `Create brand assets and visual identity for our tech startup clients. We need a versatile designer who can work across brand guidelines, web design, and campaign creative.

**Responsibilities:**
- Design brand identity systems (logos, color palettes, typography)
- Create marketing collateral (presentations, one-pagers, social graphics)
- Design landing pages and email templates
- Collaborate with copywriters on integrated campaigns

**Requirements:**
- 3+ years of brand design experience
- Strong portfolio showing B2B/tech work
- Proficiency in Figma, Adobe Creative Suite
- Understanding of web design and responsive layouts

**Benefits:**
- Flexible project-based work
- Remote-friendly
- Long-term retainer opportunities`, 'Remote', 'freelance', 'Design', '$80 - $120/hr', 'Mid', 'open', null, 6, '2026-03-02T14:00:00Z'],

  ['Marketing Analytics Lead', 'Stripe', `Drive marketing measurement and attribution strategy. Own the marketing data infrastructure and reporting. Collaborate with growth, product, and finance teams to optimize marketing spend.

**Responsibilities:**
- Build and maintain marketing attribution models (multi-touch, incrementality)
- Own the marketing data warehouse and BI dashboards
- Partner with finance on budget planning and forecasting
- Run incrementality tests and media mix modeling
- Present insights and recommendations to marketing leadership

**Requirements:**
- 6+ years in marketing analytics or data science
- Expert SQL skills and experience with dbt, Snowflake, or BigQuery
- Experience with attribution tools (Rockerbox, Bizible, or custom solutions)
- Strong statistical analysis skills
- Ability to translate complex data into actionable recommendations

**Benefits:**
- Top-of-market compensation
- Annual $5,000 learning and wellness stipend
- Generous parental leave
- Hybrid work (3 days in SF office)`, 'San Francisco, CA', 'full-time', 'Analytics', '$140k - $180k', 'Senior', 'open', null, 9, '2026-03-03T10:00:00Z'],

  ['Content Marketing Manager', 'Notion', `Create and manage content programs that drive awareness and adoption. Work cross-functionally with product, design, and community teams to tell Notion's story.

**Responsibilities:**
- Plan and produce blog posts, guides, and customer stories
- Manage freelance writers and content contributors
- Optimize content for SEO and organic distribution
- Collaborate with product team on feature launches
- Build and engage community through content programs

**Requirements:**
- 3-5 years of content marketing experience
- Experience in PLG or product-led companies preferred
- Strong writing portfolio with B2B and/or productivity focus
- Familiarity with SEO tools and content management systems
- Experience working cross-functionally with product and design

**Benefits:**
- Fully remote role
- Unlimited PTO
- Home office stipend
- Monthly team off-sites`, 'Remote', 'full-time', 'Content', '$110k - $140k', 'Mid', 'open', null, 12, '2026-03-04T14:00:00Z'],

  ['Head of Brand Strategy', 'Spotify', `Lead brand strategy and creative direction for marketing campaigns. Build and mentor a team of brand marketers who shape how Spotify shows up in culture.

**Responsibilities:**
- Define and evolve Spotify's B2B brand positioning
- Lead creative development for major campaigns
- Manage and mentor a team of 4 brand marketers
- Partner with product marketing on go-to-market strategy
- Own brand guidelines and ensure consistency across all touchpoints
- Manage relationships with creative agencies

**Requirements:**
- 8+ years of brand marketing experience, 3+ in leadership
- Experience building and managing creative teams
- Strong portfolio of B2B or consumer brand campaigns
- Deep understanding of cultural marketing and trends
- Experience managing agency relationships and budgets

**Benefits:**
- Industry-leading compensation
- Music and entertainment perks
- Flexible work arrangements
- Generous equity package`, 'Los Angeles, CA', 'full-time', 'Brand', '$160k - $200k', 'Lead', 'open', null, 10, '2026-03-05T09:00:00Z'],

  ['Demand Gen Specialist', 'HubSpot', `Execute multi-channel demand generation campaigns. Manage paid media, email nurture, and webinar programs to drive qualified pipeline.

**Responsibilities:**
- Execute paid campaigns across LinkedIn, Google Ads, and Meta
- Build and optimize email nurture workflows in HubSpot
- Coordinate webinar programs end-to-end
- Manage lead scoring and routing processes
- Report on campaign metrics and pipeline contribution

**Requirements:**
- 2-4 years of B2B demand generation experience
- Hands-on experience with HubSpot Marketing Hub
- Experience running paid media campaigns ($100K+ budgets)
- Understanding of lead scoring and marketing automation
- Strong attention to detail and project management skills

**Benefits:**
- Hybrid work (Cambridge, MA office)
- Education reimbursement
- Sabbatical program (5-year tenure)
- Health and wellness benefits`, 'Cambridge, MA', 'full-time', 'Growth', '$90k - $120k', 'Junior', 'open', null, 8, '2026-03-06T11:00:00Z'],

  ['Freelance SEO Consultant', 'Mavuus', `Help our community platform improve organic search visibility. Audit existing content and develop keyword strategy to drive organic member acquisition.

**Responsibilities:**
- Conduct technical SEO audit of mavuus.com
- Develop keyword strategy for community and content pages
- Create content briefs for SEO-optimized articles
- Monitor rankings and organic traffic performance
- Advise on site architecture and internal linking

**Requirements:**
- 4+ years of SEO experience, preferably in B2B
- Experience with technical SEO audits
- Proficiency with Ahrefs, SEMrush, or Moz
- Track record of growing organic traffic
- Strong communication and reporting skills

**Benefits:**
- Flexible hours and fully remote
- 3-month initial engagement with extension potential
- Access to Mavuus Pro membership`, 'Remote', 'freelance', 'SEO', '$100 - $150/hr', 'Senior', 'open', null, 7, '2026-03-07T16:00:00Z'],
]

jobData.forEach(j => insertJob.run(...j))

// Seed speakers
const insertSpeaker = db.prepare(`
  INSERT OR IGNORE INTO speakers (name, title, company, avatar_url, bio)
  VALUES (?, ?, ?, ?, ?)
`)

const speakerData = [
  ['Sarah Chen', 'VP of Marketing', 'TechFlow', 'https://i.pravatar.cc/150?u=sarah@techflow.com', 'Sarah leads marketing at TechFlow, driving 3x pipeline growth in 2 years. She specializes in content-led growth and has built teams from 2 to 30.'],
  ['Marcus Johnson', 'CMO', 'GrowthBase', 'https://i.pravatar.cc/150?u=marcus@growthbase.com', 'Marcus is a seasoned CMO with 15+ years in B2B marketing. He\'s known for his ABM playbook that generated $50M+ in enterprise pipeline.'],
  ['Priya Patel', 'Director of Demand Gen', 'CloudScale', 'https://i.pravatar.cc/150?u=priya@cloudscale.com', 'Priya specializes in data-driven demand generation strategies. She\'s a frequent speaker on AI-powered marketing and predictive analytics.'],
  ['Elena Rodriguez', 'CMO', 'Drift', 'https://i.pravatar.cc/150?u=elena@drift.com', 'Elena has built marketing teams at three successful startups. She\'s an expert in conversational marketing and LinkedIn advertising.'],
  ['Omar Hassan', 'VP Brand', 'Canva', 'https://i.pravatar.cc/150?u=omar@canva.com', 'Omar leads brand strategy at Canva, overseeing global campaigns that reach millions. He\'s passionate about the intersection of design and marketing.'],
  ['James Wright', 'VP Growth', 'Amplitude', 'https://i.pravatar.cc/150?u=james@amplitude.com', 'James is a growth analytics expert who has helped dozens of B2B companies build data-driven marketing organizations.'],
  ['Rachel Foster', 'Head of Content', 'Asana', 'https://i.pravatar.cc/150?u=rachel@asana.com', 'Rachel built Asana\'s content program from scratch, growing organic traffic 10x in 3 years through programmatic SEO and content clusters.'],
  ['Nina Vasquez', 'VP Growth Marketing', 'Intercom', 'https://i.pravatar.cc/150?u=nina@intercom.com', 'Nina leads growth marketing at Intercom, specializing in martech stack optimization and marketing operations at scale.'],
]

speakerData.forEach(s => insertSpeaker.run(...s))

// User profiles for all users
const insertProfile = db.prepare(`
  INSERT OR IGNORE INTO user_profiles (user_id, bio, industry, years_experience, linkedin_url, location, timezone)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`)

const profiles = [
  [1, 'Passionate about scaling content programs and building high-performing marketing teams. 10+ years in B2B SaaS marketing with a focus on organic growth and thought leadership.', 'Technology', 12, 'https://linkedin.com/in/sarahchen', 'San Francisco, CA', 'America/Los_Angeles'],
  [2, 'Data-driven CMO focused on pipeline growth and revenue marketing. Love mentoring emerging leaders and building repeatable go-to-market playbooks.', 'Technology', 15, 'https://linkedin.com/in/marcusjohnson', 'New York, NY', 'America/New_York'],
  [3, 'Demand gen specialist with a knack for turning data into actionable strategies. Cloud infrastructure enthusiast and AI marketing early adopter.', 'Cloud Computing', 8, 'https://linkedin.com/in/priyapatel', 'Boston, MA', 'America/New_York'],
  [4, 'Marketing leader who believes in the power of brand storytelling. Built teams at 3 successful startups and scaled each from $0 to $20M+ ARR.', 'SaaS', 14, 'https://linkedin.com/in/elenarodriguez', 'Miami, FL', 'America/New_York'],
  [5, 'Strategic marketing executive driving innovation at scale. Focused on digital transformation and building marketing organizations that punch above their weight.', 'Communications', 18, 'https://linkedin.com/in/davidkim', 'Seattle, WA', 'America/Los_Angeles'],
  [6, 'Creative marketing leader passionate about design-driven growth. Champion of inclusive marketing and community-first brand building.', 'Design & Tech', 9, 'https://linkedin.com/in/aishaokafor', 'San Francisco, CA', 'America/Los_Angeles'],
  [7, 'Marketing director and community builder. Helping marketing leaders connect, share knowledge, and grow together. Previously led marketing at two Series B startups.\n\nI believe the best marketing comes from genuine connections and shared expertise. That\'s why I\'m building Mavuus — a community where marketing leaders can learn from each other, find trusted partners, and accelerate their careers.', 'Professional Services', 10, 'https://linkedin.com/in/demouser', 'New York, NY', 'America/New_York'],
  [8, 'Inbound marketing pioneer focused on creating remarkable customer experiences. 16+ years helping B2B companies build sustainable growth engines.', 'Marketing Technology', 16, 'https://linkedin.com/in/jennifermartinez', 'Cambridge, MA', 'America/New_York'],
  [9, 'Growth leader obsessed with product-led growth and conversion optimization. Stripe\'s marketing engine runs on data, experimentation, and speed.', 'Fintech', 7, 'https://linkedin.com/in/alexthompson', 'San Francisco, CA', 'America/Los_Angeles'],
  [10, 'Brand strategist passionate about cultural marketing and creative storytelling. Turning Spotify\'s B2B story into something as compelling as its consumer brand.', 'Entertainment', 11, 'https://linkedin.com/in/mayawilliams', 'Los Angeles, CA', 'America/Los_Angeles'],
  [11, 'E-commerce marketing executive focused on DTC growth and retention strategies. Built Shopify\'s merchant marketing program from the ground up.', 'E-commerce', 13, 'https://linkedin.com/in/ryancooper', 'Toronto, ON', 'America/Toronto'],
  [12, 'Demand generation expert building scalable pipelines for PLG companies. Notion\'s growth is fueled by bottom-up adoption and community advocacy.', 'Productivity Software', 6, 'https://linkedin.com/in/lisapark', 'San Francisco, CA', 'America/Los_Angeles'],
  [13, 'Full-stack marketing leader with deep expertise in developer marketing and product-led growth. Helping Datadog become the go-to observability platform.', 'DevOps & Cloud', 10, 'https://linkedin.com/in/tombradley', 'New York, NY', 'America/New_York'],
  [14, 'Growth marketing executive specializing in lifecycle marketing and conversion optimization. Built Intercom\'s self-serve revenue engine.', 'SaaS', 9, 'https://linkedin.com/in/ninavasquez', 'San Francisco, CA', 'America/Los_Angeles'],
  [15, 'Analytics-obsessed growth leader who believes every marketing dollar should be measurable. Speaker, advisor, and occasional podcast guest.', 'Analytics', 12, 'https://linkedin.com/in/jameswright', 'San Francisco, CA', 'America/Los_Angeles'],
  [16, 'Brand builder and creative director who turns complex products into stories people actually care about. Led brand transformation at two category creators.', 'Design', 14, 'https://linkedin.com/in/omarhassan', 'Austin, TX', 'America/Chicago'],
  [17, 'Content-first marketer who believes great writing is the best growth lever. Built Asana\'s blog into a top-100 SaaS content property.', 'Productivity Software', 8, 'https://linkedin.com/in/rachelfoster', 'Portland, OR', 'America/Los_Angeles'],
]
profiles.forEach(p => insertProfile.run(...p))

// User skills
const insertSkill = db.prepare('INSERT OR IGNORE INTO user_skills (user_id, skill) VALUES (?, ?)')

const skills = [
  [1, 'Content Strategy'], [1, 'SEO'], [1, 'B2B Marketing'], [1, 'Team Building'],
  [2, 'Revenue Marketing'], [2, 'ABM'], [2, 'Pipeline Generation'], [2, 'Leadership'],
  [3, 'Demand Generation'], [3, 'Marketing Analytics'], [3, 'Marketing Automation'], [3, 'Data Analysis'],
  [4, 'Brand Strategy'], [4, 'Creative Direction'], [4, 'Startup Marketing'], [4, 'Public Speaking'],
  [5, 'Digital Marketing'], [5, 'Marketing Strategy'], [5, 'Communications'], [5, 'Executive Leadership'],
  [6, 'Growth Marketing'], [6, 'Product Marketing'], [6, 'Design Thinking'], [6, 'Community Building'],
  [7, 'Community Management'], [7, 'Content Marketing'], [7, 'Event Planning'], [7, 'Marketing Operations'], [7, 'Brand Strategy'], [7, 'SEO'], [7, 'B2B Marketing'], [7, 'Team Leadership'],
  [8, 'Inbound Marketing'], [8, 'Customer Experience'], [8, 'Marketing Automation'], [8, 'Content Strategy'],
  [9, 'Growth Hacking'], [9, 'Conversion Optimization'], [9, 'Product-Led Growth'], [9, 'A/B Testing'],
  [10, 'Brand Marketing'], [10, 'Cultural Marketing'], [10, 'Creative Strategy'], [10, 'Social Media'],
  [11, 'E-commerce'], [11, 'DTC Marketing'], [11, 'Retention Marketing'], [11, 'Performance Marketing'],
  [12, 'Demand Generation'], [12, 'PLG Marketing'], [12, 'Marketing Analytics'], [12, 'Lead Scoring'],
  [13, 'Developer Marketing'], [13, 'Product-Led Growth'], [13, 'Technical Content'], [13, 'Community Building'],
  [14, 'Lifecycle Marketing'], [14, 'Conversion Optimization'], [14, 'Marketing Ops'], [14, 'Revenue Marketing'],
  [15, 'Marketing Analytics'], [15, 'Attribution Modeling'], [15, 'Data Visualization'], [15, 'Growth Strategy'],
  [16, 'Brand Strategy'], [16, 'Creative Direction'], [16, 'Visual Design'], [16, 'Storytelling'],
  [17, 'Content Strategy'], [17, 'SEO'], [17, 'Editorial Management'], [17, 'Thought Leadership'],
]
skills.forEach(s => insertSkill.run(...s))

// User experience entries
const insertExperience = db.prepare(`
  INSERT OR IGNORE INTO user_experience (user_id, company, title, start_date, end_date, is_current, description)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`)

const experiences = [
  [1, 'TechFlow', 'VP of Marketing', '2022-01', null, 1, 'Leading all marketing efforts including content, demand gen, and brand strategy. Grew organic traffic 3x and built team from 5 to 25.'],
  [1, 'ContentPro', 'Director of Content', '2019-06', '2021-12', 0, 'Built and scaled the content marketing team from 2 to 15 people. Launched the company blog that became the #1 pipeline source.'],
  [2, 'GrowthBase', 'CMO', '2021-03', null, 1, 'Driving 3x pipeline growth through integrated marketing campaigns and ABM programs targeting enterprise accounts.'],
  [2, 'Salesforce', 'VP Marketing', '2017-01', '2021-02', 0, 'Led enterprise marketing for the North America region. Managed $20M annual budget across events, digital, and ABM.'],
  [3, 'CloudScale', 'Director of Demand Gen', '2023-01', null, 1, 'Building data-driven demand generation programs across channels. Implemented predictive lead scoring that improved SQL rates by 45%.'],
  [4, 'Drift', 'CMO', '2022-06', null, 1, 'Overseeing brand, content, demand gen, and product marketing. Led rebrand that increased brand awareness by 60%.'],
  [5, 'Twilio', 'SVP Marketing', '2020-01', null, 1, 'Leading global marketing organization of 200+ people across brand, growth, product marketing, and communications.'],
  [6, 'Figma', 'Head of Marketing', '2023-03', null, 1, 'Scaling marketing programs for the design-first audience. Growing community from 10K to 50K+ active members.'],
  [7, 'Mavuus', 'Marketing Director', '2024-01', null, 1, 'Building and growing the Mavuus community platform. Leading go-to-market strategy, content, and member acquisition.'],
  [7, 'SnapCommerce', 'Senior Marketing Manager', '2021-03', '2023-12', 0, 'Led B2B marketing strategy for mobile commerce platform. Grew pipeline 2x through content marketing and partnerships.'],
  [7, 'Accenture', 'Marketing Consultant', '2018-06', '2021-02', 0, 'Advised Fortune 500 clients on digital marketing transformation, marketing technology selection, and campaign optimization.'],
  [8, 'HubSpot', 'VP Marketing', '2021-06', null, 1, 'Leading inbound marketing strategy and customer experience initiatives. Driving adoption of HubSpot\'s own platform for marketing.'],
  [9, 'Stripe', 'Head of Growth', '2022-09', null, 1, 'Driving product-led growth and conversion optimization. Improved free-to-paid conversion by 35% through experimentation.'],
  [10, 'Spotify', 'Director of Brand', '2023-01', null, 1, 'Leading brand strategy and cultural marketing campaigns for Spotify\'s advertising business.'],
  [11, 'Shopify', 'CMO', '2022-03', null, 1, 'Overseeing all marketing for the commerce platform. Built merchant marketing program serving 2M+ merchants.'],
  [12, 'Notion', 'VP Demand Gen', '2023-06', null, 1, 'Building demand generation engine for PLG growth. Scaled self-serve revenue 4x in 18 months.'],
  [13, 'Datadog', 'Director of Marketing', '2023-01', null, 1, 'Leading developer marketing and content strategy for the observability platform.'],
  [14, 'Intercom', 'VP Growth Marketing', '2022-06', null, 1, 'Owning lifecycle marketing, conversion optimization, and self-serve revenue growth.'],
  [15, 'Amplitude', 'VP Growth', '2021-01', null, 1, 'Leading growth and analytics practice. Helping B2B companies build data-driven marketing organizations.'],
  [16, 'Canva', 'VP Brand', '2022-01', null, 1, 'Overseeing global brand strategy and creative direction for Canva\'s brand campaigns.'],
  [17, 'Asana', 'Head of Content', '2023-03', null, 1, 'Built content program from scratch. Grew blog to 2M+ monthly visitors through SEO and editorial excellence.'],
]
experiences.forEach(e => insertExperience.run(...e))

// Connections (demo user connected to several members, plus other connections)
const insertConnection = db.prepare(`
  INSERT OR IGNORE INTO connections (requester_id, receiver_id, status, created_at)
  VALUES (?, ?, ?, ?)
`)

const connectionData = [
  [7, 1, 'accepted', '2026-01-15T10:00:00Z'],
  [7, 2, 'accepted', '2026-01-20T14:00:00Z'],
  [7, 4, 'accepted', '2026-02-01T09:00:00Z'],
  [7, 8, 'accepted', '2026-02-15T11:00:00Z'],
  [7, 13, 'accepted', '2026-02-20T10:00:00Z'],
  [3, 7, 'pending', '2026-03-01T16:00:00Z'],
  [9, 7, 'pending', '2026-03-05T10:00:00Z'],
  [14, 7, 'pending', '2026-03-10T09:00:00Z'],
  [1, 2, 'accepted', '2026-01-10T08:00:00Z'],
  [1, 3, 'accepted', '2026-01-12T12:00:00Z'],
  [4, 6, 'accepted', '2026-02-20T15:00:00Z'],
  [8, 9, 'accepted', '2026-02-01T10:00:00Z'],
  [10, 11, 'accepted', '2026-02-10T14:00:00Z'],
  [13, 15, 'accepted', '2026-02-15T09:00:00Z'],
]
connectionData.forEach(c => insertConnection.run(...c))

// Conversations and messages
const insertConversation = db.prepare('INSERT INTO conversations (created_at, updated_at) VALUES (?, ?)')
const insertParticipant = db.prepare('INSERT OR IGNORE INTO conversation_participants (conversation_id, user_id, last_read_at) VALUES (?, ?, ?)')
const insertMessage = db.prepare('INSERT INTO messages (conversation_id, sender_id, content, created_at) VALUES (?, ?, ?, ?)')

// Conversation 1: Demo User <-> Sarah Chen (content strategy discussion)
const conv1 = insertConversation.run('2026-02-20T10:00:00Z', '2026-03-12T14:30:00Z')
insertParticipant.run(conv1.lastInsertRowid, 7, '2026-03-12T14:30:00Z')
insertParticipant.run(conv1.lastInsertRowid, 1, '2026-03-12T14:20:00Z')
insertMessage.run(conv1.lastInsertRowid, 7, 'Hi Sarah! I loved your session on content strategy. Would love to chat more about scaling content teams.', '2026-02-20T10:00:00Z')
insertMessage.run(conv1.lastInsertRowid, 1, 'Thanks so much! I\'d be happy to share what\'s worked for us at TechFlow. What specific challenges are you facing?', '2026-02-20T10:15:00Z')
insertMessage.run(conv1.lastInsertRowid, 7, 'We\'re trying to go from 3 to 10 content pieces per week without sacrificing quality. Any frameworks you recommend?', '2026-02-20T10:30:00Z')
insertMessage.run(conv1.lastInsertRowid, 1, 'Absolutely! We use a tiered content model - hero, hub, and help content. Hero pieces are big thought leadership articles, hub content is our bread and butter SEO content, and help content answers specific customer questions.', '2026-02-20T11:00:00Z')
insertMessage.run(conv1.lastInsertRowid, 1, 'The key insight was that not every piece needs the same level of investment. Hero content gets 20 hours, hub gets 8 hours, and help content gets 3-4 hours.', '2026-02-20T11:05:00Z')
insertMessage.run(conv1.lastInsertRowid, 7, 'That makes so much sense. We\'ve been treating every piece like it needs to be a hero piece, which is why we can\'t scale.', '2026-02-20T11:30:00Z')
insertMessage.run(conv1.lastInsertRowid, 7, 'Quick follow-up — how do you handle quality control with that volume? Do you have an editorial review process?', '2026-03-06T14:00:00Z')
insertMessage.run(conv1.lastInsertRowid, 1, 'Yes! We have a 2-stage review. Writers peer-review each other\'s hub/help content, and I personally review all hero content. We also have a style guide and content checklist that catches 80% of issues.', '2026-03-06T14:15:00Z')
insertMessage.run(conv1.lastInsertRowid, 7, 'That sounds perfect. Are you free for a 30-min call next week to walk me through the checklist?', '2026-03-06T14:20:00Z')
insertMessage.run(conv1.lastInsertRowid, 1, 'Sure! How about Tuesday at 2pm PT? I\'ll share our actual checklist doc beforehand so you can review.', '2026-03-06T14:30:00Z')
insertMessage.run(conv1.lastInsertRowid, 7, 'Perfect, it\'s a date! Looking forward to it.', '2026-03-12T14:00:00Z')
insertMessage.run(conv1.lastInsertRowid, 1, 'Same here! I\'ll send a calendar invite shortly. 📅', '2026-03-12T14:30:00Z')

// Conversation 2: Demo User <-> Marcus Johnson (community-led growth)
const conv2 = insertConversation.run('2026-02-25T09:00:00Z', '2026-03-10T16:00:00Z')
insertParticipant.run(conv2.lastInsertRowid, 7, '2026-03-10T16:00:00Z')
insertParticipant.run(conv2.lastInsertRowid, 2, '2026-03-10T15:45:00Z')
insertMessage.run(conv2.lastInsertRowid, 2, 'Hey! Saw your post about community-led growth. Really resonated with our approach at GrowthBase.', '2026-02-25T09:00:00Z')
insertMessage.run(conv2.lastInsertRowid, 7, 'Thanks Marcus! I think community and marketing go hand in hand. How are you leveraging community at GrowthBase?', '2026-02-25T09:30:00Z')
insertMessage.run(conv2.lastInsertRowid, 2, 'We built a customer advisory board that feeds directly into our product roadmap. It\'s been a game changer for retention — NRR went from 105% to 125%.', '2026-02-25T10:00:00Z')
insertMessage.run(conv2.lastInsertRowid, 2, 'The secret is making members feel like co-creators, not just users. We share roadmap previews, invite them to beta programs, and feature their success stories.', '2026-02-25T10:05:00Z')
insertMessage.run(conv2.lastInsertRowid, 7, 'That\'s exactly the philosophy behind Mavuus. We want our members to shape the community, not just consume content.', '2026-03-05T15:30:00Z')
insertMessage.run(conv2.lastInsertRowid, 7, 'Would you be interested in doing a joint session on community-led growth? I think our audiences would love it.', '2026-03-05T15:35:00Z')
insertMessage.run(conv2.lastInsertRowid, 2, 'I\'d love that! Let me check my calendar for April. We could do a fireside chat format — those tend to get the best engagement.', '2026-03-05T16:00:00Z')
insertMessage.run(conv2.lastInsertRowid, 7, 'Fireside chat sounds great. Let\'s nail down a date next week!', '2026-03-10T16:00:00Z')

// Conversation 3: Demo User <-> Jennifer Martinez (welcome + networking)
const conv3 = insertConversation.run('2026-03-01T11:00:00Z', '2026-03-13T09:00:00Z')
insertParticipant.run(conv3.lastInsertRowid, 7, '2026-03-12T09:00:00Z')
insertParticipant.run(conv3.lastInsertRowid, 8, '2026-03-13T09:00:00Z')
insertMessage.run(conv3.lastInsertRowid, 8, 'Welcome to Mavuus! As a fellow community enthusiast, I\'m really excited about what you\'re building here.', '2026-03-01T11:00:00Z')
insertMessage.run(conv3.lastInsertRowid, 7, 'Thanks Jennifer! The platform is great. I\'m particularly interested in the live sessions — the content quality is really impressive.', '2026-03-01T11:30:00Z')
insertMessage.run(conv3.lastInsertRowid, 8, 'You should check out the upcoming session on AI in B2B marketing by Priya — she always delivers incredible insights. Last time she shared a framework that we immediately implemented at HubSpot.', '2026-03-01T12:00:00Z')
insertMessage.run(conv3.lastInsertRowid, 7, 'Just registered! Looking forward to it. By the way, I noticed HubSpot has some open roles posted here — the Demand Gen Specialist position looks great.', '2026-03-06T09:00:00Z')
insertMessage.run(conv3.lastInsertRowid, 8, 'Yes! We\'re growing the team. If you know anyone who\'d be a great fit, send them our way. We\'re looking for someone with strong campaign execution skills.', '2026-03-06T09:30:00Z')
insertMessage.run(conv3.lastInsertRowid, 7, 'Will do! I\'ll share it with my network.', '2026-03-12T09:00:00Z')
insertMessage.run(conv3.lastInsertRowid, 8, 'Great! Also, have you connected with Priya and Tom? They\'re both doing amazing work and I think you\'d really hit it off.', '2026-03-13T09:00:00Z')

// Conversation 4: Demo User <-> Tom Bradley (job opportunity)
const conv4 = insertConversation.run('2026-03-08T10:00:00Z', '2026-03-14T11:00:00Z')
insertParticipant.run(conv4.lastInsertRowid, 7, '2026-03-14T11:00:00Z')
insertParticipant.run(conv4.lastInsertRowid, 13, '2026-03-14T10:30:00Z')
insertMessage.run(conv4.lastInsertRowid, 13, 'Hi! I saw your profile and I\'m really impressed by your community building experience. We\'re looking for someone with exactly that skillset at Datadog.', '2026-03-08T10:00:00Z')
insertMessage.run(conv4.lastInsertRowid, 7, 'Thanks Tom! I appreciate that. What kind of role are you thinking about?', '2026-03-08T10:30:00Z')
insertMessage.run(conv4.lastInsertRowid, 13, 'We\'re building out a developer community program and need a senior leader who understands both marketing and community dynamics. It would be a Director-level role.', '2026-03-08T11:00:00Z')
insertMessage.run(conv4.lastInsertRowid, 7, 'That sounds really interesting! I\'m pretty committed to Mavuus right now, but I\'d love to hear more about the vision. Maybe we can find ways to collaborate too.', '2026-03-08T11:30:00Z')
insertMessage.run(conv4.lastInsertRowid, 13, 'Absolutely — even if the timing isn\'t right for the role, I think there\'s a lot of overlap between our communities. Let\'s set up a call?', '2026-03-14T10:30:00Z')
insertMessage.run(conv4.lastInsertRowid, 7, 'Let\'s do it! How about Thursday afternoon?', '2026-03-14T11:00:00Z')

// Job applications (demo user)
const insertApplication = db.prepare(`
  INSERT OR IGNORE INTO job_applications (job_id, user_id, cover_letter, status, applied_at)
  VALUES (?, ?, ?, ?, ?)
`)

const applications = [
  [1, 7, 'I am excited about this Senior Content Strategist role. With 10+ years in content marketing and community building, I believe I can make a significant impact at TechFlow. My experience scaling content programs from 3 to 30 pieces per week while maintaining quality makes me a strong fit for this position.', 'reviewing', '2026-03-02T10:00:00Z'],
  [4, 7, 'As a marketing analytics enthusiast, I would love to bring my data-driven approach to Stripe. I have extensive experience with marketing attribution and measurement, having built dashboards and reporting frameworks at my previous companies.', 'applied', '2026-03-04T15:00:00Z'],
]
applications.forEach(a => insertApplication.run(...a))

// Saved jobs
const insertSavedJob = db.prepare('INSERT OR IGNORE INTO saved_jobs (user_id, job_id) VALUES (?, ?)')
insertSavedJob.run(7, 2)
insertSavedJob.run(7, 5)
insertSavedJob.run(7, 6)

// Notifications for demo user
const insertNotification = db.prepare(`
  INSERT INTO notifications (user_id, type, title, message, link, is_read, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`)

const notificationData = [
  // Recent (unread)
  [7, 'session', 'Live Session Starting Soon', '"The Future of AI in B2B Marketing" with Priya Patel starts in 2 hours', '/dashboard/live-sessions/3', 0, '2026-03-15T08:00:00Z'],
  [7, 'connection', 'Connection Accepted', 'Sarah Chen accepted your connection request. You can now message each other!', '/dashboard/members/1', 0, '2026-03-15T07:30:00Z'],
  [7, 'message', 'New Message', 'Tom Bradley: "Let\'s do it! How about Thursday afternoon?"', '/dashboard/messages', 0, '2026-03-14T11:00:00Z'],
  [7, 'job', 'New Job Match', 'A new VP of Marketing role at Stripe matches your profile', '/dashboard/jobs/3', 0, '2026-03-14T10:30:00Z'],
  [7, 'connection', 'New Connection Request', 'Nina Vasquez, Head of Growth at Shopify, wants to connect with you', '/dashboard/members/14', 0, '2026-03-14T09:00:00Z'],
  [7, 'message', 'New Message', 'Jennifer Martinez: "Great! Also, have you connected with Priya and Tom?"', '/dashboard/messages', 0, '2026-03-13T09:00:00Z'],
  [7, 'session', 'Session Recording Available', '"ABM Playbook: From 0 to Enterprise Pipeline" recording is now available to watch', '/dashboard/on-demand/2', 0, '2026-03-13T08:00:00Z'],
  // Older (read)
  [7, 'connection', 'New Connection Request', 'Alex Thompson, Head of Growth at Stripe, wants to connect', '/dashboard/members/9', 1, '2026-03-12T10:00:00Z'],
  [7, 'job', 'Application Update', 'Your application for Senior Content Strategist is being reviewed', '/dashboard/my-jobs', 1, '2026-03-11T14:00:00Z'],
  [7, 'session', 'New Live Session', 'Sarah Chen is hosting "Building a Content Engine That Scales" on March 20', '/dashboard/live-sessions/1', 1, '2026-03-10T10:00:00Z'],
  [7, 'connection', 'Connection Accepted', 'Marcus Johnson accepted your connection request', '/dashboard/members/2', 1, '2026-03-09T16:00:00Z'],
  [7, 'job', 'New Job Posted', 'A new Content Marketing Manager position was posted at Notion', '/dashboard/jobs/5', 1, '2026-03-08T14:00:00Z'],
  [7, 'system', 'Welcome to Mavuus!', 'Complete your profile to connect with other marketing leaders', '/dashboard/profile', 1, '2026-03-01T12:00:00Z'],
  [7, 'system', 'Profile Tip', 'Add your skills and experience to get better job and connection recommendations', '/dashboard/profile', 1, '2026-03-01T12:05:00Z'],
]
notificationData.forEach(n => insertNotification.run(...n))

// Seed reviews (member-to-member for completed jobs + member-to-vendor)
const insertReview = db.prepare(`
  INSERT OR IGNORE INTO reviews (reviewer_id, reviewee_id, vendor_id, job_id, rating, text, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`)

const reviewData = [
  // Job 1 completed: Sarah (poster) reviews Priya (hired), and Priya reviews Sarah
  [1, 3, null, 1, 5, 'Priya was exceptional as our Senior Content Strategist. She scaled our content output while maintaining quality and brought innovative data-driven approaches to our content program.', '2026-03-10T10:00:00Z'],
  [3, 1, null, 1, 5, 'Working with Sarah and the TechFlow team was a fantastic experience. Clear direction, great support, and a truly collaborative environment.', '2026-03-10T14:00:00Z'],
  // Job 2 completed: Marcus (poster) reviews David (hired), and David reviews Marcus
  [2, 5, null, 2, 4, 'David brought strong strategic thinking to our growth marketing efforts. His paid media expertise helped us exceed pipeline targets by 20%.', '2026-03-08T09:00:00Z'],
  [5, 2, null, 2, 5, 'Marcus is an outstanding leader. The GrowthBase team is well-organized and the growth marketing role was exactly as described. Highly recommend working here.', '2026-03-08T12:00:00Z'],
  // Vendor reviews
  [1, 7, 1, null, 5, 'ContentPro Agency transformed our content pipeline. Their team understood our B2B audience perfectly and delivered consistent, high-quality work.', '2026-02-15T10:00:00Z'],
  [4, 7, 3, null, 4, 'BrandSpark Studio delivered a stunning rebrand for us. Creative, professional, and great at meeting deadlines. Would definitely work with them again.', '2026-02-20T14:00:00Z'],
]
reviewData.forEach(r => insertReview.run(...r))

// Update vendor ratings based on reviews
db.prepare(`
  UPDATE vendors SET
    rating = (SELECT ROUND(AVG(rating), 1) FROM reviews WHERE vendor_id = vendors.id),
    reviews_count = (SELECT COUNT(*) FROM reviews WHERE vendor_id = vendors.id)
  WHERE id IN (SELECT DISTINCT vendor_id FROM reviews WHERE vendor_id IS NOT NULL)
`).run()

// Seed recommendations
const insertRecommendation = db.prepare(`
  INSERT OR IGNORE INTO recommendations (from_user_id, to_user_id, vendor_id, message, created_at)
  VALUES (?, ?, ?, ?, ?)
`)

const recommendationData = [
  [1, 7, 1, 'Highly recommend ContentPro Agency for any B2B content needs. They helped us triple our content output while maintaining quality.', '2026-02-18T10:00:00Z'],
  [4, 7, 3, 'BrandSpark Studio did an incredible job on our rebrand. If you need design or branding work, they are the best in the business.', '2026-02-22T14:00:00Z'],
  [2, 1, 2, 'PipelineHQ completely transformed our ABM program. Their consultants are world-class and really understand enterprise pipeline.', '2026-02-25T09:00:00Z'],
  [8, 7, null, 'I highly recommend connecting with the Datadog marketing team — Tom Bradley is doing incredible work in developer marketing.', '2026-03-01T11:00:00Z'],
]
recommendationData.forEach(r => insertRecommendation.run(...r))

// Add job applications for the completed jobs (hired applicants)
insertApplication.run(1, 3, 'Excited to bring my demand gen and data-driven approach to content strategy at TechFlow.', 'hired', '2026-02-10T10:00:00Z')
insertApplication.run(2, 5, 'Eager to apply my marketing leadership experience to drive growth at GrowthBase.', 'hired', '2026-02-12T09:00:00Z')

console.log('Database seeded successfully!')
db.close()
