## SvelteKit

### Creating a project

```bash
npm i
npm run schema-generate-dev
npm run migrate-dev --name="init"
```

### Developing

```bash
npm run dev
```

Work at https://localhost:55022/

### Building

```bash
npm run build
node ./build
```

Work at http://localhost:55021/

## Prisma

### After changed Prisma schema file

```bash
npm run migrate-dev --name="some-unique-name"
```
