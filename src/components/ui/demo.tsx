import { Hero } from "@/components/ui/animated-hero";

function HeroDemo() {
  return <Hero
    badge="New"
    titlePrimary="This is something"
    titleAccent="animated"
    description="Managing a small business today is already tough. Avoid further complications by ditching outdated, tedious trade methods."
    primaryCtaLabel="Jump on a call"
    primaryCtaHref="/contact"
    secondaryCtaLabel="Sign up here"
    secondaryCtaHref="/contact"
  />;
}

export { HeroDemo };