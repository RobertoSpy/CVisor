import Link from "next/link";

import Navbar from "./components/Navbar"
import HeroSection from "./components/HeroSection"
import VideoGallery from "./components/VideoGallery"
import Testimonials from "./components/Testimonials"
import StatsSection from "./components/StatsSection"
import Footer from "./components/Footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-sm via-blue-300 to-pink-200 px-4 flex flex-col pb-0">
      <Navbar />
      <main className="flex-1 flex flex-col gap-8">
        <HeroSection />
        <StatsSection />
        <Testimonials />
        <VideoGallery />
        
      </main>
      <Footer />
    </div>
  );
}