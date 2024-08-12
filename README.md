# Shopify Boilerplate

## Table of Contents
- [Installation](#markdown-header-installation)
- [Getting Started](#markdown-header-getting-started)
- [Project Scripts](#markdown-header-project-scripts)

A boilerplate for bootstrapping a Shopify theme build.

## Installation

### Development Environment

#### Node & NPM

Install [Node Version Manager](https://github.com/nvm-sh/nvm#install--update-script)

Install Node version set within `.nvmrc`, currently `16.17.0`
```bash
nvm install 16.17.0
```

Install Yarn globally
```bash
npm i -g yarn
```

#### Shopify

Install [Shopify/CLI](https://shopify.dev/themes/tools/cli/installation)

### Project Dependencies

Run the following command at the project root, this will install all project dependencies listed within `package.json`:
```bash
yarn install
```

or simply,
```bash
yarn
```

### Configuration

Create a new file called `.env` and copy the contents of `.env.example` into it
```bash
cat .env.example >> .env
```

Change `XXXXXXXXX.myshopify.com` to the designated storefront for your project

## Getting Started

Run the following command at the project root, this will open a browser tab with so that you may authenticate with your Shopify Partner account
```bash
yarn shopify:login
```

Run the following command at the project root, this command will either create or serve your development theme
```bash
yarn start
```

## Project Scripts

### Deploy

Deploy theme files to either your development theme or a theme of your choice
```bash
yarn deploy
yarn deploy:new
```

### Pull

Runs the Shopify/CLI [theme pull](https://shopify.dev/themes/tools/cli/theme-commands#check) command and adds templates of extenstion type `.json` (not `.liquid`) from a selected remote theme into your local `shopify/templates` folder. Templates that exist locally but not remotely will be added to your local copy, as well as any changes present in their remote counterparts. Templates that exist locally but do not remotely will remain unchanged
```bash
yarn pull:templates
```

Runs the Shopify/CLI `theme pull` command and replaces your local `config/settings_data.json` file with the remote version contained within a theme of your choice
```bash
yarn pull:config
```

Runs the Shopify/CLI `theme pull` command and adds files from a selected remote theme into your local `shopify/locales` folder. Locales files that exist locally but not remotely will be added to your local copy, as well as any changes present in their remote counterparts. Locales files that exist locally but do not remotely will remain unchanged
```bash
yarn pull:locales
```

Runs `pull:templates`, `pull:config`, and `pull:locales` sequentially
```bash
yarn pull:conntent
```

## Clean

Runs the Shopify/CLI `theme pull` command and replaces the templates of extenstion type `.json` (not `.liquid`) from witin `shopify/templates` with that of your theme of choice
```bash
yarn clean:templates
```

Runs the Shopify/CLI `theme pull` command and replaces your local `config/settings_data.json` file with the remote version contained within a theme of your choice
```bash
yarn clean:config
```

Runs the Shopify/CLI `theme pull` command and replaces the contents of your `shopify/locales` directory with that of your theme of choice
```bash
yarn clean:locales
```

Runs `clean:templates`, `clean:config`, and `clean:locales` sequentially
```bash
yarn clean:content
```

## Linting
Runs [eslint](https://eslint.org/) within `src/scripts` and displays the result in the console. See `.eslintrc.js` for configuration
```bash
yarn lint:js
```

Runs [stylelint](https://stylelint.io/) within `src/styles` and displays the result in the console. See `.stylelintrc.js` for configuration
```bash
yarn lint:css
```

Runs the Shopify/CLI [theme check](https://shopify.dev/themes/tools/cli/theme-commands#check) command and displays the result in the console
```bash
yarn lint:shopify
```

Runs `lint:js`, `lint:css`, and `lint:shopify` sequentially
```bash
yarn lint
```

## Fix (Linting + Automatic resolutions)

Runs `eslint` within `src/scripts` and attempts to resolve any issues eligible for automatic resolution. See `.eslintrc.js` for configuration
```bash
yarn fix:js
```

Runs `stylelint` within `src/styles` and attempts to resolve any issues eligible for automatic resolution. See `.stylelintrc.js` for configuration
```bash
yarn fix:css
```

Runs the Shopify/CLI [theme check](https://shopify.dev/themes/tools/cli/theme-commands#check) command and attempts to resolve any issues eligible for automatic resolution
```bash
yarn fix:shopify
```

Runs `fix:js`, `fix:css`, and `fix:shopify` sequentially
```bash
yarn fix
```

## License
[MIT](https://choosealicense.com/licenses/mit/)
