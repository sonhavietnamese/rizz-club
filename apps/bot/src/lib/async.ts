export function sleep(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason ?? new Error('Aborted'))
      return
    }

    const timeout = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, ms)

    function onAbort() {
      clearTimeout(timeout)
      reject(signal?.reason ?? new Error('Aborted'))
    }

    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

export function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unknown error'
}
