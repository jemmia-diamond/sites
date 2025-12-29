import Link from "next/link";

export function Footer() {
    return (
        <footer className="bg-neutral-950 text-white pt-20 pb-10 px-4 md:px-10 border-t border-white/10">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                <div className="space-y-6">
                    <h2 className="text-3xl font-black italic tracking-tighter uppercase">LN4</h2>
                    <p className="text-neutral-500 text-sm max-w-xs">
                        The official website of Formula 1 driver Lando Norris. Stay fast.
                    </p>
                </div>

                <div className="flex flex-col gap-4">
                    <h4 className="font-bold uppercase tracking-widest text-xs text-neutral-500">Navigation</h4>
                    <Link href="#" className="hover:text-neon-green transition-colors">Home</Link>
                    <Link href="#" className="hover:text-neon-green transition-colors">Biography</Link>
                    <Link href="#" className="hover:text-neon-green transition-colors">Stats</Link>
                    <Link href="#" className="hover:text-neon-green transition-colors">Merch</Link>
                </div>

                <div className="flex flex-col gap-4">
                    <h4 className="font-bold uppercase tracking-widest text-xs text-neutral-500">Socials</h4>
                    <Link href="#" className="hover:text-neon-green transition-colors">Instagram</Link>
                    <Link href="#" className="hover:text-neon-green transition-colors">Twitter (X)</Link>
                    <Link href="#" className="hover:text-neon-green transition-colors">Twitch</Link>
                    <Link href="#" className="hover:text-neon-green transition-colors">YouTube</Link>
                </div>

                <div className="flex flex-col gap-4">
                    <h4 className="font-bold uppercase tracking-widest text-xs text-neutral-500">Newsletter</h4>
                    <form className="flex gap-2">
                        <input
                            type="email"
                            placeholder="ENTER EMAIL"
                            className="bg-neutral-900 border border-white/10 p-2 text-sm w-full focus:outline-none focus:border-neon-green"
                        />
                        <button className="bg-neon-green text-black px-4 font-bold uppercase text-sm hover:opacity-80">
                            Join
                        </button>
                    </form>
                </div>
            </div>

            <div className="max-w-7xl mx-auto pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-xs text-neutral-600 uppercase tracking-wider">
                <p>&copy; 2025 Lando Norris. All rights reserved.</p>
                <p>Designed by [Your Name]</p>
            </div>
        </footer>
    );
}
