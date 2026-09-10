**ACLARACIONES RESPECTO AL CIERRE DEL BLOQUE DE FRONTEND:**

- Las funcionalidades principales y necesarias para la página ya se encuentran implementadas. Sin embargo, no se descarta la posibilidad de incorporar funcionalidades adicionales en el futuro que contribuyan a mejorar la página y, en consecuencia, el proyecto en general.

- El estilo visual de la página podría modificarse en futuras versiones, con el objetivo de unificar de manera más consistente la tipografía, la paleta de colores y la experiencia visual de los usuarios, contemplando también los requerimientos del cliente.

- Actualmente, la página no es completamente responsive. No obstante, este aspecto será trabajado en una etapa futura, junto con las mejoras mencionadas anteriormente, para consolidar el paquete visual que se busca ofrecer.

- Durante el último tiempo se realizaron algunos cambios, principalmente orientados a la simplificación de funciones. Por este motivo, es posible que existan archivos o componentes dentro del proyecto que ya no tengan utilidad y que deban ser eliminados en la versión final.

- Actualmente no existe persistencia de los elementos, ya que todavía no se ha avanzado sobre ese bloque funcional. Por lo tanto, varios botones relacionados con acciones de alta o modificación aún no cuentan con una funcionalidad implementada.



# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
## Acceso a la API

El frontend centraliza las solicitudes al backend mediante `apiFetch`, ubicado en `src/services/api.ts`.

La URL base de la API se obtiene desde la variable de entorno:

```env
VITE_API_URL=http://localhost:3000/api