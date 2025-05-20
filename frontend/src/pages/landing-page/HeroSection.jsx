import React from "react";
import { ChevronRight, ArrowRight, Star } from "lucide-react";
import Hero_Img from "../../assets/images/hero_img.png"



const HeroSection = () => {
  return (
     <section className="bg-gradient-to-b from-indigo-900 to-primary-900 text-white py-16 md:py-32">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          {/* Text Content */}
          <div className="md:w-[45%] mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight bg-gradient-to-r from-primary-500 via-primary-300 to-primary-400 bg-clip-text text-transparent">
              <span className="text-white" > Application </span>    UI/UX Design Analytics
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200 leading-relaxed">
              Transform your design workflow with powerful analytics and insights that drive better user experiences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#" className="bg-primary-500 hover:bg-primary-600 transition-all duration-300 py-3 px-6 rounded-lg font-medium flex items-center justify-center shadow-lg hover:shadow-primary-500/30">
                Get Started <ChevronRight className="ml-2" size={18} />
              </a>
              <a href="#" className="border-2 border-white/30 hover:border-white/60 hover:bg-white/10 backdrop-blur-sm transition-all duration-300 py-3 px-6 rounded-lg font-medium flex items-center justify-center group">
                <span className="group-hover:text-white">Learn More</span>
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
              </a>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 flex flex-col sm:flex-row items-center gap-4">
              {/* Avatar Stack */}
              <div className="flex -space-x-2 relative">
                {[1, 2, 3, 4].map((i) => (
                  <img
                    key={i}
                    src={`https://randomuser.me/api/portraits/${i % 2 === 0 ? 'men' : 'women'}/${i + 20}.jpg`}
                    className="w-10 h-10 rounded-full border-2 border-white hover:z-10 hover:scale-110 transition-transform duration-200"
                    alt={`User ${i}`}
                    width={40}
                    height={40}
                    loading="lazy"
                  />
                ))}
                <span className="absolute -right-3 top-0 bg-indigo-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  +4K
                </span>
              </div>

              {/* Rating and Trust Info */}
              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className="text-yellow-400 fill-yellow-400"
                      aria-hidden="true"
                    />
                  ))}
                  <span className="ml-1 text-sm font-medium text-white">5.0</span>
                </div>
                <p className="text-sm text-gray-300 mt-1">
                  Trusted by <span className="font-semibold text-white">5,000+</span> designers worldwide
                </p>
              </div>
            </div>
          </div>

          {/* Image Content */}
          <div className="md:w-[55%] flex justify-center relative">
            <div className="relative w-full ">
              {/* Main Hero Image */}
              <div className="relative z-10 rounded-lg overflow-hidden shadow-2xl border-2 border-white/10">
                <img
                  className="w-[120rem] h-[30rem] aspect-video object-cover"
                  src={Hero_Img}
                  alt="Design Analytics Dashboard"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              </div>

              {/* Floating Analytics Card */}
              <div className="absolute -bottom-8 -right-8 z-20 w-72 bg-white/90 backdrop-blur-md rounded-xl shadow-2xl border border-gray-200 overflow-hidden transform hover:scale-105 transition-transform duration-300">
                <div className="bg-primary-600 px-4 py-3 flex justify-between items-center">
                  <h3 className="font-semibold text-white">Analytics Dashboard</h3>
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>User Engagement</span>
                      <span className="font-medium">78%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-primary-400 to-primary-600 h-2 rounded-full"
                        style={{ width: "78%" }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Conversion Rate</span>
                      <span className="font-medium">42%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full"
                        style={{ width: "42%" }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <div className="text-xl font-bold text-primary-600">4.5K</div>
                      <div className="text-xs text-gray-500">Daily Users</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <div className="text-xl font-bold text-primary-600">87%</div>
                      <div className="text-xs text-gray-500">Retention</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Analytics Mini Card */}
              <div className="absolute -top-8 -left-8 z-20 w-48 bg-white rounded-lg shadow-xl overflow-hidden border border-gray-100 transform hover:scale-105 transition-transform duration-300">
                <div className="bg-primary-500 px-3 py-2 text-white text-xs font-medium flex justify-between items-center">
                  <span>Mobile Analytics</span>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-white/80"></div>
                    <div className="w-2 h-2 rounded-full bg-white/80"></div>
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex items-end justify-between h-16 mb-2">
                    <div className="w-2 h-8 bg-primary-400 rounded-t-sm"></div>
                    <div className="w-2 h-5 bg-blue-400 rounded-t-sm"></div>
                    <div className="w-2 h-9 bg-primary-500 rounded-t-sm"></div>
                    <div className="w-2 h-4 bg-blue-300 rounded-t-sm"></div>
                    <div className="w-2 h-7 bg-primary-400 rounded-t-sm"></div>
                    <div className="w-2 h-6 bg-blue-400 rounded-t-sm"></div>
                    <div className="w-2 h-8 bg-primary-500 rounded-t-sm"></div>
                  </div>
                  <div className="text-xs text-center text-gray-600 font-medium">Weekly Activity</div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -z-10 -top-20 -left-20 w-64 h-64 rounded-full bg-primary-400/10 blur-3xl"></div>
              <div className="absolute -z-10 -bottom-20 -right-20 w-64 h-64 rounded-full bg-blue-400/10 blur-3xl"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;