import type { Water } from "../types/wildlife";

export const waterData: Water[] = [
    {
        id: 'wat-nile',
        category: 'water',
        name: 'Nile River',
        image: 'https://res.cloudinary.com/duuwn3dzm/image/upload/nile-river1_lky2j2.jpg',
        summary: 'The Nile is the longest river in the world, flowing through northeastern Africa.',
        content: 'The Nile River is approximately 6,650 kilometers long and is a vital water source for Egypt and Sudan. It has been central to the development of ancient civilizations along its banks.',
        isFeatured: true,
        bodyType: 'Freshwater',
        region: 'Africa'
    },
    {
        id: 'wat-great-barrier-reef',
        category: 'water',
        name: 'Great Barrier Reef',
        image: 'https://res.cloudinary.com/duuwn3dzm/image/upload/great-barrier-reef_c9b9tw.jpg',
        summary: 'The Great Barrier Reef is the world\'s largest coral reef system, located in the Coral Sea off the coast of Queensland, Australia.',
        content: 'The Great Barrier Reef is home to a diverse range of marine life and is a UNESCO World Heritage Site. It faces threats from climate change, pollution, and overfishing.',
        isFeatured: true,
        bodyType: 'Marine',
        region: 'Australia'
    },
    {
        id: 'wat-amazon-river',
        category: 'water',
        name: 'Amazon River',
        image: 'https://res.cloudinary.com/duuwn3dzm/image/upload/amazon-river_zn4dtd.jpg',
        summary: 'The Amazon River is the second longest river in the world and has the largest drainage basin.',
        content: 'The Amazon River flows through South America and is home to a vast array of wildlife. It plays a crucial role in the global water cycle and is a key component of the rainforest ecosystem.',
        isFeatured: true,
        bodyType: 'Freshwater',
        region: 'South America'
    },
    {
        id: 'wat-bay-of-bengal',
        category: 'water',
        name: 'Bay of Bengal',
        image: 'https://res.cloudinary.com/duuwn3dzm/image/upload/bay-of-bengal_ay97qd.jpg',
        summary: 'The Bay of Bengal is the largest bay in the world, located in the northeastern part of the Indian Ocean.',
        content: 'The Bay of Bengal is bordered by India, Bangladesh, Myanmar, and Sri Lanka. It is a critical area for marine biodiversity and supports a large fishing industry.',
        isFeatured: false,
        bodyType: 'Marine',
        region: 'Asia'
    },
    {
        id: 'wat-lake-baikal',
        category: 'water',
        name: 'Lake Baikal',
        image: 'https://res.cloudinary.com/duuwn3dzm/image/upload/lake-baikal_mu2xuq.jpg',
        summary: 'Lake Baikal is the deepest and oldest freshwater lake in the world, located in Siberia, Russia.',
        content: 'Lake Baikal contains about 20% of the world\'s unfrozen freshwater. It is home to unique species of flora and fauna, many of which are found nowhere else on Earth.',
        isFeatured: false,
        bodyType: 'Freshwater',
        region: 'Russia'
    },
    {
        id: 'wat-mediterranean-sea',
        category: 'water',
        name: 'Mediterranean Sea',
        image: 'https://res.cloudinary.com/duuwn3dzm/image/upload/med-sea_qnelh2.jpg',
        summary: 'The Mediterranean Sea is a sea connected to the Atlantic Ocean, surrounded by the Mediterranean region.',
        content: 'The Mediterranean Sea has been a crucial route for trade and cultural exchange throughout history. It is known for its rich biodiversity and is a popular destination for tourism.',
        isFeatured: false,
        bodyType: 'Marine',
        region: 'Europe/Africa/Asia'
    }
];