# Prueba Tecnica Geeks Castle - Backend

API construida con NestJS, TypeScript, Firebase Firestore y Google Cloud Pub/Sub. El proyecto sigue una arquitectura hexagonal basada en DDD para separar dominio, aplicacion, infraestructura y presentacion.

## Requisitos

- Node.js 22 o superior
- pnpm
- Proyecto en Google Cloud/Firebase
- Firestore habilitado
- Cloud Pub/Sub habilitado
- Service Account con permisos para Firestore y Pub/Sub

## Instalacion

```bash
pnpm install
```

## Variables de entorno

Crea un archivo `.env` en la raiz del proyecto. Puedes tomar como base `.env.template`.

```env
PORT=3000
FIREBASE_PROJECT_ID=tu-project-id
GOOGLE_CLOUD_PROJECT_ID=tu-project-id
GOOGLE_APPLICATION_CREDENTIALS=/ruta/absoluta/service-account.json
PUBSUB_USER_CREATED_TOPIC=users.created
PUBSUB_USER_CREATED_SUBSCRIPTION=users.created.password-generator
```

Descripcion:

| Variable                           | Uso                                                                                                |
| ---------------------------------- | -------------------------------------------------------------------------------------------------- |
| `PORT`                             | Puerto donde levanta la API. Si no se define, usa `3000`.                                          |
| `FIREBASE_PROJECT_ID`              | ID del proyecto Firebase usado por Firebase Admin SDK para Firestore.                              |
| `GOOGLE_CLOUD_PROJECT_ID`          | ID del proyecto Google Cloud usado por Pub/Sub. Normalmente es el mismo que `FIREBASE_PROJECT_ID`. |
| `GOOGLE_APPLICATION_CREDENTIALS`   | Ruta absoluta al JSON de la Service Account.                                                       |
| `PUBSUB_USER_CREATED_TOPIC`        | Topic donde la API publica el evento de usuario creado.                                            |
| `PUBSUB_USER_CREATED_SUBSCRIPTION` | Suscripcion Pull que consume el servicio para generar y actualizar el password.                    |

## Recursos requeridos en GCP

### 1. Crear o seleccionar un proyecto

Usa el `Project ID`, no el nombre visible del proyecto. Ese valor debe coincidir con:

```env
FIREBASE_PROJECT_ID=
GOOGLE_CLOUD_PROJECT_ID=
```

### 2. Habilitar Firestore

En Firebase Console o Google Cloud Console:

- Crea la base de datos de Firestore.
- Usa modo Native.
- Selecciona una region.

La coleccion `users` no se crea manualmente; Firestore la crea cuando se inserta el primer usuario.

### 3. Crear Service Account

Puedes crearla desde:

- Google Cloud Console > IAM & Admin > Service Accounts
- o Firebase Console > Project settings > Service accounts

Descarga una llave en formato JSON y configura:

```env
GOOGLE_APPLICATION_CREDENTIALS=/ruta/absoluta/service-account.json
```

Permisos minimos recomendados para la Service Account:

- `Cloud Datastore User`
- `Pub/Sub Publisher`
- `Pub/Sub Subscriber`

Para desarrollo, tambien puedes usar permisos mas amplios temporalmente, pero no es recomendable para produccion.

### 4. Crear Topic y Subscription en Pub/Sub

Con `gcloud`:

```bash
gcloud config set project tu-project-id

gcloud pubsub topics create users.created

gcloud pubsub subscriptions create users.created.password-generator \
  --topic=users.created
```

La suscripcion debe ser de tipo **Pull**. En la consola web aparece como **Extraccion**.

## Pruebas en modo emulador

Puedes probar el flujo sin usar recursos reales de GCP usando los emuladores de Firebase y Pub/Sub.

### Requisitos para emuladores

- Firebase CLI
- Google Cloud CLI (`gcloud`)

Instalar Firebase CLI:

```bash
npm install -g firebase-tools
```

Verificar Google Cloud CLI:

```bash
gcloud --version
```

### Inicializar emuladores

Ejecuta:

```bash
firebase init emulators
```

Cuando Firebase pregunte que emuladores quieres configurar, selecciona:

```txt
Firestore Emulator
Pub/Sub Emulator
```

En la pantalla interactiva se seleccionan con `Space` y se confirma con `Enter`.

Puertos recomendados:

```txt
Firestore: 8080
Pub/Sub: 8085
Emulator UI: 4000
```

### Levantar emuladores

```bash
firebase emulators:start --only firestore,pubsub
```

Firestore quedara disponible en:

```txt
127.0.0.1:8080
```

Pub/Sub quedara disponible en:

```txt
127.0.0.1:8085
```

### Variables de entorno para emuladores

Para correr NestJS directamente en tu maquina, usa:

```env
PORT=3000

FIREBASE_PROJECT_ID=demo-geeks-castle
GOOGLE_CLOUD_PROJECT_ID=demo-geeks-castle

FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
PUBSUB_EMULATOR_HOST=127.0.0.1:8085

PUBSUB_USER_CREATED_TOPIC=users.created
PUBSUB_USER_CREATED_SUBSCRIPTION=users.created.password-generator
```

En modo emulador no necesitas `GOOGLE_APPLICATION_CREDENTIALS`.

Si corres la API dentro de Docker y los emuladores estan en tu maquina host, usa:

```env
FIRESTORE_EMULATOR_HOST=host.docker.internal:8080
PUBSUB_EMULATOR_HOST=host.docker.internal:8085
```

### Crear topic y subscription en el emulador

Los recursos del emulador no se comparten con GCP real. Debes crear el topic y la subscription dentro del emulador.

Con el emulador de Pub/Sub corriendo, ejecuta:

```bash
curl -X PUT \
  http://127.0.0.1:8085/v1/projects/demo-geeks-castle/topics/users.created
```

Luego crea la subscription:

```bash
curl -X PUT \
  http://127.0.0.1:8085/v1/projects/demo-geeks-castle/subscriptions/users.created.password-generator \
  -H "Content-Type: application/json" \
  -d '{"topic":"projects/demo-geeks-castle/topics/users.created"}'
```

Verificar topics:

```bash
curl http://127.0.0.1:8085/v1/projects/demo-geeks-castle/topics
```

Verificar subscriptions:

```bash
curl http://127.0.0.1:8085/v1/projects/demo-geeks-castle/subscriptions
```

### Levantar la API contra emuladores

Con los emuladores activos y las variables de entorno configuradas:

```bash
pnpm run start:dev
```

El endpoint sigue siendo:

```txt
POST http://localhost:3000/api/v1/users
```

## Levantar el proyecto

Modo desarrollo:

```bash
pnpm run start:dev
```

Modo produccion local:

```bash
pnpm run build
pnpm run start:prod
```

## Levantar con Docker

El proyecto incluye `Dockerfile`, `docker-compose.yml` y `Makefile`.

Antes de levantar con Docker:

1. Crea el archivo `.env` en la raiz del proyecto.
2. Guarda el JSON de la Service Account en:

```txt
.keys/key.json
```

El `docker-compose.yml` monta esa carpeta dentro del contenedor y configura:

```env
GOOGLE_APPLICATION_CREDENTIALS=/app/.keys/key.json
PORT=3000
```

Construir la imagen:

```bash
make build
```

Levantar el servicio:

```bash
make up
```

Construir y levantar en un solo paso:

```bash
make up-build
```

Ver logs:

```bash
make logs
```

Detener los contenedores:

```bash
make down
```

La API queda disponible en:

```txt
http://localhost:3000
```

## Endpoints

La API usa prefijo global:

```txt
/api/v1
```

Crear usuario:

```http
POST /api/v1/users
```

Body:

```json
{
  "username": "rafaelarias",
  "email": "rafael.arias@example.com",
  "password": "SecurePass123!"
}
```

El campo `password` es opcional. Si no se envia:

1. Se crea el usuario en Firestore sin password.
2. Se publica un evento en Cloud Pub/Sub.
3. El subscriber consume el evento.
4. Se genera un password seguro.
5. El password se hashea con bcrypt.
6. Se actualiza el usuario en Firestore.

Si se envia password, se guarda hasheado con bcrypt desde la creacion.

## Swagger

La documentacion Swagger esta disponible en:

```txt
http://localhost:3000/docs
```

## Validaciones principales

- `username` es requerido.
- `email` debe tener formato valido.
- `password`, si se envia, debe tener minimo 8 caracteres.
- No se permite registrar dos usuarios con el mismo `username`.
- No se permite registrar dos usuarios con el mismo `email`.

## Scripts utiles

```bash
pnpm run lint
pnpm test
pnpm exec tsc --noEmit
```

## Notas de arquitectura

- `domain`: entidades, eventos, contratos y reglas independientes de frameworks.
- `application`: casos de uso y handlers de aplicacion.
- `infrastructure`: adaptadores concretos para Firestore, Pub/Sub, bcrypt y generacion segura de password.
- `presentation`: controllers HTTP, DTOs y responses.
- `shared/https`: filtro global de excepciones e interceptor global de respuestas.
