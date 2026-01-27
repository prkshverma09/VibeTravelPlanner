#!/usr/bin/env node
import { Command } from 'commander';
import { config } from 'dotenv';
import * as fs from 'fs/promises';
import * as path from 'path';
import { PipelineOrchestrator, PipelineProgress } from '../pipeline/orchestrator';
import { AlgoliaClient, DEFAULT_INDEX_SETTINGS } from '../clients/algolia.client';

config();

export const program = new Command();

const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
let spinnerIndex = 0;

function getSpinner(): string {
  spinnerIndex = (spinnerIndex + 1) % SPINNER_FRAMES.length;
  return SPINNER_FRAMES[spinnerIndex];
}

function formatProgress(progress: PipelineProgress): string {
  const spinner = getSpinner();
  const bar = createProgressBar(progress.progress, 20);
  return `${spinner} [${bar}] ${progress.progress}% - ${progress.message}`;
}

function createProgressBar(percent: number, width: number): string {
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

function log(message: string): void {
  process.stdout.write(`\r${message.padEnd(80)}\n`);
}

function updateProgress(message: string): void {
  process.stdout.write(`\r${message.padEnd(80)}`);
}

program
  .name('vibe-pipeline')
  .description('Data pipeline CLI for Vibe-Check Travel Planner')
  .version('0.1.0');

program
  .command('generate')
  .description('Generate travel destination data and optionally upload to Algolia')
  .option('-c, --count <number>', 'Number of cities to generate', '50')
  .option('-o, --output <file>', 'Output file path for generated data')
  .option('--dry-run', 'Generate data without uploading to Algolia')
  .option('--skip-enrichment', 'Skip LLM enrichment (use default descriptions)')
  .option('-v, --verbose', 'Show verbose output')
  .action(async (options) => {
    const envValidation = validateEnv(process.env);
    if (!envValidation.valid && !options.dryRun) {
      console.error('Missing required environment variables:', envValidation.missing.join(', '));
      console.error('Set these variables or use --dry-run to test without Algolia/OpenAI');
      process.exit(1);
    }

    const config = {
      algoliaAppId: process.env.ALGOLIA_APP_ID || '',
      algoliaApiKey: process.env.ALGOLIA_ADMIN_KEY || process.env.ALGOLIA_API_KEY || '',
      algoliaIndexName: process.env.ALGOLIA_INDEX_NAME || 'travel_destinations',
      openaiApiKey: process.env.OPENAI_API_KEY || '',
      openaiModel: process.env.OPENAI_MODEL,
    };

    const pipeline = options.dryRun
      ? PipelineOrchestrator.createForTesting()
      : PipelineOrchestrator.create(config);

    log(`\n🌍 Vibe Travel Pipeline - Generate\n`);
    log(`Cities: ${options.count}`);
    log(`Dry run: ${options.dryRun ? 'Yes' : 'No'}`);
    log(`Skip enrichment: ${options.skipEnrichment ? 'Yes' : 'No'}`);
    if (options.output) {
      log(`Output file: ${options.output}`);
    }
    log('');

    const result = await pipeline.run({
      dryRun: options.dryRun,
      skipEnrichment: options.skipEnrichment,
      cityCount: parseInt(options.count, 10),
      outputFile: options.output,
      onProgress: (progress) => {
        updateProgress(formatProgress(progress));
      },
    });

    log('');
    log('');

    if (result.success) {
      log('✅ Pipeline completed successfully!');
      log(`   Cities processed: ${result.stats.processedCities}`);
      log(`   Duration: ${result.stats.duration}ms`);
      if (result.outputFile) {
        log(`   Output saved to: ${result.outputFile}`);
      }
    } else {
      log('❌ Pipeline failed!');
      log(`   Error: ${result.error}`);
      process.exit(1);
    }
  });

program
  .command('upload')
  .description('Upload data from a JSON file to Algolia')
  .requiredOption('-f, --file <path>', 'Input JSON file path')
  .option('-i, --index <name>', 'Algolia index name', 'travel_destinations')
  .option('--dry-run', 'Validate data without uploading')
  .action(async (options) => {
    const envValidation = validateEnv(process.env);
    if (!envValidation.valid && !options.dryRun) {
      console.error('Missing required environment variables:', envValidation.missing.join(', '));
      process.exit(1);
    }

    log(`\n📤 Vibe Travel Pipeline - Upload\n`);
    log(`File: ${options.file}`);
    log(`Index: ${options.index}`);
    log(`Dry run: ${options.dryRun ? 'Yes' : 'No'}`);
    log('');

    try {
      const filePath = path.resolve(options.file);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const records = JSON.parse(fileContent);

      if (!Array.isArray(records)) {
        throw new Error('File must contain a JSON array of records');
      }

      log(`Found ${records.length} records`);

      if (options.dryRun) {
        log('✅ Dry run complete - data is valid');
        return;
      }

      const client = new AlgoliaClient({
        appId: process.env.ALGOLIA_APP_ID!,
        apiKey: process.env.ALGOLIA_ADMIN_KEY || process.env.ALGOLIA_API_KEY!,
        indexName: options.index,
      });

      await client.configureIndex(DEFAULT_INDEX_SETTINGS);

      const result = await client.uploadRecords(records, {
        waitForTask: true,
        onProgress: ({ uploaded, total }) => {
          const progress = Math.round((uploaded / total) * 100);
          updateProgress(`${getSpinner()} Uploading: ${uploaded}/${total} (${progress}%)`);
        },
      });

      log('');

      if (result.success) {
        log(`✅ Successfully uploaded ${records.length} records to ${options.index}`);
      } else {
        log(`❌ Upload failed: ${result.error}`);
        process.exit(1);
      }
    } catch (error) {
      log(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  });

program
  .command('configure')
  .description('Configure Algolia index settings')
  .option('-i, --index <name>', 'Index name', 'travel_destinations')
  .option('--dry-run', 'Show settings without applying')
  .action(async (options) => {
    const envValidation = validateEnv(process.env);
    if (!envValidation.valid && !options.dryRun) {
      console.error('Missing required environment variables:', envValidation.missing.join(', '));
      process.exit(1);
    }

    log(`\n⚙️  Vibe Travel Pipeline - Configure\n`);
    log(`Index: ${options.index}`);
    log(`Dry run: ${options.dryRun ? 'Yes' : 'No'}`);
    log('');

    if (options.dryRun) {
      log('Settings to apply:');
      log(JSON.stringify(DEFAULT_INDEX_SETTINGS, null, 2));
      return;
    }

    try {
      const client = new AlgoliaClient({
        appId: process.env.ALGOLIA_APP_ID!,
        apiKey: process.env.ALGOLIA_ADMIN_KEY || process.env.ALGOLIA_API_KEY!,
        indexName: options.index,
      });

      await client.configureIndex(DEFAULT_INDEX_SETTINGS);

      log(`✅ Successfully configured index: ${options.index}`);
    } catch (error) {
      log(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  });

// Only parse when run directly
const isDirectRun =
  typeof process !== 'undefined' &&
  process.argv[1]?.endsWith('cli/index.ts') ||
  process.argv[1]?.endsWith('cli/index.js');

if (isDirectRun) {
  program.parse();
}

export function parseArgs(args: string[]): {
  command: string;
  options: Record<string, unknown>;
} {
  const command = args[0] || '';
  const options: Record<string, unknown> = {};

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--count' || arg === '-c') {
      options.count = parseInt(args[++i], 10);
    } else if (arg === '--index' || arg === '-i') {
      options.index = args[++i];
    } else if (arg === '--file' || arg === '-f') {
      options.file = args[++i];
    } else if (arg === '--output' || arg === '-o') {
      options.output = args[++i];
    } else if (arg === '--skip-enrichment') {
      options.skipEnrichment = true;
    }
  }

  return { command, options };
}

export function validateEnv(env: Record<string, string | undefined>): {
  valid: boolean;
  missing: string[];
} {
  const missing: string[] = [];
  if (!env.ALGOLIA_APP_ID) missing.push('ALGOLIA_APP_ID');
  if (!env.ALGOLIA_ADMIN_KEY && !env.ALGOLIA_API_KEY) missing.push('ALGOLIA_ADMIN_KEY');
  if (!env.OPENAI_API_KEY) missing.push('OPENAI_API_KEY');
  return {
    valid: missing.length === 0,
    missing,
  };
}
