-- 更新时间: 2026-07-14 17:09:11 CST
-- 更新内容: 建立统一毛回款聚合层、部门月度覆盖表、数据库迁移台账，并将应用写入表主键改为 BIGINT AUTO_INCREMENT。

CREATE TABLE IF NOT EXISTS schema_migrations (
  version VARCHAR(64) NOT NULL COMMENT '迁移版本；发布后不可复用',
  description VARCHAR(255) NOT NULL COMMENT '迁移说明',
  applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '应用时间',
  PRIMARY KEY (version)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='数据库迁移台账；记录已应用的结构版本';

CREATE TABLE IF NOT EXISTS fact_revenue_monthly_override (
  override_id BIGINT NOT NULL AUTO_INCREMENT COMMENT '部门月度回款覆盖ID',
  `year_month` CHAR(7) NOT NULL COMMENT '统计月份；YYYY-MM',
  department_id BIGINT NOT NULL COMMENT '覆盖组织ID；覆盖本组织及其下级组织当月明细',
  channel_id BIGINT NULL COMMENT '归属渠道ID',
  recovered_amount_yuan DECIMAL(18,2) NOT NULL DEFAULT 0 COMMENT '毛回款金额；未扣退款',
  actual_opening_count INT NOT NULL DEFAULT 0 COMMENT '实际开户数',
  order_count INT NOT NULL DEFAULT 0 COMMENT '成交单数',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (override_id),
  UNIQUE KEY uq_revenue_override_month_department (`year_month`, department_id),
  KEY idx_revenue_override_channel (channel_id),
  CONSTRAINT fk_revenue_override_department FOREIGN KEY (department_id) REFERENCES dim_department (department_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_revenue_override_channel FOREIGN KEY (channel_id) REFERENCES dim_channel (channel_id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='部门月度毛回款覆盖表；目标维护完成值覆盖同月本部门及下级组织日报明细';

DROP PROCEDURE IF EXISTS migrate_database_integrity;
DELIMITER $$

CREATE PROCEDURE migrate_database_integrity()
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'fact_revenue_daily' AND COLUMN_NAME = 'department_id'
  ) THEN
    ALTER TABLE fact_revenue_daily
      ADD COLUMN department_id BIGINT NULL COMMENT '组织ID；部门级回款归属' AFTER staff_id;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'fact_revenue_daily' AND COLUMN_NAME = 'actual_opening_count'
  ) THEN
    ALTER TABLE fact_revenue_daily
      ADD COLUMN actual_opening_count INT NOT NULL DEFAULT 0 COMMENT '实际开户数' AFTER recovered_amount_yuan;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM fact_revenue_daily r
    LEFT JOIN dim_department d ON d.department_id = r.department_id
    WHERE r.department_id IS NOT NULL AND d.department_id IS NULL
    LIMIT 1
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'fact_revenue_daily 存在无效 department_id，请先修复后再迁移';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'fact_revenue_daily' AND INDEX_NAME = 'idx_revenue_daily_department'
  ) THEN
    ALTER TABLE fact_revenue_daily ADD KEY idx_revenue_daily_department (department_id);
  END IF;

  IF EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'fact_revenue_daily' AND INDEX_NAME = 'idx_fact_revenue_daily_department_id'
  ) THEN
    ALTER TABLE fact_revenue_daily DROP INDEX idx_fact_revenue_daily_department_id;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = 'fact_revenue_daily' AND CONSTRAINT_NAME = 'fk_fact_revenue_daily_department_id'
  ) THEN
    ALTER TABLE fact_revenue_daily
      ADD CONSTRAINT fk_fact_revenue_daily_department_id FOREIGN KEY (department_id)
      REFERENCES dim_department (department_id) ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF EXISTS (
    SELECT 1 FROM fact_revenue_daily
    WHERE order_type = 'manual_department'
      AND (department_id IS NULL OR staff_id IS NOT NULL)
    LIMIT 1
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'manual_department 存在无法归属部门的行，请先修复后再迁移';
  END IF;

  INSERT INTO fact_revenue_monthly_override
    (`year_month`, department_id, channel_id, recovered_amount_yuan, actual_opening_count, order_count)
  SELECT ranked.`year_month`, ranked.department_id, ranked.channel_id,
         ranked.recovered_amount_yuan, ranked.actual_opening_count, ranked.order_count
  FROM (
    SELECT DATE_FORMAT(r.stat_date, '%Y-%m') AS `year_month`, r.department_id, r.channel_id,
           r.recovered_amount_yuan, r.actual_opening_count, r.order_count,
           ROW_NUMBER() OVER (
             PARTITION BY DATE_FORMAT(r.stat_date, '%Y-%m'), r.department_id
             ORDER BY r.id DESC
           ) AS row_rank
    FROM fact_revenue_daily r
    WHERE r.order_type = 'manual_department'
      AND r.staff_id IS NULL
      AND r.department_id IS NOT NULL
  ) ranked
  WHERE ranked.row_rank = 1
  ON DUPLICATE KEY UPDATE
    channel_id = VALUES(channel_id),
    recovered_amount_yuan = VALUES(recovered_amount_yuan),
    actual_opening_count = VALUES(actual_opening_count),
    order_count = VALUES(order_count);

  DELETE FROM fact_revenue_daily WHERE order_type = 'manual_department';

  IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'fact_revenue_daily' AND INDEX_NAME = 'idx_revenue_daily_manual_lookup'
  ) THEN
    ALTER TABLE fact_revenue_daily ADD KEY idx_revenue_daily_manual_lookup (order_type, department_id, stat_date);
  END IF;

  IF EXISTS (
    SELECT channel_key FROM dim_channel GROUP BY channel_key HAVING COUNT(*) > 1 LIMIT 1
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'dim_channel.channel_key 存在重复，无法增加唯一键';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'dim_channel' AND INDEX_NAME = 'uq_dim_channel_key'
  ) THEN
    ALTER TABLE dim_channel ADD UNIQUE KEY uq_dim_channel_key (channel_key);
  END IF;

  IF EXISTS (
    SELECT source_code FROM dim_channel_source GROUP BY source_code HAVING COUNT(*) > 1 LIMIT 1
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'dim_channel_source.source_code 存在重复，无法增加唯一键';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'dim_channel_source' AND INDEX_NAME = 'uq_dim_channel_source_code'
  ) THEN
    ALTER TABLE dim_channel_source ADD UNIQUE KEY uq_dim_channel_source_code (source_code);
  END IF;

  IF EXISTS (
    SELECT department_code FROM dim_department GROUP BY department_code HAVING COUNT(*) > 1 LIMIT 1
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'dim_department.department_code 存在重复，无法增加唯一键';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'dim_department' AND INDEX_NAME = 'uq_dim_department_code'
  ) THEN
    ALTER TABLE dim_department ADD UNIQUE KEY uq_dim_department_code (department_code);
  END IF;

  IF EXISTS (
    SELECT staff_code FROM dim_staff GROUP BY staff_code HAVING COUNT(*) > 1 LIMIT 1
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'dim_staff.staff_code 存在重复，无法增加唯一键';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'dim_staff' AND INDEX_NAME = 'uq_dim_staff_code'
  ) THEN
    ALTER TABLE dim_staff ADD UNIQUE KEY uq_dim_staff_code (staff_code);
  END IF;

  IF EXISTS (
    SELECT version_key FROM dim_product_version GROUP BY version_key HAVING COUNT(*) > 1 LIMIT 1
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'dim_product_version.version_key 存在重复，无法增加唯一键';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'dim_product_version' AND INDEX_NAME = 'uq_dim_product_version_key'
  ) THEN
    ALTER TABLE dim_product_version ADD UNIQUE KEY uq_dim_product_version_key (version_key);
  END IF;

  IF EXISTS (
    SELECT `year_month`, department_id
    FROM biz_target_monthly
    WHERE staff_id IS NULL AND department_id IS NOT NULL
    GROUP BY `year_month`, department_id
    HAVING COUNT(*) > 1
    LIMIT 1
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'biz_target_monthly 存在重复部门月度目标，无法增加唯一键';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'biz_target_monthly' AND COLUMN_NAME = 'department_target_scope_id'
  ) THEN
    ALTER TABLE biz_target_monthly
      ADD COLUMN department_target_scope_id BIGINT
      GENERATED ALWAYS AS (CASE WHEN staff_id IS NULL THEN department_id ELSE NULL END) VIRTUAL
      COMMENT '部门目标唯一键作用域';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'biz_target_monthly' AND INDEX_NAME = 'uq_target_month_department'
  ) THEN
    ALTER TABLE biz_target_monthly
      ADD UNIQUE KEY uq_target_month_department (`year_month`, department_target_scope_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'biz_channel_cost_monthly' AND COLUMN_NAME = 'refund_amount_yuan'
  ) THEN
    ALTER TABLE biz_channel_cost_monthly
      ADD COLUMN refund_amount_yuan DECIMAL(18,2) NOT NULL DEFAULT 0 COMMENT '退款金额；毛回款扣减项';
  ELSEIF EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'biz_channel_cost_monthly' AND COLUMN_NAME = 'refund_amount_yuan'
      AND (NUMERIC_PRECISION <> 18 OR NUMERIC_SCALE <> 2)
  ) THEN
    ALTER TABLE biz_channel_cost_monthly
      MODIFY refund_amount_yuan DECIMAL(18,2) NOT NULL DEFAULT 0 COMMENT '退款金额；毛回款扣减项';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'biz_target_monthly' AND COLUMN_NAME = 'target_id' AND EXTRA LIKE '%auto_increment%'
  ) THEN
    ALTER TABLE biz_target_monthly MODIFY target_id BIGINT NOT NULL AUTO_INCREMENT COMMENT '目标ID';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'fact_revenue_daily' AND COLUMN_NAME = 'id' AND EXTRA LIKE '%auto_increment%'
  ) THEN
    ALTER TABLE fact_revenue_daily MODIFY id BIGINT NOT NULL AUTO_INCREMENT COMMENT '记录ID';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'dim_staff' AND COLUMN_NAME = 'staff_id' AND EXTRA LIKE '%auto_increment%'
  ) THEN
    ALTER TABLE dim_staff MODIFY staff_id BIGINT NOT NULL AUTO_INCREMENT COMMENT '人员ID；主键';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'dim_channel_source' AND COLUMN_NAME = 'source_id' AND EXTRA LIKE '%auto_increment%'
  ) THEN
    ALTER TABLE dim_channel_source MODIFY source_id BIGINT NOT NULL AUTO_INCREMENT COMMENT '来源ID';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'dim_product_version' AND COLUMN_NAME = 'version_id' AND EXTRA LIKE '%auto_increment%'
  ) THEN
    ALTER TABLE dim_product_version MODIFY version_id BIGINT NOT NULL AUTO_INCREMENT COMMENT '版本ID';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'import_batch' AND COLUMN_NAME = 'batch_id' AND EXTRA LIKE '%auto_increment%'
  ) THEN
    ALTER TABLE import_batch MODIFY batch_id BIGINT NOT NULL AUTO_INCREMENT COMMENT '批次ID';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'dim_channel' AND COLUMN_NAME = 'channel_id' AND EXTRA LIKE '%auto_increment%'
  ) THEN
    ALTER TABLE dim_channel MODIFY channel_id BIGINT NOT NULL AUTO_INCREMENT COMMENT '渠道ID';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'dim_department' AND COLUMN_NAME = 'department_id' AND EXTRA LIKE '%auto_increment%'
  ) THEN
    ALTER TABLE dim_department MODIFY department_id BIGINT NOT NULL AUTO_INCREMENT COMMENT '组织ID；主键';
  END IF;

END$$

DELIMITER ;
SET @previous_foreign_key_checks = @@FOREIGN_KEY_CHECKS;
SET FOREIGN_KEY_CHECKS = 0;
CALL migrate_database_integrity();
SET FOREIGN_KEY_CHECKS = @previous_foreign_key_checks;
DROP PROCEDURE migrate_database_integrity;

CREATE OR REPLACE SQL SECURITY INVOKER VIEW v_department_closure AS
WITH RECURSIVE department_tree (descendant_id, ancestor_id, depth) AS (
  SELECT department_id, department_id, 0
  FROM dim_department
  UNION ALL
  SELECT tree.descendant_id, parent.parent_id, tree.depth + 1
  FROM department_tree tree
  JOIN dim_department parent ON parent.department_id = tree.ancestor_id
  WHERE parent.parent_id IS NOT NULL AND tree.depth < 100
)
SELECT descendant_id, ancestor_id, depth
FROM department_tree;

CREATE OR REPLACE SQL SECURITY INVOKER VIEW v_revenue_monthly_effective_override AS
SELECT override_row.override_id, override_row.`year_month`, override_row.department_id,
       override_row.channel_id, override_row.recovered_amount_yuan,
       override_row.actual_opening_count, override_row.order_count,
       override_row.created_at, override_row.updated_at
FROM fact_revenue_monthly_override override_row
WHERE NOT EXISTS (
  SELECT 1
  FROM fact_revenue_monthly_override ancestor_override
  JOIN v_department_closure closure
    ON closure.descendant_id = override_row.department_id
   AND closure.ancestor_id = ancestor_override.department_id
   AND closure.depth > 0
  WHERE ancestor_override.`year_month` = override_row.`year_month`
);

CREATE OR REPLACE SQL SECURITY INVOKER VIEW v_revenue_gross_canonical AS
SELECT r.id AS source_id,
       'daily' AS source_kind,
       r.stat_date,
       COALESCE(r.department_id, staff.department_id) AS department_id,
       r.channel_id,
       r.staff_id,
       r.version_id,
       r.order_type,
       r.recovered_amount_yuan,
       r.actual_opening_count,
       r.order_count
FROM fact_revenue_daily r
LEFT JOIN dim_staff staff ON staff.staff_id = r.staff_id
WHERE r.order_type <> 'manual_department'
  AND NOT EXISTS (
    SELECT 1
    FROM v_revenue_monthly_effective_override override_row
    JOIN v_department_closure closure
      ON closure.descendant_id = COALESCE(r.department_id, staff.department_id)
     AND closure.ancestor_id = override_row.department_id
    WHERE override_row.`year_month` = DATE_FORMAT(r.stat_date, '%Y-%m')
  )

UNION ALL

SELECT override_row.override_id AS source_id,
       'monthly_override' AS source_kind,
       STR_TO_DATE(CONCAT(override_row.`year_month`, '-01'), '%Y-%m-%d') AS stat_date,
       override_row.department_id,
       override_row.channel_id,
       NULL AS staff_id,
       NULL AS version_id,
       'manual_department' AS order_type,
       override_row.recovered_amount_yuan,
       override_row.actual_opening_count,
       override_row.order_count
FROM v_revenue_monthly_effective_override override_row;

INSERT INTO schema_migrations (version, description)
VALUES ('20260714_database_integrity', '统一毛回款聚合、部门月度覆盖、自然唯一键及自增主键')
ON DUPLICATE KEY UPDATE description = VALUES(description);
