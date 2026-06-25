import { useEffect, useState } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import { COUNTRIES, DEPARTMENTS } from '@/lib/constants'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const ALL_DEPARTMENTS = '__all_departments__'
const ALL_COUNTRIES = '__all_countries__'

interface EmployeeFiltersProps {
  search: string
  department: string
  country: string
  setSearch: (value: string) => void
  setDepartment: (value: string) => void
  setCountry: (value: string) => void
}

export function EmployeeFilters({
  search,
  department,
  country,
  setSearch,
  setDepartment,
  setCountry,
}: EmployeeFiltersProps) {
  const [searchInput, setSearchInput] = useState(search)
  const debouncedSearch = useDebounce(searchInput, 300)

  useEffect(() => {
    setSearch(debouncedSearch)
    // setSearch resets page to 1 on every call; only debouncedSearch should retrigger this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  function handleClear() {
    setSearchInput('')
    setSearch('')
    setDepartment('')
    setCountry('')
  }

  return (
    <div className="flex w-full max-w-4xl flex-wrap items-center gap-2">
      <Input
        placeholder="Search by name or email"
        value={searchInput}
        onChange={(event) => setSearchInput(event.target.value)}
        className="max-w-xs"
      />

      <Select
        value={department || ALL_DEPARTMENTS}
        onValueChange={(value) => setDepartment(value === ALL_DEPARTMENTS ? '' : value)}
      >
        <SelectTrigger className="w-44">
          <SelectValue placeholder="All departments" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_DEPARTMENTS}>All departments</SelectItem>
          {DEPARTMENTS.map((dept) => (
            <SelectItem key={dept} value={dept}>
              {dept}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={country || ALL_COUNTRIES} onValueChange={(value) => setCountry(value === ALL_COUNTRIES ? '' : value)}>
        <SelectTrigger className="w-44">
          <SelectValue placeholder="All countries" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_COUNTRIES}>All countries</SelectItem>
          {COUNTRIES.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button variant="outline" onClick={handleClear}>
        Clear filters
      </Button>
    </div>
  )
}
