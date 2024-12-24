import { Suspense } from 'react'
import LinkList from '@/components/LinkList'
import TagFilterContainer from '@/components/TagFilterContainer'
import Footer from '@/components/Footer'
import Logo from '@/components/Logo'

export default function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const tag = searchParams.tag as string | undefined
  const page = Number(searchParams.page) || 1

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-300 font-mono flex flex-col">
      <main className="container mx-auto px-4 py-3 sm:p-4 flex-1">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 border-b border-zinc-800 pb-2">
          <Logo />
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="md:col-span-1 order-2 md:order-1">
            <Suspense fallback={
              <div className="bg-zinc-800/50 rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-zinc-700 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-zinc-700 rounded mb-4"></div>
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-6 bg-zinc-700 rounded"></div>
                  ))}
                </div>
              </div>
            }>
              <TagFilterContainer />
            </Suspense>
          </div>
          <div className="md:col-span-3 order-1 md:order-2">
            <Suspense fallback={
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-zinc-800/50 rounded-lg p-4 animate-pulse">
                    <div className="h-4 bg-zinc-700 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-zinc-700 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            }>
              <LinkList tag={tag} page={page} />
            </Suspense>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
