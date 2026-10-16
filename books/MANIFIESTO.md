# MANIFIESTO — registro de dominio público

Cada libro del catálogo **debe** tener aquí su ficha antes de publicarse.
Criterio único: **dominio público estricto**. No se admiten licencias NC
(CC BY-NC / BY-NC-SA) ni obras con copyright vivo.

## Criterio de dominio público

- Autor fallecido y plazo agotado: **año de muerte + 70 años** (Venezuela,
  México, Argentina, Colombia). Si el plazo no está agotado, no se publica.
- La protección alcanza también a la **traducción**: el español debe ser
  anterior a 1930 o estar marcado como dominio público.
- El texto ser dominio público **no salva a la edición**: prólogos, notas,
  aparato crítico y diseño de editoriales/institutos modernos tienen copyright
  propio. Si el PDF trae `D.R.` de un tercero, se descarta o se busca otra
  edición.
- Comprobación por PDF: `pdfinfo archivo.pdf` + revisar las primeras páginas
  en busca de *Public Domain Mark*, "dominio público" o `D.R.` de terceros.

## Fuentes admitidas (con licencia explícita)

| Fuente | Estado |
|---|---|
| Internet Archive (campo `Usage: Public Domain Mark`) | ✅ |
| marxists.org — aviso PD: "freely copy, distribute and make commercial works, credit MIA" | ✅ |
| Biblioteca Virtual Miguel de Cervantes | ✅ (verificar edición) |
| Google Books (dominio público) | ✅ |
| Wikisource / Wikimedia (transcripción CC BY-SA) | ⚠️ solo si el texto subyacente es PD |
| INEHRM (PDF con `D.R. © INEHRM`) | ❌ |
| CLACSO, Radio Zapatista (CC BY-NC-SA) | ❌ (sin uso comercial) |
| Ocean Press / Centro de Estudios Che Guevara | ❌ (reclama derechos) |
| Z-Library y similares sin licencia | ❌ |

## Libros publicados

| Título | Autor | †Año | Plazo (†+70) | Corriente | Archivo | Fuente (URL) | Licencia | Verificado |
|---|---|---|---|---|---|---|---|---|
| Ariel | José Enrique Rodó | 1917 | 1987 | Latinoamericano | `ariel.pdf` | archive.org/details/arielrod00roduoft — Houghton Mifflin, 1922 (trad. F. J. Stimson, †1943) | Dominio público | 2026-10-09 |
| Facundo | Domingo F. Sarmiento | 1888 | 1958 | Latinoamericano | `facundo.pdf` | archive.org/details/facundos00sarmuoft — Biblioteca Argentina / La Facultad, 1921 | Dominio público | 2026-10-09 |
| El porvenir de la América Latina | Manuel Ugarte | 1951 | 2021 | Antiimperialista | `ugarte-el-porvenir.pdf` | F. Sempere y Cía., Valencia (pre-1930); espejo siese.org | Dominio público | 2026-10-12 |
| La República Argentina y el caso de Venezuela | Luis María Drago | 1921 | 1991 | Antiimperialista | `drago-caso-venezuela.pdf` | bibliotecadigital.gob.ar/items/show/847 — ed. 1903 (Coni Hermanos, Buenos Aires) | Dominio público | 2026-10-12 |
| Noli me tángere | José Rizal | 1896 | 1966 | Antiimperialista | `noli-me-tangere.epub` | gutenberg.org/ebooks/47584 — ed. con notas de R. Sempau (†1909) | Dominio público | 2026-10-12 |
| El Filibusterismo | José Rizal | 1896 | 1966 | Antiimperialista | `el-filibusterismo.epub` | gutenberg.org/ebooks/30903 | Dominio público | 2026-10-12 |
| Manifiesto de Cartagena | Simón Bolívar | 1830 | 1901 | Bolivariano | — (enlace) | es.wikisource.org/wiki/Manifiesto_de_Cartagena | Dominio público | 2026-10-12 |
| Ismaelillo | José Martí | 1895 | 1965 | Martiano | — (enlace) | es.wikisource.org/wiki/Ismaelillo | Dominio público | 2026-10-12 |
| El presidio político en Cuba | José Martí | 1895 | 1965 | Martiano | — (enlace) | es.wikisource.org/wiki/El_presidio_político_en_Cuba | Dominio público | 2026-10-12 |
| Respuesta a Sor Filotea de la Cruz | Sor Juana Inés de la Cruz | 1695 | 1765 | Latinoamericano | — (enlace) | marxists.org/espanol/tematica/mujer/autores/sorjuana | Dominio público | 2026-10-12 |
| Siete ensayos de interpretación de la realidad peruana | José Carlos Mariátegui | 1930 | 2000 | Marxista | — (enlace) | marxists.org/espanol/mariateg/1928/7ensayos | Dominio público | 2026-10-12 |

> El catálogo publica **14 títulos**: 6 con archivo hospedado y verificado en
> `books/` (**Ariel**, **Facundo**, **El porvenir de la América Latina** —
> Sempere, pre-1930 —, **La República Argentina y el caso de Venezuela** —
> ed. 1903 —, **Noli me tángere** y **El Filibusterismo** — Gutenberg, notas de
> Sempau †1909 —) y 8 que son solo enlace a su fuente original. Las fichas
> marcadas «— (enlace)» se publican con `precio = 0` (botón "Leer gratis")
> porque no se aloja PDF local. Todo título **sin archivo y sin fuente
> verificable** está retirado del catálogo (ver abajo) hasta que se compruebe
> una edición de dominio público.

## Retiradas del catálogo (sin archivo y sin fuente verificable)

Estas obras **no están en `data.js`**: o no tiene localizada una edición de
dominio público comprobable, o la edición/traducción localizada está en
copyright. Siguen registradas aquí para retomar la búsqueda.

| Título | Autor | Corriente | Motivo |
|---|---|---|---|
| Carta de Jamaica | Simón Bolívar | Bolivariano | Sin archivo ni fuente comprobada; candidata a Wikisource/archive.org. |
| Discurso de Angostura | Simón Bolívar | Bolivariano | Sin archivo ni fuente comprobada; candidata a Wikisource/archive.org. |
| Inventamos o erramos | Simón Rodríguez | Bolivariano | Sin archivo ni fuente comprobada. |
| Nuestra América | José Martí | Martiano | Texto PD, pero la edición localizada (Biblioteca Ayacucho, 2006) tiene prólogo/aparato crítico ©; ver «Ediciones descartadas». |
| El imperialismo, fase superior del capitalismo | V. I. Lenin | Marxista | Sin archivo ni fuente comprobada; candidata a marxists.org. |
| Manifiesto del Partido Comunista | Marx / Engels | Marxista | Traducción localizada (Alianza, Pedro Ribas) © viva; ver «Ediciones descartadas». |

## Ediciones descartadas (copyright de la edición o la traducción)

El texto puede ser de dominio público y aun así la edición no serlo. Estas
quedan **fuera** de `books/` y no se enlazan:

| Título | Edición | Motivo |
|---|---|---|
| Nuestra América | Biblioteca Ayacucho (PDF de 2006) | Prólogo y aparato crítico modernos con copyright propio. El texto de Martí es PD. |
| Manifiesto del Partido Comunista | Alianza Editorial, trad. Pedro Ribas (2001/2019) | Reza «Reservados todos los derechos»: la traducción sigue en copyright vivo. |
| Siete ensayos de interpretación de la realidad peruana | archive.org `mariategui-...-1928` (PDF «Edición digital epublibre 2016») | El texto de 1928 es PD, pero el PDF es una edición digital epublibre/epublibre 2016 con cubierta y editor ©; se descarta y se enlaza el texto MIA. |

## Candidatos pendientes de búsqueda (25)

| Corriente | Candidato | †Año | Fuente prevista |
|---|---|---|---|
| Bolivariano | Simón Bolívar — *Carta de Jamaica* (1815) | 1830 | Wikisource, archive.org |
| Bolivariano | Simón Bolívar — *Discurso de Angostura* (1819) | 1830 | Wikisource, archive.org |
| Bolivariano | Simón Rodríguez — *Inventamos o erramos* | 1854 | Wikisource, archive.org, Cervantes |
| Bolivariano | Francisco de Miranda — *Diario de viajes / Colombeia* | 1816 | Internet Archive, Cervantes |
| Bolivariano | Juan Germán Roscio — *Triunfo de la libertad sobre el despotismo* | 1849 | Internet Archive, Google Books |
| Bolivariano | Simón Rodríguez — *Sociedades americanas* | 1854 | Internet Archive, Cervantes |
| Bolivariano | José Antonio Páez — *Autobiografía* | 1873 | Internet Archive |
| Martiano | José Martí — *Versos sencillos* (1891) | 1895 | Cervantes, Internet Archive |
| Martiano | José Martí — *Versos libres* (1878) | 1895 | Cervantes, Internet Archive |
| Martiano | José Martí — *La edad de oro* (1889) | 1895 | Internet Archive, EcuRed |
| Martiano | José Martí — *Mi raza* (1905, póstumo) | 1895 | Internet Archive |
| Martiano | José Martí — *Nuestra América* (1891, edición sin aparato ©) | 1895 | Wikisource, archive.org |
| Zapatista | *Plan de Ayala* (1911) — escaneo original | — | Internet Archive, Library of Congress |
| Zapatista | Plan de San Luis Potosí — Francisco I. Madero (1910) | 1931 | Internet Archive |
| Zapatista | Documentos del Ejército Libertador del Sur (1913-1919) | 1919 | escaneos pre-1930 |
| Zapatista | Otilio Montaño / textos del gabinete zapatista | 1919 | escaneos pre-1930 |
| Marxista | Marx — *El Capital*, tomo 1 (1867) | 1883 | marxists.org, Internet Archive |
| Marxista | Lenin — *¿Qué hacer?* (1902) | 1924 | marxists.org |
| Marxista | Lenin — *El imperialismo, fase superior del capitalismo* (1917) | 1924 | marxists.org |
| Marxista | Marx / Engels — *Manifiesto del Partido Comunista* (traducción libre) | 1883 / 1895 | marxists.org, Wikisource |
| Marxista | Lenin — *Estado y revolución* (1917) | 1924 | marxists.org |
| Marxista | Engels — *Del socialismo utópico al científico* | 1895 | marxists.org |
| Antiimperialista | Rubén Darío — *Cantos de vida y esperanza* ("A Roosevelt", 1905) | 1916 | Internet Archive |
| Antiimperialista | Ricardo Flores Magón — *Regeneración* | 1922 | Internet Archive |
| Latinoamericano | Ricardo Palma — *Tradiciones peruanas* | 1919 | Internet Archive, Cervantes |

## Corriente zapatista contemporánea: solo enlace

Los comunicados del EZLN (1994 en adelante) **no se venden ni se alojan**:
Radio Zapatista publica bajo CC BY-NC-SA 4.0 (prohíbe lo comercial) y la obra
sigue en copyright. Se publican como entrada con `precio = 0`, que muestra el
botón "Leer gratis" y enlaza a la fuente original.

| Título | Fuente | Licencia | Tratamiento |
|---|---|---|---|
| Primera Declaración de la Selva Lacandona (1994) | enlacezapatista.ezln.org.mx | copyright EZLN | enlace (`precio 0`) |
| Al pueblo de México: las demandas del EZLN (1994) | enlacezapatista.ezln.org.mx | copyright EZLN | enlace (`precio 0`) |
| La palabra del EZLN — archivo de comunicados | radiozapatista.org | CC BY-NC-SA 4.0 | enlace (`precio 0`) |
