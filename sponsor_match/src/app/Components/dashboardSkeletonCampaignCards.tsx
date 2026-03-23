export default function CampaignCardSkeleton() {
  return (
    <article className="card">
      <div className="cardCover">
        <div className="w-full h-full bg-Grey-dark/40 animate-pulse" />
      </div>
      <div className="cardBody">
        <div className="cardMeta">
          <span className="pill w-20 h-6 bg-Grey-dark/50 animate-pulse rounded-full" />
          <span className="deadline w-24 h-4 bg-Grey-dark/30 animate-pulse rounded-full" />
        </div>
        <div className="mt-2 space-y-2">
          <div className="cardTitle w-40 h-5 bg-Grey-dark/40 animate-pulse rounded" />
          <div className="cardOrg w-32 h-4 bg-Grey-dark/30 animate-pulse rounded" />
        </div>
        <div className="budgetInfo mt-3 space-y-2">
          <div className="w-32 h-4 bg-Grey-dark/30 animate-pulse rounded" />
          <div className="w-32 h-4 bg-Grey-dark/30 animate-pulse rounded" />
          <div className="w-full h-2 bg-Grey-dark/20 animate-pulse rounded-full" />
          <div className="w-40 h-4 bg-Grey-dark/30 animate-pulse rounded" />
        </div>
        <div className="cardActions mt-3">
          <div className="btn btnDark bg-Grey-dark/60 animate-pulse border-none" />
        </div>
      </div>
    </article>
  );
}