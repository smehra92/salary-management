import { useEffect, useState } from 'react'
import { getEmployees } from '@/api/employees'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type ConnectionState =
  | { status: 'loading' }
  | { status: 'connected'; totalEmployees: number }
  | { status: 'error'; message: string }

function App() {
  const [state, setState] = useState<ConnectionState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    setState({ status: 'loading' })

    getEmployees({ pageSize: 1 })
      .then((result) => {
        setState({ status: 'connected', totalEmployees: result.total })
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : 'Unknown error'
        setState({ status: 'error', message })
      })
  }, [attempt])

  return (
    <div className="flex min-h-svh items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Salary Management</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {state.status === 'loading' && <p className="text-muted-foreground">Connecting to API…</p>}
          {state.status === 'connected' && <p>Connected — {state.totalEmployees} employees</p>}
          {state.status === 'error' && (
            <p className="text-destructive">Connection failed: {state.message}</p>
          )}
          <Button variant="outline" onClick={() => setAttempt((value) => value + 1)}>
            Retry
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default App
