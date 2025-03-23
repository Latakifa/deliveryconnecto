
import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import FeatureGrid from '@/components/FeatureGrid';
import Footer from '@/components/Footer';
import { ArrowRight, Package, Truck, ClipboardCheck, Clock } from 'lucide-react';
import AnimatedButton from '@/components/AnimatedButton';
import { Link } from 'react-router-dom';

const Index: React.FC = () => {
  // Scroll to the top when the component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <Hero />
        
        {/* Feature Grid */}
        <FeatureGrid />
        
        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 bg-secondary/50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-balance text-3xl sm:text-4xl md:text-5xl font-semibold mb-4 tracking-tight">
                How <span className="text-primary">DeliveryConnect</span> Works
              </h2>
              <p className="text-muted-foreground text-lg">
                Our platform simplifies the delivery process for both businesses and carriers
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
              {/* Business Flow */}
              <div>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
                    <Package className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-medium">For Businesses</h3>
                </div>
                
                <div className="space-y-12">
                  {[
                    {
                      step: 1,
                      title: "Create a delivery request",
                      description: "Specify package details, pickup and drop-off locations, and preferred delivery time.",
                      icon: <ClipboardCheck />
                    },
                    {
                      step: 2,
                      title: "Get matched with carriers",
                      description: "Our system automatically matches your delivery with nearby available carriers.",
                      icon: <Truck />
                    },
                    {
                      step: 3,
                      title: "Track your delivery",
                      description: "Monitor the delivery progress in real-time and receive updates throughout the process.",
                      icon: <Clock />
                    }
                  ].map((item) => (
                    <div key={item.step} className="relative flex">
                      <div className="flex flex-col items-center mr-6">
                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-white font-medium">
                          {item.step}
                        </div>
                        {item.step < 3 && (
                          <div className="h-full w-0.5 bg-border my-2"></div>
                        )}
                      </div>
                      <div>
                        <h4 className="text-xl font-medium mb-2">{item.title}</h4>
                        <p className="text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 text-center">
                  <Link to="/auth?register=true&role=business">
                    <AnimatedButton 
                      variant="primary"
                      icon={<ArrowRight className="h-4 w-4" />}
                      iconPosition="right"
                    >
                      Register as a Business
                    </AnimatedButton>
                  </Link>
                </div>
              </div>
              
              {/* Carrier Flow */}
              <div>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
                    <Truck className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-medium">For Carriers</h3>
                </div>
                
                <div className="space-y-12">
                  {[
                    {
                      step: 1,
                      title: "Browse available jobs",
                      description: "View delivery jobs in your area with all the necessary details and pricing.",
                      icon: <ClipboardCheck />
                    },
                    {
                      step: 2,
                      title: "Accept jobs that fit your schedule",
                      description: "Choose deliveries that match your availability and preferences.",
                      icon: <Package />
                    },
                    {
                      step: 3,
                      title: "Complete deliveries & get paid",
                      description: "Fulfill the delivery requirements and receive payment directly to your account.",
                      icon: <Clock />
                    }
                  ].map((item) => (
                    <div key={item.step} className="relative flex">
                      <div className="flex flex-col items-center mr-6">
                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-white font-medium">
                          {item.step}
                        </div>
                        {item.step < 3 && (
                          <div className="h-full w-0.5 bg-border my-2"></div>
                        )}
                      </div>
                      <div>
                        <h4 className="text-xl font-medium mb-2">{item.title}</h4>
                        <p className="text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 text-center">
                  <Link to="/auth?register=true&role=carrier">
                    <AnimatedButton 
                      variant="primary"
                      icon={<ArrowRight className="h-4 w-4" />}
                      iconPosition="right"
                    >
                      Register as a Carrier
                    </AnimatedButton>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* About Section */}
        <section id="about" className="py-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-balance text-3xl sm:text-4xl md:text-5xl font-semibold mb-4 tracking-tight">
                About <span className="text-primary">DeliveryConnect</span>
              </h2>
              <p className="text-muted-foreground text-lg">
                We're revolutionizing local delivery by connecting businesses with independent carriers
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <h3 className="text-2xl font-medium mb-4">Our Mission</h3>
                <p className="text-muted-foreground mb-6">
                  At DeliveryConnect, we believe in creating a more efficient, sustainable, and community-focused delivery ecosystem. Our platform empowers local businesses to optimize their delivery operations while providing flexible earning opportunities for independent carriers.
                </p>
                <p className="text-muted-foreground mb-6">
                  By connecting these two groups, we reduce delivery costs, decrease carbon emissions, support local economies, and ensure that both businesses and carriers get fair value for their services.
                </p>
                <h3 className="text-2xl font-medium mb-4">Our Vision</h3>
                <p className="text-muted-foreground">
                  We envision a future where every neighborhood has a network of trusted local carriers supporting local businesses, creating a more connected and sustainable community.
                </p>
              </div>
              
              <div className="order-1 md:order-2 relative">
                <div className="relative aspect-video max-w-lg mx-auto rounded-xl overflow-hidden shadow-lg">
                  <div className="absolute inset-0 bg-grid"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-blue-400/20"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center p-6">
                      <Package className="h-16 w-16 text-primary mx-auto mb-4" />
                      <h3 className="text-2xl font-medium mb-2">Connecting Communities</h3>
                      <p className="text-muted-foreground">
                        Through efficient, sustainable local deliveries
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute -top-6 -left-6 h-24 w-24 bg-primary/10 rounded-xl -z-10"></div>
                <div className="absolute -bottom-6 -right-6 h-24 w-24 bg-blue-400/10 rounded-xl -z-10"></div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 bg-primary/5 border-y border-primary/10">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-balance text-3xl sm:text-4xl font-semibold mb-4 tracking-tight">
                Ready to Transform Your Delivery Experience?
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Join DeliveryConnect today and be part of the future of local deliveries.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/auth?register=true&role=business">
                  <AnimatedButton 
                    variant="primary" 
                    size="lg"
                    icon={<Package className="h-5 w-5" />}
                    iconPosition="left"
                    className="w-full sm:w-auto"
                  >
                    Sign Up as Business
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
                    Sign Up as Carrier
                  </AnimatedButton>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
