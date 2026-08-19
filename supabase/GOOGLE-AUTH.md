# Login con Google para el Admin (opcional)

1. En Google Cloud Console → **APIs & Services → Credentials**, creá un
   **OAuth client ID** de tipo *Web application*.
2. En **Authorized redirect URIs** agregá:
   `https://<TU-PROYECTO>.supabase.co/auth/v1/callback`
3. Copiá el **Client ID** y **Client Secret**.
4. En Supabase → **Authentication → Providers → Google**, activalo y pegá
   esas credenciales.
5. En **Authentication → URL Configuration**, agregá la URL de tu sitio
   (Cloudflare Pages, ej. `https://akarielectrohome.pages.dev`) como
   *Site URL* y en *Redirect URLs*.
6. El botón "Ingresar con Google" puede agregarse en el `index.html`
   llamando a:
   ```js
   await fetch(`${SUPABASE_URL}/auth/v1/authorize?provider=google`, ...)
   // o, más simple, redirigir el navegador:
   window.location.href = `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(location.origin)}`;
   ```
7. Restringí quién puede loguearse creando usuarios manualmente en
   **Authentication → Users** en vez de permitir registro abierto, o
   agregando una policy que valide el email contra una lista blanca.
