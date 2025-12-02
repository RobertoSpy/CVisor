"use client";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import VideoGallery from "./components/VideoGallery";
import Testimonials from "./components/Testimonials";
import StatsSection from "./components/StatsSection";
import Footer from "./components/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 w-full">
        <HeroSection />
        <StatsSection />
        <Testimonials />
        <VideoGallery />
      </main>
      <Footer />
    </div>
  );
}