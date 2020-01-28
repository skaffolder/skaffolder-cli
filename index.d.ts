export as namespace SkaffolderCli;

// Utils
export function getUser(): string | undefined;
export function login(args: any, options: any, logger: { info: (message: string) => any }, cb: any): any;
export function logout(args: any, options: any, logger: { info: (message: string) => any }): any;
export function registerHelpers(Handlebar: any): void;
export function setEnv(endpoint: string): void;
export function getEnv(): string;
export function getProject(): string;

// Getters
export function getGenFiles(path: string): GeneratorFile[];
export function getTemplate(callback: any): any;
export function getProperties(content: any, nameFileTemplate: any, pathTemplate: any): any;

// Actions
export function exportProject(
  params: {
    project: string;
    generator: string;
    skObject: any;
  },
  cb: (err: any, logs: any, projectId: string) => any
): void;
export function generate(
  workspacePath: string,
  data: any,
  logger: { info: (message: string) => any },
  callback: (err: string[], log: string[]) => any
): any;
export function generateFile(
  log: any,
  file: {
    name: string;
    overwrite: boolean;
    template: any;
  },
  paramLoop: any,
  opt: any
): any;
export function init(workspacePath: string, project: any, modules: any, resources: any, db: any, roles: any): any;
export function createProjectExtension(
  workspacePath: string,
  projectId: string,
  logger: { info: (message: string) => any },
  frontendId: string,
  backendId: string,
  skaffolderObj: any,
  callback: (files: any) => any
): any;
export function createPage(name: any): any;
export function getProjectData(logger: { info: (message: string) => any }, path: string): any;
export function translateYamlProject(yamlObj: any): any;

export class GeneratorFile {
  public name: string;
  public forEachObj: string;
  public overwrite: boolean;
  public template: string;
  public _partials: PartialFile[];
}

// Structures
export class PartialFile {
  public name: string;
  public tagFrom: string;
  public tagTo: string;
  public template: string;
}

export namespace Offline {
  var pathWorkspace: string;

  /**
   * Create or update a page in the openapi.yaml file.
   *
   * @param page
   */
  export function createPage(page: object): any;

  /**
   * Create or update a model in the openapi.yaml file.
   *
   * @param model_name the name of the model.
   * @param model
   */
  export function createModel(model_name: string, model: any): any;

  /**
   * Create CRUD in the openapi.yaml
   * @param model 
   */
  export function createCrud(model: any) : void;

  /**
   * Create or update a service in the openapi.yaml file.
   *
   * @param api
   */
  export function createService(service: any, service_method: string, resource: any): any;

  /**
   * Remove a page.
   *
   * @param page_id
   */
  export function removePage(page_id: string): boolean;

  /**
   * Remove a service.
   *
   * @param service_id
   */
  export function removeService(service_id: string): boolean;

  /**
   * Remove a model.
   *
   * @param model_id
   */
  export function removeModel(resource_id: string, removePages: boolean): boolean;
}
