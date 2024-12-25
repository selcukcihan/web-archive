'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import { WebPage } from '../db'

export default function LinkCard({ link }: { link: WebPage }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="bg-zinc-800/50 rounded-lg p-3 sm:p-4 relative overflow-hidden w-full">
      {/* Title Row */}
      <div className="mb-3 sm:mb-4">
        <div className="flex items-start gap-2">
          <h2 className="text-base sm:text-lg font-semibold flex-1 min-w-0">
            <a 
              href={link.link}
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

        {/* Tags */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {(isExpanded ? link.tags : link.tags.slice(0, 3)).map((tag) => (
              <span 
                key={tag} 
                className="inline-flex items-center px-2 py-1 rounded-md 
                         bg-zinc-900/50 text-zinc-400 text-xs"
              >
                <span className="text-zinc-500 mr-1">#</span>
                {tag}
              </span>
            ))}
            {!isExpanded && link.tags.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-md 
                           bg-zinc-900/50 text-zinc-500 text-xs">
                +{link.tags.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Expand/Collapse Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-3 sm:mt-4 w-full flex items-center justify-center gap-1 
                   text-xs text-zinc-400 hover:text-zinc-300 
                   py-1 rounded-md hover:bg-zinc-700/50 transition-colors"
        aria-expanded={isExpanded}
        aria-controls={`summary-${link.link}`}
      >
        {isExpanded ? (
          <>
            <ChevronUp className="w-3 h-3" />
            Show Less
          </>
        ) : (
          <>
            <ChevronDown className="w-3 h-3" />
            Show More
          </>
        )}
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div 
          id={`summary-${link.link}`}
          className="mt-3 sm:mt-4 pt-3 border-t border-zinc-700/50"
        >
          {link.summary ? (
            <p className="text-sm text-justify text-zinc-300 leading-relaxed">
              {link.summary}
            </p>
          ) : (
            <p className="text-sm text-zinc-500 italic">
              No summary available for this article.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
