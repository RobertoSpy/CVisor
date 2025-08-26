import Link from "next/link";

import Navbar from "./components/Navbar"
import HeroSection from "./components/HeroSection"
import VideoGallery from "./components/VideoGallery"
import Testimonials from "./components/Testimonials"
import StatsSection from "./components/StatsSection"
import Footer from "./components/Footer"

export default function HomePage() {
  return (
    <div className="bg-neutral min-h-screen flex flex-col">
      <Navbar />
      <main>
        <HeroSection />
        <StatsSection />
        <VideoGallery />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}