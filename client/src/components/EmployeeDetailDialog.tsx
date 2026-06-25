import { useEffect, useState } from 'react'
import type { Employee } from '@/api/types'
import { updateSalary } from '@/api/employees'
import { formatCurrency, minorToMajor } from '@/lib/formatCurrency'
import { CURRENCIES } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface EmployeeDetailDialogProps {
  employee: Employee | null
  onClose: () => void
  onSaved: () => void
}

export function EmployeeDetailDialog({ employee, onClose, onSaved }: EmployeeDetailDialogProps) {
  const [amountInput, setAmountInput] = useState('')
  const [currency, setCurrency] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (employee) {
      setAmountInput(String(minorToMajor(employee.salaryAmount)))
      setCurrency(employee.salaryCurrency)
      setError(null)
    }
  }, [employee])

  if (!employee) {
    return null
  }

  const employeeId = employee.id

  // Client-side checks mirror the server's rules for fast feedback only — the
  // server re-validates and is the source of truth (see handleSave's catch).
  const amountMajor = Number(amountInput)
  const amountTouched = amountInput.trim() !== ''
  const isAmountValid = amountTouched && Number.isFinite(amountMajor) && amountMajor > 0
  const isCurrencyValid = CURRENCIES.includes(currency)
  const isValid = isAmountValid && isCurrencyValid

  async function handleSave() {
    if (!isValid) return

    setSaving(true)
    setError(null)

    try {
      await updateSalary(employeeId, { amountMajor, currency })
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update salary')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{employee.name}</DialogTitle>
          <DialogDescription>{employee.email}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-y-2 text-sm">
          <span className="text-muted-foreground">Department</span>
          <span>{employee.department}</span>
          <span className="text-muted-foreground">Country</span>
          <span>{employee.country}</span>
          <span className="text-muted-foreground">Role</span>
          <span>{employee.role}</span>
          <span className="text-muted-foreground">Current salary</span>
          <span>{formatCurrency(employee.salaryAmount, employee.salaryCurrency)}</span>
          <span className="text-muted-foreground">Joined</span>
          <span>{new Date(employee.joinedAt).toLocaleDateString()}</span>
        </div>

        <div className="flex flex-col gap-3 border-t pt-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="salary-amount" className="text-sm font-medium">
              New amount (major units)
            </label>
            <Input
              id="salary-amount"
              type="number"
              step="0.01"
              value={amountInput}
              onChange={(event) => setAmountInput(event.target.value)}
            />
            {amountTouched && !isAmountValid && (
              <p className="text-sm text-destructive">Amount must be a number greater than 0.</p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Currency</label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((code) => (
                  <SelectItem key={code} value={code}>
                    {code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!isValid || saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
