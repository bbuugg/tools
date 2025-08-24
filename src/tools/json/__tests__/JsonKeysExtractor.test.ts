import { describe, it, expect } from 'vitest'
import { getAllValues } from '../JsonKeysExtractor.vue'

describe('JsonKeysExtractor - Value Extraction', () => {
  it('should extract values from a simple object', () => {
    const data = { name: 'John', age: 30 }
    const values = getAllValues(data)
    expect(values).toContain('John')
    expect(values).toContain(30)
    expect(values).toHaveLength(2)
  })

  it('should extract values from nested objects', () => {
    const data = {
      user: {
        name: 'John',
        profile: {
          age: 30,
          active: true,
        },
      },
    }
    const values = getAllValues(data)
    expect(values).toContain('John')
    expect(values).toContain(30)
    expect(values).toContain(true)
    expect(values).toHaveLength(3)
  })

  it('should extract values from arrays', () => {
    const data = {
      items: ['apple', 'banana', 'cherry'],
      count: 3,
    }
    const values = getAllValues(data)
    expect(values).toContain('apple')
    expect(values).toContain('banana')
    expect(values).toContain('cherry')
    expect(values).toContain(3)
    expect(values).toHaveLength(4)
  })

  it('should handle mixed data types', () => {
    const data = {
      name: 'John',
      age: 30,
      active: true,
      score: null,
      tags: ['developer', 'vue'],
      address: {
        city: 'New York',
        zip: 10001,
      },
    }
    const values = getAllValues(data)
    expect(values).toContain('John')
    expect(values).toContain(30)
    expect(values).toContain(true)
    expect(values).toContain(null)
    expect(values).toContain('developer')
    expect(values).toContain('New York')
    expect(values).toContain(10001)
    expect(values).toHaveLength(7)
  })
})
