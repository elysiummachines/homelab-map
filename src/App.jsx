import { useState, useEffect, useRef } from "react";

// PARTICLE NETWORK BACKGROUND
function ParticleCanvas() {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const COLORS = ["#00d4ff", "#00ff9d", "#9b59b6", "#00d4ff", "#00ff9d"];
    const PARTICLE_COUNT = 80;
    const MAX_DIST = 140;
    const MOUSE_DIST = 160;
    let animId;
    let particles = [];

    const isMobileDevice = window.innerWidth <= 768;
    let baseW = isMobileDevice ? screen.width : window.innerWidth;
    let baseH = isMobileDevice ? screen.height : window.innerHeight;

    function resize() {
      if (isMobileDevice) {
        const newW = screen.width;
        const newH = screen.height;
        if (Math.abs(newW - baseW) > 50 || Math.abs(newH - baseH) > 50) {
          baseW = newW;
          baseH = newH;
        }
        canvas.width  = baseW;
        canvas.height = baseH;
      } else {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    }

    function init() {
      particles = Array.from({ length: PARTICLE_COUNT }, () => ({
        x:  Math.random() * canvas.width,
        y:  Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r:  Math.random() * 1.5 + 1,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // move
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      });

      // connect particles to each other
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < MAX_DIST) {
            const alpha = 1 - dist / MAX_DIST;
            ctx.beginPath();
            ctx.strokeStyle = a.color + Math.floor(alpha * 40).toString(16).padStart(2,"0");
            ctx.lineWidth = 0.6;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
        // connect to mouse
        const mx = mouse.current.x, my = mouse.current.y;
        const p = particles[i];
        const dx = p.x - mx, dy = p.y - my;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < MOUSE_DIST) {
          const alpha = 1 - dist / MOUSE_DIST;
          ctx.beginPath();
          ctx.strokeStyle = p.color + Math.floor(alpha * 120).toString(16).padStart(2,"0");
          ctx.lineWidth = 0.8;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mx, my);
          ctx.stroke();
        }
      }

      // draw dots
      particles.forEach(p => {
        const dx = p.x - mouse.current.x, dy = p.y - mouse.current.y;
        const near = Math.sqrt(dx*dx + dy*dy) < MOUSE_DIST;
        ctx.beginPath();
        ctx.arc(p.x, p.y, near ? p.r * 2 : p.r, 0, Math.PI * 2);
        ctx.fillStyle = near ? p.color : p.color + "99";
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    }

    resize();
    init();
    draw();

    const onResize = () => { resize(); init(); };
    const onMouseMove = (e) => { mouse.current = { x: e.clientX, y: e.clientY + window.scrollY }; };
    const onMouseLeave = () => { mouse.current = { x: -9999, y: -9999 }; };

    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <canvas ref={canvasRef} style={{
      position: "fixed", top: 0, left: 0,
      width: "100%", height: "100%",
      pointerEvents: "none", zIndex: 0,
    }}/>
  );
}

const nodes = {
  internet: {
    id: "internet", label: "INTERNET", sublabel: "upstream",
    ip: "—", type: "internet", icon: "🌐", color: "#e85d00",
  },
  cloudflare: {
    id: "cloudflare", label: "CLOUDFLARE", sublabel: "*.domain",
    ip: "TLS/tunnel", type: "cloud", icon: "☁", color: "#e67e22",
    note: "Zero-trust outbound tunnel — no ports open on router - TLS signing",
  },
  asus: {
    id: "asus", label: "ASUS RT-AX5400", sublabel: "gateway",
    ip: "10.x.x.x", type: "router", icon: "🛜", color: "#db9ad3",
    note: "Home router - no port forwarding needed — Cloudflare handles external",
  },
  switch: {
    id: "switch", label: "HP 1810-24G", sublabel: "managed switch",
    ip: "10.x.x.x", type: "switch", icon: "🔀", color: "#264db9",
    note: "Port 3+5: TRK1 LACP → QNAP | Port 11: VLAN → pve | Port 13: VLAN → pve2",
  },
  opnsense: {
    id: "opnsense", label: "SW01 (OPNsense)", sublabel: "VM 800 - pve",
    ip: "WAN 10.x | LAN 40.x", type: "firewall", icon: "🛡️", color: "#e85d00",
    note: "Unbound DNS → Pi-holes | Kea DHCPv4 40.x.x.x-x | WireGuard Int :PORT | NAT | Isolation rules",
  },
  pve: {
    id: "pve", label: "PVE", sublabel: "pve.prod.lan",
    ip: "10.x.x.x", type: "proxmox", icon: "☊", color: "#ff6b35",
    note: "SSH :3xxx | vmbr0 (mgmt) | Callisto1 bridge VLAN | Cluster: Node-1",
  },
  pve2: {
    id: "pve2", label: "PVE2", sublabel: "pve2.prod.lan",
    ip: "10.x.x.x", type: "proxmox", icon: "☋", color: "#ff6b35",
    note: "SSH :3xxx | vmbr0 (mgmt) | Callisto01 bridge VLAN | Cluster: Node-2",
  },
  pihole1: {
    id: "pihole1", label: "PH01", sublabel: "Pi-hole 1 - VM 103",
    ip: "10.x.x.x", type: "dns", icon: "🕳", color: "#3498db",
    note: "STAYS on vmbr0 forever - DNS filtering | Upstream: Unbound on OPNsense",
  },
  pihole2: {
    id: "pihole2", label: "PH02", sublabel: "Pi-hole 2 - VM 104",
    ip: "10.x.x.x", type: "dns", icon: "🕳", color: "#3498db",
    note: "STAYS on vmbr0 forever - DNS filtering | Upstream: Unbound on OPNsense",
  },
  qdevice: {
    id: "qdevice", label: "QDEVICE", sublabel: "Quorum - VM 200",
    ip: "10.x.x.x", type: "quorum", icon: "⚖", color: "#f39c12",
    note: "Alpine Linux - Proxmox cluster quorum",
  },
  qnap: {
    id: "qnap", label: "QNAP SAN/NAS", sublabel: "storage",
    ip: "10.x.x.x", type: "storage", icon: "💽", color: "#16a085",
    note: "LACP bond TRK1 to HP switch | NFS + SMB storage for Proxmox VMs",
  },
  liger: {
    id: "liger", label: "LIGER", sublabel: "lp.liger.lan",
    ip: "10.x.x.x", type: "client", icon: "💻", color: "#00d4ff",
    note: "Asgard-vpn WireGuard via KDE NetworkManager | peer 10.x.x.x | Split tunnel | nmcli never-default",
  },
  storageswitch: {
    id: "storageswitch", label: "STORAGE SW", sublabel: "dumb switch - isolated",
    ip: "10.x.x.x/24", type: "switch", icon: "🔀", color: "#16a085",
    note: "Isolated storage network - no internet, no routing | QNAP NIC1+NIC2 → pve eno4 (10.x.x.x) + pve2 eno4 (10.x.x.x)",
  },
  wireguard: {
    id: "wireguard", label: "WG TUNNEL", sublabel: "Asgard-vpn",
    ip: "10.x.x.x/24", type: "vpn", icon: "🔐", color: "#9b59b6",
    note: "Split tunnel - only 40.x.x.x + 10.x.x.x via VPN | Internet stays local | DNS via Pi-holes on connect",
  },
  node1: {
    id: "node1", label: "NODE-1", sublabel: "Prod - stack",
    ip: "40.x.x.x", type: "docker", icon: "📦", color: "#a855f7",
    note: "Portainer + Docker | 53.5GB RAM | 9 CPU | 53 Containers/33 Stacks",
  },
  node2: {
    id: "node2", label: "NODE-2", sublabel: "Traefik - stack",
    ip: "40.x.x.x", type: "docker", icon: "📦", color: "#a855f7",
    note: "Traefik | 13 containers | tcp://node2-prod:9001 | 4.1GB RAM",
  },
  node3: {
    id: "node3", label: "NODE-3", sublabel: "Twingate - stack",
    ip: "40.x.x.x", type: "docker", icon: "📦", color: "#a855f7",
    note: "Twingate ZTNA | 13 containers | tcp://node3-prod:9001 | 4.1 RAM",
  },
  node4: {
    id: "node4", label: "NODE-4", sublabel: "LLM - stack",
    ip: "40.x.x.x", type: "docker", icon: "🧠", color: "#a855f7",
    note: "LLM inference | 4 containers | tcp://node4-prod:9001 | 110.8GB RAM",
  },
};

const connections = [
  { from: "internet",      to: "asus",           label: "",            color: "#e85d00", style: "solid", offset: 0 },
  { from: "internet",      to: "cloudflare",     label: "outbound",    color: "#e67e22", style: "solid", offset: 0 },
  { from: "asus",          to: "switch",         label: "",            color: "#e85d00", style: "solid", offset: 0 },
  { from: "switch",        to: "opnsense",       label: "WAN+LAN",     color: "#e85d00", style: "solid", offset: 0, labelOffsetX: 30 },
  { from: "switch",        to: "pve",            label: "vmbr0",       color: "#ff6b35", style: "solid", offset: 0 },
  { from: "switch",        to: "qnap",           label: "LACP",        color: "#16a085", style: "solid", offset: 0 },
  { from: "opnsense",      to: "node1",          label: "LAN/DHCP",    color: "#a855f7", style: "solid", offset: 0, labelOffsetX: -4 },
  { from: "opnsense",      to: "wireguard",      label: "",            color: "#9b59b6", style: "solid", offset: 0 },
  { from: "opnsense",      to: "pihole1",        label: "DNS fwd",     color: "#3498db", style: "solid", offset: -20 },
  { from: "opnsense",      to: "pihole2",        label: "DNS fwd",     color: "#3498db", style: "solid", offset: 20 },
  { from: "liger",         to: "wireguard",      label: "vpn",         color: "#9b59b6", style: "solid", offset: 0, labelOffsetX: 5 },
  { from: "wireguard",     to: "node1",          label: "split tunnel",color: "#9b59b6", style: "solid", offset: 0 },
  { from: "cloudflare",    to: "node2",          label: "→ Traefik",   color: "#e67e22", style: "solid", offset: 0 },
  { from: "qnap",          to: "node1",          label: "iSCSI",       color: "#16a085", style: "solid", offset: 0 },
  { from: "pve",           to: "pihole1",        label: "",            color: "#3498db", style: "solid", offset: 0 },
  { from: "node1",         to: "node2",          label: "",            color: "#a855f7", style: "solid", offset: 0 },
  { from: "node1",         to: "node3",          label: "",            color: "#6366f1", style: "solid", offset: 0 },
  { from: "node1",         to: "node4",          label: "",            color: "#6366f1", style: "solid", offset: 0 },
  { from: "qnap",          to: "storageswitch",  label: "NIC1+2",      color: "#16a085", style: "solid", offset: 0, labelOffsetX: 10 },
  { from: "storageswitch", to: "pve",            label: "eno4",        color: "#16a085", style: "solid", offset: -20 },
  { from: "storageswitch", to: "pve2",           label: "eno4",        color: "#16a085", style: "solid", offset: 20 },
];

const positions = {
  internet:      { x: 50,  y: 55  },
  cloudflare:    { x: 650, y: 51  },
  asus:          { x: 50,  y: 165 },
  switch:        { x: 50,  y: 280 },
  qnap:          { x: 805, y: 140 },
  storageswitch: { x: 805, y: 235 },
  opnsense:      { x: 188, y: 350 },
  pve:           { x: -12, y: 470 },
  pve2:          { x: -12, y: 550 },
  pihole1:       { x: 805, y: 330 },
  pihole2:       { x: 805, y: 405 },
  qdevice:       { x: -12, y: 630 },
  liger:         { x: 806, y: 499 },
  wireguard:     { x: 806, y: 600 },
  node1:         { x: 190, y: 555 },
  node2:         { x: 332, y: 555 },
  node3:         { x: 473, y: 555 },
  node4:         { x: 615, y: 555 },
};

const arrowDefs = [
  ["arr-orange","#e85d00"],["arr-cyan","#00d4ff"],["arr-green","#2ecc71"],
  ["arr-blue","#3498db"],["arr-purple","#9b59b6"],["arr-yellow","#e67e22"],
  ["arr-violet","#a855f7"],["arr-indigo","#6366f1"],["arr-coral","#ff6b35"],
  ["arr-teal","#16a085"],["arr-amber","#f39c12"],["arr-grey","#888"],
];

function getArrow(color) {
  const map = {
    "#e85d00":"arr-orange","#00d4ff":"arr-cyan","#2ecc71":"arr-green",
    "#3498db":"arr-blue","#9b59b6":"arr-purple","#e67e22":"arr-yellow",
    "#a855f7":"arr-violet","#6366f1":"arr-indigo","#ff6b35":"arr-coral",
    "#16a085":"arr-teal","#f39c12":"arr-amber","#888":"arr-grey",
  };
  return map[color] || "arr-grey";
}

function getElbowPath(from, to, offset = 0) {
  const PAD = 30;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (Math.abs(dx) < 8) {
    const y1 = from.y + (dy > 0 ? PAD : -PAD);
    const y2 = to.y   + (dy > 0 ? -PAD : PAD);
    return { d: `M ${from.x} ${y1} L ${to.x} ${y2}`, lx: from.x + 6, ly: (y1+y2)/2 };
  }
  if (Math.abs(dy) < 8) {
    const x1 = from.x + (dx > 0 ? PAD : -PAD);
    const x2 = to.x   + (dx > 0 ? -PAD : PAD);
    return { d: `M ${x1} ${from.y} L ${x2} ${to.y}`, lx: (x1+x2)/2, ly: from.y - 8 };
  }
  const y1 = from.y + (dy > 0 ? PAD : -PAD);
  const y2 = to.y   + (dy > 0 ? -PAD : PAD);
  const midY = (y1 + y2) / 2 + offset;
  return {
    d: `M ${from.x} ${y1} L ${from.x} ${midY} L ${to.x} ${midY} L ${to.x} ${y2}`,
    lx: (from.x + to.x) / 2, ly: midY - 7,
  };
}

function NodeBox({ node, x, y, onClick, active }) {
  const w = 128;
  return (
    <g transform={`translate(${x},${y})`} onClick={() => onClick(node.id)} style={{ cursor: "pointer" }}>
      <rect x={-w/2} y={-30} width={w} height={60} rx={8}
        fill={active ? node.color+"22" : "#0d1117"}
        stroke={active ? node.color : node.color+"55"}
        strokeWidth={active ? 2 : 1}
        style={{ filter: active ? `drop-shadow(0 0 10px ${node.color})` : "none", transition: "all 0.2s" }}
      />
      <text x={0} y={-8} textAnchor="middle" fill={node.color} fontSize={10} fontFamily="'JetBrains Mono', monospace" fontWeight="bold">
        {node.icon} {node.label}
      </text>
      <text x={0} y={8} textAnchor="middle" fill="#e4dddd" fontSize={9} fontFamily="'JetBrains Mono', monospace">
        {node.sublabel}
      </text>
      <text x={0} y={18} textAnchor="middle" fill="#b9b2b2" fontSize={9} fontFamily="'JetBrains Mono', monospace">
        {node.ip}
      </text>
    </g>
  );
}

const firewallRules = [
  { iface:"WAN", action:"PASS",  proto:"TCP",     src:"10.x.x.x/24",   dst:"This Firewall :PORT", desc:"Admin GUI access" },
  { iface:"WAN", action:"PASS",  proto:"UDP",     src:"Any",           dst:"WAN :PORT",           desc:"WireGuard VPN" },
  { iface:"WAN", action:"PASS",  proto:"TCP/UDP", src:"!10.x.x.x/24",  dst:"40.x.x.x/24",         desc:"Static route from ASUS (inverted)" },
  { iface:"LAN", action:"PASS",  proto:"TCP/UDP", src:"40.x.x.x/24",   dst:"10.x.x.x :PORT",      desc:"DNS → Pi-hole 1" },
  { iface:"LAN", action:"PASS",  proto:"TCP/UDP", src:"40.x.x.x/24",   dst:"10.x.x.x :PORT",      desc:"DNS → Pi-hole 2" },
  { iface:"LAN", action:"PASS",  proto:"TCP",     src:"40.x.x.x/32",   dst:"10.x.x.x :PORT",      desc:"Proxmox1" },
  { iface:"LAN", action:"PASS",  proto:"TCP",     src:"40.x.x.x/32",   dst:"10.x.x.x :PORT",      desc:"Proxmox2" },
  { iface:"LAN", action:"PASS",  proto:"TCP",     src:"40.x.x.x/32",   dst:"10.x.x.x :PORT",      desc:"Pi-Hole1 HTTP" },
  { iface:"LAN", action:"PASS",  proto:"TCP",     src:"40.x.x.x/32",   dst:"10.x.x.x :PORT",      desc:"Pi-Hole2 HTTP" },
  { iface:"LAN", action:"PASS",  proto:"TCP/UDP", src:"40.x.x.x/32",   dst:"10.x.x.x :PORT",      desc:"SAN iSCSI" },
  { iface:"LAN", action:"BLOCK", proto:"Any",     src:"40.x.x.x/24",   dst:"10.x.x.x/24",         desc:"Block VMs from management" },
  { iface:"LAN", action:"BLOCK", proto:"Any",     src:"LAN net",       dst:"40.x.x.x/24",         desc:"Block LAN to Callisto" },
  { iface:"WG",  action:"PASS",  proto:"Any",     src:"10.x.x.x/24",   dst:"Any",                 desc:"Allow WG clients" },
  { iface:"WG",  action:"PASS",  proto:"TCP/UDP", src:"10.x.x.x/24",   dst:"10.x.x.x :PORT",      desc:"WG DNS Pi-hole 1" },
  { iface:"WG",  action:"PASS",  proto:"TCP/UDP", src:"10.x.x.x/24",   dst:"10.x.x.x :PORT",      desc:"WG DNS Pi-hole 2" },
];

const flows = [
  { from:"40.x.x.x VMs",      to:"Internet",             ok:true,  note:"NAT via OPNsense" },
  { from:"40.x.x.x VMs",      to:"Pi-holes :PORT",       ok:true,  note:"DNS only - pass rule" },
  { from:"40.x.x.x VMs",      to:"10.x.x.x mgmt",        ok:false, note:"BLOCKED - isolation rule" },
  { from:"LIGER (no VPN)",    to:"40.x.x.x",             ok:false, note:"BLOCKED - WAN invert rule" },
  { from:"LIGER + WireGuard", to:"40.x.x.x VMs",         ok:true,  note:"Split tunnel via WG" },
  { from:"LIGER + WireGuard", to:"Internet",             ok:true,  note:"Stays local - nmcli never-default" },
  { from:"LIGER + WireGuard", to:"Pi-holes DNS",         ok:true,  note:"WG firewall rules allow :PORT" },
  { from:"Cloudflare Tunnel", to:"Traefik → Services",   ok:true,  note:"Outbound only - no open ports on router" },
  { from:"10.x.x.x PC",       to:"40.x.x.x direct",      ok:false, note:"BLOCKED - Block LAN to Callisto rule" },
  { from:"10.x.x.x PC",       to:"Services via Traefik", ok:true,  note:"Via Cloudflare tunnel → DK02 → services" },
];

const sshNodes = {
  laptop: { id:"laptop", label:"LIGER",  sublabel:"lp.local.liger",      tag:"WireGuard", type:"client",  icon:"💻", color:"#00d4ff" },
  dk01:   { id:"dk01",   label:"DK01",   sublabel:"elysiummachines.cc",  type:"jump",     icon:"🐳", color:"#00ff9d", note:"SSH Gateway + Docker Hub", sublabelSize:15 },
  mox1:   { id:"mox1",   label:"MOX1",   sublabel:"mox.prod.lan",        type:"proxmox",  icon:"☊", color:"#ff6b35" },
  mox2:   { id:"mox2",   label:"MOX2",   sublabel:"mox2.prod.lan",       type:"proxmox",  icon:"☋", color:"#ff6b35" },
  node1:  { id:"node1",  label:"NODE1",  sublabel:"node1.prod.lan",      type:"node",     icon:"📦", color:"#a855f7", canSSHtoPVE:true },
  node2:  { id:"node2",  label:"NODE2",  sublabel:"node2.prod.lan",      type:"node",     icon:"📦", color:"#a855f7", canSSHtoPVE:true },
  node3:  { id:"node3",  label:"NODE3",  sublabel:"node3.prod.lan",      type:"node",     icon:"📦", color:"#6366f1" },
  node4:  { id:"node4",  label:"NODE4",  sublabel:"node4.prod.lan",      type:"node",     icon:"📦", color:"#6366f1" },
};

const sshConnections = [
  { from:"laptop", to:"dk01",  label:"SSH (key auth)", color:"#00d4ff", style:"solid"  },
  { from:"dk01",   to:"mox1",  label:"SSH :3100",      color:"#00ff9d", style:"solid"  },
  { from:"dk01",   to:"mox2",  label:"SSH :3100",      color:"#00ff9d", style:"solid"  },
  { from:"dk01",   to:"node1", label:"",               color:"#00ff9d", style:"solid"  },
  { from:"dk01",   to:"node2", label:"",               color:"#00ff9d", style:"solid"  },
  { from:"dk01",   to:"node3", label:"",               color:"#00ff9d", style:"solid"  },
  { from:"dk01",   to:"node4", label:"",               color:"#00ff9d", style:"solid"  },
  { from:"node1",  to:"mox1",  label:"SSH (pubkey)",   color:"#a855f7", style:"dashed" },
  { from:"node1",  to:"mox2",  label:"SSH (pubkey)",   color:"#a855f7", style:"dashed" },
  { from:"node2",  to:"mox1",  label:"SSH (pubkey)",   color:"#a855f7", style:"dashed" },
  { from:"node2",  to:"mox2",  label:"SSH (pubkey)",   color:"#a855f7", style:"dashed" },
];

const sshPositions = {
  laptop: { x:400, y:70  },
  dk01:   { x:400, y:210 },
  mox1:   { x:180, y:370 },
  mox2:   { x:620, y:370 },
  node1:  { x:100, y:530 },
  node2:  { x:300, y:530 },
  node3:  { x:500, y:530 },
  node4:  { x:700, y:530 },
};

function SshNode({ node, x, y, onClick, active }) {
  return (
    <g transform={`translate(${x},${y})`} onClick={() => onClick(node.id)} style={{ cursor:"pointer" }}>
      <rect x={-90} y={-45} width={180} height={90} rx={8}
        fill={active ? node.color+"22" : "#0d1117"}
        stroke={active ? node.color : node.color+"55"}
        strokeWidth={active ? 2 : 1}
        style={{ filter: active ? `drop-shadow(0 0 8px ${node.color})` : "none", transition:"all 0.2s" }}
      />
      <text x={0} y={-12} textAnchor="middle" fill={node.color} fontSize={17} fontFamily="'Courier New', monospace" fontWeight="bold">
        {node.icon} {node.label}
      </text>
      <text x={0} y={4} textAnchor="middle" fill="#ffffff" fontSize={node.sublabelSize || 15} fontFamily="'Courier New', monospace">
        {node.sublabel}
      </text>
      {node.tag && (
        <text x={0} y={22} textAnchor="middle" fill="#9b59b6" fontSize={15} fontFamily="'Courier New', monospace">
          {node.tag}
        </text>
      )}
      {node.canSSHtoPVE && (
        <text x={0} y={30} textAnchor="middle" fill="#a855f7" fontSize={15} fontFamily="'Courier New', monospace">✦ PVE access</text>
      )}
    </g>
  );
}

function useIsMobile(breakpoint = 768) {
  const [mobile, setMobile] = useState(() => typeof window !== "undefined" && window.innerWidth <= breakpoint);
  useEffect(() => {
    const check = () => setMobile(window.innerWidth <= breakpoint);
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);
  return mobile;
}

function FirewallCard({ rule }) {
  const isBlock = rule.action === "BLOCK";
  return (
    <div style={{
      background: "#0d1117",
      border: `1px solid ${isBlock ? "#e74c3c44" : "#2ecc7133"}`,
      borderLeft: `3px solid ${isBlock ? "#e74c3c" : "#2ecc71"}`,
      borderRadius: 6,
      padding: "8px 10px",
      marginBottom: 6,
      fontFamily: "'Courier New', monospace",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <span style={{ color: isBlock ? "#e74c3c" : "#2ecc71", fontWeight: "bold", fontSize: 12 }}>{rule.action}</span>
        <span style={{
          background: rule.iface === "WAN" ? "#e85d0022" : rule.iface === "WG" ? "#9b59b622" : "#a855f722",
          color: rule.iface === "WAN" ? "#e85d00" : rule.iface === "WG" ? "#9b59b6" : "#a855f7",
          padding: "1px 6px", borderRadius: 3, fontSize: 9, fontWeight: "bold", letterSpacing: 1,
        }}>{rule.iface}</span>
      </div>
      <div style={{ color: "#e6e1e1", fontSize: 11, marginBottom: 2, fontWeight: "bold" }}>{rule.desc}</div>
      <div style={{ color: "#888", fontSize: 10, lineHeight: 1.5, wordBreak: "break-all" }}>
        {rule.proto} · {rule.src} → {rule.dst}
      </div>
    </div>
  );
}

function FlowCardMobile({ flow }) {
  return (
    <div style={{
      background: "#0d1117",
      border: `1px solid ${flow.ok ? "#2ecc7133" : "#e74c3c33"}`,
      borderLeft: `3px solid ${flow.ok ? "#2ecc71" : "#e74c3c"}`,
      borderRadius: 6,
      padding: "7px 10px",
      marginBottom: 5,
      fontFamily: "'Courier New', monospace",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
        <span style={{ color: flow.ok ? "#2ecc71" : "#e74c3c", fontWeight: "bold", fontSize: 12 }}>{flow.ok ? "✓" : "✗"}</span>
        <span style={{ color: "#fff", fontSize: 11 }}>{flow.from}</span>
        <span style={{ color: "#555", fontSize: 9 }}>→</span>
        <span style={{ color: "#ccc", fontSize: 11 }}>{flow.to}</span>
      </div>
      <div style={{ color: "#777", fontSize: 10, paddingLeft: 17 }}>{flow.note}</div>
    </div>
  );
}

export default function App() {
  const [active, setActive] = useState(null);
  const [tab, setTab] = useState("diagram");
  const [sshActive, setSshActive] = useState(null);
  const activeNode = active ? nodes[active] : null;
  const handleClick = (id) => setActive(active === id ? null : id);
  const isMobile = useIsMobile();

  const diagramViewBox = isMobile ? "-100 15 1000 700" : "-20 30 780 680";

  return (
    <div style={{
      background:"#080c10", minHeight:"100vh",
      display:"flex", flexDirection:"column", alignItems:"center", width:"100vw",
      fontFamily:"'Courier New', monospace", padding: isMobile ? "12px 4px" : "24px", color:"#ccc",
      position:"relative", boxSizing:"border-box", overflowX:"hidden",
    }}>
      <ParticleCanvas />

      <main style={{ position:"relative", zIndex:1, display:"flex", flexDirection:"column", alignItems:"center", width:"100%", maxWidth:"100%" }}>

        <div style={{ color:"#00d4ff", fontSize: isMobile ? 10 : 20, letterSpacing: isMobile ? 1 : 4, marginBottom:4, opacity:0.6, textAlign:"center" }}>
          HA-CLUSTER.ELYSIUMMACHINES
        </div>
        <h1 style={{ color:"#fff", fontSize: isMobile ? 14 : 23, letterSpacing: isMobile ? 1 : 2, marginBottom: isMobile ? 4 : 12, fontWeight:"normal", textAlign:"center" }}>
          HOMELAB NETWORK MAP
        </h1>
        <div style={{ fontFamily:"'JetBrains Mono', monospace", color:"#f0f0f0", fontSize: isMobile ? 9 : 18, letterSpacing: isMobile ? 0.5 : 2, marginBottom: isMobile ? 12 : 22, textAlign:"center" }}>
          OPNsense · WireGuard · Proxmox · Docker . Portainer . Qnap
        </div>

        <div style={{ display:"flex", gap: isMobile ? 3 : 2, marginBottom: isMobile ? 16 : 50, flexWrap:"wrap", justifyContent:"center" }}>
          {["diagram","firewall","SSH","flows"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              background: tab===t ? "#00d4ff18" : "transparent",
              border:`1px solid ${tab===t ? "#bbb7b5" : "#b3b6bd"}`,
              color: tab===t ? "#00d4ff" : "#f5ecec",
              padding: isMobile ? "4px 10px" : "6px 18px", borderRadius:4, cursor:"pointer",
              fontFamily:"'JetBrains Mono', monospace", fontSize: isMobile ? 11 : 18, letterSpacing: isMobile ? 1 : 2,
              textTransform:"uppercase", transition:"all 0.2s",
            }}>{t}</button>
          ))}
        </div>

        {/* ===================== DIAGRAM TAB ===================== */}
        {tab === "diagram" && (<>
          <div style={{ width:"100%", maxWidth:"1400px", margin:"0 auto" }}>
            <svg viewBox={diagramViewBox} width="100%" style={{ overflow:"visible" }}>
              <defs>
                {arrowDefs.map(([id,fill]) => (
                  <marker key={id} id={id} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L6,3 z" fill={fill}/>
                  </marker>
                ))}
              </defs>

              {/* Zone backgrounds */}
              <rect x={-92} y={430} width={160} height={240} rx={5} fill="none" stroke="#e66916ce" strokeDasharray="5 3" strokeWidth={1}/>
              <text x={-52} y={427} fill="#e66916ce" fontSize={7} fontFamily="'Courier New', monospace" letterSpacing={2}>MANAGEMENT 10.x.x.x</text>

              <rect x={730} y={460} width={150} height={180} rx={5} fill="none" stroke="#00d3f8fd" strokeDasharray="5 3" strokeWidth={1}/>
              <text x={767} y={457} fill="#00d3f8fd" fontSize={7} fontFamily="'Courier New', monospace" letterSpacing={2}>WIREGUARD 10.x.x.x</text>

              <rect x={730} y={290} width={150} height={155} rx={5} fill="none" stroke="#1784ccd7" strokeDasharray="5 3" strokeWidth={1}/>
              <text x={803} y={287} fill="#1784ccd7" fontSize={7} fontFamily="'Courier New', monospace" letterSpacing={2}>DNS 10.x.x.x</text>

              <rect x={730} y={102} width={150} height={172} rx={5} fill="none" stroke="#1fcca9ce" strokeDasharray="5 3" strokeWidth={1}/>
              <text x={779} y={99} fill="#1fcca9ce" fontSize={7} fontFamily="'Courier New', monospace" letterSpacing={2}>STORAGE 10.x.x.x</text>

              <rect x={120} y={515} width={565} height={195} rx={5} fill="none" stroke="#af3ab9e3" strokeDasharray="5 3" strokeWidth={1}/>
              <text x={534} y={510} fill="#af3ab9e3" fontSize={7} fontFamily="'Courier New', monospace" letterSpacing={2}>CALLISTO 40.x.x.x - VLAN</text>

              {/* Connections */}
              {connections.map((conn, i) => {
                const from = positions[conn.from];
                const to = positions[conn.to];
                if (!from || !to) return null;
                const isActive = active === conn.from || active === conn.to;
                const { d, lx, ly } = getElbowPath(from, to, conn.offset || 0);
                return (
                  <g key={i}>
                    <path
                      d={d}
                      fill="none"
                      stroke={isActive ? conn.color : conn.color + "88"}
                      strokeWidth={isActive ? 2 : 1}
                      strokeDasharray={conn.style === "dashed" ? "5 4" : "none"}
                      markerEnd={`url(#${getArrow(conn.color)})`}
                      style={{ transition: "all 0.2s" }}
                    />
                    {conn.label && (
                      <text
                        x={lx + (conn.labelOffsetX || 0)} y={ly}
                        fill={isActive ? conn.color : conn.color + "88"}
                        fontSize={7} fontFamily="'Courier New', monospace" textAnchor="middle"
                      >
                        {conn.label}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Nodes */}
              {Object.values(nodes).map(node => {
                const pos = positions[node.id];
                if (!pos) return null;
                return <NodeBox key={node.id} node={node} x={pos.x} y={pos.y} onClick={handleClick} active={active===node.id}/>;
              })}
            </svg>
          </div>

          <div style={{ display:"flex", flexWrap:"wrap", gap: isMobile ? 5 : 16, marginTop: isMobile ? 4 : 10, fontSize: isMobile ? 10 : 20, color:"#e6e1e1", letterSpacing:1, justifyContent:"center", padding: isMobile ? "0 8px" : 0, width: isMobile ? "100%" : undefined, boxSizing:"border-box" }}>
            <span><span style={{color:"#e85d00"}}>--</span> WAN</span>
            <span><span style={{color:"#ff6b35"}}>--</span> Proxmox</span>
            <span><span style={{color:"#2ecc71"}}>--</span> Callisto VLAN</span>
            <span><span style={{color:"#3498db"}}>--</span> DNS</span>
            <span><span style={{color:"#9b59b6"}}>--</span> WireGuard</span>
            <span><span style={{color:"#e67e22"}}>--</span> Cloudflare</span>
            <span><span style={{color:"#a855f7"}}>--</span> Portainer cluster</span>
            <span><span style={{color:"#16a085"}}>--</span> Storage</span>
          </div>

          {activeNode && (
            <div style={{
              marginTop:12, padding: isMobile ? "8px 10px" : "12px 24px", background:"#0d1117",
              border:`2px solid ${activeNode.color}44`, borderRadius:6,
              color:activeNode.color, fontSize: isMobile ? 11 : 15, letterSpacing:1,
              maxWidth: isMobile ? "100%" : 600, textAlign:"center",
              width: isMobile ? "calc(100% - 16px)" : undefined,
              boxSizing:"border-box", wordWrap:"break-word", overflowWrap:"break-word",
              margin: isMobile ? "12px 8px 0" : undefined,
            }}>
              <div style={{ fontWeight:"bold", marginBottom:4 }}>{activeNode.icon} {activeNode.label} — {activeNode.ip}</div>
              {activeNode.note && <div style={{ color:"#dad7d7", lineHeight:1.7, fontSize: isMobile ? 10 : 12, wordWrap:"break-word", overflowWrap:"break-word" }}>{activeNode.note}</div>}
            </div>
          )}
          <div style={{ fontFamily:"'JetBrains Mono', monospace", color:"#ccc6c6", fontSize: isMobile ? 11 : 18, marginTop:8, letterSpacing:2, textAlign:"center" }}>
            {isMobile ? "tap any node for details" : "click any node for details"}
          </div>
        </>)}

        {/* ===================== FIREWALL TAB ===================== */}
        {tab === "firewall" && (
          <div style={{ width:"100%", maxWidth:820 }}>
            <div style={{ fontFamily:"'JetBrains Mono', monospace", color:"#f5f1f1", fontSize: isMobile ? 12 : 18, letterSpacing:2, marginBottom: isMobile ? 10 : 14, textAlign:"center" }}>OPNSENSE FIREWALL RULES</div>

            {isMobile ? (
              <div style={{ padding: "0 2px" }}>
                {firewallRules.map((r, i) => <FirewallCard key={i} rule={r} />)}
              </div>
            ) : (
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:16 }}>
                <thead>
                  <tr>{["IFACE","ACTION","PROTO","SOURCE","DESTINATION","DESCRIPTION"].map(h => (
                    <th key={h} style={{ padding:"8px 10px", borderBottom:"1px solid #f1f1f1", color:"#e85d00", textAlign:"left", letterSpacing:1 }}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {firewallRules.map((r,i) => (
                    <tr key={i} style={{ borderBottom:"1px solid #0a0d12" }}>
                      <td style={{ padding:"7px 10px", color:"#ccc" }}>{r.iface}</td>
                      <td style={{ padding:"7px 10px", color:r.action==="PASS" ? "#2ecc71" : "#e74c3c", fontWeight:"bold" }}>{r.action}</td>
                      <td style={{ padding:"7px 10px", color:"#aaa" }}>{r.proto}</td>
                      <td style={{ padding:"7px 10px", color:"#ccc", fontFamily:"monospace", fontSize:13 }}>{r.src}</td>
                      <td style={{ padding:"7px 10px", color:"#ccc", fontFamily:"monospace", fontSize:13 }}>{r.dst}</td>
                      <td style={{ padding:"7px 10px", color:"#ccc" }}>{r.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div style={{ marginTop: isMobile ? 10 : 14, padding: isMobile ? "10px 10px" : "16px 20px", background:"#0d1117", border:"2px solid #d8dadf", borderRadius:5, fontSize: isMobile ? 11 : 16, color:"#ffffff", lineHeight:1.9, textAlign:"center" }}>
              <span style={{color:"#e85d00"}}>⚠ NOTE: </span>WIP, high level view, I am no networking guru but I love networking!!
            </div>
          </div>
        )}

        {/* ===================== FLOWS TAB ===================== */}
        {tab === "flows" && (
          <div style={{ width:"100%", maxWidth:780 }}>
            <div style={{ fontFamily:"'JetBrains Mono', monospace", color:"#fafafa", fontSize: isMobile ? 12 : 18, letterSpacing:2, marginBottom: isMobile ? 10 : 14, textAlign:"center" }}>TRAFFIC FLOW MATRIX</div>

            {isMobile ? (
              <div style={{ padding: "0 2px" }}>
                {flows.map((f, i) => <FlowCardMobile key={i} flow={f} />)}
              </div>
            ) : (
              flows.map((f,i) => (
                <div key={i} style={{
                  display:"flex", alignItems:"center", gap:10,
                  padding:"11px 16px", marginBottom:6,
                  background:"#0d1117",
                  border:`1px solid ${f.ok ? "#2ecc7144" : "#e74c3c44"}`,
                  borderRadius:5, fontSize:15,
                }}>
                  <div style={{ color:"#fff", minWidth:200, fontFamily:"monospace" }}>{f.from}</div>
                  <div style={{ color:"#22d811" }}>→</div>
                  <div style={{ color:"#fff", flex:1, fontFamily:"monospace" }}>{f.to}</div>
                  <div style={{ color:f.ok ? "#2ecc71" : "#e74c3c", fontWeight:"bold", fontSize:16, minWidth:18 }}>{f.ok ? "✓" : "✗"}</div>
                  <div style={{ color:"#f3f3f3", fontSize:13, minWidth:240, textAlign:"right" }}>{f.note}</div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ===================== SSH TAB ===================== */}
        {tab === "SSH" && (
          <div style={{ width:"100%", maxWidth:800 }}>
            <svg
              viewBox="0 10 800 600"
              width="100%"
              style={{ overflow:"visible" }}
            >
              <defs>
                <marker id="sarrow-cyan"   markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#00d4ff"/></marker>
                <marker id="sarrow-green"  markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#00ff9d"/></marker>
                <marker id="sarrow-purple" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#a855f7"/></marker>
              </defs>

              {sshConnections.map((conn, i) => {
                const from = sshPositions[conn.from];
                const to   = sshPositions[conn.to];
                const arrowId = conn.color === "#00d4ff" ? "sarrow-cyan" : conn.color === "#00ff9d" ? "sarrow-green" : "sarrow-purple";
                const isActive = sshActive === conn.from || sshActive === conn.to;
                return (
                  <line key={i}
                    x1={from.x} y1={from.y+50} x2={to.x} y2={to.y-50}
                    stroke={isActive ? conn.color : conn.color+"44"}
                    strokeWidth={isActive ? 2 : 1}
                    strokeDasharray={conn.style === "dashed" ? "4 4" : "none"}
                    markerEnd={`url(#${arrowId})`}
                    style={{ transition:"all 0.2s" }}
                  />
                );
              })}

              <rect x={80} y={320} width={640} height={100} rx={4} fill="none" stroke="#e67d57d2" strokeDasharray="6 3" strokeWidth={1}/>
              <text x={80} y={315} fill="#ff6b3555" fontSize={12} fontFamily="'Courier New', monospace" letterSpacing={2}>PROXMOX CLUSTER</text>
              <rect x={1} y={480} width={798} height={100} rx={4} fill="none" stroke="#a955f7d8" strokeDasharray="6 3" strokeWidth={1}/>
              <text x={615} y={476} fill="#a955f7d8" fontSize={12} fontFamily="'Courier New', monospace" letterSpacing={2}>DOCKER COMPOSE NODES</text>

              {Object.values(sshNodes).map(node => {
                const pos = sshPositions[node.id];
                return <SshNode key={node.id} node={node} x={pos.x} y={pos.y} onClick={(id) => setSshActive(sshActive===id?null:id)} active={sshActive===node.id}/>;
              })}
            </svg>

            <div style={{ display:"flex", gap: isMobile ? 8 : 24, marginTop: isMobile ? 4 : -25, fontSize: isMobile ? 10 : 15, color:"#f3efef", letterSpacing:1, justifyContent:"center", flexWrap:"wrap" }}>
              <span><span style={{color:"#00d4ff"}}>--</span> SSH from laptop</span>
              <span><span style={{color:"#00ff9d"}}>--</span> DK01 gateway access</span>
              <span><span style={{color:"#a855f7"}}>--</span> Node → PVE (pubkey only)</span>
            </div>

            {sshActive && sshNodes[sshActive] && (
              <div style={{ marginTop: isMobile ? 10 : 24, padding: isMobile ? "10px 12px" : "24px 40px", background:"#0d1117", border:`1px solid ${sshNodes[sshActive].color}44`, borderRadius:6, color:sshNodes[sshActive].color, fontSize: isMobile ? 12 : 16, letterSpacing:1, textAlign:"center" }}>
                <div style={{ fontWeight:"bold", marginBottom:4 }}>{sshNodes[sshActive].label} - {sshNodes[sshActive].sublabel}</div>
                {sshNodes[sshActive].note && <div style={{ color:"#f3f3f3", marginTop:5 }}>{sshNodes[sshActive].note}</div>}
                {sshNodes[sshActive].canSSHtoPVE && <div style={{ color:"#a855f7", marginTop:4 }}>✦ Can SSH to both PVE hosts via pubkey</div>}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}