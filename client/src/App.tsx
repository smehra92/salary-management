import { EmployeeTable } from '@/components/EmployeeTable'

function App() {
  return (
    <div className="flex min-h-svh flex-col items-center gap-6 p-8">
      <h1 className="text-2xl font-semibold">Salary Management</h1>
      <EmployeeTable />
    </div>
  )
}

export default App
