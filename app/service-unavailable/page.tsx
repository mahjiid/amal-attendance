import type { Metadata } from 'next'
import { AmalTechLogo } from '@/components/ui/logo'

export const metadata: Metadata = { title: 'Amal Attendance | Service status' }

export default function AttendanceServiceStatus() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <section className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 text-card-foreground shadow-lg">
        <AmalTechLogo className="mb-8 h-10 w-auto" />
        <p className="text-sm font-medium text-primary">AMAL ATTENDANCE</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Staff sign-in is temporarily unavailable</h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">The attendance database is offline. Sign-in and attendance records will be available once service is restored.</p>
      </section>
    </main>
  )
}
