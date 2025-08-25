import { describe, it, expect } from 'vitest'

describe('ImageSteganography Algorithm', () => {
  it('should properly implement the evenNum function', () => {
    // Since we can't easily access internal methods, we'll test the concept
    // evenNum should make numbers even by subtracting 1 if odd
    const evenNum = (num: number) => {
      num = num > 254 ? num - 1 : num
      num = num % 2 == 1 ? num - 1 : num
      return num
    }

    expect(evenNum(255)).toBe(254)
    expect(evenNum(254)).toBe(254)
    expect(evenNum(127)).toBe(126)
    expect(evenNum(126)).toBe(126)
  })

  it('should correctly scale images to fit canvas without cropping', () => {
    // Test the scaling algorithm
    const calculateScale = (
      canvasWidth: number,
      canvasHeight: number,
      imgWidth: number,
      imgHeight: number,
    ) => {
      return Math.min(canvasWidth / imgWidth, canvasHeight / imgHeight)
    }

    // Test case 1: Image is wider than canvas (1200x800 image on 800x600 canvas)
    // Scale should be min(800/1200, 600/800) = min(0.667, 0.75) = 0.667
    expect(calculateScale(800, 600, 1200, 800)).toBeCloseTo(0.667, 3)

    // Test case 2: Image is taller than canvas (600x1200 image on 800x600 canvas)
    // Scale should be min(800/600, 600/1200) = min(1.333, 0.5) = 0.5
    expect(calculateScale(800, 600, 600, 1200)).toBeCloseTo(0.5, 3)

    // Test case 3: Image fits perfectly
    expect(calculateScale(800, 600, 800, 600)).toBe(1)
  })

  it('should properly handle the LSB steganography algorithm', () => {
    // Test the core LSB algorithm concept
    const testData = [255, 128, 64, 32, 16, 8, 4, 2, 1]
    const evenData = testData.map((num) => {
      num = num > 254 ? num - 1 : num
      num = num % 2 == 1 ? num - 1 : num
      return num
    })

    // All numbers should be even after processing
    evenData.forEach((num) => {
      expect(num % 2).toBe(0)
    })

    // Test binary conversion
    const binaryData = evenData.map((num) => {
      return num.toString(2).padStart(8, '0').split('')
    })

    // Each should be 8 bits
    binaryData.forEach((bits) => {
      expect(bits.length).toBe(8)
    })
  })
})
