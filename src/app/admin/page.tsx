"use client"

import { useState } from "react"
import React from "react";
import { usePaginatedReports } from "@/app/hooks/usePaginatedReports"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function AdminDashboardPage() {
  const [status, setStatus] = useState<string | null>(null)
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null)
  const [generatedReports, setGeneratedReports] = useState<Record<string, boolean>>({})

  const {
    reports,
    hasNextPage,
    loading,
    goNext,
    goPrev,
    canGoPrev,
    page,
  } = usePaginatedReports(status)

  const toggleRow = (reportId: string) => {
    setExpandedReportId(prev => (prev === reportId ? null : reportId))
  }

  const trackGeneratedReport = (reportId: string) => {
    setGeneratedReports(prev => ({ ...prev, [reportId]: true }))
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Admin Dashboard - Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Claimant ID</TableHead>
                  <TableHead>First Defendant ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                      No reports found.
                    </TableCell>
                  </TableRow>
                ) : (
                  reports.map((report) => (
                    <React.Fragment key={report.id}>
                      <TableRow
                        key={report.id}
                        className="cursor-pointer hover:bg-muted"
                        onClick={() => toggleRow(report.id)}
                      >
                        <TableCell>
                          {report.id.slice(0, 6)}...{report.id.slice(-4)}
                        </TableCell>
                        <TableCell>{report.claimant}</TableCell>
                        <TableCell>
                          {Array.isArray(report.defendants) && report.defendants.length > 0
                            ? report.defendants[0]
                            : "N/A"}
                        </TableCell>
                        <TableCell>{report.created_at}</TableCell>
                        <TableCell>{report.status ?? "In Progress"}</TableCell>
                      </TableRow>

                      {expandedReportId === report.id && (
                        <TableRow key={`${report.id}-expanded`} className="bg-gray-50">
                          <TableCell colSpan={5}>
                            <div className="flex flex-col gap-2 p-4">
                              <div className="text-sm text-muted-foreground">
                                <strong>Timestamp:</strong>{" "}
                                {new Date(report.created_at).toLocaleString()}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                <strong>Number of Conversations:</strong> (x) {/* TODO: wire logic */}
                              </div>
                              <div className="flex gap-3 mt-2">
                                <Button size="sm" variant="secondary">
                                  Download Transcripts
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => trackGeneratedReport(report.id)}
                                >
                                  Generate Report
                                </Button>
                                <Button
                                  size="sm"
                                  disabled={!generatedReports[report.id]}
                                >
                                  View Report
                                </Button>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6">
            <Button variant="outline" size="sm" onClick={goPrev} disabled={!canGoPrev}>
              ◀ Prev
            </Button>
            <span className="text-sm text-muted-foreground">Page {page}</span>
            <Button variant="outline" size="sm" onClick={goNext} disabled={!hasNextPage}>
              Next ▶
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
