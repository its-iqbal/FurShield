/**
 * scripts/seed.js
 * Creates one test account for each role: petOwner, veterinarian, shelter.
 * Run with: node scripts/seed.js
 */
import mongoose  from 'mongoose';
import bcrypt    from 'bcryptjs';
import dotenv    from 'dotenv';
import User      from '../models/User.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/furshield';

const SEED_USERS = [
  {
    name:     'Aryan Mehta',
    email:    'owner@furshield.dev',
    plainPassword: 'Owner@1234',
    role:     'petOwner',
    phone:    '+91 98100 11111',
    bio:      'Dog dad of two golden retrievers. Loves weekend hikes.',
    address:  { street: 'Linking Road', city: 'Mumbai', state: 'Maharashtra', country: 'India', zip: '400050' },
  },
  {
    name:           'Dr. Priya Sharma',
    email:          'vet@furshield.dev',
    plainPassword:  'Vet@1234',
    role:           'veterinarian',
    phone:          '+91 98100 22222',
    specialization: 'Small Animal Medicine & Surgery',
    experience:     8,
    clinicName:     'PawsCare Veterinary Clinic',
    clinicAddress:  { street: '14, MG Road', city: 'Bengaluru', state: 'Karnataka', country: 'India', zip: '560001' },
    bio:            'Passionate about preventive care and happy pets.',
    address:        { street: '14, MG Road', city: 'Bengaluru', state: 'Karnataka', country: 'India', zip: '560001' },
    availableSlots: [
      { day: 'Monday',    startTime: '09:00', endTime: '17:00' },
      { day: 'Tuesday',   startTime: '09:00', endTime: '17:00' },
      { day: 'Wednesday', startTime: '10:00', endTime: '16:00' },
      { day: 'Thursday',  startTime: '09:00', endTime: '17:00' },
      { day: 'Friday',    startTime: '09:00', endTime: '15:00' },
      { day: 'Saturday',  startTime: '10:00', endTime: '13:00' },
    ],
  },
  {
    name:          'Happy Paws Shelter',
    email:         'shelter@furshield.dev',
    plainPassword: 'Shelter@1234',
    role:          'shelter',
    phone:         '+91 98100 33333',
    shelterName:   'Happy Paws Animal Shelter',
    contactPerson: 'Sunil Rao',
    website:       'https://happypaws.org.in',
    bio:           'A no-kill shelter dedicated to rescuing and rehoming animals since 2012.',
    address:       { street: 'Koregaon Park', city: 'Pune', state: 'Maharashtra', country: 'India', zip: '411001' },
  },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB:', MONGO_URI);

  for (const u of SEED_USERS) {
    const exists = await User.findOne({ email: u.email });
    if (exists) {
      console.log(`User ${u.email} already exists — updating password.`);
      const salt = await bcrypt.genSalt(12);
      exists.passwordHash = await bcrypt.hash(u.plainPassword, salt);
      await exists.save();
      continue;
    }
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(u.plainPassword, salt);
    const { plainPassword, ...rest } = u;
    await User.create({ ...rest, passwordHash });
    console.log(`Created [${u.role.padEnd(12)}]  ${u.email}  /  ${u.plainPassword}`);
  }

  console.log('\nSeed complete!\n');
  console.table(SEED_USERS.map(u => ({
    Role:     u.role,
    Email:    u.email,
    Password: u.plainPassword,
    Name:     u.name,
  })));

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
