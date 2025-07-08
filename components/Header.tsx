"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Menu, ArrowRight, X, Sparkles } from "lucide-react";

// Navigation items - update these with your own links
const NAV_ITEMS = [
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "#testimonials", label: "Testimonials" },
  { href: "#demo", label: "Demo" },
];

const Header = () => {
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [visible, setVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      setVisible(prevScrollPos > currentScrollPos || currentScrollPos < 10);
      setIsScrolled(currentScrollPos > 50);
      setPrevScrollPos(currentScrollPos);
    };

    const handleClickOutside = (event) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [prevScrollPos]);

  // Close mobile menu when pressing escape key
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => document.removeEventListener("keydown", handleEscKey);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed z-50 transition-all duration-500",
          "left-0 right-0 backdrop-blur-xl",
          "bg-[#161616]/80 rounded-xl border border-[#323232]/70",
          "shadow-[0_10px_30px_rgba(0,0,0,0.7)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.5)]",
          "mx-4 mt-4",
          "sm:mx-6 sm:mt-6",
          "lg:mx-40 lg:mt-6",
          {
            "translate-y-0 opacity-100": visible,
            "-translate-y-full opacity-0": !visible,
            "lg:mx-60 lg:translate-y-4 bg-[#1a1a1a]/90 border-[#bcee45]/10": isScrolled,
          }
        )}
      >
        <div className="flex items-center justify-between h-[70px] px-4 py-2">
          <Link href="/" className="relative flex-shrink-0 group">
            <div className="flex items-center">
             
              <img src={"/logo.png"} alt="Logo" width={80}  height={80}/>
                
            </div>
          </Link>

          <nav className="hidden md:block mx-4 flex-grow">
            <ul className="flex items-center justify-center space-x-6 lg:space-x-12">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-gray-300 hover:text-[#bcee45] font-medium text-base lg:text-lg transition-colors whitespace-nowrap relative group"
                  >
                    {item.label}
                    <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#bcee45] group-hover:w-full transition-all duration-300"></span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="hidden md:flex space-x-3">
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-300 hover:text-white border border-transparent hover:border-[#323232] rounded-lg transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center px-4 lg:px-6 py-2 text-sm font-medium text-[#161616] bg-[#bcee45] hover:bg-[#dcff65] rounded-lg h-11 
              min-w-[120px] lg:w-40 transition-colors whitespace-nowrap relative overflow-hidden group"
            >
              <span className="absolute inset-0 w-full h-full bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
              <span className="flex items-center relative z-10">
                Sign Up Free
                <Sparkles className="ml-2 h-4 w-4" />
              </span>
            </Link>
          </div>

          <button
            className="md:hidden p-2 text-gray-300 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-50 md:hidden bg-black/70 backdrop-blur-md transition-opacity",
          {
            "opacity-100 pointer-events-auto": isMobileMenuOpen,
            "opacity-0 pointer-events-none": !isMobileMenuOpen,
          }
        )}
      >
        {/* Mobile Menu Content */}
        <div
          ref={mobileMenuRef}
          className={cn(
            "fixed right-0 top-0 h-full w-[280px] sm:w-[300px] bg-[#1a1a1a] border-l border-[#323232] p-6 transition-transform duration-300",
            {
              "translate-x-0": isMobileMenuOpen,
              "translate-x-full": !isMobileMenuOpen,
            }
          )}
        >
          <div className="flex justify-between items-center mb-8">
            <Link href="/" className="relative block group">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-[#bcee45] to-[#9bc42c] flex items-center justify-center mr-2">
                  <span className="text-[#161616] font-bold">F</span>
                </div>
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#bcee45] to-[#dcff65]">
                  FlowAI
                </span>
              </div>
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 hover:bg-[#232323] rounded-full transition-colors text-gray-400 hover:text-white"
              aria-label="Close mobile menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex flex-col space-y-6">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-300 hover:text-[#bcee45] text-lg font-medium transition-colors flex items-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
                <ArrowRight className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
            
            <div className="h-px bg-[#323232] my-2"></div>
            
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-gray-300 hover:text-white border border-[#323232] hover:border-[#bcee45]/30 rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Log In
            </Link>
            
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-[#161616] bg-[#bcee45] hover:bg-[#dcff65] rounded-lg transition-colors relative overflow-hidden group"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="absolute inset-0 w-full h-full bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
              <span className="flex items-center relative z-10">
                Sign Up Free
                <Sparkles className="ml-2 h-4 w-4" />
              </span>
            </Link>
          </div>
          
          {/* Footer */}
          <div className="absolute bottom-8 left-6 right-6">
            <div className="p-4 rounded-lg bg-[#232323] border border-[#323232]">
              <p className="text-sm text-gray-400 mb-3">Ready to transform your marketing with AI?</p>
              <Link
                href="/auth/register"
                className="inline-flex items-center text-[#bcee45] text-sm font-medium"
              >
                Get started today 
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;