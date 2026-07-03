import IntroAnimation from '@/components/IntroAnimation';
import TheHouse from '@/components/TheHouse';
import TheStudioFeature from '@/components/TheStudioFeature';
import TheExperience from '@/components/TheExperience';
import TheCraft from '@/components/TheCraft';
import TheLiving from '@/components/TheLiving';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main>
      <IntroAnimation />
      
      <div id="top" />
      <TheHouse />
      <TheExperience />
      <TheCraft />
      <TheLiving />
      <TheStudioFeature />
      
      <Footer />
    </main>
  );
}
