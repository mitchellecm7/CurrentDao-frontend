// Carbon Footprint Calculator
// Calculates carbon emissions and provides reduction suggestions aligned with international standards

export interface EnergyConsumptionData {
  consumption: number // kWh
  energySource: 'grid' | 'solar' | 'wind' | 'hydro' | 'geothermal' | 'biomass' | 'mixed'
  timestamp: Date
  region?: string
}

export interface CarbonEmission {
  id: string
  source: string
  category: 'scope1' | 'scope2' | 'scope3'
  amount: number // kg CO2e
  unit: string
  description: string
  location?: string
  date: Date
  renewablePercentage?: number
}

export interface CarbonFootprintResult {
  totalEmissions: number // kg CO2e
  emissionsByCategory: {
    scope1: number
    scope2: number
    scope3: number
  }
  emissionsBySource: {
    grid: number
    renewable: number
    other: number
  }
  monthlyBreakdown: Array<{
    month: string
    emissions: number
    consumption: number
    intensity: number // kg CO2e per kWh
  }>
  yearlyProjection: {
    annualEmissions: number
    annualConsumption: number
    averageIntensity: number
  }
  comparisons: {
    nationalAverage: number
    regionalAverage: number
    householdAverage: number
    percentile: number
  }
  reductionPotential: {
    current: number
    target: number
    reductionAmount: number
    reductionPercentage: number
    timeToTarget: string
  }
}

export interface CarbonReductionRecommendation {
  id: string
  category: 'renewable' | 'efficiency' | 'behavior' | 'offset'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  potentialReduction: number // kg CO2e per year
  implementationCost: 'low' | 'medium' | 'high'
  paybackPeriod: string
  effort: 'easy' | 'moderate' | 'significant'
  steps: string[]
  carbonCredits?: number
}

export interface CarbonOffsetOption {
  provider: string
  project: string
  type: 'reforestation' | 'renewable' | 'methane' | 'energy_efficiency'
  pricePerTon: number // USD
  certification: string
  location: string
  verified: boolean
}

export class CarbonCalculator {
  // Emission factors based on international standards (IPCC, EPA, etc.)
  private readonly EMISSION_FACTORS = {
    // Grid electricity emission factors by region (kg CO2e per kWh)
    grid: {
      'US': 0.45,
      'EU': 0.30,
      'CN': 0.68,
      'IN': 0.82,
      'global': 0.48,
      'default': 0.45
    },
    // Renewable energy emission factors (lifecycle emissions)
    solar: 0.05,
    wind: 0.02,
    hydro: 0.01,
    geothermal: 0.03,
    biomass: 0.23,
    // Mixed energy sources
    mixed: 0.25
  }

  // Carbon intensity benchmarks (kg CO2e per kWh)
  private readonly INTENSITY_BENCHMARKS = {
    global: 0.48,
    renewable: 0.03,
    efficient: 0.15,
    target: 0.10
  }

  // Household emission benchmarks (kg CO2e per year)
  private readonly HOUSEHOLD_BENCHMARKS = {
    global: 5500,
    US: 7200,
    EU: 4200,
    efficient: 2000
  }

  /**
   * Calculate carbon footprint from energy consumption data
   * @param data Array of energy consumption data
   * @param region Geographic region for accurate emission factors
   * @returns Comprehensive carbon footprint analysis
   */
  public calculateCarbonFootprint(
    data: EnergyConsumptionData[],
    region: string = 'US'
  ): CarbonFootprintResult {
    if (!data || data.length === 0) {
      return this.createEmptyResult()
    }

    // Sort data by timestamp
    const sortedData = data.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())

    // Calculate emissions for each data point
    const emissions = sortedData.map(point => this.calculateEmissions(point, region))

    // Aggregate results
    const totalEmissions = emissions.reduce((sum, emission) => sum + emission.amount, 0)
    const emissionsByCategory = this.aggregateByCategory(emissions)
    const emissionsBySource = this.aggregateBySource(emissions)
    const monthlyBreakdown = this.calculateMonthlyBreakdown(sortedData, emissions, region)
    const yearlyProjection = this.projectYearlyEmissions(sortedData, region)
    const comparisons = this.calculateComparisons(totalEmissions, sortedData.length, region)
    const reductionPotential = this.calculateReductionPotential(totalEmissions, yearlyProjection)

    return {
      totalEmissions,
      emissionsByCategory,
      emissionsBySource,
      monthlyBreakdown,
      yearlyProjection,
      comparisons,
      reductionPotential
    }
  }

  /**
   * Generate carbon reduction recommendations
   * @param currentFootprint Current carbon footprint result
   * @param consumptionData Energy consumption data
   * @returns Personalized reduction recommendations
   */
  public generateReductionRecommendations(
    currentFootprint: CarbonFootprintResult,
    consumptionData: EnergyConsumptionData[]
  ): CarbonReductionRecommendation[] {
    const recommendations: CarbonReductionRecommendation[] = []

    // Renewable energy recommendations
    recommendations.push(...this.generateRenewableRecommendations(currentFootprint))

    // Energy efficiency recommendations
    recommendations.push(...this.generateEfficiencyRecommendations(currentFootprint, consumptionData))

    // Behavioral change recommendations
    recommendations.push(...this.generateBehavioralRecommendations(currentFootprint))

    // Carbon offset recommendations
    recommendations.push(...this.generateOffsetRecommendations(currentFootprint))

    // Sort by potential reduction and priority
    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      }
      return b.potentialReduction - a.potentialReduction
    })
  }

  /**
   * Get available carbon offset options
   * @returns Verified carbon offset options
   */
  public getCarbonOffsetOptions(): CarbonOffsetOption[] {
    return [
      {
        provider: 'Gold Standard',
        project: 'Kenya Reforestation',
        type: 'reforestation',
        pricePerTon: 15,
        certification: 'GS',
        location: 'Kenya',
        verified: true
      },
      {
        provider: 'Verra',
        project: 'India Solar Farm',
        type: 'renewable',
        pricePerTon: 12,
        certification: 'VCS',
        location: 'India',
        verified: true
      },
      {
        provider: 'Climate Action Reserve',
        project: 'US Methane Capture',
        type: 'methane',
        pricePerTon: 8,
        certification: 'CAR',
        location: 'United States',
        verified: true
      },
      {
        provider: 'Gold Standard',
        project: 'Brazil Energy Efficiency',
        type: 'energy_efficiency',
        pricePerTon: 18,
        certification: 'GS',
        location: 'Brazil',
        verified: true
      }
    ]
  }

  /**
   * Calculate emissions for a single data point
   */
  private calculateEmissions(data: EnergyConsumptionData, region: string): CarbonEmission {
    const emissionFactor = this.getEmissionFactor(data.energySource, region)
    const emissions = data.consumption * emissionFactor

    return {
      id: `emission_${data.timestamp.getTime()}_${Math.random().toString(36).substr(2, 9)}`,
      source: data.energySource,
      category: this.getEmissionCategory(data.energySource),
      amount: emissions,
      unit: 'kg CO2e',
      description: `${data.consumption.toFixed(2)} kWh from ${data.energySource} energy`,
      location: region,
      date: data.timestamp,
      renewablePercentage: this.getRenewablePercentage(data.energySource)
    }
  }

  /**
   * Get emission factor for energy source and region
   */
  private getEmissionFactor(energySource: string, region: string): number {
    if (energySource === 'grid') {
      return this.EMISSION_FACTORS.grid[region] || this.EMISSION_FACTORS.grid.default
    }
    return this.EMISSION_FACTORS[energySource] || this.EMISSION_FACTORS.mixed
  }

  /**
   * Get emission category (Scope 1, 2, or 3)
   */
  private getEmissionCategory(energySource: string): 'scope1' | 'scope2' | 'scope3' {
    if (energySource === 'grid') return 'scope2'
    if (['solar', 'wind', 'hydro', 'geothermal'].includes(energySource)) return 'scope2'
    return 'scope3'
  }

  /**
   * Get renewable percentage for energy source
   */
  private getRenewablePercentage(energySource: string): number {
    const renewablePercentages = {
      solar: 100,
      wind: 100,
      hydro: 100,
      geothermal: 100,
      biomass: 80,
      mixed: 50,
      grid: 20 // Varies by region, using conservative average
    }
    return renewablePercentages[energySource] || 0
  }

  /**
   * Aggregate emissions by category
   */
  private aggregateByCategory(emissions: CarbonEmission[]): {
    scope1: number
    scope2: number
    scope3: number
  } {
    const aggregated = {
      scope1: 0,
      scope2: 0,
      scope3: 0
    }

    emissions.forEach(emission => {
      aggregated[emission.category] += emission.amount
    })

    return aggregated
  }

  /**
   * Aggregate emissions by source type
   */
  private aggregateBySource(emissions: CarbonEmission[]): {
    grid: number
    renewable: number
    other: number
  } {
    const aggregated = {
      grid: 0,
      renewable: 0,
      other: 0
    }

    emissions.forEach(emission => {
      if (emission.source === 'grid') {
        aggregated.grid += emission.amount
      } else if (['solar', 'wind', 'hydro', 'geothermal'].includes(emission.source)) {
        aggregated.renewable += emission.amount
      } else {
        aggregated.other += emission.amount
      }
    })

    return aggregated
  }

  /**
   * Calculate monthly breakdown
   */
  private calculateMonthlyBreakdown(
    consumptionData: EnergyConsumptionData[],
    emissions: CarbonEmission[],
    region: string
  ): Array<{ month: string; emissions: number; consumption: number; intensity: number }> {
    const monthlyData: { [month: string]: { consumption: number; emissions: number } } = {}

    consumptionData.forEach((data, index) => {
      const monthKey = data.timestamp.toISOString().substring(0, 7) // YYYY-MM
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { consumption: 0, emissions: 0 }
      }
      monthlyData[monthKey].consumption += data.consumption
      monthlyData[monthKey].emissions += emissions[index].amount
    })

    return Object.keys(monthlyData).sort().map(month => ({
      month,
      emissions: monthlyData[month].emissions,
      consumption: monthlyData[month].consumption,
      intensity: monthlyData[month].consumption > 0 
        ? monthlyData[month].emissions / monthlyData[month].consumption 
        : 0
    }))
  }

  /**
   * Project yearly emissions
   */
  private projectYearlyEmissions(
    consumptionData: EnergyConsumptionData[],
    region: string
  ): { annualEmissions: number; annualConsumption: number; averageIntensity: number } {
    if (consumptionData.length === 0) {
      return { annualEmissions: 0, annualConsumption: 0, averageIntensity: 0 }
    }

    // Calculate daily average from available data
    const totalConsumption = consumptionData.reduce((sum, data) => sum + data.consumption, 0)
    const daysSpanned = this.calculateDaysSpanned(consumptionData)
    const dailyAverageConsumption = totalConsumption / daysSpanned

    // Project to full year
    const annualConsumption = dailyAverageConsumption * 365
    const annualEmissions = annualConsumption * this.getEmissionFactor('grid', region)
    const averageIntensity = annualConsumption > 0 ? annualEmissions / annualConsumption : 0

    return {
      annualEmissions,
      annualConsumption,
      averageIntensity
    }
  }

  /**
   * Calculate comparisons with benchmarks
   */
  private calculateComparisons(
    totalEmissions: number,
    dataPoints: number,
    region: string
  ): { nationalAverage: number; regionalAverage: number; householdAverage: number; percentile: number } {
    const daysSpanned = dataPoints * 24 // Assuming hourly data
    const annualProjection = (totalEmissions / daysSpanned) * 365

    const nationalAverage = this.HOUSEHOLD_BENCHMARKS[region] || this.HOUSEHOLD_BENCHMARKS.US
    const regionalAverage = nationalAverage * 0.9 // Assume regional is 10% better
    const householdAverage = nationalAverage

    // Calculate percentile (simplified)
    const percentile = Math.max(5, Math.min(95, 100 - (annualProjection / nationalAverage) * 50))

    return {
      nationalAverage,
      regionalAverage,
      householdAverage,
      percentile
    }
  }

  /**
   * Calculate reduction potential
   */
  private calculateReductionPotential(
    currentEmissions: number,
    yearlyProjection: { annualEmissions: number }
  ): { current: number; target: number; reductionAmount: number; reductionPercentage: number; timeToTarget: string } {
    const current = yearlyProjection.annualEmissions
    const target = this.HOUSEHOLD_BENCHMARKS.efficient // Target: efficient household level
    const reductionAmount = Math.max(0, current - target)
    const reductionPercentage = current > 0 ? (reductionAmount / current) * 100 : 0

    // Estimate time to target based on realistic reduction rate
    const monthlyReductionRate = 0.05 // 5% reduction per month achievable
    const monthsToTarget = reductionPercentage > 0 ? Math.ceil(reductionPercentage / (monthlyReductionRate * 100)) : 0
    const timeToTarget = monthsToTarget > 0 ? `${monthsToTarget} months` : 'On target'

    return {
      current,
      target,
      reductionAmount,
      reductionPercentage,
      timeToTarget
    }
  }

  /**
   * Generate renewable energy recommendations
   */
  private generateRenewableRecommendations(footprint: CarbonFootprintResult): CarbonReductionRecommendation[] {
    const recommendations: CarbonReductionRecommendation[] = []

    if (footprint.emissionsBySource.grid > footprint.totalEmissions * 0.5) {
      recommendations.push({
        id: 'solar_installation',
        category: 'renewable',
        priority: 'high',
        title: 'Install Solar Panels',
        description: 'Generate your own clean energy and reduce grid dependence',
        potentialReduction: footprint.yearlyProjection.annualEmissions * 0.7,
        implementationCost: 'high',
        paybackPeriod: '7-10 years',
        effort: 'significant',
        steps: [
          'Assess roof suitability and solar potential',
          'Get quotes from certified installers',
          'Check available incentives and rebates',
          'Install solar panel system',
          'Connect to grid with net metering'
        ]
      })

      recommendations.push({
        id: 'green_tariff',
        category: 'renewable',
        priority: 'medium',
        title: 'Switch to Green Energy Tariff',
        description: 'Choose renewable energy from your utility provider',
        potentialReduction: footprint.yearlyProjection.annualEmissions * 0.4,
        implementationCost: 'low',
        paybackPeriod: 'Immediate',
        effort: 'easy',
        steps: [
          'Contact utility provider about green energy options',
          'Compare renewable energy plans',
          'Switch to renewable energy tariff',
          'Verify renewable energy certificates'
        ]
      })
    }

    return recommendations
  }

  /**
   * Generate energy efficiency recommendations
   */
  private generateEfficiencyRecommendations(
    footprint: CarbonFootprintResult,
    consumptionData: EnergyConsumptionData[]
  ): CarbonReductionRecommendation[] {
    const recommendations: CarbonReductionRecommendation[] = []

    // LED lighting
    recommendations.push({
      id: 'led_lighting',
      category: 'efficiency',
      priority: 'medium',
      title: 'Upgrade to LED Lighting',
      description: 'Replace incandescent bulbs with energy-efficient LEDs',
      potentialReduction: 400, // kg CO2e per year
      implementationCost: 'medium',
      paybackPeriod: '1-2 years',
      effort: 'moderate',
      steps: [
        'Audit current lighting fixtures',
        'Calculate LED requirements',
        'Purchase ENERGY STAR LED bulbs',
        'Replace existing bulbs systematically',
        'Dispose of old bulbs properly'
      ]
    })

    // Smart thermostat
    recommendations.push({
      id: 'smart_thermostat',
      category: 'efficiency',
      priority: 'medium',
      title: 'Install Smart Thermostat',
      description: 'Optimize heating and cooling with automated controls',
      potentialReduction: 600,
      implementationCost: 'medium',
      paybackPeriod: '2-3 years',
      effort: 'easy',
      steps: [
        'Choose compatible smart thermostat',
        'Install following manufacturer guidelines',
        'Configure schedule and preferences',
        'Enable energy-saving features',
        'Monitor and adjust settings'
      ]
    })

    return recommendations
  }

  /**
   * Generate behavioral change recommendations
   */
  private generateBehavioralRecommendations(footprint: CarbonFootprintResult): CarbonReductionRecommendation[] {
    const recommendations: CarbonReductionRecommendation[] = []

    recommendations.push({
      id: 'peak_shift',
      category: 'behavior',
      priority: 'low',
      title: 'Shift Usage to Off-Peak Hours',
      description: 'Use energy during times when renewable generation is higher',
      potentialReduction: 200,
      implementationCost: 'low',
      paybackPeriod: 'Immediate',
      effort: 'easy',
      steps: [
        'Identify peak and off-peak hours',
        'Schedule heavy appliance use for off-peak',
        'Use timer functions on appliances',
        'Monitor energy usage patterns',
        'Adjust habits gradually'
      ]
    })

    recommendations.push({
      id: 'standby_reduction',
      category: 'behavior',
      priority: 'low',
      title: 'Eliminate Standby Power',
      description: 'Reduce phantom load from electronics on standby',
      potentialReduction: 150,
      implementationCost: 'low',
      paybackPeriod: '6 months',
      effort: 'easy',
      steps: [
        'Identify devices with standby power',
        'Unplug devices when not in use',
        'Use smart power strips',
        'Enable energy-saving modes',
        'Create shutdown routines'
      ]
    })

    return recommendations
  }

  /**
   * Generate carbon offset recommendations
   */
  private generateOffsetRecommendations(footprint: CarbonFootprintResult): CarbonReductionRecommendation[] {
    const recommendations: CarbonReductionRecommendation[] = []

    const remainingEmissions = Math.max(0, footprint.reductionPotential.target)
    
    if (remainingEmissions > 100) {
      recommendations.push({
        id: 'carbon_offsets',
        category: 'offset',
        priority: 'low',
        title: 'Purchase Carbon Offsets',
        description: 'Offset unavoidable emissions with verified carbon credits',
        potentialReduction: remainingEmissions,
        implementationCost: 'medium',
        paybackPeriod: 'Annual',
        effort: 'easy',
        steps: [
          'Calculate remaining emissions to offset',
          'Choose verified offset projects',
          'Purchase carbon credits annually',
          'Track offset certifications',
          'Report offset contributions'
        ],
        carbonCredits: remainingEmissions / 1000 // Convert kg to tons
      })
    }

    return recommendations
  }

  /**
   * Helper methods
   */
  private createEmptyResult(): CarbonFootprintResult {
    return {
      totalEmissions: 0,
      emissionsByCategory: { scope1: 0, scope2: 0, scope3: 0 },
      emissionsBySource: { grid: 0, renewable: 0, other: 0 },
      monthlyBreakdown: [],
      yearlyProjection: { annualEmissions: 0, annualConsumption: 0, averageIntensity: 0 },
      comparisons: { nationalAverage: 0, regionalAverage: 0, householdAverage: 0, percentile: 0 },
      reductionPotential: { current: 0, target: 0, reductionAmount: 0, reductionPercentage: 0, timeToTarget: '0 months' }
    }
  }

  private calculateDaysSpanned(data: EnergyConsumptionData[]): number {
    if (data.length === 0) return 0
    
    const startDate = new Date(Math.min(...data.map(d => d.timestamp.getTime())))
    const endDate = new Date(Math.max(...data.map(d => d.timestamp.getTime())))
    
    return Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
  }
}

export default CarbonCalculator
