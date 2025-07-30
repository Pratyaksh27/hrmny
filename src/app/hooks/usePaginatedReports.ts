"use client"

import { useEffect, useState } from "react"
import { Report } from "@/app/types";

export function usePaginatedReports(statusFilter: string | null = null) {
  const [reports, setReports] = useState<Report[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [cursorStack, setCursorStack] = useState<string[]>([])
  const [hasNextPage, setHasNextPage] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [page, setPage] = useState(1)


  const limit = 10 // Number of reports per page

  const fetchReports = async (currentCursor: string | null = null) => {
    setLoading(true)

    const params = new URLSearchParams({
      limit: String(limit),
    })
    if (currentCursor) params.append("cursor", currentCursor)
    if (statusFilter) params.append("status", statusFilter)

    const res = await fetch(`/api/admin/reports?${params.toString()}`)
    const { data, nextCursor, hasNextPage } = await res.json()

    setReports(data)
    setCursor(nextCursor)
    setHasNextPage(hasNextPage)
    setLoading(false)
  }

  const goNext = () => {
    console.log("usePaginatedReports: goNext called with cursor:", cursor)
    if (cursor) {
      setCursorStack((prev) => [...prev, cursor])
      setPage((prev) => prev + 1)
      fetchReports(cursor)
    }
  }

  const goPrev = () => {
    const newStack = [...cursorStack]
    const prevCursor = newStack.pop() || null
    setCursorStack(newStack)
    setPage((prev) => Math.max(1, prev - 1))
    // setCursor(prevCursor) // ✅ this is critical
    fetchReports(prevCursor)
  }

  useEffect(() => {
    // Reset pagination when filter changes
    setCursor(null)
    setCursorStack([])
    fetchReports(null)
  }, [statusFilter])

  return {
    reports,
    hasNextPage,
    loading,
    goNext,
    goPrev,
    canGoPrev: cursorStack.length > 0,
    page,
  }
}