# Motor de gustos v3 — `akari_prefs_v3`

Guardado en `localStorage`, por dispositivo/navegador (no viaja al
backend en esta versión — ver roadmap para preferencias en servidor).
Si el navegador tenía datos del motor v2 anterior, se migran
automáticamente al abrir el sitio: no se pierde el progreso del
usuario.

## Señales y pesos
| Señal | Peso |
|---|---|
| Like (swipe izquierda o botón corazón) | +2 |
| Agregar al carrito | +3.2 |
| Skip (swipe derecha) | −1.6 |

## Decaimiento real por tiempo (no solo por evento)
Cada afinidad (categoría, marca, "visto", "rechazado") se guarda con
su `timestamp`. Al leerla, se aplica una **caída exponencial real**
con vida media de 21 días:

```
factor = e^(-ln(2)/21 * días_transcurridos)
valor_actual = valor_guardado * factor
```

Esto significa que si a alguien le gustó mucho "Hogar" hace 2 meses
pero hace tiempo que no interactúa con esa categoría, esa preferencia
se va desvaneciendo sola — el feed no queda "pegado" para siempre a un
gusto viejo. Lo mismo pasa con los rechazos: un producto que el
usuario saltó hace semanas puede volver a aparecer.

## Precio: media y desvío real, no un rango fijo
En vez de comparar contra un "±25% del precio promedio", el motor
calcula la **media y el desvío estándar** de los precios que le
gustaron al usuario (con el algoritmo de Welford, sin guardar el
historial completo) y arma una curva de preferencia tipo campana:

```
z = (precio_producto − media) / desvío
afinidad_precio = e^(−z²/2)     → 1 si es el precio "ideal", cae suave a los costados
```

## Score de un producto
```
score = (match_score_base / 100)
      + tanh(afinidad_categoria / 4) * 0.22
      + tanh(afinidad_marca / 4)     * 0.14
      + (afinidad_precio − 0.5) * 0.30
      + 0.16 si nunca fue visto (novelty)
      − fatiga_por_repeticion (hasta −0.32, se recupera con el tiempo)
      − penalización por rechazo (hasta −0.85, también se recupera con el tiempo)
      − 0.5 si ya apareció en esta misma sesión de scroll
      + ruido aleatorio (más grande cuanto menos conocemos al usuario)
```

`tanh()` evita que una sola señal muy fuerte "rompa" el score;
las afinidades quedan acotadas entre -1 y 1 antes de pesarlas.

## Exploración adaptativa (epsilon-greedy con decaimiento)
El feed no es 100% "lo más parecido a lo anterior": una porción de
las tarjetas se insertan en orden aleatorio para evitar la burbuja de
filtro. Esa porción arranca alta con un usuario nuevo y baja a medida
que el sistema aprende de él:

| Señales acumuladas | % de exploración |
|---|---|
| 0 (usuario nuevo) | 25% |
| 10 | 17% |
| 25 o más | 6% (piso mínimo, nunca deja de explorar del todo) |

**La confianza también se olvida con el tiempo.** El contador de
señales que determina esta confianza (`totalSignals`) no es un simple
número que solo sube — es una entrada con la misma vida media de 21
días que las afinidades de categoría/marca. Si alguien interactuó
mucho y después no volvió por dos o tres meses, su nivel de "usuario
conocido" decae junto con sus gustos: el feed vuelve a explorar más
al reencontrarse con esa persona, en vez de quedarse congelado para
siempre en el piso mínimo del 6% con preferencias ya desactualizadas.
Antes esto no pasaba: la confianza, una vez ganada, no bajaba nunca.

## Diversidad — reordenamiento real, no solo "intentar"
Se recorre la cola ya ordenada y, si insertar el siguiente ítem
generaría **3 productos seguidos de la misma categoría**, el
algoritmo busca más adelante en la cola el primer producto de otra
categoría y lo adelanta. Se verificó con pruebas automatizadas que
esto nunca deja 3 seguidas de la misma categoría, incluso con carritos
muy sesgados a una sola categoría.

## Filtro duro de rechazo persistente
Si un producto fue saltado 3 o más veces y ese rechazo sigue
"fresco" (no decayó todavía), se saca del pool antes de puntuar —
no tiene sentido seguir insistiendo con algo que el usuario no quiere
ver por ahora.

## Dónde vive el código
Ver `index.html`, sección **"6. Motor de gustos v3"**: funciones
`loadPrefs`, `savePrefs`, `recordSignal`, `scoreProduct`, `buildFeed`,
y los helpers `decayFactor`, `decayedValue`, `priceFit`,
`updatePriceStats`.
