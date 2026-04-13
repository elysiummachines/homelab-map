# Changelog

All notable changes to this project will be documented in this file.

## [0.3.0] - 2026-04-12

- K3s cluster nodes added to diagram (master + 3 workers) on VLAN-30
- UniFi U6-Lite access point node with PoE from Cisco SG300
- Cisco SG300 replaces HP 1810-24G managed switch
- Multi-VLAN zones: MGMT (VLAN-20), SRVRS (VLAN-30), STRG (VLAN-40)
- Authentik and Keycloak zone labels on diagram
- Docker node labels updated to PROD / AGENT / CONNECTORS / LLM/QA
- Inactive nodes and connections dimmed (grey) — color only on active/hover
- Particle canvas inter-particle lines changed to neutral grey
- Updated IP scheme to reflect new VLAN addressing

## [0.2.1] - 2026-03-15

- Added docker-compose.yaml for lightweight nginx:alpine deployment
- Added Docker deployment guide to README
- Traefik reverse proxy labels included
- Portainer stack instructions
- Resource limits and health check configured

## [0.2.0] - 2026-03-15

- Mobile-responsive layout for all tabs
- Dynamic viewBox on diagram SVG for full node visibility on mobile
- Card-based firewall rules and flow matrix for small screens
- SSH diagram scales via viewBox instead of fixed width
- Particle canvas pinch-zoom fix using screen dimensions
- useIsMobile hook for conditional rendering
- Detail boxes and legend constrained to viewport width
- Vite dev server bound to 0.0.0.0 for LAN mobile testing
- Lighthouse 100/100/100/100 desktop and mobile

## [0.1.0] - 2026-03-14

- Initial release
- Interactive homelab network map
- Particle network background
- JetBrains Mono font on all header nodes
- Firewall VLAN isolation for Callisto network
- Lighthouse 100 performance score
- WAN+LAN, VPN & LAN/DHCP topology labels