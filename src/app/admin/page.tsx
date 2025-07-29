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

export default async function AdminDashboardPage() {
  const reports: any[] = [] // Will be replaced with real Supabase/API data

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
                    <TableRow key={report.id}>
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
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6">
            <Button variant="outline" size="sm" disabled>
              ◀ Prev
            </Button>
            <span className="text-sm text-muted-foreground">Page 1 of N</span>
            <Button variant="outline" size="sm" disabled>
              Next ▶
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
