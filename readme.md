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
    <img alt="sk-cli gif" width="80%" src="/media/sk-cli.gif">
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

##### `add model [model name]`

Create a new model in the Skaffolder project. After the model will be created the program
will ask you if you want to generate CRUD interface for the newly created model.

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

<!-- 
To open an existing project you can run `sk open`

### Generate source code

You can use the command `sk generate` to generate your source code from your template files.

```bash
[root@skaffolder ~]$ sk generate

    START GENERATE
    File created: ./.gitignore
    File created: ./swagger.yaml
    File created: ./app.js
    ...

    ✔  Generation complete!
```

### Edit project

Now you can edit you project on Skaffolder platform adding data models, APIs and pages at your app.

###### Add page

To add a page run `sk add page`.
You can optionally specity the name running `sk add page <name>`

```bash
[root@skaffolder ~]$ sk add page mypage
    START GENERATE
    File created: ./client/app/pages/mypage/mypage.component.css
    File created: ./client/app/pages/mypage/mypage.component.html
    File created: ./client/app/pages/mypage/mypage.component.ts
    ✔  Generation complete!
    You can edit your project structure at http://app.skaffolder.com/#!/projects/my-project-id/models
```

###### Add Data Model

To add a data model run `sk add model`.
You can optionally specity the name running `sk add model <name>`

```bash
[root@skaffolder ~]$ sk add model
```

###### Add API

To add an API run `sk add api`

```bash
[root@skaffolder ~]$ sk add api
```

### Edit project from web interface

You can completely manage data models, APIs and pages of your project from a graphic interface.
You can run `sk get project url` and browse the provided link:

```bash
[root@skaffolder ~]$ sk get project url
    To manage data models, APIs and pages of your project, visit this URL:
    https://app.skaffolder.com/#!/projects/my-project-id/models
```

## Create a custom template generator

In you current path a folder `.skaffolder` was created.
In `.skaffolder/template` you can find your template files editable, they respect the <a href="https://handlebarsjs.com" target="_blank">Handlebars sintax</a> and you can use also these additional <a href="https://www.npmjs.com/package/handlebars-helpers" target="_blank">helpers functions</a>.

You can create a new template from any boilerplate.
Put in your Skaffolder project folder your boilerplate files and run

```bash
[root@skaffolder ~]$ sk generator import
```

With this command all files in Skaffolder project folder will be imported in `.skaffolder/template` with Handlebars sintax and default Skaffolder properties.

### Skaffolder Properties

Each template file in `.skaffolder/template` folder has `.hbs` extension and first lines of file can be (optional) Skaffolder properties.
This section is delimitated by `**** PROPERTIES SKAFFOLDER ****` token and contains JSON formatted properties.

<table>
    <tr>
        <th>Properties</th>
        <th>Type</th>
        <th>Description</th>
    </tr>
    <tr>
        <td>forEachObj</td>
        <td>String</td>
        <td>Generate this file for each selected value:
            <ul>
                <li>oneTime</li>
                <li>db</li>
                <li>table</li>
                <li>module</li>
                <li>resource</li>
            </ul>
        </td>
    </tr>
    <tr>
        <td>overwrite</td>
        <td>Boolean</td>
        <td>If true overwites existing files</td>
    </tr>
    <tr>
        <td>partials</td>
        <td>
            Array of Object
        </td>
        <td>
            Object with:
            <ul>
                <li>
                    <b>name</b>
                    <div>
                        Name of partial
                    </div>
                </li>
                <li>
                    <b>template</b>
                    <div>
                        Content to insert in partial section
                    </div>
                </li>
                <li>
                    <b>tagFrom</b>
                    <div>
                        Start delimiter of partial
                    </div>
                </li>
                <li>
                    <b>tagTo</b> 
                    <div>
                        End delimiter of partial
                    </div>
                </li>
            </ul>
        </td>
    </tr>
</table>

#### Example:

You can create the file `.skaffolder/template/{{capitalize entity.name}}Dao.java.hbs` with this content and run `sk generate`

```java
**** PROPERTIES SKAFFOLDER ****
{
    "forEachObj": "table",
    "overwrite": true,
    "_partials": [
        {
            "name": "Description",
            "template": "// Partial comment",
            "tagFrom": "// START - PARTIAL",
            "tagTo": "// END - PARTIAL"
        }
    ]
}
**** END PROPERTIES SKAFFOLDER ****
// This is my file content
// File name: {{capitalize entity.name}}Dao.java.hbs

// START - PARTIAL
// END - PARTIAL
public class {{capitalize entity.name}} {

    private Long _id;

    // Attributes
    {{#each entity._attrs}}
    private String {{name}};
    {{/each}}
}

/**
    All Handlebars parameters:

{{json .}}

**/
```

### Add a custom Handlebars Helper

Handlebars Helpers are custom function that you can execute on your template.

You can add an helper creating a file name `extra.js` in your project folder with an array of helpers function as shown in the example below

```javascript
exports.helpers = [
  {
    name: "myFunction",
    fn: function(param1, options) {
      return param1 + " Hello World";
    }
  }
];
```

You can now use this function in your `.hbs` template file:

```handlebars
HBS file:
my HBS file {{myFunction "test"}}

Result:
my HBS file test Hello World

```

### Import Schema from existing Database

You can import you Db schema in Skaffolder from a XML file.
The XML file is produced by <a href="http://schemaspy.sourceforge.net" target="_blank"> SchemaSpy</a> you can find an <a href="https://skaffolder.com/docs/schema_example.xml" target="_blank">example file here</a>.

In order to import this file in your Skaffolder project run:

```bash
[root@skaffolder ~]$ sk import db <path_file>
```

Now you have data models on Skaffolder platform.

# More documentation

> You can find <a href="https://skaffolder.com/#/documentation" target="_blank">additional documentation here</a>

# Contribute

This is an open-source project

> GitHub Repository
> [https://github.com/skaffolder/skaffolder-cli](https://github.com/skaffolder/skaffolder-cli)

> Npm package
> [https://www.npmjs.com/package/skaffolder-cli](https://www.npmjs.com/package/skaffolder-cli) -->
