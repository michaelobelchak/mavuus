import { Router } from 'express'
import { authenticateToken } from '../middleware/auth.js'
import { uploadImage } from '../middleware/upload.js'

const router = Router()

router.post('/image', authenticateToken, (req, res) => {
  uploadImage.single('image')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Image must be 5MB or less' })
      }
      return res.status(400).json({ error: err.message })
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' })
    }
    res.json({ url: `/uploads/${req.file.filename}` })
  })
})

export default router
