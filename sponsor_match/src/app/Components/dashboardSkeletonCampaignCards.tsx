export default function CampaignCardSkeleton() {
  return (
    <div className="bg-white border-[0.3px] border-[rgba(11,15,25,0.12)] rounded-[18px] overflow-hidden flex flex-col transition-all duration-160 ease-in-out cardBody relative">
      <div className="m-[-14px_-14px_0_-14px] h-[170px] bg-[#eee] overflow-hidden relative">
        <div className="rounded-full w-20 h-[28px] absolute top-6 right-6 px-1 bg-Grey-dark/30 animate-pulse" />
        <div className="w-full h-full bg-Grey-dark/20 animate-pulse" />
      </div>

      <div className="p-[14px] flex flex-col gap-[10px] relative">
        <div className="flex justify-between items-center gap-[10px]">
          <div className="w-[95px] h-[28px] rounded-full bg-[rgba(254,216,87,0.35)] border border-[rgba(11,15,25,0.14)] animate-pulse" />
        </div>

        <div className="w-[70%] h-[22px] rounded bg-Grey-dark/30 animate-pulse" />

        <div className="flex flex-col gap-[6px] text-[13px] mt-[2px]">
          <div className="w-[60%] h-[14px] rounded bg-Grey-dark/30 animate-pulse" />
          <div className="w-[55%] h-[14px] rounded bg-Grey-dark/30 animate-pulse" />

          <div className="w-full h-2 hg-Grey border border-Grey rounded-full overflow-hidden">
            <div className="h-full bg-Yellow/40 rounded-full animate-pulse w-[60%]" />
          </div>

          <div className="w-[80%] h-[14px] rounded bg-Grey-dark/30 animate-pulse" />
        </div>

        <div className="mt-[8px] flex flex-col gap-[8px]">
          <div className="w-full h-[44px] rounded-[12px] bg-[#0b0f19]/80 animate-pulse" />
        </div>
      </div>
    </div>
  );
}