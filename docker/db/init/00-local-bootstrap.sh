#!/usr/bin/env bash
set -euo pipefail

psql \
  --username supabase_admin \
  --dbname "${POSTGRES_DB:-postgres}" \
  --set ON_ERROR_STOP=1 \
  --set postgres_password="${POSTGRES_PASSWORD}" \
  --set jwt_secret="${JWT_SECRET}" \
  --set jwt_exp="${JWT_EXP:-3600}" \
  --file /etc/squadlink/bootstrap.sql
