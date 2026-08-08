# Provider Implementation Guide

The repo ships with working local fallbacks and intentionally isolated premium-provider stubs.

To enable a premium provider:

1. Implement its adapter under `src/studio/adapters/`.
2. Add its required environment variables to `.env`.
3. Set `enabled: true` in `config/providers.json`.
4. Keep the return value as a local generated media path.
5. Register generated assets in the project's asset manifest.

This keeps vendor API changes away from the rendering architecture.
