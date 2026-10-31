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

export const COMPANY_LOGOS = [
  { src: `${CDN_CMS}/66bc28035a04f39f6d65166a_image%20202.png`, alt: 'Scotiabank' },
  { src: `${CDN_CMS}/66bc28347aaa3991418103fc_image%20197.png`, alt: 'Ceridian' },
  { src: `${CDN_CMS}/66bc2856dda573298c99a7c1_image%20201.png`, alt: 'Constellation Software' },
  { src: `${CDN_CMS}/66bc28af949c024a2f680b88_image%20199.png`, alt: 'Arizona Cardinals' },
  { src: `${CDN_CMS}/66bc28ce9e135c0a60329d7e_image%20198.png`, alt: 'Microsoft' },
  { src: `${CDN_CMS}/66bc28e6a18ff494d3569746_image%20206.png`, alt: 'Pizza Pizza' },
  { src: `${CDN_CMS}/66bc2902eb8d3f5a4ba7a419_image%20200.png`, alt: 'PointClickCare' },
  { src: `${CDN_CMS}/66bc291aeb8d3f5a4ba7b864_image%20205.png`, alt: 'Salesforce' },
  { src: `${CDN_CMS}/66c355116e3d2236f3bc598f_image%20204.png`, alt: 'Terminus' },
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
