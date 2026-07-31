import { tourismImageManifest } from './tourismImages.generated';

export type DestinationAttraction = {
  name: string;
  description: string;
  time: string;
  hours: string;
  fee: string;
  mapQuery: string;
  image: string;
};

export type DestinationGuide = {
  slug: string;
  name: string;
  county: string;
  tagline: string;
  rating: string;
  categories: string[];
  hero: string;
  coordinates: [number, number];
  facts: { label: string; value: string }[];
  overview: string[];
  attractions: DestinationAttraction[];
  things: string[];
  foods: string[];
  budget: { budget: number; standard: number; luxury: number };
  itinerary: { day: string; title: string; stops: string[] }[];
  seasons: {
    months: string;
    condition: 'clear' | 'rain' | 'heavy-rain' | 'mixed' | 'cool';
    score: number;
    note: string;
  }[];
  transport: string[];
  safety: string[];
  nearby: { name: string; slug: string; time: string }[];
  sources: { label: string; url: string }[];
};

const images = {
  // No dedicated Nairobi city hero exists in the local Nairobi folder yet.
  // Keep the verified skyline instead of using an unrelated attraction close-up.
  nairobi: 'https://images.unsplash.com/photo-1741991110666-88115e724741?auto=format&fit=crop&w=1900&q=84',
  safari: tourismImageManifest['maasai-mara'].hero!,
  beach: tourismImageManifest['diani-beach'].hero!,
  culture: tourismImageManifest['lamu-old-town'].hero!,
  mountain: tourismImageManifest['mount-kenya'].hero!,
  elephant: tourismImageManifest.amboseli.hero!,
};

const commonSafety = [
  'Use trusted transport after dark and confirm the vehicle and driver before entering.',
  'Keep valuables discreet and store passport copies and emergency contacts offline.',
  'Check current route-specific travel advice and avoid demonstrations or large gatherings.',
  'Follow ranger, guide and local community instructions around wildlife and protected sites.',
];

export const DESTINATION_GUIDES: Record<string, DestinationGuide> = {
  nairobi: {
    slug: 'nairobi',
    name: 'Nairobi',
    county: 'Nairobi',
    tagline: 'The Green City in the Sun',
    rating: '4.6',
    categories: ['Food', 'Wildlife', 'Culture', 'History', 'Nightlife'],
    hero: images.nairobi,
    coordinates: [-1.2864, 36.8172],
    facts: [
      { label: 'Best time', value: 'Year-round' }, { label: 'Recommended stay', value: '2–3 days' },
      { label: 'Budget', value: '$$' }, { label: 'Languages', value: 'Swahili, English' },
      { label: 'Main airport', value: 'JKIA' }, { label: 'Typical climate', value: 'Cool highland' },
    ],
    overview: [
      'Nairobi is Kenya’s capital, principal international gateway and one of the continent’s most distinctive city breaks. Glass towers, independent galleries, markets, restaurants and forest trails sit within the same urban landscape.',
      'The city grew from a railway settlement established in 1899 and became the capital of British East Africa in 1907. Its museums and heritage sites tell a much longer Kenyan story, from human origins and Indigenous cultures to independence and the modern republic.',
      'Nairobi National Park creates the city’s defining contrast: open plains and wildlife immediately beyond the skyline. Kenya Wildlife Service identifies it as Kenya’s first national park, gazetted in 1946.',
      'Contemporary Nairobi is shaped by its neighbourhoods. The central business district holds major civic landmarks; Westlands is known for dining and nightlife; Karen and Lang’ata connect several wildlife and heritage attractions; Karura offers walking and cycling beneath a forest canopy.',
      'The food scene moves easily between nyama choma, coastal Swahili cooking, Kenyan home-style dishes, coffee culture and ambitious international kitchens. Markets and studios add beadwork, textiles, painting, sculpture and design to the experience.',
    ],
    attractions: [
      { name: 'Nairobi National Park', description: 'Open savannah, rhino habitat and more than 400 recorded bird species against the city skyline.', time: '4–6 hours', hours: '06:00–18:00', fee: 'Check current KWS tariff', mapQuery: 'Nairobi National Park', image: images.safari },
      { name: 'Giraffe Centre', description: 'Conservation education and close viewing of endangered Rothschild’s giraffes in Lang’ata.', time: '1.5–2 hours', hours: '09:00–17:00', fee: 'Check official current rate', mapQuery: 'Giraffe Centre Nairobi', image: images.elephant },
      { name: 'Nairobi National Museum', description: 'Kenya’s natural history, cultures, art and human-origins collections at Museum Hill.', time: '2–3 hours', hours: 'Confirm before visiting', fee: 'Check NMK tariff', mapQuery: 'Nairobi National Museum', image: images.culture },
      { name: 'Karura Forest', description: 'Urban forest trails for walking, cycling, birding and quiet time away from city traffic.', time: '2–4 hours', hours: 'Entry until 17:30', fee: 'E-citizen payment', mapQuery: 'Karura Forest Nairobi', image: images.mountain },
      { name: 'Karen Blixen Museum', description: 'A preserved early-20th-century farmhouse, gardens and exhibits near the Ngong Hills.', time: '1–2 hours', hours: 'Confirm with NMK', fee: 'Check NMK tariff', mapQuery: 'Karen Blixen Museum', image: images.nairobi },
      { name: 'Bomas of Kenya', description: 'Architecture, music, dance and material culture from communities across Kenya.', time: '2–3 hours', hours: 'Check performance schedule', fee: 'Check official current rate', mapQuery: 'Bomas of Kenya', image: images.culture },
    ],
    things: ['Take an early safari', 'Eat nyama choma', 'Walk or cycle Karura', 'Visit an art gallery', 'Shop a verified Maasai Market', 'Taste Kenyan coffee', 'Explore Museum Hill', 'Dine above the skyline'],
    foods: ['Nyama choma', 'Ugali', 'Pilau', 'Sukuma wiki', 'Chapati', 'Githeri'],
    budget: { budget: 82, standard: 175, luxury: 420 },
    itinerary: [
      { day: 'Day 1', title: 'Wild city', stops: ['Sunrise game drive in Nairobi National Park', 'Lunch in Karen or Lang’ata', 'Nairobi National Museum', 'Dinner in Westlands'] },
      { day: 'Day 2', title: 'Forest and culture', stops: ['Morning walk or cycle in Karura Forest', 'Giraffe Centre conservation visit', 'Karen Blixen Museum or Bomas of Kenya', 'Local design and food stop'] },
    ],
    seasons: [
      { months: 'Jan–Feb', condition: 'clear', score: 5, note: 'Warm, generally drier city days.' },
      { months: 'Mar–May', condition: 'heavy-rain', score: 3, note: 'Long rains; greener parks and possible traffic disruption.' },
      { months: 'Jun–Aug', condition: 'cool', score: 5, note: 'Cooler mornings and comfortable city exploring.' },
      { months: 'Sep–Oct', condition: 'mixed', score: 5, note: 'Mild conditions before the short rains.' },
      { months: 'Nov–Dec', condition: 'mixed', score: 4, note: 'Short rains with bright intervals.' },
    ],
    transport: ['Ride-hailing: convenient in supported areas; verify plate and driver.', 'Private driver: useful for multi-stop days in Karen and Lang’ata.', 'Matatu and bus: extensive and affordable, but routes can be unfamiliar to first-time visitors.', 'Car rental: allow for traffic, parking and unfamiliar road conditions.'],
    safety: commonSafety,
    nearby: [
      { name: 'Mount Kenya', slug: 'mount-kenya', time: '3–4 hours by road' },
      { name: 'Maasai Mara', slug: 'maasai-mara', time: '5–6 hours by road' },
      { name: 'Amboseli', slug: 'amboseli', time: 'About 4 hours by road' },
    ],
    sources: [
      { label: 'Nairobi National Park — KWS', url: 'https://kws.go.ke/park/nairobi-national-park/' },
      { label: 'Giraffe Centre visitor FAQ', url: 'https://www.giraffecentre.org/faqs/' },
      { label: 'Nairobi National Museum — NMK', url: 'https://museums.or.ke/nairobi-national-museum/' },
      { label: 'Karura essential information', url: 'https://friendsofkarura.org/essential-information/' },
    ],
  },
  'maasai-mara': {
    slug: 'maasai-mara', name: 'Maasai Mara', county: 'Narok', tagline: 'Where the savannah writes the story', rating: '4.9',
    categories: ['Safari', 'Wildlife', 'Photography', 'Culture'], hero: images.safari, coordinates: [-1.4934, 35.1439],
    facts: [{ label: 'Best time', value: 'Jul–Oct' }, { label: 'Recommended stay', value: '3–5 days' }, { label: 'Budget', value: '$$$' }, { label: 'Gateway', value: 'Narok / airstrips' }, { label: 'Landscape', value: 'Open savannah' }, { label: 'From Nairobi', value: '5–6 hr road' }],
    overview: ['The Maasai Mara National Reserve and its surrounding conservancies form one of Africa’s best-known wildlife landscapes.', 'The ecosystem continues south into Tanzania’s Serengeti, supporting seasonal movement of wildebeest and zebra as well as resident predators and plains game.', 'A good visit is built around patient game drives, a qualified guide and respect for reserve or conservancy rules.', 'Community-owned conservancies provide an important model linking wildlife habitat, tourism and local livelihoods.'],
    attractions: [
      { name: 'Mara River', description: 'A defining river of the wider migration ecosystem.', time: 'Half day', hours: 'With guide', fee: 'Included in relevant access', mapQuery: 'Mara River Kenya', image: images.safari },
      { name: 'Mara Triangle', description: 'Western sector of the reserve known for open landscapes and wildlife viewing.', time: 'Full day', hours: 'Park hours', fee: 'Check official tariff', mapQuery: 'Mara Triangle', image: images.elephant },
      { name: 'Community conservancies', description: 'Lower-density wildlife areas managed with neighbouring Maasai communities.', time: '1–3 days', hours: 'By arrangement', fee: 'Varies by conservancy', mapQuery: 'Maasai Mara Conservancies', image: images.culture },
    ],
    things: ['Sunrise game drive', 'Wildlife photography', 'Guided nature walk where permitted', 'Conservation talk', 'Community-hosted cultural visit', 'Balloon safari with licensed operator'],
    foods: ['Camp breakfast', 'Kenyan barbecue', 'Chapati', 'Seasonal vegetables'], budget: { budget: 190, standard: 390, luxury: 850 },
    itinerary: [{ day: 'Day 1', title: 'Arrive and orient', stops: ['Transfer to camp', 'Afternoon game drive', 'Guide briefing'] }, { day: 'Day 2', title: 'Full safari day', stops: ['Dawn drive', 'Bush breakfast where permitted', 'River or plains circuit', 'Sunset drive'] }, { day: 'Day 3', title: 'Conservation and culture', stops: ['Conservancy activity', 'Community-hosted visit', 'Departure transfer'] }],
    seasons: [{ months: 'Jul–Oct', condition: 'clear', score: 5, note: 'Dry-season viewing and migration period; busiest months.' }, { months: 'Nov–Feb', condition: 'mixed', score: 4, note: 'Green scenery, resident wildlife and migrant birds.' }, { months: 'Mar–May', condition: 'heavy-rain', score: 3, note: 'Long rains; some roads become challenging.' }],
    transport: ['Road transfer from Nairobi or elsewhere in Kenya.', 'Scheduled light aircraft to local airstrips.', 'Camp vehicles for reserve and conservancy activities.'], safety: commonSafety,
    nearby: [{ name: 'Nairobi', slug: 'nairobi', time: '5–6 hours by road' }, { name: 'Mount Kenya', slug: 'mount-kenya', time: 'Long transfer or flight connection' }],
    sources: [{ label: 'Narok County tourism', url: 'https://narok.go.ke/' }, { label: 'Kenya tourism portal', url: 'https://magicalkenya.com/' }],
  },
  amboseli: {
    slug: 'amboseli', name: 'Amboseli', county: 'Kajiado', tagline: 'Elephants beneath Kilimanjaro', rating: '4.8',
    categories: ['Safari', 'Elephants', 'Birding', 'Photography'], hero: images.elephant, coordinates: [-2.6527, 37.2606],
    facts: [{ label: 'Best time', value: 'Jun–Oct' }, { label: 'Recommended stay', value: '2–3 days' }, { label: 'Budget', value: '$$' }, { label: 'From Nairobi', value: 'About 4 hr' }, { label: 'Landscape', value: 'Wetlands, plains' }, { label: 'Main access', value: 'Road / airstrip' }],
    overview: ['Amboseli National Park is celebrated for elephant viewing and broad views toward Mount Kilimanjaro across the Tanzanian border.', 'Springs fed from the mountain support wetlands within an otherwise dry landscape, concentrating birds and mammals.', 'Cloud can hide the mountain, so patient early mornings often offer the best photography conditions.', 'Visits should follow KWS rules and remain sensitive to wildlife corridors and neighbouring communities.'],
    attractions: [
      { name: 'Observation Hill', description: 'A raised viewpoint across wetlands, plains and distant Kilimanjaro.', time: '1 hour', hours: 'Park hours', fee: 'Included with park entry', mapQuery: 'Observation Hill Amboseli', image: images.mountain },
      { name: 'Amboseli wetlands', description: 'Spring-fed habitat used by elephants, hippos and abundant birds.', time: '2–3 hours', hours: 'With guide', fee: 'Included with park entry', mapQuery: 'Amboseli National Park', image: images.elephant },
    ],
    things: ['Elephant viewing', 'Sunrise photography', 'Birding', 'Observation Hill', 'Guided conservation talk'], foods: ['Lodge meals', 'Nyama choma', 'Chapati'], budget: { budget: 160, standard: 320, luxury: 680 },
    itinerary: [{ day: 'Day 1', title: 'Kilimanjaro arrival', stops: ['Road or air transfer', 'Afternoon wetlands drive', 'Sunset viewpoint'] }, { day: 'Day 2', title: 'Elephant country', stops: ['Dawn game drive', 'Observation Hill', 'Evening drive'] }],
    seasons: [{ months: 'Jun–Oct', condition: 'clear', score: 5, note: 'Dry months concentrate wildlife near water.' }, { months: 'Nov–Feb', condition: 'mixed', score: 4, note: 'Warm conditions and migratory birds.' }, { months: 'Mar–May', condition: 'heavy-rain', score: 3, note: 'Long rains and greener landscapes.' }],
    transport: ['Road transfer from Nairobi.', 'Scheduled or charter flights to Amboseli airstrip.', '4x4 game-drive vehicle inside the park.'], safety: commonSafety,
    nearby: [{ name: 'Nairobi', slug: 'nairobi', time: 'About 4 hours' }, { name: 'Diani Beach', slug: 'diani-beach', time: 'Flight/road combination' }],
    sources: [{ label: 'Amboseli National Park — KWS', url: 'https://kws.go.ke/' }, { label: 'Kenya tourism portal', url: 'https://magicalkenya.com/' }],
  },
  'diani-beach': {
    slug: 'diani-beach', name: 'Diani Beach', county: 'Kwale', tagline: 'The Indian Ocean, unhurried', rating: '4.8',
    categories: ['Beach', 'Marine life', 'Food', 'Relaxation'], hero: images.beach, coordinates: [-4.2793, 39.5947],
    facts: [{ label: 'Best time', value: 'Jan–Mar' }, { label: 'Recommended stay', value: '3–6 days' }, { label: 'Budget', value: '$$' }, { label: 'Nearest airport', value: 'Ukunda' }, { label: 'Ocean', value: 'Indian Ocean' }, { label: 'From Nairobi', value: 'Flight or SGR' }],
    overview: ['Diani stretches along Kenya’s south coast with pale sand, warm water and a reef-influenced marine environment.', 'The destination balances resort stays with independent restaurants, water sports and access to cultural and conservation experiences in Kwale County.', 'Tides affect swimming, reef walks and boat departures, so use local forecasts and qualified operators.', 'A longer stay allows for rest days between diving, snorkelling, forest visits and coastal dining.'],
    attractions: [
      { name: 'Diani Beach', description: 'Long public shoreline for swimming, walking and ocean views.', time: 'Flexible', hours: 'Daylight recommended', fee: 'Public access', mapQuery: 'Diani Beach Kenya', image: images.beach },
      { name: 'Kisite–Mpunguti excursion', description: 'Marine park day trips for snorkelling and wildlife viewing with licensed operators.', time: 'Full day', hours: 'Weather dependent', fee: 'Park and operator fees', mapQuery: 'Kisite Mpunguti Marine Park', image: images.beach },
      { name: 'Shimba Hills', description: 'Coastal forest and grassland reserve inland from Diani.', time: 'Half/full day', hours: 'Check KWS', fee: 'Check KWS tariff', mapQuery: 'Shimba Hills National Reserve', image: images.culture },
    ],
    things: ['Swim at safe tide', 'Snorkel or dive', 'Kitesurf with an instructor', 'Coastal food tour', 'Dhow excursion', 'Visit Shimba Hills'], foods: ['Grilled fish', 'Pilau', 'Mishkaki', 'Coconut curries', 'Fresh fruit'], budget: { budget: 75, standard: 165, luxury: 390 },
    itinerary: [{ day: 'Day 1', title: 'Settle into the coast', stops: ['Ukunda transfer', 'Beach walk', 'Swahili dinner'] }, { day: 'Day 2', title: 'Ocean day', stops: ['Marine excursion', 'Seafood lunch', 'Sunset rest'] }, { day: 'Day 3', title: 'Forest and culture', stops: ['Shimba Hills or cultural visit', 'Local restaurant', 'Beach evening'] }],
    seasons: [{ months: 'Jan–Mar', condition: 'clear', score: 5, note: 'Warm, sunny beach conditions.' }, { months: 'Apr–May', condition: 'heavy-rain', score: 3, note: 'Long rains and rougher weather possible.' }, { months: 'Jun–Oct', condition: 'cool', score: 4, note: 'Generally cooler, pleasant coast weather.' }, { months: 'Nov–Dec', condition: 'mixed', score: 4, note: 'Short rains with warm intervals.' }],
    transport: ['Fly to Ukunda for the shortest transfer.', 'Madaraka Express to Mombasa plus a south-coast road transfer.', 'Pre-arranged hotel transfer or verified ride-hailing where supported.'], safety: [...commonSafety, 'Check tides and marine weather; use qualified operators and flotation equipment.'],
    nearby: [{ name: 'Lamu Old Town', slug: 'lamu-old-town', time: 'Flight connection north' }, { name: 'Amboseli', slug: 'amboseli', time: 'Road/flight combination' }],
    sources: [{ label: 'Kenya Wildlife Service marine parks', url: 'https://kws.go.ke/' }, { label: 'Kenya tourism portal', url: 'https://magicalkenya.com/' }],
  },
  'mount-kenya': {
    slug: 'mount-kenya', name: 'Mount Kenya', county: 'Laikipia / Meru / Nyeri', tagline: 'High trails on the equator', rating: '4.7',
    categories: ['Hiking', 'Nature', 'Photography', 'Adventure'], hero: images.mountain, coordinates: [-0.1521, 37.3084],
    facts: [{ label: 'Best time', value: 'Jan–Feb, Aug–Sep' }, { label: 'Recommended stay', value: '4–6 days' }, { label: 'Budget', value: '$$' }, { label: 'Highest point', value: '5,199 m' }, { label: 'Access', value: 'Multiple gates' }, { label: 'Status', value: 'UNESCO landscape' }],
    overview: ['Mount Kenya is Africa’s second-highest mountain and a UNESCO-listed landscape of forest, moorland, lakes, glaciers and rugged volcanic peaks.', 'Point Lenana is a demanding trekking objective; Batian and Nelion are technical climbs requiring specialist skill and equipment.', 'Altitude, weather and route conditions make a qualified guide, acclimatisation and a realistic itinerary essential.', 'The mountain is culturally significant to communities around it and ecologically important as a major water tower.'],
    attractions: [
      { name: 'Sirimon Route', description: 'A popular northern trekking approach through forest and high moorland.', time: 'Multi-day', hours: 'Registered itinerary', fee: 'Check KWS tariff', mapQuery: 'Sirimon Gate Mount Kenya', image: images.mountain },
      { name: 'Chogoria Route', description: 'Scenic eastern approach known for tarns, valleys and dramatic terrain.', time: 'Multi-day', hours: 'Registered itinerary', fee: 'Check KWS tariff', mapQuery: 'Chogoria Gate Mount Kenya', image: images.mountain },
    ],
    things: ['Multi-day trekking', 'Birding', 'Landscape photography', 'High-altitude camping', 'Forest walks at lower elevations'], foods: ['Guide-prepared trail meals', 'Kenyan tea', 'Local highland produce'], budget: { budget: 130, standard: 260, luxury: 520 },
    itinerary: [{ day: 'Day 1', title: 'Gate and acclimatisation', stops: ['Guide and gear check', 'Gradual ascent', 'Early rest'] }, { day: 'Day 2–4', title: 'High mountain route', stops: ['Paced ascent', 'Acclimatisation stops', 'Point Lenana attempt if conditions permit'] }, { day: 'Final day', title: 'Descent', stops: ['Controlled descent', 'Gate transfer', 'Recovery night'] }],
    seasons: [{ months: 'Jan–Feb', condition: 'clear', score: 5, note: 'Often one of the clearer windows.' }, { months: 'Mar–May', condition: 'heavy-rain', score: 2, note: 'Long rains and difficult trail conditions.' }, { months: 'Aug–Sep', condition: 'clear', score: 5, note: 'Another commonly favoured trekking window.' }, { months: 'Oct–Dec', condition: 'clear', score: 3, note: 'Short-rain variability.' }],
    transport: ['Road transfer to the selected gate.', 'Registered guide and porter logistics for multi-day routes.', 'Four-wheel drive may be required on some access roads.'], safety: [...commonSafety, 'Altitude illness can be life-threatening; descend and seek help if symptoms worsen.'],
    nearby: [{ name: 'Nairobi', slug: 'nairobi', time: '3–4 hours by road' }, { name: 'Maasai Mara', slug: 'maasai-mara', time: 'Long road transfer or flight connection' }],
    sources: [{ label: 'Mount Kenya National Park — KWS', url: 'https://kws.go.ke/' }, { label: 'UNESCO Mount Kenya', url: 'https://whc.unesco.org/en/list/800/' }],
  },
  'lamu-old-town': {
    slug: 'lamu-old-town', name: 'Lamu Old Town', county: 'Lamu', tagline: 'Swahili heritage by the sea', rating: '4.7',
    categories: ['Culture', 'History', 'Food', 'Coast'], hero: images.culture, coordinates: [-2.2717, 40.902],
    facts: [{ label: 'Best time', value: 'Nov–Mar' }, { label: 'Recommended stay', value: '3–4 days' }, { label: 'Budget', value: '$$' }, { label: 'Heritage', value: 'UNESCO listed' }, { label: 'Movement', value: 'Mostly on foot' }, { label: 'Nearest airport', value: 'Manda' }],
    overview: ['Lamu Old Town is one of East Africa’s oldest continuously inhabited Swahili settlements and a UNESCO World Heritage Site.', 'Coral-stone houses, carved doors, courtyards, mosques and narrow streets reflect centuries of exchange across the Indian Ocean.', 'The town is primarily explored on foot; dhows and small boats connect waterfront destinations and nearby islands.', 'Visitors should dress respectfully, ask before photographing residents and approach the town as a living community rather than an open-air set.'],
    attractions: [
      { name: 'Lamu Museum', description: 'Collections interpreting Swahili culture, maritime history and the Lamu archipelago.', time: '1–2 hours', hours: 'Confirm with NMK', fee: 'Check NMK tariff', mapQuery: 'Lamu Museum', image: images.culture },
      { name: 'Lamu Fort', description: 'A prominent early-19th-century fort and cultural venue in the old town.', time: '1 hour', hours: 'Confirm with NMK', fee: 'Check NMK tariff', mapQuery: 'Lamu Fort', image: images.culture },
      { name: 'Dhow sailing', description: 'Traditional sailing experience arranged with a reputable local operator.', time: '2–4 hours', hours: 'Tide/weather dependent', fee: 'Operator quote', mapQuery: 'Lamu Old Town waterfront', image: images.beach },
    ],
    things: ['Old Town walking tour', 'Lamu Museum', 'Dhow sunset sail', 'Swahili cooking', 'Carved-door photography', 'Visit local craft workshops'], foods: ['Biryani', 'Pilau', 'Coconut fish curry', 'Mahamri', 'Seafood'], budget: { budget: 70, standard: 150, luxury: 330 },
    itinerary: [{ day: 'Day 1', title: 'Old Town introduction', stops: ['Manda boat transfer', 'Guided heritage walk', 'Swahili dinner'] }, { day: 'Day 2', title: 'Museum and dhow', stops: ['Lamu Museum and Fort', 'Waterfront lunch', 'Sunset dhow sail'] }, { day: 'Day 3', title: 'Living culture', stops: ['Craft workshop', 'Cooking or food experience', 'Unhurried old-town walk'] }],
    seasons: [{ months: 'Nov–Mar', condition: 'clear', score: 5, note: 'Warm period often favoured for coast visits.' }, { months: 'Apr–May', condition: 'heavy-rain', score: 3, note: 'Long rains and higher humidity.' }, { months: 'Jun–Oct', condition: 'cool', score: 4, note: 'Breezier, generally cooler conditions.' }],
    transport: ['Fly to Manda Airport, then use an arranged boat transfer.', 'Explore the old town mainly on foot.', 'Use reputable boat operators and wear supplied flotation equipment.'], safety: [...commonSafety, 'Check current regional travel advice before booking travel to Lamu County.'],
    nearby: [{ name: 'Diani Beach', slug: 'diani-beach', time: 'Flight connection south' }, { name: 'Nairobi', slug: 'nairobi', time: 'About 1.5 hours by air' }],
    sources: [{ label: 'UNESCO Lamu Old Town', url: 'https://whc.unesco.org/en/list/1055/' }, { label: 'National Museums of Kenya sites', url: 'https://museums.or.ke/museum-sites-and-world-heritage-sites/' }],
  },
};

export const destinationSlug = (name: string) =>
  name.toLowerCase().replace(/\s+/g, '-');
