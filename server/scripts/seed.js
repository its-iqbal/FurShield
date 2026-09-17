/**
 * scripts/seed.js
 * Comprehensive seed script for FurShield:
 * - 3 Role Accounts (petOwner, veterinarian, shelter)
 * - Pets (Rocky & Luna for owner)
 * - Health Records (Vaccination, Exam, Labs, Rx)
 * - Products across categories with images & stock
 * - Care Articles (Articles, Video, FAQ)
 * - Shelter Adoption Listings
 * - Active Appointment
 * - In-app Notifications
 *
 * Run with: npm run seed (or node scripts/seed.js)
 */
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import {
  User,
  Pet,
  HealthRecord,
  Product,
  CareArticle,
  AdoptionListing,
  Appointment,
  Notification,
} from '../models/index.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/furshield';

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('🐾 Connected to MongoDB:', MONGO_URI);

  // ── 1. USERS ──────────────────────────────────────────────────────────────
  const SEED_USERS = [
    {
      name: 'Aryan Mehta',
      email: 'owner@furshield.dev',
      plainPassword: 'Owner@1234',
      role: 'petOwner',
      phone: '+91 98100 11111',
      bio: 'Proud dog dad of two golden retrievers. Passionate animal lover.',
      address: { street: '12 Linking Road, Bandra West', city: 'Mumbai', state: 'Maharashtra', country: 'India', zip: '400050' },
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    },
    {
      name: 'Dr. Priya Sharma',
      email: 'vet@furshield.dev',
      plainPassword: 'Vet@1234',
      role: 'veterinarian',
      phone: '+91 98100 22222',
      specialization: 'Small Animal Medicine & Surgery',
      experience: 8,
      clinicName: 'PawsCare Veterinary Clinic',
      clinicAddress: { street: '14, MG Road, Ashok Nagar', city: 'Bengaluru', state: 'Karnataka', country: 'India', zip: '560001' },
      bio: 'Gold medalist veterinary physician specializing in preventive canine & feline care.',
      address: { street: '14, MG Road', city: 'Bengaluru', state: 'Karnataka', country: 'India', zip: '560001' },
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&auto=format&fit=crop&q=80',
      availableSlots: [
        { day: 'Monday', startTime: '09:00', endTime: '17:00' },
        { day: 'Tuesday', startTime: '09:00', endTime: '17:00' },
        { day: 'Wednesday', startTime: '10:00', endTime: '16:00' },
        { day: 'Thursday', startTime: '09:00', endTime: '17:00' },
        { day: 'Friday', startTime: '09:00', endTime: '15:00' },
        { day: 'Saturday', startTime: '10:00', endTime: '13:00' },
      ],
    },
    {
      name: 'Happy Paws Shelter',
      email: 'shelter@furshield.dev',
      plainPassword: 'Shelter@1234',
      role: 'shelter',
      phone: '+91 98100 33333',
      shelterName: 'Happy Paws Animal Shelter',
      contactPerson: 'Sunil Rao',
      website: 'https://happypaws.org.in',
      bio: 'A compassionate no-kill animal shelter dedicated to rescue, medical rehab, and forever-home adoptions.',
      address: { street: 'Survey No. 45, Koregaon Park', city: 'Pune', state: 'Maharashtra', country: 'India', zip: '411001' },
      avatar: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=300&auto=format&fit=crop&q=80',
    },
  ];

  const userMap = {};
  for (const u of SEED_USERS) {
    let user = await User.findOne({ email: u.email });
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(u.plainPassword, salt);
    if (!user) {
      const { plainPassword, ...rest } = u;
      user = await User.create({ ...rest, passwordHash });
      console.log(`✅ Created user [${u.role}]: ${u.email}`);
    } else {
      user.passwordHash = passwordHash;
      if (u.availableSlots) user.availableSlots = u.availableSlots;
      await user.save();
      console.log(`🔄 Updated user [${u.role}]: ${u.email}`);
    }
    userMap[u.role] = user;
  }

  // ── 2. PETS (for Owner) ───────────────────────────────────────────────────
  let rocky = await Pet.findOne({ name: 'Rocky', owner: userMap.petOwner._id });
  if (!rocky) {
    rocky = await Pet.create({
      owner: userMap.petOwner._id,
      name: 'Rocky',
      species: 'dog',
      breed: 'Golden Retriever',
      age: 3,
      gender: 'male',
      weight: 31.5,
      color: 'Golden',
      microchipId: '985141002341982',
      isNeutered: true,
      allergies: ['Chicken meal', 'Flea bites'],
      medicalHistory: 'Mild seasonal contact dermatitis in monsoons. Otherwise vibrant and healthy.',
      images: ['https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&auto=format&fit=crop&q=80'],
      insurance: {
        provider: 'Bajaj Allianz Pet Care',
        policyNumber: 'PET-2024-998877',
        coverageType: 'Comprehensive Health & Surgery',
        expiryDate: new Date('2026-12-31'),
      },
    });
    console.log('✅ Created Pet: Rocky');
  }

  let luna = await Pet.findOne({ name: 'Luna', owner: userMap.petOwner._id });
  if (!luna) {
    luna = await Pet.create({
      owner: userMap.petOwner._id,
      name: 'Luna',
      species: 'cat',
      breed: 'Persian Longhair',
      age: 2,
      gender: 'female',
      weight: 4.1,
      color: 'White & Cream',
      microchipId: '985141002341999',
      isNeutered: true,
      allergies: [],
      medicalHistory: 'Indoor only. Regular fur grooming required.',
      images: ['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format&fit=crop&q=80'],
    });
    console.log('✅ Created Pet: Luna');
  }

  // ── 3. HEALTH RECORDS (for Rocky) ─────────────────────────────────────────
  const existingRecordCount = await HealthRecord.countDocuments({ pet: rocky._id });
  if (existingRecordCount === 0) {
    await HealthRecord.create([
      {
        pet: rocky._id,
        owner: userMap.petOwner._id,
        vet: userMap.veterinarian._id,
        visitDate: new Date('2026-03-10'),
        visitType: 'vaccination',
        symptoms: ['Annual routine visit'],
        diagnosis: 'Annual booster & general health check. Heart, lungs, coat healthy.',
        treatment: 'Administered 7-in-1 DHPP booster and Anti-Rabies injection. No adverse reaction observed.',
        vaccinations: [
          {
            vaccineName: 'Nobivac DHPPi Booster',
            givenDate: new Date('2026-03-10'),
            nextDueDate: new Date('2027-03-10'),
            batchNumber: 'NV-2026-0881',
          },
          {
            vaccineName: 'Rabies (Rabisin)',
            givenDate: new Date('2026-03-10'),
            nextDueDate: new Date('2027-03-10'),
            batchNumber: 'RB-9921',
          },
        ],
        prescriptions: [
          {
            medication: 'NexGard Chewable (Flea & Tick)',
            dosage: '1 tablet monthly',
            duration: '3 months',
            notes: 'Administer with breakfast',
          },
        ],
        addedBy: 'veterinarian',
      },
      {
        pet: rocky._id,
        owner: userMap.petOwner._id,
        vet: userMap.veterinarian._id,
        visitDate: new Date('2026-07-22'),
        visitType: 'checkup',
        symptoms: ['Mild tartar check'],
        diagnosis: 'Routine 6-month wellness evaluation. Mild tartar grade 1.',
        treatment: 'Recommended dental water additive and chew bones. Stool analysis negative for parasites.',
        prescriptions: [
          {
            medication: 'Enzymatic Toothpaste & Finger Brush',
            dosage: 'Brush twice weekly',
            duration: 'Ongoing',
            notes: 'Poultry flavor preferred',
          },
        ],
        labResults: [
          {
            testName: 'Complete Blood Count (CBC) & Stool Screening',
            result: 'All parameters within normal reference ranges. Hemoglobin 16.2 g/dL.',
            testedOn: new Date('2026-07-22'),
          },
        ],
        addedBy: 'veterinarian',
      },
    ]);
    console.log('✅ Created Health Records for Rocky');
  }

  // ── 4. PRODUCTS (Pet Shop) ─────────────────────────────────────────────────
  const existingProducts = await Product.countDocuments();
  if (existingProducts === 0) {
    await Product.create([
      {
        name: 'Royal Canin Maxi Adult Dry Dog Food (15 kg)',
        brand: 'Royal Canin',
        category: 'food',
        petTypes: ['dog'],
        price: 7400,
        discountPrice: 6599,
        stockQuantity: 28,
        description: 'Specially formulated for adult large dogs (26–44 kg). High digestibility with optimal dietary fiber and joint support.',
        tags: ['premium', 'large-breed', 'vet-recommended'],
        images: ['https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=600&auto=format&fit=crop&q=80'],
        averageRating: 4.8,
        numReviews: 42,
      },
      {
        name: 'FurShield Organic Herbal Anti-Tick & Flea Shampoo (500 ml)',
        brand: 'FurShield Care',
        category: 'grooming',
        petTypes: ['dog', 'cat'],
        price: 549,
        discountPrice: 429,
        stockQuantity: 95,
        description: 'Infused with Neem, Lemongrass, and Tea Tree oil. Paraben-free, pH-balanced formula that repels ticks and fleas safely.',
        tags: ['organic', 'anti-tick', 'herbal'],
        images: ['https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600&auto=format&fit=crop&q=80'],
        averageRating: 4.9,
        numReviews: 76,
      },
      {
        name: 'Orthopedic Joint Relief Memory Foam Pet Bed (Large)',
        brand: 'PawsComfort',
        category: 'accessories',
        petTypes: ['dog', 'cat'],
        price: 2999,
        discountPrice: 2299,
        stockQuantity: 15,
        description: 'Multi-layer orthopedic memory foam bed with water-resistant, washable suede cover. Ideal for joint support and elder pets.',
        tags: ['orthopedic', 'washable', 'memory-foam'],
        images: ['https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?w=600&auto=format&fit=crop&q=80'],
        averageRating: 4.7,
        numReviews: 29,
      },
      {
        name: 'Whiskas Ocean Fish Dry Cat Food (7 kg)',
        brand: 'Whiskas',
        category: 'food',
        petTypes: ['cat'],
        price: 1850,
        discountPrice: 1599,
        stockQuantity: 40,
        description: 'Enriched with Omega 3 & 6 fatty acids for a lustrous coat. Specially shaped kibbles promote dental plaque removal.',
        tags: ['feline', 'complete-nutrition', 'best-seller'],
        images: ['https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600&auto=format&fit=crop&q=80'],
        averageRating: 4.6,
        numReviews: 54,
      },
      {
        name: 'Interactive Motion-Activated Laser & Feather Cat Toy',
        brand: 'PlayPaws',
        category: 'toys',
        petTypes: ['cat'],
        price: 899,
        discountPrice: 699,
        stockQuantity: 32,
        description: '360-degree rotating laser with unpredictable motion modes and feather teaser. Keeps indoor felines physically active.',
        tags: ['interactive', 'exercise', 'indoor-fun'],
        images: ['https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=600&auto=format&fit=crop&q=80'],
        averageRating: 4.5,
        numReviews: 31,
      },
      {
        name: 'VetPro Daily Glucosamine & Calcium Chew Tabs (60 Chews)',
        brand: 'VetPro Nutra',
        category: 'health',
        petTypes: ['dog'],
        price: 950,
        discountPrice: 799,
        stockQuantity: 50,
        description: 'Veterinarian formulated joint support tablets containing Glucosamine, Chondroitin, and Vitamin D3 for bone strength.',
        tags: ['joint-care', 'supplements', 'vet-approved'],
        images: ['https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=600&auto=format&fit=crop&q=80'],
        averageRating: 4.9,
        numReviews: 63,
      },
    ]);
    console.log('✅ Created Products for Pet Shop');
  }

  // ── 5. CARE ARTICLES (Care Tips) ──────────────────────────────────────────
  const existingArticles = await CareArticle.countDocuments();
  if (existingArticles === 0) {
    await CareArticle.create([
      {
        title: 'Essential Monsoon Care Guide for Dogs & Cats in India',
        slug: 'monsoon-care-guide-dogs-cats',
        category: 'hygiene',
        mediaType: 'article',
        petTypes: ['dog', 'cat'],
        tags: ['monsoon', 'tick-prevention', 'hygiene', 'ear-infection'],
        author: 'Dr. Priya Sharma, FurShield Senior Vet',
        summary: 'Monsoons bring humidity, damp paws, and rapid parasite multiplication. Learn how to protect your pet from tick fever, ear infections, and skin dermatitis.',
        thumbnail: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=600&auto=format&fit=crop&q=80',
        content: `
### 1. The Threat of Damp Paws (Pododermatitis)
During rainy months, dampness trapped between dog toes can quickly cause fungal and bacterial dermatitis. Always towel-dry paws immediately after walks, and check for redness or licking behavior.

### 2. Tick & Flea Prevention is Non-Negotiable
Humidity provides an ideal breeding environment for ticks which transmit deadly Haemoprotozoan diseases (like Tick Fever/Ehrlichiosis). Ensure anti-tick spot-ons, chewables, or tick collars are updated on time.

### 3. Ear Hygiene Checks
Dogs with floppy ears (Golden Retrievers, Labradors, Spaniels) trap moisture, leading to severe yeast infections. Clean with a vet-approved drying ear cleanser once a week.

### 4. Nutrition and Clean Drinking Water
Water-borne tummy infections spike in rainy seasons. Always provide boiled and cooled water. Avoid feeding leftovers that spoil rapidly in humid weather.
        `.trim(),
      },
      {
        title: 'Understanding Core Pet Vaccinations: Schedules & Timing',
        slug: 'understanding-core-pet-vaccinations',
        category: 'health',
        mediaType: 'article',
        petTypes: ['all'],
        tags: ['vaccination', 'rabies', 'puppy-care', 'kitten-care'],
        author: 'FurShield Veterinary Medical Board',
        summary: 'A definitive handbook on core puppy/kitten shots, annual boosters, and why keeping health timelines updated prevents deadly viral outbreaks.',
        thumbnail: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&auto=format&fit=crop&q=80',
        content: `
### Core Vaccines for Dogs
- **DHPP / 7-in-1 / 9-in-1**: Protects against Distemper, Hepatitis, Parvovirus, and Parainfluenza. Given at 6, 9, and 12 weeks with annual boosters.
- **Anti-Rabies (ARV)**: Mandated by law. First shot at 3 months, followed by annual booster shots for life.
- **Kennel Cough (Bordetella)**: Crucial if your dog visits dog parks, boarding facilities, or salons.

### Core Vaccines for Cats
- **FVRCP (Tricat)**: Protects against Feline Viral Rhinotracheitis, Calicivirus, and Panleukopenia.
- **Rabies**: Administered annually to indoor and outdoor felines alike.

### Digital Health Record Keeping
FurShield enables you to upload vaccination certificates directly into your pet's health log so you never miss an immunization milestone.
        `.trim(),
      },
      {
        title: '5 Daily Indoor Exercise Routines for Energetic Dogs',
        slug: '5-indoor-exercise-routines-for-dogs',
        category: 'exercise',
        mediaType: 'video',
        petTypes: ['dog'],
        tags: ['exercise', 'mental-stimulation', 'agility'],
        author: 'Kunal Verma, Certified Canine Trainer',
        summary: 'Stuck indoors due to weather? Keep your high-energy companion stimulated, physically fit, and calm with these five fun indoor games.',
        thumbnail: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&auto=format&fit=crop&q=80',
        mediaUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        content: `
Indoor exercise combines mental enrichment with physical workouts:
1. **The Scent Search Game**: Hide treats under cups or throughout the living room. Nosework burns immense canine mental energy.
2. **Stair Agility Climbs**: Controlled stair walking under supervision for strong hindquarter muscles.
3. **Flirt Pole Training**: High-drive chase game using a soft rope lure.
4. **Tug-of-War with Drop Cue**: Strengthens bonds while teaching impulse control.
5. **Trick Master Sessions**: 10 minutes of learning new tricks (spin, crawl, high-five).
        `.trim(),
      },
      {
        title: 'Pet Feeding & Nutrition FAQ: Dry Kibble vs Wet Food',
        slug: 'pet-feeding-and-nutrition-faq',
        category: 'feeding',
        mediaType: 'faq',
        petTypes: ['all'],
        tags: ['nutrition', 'feeding', 'kibble', 'hydration'],
        author: 'FurShield Veterinary Care',
        summary: 'Expert answers to the most common questions regarding diet balance, protein percentages, feeding frequencies, and hydration.',
        thumbnail: 'https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?w=600&auto=format&fit=crop&q=80',
        faqItems: [
          {
            question: 'Should I feed wet food or dry kibble?',
            answer: 'A combination often works best! Dry kibble helps scrape off mild tartar, while wet food provides essential moisture, which is especially critical for cats prone to urinary tract issues.',
          },
          {
            question: 'How many times a day should an adult pet be fed?',
            answer: 'Most adult dogs and cats thrive on two scheduled meals per day (morning and evening). Free-feeding is discouraged as it can lead to obesity.',
          },
          {
            question: 'Are human table scraps safe for dogs?',
            answer: 'Never feed cooked poultry bones, onions, garlic, grapes, raisins, chocolate, or foods containing xylitol. Lean boiled chicken and pumpkin purée are safe in moderation.',
          },
        ],
      },
    ]);
    console.log('✅ Created Care Articles');
  }

  // ── 6. ADOPTION LISTINGS (for Shelter) ─────────────────────────────────────
  const existingListings = await AdoptionListing.countDocuments({ shelter: userMap.shelter._id });
  if (existingListings === 0) {
    await AdoptionListing.create([
      {
        shelter: userMap.shelter._id,
        petName: 'Milo',
        species: 'dog',
        breed: 'Beagle',
        age: 1.5,
        gender: 'male',
        weight: 12.0,
        color: 'Tricolor (White, Black & Tan)',
        healthStatus: 'Excellent, fully vaccinated & neutered',
        isVaccinated: true,
        isNeutered: true,
        description: 'Milo is a friendly, goofy Beagle rescued from an overcrowded apartment. Loves sniff walks, squeaky toys, and is great with kids and other pets.',
        images: ['https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=600&auto=format&fit=crop&q=80'],
        status: 'available',
      },
      {
        shelter: userMap.shelter._id,
        petName: 'Bella',
        species: 'dog',
        breed: 'Indian Pariah / Indie',
        age: 0.8,
        gender: 'female',
        weight: 14.5,
        color: 'Caramel Brown & White',
        healthStatus: 'Dewormed, vaccinated, microchipped',
        isVaccinated: true,
        isNeutered: true,
        description: 'Bella was rescued as a 2-month puppy. Incredibly resilient, intuitive, loving, and quick to learn commands. Ideal family companion.',
        images: ['https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&auto=format&fit=crop&q=80'],
        status: 'available',
      },
      {
        shelter: userMap.shelter._id,
        petName: 'Simba',
        species: 'cat',
        breed: 'Domestic Short Hair',
        age: 0.5,
        gender: 'male',
        weight: 2.2,
        color: 'Ginger & White Tabby',
        healthStatus: 'Vaccinated & litter-trained',
        isVaccinated: true,
        isNeutered: false,
        description: 'Simba is a sweet purr machine who loves afternoon sun spots and lap cuddles. Playful with ribbons and gets along with gentle dogs.',
        images: ['https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=600&auto=format&fit=crop&q=80'],
        status: 'available',
      },
    ]);
    console.log('✅ Created Adoption Listings for Happy Paws Shelter');
  }

  // ── 7. APPOINTMENT (Active test appointment) ───────────────────────────────
  const existingAppt = await Appointment.findOne({ pet: rocky._id, vet: userMap.veterinarian._id });
  if (!existingAppt) {
    const nextMonday = new Date();
    nextMonday.setDate(nextMonday.getDate() + ((1 + 7 - nextMonday.getDay()) % 7 || 7));
    nextMonday.setHours(10, 0, 0, 0);

    await Appointment.create({
      pet: rocky._id,
      owner: userMap.petOwner._id,
      vet: userMap.veterinarian._id,
      appointmentDate: nextMonday,
      appointmentTime: '10:00',
      duration: 30,
      reason: 'Semi-annual wellness examination & skin checkup',
      ownerNotes: 'Rocky scratched his right ear slightly after swimming last weekend.',
      status: 'confirmed',
      vetNotes: 'Appointment confirmed. Please arrive 10 minutes before slot.',
      suggestedBySystem: false,
    });
    console.log('✅ Created Confirmed Appointment between Rocky & Dr. Priya');
  }

  // ── 8. NOTIFICATIONS ───────────────────────────────────────────────────────
  const existingNotifs = await Notification.countDocuments({ recipient: userMap.petOwner._id });
  if (existingNotifs === 0) {
    await Notification.create([
      {
        recipient: userMap.petOwner._id,
        type: 'appointment_confirmed',
        title: 'Appointment Confirmed! 🩺',
        message: 'Dr. Priya Sharma confirmed your appointment for Rocky on Monday at 10:00 AM.',
        isRead: false,
        relatedModel: 'Appointment',
      },
      {
        recipient: userMap.petOwner._id,
        type: 'vaccination_due',
        title: 'Vaccination Reminder 💉',
        message: 'Rocky is in good standing! Next Rabies booster is due in 2027.',
        isRead: true,
        relatedModel: 'HealthRecord',
      },
      {
        recipient: userMap.veterinarian._id,
        type: 'appointment_confirmed',
        title: 'Upcoming Patient: Rocky 🐾',
        message: 'You have a scheduled consultation with Aryan Mehta and pet Rocky.',
        isRead: false,
        relatedModel: 'Appointment',
      },
    ]);
    console.log('✅ Created Initial Notifications');
  }

  console.log('\n🎉 Comprehensive database seed completed successfully!\n');
  console.table(SEED_USERS.map(u => ({
    Role: u.role,
    Email: u.email,
    Password: u.plainPassword,
    Name: u.name,
  })));

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed execution failed:', err);
  process.exit(1);
});
