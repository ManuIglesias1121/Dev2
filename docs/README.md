# Sitio público de documentos legales

Esta carpeta es el sitio web público que **Google Play Store y App Store van a poder leer** como Política de Privacidad y Términos de servicio.

Se publica con **GitHub Pages + Jekyll** (sin ningún build manual — GitHub se encarga).

## URLs finales

Una vez activado, los documentos van a quedar en:

- `https://manuiglesias1121.github.io/Dev2/` — landing
- `https://manuiglesias1121.github.io/Dev2/terminos.html`
- `https://manuiglesias1121.github.io/Dev2/privacidad.html`
- `https://manuiglesias1121.github.io/Dev2/comunidad.html`

La constante `LEGAL_BASE_URL` en `src/pages/SettingsPage.js` ya apunta a esa URL. Si el repo se mueve, cambiar esa constante.

## Cómo activar GitHub Pages (una sola vez)

1. Asegurarse de que el repo esté en GitHub (`git push` si no lo está).
2. En GitHub: **Settings → Pages**.
3. En "Source" elegir **Deploy from a branch**.
4. En "Branch" seleccionar **main** y **/docs**. Save.
5. Esperar 1-2 minutos. La URL del sitio aparece arriba en la misma pantalla.
6. Probar abrir las 3 URLs del listado anterior.

## Para pegarle a Google Play

Cuando completes el formulario de "Data safety" / "Política de privacidad" en Google Play Console, usar:

> `https://manuiglesias1121.github.io/Dev2/privacidad.html`

Esa URL **tiene que ser pública** y accesible sin login. GitHub Pages cumple.

## Mantenimiento

Los `.md` de esta carpeta son **copias generadas** de los archivos `LEGAL_*.md` en la raíz del repo. Si modificás los de la raíz, regenerá los de acá ejecutando este snippet de PowerShell en `d:\Dev2`:

```powershell
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$files = @(
  @{ src = 'LEGAL_TERMS.md'; dst = 'docs\terminos.md'; title = 'Términos y condiciones'; permalink = '/terminos.html' },
  @{ src = 'LEGAL_PRIVACY.md'; dst = 'docs\privacidad.md'; title = 'Política de privacidad'; permalink = '/privacidad.html' },
  @{ src = 'LEGAL_COMMUNITY_GUIDELINES.md'; dst = 'docs\comunidad.md'; title = 'Guías de la comunidad'; permalink = '/comunidad.html' }
)
foreach ($f in $files) {
  $fm = "---`nlayout: default`ntitle: $($f.title)`npermalink: $($f.permalink)`n---`n`n"
  $content = [System.IO.File]::ReadAllText("d:\Dev2\$($f.src)")
  [System.IO.File]::WriteAllText("d:\Dev2\$($f.dst)", $fm + $content, $utf8NoBom)
}
```

**Importante:** cuando subas una nueva versión del contenido legal, también subí el número en `LEGAL_VERSIONS` dentro de `src/services/legalConsentService.js`. Eso fuerza re-aceptación a los usuarios existentes.

## Dominio propio (opcional)

Si más adelante comprás un dominio (ej. `therianmatch.com.ar`), podés apuntar el subdominio `legal.therianmatch.com.ar` a este sitio:

1. Crear archivo `docs/CNAME` con `legal.therianmatch.com.ar` adentro.
2. En el DNS del dominio crear un CNAME → `<tu-usuario>.github.io`.
3. En Settings → Pages → Custom domain pegarlo.

Después actualizar `LEGAL_BASE_URL` en `SettingsPage.js`.
