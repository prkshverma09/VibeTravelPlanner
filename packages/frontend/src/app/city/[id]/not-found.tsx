import Link from 'next/link';

export default function CityNotFound() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full text-center">
        <div className="text-6xl mb-4">🗺️</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Destination Not Found
        </h1>
        <p className="text-gray-600 mb-6">
          We couldn&apos;t find this destination. It may have been removed or the link might be incorrect.
        </p>
        
        <Link
          href="/"
          className="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Discover destinations
        </Link>
      </div>
    </main>
  );
}
