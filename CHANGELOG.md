# Changelog

## [1.0.14]

### Added
- New `kycRequiredFieldErrors` SDK event emitted when additional customer KYC information is required.
- Event payload includes a list of missing or invalid customer fields that must be completed before continuing the payment flow.

### Changed
- Payment flow now pauses automatically when required KYC fields are detected. If you close the session, you cannot resume the payment flow.

