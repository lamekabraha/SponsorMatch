import Link from "next/link";

type DashboardCampaignCardProps = {
  title: string;
  category: string;
  org: string;
  deadline: string;
  raised: number;
  goal: number;
  href?: string;
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
  org,
  deadline,
  raised,
  goal,
  href,
}: DashboardCampaignCardProps) {
  const needed = Math.max(0, goal - raised);

  return (
    <div className="cardBody">
      <div className="cardMeta">
        <span className="pill">{category}</span>
        <span className="deadline">Deadline: {deadline}</span>
      </div>

      <h3 className="cardTitle">{title}</h3>
      <div className="cardOrg">{org}</div>

      <div className="budgetInfo">
        <span>Raised: {formatGBP(raised)}</span>
        <span>Goal: {formatGBP(goal)}</span>
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