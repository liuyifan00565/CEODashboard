#!/usr/bin/env bash
# 更新时间: 2026-07-14 16:30:00 CST
# 更新内容: 阿里云交付包使用仅包含公司级月度回款事实表的迁移。
# 更新时间: 2026-07-14 13:05:00 CST
# 更新内容: 阿里云交付包新增自营收入订单级事实表迁移，用于承接真实 Excel 收入明细。

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ARTIFACT_ROOT="$ROOT_DIR/deploy_artifacts"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
PACKAGE_NAME="ceodashboard-aliyun-amd64-deploy-$TIMESTAMP"
WORK_DIR="$ARTIFACT_ROOT/$PACKAGE_NAME"
IMAGE_REPO="${IMAGE_REPO:-ceodashboard-cockpit}"
IMAGE_TAG="${IMAGE_TAG:-aliyun-amd64-$TIMESTAMP}"
IMAGE_NAME="$IMAGE_REPO:$IMAGE_TAG"
MYSQL_IMAGE="${MYSQL_IMAGE:-mysql:8.4}"
PLATFORM="${PLATFORM:-linux/amd64}"
INCLUDE_ENV=1
SKIP_BUILD=0
ENV_FILE="$ROOT_DIR/cockpit/.env.local"

usage() {
  cat <<'USAGE'
Usage:
  bash scripts/package_aliyun_amd64.sh [options]

Options:
  --include-env          Copy a runtime env file into the package after validation. This is the default.
  --without-env          Do not package .env; install.sh will stop after creating .env.example.
  --env-file PATH        Runtime env file to package. Defaults to cockpit/.env.local.
  --skip-build           Reuse an existing ceodashboard-cockpit image with the requested tag.
  -h, --help             Show this help.

Examples:
  bash scripts/package_aliyun_amd64.sh
  bash scripts/package_aliyun_amd64.sh --include-env --env-file /c/Users/22720/Desktop/.env.local
  bash scripts/package_aliyun_amd64.sh --without-env
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --include-env)
      INCLUDE_ENV=1
      shift
      ;;
    --without-env)
      INCLUDE_ENV=0
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
    {
      rawKey = $1
      gsub(/^[[:space:]]+|[[:space:]]+$/, "", rawKey)
    }
    rawKey == key {
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
# 更新时间: 2026-07-10 17:20:59 CST
# 更新内容: 阿里云 AMD64 运行时环境变量示例，增加 APP_IMAGE_TAG 占位；真实密钥只写服务器 .env，不写源码。

DB_HOST=db
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=change-this-mysql-password
DB_NAME=ceo_dashboard
PORT=5174
COCKPIT_PORT=5174
APP_IMAGE_REPO=ceodashboard-cockpit
APP_IMAGE_TAG=replace-with-package-image-tag

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
  set_env_value "$file" "APP_IMAGE_REPO" "$IMAGE_REPO"
  set_env_value "$file" "APP_IMAGE_TAG" "$IMAGE_TAG"

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
  local required_keys=(DB_HOST DB_PORT DB_USERNAME DB_PASSWORD DB_NAME DASHSCOPE_API_KEY APP_IMAGE_REPO APP_IMAGE_TAG)

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
  for key in DB_HOST DB_PORT DB_USERNAME DB_PASSWORD DB_NAME DASHSCOPE_API_KEY COMPUTE_API_BASE_URL COMPUTE_API_TOKEN APP_IMAGE_REPO APP_IMAGE_TAG; do
    if env_has_value "$file" "$key"; then
      echo "  $key=SET"
    else
      echo "  $key=EMPTY"
    fi
  done
}

write_env_key_status() {
  local target="$1"
  local file="$2"
  {
    echo "# 更新时间: 2026-07-10 17:20:59 CST"
    echo "# 更新内容: 记录阿里云 AMD64 交付包运行时关键环境变量是否已设置，不包含任何密钥明文。"
    echo
    if [[ ! -f "$file" ]]; then
      echo "ENV_FILE=MISSING"
      return
    fi
    for key in APP_IMAGE_REPO APP_IMAGE_TAG DB_HOST DB_PORT DB_USERNAME DB_PASSWORD DB_NAME DASHSCOPE_API_KEY COMPUTE_API_BASE_URL COMPUTE_API_TOKEN; do
      if env_has_value "$file" "$key"; then
        echo "$key=SET"
      else
        echo "$key=EMPTY"
      fi
    done
  } > "$target"
}

write_version_file() {
  local target="$1"
  local git_commit="unknown"
  local git_branch="unknown"
  local git_dirty="unknown"
  git_commit="$(git -C "$ROOT_DIR" rev-parse --short=12 HEAD 2>/dev/null || echo unknown)"
  git_branch="$(git -C "$ROOT_DIR" branch --show-current 2>/dev/null || echo unknown)"
  if git -C "$ROOT_DIR" diff --quiet --ignore-submodules -- && git -C "$ROOT_DIR" diff --cached --quiet --ignore-submodules --; then
    git_dirty="false"
  else
    git_dirty="true"
  fi
  {
    echo "# 更新时间: 2026-07-10 17:20:59 CST"
    echo "# 更新内容: 记录阿里云 AMD64 交付包版本、镜像与 Git 提交，便于运维验收和回滚追踪。"
    echo
    echo "package=$PACKAGE_NAME"
    echo "built_at=$TIMESTAMP"
    echo "platform=$PLATFORM"
    echo "app_image=$IMAGE_NAME"
    echo "mysql_image=$MYSQL_IMAGE"
    echo "git_branch=$git_branch"
    echo "git_commit=$git_commit"
    echo "git_dirty=$git_dirty"
  } > "$target"
}

image_platform() {
  docker image inspect "$1" --format '{{.Os}}/{{.Architecture}}' 2>/dev/null || true
}

require_image_platform() {
  local image="$1"
  local expected="$2"
  local actual
  actual="$(image_platform "$image")"
  if [[ "$actual" != "$expected" ]]; then
    echo "Image platform check failed: $image is ${actual:-missing}, expected $expected" >&2
    exit 1
  fi
}

save_image_gzip() {
  local image="$1"
  local target="$2"
  docker save "$image" | gzip -c > "$target"
}

write_server_script() {
  local target="$1"
  local mode="$2"
  cat > "$target" <<SCRIPT
#!/usr/bin/env bash
# 更新时间: 2026-07-10 17:20:59 CST
# 更新内容: 阿里云 AMD64 ${mode}脚本，加载离线镜像、校验 .env、执行迁移并等待 /api/health 就绪。
SCRIPT
  cat >> "$target" <<'SCRIPT'

set -euo pipefail

DEPLOY_DIR="${1:-/opt/ceodashboard}"
PACKAGE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

compose() {
  if docker compose version >/dev/null 2>&1; then
    docker compose "$@"
  else
    docker-compose "$@"
  fi
}

env_value() {
  local file="$1"
  local key="$2"
  awk -v key="$key" '
    BEGIN { FS = "=" }
    $0 ~ "^[[:space:]]*#" { next }
    {
      rawKey = $1
      gsub(/^[[:space:]]+|[[:space:]]+$/, "", rawKey)
    }
    rawKey == key {
      sub(/^[^=]*=/, "")
      gsub(/\r$/, "")
      gsub(/^[[:space:]]+|[[:space:]]+$/, "")
      if (($0 ~ /^".*"$/) || ($0 ~ /^'\''.*'\''$/)) {
        $0 = substr($0, 2, length($0) - 2)
      }
      print
      exit
    }
  ' "$file"
}

env_has_value() {
  local file="$1"
  local key="$2"
  local value
  value="$(env_value "$file" "$key")"
  [[ -n "$value" ]]
}

load_images() {
  if [[ ! -d "$PACKAGE_DIR/images" ]]; then
    echo "Missing images directory: $PACKAGE_DIR/images" >&2
    exit 1
  fi
  shopt -s nullglob
  local image
  local loaded=0
  for image in "$PACKAGE_DIR"/images/*.tar.gz "$PACKAGE_DIR"/images/*.tar; do
    echo "Loading image: $(basename "$image")"
    case "$image" in
      *.tar.gz) gzip -dc "$image" | docker load ;;
      *.tar) docker load -i "$image" ;;
    esac
    loaded=1
  done
  if [[ "$loaded" -eq 0 ]]; then
    echo "No Docker image archives found in $PACKAGE_DIR/images" >&2
    exit 1
  fi
}

copy_runtime_files() {
  mkdir -p "$DEPLOY_DIR/docker/db-init" "$DEPLOY_DIR/docker/migrations"
  cp "$PACKAGE_DIR/docker-compose.yml" "$DEPLOY_DIR/docker-compose.yml"
  cp "$PACKAGE_DIR/.env.example" "$DEPLOY_DIR/.env.example"
  cp "$PACKAGE_DIR/docker/db-init/ceo_dashboard_full.sql" "$DEPLOY_DIR/docker/db-init/ceo_dashboard_full.sql"
  if compgen -G "$PACKAGE_DIR/docker/migrations/*.sql" >/dev/null; then
    cp "$PACKAGE_DIR"/docker/migrations/*.sql "$DEPLOY_DIR/docker/migrations/"
  fi

  if [[ -f "$PACKAGE_DIR/.env" ]]; then
    if [[ -f "$DEPLOY_DIR/.env" ]]; then
      cp "$DEPLOY_DIR/.env" "$DEPLOY_DIR/.env.backup-$(date +%Y%m%d-%H%M%S)"
    fi
    cp "$PACKAGE_DIR/.env" "$DEPLOY_DIR/.env"
  elif [[ ! -f "$DEPLOY_DIR/.env" ]]; then
    cp "$PACKAGE_DIR/.env.example" "$DEPLOY_DIR/.env"
    echo "Created $DEPLOY_DIR/.env from .env.example."
    echo "Fill real DB_PASSWORD, DASHSCOPE_API_KEY and APP_IMAGE_TAG, then rerun this script." >&2
    exit 1
  fi
}

validate_runtime_env() {
  local env_file="$DEPLOY_DIR/.env"
  local missing=()
  local key
  for key in APP_IMAGE_REPO APP_IMAGE_TAG DB_HOST DB_PORT DB_USERNAME DB_PASSWORD DB_NAME DASHSCOPE_API_KEY; do
    if ! env_has_value "$env_file" "$key"; then
      missing+=("$key")
    fi
  done

  if [[ "${#missing[@]}" -gt 0 ]]; then
    echo "Runtime env validation failed. Empty required keys: ${missing[*]}" >&2
    exit 1
  fi

  if [[ "$(env_value "$env_file" DB_PASSWORD)" == "change-this-mysql-password" ]]; then
    echo "Runtime env validation failed. DB_PASSWORD still uses the example placeholder." >&2
    exit 1
  fi

  if [[ "$(env_value "$env_file" APP_IMAGE_TAG)" == "replace-with-package-image-tag" ]]; then
    echo "Runtime env validation failed. APP_IMAGE_TAG still uses the example placeholder." >&2
    exit 1
  fi

  local compute_base_set=0
  local compute_token_set=0
  env_has_value "$env_file" "COMPUTE_API_BASE_URL" && compute_base_set=1
  env_has_value "$env_file" "COMPUTE_API_TOKEN" && compute_token_set=1
  if [[ "$compute_base_set" -ne "$compute_token_set" ]]; then
    echo "Runtime env validation failed. COMPUTE_API_BASE_URL and COMPUTE_API_TOKEN must be set together or both left empty." >&2
    exit 1
  fi
}

run_migrations() {
  if ! compgen -G "$DEPLOY_DIR/docker/migrations/*.sql" >/dev/null; then
    return
  fi

  local migration
  for migration in "$DEPLOY_DIR"/docker/migrations/*.sql; do
    echo "Running migration: $(basename "$migration")"
    compose -f docker-compose.yml exec -T db sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE"' < "$migration"
  done
}

wait_health() {
  if ! command -v curl >/dev/null 2>&1; then
    echo "curl is required for the deployment health check." >&2
    exit 1
  fi

  local port
  port="$(env_value "$DEPLOY_DIR/.env" COCKPIT_PORT)"
  port="${port:-5174}"
  local url="http://127.0.0.1:${port}/api/health"
  local response=""
  echo "Waiting for $url ..."
  for _ in $(seq 1 120); do
    if response="$(curl -fsS "$url" 2>/dev/null)"; then
      if printf '%s' "$response" | grep -q '"aiAvailable":true'; then
        echo "Health check OK: $response"
        return
      fi
      echo "Health check responded, but aiAvailable is not true: $response" >&2
      exit 1
    fi
    sleep 1
  done

  echo "Health check timed out after 120s. Recent logs:" >&2
  compose -f docker-compose.yml logs --tail 120 cockpit db >&2 || true
  exit 1
}

load_images
copy_runtime_files
cd "$DEPLOY_DIR"
validate_runtime_env
compose -f docker-compose.yml up -d
run_migrations
wait_health
compose -f docker-compose.yml ps
SCRIPT
  chmod +x "$target"
}

require_file "$ROOT_DIR/cockpit/Dockerfile.prod"
require_file "$ROOT_DIR/docker-compose.aliyun.yml"
require_file "$ROOT_DIR/docker/db-init/ceo_dashboard_full.sql"
require_file "$ROOT_DIR/scripts/create_compute_token_usage_tables.sql"
require_file "$ROOT_DIR/scripts/migrate_cost_components.sql"
require_file "$ROOT_DIR/scripts/create_self_operated_revenue_tables.sql"
require_file "$ROOT_DIR/scripts/create_revenue_monthly_tables.sql"

rm -rf "$WORK_DIR"
mkdir -p "$WORK_DIR/images" "$WORK_DIR/docker/db-init" "$WORK_DIR/docker/migrations"

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
elif ! docker image inspect "$IMAGE_NAME" >/dev/null 2>&1; then
  echo "Skip-build requested, but $IMAGE_NAME does not exist locally." >&2
  exit 1
fi

require_image_platform "$IMAGE_NAME" "$PLATFORM"

docker pull --platform "$PLATFORM" "$MYSQL_IMAGE"
require_image_platform "$MYSQL_IMAGE" "$PLATFORM"

APP_IMAGE_TAR_NAME="${IMAGE_REPO//\//_}-$IMAGE_TAG.tar.gz"
MYSQL_IMAGE_TAR_NAME="${MYSQL_IMAGE//[:\/]/-}-amd64.tar.gz"
save_image_gzip "$IMAGE_NAME" "$WORK_DIR/images/$APP_IMAGE_TAR_NAME"
save_image_gzip "$MYSQL_IMAGE" "$WORK_DIR/images/$MYSQL_IMAGE_TAR_NAME"

cp "$ROOT_DIR/docker-compose.aliyun.yml" "$WORK_DIR/docker-compose.yml"
cp "$ROOT_DIR/docker-compose.aliyun.yml" "$WORK_DIR/docker-compose.aliyun.yml"
cp "$ROOT_DIR/docker/db-init/ceo_dashboard_full.sql" "$WORK_DIR/docker/db-init/ceo_dashboard_full.sql"
cp "$ROOT_DIR/scripts/create_compute_token_usage_tables.sql" "$WORK_DIR/docker/migrations/20260709_compute_token_usage_tables.sql"
cp "$ROOT_DIR/scripts/migrate_cost_components.sql" "$WORK_DIR/docker/migrations/20260713_cost_components.sql"
cp "$ROOT_DIR/scripts/create_self_operated_revenue_tables.sql" "$WORK_DIR/docker/migrations/20260714_self_operated_revenue_tables.sql"
cp "$ROOT_DIR/scripts/create_revenue_monthly_tables.sql" "$WORK_DIR/docker/migrations/20260714_revenue_monthly_tables.sql"
write_env_example "$WORK_DIR/.env.example"
write_env_key_status "$WORK_DIR/ENV_KEY_STATUS.txt" "$WORK_DIR/.env"
write_version_file "$WORK_DIR/VERSION.txt"

write_server_script "$WORK_DIR/install.sh" "首次安装"
write_server_script "$WORK_DIR/update.sh" "更新"

(
  cd "$ARTIFACT_ROOT"
  tar -czf "$PACKAGE_NAME.tar.gz" "$PACKAGE_NAME"
)

echo "Package created:"
echo "  $WORK_DIR"
echo "  $ARTIFACT_ROOT/$PACKAGE_NAME.tar.gz"
