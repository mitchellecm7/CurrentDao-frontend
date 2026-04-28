'use client'

import { useState, useEffect } from 'react'
import { Clock, RefreshCw, Twitter, MessageCircle, Github } from 'lucide-react'

interface MaintenanceConfig {
  endTime: Date
  message: string
  socialLinks: {
    twitter?: string
    discord?: string
    github?: string
  }
}

export default function MaintenancePage() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })
  const [maintenanceConfig, setMaintenanceConfig] = useState<MaintenanceConfig>({
    endTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // Default: 2 hours from now
    message: "We're performing scheduled maintenance to improve our services. We'll be back shortly!",
    socialLinks: {
      twitter: 'https://twitter.com/currentdao',
      discord: 'https://discord.gg/currentdao',
      github: 'https://github.com/CurrentDao-org'
    }
  })
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    // Fetch maintenance configuration
    const fetchMaintenanceConfig = async () => {
      try {
        const response = await fetch('/api/maintenance/config')
        if (response.ok) {
          const config = await response.json()
          setMaintenanceConfig({
            endTime: new Date(config.endTime),
            message: config.message,
            socialLinks: config.socialLinks || maintenanceConfig.socialLinks
          })
        }
      } catch (error) {
        console.log('Using default maintenance config')
      }
    }

    fetchMaintenanceConfig()
  }, [])

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = maintenanceConfig.endTime.getTime() - new Date().getTime()
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        })
        setIsExpired(false)
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        setIsExpired(true)
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [maintenanceConfig.endTime])

  useEffect(() => {
    if (isExpired) {
      // Auto-refresh when maintenance ends
      const timeout = setTimeout(() => {
        window.location.reload()
      }, 5000) // Wait 5 seconds before refreshing
      
      return () => clearTimeout(timeout)
    }
  }, [isExpired])

  const formatNumber = (num: number) => {
    return num.toString().padStart(2, '0')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Logo Placeholder */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-blue-500 rounded-full mx-auto flex items-center justify-center">
            <span className="text-white text-3xl font-bold">CD</span>
          </div>
        </div>

        {/* Main Message */}
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
          Under Maintenance
        </h1>
        
        <p className="text-xl text-gray-300 mb-12 leading-relaxed">
          {maintenanceConfig.message}
        </p>

        {/* Countdown Timer */}
        {!isExpired ? (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-white mb-6 flex items-center justify-center gap-2">
              <Clock className="w-6 h-6" />
              Estimated Time Remaining
            </h2>
            <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold text-white">
                  {formatNumber(timeLeft.days)}
                </div>
                <div className="text-sm text-gray-300 mt-1">Days</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold text-white">
                  {formatNumber(timeLeft.hours)}
                </div>
                <div className="text-sm text-gray-300 mt-1">Hours</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold text-white">
                  {formatNumber(timeLeft.minutes)}
                </div>
                <div className="text-sm text-gray-300 mt-1">Minutes</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold text-white">
                  {formatNumber(timeLeft.seconds)}
                </div>
                <div className="text-sm text-gray-300 mt-1">Seconds</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-12">
            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-6 max-w-md mx-auto">
              <div className="flex items-center justify-center gap-2 text-green-400 mb-2">
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span className="text-lg font-semibold">Maintenance Complete!</span>
              </div>
              <p className="text-gray-300">
                Refreshing the page automatically...
              </p>
            </div>
          </div>
        )}

        {/* Social Links */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">
            For Status Updates
          </h3>
          <div className="flex justify-center gap-4">
            {maintenanceConfig.socialLinks.twitter && (
              <a
                href={maintenanceConfig.socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg p-3 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5 text-white" />
              </a>
            )}
            {maintenanceConfig.socialLinks.discord && (
              <a
                href={maintenanceConfig.socialLinks.discord}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg p-3 transition-colors"
                aria-label="Discord"
              >
                <MessageCircle className="w-5 h-5 text-white" />
              </a>
            )}
            {maintenanceConfig.socialLinks.github && (
              <a
                href={maintenanceConfig.socialLinks.github}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg p-3 transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5 text-white" />
              </a>
            )}
          </div>
        </div>

        {/* Manual Refresh Button */}
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center gap-2 mx-auto"
        >
          <RefreshCw className="w-4 h-4" />
          Check Status
        </button>

        {/* Footer */}
        <div className="mt-12 text-gray-400 text-sm">
          <p>We apologize for the inconvenience and appreciate your patience.</p>
          <p className="mt-2">CurrentDao Team</p>
        </div>
      </div>
    </div>
  )
}
