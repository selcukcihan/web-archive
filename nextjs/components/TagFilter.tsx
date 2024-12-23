'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronDown, ChevronUp, Hash, Search } from 'lucide-react'

interface TagCount {
  tag: string;
  count: number;
}

export default function TagFilter({ tags }: { tags: TagCount[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)

  const handleTagClick = (tag: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('tag', tag)
    params.delete('page')
    router.push(`/?${params.toString()}`)
  }

  const filteredTags = tags.filter(({ tag }) => 
    tag.toLowerCase().includes(search.toLowerCase())
  )

  const displayedTags = isExpanded ? filteredTags : filteredTags.slice(0, 10)
  const hasMoreTags = filteredTags.length > 10

  return (
    <div className="bg-zinc-800/50 rounded-lg p-4">
      <h2 className="text-base font-semibold mb-4 flex items-center text-zinc-400">
        <Hash className="w-4 h-4 mr-2" />
        <span>Tags</span>
      </h2>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tags..."
          className="w-full pl-10 pr-4 py-2 bg-zinc-900/50 rounded-md 
                   text-zinc-300 placeholder-zinc-500 focus:outline-none 
                   focus:ring-1 focus:ring-zinc-700"
        />
      </div>
      <div className="space-y-1">
        {displayedTags.map(({ tag, count }) => (
          <button
            key={tag}
            onClick={() => handleTagClick(tag)}
            className="flex justify-between items-center w-full px-3 py-2 text-left 
                     hover:bg-zinc-700/50 rounded-md group transition-colors duration-200"
          >
            <span className="truncate text-sm">
              <span className="text-zinc-500">#</span> {tag}
            </span>
            <span className="text-xs text-zinc-500 font-normal">
              {count}
            </span>
          </button>
        ))}
      </div>
      {hasMoreTags && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-center w-full mt-4 px-3 py-2 
                   text-xs text-zinc-400 hover:text-zinc-300 
                   hover:bg-zinc-700/50 rounded-md transition-colors duration-200"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-3 w-3 mr-1" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3 mr-1" />
              Show More ({filteredTags.length - 10})
            </>
          )}
        </button>
      )}
    </div>
  )
}
