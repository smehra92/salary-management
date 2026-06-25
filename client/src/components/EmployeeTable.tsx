import { useState } from 'react'
import type { Employee } from '@/api/types'
import { formatCurrency } from '@/lib/formatCurrency'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EmployeeDetailDialog } from '@/components/EmployeeDetailDialog'

interface EmployeeTableProps {
  data: Employee[]
  total: number
  page: number
  totalPages: number
  loading: boolean
  error: string | null
  setPage: (page: number) => void
  onSalaryUpdated: () => void
}

export function EmployeeTable({
  data,
  total,
  page,
  totalPages,
  loading,
  error,
  setPage,
  onSalaryUpdated,
}: EmployeeTableProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)

  return (
    <div className="flex w-full max-w-4xl flex-col gap-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Country</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Salary</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {error && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-destructive">
                Failed to load employees: {error}
              </TableCell>
            </TableRow>
          )}
          {!error && loading && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                Loading…
              </TableCell>
            </TableRow>
          )}
          {!error && !loading && data.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No employees found
              </TableCell>
            </TableRow>
          )}
          {!error &&
            !loading &&
            data.map((employee) => (
              <TableRow
                key={employee.id}
                className="cursor-pointer"
                onClick={() => setSelectedEmployee(employee)}
              >
                <TableCell>{employee.name}</TableCell>
                <TableCell>{employee.email}</TableCell>
                <TableCell>{employee.department}</TableCell>
                <TableCell>{employee.country}</TableCell>
                <TableCell>{employee.role}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(employee.salaryAmount, employee.salaryCurrency)}
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{total.toLocaleString()} employees</p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Prev
          </Button>
          <span className="text-sm">
            Page {page} of {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            Next
          </Button>
        </div>
      </div>

      <EmployeeDetailDialog
        employee={selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
        onSaved={() => {
          setSelectedEmployee(null)
          onSalaryUpdated()
        }}
      />
    </div>
  )
}
