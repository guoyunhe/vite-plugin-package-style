# vite-plugin-import-package-style

Vite plugin to automatically import styles from packages

## Install

```bash
npm i -D vite-plugin-import-package-style
```

## Usage

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import importPackageStyle from 'vite-plugin-import-package-style';

export default defineConfig({
  plugins: [
    importPackageStyle({
      rules: [
        {
          include: ['foobar', '@foo/*'],
          exclude: ['@foo/bar-*'],
          resolveStyle: (pkg) => {
            return `${pkg}/dist/index.css`;
          },
        },
      ],
    }),
  ],
});
```
