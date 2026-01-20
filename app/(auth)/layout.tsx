import Link from "next/link"
import Image from "next/image"
import { headers } from "next/headers"
import { auth } from "@/lib/better-auth/auth";
import { redirect } from "next/navigation";


const layout = async ({ children }: { children: React.ReactNode }) => {
    const session = await auth.api.getSession({ headers: await headers() });
    
    if (session?.user)  redirect('/');

    return (
        <main className="auth-layout">
            <section className="auth-left-section scrollbar-hide-default">
                <Link href="/" className="auth-logo">
                    <Image src="/assets/icons/ct-logoo.svg" alt="Chart Troll logo" width={140} height={32}
                        className="h-8 w-auto cursor-pointer" />
                </Link>
                <div className="pb-6 lg:pb-8 flex-1">
                    {children}
                </div>
            </section>
            <section className="auth-right-section">
                <div className="z-10 relative lg:mt-4 lg:nb-16">
                    <blockquote className="auth-blockquote">
                        Trade smarter, laugh harder.<br />
                        Chart Troll gives you signals that bite and charts that troll — because trading shouldn’t feel like homework.
                    </blockquote>
                    <div className="flex items-center justify-between">
                        <div>
                            <cite className="auth-testimonial-author">- James K.</cite>
                            <p className="max-md:test-xs text-gray-500">Retail Investor</p>
                        </div>
                        <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Image src="/assets/icons/star.svg" alt="Star" key={star} width={20} height={20}
                                    className="w-5 h-5" />
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex-1 relative">
                    <Image src="/assets/images/dashboard.svg" alt="Dashboard Preview" width={1440} height={1150}
                        className="auth-dashboard-preview absolute top-0 object-cover" />
                </div>
            </section>
        </main>
    )
}

export default layout