# Device research log

Research was done from a sandbox. se.com and download.schneider-electric.com return HTTP 403 (Akamai access denied)
to plain curl, a browser user agent and the fetch tool. The Wayback availability API returned no snapshots for the
PM5350, PM5110 or PM5000 range pages.

| Device | Source read | What was confirmed | Not verified |
| --- | --- | --- | --- |
| Schneider Electric PowerLogic PM5350 | None readable | Name only (from the task brief) | Variant, interfaces, protocols, register map, product URL contents |
| Schneider Electric PowerLogic PM5110 | None readable | Name only (from the task brief) | Same as above. The PM5000 family does not share one register map |
| Moxa MGate MB3170 / MB3270 | [Moxa product page](https://www.moxa.com/en/products/industrial-edge-connectivity/protocol-gateways/modbus-tcp-gateways/mgate-mb3170-mb3270-series) | 1-port and 2-port gateways, convert Modbus TCP, ASCII and RTU, 10/100BaseT(X), DIN-rail, listed Not Recommended for New Design | Serial electrical standard (not in extracted text) |
| Waveshare RS485 TO ETH (B) | [Waveshare wiki](https://www.waveshare.com/wiki/RS485_TO_ETH_(B)) | RS485 + Ethernet, Modbus TCP to RTU gateway, MQTT gateway, rail-mount plastic case | Register map not applicable |
| WAGO PFC100 750-8101 | [WAGO product page](https://www.wago.com/global/plcs/compact-controller-pfc100/p/750-8101) | Item no. 750-8101, "Controller PFC100; 2 x ETHERNET" | Protocols, serial ports |

Attempted and failed: Mouser (no matching content), Allied Electric (redirect then 403), Phoenix Contact (403),
AutomationDirect (login redirect), Siemens not attempted.

## 3D assets

Sketchfab API search found CC Attribution S7-1200 models, but downloads need authentication, so no GLB was added.
See `public/models/ATTRIBUTION.md`.

## Follow-up for a reviewer with browser access

Open the PM5350 and PM5110 product pages and the Schneider manuals, then fill in variant, interfaces, protocols and
register map status in `src/lib/devices/catalogue.ts` and update this file. Keep each variant separate.
