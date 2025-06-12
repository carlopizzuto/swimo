import { useState } from 'react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const features = [
    {
      icon: "🎬",
      title: "Discover Movies",
      description: "Swipe through thousands of movies tailored to your taste"
    },
    {
      icon: "⚡",
      title: "Quick Decisions",
      description: "No more endless scrolling - just swipe left or right"
    },
    {
      icon: "🎯",
      title: "Smart Recommendations",
      description: "Our algorithm learns your preferences with every swipe"
    },
    {
      icon: "📱",
      title: "Mobile Friendly",
      description: "Perfect experience on any device, anywhere"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Hero Section */}
      <main className="flex-1">
        {/* Navigation */}
        <nav className="relative z-10 px-6 py-6">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-orange-300 tracking-wider">SWIMO</h1>
            </div>
            <button
              onClick={onGetStarted}
              className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              Get Started
            </button>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="px-6 py-12 md:py-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-bold text-gray-100 mb-6 leading-tight">
                Tinder for
                <span className="text-orange-400 block md:inline md:ml-4">Movies</span>
              </h2>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                Ever feel like there are no good movies to watch? Always finish your food before choosing a movie?
              </p>
              <p className="text-2xl md:text-3xl font-semibold text-orange-300 mb-12">
                Swimo is your new best friend.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={onGetStarted}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-8 rounded-lg text-lg shadow-lg transform hover:scale-105 transition-all duration-200 retro-pulse"
                >
                  Start Discovering Movies
                </button>
                <div className="text-gray-400 text-sm">
                  Free • No credit card required
                </div>
              </div>
            </div>

            {/* Demo Preview */}
            <div className="relative max-w-4xl mx-auto mb-20">
              <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-100 mb-2">How it works</h3>
                  <p className="text-gray-400">Swipe right to like, left to pass</p>
                </div>
                
                {/* Mock Movie Card */}
                <div className="relative bg-gray-700 rounded-xl p-6 max-w-sm mx-auto">
                  <div className="text-center">
                    <div className="w-32 h-48 bg-gradient-to-br from-orange-400 to-red-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <span className="text-4xl">🎬</span>
                    </div>
                    <h4 className="text-lg font-bold text-gray-100 mb-1">Your Next Favorite Movie</h4>
                    <p className="text-gray-400 text-sm mb-4">2024 • Action, Drama</p>
                    
                    <div className="flex gap-4 justify-center">
                      <button className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors duration-200">
                        👎 Pass
                      </button>
                      <button className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg transition-colors duration-200">
                        👍 Like
                      </button>
                    </div>
                  </div>
                </div>

                <div className="text-center mt-6 text-gray-400 text-sm">
                  Use arrow keys or click to swipe
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-gray-800 border-t border-gray-700">
          <div className="max-w-6xl mx-auto px-6 py-16">
            <div className="text-center mb-16">
              <h3 className="text-3xl md:text-4xl font-bold text-gray-100 mb-4">
                Why Choose SWIMO?
              </h3>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Say goodbye to decision paralysis and hello to your next favorite movie
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`bg-gray-700 rounded-xl p-6 text-center transition-all duration-300 cursor-pointer ${
                    hoveredFeature === index ? 'transform -translate-y-2 shadow-xl' : ''
                  }`}
                  onMouseEnter={() => setHoveredFeature(index)}
                  onMouseLeave={() => setHoveredFeature(null)}
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h4 className="text-xl font-bold text-gray-100 mb-3">{feature.title}</h4>
                  <p className="text-gray-300">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* The Science Behind Recommendations */}
        <div className="bg-gray-900 border-t border-gray-700">
          <div className="max-w-6xl mx-auto px-6 py-16">
            <div className="text-center mb-16">
              <h3 className="text-3xl md:text-4xl font-bold text-gray-100 mb-4">
                The Science Behind Your Recommendations
              </h3>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Ever wondered how SWIMO knows exactly what you'll love? Here's the magic behind our AI-powered movie matching
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Visual Representation */}
              <div className="relative">
                <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
                  <div className="space-y-6">
                    {/* Step 1: Movie Analysis */}
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                        1
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-100 mb-2">Movie DNA Analysis</h4>
                        <p className="text-gray-300 text-sm">
                          We transform every movie's title, genres, and plot into a unique "fingerprint" using AI language models
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="bg-blue-700 text-blue-200 px-2 py-1 rounded-full text-xs">Title</span>
                          <span className="bg-green-700 text-green-200 px-2 py-1 rounded-full text-xs">Genres</span>
                          <span className="bg-purple-700 text-purple-200 px-2 py-1 rounded-full text-xs">Plot</span>
                          <span className="text-orange-400 text-xs">→ 384D Vector</span>
                        </div>
                      </div>
                    </div>

                    {/* Step 2: Your Profile */}
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                        2
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-100 mb-2">Your Taste Profile</h4>
                        <p className="text-gray-300 text-sm">
                          Every swipe builds your personal taste profile by averaging the "DNA" of movies you love
                        </p>
                        <div className="mt-3 flex items-center gap-2 text-sm">
                          <span className="text-emerald-400">👍 Liked movies</span>
                          <span className="text-gray-400">+</span>
                          <span className="text-red-400">👎 Disliked movies</span>
                          <span className="text-gray-400">=</span>
                          <span className="text-orange-400">Your Profile</span>
                        </div>
                      </div>
                    </div>

                    {/* Step 3: Matching */}
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        3
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-100 mb-2">Smart Matching</h4>
                        <p className="text-gray-300 text-sm">
                          We calculate similarity scores between your profile and every movie using cosine similarity mathematics
                        </p>
                        <div className="mt-3 bg-gray-700 rounded-lg p-3">
                          <div className="text-xs text-gray-400 mb-1">Similarity Score:</div>
                          <div className="flex items-center gap-2">
                            <div className="bg-gradient-to-r from-red-500 to-green-500 h-2 rounded-full flex-1"></div>
                            <span className="text-green-400 text-sm font-mono">0.89</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Details */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-2xl font-bold text-orange-300 mb-4">Under the Hood</h4>
                  <div className="space-y-4">
                    <div className="bg-gray-800 rounded-lg p-4 border-l-4 border-orange-400">
                      <h5 className="font-bold text-gray-100 mb-2">🧠 AI Language Model</h5>
                      <p className="text-gray-300 text-sm">
                        We use SentenceTransformers (all-MiniLM-L6-v2) to convert movie descriptions into 384-dimensional vectors that capture semantic meaning
                      </p>
                    </div>
                    
                    <div className="bg-gray-800 rounded-lg p-4 border-l-4 border-blue-400">
                      <h5 className="font-bold text-gray-100 mb-2">📊 Vector Mathematics</h5>
                      <p className="text-gray-300 text-sm">
                        Your taste profile is the mathematical average of all your liked movies, minus the influence of disliked ones
                      </p>
                    </div>
                    
                    <div className="bg-gray-800 rounded-lg p-4 border-l-4 border-green-400">
                      <h5 className="font-bold text-gray-100 mb-2">🎯 Cosine Similarity</h5>
                      <p className="text-gray-300 text-sm">
                        We calculate the angle between your profile and each movie's vector - smaller angles mean better matches!
                      </p>
                    </div>
                    
                    <div className="bg-gray-800 rounded-lg p-4 border-l-4 border-purple-400">
                      <h5 className="font-bold text-gray-100 mb-2">⚡ Real-time Learning</h5>
                      <p className="text-gray-300 text-sm">
                        Every swipe instantly updates your profile, making the next recommendation even more accurate
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 rounded-lg p-6 border border-orange-400/30">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">🔬</span>
                    <h5 className="font-bold text-orange-300">Fun Fact</h5>
                  </div>
                  <p className="text-gray-300 text-sm">
                    Our system processes over <span className="text-orange-400 font-bold">384 dimensions</span> of movie data for each recommendation - 
                    that's like considering 384 different aspects of every movie simultaneously!
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center mt-16">
              <p className="text-gray-400 text-lg mb-6">
                The more you swipe, the smarter SWIMO gets at understanding your unique taste
              </p>
              <button
                onClick={onGetStarted}
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-lg text-lg shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Experience the AI Magic
              </button>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600">
          <div className="max-w-4xl mx-auto px-6 py-16 text-center">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Find Your Next Favorite Movie?
            </h3>
            <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
              Join thousands of movie lovers who've already discovered their perfect matches
            </p>
            <button
              onClick={onGetStarted}
              className="bg-gray-900 hover:bg-gray-800 text-orange-300 font-bold py-4 px-8 rounded-lg text-lg shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Start Swiping Now
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <h4 className="text-2xl font-bold text-orange-300 tracking-wider">SWIMO</h4>
              <span className="text-gray-400 ml-3">• Tinder for Movies</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2025 SWIMO. Made with ❤️ for movie lovers.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 