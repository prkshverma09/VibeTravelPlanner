import { describe, it, expect } from 'vitest';

describe('Data Pipeline Package', () => {
  it('should have generators module', async () => {
    const generators = await import('../generators');
    expect(generators).toBeDefined();
    expect(generators.generateBaseCities).toBeDefined();
    expect(generators.generateScores).toBeDefined();
  });

  it('should have services module', async () => {
    const services = await import('../services');
    expect(services).toBeDefined();
    expect(services.LLMService).toBeDefined();
    expect(services.ImageService).toBeDefined();
  });

  it('should have assemblers module', async () => {
    const assemblers = await import('../assemblers');
    expect(assemblers).toBeDefined();
    expect(assemblers.CityAssembler).toBeDefined();
  });

  it('should have clients module', async () => {
    const clients = await import('../clients');
    expect(clients).toBeDefined();
    expect(clients.AlgoliaClient).toBeDefined();
  });

  it('should have pipeline module', async () => {
    const pipeline = await import('../pipeline');
    expect(pipeline).toBeDefined();
    expect(pipeline.PipelineOrchestrator).toBeDefined();
  });

  it('should export CLI utilities', async () => {
    const cli = await import('../cli');
    expect(cli.parseArgs).toBeDefined();
    expect(cli.validateEnv).toBeDefined();
  });
});

describe('CLI Utilities', () => {
  it('should parse generate command', async () => {
    const { parseArgs } = await import('../cli');
    const args = parseArgs(['generate', '--count', '50']);

    expect(args.command).toBe('generate');
    expect(args.options.count).toBe(50);
  });

  it('should parse upload command with dry-run', async () => {
    const { parseArgs } = await import('../cli');
    const args = parseArgs(['upload', '--dry-run']);

    expect(args.command).toBe('upload');
    expect(args.options.dryRun).toBe(true);
  });

  it('should parse configure command', async () => {
    const { parseArgs } = await import('../cli');
    const args = parseArgs(['configure', '--index', 'travel_destinations']);

    expect(args.command).toBe('configure');
    expect(args.options.index).toBe('travel_destinations');
  });

  it('should parse upload command with file option', async () => {
    const { parseArgs } = await import('../cli');
    const args = parseArgs(['upload', '--file', '/path/to/data.json']);

    expect(args.command).toBe('upload');
    expect(args.options.file).toBe('/path/to/data.json');
  });

  it('should parse generate command with output option', async () => {
    const { parseArgs } = await import('../cli');
    const args = parseArgs(['generate', '--output', '/tmp/output.json']);

    expect(args.command).toBe('generate');
    expect(args.options.output).toBe('/tmp/output.json');
  });

  it('should parse skip-enrichment flag', async () => {
    const { parseArgs } = await import('../cli');
    const args = parseArgs(['generate', '--skip-enrichment']);

    expect(args.command).toBe('generate');
    expect(args.options.skipEnrichment).toBe(true);
  });

  it('should validate environment variables', async () => {
    const { validateEnv } = await import('../cli');

    const validEnv = {
      ALGOLIA_APP_ID: 'app',
      ALGOLIA_API_KEY: 'key',
      OPENAI_API_KEY: 'openai',
    };
    const validResult = validateEnv(validEnv);
    expect(validResult.valid).toBe(true);
    expect(validResult.missing).toHaveLength(0);
  });

  it('should detect missing ALGOLIA_APP_ID', async () => {
    const { validateEnv } = await import('../cli');

    const env = { ALGOLIA_API_KEY: 'key', OPENAI_API_KEY: 'openai' };
    const result = validateEnv(env);

    expect(result.valid).toBe(false);
    expect(result.missing).toContain('ALGOLIA_APP_ID');
  });

  it('should detect missing ALGOLIA_ADMIN_KEY', async () => {
    const { validateEnv } = await import('../cli');

    const env = { ALGOLIA_APP_ID: 'app', OPENAI_API_KEY: 'openai' };
    const result = validateEnv(env);

    expect(result.valid).toBe(false);
    expect(result.missing).toContain('ALGOLIA_ADMIN_KEY');
  });

  it('should detect missing OPENAI_API_KEY', async () => {
    const { validateEnv } = await import('../cli');

    const env = { ALGOLIA_APP_ID: 'app', ALGOLIA_ADMIN_KEY: 'key' };
    const result = validateEnv(env);

    expect(result.valid).toBe(false);
    expect(result.missing).toContain('OPENAI_API_KEY');
  });

  it('should detect all missing variables', async () => {
    const { validateEnv } = await import('../cli');

    const env = {};
    const result = validateEnv(env);

    expect(result.valid).toBe(false);
    expect(result.missing).toContain('ALGOLIA_APP_ID');
    expect(result.missing).toContain('ALGOLIA_ADMIN_KEY');
    expect(result.missing).toContain('OPENAI_API_KEY');
  });
});
