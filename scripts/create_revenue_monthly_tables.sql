-- 更新时间: 2026-07-14 19:02:00 CST
-- 更新内容: 月度事实保留自然唯一键与层级约束，并允许每月一个无渠道 structure 项承接特殊渠道展示。

CREATE TABLE IF NOT EXISTS fact_revenue_channel_monthly (
  monthly_revenue_id BIGINT NOT NULL AUTO_INCREMENT COMMENT '月度回款事实ID',
  `year_month` CHAR(7) NOT NULL COMMENT '统计月份；YYYY-MM',
  record_level VARCHAR(20) NOT NULL COMMENT '记录层级；total/channel/structure',
  channel_id BIGINT NULL COMMENT '渠道ID；total/structure 为空',
  scope_channel_id BIGINT GENERATED ALWAYS AS (
    CASE WHEN record_level = 'channel' THEN channel_id ELSE 0 END
  ) VIRTUAL COMMENT '月度层级唯一键作用域；total/structure 固定为 0，channel 使用渠道ID',
  source_name_raw VARCHAR(100) NULL COMMENT '工作簿原始主渠道名称',
  gross_amount_yuan DECIMAL(18,2) NOT NULL DEFAULT 0 COMMENT '含税签约或原始GMV',
  refund_amount_yuan DECIMAL(18,2) NOT NULL DEFAULT 0 COMMENT '退款金额；正数保存',
  net_amount_yuan DECIMAL(18,2) GENERATED ALWAYS AS (gross_amount_yuan - refund_amount_yuan) STORED COMMENT '实际营收/净回款',
  source_workbook VARCHAR(255) NOT NULL COMMENT '来源工作簿名',
  source_sheet VARCHAR(100) NOT NULL COMMENT '来源工作表',
  source_row_no INT NOT NULL COMMENT '来源 Excel 行号',
  import_batch_id VARCHAR(64) NULL COMMENT '导入批次ID',
  source_row_hash CHAR(64) NOT NULL COMMENT '规范化事实哈希；用于幂等更新',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (monthly_revenue_id),
  UNIQUE KEY uk_revenue_monthly_source_hash (source_row_hash),
  UNIQUE KEY uq_revenue_monthly_month_level_scope (`year_month`, record_level, scope_channel_id),
  KEY idx_revenue_monthly_month_level (`year_month`, record_level),
  KEY idx_revenue_monthly_channel (channel_id),
  KEY idx_revenue_monthly_batch (import_batch_id),
  CONSTRAINT fk_revenue_monthly_channel_id FOREIGN KEY (channel_id) REFERENCES dim_channel (channel_id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT chk_revenue_monthly_level_channel CHECK (
    (record_level = 'total' AND channel_id IS NULL)
    OR (record_level = 'channel' AND channel_id IS NOT NULL)
    OR (record_level = 'structure' AND channel_id IS NULL)
  )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='公司级月度回款事实；total 为 KPI 权威值，channel 为分摊权重，structure 仅用于特殊渠道结构展示';
