import Navigation from '@/components/Navigation';
import IntroAnimation from '@/components/IntroAnimation';
import TheHouse from '@/components/TheHouse';
import TheExperience from '@/components/TheExperience';
import TheCraft from '@/components/TheCraft';
import TheLiving from '@/components/TheLiving';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main>
      <IntroAnimation />
      <Navigation />
      
      <div id="top" />
      <TheHouse />
      <TheExperience />
      <TheCraft />
      <TheLiving />
      
      <Footer />
    </main>
  );
}
