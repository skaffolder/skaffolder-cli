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

Now you can create a new project running `sk new project`

```bash
[root@skaffolder ~]$ sk new project

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
    Generator file imported in ./.skaffolder/template

```

Now you can edit you project on Skaffolder platform adding data models, APIs and pages at your app.
> CLI commands to manage that are coming soon!

In you current path a folder `.skaffolder` was 	created.
In `.skaffolder/template` you can find your template files editable, they respect the <a href="https://handlebarsjs.com" target="_blank">Handlebar sintax</a> and you can use also these additional <a href="https://www.npmjs.com/package/handlebars-helpers" target="_blank">helpers functions</a>.

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

If you want to manage data models, APIs and pages of your project you can run `sk get project url` and browse the provided link:

```bash
[root@skaffolder ~]$ sk get project url
    To manage data models, APIs and pages of your project, visit this URL:
    https://app.skaffolder.com/#!/projects/my-project-id/design/models
```


To open an existing project you can run `sk open project`


# More documentation
>You can find <a href="https://skaffolder.com/#/documentation" target="_blank">additional documentation here</a>
