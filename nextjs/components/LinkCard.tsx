'use client'

import Image from 'next/image'
import { ExternalLink, Info } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { WebPage } from '../db'

export default function LinkCard({ link }: { link: WebPage }) {
  return (
    <div className="bg-zinc-800/50 rounded-lg p-3 sm:p-4 relative overflow-hidden w-full">
      <div className="flex items-start space-x-3 sm:space-x-4">
        {link.image && (
          <div className="relative w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] flex-shrink-0">
            <Image 
              src={link.image} 
              alt={link.title}
              fill
              className="rounded object-cover"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2 min-w-0 flex-1">
              <a 
                href={link.link}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-400 truncate block"
                style={{ maxWidth: 'calc(100% - 80px)' }}
              >
                {link.title}
              </a>
              <ExternalLink className="w-4 h-4 flex-shrink-0 text-zinc-500" />
            </h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700/50 -mr-1 sm:-mr-2"
                >
                  <Info className="w-4 h-4 sm:mr-1" />
                  <span className="hidden sm:inline text-xs">Summary</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-zinc-900 text-zinc-300 border-zinc-800 w-[calc(100%-32px)] sm:w-full mx-4 sm:mx-auto">
                <DialogHeader>
                  <DialogTitle className="text-base sm:text-lg font-semibold text-zinc-200">
                    {link.title}
                  </DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                  <div className="text-xs sm:text-sm text-zinc-400 mb-4">
                    Added on {new Date(link.createdAt).toLocaleDateString()}
                  </div>
                  {link.summary ? (
                    <p className="text-sm text-zinc-300 leading-relaxed">
                      {link.summary}
                    </p>
                  ) : (
                    <p className="text-sm text-zinc-500 italic">
                      No summary available for this article.
                    </p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {link.tags.map((tag) => (
                      <span 
                        key={tag} 
                        className="inline-flex items-center px-2 py-1 rounded-md 
                                bg-zinc-800 text-zinc-400 text-xs"
                      >
                        <span className="text-zinc-500 mr-1">#</span>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <p className="text-xs text-zinc-500 mb-2 font-normal">
            {new Date(link.createdAt).toLocaleDateString()}
          </p>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {link.tags.slice(0, 3).map((tag) => (
              <span 
                key={tag} 
                className="inline-flex items-center px-2 py-1 rounded-md 
                         bg-zinc-900/50 text-zinc-400 text-xs"
              >
                <span className="text-zinc-500 mr-1">#</span>
                {tag}
              </span>
            ))}
            {link.tags.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-md 
                           bg-zinc-900/50 text-zinc-500 text-xs">
                +{link.tags.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
