## v1.0.16

# ⚠️ Breaking Changes

Removal of environment option

The environment option has been removed from the SDK configuration.

You must now explicitly provide the full service endpoint using baseUrl.

This change removes implicit environment switching and gives integrators full control over the endpoint being used.