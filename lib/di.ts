import 'reflect-metadata';

const DI_IMPORTS_SYMBOL = Symbol('di:imports')
const DI_PROVIDERS_SYMBOL = Symbol('di:providers')

export interface Type<T=any> extends Function {
  new (...args: Array<any>): T;
}

const moduleInstances: Map<any, any> = new Map();

export function Injectable(): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata('design:paramtypes', Reflect.getMetadata('design:paramtypes', target) || [], target);
  };
}

export function Module(options: { imports?: Array<any>, providers?: Array<any> }): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(DI_IMPORTS_SYMBOL, new Set(options.imports || []), target);
    Reflect.defineMetadata(DI_PROVIDERS_SYMBOL, new Set(options.providers || []), target);
  }
}

export namespace Factory {

  export function create(module: Type) {
    const imports: Set<Type> = Reflect.getMetadata(DI_IMPORTS_SYMBOL, module);
    const providers: Set<any> = Reflect.getMetadata(DI_PROVIDERS_SYMBOL, module);
    const providersMap = new Map();

    const importModules = Array.from(imports).map((importModule) => {
      let moduleInstance: ModuleInstance = moduleInstances.get(importModule);
      if(!moduleInstance) {
        moduleInstance = create(importModule);
        moduleInstances.set(importModule, moduleInstance);
      }
      return moduleInstance;
    });
    const moduleInstance = new ModuleInstance(importModules, providersMap);

    providers.forEach(provider => {
      createProvider(provider, providers, moduleInstance);
    });
    return moduleInstance;
  }

  function createProvider(provider: any, providers: Set<any>, moduleInstance: ModuleInstance) {
    let providerInstance = moduleInstance.providers.get(provider);

    if(providerInstance) {
      return providerInstance;
    }

    const deps: Array<any> = Reflect.getMetadata('design:paramtypes', provider);
    if(!deps) {
      throw new Error(`No provider named ${ provider.name }, do yout add @Injectable() to this provider?`);
    }

    const args = deps.map(dep => {
      let depInstance = moduleInstance.providers.get(dep);
      if(!depInstance) {
        if(providers.has(dep)) {
          depInstance = createProvider(dep, providers, moduleInstance);
        } else {
          moduleInstance.imports.some(imp => {
            depInstance = createProvider(dep, new Set(), imp);
            return !!depInstance;
          });
        }
      }
      if(!depInstance) {
        throw new Error(`can not found provider ${ dep.name }`);
      }
      return depInstance;
    });
    providerInstance = new provider(...args);
    moduleInstance.providers.set(provider, providerInstance);
    return providerInstance;
  }

  export class ModuleInstance {

    constructor(
        public imports: Array<ModuleInstance>,
        public providers: Map<any, any>) {

    }

    get<T>(provider: Type<T>) {
      let instance: T = this.providers.get(provider);
      if(!instance) {
        this.imports.some(imp => {
          instance = imp.get(provider);
          return !!instance;
        });
      }
      if(!instance) {
        throw new Error(`No provider named: ${ provider.name }`);
      }
      return instance;
    }
  }

}
