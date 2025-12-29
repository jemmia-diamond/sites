"use client";

const CARDS = [
    {
        title: "PHÁT TRIỂN NHÂN SỰ",
        subtitle: "AS ONE WE WIN",
        description:
            "Chào đón 22 mảnh ghép mới trong 6 tháng. Review năng lực định kỳ, đảm bảo lộ trình thăng tiến công bằng & trải nghiệm nhân viên hạnh phúc.",
        color: "#1c1917", // Stone 900
        stat: "22+",
        statLabel: "New Members"
    },
    {
        title: "ĐÀO TẠO & WORKSHOP",
        subtitle: "NÂNG TẦM CHUYÊN GIA",
        description:
            "Workshop 'AI thông minh hơn ai?', Kỹ năng quản lý & Lớp thẩm định kim cương nâng cao cùng chuyên gia Mai Thy. Liên tục cập nhật kiến thức mới.",
        color: "#292524", // Stone 800
        stat: "100%",
        statLabel: "Upskilling"
    },
    {
        title: "VĂN HÓA & GẮN KẾT",
        subtitle: "TEAM TRIP 2025",
        description:
            "Format 'Team By Team' trao quyền tự chủ. Các team Marketing, Hà Nội, HCNS xuất sắc với video recap hành trình đầy cảm xúc.",
        color: "#44403c", // Stone 700
        stat: "Trip",
        statLabel: "Innovation"
    },
    {
        title: "SỨC KHỎE TOÀN DIỆN",
        subtitle: "10X TEAM UP RUN",
        description:
            "Tặng thẻ tập Citigym/California 60 ngày. Giải chạy ghi nhận cá nhân đạt kỷ lục 515km. Khám sức khỏe định kỳ 2025.",
        color: "#57534e", // Stone 600
        stat: "515km",
        statLabel: "Record Run"
    },
];

export function StackingCards() {
    return (
        <section className="bg-neutral-950 py-32 px-4 md:px-10">
            <div className="max-w-5xl mx-auto mb-20 text-center">
                <span className="text-neon-green font-bold tracking-[0.3em] uppercase text-sm block mb-4">
                    Con Người Jemmia
                </span>
                <h2 className="text-4xl md:text-6xl font-black uppercase text-white leading-tight">
                    Văn Hóa <span className="text-white/50">Doanh Nghiệp</span>
                </h2>
            </div>

            <div className="flex flex-col gap-8 max-w-6xl mx-auto relative pb-24">
                {CARDS.map((card, i) => (
                    <div
                        key={i}
                        className="group sticky top-28 md:top-36 w-full rounded-2xl p-8 md:p-14 border border-white/5 shadow-2xl transition-all duration-500 hover:border-white/20"
                        style={{
                            backgroundColor: card.color,
                            zIndex: i + 1,
                        }}
                    >
                        <div className="flex flex-col md:flex-row justify-between gap-10 h-full items-start md:items-center">
                            <div className="flex flex-col justify-between max-w-2xl">
                                <div>
                                    <h4 className="text-neon-green font-bold tracking-widest uppercase mb-3 text-sm">
                                        {card.subtitle}
                                    </h4>
                                    <h3 className="text-3xl md:text-5xl font-bold text-white uppercase mb-6 leading-tight">
                                        {card.title}
                                    </h3>
                                </div>
                                <p className="text-white/70 text-lg leading-relaxed border-l-2 border-white/10 pl-6">
                                    {card.description}
                                </p>
                            </div>

                            {/* Stat Circle */}
                            <div className="flex-shrink-0">
                                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-2 border-white/10 flex flex-col items-center justify-center bg-white/5 backdrop-blur-sm group-hover:scale-110 transition-transform duration-500 group-hover:border-neon-green/50 hover:bg-neon-green/10">
                                    <span className="text-3xl md:text-4xl font-black text-white">{card.stat}</span>
                                    <span className="text-[10px] md:text-xs uppercase tracking-widest text-neutral-400 mt-1">{card.statLabel}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
