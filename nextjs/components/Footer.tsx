import Link from 'next/link'
import { Github } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 mt-auto">
      <div className="container mx-auto px-4 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-sm text-zinc-500">
          © {new Date().getFullYear()} Selçuk Cihan. All rights reserved.
        </p>
        <Link
          href="https://github.com/selcukcihan/web-archive"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          <Github className="w-4 h-4" />
          <span className="text-sm">View on GitHub</span>
        </Link>
      </div>
    </footer>
  )
}
