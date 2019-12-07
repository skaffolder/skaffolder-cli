# Skaffolder-cli

To install skaffolder-cli run:

```bash
npm install -g skaffolder-cli
```

<a href="https://www.skaffolder.com" target="_blank">![Skaffolder](https://skaffolder.com/img/logo/skaffolder_logo-nero.svg)</a>

# Getting started!

First of all you have to login into your free Skaffolder account running `sk login`:

```bash
[root@skaffolder ~]$ sk login
    Skaffolder: Insert your email account:
    Skaffolder: Insert your password:

    ✔  Login successful
```

### Create project

Now you can create a new project running `sk new`

```bash
[root@skaffolder ~]$ sk new

    Skaffolder: Insert name of your project:  MyProject

    Skaffolder: Select your frontend language
     ▸ Angular 4
       AngularJS

    Skaffolder: Select your backend language
       Java
     ▸ NodeJS
       PHP
       Java Spring Boot
       Java Spring Boot MySQL

    ✔   Project created!
    You can edit your project structure at https://app.skaffolder.com/#!/projects/my-project-id/design/models
    Generator files imported in ./.skaffolder/template

```

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
    You can edit your project structure at http://app.skaffolder.com/#!/projects/my-project-id/design/models
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
    https://app.skaffolder.com/#!/projects/my-project-id/design/models
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

###Skaffolder Properties

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

####Example:

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

###Add a custom Handlebars Helper

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

###Import Schema from existing Database

You can import you Db schema in Skaffolder from a XML file.
The XML file is produced by <a href="http://schemaspy.sourceforge.net" target="_blank"> SchemaSpy</a> you can find an <a href="https://skaffolder.com/docs/schema_example.xml" target="_blank">example file here</a>.

In order to import this file in your Skaffolder project run:

```bash
[root@skaffolder ~]$ sk import db <path_file>
```

Now you have data models on Skaffolder platform.

# More documentation

> You can find <a href="https://skaffolder.com/#/documentation" target="_blank">additional documentation here</a>
