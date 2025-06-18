"use client"

import type React from "react"

import { useState, useRef } from "react"
import Image from "next/image"
import type { Movie } from "@/lib/types"
import { Star, Calendar, Clock } from "lucide-react"

interface MovieCardProps {
  movie: Movie
  onSwipe: (direction: "left" | "right" | "up") => void
  isActive: boolean
}

export default function MovieCard({ movie, onSwipe, isActive }: MovieCardProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [rotation, setRotation] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const startPos = useRef({ x: 0, y: 0 })

  const handleStart = (clientX: number, clientY: number) => {
    if (!isActive) return
    setIsDragging(true)
    startPos.current = { x: clientX, y: clientY }
  }

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging || !isActive) return

    const deltaX = clientX - startPos.current.x
    const deltaY = clientY - startPos.current.y

    setDragOffset({ x: deltaX, y: deltaY })
    setRotation(deltaX * 0.1)
  }

  const handleEnd = () => {
    if (!isDragging || !isActive) return

    setIsDragging(false)

    const threshold = 100
    if (Math.abs(dragOffset.x) > threshold) {
      onSwipe(dragOffset.x > 0 ? "right" : "left")
    } else if (dragOffset.y < -threshold) {
      onSwipe("up")
    }

    setDragOffset({ x: 0, y: 0 })
    setRotation(0)
  }

  // Mouse events (desktop)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (window.innerWidth >= 768) return // Disable dragging on desktop
    handleStart(e.clientX, e.clientY)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (window.innerWidth >= 768) return
    handleMove(e.clientX, e.clientY)
  }

  const handleMouseUp = () => {
    if (window.innerWidth >= 768) return
    handleEnd()
  }

  // Touch events (mobile) - Updated to handle swipe down for details
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isActive) return

    const touch = e.touches[0]
    startPos.current = { x: touch.clientX, y: touch.clientY }
    setIsDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !isActive) return

    e.preventDefault()
    const touch = e.touches[0]
    const deltaX = touch.clientX - startPos.current.x
    const deltaY = touch.clientY - startPos.current.y

    setDragOffset({ x: deltaX, y: deltaY })
    setRotation(deltaX * 0.1)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isActive) return

    if (isDragging) {
      e.preventDefault()

      const threshold = 100
      if (Math.abs(dragOffset.x) > threshold) {
        onSwipe(dragOffset.x > 0 ? "right" : "left")
      } else if (dragOffset.y < -threshold) {
        onSwipe("up")
      } else if (dragOffset.y > threshold) {
        // Swipe down - flip the card to show details
        setIsFlipped(!isFlipped)
      }

      setDragOffset({ x: 0, y: 0 })
      setRotation(0)
      setIsDragging(false)
    }
  }

  const cardStyle = {
    transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${rotation}deg)`,
    transition: isDragging ? "none" : "transform 0.3s ease-out",
    opacity: Math.abs(dragOffset.x) > 50 ? 1 - Math.abs(dragOffset.x) / 300 : 1,
  }

  const overlayOpacity = Math.min(Math.max(Math.abs(dragOffset.x), Math.abs(dragOffset.y)) / 100, 0.8)

  return (
    <div
      ref={cardRef}
      className="relative w-full h-full cursor-pointer select-none touch-none"
      style={cardStyle}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Swipe overlays - Mobile only */}
      {dragOffset.x > 50 && window.innerWidth < 768 && (
        <div
          className="absolute inset-0 bg-green-500/80 rounded-2xl flex items-center justify-center z-10"
          style={{ opacity: overlayOpacity }}
        >
          <div className="text-white text-4xl font-bold transform rotate-12">LIKE</div>
        </div>
      )}

      {dragOffset.x < -50 && window.innerWidth < 768 && (
        <div
          className="absolute inset-0 bg-red-500/80 rounded-2xl flex items-center justify-center z-10"
          style={{ opacity: overlayOpacity }}
        >
          <div className="text-white text-4xl font-bold transform -rotate-12">PASS</div>
        </div>
      )}

      {dragOffset.y < -50 && window.innerWidth < 768 && (
        <div
          className="absolute inset-0 bg-blue-500/80 rounded-2xl flex items-center justify-center z-10"
          style={{ opacity: overlayOpacity }}
        >
          <div className="text-white text-4xl font-bold">WATCHLIST</div>
        </div>
      )}

      {dragOffset.y > 50 && window.innerWidth < 768 && (
        <div
          className="absolute inset-0 bg-purple-500/80 rounded-2xl flex items-center justify-center z-10"
          style={{ opacity: overlayOpacity }}
        >
          <div className="text-white text-4xl font-bold">INFO</div>
        </div>
      )}

      {/* Desktop Layout */}
      <div className="hidden md:block bg-gray-800 rounded-2xl shadow-2xl overflow-hidden h-full border border-gray-700">
        <div className="flex h-full">
          {/* Left side - Poster */}
          <div className="w-1/3 relative">
            <Image
              src={movie.poster_url || "/placeholder.svg"}
              alt={movie.title}
              fill
              className="object-cover"
              sizes="400px"
            />
            {movie.score && (
              <div className="absolute top-4 right-4 bg-black/70 text-white px-2 py-1 rounded-full flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-semibold">{movie.score.toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* Right side - Details */}
          <div className="w-2/3 p-8 flex flex-col justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">{movie.title}</h2>

              <div className="flex items-center gap-6 text-gray-400 mb-6">
                {movie.year && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    <span>{movie.year}</span>
                  </div>
                )}
              </div>

              {movie.genres && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {movie.genres.split(',').map((genre, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm font-medium border border-blue-600/30"
                    >
                      {genre.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className="text-gray-300 text-lg leading-relaxed">{movie.overview || 'No description available.'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden bg-gray-800 rounded-2xl shadow-2xl overflow-hidden h-full border border-gray-700">
        <div
          className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${isFlipped ? "rotate-y-180" : ""}`}
        >
          {/* Front side - Poster with title overlay */}
          <div className="absolute inset-0 backface-hidden">
            <div className="relative w-full h-full">
              <Image
                src={movie.poster_url || "/placeholder.svg"}
                alt={movie.title}
                fill
                className="object-cover rounded-2xl"
                sizes="(max-width: 768px) 100vw, 400px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent rounded-2xl" />

              {movie.score && (
                <div className="absolute top-4 right-4 bg-black/70 text-white px-2 py-1 rounded-full flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-semibold">{movie.score.toFixed(1)}</span>
                </div>
              )}

              <div className="absolute bottom-6 left-6 right-6">
                <h2 className="text-2xl font-bold text-white mb-2">{movie.title}</h2>
                <p className="text-gray-300 text-sm">Swipe down to see details</p>
              </div>
            </div>
          </div>

          {/* Back side - Details */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">{movie.title}</h2>

              <div className="flex items-center gap-4 text-gray-400 mb-4">
                {movie.year && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">{movie.year}</span>
                  </div>
                )}
              </div>

              {movie.genres && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {movie.genres.split(',').map((genre, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded-full text-xs font-medium border border-blue-600/30"
                    >
                      {genre.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">{movie.overview || 'No description available.'}</p>
              <p className="text-gray-500 text-xs">Swipe down to see poster</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
