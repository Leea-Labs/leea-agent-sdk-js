import fs from 'fs'
import path from 'path'

class ImageReader {
  private readonly allowedExtensions = ['.png', '.jpg', '.jpeg', '.gif']
  private readonly maxSizeInMB = 1

  private validate(filePath: string): {valid: boolean; error?: string} {
    if (!fs.existsSync(filePath)) {
      return {valid: false, error: "Image doesn't exist"}
    }

    const stats = fs.statSync(filePath)
    const ext = path.extname(filePath).toLowerCase()
    if (!stats.isFile() || !this.allowedExtensions.includes(ext)) {
      return {valid: false, error: `Invalid image path. It's not an image`}
    }

    if (stats.size > this.maxSizeInMB * 1024 * 1024) {
      return {valid: false, error: `Invalid image size. Max is ${this.maxSizeInMB}MB`}
    }

    try {
      fs.accessSync(filePath, fs.constants.R_OK)
    } catch {
      return {valid: false, error: 'Image path permission error'}
    }

    return {valid: true}
  }

  get(filePath: string) {
    const validation = this.validate(path.resolve(process.cwd(), filePath))
    if (!validation.valid) {
      throw new Error(validation.error)
    }
    return fs.readFileSync(filePath)
  }
}

export const imageReader = new ImageReader()
