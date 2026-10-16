#!/usr/bin/env node
// Milestone M4: Dormi Comprehensive E2E Test Suite Runner
// Executes Tiers 1-4 automated tests against Dormi fullstack environment.
// Standard Node.js 24+ native ESM — Zero external dependencies.

import { suite as tier1Suite } from './e2e/tier1_feature_coverage.mjs';
import { suite as tier2Suite } from './e2e/tier2_boundary_corner.mjs';
import { suite as tier3Suite } from './e2e/tier3_cross_feature.mjs';
import { suite as tier4Suite } from './e2e/tier4_real_world_workflows.mjs';
import { api } from './e2e/test_helper.mjs';

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    tier: 'all',
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--tier' || arg === '-t') {
      options.tier = (args[++i] || 'all').toLowerCase();
    } else if (arg.startsWith('--tier=')) {
      options.tier = arg.split('=')[1].toLowerCase();
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    }
  }

  return options;
}

function printHelp() {
  console.log(`
Dormi Milestone M4 E2E Test Suite Runner
======================================================
Usage:
  node scripts/e2e_runner.mjs [options]

Options:
  --tier, -t <tier>   Specify test tier to execute:
                      1, tier1    : Tier 1 Feature Coverage (F1 - F8, 40 tests)
                      2, tier2    : Tier 2 Boundary & Corner Cases (40 tests)
                      3, tier3    : Tier 3 Cross-Feature Combinations (10 tests)
                      4, tier4    : Tier 4 Real-World Workflows (5 scenarios)
                      all         : Run all test tiers (default, 95 tests)
  --help, -h          Show this help message

Environment Variables:
  BASE_URL            Target backend API URL (default: http://localhost:5167)
`);
}

async function checkTargetHealth() {
  const baseUrl = process.env.BASE_URL || 'http://localhost:5167';
  process.stdout.write(`🔍 Checking target API connectivity at ${baseUrl} ... `);
  try {
    const res = await api('/health');
    if (res.status === 200) {
      console.log(`[OK] (Status: ${res.data?.status || 'healthy'}, DB: ${res.data?.components?.database || 'connected'})`);
      return true;
    }
    console.log(`[WARN] Status returned ${res.status}`);
    return true;
  } catch (err) {
    console.log(`\n❌ Failed to connect to ${baseUrl}: ${err.message}`);
    console.log(`Please ensure the Dormi backend API is running before executing E2E tests.`);
    return false;
  }
}

async function main() {
  const options = parseArgs();

  if (options.help) {
    printHelp();
    process.exit(0);
  }

  console.log('='.repeat(72));
  console.log('🚀 DORMI FULLSTACK PLATFORM - E2E AUTOMATED TEST RUNNER (M4)');
  console.log('='.repeat(72));

  const isHealthy = await checkTargetHealth();
  if (!isHealthy) {
    process.exit(1);
  }

  const allTiers = [
    { id: '1', key: 'tier1', label: 'Tier 1: Feature Coverage (F1 - F8)', suite: tier1Suite },
    { id: '2', key: 'tier2', label: 'Tier 2: Boundary & Corner Cases', suite: tier2Suite },
    { id: '3', key: 'tier3', label: 'Tier 3: Cross-Feature Combinations', suite: tier3Suite },
    { id: '4', key: 'tier4', label: 'Tier 4: Real-World Workflows', suite: tier4Suite },
  ];

  let selectedTiers = [];
  if (options.tier === 'all') {
    selectedTiers = allTiers;
  } else {
    selectedTiers = allTiers.filter(t => t.id === options.tier || t.key === options.tier);
    if (selectedTiers.length === 0) {
      console.error(`\n❌ Unknown tier: "${options.tier}". Allowed values: 1, 2, 3, 4, all.`);
      process.exit(1);
    }
  }

  console.log(`\nExecuting test plan with ${selectedTiers.length} tier(s)...\n`);

  const results = [];
  const overallStart = performance.now();

  for (const tier of selectedTiers) {
    const result = await tier.suite.run();
    results.push({
      tier: tier.label,
      total: result.passed + result.failed,
      passed: result.passed,
      failed: result.failed,
      duration: result.durationMs,
    });
  }

  const totalDuration = (performance.now() - overallStart).toFixed(0);

  // Overall summary table
  console.log('\n' + '='.repeat(72));
  console.log('🏁 FINAL E2E TEST EXECUTION REPORT');
  console.log('='.repeat(72));
  console.log(
    'Tier / Suite Name'.padEnd(42) +
    'Tests'.padStart(7) +
    'Passed'.padStart(8) +
    'Failed'.padStart(8) +
    'Duration'.padStart(10)
  );
  console.log('-'.repeat(75));

  let totalTests = 0;
  let totalPassed = 0;
  let totalFailed = 0;

  for (const r of results) {
    totalTests += r.total;
    totalPassed += r.passed;
    totalFailed += r.failed;

    const tierCol = r.tier.length > 40 ? r.tier.substring(0, 37) + '...' : r.tier;
    console.log(
      tierCol.padEnd(42) +
      String(r.total).padStart(7) +
      String(r.passed).padStart(8) +
      String(r.failed).padStart(8) +
      `${(r.duration / 1000).toFixed(1)}s`.padStart(10)
    );
  }

  console.log('='.repeat(75));
  console.log(
    'TOTAL OVERALL'.padEnd(42) +
    String(totalTests).padStart(7) +
    String(totalPassed).padStart(8) +
    String(totalFailed).padStart(8) +
    `${(totalDuration / 1000).toFixed(1)}s`.padStart(10)
  );
  console.log('='.repeat(75));

  if (totalFailed === 0) {
    console.log(`\n🎉 SUCCESS: All ${totalPassed} E2E tests across selected tier(s) PASSED (100% pass rate).`);
    process.exit(0);
  } else {
    console.error(`\n❌ FAILURE: ${totalFailed} test(s) failed out of ${totalTests} executed.`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('\n💥 Fatal test runner exception:', err);
  process.exit(1);
});
