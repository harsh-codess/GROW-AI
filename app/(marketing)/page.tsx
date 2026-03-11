// app/(marketing)/page.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  Zap,
  Image as ImageIcon,
  MessageSquare,
  Phone,
  FileText,
  BarChart,
  ChevronRight,
  ArrowRight,
  Star,
  Sparkles,
  Menu,
  X,
  Play,
  MousePointer
} from "lucide-react";
import Header from "@/components/Header";

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  // Parallax effect values
  const y1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const videoRef = React.useRef(null);
  
  const handlePlayClick = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };


  return (
    <div className="relative bg-[#161616] text-white overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        {/* Grid pattern */}
        <div className="grid-pattern absolute inset-0 opacity-10"></div>

        {/* Gradient glows */}
        <div className="absolute top-0 left-0 right-0 h-[30vh] bg-gradient-to-b from-[#bcee45]/10 to-transparent"></div>
        <div className="absolute top-[30vh] left-[20vw] w-[40vw] h-[40vh] rounded-full bg-[#bcee45]/5 blur-[100px]"></div>
        <div className="absolute bottom-[20vh] right-[10vw] w-[30vw] h-[30vh] rounded-full bg-cyan-500/5 blur-[100px]"></div>

        {/* Animated shapes */}
        <div className="hidden md:block absolute top-[20vh] left-[10vw] w-8 h-8 border border-[#bcee45]/30 rounded-full animate-[move1_15s_infinite_linear]"></div>
        <div className="hidden md:block absolute top-[70vh] right-[15vw] w-6 h-6 border border-cyan-500/30 rounded-full animate-[flicker_10s_infinite_linear_alternate]"></div>
        <div className="hidden md:block absolute top-[40vh] right-[30vw] w-12 h-12 border border-purple-500/20 rounded-full animate-[rotate360_20s_infinite_linear]"></div>
      </div>

      {/* Navbar */}
      <Header/>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <motion.div style={{ opacity }} className="container mx-auto px-4 relative z-10 pt-16 md:pt-0">
          <div className="flex flex-col md:flex-row items-center">
            {/* Text Content */}
            <motion.div
              className="md:w-1/2 text-center md:text-left mb-10 md:mb-0"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="inline-block px-4 py-1 rounded-full bg-[#232323] text-[#bcee45] text-sm font-medium mb-6">
                <span className="flex items-center">
                  <Sparkles className="h-4 w-4 mr-2" />
                  The Future of AI Marketing
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                <span className="text-white">AI marketing that </span>
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#bcee45] to-[#dcff65]">
                  Actually Works
                </span>
              </h1>

              <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-lg">
                Transform your brand with AI-powered marketing tools. Create stunning content,
                generate visuals, and build customer engagement - all in one platform.
              </p>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <Link href="/auth/register">
                  <Button size="lg" className="bg-[#bcee45] hover:bg-[#dcff65] text-[#161616] text-base px-8 py-6 font-medium relative overflow-hidden group">
                    <span className="absolute inset-0 w-full h-full bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
                    <span className="relative z-10 flex items-center">
                      Get Started Free
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Button>
                </Link>
                <Link href="#demo">
                  <Button size="lg" variant="outline" className="text-base bg-[] px-8 py-6 border-[#323232] text-white hover:bg-[#232323] hover:text-[#bcee45] hover:border-[#bcee45]/50">
                    <Play className="mr-2 h-4 w-4" />
                    Watch Demo
                  </Button>
                </Link>
              </div>

              <div className="mt-12 flex items-center justify-center md:justify-start">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-[#161616] overflow-hidden">
                      <img
                        src={`/images/avatar-${i}.jpg`}
                        alt={`User ${i}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback if image doesn't exist
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=User+${i}&background=random`;
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div className="ml-4">
                  <div className="flex items-center text-[#bcee45]">
                    <Star className="h-4 w-4 fill-[#bcee45]" />
                    <Star className="h-4 w-4 fill-[#bcee45]" />
                    <Star className="h-4 w-4 fill-[#bcee45]" />
                    <Star className="h-4 w-4 fill-[#bcee45]" />
                    <Star className="h-4 w-4 fill-[#bcee45]" />
                  </div>
                  <p className="text-sm text-gray-400">From 2,000+ reviews</p>
                </div>
              </div>
            </motion.div>

            {/* Hero Image */}
            <motion.div
              className="md:w-1/2 relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="relative rounded-xl overflow-hidden ">
                <div className="aspect-[4/3]  relative">
                  {/* Animated glowing border */}
                  <div className="absolute inset-0  rounded-xl glow-animation"></div>

                  <div className="absolute inset-0 flex items-center justify-center">
                    <img
                      src="/landing-1.png"
                      alt="GrowAI Dashboard Preview"
                      className="w-[700px] h-[700px] object-contain"
                      onError={(e) => {
                        // Fallback if image doesn't exist
                        e.currentTarget.onerror = null;
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>

                  {/* UI Elements overlaid on top */}
                  <div className="absolute -bottom-6 -right-6 md:bottom-4 md:right-4 transform rotate-6 bg-[#1a1a1a] p-3 rounded-lg border border-[#323232] shadow-xl">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-[#bcee45] flex items-center justify-center">
                        <Zap className="h-4 w-4 text-[#161616]" />
                      </div>
                      <div>
                        <p className="text-xs font-medium">Engagement Rate</p>
                        <p className="text-xs text-[#bcee45]">+27% this month</p>
                      </div>
                    </div>
                  </div>

                  <div className="absolute -top-6 -left-6 md:top-4 md:left-4 transform -rotate-3 bg-[#1a1a1a] p-3 rounded-lg border border-[#323232] shadow-xl">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center">
                        <BarChart className="h-4 w-4 text-[#161616]" />
                      </div>
                      <div>
                        <p className="text-xs font-medium">AI Content</p>
                        <p className="text-xs text-cyan-400">125 assets</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center"
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <span className="text-sm text-gray-400 mb-2">Scroll to explore</span>
            <MousePointer className="h-5 w-5 text-[#bcee45]" />
          </motion.div>
        </motion.div>
      </section>



      {/* Features Section */}
      <section id="features" className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-block px-4 py-1 rounded-full bg-[#232323] text-[#bcee45] text-sm font-medium mb-6">
              <span className="flex items-center justify-center">
                <Sparkles className="h-4 w-4 mr-2" />
                AI-Powered Features
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
              Beyond Simple Marketing
              <span className="bg-clip-text text-transparent block bg-gradient-to-r from-[#bcee45] to-[#dcff65] mt-1">
                Enter the AI Revolution
              </span>
            </h2>
            <p className="text-lg text-gray-400">
              Everything you need to supercharge your startup's marketing efforts with cutting-edge AI technology
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuresData.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-[#1a1a1a] rounded-xl p-8 border border-[#323232] hover:border-[#bcee45]/30 transition-all group relative overflow-hidden"
              >
                {/* Glowing border effect on hover */}
                <div className="absolute inset-0 border border-[#bcee45]/0 rounded-xl group-hover:border-[#bcee45]/20 transition-all group-hover:shadow-[0_0_20px_rgba(188,238,69,0.1)] pointer-events-none"></div>

                {/* Feature content */}
                <div className="w-14 h-14 rounded-lg bg-[#232323] group-hover:bg-[#bcee45]/10 transition-colors flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-[#bcee45] transition-colors">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>

                <div className="mt-6 flex items-center text-[#bcee45] opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-sm">Learn more</span>
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-24 bg-[#191919] border-y border-[#323232] relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div
              className="lg:w-1/2"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="inline-block px-4 py-1 rounded-full bg-[#232323] text-[#bcee45] text-sm font-medium mb-6">
                <span className="flex items-center">
                  {/* <Play className="h-4 w-4 mr-2" /> */}
                  See it in action
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                Watch how GrowAI
                <span className="bg-clip-text text-transparent block bg-gradient-to-r from-[#bcee45] to-[#dcff65] mt-1">
                  transforms your workflow
                </span>
              </h2>
              <p className="text-lg text-gray-400 mb-8">
                Our AI-powered platform simplifies complex marketing tasks and brings creative automation to your fingertips.
              </p>

              <div className="space-y-5">
                {[
                  "Generate content 10x faster than traditional methods",
                  "Create professional visuals without design skills",
                  "Analyze and optimize campaigns automatically"
                ].map((item, i) => (
                  <div key={i} className="flex items-start">
                    <div className="w-6 h-6 rounded-full bg-[#bcee45]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Zap className="h-3 w-3 text-[#bcee45]" />
                    </div>
                    <p className="ml-3 text-gray-300">{item}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
      className="lg:w-1/2"
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="relative rounded-xl overflow-hidden border border-[#323232] bg-[#1a1a1a]">
        <div className="aspect-video relative">
          {/* Video background */}
          <video
            ref={videoRef}
            className="w-full h-full object-cover opacity-80"
            loop
            muted
            playsInline
            onError={(e) => {
              e.currentTarget.style.background =
                "linear-gradient(to bottom right, #2a2a2a, #1a1a1a)";
            }}
          >
            <source src="/watch.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          {/* Play button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <button 
              onClick={handlePlayClick}
              >
              <Play className="h-6 w-6 md:h-8 md:w-8 group-hover:scale-110 transition-transform" fill="currentColor" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-block px-4 py-1 rounded-full bg-[#232323] text-[#bcee45] text-sm font-medium mb-6">
              <span className="flex items-center justify-center">
                <Zap className="h-4 w-4 mr-2" />
                Simple Pricing
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
              Choose the Perfect Plan
              <span className="bg-clip-text text-transparent block bg-gradient-to-r from-[#bcee45] to-[#dcff65] mt-1">
                For Your Business
              </span>
            </h2>
            <p className="text-lg text-gray-400">
              No hidden fees or complicated pricing structures. Just transparent plans that scale with your needs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingData.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`
                  rounded-xl p-8 border ${index === 1 ? 'border-[#bcee45]/30 shadow-[0_0_40px_rgba(188,238,69,0.1)]' : 'border-[#323232]'}
                  ${index === 1 ? 'bg-gradient-to-b from-[#232323] to-[#1a1a1a]' : 'bg-[#1a1a1a]'}
                  relative overflow-hidden group
                `}
              >
                {index === 1 && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-[#bcee45] text-[#161616] text-xs font-semibold px-4 py-1 rounded-bl-lg">
                      Most Popular
                    </div>
                  </div>
                )}
                <h3 className="text-xl font-semibold text-white">{plan.title}</h3>
                <p className="text-gray-400 mt-2 h-12">{plan.description}</p>
                <div className="mt-6">
                  <span className="text-4xl font-bold text-white">${plan.price}</span>
                  <span className="text-gray-400">/month</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <div className="w-5 h-5 rounded-full bg-[#bcee45]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Zap className="h-3 w-3 text-[#bcee45]" />
                      </div>
                      <span className="ml-3 text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Link href="/auth/register">
                    <Button
                      className={`w-full py-6 ${
                        index === 1
                          ? 'bg-[#bcee45] hover:bg-[#dcff65] text-[#161616] font-medium'
                          : 'bg-[#232323] text-white border border-[#323232] hover:border-[#bcee45]/30 hover:bg-[#232323]'
                      }`}
                    >
                      {index === 1 ? 'Get Started' : 'Choose Plan'}
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-[#191919] border-y border-[#323232] relative overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
              Ready to transform your
              <span className="bg-clip-text text-transparent block bg-gradient-to-r from-[#bcee45] to-[#dcff65] mt-1">
                marketing strategy?
              </span>
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Join thousands of innovative companies already using GrowAI to grow their business.
            </p>
            <Link href="/auth/register">
              <Button size="lg" className="bg-[#bcee45] hover:bg-[#dcff65] text-[#161616] px-8 py-6 text-base font-medium relative overflow-hidden group">
                <span className="absolute inset-0 w-full h-full bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
                <span className="relative z-10 flex items-center">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </Link>
            <p className="text-gray-500 mt-4">No credit card required. Start your 14-day free trial.</p>
          </motion.div>
        </div>


        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#bcee45]/30 to-transparent"></div>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#bcee45]/30 to-transparent"></div>
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-64 h-64 bg-[#bcee45]/5 rounded-full blur-[100px]"></div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-block px-4 py-1 rounded-full bg-[#232323] text-[#bcee45] text-sm font-medium mb-6">
              <span className="flex items-center justify-center">
                <Star className="h-4 w-4 mr-2" fill="currentColor" />
                Customer Stories
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
              What Our Users Are
              <span className="bg-clip-text text-transparent block bg-gradient-to-r from-[#bcee45] to-[#dcff65] mt-1">
                Saying About Us
              </span>
            </h2>
            <p className="text-lg text-gray-400">
              Join thousands of satisfied customers who have transformed their marketing strategies with GrowAI
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-[#1a1a1a] rounded-xl p-8 border border-[#323232] relative group hover:border-[#bcee45]/30 transition-all"
              >
                <div className="absolute inset-0 border border-[#bcee45]/0 rounded-xl group-hover:border-[#bcee45]/20 transition-all group-hover:shadow-[0_0_20px_rgba(188,238,69,0.1)] pointer-events-none"></div>

                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-4 border border-[#323232]">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${testimonial.name.replace(/\s+/g, '+')}&background=random`;
                      }}
                    />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{testimonial.name}</h4>
                    <p className="text-sm text-gray-400">{testimonial.role}, {testimonial.company}</p>
                  </div>
                </div>

                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-[#bcee45] mr-1" fill="currentColor" />
                  ))}
                </div>

                <blockquote className="text-gray-300 mb-4">"{testimonial.quote}"</blockquote>

                <p className="text-sm text-gray-500">{testimonial.date}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-[#191919] border-y border-[#323232] relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-block px-4 py-1 rounded-full bg-[#232323] text-[#bcee45] text-sm font-medium mb-6">
              <span className="flex items-center justify-center">
                <MessageSquare className="h-4 w-4 mr-2" />
                Common Questions
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
              Frequently Asked
              <span className="bg-clip-text text-transparent block bg-gradient-to-r from-[#bcee45] to-[#dcff65] mt-1">
                Questions
              </span>
            </h2>
            <p className="text-lg text-gray-400">
              Everything you need to know about GrowAI and how it can help your business
            </p>
          </div>

          <div className="max-w-3xl mx-auto divide-y divide-[#323232]">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="py-6"
              >
                <h3 className="text-xl font-medium text-white mb-3">{faq.question}</h3>
                <p className="text-gray-400">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-[#1a1a1a] rounded-2xl border border-[#323232] p-8 md:p-12 relative">
            {/* Animated gradient border */}
            <div className="absolute inset-0 rounded-2xl border border-[#bcee45]/20 glow-animation pointer-events-none"></div>

            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4 text-white">
                  Start your AI marketing journey today
                </h2>
                <p className="text-gray-400 mb-6">
                  Join over 10,000 companies already using GrowAI to revolutionize their marketing strategy.
                </p>
                <Link href="/auth/register">
                  <Button className="bg-[#bcee45] hover:bg-[#dcff65] text-[#161616] px-8 py-6 text-base font-medium relative overflow-hidden group">
                    <span className="absolute inset-0 w-full h-full bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
                    <span className="relative z-10 flex items-center">
                      Start Free Trial
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Button>
                </Link>
                <p className="text-sm text-gray-500 mt-4">No credit card required. 14-day free trial.</p>
              </div>

              <div className="flex flex-col space-y-4">
                {['No credit card required', 'Cancel anytime', '24/7 customer support', 'Regular feature updates'].map((item, i) => (
                  <div key={i} className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-[#bcee45]/20 flex items-center justify-center flex-shrink-0">
                      <Zap className="h-3 w-3 text-[#bcee45]" />
                    </div>
                    <span className="ml-3 text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#161616] border-t border-[#323232] text-gray-400 py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#bcee45] to-[#dcff65]">GrowAI</h3>
              <p className="text-gray-500">
                AI-powered marketing suite designed to help startups grow faster with less effort.
              </p>
              <div className="mt-6 flex space-x-4">
                {['Twitter', 'LinkedIn', 'Facebook', 'Instagram'].map((social, i) => (
                  <a key={i} href="#" className="w-10 h-10 rounded-full bg-[#232323] flex items-center justify-center hover:bg-[#bcee45]/20 transition-colors">
                    <span className="text-sm">{social.charAt(0)}</span>
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link href="#features" className="hover:text-[#bcee45] transition">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-[#bcee45] transition">Pricing</Link></li>
                <li><Link href="#" className="hover:text-[#bcee45] transition">Roadmap</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="hover:text-[#bcee45] transition">About</Link></li>
                <li><Link href="#" className="hover:text-[#bcee45] transition">Blog</Link></li>
                <li><Link href="#" className="hover:text-[#bcee45] transition">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="hover:text-[#bcee45] transition">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-[#bcee45] transition">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-[#bcee45] transition">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#323232] mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p>© 2025 GrowAI. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="#" className="hover:text-[#bcee45] transition">Privacy</Link>
              <Link href="#" className="hover:text-[#bcee45] transition">Terms</Link>
              <Link href="#" className="hover:text-[#bcee45] transition">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Global CSS for animations */}
      <style jsx global>{`
        /* Grid pattern */
        .grid-pattern {
          background-size: 25px 25px;
          background-image:
            linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
        }

        /* Animations */
        @keyframes move1 {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(20px, 20px); }
          50% { transform: translate(0, 40px); }
          75% { transform: translate(-20px, 20px); }
        }

        @keyframes flicker {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.2; }
        }

        @keyframes rotate360 {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes glow {
          0%, 100% { opacity: 0.3; box-shadow: 0 0 20px rgba(188, 238, 69, 0.1); }
          50% { opacity: 0.6; box-shadow: 0 0 30px rgba(188, 238, 69, 0.2); }
        }

        .glow-animation {
          animation: glow 3s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}

const featuresData = [
  {
    title: "AI Product Photoshoot",
    description: "Transform basic product photos into professional marketing images with our AI image generation technology.",
    icon: <ImageIcon className="h-6 w-6 text-[#bcee45]" />,
  },
  {
    title: "Marketing Chat Assistant",
    description: "Get instant marketing advice and content suggestions from our AI assistant that knows your brand.",
    icon: <MessageSquare className="h-6 w-6 text-[#bcee45]" />,
  },
  {
    title: "Voice Sales Agent",
    description: "Deploy AI voice agents that can handle customer calls and qualify leads 24/7.",
    icon: <Phone className="h-6 w-6 text-[#bcee45]" />,
  },
  {
    title: "Content Generation",
    description: "Create blogs, social media posts, and email campaigns tailored to your brand voice in seconds.",
    icon: <FileText className="h-6 w-6 text-[#bcee45]" />,
  },
  {
    title: "Email Marketing Engine",
    description: "Design, schedule, and analyze email campaigns with AI-powered optimization.",
    icon: <Zap className="h-6 w-6 text-[#bcee45]" />,
  },
  {
    title: "Competitor Analysis",
    description: "Track your competitors and identify market opportunities with automated market intelligence.",
    icon: <BarChart className="h-6 w-6 text-[#bcee45]" />,
  },
];

const pricingData = [
  {
    title: "Starter",
    description: "For new startups just beginning",
    price: 49,
    features: [
      "AI product images (20/mo)",
      "Marketing chat assistant",
      "Basic content generation",
      "Email campaign tools",
      "Standard support"
    ]
  },
  {
    title: "Professional",
    description: "For growing startups with established needs",
    price: 99,
    features: [
      "AI product images (50/mo)",
      "Advanced marketing assistant",
      "Full content generation suite",
      "Email campaign tools",
      "Voice agent (1 number)",
      "Priority support"
    ]
  },
  {
    title: "Enterprise",
    description: "For scaling startups with complex needs",
    price: 249,
    features: [
      "Unlimited AI product images",
      "Advanced marketing assistant",
      "Full content generation suite",
      "Advanced email campaigns",
      "Voice agents (5 numbers)",
      "Competitor analysis",
      "Dedicated support"
    ]
  }
];

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Marketing Director",
    company: "TechStart",
    avatar: "/images/testimonials/sarah.jpg",
    quote: "GrowAI has transformed how we approach content creation. We've reduced our marketing production time by 70% while increasing engagement by 45%.",
    date: "June 15, 2024"
  },
  {
    name: "Michael Chen",
    role: "Founder & CEO",
    company: "Pulse Commerce",
    avatar: "/images/testimonials/michael.jpg",
    quote: "The AI-generated product images are incredible. Our conversion rates have increased by 28% since implementing GrowAI into our workflow.",
    date: "May 22, 2024"
  },
  {
    name: "Emily Rodriguez",
    role: "Growth Lead",
    company: "NovaSphere",
    avatar: "/images/testimonials/emily.jpg",
    quote: "The competitor analysis tool alone has been worth the investment. We've identified key market opportunities that were previously invisible to us.",
    date: "July 3, 2024"
  }
];

const faqs = [
  {
    question: "How does the AI content generation work?",
    answer: "Our AI content generation uses advanced language models trained on marketing best practices. Simply input your brand guidelines, target audience, and content goals, and the AI will generate optimized content specifically for your brand."
  },
  {
    question: "Can I integrate GrowAI with my existing tools?",
    answer: "Yes! GrowAI integrates seamlessly with popular tools like Shopify, WooCommerce, Mailchimp, HubSpot, and more. Our API also allows for custom integrations with your existing systems."
  },
  {
    question: "Is there a limit to how many AI images I can create?",
    answer: "Each plan comes with a specified number of AI-generated images per month. Starter plans include 20 images, Professional plans include 50, and Enterprise plans offer unlimited image generation."
  },
  {
    question: "Do I need technical skills to use GrowAI?",
    answer: "Not at all! GrowAI is designed with a user-friendly interface that requires no technical expertise. Our intuitive dashboard makes it easy for anyone on your team to create AI-powered content."
  },
  {
    question: "Can I cancel my subscription at any time?",
    answer: "Yes, you can cancel your subscription at any time with no cancellation fees. Your access will continue until the end of your billing period."
  }
];

