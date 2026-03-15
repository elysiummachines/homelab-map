# Docker Deployment
Deploy the homelab network map as a lightweight container using `nginx:alpine`.

## Prerequisites
- Docker and Docker Compose installed
- The `dist/` folder from a production build (`npm run build`)

## Quick Start
1. Build the project:

```bash
npm install
npm run build
```

2. Start the container:

```bash
docker compose up -d
```

The map is now served on port `80` inside the container.

## Standalone (No Reverse Proxy)
If you're not running Traefik or any reverse proxy, uncomment the ports section in `docker-compose.yaml`:

```yaml
ports:
- 8585:80
```

Then access the map at `http://localhost:8585`.

## Traefik Reverse Proxy
The compose file includes Traefik labels out of the box. Update the `Host` rule to match your domain:

```yaml
- traefik.http.routers.homelab-map-secure.rule=Host(`homelab-map.yourdomain.com`)
```

Make sure the `proxy` network exists and your Traefik instance is on the same network:

```bash
docker network create proxy
```

## Portainer Stack
1. In Portainer, go to **Stacks → Add stack**
2. Paste the contents of `docker-compose.yaml`
3. Set the stack name to `homelab-map`
4. Make sure the `dist/` folder path is correct under volumes
5. Deploy

## Resource Limits
The container is capped at **500MB RAM** and **1 CPU core** - more than enough for serving static files with nginx.

## Health Check
A built-in health check runs every 30 seconds:

```
wget -q --spider http://localhost || exit 1
```

Check container health with:

```bash
docker inspect --format='{{.State.Health.Status}}' homelab-map
```