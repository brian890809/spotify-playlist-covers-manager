export default function Loading() {
  // Stack uses React Suspense, which will render this page while user data is being fetched.
  // See: https://nextjs.org/docs/app/api-reference/file-conventions/loading
  return (
    <div className="min-h-screen bg-white dark:bg-[#121212] p-8 flex items-center justify-center transition-colors duration-300">
      <div className="text-lg text-gray-800 dark:text-gray-200">
        <div className="flex items-center gap-2">
          <div className="animate-spin w-6 h-6 border-2 border-[#1DB954] border-t-transparent rounded-full"></div>
          Loading...
        </div>
      </div>
    </div>
  );
}
