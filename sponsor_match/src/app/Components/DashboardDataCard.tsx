type DashboardDataCardProps = {
    title: string;
    data: string;
};

export function DashboardDataCard({ title, data }: DashboardDataCardProps) {
    return (
        <div className="bg-White border border-slate-900/20 rounded-2xl p-4 shadow-md">
            <p className="text-Grey font-bold text-md">{title}</p>
            <p className="text-2xl font-bold">{data}</p>
        </div>
    );
}