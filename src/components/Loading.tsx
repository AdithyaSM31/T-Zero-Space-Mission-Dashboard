export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 rounded-full border-2 border-blue-500/20"></div>
        <div className="absolute inset-0 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

export function LoadingCard() {
    return (
        <div className="rounded-2xl bg-white/5 p-8 border border-white/10 h-64 animate-pulse flex flex-col gap-4">
            <div className="h-6 w-1/3 bg-white/10 rounded"></div>
            <div className="h-full bg-white/5 rounded"></div>
        </div>
    )
}

export function LoadingList() {
    return (
        <div className="space-y-4">
            {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl bg-white/5 border border-white/10 p-4 h-24 animate-pulse flex gap-4">
                    <div className="h-16 w-16 bg-white/10 rounded-lg"></div>
                    <div className="flex-1 space-y-2 py-2">
                        <div className="h-4 w-1/2 bg-white/10 rounded"></div>
                        <div className="h-3 w-1/3 bg-white/5 rounded"></div>
                    </div>
                </div>
            ))}
        </div>
    )
}
