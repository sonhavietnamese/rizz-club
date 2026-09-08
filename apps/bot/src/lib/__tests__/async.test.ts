import { describe, expect, test } from 'bun:test'
import { errorMessage, isAbortError } from '../async.ts'

describe('isAbortError', () => {
  test('treats an aborted signal as abort even without an error object', () => {
    const controller = new AbortController()
    controller.abort()
    expect(isAbortError(undefined, controller.signal)).toBe(true)
  })

  test('recognizes AbortError and aborted messages', () => {
    const abort = new Error('Aborted')
    abort.name = 'AbortError'
    expect(isAbortError(abort)).toBe(true)
    expect(isAbortError(new Error('Aborted'))).toBe(true)
    expect(isAbortError(new Error('Indexer timed out'))).toBe(false)
  })
})

describe('errorMessage', () => {
  test('reads an Error message or falls back', () => {
    expect(errorMessage(new Error('boom'))).toBe('boom')
    expect(errorMessage('nope')).toBe('Unknown error')
  })
})
