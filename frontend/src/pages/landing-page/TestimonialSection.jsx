import React, { useState, useEffect } from "react";
import { Star } from "lucide-react";

const TestimonialsSection = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Product Designer",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop",
      text: "This platform completely transformed our design workflow. The analytics features are incredibly insightful."
    },
    {
      name: "Michael Chen",
      role: "UI/UX Lead",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop",
      text: "The seamless integration between design and analytics has improved our team's productivity by 40%."
    },
    {
      name: "David Rodriguez",
      role: "Frontend Developer",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop",
      text: "As a developer, I appreciate how easy it is to implement designs from this platform into actual code."
    },
    {
      name: "Emma Wilson",
      role: "Creative Director",
      image: "https://images.unsplash.com/photo-1569913486515-b74bf7751574?q=80&w=150&auto=format&fit=crop",
      text: "The analytics integration has given our design team insights we never had before. Game changer!"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <section id="testimonials" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Clients Say</h2>
          <p className="text-lg text-gray-600">Hear from professionals who use our platform daily</p>
        </div>
        
        <div className="relative">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8 relative border border-gray-100">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/4 flex justify-center">
                  <div className="relative">
                    <img
                      src={testimonials[activeTestimonial].image}
                      alt={testimonials[activeTestimonial].name}
                      className="w-24 h-24 object-cover rounded-full"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-purple-500 text-white p-1 rounded-full">
                      <Star size={16} fill="white" />
                    </div>
                  </div>
                </div>
                <div className="md:w-3/4">
                  <blockquote className="text-gray-700 text-lg italic mb-4">
                    "{testimonials[activeTestimonial].text}"
                  </blockquote>
                  <div className="font-bold">{testimonials[activeTestimonial].name}</div>
                  <div className="text-gray-500">{testimonials[activeTestimonial].role}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-center space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${index === activeTestimonial ? 'bg-purple-500 w-4' : 'bg-gray-300'}`}
                onClick={() => setActiveTestimonial(index)}
                aria-label={`View testimonial from ${testimonials[index].name}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;


