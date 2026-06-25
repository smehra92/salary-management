import { useEmployees } from '@/hooks/useEmployees'
import { EmployeeFilters } from '@/components/EmployeeFilters'
import { EmployeeTable } from '@/components/EmployeeTable'

function App() {
  const {
    data,
    total,
    page,
    totalPages,
    loading,
    error,
    setPage,
    search,
    department,
    country,
    setSearch,
    setDepartment,
    setCountry,
  } = useEmployees()

  return (
    <div className="flex min-h-svh flex-col items-center gap-6 p-8">
      <h1 className="text-2xl font-semibold">Salary Management</h1>
      <EmployeeFilters
        search={search}
        department={department}
        country={country}
        setSearch={setSearch}
        setDepartment={setDepartment}
        setCountry={setCountry}
      />
      <EmployeeTable
        data={data}
        total={total}
        page={page}
        totalPages={totalPages}
        loading={loading}
        error={error}
        setPage={setPage}
      />
    </div>
  )
}

export default App
