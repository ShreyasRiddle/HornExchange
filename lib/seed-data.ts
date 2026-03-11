import { Message, Neighborhood, ServiceListing } from "@/lib/types";

function avatar(seed: string) {
  return `https://api.dicebear.com/8.x/thumbs/svg?seed=${encodeURIComponent(seed)}`;
}

function photo(seed: string) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/720/480`;
}

const baseListings: ServiceListing[] = [
  {
    id: "alex-fades",
    providerName: "Alex Reed",
    serviceTitle: "West Campus Fade Lab",
    category: "Haircuts",
    price: 22,
    priceUnit: "per cut",
    neighborhood: "West Campus",
    availability: ["Tonight", "This Week", "Weekends"],
    responseTime: "Usually replies in 8 min",
    bio: "Finance junior cutting fades and tapers since freshman year.",
    description:
      "Affordable fades, trims, and lineups for UT students. Great for evening cuts before org events.",
    tags: ["fades", "lineup", "game day", "evenings"],
    photos: [photo("alex-1"), photo("alex-2"), photo("alex-3")],
    trustScore: 93,
    rating: 4.9,
    reviewCount: 41,
    completedJobs: 118,
    vibe: "Polished",
    recentMomentum: "Booked 7 students this week",
    schedule: ["Tonight 7:00 PM", "Tonight 8:15 PM", "Tomorrow 6:30 PM"],
    reviews: [
      {
        author: "Jalen",
        rating: 5,
        quote: "Quick, clean fade before formal. Super easy pickup in West Campus.",
        avatarUrl: avatar("Jalen"),
      },
      {
        author: "Marco",
        rating: 5,
        quote: "Best campus haircut under 25 bucks.",
        avatarUrl: avatar("Marco"),
      },
      {
        author: "Ethan",
        rating: 4.8,
        quote: "Consistent and actually on time.",
        avatarUrl: avatar("Ethan"),
      },
    ],
  },
  {
    id: "maya-braids",
    providerName: "Maya Turner",
    serviceTitle: "Formal-Ready Braids",
    category: "Braiding",
    price: 35,
    priceUnit: "per style",
    neighborhood: "North Campus",
    availability: ["Tomorrow", "This Week", "Weekends"],
    responseTime: "Usually replies in 14 min",
    bio: "Studio art senior known for event braids and natural hair styling.",
    description:
      "Protective styles, braid touch-ups, and event-ready looks with a low-stress appointment flow.",
    tags: ["braids", "formal", "protective styles", "events"],
    photos: [photo("maya-1"), photo("maya-2"), photo("maya-3")],
    trustScore: 95,
    rating: 5,
    reviewCount: 29,
    completedJobs: 72,
    vibe: "Premium",
    recentMomentum: "Most saved stylist before spring formals",
    schedule: ["Tomorrow 5:30 PM", "Thursday 4:00 PM", "Saturday 1:00 PM"],
    reviews: [
      {
        author: "Kyla",
        rating: 5,
        quote: "Maya literally saved my formal look.",
        avatarUrl: avatar("Kyla"),
      },
      {
        author: "Amara",
        rating: 5,
        quote: "Warm, detailed, and super professional.",
        avatarUrl: avatar("Amara"),
      },
      {
        author: "Sydney",
        rating: 4.9,
        quote: "Worth it if you want a polished style that lasts.",
        avatarUrl: avatar("Sydney"),
      },
    ],
  },
  {
    id: "rishi-calc",
    providerName: "Rishi Parker",
    serviceTitle: "Calc and Physics Rescue Sessions",
    category: "Tutoring",
    price: 28,
    priceUnit: "per hour",
    neighborhood: "Guadalupe",
    availability: ["Tonight", "Tomorrow", "This Week"],
    responseTime: "Usually replies in 5 min",
    bio: "ECE senior with a reputation for getting people unstuck before exams.",
    description:
      "Fast-paced tutoring for calc, physics, and intro engineering classes.",
    tags: ["calc", "physics", "exam prep", "PCL"],
    photos: [photo("rishi-1"), photo("rishi-2"), photo("rishi-3")],
    trustScore: 90,
    rating: 4.8,
    reviewCount: 57,
    completedJobs: 140,
    vibe: "Casual",
    recentMomentum: "Heavy exam-week demand",
    schedule: ["Tonight 9:00 PM", "Tomorrow 1:00 PM", "Friday 3:00 PM"],
    reviews: [
      {
        author: "Naomi",
        rating: 5,
        quote: "Explains things like an older student, not a professor.",
        avatarUrl: avatar("Naomi"),
      },
      {
        author: "Derek",
        rating: 4.8,
        quote: "Saved me before my midterm.",
        avatarUrl: avatar("Derek"),
      },
      {
        author: "Aisha",
        rating: 4.7,
        quote: "Really good if you need someone close to campus fast.",
        avatarUrl: avatar("Aisha"),
      },
    ],
  },
  {
    id: "lucia-headshots",
    providerName: "Lucia Morales",
    serviceTitle: "Org Headshots and Grad Photos",
    category: "Photography",
    price: 45,
    priceUnit: "per shoot",
    neighborhood: "Downtown Austin",
    availability: ["This Week", "Weekends", "Flexible"],
    responseTime: "Usually replies in 20 min",
    bio: "Advertising major with warm editorial style and fast edits.",
    description:
      "Portraits, org headshots, graduation shots, and creator photos with polished lighting.",
    tags: ["headshots", "grad", "portraits", "org photos"],
    photos: [photo("lucia-1"), photo("lucia-2"), photo("lucia-3")],
    trustScore: 88,
    rating: 4.9,
    reviewCount: 25,
    completedJobs: 61,
    vibe: "Premium",
    recentMomentum: "Popular with org exec boards",
    schedule: ["Friday 5:00 PM", "Saturday 10:00 AM", "Sunday 2:30 PM"],
    reviews: [
      {
        author: "Bella",
        rating: 5,
        quote: "My LinkedIn finally looks polished.",
        avatarUrl: avatar("Bella"),
      },
      {
        author: "Chris",
        rating: 4.9,
        quote: "Great communication and fast edits.",
        avatarUrl: avatar("Chris"),
      },
      {
        author: "Aarav",
        rating: 4.8,
        quote: "Worth the spend for polished photos.",
        avatarUrl: avatar("Aarav"),
      },
    ],
  },
  {
    id: "zoe-resume",
    providerName: "Zoe Cruz",
    serviceTitle: "Resume Rescue for Intern Season",
    category: "Resume Review",
    price: 18,
    priceUnit: "per session",
    neighborhood: "West Campus",
    availability: ["Tonight", "Tomorrow", "Flexible"],
    responseTime: "Usually replies in 3 min",
    bio: "McCombs senior helping students tighten resumes before recruiting.",
    description:
      "Sharp edits, bullet rewrites, and quick feedback for internship and org applications.",
    tags: ["resume", "internships", "McCombs", "quick turnaround"],
    photos: [photo("zoe-1"), photo("zoe-2"), photo("zoe-3")],
    trustScore: 91,
    rating: 4.9,
    reviewCount: 38,
    completedJobs: 110,
    vibe: "Polished",
    recentMomentum: "Popular during recruiting deadlines",
    schedule: ["Tonight 8:30 PM", "Tomorrow 11:00 AM", "Tomorrow 7:00 PM"],
    reviews: [
      {
        author: "Priya",
        rating: 5,
        quote: "Got way more interviews after Zoe cleaned up my resume.",
        avatarUrl: avatar("Priya"),
      },
      {
        author: "Luis",
        rating: 4.8,
        quote: "Fastest turnaround I found near campus.",
        avatarUrl: avatar("Luis"),
      },
      {
        author: "Mei",
        rating: 5,
        quote: "Actually useful feedback, not vague fluff.",
        avatarUrl: avatar("Mei"),
      },
    ],
  },
  {
    id: "trent-moveout",
    providerName: "Trent Walker",
    serviceTitle: "West Campus Move-Out Muscle",
    category: "Moving Help",
    price: 30,
    priceUnit: "per hour",
    neighborhood: "West Campus",
    availability: ["This Week", "Weekends", "Flexible"],
    responseTime: "Usually replies in 11 min",
    bio: "Kinesiology junior with a truck and flexible weekend schedule.",
    description:
      "Move-out lifting help, furniture pickup, and apartment-to-storage runs around West Campus.",
    tags: ["moving", "truck", "storage", "move-out"],
    photos: [photo("trent-1"), photo("trent-2"), photo("trent-3")],
    trustScore: 87,
    rating: 4.7,
    reviewCount: 21,
    completedJobs: 54,
    vibe: "Casual",
    recentMomentum: "Most booked during lease turnover",
    schedule: ["Thursday 6:00 PM", "Saturday 9:00 AM", "Sunday 12:00 PM"],
    reviews: [
      {
        author: "Nina",
        rating: 4.8,
        quote: "Made move-out so much less awful.",
        avatarUrl: avatar("Nina"),
      },
      {
        author: "Sam",
        rating: 4.7,
        quote: "Good value if you need someone reliable.",
        avatarUrl: avatar("Sam"),
      },
      {
        author: "Eli",
        rating: 4.6,
        quote: "Communicative and easy to coordinate with.",
        avatarUrl: avatar("Eli"),
      },
    ],
  },
];

const neighborhoodCycle: Neighborhood[] = [
  "West Campus",
  "North Campus",
  "Guadalupe",
  "Riverside",
  "Downtown Austin",
];

const providerSurnames = [
  "Reed",
  "Turner",
  "Parker",
  "Sullivan",
  "Cruz",
  "Bennett",
  "Walker",
  "Hayes",
  "Miller",
  "Collins",
  "Hughes",
  "Powell",
  "Foster",
  "Morales",
  "Brooks",
  "Ramirez",
  "Price",
  "Howard",
  "Ward",
  "Caldwell",
  "Jensen",
  "Vargas",
  "Barrett",
  "Nolan",
  "Torres",
  "Ellis",
  "Mendoza",
  "Reynolds",
  "Knight",
  "Sinclair",
];

const providerFirstNameBases = [
  "Avery",
  "Blake",
  "Cameron",
  "Dakota",
  "Emerson",
  "Finley",
  "Gray",
  "Harper",
  "Indigo",
  "Jordan",
  "Kendall",
  "Logan",
  "Morgan",
  "Nico",
  "Oakley",
  "Peyton",
  "Quincy",
  "Reese",
  "Sawyer",
  "Taylor",
  "Urban",
  "Vale",
  "Winter",
  "Xen",
  "Yael",
  "Zuri",
  "Arden",
  "Briar",
  "Cleo",
  "Devon",
];

const providerFirstNameCompounds = ["Rose", "Lee", "Mae", "Kai", "Noel", "Jude"];

const titlePatterns: Record<ServiceListing["category"], { prefix: string[]; suffix: string[] }> = {
  Haircuts: {
    prefix: ["Campus", "Precision", "Game-Day", "Quick", "Evening", "Classic"],
    suffix: ["Fade Studio", "Lineup Session", "Taper Cut", "Trim Appointment", "Barber Service"],
  },
  Braiding: {
    prefix: ["Formal", "Protective", "Signature", "Weekend", "Event", "Natural"],
    suffix: ["Braid Styling", "Twist Refresh", "Knotless Setup", "Detail Session", "Braids Appointment"],
  },
  Tutoring: {
    prefix: ["Exam", "Concept", "Rapid", "Office-Hours", "Problem-Solving", "Midterm"],
    suffix: ["Calc Coaching", "Physics Review", "STEM Prep", "Homework Lab", "Tutoring Session"],
  },
  Photography: {
    prefix: ["Portrait", "Sunset", "Editorial", "Grad", "Org", "LinkedIn"],
    suffix: ["Photo Session", "Headshot Shoot", "Campus Portraits", "Branding Shoot", "Photo Package"],
  },
  "Resume Review": {
    prefix: ["Recruiting", "Interview", "Internship", "Career-Fair", "Application", "Consulting"],
    suffix: ["Resume Review", "Bullet Rewrite", "Resume Tune-Up", "ATS Cleanup", "Resume Session"],
  },
  "Moving Help": {
    prefix: ["Move-Out", "Weekend", "Heavy-Lift", "Apartment", "Storage", "Fast"],
    suffix: ["Moving Crew", "Truck Assist", "Move Support", "Furniture Haul", "Relocation Help"],
  },
};

function buildServiceTitle(base: ServiceListing, iteration: number) {
  const pattern = titlePatterns[base.category];
  const prefix = pattern.prefix[iteration % pattern.prefix.length];
  const suffix = pattern.suffix[Math.floor(iteration / pattern.prefix.length) % pattern.suffix.length];
  return `${prefix} ${suffix}`;
}

function buildProviderFirstName(globalIndex: number) {
  const base = providerFirstNameBases[globalIndex % providerFirstNameBases.length];
  const compound =
    providerFirstNameCompounds[
      Math.floor(globalIndex / providerFirstNameBases.length) % providerFirstNameCompounds.length
    ];
  return `${base}${compound}`;
}

function cloneListing(base: ServiceListing, iteration: number, baseIndex: number, globalIndex: number): ServiceListing {
  const nameSeed = `${base.providerName}-${iteration}`;
  const neighborhood = neighborhoodCycle[iteration % neighborhoodCycle.length];
  const priceDelta = (iteration % 5) - 2;
  const trustDelta = (iteration % 6) - 3;
  const ratingDelta = ((iteration % 4) - 2) * 0.1;
  const firstName = buildProviderFirstName(globalIndex);
  const surnameIndex = (iteration + baseIndex * 7) % providerSurnames.length;

  return {
    ...base,
    id: `${base.id}-${iteration}`,
    providerName: `${firstName} ${providerSurnames[surnameIndex]}`,
    serviceTitle: buildServiceTitle(base, iteration),
    neighborhood,
    price: Math.max(10, base.price + priceDelta),
    trustScore: Math.max(78, Math.min(99, base.trustScore + trustDelta)),
    rating: Number(Math.max(4.2, Math.min(5, base.rating + ratingDelta)).toFixed(1)),
    reviewCount: base.reviewCount + (iteration % 19),
    completedJobs: base.completedJobs + iteration * 2,
    recentMomentum: `${base.recentMomentum} · ${iteration + 2} new saves`,
    photos: [photo(`${nameSeed}-1`), photo(`${nameSeed}-2`), photo(`${nameSeed}-3`)],
    reviews: base.reviews.map((review, reviewIndex) => ({
      ...review,
      author: `${review.author.split(" ")[0]} ${reviewIndex + 1 + iteration}`,
      avatarUrl: avatar(`${review.author}-${iteration}-${reviewIndex}`),
    })),
    schedule: base.schedule.map((slot, idx) =>
      idx === 0 ? slot : `${slot.split(" ")[0]} ${5 + ((iteration + idx) % 7)}:${((iteration + idx) % 2) ? "30" : "00"} PM`,
    ),
    tags: [...base.tags, neighborhood.toLowerCase()],
  };
}

const generatedListings: ServiceListing[] = [];
for (let iteration = 0; iteration < 30; iteration += 1) {
  for (const [baseIndex, listing] of baseListings.entries()) {
    const globalIndex = iteration * baseListings.length + baseIndex;
    generatedListings.push(cloneListing(listing, iteration, baseIndex, globalIndex));
  }
}

function assertUnique(listings: ServiceListing[]) {
  const providerFirstNameSet = new Set<string>();
  const providerNameSet = new Set<string>();
  const serviceTitleSet = new Set<string>();
  for (const listing of listings) {
    const [firstName] = listing.providerName.split(" ");
    if (providerFirstNameSet.has(firstName)) {
      throw new Error(`Duplicate provider first name generated: ${firstName}`);
    }
    providerFirstNameSet.add(firstName);
    if (providerNameSet.has(listing.providerName)) {
      throw new Error(`Duplicate providerName generated: ${listing.providerName}`);
    }
    providerNameSet.add(listing.providerName);
    if (serviceTitleSet.has(listing.serviceTitle)) {
      throw new Error(`Duplicate serviceTitle generated: ${listing.serviceTitle}`);
    }
    serviceTitleSet.add(listing.serviceTitle);
  }
}

assertUnique(generatedListings);

export const serviceListings: ServiceListing[] = generatedListings;

export const starterThreads: Record<string, Message[]> = {
  [serviceListings[0].id]: [
    {
      id: "seed-1",
      listingId: serviceListings[0].id,
      sender: "seller",
      body: "Hey! I’ve got evening slots open. Want me to lock one in for you?",
      timestamp: "6:08 PM",
    },
  ],
  [serviceListings[1].id]: [
    {
      id: "seed-2",
      listingId: serviceListings[1].id,
      sender: "seller",
      body: "Happy to help. Tell me your preferred style and timing.",
      timestamp: "4:42 PM",
    },
  ],
};
