export type GuideSection = {
  title: string;
  intro?: string;
  items: string[];
};

export type GuideSource = {
  label: string;
  organization: string;
  url: string;
};

export type KenyaTravelGuide = {
  slug: string;
  eyebrow: string;
  title: string;
  summary: string;
  quickAnswer: string;
  updated: string;
  sections: GuideSection[];
  checklist: string[];
  sources: GuideSource[];
};

export const KENYA_TRAVEL_GUIDES: Record<string, KenyaTravelGuide> = {
  'entry-and-health': {
    slug: 'entry-and-health',
    eyebrow: 'Before you fly',
    title: 'Entry and health',
    summary: 'A document-first guide to Kenya’s eTA, passport and public-health checks.',
    quickAnswer: 'Most visitors who are not exempt must receive a Kenyan eTA before travel. Your passport should remain valid for at least six months after your planned arrival and have at least one blank page.',
    updated: '26 July 2026',
    sections: [
      {
        title: 'Electronic Travel Authorisation',
        items: [
          'Check your nationality on the official eTA eligibility page before buying non-refundable travel.',
          'Apply only through etakenya.go.ke. The standard application asks for passport details, a recent photo or selfie, contact information, arrival and departure itinerary, and accommodation confirmation.',
          'Every traveller, including a child or infant, needs their own approval unless an official exemption applies.',
          'Save the approval offline and carry a printed copy. An eTA permits travel to Kenya but final admission is decided at the border.',
        ],
      },
      {
        title: 'Passport and journey documents',
        items: [
          'Use the same passport for the application and the journey.',
          'Confirm at least six months of passport validity after your planned arrival and at least one blank page.',
          'Keep your onward or return itinerary, first-night accommodation, insurance details and host contact available.',
          'Airlines may apply document checks before boarding, so verify their requirements as well as Kenya’s.',
        ],
      },
      {
        title: 'Vaccination and health',
        items: [
          'Kenya Port Health requires a valid yellow-fever certificate from travellers arriving from countries with yellow-fever transmission risk. Transit history can matter, so check the current country list.',
          'A yellow-fever certificate normally becomes valid 10 days after a first vaccination. Medical exemptions should be documented by an authorised clinician.',
          'Routine vaccination, malaria prevention and personal medical needs depend on your route and health history. Speak to a qualified travel-health professional well before departure.',
          'Current Ministry of Health guidance does not routinely require COVID-19 vaccination proof or a pre-departure test, but symptomatic travellers may be assessed under current public-health rules.',
        ],
      },
      {
        title: 'Insurance and medicines',
        items: [
          'Choose cover that includes your planned activities, medical treatment, evacuation and trip disruption.',
          'Carry prescription medicine in original packaging with a copy of the prescription; confirm restrictions with your airline and Kenyan authorities.',
          'Do not rely on this guide for individual medical advice. A clinician should assess pregnancy, chronic conditions, children and high-altitude plans.',
        ],
      },
    ],
    checklist: ['Passport and eTA approval', 'Return/onward itinerary', 'Accommodation confirmation', 'Insurance certificate', 'Vaccination record if required', 'Prescription and essential medicine'],
    sources: [
      { label: 'Apply for a Kenya eTA', organization: 'Republic of Kenya', url: 'https://etakenya.go.ke/apply/tourist-outside-africa?type=tourist' },
      { label: 'Check eTA eligibility', organization: 'Republic of Kenya', url: 'https://extern.api.etakenya.go.ke/eligibility' },
      { label: 'Entry requirements', organization: 'Kenya Port Health', url: 'https://porthealth.health.go.ke/entry-requirements' },
      { label: 'International travel vaccination', organization: 'Kenya Port Health', url: 'https://porthealth.health.go.ke/international-travel-vaccination' },
      { label: 'Travellers’ information', organization: 'Kenya Ministry of Health', url: 'https://health.go.ke/index.php/travelers-information' },
    ],
  },
  safety: {
    slug: 'safety',
    eyebrow: 'Travel aware',
    title: 'Safety in Kenya',
    summary: 'Practical precautions for cities, roads, protected areas and changing regional conditions.',
    quickAnswer: 'Kenya’s visitor routes are diverse, and risk is not the same everywhere. Check a current advisory for your exact route, use licensed operators, avoid demonstrations and isolated areas after dark, and follow rangers inside parks.',
    updated: '26 July 2026',
    sections: [
      {
        title: 'Before choosing your route',
        items: [
          'Read your own government’s current Kenya advisory and check every county or border area on your itinerary. Advisories currently caution against travel to specific parts of Kenya.',
          'Political demonstrations can form with limited notice. Avoid crowds and protests, monitor local news and follow instructions from authorities.',
          'Share your route and operator contacts with someone you trust. Keep passport, insurance and emergency details available offline.',
        ],
      },
      {
        title: 'Cities and everyday precautions',
        items: [
          'Arrange airport transfers through your accommodation, a licensed operator or a recognised ride-hailing platform.',
          'Avoid displaying expensive jewellery, phones or large amounts of cash. Use ATMs inside banks, malls or other controlled locations.',
          'Do not walk alone in dark or isolated areas. Confirm a vehicle registration and driver before entering.',
          'Ask before photographing people, and do not photograph airports, military sites, embassies or other sensitive official facilities.',
        ],
      },
      {
        title: 'Parks, wildlife and coast',
        items: [
          'Remain in the vehicle unless a ranger or marked area permits you to leave it. Keep doors closed and give wildlife right of way.',
          'KWS rules prohibit feeding wildlife and off-road driving. Keep a respectful distance and never position yourself between an animal and its young.',
          'Use a qualified guide for walking safaris, mountain routes and marine activities. Follow beach flags, local lifeguards and your operator’s conditions.',
          'National parks prohibit single-use plastic. Carry out your waste and follow local fire rules.',
        ],
      },
      {
        title: 'If something happens',
        items: [
          'Kenya National Police emergency lines are 999, 112 and 911. KWS lists 0800 597 000 for wildlife and park assistance.',
          'Contact your insurer promptly after a medical or security incident and keep receipts, case references and police reports.',
          'In a medical emergency, use the nearest capable facility identified by your accommodation or insurer; facilities vary greatly by region.',
        ],
      },
    ],
    checklist: ['Current route-specific advisory checked', 'Licensed operator details', 'Offline emergency contacts', 'Insurance with evacuation cover', 'Copies of important documents', 'Daily check-in plan'],
    sources: [
      { label: 'Tourism safety information', organization: 'Kenya National Tourism Service Portal', url: 'https://tourkenya.go.ke/tourism-safety/' },
      { label: 'Police service standards and emergency lines', organization: 'Kenya National Police Service', url: 'https://www.nationalpolice.go.ke/sites/default/files/2025-01/NPS%20Service%20Standards.pdf' },
      { label: 'Official park rules', organization: 'Kenya Wildlife Service', url: 'https://www.kws.go.ke/sites/default/files/2019-11/PARK%20RULES.pdf' },
      { label: 'Current Kenya travel advice', organization: 'UK Foreign, Commonwealth & Development Office', url: 'https://www.gov.uk/foreign-travel-advice/kenya' },
    ],
  },
  money: {
    slug: 'money',
    eyebrow: 'Pay with confidence',
    title: 'Money in Kenya',
    summary: 'How to combine Kenyan shillings, cards and mobile money without relying on a single payment method.',
    quickAnswer: 'The Kenyan shilling (KES) is the local currency. Cards work at many hotels and established businesses, while cash and mobile money remain important for everyday retail. Carry more than one payment method.',
    updated: '26 July 2026',
    sections: [
      {
        title: 'What to carry',
        items: [
          'Carry a modest amount of Kenyan shillings in smaller denominations for markets, tips, rural stops and occasions when a terminal or network is unavailable.',
          'Bring at least two cards stored separately. Tell your bank you are travelling and confirm foreign-transaction and cash-withdrawal fees.',
          'Never exchange money with an unlicensed street dealer. Use banks, authorised foreign-exchange bureaus or reputable hotel services and keep the receipt.',
        ],
      },
      {
        title: 'Cards, ATMs and mobile money',
        items: [
          'Visa and Mastercard acceptance is common at larger urban and tourism businesses, but it is not universal.',
          'Use ATMs in controlled locations, shield your PIN and decline help from strangers. Check the amount and currency before authorising a card payment.',
          'M-PESA is deeply used in Kenya. Visitor access requires a properly registered local mobile account; confirm current identification and activation rules with the network provider.',
          'Mobile money transfers should display the recipient’s registered name before confirmation. Stop if the name or amount is wrong.',
        ],
      },
      {
        title: 'Prices, tipping and scams',
        items: [
          'Ask whether a quote includes taxes, park fees, transfers and service charges. Keep booking and payment confirmations.',
          'Tipping is discretionary unless a service charge is stated. Ask your operator for current, role-specific guidance rather than treating an online figure as a rule.',
          'Reject pressure to transfer money urgently, share a one-time code or move a transaction outside a trusted booking channel.',
        ],
      },
    ],
    checklist: ['Two separately stored cards', 'Small KES cash reserve', 'Bank travel notice completed', 'Daily withdrawal limits checked', 'Payment receipts saved', 'Emergency bank numbers offline'],
    sources: [
      { label: 'Kenyan banknotes and currency information', organization: 'Central Bank of Kenya', url: 'https://www.centralbank.go.ke/bank-notes-coins/' },
      { label: 'Directory of authorised payment providers', organization: 'Central Bank of Kenya', url: 'https://www.centralbank.go.ke/national-payments-system/payment-service-providers/' },
      { label: 'Prepay and mobile-service terms', organization: 'Safaricom', url: 'https://www.safaricom.co.ke/media-center-landing/terms-and-conditions/prepay-services' },
    ],
  },
  'getting-around': {
    slug: 'getting-around',
    eyebrow: 'Plan the transfer',
    title: 'Getting around Kenya',
    summary: 'Choose between rail, air, road and local transport based on distance, daylight and road conditions.',
    quickAnswer: 'For Nairobi–Mombasa, the Madaraka Express is a practical alternative to driving. Domestic flights save time on long safari or coastal routes. Pre-arranged transfers are the simplest choice at airports, rail termini and remote lodges.',
    updated: '26 July 2026',
    sections: [
      {
        title: 'Rail',
        items: [
          'Kenya Railways operates Madaraka Express passenger services on the Mombasa–Nairobi–Suswa corridor, with service patterns and stops that can change.',
          'Book only through Kenya Railways’ official ticket platform, a station counter or its published USSD channel. Match every passenger name to their identification.',
          'Nairobi and Mombasa termini are outside the city centres. Add a confirmed transfer and generous time for traffic and security checks.',
        ],
      },
      {
        title: 'Flights and safari transfers',
        items: [
          'Domestic flights connect Nairobi with the coast and multiple safari airstrips. Confirm which Nairobi airport—JKIA or Wilson—your flight uses.',
          'Small-aircraft baggage limits can be much lower than international airline limits and may require soft-sided bags. Check directly with the operator.',
          'Airstrip transfers are usually coordinated by the camp or lodge; do not assume they are included in the room rate.',
        ],
      },
      {
        title: 'Road transport',
        items: [
          'Use a licensed operator and agree on vehicle, inclusions, pickup point and emergency contact in writing.',
          'Avoid unnecessary night road travel. Journey time can change with traffic, weather, roadworks and wildlife.',
          'Long-distance buses and matatus serve extensive networks, but standards vary. Keep valuables with you and use established termini and operators.',
          'Ride-hailing is useful in supported cities. Verify the registration and driver in the app, share the trip and avoid accepting an unrecorded substitution.',
        ],
      },
      {
        title: 'Self-driving',
        items: [
          'Confirm licence, insurance, roadside support and cross-county restrictions with the rental company.',
          'For remote or park routes, ask about road conditions, fuel range, spare tyres, mobile coverage and whether four-wheel drive is required.',
          'Do not follow a navigation app onto an unverified shortcut. Use park gates and routes confirmed by KWS, your lodge or operator.',
        ],
      },
    ],
    checklist: ['Official tickets and passenger IDs', 'Terminal/airstrip transfer confirmed', 'Daylight travel plan', 'Operator emergency contact', 'Baggage limits checked', 'Offline route and accommodation pin'],
    sources: [
      { label: 'Passenger services', organization: 'Kenya Railways', url: 'https://krc.co.ke/services/' },
      { label: 'Official Madaraka Express ticketing', organization: 'Kenya Railways', url: 'https://metickets.krc.co.ke/' },
      { label: 'Conditions of carriage', organization: 'Kenya Railways', url: 'https://www.krc.co.ke/wp-content/uploads/2021/01/Madaraka-Express-Passenger-Service-Conditions-of-Carriage.pdf' },
      { label: 'Kenya airport information', organization: 'Kenya Airports Authority', url: 'https://www.kaa.go.ke/' },
    ],
  },
  'what-to-pack': {
    slug: 'what-to-pack',
    eyebrow: 'Pack by route',
    title: 'What to pack for Kenya',
    summary: 'A flexible list for safari mornings, warm coastlines, highland weather and changing rain.',
    quickAnswer: 'Pack breathable layers, a warm layer for early drives and highlands, sun protection, closed shoes, insect repellent and a reusable bottle. Check a destination-specific forecast immediately before departure.',
    updated: '26 July 2026',
    sections: [
      {
        title: 'Clothing',
        items: [
          'Choose lightweight, breathable tops and long trousers that can be layered. Neutral earth tones are practical for wildlife viewing.',
          'Add a fleece or light insulated layer for dawn drives, Nairobi evenings and higher elevations.',
          'Pack a lightweight waterproof shell during wet periods. Kenya’s rainfall and temperature vary sharply by region and altitude.',
          'Use comfortable closed shoes for bush walks and rough ground; pack sandals or water shoes only when your coastal activities need them.',
        ],
      },
      {
        title: 'Safari and day-bag essentials',
        items: [
          'Carry a brimmed hat, sunglasses, sunscreen, insect repellent, binoculars and a small torch.',
          'Use a refillable bottle. Single-use plastic is prohibited in Kenya’s protected areas.',
          'Bring a dust-resistant camera bag, spare memory, batteries and a power bank. Ask before photographing people.',
          'Keep medicine, documents, a layer and one change of clothes in hand luggage if your checked bag is delayed.',
        ],
      },
      {
        title: 'Coast, mountain and specialist trips',
        items: [
          'For the coast, add high-coverage sun protection, modest clothing for towns and cultural sites, and reef-conscious water gear.',
          'Mount Kenya and technical activities require operator-specified equipment; a general packing list is not a substitute for a guide’s safety list.',
          'For photography or drone use, confirm current permissions before travel. Protected areas and sensitive locations may restrict equipment.',
        ],
      },
      {
        title: 'Check the weather, not just the month',
        items: [
          'Kenya Meteorological Department identifies March–May as the principal long-rains period in much of Kenya and October–December as an important short-rains period, but timing and intensity vary.',
          'Review KMD’s daily and seasonal forecast for the counties you will visit. Weather can disrupt roads, flights and marine activities.',
        ],
      },
    ],
    checklist: ['Breathable layers', 'Warm layer and rain shell', 'Closed walking shoes', 'Hat, sunscreen and sunglasses', 'Insect repellent', 'Reusable bottle', 'Torch and power bank', 'Personal medicine and documents'],
    sources: [
      { label: 'Official safari packing advice', organization: 'Kenya Wildlife Service', url: 'https://kws.go.ke/faq-items/what-do-i-need-to-bring-along-for-a-safari-to-kenya-wildlife-service-parks-and-reserves/' },
      { label: 'Seasonal forecasts', organization: 'Kenya Meteorological Department', url: 'https://meteo.go.ke/our-products/seasonal-forecast/' },
      { label: 'Daily weather services', organization: 'Kenya Meteorological Department', url: 'https://meteo.go.ke/Services/weather-forecasting/' },
      { label: 'Official park rules', organization: 'Kenya Wildlife Service', url: 'https://www.kws.go.ke/sites/default/files/2019-11/PARK%20RULES.pdf' },
    ],
  },
  'travel-styles': {
    slug: 'travel-styles',
    eyebrow: 'Shape the journey',
    title: 'Choose your Kenya travel style',
    summary: 'Build a realistic trip around the people travelling, the pace they enjoy and the support they need.',
    quickAnswer: 'Start with pace and transfer tolerance—not a list of attractions. Safari, coast, city and highland routes can suit many travellers when accommodation, vehicle, activities and downtime are selected deliberately.',
    updated: '26 July 2026',
    sections: [
      {
        title: 'Families',
        items: [
          'Choose fewer bases and shorter transfer days. Confirm child-age policies for flights, rooms, park fees and game drives before paying.',
          'Ask about pool barriers, adjoining rooms, car seats, meal flexibility, malaria precautions and access to medical care.',
          'Private vehicles offer flexibility for breaks, but every passenger should have an appropriate seat and restraint.',
        ],
      },
      {
        title: 'Couples and celebrations',
        items: [
          'Combine one strong shared experience with unscheduled time rather than moving every night.',
          'Tell providers about dietary needs or a celebration, but verify what is included before assuming an upgrade or private activity.',
          'For a safari-and-beach trip, allow for the transfer between lodge, airstrip or rail terminus and coastal accommodation.',
        ],
      },
      {
        title: 'Solo travellers',
        items: [
          'Use properties and operators with verifiable contacts and recent reviews. Share daily movements and avoid isolated walking after dark.',
          'Ask whether rates include a single supplement and whether game drives are shared or private.',
          'Small-group departures can reduce cost and add company while retaining a structured, traceable itinerary.',
        ],
      },
      {
        title: 'Accessible travel',
        items: [
          'Accessibility varies significantly. Ask for measurements, surfaces and photographs rather than relying on the word “accessible”.',
          'Confirm step-free room access, bathroom layout, vehicle transfer method, wheelchair storage, pathways and backup power for medical equipment.',
          'Provide mobility, sensory, dietary or communication needs in writing and ask the operator to confirm each arrangement in writing.',
        ],
      },
      {
        title: 'Budget to luxury',
        items: [
          'Budget trips work best with fewer long transfers, public transport on suitable routes and stays outside premium park locations.',
          'Mid-range trips can prioritise a private transfer on difficult legs while using rail or shared drives elsewhere.',
          'Luxury should buy better pacing, location, guide quality and logistics—not just a room category. Always check park fees, airstrip transfers and activities separately.',
        ],
      },
    ],
    checklist: ['Preferred pace agreed', 'Maximum transfer time set', 'Room layout confirmed', 'Activity limits documented', 'Accessibility needs confirmed in writing', 'Inclusions and exclusions itemised'],
    sources: [
      { label: 'Kenya’s official tourism portal', organization: 'Kenya Tourism Board', url: 'https://magicalkenya.com/' },
      { label: 'Kenya tourism services and licensed providers', organization: 'Tourism Regulatory Authority', url: 'https://www.tourismauthority.go.ke/' },
      { label: 'Parks and visitor information', organization: 'Kenya Wildlife Service', url: 'https://www.kws.go.ke/' },
      { label: 'Tourism safety information', organization: 'Kenya National Tourism Service Portal', url: 'https://tourkenya.go.ke/tourism-safety/' },
    ],
  },
};
