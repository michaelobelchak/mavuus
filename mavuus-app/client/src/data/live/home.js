// Homepage content copied from the live mavuus.com homepage (captured 2026-10-31).
const CDN_SITE = 'https://cdn.prod.website-files.com/6689664d9906e5efe6bbc54d'
const CDN_CMS = 'https://cdn.prod.website-files.com/668f2b775dccc4947eb1a4d3'

export const HERO = {
  image: `${CDN_SITE}/66e1f9f7e6f85e23bc2ef8c7_just-image%20(1).avif`,
  imageSrcSet: `${CDN_SITE}/66e1f9f7e6f85e23bc2ef8c7_just-image%20(1)-p-500.avif 500w, ${CDN_SITE}/66e1f9f7e6f85e23bc2ef8c7_just-image%20(1).avif 1070w`,
  avatars: [
    `${CDN_SITE}/66bed3b92d2881a4f93d9d90_av1.png`,
    `${CDN_SITE}/66bed3b910c947d3795c2c49_av2.png`,
    `${CDN_SITE}/66bed3badc008570ccee6b56_av3.png`,
    `${CDN_SITE}/66bed3b9eca421d9b4612935_av4.png`,
    `${CDN_SITE}/66bed3b95fc4b07c9718ce34_av5%20(1).png`,
    `${CDN_SITE}/66bed3b9a7a302cd86ef4d85_av6.png`,
  ],
}

export const BUSINESS_IMAGE = {
  src: `${CDN_SITE}/668f4ef17e1ac5e4d40cd793_Group%203276.webp`,
  srcSet: [
    `${CDN_SITE}/668f4ef17e1ac5e4d40cd793_Group%203276-p-500.webp 500w`,
    `${CDN_SITE}/668f4ef17e1ac5e4d40cd793_Group%203276-p-800.webp 800w`,
    `${CDN_SITE}/668f4ef17e1ac5e4d40cd793_Group%203276-p-1080.webp 1080w`,
    `${CDN_SITE}/668f4ef17e1ac5e4d40cd793_Group%203276.webp 1542w`,
  ].join(', '),
}

export const SERVICE_TABS = [
  {
    num: '01',
    title: 'Marketing Strategy & Consulting',
    tag: 'Get clarity on where to focus.',
    text: 'Get clarity on where to focus, who to target and how to position your business for growth. From marketing assessments and go-to-market strategy to demand generation, ABM and performance planning, we help you make smarter marketing decisions.',
  },
  {
    num: '02',
    title: 'Marketing Execution & Campaign Support',
    tag: 'Great strategies need great execution.',
    text: 'Great strategies need great execution. Our team can help bring your plans to life through integrated campaigns, ABM, content, email marketing, LinkedIn outreach, webinars and events.',
  },
  {
    num: '03',
    title: 'Fractional & Strategic Marketing Leadership',
    tag: 'Experienced leadership for your team.',
    text: 'Access experienced marketing leadership to guide your team, lead strategic initiatives and align marketing priorities with your broader business goals.',
  },
]

export const EXPERIENCE_IMAGE = {
  src: `${CDN_SITE}/668f3c503a71a14c49821823_customize.webp`,
  srcSet: [
    `${CDN_SITE}/668f3c503a71a14c49821823_customize-p-500.webp 500w`,
    `${CDN_SITE}/668f3c503a71a14c49821823_customize-p-800.webp 800w`,
    `${CDN_SITE}/668f3c503a71a14c49821823_customize-p-1080.webp 1080w`,
    `${CDN_SITE}/668f3c503a71a14c49821823_customize.webp 1322w`,
  ].join(', '),
}

export const EXPERIENCE_STATS = [
  { value: '15+', label: 'Years of B2B technology marketing' },
  { value: '1,100+', label: 'CMOs and senior marketing leaders' },
]

// Only logos that stay readable as small grey marks. The Pizza Hut roundel, the Arizona Cardinals bird and the
// Constellation Software lockup were dropped. `scale` evens out optical size inside the shared logo box.
export const COMPANY_LOGOS = [
  { src: `${CDN_CMS}/66bc28035a04f39f6d65166a_image%20202.png`, alt: 'Scotiabank', width: 214, height: 65, scale: 0.95 },
  { src: `${CDN_CMS}/66bc28347aaa3991418103fc_image%20197.png`, alt: 'Ceridian', width: 191, height: 61, scale: 1 },
  { src: `${CDN_CMS}/66bc28ce9e135c0a60329d7e_image%20198.png`, alt: 'Microsoft', width: 294, height: 65, scale: 0.95 },
  { src: `${CDN_CMS}/66bc2902eb8d3f5a4ba7a419_image%20200.png`, alt: 'PointClickCare', width: 297, height: 53, scale: 1 },
  { src: `${CDN_CMS}/66bc291aeb8d3f5a4ba7b864_image%20205.png`, alt: 'Salesforce', width: 95, height: 65, scale: 1 },
  { src: `${CDN_CMS}/66c355116e3d2236f3bc598f_image%20204.png`, alt: 'Terminus', width: 298, height: 53, scale: 0.9 },
]

export const LEADERS = [
  { name: 'Gayle Kosokowsky', position: 'B2B Sales and Marketing Expert', image: `${CDN_CMS}/668f2c5af33e04132746cbe3_Frame%203308.png` },
  { name: 'Cameron Micules', position: 'Multi-faceted marketing strategist', image: `${CDN_CMS}/668f2c7d9c66d4db7164fd8f_Frame%203310.png` },
  { name: 'Sandy Chambers', position: 'Marketing Consultant', image: `${CDN_CMS}/668f2c97028e2278d3eb99ea_Frame%203308-1.png` },
  { name: 'Martin Pietrzak', position: 'CEO at Pinch Marketing', image: `${CDN_CMS}/668f2cf5d805709f241f22eb_Frame%203310-1.png` },
  { name: 'Kristina Clearly', position: 'Founder & Chief Leadership Coach', image: `${CDN_CMS}/668f2d11666e30fee46c109c_Frame%203310-2.png` },
  { name: 'Michael Robinson', position: 'Growth Marketer and Executive', image: `${CDN_CMS}/668f2d36c60036ab655dcd2a_Frame%203310-3.png` },
  { name: 'Leah Andrew', position: 'Strategy, Marketing & Communications', image: `${CDN_CMS}/668f2d542643e62fdd6f0de2_Frame%203308-2.png` },
  { name: 'Daniel Incandela', position: 'CMO | Advisor | Consultant', image: `${CDN_CMS}/668f2d6f8ce1f487a65d3a86_Frame%203310-4.png` },
  { name: 'Jared Blank', position: 'Author of the Gobbledy', image: `${CDN_CMS}/668f2d8fd805709f241f7e60_Frame%203308-3.png` },
  { name: 'Vinay Nair', position: 'Certified Executive Coach (CEC)', image: `${CDN_CMS}/668f2da9f0506a401976ac7d_Frame%203310-5.png` },
]

export const MARKETERS_IMAGE = {
  src: `${CDN_SITE}/668f41ed60ea88d8a546c9d7_Group%203272-p-800.webp`,
  srcSet: [
    `${CDN_SITE}/668f41ed60ea88d8a546c9d7_Group%203272-p-500.webp 500w`,
    `${CDN_SITE}/668f41ed60ea88d8a546c9d7_Group%203272-p-800.webp 800w`,
    `${CDN_SITE}/668f41ed60ea88d8a546c9d7_Group%203272.webp 1160w`,
  ].join(', '),
}

export const MARKETERS_LIST = [
  'Connect and exchange ideas with experienced marketing executives',
  'Participate in interactive Coffee Chats and expert-led discussions',
  'Explore marketing leadership, strategy and emerging industry trends',
  'Access educational resources and on-demand sessions',
  'Build relationships and expand your professional network',
]

export const READY_IMAGE = {
  src: `${CDN_SITE}/668f46214842f23691d72111_Rectangle%207-p-800.webp`,
  srcSet: [
    `${CDN_SITE}/668f46214842f23691d72111_Rectangle%207-p-500.webp 500w`,
    `${CDN_SITE}/668f46214842f23691d72111_Rectangle%207-p-800.webp 800w`,
    `${CDN_SITE}/668f46214842f23691d72111_Rectangle%207.webp 1176w`,
  ].join(', '),
}

// Webflow responsive widths for each Insights thumbnail, taken from the live homepage srcset:
// the -p-500 / -p-800 variants that exist, then the width of the original.
export const VIDEO_THUMB_WIDTHS = {
  'marketing-ideas-that-delivered-real-results-5-real-life-examples-from-cmos': [500, 800, 1408],
  'if-everything-is-ai-generated-what-makes-a-brand-believable-a-cmo-discussion': [500, 728],
  'the-future-of-search-a-cmos-guide-to-seo-geo-and-aeo': [500, 800, 1560],
  'the-2026-cmo-burnout-crisis-roi-pressure-ai-fatigue-tech-overload': [500, 724],
  'the-2026-cmo-role-expectations-major-shifts-harsh-realities': [500, 800, 2000],
  'ai-agents-for-cmos-getting-started-strategy-blueprint-best-tools': [500, 800, 1024],
  '2026-marketing-budget-cmos-guide-to-frameworks-benchmarks-and-projection-models': [500, 800, 1024],
  'should-cmos-report-to-sales-5-things-to-consider-when-reporting-to-a-cro': [500, 800, 1080],
  'the-impact-of-ai-in-digital-marketing-in-the-next-5-years-seo-paid-social': [500, 800, 1000],
  'cmos-role-in-a-go-to-market-strategy-exercise-aligning-with-the-c-suite-team': [500, 800, 940],
  'marketing-teams-of-the-future-cmos-guide-to-leveraging-ai-to-build-strategy-optimize-efficiency-and-drive-growth': [500, 800, 1200],
  'marketing-leadership-by-the-numbers-5-most-overlooked-cmo-metrics': [500, 800, 1024],
  'cmo-career-setback-rebuilding-confidence-and-career-success-after-being-laid-off-or-fired': [500, 626],
  'career-compass-mastering-salary-negotiation-and-understanding-current-compensation-benchmarks': [500, 800, 1920],
  'managing-board-expectations-top-5-strategies-for-cmos-to-nail-every-board-meeting': [500, 800, 1024],
  'career-compass-navigating-difficult-conversations-and-decision-making-discussions-with-diplomacy-and-lasting-impact': [500, 800, 1600],
  'drive-more-demand-in-2025-b2c-campaign-examples-we-can-all-steal-from': [500, 1024],
  'career-compass-10-things-i-learned-when-becoming-a-cmo-with-bart-molenda-cmo-at-hellofresh': [500, 800, 1600],
  'cmos-tell-all-2025-marketing-playbook-top-5-marketing-opportunities-for-cmos-to-generate-demand': [500, 800, 1080],
  'marketing-career-compass-soar-to-success-on-linkedin-how-to-get-employers-reaching-out-to-you': [500, 800, 2560],
  'marketing-budget-planning-for-2025-proven-frameworks-and-benchmark-insights': [500, 800, 1600],
  'cmo-tell-all-balancing-ai-and-emotional-intelligence-in-2025': [500, 800, 1200],
  'marketing-career-compass-common-interview-mistakes-and-best-practices-to-get-your-next-role': [500, 800, 1600],
  'stop-fighting-start-winning-measuring-the-success-of-cmo-and-cro-alignment': [500, 800, 1600],
  'cmos-tell-all-venture-capital-perspective-on-marketing-kpi-benchmarks': [500, 800, 1920],
  'cmo-and-cfo-relationship-learning-finance-creating-synergies-negotiating-funds': [500, 800, 1600],
  'cmos-tell-all-marketing-to-and-managing-gen-zs-expectations-behavior-psychographics': [500, 800, 1600],
  'cmo-tell-all-marketing-in-finance-terms-get-that-budget-approved-every-single-time': [500, 800, 1600],
  'cmo-tell-all-managing-c-suite-expectations-driving-growth-building-strategic-alliances': [500, 800, 1600],
  'cmo-tell-all-marketing-attribution-benchmarks-definition-and-how-to-measure': [500, 800, 1600],
  'cmo-tell-all-marketing-tech-stack---the-foundation-the-necessities-and-the-nice-to-haves': [500, 800, 1600],
  'cmo-tell-all-marketing-org-structure-in-2024-small-med-large-organizations': [500, 800, 1600],
  'cmo-tell-all-marketing-ai-tools-writing-visuals-data-analysis': [500, 800, 1600],
  'cmo-tell-all-marketing-budget-efficiency-best-lead-source-s-for-your-buck': [500, 800, 1600],
  'cmo-tell-all-best-campaign-ive-ever-done---strategy-creative-execution': [500, 800, 1600],
  'cmo-tell-all-fractional-cmos-new-clients-compensation-account-expansion': [500, 800, 1600],
  'cmo-tell-all-marketing-reporting---too-much-vs-too-little': [500, 800, 1600],
  'all-b2b-companies-sound-the-same-how-to-stand-out-and-add-personality-into-your-brand-via-creative-copywriting': [500, 800, 1600],
  'the-bitter-truth-about-marketing-automation-everyone-has-it-no-one-really-succeeds': [500, 800, 1600],
  'growing-your-business-through-referral-marketing': [500, 800, 1600],
  'landing-your-next-cmo-gig-employer-expectations-economic-realities-win-strategies': [500, 800, 1600],
  'influencer-marketing-in-b2b-ideal-candidates-integrated-strategies-and-measurable-results': [500, 800, 1600],
  'ai-for-strategic-marketing-how-cmos-can-unlock-true-value-of-ai': [500, 800, 1600],
  'marketing-to-women-in-b2b-how-to-appeal-to-a-female-demographic-in-2024': [500, 800, 1600],
  'true-roi-of-brand-positioning-and-content-how-to-persuade-executives-to-invest-more': [500, 800, 1600],
  '2024-marketing-budget-benchmarks-efficiencies-projections': [500, 800, 1600],
  'master-your-elevator-pitch-in-just-30-seconds': [500, 800, 1600],
  'all-about-ai-in-marketing-tools-best-practices-warnings-and-much-more': [500, 800, 1600],
  'return-on-marketing-investment-benchmarks-definition-and-how-to-measure': [500, 800, 1600],
  'cmo-and-ceo-relationship-the-5-dos-and-donts': [500, 800, 1600],
}
