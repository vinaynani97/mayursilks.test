"use client";

import Link from "next/link";
import { Award, Heart, Users, Gem } from "lucide-react";

const milestones = [
  {
    year: "2000",
    title: "The Beginning",
    description: "Started by a passionate weaver family in Jangaon, Telangana, with a vision to preserve the art of handloom weaving.",
  },
  {
    year: "2008",
    title: "Best Weaver Award",
    description: "Recognised by the Telangana Handloom Board for excellence in traditional weaving techniques.",
  },
  {
    year: "2015",
    title: "Direct-to-Customer Model",
    description: "Pioneered the direct-from-weaver sales model, eliminating middlemen and offering fair prices to customers.",
  },
  {
    year: "2020",
    title: "Online Presence",
    description: "Took the heritage digital, reaching saree lovers across India and the world.",
  },
  {
    year: "2024",
    title: "1000+ Happy Customers",
    description: "Celebrated the milestone of 1,000 delighted customers across India, with 5,000+ sarees delivered.",
  },
];

const values = [
  {
    icon: Gem,
    title: "Crafted by Hand",
    description: "No machines, no shortcuts. Just pure, authentic hand-weaving techniques passed down through generations.",
  },
  {
    icon: Heart,
    title: "Made with Love",
    description: "Every saree carries the love, patience, and artistry of the weaver who spent days creating it.",
  },
  {
    icon: Users,
    title: "Fair to Artisans",
    description: "We pay fair wages to our weavers and believe in empowering the artisan community.",
  },
  {
    icon: Award,
    title: "A Touch of Tradition",
    description: "Every design honours the regional weaving traditions of Telangana, Tamil Nadu, and Andhra Pradesh.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-luxury-gradient py-28 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="about-p" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <polygon points="10,2 18,8 18,14 10,18 2,14 2,8" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#about-p)" />
          </svg>
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <p className="font-jost text-secondary-300 text-sm tracking-[0.3em] uppercase mb-4">
            Our Heritage
          </p>
          <h1 className="font-josefin text-5xl md:text-6xl font-light text-white mb-6">
            Welcome to <span className="text-secondary-300 font-semibold">MAYUR SILKS</span>
          </h1>
          <p className="font-jost text-white/80 text-lg leading-relaxed">
            We don&apos;t just make silk sarees — we weave stories, traditions, and a little bit of
            magic into every thread. For over 25 years, we&apos;ve poured our hearts into crafting
            pure silk sarees that celebrate the beauty of Indian heritage.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-[1px] bg-secondary-500" />
                <span className="font-jost text-secondary-600 text-sm tracking-[0.3em] uppercase">
                  Our Mission
                </span>
              </div>
              <h2 className="font-josefin text-3xl md:text-4xl font-semibold text-gray-900 mb-6">
                Empowering Tradition, One Saree at a Time
              </h2>
              <p className="font-jost text-gray-600 leading-relaxed mb-6">
                To empower individuals to embrace tradition and modernity through exquisite silk sarees
                that stand as symbols of grace, pride, and cultural richness.
              </p>
              <p className="font-jost text-gray-600 leading-relaxed">
                Traditional showroom sarees often cost ₹40,000+ because of multiple intermediaries.
                We believe you deserve the finest silk sarees at fair prices — sourced directly from
                the artisan&apos;s loom to your hands.
              </p>
            </div>
            <div className="bg-cream-100 rounded-3xl p-10 relative">
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-secondary-100 rounded-full opacity-60" />
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-primary-50 rounded-full opacity-60" />
              <div className="relative z-10 grid grid-cols-2 gap-6">
                {[
                  { number: "25+", label: "Years of Weaving" },
                  { number: "1000+", label: "Happy Customers" },
                  { number: "5000+", label: "Sarees Delivered" },
                  { number: "1", label: "Best Weaver Award" },
                ].map(({ number, label }) => (
                  <div key={label} className="text-center p-4 bg-white rounded-2xl shadow-sm">
                    <div className="font-josefin text-3xl font-bold text-primary-500 mb-1">{number}</div>
                    <div className="font-jost text-xs text-gray-500">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-cream-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-josefin text-3xl md:text-4xl font-semibold text-gray-900 mb-4">Our Story</h2>
            <p className="font-jost text-gray-500">
              It all started with a passion for handloom weaving and a dream to keep this beautiful tradition alive.
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-4 md:left-1/2 md:-translate-x-px top-0 bottom-0 w-[2px] bg-gradient-to-b from-secondary-300 via-primary-300 to-transparent" />
            <div className="space-y-12">
              {milestones.map(({ year, title, description }, idx) => (
                <div
                  key={year}
                  className={`flex items-start gap-8 ${idx % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
                >
                  <div className={`flex-1 ${idx % 2 === 0 ? "md:text-right" : "md:text-left"} hidden md:block`}>
                    {idx % 2 === 0 && (
                      <div>
                        <div className="font-josefin text-sm font-semibold text-secondary-600 mb-1">{year}</div>
                        <h3 className="font-josefin text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                        <p className="font-jost text-sm text-gray-500 leading-relaxed">{description}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary-500 border-4 border-cream-100 flex items-center justify-center relative z-10">
                    <div className="w-2 h-2 rounded-full bg-secondary-300" />
                  </div>

                  <div className={`flex-1 ${idx % 2 !== 0 ? "md:text-right" : ""}`}>
                    <div className="font-josefin text-sm font-semibold text-secondary-600 mb-1 md:hidden">{year}</div>
                    {idx % 2 !== 0 ? (
                      <div className="hidden md:block">
                        <div className="font-josefin text-sm font-semibold text-secondary-600 mb-1">{year}</div>
                        <h3 className="font-josefin text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                        <p className="font-jost text-sm text-gray-500 leading-relaxed">{description}</p>
                      </div>
                    ) : null}
                    <div className="md:hidden">
                      <h3 className="font-josefin text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                      <p className="font-jost text-sm text-gray-500 leading-relaxed">{description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What Makes Us Unique */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-josefin text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
              What Makes Us Unique
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(({ icon: Icon, title, description }) => (
              <div key={title} className="bg-cream-100 rounded-2xl p-6 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6 text-primary-500" />
                </div>
                <h3 className="font-josefin font-semibold text-gray-900 text-lg mb-3">{title}</h3>
                <p className="font-jost text-gray-500 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Promise */}
      <section className="py-20 bg-primary-500 relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
          <h2 className="font-josefin text-3xl md:text-4xl font-semibold text-white mb-6">Our Promise</h2>
          <p className="font-jost text-white/80 text-lg leading-relaxed mb-8">
            When you drape one of our sarees, you&apos;re not just adorning yourself with fabric — you&apos;re
            embodying a narrative. A narrative of passion, artistry, and tradition. We&apos;re dedicated to
            ensuring that each saree you purchase feels like it was woven specifically for your unique style.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-secondary-400 hover:bg-secondary-500 text-primary-900 px-8 py-4 rounded-full font-jost font-semibold transition-all hover:shadow-lg"
          >
            Explore Our Collection
          </Link>
        </div>
      </section>
    </div>
  );
}
