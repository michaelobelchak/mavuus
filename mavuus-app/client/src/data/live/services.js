const CDN = 'https://cdn.prod.website-files.com/6689664d9906e5efe6bbc54d'

export const HERO = {
  image: `${CDN}/668f46214842f23691d72111_Rectangle%207.webp`,
  steps: ['Clarity & priorities', 'Positioning & messaging', 'Pipeline & demand', 'Execution & results'],
}

export const WHO_IMAGE = {
  src: `${CDN}/668f4ef17e1ac5e4d40cd793_Group%203276.webp`,
  srcSet: [
    `${CDN}/668f4ef17e1ac5e4d40cd793_Group%203276-p-500.webp 500w`,
    `${CDN}/668f4ef17e1ac5e4d40cd793_Group%203276-p-800.webp 800w`,
    `${CDN}/668f4ef17e1ac5e4d40cd793_Group%203276-p-1080.webp 1080w`,
    `${CDN}/668f4ef17e1ac5e4d40cd793_Group%203276.webp 1542w`,
  ].join(', '),
}

export const SERVICE_CARDS = [
  {
    num: '01',
    size: 'third',
    title: 'Marketing Strategy & Planning',
    text: 'Get clarity on where marketing should focus and how it supports your broader business objectives.',
    label: 'We can help with',
    items: [
      'Marketing strategy and planning',
      'Marketing audits and opportunity assessment',
      'Budget and resource allocation',
      'Marketing priorities and roadmaps',
      'KPIs, measurement and performance',
      'Marketing team and resource planning',
    ],
  },
  {
    num: '02',
    size: 'third',
    title: 'Positioning, Messaging & Go-to-Market',
    text: "Strong marketing starts with knowing exactly who you're trying to reach, why they should care and how you are different.",
    label: 'We help companies strengthen',
    items: [
      'Ideal customer profiles and target audiences',
      'Market and competitive positioning',
      'Value propositions and messaging',
      'Go-to-market strategy',
      'Product and solution positioning',
      'Buyer journeys',
    ],
  },
  {
    num: '03',
    size: 'third',
    wideOnTablet: true,
    title: 'Demand Generation & Pipeline Strategy',
    text: "More activity doesn't automatically create more pipeline. We help organizations build demand programs around the audiences, channels and opportunities most likely to drive business impact.",
    label: 'Our work can include',
    items: [
      'Demand generation strategy',
      'Account-based marketing (ABM)',
      'Campaign strategy',
      'Content and thought leadership',
      'Channel strategy',
      'Lead generation and nurture',
      'Sales and marketing alignment',
      'Pipeline goals and measurement',
    ],
  },
  {
    num: '04',
    size: 'half',
    title: 'Marketing Execution & Campaign Support',
    text: "Great strategies need great execution. We can help with both. A strong marketing strategy is only valuable when it's put into action. Our team can help you plan, manage and execute marketing initiatives, whether you need support for a specific campaign or ongoing assistance alongside your internal team.",
    label: 'Our execution capabilities include',
    items: [
      'Integrated marketing campaigns',
      'ABM campaigns and personalized outreach',
      'Demand generation and lead nurturing',
      'Content creation and thought leadership',
      'Email marketing and marketing automation',
      'LinkedIn campaigns and executive outreach',
      'Webinar, event and conference marketing',
      'Campaign performance tracking and optimization',
    ],
    note: 'From strategic direction to day-to-day implementation, we bring together the experience and execution resources needed to move your marketing initiatives forward.',
  },
  {
    num: '05',
    size: 'half',
    title: 'Fractional & Strategic Marketing Leadership',
    text: "Sometimes the challenge isn't another campaign. It's having experienced marketing leadership at the table. We provide senior strategic support to organizations that need an experienced marketing perspective without necessarily hiring another full-time executive.",
    label: 'This can include',
    items: [
      'Fractional CMO leadership',
      'Executive and leadership-team advisory',
      'Marketing team hiring and guidance',
      'Strategic initiative leadership',
      'Agency and vendor oversight',
      'Sales, marketing and leadership alignment',
    ],
  },
]

export const ENGAGEMENT_MODELS = [
  {
    num: '01',
    title: 'Strategy & Advisory',
    tag: 'Your strategic marketing partner.',
    question: 'Already have a marketing team but need experienced strategic direction?',
    paragraphs: [
      'We work alongside your leadership and marketing teams to evaluate opportunities, establish priorities, develop marketing strategies and guide execution. We can also help you identify the right resources and build the marketing capabilities needed to support your growth.',
    ],
  },
  {
    num: '02',
    title: 'Strategy + Execution',
    tag: 'Your extended marketing team.',
    question: 'Have a marketing team but need additional expertise or execution capacity?',
    paragraphs: [
      'We develop your strategy and work alongside your internal team to bring it to life. From campaign planning and ABM to content development, demand generation and ongoing optimization, we provide the strategic oversight and hands-on resources needed to move initiatives forward.',
    ],
  },
  {
    num: '03',
    title: 'Outsourced Marketing Team',
    tag: 'Your marketing team, without building one from scratch.',
    question: "Need an experienced marketing function but aren't ready to build an entire internal team?",
    paragraphs: [
      'Mavuus can serve as your outsourced marketing team, providing strategic leadership, campaign management and execution support. We bring together the expertise and resources needed to plan and deliver your marketing initiatives while staying aligned with your business objectives.',
    ],
  },
  {
    num: '04',
    title: 'Marketing Team Development & Leadership',
    tag: 'Build the right team for long-term growth.',
    question: 'Ready to develop or expand your internal marketing capabilities?',
    paragraphs: [
      'We help you determine the marketing roles, skills and resources your business needs. From organizational structure and resource planning to supporting recruitment and onboarding, we can help you build your team while providing strategic leadership during the transition.',
      'Our involvement can evolve as your internal team grows, allowing us to move from hands-on execution to ongoing strategic advisory.',
    ],
  },
]

export const WHY = {
  image: `${CDN}/6699b58945922c66688e3a22_sisters.jpg`,
  srcSet: [
    `${CDN}/6699b58945922c66688e3a22_sisters-p-500.jpg 500w`,
    `${CDN}/6699b58945922c66688e3a22_sisters-p-800.jpg 800w`,
    `${CDN}/6699b58945922c66688e3a22_sisters-p-1080.jpg 1080w`,
    `${CDN}/6699b58945922c66688e3a22_sisters.jpg 1120w`,
  ].join(', '),
  intro: [
    'Mavuus is a B2B marketing strategy and consulting firm helping technology companies turn market and customer intelligence into focused growth strategies.',
    'Led by co-founders Elmira Abushayeva and Dilya Abushayeva, Mavuus brings 15+ years of B2B technology and software marketing experience across GTM strategy, ABM, market research, positioning and messaging, demand generation and sales enablement.',
  ],
  question: 'Clients work directly with the founders, bringing senior-level marketing leadership into the strategy and decisions that shape the program.',
  stats: [
    { num: '~$2.1M', label: 'in pipeline generated' },
    { num: '5', label: 'qualified opportunities' },
  ],
  example: 'A targeted campaign for a manufacturing software company generated approximately $2.1M in pipeline and five qualified opportunities from a focused group of target companies.',
  outro: [
    'Mavuus is also home to a community of CMOs and senior marketing leaders who connect, exchange ideas and learn from one another through conversations, content and events.',
    'And that community makes our consulting practice stronger. It keeps us close to the real challenges marketing leaders are facing, allows us to continuously learn from one another, and helps us evolve our approach through the collective knowledge and experience of senior marketers.',
  ],
}
