
# build and dev commands

```bash
pnpm install
pnpm dev
pnpm lint
pnpm build
pnpm preview
```

# Icon

Generated from [svg.io](https://svg.io/download/cb3eb781-7211-4146-92a0-ba115888f1ef)
Prompt: ...


# History

``` shell
pnpm create vite skull-king --template react-ts

cd skull-king

pnpm install
```

# From https://ui.shadcn.com/docs/installation/vite

From step 2

pnpm install -D tailwindcss postcss autoprefixer

pnpx tailwindcss init -p

Edit tsconfig.node.json file
``` json
{
  "compilerOptions": {
    // ...
    "baseUrl": ".",
    "paths": {
      "@/*": [
        "./src/*"
      ]
    }
    // ...
  }
}
```

pnpm i -D @types/node

``` typescript
// vite.config.ts
import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```


pnpx shadcn-ui@latest init


pnpx shadcn-ui@latest add button
pnpx shadcn-ui@latest add card
pnpx shadcn-ui@latest add input
pnpx shadcn-ui@latest add alert-dialog


# weird
mv '@' src




# PWA

https://dev.to/bhendi/turn-your-react-vite-app-into-a-pwa-3lpg

pnpm install -D workbox-window vite-plugin-pwa

 
