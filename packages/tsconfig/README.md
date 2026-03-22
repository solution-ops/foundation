# @foundation/tsconfig

Shared TypeScript configuration for the Task.Cloud project. This package provides centralized TypeScript configuration files used across all applications and packages.

## 🚀 Features

- **Centralized Config**: Single source of truth for TypeScript settings
- **Multiple Configs**: Different configurations for different use cases
- **Consistent Settings**: Ensures consistent TypeScript behavior across packages
- **Easy Maintenance**: Update TypeScript settings in one place
- **Best Practices**: Pre-configured with recommended settings

## 🛠️ Setup

### Installation

```bash
# Install the package
pnpm add -D @foundation/tsconfig

# For applications that need TypeScript
pnpm add -D typescript
```

### Basic Usage

```json
// tsconfig.json
{
  "extends": "@foundation/tsconfig/base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## 📦 Available Configurations

### Base Configuration

```json
// @foundation/tsconfig/base.json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": false,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

### React Library Configuration

```json
// @foundation/tsconfig/react-library.json
{
  "extends": "./base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "composite": true,
    "incremental": true
  }
}
```

### Vite Configuration

```json
// @foundation/tsconfig/vite.json
{
  "extends": "./base.json",
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

## 🔧 Configuration Usage

### For React Applications

```json
// apps/web/tsconfig.json
{
  "extends": "@foundation/tsconfig/vite.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### For Node.js Applications

```json
// apps/api/tsconfig.json
{
  "extends": "@foundation/tsconfig/base.json",
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "outDir": "./dist",
    "rootDir": "./src",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### For UI Libraries

```json
// packages/ui/tsconfig.json
{
  "extends": "@foundation/tsconfig/react-library.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.test.tsx"]
}
```

### For Type-Only Packages

```json
// packages/types/tsconfig.json
{
  "extends": "@foundation/tsconfig/base.json",
  "compilerOptions": {
    "declaration": true,
    "declarationMap": true,
    "emitDeclarationOnly": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## 🎯 Configuration Options

### Common Compiler Options

| Option | Description | Default |
|--------|-------------|---------|
| `target` | ECMAScript target version | `ES2022` |
| `module` | Module system | `ESNext` |
| `moduleResolution` | Module resolution strategy | `bundler` |
| `strict` | Enable all strict type checking | `true` |
| `jsx` | JSX handling | `react-jsx` |
| `skipLibCheck` | Skip type checking of declaration files | `true` |
| `forceConsistentCasingInFileNames` | Ensure consistent file naming | `true` |

### React-Specific Options

| Option | Description | Default |
|--------|-------------|---------|
| `jsx` | JSX transformation | `react-jsx` |
| `jsxImportSource` | JSX import source | Not set |
| `allowSyntheticDefaultImports` | Allow default imports from modules | `true` |
| `esModuleInterop` | Enable ES module interop | `true` |

### Library-Specific Options

| Option | Description | Default |
|--------|-------------|---------|
| `declaration` | Generate declaration files | `false` |
| `declarationMap` | Generate source maps for declarations | `false` |
| `sourceMap` | Generate source maps | `false` |
| `composite` | Enable project references | `false` |
| `incremental` | Enable incremental compilation | `false` |

## 🔄 Configuration Evolution

### Adding New Configurations

1. **Create the config file**: Add new configuration in the package
2. **Update package.json**: Add the new config to exports
3. **Document the config**: Update this README
4. **Test the config**: Ensure it works with target use cases

### Example: Adding Node.js Config

```json
// @foundation/tsconfig/node.json
{
  "extends": "./base.json",
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "types": ["node"]
  }
}
```

## 📦 Package Exports

### Available Configurations

```json
{
  "exports": {
    "./base.json": "./base.json",
    "./react-library.json": "./react-library.json",
    "./vite.json": "./vite.json"
  }
}
```

### Usage in package.json

```json
{
  "devDependencies": {
    "@foundation/tsconfig": "workspace:*",
    "typescript": "^5.0.0"
  }
}
```

## 🚀 Development

### Local Development

```bash
# Install dependencies
pnpm install

# Type checking
pnpm type-check

# Validate configurations
pnpm validate-configs
```

### Testing Configurations

```bash
# Test base configuration
pnpm test:base

# Test React configuration
pnpm test:react

# Test Vite configuration
pnpm test:vite
```

## 🎯 Best Practices

### Configuration Design

- **Incremental adoption**: Start with base config and extend as needed
- **Consistent settings**: Use the same settings across similar projects
- **Performance**: Enable incremental compilation for large projects
- **Strict mode**: Enable strict type checking for better code quality

### Project Organization

- **Clear inheritance**: Use extends to build upon base configurations
- **Specific overrides**: Override only what's necessary in child configs
- **Documentation**: Document any non-standard settings
- **Version compatibility**: Ensure configurations work with target TypeScript versions

## 📋 Migration Guide

### From Individual Configs

If you have individual TypeScript configurations in each package:

1. **Install the shared config**:
   ```bash
   pnpm add -D @foundation/tsconfig
   ```

2. **Update tsconfig.json**:
   ```json
   {
     "extends": "@foundation/tsconfig/base.json",
     "compilerOptions": {
       // Only override what's specific to this package
     }
   }
   ```

3. **Remove duplicate settings**: Remove settings that are now inherited

### From Older Versions

When updating to new versions:

1. **Review breaking changes**: Check for any breaking changes in TypeScript
2. **Test configurations**: Ensure all packages still compile correctly
3. **Update documentation**: Update any documentation that references old settings

## 📦 Dependencies

### Development Dependencies

- `typescript` - TypeScript compiler (peer dependency)

### Optional Dependencies

- `@types/node` - Node.js type definitions (for Node.js projects)
- `@types/react` - React type definitions (for React projects)

## 🤝 Contributing

1. Follow TypeScript best practices
2. Test configurations with different project types
3. Document any new configurations
4. Ensure backward compatibility
5. Update this README when adding new configs

## 📄 License

This package is part of the Task.Cloud project and is licensed under GPL-3.0-or-later. 