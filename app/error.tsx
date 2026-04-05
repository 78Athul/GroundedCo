"use client"

import Link from 'next/link'

export default function AppError({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error)

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-wool-white">
      <div className="max-w-lg rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
        <h1 className="text-3xl font-bold text-red-700 mb-3">Something went wrong</h1>
        <p className="text-red-600 mb-4">We had trouble loading this content. Please retry.</p>
        <button
          onClick={reset}
          className="mx-auto mb-4 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
        >
          Try again
        </button>
        <Link href="/" className="text-sm text-red-800 hover:underline">
          Return to home
        </Link>
      </div>
    </main>
  )
}
