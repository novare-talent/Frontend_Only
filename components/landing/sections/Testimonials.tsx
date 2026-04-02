import { Quote } from "lucide-react";
import Image from "next/image";
import SectionHeader from "@/components/landing/ui/SectionHeader";
import { Marquee } from "@/components/landing/ui/Marquee";
import { CLIENT_TESTIMONIALS, STUDENT_TESTIMONIALS } from "@/lib/constants";
import GlowOrb from "../effects/GlowOrb";

function TestimonialCard({
  name,
  role,
  quote,
  initial,
  image,
}: {
  name: string;
  role: string;
  quote: string;
  initial: string;
  image?: string;
}) {
  return (
    <div className="glass rounded-md p-6 w-80 shrink-0">

      <Quote size={20} className="text-[var(--color-violet-accent)] opacity-40 mb-4" />
      <p className="text-sm text-white leading-relaxed mb-6 line-clamp-5">
        {quote}
      </p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-violet-accent)] to-[var(--color-indigo-accent)] flex items-center justify-center text-white text-sm font-semibold shrink-0 overflow-hidden">
          {image ? (
            <Image
              src={image}
              alt={name}
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{initial}</span>
          )}
        </div>
        <div>
          <div className="text-sm font-medium">{name}</div>
          <div className="text-xs text-[var(--color-text-muted)]">{role}</div>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="py-16 md:py-12 relative overflow-hidden" id="testimonials">
            <GlowOrb
              className="top-0 right-0"
              color="rgba(124, 58, 237, 0.4)"
              size="800px"
              parallaxIntensity={15}
              parallaxInvert
            />
            <GlowOrb
              className="bottom-0 left-0 "
              color="rgba(124, 58, 237, 0.4)"
              size="800px"
              parallaxIntensity={15}
              parallaxInvert
            />
      <div className="section-padding">

        <SectionHeader
          tag="Testimonials"
          title="Trusted by those who"
          titleAccent="matter most"
        />
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-medium text-white mb-4 section-padding">
          What our clients say
        </h3>
        <Marquee pauseOnHover repeat={6} className="[--gap:1.5rem] py-4">
          {CLIENT_TESTIMONIALS.map((t) => (
            <TestimonialCard
              key={t.name}
              name={t.name}
              role={`${t.role}, ${t.company}`}
              quote={t.quote}
              initial={t.initial}
              image={t.image}
            />
          ))}
        </Marquee>
      </div>

      <div>
        <h3 className="text-lg font-medium text-white mb-4 section-padding">
          What our students say
        </h3>
        <Marquee pauseOnHover reverse repeat={6} className="[--gap:1.5rem] py-4">
          {STUDENT_TESTIMONIALS.map((t) => (
            <TestimonialCard
              key={t.name}
              name={t.name}
              role={t.college ?? ""}
              quote={t.quote}
              initial={t.initial}
              image={t.image}
            />
          ))}
        </Marquee>
      </div>
    </section>
  );
}
