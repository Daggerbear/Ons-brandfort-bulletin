// components/Skeleton.js
export function SkeletonBlock({ className = "" }) {
  return <div className={`animate-pulse bg-neutral-800 rounded-lg ${className}`} />;
}

export function SkeletonText({ width = "w-full", className = "" }) {
  return <SkeletonBlock className={`h-4 ${width} ${className}`} />;
}

// Matches a Feed/Business Update post card shape
export function SkeletonPostCard() {
  return (
    <div className="bg-neutral-900 rounded-2xl p-4 border border-neutral-800">
      <div className="flex items-center gap-3 mb-3">
        <SkeletonBlock className="w-9 h-9 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <SkeletonText width="w-24" />
          <SkeletonText width="w-16" className="h-3" />
        </div>
      </div>
      <SkeletonText className="mb-2" />
      <SkeletonText width="w-3/4" className="mb-3" />
      <SkeletonBlock className="w-full h-48 rounded-xl" />
    </div>
  );
}

// Matches a business card in a grid/list (besighede, etc.)
export function SkeletonBusinessCard() {
  return (
    <div className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden">
      <SkeletonBlock className="w-full h-32 rounded-none" />
      <div className="p-3 space-y-2">
        <SkeletonText width="w-2/3" />
        <SkeletonText width="w-1/2" className="h-3" />
      </div>
    </div>
  );
}

// Renders N of any skeleton card to mimic a real feed/grid while loading
export function SkeletonList({ Component = SkeletonPostCard, count = 3, className = "" }) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={i > 0 ? "mt-4" : ""}>
          <Component />
        </div>
      ))}
    </div>
  );
}
export function SkeletonBusinessDetail() {
  return (
    <div className="max-w-md mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <SkeletonBlock className="w-[88px] h-[88px] rounded-2xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <SkeletonText width="w-20" className="h-5 rounded-full" />
          <SkeletonText width="w-32" className="h-6" />
        </div>
      </div>
      <div className="space-y-3 mb-8">
        <SkeletonBlock className="w-full h-11" />
        <SkeletonBlock className="w-full h-11" />
      </div>
      <SkeletonText className="mb-2" />
      <SkeletonText width="w-2/3" className="mb-6" />
      <div className="grid grid-cols-2 gap-3">
        <SkeletonBlock className="h-16 col-span-2" />
        <SkeletonBlock className="h-16" />
        <SkeletonBlock className="h-16" />
      </div>
    </div>
  );
}

export function SkeletonBusinessListRow() {
  return (
    <div className="flex gap-4 bg-neutral-900 border border-neutral-800 rounded-xl p-5">
      <SkeletonBlock className="w-14 h-14 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <SkeletonText width="w-1/2" />
        <SkeletonText width="w-1/3" className="h-3" />
        <SkeletonText width="w-full" className="h-3 mt-2" />
      </div>
    </div>
  );
}