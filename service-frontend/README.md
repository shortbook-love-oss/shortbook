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

... and manual modify of generated SQL file
1. Edit output SQL file — change all `utf8mb4_unicode_ci` to `utf8mb4_bin`
2. Add ` COLLATE utf8mb4_unicode_ci` to users>key_handle and book_revisions>url_slug
3. Exec edited SQL
