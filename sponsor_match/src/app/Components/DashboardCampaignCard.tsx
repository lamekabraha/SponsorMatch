// import Link from "next/link";

// type DashboardCampaignCardProps = {
//   title: string;
//   category: string;
//   raised: number;
//   goal: number;
//   status: string;
//   href?: string;
//   coverImageUrl?: string | null;
// };

// function formatGBP(n: number) {
//   return new Intl.NumberFormat("en-GB", {
//     style: "currency",
//     currency: "GBP",
//     maximumFractionDigits: 0,
//   }).format(n);
// }

// export function DashboardCampaignCard({
//   title,
//   category,
//   raised,
//   status,
//   goal,
//   href,
//   coverImageUrl,
// }: DashboardCampaignCardProps) {
//   const needed = Math.max(0, goal - raised);
  
//   return (
//     <div className="cardBody relative">
//       {coverImageUrl && (
//         <div className="cardCover">
//           <div className="rounded-full w-fit absolute top-3 right-3 px-1 bg-Yellow shadow-xl/30 font-Body capitalize">{status}</div>
//           <img src={coverImageUrl} alt="" className="cardCoverImg" />
//         </div>
//       )}
//       <div className="cardMeta">
//         <span className="pill">{category}</span>
//       </div>

//       <h3 className="cardTitle">{title}</h3>

//       <div className="budgetInfo">
//         <span>Raised: {formatGBP(raised)}</span>
//         <span>Goal: {formatGBP(goal)}</span>

//         <div className='w-full h-2 hg-Grey border border-Grey rounded-full overflow-hidden'>
//           <div
//             className="h-full bg-Yellow rounded-full transition-all duration-500"
//             style={{width: `${Math.max(1, (raised / goal) * 100)+1}%`}}
//           >
//           </div>
//         </div>
//         <span className="needed">Still Needed: {formatGBP(needed)}</span>
//       </div>

//       <div className="cardActions">
//         {href ? (
//           <Link href={href} className="btn btnDark">
//             Read More
//           </Link>
//         ) : (
//           <button type="button" className="btn btnDark">
//             Read More
//           </button>
//         )}
//       </div>
//     </div>
//   );
// }

import Link from "next/link";

type DashboardCampaignCardProps = {
  title: string;
  category: string;
  raised: number;
  goal: number;
  status: string;
  href?: string;
  /** VCSE dashboard: link to `/editcampaign?id=…` */
  editHref?: string;
  coverImageUrl?: string | null;
};

function formatGBP(n: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(n);
}

function resolveCoverSrc(raw: string | null | undefined): string {
  const value = String(raw ?? "").trim();
  if (!value) return "/loadingImage.jpg";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("/api/files/")) return value;
  if (value.startsWith("/")) return value;
  return `/api/files/${value.replace(/^\/+/, "")}`;
}

export function DashboardCampaignCard({
  title,
  category,
  raised,
  status,
  goal,
  href,
  editHref,
  coverImageUrl,
}: DashboardCampaignCardProps) {
  const needed = Math.max(0, goal - raised);
  const coverSrc = resolveCoverSrc(coverImageUrl);
  
  return (
    <div className="bg-white border-[0.3px] border-[rgba(11,15,25,0.12)] rounded-[18px] overflow-hidden flex flex-col transition-all duration-160 ease-in-out hover:translate-y-[-2px] hover:border-[rgba(11,15,25,0.18)] cardBody relative">
      <div className="m-[-14px_-14px_0_-14px] h-[170px] bg-[#eee] overflow-hidden relative">
        <div className="rounded-full w-fit absolute top-6 right-6 px-1 bg-Yellow shadow-xl/30 font-Body capitalize">{status}</div>
        <img
          src={coverSrc}
          alt={`${title} cover`}
          className="w-full h-full object-cover block"
          onError={(e) => {
            const img = e.currentTarget;
            if (img.src.endsWith("/loadingImage.jpg")) return;
            img.src = "/loadingImage.jpg";
          }}
        />
      </div>
      <div className="p-[14px] flex flex-col gap-[10px] relative">
        <div className="flex justify-between items-center gap-[10px]">
          <span className="text-[12px] p-[7px_11px] rounded-full bg-[rgba(254,216,87,0.35)] border border-[rgba(11,15,25,0.14)] text-[#0b0f19] font-black">{category}</span>
        </div>

        <h3 className="m-0 text-[18px] font-[950] tracking-[-0.2px] text-[#0b0f19]">{title}</h3>

        <div className="flex flex-col gap-[6px] text-[13px] mt-[2px]">
          <span className="text-[rgba(11,15,25,0.75)] font-bold">Raised: {formatGBP(raised)}</span>
          <span className="text-[rgba(11,15,25,0.75)] font-bold">Goal: {formatGBP(goal)}</span>

          <div className='w-full h-2 hg-Grey border border-Grey rounded-full overflow-hidden'>
            <div
              className="h-full bg-Yellow rounded-full transition-all duration-500"
              style={{width: `${Math.max(1, (raised / goal) * 100)+1}%`}}
            >
            </div>
          </div>
          <span className="font-[950] text-[#0b0f19]">Still Needed: {formatGBP(needed)}</span>
        </div>

        <div className="mt-[8px] flex flex-col gap-[8px]">
          {href ? (
            <Link href={href} className="w-full flex justify-center items-center rounded-[12px] font-extrabold no-underline p-[12px_0] border border-[#0b0f19] bg-[#0b0f19] text-white shadow-[0_10px_24px_rgba(11,15,25,0.18)] hover:bg-[#111827]">
              Read More
            </Link>
          ) : (
            <button type="button" className="w-full flex justify-center items-center rounded-[12px] font-extrabold no-underline p-[12px_0] border border-[#0b0f19] bg-[#0b0f19] text-white shadow-[0_10px_24px_rgba(11,15,25,0.18)] hover:bg-[#111827]">
              Read More
            </button>
          )}
          {editHref ? (
            <Link
              href={editHref}
              className="w-full flex justify-center items-center rounded-[12px] font-extrabold no-underline p-[12px_0] border border-[rgba(11,15,25,0.22)] bg-white text-[#0b0f19] hover:bg-[rgba(11,15,25,0.04)]"
            >
              Edit campaign
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}