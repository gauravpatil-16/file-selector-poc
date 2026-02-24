import { serviceService } from './serviceService';
import { availabilityService } from './availabilityService';
import { bookingConfigurationService } from './bookingConfigurationService';

class DataInitializer {
  constructor() {
    this.initialized = false;
  }

  async initializeIfNeeded() {
    if (this.initialized) return;

    try {
      // Check if we already have data
      const [existingServices, existingAvailability] = await Promise.all([
        serviceService.getAll(),
        availabilityService.getAll()
      ]);

      // Only initialize if we have no data
      if (existingServices.length === 0) {
        await this.generateSampleServices();
      }

      if (existingAvailability.length === 0) {
        await this.generateSampleAvailability();
      }

      // Initialize booking configuration for authenticated users
      await this.initializeBookingConfig();

      this.initialized = true;
    } catch (error) {
      console.error('Error initializing sample data:', error);
    }
  }

  async initializeBookingConfig() {
    try {
      // Ensure user has booking configuration (getUserConfig auto-creates if missing)
      await bookingConfigurationService.getUserConfig();
      console.log('Booking configuration initialized for user');
    } catch (error) {
      console.error('Error initializing booking configuration:', error);
    }
  }
async generateSampleServices() {
    const sampleServices = [
      {
        name: "Executive Business Consultation",
        duration: 90,
        price: 250.00,
        description: "High-level strategic business planning and growth consultation. Perfect for executives and established companies looking to expand their market reach and optimize operations.",
        isActive: true
      },
      {
        name: "Personal Training Session",
        duration: 60,
        price: 85.00,
        description: "One-on-one fitness training session tailored to your specific goals. Includes personalized workout plan, nutrition guidance, and progress tracking.",
        isActive: true
      },
      {
        name: "Legal Consultation",
        duration: 120,
        price: 300.00,
        description: "Comprehensive legal advice and document review with experienced attorney. Covers business law, contracts, intellectual property, and regulatory compliance.",
        isActive: true
      },
      {
        name: "Individual Therapy Session",
        duration: 50,
        price: 140.00,
        description: "Professional therapy session with licensed clinical counselor. Confidential and supportive environment for personal growth, mental wellness, and life challenges.",
        isActive: true
      },
      {
        name: "Financial Planning Consultation",
        duration: 90,
        price: 175.00,
        description: "Comprehensive financial planning consultation with certified advisor. Includes investment strategies, retirement planning, tax optimization, and wealth management advice.",
        isActive: true
      },
      {
        name: "Premium Hair Cut & Styling",
        duration: 75,
        price: 95.00,
        description: "Complete hair styling experience with master stylist. Includes consultation, precision cut, professional styling, and premium product treatment for optimal results.",
        isActive: true
      },
      {
        name: "Deep Tissue Therapeutic Massage",
        duration: 90,
        price: 120.00,
        description: "Professional therapeutic massage to relieve chronic tension and muscle stress. Combines Swedish, deep tissue, and trigger point techniques for maximum therapeutic benefit.",
        isActive: true
      },
      {
        name: "Professional Photography Session",
        duration: 120,
        price: 225.00,
        description: "Premium portrait or lifestyle photography session with professional photographer. Includes multiple outfit changes, professional lighting, digital editing, and high-resolution gallery.",
        isActive: true
      },
      {
        name: "Tax Preparation & Strategy",
        duration: 75,
        price: 150.00,
        description: "Comprehensive tax preparation and planning service with certified tax professional. Maximize deductions, minimize liability, and develop year-round tax strategies.",
        isActive: true
      },
      {
        name: "Quick Consultation Call",
        duration: 30,
        price: 65.00,
        description: "Focused consultation session for urgent questions and initial assessments. Perfect for first-time clients, project kickoffs, or time-sensitive matters requiring expert guidance.",
        isActive: true
      },
      {
        name: "Executive Coaching Session",
        duration: 60,
        price: 200.00,
        description: "Professional executive coaching for leadership development and career advancement. Focus on communication skills, team management, and strategic thinking.",
        isActive: true
      },
      {
        name: "Nutritional Consultation",
        duration: 45,
        price: 90.00,
        description: "Comprehensive nutritional assessment and meal planning with registered dietitian. Includes personalized nutrition plan and ongoing support recommendations.",
        isActive: true
      },
      {
        name: "Home Design Consultation",
        duration: 90,
        price: 165.00,
        description: "Interior design consultation for residential spaces. Includes space planning, color schemes, furniture recommendations, and design concept development.",
        isActive: true
      },
      {
        name: "IT Technology Consultation",
        duration: 60,
        price: 125.00,
        description: "Technology consulting for businesses and individuals. Covers system optimization, security assessment, software recommendations, and digital transformation planning.",
        isActive: true
      },
      {
        name: "Career Coaching Session",
        duration: 75,
        price: 110.00,
        description: "Professional career coaching and development session. Includes resume review, interview preparation, career planning, and professional networking strategies.",
        isActive: true
      }
    ];

    try {
      for (const service of sampleServices) {
        await serviceService.create(service);
      }
      console.log(`Generated ${sampleServices.length} comprehensive sample services with unique slugs and diverse pricing`);
    } catch (error) {
      console.error('Error generating sample services:', error);
    }
  }

async generateSampleAvailability() {
    // Generate service-specific availability schedules
    try {
      // Get all existing services first
      const services = await serviceService.getAll();
      
      if (services.length === 0) {
        console.log('No services found, skipping availability generation');
        return;
      }

      // Different availability patterns for different service types
      const availabilityPatterns = [
        // Business consultation pattern
        [
          { dayOfWeek: 1, startTime: "09:00", endTime: "17:00", isActive: true },
          { dayOfWeek: 2, startTime: "09:00", endTime: "17:00", isActive: true },
          { dayOfWeek: 3, startTime: "09:00", endTime: "17:00", isActive: true },
          { dayOfWeek: 4, startTime: "09:00", endTime: "17:00", isActive: true },
          { dayOfWeek: 5, startTime: "09:00", endTime: "15:00", isActive: true }
        ],
        // Personal services pattern (extended hours)
        [
          { dayOfWeek: 1, startTime: "08:00", endTime: "19:00", isActive: true },
          { dayOfWeek: 2, startTime: "08:00", endTime: "19:00", isActive: true },
          { dayOfWeek: 3, startTime: "08:00", endTime: "19:00", isActive: true },
          { dayOfWeek: 4, startTime: "08:00", endTime: "20:00", isActive: true },
          { dayOfWeek: 5, startTime: "08:00", endTime: "18:00", isActive: true },
          { dayOfWeek: 6, startTime: "09:00", endTime: "16:00", isActive: true }
        ],
        // Professional services pattern
        [
          { dayOfWeek: 0, startTime: "10:00", endTime: "15:00", isActive: true },
          { dayOfWeek: 1, startTime: "08:30", endTime: "17:30", isActive: true },
          { dayOfWeek: 2, startTime: "08:30", endTime: "17:30", isActive: true },
          { dayOfWeek: 3, startTime: "08:30", endTime: "17:30", isActive: true },
          { dayOfWeek: 4, startTime: "08:30", endTime: "17:30", isActive: true },
          { dayOfWeek: 5, startTime: "08:30", endTime: "17:30", isActive: true },
          { dayOfWeek: 6, startTime: "09:00", endTime: "14:00", isActive: true }
        ]
      ];

      // Assign availability patterns to services
      for (let i = 0; i < services.length; i++) {
        const service = services[i];
        const patternIndex = i % availabilityPatterns.length;
        const schedule = availabilityPatterns[patternIndex];
        
        await availabilityService.generateServiceAvailability(service.Id, schedule);
      }

      console.log(`Generated service-specific availability for ${services.length} services with varied schedules`);
    } catch (error) {
      console.error('Error generating sample availability:', error);
    }
  }

reset() {
    this.initialized = false;
  }
}
// Export singleton instance
const dataInitializer = new DataInitializer();
export { dataInitializer };