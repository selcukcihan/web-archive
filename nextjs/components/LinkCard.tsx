'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ExternalLink } from 'lucide-react'
import { Link } from '@/lib/data'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useRouter } from 'next/navigation'

const SUMMARY_MAX_LENGTH = 120

export default function LinkCard({ link }: { link: Link }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const router = useRouter()

  const hasLongSummary = link.summary && link.summary.length > SUMMARY_MAX_LENGTH
  const displaySummary = hasLongSummary && !isExpanded
    ? `${link.summary.slice(0, SUMMARY_MAX_LENGTH)}...`
    : link.summary

  const handleTagClick = (tag: string) => {
    router.push(`/?tag=${encodeURIComponent(tag)}`)
  }

  return (
    <div className="bg-zinc-800/50 rounded-lg p-3 sm:p-4 relative overflow-hidden w-full">
      {/* Title Row */}
      <div className="mb-3 sm:mb-4">
        <div className="flex items-start gap-2">
          <h2 className="text-base sm:text-lg font-semibold flex-1 min-w-0">
            <a 
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-400 truncate block"
            >
              {link.title}
            </a>
          </h2>
          <ExternalLink className="w-4 h-4 flex-shrink-0 text-zinc-500 mt-1" />
        </div>
        <time className="text-xs text-zinc-500 mt-1 block">
          {new Date(link.createdAt).toLocaleDateString()}
        </time>
      </div>

      {/* Content Row */}
      <div className="flex gap-3 sm:gap-4">
        {/* Image */}
        {link.image && (
          <div className="relative w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] flex-shrink-0">
            <Image 
              src={link.image} 
              alt=""
              fill
              className="rounded object-cover"
            />
          </div>
        )}

        {/* Tags and Summary */}
        <div className="flex-1 min-w-0">
          {/* Single-row Tags with Tooltip */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center h-7 overflow-hidden">
                  <div className="flex gap-1.5 sm:gap-2">
                    {link.tags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleTagClick(tag)}
                        className="inline-flex items-center px-2 py-1 rounded-md 
                                bg-zinc-900/50 text-zinc-400 text-xs
                                hover:bg-zinc-700/50 hover:text-zinc-300 transition-colors
                                whitespace-nowrap"
                      >
                        <span className="text-zinc-500 mr-1">#</span>
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent 
                side="top" 
                className="bg-zinc-800 border-zinc-700 p-2"
              >
                <div className="flex flex-wrap gap-1.5 max-w-[300px]">
                  {link.tags.map((tag) => (
                    <span 
                      key={tag}
                      className="inline-flex items-center px-2 py-1 rounded-md 
                              bg-zinc-900/50 text-zinc-400 text-xs"
                    >
                      <span className="text-zinc-500 mr-1">#</span>
                      {tag}
                    </span>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Clickable Summary */}
          {displaySummary && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full text-left mt-2"
            >
              <p className="text-sm text-zinc-400 leading-relaxed hover:text-zinc-300 transition-colors">
                {displaySummary}
                {hasLongSummary && !isExpanded && (
                  <span className="text-zinc-500 hover:text-zinc-400 ml-1">
                    more
                  </span>
                )}
              </p>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

