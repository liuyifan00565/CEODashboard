/*
 更新时间: 2026-07-09 18:26:37 CST
 更新内容: 根据外部 token/算力接口建表说明新增算力落库表结构，并为现有 fact_compute_usage_daily 补充接口原始字段。
*/

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS `dim_compute_level` (
  `level` tinyint unsigned NOT NULL COMMENT '版本等级枚举值',
  `level_name` varchar(50) NOT NULL COMMENT '版本等级名称',
  `sort_order` int NOT NULL DEFAULT 0 COMMENT '排序',
  PRIMARY KEY (`level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='算力版本等级枚举维表';

INSERT INTO `dim_compute_level` (`level`, `level_name`, `sort_order`) VALUES
  (1, '个人版', 10),
  (2, '试用版', 20),
  (3, '企业版', 30),
  (4, '旗舰版', 40),
  (5, '免费版', 50),
  (6, '卓越版', 60),
  (7, '创世版', 70),
  (8, '至尊版ultra', 80),
  (9, '启航版', 90),
  (10, '定制尊享版', 100)
ON DUPLICATE KEY UPDATE
  `level_name` = VALUES(`level_name`),
  `sort_order` = VALUES(`sort_order`);

CREATE TABLE IF NOT EXISTS `fact_compute_platform_period` (
  `start_time` bigint unsigned NOT NULL COMMENT '统计开始时间；Unix 秒级时间戳',
  `end_time` bigint unsigned NOT NULL COMMENT '统计结束时间；Unix 秒级时间戳',
  `total_points` bigint NOT NULL DEFAULT 0 COMMENT '当前总算力池/总余额',
  `incr_points` bigint NOT NULL DEFAULT 0 COMMENT '周期内新增算力',
  `deduct_points` bigint NOT NULL DEFAULT 0 COMMENT '周期内总消耗算力',
  `reply_intercept_deduct_points` bigint NOT NULL DEFAULT 0 COMMENT '周期内回复拦截消耗',
  `dialogue_test_deduct_points` bigint NOT NULL DEFAULT 0 COMMENT '周期内对话测试消耗',
  `synced_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '同步时间',
  PRIMARY KEY (`start_time`, `end_time`),
  KEY `idx_synced_at` (`synced_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='算力平台周期汇总表；来自 getPlatformBoard.data';

CREATE TABLE IF NOT EXISTS `fact_compute_usage_daily` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `stat_date` date NOT NULL COMMENT '统计日期',
  `usage_points` bigint NOT NULL DEFAULT 0 COMMENT '页面兼容字段：算力用量；同 deduct_points',
  `added_points` bigint NOT NULL DEFAULT 0 COMMENT '页面兼容字段：新增算力；同 incr_points',
  `capacity_points` bigint NOT NULL DEFAULT 0 COMMENT '页面兼容字段：容量；同 pool_points',
  `target_points` bigint NOT NULL DEFAULT 0 COMMENT '页面兼容字段：目标用量',
  `deduct_points` bigint NOT NULL DEFAULT 0 COMMENT '当日总消耗',
  `incr_points` bigint NOT NULL DEFAULT 0 COMMENT '当日新增',
  `pool_points` bigint NOT NULL DEFAULT 0 COMMENT '当日容量池/余额',
  `ocr_deduct_points` bigint NOT NULL DEFAULT 0 COMMENT '当日 OCR 消耗',
  `voc_deduct_points` bigint NOT NULL DEFAULT 0 COMMENT '当日 VOC 消耗',
  `video_deduct_points` bigint NOT NULL DEFAULT 0 COMMENT '当日视频识别消耗',
  `reply_intercept_deduct_points` bigint NOT NULL DEFAULT 0 COMMENT '当日回复拦截消耗',
  `dialogue_test_deduct_points` bigint NOT NULL DEFAULT 0 COMMENT '当日对话测试消耗',
  `synced_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '同步时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_stat_date` (`stat_date`),
  KEY `idx_synced_at` (`synced_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='算力用量日表；来自 getPlatformBoard.last_30_day_details 和 last_30_day_pool';

CREATE TABLE IF NOT EXISTS `fact_compute_customer_summary_period` (
  `start_time` bigint unsigned NOT NULL COMMENT '统计开始时间；Unix 秒级时间戳',
  `end_time` bigint unsigned NOT NULL COMMENT '统计结束时间；Unix 秒级时间戳',
  `customer_num` int NOT NULL DEFAULT 0 COMMENT '当前客户数',
  `customer_total` int NOT NULL DEFAULT 0 COMMENT '满足筛选条件的客户总数',
  `deduct_points` bigint NOT NULL DEFAULT 0 COMMENT '周期内客户总消耗',
  `pool_points` bigint NOT NULL DEFAULT 0 COMMENT '当前客户总余额/容量池',
  `avg_ai_reply_rate` decimal(9,4) NOT NULL DEFAULT 0 COMMENT '平均 AI 回复率原始值；接口可能返回 0-1 小数',
  `new_customer_num` int NOT NULL DEFAULT 0 COMMENT '周期内新客户数',
  `new_shop_num` int NOT NULL DEFAULT 0 COMMENT '周期内新店铺数',
  `video_deduct_points` bigint NOT NULL DEFAULT 0 COMMENT '周期内视频识别消耗',
  `voc_deduct_points` bigint NOT NULL DEFAULT 0 COMMENT '周期内 VOC 消耗',
  `synced_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '同步时间',
  PRIMARY KEY (`start_time`, `end_time`),
  KEY `idx_synced_at` (`synced_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='算力客户周期汇总表；来自 getCustomerBoardList.data';

CREATE TABLE IF NOT EXISTS `fact_compute_customer_snapshot` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `snapshot_date` date NOT NULL COMMENT '快照日期',
  `phone` varchar(50) NOT NULL DEFAULT '' COMMENT '客户手机号/账号标识；可能已脱敏',
  `nick_name` varchar(200) NOT NULL DEFAULT '' COMMENT '客户/店铺/账号名称',
  `level` tinyint unsigned DEFAULT NULL COMMENT '版本等级枚举',
  `sales_manager` varchar(80) DEFAULT NULL COMMENT '销售负责人',
  `customer_manager` varchar(80) DEFAULT NULL COMMENT '客成负责人',
  `deduct_points` bigint NOT NULL DEFAULT 0 COMMENT '客户周期内消耗',
  `pool_points` bigint NOT NULL DEFAULT 0 COMMENT '客户当前余额',
  `avg_ai_reply_rate` decimal(9,4) NOT NULL DEFAULT 0 COMMENT '客户平均 AI 回复率原始值；接口可能返回 0-1 小数',
  `video_deduct_points` bigint NOT NULL DEFAULT 0 COMMENT '客户视频识别消耗',
  `voc_deduct_points` bigint NOT NULL DEFAULT 0 COMMENT '客户 VOC 消耗',
  `synced_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '同步时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_snapshot_customer` (`snapshot_date`, `phone`, `nick_name`),
  KEY `idx_snapshot_date_deduct` (`snapshot_date`, `deduct_points`),
  KEY `idx_level` (`level`),
  KEY `idx_sales_manager` (`sales_manager`),
  KEY `idx_customer_manager` (`customer_manager`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='算力客户快照表；来自 getCustomerBoardList.customer_list.list';

CREATE TABLE IF NOT EXISTS `fact_compute_level_deduct_period` (
  `start_time` bigint unsigned NOT NULL COMMENT '统计开始时间；Unix 秒级时间戳',
  `end_time` bigint unsigned NOT NULL COMMENT '统计结束时间；Unix 秒级时间戳',
  `level` tinyint unsigned NOT NULL COMMENT '版本等级枚举',
  `deduct_points` bigint NOT NULL DEFAULT 0 COMMENT '对应版本周期消耗',
  `synced_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '同步时间',
  PRIMARY KEY (`start_time`, `end_time`, `level`),
  KEY `idx_level` (`level`),
  KEY `idx_synced_at` (`synced_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='算力版本等级周期消耗表；来自 getCustomerBoardList.level_deduct_details.details';

CREATE TABLE IF NOT EXISTS `fact_compute_usage_range_period` (
  `start_time` bigint unsigned NOT NULL COMMENT '统计开始时间；Unix 秒级时间戳',
  `end_time` bigint unsigned NOT NULL COMMENT '统计结束时间；Unix 秒级时间戳',
  `usage_range` varchar(100) NOT NULL COMMENT '用量区间文案',
  `customer_count` int NOT NULL DEFAULT 0 COMMENT '对应用量区间客户数',
  `synced_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '同步时间',
  PRIMARY KEY (`start_time`, `end_time`, `usage_range`),
  KEY `idx_synced_at` (`synced_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='算力用量区间周期表；来自 getCustomerBoardList.range_customer_details.details';

DELIMITER //

DROP PROCEDURE IF EXISTS `ensure_compute_column`//
CREATE PROCEDURE `ensure_compute_column`(
  IN p_table_name varchar(128),
  IN p_column_name varchar(128),
  IN p_column_ddl text
)
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = p_table_name
      AND COLUMN_NAME = p_column_name
  ) THEN
    SET @ddl = CONCAT('ALTER TABLE `', p_table_name, '` ADD COLUMN ', p_column_ddl);
    PREPARE stmt FROM @ddl;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END//

DROP PROCEDURE IF EXISTS `ensure_compute_index`//
CREATE PROCEDURE `ensure_compute_index`(
  IN p_table_name varchar(128),
  IN p_index_name varchar(128),
  IN p_index_ddl text
)
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = p_table_name
      AND INDEX_NAME = p_index_name
  ) THEN
    SET @ddl = CONCAT('ALTER TABLE `', p_table_name, '` ADD ', p_index_ddl);
    PREPARE stmt FROM @ddl;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END//

DELIMITER ;

CALL `ensure_compute_column`('fact_compute_usage_daily', 'deduct_points', '`deduct_points` bigint NOT NULL DEFAULT 0 COMMENT ''当日总消耗'' AFTER `target_points`');
CALL `ensure_compute_column`('fact_compute_usage_daily', 'incr_points', '`incr_points` bigint NOT NULL DEFAULT 0 COMMENT ''当日新增'' AFTER `deduct_points`');
CALL `ensure_compute_column`('fact_compute_usage_daily', 'pool_points', '`pool_points` bigint NOT NULL DEFAULT 0 COMMENT ''当日容量池/余额'' AFTER `incr_points`');
CALL `ensure_compute_column`('fact_compute_usage_daily', 'ocr_deduct_points', '`ocr_deduct_points` bigint NOT NULL DEFAULT 0 COMMENT ''当日 OCR 消耗'' AFTER `pool_points`');
CALL `ensure_compute_column`('fact_compute_usage_daily', 'voc_deduct_points', '`voc_deduct_points` bigint NOT NULL DEFAULT 0 COMMENT ''当日 VOC 消耗'' AFTER `ocr_deduct_points`');
CALL `ensure_compute_column`('fact_compute_usage_daily', 'video_deduct_points', '`video_deduct_points` bigint NOT NULL DEFAULT 0 COMMENT ''当日视频识别消耗'' AFTER `voc_deduct_points`');
CALL `ensure_compute_column`('fact_compute_usage_daily', 'reply_intercept_deduct_points', '`reply_intercept_deduct_points` bigint NOT NULL DEFAULT 0 COMMENT ''当日回复拦截消耗'' AFTER `video_deduct_points`');
CALL `ensure_compute_column`('fact_compute_usage_daily', 'dialogue_test_deduct_points', '`dialogue_test_deduct_points` bigint NOT NULL DEFAULT 0 COMMENT ''当日对话测试消耗'' AFTER `reply_intercept_deduct_points`');
CALL `ensure_compute_column`('fact_compute_usage_daily', 'synced_at', '`synced_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT ''同步时间'' AFTER `dialogue_test_deduct_points`');
CALL `ensure_compute_index`('fact_compute_usage_daily', 'idx_synced_at', 'KEY `idx_synced_at` (`synced_at`)');

DROP PROCEDURE IF EXISTS `ensure_compute_index`;
DROP PROCEDURE IF EXISTS `ensure_compute_column`;
