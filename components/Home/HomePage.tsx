import { Header } from './Header'
import { HeroSection } from './HeroSection'
import { FeaturesSection } from './FeaturesSection'
import { HowItWorksSection } from './HowItWorksSection'
import { FAQSection } from './FAQSection'
import { FooterSection } from './FooterSection'
import { ActiveSessionCard } from './ActiveSessionCard'

export function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6">
        <HeroSection />
        <ActiveSessionCard />
        <FeaturesSection />
        <HowItWorksSection />
        <FAQSection />
      </main>
      <FooterSection />
    </div>
  )
}
