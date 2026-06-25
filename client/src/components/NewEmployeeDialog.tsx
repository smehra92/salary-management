import { useState } from 'react'
import type { ReactNode } from 'react'
import { ApiError } from '@/api/client'
import { createEmployee } from '@/api/employees'
import { formatCurrency, majorToMinor } from '@/lib/formatCurrency'
import { COUNTRIES, CURRENCIES, DEPARTMENTS, ROLES } from '@/lib/constants'
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
  DialogTrigger,
} from '@/components/ui/dialog'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DUPLICATE_EMAIL_STATUS = 409

const EMPTY_FORM = {
  name: '',
  email: '',
  department: '',
  country: '',
  role: '',
  amount: '',
  currency: '',
  joinedAt: '',
}

type FormState = typeof EMPTY_FORM

interface NewEmployeeDialogProps {
  onCreated: () => void
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium">{label}</label>
      {children}
    </div>
  )
}

export function NewEmployeeDialog({ onCreated }: NewEmployeeDialogProps) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function update<K extends keyof FormState>(key: K, value: string) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function resetForm() {
    setForm(EMPTY_FORM)
    setError(null)
  }

  // Client-side checks mirror the server's rules for fast feedback only — the
  // server re-validates and is the source of truth (see handleSave's catch).
  const amountMajor = Number(form.amount)
  const amountTouched = form.amount.trim() !== ''
  const isAmountValid = amountTouched && Number.isFinite(amountMajor) && amountMajor > 0
  const isEmailTouched = form.email.trim() !== ''
  const isEmailValid = isEmailTouched && EMAIL_PATTERN.test(form.email)
  const isDateTouched = form.joinedAt !== ''
  const isDateValid = isDateTouched && !Number.isNaN(Date.parse(form.joinedAt)) && new Date(form.joinedAt) <= new Date()
  const requiredFieldsFilled = [form.name, form.department, form.country, form.role, form.currency].every(
    (value) => value.trim() !== '',
  )
  const isValid = requiredFieldsFilled && isEmailValid && isAmountValid && isDateValid

  async function handleSave() {
    if (!isValid) return

    setSaving(true)
    setError(null)

    try {
      await createEmployee({
        name: form.name,
        email: form.email,
        department: form.department,
        country: form.country,
        role: form.role,
        amountMajor,
        currency: form.currency,
        joinedAt: form.joinedAt,
      })
      resetForm()
      setOpen(false)
      onCreated()
    } catch (err) {
      if (err instanceof ApiError && err.status === DUPLICATE_EMAIL_STATUS) {
        setError('An employee with this email already exists.')
      } else {
        setError(err instanceof Error ? err.message : 'Failed to create employee')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) resetForm()
      }}
    >
      <DialogTrigger asChild>
        <Button>New employee</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New employee</DialogTitle>
          <DialogDescription>Add a new employee to the organization.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <Field label="Name">
            <Input value={form.name} onChange={(event) => update('name', event.target.value)} />
          </Field>

          <Field label="Email">
            <Input type="email" value={form.email} onChange={(event) => update('email', event.target.value)} />
            {isEmailTouched && !isEmailValid && (
              <p className="text-sm text-destructive">Enter a valid email address.</p>
            )}
          </Field>

          <Field label="Department">
            <Select value={form.department} onValueChange={(value) => update('department', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((department) => (
                  <SelectItem key={department} value={department}>
                    {department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Country">
            <Select value={form.country} onValueChange={(value) => update('country', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Role">
            <Select value={form.role} onValueChange={(value) => update('role', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Amount (major units)">
            <Input
              type="number"
              step="0.01"
              value={form.amount}
              onChange={(event) => update('amount', event.target.value)}
            />
            {amountTouched && !isAmountValid && (
              <p className="text-sm text-destructive">Amount must be a number greater than 0.</p>
            )}
            {isAmountValid && form.currency && (
              <p className="text-sm text-muted-foreground">
                {formatCurrency(majorToMinor(amountMajor), form.currency)}
              </p>
            )}
          </Field>

          <Field label="Currency">
            <Select value={form.currency} onValueChange={(value) => update('currency', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((currency) => (
                  <SelectItem key={currency} value={currency}>
                    {currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Joined date">
            <Input
              type="date"
              value={form.joinedAt}
              onChange={(event) => update('joinedAt', event.target.value)}
            />
            {isDateTouched && !isDateValid && (
              <p className="text-sm text-destructive">Joined date must be valid and not in the future.</p>
            )}
          </Field>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
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
