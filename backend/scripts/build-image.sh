#!/usr/bin/env bash
#
# Build the StartHere API container image and tag it with the current commit.
#
#   ./scripts/build-image.sh              # build locally
#   ./scripts/build-image.sh --push       # build, log in to ECR, and push
#   ./scripts/build-image.sh --help
#
set -euo pipefail

IMAGE_REPO="${IMAGE_REPO:-239714841352.dkr.ecr.us-west-2.amazonaws.com/starthere}"
PLATFORM="${PLATFORM:-linux/amd64}"
DOCKERFILE="${DOCKERFILE:-Dockerfile}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"

PUSH=0
for arg in "$@"; do
  case "$arg" in
    --push) PUSH=1 ;;
    -h | --help)
      cat <<'USAGE'
Build the StartHere API container image and tag it with the current commit.

  ./scripts/build-image.sh              # build locally
  ./scripts/build-image.sh --push       # build, log in to ECR, and push
  ./scripts/build-image.sh --help

Environment overrides:
  IMAGE_REPO   registry/repository  (default: 239714841352.dkr.ecr.us-west-2.amazonaws.com/starthere)
  PLATFORM     build target         (default: linux/amd64)
  ECR_REGION   AWS region for login (default: parsed from IMAGE_REPO)
USAGE
      exit 0
      ;;
    *)
      echo "Unknown argument: $arg (try --help)" >&2
      exit 2
      ;;
  esac
done

if ! git -C "$BACKEND_DIR" rev-parse --git-dir >/dev/null 2>&1; then
  echo "Not inside a git repository: $BACKEND_DIR" >&2
  exit 1
fi

GIT_SHA="$(git -C "$BACKEND_DIR" rev-parse --short=12 HEAD)"

# A dirty tree cannot be reproduced from the commit, so say so in the tag
# instead of publishing an image that claims to be a clean checkout.
if [ -n "$(git -C "$BACKEND_DIR" status --porcelain --untracked-files=normal -- .)" ]; then
  TAG="${GIT_SHA}-dirty"
  echo "Warning: backend has uncommitted changes; tagging as $TAG" >&2
else
  TAG="$GIT_SHA"
fi

TAGS=("$IMAGE_REPO:$TAG" "$IMAGE_REPO:latest")

BUILD_ARGS=(
  --platform "$PLATFORM"
  --file "$BACKEND_DIR/$DOCKERFILE"
  --label "org.opencontainers.image.revision=$GIT_SHA"
  --label "org.opencontainers.image.source=starthere/backend"
)
for tag in "${TAGS[@]}"; do
  BUILD_ARGS+=(--tag "$tag")
done

echo "Building $IMAGE_REPO:$TAG for $PLATFORM"
cd "$BACKEND_DIR"

if docker buildx version >/dev/null 2>&1; then
  docker buildx build --load "${BUILD_ARGS[@]}" .
else
  docker build "${BUILD_ARGS[@]}" .
fi

echo
echo "Built:"
printf '  %s\n' "${TAGS[@]}"

if [ "$PUSH" -eq 1 ]; then
  REGISTRY="${IMAGE_REPO%%/*}"
  ECR_REGION="${ECR_REGION:-$(sed -n 's/.*\.dkr\.ecr\.\([a-z0-9-]*\)\.amazonaws\.com.*/\1/p' <<<"$REGISTRY")}"

  echo
  echo "Logging in to $REGISTRY ($ECR_REGION)"
  aws ecr get-login-password --region "$ECR_REGION" |
    docker login --username AWS --password-stdin "$REGISTRY"

  for tag in "${TAGS[@]}"; do
    echo "Pushing $tag"
    docker push "$tag"
  done
fi
