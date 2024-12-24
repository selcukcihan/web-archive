import Link from 'next/link'

export default function Logo() {
  return (
    <Link href="/" className="hover:opacity-80 transition-opacity inline-flex items-center gap-3">
      <div className="w-8 h-8 relative flex items-center justify-center">
        <div className="flex flex-col gap-[2px]">
          {/* Stacked papers effect */}
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className={`h-2 w-6 rounded-[1px] -translate-y-[1px] 
              ${i === 2 ? 'bg-emerald-600' : 'bg-zinc-600'}`}
              style={{
                transform: `translateY(${i * -1}px)`,
              }}
            />
          ))}
        </div>
      </div>
      <span className="text-2xl font-bold">
        Web Archive
      </span>
    </Link>
  )
}
