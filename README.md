# Magno Studio Landing

Hero 3D experimental built with Next.js, Three.js and Tailwind CSS v4.

## Cómo probar

```bash
npm run dev
```

Visitar `http://localhost:3000/?mode=pro` para la versión 3D.
Usar `?mode=css` para el fallback estático.

## Cómo degradar

- `NEXT_PUBLIC_DISABLE_BLOOM=1` desactiva el efecto de bloom.
- `NEXT_PUBLIC_LOW_GPU=1` reduce geometría y materiales para GPUs lentas.
