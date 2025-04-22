import { TerraformStack, type TerraformProvider } from 'cdktf';
import type { Construct } from 'constructs';
import { z } from 'zod';
import type { TerrakitOptions, TerrakitStackConfig } from './types.js';
import { BlockComposer } from './BlockComposer.js';

export class TerrakitStack<Config extends TerrakitStackConfig = TerrakitStackConfig> extends TerraformStack {
  providers!: Record<keyof Config['providers'], TerraformProvider>;
  public composer!: BlockComposer;

  constructor(
    scope: Construct,
    public readonly options: TerrakitOptions<Config>
  ) {
    const id = TerrakitStack.generateStackId(options);
    super(scope, id);
    // if (!options) {
    //   throw new Error('The options are required to initialize the TerrakitStack.');
    // }
    if (options.composer) {
      console.log('Initialized composer at TerrakitStack');
      options.composer.build();
      this.composer = options.composer;
    } else if (options.providers) {
      this.providers = TerrakitStack.setupProviders(this, options) as Record<
        keyof Config['providers'],
        TerraformProvider
      >;
      console.log('Initialized providers at TerrakitStack');
      this.composer = new BlockComposer(scope, this.providers);
    }
  }

  static generateStackId<Config extends TerrakitStackConfig>(options?: TerrakitOptions<Config>): string {
    if (options && options.id) {
      return options.id;
    }
    if (!options || !options.identifier) {
      throw new Error('The identifier is required to generate the stack id.');
    }
    const identifier = z.record(z.string()).parse(options.identifier);
    if (Object.keys(identifier).length === 0) {
      throw new Error('The identifier must not be empty.');
    }
    return Object.entries(identifier)
      .map(([key, value]) => `${key}_${value}`)
      .join('-');
  }

  static setupProviders(scope: Construct, options: TerrakitOptions) {
    const providers: Record<string, any> = {};
    for (const [key, provider] of Object.entries(options.providers as Record<string, any>)) {
      providers[key] = provider(scope);
    }
    return providers;
  }

  configureStack(): void {
    throw new Error('Method not implemented.');
  }

  output<T extends Record<string, any> = {}>(composer: BlockComposer<T>) {
    // Attach the composer to the stack
    this.composer = composer as any;
    return {
      stack: this as TerrakitStack<Config>,
      outputs: composer.outputs,
    };
  }
}
