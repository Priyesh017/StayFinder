import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting database seed...")

  // Create admin user
  const hashedAdminPassword = await bcrypt.hash("admin123", 12)
  const admin = await prisma.admin.upsert({
    where: { email: "admin@stayfinder.com" },
    update: {},
    create: {
      email: "admin@stayfinder.com",
      password: hashedAdminPassword,
      name: "Admin User",
      role: "SUPER_ADMIN",
    },
  })

  console.log("✅ Admin user created:", admin.email)

  // Create sample users
  const hashedPassword = await bcrypt.hash("password123", 12)

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: "john@example.com" },
      update: {},
      create: {
        email: "john@example.com",
        password: hashedPassword,
        firstName: "John",
        lastName: "Doe",
        phone: "+1234567890",
        isHost: true,
        isVerified: true,
      },
    }),
    prisma.user.upsert({
      where: { email: "sarah@example.com" },
      update: {},
      create: {
        email: "sarah@example.com",
        password: hashedPassword,
        firstName: "Sarah",
        lastName: "Johnson",
        phone: "+1234567891",
        isHost: true,
        isVerified: true,
      },
    }),
    prisma.user.upsert({
      where: { email: "mike@example.com" },
      update: {},
      create: {
        email: "mike@example.com",
        password: hashedPassword,
        firstName: "Mike",
        lastName: "Wilson",
        phone: "+1234567892",
        isHost: false,
        isVerified: true,
      },
    }),
  ])

  console.log("✅ Sample users created")

  // Create sample listings
  const listings = [
    {
      title: "Modern Loft in Downtown Manhattan",
      description:
        "Experience the heart of Manhattan in this stunning modern loft. Located in the vibrant downtown area, you'll be steps away from world-class dining, shopping, and entertainment. The space features floor-to-ceiling windows, modern amenities, and a prime location that puts you at the center of it all.",
      location: "New York, NY, USA",
      price: 120,
      type: "Entire apartment",
      guests: 4,
      bedrooms: 2,
      bathrooms: 2,
      amenities: ["WiFi", "Kitchen", "Parking", "Pool", "Gym", "Air conditioning"],
      highlights: ["Prime downtown location", "Floor-to-ceiling windows", "Modern amenities", "Close to subway"],
      category: "City",
      images: ["/placeholder.svg?height=300&width=400"],
      latitude: 40.7128,
      longitude: -74.006,
      hostId: users[0].id,
    },
    {
      title: "Cozy Beach House with Ocean Views",
      description:
        "Relax in this beautiful beachfront property with stunning ocean views and direct beach access. Perfect for a romantic getaway or family vacation. Wake up to the sound of waves and enjoy breathtaking sunsets from your private deck.",
      location: "Malibu, CA, USA",
      price: 250,
      type: "Entire house",
      guests: 6,
      bedrooms: 3,
      bathrooms: 2,
      amenities: ["WiFi", "Kitchen", "Beach access", "Hot tub", "Fireplace", "Ocean view"],
      highlights: ["Beachfront location", "Ocean views", "Private beach access", "Hot tub on deck"],
      category: "Beachfront",
      images: ["/placeholder.svg?height=300&width=400"],
      latitude: 34.0259,
      longitude: -118.7798,
      hostId: users[1].id,
    },
    {
      title: "Mountain Cabin Retreat",
      description:
        "Escape to this cozy mountain cabin surrounded by nature and perfect for outdoor enthusiasts. Located in the heart of Aspen, this cabin offers ski-in/ski-out access during winter and hiking trails during summer.",
      location: "Aspen, CO, USA",
      price: 180,
      type: "Entire cabin",
      guests: 8,
      bedrooms: 4,
      bathrooms: 3,
      amenities: ["WiFi", "Kitchen", "Fireplace", "Ski access", "Hot tub", "Mountain view"],
      highlights: ["Mountain views", "Ski-in/ski-out", "Fireplace", "Hot tub"],
      category: "Cabins",
      images: ["/placeholder.svg?height=300&width=400"],
      latitude: 39.1911,
      longitude: -106.8175,
      hostId: users[0].id,
    },
    {
      title: "Urban Studio in San Francisco",
      description:
        "Perfect for solo travelers or couples, this modern studio is located in the heart of San Francisco. Walking distance to major attractions, restaurants, and public transportation.",
      location: "San Francisco, CA, USA",
      price: 95,
      type: "Entire studio",
      guests: 2,
      bedrooms: 1,
      bathrooms: 1,
      amenities: ["WiFi", "Kitchen", "Gym", "Rooftop", "Air conditioning"],
      highlights: ["City center location", "Modern amenities", "Rooftop access", "Walking distance to attractions"],
      category: "City",
      images: ["/placeholder.svg?height=300&width=400"],
      latitude: 37.7749,
      longitude: -122.4194,
      hostId: users[1].id,
    },
    {
      title: "Luxury Villa with Private Pool",
      description:
        "Indulge in luxury at this stunning villa featuring a private pool and breathtaking ocean views. Perfect for special occasions and group getaways.",
      location: "Miami, FL, USA",
      price: 350,
      type: "Entire villa",
      guests: 10,
      bedrooms: 5,
      bathrooms: 4,
      amenities: ["WiFi", "Kitchen", "Pool", "Ocean view", "Hot tub", "Garden"],
      highlights: ["Private pool", "Ocean views", "Luxury amenities", "Large garden"],
      category: "Luxury",
      images: ["/placeholder.svg?height=300&width=400"],
      latitude: 25.7617,
      longitude: -80.1918,
      hostId: users[0].id,
    },
  ]

  const createdListings = await Promise.all(
    listings.map((listing) =>
      prisma.listing.create({
        data: listing,
      }),
    ),
  )

  console.log("✅ Sample listings created")

  // Create sample bookings
  const bookings = [
    {
      userId: users[2].id,
      listingId: createdListings[0].id,
      checkIn: new Date("2024-02-15"),
      checkOut: new Date("2024-02-20"),
      guests: 2,
      totalPrice: 600,
      status: "CONFIRMED" as const,
    },
    {
      userId: users[2].id,
      listingId: createdListings[1].id,
      checkIn: new Date("2024-03-10"),
      checkOut: new Date("2024-03-15"),
      guests: 4,
      totalPrice: 1250,
      status: "PENDING" as const,
    },
  ]

  const createdBookings = await Promise.all(
    bookings.map((booking) =>
      prisma.booking.create({
        data: booking,
      }),
    ),
  )

  console.log("✅ Sample bookings created")

  // Create sample reviews
  const reviews = [
    {
      userId: users[2].id,
      listingId: createdListings[0].id,
      rating: 5,
      comment:
        "Amazing stay! The location was perfect and the host was very responsive. Would definitely recommend this place to anyone visiting the area.",
    },
    {
      userId: users[2].id,
      listingId: createdListings[1].id,
      rating: 4,
      comment:
        "Beautiful beach house with stunning views. The only minor issue was the WiFi speed, but overall a fantastic experience.",
    },
  ]

  await Promise.all(
    reviews.map((review) =>
      prisma.review.create({
        data: review,
      }),
    ),
  )

  // Update listing ratings
  for (const listing of createdListings) {
    const listingReviews = await prisma.review.findMany({
      where: { listingId: listing.id },
    })

    if (listingReviews.length > 0) {
      const averageRating = listingReviews.reduce((sum, review) => sum + review.rating, 0) / listingReviews.length
      await prisma.listing.update({
        where: { id: listing.id },
        data: {
          rating: Math.round(averageRating * 10) / 10,
          reviewCount: listingReviews.length,
        },
      })
    }
  }

  console.log("✅ Sample reviews created and ratings updated")

  // Create sample favorites
  await prisma.favorite.create({
    data: {
      userId: users[2].id,
      listingId: createdListings[2].id,
    },
  })

  console.log("✅ Sample favorites created")

  console.log("🎉 Database seeded successfully!")
  console.log("\n📋 Sample credentials:")
  console.log("Admin: admin@stayfinder.com / admin123")
  console.log("Host: john@example.com / password123")
  console.log("Host: sarah@example.com / password123")
  console.log("User: mike@example.com / password123")
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
