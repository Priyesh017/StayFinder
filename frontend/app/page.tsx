import Header from "@/components/welcomePage/header";
import Footer from "@/components/welcomePage/footer";
import Hero from "@/components/welcomePage/hero";
import Featured from "@/components/welcomePage/feature";
import About from "@/components/welcomePage/about";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <Featured />
      <About />
      <Footer />
    </div>
  );
}
