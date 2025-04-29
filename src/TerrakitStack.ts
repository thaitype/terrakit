import { TerraformStack, type TerraformProvider } from 'cdktf';
import type { Construct } from 'constructs';
import type { TerrakitOptions, TerrakitStackConfig } from './types.js';
import { BlockComposer } from './BlockComposer.js';

export class TerrakitStack<Config extends TerrakitStackConfig = TerrakitStackConfig> extends TerraformStack {
  providers!: Record<keyof Config['providers'], TerraformProvider>;
  public composer!: BlockComposer;

  constructor(
    scope: Construct,
    protected readonly id: string,
    public readonly options: TerrakitOptions<Config>
  ) {
    super(scope, id);
    if (options.providers) {
      this.providers = TerrakitStack.setupProviders(this, options) as Record<
        keyof Config['providers'],
        TerraformProvider
      >;
      console.log('Initialized providers at TerrakitStack');
      this.composer = new BlockComposer(scope, this.providers);
    }
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
