import type { Animal } from '../types/wildlife';

export const animalData: Animal[] = [
    {
        id: 'an-elephant',
        category: 'animal',
        name: 'African Elephant',
        status: 'Vulnerable',
        habitat: 'Savanna & Forests',
        image: 'https://res.cloudinary.com/duuwn3dzm/image/upload/african-elephant_wrwfjg.jpg',
        scientificName: 'Loxodonta africana',
        summary: 'The African elephant is the largest land animal, known for its tusks and trunk.',
        content: 'African elephants inhabit savannas, forests, and grasslands across sub-Saharan Africa. They are herbivores and play a crucial role in their ecosystems.',
        isFeatured: true
    },
    {
        id: 'an-lion',
        category: "animal",
        name: 'Lion',
        status: 'Critical',
        habitat: 'Grasslands & Savannas',
        image: 'https://res.cloudinary.com/duuwn3dzm/image/upload/lion-close_jgyk1j.jpg',
        scientificName: 'Panthera leo',
        summary: 'The lion is a large carnivorous feline, often called the king of the jungle.',
        content: 'Lions live in prides in grasslands and savannas of Africa and India. They are apex predators with distinctive manes in males.',
        isFeatured: true
    },
    {
        id: 'an-panda',
        category: 'animal',
        name: 'Giant Panda',
        status: 'Endangered',
        habitat: 'Temperate Forests',
        image: 'https://res.cloudinary.com/duuwn3dzm/image/upload/giant-panda_fvflbs.jpg',
        scientificName: 'Ailuropoda melanoleuca',
        summary: 'The giant panda is a bear species known for its distinctive black and white coloring.',
        content: 'Giant pandas are native to the mountain ranges of central China. They primarily eat bamboo and are a symbol of wildlife conservation.',
        isFeatured: false
    },
    {
        id: 'an-tiger',
        category: 'animal',
        name: 'Bengal Tiger',
        status: 'Endangered',
        habitat: 'Tropical Forests',
        image: 'https://res.cloudinary.com/duuwn3dzm/image/upload/bengal-tiger_nttswa.jpg',
        scientificName: 'Panthera tigris tigris',
        summary: 'The Bengal tiger is a subspecies of tiger found primarily in India.',
        content: 'Bengal tigers inhabit tropical forests and grasslands. They are solitary predators and are known for their striking orange coat with black stripes.',
        isFeatured: false
    },
    {
        id: 'an-penguin',
        category: 'animal',
        name: 'Emperor Penguin',
        status: 'Stable',
        habitat: 'Antarctic',
        image: 'https://res.cloudinary.com/duuwn3dzm/image/upload/emperor-penguin_ac0ht7.jpg',
        scientificName: 'Aptenodytes forsteri',
        summary: 'The emperor penguin is the tallest and heaviest of all penguin species.',
        content: 'Emperor penguins are native to Antarctica and are adapted to survive in extreme cold. They breed during the harsh winter months and are excellent swimmers.',
        isFeatured: false
    },
    {
        id: 'an-gorilla',
        category: 'animal',
        name: 'Mountain Gorilla',
        status: 'Endangered',
        habitat: 'Montane Forests',
        image: 'https://res.cloudinary.com/duuwn3dzm/image/upload/mt-gorilla_nbsrrh.jpg',
        scientificName: 'Gorilla beringei beringei',
        summary: 'The mountain gorilla is a subspecies of eastern gorilla found in the mountains of central Africa.',
        content: 'Mountain gorillas live in dense forests and are primarily herbivorous. They are known for their strong social bonds and are critically endangered due to habitat loss and poaching.',
        isFeatured: true
    }
];