#!/bin/bash

set -e

# ============================================================
# CONFIGURACIÓN DEL PROYECTO
# ============================================================

PROJECT_ID="prueba-tecnia-30e3f"

# Cambia estos valores según tu configuración
REGION="southamerica-east1"
ARTIFACT_REPOSITORY="nestjs-prueba"
IMAGE_NAME="geeks-castle-api"
CLOUD_RUN_SERVICE="api"

# Tag de la imagen
IMAGE_TAG="latest"

# Ruta completa de la imagen en Artifact Registry
IMAGE_URI="${REGION}-docker.pkg.dev/${PROJECT_ID}/${ARTIFACT_REPOSITORY}/${IMAGE_NAME}:${IMAGE_TAG}"


# ============================================================
# VARIABLES DE ENTORNO DE LA APLICACIÓN
# ============================================================

FIREBASE_PROJECT_ID="prueba-tecnia-30e3f"
GOOGLE_CLOUD_PROJECT_ID="prueba-tecnia-30e3f"

PUBSUB_USER_CREATED_TOPIC="users.created"
PUBSUB_USER_CREATED_SUBSCRIPTION="users.created.password-generator"


# ============================================================
# CONFIGURAR PROYECTO DE GCP
# ============================================================

echo "=========================================="
echo "Configurando proyecto de GCP..."
echo "=========================================="

gcloud config set project "${PROJECT_ID}"


# ============================================================
# CONFIGURAR DOCKER PARA ARTIFACT REGISTRY
# ============================================================

echo "=========================================="
echo "Configurando Docker para Artifact Registry..."
echo "=========================================="

gcloud auth configure-docker \
  "${REGION}-docker.pkg.dev" \
  --quiet


# ============================================================
# CONSTRUIR IMAGEN
# ============================================================

echo "=========================================="
echo "Construyendo imagen Docker..."
echo "=========================================="

docker build \
  --platform linux/amd64 \
  -t "${IMAGE_URI}" \
  .


# ============================================================
# SUBIR IMAGEN A ARTIFACT REGISTRY
# ============================================================

echo "=========================================="
echo "Subiendo imagen a Artifact Registry..."
echo "=========================================="

docker push "${IMAGE_URI}"


# ============================================================
# DESPLEGAR EN CLOUD RUN
# ============================================================

echo "=========================================="
echo "Desplegando en Cloud Run..."
echo "=========================================="

gcloud run deploy "${CLOUD_RUN_SERVICE}" \
  --image "${IMAGE_URI}" \
  --region "${REGION}" \
  --platform managed \
  --set-env-vars "FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID},GOOGLE_CLOUD_PROJECT_ID=${GOOGLE_CLOUD_PROJECT_ID},PUBSUB_USER_CREATED_TOPIC=${PUBSUB_USER_CREATED_TOPIC},PUBSUB_USER_CREATED_SUBSCRIPTION=${PUBSUB_USER_CREATED_SUBSCRIPTION}"


# ============================================================
# FINALIZADO
# ============================================================

echo ""
echo "=========================================="
echo "Deploy completado correctamente"
echo "=========================================="

gcloud run services describe "${CLOUD_RUN_SERVICE}" \
  --region "${REGION}" \
  --format="value(status.url)"