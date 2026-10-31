// Copied from the live mavuus.com/about page.
const CDN = 'https://cdn.prod.website-files.com/6689664d9906e5efe6bbc54d'

export const ABOUT_HERO = {
  title: 'Empowering Marketing Leaders to Network, Learn, and Advance Their Careers Together',
  text: 'On a mission to help CMOs elevate their influence at the executive table.',
}

export const WHO_WE_ARE = {
  eyebrow: 'WHO WE ARE',
  heading:
    'Created from a spark of inspiration - and by two sisters who live and breathe the world of marketing every day.',
  links: {
    mavuus: 'https://www.linkedin.com/company/mavuus/',
    dilya: 'https://www.linkedin.com/in/dilyaabushayeva/',
    elmira: 'https://www.linkedin.com/in/elmira-abushayeva-b560671a/',
  },
  firstParagraphRest:
    ', who live and breathe the world of marketing every day. After over 15 years in the industry, we’ve come to understand one thing clearly: success in marketing is driven not only by individual expertise but by the strength of the network you build along the way.',
  paragraphs: [
    'Throughout our careers, we’ve navigated the complexities of leading marketing teams, developing strategies, and driving growth. But perhaps the most valuable lessons came from connecting with fellow marketing leaders who shared our challenges, insights, and solutions.',
    'We realized that true career growth doesn’t happen in isolation. It happens when you can engage in meaningful discussions, share ideas, and tap into the collective wisdom of peers who understand the journey. That\'s why we created Mavuus.',
    'Mavuus is a community built exclusively for senior marketing leaders who are looking to network, learn, and collaborate with like-minded professionals. We bring together seasoned leaders who are passionate about continuous learning, career advancement, and shaping the future of marketing. Whether you’re seeking career advice, leadership insights, or simply the opportunity to connect with peers, Mavuus is here to empower your journey.',
    'Our mission is simple: to foster an environment where senior marketing professionals can leverage the power of collaboration, share experiences, and grow together.',
  ],
  image: {
    src: `${CDN}/6699b58945922c66688e3a22_sisters-p-800.jpg`,
    srcSet: [
      `${CDN}/6699b58945922c66688e3a22_sisters-p-500.jpg 500w`,
      `${CDN}/6699b58945922c66688e3a22_sisters-p-800.jpg 800w`,
      `${CDN}/6699b58945922c66688e3a22_sisters-p-1080.jpg 1080w`,
      `${CDN}/6699b58945922c66688e3a22_sisters.jpg 1120w`,
    ].join(', '),
    sizes: '(max-width: 479px) 48vw, (max-width: 991px) 49vw, 442px',
    alt: 'Mavuus founders Dilya and Elmira Abushayeva',
  },
}

export const ORIGIN = {
  eyebrow: 'THE ORIGIN OF MAVUUS',
  heading: 'What Does the Name Mean?',
  image: {
    src: `${CDN}/6699bafbbc4abfb2767db752_img-how-we-got-p-1600.webp`,
    srcSet: [
      `${CDN}/6699bafbbc4abfb2767db752_img-how-we-got-p-500.webp 500w`,
      `${CDN}/6699bafbbc4abfb2767db752_img-how-we-got-p-800.webp 800w`,
      `${CDN}/6699bafbbc4abfb2767db752_img-how-we-got-p-1080.webp 1080w`,
      `${CDN}/6699bafbbc4abfb2767db752_img-how-we-got-p-1600.webp 1600w`,
      `${CDN}/6699bafbbc4abfb2767db752_img-how-we-got.webp 1920w`,
    ].join(', '),
    alt: 'Marketing leaders talking around a desk in a bright office',
  },
}
