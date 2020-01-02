export as namespace SkaffolderCli;

// Utils
export function getUser(): string | undefined;
export function login(args: any, options: any, logger: { info: (message: string) => any }, cb: any): any;
export function logout(args: any, options: any, logger: { info: (message: string) => any }): any;
export function registerHelpers(Handlebar: any): void;
export function setEnv(endpoint: string): void;
export function getEnv(): string;

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
   * Remove a page.
   * 
   * @param page_id 
   */
  export function removePage(page_id: string): boolean;
}
