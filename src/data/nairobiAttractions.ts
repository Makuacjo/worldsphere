import { nairobiAttractionImages } from './nairobiAttractionImages.generated';

export type NairobiAttraction = {
  destinationSlug: 'nairobi';
  name: string;
  slug: keyof typeof nairobiAttractionImages;
  category: string;
  rating: number;
  shortDescription: string;
  about: string[];
  visitDuration: string;
  openingHours: string;
  entryFee: string;
  bestTime: string;
  accessibility: string;
  familySuitable: string;
  photography: string;
  transport: string;
  coordinates: [number, number];
  activities: string[];
  visitorInfo: string[];
  tips: string[];
  nearby: string[];
  officialSource?: string;
};

const standardTips = [
  'Confirm opening hours, admission arrangements and scheduled programmes before travelling.',
  'Carry drinking water, sun protection and a charged phone.',
  'Keep personal belongings secure and use trusted transport.',
  'Ask before photographing individuals and respect restricted spaces.',
];

export const NAIROBI_ATTRACTIONS: NairobiAttraction[] = [
  {
    destinationSlug: 'nairobi', name: 'Bomas of Kenya', slug: 'bomas-of-kenya', category: 'Culture', rating: 4.6,
    shortDescription: 'Traditional architecture, music and dance presenting Kenya’s cultural diversity.',
    about: [
      'Bomas of Kenya is a national cultural centre in Lang’ata created to preserve, interpret and present the traditions of communities across Kenya. The name boma refers to a homestead, and the site’s recreated compounds show how architecture responds to family life, livestock, climate and local materials.',
      'Its best-known visitor experience is the programme of traditional music and dance. Bomas says its performers present more than 50 dances drawn from communities across the country, using choreography, live music, costume and storytelling.',
      'Visitors can combine a performance with a guided look at the homesteads and cultural displays. It is particularly useful for first-time visitors, families, school groups, photographers and travellers who want context before visiting other parts of Kenya.',
    ],
    visitDuration: '2–4 hours', openingHours: 'Confirm the current performance schedule before visiting', entryFee: 'Check the official current admission rate',
    bestTime: 'Arrive before the scheduled afternoon performance', accessibility: 'Main visitor areas are generally accessible; confirm specific mobility support',
    familySuitable: 'Yes; performances and homesteads suit mixed-age groups', photography: 'Personal photography is generally suitable; ask before photographing performers closely',
    transport: 'Private transfer, taxi or verified ride-hailing to Lang’ata', coordinates: [-1.3373, 36.7699],
    activities: ['Watch traditional dance performances', 'Explore Kenyan homesteads', 'Learn about ethnic communities', 'Attend cultural exhibitions', 'Take cultural photographs', 'Browse locally made crafts', 'Experience traditional music', 'Join a guided cultural tour'],
    visitorInfo: ['Allow extra time for Nairobi traffic, especially before a scheduled show.', 'Wear comfortable walking shoes and respectful everyday clothing.', 'Food and event facilities may operate according to the day’s programme.', 'Combine with Giraffe Centre, Karen Blixen Museum or Nairobi National Park when timings allow.'],
    tips: ['Confirm the live-performance schedule directly with Bomas.', 'Arrive early for popular cultural shows.', ...standardTips],
    nearby: ['giraffe-centre', 'karen-blixen-museum', 'nairobi-national-park', 'sheldrick-wildlife-trust'],
    officialSource: 'https://bomasofkenya.go.ke/live-cultural-performances/',
  },
  {
    destinationSlug: 'nairobi', name: 'Giraffe Centre', slug: 'giraffe-centre', category: 'Conservation', rating: 4.7,
    shortDescription: 'Conservation education and close viewing of endangered Rothschild’s giraffes.',
    about: [
      'The Giraffe Centre in Lang’ata is operated by the African Fund for Endangered Wildlife. It combines public conservation education with work supporting the endangered Rothschild’s giraffe.',
      'Visitors observe giraffes from a raised platform, learn from educators and can follow the adjoining nature trail when conditions permit. The centre recommends allowing roughly one and a half to two hours.',
      'It is popular with families and first-time wildlife visitors. Responsible interaction matters: follow staff instructions and use only approved feed.',
    ],
    visitDuration: '1.5–2 hours', openingHours: 'Official FAQ currently lists 09:00–17:00 daily', entryFee: 'Check the official current admission rate',
    bestTime: 'Opening time or later afternoon for lighter crowds', accessibility: 'Contact the centre for current step-free and platform access details',
    familySuitable: 'Yes; strong educational value for children', photography: 'Allowed in visitor areas without disturbing animals',
    transport: 'Taxi, private transfer or verified ride-hailing to Nyumbi Road', coordinates: [-1.3762, 36.7444],
    activities: ['Observe Rothschild’s giraffes', 'Attend a conservation talk', 'Use the feeding platform responsibly', 'Walk the nature trail', 'Learn about giraffe ecology', 'Visit the education centre'],
    visitorInfo: ['Use only feed supplied by the centre.', 'Peak times can be busy; build flexibility into the visit.', 'Card and M-PESA payment policies can change—check before arrival.', 'Pair with nearby Karen and Lang’ata attractions.'],
    tips: standardTips, nearby: ['bomas-of-kenya', 'karen-blixen-museum', 'sheldrick-wildlife-trust', 'nairobi-national-park'],
    officialSource: 'https://www.giraffecentre.org/faqs/',
  },
  {
    destinationSlug: 'nairobi', name: 'Sheldrick Wildlife Trust', slug: 'sheldrick-wildlife-trust', category: 'Wildlife conservation', rating: 4.8,
    shortDescription: 'A pre-booked public visit to the Nairobi Nursery’s rescued elephant orphans.',
    about: [
      'Sheldrick Wildlife Trust’s Nairobi Nursery cares for orphaned elephants and rhinos at the beginning of a long rehabilitation process intended to return suitable animals to the wild.',
      'The public visit is a structured conservation experience rather than a conventional zoo visit. Keepers explain rescue stories, husbandry and reintegration while the nursery herd receives its midday feed and mud bath.',
      'Advance booking is essential. The Trust currently states that only its own confirmation is valid and that separate Nairobi National Park entry requirements apply.',
    ],
    visitDuration: 'About 1 hour, plus arrival time', openingHours: 'Public visit currently 11:00–12:00; advance booking required', entryFee: 'Official donation plus applicable KWS park entry—verify both',
    bestTime: 'Arrive well before the booked public visit', accessibility: 'Outdoor natural surfaces; confirm individual access needs before booking',
    familySuitable: 'Yes, with close supervision and advance booking', photography: 'Follow keeper guidance and avoid disruptive equipment',
    transport: 'Pre-arranged driver or verified transfer to the designated Nairobi National Park access', coordinates: [-1.378, 36.779],
    activities: ['Watch the midday milk feed', 'Learn individual rescue stories', 'Understand elephant rehabilitation', 'Hear from keepers', 'Support conservation work', 'Combine with a park game drive'],
    visitorInfo: ['Bring the official booking confirmation digitally or printed.', 'Do not rely on third-party booking claims without Trust confirmation.', 'Allow time for park-entry procedures.', 'Wear closed shoes suitable for dust or mud.'],
    tips: ['Book directly and early; same-day visits are not accepted.', 'Do not arrive without a valid confirmation.', ...standardTips],
    nearby: ['nairobi-national-park', 'giraffe-centre', 'bomas-of-kenya', 'karen-blixen-museum'],
    officialSource: 'https://www.sheldrickwildlifetrust.org/nursery-visit',
  },
  {
    destinationSlug: 'nairobi', name: 'Karen Blixen Museum', slug: 'karen-blixen-museum', category: 'History', rating: 4.6,
    shortDescription: 'The preserved farmhouse, gardens and coffee-farm story associated with Karen Blixen.',
    about: [
      'The Karen Blixen Museum occupies the farmhouse where the Danish author lived between 1917 and 1931. The house, gardens and surviving farm equipment interpret the property’s domestic and agricultural history.',
      'National Museums of Kenya operates the site and offers guided visits through furnished rooms, outdoor exhibits and a nature trail with views toward the Ngong Hills.',
      'The visit is best approached as one perspective on colonial-era Kenya, read alongside museums and cultural institutions that present broader Kenyan histories and voices.',
    ],
    visitDuration: '1–2 hours', openingHours: 'Confirm current National Museums of Kenya hours', entryFee: 'Check the official current NMK admission rate',
    bestTime: 'Morning or mid-afternoon', accessibility: 'Historic interiors and paths vary; confirm mobility requirements',
    familySuitable: 'Best for older children interested in history and literature', photography: 'Ask staff about current interior-photography rules',
    transport: 'Private transfer or verified ride-hailing to Karen Road', coordinates: [-1.3519, 36.7135],
    activities: ['Tour the historic farmhouse', 'View period furniture and farm tools', 'Walk the gardens', 'Explore the nature trail', 'Learn the coffee-farm history', 'Visit the museum shop'],
    visitorInfo: ['Guided tours run through the day subject to staffing.', 'Comfortable shoes help on garden paths.', 'Carry rain protection during wet periods.', 'Nearby cafés and other Karen attractions make this easy to combine.'],
    tips: standardTips, nearby: ['giraffe-centre', 'bomas-of-kenya', 'ngong-hills', 'sheldrick-wildlife-trust'],
    officialSource: 'https://museums.or.ke/karen-blixen/',
  },
  {
    destinationSlug: 'nairobi', name: 'Karura Forest', slug: 'karura-forest', category: 'Nature', rating: 4.8,
    shortDescription: 'An urban forest network for walking, running, cycling, birding and quiet exploration.',
    about: [
      'Karura Forest is one of Nairobi’s most valuable urban green spaces, protecting indigenous woodland, river valleys, caves, waterfalls and habitat for birds and small mammals.',
      'Marked routes support walking, running and cycling. Different gates serve different parts of the forest, so choose an entrance based on the route and activity you plan.',
      'The forest is suitable for families, active travellers, birders and anyone needing a slower counterpoint to Nairobi’s traffic and dense city schedule.',
    ],
    visitDuration: '2–4 hours', openingHours: 'Entry currently listed from 06:00 with last entry at 17:30', entryFee: 'Check current eCitizen entry and activity fees',
    bestTime: 'Morning, with daylight remaining for your route', accessibility: 'Trail surfaces and gradients vary; ask about the most suitable gate and route',
    familySuitable: 'Yes, with route choice matched to age and ability', photography: 'Suitable for nature photography; do not disturb wildlife',
    transport: 'Taxi, private transfer or verified ride-hailing to the selected gate', coordinates: [-1.235, 36.837],
    activities: ['Walk forest trails', 'Hire a bicycle', 'Watch birds', 'Visit caves and waterfalls', 'Run marked routes', 'Enjoy a picnic in designated areas'],
    visitorInfo: ['Confirm the gate nearest your intended route.', 'Use marked paths and observe closing times.', 'Carry water and rain protection.', 'Payment arrangements are primarily digital and can change.'],
    tips: standardTips, nearby: ['nairobi-national-museum', 'national-archives', 'nairobi-railway-museum', 'ngong-hills'],
    officialSource: 'https://friendsofkarura.org/essential-information/',
  },
  {
    destinationSlug: 'nairobi', name: 'Ngong Hills', slug: 'ngong-hills', category: 'Hiking', rating: 4.7,
    shortDescription: 'A highland ridge of open grassland, wind, broad views and active hiking routes.',
    about: [
      'The Ngong Hills rise southwest of Nairobi and form a distinctive ridge above the Great Rift Valley. Their elevation brings cooler, windier conditions and long views when cloud permits.',
      'Visitors come for hiking, picnics, photography and outdoor exercise. Route length, weather and security conditions should be confirmed locally before setting out.',
      'The hills work best for active travellers with appropriate footwear, water, sun protection and a plan for transport at the end of the walk.',
    ],
    visitDuration: '3–6 hours', openingHours: 'Daylight visit; confirm current gate arrangements', entryFee: 'Check the official current forest/recreation fee',
    bestTime: 'Clear morning with a current weather check', accessibility: 'Uneven, steep and exposed terrain', familySuitable: 'Suitable for active older children with supervision',
    photography: 'Landscape photography; protect equipment from dust, wind and rain', transport: 'Private transfer recommended for flexible pickup', coordinates: [-1.4, 36.64],
    activities: ['Hike the ridge', 'Photograph Rift Valley views', 'Picnic in approved areas', 'Watch highland birds', 'Take a guided nature walk', 'Combine with Karen attractions'],
    visitorInfo: ['Conditions can change quickly with wind, cloud and rain.', 'Avoid walking alone and seek current local safety guidance.', 'Carry sufficient water and a warm or waterproof layer.', 'Agree on the return pickup point before starting.'],
    tips: standardTips, nearby: ['karen-blixen-museum', 'giraffe-centre', 'bomas-of-kenya', 'karura-forest'],
  },
  {
    destinationSlug: 'nairobi', name: 'National Archives', slug: 'national-archives', category: 'History & art', rating: 4.4,
    shortDescription: 'Public records, historical material and the Murumbi collection in central Nairobi.',
    about: [
      'The Kenya National Archives and Documentation Service occupies a landmark building on Moi Avenue in Nairobi’s central business district.',
      'Its public-facing collections include documentary heritage and artworks associated with the Murumbi African Heritage collection, offering a compact introduction to Kenyan and regional history.',
      'The central location makes it easy to combine with a guided CBD heritage walk, but visitors should confirm public gallery access and current opening arrangements.',
    ],
    visitDuration: '1–2 hours', openingHours: 'Confirm current public-gallery hours before visiting', entryFee: 'Check the official current admission rate',
    bestTime: 'Weekday daytime', accessibility: 'Confirm lift and gallery access directly', familySuitable: 'Best for school-age children and history enthusiasts',
    photography: 'Restrictions may apply to documents, artworks and building areas', transport: 'CBD bus, taxi or verified ride-hailing; plan the drop-off point', coordinates: [-1.2849, 36.8257],
    activities: ['View documentary heritage', 'Explore African art collections', 'Learn about Kenyan history', 'Study historical photographs', 'Join a guided CBD heritage walk'],
    visitorInfo: ['Carry identification if requested by security.', 'Ask before photographing any collection item.', 'Travel during daylight and keep valuables discreet in the CBD.', 'Confirm temporary exhibitions before arrival.'],
    tips: standardTips, nearby: ['nairobi-railway-museum', 'nairobi-national-museum', 'karura-forest', 'bomas-of-kenya'],
  },
  {
    destinationSlug: 'nairobi', name: 'Nairobi Railway Museum', slug: 'nairobi-railway-museum', category: 'Transport history', rating: 4.5,
    shortDescription: 'Historic locomotives, rolling stock and archives from East Africa’s railway story.',
    about: [
      'Nairobi Railway Museum preserves locomotives, carriages, equipment, photographs and records connected to the development of railways in Kenya and East Africa.',
      'The outdoor rolling stock gives the museum a strong visual character, while the resource collection provides context on engineering, labour, urban growth and the railway’s complicated historical legacy.',
      'It suits families, railway enthusiasts, photographers and travellers interested in why Nairobi developed where it did.',
    ],
    visitDuration: '1.5–2.5 hours', openingHours: 'Confirm current Kenya Railways museum hours', entryFee: 'Check the official current admission rate',
    bestTime: 'Morning or early afternoon in dry weather', accessibility: 'Outdoor gravel and historic rolling stock can limit access',
    familySuitable: 'Yes, with supervision around exhibits', photography: 'Ask staff about equipment and restricted railway areas',
    transport: 'Taxi or verified ride-hailing to the museum entrance near Nairobi Central station', coordinates: [-1.2935, 36.822],
    activities: ['Inspect historic locomotives', 'Explore railway carriages', 'Learn Nairobi’s railway origins', 'View archival photographs', 'Photograph industrial details'],
    visitorInfo: ['Closed shoes are useful on outdoor surfaces.', 'Do not climb exhibits unless staff explicitly permit it.', 'Carry sun and rain protection.', 'Coordinate CBD transport before leaving.'],
    tips: standardTips, nearby: ['national-archives', 'nairobi-national-museum', 'bomas-of-kenya', 'karura-forest'],
    officialSource: 'https://krc.co.ke/wp-content/uploads/2021/03/Nairobi-Railways-Museum-Brochure-1.pdf',
  },
  {
    destinationSlug: 'nairobi', name: 'Nairobi National Park', slug: 'nairobi-national-park', category: 'Wildlife', rating: 4.8,
    shortDescription: 'Kenya’s first national park, where open plains and wildlife meet the capital skyline.',
    about: [
      'Nairobi National Park was gazetted in 1946 and remains one of the world’s most unusual protected landscapes: wildlife habitat immediately beside a major capital city.',
      'Open grassland, riverine habitat and seasonal wetlands support rhino, lion, buffalo, giraffe, zebra and a rich bird list. Sightings are never guaranteed, and patient, responsible viewing matters.',
      'A guided or self-drive visit follows KWS park rules. Stay in the vehicle outside designated areas, keep distance from animals and never feed wildlife.',
    ],
    visitDuration: '4–6 hours', openingHours: 'KWS currently lists gates open 06:00–18:00', entryFee: 'Check the current KWS conservation fee',
    bestTime: 'Early morning game drive', accessibility: 'Vehicle-based viewing; confirm accessible vehicle arrangements',
    familySuitable: 'Yes, with park rules and realistic drive length', photography: 'Excellent wildlife and skyline photography from inside the vehicle',
    transport: 'Licensed safari vehicle, private driver-guide or suitable self-drive vehicle', coordinates: [-1.3733, 36.858],
    activities: ['Take a dawn game drive', 'Look for black rhino', 'Watch birds', 'Visit the Ivory Burning Site', 'Photograph wildlife and skyline', 'Use designated picnic sites'],
    visitorInfo: ['Carry clean drinking water, binoculars, sunscreen and insect repellent.', 'Remain in the vehicle except in designated areas.', 'The park speed limit and gate times are enforced.', 'Single-use plastic is prohibited in protected areas.'],
    tips: standardTips, nearby: ['sheldrick-wildlife-trust', 'bomas-of-kenya', 'giraffe-centre', 'nairobi-national-museum'],
    officialSource: 'https://kws.go.ke/park/nairobi-national-park/',
  },
  {
    destinationSlug: 'nairobi', name: 'Nairobi National Museum', slug: 'nairobi-national-museum', category: 'Museum', rating: 4.7,
    shortDescription: 'Kenya’s natural history, cultures, art and human-origins collections at Museum Hill.',
    about: [
      'Nairobi National Museum brings together collections on Kenya’s natural history, archaeology, cultural heritage, art and modern history.',
      'Permanent galleries include human origins, mammals, the history of Kenya, cycles of life, numismatics and Asian African heritage. The neighbouring Snake Park can be visited separately or as a combined experience when operating.',
      'The museum is one of the best starting points for understanding the landscapes and communities encountered elsewhere in Kenya.',
    ],
    visitDuration: '2–3 hours', openingHours: 'NMK currently lists 08:30–17:30; verify before visiting', entryFee: 'Check the official current NMK admission rate',
    bestTime: 'Morning or rainy-day afternoon', accessibility: 'Major galleries are generally accessible; confirm specific support',
    familySuitable: 'Yes; broad educational content', photography: 'Ask about current gallery and temporary-exhibition rules',
    transport: 'Taxi, bus or verified ride-hailing to Museum Hill', coordinates: [-1.2733, 36.814],
    activities: ['Explore human-origins galleries', 'See Kenyan wildlife collections', 'Learn the history of Kenya', 'Visit art exhibitions', 'Walk the museum grounds', 'Add the Snake Park if appropriate'],
    visitorInfo: ['Allow more time if combining museum and Snake Park.', 'Temporary exhibitions change throughout the year.', 'Food and rest facilities are available in the Museum Hill area.', 'Check current ticket categories before arrival.'],
    tips: standardTips, nearby: ['karura-forest', 'national-archives', 'nairobi-railway-museum', 'nairobi-national-park'],
    officialSource: 'https://museums.or.ke/nairobi-national-museum/',
  },
];

export const NAIROBI_ATTRACTIONS_BY_SLUG = Object.fromEntries(
  NAIROBI_ATTRACTIONS.map((attraction) => [attraction.slug, attraction]),
) as Record<string, NairobiAttraction>;

export const getNairobiAttractionImages = (slug: string) =>
  nairobiAttractionImages[slug as keyof typeof nairobiAttractionImages];
