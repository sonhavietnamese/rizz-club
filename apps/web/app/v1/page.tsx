import Header from '@/components/header'

export default function Page() {
  return (
    <main className="w-screen h-screen bg-background relative p-2 flex flex-col gap-2">
      <Header />
      <section className="w-full flex-1 bg-section-background">
        <h1>V1</h1>
      </section>
    </main>
  )
}
