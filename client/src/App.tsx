import { useEmployees } from '@/hooks/useEmployees'
import { EmployeeFilters } from '@/components/EmployeeFilters'
import { EmployeeTable } from '@/components/EmployeeTable'
import { NewEmployeeDialog } from '@/components/NewEmployeeDialog'
import { PayInsightsDashboard } from '@/components/PayInsightsDashboard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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
    refetch,
  } = useEmployees()

  return (
    <div className="flex min-h-svh flex-col items-center gap-6 p-8">
      <h1 className="text-2xl font-semibold">Salary Management</h1>

      <Tabs defaultValue="employees" className="flex w-full max-w-5xl flex-col items-center gap-6">
        <TabsList>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="flex w-full flex-col items-center gap-4">
          <div className="flex w-full max-w-4xl items-center justify-end">
            <NewEmployeeDialog onCreated={refetch} />
          </div>
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
            onSalaryUpdated={refetch}
          />
        </TabsContent>

        <TabsContent value="insights" className="flex w-full flex-col items-center">
          <PayInsightsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default App
