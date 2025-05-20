import React from "react";
import { MessageSquare, Users, Twitter, Facebook, Instagram } from "lucide-react";

const ContactSection = () => {
  return (
    <section id="contact" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold mb-6">Contact Us</h2>
              <p className="text-gray-600 mb-8">Have questions about our platform? Get in touch with our team and we'll be happy to help.</p>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-primary-100 p-2 rounded-full mt-1 mr-4">
                    <MessageSquare size={20} className="text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Email Us</h3>
                    <p className="text-gray-600">support@designmetrics.com</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-primary-100 p-2 rounded-full mt-1 mr-4">
                    <Users size={20} className="text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Follow Us</h3>
                    <div className="flex space-x-3 mt-2">
                      <a href="#" className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors">
                        <Twitter size={18} className="text-gray-700" />
                      </a>
                      <a href="#" className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors">
                        <Facebook size={18} className="text-gray-700" />
                      </a>
                      <a href="#" className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors">
                        <Instagram size={18} className="text-gray-700" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <form className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    id="name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    placeholder="Your name"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    placeholder="your@email.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    id="message"
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    placeholder="How can we help you?"
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;