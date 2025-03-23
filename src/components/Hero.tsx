
import React from 'react';
import AnimatedButton from './AnimatedButton';
import { Link } from 'react-router-dom';
import { ArrowRight, Package, Truck, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

const Hero: React.FC = () => {
  return (
    <section className="relative pt-28 pb-20 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-grid opacity-30 -z-10"></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl -z-10"></div>
      <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-blue-400/10 rounded-full filter blur-3xl -z-10"></div>
      
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Primary badge */}
          <div 
            className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-primary/10 text-primary mb-6 animate-fade-in"
          >
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
            Revolutionizing Local Deliveries
          </div>
          
          {/* Main Heading */}
          <h1 className="text-balance font-semibold text-4xl sm:text-5xl md:text-6xl mb-6 tracking-tight animate-fade-in">
            <span className="block">Connect Your Business With</span>
            <span className="block text-primary">Local Delivery Carriers</span>
          </h1>
          
          {/* Subheading / Description */}
          <p className="text-balance text-muted-foreground text-lg md:text-xl mb-8 max-w-2xl mx-auto animate-fade-in delay-100">
            Our platform connects businesses with independent local carriers for faster, 
            more cost-effective deliveries while supporting local economies.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16 animate-fade-in delay-200">
            <Link to="/auth?register=true&role=business">
              <AnimatedButton 
                variant="primary" 
                size="lg"
                icon={<Package className="h-5 w-5" />}
                iconPosition="left"
                className="w-full sm:w-auto"
              >
                I'm a Business
              </AnimatedButton>
            </Link>
            <Link to="/auth?register=true&role=carrier">
              <AnimatedButton 
                variant="outline" 
                size="lg"
                icon={<Truck className="h-5 w-5" />}
                iconPosition="left"
                className="w-full sm:w-auto"
              >
                I'm a Carrier
              </AnimatedButton>
            </Link>
          </div>
          
          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                icon: <Package className="h-6 w-6 text-primary" />,
                title: "Post Delivery Jobs",
                description: "Create delivery requests with details on pickup and drop-off locations."
              },
              {
                icon: <Truck className="h-6 w-6 text-primary" />,
                title: "Match with Carriers",
                description: "Connect with local carriers based on location, availability and rating."
              },
              {
                icon: <MapPin className="h-6 w-6 text-primary" />,
                title: "Real-time Tracking",
                description: "Monitor deliveries in real-time with accurate location updates."
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className={cn(
                  "flex flex-col items-center text-center p-6 rounded-xl neo-card animate-slide-up",
                  index === 1 ? "delay-100" : index === 2 ? "delay-200" : ""
                )}
              >
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-medium text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
