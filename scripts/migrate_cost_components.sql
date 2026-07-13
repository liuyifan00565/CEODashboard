-- 更新时间: 2026-07-13 16:48:56 CST
-- 更新内容: 将每个渠道月成本拆为运营成本与人力成本，并补业务唯一键和自增主键。

DROP PROCEDURE IF EXISTS migrate_cost_components;
DELIMITER $$

CREATE PROCEDURE migrate_cost_components()
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'biz_channel_cost_monthly'
      AND COLUMN_NAME = 'operations_amount_yuan'
  ) THEN
    ALTER TABLE biz_channel_cost_monthly
      ADD COLUMN operations_amount_yuan DECIMAL(18,2) NOT NULL DEFAULT 0
      COMMENT '运营成本；按月按渠道维护' AFTER channel_id;

    IF EXISTS (
      SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'biz_channel_cost_monthly'
        AND COLUMN_NAME = 'investment_amount_yuan'
    ) THEN
      UPDATE biz_channel_cost_monthly
      SET operations_amount_yuan = investment_amount_yuan;
    END IF;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'biz_channel_cost_monthly'
      AND COLUMN_NAME = 'labor_amount_yuan'
  ) THEN
    ALTER TABLE biz_channel_cost_monthly
      ADD COLUMN labor_amount_yuan DECIMAL(18,2) NULL DEFAULT NULL
      COMMENT '人力成本；按月按渠道维护，NULL 表示尚未迁移' AFTER operations_amount_yuan;
  END IF;

  IF EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'biz_channel_cost_monthly'
      AND COLUMN_NAME = 'labor_amount_yuan'
      AND IS_NULLABLE = 'NO'
  ) THEN
    ALTER TABLE biz_channel_cost_monthly
      MODIFY labor_amount_yuan DECIMAL(18,2) NULL DEFAULT NULL
      COMMENT '人力成本；按月按渠道维护，NULL 表示尚未迁移';
    UPDATE biz_channel_cost_monthly
    SET labor_amount_yuan = NULL
    WHERE labor_amount_yuan = 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'biz_channel_cost_monthly'
      AND COLUMN_NAME = 'refund_amount_yuan'
  ) THEN
    ALTER TABLE biz_channel_cost_monthly
      ADD COLUMN refund_amount_yuan DECIMAL(18,2) NOT NULL DEFAULT 0
      COMMENT '退款金额；用于净回款' AFTER labor_amount_yuan;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'biz_channel_cost_monthly'
      AND INDEX_NAME = 'uq_channel_cost_month'
  ) THEN
    DELETE older
    FROM biz_channel_cost_monthly older
    JOIN biz_channel_cost_monthly newer
      ON newer.`year_month` = older.`year_month`
     AND newer.channel_id = older.channel_id
     AND older.cost_id < newer.cost_id;

    ALTER TABLE biz_channel_cost_monthly
      ADD UNIQUE KEY uq_channel_cost_month (`year_month`, channel_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'biz_labor_cost_monthly'
      AND INDEX_NAME = 'uq_labor_cost_month_type'
  ) THEN
    DELETE older
    FROM biz_labor_cost_monthly older
    JOIN biz_labor_cost_monthly newer
      ON newer.`year_month` = older.`year_month`
     AND newer.cost_type = older.cost_type
     AND older.labor_cost_id < newer.labor_cost_id;

    ALTER TABLE biz_labor_cost_monthly
      ADD UNIQUE KEY uq_labor_cost_month_type (`year_month`, cost_type);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'biz_channel_cost_monthly'
      AND COLUMN_NAME = 'cost_id'
      AND EXTRA LIKE '%auto_increment%'
  ) THEN
    ALTER TABLE biz_channel_cost_monthly
      MODIFY cost_id BIGINT NOT NULL AUTO_INCREMENT COMMENT '成本ID';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'biz_labor_cost_monthly'
      AND COLUMN_NAME = 'labor_cost_id'
      AND EXTRA LIKE '%auto_increment%'
  ) THEN
    ALTER TABLE biz_labor_cost_monthly
      MODIFY labor_cost_id BIGINT NOT NULL AUTO_INCREMENT COMMENT '人力成本ID';
  END IF;
END$$

DELIMITER ;
CALL migrate_cost_components();
DROP PROCEDURE migrate_cost_components;
