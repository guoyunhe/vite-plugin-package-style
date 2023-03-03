# vite-plugin-package-style

Vite plugin to automatically import styles from packages

## Install

```bash
npm i -D vite-plugin-package-style
```

## Usage

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import { packageStyle } from 'vite-plugin-package-style';

export default defineConfig({
  plugins: [
    packageStyle({
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
