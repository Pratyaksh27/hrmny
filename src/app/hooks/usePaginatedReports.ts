"use client"

import { useEffect, useState } from "react"
import { Report } from "@/app/types";

export function usePaginatedReports(statusFilter: string | null = null) {
  const [reports, setReports] = useState<Report[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [nextPageCursor, setNextPageCursor] = useState<string | null>(null) // future page cursor
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
    setCursor(currentCursor || null)
    if (currentCursor) {
        // setCursorStack((prev) => [...prev, currentCursor])
    }
    setNextPageCursor(nextCursor || null)
    setHasNextPage(hasNextPage)
    setLoading(false)
  }

  const goNext = () => {
    console.log("usePaginatedReports: goNext called with cursor:", cursor)
    if (hasNextPage && nextPageCursor) {
        setCursorStack((prev) => [...prev, cursor ?? "__null__"])
        setPage((prev) => prev + 1)
        fetchReports(nextPageCursor)
    }
  }

  const goPrev = () => {
    const newStack = [...cursorStack]
    const popped = newStack.pop()
    const prevCursor = popped === "__null__" ? null : popped
    setCursorStack(newStack)
    setPage((prev) => Math.max(1, prev - 1))
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