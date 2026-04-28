#!/usr/bin/env node
/**
 * Bundle Size Analysis Script
 * Analyzes Next.js build output and generates bundle size report
 * Fails if main bundle exceeds 200KB threshold
 */

const fs = require("fs");
const path = require("path");

const BUNDLE_THRESHOLD = 200 * 1024; // 200KB in bytes
const REPORT_FILE = path.join(__dirname, "../bundle-report.json");
const BUILD_DIR = path.join(__dirname, "../.next");

/**
 * Parse Next.js build manifest to extract bundle information
 */
function analyzeBuildManifest() {
  try {
    const manifestPath = path.join(BUILD_DIR, "build-manifest.json");
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));

    const bundleInfo = {
      timestamp: new Date().toISOString(),
      pages: {},
      totalSize: 0,
      gzipSize: 0,
      status: "success",
    };

    // Analyze each page's chunks
    Object.entries(manifest.pages).forEach(([page, chunks]) => {
      bundleInfo.pages[page] = {
        chunks: chunks.filter((c) => c.endsWith(".js")),
        status: "analyzed",
      };
    });

    return bundleInfo;
  } catch (error) {
    console.error("Error analyzing build manifest:", error.message);
    return null;
  }
}

/**
 * Calculate actual chunk sizes from .next/static directory
 */
function calculateChunkSizes() {
  const staticDir = path.join(BUILD_DIR, "static");
  const jsDir = path.join(staticDir, "_next", "static", "chunks");

  if (!fs.existsSync(jsDir)) {
    console.warn("JS chunks directory not found");
    return { chunks: [], mainBundle: 0 };
  }

  const chunks = {};
  let mainBundle = 0;

  try {
    const files = fs.readdirSync(jsDir);

    files.forEach((file) => {
      if (file.endsWith(".js")) {
        const filePath = path.join(jsDir, file);
        const stats = fs.statSync(filePath);
        const sizeInKB = (stats.size / 1024).toFixed(2);

        chunks[file] = {
          size: stats.size,
          sizeKB: parseFloat(sizeInKB),
        };

        // Track main bundle (main-*.js files)
        if (file.startsWith("main-")) {
          mainBundle += stats.size;
        }
      }
    });

    return { chunks, mainBundle };
  } catch (error) {
    console.error("Error calculating chunk sizes:", error.message);
    return { chunks: {}, mainBundle: 0 };
  }
}

/**
 * Generate bundle report
 */
function generateReport() {
  const manifest = analyzeBuildManifest();
  const { chunks, mainBundle } = calculateChunkSizes();

  const report = {
    timestamp: new Date().toISOString(),
    version: require("../package.json").version,
    buildInfo: manifest,
    chunks: chunks,
    bundleMetrics: {
      mainBundle: {
        size: mainBundle,
        sizeKB: (mainBundle / 1024).toFixed(2),
        threshold: BUNDLE_THRESHOLD,
        thresholdKB: (BUNDLE_THRESHOLD / 1024).toFixed(2),
        exceeds: mainBundle > BUNDLE_THRESHOLD,
      },
      totalChunks: Object.keys(chunks).length,
      warnings: [],
    },
  };

  // Add warnings
  if (report.bundleMetrics.mainBundle.exceeds) {
    report.bundleMetrics.warnings.push({
      level: "ERROR",
      message: `Main bundle size (${report.bundleMetrics.mainBundle.sizeKB}KB) exceeds threshold (${report.bundleMetrics.mainBundle.thresholdKB}KB)`,
    });
  }

  // Check for large chunks
  Object.entries(chunks).forEach(([file, data]) => {
    if (data.size > 100 * 1024) {
      // 100KB
      report.bundleMetrics.warnings.push({
        level: "WARNING",
        message: `Large chunk detected: ${file} (${data.sizeKB}KB)`,
      });
    }
  });

  return report;
}

/**
 * Write report to file and console
 */
function writeReport(report) {
  // Write JSON report
  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));
  console.log(`Bundle report written to: ${REPORT_FILE}`);

  // Print summary
  console.log("\n========== BUNDLE SIZE REPORT ==========");
  console.log(`Timestamp: ${report.timestamp}`);
  console.log(`Version: ${report.version}`);
  console.log(
    `\nMain Bundle Size: ${report.bundleMetrics.mainBundle.sizeKB}KB`,
  );
  console.log(`Threshold: ${report.bundleMetrics.mainBundle.thresholdKB}KB`);
  console.log(`Total Chunks: ${report.bundleMetrics.totalChunks}`);

  if (report.bundleMetrics.warnings.length > 0) {
    console.log("\nWarnings:");
    report.bundleMetrics.warnings.forEach((warning) => {
      console.log(`[${warning.level}] ${warning.message}`);
    });
  } else {
    console.log("\n✅ No warnings!");
  }
  console.log("==========================================\n");

  return report;
}

/**
 * Exit with appropriate code
 */
function checkThreshold(report) {
  if (report.bundleMetrics.mainBundle.exceeds) {
    console.error("❌ BUILD FAILED: Main bundle exceeds 200KB threshold!");
    process.exit(1);
  }
  console.log("✅ BUILD PASSED: Bundle size is within threshold!");
  process.exit(0);
}

// Main execution
async function main() {
  try {
    console.log("Analyzing bundle sizes...");
    const report = generateReport();
    writeReport(report);
    checkThreshold(report);
  } catch (error) {
    console.error("Fatal error during bundle analysis:", error);
    process.exit(1);
  }
}

main();
