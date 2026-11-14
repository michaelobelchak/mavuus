// Homepage content copied from the live mavuus.com homepage (captured 2026-10-31).

export const HERO = {
  image: '/images/home/just-image-1.webp',
  imageSrcSet: '/images/home/just-image-1-p-500.webp 500w, /images/home/just-image-1.webp 1070w',
  avatars: [
    '/images/home/av1.webp',
    '/images/home/av2.webp',
    '/images/home/av3.webp',
    '/images/home/av4.webp',
    '/images/home/av5-1.webp',
    '/images/home/av6.webp',
  ],
}

export const BUSINESS_IMAGE = {
  src: '/images/shared/group-3276.webp',
  srcSet: [
    '/images/shared/group-3276-p-500.webp 500w',
    '/images/shared/group-3276-p-800.webp 800w',
    '/images/shared/group-3276-p-1080.webp 1080w',
    '/images/shared/group-3276.webp 1542w',
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
  src: '/images/home/customize.webp',
  srcSet: [
    '/images/home/customize-p-500.webp 500w',
    '/images/home/customize-p-800.webp 800w',
    '/images/home/customize-p-1080.webp 1080w',
    '/images/home/customize.webp 1322w',
  ].join(', '),
}

export const EXPERIENCE_STATS = [
  { value: '15+', label: 'Years of B2B technology marketing' },
  { value: '1,100+', label: 'CMOs and senior marketing leaders' },
]

// Only logos that stay readable as small grey marks. The Pizza Hut roundel, the Arizona Cardinals bird and the
// Constellation Software lockup were dropped. 'scale' evens out optical size inside the shared logo box.
export const COMPANY_LOGOS = [
  { src: '/images/logos/image-202.webp', alt: 'Scotiabank', width: 214, height: 65, scale: 0.95 },
  { src: '/images/logos/image-197.webp', alt: 'Ceridian', width: 191, height: 61, scale: 1 },
  { src: '/images/logos/image-198.webp', alt: 'Microsoft', width: 294, height: 65, scale: 0.95 },
  { src: '/images/logos/image-200.webp', alt: 'PointClickCare', width: 297, height: 53, scale: 1 },
  { src: '/images/logos/image-205.webp', alt: 'Salesforce', width: 95, height: 65, scale: 1 },
  { src: '/images/logos/image-204.webp', alt: 'Terminus', width: 298, height: 53, scale: 0.9 },
]

export const LEADERS = [
  { name: 'Gayle Kosokowsky', position: 'B2B Sales and Marketing Expert', image: '/images/home/frame-3308.webp' },
  { name: 'Cameron Micules', position: 'Multi-faceted marketing strategist', image: '/images/home/frame-3310.webp' },
  { name: 'Sandy Chambers', position: 'Marketing Consultant', image: '/images/home/frame-3308-1.webp' },
  { name: 'Martin Pietrzak', position: 'CEO at Pinch Marketing', image: '/images/home/frame-3310-1.webp' },
  { name: 'Kristina Clearly', position: 'Founder & Chief Leadership Coach', image: '/images/home/frame-3310-2.webp' },
  { name: 'Michael Robinson', position: 'Growth Marketer and Executive', image: '/images/home/frame-3310-3.webp' },
  { name: 'Leah Andrew', position: 'Strategy, Marketing & Communications', image: '/images/home/frame-3308-2.webp' },
  { name: 'Daniel Incandela', position: 'CMO | Advisor | Consultant', image: '/images/home/frame-3310-4.webp' },
  { name: 'Jared Blank', position: 'Author of the Gobbledy', image: '/images/home/frame-3308-3.webp' },
  { name: 'Vinay Nair', position: 'Certified Executive Coach (CEC)', image: '/images/home/frame-3310-5.webp' },
]

export const MARKETERS_IMAGE = {
  src: '/images/home/group-3272-p-800.webp',
  srcSet: [
    '/images/home/group-3272-p-500.webp 500w',
    '/images/home/group-3272-p-800.webp 800w',
    '/images/home/group-3272.webp 1160w',
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
  src: '/images/shared/rectangle-7-p-800.webp',
  srcSet: [
    '/images/shared/rectangle-7-p-500.webp 500w',
    '/images/shared/rectangle-7-p-800.webp 800w',
    '/images/shared/rectangle-7.webp 1176w',
  ].join(', '),
}

// Responsive widths for each Insights thumbnail, taken from the live homepage srcset: the
// -p-500 / -p-800 variants saved next to the image in public/images, then the original's width.
export const VIDEO_THUMB_WIDTHS = {
  'marketing-ideas-that-delivered-real-results-5-real-life-examples-from-cmos': [500, 800, 1408],
  'if-everything-is-ai-generated-what-makes-a-brand-believable-a-cmo-discussion': [500, 728],
  'the-future-of-search-a-cmos-guide-to-seo-geo-and-aeo': [500, 800, 1560],
  'the-2026-cmo-burnout-crisis-roi-pressure-ai-fatigue-tech-overload': [500, 724],
  'the-2026-cmo-role-expectations-major-shifts-harsh-realities': [500, 800, 1600],
  'ai-agents-for-cmos-getting-started-strategy-blueprint-best-tools': [500, 800, 1024],
  '2026-marketing-budget-cmos-guide-to-frameworks-benchmarks-and-projection-models': [500, 800, 1024],
  'should-cmos-report-to-sales-5-things-to-consider-when-reporting-to-a-cro': [500, 800, 1080],
  'the-impact-of-ai-in-digital-marketing-in-the-next-5-years-seo-paid-social': [500, 800, 1000],
  'cmos-role-in-a-go-to-market-strategy-exercise-aligning-with-the-c-suite-team': [500, 800, 940],
  'marketing-teams-of-the-future-cmos-guide-to-leveraging-ai-to-build-strategy-optimize-efficiency-and-drive-growth': [500, 800, 1200],
  'marketing-leadership-by-the-numbers-5-most-overlooked-cmo-metrics': [500, 800, 1024],
  'cmo-career-setback-rebuilding-confidence-and-career-success-after-being-laid-off-or-fired': [500, 626],
  'career-compass-mastering-salary-negotiation-and-understanding-current-compensation-benchmarks': [500, 800, 1600],
  'managing-board-expectations-top-5-strategies-for-cmos-to-nail-every-board-meeting': [500, 800, 1024],
  'career-compass-navigating-difficult-conversations-and-decision-making-discussions-with-diplomacy-and-lasting-impact': [500, 800, 1600],
  'drive-more-demand-in-2025-b2c-campaign-examples-we-can-all-steal-from': [500, 1024],
  'career-compass-10-things-i-learned-when-becoming-a-cmo-with-bart-molenda-cmo-at-hellofresh': [500, 800, 1600],
  'cmos-tell-all-2025-marketing-playbook-top-5-marketing-opportunities-for-cmos-to-generate-demand': [500, 800, 1080],
  'marketing-career-compass-soar-to-success-on-linkedin-how-to-get-employers-reaching-out-to-you': [500, 800, 1600],
  'marketing-budget-planning-for-2025-proven-frameworks-and-benchmark-insights': [500, 800, 1600],
  'cmo-tell-all-balancing-ai-and-emotional-intelligence-in-2025': [500, 800, 1200],
  'marketing-career-compass-common-interview-mistakes-and-best-practices-to-get-your-next-role': [500, 800, 1600],
  'stop-fighting-start-winning-measuring-the-success-of-cmo-and-cro-alignment': [500, 800, 1600],
  'cmos-tell-all-venture-capital-perspective-on-marketing-kpi-benchmarks': [500, 800, 1600],
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
