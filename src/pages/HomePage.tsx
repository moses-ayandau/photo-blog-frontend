import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Upload, Share, Recycle, Camera, Heart, Image } from 'lucide-react';
import Navigation from '@/components/layout/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion, useScroll, useTransform, useAnimation, AnimatePresence } from 'framer-motion';

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const scrollRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start start", "end start"]
  });
  
  // Animation controls for continuous scrolling
  const firstColumnControls = useAnimation();
  const secondColumnControls = useAnimation();
  
  // Create parallax effect values
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.6]);
  
  // First column images with more images
  const firstColumnImages = [
    { 
      id: 1, 
      height: "h-64", 
      img: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=600&h=400",
    },
    { 
      id: 2, 
      height: "h-40", 
      img: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=600&h=250",
    },
    { 
      id: 3, 
      height: "h-56", 
      img: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&h=350",
    },
    { 
      id: 4, 
      height: "h-48", 
      img: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&h=300",
    },
    { 
      id: 5, 
      height: "h-52", 
      img: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&h=320",
    },
    { 
      id: 6, 
      height: "h-44", 
      img: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=600&h=280",
    },
  ];
  
  // Second column images with more images
  const secondColumnImages = [
    { 
      id: 7, 
      height: "h-48", 
      img: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&h=300",
    },
    { 
      id: 8, 
      height: "h-64", 
      img: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=600&h=400",
    },
    { 
      id: 9, 
      height: "h-40", 
      img: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&h=250",
    },
    { 
      id: 10, 
      height: "h-56", 
      img: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&w=600&h=350",
    },
    { 
      id: 11, 
      height: "h-48", 
      img: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=600&h=300",
    },
    { 
      id: 12, 
      height: "h-52", 
      img: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&h=320",
    },
  ];
  
  // Start continuous scrolling animations with smoother parameters
  useEffect(() => {
    // First column scrolls up - slower and smoother
    firstColumnControls.start({
      y: [0, -1200],
      transition: {
        y: {
          repeat: Infinity,
          repeatType: "loop",
          duration: 60, // Longer duration for smoother movement
          ease: "linear"
        }
      }
    });
    
    // Second column scrolls down - slower and smoother
    secondColumnControls.start({
      y: [-1200, 0],
      transition: {
        y: {
          repeat: Infinity,
          repeatType: "loop",
          duration: 60, // Longer duration for smoother movement
          ease: "linear"
        }
      }
    });
    
    // Add a cleanup function to stop animations when component unmounts
    return () => {
      firstColumnControls.stop();
      secondColumnControls.stop();
    };
  }, [firstColumnControls, secondColumnControls]);
  
  return (
    <div className="min-h-screen flex flex-col" ref={scrollRef}>
      <Navigation />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary/10 to-primary/5 py-20 md:py-32 overflow-hidden">
          {/* Remove the grid pattern by setting opacity to 0 or removing this div entirely */}
          {/* <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div> */}

          {/* Add a subtle mouse parallax effect to the hero content */}
          <motion.div 
            className="absolute inset-0 pointer-events-none"
            animate={{ 
              backgroundPosition: ["0% 0%", "100% 100%"],
              backgroundSize: ["100% 100%", "120% 120%"]
            }}
            transition={{ 
              duration: 15, 
              repeat: Infinity, 
              repeatType: "mirror" 
            }}
          />
          
          {/* Floating elements in background */}
          <motion.div 
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-primary/10"
                style={{
                  width: Math.random() * 100 + 50,
                  height: Math.random() * 100 + 50,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                initial={{ 
                  scale: 0,
                  opacity: 0.1 + Math.random() * 0.3
                }}
                animate={{ 
                  scale: 0.8 + Math.random() * 0.5,
                  y: [0, Math.random() * 30 - 15, 0],
                }}
                transition={{ 
                  scale: { duration: 0.8, delay: i * 0.1 },
                  y: { 
                    repeat: Infinity, 
                    duration: 3 + Math.random() * 5,
                    repeatType: "reverse" 
                  }
                }}
              />
            ))}
          </motion.div>

          <div className="container mx-auto px-4 text-center md:text-left relative z-10">
            <div className="max-w-2xl md:ml-8 lg:ml-16">
              <motion.h1 
                className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                  Your personal photo journey
                </span>
              </motion.h1>

              {/* Add a subtle typing animation effect */}
              <motion.div 
                className="flex items-center justify-center md:justify-start mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                <div className="h-1 w-6 bg-primary/50 rounded mr-3"></div>
                <p className="text-sm text-gray-500 font-medium">Secure • Simple • Beautiful</p>
              </motion.div>
              
              <motion.p 
                className="text-lg md:text-xl text-gray-600 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Upload, organize, and share your photos with ease. All your memories in one secure place.
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row justify-center md:justify-start space-y-4 sm:space-y-0 sm:space-x-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                {isAuthenticated ? (
                  <Link to="/dashboard">
                    <Button size="lg" className="w-full sm:w-auto">
                      Go to Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/auth">
                      <Button size="lg" className="w-full sm:w-auto group">
                        <span>Get Started</span>
                        <motion.span
                          className="ml-2"
                          animate={{ x: [0, 5, 0] }}
                          transition={{ repeat: Infinity, duration: 1.5, repeatDelay: 1 }}
                        >
                          →
                        </motion.span>
                      </Button>
                    </Link>
                    <Link to="/auth">
                      <Button variant="outline" size="lg" className="w-full sm:w-auto">
                        Sign In
                      </Button>
                    </Link>
                  </>
                )}
              </motion.div>
            </div>
          </div>
          
          {/* Photo Gallery with smoother continuous scrolling effect */}
          <div className="hidden md:block absolute right-0 top-0 h-full w-2/5 overflow-hidden">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-white/50 to-white/90 z-10" />
            
            <motion.div className="grid grid-cols-2 gap-4 h-full relative z-0" style={{ opacity }}>
              {/* First column - scrolling up */}
              <div className="relative h-full overflow-hidden">
                <motion.div 
                  className="space-y-4 absolute w-full"
                  animate={firstColumnControls}
                  style={{
                    willChange: "transform",
                    translateZ: 0
                  }}
                >
                  {/* Duplicate images for seamless loop */}
                  {[...firstColumnImages, ...firstColumnImages].map((item, index) => (
                    <motion.div
                      key={`${item.id}-${index}`}
                      className={`${item.height} rounded-xl overflow-hidden shadow-md`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.05 }} // Faster appearance
                      whileHover={{ 
                        scale: 1.05, 
                        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                        transition: { duration: 0.2 }
                      }}
                      style={{
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                        transform: "translateZ(0)",
                        WebkitTransform: "translateZ(0)"
                      }}
                    >
                      <img 
                        src={item.img} 
                        alt="Photo" 
                        className="w-full h-full object-cover" 
                        loading="lazy" // Add lazy loading for better performance
                        style={{
                          imageRendering: "auto",
                          backfaceVisibility: "hidden",
                          WebkitBackfaceVisibility: "hidden"
                        }}
                      />
                      
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 flex items-end p-3"
                        whileHover={{ opacity: 1 }}
                      >
                        <motion.div 
                          initial={{ y: 10, opacity: 0 }}
                          whileHover={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-center space-x-2"
                        >
                          <Heart className="h-4 w-4 text-white" />
                          <span className="text-white text-sm">{Math.floor(Math.random() * 1000)}</span>
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
              
              {/* Second column - scrolling down */}
              <div className="relative h-full overflow-hidden">
                <motion.div 
                  className="space-y-4 absolute w-full"
                  animate={secondColumnControls}
                  style={{
                    willChange: "transform",
                    translateZ: 0
                  }}
                >
                  {/* Duplicate images for seamless loop */}
                  {[...secondColumnImages, ...secondColumnImages].map((item, index) => (
                    <motion.div
                      key={`${item.id}-${index}`}
                      className={`${item.height} rounded-xl overflow-hidden shadow-md`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.05 }} // Faster appearance
                      whileHover={{ 
                        scale: 1.05, 
                        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                        transition: { duration: 0.2 }
                      }}
                      style={{
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                        transform: "translateZ(0)",
                        WebkitTransform: "translateZ(0)"
                      }}
                    >
                      <img 
                        src={item.img} 
                        alt="Photo" 
                        className="w-full h-full object-cover" 
                        loading="lazy" // Add lazy loading for better performance
                        style={{
                          imageRendering: "auto",
                          backfaceVisibility: "hidden",
                          WebkitBackfaceVisibility: "hidden"
                        }}
                      />
                      
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 flex items-end p-3"
                        whileHover={{ opacity: 1 }}
                      >
                        <motion.div 
                          initial={{ y: 10, opacity: 0 }}
                          whileHover={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-center space-x-2"
                        >
                          <Heart className="h-4 w-4 text-white" />
                          <span className="text-white text-sm">{Math.floor(Math.random() * 1000)}</span>
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Everything you need for your photos</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Easy Upload</h3>
                <p className="text-gray-600">
                  Simply drag and drop your photos or use our file picker.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <Share className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Secure Sharing</h3>
                <p className="text-gray-600">
                  Generate temporary links to share your photos with friends.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <Recycle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Recycle Bin</h3>
                <p className="text-gray-600">
                  Recover deleted photos for up to 30 days.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="bg-gradient-to-r from-primary/80 to-primary py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to store your memories?</h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Join thousands of users who trust PixPath with their precious photos.
            </p>
            
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-gray-100">
                Start for Free
              </Button>
            </Link>
          </div>
        </section>
      </main>
      
      <footer className="bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <p className="text-sm text-gray-600">
                &copy; {new Date().getFullYear()} PixPath. All rights reserved.
              </p>
            </div>
            
            <div className="flex space-x-6">
              <a href="#" className="text-gray-600 hover:text-primary text-sm">Privacy Policy</a>
              <a href="#" className="text-gray-600 hover:text-primary text-sm">Terms of Service</a>
              <a href="#" className="text-gray-600 hover:text-primary text-sm">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
