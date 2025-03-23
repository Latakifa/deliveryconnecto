
import React from 'react';
import Feature from './Feature';
import { cn } from '@/lib/utils';
import {
  Package,
  Truck,
  MapPin,
  Clock,
  CreditCard,
  MessageCircle,
  Star,
  ShieldCheck,
} from 'lucide-react';

interface FeatureGridProps {
  className?: string;
}

const FeatureGrid: React.FC<FeatureGridProps> = ({ className }) => {
  const features = [
    {
      icon: <Package className="h-6 w-6" />,
      title: "Easy Job Posting",
      description: "Create detailed delivery jobs with just a few clicks, specifying package details, pickup and drop-off locations.",
      variant: "default",
    },
    {
      icon: <Truck className="h-6 w-6" />,
      title: "Carrier Matching",
      description: "Our smart algorithm matches your deliveries with the best local carriers based on proximity and performance.",
      variant: "highlight",
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Real-time Tracking",
      description: "Monitor your deliveries in real-time with accurate GPS tracking and status updates from pickup to delivery.",
      variant: "default",
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Scheduled Deliveries",
      description: "Plan ahead with scheduled deliveries, allowing both businesses and carriers to manage their time efficiently.",
      variant: "default",
    },
    {
      icon: <CreditCard className="h-6 w-6" />,
      title: "Secure Payments",
      description: "Integrated payment system ensures secure transactions between businesses and carriers with transparent pricing.",
      variant: "default",
    },
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: "In-App Communication",
      description: "Direct messaging between businesses and carriers eliminates communication barriers and improves coordination.",
      variant: "default",
    },
    {
      icon: <Star className="h-6 w-6" />,
      title: "Rating System",
      description: "Build trust with our comprehensive rating system, allowing both parties to review their experience.",
      variant: "default",
    },
    {
      icon: <ShieldCheck className="h-6 w-6" />,
      title: "Secure Platform",
      description: "End-to-end encryption and thorough verification process ensures a safe and reliable delivery experience.",
      variant: "default",
    },
  ];

  return (
    <section 
      id="features"
      className={cn("py-20", className)}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-balance text-3xl sm:text-4xl md:text-5xl font-semibold mb-4 tracking-tight">
            Everything You Need For <span className="text-primary">Efficient Deliveries</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Our comprehensive platform provides all the tools necessary for seamless delivery management.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Feature
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              variant={feature.variant as 'default' | 'highlight' | 'subtle'}
              className={cn(
                "animate-slide-up",
                index % 4 === 1 ? "delay-100" : 
                index % 4 === 2 ? "delay-200" :
                index % 4 === 3 ? "delay-300" : ""
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureGrid;
