import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";

export const HeroSection = () => {
  return (
    <div className="w-full">
      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 pt-8 pb-12">
          <div className="flex justify-center mb-6">
            <Link
              href=""
              className="inline-flex items-center gap-2 border border-slate-200 dark:border-slate-700 rounded-full px-3 py-1 text-xs sm:text-sm font-medium hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-colors"
            >
              <span className="text-slate-600 dark:text-slate-300 inline">
                Returning User? Login here
              </span>

              <ArrowRight className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            </Link>
          </div>

          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-5xl md:text-6xl lg:text-7xl mb-6">
              A Little Piece of Jamaica in the Nation’s Capital
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl md:max-w-3xl mx-auto mb-10">
              The Jamaican (Ottawa) Community Association Inc. (JOCA) is a
              registered not-for-profit organization whose mission is to engage
              residents in community stewardship; to impact decisions that
              affect the community; to raise awareness; to foster a sense of
              spirit and pride; and to encourage participation in community
              issues, solutions, projects and events.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <nav className="flex sm:flex-row flex-col gap-8 items-center justify-center">
                <Link href="about">
                  <InteractiveHoverButton>More About Us</InteractiveHoverButton>
                </Link>
                <Link href="signup">
                  <InteractiveHoverButton>
                    Become a Member
                  </InteractiveHoverButton>
                </Link>
                <Link href="events">
                  <InteractiveHoverButton>View Events</InteractiveHoverButton>
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
