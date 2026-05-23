const SkeletonBlock = ({ className = '' }) => (
  <div className={`animate-pulse rounded-2xl bg-[#e7e5e4] ${className}`} />
);

const SkeletonLine = ({ className = '' }) => (
  <div className={`animate-pulse rounded-full bg-[#e7e5e4] ${className}`} />
);

const TableSkeleton = ({ rows = 5 }) => (
  <div className="overflow-hidden rounded-2xl border border-[#e7e5e4] bg-white">
    <div className="border-b border-[#e7e5e4] px-5 py-4">
      <SkeletonLine className="h-4 w-32" />
    </div>
    <div className="divide-y divide-[#f5f5f4]">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="grid grid-cols-12 gap-4 px-5 py-4">
          <SkeletonLine className="col-span-4 h-4" />
          <SkeletonLine className="col-span-2 h-4" />
          <SkeletonLine className="col-span-2 h-4" />
          <SkeletonLine className="col-span-2 h-4" />
          <SkeletonLine className="col-span-2 h-4" />
        </div>
      ))}
    </div>
  </div>
);

const PageLoader = ({
  title = 'Loading workspace',
  subtitle = 'Preparing your dashboard and data...',
  variant = 'generic',
}) => {
  if (variant === 'dashboard') {
    return (
      <div className="min-h-[55vh] px-4 py-8">
        <div className="mx-auto w-full max-w-350 space-y-6">
          <div className="space-y-2">
            <SkeletonLine className="h-7 w-56" />
            <SkeletonLine className="h-4 w-80" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-28 border border-[#e7e5e4] bg-white" />
            ))}
          </div>

          <div className="grid gap-4 xl:grid-cols-12">
            <SkeletonBlock className="h-80 border border-[#e7e5e4] bg-white xl:col-span-7" />
            <SkeletonBlock className="h-80 border border-[#e7e5e4] bg-white xl:col-span-5" />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <TableSkeleton rows={4} />
            <TableSkeleton rows={4} />
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className="min-h-[55vh] px-4 py-8">
        <div className="mx-auto w-full max-w-350 space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <SkeletonLine className="h-7 w-40" />
              <SkeletonLine className="h-4 w-56" />
            </div>
            <SkeletonBlock className="h-10 w-32 rounded-xl" />
          </div>

          <SkeletonBlock className="h-14 w-full rounded-2xl border border-[#e7e5e4] bg-white" />

          <div className="space-y-4 rounded-2xl border border-[#e7e5e4] bg-white p-4">
            <div className="grid grid-cols-12 gap-4 border-b border-[#e7e5e4] pb-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <SkeletonLine key={index} className="h-4" style={{ gridColumn: index < 4 ? 'span 2 / span 2' : 'span 2 / span 2' }} />
              ))}
            </div>
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 py-3">
                <SkeletonLine className="col-span-4 h-4" />
                <SkeletonLine className="col-span-2 h-4" />
                <SkeletonLine className="col-span-2 h-4" />
                <SkeletonLine className="col-span-2 h-4" />
                <SkeletonLine className="col-span-2 h-4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'auth') {
    return (
      <div className="min-h-[55vh] px-4 py-12">
        <div className="mx-auto w-full max-w-md rounded-2xl border border-[#e7e5e4] bg-white p-6 shadow-lg shadow-black/10">
          <div className="space-y-4">
            <SkeletonLine className="h-8 w-40" />
            <SkeletonLine className="h-4 w-64" />
            <div className="space-y-3 pt-2">
              <SkeletonBlock className="h-12 w-full rounded-xl bg-[#e7e5e4]" />
              <SkeletonBlock className="h-12 w-full rounded-xl bg-[#e7e5e4]" />
              <SkeletonBlock className="h-12 w-full rounded-xl bg-[#e7e5e4]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[55vh] px-4 py-12">
      <div className="mx-auto flex w-full max-w-md items-center gap-4 rounded-2xl border border-[#e7e5e4] bg-white px-5 py-4 shadow-lg shadow-black/10">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#e7e5e4] bg-white">
          <div className="h-5 w-5 rounded-full border-2 border-[#3b82f6] border-t-transparent animate-spin" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <h2 className="truncate text-sm font-medium text-[#1c1917]">{title}</h2>
            <span className="shrink-0 text-xs text-[#57534e]">Please wait</span>
          </div>
          <p className="mt-1 text-xs text-[#57534e]">{subtitle}</p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#e7e5e4]">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-[#3b82f6]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageLoader;
