[![Skaffolder](https://skaffolder.com/img/logo/skaffolder_logo-nero.svg)](https://www.google.com)

![npm](https://img.shields.io/npm/dt/skaffolder-cli)
![npm](https://img.shields.io/npm/v/skaffolder-cli)
[![Build Status](https://travis-ci.org/skaffolder/skaffolder-cli.svg?branch=master)](https://travis-ci.org/skaffolder/skaffolder-cli)

# Skaffolder-cli

> The Skaffolder CLI is a powerful command-line interface (CLI) tool to access and manage a Skaffolder project.
> You can easily generate, export and add models, APIs and pages to your project.

## Installation

```bash
npm install -g skaffolder-cli
```

## Getting started

First of all you have to login into your free Skaffolder account running `sk login`:

```bash
$ sk login
Skaffolder: Insert your email account:
    Skaffolder: Insert your password:

    ✔  Login successful
```

## Commands

Every `sk` commands takes five global options:

```bash
-h, --help                       Display help
-V, --version                    Display version
--no-color                       Disable colors
--quiet                          Quiet mode - only displays warn and error messages
-v, --verbose                    Verbose mode - will also output debug messages
```

### Project Commands

Used for manage and edit your Skaffolder project.
Every project command takes one option:

```bash
-o, --online                    Work online on the Skaffolder project, requires sk login
```

#### `new [project name]`

Create a new Skaffolder project.

Example:

```bash
$ sk new MyProject
Project name: MyProject
✔ Select your frontend language › Angular 6
✔ Select your backend language › Go

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

#### `open [id project] [id generator]`

Open an already existent Skaffolder project. Requires `sk login`

```bash
$ sk open
✔ Select your project › My_Project
✔ Select your generator › Generator Angular 6 + NodeJS - Sequelize
✔  Generator files imported in ./.skaffolder/template
You can edit your project structure at https://app.skaffolder.com/#!/projects/<project-id>/models or running 'sk web open'
```

If a Skaffolder project is already present in the folder, the program will ask you if you want to overwrite it.

#### `generate`

Generate the source code of your project from the openapi.yaml file.

```bash
$ sk generate
File created: client/.dockerignore
File created: client/Dockerfile
File created: client/README.md
...
```

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
