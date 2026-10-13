# Server deployment

The production site is a static Vite build. Caddy serves the build on `127.0.0.1:3001` and proxies `d3tech.agency` to that listener. The existing Caddy system service keeps both listeners running after reboot.

On the server, with Node.js 22.12+ or 24 installed:

```sh
git clone https://github.com/d3agency/d3agency.git /srv/d3agency
cd /srv/d3agency
npm ci
npm run build
```

Add this import to the existing `/etc/caddy/Caddyfile`, retaining its other configuration:

```caddyfile
import /srv/d3agency/deploy/Caddyfile
```

Validate before reloading:

```sh
caddy validate --config /etc/caddy/Caddyfile
systemctl reload caddy
curl --fail http://127.0.0.1:3001/
```

In the domain provider, set the root `@` A record for `d3tech.agency` to `187.126.120.197`. Remove any conflicting A or AAAA records for that hostname. Caddy will obtain the HTTPS certificate after DNS points to this server and ports 80/443 are reachable.

For later updates:

```sh
cd /srv/d3agency
git pull --ff-only
npm ci
npm run build
```

Reload Caddy only when its configuration changes.
