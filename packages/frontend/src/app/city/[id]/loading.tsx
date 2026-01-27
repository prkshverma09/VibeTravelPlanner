export default function CityDetailLoading() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="relative h-80 w-full bg-gray-200 animate-pulse" />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <section className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="h-6 w-24 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" />
            ))}
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="h-6 w-24 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-md p-6">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-12 bg-gray-200 rounded animate-pulse" />
            <div className="h-12 bg-gray-200 rounded animate-pulse" />
          </div>
        </section>
      </div>
    </main>
  );
}
