"use client"

import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { ArrowRight, Terminal, Code, Database, Zap, Heart, X, ArrowUp, Star } from 'lucide-react'

interface SplashScreenProps {
  onEnter: () => void
}

const codeLines = [
  "def analyze_user_preferences(swipe_history):",
  "    feature_matrix = extract_features(swipe_history)",
  "    user_profile = ml_model.predict(feature_matrix)",
  "    return user_profile",
  "",
  "def generate_recommendations(user_profile):",
  "    candidates = movie_db.get_unwatched_movies()",
  "    scores = similarity_engine.compute(user_profile, candidates)",
  "    return ranked_recommendations(scores)",
  "",
  "if __name__ == '__main__':",
  "    print('SWIMO Recommendation Engine v2.0')",
  "    engine = RecommendationEngine()",
  "    engine.start()",
]

const techStack = [
  { icon: <Code className="w-5 h-5" />, name: "FastAPI", desc: "High-performance Python backend" },
  { icon: <Database className="w-5 h-5" />, name: "PostgreSQL", desc: "Robust data persistence" },
  { icon: <Zap className="w-5 h-5" />, name: "Next.js", desc: "Modern React framework" },
  { icon: <Terminal className="w-5 h-5" />, name: "Docker", desc: "Containerized deployment" },
]

export default function SplashScreen({ onEnter }: SplashScreenProps) {
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const [currentCharIndex, setCurrentCharIndex] = useState(0)
  const [displayedCode, setDisplayedCode] = useState<string[]>([])

  useEffect(() => {
    if (currentLineIndex >= codeLines.length) return

    const currentLine = codeLines[currentLineIndex]
    
    if (currentCharIndex <= currentLine.length) {
      const timeout = setTimeout(() => {
        setDisplayedCode(prev => {
          const newCode = [...prev]
          newCode[currentLineIndex] = currentLine.slice(0, currentCharIndex)
          return newCode
        })
        setCurrentCharIndex(prev => prev + 1)
      }, currentLine === "" ? 300 : 50) // Faster typing, slower for empty lines

      return () => clearTimeout(timeout)
    } else {
      // Move to next line
      const timeout = setTimeout(() => {
        setCurrentLineIndex(prev => prev + 1)
        setCurrentCharIndex(0)
      }, 200)

      return () => clearTimeout(timeout)
    }
  }, [currentLineIndex, currentCharIndex])

  return (
    <div className="fixed inset-0 bg-slate-900 text-slate-50 overflow-y-auto">
      <div className="container mx-auto px-6 py-12 max-w-7xl min-h-full">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 bg-slate-800/60 backdrop-blur-sm px-6 py-3 rounded-full border border-slate-700/50 mb-6">
            <Terminal className="w-5 h-5 text-orange-500" />
            <span className="text-slate-300 font-mono text-sm">swimo://algorithm-v2.0</span>
          </div>
          
          <h1 className="text-7xl md:text-8xl font-black text-slate-50 mb-4 tracking-tight">
            SWIMO
          </h1>
          <p className="text-2xl text-orange-500 font-medium mb-2">
            Intelligent Movie Discovery Engine
          </p>
          <p className="text-slate-400 text-lg">
            Where machine learning meets movie night
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          
                     {/* Code Terminal */}
           <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
             <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/60 border-b border-slate-700/50">
               <div className="flex gap-2">
                 <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                 <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                 <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
               </div>
               <span className="text-slate-400 text-sm ml-4 font-mono truncate">recommendation_engine.py</span>
             </div>
             
             <div className="p-4 md:p-6 font-mono text-xs md:text-sm overflow-x-auto">
               {displayedCode.map((line, index) => (
                 <div key={index} className="flex mb-2 min-h-[1.5rem]">
                   <span className="text-slate-500 w-6 md:w-8 text-right mr-2 md:mr-4 flex-shrink-0 text-xs md:text-sm">
                     {line !== undefined ? index + 1 : ''}
                   </span>
                   <span className={`break-all md:break-normal whitespace-pre-wrap ${
                     line?.includes('def ') ? 'text-orange-400' : 
                     line?.includes('return') ? 'text-blue-400' :
                     line?.includes('if __name__') ? 'text-purple-400' :
                     line?.includes('print(') ? 'text-green-400' :
                     line?.includes('=') ? 'text-slate-300' :
                     'text-slate-400'
                   }`}>
                     {line || ''}
                     {index === currentLineIndex && (
                       <span className="animate-pulse text-orange-500">|</span>
                     )}
                   </span>
                 </div>
               ))}
             </div>
           </div>

          {/* Content */}
          <div className="space-y-8">
            
            {/* Problem Statement */}
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-slate-700/30">
              <h2 className="text-xl font-semibold text-slate-200 mb-3 flex items-center gap-2">
                <Star className="w-5 h-5 text-orange-500" />
                The Problem
              </h2>
              <p className="text-slate-300 leading-relaxed">
                Users spend <strong className="text-orange-400">18 minutes</strong> on average choosing what to watch. 
                SWIMO reduces this to <strong className="text-orange-400">30 seconds</strong> using behavioral analysis 
                and machine learning recommendations.
              </p>
            </div>

            {/* How It Works */}
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-slate-700/30">
              <h2 className="text-xl font-semibold text-slate-200 mb-4">The Algorithm</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                    <X className="w-4 h-4 text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-200">Data Collection</h3>
                    <p className="text-sm text-slate-400">Every swipe builds your taste profile</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-200">Feature Extraction</h3>
                    <p className="text-sm text-slate-400">Genre, director, cast, ratings, themes</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <Heart className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-200">Prediction Engine</h3>
                    <p className="text-sm text-slate-400">ML models predict your preferences</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                    <ArrowUp className="w-4 h-4 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-200">Smart Recommendations</h3>
                    <p className="text-sm text-slate-400">Curated matches ranked by compatibility</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tech Stack */}
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-slate-700/30">
              <h2 className="text-xl font-semibold text-slate-200 mb-4">Architecture</h2>
              <div className="grid grid-cols-2 gap-4">
                {techStack.map((tech, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-lg border border-slate-700/30">
                    <div className="text-orange-500">
                      {tech.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-200 text-sm">{tech.name}</h3>
                      <p className="text-xs text-slate-400">{tech.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* CTA - Centered in page */}
        <div className="flex items-center justify-center min-h-[200px] py-12">
          <div className="text-center">
            <Button
              onClick={onEnter}
              className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 text-lg font-semibold rounded-lg shadow-lg shadow-orange-600/25 transition-all duration-200 hover:shadow-orange-600/40"
            >
              Initialize Algorithm
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <p className="text-slate-500 text-sm mt-3">
              Experience intelligent movie discovery
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-slate-800">
          <p className="text-slate-500 text-sm">
            Built for recruiters who appreciate <span className="text-orange-500">elegant engineering</span> 
            and users who want <span className="text-orange-500">smarter recommendations</span>
          </p>
        </div>

      </div>
    </div>
  )
} 