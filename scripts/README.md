# DS Photo Application Scripts

This directory contains essential scripts for deploying and maintaining the DS Photo application.

## Deployment Scripts

Located in `scripts/deployment/`:

-   **deploy-all.sh**: Unified deployment script that handles both frontend and backend deployment, with CORS fixes. Provides options to deploy components selectively.

    -   Usage: `./deploy-all.sh`
    -   Options: Choose to deploy frontend only, backend only, CORS fixes only, or all components.

-   **build-for-filezilla.sh**: Prepares the frontend build for manual upload using FileZilla.
    -   Usage: `./build-for-filezilla.sh`
    -   Output: Creates a `build-for-upload` directory with the production-ready frontend build.

## Maintenance Scripts

Located in `scripts/maintenance/`:

-   **fix-duplicate-cors.sh**: Updates Nginx configuration to properly handle CORS headers, fixing duplicated headers issue.

    -   Usage: `./fix-duplicate-cors.sh`

-   **api-restart.sh**: Restarts the backend API service on the server.
    -   Usage: `./api-restart.sh`

## Usage Guidelines

1. Make sure all scripts are executable:

    ```
    chmod +x scripts/deployment/*.sh scripts/maintenance/*.sh
    ```

2. For EC2 deployment, ensure you have:

    - SSH access configured
    - The correct PEM file in the parent directory
    - Correct permissions on the PEM file (chmod 400)

3. For manual FileZilla deployment:
    - Run `./scripts/deployment/build-for-filezilla.sh`
    - Upload files from `build-for-upload/` to your server
