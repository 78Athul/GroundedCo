export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous') // needed to avoid CORS issues
    image.src = url
  })

function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180
}

export default async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { width: number; height: number; x: number; y: number },
  rotation = 0
): Promise<File | null> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    return null
  }

  // set canvas size to match the original image bounding box
  canvas.width = image.width
  canvas.height = image.height

  ctx.translate(image.width / 2, image.height / 2)
  ctx.rotate(getRadianAngle(rotation))
  ctx.translate(-image.width / 2, -image.height / 2)

  ctx.drawImage(image, 0, 0)

  // extract the cropped image data
  const data = ctx.getImageData(pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height)

  // set canvas width to final desired crop size
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  // paste generated crop image at top left
  ctx.putImageData(data, 0, 0)

  return new Promise((resolve, reject) => {
    canvas.toBlob((file) => {
      if (file) {
        const croppedFile = new File([file], 'cropped.jpeg', {
          type: 'image/jpeg',
          lastModified: Date.now(),
        })
        resolve(croppedFile)
      } else {
        reject(new Error('Canvas is empty'))
      }
    }, 'image/jpeg', 0.95) // high quality jpeg
  })
}
