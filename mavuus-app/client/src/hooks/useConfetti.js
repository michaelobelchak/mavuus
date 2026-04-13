import confetti from 'canvas-confetti'

const brandColors = ['#F26D92', '#1F648D', '#F9A8BF', '#2A85B8']

export function fireConfetti() {
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: brandColors,
    scalar: 0.9,
  })
  setTimeout(() => {
    confetti({
      particleCount: 50,
      spread: 100,
      origin: { y: 0.6, x: 0.3 },
      colors: brandColors,
      scalar: 0.8,
    })
  }, 200)
  setTimeout(() => {
    confetti({
      particleCount: 50,
      spread: 100,
      origin: { y: 0.6, x: 0.7 },
      colors: brandColors,
      scalar: 0.8,
    })
  }, 350)
}

export default function useConfetti() {
  return fireConfetti
}
