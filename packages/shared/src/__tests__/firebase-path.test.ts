import { describe, expect, test } from 'bun:test'
import { firebaseKey, traderKey } from '../firebase-path'

describe('firebaseKey', () => {
  test('strips firebase-forbidden characters without changing case', () => {
    expect(firebaseKey('100_1')).toBe('100_1')
    expect(firebaseKey('a/b.c#d$[e]')).toBe('a_b_c_d__e_')
  })
})

describe('traderKey', () => {
  test('lowercases and strips firebase-forbidden characters', () => {
    expect(traderKey('0xAbC.def#1$[x]/Y')).toBe('0xabc_def_1__x__y')
  })
})
