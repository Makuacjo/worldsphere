import type { Plants } from '../types/wildlife';

export const plantData: Plants[] = [
    {
        id: 'pla-baobab',    
        category: 'plant',
        name: 'Baobab',
        image: 'https://res.cloudinary.com/duuwn3dzm/image/upload/baobab-bnw_pbnf1c.jpg',
        growthSeason: 'Dry season',
        uses: 'Food, medicine, shelter',
        scientificName: 'Adansonia digitata',
        summary: 'The arge, distinctive tree.',
        content: 'Baobabs are found in savannas and grasslands of Africa, Madagascar, and Australia. They are adapted to dry conditions and can live for hundreds of years.',
        isFeatured: true
    },
    {
        id: 'pla-saguaro',
        category: 'plant',
        name: 'Saguaro Cactus',
        image: 'https://res.cloudinary.com/duuwn3dzm/image/upload/saguaro_cactus_ocfug0.jpg',
        growthSeason: 'Spring',
        uses: 'Food, medicine, shelter',
        scientificName: 'Carnegiea gigantea',
        summary: 'Large, tree-like cactus.',
        content: 'Saguaros are iconic symbols of the American Southwest. They can grow up to 40 feet tall and live for over 150 years.',
        isFeatured: true
    },
    {
        id: 'pla-lotus',
        category: 'plant',
        name: 'Lotus',
        image: 'https://res.cloudinary.com/duuwn3dzm/image/upload/lotus-close_ng1ycq.jpg',
        growthSeason: 'Summer',
        uses: 'Food, medicine, ornamental',
        scientificName: 'Nelumbo nucifera',
        summary: 'Aquatic plant with large, showy flowers.',
        content: 'Lotus plants are found in freshwater environments across Asia and Australia. They are often associated with purity and enlightenment in various cultures.',
        isFeatured: true
    },
    {
        id: 'pla-sequoia',
        category: 'plant',
        name: 'Sequoia',
        image: 'https://res.cloudinary.com/duuwn3dzm/image/upload/sequoia_ngwts5.jpg',
        growthSeason: 'Spring',
        uses: 'Timber, ornamental',
        scientificName: 'Sequoiadendron giganteum',
        summary: 'Large, long-lived tree.',
        content: 'Sequoias are among the largest and oldest trees on Earth. They can live for over 3,000 years and reach heights of over 300 feet.',
        isFeatured: false
    },
    {
        id: 'pla-coconut-palm',
        category: 'plant',
        name: 'Coconut Palm',
        image: 'https://res.cloudinary.com/duuwn3dzm/image/upload/coconut-palm_c55bxd.jpg',
        growthSeason: 'Year-round',
        uses: 'Food, oil, shelter',
        scientificName: 'Cocos nucifera',
        summary: 'Tropical tree that produces coconuts.',
        content: 'Coconut palms are found in tropical coastal regions around the world. They provide food, oil, and materials for shelter, making them vital to many communities.',
        isFeatured: false
    },
    {
        id: 'pla-japanese-maple',
        category: 'plant',
        name: 'Japanese Maple',
        image: 'https://res.cloudinary.com/duuwn3dzm/image/upload/japan-maple1_o06bu9.jpg',
        growthSeason: 'Spring',
        uses: 'Ornamental',
        scientificName: 'Acer palmatum',
        summary: 'Small, vibrant foliage and graceful tree.',
        content: 'Japanese maples are native to Japan, Korea, and China. They are popular ornamental trees in gardens around the world, prized for their stunning fall colors.',
        isFeatured: false
    }
];