'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalLinks: number
}

export default function Pagination({ currentPage, totalPages, totalLinks }: PaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const ITEMS_PER_PAGE = 10

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', page.toString())
    router.push(`/?${params.toString()}`)
  }

  const startItem = (currentPage - 1) * ITEMS_PER_PAGE + 1
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, totalLinks)

  return (
    <div className="flex justify-between items-center mt-6">
      <span className="text-xs text-zinc-500">
        Showing {startItem}-{endItem} of {totalLinks}
      </span>
      <div className="flex items-center space-x-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1.5 rounded-md text-sm
                   disabled:opacity-50 disabled:cursor-not-allowed
                   hover:bg-zinc-800 transition-colors duration-200
                   flex items-center gap-1 text-zinc-400 hover:text-zinc-300"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
          prev
        </button>
        <span className="text-xs font-normal text-zinc-500">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 rounded-md text-sm
                   disabled:opacity-50 disabled:cursor-not-allowed
                   hover:bg-zinc-800 transition-colors duration-200
                   flex items-center gap-1 text-zinc-400 hover:text-zinc-300"
          aria-label="Next page"
        >
          next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
