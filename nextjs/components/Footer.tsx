import { Github } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="w-full border-t border-zinc-800 mt-8">
      <div className="container mx-auto px-4 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-xs text-zinc-500">
          © {new Date().getFullYear()} Selçuk Cihan. All rights reserved.
        </p>
        <a
          href="https://github.com/selcukcihan/web-archive"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <Github className="w-4 h-4" />
          <span>View on GitHub</span>
        </a>
      </div>
    </footer>
  )
}
