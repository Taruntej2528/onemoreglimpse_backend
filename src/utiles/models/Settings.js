import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    isDefault: {
      type: Boolean,
      default: true,
      unique: true,
    },

    // Brand Identity & Presentation
    brand: {
      name: { type: String, default: 'PRAZNA PHOTOGRAPHY' },
      tagline: { type: String, default: 'Immortalizing love in its most real, poetic, and breathtaking moments.' },
      subtitle: { type: String, default: 'Where ancient sacred tradition meets fine-art contemporary cinematography.' },
      whatsappNumber: { type: String, default: '919876543210' },
      email: { type: String, default: 'contact@praznaphotography.com' },
      phone: { type: String, default: '+91 98765 43210' },
      instagram: { type: String, default: 'https://instagram.com/praznaphotography' },
      location: { type: String, default: 'Hyderabad • Bengaluru • Mumbai • Global Destinations' },
      experienceYears: { type: String, default: '25+' },
      weddingsCount: { type: String, default: '4,500+' },
      awardsCount: { type: String, default: '38+ Global Honors' },

      // Logo Options
      logoType: { type: String, enum: ['text', 'image', 'both'], default: 'text' },
      logoUrl: { type: String, default: '' },
      logoDarkUrl: { type: String, default: '' },
      logoHeight: { type: Number, default: 38 },
      monogram: { type: String, default: 'PRAZNA' },
      favicon: { type: String, default: '/favicon.ico' },
    },

    // Landing Hero Media (Only ONE active at a time: Single Video OR Single Image)
    hero: {
      heroMediaType: { type: String, enum: ['video', 'image'], default: 'video' },
      activeHeroVideoId: { type: String, default: 'varsha-shiva' },
      activeHeroImageId: { type: String, default: 'heritage-bride-silk' },
      heroVideos: [
        {
          id: { type: String, required: true },
          name: { type: String, required: true },
          videoId: { type: String, required: true },
          poster: { type: String, default: '' },
          location: { type: String, default: '' },
          tagline: { type: String, default: '' },
        },
      ],
      heroImages: [
        {
          id: { type: String, required: true },
          name: { type: String, required: true },
          src: { type: String, required: true },
          location: { type: String, default: '' },
          tagline: { type: String, default: '' },
        },
      ],
      heroSubtitle: {
        type: String,
        default: 'Preserving the emotions, joy, and magic that make your love story truly yours.',
      },
      heroAvailability: {
        type: String,
        default: 'Limited availability. Enquire now.',
      },
    },

    // Footer & Legal Configuration
    footer: {
      brandName: { type: String, default: 'PRAZNA PHOTOGRAPHY' },
      tagline: { type: String, default: 'Immortalizing love in its most real, poetic, and breathtaking moments.' },
      description: {
        type: String,
        default:
          'Over two decades of documenting royal palace weddings and destination celebrations. Harmonizing classic fine-art portraiture with unobtrusive, soul-stirring documentary filmmaking.',
      },
      copyright: {
        type: String,
        default: 'PRAZNA PHOTOGRAPHY. All rights reserved. Fine-Art Heritage Cinema.',
      },
      badgeText: {
        type: String,
        default: 'Honoring Sacred Vows Since 2000 • 38+ Global Honors',
      },
      address: {
        type: String,
        default:
          'Bespoke Studios in Hyderabad, Bengaluru & Mumbai. Available for destination celebrations worldwide.',
      },
      showNewsletter: { type: Boolean, default: true },
      newsletterHeading: {
        type: String,
        default: 'Receive Studio Monographs & Seasonal Availability',
      },
      newsletterSubtitle: {
        type: String,
        default: 'Strictly reserved for prospective couples and royal celebrations. No spam.',
      },
      showSocialIcons: { type: Boolean, default: true },
    },

    // Multi-Cloud Storage Buckets Configuration (S3, Azure, GCS, Firebase, Cloudinary, Local)
    storage: {
      activeProvider: {
        type: String,
        enum: ['s3', 'azure', 'gcs', 'firebase', 'cloudinary', 'local'],
        default: 'local',
      },
      providers: {
        s3: {
          bucket: { type: String, default: '' },
          region: { type: String, default: 'ap-south-1' },
          accessKeyId: { type: String, default: '' },
          hasSecret: { type: Boolean, default: false },
          customDomain: { type: String, default: '' },
        },
        azure: {
          container: { type: String, default: 'prazna-media' },
          accountName: { type: String, default: '' },
          hasKey: { type: Boolean, default: false },
          customDomain: { type: String, default: '' },
        },
        gcs: {
          bucket: { type: String, default: '' },
          projectId: { type: String, default: '' },
          clientEmail: { type: String, default: '' },
          customDomain: { type: String, default: '' },
        },
        firebase: {
          storageBucket: { type: String, default: '' },
          projectId: { type: String, default: '' },
          clientEmail: { type: String, default: '' },
        },
        cloudinary: {
          cloudName: { type: String, default: '' },
          apiKey: { type: String, default: '' },
          apiSecret: { type: String, default: '' },
          folder: { type: String, default: 'prazna-photography' },
        },
        local: {
          uploadDir: { type: String, default: 'uploads' },
          baseUrl: { type: String, default: 'http://localhost:5000/uploads' },
        },
      },
    },

    // Email, SMS & Messaging Templates
    emailSms: {
      emailProvider: { type: String, default: 'smtp' },
      smsProvider: { type: String, default: 'twilio' },
      smtp: {
        host: { type: String, default: '' },
        port: { type: Number, default: 587 },
        user: { type: String, default: '' },
        fromEmail: { type: String, default: 'concierge@praznaphotography.com' },
      },
      templates: [
        {
          id: { type: String, required: true },
          name: { type: String, required: true },
          subject: { type: String, default: '' },
          emailBody: { type: String, default: '' },
          smsBody: { type: String, default: '' },
          active: { type: Boolean, default: true },
        },
      ],
    },

    // Social Media Links
    socialLinks: [
      {
        id: { type: String, required: true },
        platform: { type: String, required: true },
        url: { type: String, required: true },
        icon: { type: String, default: 'Share2' },
        active: { type: Boolean, default: true },
      },
    ],

    // Stats Counters
    stats: [
      {
        value: { type: String, default: '25+' },
        label: { type: String, default: 'Years of Heritage' },
      },
      {
        value: { type: String, default: '4,500+' },
        label: { type: String, default: 'Sacred Weddings' },
      },
      {
        value: { type: String, default: '38+' },
        label: { type: String, default: 'Global Awards' },
      },
      {
        value: { type: String, default: '100%' },
        label: { type: String, default: 'Pure Emotion' },
      },
    ],

    // Brand Philosophy & Pillars
    philosophy: {
      badge: { type: String, default: 'OUR PHILOSOPHY' },
      leadHeading: {
        type: String,
        default: '"We don\'t simply record ceremonies; we curate timeless heirlooms."',
      },
      leadParagraph: {
        type: String,
        default:
          'Over two decades of documenting royal palace weddings and intimate destination celebrations across Udaipur, Hyderabad, Florence, and Bali. We balance classic fine-art portraiture with unobtrusive, soul-stirring documentary filmmaking.',
      },
      pillars: [
        {
          title: { type: String, default: 'Unscripted Emotion' },
          desc: {
            type: String,
            default:
              'No stiff poses or staged smiles. We capture the stolen glances, joyous family tears, and spontaneous festive ecstasy.',
          },
        },
        {
          title: { type: String, default: 'Fine-Art Color Grading' },
          desc: {
            type: String,
            default:
              'Every frame is hand-mastered with rich jewel tones, skin-true warmth, and editorial cinematic contrast.',
          },
        },
        {
          title: { type: String, default: 'Cinema-Grade Audio & Optics' },
          desc: {
            type: String,
            default:
              'Broadcast wireless mics record sacred Vedic mantras, tender wedding vows, and heartfelt parent toasts with crystalline fidelity.',
          },
        },
      ],
    },

    // Wedding Cinema Films
    films: [
      {
        id: { type: String, default: '' },
        title: { type: String, default: '' },
        couple: { type: String, default: '' },
        location: { type: String, default: '' },
        videoId: { type: String, default: '' },
        duration: { type: String, default: '' },
        thumbnail: { type: String, default: '' },
        tagline: { type: String, default: '' },
        highlight: { type: String, default: '' },
        youtubeUrl: { type: String, default: '' },
      },
    ],

    // Client Testimonials
    testimonials: [
      {
        name: { type: String, default: '' },
        event: { type: String, default: '' },
        review: { type: String, default: '' },
        rating: { type: Number, default: 5 },
      },
    ],

    // Curated Masterpieces Portfolio Gallery
    gallery: [
      {
        id: { type: String, default: '' },
        src: { type: String, required: true },
        title: { type: String, default: '' },
        subtitle: { type: String, default: '' },
        location: { type: String, default: '' },
        category: { type: String, default: 'wedding' },
        orientation: { type: String, default: 'portrait' },
      },
    ],

    // Signature Curated Packages
    signaturePackages: [
      {
        id: { type: String, default: '' },
        name: { type: String, default: '' },
        badge: { type: String, default: '' },
        price: { type: Number, default: 0 },
        idealFor: { type: String, default: '' },
        team: { type: String, default: '' },
        inclusions: [{ type: String }],
      },
    ],

    // Bespoke Events for Custom Builder
    quoteEvents: [
      {
        id: { type: String, default: '' },
        name: { type: String, default: '' },
        basePrice: { type: Number, default: 0 },
        hours: { type: String, default: '' },
        description: { type: String, default: '' },
      },
    ],

    // Team Add-On Rates
    teamAddOns: {
      photographerRate: { type: Number, default: 16000 },
      videographerRate: { type: Number, default: 20000 },
      droneRate: { type: Number, default: 18000 },
      teaserReelRate: { type: Number, default: 12000 },
      albumRate: { type: Number, default: 25000 },
    },

    // AI Concierge Chatbot (Gemini, ChatGPT / OpenAI, Claude)
    ai: {
      enabled: { type: Boolean, default: true },
      hideWidgetWhenDisabled: { type: Boolean, default: false },
      activeProvider: {
        type: String,
        enum: ['gemini', 'openai', 'claude', 'custom'],
        default: 'gemini',
      },
      botName: { type: String, default: 'Prazna AI Concierge' },
      systemPrompt: {
        type: String,
        default: `You are the exclusive AI Concierge for PRAZNA PHOTOGRAPHY, India's foremost luxury wedding and heritage cinematography studio.
Your persona: Warm, poetic, ultra-sophisticated, respectful of sacred traditions (Muhurtham, Vedic vows, Sangeet, Royal Receptions), and knowledgeable about fine-art cinema.
Studio details:
- Over 25+ years of royal heritage and fine-art documentary cinema.
- Covered 4,500+ weddings with 38+ global honors.
- Bespoke locations: Udaipur (Lake Palace, Jagmandir), Hyderabad (Taj Falaknuma), Bengaluru, Mumbai, Florence, Lake Como, Bali.
- Packages: Intimate Sacred Vows (₹1.85L), Timeless Classical Memoir (₹2.95L), Royal Heritage Grandeur (₹4.95L), Bespoke Luxury Celebration (₹6.50L+).
- Philosophy: "We don't simply record ceremonies; we curate timeless heirlooms." Unobtrusive 4K cinema, master color grading with jewel tones, crystalline audio for Vedic mantras.
- Booking: Limited availability per wedding season to maintain signature artistic quality.
Always guide prospective couples with elegance. If they want to reserve dates or receive a bespoke brochure, encourage them to submit the inquiry form or connect directly with our studio director.`,
      },
      providers: {
        gemini: {
          apiKey: { type: String, default: '' },
          model: { type: String, default: 'gemini-3.8-flash' },
          temperature: { type: Number, default: 0.7 },
        },
        openai: {
          apiKey: { type: String, default: '' },
          model: { type: String, default: 'gpt-4o-mini' },
          temperature: { type: Number, default: 0.7 },
        },
        claude: {
          apiKey: { type: String, default: '' },
          model: { type: String, default: 'claude-3-5-sonnet-20241022' },
          temperature: { type: Number, default: 0.7 },
        },
      },
      welcomeMessage: {
        type: String,
        default: 'Namaste & Welcome to Prazna Photography. I am your AI Concierge. How may I assist with your wedding celebration or cinematic heirloom today?',
      },
      quickQuestions: {
        type: [String],
        default: [
          'What is included in the Royal Heritage Grandeur collection?',
          'Do you travel to destination weddings like Udaipur, Florence, or Bali?',
          'How far in advance should we reserve our wedding dates?',
          'What is your documentary cinematography style?',
        ],
      },
    },

    // Search Engine Optimization (SEO) & Google Ranking
    seo: {
      metaTitle: {
        type: String,
        default: 'PRAZNA PHOTOGRAPHY — Luxury Wedding Photography & Royal Cinematography',
      },
      metaDescription: {
        type: String,
        default:
          "India's foremost luxury wedding photography and 4K documentary cinematography studio. Capturing royal heritage vows and destination celebrations in Udaipur, Hyderabad, Florence, and worldwide.",
      },
      keywords: {
        type: String,
        default:
          'luxury wedding photography, royal wedding cinematography, destination wedding photographer Udaipur, wedding videographer Hyderabad, palace weddings, candid wedding photography India',
      },
      canonicalUrl: {
        type: String,
        default: 'https://praznaphotography.com',
      },
      ogImage: {
        type: String,
        default: '',
      },
      googleSearchConsoleCode: {
        type: String,
        default: '',
      },
      googleAnalyticsId: {
        type: String,
        default: '',
      },
    },
  },
  {
    timestamps: true,
  }
);

export const Settings = mongoose.model('Settings', settingsSchema);
