import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'

// ─────────────────────────────────────────
// GENERIC ASYNC HOOK (FIXED)
// ─────────────────────────────────────────
export function useAsync(asyncFn, options = {}) {
  const { enabled = true, deps = [] } = options

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const execute = useCallback(async () => {
    if (!enabled) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await asyncFn()
      setData(result) // ✅ FIXED
    } catch (err) {
      const msg = err.message || 'Something went wrong'
      setError(msg)
      console.error("useAsync error:", msg)
    } finally {
      setLoading(false)
    }
  }, [enabled, ...deps])

  useEffect(() => {
    execute()
  }, [execute])

  return { data, loading, error, refetch: execute }
}

// ─────────────────────────────────────────
// DEBOUNCE
// ─────────────────────────────────────────
export function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

// ─────────────────────────────────────────
// LOCAL STORAGE
// ─────────────────────────────────────────
export function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : initial
    } catch {
      return initial
    }
  })

  const set = (v) => {
    setValue(v)
    localStorage.setItem(key, JSON.stringify(v))
  }

  return [value, set]
}

// ─────────────────────────────────────────
// MUTATION HOOK (FIXED)
// ─────────────────────────────────────────
export function useMutation(mutationFn) {
  const [loading, setLoading] = useState(false)

  const mutate = async (data, { onSuccess, onError, successMsg } = {}) => {
    setLoading(true)

    try {
      const result = await mutationFn(data)

      if (successMsg) toast.success(successMsg)

      onSuccess?.(result) // ✅ FIXED

      return result
    } catch (err) {
      const msg = err.message || 'Operation failed'
      toast.error(msg)
      onError?.(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { mutate, loading }
}