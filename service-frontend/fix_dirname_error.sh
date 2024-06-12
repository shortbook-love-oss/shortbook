#!/usr/bin/bash

# Watch https://github.com/prisma/prisma/issues/15614#issuecomment-2126271831
sed -i '/await server.init/i \
globalThis.__filename = fileURLToPath(import.meta.url); \
globalThis.__dirname = path.dirname(__filename);' build/handler.js