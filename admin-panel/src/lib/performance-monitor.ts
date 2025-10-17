// Performance monitoring utilities for CampFlow

interface PerformanceMetric {
  name: string
  startTime: number
  endTime?: number
  duration?: number
  metadata?: Record<string, any>
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map()
  private static instance: PerformanceMonitor

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  startTiming(name: string, metadata?: Record<string, any>): void {
    this.metrics.set(name, {
      name,
      startTime: performance.now(),
      metadata
    })
  }

  endTiming(name: string): number | null {
    const metric = this.metrics.get(name)
    if (!metric) {
      console.warn(`Performance metric "${name}" not found`)
      return null
    }

    const endTime = performance.now()
    const duration = endTime - metric.startTime

    metric.endTime = endTime
    metric.duration = duration

    // Log slow operations (> 1 second)
    if (duration > 1000) {
      console.warn(`Slow operation detected: ${name} took ${duration.toFixed(2)}ms`, metric.metadata)
    }

    // Log to analytics in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance: ${name} - ${duration.toFixed(2)}ms`, metric.metadata)
    }

    return duration
  }

  getMetric(name: string): PerformanceMetric | undefined {
    return this.metrics.get(name)
  }

  getAllMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values())
  }

  clearMetrics(): void {
    this.metrics.clear()
  }

  // Helper method to measure async operations
  async measureAsync<T>(
    name: string, 
    operation: () => Promise<T>, 
    metadata?: Record<string, any>
  ): Promise<T> {
    this.startTiming(name, metadata)
    try {
      const result = await operation()
      this.endTiming(name)
      return result
    } catch (error) {
      this.endTiming(name)
      throw error
    }
  }

  // Helper method to measure sync operations
  measure<T>(
    name: string, 
    operation: () => T, 
    metadata?: Record<string, any>
  ): T {
    this.startTiming(name, metadata)
    try {
      const result = operation()
      this.endTiming(name)
      return result
    } catch (error) {
      this.endTiming(name)
      throw error
    }
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance()

// React hook for measuring component render times
export function usePerformanceMonitor(componentName: string) {
  const startTime = performance.now()
  
  return {
    endTiming: () => {
      const duration = performance.now() - startTime
      if (duration > 16) { // More than one frame (16ms at 60fps)
        console.warn(`Slow render detected: ${componentName} took ${duration.toFixed(2)}ms`)
      }
      return duration
    }
  }
}

// API route performance wrapper
export function withPerformanceMonitoring<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  operationName: string
) {
  return async (...args: T): Promise<R> => {
    return performanceMonitor.measureAsync(operationName, () => fn(...args), {
      args: args.length,
      timestamp: new Date().toISOString()
    })
  }
}

// Database query performance wrapper
export function measureDatabaseQuery<T>(
  queryName: string,
  query: () => Promise<T>
): Promise<T> {
  return performanceMonitor.measureAsync(`db:${queryName}`, query, {
    type: 'database',
    timestamp: new Date().toISOString()
  })
}

// Component performance wrapper
export function measureComponentRender<T>(
  componentName: string,
  render: () => T
): T {
  return performanceMonitor.measure(`render:${componentName}`, render, {
    type: 'component',
    timestamp: new Date().toISOString()
  })
}

// Performance reporting for production
export function reportPerformanceMetrics(): void {
  const metrics = performanceMonitor.getAllMetrics()
  
  if (metrics.length === 0) return

  const report = {
    timestamp: new Date().toISOString(),
    metrics: metrics.map(metric => ({
      name: metric.name,
      duration: metric.duration,
      metadata: metric.metadata
    })),
    summary: {
      totalOperations: metrics.length,
      averageDuration: metrics.reduce((sum, m) => sum + (m.duration || 0), 0) / metrics.length,
      slowestOperation: metrics.reduce((slowest, current) => 
        (current.duration || 0) > (slowest.duration || 0) ? current : slowest
      )
    }
  }

  // In production, you might want to send this to an analytics service
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to analytics service
    // analytics.track('performance_metrics', report)
    console.log('Performance Report:', report)
  } else {
    console.log('Performance Report:', report)
  }
}

// Auto-report every 5 minutes in development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  setInterval(reportPerformanceMetrics, 5 * 60 * 1000)
}
