# Backend contracts (UNKNOWN / REQUIRED)

The frontend does not call any backend for device data. Everything on screen
comes from `SimulationDataSource` and is labeled synthetic. `BackendDataSource`
in `src/lib/data/adapter.ts` is a stub that returns `unavailable` and performs
no requests.

Status of each item below: **UNKNOWN** means no endpoint exists or has been
confirmed. **REQUIRED** means the UI needs it before it can show real data.

| Need | Status | Contract type | Notes |
| --- | --- | --- | --- |
| List devices with identity (manufacturer, model, firmware, serial) | UNKNOWN, REQUIRED | `DeviceIdentity` | Fields are nullable until the backend supplies them. |
| Connection state per device | UNKNOWN, REQUIRED | `ConnectionState` | |
| Raw frames (hex, slave, function, register, CRC expected and computed) | UNKNOWN, REQUIRED | `RawFrame` | Needed for any frame inspector. |
| Decoded readings with unit, source and decoder | UNKNOWN, REQUIRED | `TelemetryReading` | `simulated` must be false only for real data. |
| Provenance per event (sequence, source frame, schema version, hash) | UNKNOWN, REQUIRED | `ProvenanceRecord` | UI shows `verified-by-backend` only if the backend states it. |
| MCP tool catalogue | UNKNOWN, REQUIRED | `McpToolInfo` | Tools are shown as planned until a catalogue exists. |
| Agent activity feed | UNKNOWN, REQUIRED | `AgentActivity` | No call counts are shown without this. |
| Transport (poll, SSE, WebSocket), auth, pagination | UNKNOWN | n/a | To be decided with the backend owners. |

Types live in `src/lib/data/contracts.ts`. Every fetch state is expressed as
`DataSourceState<T>`: `loading`, `ready`, `empty`, `error` or `unavailable`.
