import Link from "next/link";

type DashboardCampaignCardProps = {
  title: string;
  category: string;
  raised: number;
  goal: number;
  status: string;
  href?: string;
  coverImageUrl?: string | null;
};

function formatGBP(n: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(n);
}

export function DashboardCampaignCard({
  title,
  category,
  raised,
  status,
  goal,
  href,
  coverImageUrl,
}: DashboardCampaignCardProps) {
  const needed = Math.max(0, goal - raised);
  
  return (
    <div className="cardBody relative">
      {coverImageUrl && (
        <div className="cardCover">
          <div className="rounded-full w-fit absolute top-3 right-3 px-1 bg-Yellow shadow-xl/30 font-Body capitalize">{status}</div>
          <img src={coverImageUrl} alt="" className="cardCoverImg" />
        </div>
      )}
      <div className="cardMeta">
        <span className="pill">{category}</span>
      </div>

      <h3 className="cardTitle">{title}</h3>

      <div className="budgetInfo">
        <span>Raised: {formatGBP(raised)}</span>
        <span>Goal: {formatGBP(goal)}</span>

        <div className='w-full h-2 hg-Grey border border-Grey rounded-full overflow-hidden'>
          <div
            className="h-full bg-Yellow rounded-full transition-all duration-500"
            style={{width: `${Math.max(1, (raised / goal) * 100)+1}%`}}
          >
          </div>
        </div>
        <span className="needed">Still Needed: {formatGBP(needed)}</span>
      </div>

      <div className="cardActions">
        {href ? (
          <Link href={href} className="btn btnDark">
            Read More
          </Link>
        ) : (
          <button type="button" className="btn btnDark">
            Read More
          </button>
        )}
      </div>
    </div>
  );
}