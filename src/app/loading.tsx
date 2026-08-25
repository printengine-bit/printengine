export default function Loading() {
  return (
    <div className="container-pe py-16">
      <span className="sr-only">Loading</span>
      <div className="h-8 w-52 animate-pulse bg-alt" aria-hidden />
      <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-6" aria-hidden>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i}>
            <div className="aspect-[4/5] animate-pulse bg-alt" />
            <div className="mt-4 h-4 w-3/4 animate-pulse bg-alt" />
            <div className="mt-2 h-3 w-1/2 animate-pulse bg-alt" />
          </div>
        ))}
      </div>
    </div>
  );
}
