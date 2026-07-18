import Hero from '../components/Hero';
import Insights from '../sections/Insights';
import CategorySection from '../sections/CategorySection';
import { animalData } from '../data/animals';
import { plantData } from '../data/plants';
import { waterData } from '../data/waters';

const Home = () => {
    return (
        <main>
            <Hero />
            <Insights />
            <CategorySection
                title="Majestic Creatures"
                subtitle="Biodiversity"
                data={animalData.filter(a => a.isFeatured)}
                path="/animals"
            />

            <CategorySection
                title='Flora & Ancient Trees'
                subtitle="Botany"
                data={plantData.filter(p => p.isFeatured)}
                path="/plants"
                bgColor="var(--surface-alt-color)"
            />

            <CategorySection
                title="Rivers and Oceans"
                subtitle="Ecosystems"
                data={waterData.filter(w => w.isFeatured)}
                path='/waters'
            />            
        </main>
    );
};

export default Home;