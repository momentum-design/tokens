# Getting Started

This project is currently published to any artifactory as `@momentum-ui/design-tokens`. To use it within another project from a local clone of this project, it must be initialized, built, and linked locally via a package manager. This guide will cover local usage of this project. Skip to the [Consumption](#consumption) section if you are using the published version.

If you would like to contribute to this project, please review our [contributing guide](./CONTRIBUTING.md).

## Cloning

In order to begin utilizing this project, it must be cloned locally. This can be done using multiple methods, but the preferred method would be to utilize [git](https://git-scm.com/). Once [git](https://git-scm.com/) is installed and operational on your platform, navigate to the folder you would like this project to reside in and run the following command:

```bash
git clone git@github.com:momentum-design/tokens.git
```

This will download the latest version available via this project's GitHub repository for usage locally. Once the above command finishes its execution, navigate to that folder using the following command:

```bash
cd ./tokens
```

## Initializing

In order to execute any scripts associated with this project, the projects dependencies must be initialized using the following command:

```bash
npm install # installing with node package manager
```

## Building

In order to build this project for downstream projects, the following command must be used to compile the source code:

```bash
npm run build:css # building CSS with node package manager
```

## Consumption

In the case of [npm](https://www.npmjs.com/) or [yarn](https://classic.yarnpkg.com/en/), adding the following dependency to your project's `package.json` file will link this project to your project.

```json
{
  /* ...other package definitions... */
  "dependencies": {
    /* ...other package dependencies... */
    "@momentum-ui/design-tokens": "link:./path/to/this/project",
  }
}
```

In the case that you would like to consume the published version of this project from your downstream project, run the following command:

```bash
yarn add @momentum-ui/design-tokens # installing this published pacakge with yarn package manager

# or

npm install @momentum-ui/design-tokens # installing this published pacakge with node package manager
```

## Usage

Once the package is properly linked or installed, the css can be imported within supported build-tools for usage within your application:

```jsx
/* ...other imports... */
import '@momentum-ui/design-tokens/dist/index.css';

const Component = () => (
  <div className="md-theme-darkWebex">
    <p style={{
      backgroundColor: 'var(--theme-background-solid-primary-normal)',
      color: 'var(--theme-text-primary-normal)',
    }}>
      Hello World
    </p>
  </div>
);

/* ...export statements... */
```

Be sure to review the contents of the files in `./dist` to determine what CSS Variables and themes are available with this built project.
