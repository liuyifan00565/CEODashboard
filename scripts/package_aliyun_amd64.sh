#!/usr/bin/env bash
# 更新时间: 2026-07-10 17:20:00 CST
# 更新内容: 新增阿里云 AMD64 生产镜像交付包脚本，支持运行时 .env 密钥校验、镜像导出、install/update 脚本生成。

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ARTIFACT_ROOT="$ROOT_DIR/deploy_artifacts"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
PACKAGE_NAME="ceodashboard-aliyun-amd64-$TIMESTAMP"
WORK_DIR="$ARTIFACT_ROOT/$PACKAGE_NAME"
IMAGE_REPO="${IMAGE_REPO:-ceodashboard-cockpit}"
IMAGE_TAG="${IMAGE_TAG:-amd64}"
IMAGE_NAME="$IMAGE_REPO:$IMAGE_TAG"
PLATFORM="${PLATFORM:-linux/amd64}"
INCLUDE_ENV=0
SKIP_BUILD=0
ENV_FILE="$ROOT_DIR/cockpit/.env.local"

usage() {
  cat <<'USAGE'
Usage:
  bash scripts/package_aliyun_amd64.sh [options]

Options:
  --include-env          Copy a runtime env file into the package after validation.
  --env-file PATH        Runtime env file to use with --include-env. Defaults to cockpit/.env.local.
  --skip-build           Reuse an existing ceodashboard-cockpit:amd64 local image.
  -h, --help             Show this help.

Examples:
  bash scripts/package_aliyun_amd64.sh
  bash scripts/package_aliyun_amd64.sh --include-env --env-file /c/Users/22720/Desktop/.env.local
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --include-env)
      INCLUDE_ENV=1
      shift
      ;;
    --env-file)
      if [[ $# -lt 2 ]]; then
        echo "Missing value for --env-file" >&2
        exit 1
      fi
      ENV_FILE="$2"
      shift 2
      ;;
    --skip-build)
      SKIP_BUILD=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

require_file() {
  local file="$1"
  if [[ ! -f "$file" ]]; then
    echo "Required file missing: $file" >&2
    exit 1
  fi
}

env_value() {
  local file="$1"
  local key="$2"
  awk -v key="$key" '
    BEGIN { FS = "=" }
    $0 ~ "^[[:space:]]*#" { next }
    $1 == key {
      sub(/^[^=]*=/, "")
      gsub(/\r$/, "")
      print
      exit
    }
  ' "$file"
}

env_has_value() {
  local file="$1"
  local key="$2"
  local value
  value="$(env_value "$file" "$key" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')"
  [[ -n "$value" ]]
}

set_env_value() {
  local file="$1"
  local key="$2"
  local value="$3"
  local tmp
  tmp="$(mktemp)"
  awk -v key="$key" -v value="$value" '
    BEGIN { done = 0 }
    $0 ~ "^[[:space:]]*" key "[[:space:]]*=" && done == 0 {
      print key "=" value
      done = 1
      next
    }
    { print }
    END {
      if (done == 0) print key "=" value
    }
  ' "$file" > "$tmp"
  mv "$tmp" "$file"
}

write_env_example() {
  local file="$1"
  cat > "$file" <<'ENV'
# 更新时间: 2026-07-10 17:20:00 CST
# 更新内容: 阿里云 AMD64 运行时环境变量示例；真实密钥只写服务器 .env，不写源码。

DB_HOST=db
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=change-this-mysql-password
DB_NAME=ceo_dashboard
PORT=5174
COCKPIT_PORT=5174

DASHSCOPE_API_KEY=
DASHSCOPE_MODEL=qwen3.7-max-2026-05-20
DASHSCOPE_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
DASHSCOPE_ENABLE_THINKING=false

COMPUTE_API_BASE_URL=
COMPUTE_API_TOKEN=
COMPUTE_PLATFORM_BOARD_PATH=/api/v1/customer-management/getPlatformBoard
COMPUTE_CUSTOMER_BOARD_PATH=/api/v1/customer-management/getCustomerBoardList
ENV
}

normalize_server_env() {
  local file="$1"
  set_env_value "$file" "DB_HOST" "db"
  set_env_value "$file" "DB_PORT" "3306"
  set_env_value "$file" "PORT" "5174"
  set_env_value "$file" "COCKPIT_PORT" "5174"

  if ! env_has_value "$file" "DB_USERNAME"; then
    set_env_value "$file" "DB_USERNAME" "root"
  fi
  if ! env_has_value "$file" "DB_NAME"; then
    set_env_value "$file" "DB_NAME" "ceo_dashboard"
  fi
  if ! env_has_value "$file" "DASHSCOPE_MODEL"; then
    set_env_value "$file" "DASHSCOPE_MODEL" "qwen3.7-max-2026-05-20"
  fi
  if ! env_has_value "$file" "DASHSCOPE_BASE_URL"; then
    set_env_value "$file" "DASHSCOPE_BASE_URL" "https://dashscope.aliyuncs.com/compatible-mode/v1"
  fi
  if ! env_has_value "$file" "DASHSCOPE_ENABLE_THINKING"; then
    set_env_value "$file" "DASHSCOPE_ENABLE_THINKING" "false"
  fi
  if ! env_has_value "$file" "COMPUTE_PLATFORM_BOARD_PATH"; then
    set_env_value "$file" "COMPUTE_PLATFORM_BOARD_PATH" "/api/v1/customer-management/getPlatformBoard"
  fi
  if ! env_has_value "$file" "COMPUTE_CUSTOMER_BOARD_PATH"; then
    set_env_value "$file" "COMPUTE_CUSTOMER_BOARD_PATH" "/api/v1/customer-management/getCustomerBoardList"
  fi
}

validate_env_file() {
  local file="$1"
  local missing=()
  local required_keys=(DB_HOST DB_PORT DB_USERNAME DB_PASSWORD DB_NAME DASHSCOPE_API_KEY)

  for key in "${required_keys[@]}"; do
    if ! env_has_value "$file" "$key"; then
      missing+=("$key")
    fi
  done

  if [[ ${#missing[@]} -gt 0 ]]; then
    echo "Runtime env validation failed. Empty required keys: ${missing[*]}" >&2
    echo "Do not commit secrets; fill them in the source env file or server .env before packaging with --include-env." >&2
    exit 1
  fi

  local compute_base_set=0
  local compute_token_set=0
  env_has_value "$file" "COMPUTE_API_BASE_URL" && compute_base_set=1
  env_has_value "$file" "COMPUTE_API_TOKEN" && compute_token_set=1
  if [[ "$compute_base_set" -ne "$compute_token_set" ]]; then
    echo "Runtime env validation failed. COMPUTE_API_BASE_URL and COMPUTE_API_TOKEN must be set together or both left empty." >&2
    exit 1
  fi

  echo "Runtime env validation:"
  for key in DB_HOST DB_PORT DB_USERNAME DB_PASSWORD DB_NAME DASHSCOPE_API_KEY COMPUTE_API_BASE_URL COMPUTE_API_TOKEN; do
    if env_has_value "$file" "$key"; then
      echo "  $key=SET"
    else
      echo "  $key=EMPTY"
    fi
  done
}

write_server_script() {
  local target="$1"
  local mode="$2"
  cat > "$target" <<SCRIPT
#!/usr/bin/env bash
# 更新时间: 2026-07-10 17:20:00 CST
# 更新内容: 阿里云 AMD64 ${mode}脚本，加载镜像并通过 docker compose 启动 CEO Dashboard。

set -euo pipefail

DEPLOY_DIR="\${1:-/opt/ceodashboard}"
PACKAGE_DIR="\$(cd "\$(dirname "\${BASH_SOURCE[0]}")" && pwd)"

compose() {
  if docker compose version >/dev/null 2>&1; then
    docker compose "\$@"
  else
    docker-compose "\$@"
  fi
}

load_images() {
  if [[ ! -d "\$PACKAGE_DIR/images" ]]; then
    echo "Missing images directory: \$PACKAGE_DIR/images" >&2
    exit 1
  fi
  shopt -s nullglob
  local image
  for image in "\$PACKAGE_DIR"/images/*.tar.gz "\$PACKAGE_DIR"/images/*.tar; do
    echo "Loading image: \$(basename "\$image")"
    case "\$image" in
      *.tar.gz) gzip -dc "\$image" | docker load ;;
      *.tar) docker load -i "\$image" ;;
    esac
  done
}

copy_runtime_files() {
  mkdir -p "\$DEPLOY_DIR/docker/db-init"
  cp "\$PACKAGE_DIR/docker-compose.yml" "\$DEPLOY_DIR/docker-compose.yml"
  cp "\$PACKAGE_DIR/.env.example" "\$DEPLOY_DIR/.env.example"
  cp "\$PACKAGE_DIR/docker/db-init/ceo_dashboard_full.sql" "\$DEPLOY_DIR/docker/db-init/ceo_dashboard_full.sql"

  if [[ -f "\$PACKAGE_DIR/.env" ]]; then
    if [[ -f "\$DEPLOY_DIR/.env" ]]; then
      cp "\$DEPLOY_DIR/.env" "\$DEPLOY_DIR/.env.backup-\$(date +%Y%m%d-%H%M%S)"
    fi
    cp "\$PACKAGE_DIR/.env" "\$DEPLOY_DIR/.env"
  elif [[ ! -f "\$DEPLOY_DIR/.env" ]]; then
    cp "\$PACKAGE_DIR/.env.example" "\$DEPLOY_DIR/.env"
    echo "Created \$DEPLOY_DIR/.env from .env.example. Edit it before exposing bi.freecallai.cn."
  fi
}

load_images
copy_runtime_files
cd "\$DEPLOY_DIR"
compose -f docker-compose.yml up -d
compose -f docker-compose.yml ps
SCRIPT
  chmod +x "$target"
}

require_file "$ROOT_DIR/cockpit/Dockerfile.prod"
require_file "$ROOT_DIR/docker-compose.aliyun.yml"
require_file "$ROOT_DIR/docker/db-init/ceo_dashboard_full.sql"

rm -rf "$WORK_DIR"
mkdir -p "$WORK_DIR/images" "$WORK_DIR/docker/db-init"

if [[ "$INCLUDE_ENV" -eq 1 ]]; then
  require_file "$ENV_FILE"
  sed 's/\r$//' "$ENV_FILE" > "$WORK_DIR/.env"
  normalize_server_env "$WORK_DIR/.env"
  validate_env_file "$WORK_DIR/.env"
fi

if [[ "$SKIP_BUILD" -eq 0 ]]; then
  docker buildx build \
    --platform "$PLATFORM" \
    -f "$ROOT_DIR/cockpit/Dockerfile.prod" \
    -t "$IMAGE_NAME" \
    --load \
    "$ROOT_DIR/cockpit"
fi

IMAGE_TAR_NAME="${IMAGE_REPO//\//_}-$IMAGE_TAG.tar.gz"
docker save "$IMAGE_NAME" | gzip -c > "$WORK_DIR/images/$IMAGE_TAR_NAME"

cp "$ROOT_DIR/docker-compose.aliyun.yml" "$WORK_DIR/docker-compose.yml"
cp "$ROOT_DIR/docker-compose.aliyun.yml" "$WORK_DIR/docker-compose.aliyun.yml"
cp "$ROOT_DIR/docker/db-init/ceo_dashboard_full.sql" "$WORK_DIR/docker/db-init/ceo_dashboard_full.sql"
write_env_example "$WORK_DIR/.env.example"

write_server_script "$WORK_DIR/install.sh" "首次安装"
write_server_script "$WORK_DIR/update.sh" "更新"

(
  cd "$ARTIFACT_ROOT"
  tar -czf "$PACKAGE_NAME.tar.gz" "$PACKAGE_NAME"
)

echo "Package created:"
echo "  $WORK_DIR"
echo "  $ARTIFACT_ROOT/$PACKAGE_NAME.tar.gz"
