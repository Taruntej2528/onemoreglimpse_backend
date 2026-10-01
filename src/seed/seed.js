import mongoose from 'mongoose';
import { ENV } from '../config/env.js';
import { User, SYSTEM_MODULES } from '../utiles/models/User.js';
import { Settings } from '../utiles/models/Settings.js';
import { Category } from '../utiles/models/Category.js';
import { Event } from '../utiles/models/Event.js';
import { Notification } from '../utiles/models/Notification.js';

export const seedDatabase = async (options = {}) => {
  const { force = false } = options;

  if (mongoose.connection.readyState !== 1) {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(ENV.MONGO_URI);
    console.log('[Seed] Connected.');
  }

  const results = {
    forceMode: force,
    admin: null,
    subAdmin: null,
    settings: null,
    categories: null,
    events: null,
    notifications: null,
    credentials: {
      masterAdmin: { email: 'admin@praznaphotography.com', password: 'admin123' },
      subAdmin: { email: 'editor@praznaphotography.com', password: 'editor123' },
    },
  };

  try {
    if (force) {
      console.log('[Seed] Force mode active: clearing existing sample records...');
      await User.deleteMany({ email: { $in: ['admin@praznaphotography.com', 'editor@praznaphotography.com'] } });
      await Settings.deleteMany({ isDefault: true });
      await Category.deleteMany({});
      await Event.deleteMany({});
      await Notification.deleteMany({});
    }

    // 1. Seed Master Admin
    const adminEmail = 'admin@praznaphotography.com';
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      console.log('[Seed] Creating Master Admin user...');
      admin = await User.create({
        name: 'Master Admin',
        email: adminEmail,
        password: 'admin123', // Will be hashed by User pre-save hook
        phone: '+91 98765 43210',
        role: 'ADMIN',
        status: 'ACTIVE',
        modules: SYSTEM_MODULES.map((m) => ({
          module: m,
          permissions: { view: true, edit: true, delete: true },
        })),
      });
      results.admin = `Created Master Admin: ${adminEmail}`;
    } else {
      results.admin = `Master Admin already exists: ${adminEmail}`;
    }

    // 2. Seed Sample Sub-Admin
    const subAdminEmail = 'editor@praznaphotography.com';
    let subAdmin = await User.findOne({ email: subAdminEmail });
    if (!subAdmin) {
      console.log('[Seed] Creating Sample Sub-Admin user...');
      subAdmin = await User.create({
        name: 'Creative Editor',
        email: subAdminEmail,
        password: 'editor123',
        phone: '+91 98765 43211',
        role: 'SUB_ADMIN',
        status: 'ACTIVE',
        modules: [
          { module: 'dashboard', permissions: { view: true, edit: false, delete: false } },
          { module: 'media', permissions: { view: true, edit: true, delete: false } },
          { module: 'categories', permissions: { view: true, edit: true, delete: false } },
          { module: 'events', permissions: { view: true, edit: false, delete: false } },
          { module: 'client_requests', permissions: { view: true, edit: true, delete: false } },
          { module: 'settings', permissions: { view: true, edit: false, delete: false } },
          { module: 'notifications', permissions: { view: true, edit: true, delete: false } },
          { module: 'users', permissions: { view: false, edit: false, delete: false } },
          { module: 'logs', permissions: { view: false, edit: false, delete: false } },
        ],
      });
      results.subAdmin = `Created Sub-Admin: ${subAdminEmail}`;
    } else {
      results.subAdmin = `Sub-Admin already exists: ${subAdminEmail}`;
    }

    // 3. Seed Default Website Settings
    let settings = await Settings.findOne({ isDefault: true });
    if (!settings) {
      console.log('[Seed] Seeding Default Website Settings...');
      settings = await Settings.create({
        isDefault: true,
        brand: {
          name: 'PRAZNA PHOTOGRAPHY',
          tagline: 'Immortalizing love in its most real, poetic, and breathtaking moments.',
          subtitle: 'Where ancient sacred tradition meets fine-art contemporary cinematography.',
          whatsappNumber: '919876543210',
          email: 'contact@praznaphotography.com',
          phone: '+91 98765 43210',
          instagram: 'https://instagram.com/praznaphotography',
          location: 'Hyderabad • Bengaluru • Mumbai • Global Destinations',
          logoType: 'text',
          logoHeight: 38,
          monogram: 'PRAZNA',
        },
        hero: {
          heroMediaType: 'video',
          activeHeroVideoId: 'varsha-shiva',
          activeHeroImageId: 'heritage-bride-silk',
          heroVideos: [
            {
              id: 'varsha-shiva',
              name: 'Varsha & Shiva (4K)',
              videoId: 'jcBEUpPrqY0',
              poster: 'https://img.youtube.com/vi/jcBEUpPrqY0/maxresdefault.jpg',
              location: 'Taj Falaknuma Palace, Hyderabad',
              tagline: 'Celebrating love in its most real and beautiful moments.',
            },
            {
              id: 'athiya-rahul',
              name: 'Athiya & Rahul (Celebrity)',
              videoId: 'Kni0Nd76X5A',
              poster: 'https://img.youtube.com/vi/Kni0Nd76X5A/maxresdefault.jpg',
              location: 'Khandala Heritage Estate',
              tagline: 'Unscripted tenderness, soulful intimacy, and timeless vows.',
            },
          ],
          heroImages: [
            {
              id: 'heritage-bride-silk',
              name: 'Royal Emerald Silk Bride',
              src: '/assets/hero-green-saree-bride.jpg',
              location: 'Hyderabad Heritage Palace',
              tagline: 'Immortalizing timeless bridal composure & handcrafted silks.',
            },
          ],
        },
        footer: {
          brandName: 'PRAZNA PHOTOGRAPHY',
          tagline: 'Immortalizing love in its most real, poetic, and breathtaking moments.',
          description:
            'Over two decades of documenting royal palace weddings and destination celebrations. Harmonizing classic fine-art portraiture with unobtrusive, soul-stirring documentary filmmaking.',
          copyright: 'PRAZNA PHOTOGRAPHY. All rights reserved. Fine-Art Heritage Cinema.',
          badgeText: 'Honoring Sacred Vows Since 2000 • 38+ Global Honors',
          address: 'Bespoke Studios in Hyderabad, Bengaluru & Mumbai. Available for destination celebrations worldwide.',
          showNewsletter: true,
          showSocialIcons: true,
        },
        storage: {
          activeProvider: 'local',
        },
        socialLinks: [
          { id: 'whatsapp', platform: 'WhatsApp Booking', url: 'https://wa.me/919876543210', active: true },
          { id: 'instagram', platform: 'Instagram Portfolio', url: 'https://instagram.com/praznaphotography', active: true },
          { id: 'youtube', platform: 'YouTube 4K Channel', url: 'https://youtube.com/@praznaphotography', active: true },
          { id: 'pinterest', platform: 'Pinterest Moodboards', url: 'https://pinterest.com/praznaphotography', active: true },
        ],
        philosophy: {
          badge: 'OUR PHILOSOPHY',
          leadHeading: '"We don\'t simply record ceremonies; we curate timeless heirlooms."',
          leadParagraph:
            'Over two decades of documenting royal palace weddings and intimate destination celebrations across Udaipur, Hyderabad, Florence, and Bali. We balance classic fine-art portraiture with unobtrusive, soul-stirring documentary filmmaking.',
          pillars: [
            {
              title: 'Unscripted Emotion',
              desc: 'No stiff poses or staged smiles. We capture the stolen glances, joyous family tears, and spontaneous festive ecstasy.',
            },
            {
              title: 'Fine-Art Color Grading',
              desc: 'Every frame is hand-mastered with rich jewel tones, skin-true warmth, and editorial cinematic contrast.',
            },
            {
              title: 'Cinema-Grade Audio & Optics',
              desc: 'Broadcast wireless mics record sacred Vedic mantras, tender wedding vows, and heartfelt parent toasts with crystalline fidelity.',
            },
          ],
        },
        films: [
          {
            id: 'film-1',
            title: 'Varsha & Shiva: Royal Heritage Grandeur',
            couple: 'Varsha & Shiva',
            location: 'Taj Falaknuma Palace, Hyderabad',
            videoId: 'jcBEUpPrqY0',
            duration: '4K Cinema • 18 min',
            thumbnail: 'https://img.youtube.com/vi/jcBEUpPrqY0/maxresdefault.jpg',
            tagline: 'A royal confluence of sacred Vedic rituals and timeless architectural splendour.',
            highlight: 'Best Heritage Wedding Film 2026',
          },
          {
            id: 'film-2',
            title: 'Athiya & Rahul: Mountain Meadow Memoir',
            couple: 'Athiya & Rahul',
            location: 'Khandala Heritage Estate',
            videoId: 'Kni0Nd76X5A',
            duration: '4K Cinema • 14 min',
            thumbnail: 'https://img.youtube.com/vi/Kni0Nd76X5A/maxresdefault.jpg',
            tagline: 'Unscripted tenderness, soulful intimacy, and vows under misty hilltop skies.',
            highlight: 'Top Destination Film Award',
          },
          {
            id: 'film-3',
            title: 'Meera & Siddharth: Sacred Temple Muhurtham',
            couple: 'Meera & Siddharth',
            location: 'The Leela Palace, Bengaluru',
            videoId: 'jcBEUpPrqY0',
            duration: '4K Cinema • 22 min',
            thumbnail: 'https://res.cloudinary.com/dbwzgdmtv/image/upload/v1768980002/portfolio/gddb5ytprmnhagxmlgew.jpg',
            tagline: 'Ancient temple drums, cascading jasmine garlands, and tears of pure devotion.',
            highlight: 'Master Cinematography Pick',
          },
        ],
        testimonials: [
          {
            name: 'Ananya & Vikram',
            event: 'Taj Lake Palace, Udaipur',
            review:
              'Prazna didn’t just film our wedding; they gave us a cinema-level heirloom that made our grandparents weep with joy. The 4K colors and unscripted moments are completely unmatched.',
            rating: 5,
          },
          {
            name: 'Dr. Radhika & Aditya',
            event: 'The Oberoi Rajvilas, Jaipur',
            review:
              'Their unobtrusive documentary presence allowed us to genuinely live in each ceremony. The handcrafted leather albums and cinematic teaser exceeded every expectation.',
            rating: 5,
          },
          {
            name: 'Sneha & Rohan',
            event: 'Taj Falaknuma Palace, Hyderabad',
            review:
              'From drone shots of the palace to capturing sacred Vedic mantras in crystal-clear audio, hiring Prazna was the best decision we made for our multi-day wedding.',
            rating: 5,
          },
        ],
      });
      results.settings = 'Default website settings seeded successfully';
    } else {
      results.settings = 'Default website settings already exist';
    }

    // 4. Seed Categories
    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
      console.log('[Seed] Seeding Portfolio Categories...');
      await Category.create([
        { name: 'Royal Weddings', order: 1, description: 'Palace and destination sacred ceremonies' },
        { name: 'Bridal Heirloom', order: 2, description: 'Fine-art Kanjeevaram and bridal portraits' },
        { name: 'Haldi & Sangeet Revelry', order: 3, description: 'Euphoric family dances and turmeric laughter' },
        { name: 'Pre-Wedding Romances', order: 4, description: 'Intimate poetic memoirs in natural landscapes' },
        { name: 'Temple Muhurtham', order: 5, description: 'Auspicious Vedic rituals, sacred fire, and tears of joy' },
      ]);
      results.categories = 'Seeded 5 initial portfolio categories';
    } else {
      results.categories = `${categoryCount} categories already exist`;
    }

    // 5. Seed Events / Packages & Shoots
    const eventCount = await Event.countDocuments();
    if (eventCount === 0) {
      console.log('[Seed] Seeding Signature Packages & Wedding Shoots...');
      await Event.create([
        // Signature Packages
        {
          name: 'Royal Heritage Grandeur',
          type: 'package',
          badge: 'Most Revered',
          price: 495000,
          idealFor: '3-Day Palace Destination Celebration',
          team: '8-Member Master Cinema & Portrait Crew',
          inclusions: [
            'Full Multi-Day Coverage (All Ceremonies)',
            '4K Feature Wedding Film (25-35 mins)',
            'Cinematic Musical Teaser (3-5 mins)',
            '2 Bespoke Leather-Bound Heirloom Albums (150 pages)',
            'All High-Res Color Graded RAW & Master Digital Files',
            'Full Aerial Drone Cinematography & Same-Day Reels',
          ],
        },
        {
          name: 'Timeless Classical Memoir',
          type: 'package',
          badge: 'Curated',
          price: 295000,
          idealFor: '2-Day Heritage Wedding Celebration',
          team: '5-Member Cinema & Portrait Crew',
          inclusions: [
            '2 Full Days Complete Coverage',
            '4K Cinematic Highlight Film (15-20 mins)',
            'Heirloom Artisan Album (100 pages)',
            'High-Res Curated Digital Gallery',
          ],
        },
        // Wedding Shoots / Itinerary
        {
          name: 'Varsha & Shiva',
          couple: 'Varsha & Shiva',
          type: 'event',
          eventType: 'Royal Muhurtham & Grand Reception',
          date: 'Nov 18, 2026',
          venue: 'Taj Falaknuma Palace',
          city: 'Hyderabad',
          package: 'Royal Heritage Grandeur (₹4,95,000)',
          status: 'Upcoming',
          crew: [
            { name: 'Praveen Kumar', role: 'Lead Fine-Art Master' },
            { name: 'Aditya Roy', role: '4K Lead Cinematographer' },
            { name: 'Sameer Khan', role: 'Aerial Drone Pilot' },
          ],
          deliverables: {
            rawStatus: 'Scheduled',
            filmProgress: 0,
            photosEdited: 0,
            totalExpected: 1400,
            albumApproved: false,
          },
          coverImage: 'https://img.youtube.com/vi/jcBEUpPrqY0/maxresdefault.jpg',
        },
        {
          name: 'Athiya & Rahul',
          couple: 'Athiya & Rahul',
          type: 'event',
          eventType: 'Intimate Heritage Memoir',
          date: 'Oct 12, 2026',
          venue: 'Khandala Heritage Estate',
          city: 'Khandala',
          package: 'Timeless Classical Memoir (₹2,95,000)',
          status: 'In Progress',
          crew: [
            { name: 'Kavita Reddy', role: 'Fine-Art Portrait Artist' },
            { name: 'Rohan Sharma', role: 'Documentary Filmmaker' },
          ],
          deliverables: {
            rawStatus: 'Ingested & Backed Up',
            filmProgress: 45,
            photosEdited: 620,
            totalExpected: 1100,
            albumApproved: false,
          },
          coverImage: 'https://img.youtube.com/vi/Kni0Nd76X5A/maxresdefault.jpg',
        },
        {
          name: 'Meera & Siddharth',
          couple: 'Meera & Siddharth',
          type: 'event',
          eventType: 'Sacred Temple Muhurtham',
          date: 'Sep 05, 2026',
          venue: 'The Leela Palace',
          city: 'Bengaluru',
          package: 'Royal Heritage Grandeur (₹4,95,000)',
          status: 'Post-Production',
          crew: [
            { name: 'Praveen Kumar', role: 'Lead Director' },
            { name: 'Nikhil Verma', role: 'Senior Colorist' },
          ],
          deliverables: {
            rawStatus: 'Complete',
            filmProgress: 85,
            photosEdited: 980,
            totalExpected: 1000,
            albumApproved: true,
          },
          coverImage: 'https://res.cloudinary.com/dbwzgdmtv/image/upload/v1768980002/portfolio/gddb5ytprmnhagxmlgew.jpg',
        },
      ]);
      results.events = 'Seeded 2 signature packages & 3 wedding shoots';
    } else {
      results.events = `${eventCount} events/packages already exist`;
    }

    // 6. Seed Initial Notification
    const notifCount = await Notification.countDocuments();
    if (notifCount === 0) {
      await Notification.create({
        title: 'Prazna Photography Backend Initialized',
        message: 'System architecture successfully booted with multi-cloud storage and RBAC access control.',
        type: 'INFO',
        category: 'system',
      });
      results.notifications = 'Seeded initial system notification';
    } else {
      results.notifications = `${notifCount} notifications already exist`;
    }

    console.log('[Seed] Database seeding completed successfully.');
    return results;
  } catch (error) {
    console.error(`[Seed Error] ${error.message}`);
    throw error;
  }
};

// If run directly via node src/seed/seed.js
if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase().then(() => {
    mongoose.disconnect();
    process.exit(0);
  });
}
