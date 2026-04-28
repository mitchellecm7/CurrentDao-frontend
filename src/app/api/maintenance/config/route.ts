import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check if maintenance mode is enabled
    const maintenanceEnabled = process.env.MAINTENANCE_MODE === 'true'
    
    if (!maintenanceEnabled) {
      return NextResponse.json({ enabled: false })
    }

    // Get maintenance end time from environment variable or use default
    const endTime = process.env.MAINTENANCE_END_TIME || 
      new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // Default: 2 hours from now
    
    const message = process.env.MAINTENANCE_MESSAGE || 
      "We're performing scheduled maintenance to improve our services. We'll be back shortly!"

    // Social media links
    const socialLinks = {
      twitter: process.env.MAINTENANCE_TWITTER || 'https://twitter.com/currentdao',
      discord: process.env.MAINTENANCE_DISCORD || 'https://discord.gg/currentdao',
      github: process.env.MAINTENANCE_GITHUB || 'https://github.com/CurrentDao-org'
    }

    return NextResponse.json({
      enabled: true,
      endTime,
      message,
      socialLinks
    })
  } catch (error) {
    console.error('Error fetching maintenance config:', error)
    return NextResponse.json(
      { error: 'Failed to fetch maintenance configuration' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    // This endpoint would be used by admin to update maintenance settings
    // For now, we'll just return the current config
    // In a real implementation, you'd want to authenticate this request
    const body = await request.json()
    
    // Validate the request body
    const { endTime, message, socialLinks } = body
    
    if (endTime && new Date(endTime) <= new Date()) {
      return NextResponse.json(
        { error: 'End time must be in the future' },
        { status: 400 }
      )
    }

    // In a real implementation, you'd update your configuration store here
    // For now, we'll just return success
    return NextResponse.json({
      success: true,
      message: 'Maintenance configuration updated successfully'
    })
  } catch (error) {
    console.error('Error updating maintenance config:', error)
    return NextResponse.json(
      { error: 'Failed to update maintenance configuration' },
      { status: 500 }
    )
  }
}
