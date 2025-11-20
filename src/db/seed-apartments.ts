import { db } from "./index";
import { apartments } from "./schema";

// Function to get random rating between 1 and 5
const getRandomRating = () => Math.floor(Math.random() * 5) + 1;

const mockApartments = [
  {
    title: "Modern Studio in City Center",
    description:
      "A beautiful modern studio apartment in the heart of the city. Recently renovated with high-end appliances and furnishings. Walking distance to shops, restaurants, and public transport.",
    price: "850.00",
    location: "Downtown",
    bedrooms: 1,
    bathrooms: 1,
    area: 45,
    rating: getRandomRating(),
    imageUrl:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
    available: true,
  },
  {
    title: "Spacious 2BR Near University",
    description:
      "Perfect for students or young professionals. This spacious 2-bedroom apartment features a large living room, modern kitchen, and is located near the university campus.",
    price: "1200.00",
    location: "University District",
    bedrooms: 2,
    bathrooms: 1,
    area: 75,
    rating: getRandomRating(),
    imageUrl:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
    available: true,
  },
  {
    title: "Luxury Penthouse with View",
    description:
      "Stunning penthouse apartment with panoramic city views. Features include marble bathrooms, a gourmet kitchen, and a private terrace. Premium location in the financial district.",
    price: "2500.00",
    location: "Financial District",
    bedrooms: 3,
    bathrooms: 2,
    area: 150,
    rating: getRandomRating(),
    imageUrl:
      "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800",
    available: true,
  },
  {
    title: "Cozy 1BR in Quiet Neighborhood",
    description:
      "Charming one-bedroom apartment in a peaceful residential area. Perfect for those seeking tranquility while still being close to the city. Includes parking space.",
    price: "950.00",
    location: "Suburbs",
    bedrooms: 1,
    bathrooms: 1,
    area: 55,
    rating: getRandomRating(),
    imageUrl:
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800",
    available: true,
  },
  {
    title: "Family-Friendly 3BR Apartment",
    description:
      "Spacious 3-bedroom apartment ideal for families. Located near schools and parks. Features a large balcony, storage room, and two parking spaces.",
    price: "1800.00",
    location: "Residential Area",
    bedrooms: 3,
    bathrooms: 2,
    area: 120,
    rating: getRandomRating(),
    imageUrl:
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800",
    available: true,
  },
  {
    title: "Affordable Studio for Students",
    description:
      "Budget-friendly studio apartment perfect for students. Compact but efficient layout with all necessary amenities. Close to public transportation.",
    price: "650.00",
    location: "University District",
    bedrooms: 1,
    bathrooms: 1,
    area: 30,
    rating: getRandomRating(),
    imageUrl:
      "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800",
    available: true,
  },
  {
    title: "Modern Loft in Arts District",
    description:
      "Industrial-style loft with high ceilings and exposed brick. Open floor plan perfect for creative professionals. Located in the trendy arts district.",
    price: "1500.00",
    location: "Arts District",
    bedrooms: 2,
    bathrooms: 1,
    area: 90,
    rating: getRandomRating(),
    imageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
    available: true,
  },
  {
    title: "Waterfront 2BR with Balcony",
    description:
      "Beautiful apartment with waterfront views and a spacious balcony. Enjoy sunsets from your living room. Building includes gym and pool facilities.",
    price: "1900.00",
    location: "Waterfront",
    bedrooms: 2,
    bathrooms: 2,
    area: 85,
    rating: getRandomRating(),
    imageUrl:
      "https://images.unsplash.com/photo-1515263487990-61b07816b324?w=800",
    available: true,
  },
  {
    title: "Compact Studio - Great Value",
    description:
      "Efficient studio apartment with smart storage solutions. Perfect for minimalists or those just starting out. Includes all utilities.",
    price: "700.00",
    location: "Downtown",
    bedrooms: 1,
    bathrooms: 1,
    area: 35,
    rating: getRandomRating(),
    imageUrl:
      "https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800",
    available: true,
  },
  {
    title: "Renovated 2BR with Parking",
    description:
      "Newly renovated two-bedroom apartment with modern finishes throughout. Includes underground parking and storage locker. Pet-friendly building.",
    price: "1350.00",
    location: "Midtown",
    bedrooms: 2,
    bathrooms: 1,
    area: 80,
    rating: getRandomRating(),
    imageUrl:
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800",
    available: true,
  },
  {
    title: "Executive 3BR with Office",
    description:
      "Spacious executive apartment featuring 3 bedrooms plus a dedicated home office. Perfect for remote workers. Premium amenities and concierge service.",
    price: "2200.00",
    location: "Business District",
    bedrooms: 3,
    bathrooms: 2,
    area: 140,
    rating: getRandomRating(),
    imageUrl:
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
    available: true,
  },
  {
    title: "Garden-Level 1BR",
    description:
      "Charming garden-level apartment with private patio. Direct access to shared garden space. Quiet and peaceful setting.",
    price: "1050.00",
    location: "Garden District",
    bedrooms: 1,
    bathrooms: 1,
    area: 60,
    rating: getRandomRating(),
    imageUrl:
      "https://images.unsplash.com/photo-1486304873000-235643847519?w=800",
    available: true,
  },
];

async function seedApartments() {
  try {
    console.log("🏢 Starting apartments seeding...");

    // Delete existing apartments
    console.log("🗑️  Deleting existing apartments...");
    await db.delete(apartments);

    // Insert all mock apartments
    await db.insert(apartments).values(mockApartments);

    console.log(`✅ Successfully seeded ${mockApartments.length} apartments!`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding apartments:", error);
    process.exit(1);
  }
}

seedApartments();
