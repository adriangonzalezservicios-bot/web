# Motor de gustos v2 — `akari_prefs_v2`

Guardado en `localStorage`, por dispositivo/navegador (no viaja al
backend en esta versión — ver roadmap para preferencias en servidor).

## Señales y pesos
| Señal | Peso |
|---|---|
| Like (swipe derecha o botón corazón) | +2 |
| Agregar al carrito | +3 |
| Skip fuerte (swipe izquierda) | −1.5 |

Cada señal decae con el tiempo: `valor_nuevo = valor_anterior*0.9 + peso`,
así lo más reciente pesa más que lo viejo.

## Score de un producto
```
score = (match_score_base / 100)
      + afinidad_categoria * 0.12
      + afinidad_marca * 0.08
      - distancia_precio_promedio * 0.15   (si hay señales de precio)
      + 0.18 si nunca fue visto (novelty)
      - fatiga_por_repeticion (hasta -0.4)
      - penalización por skips repetidos (hasta -0.9)
      + ruido aleatorio leve (0–0.06)
```

## Exploración y diversidad
- ~15% de las tarjetas del feed se insertan en orden aleatorio en vez
  de por score puro, para evitar la "burbuja de filtro".
- Se evita mostrar 3 productos seguidos de la misma categoría.

## Dónde vive el código
Ver `index.html`, sección **"7. Motor de gustos v2"**: funciones
`loadPrefs`, `savePrefs`, `recordSignal`, `scoreProduct`, `buildFeed`.
