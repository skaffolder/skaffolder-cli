<p align="center"><a href="https://skaffolder.com"><img src="https://skaffolder.com/img/logo/skaffolder_logo-nero.svg" width="70%"></a></p>

<p align="center">
	<a href="https://npmjs.org/skaffolder-cli">
		<img alt="npm download total" src="https://img.shields.io/npm/dt/skaffolder-cli">
	</a>
	<a href="https://npmjs.org/skaffolder-cli">
		<img alt="npm version" src="https://img.shields.io/npm/v/skaffolder-cli">
	</a>
	<a href="https://travis-ci.org/skaffolder/skaffolder-cli">
		<img alt="Build Status" src="https://travis-ci.org/skaffolder/skaffolder-cli.svg?branch=master">
	</a>
	<a href="https://github.com/skaffolder/skaffolder-cli/blob/master/LICENSE">
		<img alt="Build Status" src="https://img.shields.io/github/license/skaffolder/skaffolder-cli">
	</a>
</p>

<p align="center">
    <img alt="sk-cli animation" width="90%" src="/media/sk-cli.svg">
</p>

# Skaffolder-cli

> The Skaffolder CLI is a powerful command-line interface (CLI) tool to access and manage a Skaffolder project.
> You can easily generate, export and add models, APIs and pages to your project.

# Table of Contents

- [Installation](#installation)
- [Getting started](#getting-started)
- [Commands](#commands)
  - [User Commands](#user-commands)
    - [`login`](#login)
    - [`logout`](#logout)
  - [Project Commands](#project-commands)
    - [Create Project](#create-project)
      - [`new [project name]`](#new-project-name)
      - [`open [id project] [id generator]`](#open-id-project-id-generator)
      - [`generate`](#generate)
    - [Manage Project](#manage-project)
      - [`add page [page name]`](#add-page-page-name)
      - [`add model [model name]`](#add-model-model-name)
      - [`add api`](#add-api)
  - [Generator Commands](#generator-commands)
    - [`generator init`](#generator-init)
    - [`generator pull`](#generator-pull)
    - [`generator push`](#generator-push)
    - [`generator create`](#generator-create)
    - [`generator publish`](#generator-publish)
  - [Utility Commands](#utility-commands)
    - [`web open`](#web-open)
    - [`set endpoint [endpoint]`](#set-endpoint-endpoint)
    - [`get endpoint`](#get-endpoint)
    - [`get user`](#get-user)
    - [`get project url`](#get-project-url)
    - [`list frontend`](#list-frontend)
    - [`list backend`](#list-backend)
    - [`import db [schema.xml]`](#import-db-schemaxml)
    - [`export`](#export)
    - [`help [command]`](#help-command)
- [Skaffolder documentation](#skaffolder-documentation)
  - [Template location](#template-location)
- [Contributing](#contributing)

---

## Installation

```bash
npm install -g skaffolder-cli
```

---

## Getting started

To create your first Skaffolder project just run `sk new`, then:

1. Give a name to your project.
1. Pick your frontend.
1. Pick your backend.

And your project is ready!

```bash
$ sk new
✔ Insert the name of your project … MyAwesomeProject
Project name:           MyAwesomeProject
✔ Select your frontend language › React Native
✔ Select your backend language › Go
...
✔   Project created offline!
```

That's it! Now to get the source code simply run `sk generate` and you are all set.

---

## Commands

Every `sk` commands takes five global options:

```bash
-h, --help                       Display help
-V, --version                    Display version
--no-color                       Disable colors
--quiet                          Quiet mode - only displays warn and error messages
-v, --verbose                    Verbose mode - will also output debug messages
```

### User Commands

Commands to manage your Skaffolder account.

##### `login`

Login to your Skaffolder account, a browser window will open to Skaffolder login page.
Be sure to be logged in when using project commands with the `--online` option and
when exporting your project.

Still don't have a Skaffolder account? Get yours [here](https://app.skaffolder.com/#!/register), it's free!.

Example:

```bash
$ sk login
...
The Skaffolder login will open in your default browser...

✔  Login successful with user: admin@example.com
...
```

##### `logout`

Logout from your Skaffolder account.

Example:

```bash
$ sk logout
✔ Logout successfully
```

### Project Commands

Used for manage and edit your Skaffolder project.
Every project command takes one option:

```bash
-o, --online                    Work online on the Skaffolder project, requires sk login
```

When using the `--online` option the cli works with project saved on our servers instead of reading your project from the openapi.yaml file. Before using this option, make sure that your project has been exported to Skaffolder.

#### Create Project

##### `new [project name]`

Create a new local Skaffolder project.

Additional options:

```bash
-i, --import <file>                Convert an OpenAPI 3.0 file in a Skaffolder project
-f, --frontend <templateName>      Template frontend language
-b, --backend <templateName>       Template backend language
-o, --online                       Create the project locally and exports it to your Skaffolder web interface account
```

Example:

```bash
$ sk new "MyProject" --frontend "React" --backend "NodeJS"
Project name:           MyProject
Frontend template:      React
Backend template:       NodeJS

File created: openapi.yaml
...
✔   Project created offline!

You can edit the project from the web interface running 'sk export'
You can edit the project from the VSCode extension https://github.com/skaffolder/skaffolder-vscode-extension
You can edit the project from the openapi.yaml file
You can edit the project from the command line:
        Add a model running 'sk add model'
        Add a page running 'sk add page'
        Add an API running 'sk add api'

Generate your code running 'sk generate'
```

##### `open [id project] [id generator]`

Open an already existent Skaffolder project. Requires `sk login`.

```bash
$ sk open
✔ Select your project › My_Project
✔ Select your generator › Generator Angular 6 + NodeJS - Sequelize
✔  Generator files imported in ./.skaffolder/template
You can edit your project structure at https://app.skaffolder.com/#!/projects/<project-id>/models or running 'sk web open'
```

If a Skaffolder project is already present in the folder, the program will ask you if you want to overwrite it.

##### `generate`

Generate the source code of your project from the openapi.yaml file.

Additional options:

```bash
-o, --online                       Generate the source code of your project from your Skaffolder account datas, it ignores the openapi.yaml
```

Example:

```bash
$ sk generate
File created: client/.dockerignore
File created: client/Dockerfile
File created: client/README.md
...
✔  Generation complete!
```

#### Manage Project

##### `add page [page name]`

Create a new page in the Skaffolder project.

Additional options:

```bash
-o, --online                       Add the page in the Skaffolder account
```

Example:

```bash
$ sk add page MyNewPage
Page name: MyNewPage
File modified: client/src/app/app-routing.module.ts
File created: client/src/app/pages/my-new-page/my-new-page-routing.module.ts
File created: client/src/app/pages/my-new-page/my-new-page.component.css
File created: client/src/app/pages/my-new-page/my-new-page.component.html
File created: client/src/app/pages/my-new-page/my-new-page.component.ts
File created: client/src/app/pages/my-new-page/my-new-page.module.ts
File modified: openapi.yaml
✔  Generation complete!
```

##### `add model [model name]`

Create a new model in the Skaffolder project. After the model will be created the program
will ask you if you want to generate CRUD interface for the newly created model.

Additional options:

```bash
-o, --online                       Add the model in the Skaffolder account
```

Example:

```bash
$ sk add model "MyNewModel"
Model name: MyNewModel
✔ Do you want to add an attribute to MyNewModel model? … No / Yes
✔ Insert the name of the attribute … MyNewModel_Attribute
✔ Select type of MyNewModel_Attribute attribute › String
✔ Do you want to add another attribute to MyNewModel model? … No / Yes
File created: client/src/api/generated/MyNewModelApiGenerated.js
File created: client/src/api/MyNewModelApi.js
...
✔  Generation complete!
You can edit your Model at https://app.skaffolder.com/#!/projects/undefined/models/undefined
✔ Do you want to generate CRUD interface for 'MyNewModel' model? … No / Yes
File modified: client/src/api/generated/MyNewModelApiGenerated.js
File modified: client/src/components/Navbar.js
...
✔  Generation complete!
```

##### `add api`

Create a new api. You can choose to create a CRUD or a custom API.

Additional options:

```bash
-o, --online                       Add the page in the Skaffolder account
```

Example creating a CRUD delete API:

```bash
$ sk add api
✔ Select the model on which you want to create the API › MyNewModel
✔ Select type of your API › delete
You can edit your API at https://app.skaffolder.com/#!/projects/undefined/apis/undefined
File modified: client/src/api/generated/MyNewModelApiGenerated.js
File modified: client/src/redux/actionTypes.js
...
✔  Generation complete!
```

Example creating a custom API:

```bash
$ sk add api
✔ Select the model on which you want to create the API › MyNewModel
✔ Select type of your API › Custom API
✔ Insert the name of your API … myNewCustomApi
API name: myNewCustomApi
✔ Insert the URL of your API. Example: /{id}/action … /{id}/customApi
API name: /{id}/customApi
✔ Select the method of your API › POST
File modified: client/src/api/generated/MyNewModelApiGenerated.js
File modified: client/src/redux/actionTypes.js
...
✔  Generation complete!
```

### Generator Commands

##### `generator init`

Initializes a new generator in the `.skaffolder/template` folder. This command will overwrite your existing local generator.

Example:

```bash
$ sk generator init
✔ Select your frontend language › React
✔ Select your backend language › Go
✔  Generator files imported in ./.skaffolder/template

Now you can generate your code running 'sk generate'
```

##### `generator pull`

Pulls the remote generator on Skaffolder in the local generator of your project. Any changes to your remote generator on Skaffolder will no be reflected into your local generator.

Example:

```bash
$ sk generator pull
✔  Generator files imported in ./.skaffolder/template
You can edit your project structure at http://localhost:3001/#!/projects/<project-id>/models or running 'sk web open'
```

##### `generator push`

Pushes the local generator of your project to the remote generator on Skaffolder. In this way any changes to your generator will be saved.

**Pro tip**: You can edit your generator directly on Skaffolder: Move to the generators tab, click on _Edit Generator_ and then, on the bottom, click _Customize generator template_.

##### `generator create`

Copy the content of your project folder inside the `.skaffolder/template` folder. This may be useful when creating new generators.

```bash
$ sk generator create
✔ Do you want to overwrite ./.skaffolder/template folder? … No / Yes
✔  Generator files imported in ./.skaffolder/template
Now you can customize template files an generate code with 'sk generate'
```

##### `generator publish`

Share your local generator with Skaffolder community.
If you want to learn more on how to become a contributor, click [here](https://skaffolder.com/contributor).

```bash
$ sk generator publish --verbose
✔ Do you want to share ./.skaffolder/template folder with the Skaffolder community? … No / Yes
✔  Generator files shared
The Skaffolder team will check this generator and it will be published if quality standards are ok.
We will contact you at your account email
```

### Utility Commands

Useful commands to import/export project and get your configurations.

##### `web open`

Open your project on Skaffolder web interface. The project must be exported before calling this command.

##### `set endpoint [endpoint]`

Set Skaffolder endpoint for on-premise.

##### `get endpoint`

Get Skaffolder endpoint for on-premise.

##### `get user`

Get the currently logged Skaffolder user.

Example:

```bash
$ sk get user
User: admin@example.com
```

##### `get project url`

Get your project url. The project must be exported before calling this command.

Example:

```bash
$ sk get project url
To manage data models, APIs and pages of your project, visit this URL:
https://app.skaffolder.com/#!/projects/<project-id>/models
```

##### `list frontend`

List all available frontend templates.

##### `list backend`

List all available backend templates.

##### `import db [schema.xml]`

Import your db schema in Skaffolder from a [SchemaSpy](http://schemaspy.sourceforge.net) XML file, [here](https://skaffolder.com/docs/schema_example.xml) you can find an example.
In order to successfully import your database, you need to call this commands from a project already exported on Skaffolder.

Example:

```bash
sk import db schema.xml
✔   Db import completed!
You can edit your project structure at https://app.skaffolder.com/#!/projects/<project-id>/models or running 'sk web open'
```

##### `export`

Export your local project to Skaffolder. Requires `sk login`.

Example:

```bash
$ sk export

File modified: openapi.yaml
Create project
[CREATE]: 'MyProject' project
[CREATE]: 'MyProject_db' database
...
[CREATE]: 'Home' page
[UPDATE]: 'MyProject' project pages and dbs
```

##### `help [command]`

Display help for a specific command.

---

## Skaffolder documentation

Additional Skaffolder documentation can be found [here](https://skaffolder.com/documentation).

### Template location

In your folder workspace, Skaffolder creates a `.skaffolder` folder.
This folder is used by Skaffolder-cli to store the generator's files. Each template file (`.hbs` extension) follows [Handlebar's](https://handlebarsjs.com) syntax and is used by Skaffolder when generating
the project's source code.

---

## Contributing

Skaffolder-cli is an open-source project. Feel free to propose enhancements suggestions, report bugs and to submit pull requests.

- [Github repository](https://github.com/skaffolder/skaffolder-cli)
- [NPM Package](https://www.npmjs.com/package/skaffolder-cli)
