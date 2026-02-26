---
name: "TypeScript Standards"
description: "Type safety and coding conventions for TypeScript"
applyTo: "**/*.ts"
---

# TypeScript Standards

## Types
- **No `any`** — use explicit types with interfaces, enums, or union types
- Prefer `interface` over `type` for object shapes (extendable)
- Use `type` for unions, intersections, and utility types
- Export shared types from dedicated `types/` directories
- Use `readonly` for properties that should not be mutated

## Functions
- Always declare explicit return types for exported functions
- Use arrow functions for callbacks and inline functions
- Use `function` declarations for top-level named functions (hoisting)

## Enums
- Prefer `const enum` or string union types over regular enums when possible
- If using enums, use PascalCase for enum names and UPPER_CASE for members

## Naming
- `camelCase` for variables, functions, parameters
- `PascalCase` for interfaces, types, classes, enums, components
- `UPPER_CASE` for constants and enum members
- Prefix interfaces with context, not `I` — e.g., `BookEntity` not `IBookEntity`

## Imports
- Use named imports, avoid default exports where possible
- Group imports: external deps → internal modules → relative imports
- Use `@/` path alias for project imports

## Error Handling
- Never swallow errors — at minimum log them
- Use typed error handling with custom error classes when appropriate
- Prefer `try/catch` blocks with specific error types

## Azure SDK Patterns
- Always use `DefaultAzureCredential` — never connection strings
- Use `@azure/data-tables` for Table Storage operations
