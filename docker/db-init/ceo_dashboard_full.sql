-- 更新时间: 2026-07-14 19:02:00 CST
-- 更新内容: 空库公司月度事实允许每月一个无渠道 structure 展示项；该项独立于 total 权威值和 channel 分摊权重。
-- 更新时间: 2026-07-14 18:32:40 CST
-- 更新内容: 空库初始化新增父组织优先的有效目标视图，并保留无渠道的显式零值公司月度事实。
-- 更新时间: 2026-07-14 18:25:00 CST
-- 更新内容: 公司月度事实补充层级/渠道校验与月度作用域唯一键；空库补齐订单/月度事实表及按自然年选源的金额守恒回款、退款视图。
-- 更新时间: 2026-07-14 18:13:24 CST
-- 更新内容: 空库初始化补齐公司月度与真实订单事实表，并按自然年建立金额守恒的统一毛回款、渠道分摊和退款来源视图。
-- 更新时间: 2026-07-14 17:09:11 CST
-- 更新内容: 空库初始化补齐统一毛回款视图、部门月度覆盖表、迁移台账、自然唯一键和自增主键，并移除硬编码数据库名。
-- 更新时间: 2026-07-13 16:48:56 CST
-- 更新内容: 每个渠道月成本拆分为运营成本与人力成本，补业务唯一键、自增主键和退款字段。
-- MySQL dump 10.13  Distrib 8.4.10, for macos26.4 (arm64)
--
-- Host: 127.0.0.1    Database: ceo_dashboard
-- ------------------------------------------------------
-- Server version	8.4.10

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- 数据库由 Docker MYSQL_DATABASE 或 mysql 客户端的目标库参数选择，不在初始化脚本中硬编码。

--
-- Table structure for table `biz_ai_config`
--

DROP TABLE IF EXISTS `biz_ai_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `biz_ai_config` (
  `config_key` varchar(100) NOT NULL COMMENT '配置键；配置唯一键',
  `config_value` text NOT NULL COMMENT '配置值；模型或接口配置',
  `is_secret` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否敏感；密钥脱敏',
  `updated_by` bigint DEFAULT NULL COMMENT '更新人；审计',
  PRIMARY KEY (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='AI配置表；DashScope 模型、接口地址、是否开启思考模式等配置；AI经营分析、文字悬浮气泡';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `biz_ai_config`
--

LOCK TABLES `biz_ai_config` WRITE;
/*!40000 ALTER TABLE `biz_ai_config` DISABLE KEYS */;
INSERT INTO `biz_ai_config` VALUES ('DASHSCOPE_API_KEY','',1,NULL),('DASHSCOPE_BASE_URL','https://dashscope.aliyuncs.com/compatible-mode/v1',0,NULL),('DASHSCOPE_ENABLE_THINKING','false',0,NULL),('DASHSCOPE_MODEL','qwen3.7-max-2026-05-20',0,NULL);
/*!40000 ALTER TABLE `biz_ai_config` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `biz_channel_cost_monthly`
--

DROP TABLE IF EXISTS `biz_channel_cost_monthly`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `biz_channel_cost_monthly` (
  `cost_id` bigint NOT NULL AUTO_INCREMENT COMMENT '成本ID',
  `year_month` char(7) NOT NULL COMMENT '月份；成本月份',
  `channel_id` bigint NOT NULL COMMENT '渠道ID；成本归属',
  `operations_amount_yuan` decimal(18,2) NOT NULL DEFAULT '0.00' COMMENT '运营成本；总投入/ROI/费比',
  `labor_amount_yuan` decimal(18,2) DEFAULT NULL COMMENT '人力成本；总投入/ROI/费比，NULL 表示尚未维护',
  `refund_amount_yuan` decimal(18,2) NOT NULL DEFAULT '0.00' COMMENT '退款金额；净回款',
  PRIMARY KEY (`cost_id`),
  UNIQUE KEY `uq_channel_cost_month` (`year_month`,`channel_id`),
  KEY `idx_year_month` (`year_month`),
  KEY `idx_channel_id` (`channel_id`),
  CONSTRAINT `fk_biz_channel_cost_monthly_channel_id` FOREIGN KEY (`channel_id`) REFERENCES `dim_channel` (`channel_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='渠道月成本表；每个渠道维护运营、人力成本与退款；总投入费比、渠道 ROI';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `biz_channel_cost_monthly`
--

LOCK TABLES `biz_channel_cost_monthly` WRITE;
/*!40000 ALTER TABLE `biz_channel_cost_monthly` DISABLE KEYS */;
INSERT INTO `biz_channel_cost_monthly` (`cost_id`,`year_month`,`channel_id`,`operations_amount_yuan`) VALUES (500000,'2026-01',3001,299000.00),(500001,'2026-02',3001,301800.00),(500002,'2026-03',3001,305500.00),(500003,'2026-04',3001,308300.00),(500004,'2026-05',3001,304600.00),(500005,'2026-06',3001,311100.00),(500006,'2026-07',3001,313000.00),(500007,'2026-08',3001,309300.00),(500008,'2026-09',3001,312000.00),(500009,'2026-10',3001,315800.00),(500010,'2026-11',3001,317600.00),(500011,'2026-12',3001,321300.00),(500012,'2026-01',3002,185600.00),(500013,'2026-02',3002,187300.00),(500014,'2026-03',3002,189600.00),(500015,'2026-04',3002,191400.00),(500016,'2026-05',3002,189100.00),(500017,'2026-06',3002,193100.00),(500018,'2026-07',3002,194300.00),(500019,'2026-08',3002,192000.00),(500020,'2026-09',3002,193700.00),(500021,'2026-10',3002,196000.00),(500022,'2026-11',3002,197100.00),(500023,'2026-12',3002,199400.00),(500024,'2026-01',3003,170100.00),(500025,'2026-02',3003,171700.00),(500026,'2026-03',3003,173800.00),(500027,'2026-04',3003,175400.00),(500028,'2026-05',3003,173300.00),(500029,'2026-06',3003,177000.00),(500030,'2026-07',3003,178100.00),(500031,'2026-08',3003,176000.00),(500032,'2026-09',3003,177500.00),(500033,'2026-10',3003,179700.00),(500034,'2026-11',3003,180700.00),(500035,'2026-12',3003,182800.00),(500036,'2026-01',3004,87700.00),(500037,'2026-02',3004,88500.00),(500038,'2026-03',3004,89600.00),(500039,'2026-04',3004,90400.00),(500040,'2026-05',3004,89300.00),(500041,'2026-06',3004,91200.00),(500042,'2026-07',3004,91700.00),(500043,'2026-08',3004,90600.00),(500044,'2026-09',3004,91500.00),(500045,'2026-10',3004,92500.00),(500046,'2026-11',3004,93100.00),(500047,'2026-12',3004,94200.00);
/*!40000 ALTER TABLE `biz_channel_cost_monthly` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `biz_compute_target_monthly`
--

DROP TABLE IF EXISTS `biz_compute_target_monthly`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `biz_compute_target_monthly` (
  `compute_target_id` bigint NOT NULL COMMENT '算力目标ID',
  `year_month` char(7) NOT NULL COMMENT '月份；目标月份',
  `target_usage_points` bigint NOT NULL DEFAULT '0' COMMENT '目标用量；算力完成率分母',
  `target_capacity_points` bigint NOT NULL DEFAULT '0' COMMENT '目标容量；容量目标',
  `target_reply_rate` decimal(5,2) NOT NULL DEFAULT '0.00' COMMENT '目标回复率；回复率目标',
  PRIMARY KEY (`compute_target_id`),
  KEY `idx_year_month` (`year_month`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='算力目标表；算力用量、总容量、回复效率等目标；算力用量趋势、算力总容量趋势';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `biz_compute_target_monthly`
--

LOCK TABLES `biz_compute_target_monthly` WRITE;
/*!40000 ALTER TABLE `biz_compute_target_monthly` DISABLE KEYS */;
INSERT INTO `biz_compute_target_monthly` VALUES (911000,'2026-06',126000000,292000000,90.50);
/*!40000 ALTER TABLE `biz_compute_target_monthly` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `biz_delivery_target_monthly`
--

DROP TABLE IF EXISTS `biz_delivery_target_monthly`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `biz_delivery_target_monthly` (
  `delivery_target_id` bigint NOT NULL COMMENT '交付目标ID',
  `year_month` char(7) NOT NULL COMMENT '月份；目标月份',
  `engineer_id` bigint DEFAULT NULL COMMENT '实施工程师ID；人员目标',
  `target_count` int NOT NULL DEFAULT '15' COMMENT '目标单数；交付完成率分母',
  PRIMARY KEY (`delivery_target_id`),
  KEY `idx_year_month` (`year_month`),
  KEY `idx_engineer_id` (`engineer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='交付目标表；实施工程师 15 单/月等交付目标；交付看板';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `biz_delivery_target_monthly`
--

LOCK TABLES `biz_delivery_target_monthly` WRITE;
/*!40000 ALTER TABLE `biz_delivery_target_monthly` DISABLE KEYS */;
INSERT INTO `biz_delivery_target_monthly` VALUES (912000,'2026-06',2101,18),(912001,'2026-06',2102,16),(912002,'2026-06',2103,16),(912003,'2026-06',2104,15),(912004,'2026-06',2105,14);
/*!40000 ALTER TABLE `biz_delivery_target_monthly` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `biz_labor_cost_monthly`
--

DROP TABLE IF EXISTS `biz_labor_cost_monthly`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `biz_labor_cost_monthly` (
  `labor_cost_id` bigint NOT NULL AUTO_INCREMENT COMMENT '人力成本ID',
  `year_month` char(7) NOT NULL COMMENT '月份；成本月份',
  `cost_type` varchar(30) NOT NULL COMMENT '成本类型；sales/marketing/delivery',
  `department_id` bigint DEFAULT NULL COMMENT '组织ID；成本部门',
  `amount_yuan` decimal(18,2) NOT NULL DEFAULT '0.00' COMMENT '成本金额；总投入',
  PRIMARY KEY (`labor_cost_id`),
  UNIQUE KEY `uq_labor_cost_month_type` (`year_month`,`cost_type`),
  KEY `idx_year_month` (`year_month`),
  KEY `idx_department_id` (`department_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='人力成本表；销售部、市场部、实施等月度人力成本；总投入费比';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `biz_labor_cost_monthly`
--

LOCK TABLES `biz_labor_cost_monthly` WRITE;
/*!40000 ALTER TABLE `biz_labor_cost_monthly` DISABLE KEYS */;
INSERT INTO `biz_labor_cost_monthly` VALUES (600000,'2026-01','sales',NULL,533300.00),(600001,'2026-02','sales',NULL,535800.00),(600002,'2026-03','sales',NULL,539100.00),(600003,'2026-04','sales',NULL,541600.00),(600004,'2026-05','sales',NULL,538300.00),(600005,'2026-06','sales',NULL,544100.00),(600006,'2026-07','sales',NULL,545800.00),(600007,'2026-08','sales',NULL,542500.00),(600008,'2026-09','sales',NULL,545000.00),(600009,'2026-10','sales',NULL,548300.00),(600010,'2026-11','sales',NULL,550000.00),(600011,'2026-12','sales',NULL,553300.00),(600012,'2026-01','marketing',NULL,266700.00),(600013,'2026-02','marketing',NULL,267900.00),(600014,'2026-03','marketing',NULL,269600.00),(600015,'2026-04','marketing',NULL,270800.00),(600016,'2026-05','marketing',NULL,269200.00),(600017,'2026-06','marketing',NULL,272100.00),(600018,'2026-07','marketing',NULL,272900.00),(600019,'2026-08','marketing',NULL,271200.00),(600020,'2026-09','marketing',NULL,272500.00),(600021,'2026-10','marketing',NULL,274100.00),(600022,'2026-11','marketing',NULL,275000.00),(600023,'2026-12','marketing',NULL,276600.00);
/*!40000 ALTER TABLE `biz_labor_cost_monthly` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `biz_target_monthly`
--

DROP TABLE IF EXISTS `biz_target_monthly`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `biz_target_monthly` (
  `target_id` bigint NOT NULL COMMENT '目标ID',
  `year_month` char(7) NOT NULL COMMENT '月份；目标月份',
  `department_id` bigint DEFAULT NULL COMMENT '组织ID；组织目标',
  `staff_id` bigint DEFAULT NULL COMMENT '人员ID；人员目标',
  `channel_id` bigint DEFAULT NULL COMMENT '渠道ID；渠道目标',
  `version_id` bigint DEFAULT NULL COMMENT '版本ID；版本目标',
  `target_amount_yuan` decimal(18,2) NOT NULL DEFAULT '0.00' COMMENT '回款目标；目标完成率分母',
  `target_opening_count` int NOT NULL DEFAULT '0' COMMENT '开户目标；开户目标分母',
  `target_order_count` int NOT NULL DEFAULT '0' COMMENT '订单目标；成交/交付目标',
  PRIMARY KEY (`target_id`),
  KEY `idx_year_month` (`year_month`),
  KEY `idx_department_id` (`department_id`),
  KEY `idx_staff_id` (`staff_id`),
  KEY `idx_channel_id` (`channel_id`),
  KEY `idx_version_id` (`version_id`),
  CONSTRAINT `fk_biz_target_monthly_channel_id` FOREIGN KEY (`channel_id`) REFERENCES `dim_channel` (`channel_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_biz_target_monthly_department_id` FOREIGN KEY (`department_id`) REFERENCES `dim_department` (`department_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_biz_target_monthly_staff_id` FOREIGN KEY (`staff_id`) REFERENCES `dim_staff` (`staff_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_biz_target_monthly_version_id` FOREIGN KEY (`version_id`) REFERENCES `dim_product_version` (`version_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='月度目标维护表；回款目标、开户目标、渠道/人员/版本目标；本月/本年目标完成、渠道完成、开户数';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `biz_target_monthly`
--

LOCK TABLES `biz_target_monthly` WRITE;
/*!40000 ALTER TABLE `biz_target_monthly` DISABLE KEYS */;
INSERT INTO `biz_target_monthly` VALUES (400000,'2026-01',NULL,2001,NULL,NULL,623200.00,5,12),(400001,'2026-02',NULL,2001,NULL,NULL,668800.00,5,13),(400002,'2026-03',NULL,2001,NULL,NULL,729600.00,6,14),(400003,'2026-04',NULL,2001,NULL,NULL,775200.00,6,15),(400004,'2026-05',NULL,2001,NULL,NULL,714400.00,5,14),(400005,'2026-06',NULL,2001,NULL,NULL,820800.00,6,16),(400006,'2026-07',NULL,2001,NULL,NULL,851200.00,7,16),(400007,'2026-08',NULL,2001,NULL,NULL,790400.00,6,15),(400008,'2026-09',NULL,2001,NULL,NULL,836000.00,6,16),(400009,'2026-10',NULL,2001,NULL,NULL,896800.00,7,17),(400010,'2026-11',NULL,2001,NULL,NULL,927200.00,7,18),(400011,'2026-12',NULL,2001,NULL,NULL,988000.00,8,19),(400012,'2026-01',NULL,2002,NULL,NULL,565800.00,4,11),(400013,'2026-02',NULL,2002,NULL,NULL,607200.00,5,12),(400014,'2026-03',NULL,2002,NULL,NULL,662400.00,5,13),(400015,'2026-04',NULL,2002,NULL,NULL,703800.00,5,14),(400016,'2026-05',NULL,2002,NULL,NULL,648600.00,5,12),(400017,'2026-06',NULL,2002,NULL,NULL,745200.00,6,14),(400018,'2026-07',NULL,2002,NULL,NULL,772800.00,6,15),(400019,'2026-08',NULL,2002,NULL,NULL,717600.00,6,14),(400020,'2026-09',NULL,2002,NULL,NULL,759000.00,6,15),(400021,'2026-10',NULL,2002,NULL,NULL,814200.00,6,16),(400022,'2026-11',NULL,2002,NULL,NULL,841800.00,6,16),(400023,'2026-12',NULL,2002,NULL,NULL,897000.00,7,17),(400024,'2026-01',NULL,2003,NULL,NULL,803600.00,6,15),(400025,'2026-02',NULL,2003,NULL,NULL,862400.00,7,17),(400026,'2026-03',NULL,2003,NULL,NULL,940800.00,7,18),(400027,'2026-04',NULL,2003,NULL,NULL,999600.00,8,19),(400028,'2026-05',NULL,2003,NULL,NULL,921200.00,7,18),(400029,'2026-06',NULL,2003,NULL,NULL,1058400.00,8,20),(400030,'2026-07',NULL,2003,NULL,NULL,1097600.00,8,21),(400031,'2026-08',NULL,2003,NULL,NULL,1019200.00,8,20),(400032,'2026-09',NULL,2003,NULL,NULL,1078000.00,8,21),(400033,'2026-10',NULL,2003,NULL,NULL,1156400.00,9,22),(400034,'2026-11',NULL,2003,NULL,NULL,1195600.00,9,23),(400035,'2026-12',NULL,2003,NULL,NULL,1274000.00,10,25),(400036,'2026-01',NULL,2004,NULL,NULL,738000.00,6,14),(400037,'2026-02',NULL,2004,NULL,NULL,792000.00,6,15),(400038,'2026-03',NULL,2004,NULL,NULL,864000.00,7,17),(400039,'2026-04',NULL,2004,NULL,NULL,918000.00,7,18),(400040,'2026-05',NULL,2004,NULL,NULL,846000.00,7,16),(400041,'2026-06',NULL,2004,NULL,NULL,972000.00,7,19),(400042,'2026-07',NULL,2004,NULL,NULL,1008000.00,8,19),(400043,'2026-08',NULL,2004,NULL,NULL,936000.00,7,18),(400044,'2026-09',NULL,2004,NULL,NULL,990000.00,8,19),(400045,'2026-10',NULL,2004,NULL,NULL,1062000.00,8,20),(400046,'2026-11',NULL,2004,NULL,NULL,1098000.00,8,21),(400047,'2026-12',NULL,2004,NULL,NULL,1170000.00,9,23),(400048,'2026-01',NULL,2005,NULL,NULL,426400.00,3,8),(400049,'2026-02',NULL,2005,NULL,NULL,457600.00,4,9),(400050,'2026-03',NULL,2005,NULL,NULL,499200.00,4,10),(400051,'2026-04',NULL,2005,NULL,NULL,530400.00,4,10),(400052,'2026-05',NULL,2005,NULL,NULL,488800.00,4,9),(400053,'2026-06',NULL,2005,NULL,NULL,561600.00,4,11),(400054,'2026-07',NULL,2005,NULL,NULL,582400.00,4,11),(400055,'2026-08',NULL,2005,NULL,NULL,540800.00,4,10),(400056,'2026-09',NULL,2005,NULL,NULL,572000.00,4,11),(400057,'2026-10',NULL,2005,NULL,NULL,613600.00,5,12),(400058,'2026-11',NULL,2005,NULL,NULL,634400.00,5,12),(400059,'2026-12',NULL,2005,NULL,NULL,676000.00,5,13);
/*!40000 ALTER TABLE `biz_target_monthly` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dim_ai_scene`
--

DROP TABLE IF EXISTS `dim_ai_scene`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dim_ai_scene` (
  `scene_key` varchar(80) NOT NULL COMMENT '场景键；场景唯一键',
  `scene_name` varchar(100) NOT NULL COMMENT '场景名称；页面展示/审计',
  `prompt_template` text COMMENT '提示词模板；AI系统提示词',
  `is_enabled` tinyint(1) NOT NULL DEFAULT '1' COMMENT '是否启用；控制功能启用',
  PRIMARY KEY (`scene_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='AI场景表；AI 分析、小人悬浮气泡、风险提醒等场景字典；AIAnalysisWidget、Mascot3DStage';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dim_ai_scene`
--

LOCK TABLES `dim_ai_scene` WRITE;
/*!40000 ALTER TABLE `dim_ai_scene` DISABLE KEYS */;
INSERT INTO `dim_ai_scene` VALUES ('analyze','AI经营分析','页面数据快照 + 用户问题，输出 CEO 经营分析。',1),('hover_cue','AI悬浮气泡','悬浮文字 + 页面数据快照，输出一句经营提示。',1);
/*!40000 ALTER TABLE `dim_ai_scene` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dim_channel`
--

DROP TABLE IF EXISTS `dim_channel`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dim_channel` (
  `channel_id` bigint NOT NULL COMMENT '渠道ID',
  `channel_key` varchar(50) NOT NULL COMMENT '渠道键；前端稳定键',
  `channel_name` varchar(100) NOT NULL COMMENT '渠道名称；页面展示',
  `parent_id` bigint DEFAULT NULL COMMENT '上级渠道ID；渠道树',
  `zone_name` varchar(100) DEFAULT NULL COMMENT '战区名称；线下战区标识',
  `city_list_json` json DEFAULT NULL COMMENT '城市列表JSON；城市标签',
  `is_enabled` tinyint(1) NOT NULL DEFAULT '1' COMMENT '是否启用；是否参与统计',
  PRIMARY KEY (`channel_id`),
  KEY `idx_channel_key` (`channel_key`),
  KEY `idx_parent_id` (`parent_id`),
  CONSTRAINT `fk_dim_channel_parent_id` FOREIGN KEY (`parent_id`) REFERENCES `dim_channel` (`channel_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='渠道大类表；线上、华南线下、华东线下、代理四类经营维度；渠道完成、KPI 二级筛选、开户数二级筛选';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dim_channel`
--

LOCK TABLES `dim_channel` WRITE;
/*!40000 ALTER TABLE `dim_channel` DISABLE KEYS */;
INSERT INTO `dim_channel` VALUES (3001,'online','线上',NULL,NULL,NULL,1),(3002,'south','华南线下',NULL,NULL,NULL,1),(3003,'east','华东线下',NULL,NULL,NULL,1),(3004,'agent','代理',NULL,NULL,NULL,1);
/*!40000 ALTER TABLE `dim_channel` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dim_channel_source`
--

DROP TABLE IF EXISTS `dim_channel_source`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dim_channel_source` (
  `source_id` bigint NOT NULL COMMENT '来源ID',
  `source_code` varchar(100) NOT NULL COMMENT '来源编码；来源唯一键',
  `source_name` varchar(200) NOT NULL COMMENT '来源名称；页面展示',
  `channel_id` bigint DEFAULT NULL COMMENT '归属渠道ID；渠道归因',
  `is_excluded` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否排除；是否排除统计',
  PRIMARY KEY (`source_id`),
  KEY `idx_source_code` (`source_code`),
  KEY `idx_channel_id` (`channel_id`),
  CONSTRAINT `fk_dim_channel_source_channel_id` FOREIGN KEY (`channel_id`) REFERENCES `dim_channel` (`channel_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='线索来源表；外部来源归属渠道，支撑渠道映射和成本归因；渠道维护、渠道归因、ROI';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dim_channel_source`
--

LOCK TABLES `dim_channel_source` WRITE;
/*!40000 ALTER TABLE `dim_channel_source` DISABLE KEYS */;
INSERT INTO `dim_channel_source` VALUES (7001,'1001','百度搜索',3001,0),(7002,'1002','巨量广告',3001,0),(7003,'2001','广州会销',3002,0),(7004,'2002','杭州会销',3003,0),(7005,'3001','老客转介绍',3001,0),(7006,'4001','代理商报备',3004,0),(7099,'9999','测试来源',NULL,1);
/*!40000 ALTER TABLE `dim_channel_source` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dim_compute_resource`
--

DROP TABLE IF EXISTS `dim_compute_resource`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dim_compute_resource` (
  `resource_key` varchar(80) NOT NULL COMMENT '资源键；资源唯一键',
  `resource_name` varchar(100) NOT NULL COMMENT '资源名称；页面展示',
  `resource_color` varchar(30) DEFAULT NULL COMMENT '展示颜色；图表配色',
  `is_enabled` tinyint(1) NOT NULL DEFAULT '1' COMMENT '是否启用；控制展示',
  PRIMARY KEY (`resource_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='算力资源表；自动回复、商品同步、会眼智宝等算力资源类型；算力资源健康、算力用量分析';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dim_compute_resource`
--

LOCK TABLES `dim_compute_resource` WRITE;
/*!40000 ALTER TABLE `dim_compute_resource` DISABLE KEYS */;
INSERT INTO `dim_compute_resource` VALUES ('dialog-test','对话测试',NULL,1),('guard','后置回复拦截',NULL,1),('reply','自动回复',NULL,1),('smart-eye','会眼智宝',NULL,1),('sync','商品同步',NULL,1),('vision','视频识别',NULL,1);
/*!40000 ALTER TABLE `dim_compute_resource` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dim_compute_usage_bucket`
--

DROP TABLE IF EXISTS `dim_compute_usage_bucket`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dim_compute_usage_bucket` (
  `bucket_key` varchar(80) NOT NULL COMMENT '分桶键；分桶唯一键',
  `bucket_name` varchar(120) NOT NULL COMMENT '分桶名称；图表展示',
  `lower_bound` bigint DEFAULT NULL COMMENT '下界；分桶下界',
  `upper_bound` bigint DEFAULT NULL COMMENT '上界；分桶上界',
  `sort_order` int NOT NULL DEFAULT '0' COMMENT '排序；分桶排序',
  PRIMARY KEY (`bucket_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='算力用量分桶表；算力用量分布图的客户分层口径；算力用量分布';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dim_compute_usage_bucket`
--

LOCK TABLES `dim_compute_usage_bucket` WRITE;
/*!40000 ALTER TABLE `dim_compute_usage_bucket` DISABLE KEYS */;
INSERT INTO `dim_compute_usage_bucket` VALUES ('bucket_01','算力用量=0',NULL,NULL,10),('bucket_02','0<算力用量<=100',NULL,NULL,20),('bucket_03','100<算力用量<=1000',NULL,NULL,30),('bucket_04','1000<算力用量<=5000',NULL,NULL,40),('bucket_05','5000<算力用量<=10000',NULL,NULL,50),('bucket_06','算力用量>10000',NULL,NULL,60);
/*!40000 ALTER TABLE `dim_compute_usage_bucket` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dim_department`
--

DROP TABLE IF EXISTS `dim_department`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dim_department` (
  `department_id` bigint NOT NULL COMMENT '组织ID；主键',
  `department_code` varchar(50) NOT NULL COMMENT '组织编码；稳定编码',
  `department_name` varchar(100) NOT NULL COMMENT '组织名称；页面展示',
  `parent_id` bigint DEFAULT NULL COMMENT '上级组织ID；树形结构',
  `sort_order` int DEFAULT '0' COMMENT '排序；展示排序',
  `is_enabled` tinyint(1) NOT NULL DEFAULT '1' COMMENT '是否启用；离职/停用控制',
  PRIMARY KEY (`department_id`),
  KEY `idx_department_code` (`department_code`),
  KEY `idx_parent_id` (`parent_id`),
  CONSTRAINT `fk_dim_department_parent_id` FOREIGN KEY (`parent_id`) REFERENCES `dim_department` (`department_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='组织表；组织、战区、部门树；组织维护、目标筛选、权限范围';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dim_department`
--

LOCK TABLES `dim_department` WRITE;
/*!40000 ALTER TABLE `dim_department` DISABLE KEYS */;
INSERT INTO `dim_department` VALUES (1001,'headquarters','成都福客人工智能',NULL,0,1),(1002,'online-sales','线上销售部',1001,10,1),(1003,'offline-sales','线下销售部',1001,20,1),(1004,'south-sales','华南战区',1003,30,1),(1005,'east-sales','华东战区',1003,40,1),(1006,'agent-sales','代理渠道部',1001,50,1),(1099,'paused-team','历史停用团队',1001,60,0);
/*!40000 ALTER TABLE `dim_department` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dim_menu`
--

DROP TABLE IF EXISTS `dim_menu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dim_menu` (
  `menu_key` varchar(50) NOT NULL COMMENT '菜单键；导航唯一键',
  `menu_name` varchar(100) NOT NULL COMMENT '菜单名称；左侧菜单展示',
  `channel_key` varchar(50) DEFAULT NULL COMMENT '默认渠道；菜单默认数据范围',
  `sort_order` int NOT NULL DEFAULT '0' COMMENT '排序；菜单展示顺序',
  `is_enabled` tinyint(1) NOT NULL DEFAULT '1' COMMENT '是否启用；控制入口显隐',
  PRIMARY KEY (`menu_key`),
  KEY `idx_channel_key` (`channel_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='导航菜单表；经营总览、算力用量分析等左侧菜单和页面上下文；Sidebar、App';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dim_menu`
--

LOCK TABLES `dim_menu` WRITE;
/*!40000 ALTER TABLE `dim_menu` DISABLE KEYS */;
INSERT INTO `dim_menu` VALUES ('compute','算力用量分析','all',20,1),('overview','经营总览','all',10,1);
/*!40000 ALTER TABLE `dim_menu` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dim_product_version`
--

DROP TABLE IF EXISTS `dim_product_version`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dim_product_version` (
  `version_id` bigint NOT NULL COMMENT '版本ID',
  `version_key` varchar(50) NOT NULL COMMENT '版本键；前端稳定键',
  `version_name` varchar(100) NOT NULL COMMENT '版本名称；页面展示',
  `standard_price_yuan` decimal(18,2) DEFAULT '0.00' COMMENT '标准价格；版本价格',
  `version_type` varchar(50) DEFAULT NULL COMMENT '版本类型；主版本/试用/增购包',
  `sort_order` int DEFAULT '0' COMMENT '排序；图表排序',
  `is_trial` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否试用版；试用版识别',
  `is_enabled` tinyint(1) NOT NULL DEFAULT '1' COMMENT '是否启用；控制统计范围',
  PRIMARY KEY (`version_id`),
  KEY `idx_version_key` (`version_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='产品版本表；启航、卓越、至尊、定制、试用、增购包等版本字典；版本情况、版本二级弹窗、续费率、算力版本消耗';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dim_product_version`
--

LOCK TABLES `dim_product_version` WRITE;
/*!40000 ALTER TABLE `dim_product_version` DISABLE KEYS */;
INSERT INTO `dim_product_version` VALUES (5001,'qihang','启航版',16800.00,'main',10,0,1),(5002,'zhuoyue','卓越版',39800.00,'main',20,0,1),(5003,'zhizun','至尊版',99800.00,'main',30,0,1),(5004,'custom','定制版',188000.00,'main',40,0,1),(5005,'trial','试用版',0.00,'trial',50,1,1),(5006,'addon','增购包',6800.00,'addon',60,0,1);
/*!40000 ALTER TABLE `dim_product_version` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dim_staff`
--

DROP TABLE IF EXISTS `dim_staff`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dim_staff` (
  `staff_id` bigint NOT NULL COMMENT '人员ID；主键',
  `staff_code` varchar(50) NOT NULL COMMENT '人员编码；稳定编码',
  `staff_name` varchar(100) NOT NULL COMMENT '人员姓名；页面展示',
  `department_id` bigint DEFAULT NULL COMMENT '所属组织ID；组织筛选',
  `channel_key` varchar(50) DEFAULT NULL COMMENT '销售渠道键；销售维度多选',
  `external_bi_user_id` varchar(100) DEFAULT NULL COMMENT 'BI人员ID；外部映射',
  `is_sales` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否销售；销售筛选',
  `is_delivery` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否实施；交付看板',
  `is_success` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否客户成功；算力客户成功负责人',
  `is_enabled` tinyint(1) NOT NULL DEFAULT '1' COMMENT '是否启用；人员停用控制',
  PRIMARY KEY (`staff_id`),
  KEY `idx_staff_code` (`staff_code`),
  KEY `idx_department_id` (`department_id`),
  KEY `idx_channel_key` (`channel_key`),
  KEY `idx_external_bi_user_id` (`external_bi_user_id`),
  CONSTRAINT `fk_dim_staff_department_id` FOREIGN KEY (`department_id`) REFERENCES `dim_department` (`department_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='人员表；销售、实施、客户成功和系统账号对应人员；销售人员明细、交付看板、算力客户排行';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dim_staff`
--

LOCK TABLES `dim_staff` WRITE;
/*!40000 ALTER TABLE `dim_staff` DISABLE KEYS */;
INSERT INTO `dim_staff` VALUES (2001,'staff_2001','王丽英',1002,'online','wl_10086',1,0,0,1),(2002,'staff_2002','李思雨',1002,'online','wl_10087',1,0,0,1),(2003,'staff_2003','杨磊',1004,'south','wl_10091',1,0,0,1),(2004,'staff_2004','马骏',1005,'east','wl_10095',1,0,0,1),(2005,'staff_2005','南唐代理',1006,'agent','wl_partner_01',1,0,0,1),(2099,'staff_2099','旧账号样本',1099,NULL,'wl_archived_01',0,0,0,0),(2101,'DEL-2101','陈晨',NULL,NULL,NULL,0,1,0,1),(2102,'DEL-2102','赵晴',NULL,NULL,NULL,0,1,0,1),(2103,'DEL-2103','韩宇',NULL,NULL,NULL,0,1,0,1),(2104,'DEL-2104','周宁',NULL,NULL,NULL,0,1,0,1),(2105,'DEL-2105','秦佳',NULL,NULL,NULL,0,1,0,1),(2201,'CS-2201','沈悦',NULL,NULL,NULL,0,0,1,1),(2202,'CS-2202','罗琪',NULL,NULL,NULL,0,0,1,1),(2203,'CS-2203','许安',NULL,NULL,NULL,0,0,1,1);
/*!40000 ALTER TABLE `dim_staff` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fact_ai_interaction`
--

DROP TABLE IF EXISTS `fact_ai_interaction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fact_ai_interaction` (
  `interaction_id` bigint NOT NULL COMMENT '交互ID',
  `scene_key` varchar(80) NOT NULL COMMENT '场景键；analyze/hover_cue',
  `question_text` text COMMENT '问题文本；用户问题或悬浮文字',
  `snapshot_hash` varchar(80) DEFAULT NULL COMMENT '快照哈希；页面数据快照去重',
  `response_text` text COMMENT '返回文本；AI返回内容',
  `model_name` varchar(120) DEFAULT NULL COMMENT '模型名称；DashScope模型',
  `created_at` datetime NOT NULL COMMENT '创建时间；审计时间',
  PRIMARY KEY (`interaction_id`),
  KEY `idx_scene_key` (`scene_key`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_fact_ai_interaction_scene_key` FOREIGN KEY (`scene_key`) REFERENCES `dim_ai_scene` (`scene_key`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='AI交互记录表；AI 经营分析和文字悬浮气泡请求审计；/api/ai/analyze、/api/ai/hover-cue';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fact_ai_interaction`
--

LOCK TABLES `fact_ai_interaction` WRITE;
/*!40000 ALTER TABLE `fact_ai_interaction` DISABLE KEYS */;
/*!40000 ALTER TABLE `fact_ai_interaction` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fact_compute_customer_daily`
--

DROP TABLE IF EXISTS `fact_compute_customer_daily`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fact_compute_customer_daily` (
  `id` bigint NOT NULL COMMENT '记录ID',
  `stat_date` date NOT NULL COMMENT '统计日期；客户排行日期',
  `customer_phone_masked` varchar(50) DEFAULT NULL COMMENT '脱敏手机号；客户标识',
  `customer_name` varchar(200) DEFAULT NULL COMMENT '客户名称；客户展示',
  `account_type` varchar(100) DEFAULT NULL COMMENT '账号版本；账号版本筛选',
  `sales_owner_id` bigint DEFAULT NULL COMMENT '销售负责人ID；销售负责人筛选',
  `success_owner_id` bigint DEFAULT NULL COMMENT '客成负责人ID；客成负责人筛选',
  `usage_points` bigint NOT NULL DEFAULT '0' COMMENT '用量；客户用量',
  `balance_points` bigint NOT NULL DEFAULT '0' COMMENT '余额；客户余额',
  `average_reply_rate` decimal(5,2) NOT NULL DEFAULT '0.00' COMMENT '平均回复率；回复效率',
  PRIMARY KEY (`id`),
  KEY `idx_stat_date` (`stat_date`),
  KEY `idx_sales_owner_id` (`sales_owner_id`),
  KEY `idx_success_owner_id` (`success_owner_id`),
  CONSTRAINT `fk_fact_compute_customer_daily_sales_owner_id` FOREIGN KEY (`sales_owner_id`) REFERENCES `dim_staff` (`staff_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_fact_compute_customer_daily_success_owner_id` FOREIGN KEY (`success_owner_id`) REFERENCES `dim_staff` (`staff_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='算力客户日表；客户算力排行、余额、账号类型、销售和客成负责人；客户算力明细排行';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fact_compute_customer_daily`
--

LOCK TABLES `fact_compute_customer_daily` WRITE;
/*!40000 ALTER TABLE `fact_compute_customer_daily` DISABLE KEYS */;
INSERT INTO `fact_compute_customer_daily` VALUES (906000,'2026-06-30','138****6300','星河服饰旗舰店','旗舰店',2001,2201,920000,14600000,86.50),(906001,'2026-06-30','138****6301','山海户外专营店','专营店',2002,2202,1058000,13770000,87.85),(906002,'2026-06-30','138****6302','知微家居馆','企业店',2003,2203,1196000,12940000,89.20),(906003,'2026-06-30','138****6303','南桥母婴店','旗舰店',2004,2201,1334000,12110000,90.55),(906004,'2026-06-30','138****6304','一橙数码店','专营店',2005,2202,1472000,11280000,91.90),(906005,'2026-06-30','138****6305','乐町美妆集合店','企业店',2001,2203,1610000,10450000,93.25),(906006,'2026-06-30','138****6306','青禾食品铺','旗舰店',2002,2201,1748000,9620000,94.60),(906007,'2026-06-30','138****6307','远帆文创社','专营店',2003,2202,1886000,8790000,95.95);
/*!40000 ALTER TABLE `fact_compute_customer_daily` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fact_compute_resource_health_daily`
--

DROP TABLE IF EXISTS `fact_compute_resource_health_daily`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fact_compute_resource_health_daily` (
  `id` bigint NOT NULL COMMENT '记录ID',
  `stat_date` date NOT NULL COMMENT '统计日期；统计日期',
  `resource_key` varchar(80) NOT NULL COMMENT '资源键；资源维度',
  `usage_rate` decimal(5,2) NOT NULL DEFAULT '0.00' COMMENT '用量占比；资源使用占比',
  `trend_text` varchar(30) DEFAULT NULL COMMENT '趋势文本；页面展示',
  `state_text` varchar(80) DEFAULT NULL COMMENT '状态文本；页面展示',
  `tone` varchar(30) DEFAULT NULL COMMENT '状态色调；预警样式',
  PRIMARY KEY (`id`),
  KEY `idx_stat_date` (`stat_date`),
  KEY `idx_resource_key` (`resource_key`),
  CONSTRAINT `fk_fact_compute_resource_health_daily_resource_key` FOREIGN KEY (`resource_key`) REFERENCES `dim_compute_resource` (`resource_key`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='算力资源健康表；各资源用量占比、趋势和状态；算力资源健康';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fact_compute_resource_health_daily`
--

LOCK TABLES `fact_compute_resource_health_daily` WRITE;
/*!40000 ALTER TABLE `fact_compute_resource_health_daily` DISABLE KEYS */;
INSERT INTO `fact_compute_resource_health_daily` VALUES (907000,'2026-06-30','reply',76.50,'较昨日 +3.2%','稳定高效','good'),(907001,'2026-06-30','guard',68.20,'较昨日 +1.1%','健康','good'),(907002,'2026-06-30','sync',61.80,'较昨日 -0.8%','观察','neutral'),(907003,'2026-06-30','vision',54.70,'较昨日 +4.5%','增长','good'),(907004,'2026-06-30','smart-eye',49.40,'较昨日 +2.0%','平稳','neutral'),(907005,'2026-06-30','dialog-test',38.60,'较昨日 -1.5%','低负载','muted');
/*!40000 ALTER TABLE `fact_compute_resource_health_daily` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fact_compute_usage_daily`
--

DROP TABLE IF EXISTS `fact_compute_usage_daily`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fact_compute_usage_daily` (
  `id` bigint NOT NULL COMMENT '记录ID',
  `stat_date` date NOT NULL COMMENT '统计日期；算力趋势日期',
  `usage_points` bigint NOT NULL DEFAULT '0' COMMENT '算力用量；消耗算力',
  `added_points` bigint NOT NULL DEFAULT '0' COMMENT '新增算力；新增/扩容',
  `capacity_points` bigint NOT NULL DEFAULT '0' COMMENT '容量；总容量趋势',
  `target_points` bigint NOT NULL DEFAULT '0' COMMENT '目标用量；目标完成率',
  PRIMARY KEY (`id`),
  KEY `idx_stat_date` (`stat_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='算力用量日表；算力用量、新增、容量、目标，支持年/月/日趋势；算力用量趋势、算力总容量趋势、算力 KPI';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fact_compute_usage_daily`
--

LOCK TABLES `fact_compute_usage_daily` WRITE;
/*!40000 ALTER TABLE `fact_compute_usage_daily` DISABLE KEYS */;
INSERT INTO `fact_compute_usage_daily` VALUES (905001,'2026-06-01',2559000,781000,220350000,4148000),(905002,'2026-06-02',2668000,802000,222700000,4196000),(905003,'2026-06-03',2777000,823000,225050000,4244000),(905004,'2026-06-04',2814000,844000,227400000,4292000),(905005,'2026-06-05',2923000,865000,229750000,4340000),(905006,'2026-06-06',3032000,886000,232100000,4388000),(905007,'2026-06-07',3141000,907000,234450000,4436000),(905008,'2026-06-08',3178000,928000,236800000,4484000),(905009,'2026-06-09',3287000,949000,239150000,4532000),(905010,'2026-06-10',3396000,970000,241500000,4580000),(905011,'2026-06-11',3505000,991000,243850000,4628000),(905012,'2026-06-12',3542000,1012000,246200000,4676000),(905013,'2026-06-13',3651000,1033000,248550000,4724000),(905014,'2026-06-14',3760000,1054000,250900000,4772000),(905015,'2026-06-15',3869000,1075000,253250000,4820000),(905016,'2026-06-16',3906000,1096000,255600000,4868000),(905017,'2026-06-17',4015000,1117000,257950000,4916000),(905018,'2026-06-18',4124000,1138000,260300000,4964000),(905019,'2026-06-19',4233000,1159000,262650000,5012000),(905020,'2026-06-20',4270000,1180000,265000000,5060000),(905021,'2026-06-21',4379000,1201000,267350000,5108000),(905022,'2026-06-22',4488000,1222000,269700000,5156000),(905023,'2026-06-23',4597000,1243000,272050000,5204000),(905024,'2026-06-24',4634000,1264000,274400000,5252000),(905025,'2026-06-25',4743000,1285000,276750000,5300000),(905026,'2026-06-26',4852000,1306000,279100000,5348000),(905027,'2026-06-27',4961000,1327000,281450000,5396000),(905028,'2026-06-28',4998000,1348000,283800000,5444000),(905029,'2026-06-29',5107000,1369000,286150000,5492000),(905030,'2026-06-30',5216000,1390000,288500000,5540000);
/*!40000 ALTER TABLE `fact_compute_usage_daily` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fact_compute_usage_distribution_daily`
--

DROP TABLE IF EXISTS `fact_compute_usage_distribution_daily`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fact_compute_usage_distribution_daily` (
  `id` bigint NOT NULL COMMENT '记录ID',
  `stat_date` date NOT NULL COMMENT '统计日期；统计日期',
  `bucket_key` varchar(80) NOT NULL COMMENT '分桶键；分桶维度',
  `customer_weight` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '客户占比权重；饼图权重',
  PRIMARY KEY (`id`),
  KEY `idx_stat_date` (`stat_date`),
  KEY `idx_bucket_key` (`bucket_key`),
  CONSTRAINT `fk_fact_compute_usage_distribution_daily_bucket_key` FOREIGN KEY (`bucket_key`) REFERENCES `dim_compute_usage_bucket` (`bucket_key`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='算力用量分布表；各算力用量分桶的客户占比权重；算力用量分布饼图';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fact_compute_usage_distribution_daily`
--

LOCK TABLES `fact_compute_usage_distribution_daily` WRITE;
/*!40000 ALTER TABLE `fact_compute_usage_distribution_daily` DISABLE KEYS */;
INSERT INTO `fact_compute_usage_distribution_daily` VALUES (908000,'2026-06-30','bucket_01',4.00),(908001,'2026-06-30','bucket_02',11.00),(908002,'2026-06-30','bucket_03',28.00),(908003,'2026-06-30','bucket_04',31.00),(908004,'2026-06-30','bucket_05',17.00),(908005,'2026-06-30','bucket_06',9.00);
/*!40000 ALTER TABLE `fact_compute_usage_distribution_daily` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fact_compute_version_consumption_daily`
--

DROP TABLE IF EXISTS `fact_compute_version_consumption_daily`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fact_compute_version_consumption_daily` (
  `id` bigint NOT NULL COMMENT '记录ID',
  `stat_date` date NOT NULL COMMENT '统计日期；统计日期',
  `version_name` varchar(100) NOT NULL COMMENT '版本名称；图表名称',
  `consumption_weight` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '消耗权重；饼图权重',
  PRIMARY KEY (`id`),
  KEY `idx_stat_date` (`stat_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='版本算力消耗表；各产品版本算力消耗权重；各版本算力消耗饼图';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fact_compute_version_consumption_daily`
--

LOCK TABLES `fact_compute_version_consumption_daily` WRITE;
/*!40000 ALTER TABLE `fact_compute_version_consumption_daily` DISABLE KEYS */;
INSERT INTO `fact_compute_version_consumption_daily` VALUES (909000,'2026-06-30','启航版',18.00),(909001,'2026-06-30','卓越版',25.00),(909002,'2026-06-30','至尊版',21.00),(909003,'2026-06-30','定制版',16.00),(909004,'2026-06-30','试用版',6.00),(909005,'2026-06-30','增购包',14.00);
/*!40000 ALTER TABLE `fact_compute_version_consumption_daily` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fact_delivery_order`
--

DROP TABLE IF EXISTS `fact_delivery_order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fact_delivery_order` (
  `delivery_order_id` bigint NOT NULL COMMENT '交付订单ID',
  `delivery_date` date NOT NULL COMMENT '交付日期；交付月份',
  `engineer_id` bigint NOT NULL COMMENT '实施工程师ID；实施人效',
  `customer_name` varchar(200) DEFAULT NULL COMMENT '客户名称；明细追踪',
  `order_price_yuan` decimal(18,2) NOT NULL DEFAULT '0.00' COMMENT '订单价值；人均价值',
  `knowledge_base_configured` tinyint(1) NOT NULL DEFAULT '1' COMMENT '是否完成知识库配置；交付口径',
  PRIMARY KEY (`delivery_order_id`),
  KEY `idx_engineer_id` (`engineer_id`),
  CONSTRAINT `fk_fact_delivery_order_engineer_id` FOREIGN KEY (`engineer_id`) REFERENCES `dim_staff` (`staff_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='交付订单表；实施工程师交付订单、客户均价、金额价值；交付看板';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fact_delivery_order`
--

LOCK TABLES `fact_delivery_order` WRITE;
/*!40000 ALTER TABLE `fact_delivery_order` DISABLE KEYS */;
INSERT INTO `fact_delivery_order` VALUES (910000,'2026-06-01',2101,'陈晨客户01',15200.00,0),(910001,'2026-06-02',2101,'陈晨客户02',15800.00,1),(910002,'2026-06-03',2101,'陈晨客户03',16400.00,1),(910003,'2026-06-04',2101,'陈晨客户04',17000.00,1),(910004,'2026-06-05',2101,'陈晨客户05',15200.00,1),(910005,'2026-06-06',2101,'陈晨客户06',15800.00,0),(910006,'2026-06-07',2101,'陈晨客户07',16400.00,1),(910007,'2026-06-08',2101,'陈晨客户08',17000.00,1),(910008,'2026-06-09',2101,'陈晨客户09',15200.00,1),(910009,'2026-06-10',2101,'陈晨客户10',15800.00,1),(910010,'2026-06-11',2101,'陈晨客户11',16400.00,0),(910011,'2026-06-12',2101,'陈晨客户12',17000.00,1),(910012,'2026-06-13',2101,'陈晨客户13',15200.00,1),(910013,'2026-06-14',2101,'陈晨客户14',15800.00,1),(910014,'2026-06-15',2101,'陈晨客户15',16400.00,1),(910015,'2026-06-16',2101,'陈晨客户16',17000.00,0),(910016,'2026-06-17',2101,'陈晨客户17',15200.00,1),(910017,'2026-06-18',2101,'陈晨客户18',15800.00,1),(910018,'2026-06-19',2101,'陈晨客户19',16400.00,1),(910019,'2026-06-01',2102,'赵晴客户01',14800.00,0),(910020,'2026-06-02',2102,'赵晴客户02',15400.00,1),(910021,'2026-06-03',2102,'赵晴客户03',16000.00,1),(910022,'2026-06-04',2102,'赵晴客户04',16600.00,1),(910023,'2026-06-05',2102,'赵晴客户05',14800.00,1),(910024,'2026-06-06',2102,'赵晴客户06',15400.00,0),(910025,'2026-06-07',2102,'赵晴客户07',16000.00,1),(910026,'2026-06-08',2102,'赵晴客户08',16600.00,1),(910027,'2026-06-09',2102,'赵晴客户09',14800.00,1),(910028,'2026-06-10',2102,'赵晴客户10',15400.00,1),(910029,'2026-06-11',2102,'赵晴客户11',16000.00,0),(910030,'2026-06-12',2102,'赵晴客户12',16600.00,1),(910031,'2026-06-13',2102,'赵晴客户13',14800.00,1),(910032,'2026-06-14',2102,'赵晴客户14',15400.00,1),(910033,'2026-06-15',2102,'赵晴客户15',16000.00,1),(910034,'2026-06-16',2102,'赵晴客户16',16600.00,0),(910035,'2026-06-17',2102,'赵晴客户17',14800.00,1),(910036,'2026-06-01',2103,'韩宇客户01',13300.00,0),(910037,'2026-06-02',2103,'韩宇客户02',13900.00,1),(910038,'2026-06-03',2103,'韩宇客户03',14500.00,1),(910039,'2026-06-04',2103,'韩宇客户04',15100.00,1),(910040,'2026-06-05',2103,'韩宇客户05',13300.00,1),(910041,'2026-06-06',2103,'韩宇客户06',13900.00,0),(910042,'2026-06-07',2103,'韩宇客户07',14500.00,1),(910043,'2026-06-08',2103,'韩宇客户08',15100.00,1),(910044,'2026-06-09',2103,'韩宇客户09',13300.00,1),(910045,'2026-06-10',2103,'韩宇客户10',13900.00,1),(910046,'2026-06-11',2103,'韩宇客户11',14500.00,0),(910047,'2026-06-12',2103,'韩宇客户12',15100.00,1),(910048,'2026-06-13',2103,'韩宇客户13',13300.00,1),(910049,'2026-06-14',2103,'韩宇客户14',13900.00,1),(910050,'2026-06-15',2103,'韩宇客户15',14500.00,1),(910051,'2026-06-01',2104,'周宁客户01',12900.00,0),(910052,'2026-06-02',2104,'周宁客户02',13500.00,1),(910053,'2026-06-03',2104,'周宁客户03',14100.00,1),(910054,'2026-06-04',2104,'周宁客户04',14700.00,1),(910055,'2026-06-05',2104,'周宁客户05',12900.00,1),(910056,'2026-06-06',2104,'周宁客户06',13500.00,0),(910057,'2026-06-07',2104,'周宁客户07',14100.00,1),(910058,'2026-06-08',2104,'周宁客户08',14700.00,1),(910059,'2026-06-09',2104,'周宁客户09',12900.00,1),(910060,'2026-06-10',2104,'周宁客户10',13500.00,1),(910061,'2026-06-11',2104,'周宁客户11',14100.00,0),(910062,'2026-06-12',2104,'周宁客户12',14700.00,1),(910063,'2026-06-13',2104,'周宁客户13',12900.00,1),(910064,'2026-06-01',2105,'秦佳客户01',11800.00,0),(910065,'2026-06-02',2105,'秦佳客户02',12400.00,1),(910066,'2026-06-03',2105,'秦佳客户03',13000.00,1),(910067,'2026-06-04',2105,'秦佳客户04',13600.00,1),(910068,'2026-06-05',2105,'秦佳客户05',11800.00,1),(910069,'2026-06-06',2105,'秦佳客户06',12400.00,0),(910070,'2026-06-07',2105,'秦佳客户07',13000.00,1),(910071,'2026-06-08',2105,'秦佳客户08',13600.00,1),(910072,'2026-06-09',2105,'秦佳客户09',11800.00,1),(910073,'2026-06-10',2105,'秦佳客户10',12400.00,1),(910074,'2026-06-11',2105,'秦佳客户11',13000.00,0),(910075,'2026-06-12',2105,'秦佳客户12',13600.00,1);
/*!40000 ALTER TABLE `fact_delivery_order` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fact_opening_account_daily`
--

DROP TABLE IF EXISTS `fact_opening_account_daily`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fact_opening_account_daily` (
  `id` bigint NOT NULL COMMENT '记录ID',
  `stat_date` date NOT NULL COMMENT '统计日期；开户日期',
  `channel_id` bigint DEFAULT NULL COMMENT '渠道ID；渠道开户数',
  `staff_id` bigint DEFAULT NULL COMMENT '销售人员ID；人员开户数',
  `opening_count` int NOT NULL DEFAULT '0' COMMENT '开户数；开户指标',
  `opening_metric_type` varchar(30) DEFAULT NULL COMMENT '开户指标类型；monthOpenings/todayOpenings',
  PRIMARY KEY (`id`),
  KEY `idx_stat_date` (`stat_date`),
  KEY `idx_channel_id` (`channel_id`),
  KEY `idx_staff_id` (`staff_id`),
  CONSTRAINT `fk_fact_opening_account_daily_channel_id` FOREIGN KEY (`channel_id`) REFERENCES `dim_channel` (`channel_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_fact_opening_account_daily_staff_id` FOREIGN KEY (`staff_id`) REFERENCES `dim_staff` (`staff_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='开户事实表；日级开户数，支持本月开户数和今日开户数二级趋势；本月开户数、今日开户数、KPI 二级弹窗';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fact_opening_account_daily`
--

LOCK TABLES `fact_opening_account_daily` WRITE;
/*!40000 ALTER TABLE `fact_opening_account_daily` DISABLE KEYS */;
INSERT INTO `fact_opening_account_daily` VALUES (903000,'2026-06-01',3002,2002,9,'month'),(903001,'2026-06-02',3003,2003,10,'month'),(903002,'2026-06-03',3004,2004,11,'month'),(903003,'2026-06-04',3001,2005,12,'month'),(903004,'2026-06-05',3002,2001,8,'month'),(903005,'2026-06-06',3003,2002,9,'month'),(903006,'2026-06-07',3004,2003,10,'month'),(903007,'2026-06-08',3001,2004,11,'month'),(903008,'2026-06-09',3002,2005,12,'month'),(903009,'2026-06-10',3003,2001,8,'month'),(903010,'2026-06-11',3004,2002,9,'month'),(903011,'2026-06-12',3001,2003,10,'month'),(903012,'2026-06-13',3002,2004,11,'month'),(903013,'2026-06-14',3003,2005,12,'month'),(903014,'2026-06-15',3004,2001,8,'month'),(903015,'2026-06-16',3001,2002,9,'month'),(903016,'2026-06-17',3002,2003,10,'month'),(903017,'2026-06-18',3003,2004,11,'month'),(903018,'2026-06-19',3004,2005,12,'month'),(903019,'2026-06-20',3001,2001,8,'month'),(903020,'2026-06-21',3002,2002,9,'month'),(903021,'2026-06-22',3003,2003,10,'month'),(903022,'2026-06-23',3004,2004,11,'month'),(903023,'2026-06-24',3001,2005,12,'month'),(903024,'2026-06-25',3002,2001,8,'month'),(903025,'2026-06-26',3003,2002,9,'month'),(903026,'2026-06-27',3004,2003,10,'month'),(903027,'2026-06-28',3001,2004,11,'month'),(903028,'2026-06-29',3002,2005,12,'month'),(903029,'2026-06-30',3003,2001,8,'month'),(903030,'2026-05-01',3003,2004,7,'month'),(903031,'2026-05-02',3004,2005,8,'month'),(903032,'2026-05-03',3001,2001,9,'month'),(903033,'2026-05-04',3002,2002,6,'month'),(903034,'2026-05-05',3003,2003,7,'month'),(903035,'2026-05-06',3004,2004,8,'month'),(903036,'2026-05-07',3001,2005,9,'month'),(903037,'2026-05-08',3002,2001,6,'month'),(903038,'2026-05-09',3003,2002,7,'month'),(903039,'2026-05-10',3004,2003,8,'month'),(903040,'2026-05-11',3001,2004,9,'month'),(903041,'2026-05-12',3002,2005,6,'month'),(903042,'2026-05-13',3003,2001,7,'month'),(903043,'2026-05-14',3004,2002,8,'month'),(903044,'2026-05-15',3001,2003,9,'month'),(903045,'2026-05-16',3002,2004,6,'month'),(903046,'2026-05-17',3003,2005,7,'month'),(903047,'2026-05-18',3004,2001,8,'month'),(903048,'2026-05-19',3001,2002,9,'month'),(903049,'2026-05-20',3002,2003,6,'month'),(903050,'2026-05-21',3003,2004,7,'month'),(903051,'2026-05-22',3004,2005,8,'month'),(903052,'2026-05-23',3001,2001,9,'month'),(903053,'2026-05-24',3002,2002,6,'month'),(903054,'2026-05-25',3003,2003,7,'month'),(903055,'2026-05-26',3004,2004,8,'month'),(903056,'2026-05-27',3001,2005,9,'month'),(903057,'2026-05-28',3002,2001,6,'month'),(903058,'2026-05-29',3003,2002,7,'month'),(903059,'2026-05-30',3004,2003,8,'month');
/*!40000 ALTER TABLE `fact_opening_account_daily` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fact_renewal_daily`
--

DROP TABLE IF EXISTS `fact_renewal_daily`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fact_renewal_daily` (
  `id` bigint NOT NULL COMMENT '记录ID',
  `stat_date` date NOT NULL COMMENT '统计日期；续费统计日期',
  `channel_id` bigint DEFAULT NULL COMMENT '渠道ID；渠道续费',
  `version_id` bigint DEFAULT NULL COMMENT '版本ID；版本续费',
  `due_count` int NOT NULL DEFAULT '0' COMMENT '到期客户数；续费率分母',
  `renewed_count` int NOT NULL DEFAULT '0' COMMENT '已续客户数；续费率分子',
  `renewal_amount_yuan` decimal(18,2) NOT NULL DEFAULT '0.00' COMMENT '续费金额；续费收入',
  PRIMARY KEY (`id`),
  KEY `idx_stat_date` (`stat_date`),
  KEY `idx_channel_id` (`channel_id`),
  KEY `idx_version_id` (`version_id`),
  CONSTRAINT `fk_fact_renewal_daily_channel_id` FOREIGN KEY (`channel_id`) REFERENCES `dim_channel` (`channel_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_fact_renewal_daily_version_id` FOREIGN KEY (`version_id`) REFERENCES `dim_product_version` (`version_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='续费事实表；到期、已续、续费金额，按渠道和版本聚合；续费率 KPI、续费二级弹窗、版本续费';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fact_renewal_daily`
--

LOCK TABLES `fact_renewal_daily` WRITE;
/*!40000 ALTER TABLE `fact_renewal_daily` DISABLE KEYS */;
INSERT INTO `fact_renewal_daily` VALUES (902000,'2026-06-21',3001,5001,14,12,267864.00),(902001,'2026-06-22',3001,5002,15,14,578256.00),(902002,'2026-06-23',3001,5003,16,14,754404.00),(902003,'2026-06-18',3001,5004,17,16,1213600.00),(902004,'2026-06-21',3002,5001,15,12,267864.00),(902005,'2026-06-22',3002,5002,16,14,578256.00),(902006,'2026-06-23',3002,5003,17,14,754404.00),(902007,'2026-06-18',3002,5004,18,16,1213600.00),(902008,'2026-06-21',3003,5001,16,15,334830.00),(902009,'2026-06-22',3003,5002,17,17,702168.00),(902010,'2026-06-23',3003,5003,18,17,916062.00),(902011,'2026-06-18',3003,5004,19,19,1441150.00),(902012,'2026-06-21',3004,5001,17,15,334830.00),(902013,'2026-06-22',3004,5002,18,17,702168.00),(902014,'2026-06-23',3004,5003,19,17,916062.00),(902015,'2026-06-18',3004,5004,12,11,834350.00);
/*!40000 ALTER TABLE `fact_renewal_daily` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fact_revenue_daily`
--

DROP TABLE IF EXISTS `fact_revenue_daily`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fact_revenue_daily` (
  `id` bigint NOT NULL COMMENT '记录ID',
  `stat_date` date NOT NULL COMMENT '统计日期；日汇总日期',
  `channel_id` bigint DEFAULT NULL COMMENT '渠道ID；渠道聚合',
  `staff_id` bigint DEFAULT NULL COMMENT '销售人员ID；销售维度',
  `version_id` bigint DEFAULT NULL COMMENT '版本ID；版本维度',
  `order_type` varchar(20) NOT NULL COMMENT '订单类型；new/renewal',
  `recovered_amount_yuan` decimal(18,2) NOT NULL DEFAULT '0.00' COMMENT '回款金额；回款指标',
  `order_count` int NOT NULL DEFAULT '0' COMMENT '订单数；成交量',
  PRIMARY KEY (`id`),
  KEY `idx_stat_date` (`stat_date`),
  KEY `idx_channel_id` (`channel_id`),
  KEY `idx_staff_id` (`staff_id`),
  KEY `idx_version_id` (`version_id`),
  CONSTRAINT `fk_fact_revenue_daily_channel_id` FOREIGN KEY (`channel_id`) REFERENCES `dim_channel` (`channel_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_fact_revenue_daily_staff_id` FOREIGN KEY (`staff_id`) REFERENCES `dim_staff` (`staff_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_fact_revenue_daily_version_id` FOREIGN KEY (`version_id`) REFERENCES `dim_product_version` (`version_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='回款事实表；日级回款、订单数、渠道、版本、新签/续订；本月回款、年度累计回款、月度经营趋势、费比、ROI';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fact_revenue_daily`
--

LOCK TABLES `fact_revenue_daily` WRITE;
/*!40000 ALTER TABLE `fact_revenue_daily` DISABLE KEYS */;
INSERT INTO `fact_revenue_daily` VALUES (900000,'2026-01-20',3001,2001,NULL,'new',479600.00,8),(900001,'2026-01-20',3001,2002,NULL,'new',393600.00,6),(900002,'2026-01-20',3002,2003,NULL,'new',606600.00,10),(900003,'2026-01-20',3003,2004,NULL,'new',497000.00,8),(900004,'2026-01-20',3004,2005,NULL,'new',277700.00,5),(900005,'2026-02-20',3001,2001,NULL,'new',563400.00,9),(900006,'2026-02-20',3001,2002,NULL,'new',462300.00,8),(900007,'2026-02-20',3002,2003,NULL,'new',712500.00,12),(900008,'2026-02-20',3003,2004,NULL,'new',583800.00,10),(900009,'2026-02-20',3004,2005,NULL,'new',326200.00,5),(900010,'2026-03-20',3001,2001,NULL,'renewal',698100.00,11),(900011,'2026-03-20',3001,2002,NULL,'renewal',572800.00,9),(900012,'2026-03-20',3002,2003,NULL,'renewal',882800.00,14),(900013,'2026-03-20',3003,2004,NULL,'renewal',723300.00,12),(900014,'2026-03-20',3004,2005,NULL,'renewal',404200.00,7),(900015,'2026-04-20',3001,2001,NULL,'new',846500.00,14),(900016,'2026-04-20',3001,2002,NULL,'new',694700.00,11),(900017,'2026-04-20',3002,2003,NULL,'new',1070600.00,18),(900018,'2026-04-20',3003,2004,NULL,'new',877100.00,14),(900019,'2026-04-20',3004,2005,NULL,'new',490100.00,8),(900020,'2026-05-20',3001,2001,NULL,'new',728100.00,12),(900021,'2026-05-20',3001,2002,NULL,'new',597500.00,10),(900022,'2026-05-20',3002,2003,NULL,'new',920800.00,15),(900023,'2026-05-20',3003,2004,NULL,'new',754500.00,12),(900024,'2026-05-20',3004,2005,NULL,'new',421500.00,7),(900025,'2026-06-20',3001,2001,NULL,'renewal',939000.00,15),(900026,'2026-06-20',3001,2002,NULL,'renewal',770500.00,13),(900027,'2026-06-20',3002,2003,NULL,'renewal',1187500.00,19),(900028,'2026-06-20',3003,2004,NULL,'renewal',973000.00,16),(900029,'2026-06-20',3004,2005,NULL,'renewal',543600.00,9),(900030,'2026-07-20',3001,2001,NULL,'new',1026900.00,17),(900031,'2026-07-20',3001,2002,NULL,'new',842700.00,14),(900032,'2026-07-20',3002,2003,NULL,'new',1298700.00,21),(900033,'2026-07-20',3003,2004,NULL,'new',1064000.00,17),(900034,'2026-07-20',3004,2005,NULL,'new',594500.00,10),(900035,'2026-08-20',3001,2001,NULL,'new',838500.00,14),(900036,'2026-08-20',3001,2002,NULL,'new',688000.00,11),(900037,'2026-08-20',3002,2003,NULL,'new',1060400.00,17),(900038,'2026-08-20',3003,2004,NULL,'new',868800.00,14),(900039,'2026-08-20',3004,2005,NULL,'new',485400.00,8),(900040,'2026-09-20',3001,2001,NULL,'renewal',939000.00,15),(900041,'2026-09-20',3001,2002,NULL,'renewal',770500.00,13),(900042,'2026-09-20',3002,2003,NULL,'renewal',1187500.00,19),(900043,'2026-09-20',3003,2004,NULL,'renewal',973000.00,16),(900044,'2026-09-20',3004,2005,NULL,'renewal',543600.00,9),(900045,'2026-10-20',3001,2001,NULL,'new',1119200.00,18),(900046,'2026-10-20',3001,2002,NULL,'new',918400.00,15),(900047,'2026-10-20',3002,2003,NULL,'new',1415400.00,23),(900048,'2026-10-20',3003,2004,NULL,'new',1159700.00,19),(900049,'2026-10-20',3004,2005,NULL,'new',648000.00,11),(900050,'2026-11-20',3001,2001,NULL,'new',1215000.00,20),(900051,'2026-11-20',3001,2002,NULL,'new',997000.00,16),(900052,'2026-11-20',3002,2003,NULL,'new',1536600.00,25),(900053,'2026-11-20',3003,2004,NULL,'new',1259000.00,21),(900054,'2026-11-20',3004,2005,NULL,'new',703400.00,12),(900055,'2026-12-20',3001,2001,NULL,'renewal',1376900.00,23),(900056,'2026-12-20',3001,2002,NULL,'renewal',1129900.00,19),(900057,'2026-12-20',3002,2003,NULL,'renewal',1741300.00,29),(900058,'2026-12-20',3003,2004,NULL,'renewal',1426700.00,23),(900059,'2026-12-20',3004,2005,NULL,'renewal',797100.00,13);
/*!40000 ALTER TABLE `fact_revenue_daily` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fact_sales_member_monthly`
--

DROP TABLE IF EXISTS `fact_sales_member_monthly`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fact_sales_member_monthly` (
  `id` bigint NOT NULL COMMENT '记录ID',
  `year_month` char(7) NOT NULL COMMENT '月份；统计月份',
  `staff_id` bigint NOT NULL COMMENT '销售人员ID；人员维度',
  `channel_id` bigint NOT NULL COMMENT '渠道ID；销售分组',
  `target_amount_yuan` decimal(18,2) NOT NULL DEFAULT '0.00' COMMENT '目标金额；人员目标',
  `recovered_amount_yuan` decimal(18,2) NOT NULL DEFAULT '0.00' COMMENT '回款金额；人员完成金额',
  PRIMARY KEY (`id`),
  KEY `idx_year_month` (`year_month`),
  KEY `idx_staff_id` (`staff_id`),
  KEY `idx_channel_id` (`channel_id`),
  CONSTRAINT `fk_fact_sales_member_monthly_staff_id` FOREIGN KEY (`staff_id`) REFERENCES `dim_staff` (`staff_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='销售人员月度完成表；销售人员目标、回款、完成率排行；渠道完成二级人员明细';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fact_sales_member_monthly`
--

LOCK TABLES `fact_sales_member_monthly` WRITE;
/*!40000 ALTER TABLE `fact_sales_member_monthly` DISABLE KEYS */;
INSERT INTO `fact_sales_member_monthly` VALUES (904000,'2026-06',2001,3001,1280000.00,1368000.00),(904001,'2026-06',2002,3001,1120000.00,1072000.00),(904002,'2026-06',2003,3002,1100000.00,980000.00),(904003,'2026-06',2004,3003,1200000.00,860000.00),(904004,'2026-06',2005,3004,1100000.00,920000.00);
/*!40000 ALTER TABLE `fact_sales_member_monthly` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fact_version_sales_daily`
--

DROP TABLE IF EXISTS `fact_version_sales_daily`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fact_version_sales_daily` (
  `id` bigint NOT NULL COMMENT '记录ID',
  `stat_date` date NOT NULL COMMENT '统计日期；统计日期',
  `version_id` bigint NOT NULL COMMENT '版本ID；版本维度',
  `channel_id` bigint DEFAULT NULL COMMENT '渠道ID；渠道拆分',
  `units` int NOT NULL DEFAULT '0' COMMENT '套数；版本数量',
  `recovered_amount_yuan` decimal(18,2) NOT NULL DEFAULT '0.00' COMMENT '回款金额；版本回款',
  `mom_rate` decimal(6,2) DEFAULT NULL COMMENT '环比；版本卡片涨幅',
  PRIMARY KEY (`id`),
  KEY `idx_stat_date` (`stat_date`),
  KEY `idx_version_id` (`version_id`),
  KEY `idx_channel_id` (`channel_id`),
  CONSTRAINT `fk_fact_version_sales_daily_channel_id` FOREIGN KEY (`channel_id`) REFERENCES `dim_channel` (`channel_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_fact_version_sales_daily_version_id` FOREIGN KEY (`version_id`) REFERENCES `dim_product_version` (`version_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='版本销售事实表；版本套数、版本回款、环比，支持年/月/日二级趋势；版本情况半环图、版本四小卡、版本二级弹窗';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fact_version_sales_daily`
--

LOCK TABLES `fact_version_sales_daily` WRITE;
/*!40000 ALTER TABLE `fact_version_sales_daily` DISABLE KEYS */;
INSERT INTO `fact_version_sales_daily` VALUES (901000,'2026-06-06',5001,3001,36,980000.00,8.20),(901001,'2026-06-09',5002,3002,27,1360000.00,12.40),(901002,'2026-06-12',5003,3003,14,920000.00,6.80),(901003,'2026-06-15',5004,3004,8,740000.00,15.60),(901004,'2026-06-18',5005,3001,44,80000.00,-3.10),(901005,'2026-06-21',5006,3002,31,250000.00,10.50);
/*!40000 ALTER TABLE `fact_version_sales_daily` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `import_batch`
--

DROP TABLE IF EXISTS `import_batch`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `import_batch` (
  `batch_id` bigint NOT NULL COMMENT '批次ID',
  `module` varchar(50) NOT NULL COMMENT '导入模块；target/cost/org/channel',
  `file_name` varchar(255) NOT NULL COMMENT '文件名；导入文件',
  `total_rows` int NOT NULL DEFAULT '0' COMMENT '总行数；导入行数',
  `success_rows` int NOT NULL DEFAULT '0' COMMENT '成功行数；成功行数',
  `failed_rows` int NOT NULL DEFAULT '0' COMMENT '失败行数；失败行数',
  `created_at` datetime NOT NULL COMMENT '创建时间；审计时间',
  PRIMARY KEY (`batch_id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='导入批次表；记录 Excel 导入文件、行数和结果；目标维护、成本维护、组织渠道维护';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `import_batch`
--

LOCK TABLES `import_batch` WRITE;
/*!40000 ALTER TABLE `import_batch` DISABLE KEYS */;
/*!40000 ALTER TABLE `import_batch` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `import_error`
--

DROP TABLE IF EXISTS `import_error`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `import_error` (
  `error_id` bigint NOT NULL COMMENT '错误ID',
  `batch_id` bigint NOT NULL COMMENT '批次ID；关联批次',
  `row_number` int NOT NULL COMMENT '行号；Excel行号',
  `field_name` varchar(100) DEFAULT NULL COMMENT '字段名；错误字段',
  `error_message` text NOT NULL COMMENT '错误原因；前端展示',
  PRIMARY KEY (`error_id`),
  KEY `idx_batch_id` (`batch_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='导入错误表；记录导入失败行号、字段和原因；导入结果反馈';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `import_error`
--

LOCK TABLES `import_error` WRITE;
/*!40000 ALTER TABLE `import_error` DISABLE KEYS */;
/*!40000 ALTER TABLE `import_error` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `operation_log`
--

DROP TABLE IF EXISTS `operation_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `operation_log` (
  `log_id` bigint NOT NULL COMMENT '日志ID',
  `module` varchar(50) NOT NULL COMMENT '模块；目标/成本/组织/渠道/版本/AI',
  `action` varchar(50) NOT NULL COMMENT '动作；create/update/delete/import/init',
  `actor_account_id` bigint DEFAULT NULL COMMENT '操作账号ID；审计',
  `target_name` varchar(200) DEFAULT NULL COMMENT '操作对象名称；日志展示',
  `detail_json` json DEFAULT NULL COMMENT '详情JSON；前后数据',
  `created_at` datetime NOT NULL COMMENT '创建时间；审计时间',
  PRIMARY KEY (`log_id`),
  KEY `idx_actor_account_id` (`actor_account_id`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_operation_log_actor_account_id` FOREIGN KEY (`actor_account_id`) REFERENCES `sys_account` (`account_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='操作日志表；维护动作、导入动作、AI配置变更审计；操作日志页面';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `operation_log`
--

LOCK TABLES `operation_log` WRITE;
/*!40000 ALTER TABLE `operation_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `operation_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sys_account`
--

DROP TABLE IF EXISTS `sys_account`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sys_account` (
  `account_id` bigint NOT NULL COMMENT '账号ID',
  `username` varchar(100) NOT NULL COMMENT '用户名；登录账号',
  `password_hash` varchar(255) NOT NULL COMMENT '密码哈希；安全登录',
  `role_id` bigint NOT NULL COMMENT '角色ID；权限',
  `scope_type` varchar(30) NOT NULL DEFAULT 'all' COMMENT '数据范围；all/self/user/department',
  PRIMARY KEY (`account_id`),
  KEY `idx_role_id` (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='账号表；后台登录账号和数据权限范围；权限和操作审计';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sys_account`
--

LOCK TABLES `sys_account` WRITE;
/*!40000 ALTER TABLE `sys_account` DISABLE KEYS */;
/*!40000 ALTER TABLE `sys_account` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sys_permission`
--

DROP TABLE IF EXISTS `sys_permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sys_permission` (
  `permission_id` bigint NOT NULL COMMENT '权限ID',
  `permission_code` varchar(100) NOT NULL COMMENT '权限编码；权限点',
  `permission_name` varchar(100) NOT NULL COMMENT '权限名称；展示名称',
  PRIMARY KEY (`permission_id`),
  KEY `idx_permission_code` (`permission_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='权限表；target.manage、cost.manage、ai.use 等能力点；权限控制';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sys_permission`
--

LOCK TABLES `sys_permission` WRITE;
/*!40000 ALTER TABLE `sys_permission` DISABLE KEYS */;
/*!40000 ALTER TABLE `sys_permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sys_role`
--

DROP TABLE IF EXISTS `sys_role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sys_role` (
  `role_id` bigint NOT NULL COMMENT '角色ID',
  `role_name` varchar(100) NOT NULL COMMENT '角色名称；角色展示',
  `is_enabled` tinyint(1) NOT NULL DEFAULT '1' COMMENT '是否启用；角色状态',
  PRIMARY KEY (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='角色表；管理员、维护人员、查看者等角色；权限控制';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sys_role`
--

LOCK TABLES `sys_role` WRITE;
/*!40000 ALTER TABLE `sys_role` DISABLE KEYS */;
/*!40000 ALTER TABLE `sys_role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sys_role_permission`
--

DROP TABLE IF EXISTS `sys_role_permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sys_role_permission` (
  `role_id` bigint NOT NULL COMMENT '角色ID；角色',
  `permission_id` bigint NOT NULL COMMENT '权限ID；权限',
  PRIMARY KEY (`role_id`,`permission_id`),
  KEY `fk_sys_role_permission_permission_id` (`permission_id`),
  CONSTRAINT `fk_sys_role_permission_permission_id` FOREIGN KEY (`permission_id`) REFERENCES `sys_permission` (`permission_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_sys_role_permission_role_id` FOREIGN KEY (`role_id`) REFERENCES `sys_role` (`role_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='角色权限关系表；角色与权限多对多；权限控制';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sys_role_permission`
--

LOCK TABLES `sys_role_permission` WRITE;
/*!40000 ALTER TABLE `sys_role_permission` DISABLE KEYS */;
/*!40000 ALTER TABLE `sys_role_permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Final database integrity schema
--

ALTER TABLE `fact_revenue_daily`
  ADD COLUMN `department_id` bigint DEFAULT NULL COMMENT '组织ID；部门级回款归属' AFTER `staff_id`,
  ADD COLUMN `actual_opening_count` int NOT NULL DEFAULT '0' COMMENT '实际开户数' AFTER `recovered_amount_yuan`,
  ADD KEY `idx_revenue_daily_department` (`department_id`),
  ADD KEY `idx_revenue_daily_manual_lookup` (`order_type`,`department_id`,`stat_date`),
  ADD CONSTRAINT `fk_fact_revenue_daily_department_id` FOREIGN KEY (`department_id`) REFERENCES `dim_department` (`department_id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `biz_target_monthly`
  MODIFY `target_id` bigint NOT NULL AUTO_INCREMENT COMMENT '目标ID',
  ADD COLUMN `department_target_scope_id` bigint GENERATED ALWAYS AS ((case when (`staff_id` is null) then `department_id` else NULL end)) VIRTUAL COMMENT '部门目标唯一键作用域',
  ADD UNIQUE KEY `uq_target_month_department` (`year_month`,`department_target_scope_id`);
ALTER TABLE `fact_revenue_daily` MODIFY `id` bigint NOT NULL AUTO_INCREMENT COMMENT '记录ID';
ALTER TABLE `dim_staff`
  MODIFY `staff_id` bigint NOT NULL AUTO_INCREMENT COMMENT '人员ID；主键',
  ADD UNIQUE KEY `uq_dim_staff_code` (`staff_code`);
ALTER TABLE `dim_channel_source`
  MODIFY `source_id` bigint NOT NULL AUTO_INCREMENT COMMENT '来源ID',
  ADD UNIQUE KEY `uq_dim_channel_source_code` (`source_code`);
ALTER TABLE `dim_product_version`
  MODIFY `version_id` bigint NOT NULL AUTO_INCREMENT COMMENT '版本ID',
  ADD UNIQUE KEY `uq_dim_product_version_key` (`version_key`);
ALTER TABLE `import_batch` MODIFY `batch_id` bigint NOT NULL AUTO_INCREMENT COMMENT '批次ID';
ALTER TABLE `dim_channel`
  MODIFY `channel_id` bigint NOT NULL AUTO_INCREMENT COMMENT '渠道ID',
  ADD UNIQUE KEY `uq_dim_channel_key` (`channel_key`);
ALTER TABLE `dim_department`
  MODIFY `department_id` bigint NOT NULL AUTO_INCREMENT COMMENT '组织ID；主键',
  ADD UNIQUE KEY `uq_dim_department_code` (`department_code`);

CREATE TABLE `schema_migrations` (
  `version` varchar(64) NOT NULL COMMENT '迁移版本；发布后不可复用',
  `description` varchar(255) NOT NULL COMMENT '迁移说明',
  `applied_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '应用时间',
  PRIMARY KEY (`version`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='数据库迁移台账；记录已应用的结构版本';

CREATE TABLE `fact_revenue_monthly_override` (
  `override_id` bigint NOT NULL AUTO_INCREMENT COMMENT '部门月度回款覆盖ID',
  `year_month` char(7) NOT NULL COMMENT '统计月份；YYYY-MM',
  `department_id` bigint NOT NULL COMMENT '覆盖组织ID；覆盖本组织及其下级组织当月明细',
  `channel_id` bigint DEFAULT NULL COMMENT '归属渠道ID',
  `recovered_amount_yuan` decimal(18,2) NOT NULL DEFAULT '0.00' COMMENT '毛回款金额；未扣退款',
  `actual_opening_count` int NOT NULL DEFAULT '0' COMMENT '实际开户数',
  `order_count` int NOT NULL DEFAULT '0' COMMENT '成交单数',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`override_id`),
  UNIQUE KEY `uq_revenue_override_month_department` (`year_month`,`department_id`),
  KEY `idx_revenue_override_channel` (`channel_id`),
  CONSTRAINT `fk_revenue_override_department` FOREIGN KEY (`department_id`) REFERENCES `dim_department` (`department_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_revenue_override_channel` FOREIGN KEY (`channel_id`) REFERENCES `dim_channel` (`channel_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='部门月度毛回款覆盖表；目标维护完成值覆盖同月本部门及下级组织日报明细';

CREATE TABLE IF NOT EXISTS `fact_revenue_order` (
  `order_id` bigint NOT NULL AUTO_INCREMENT COMMENT '订单收入明细ID',
  `stat_date` date DEFAULT NULL COMMENT '收入/退款发生日期；来自 Excel 日期，原表缺失时保留为空',
  `year_month` char(7) GENERATED ALWAYS AS (date_format(`stat_date`,_utf8mb4'%Y-%m')) STORED COMMENT '统计月份',
  `staff_id` bigint DEFAULT NULL COMMENT '销售人员ID；可由销售姓名映射 dim_staff',
  `sales_name_raw` varchar(100) DEFAULT NULL COMMENT 'Excel 原始销售姓名',
  `channel_id` bigint DEFAULT NULL COMMENT '渠道ID；可由渠道原始值映射 dim_channel',
  `channel_source_id` bigint DEFAULT NULL COMMENT '线索来源ID；由 Excel 渠道/来源映射 dim_channel_source',
  `channel_name_raw` varchar(100) DEFAULT NULL COMMENT 'Excel 原始渠道/来源',
  `version_id` bigint DEFAULT NULL COMMENT '版本ID；可由版本原始值映射 dim_product_version',
  `version_name_raw` varchar(100) DEFAULT NULL COMMENT 'Excel 原始版本',
  `order_no` varchar(100) DEFAULT NULL COMMENT '订单号；Excel 订单号',
  `customer_name` varchar(255) DEFAULT NULL COMMENT '客户名称；Excel 客户名称',
  `wechat_group_name` varchar(255) DEFAULT NULL COMMENT '企微客户群群名',
  `system_owner_name` varchar(255) DEFAULT NULL COMMENT '福客系统负责人',
  `sales_amount_yuan` decimal(18,2) NOT NULL DEFAULT '0.00' COMMENT '销售实际业绩；作为回款/收入聚合金额',
  `price_amount_yuan` decimal(18,2) NOT NULL DEFAULT '0.00' COMMENT '价格；订单价格',
  `refund_amount_yuan` decimal(18,2) NOT NULL DEFAULT '0.00' COMMENT '退款金额；按原始 Excel 记录保留',
  `net_amount_yuan` decimal(18,2) GENERATED ALWAYS AS ((`sales_amount_yuan` - `refund_amount_yuan`)) STORED COMMENT '净回款；销售实际业绩减退款',
  `order_type` varchar(30) NOT NULL DEFAULT 'self_operated' COMMENT '订单类型；self_operated/new/renewal/refund 等',
  `remark` text COMMENT '备注【客户潜力/要求/跟进】',
  `other_note` text COMMENT '其他（赠送插件，财务报销）',
  `source_workbook` varchar(255) DEFAULT NULL COMMENT '来源工作簿名',
  `source_sheet` varchar(100) DEFAULT NULL COMMENT '来源工作表',
  `source_row_no` int DEFAULT NULL COMMENT '来源 Excel 行号',
  `import_batch_id` varchar(64) DEFAULT NULL COMMENT '导入批次ID',
  `source_row_hash` char(64) DEFAULT NULL COMMENT '规范化原始行哈希；用于重复导入幂等更新',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`order_id`),
  UNIQUE KEY `uk_revenue_order_source_row_hash` (`source_row_hash`),
  KEY `idx_revenue_order_no` (`order_no`),
  KEY `idx_revenue_order_date` (`stat_date`),
  KEY `idx_revenue_order_month` (`year_month`),
  KEY `idx_revenue_order_staff` (`staff_id`),
  KEY `idx_revenue_order_channel` (`channel_id`),
  KEY `idx_revenue_order_channel_source` (`channel_source_id`),
  KEY `idx_revenue_order_version` (`version_id`),
  KEY `idx_revenue_order_batch` (`import_batch_id`),
  CONSTRAINT `fk_fact_revenue_order_staff_id` FOREIGN KEY (`staff_id`) REFERENCES `dim_staff` (`staff_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_fact_revenue_order_channel_id` FOREIGN KEY (`channel_id`) REFERENCES `dim_channel` (`channel_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_fact_revenue_order_channel_source_id` FOREIGN KEY (`channel_source_id`) REFERENCES `dim_channel_source` (`source_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_fact_revenue_order_version_id` FOREIGN KEY (`version_id`) REFERENCES `dim_product_version` (`version_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='自营收入订单级事实表；承接真实 Excel 明细，保留销售、客户、企微群、负责人、版本、订单号、价格、退款、备注和渠道原始值';

CREATE TABLE IF NOT EXISTS `fact_revenue_channel_monthly` (
  `monthly_revenue_id` bigint NOT NULL AUTO_INCREMENT COMMENT '月度回款事实ID',
  `year_month` char(7) NOT NULL COMMENT '统计月份；YYYY-MM',
  `record_level` varchar(20) NOT NULL COMMENT '记录层级；total/channel/structure',
  `channel_id` bigint DEFAULT NULL COMMENT '渠道ID；total/structure 为空',
  `scope_channel_id` bigint GENERATED ALWAYS AS ((case when (`record_level` = _utf8mb4'channel') then `channel_id` else 0 end)) VIRTUAL COMMENT '月度层级唯一键作用域；total/structure 固定为 0，channel 使用渠道ID',
  `source_name_raw` varchar(100) DEFAULT NULL COMMENT '工作簿原始主渠道名称',
  `gross_amount_yuan` decimal(18,2) NOT NULL DEFAULT '0.00' COMMENT '含税签约或原始GMV',
  `refund_amount_yuan` decimal(18,2) NOT NULL DEFAULT '0.00' COMMENT '退款金额；正数保存',
  `net_amount_yuan` decimal(18,2) GENERATED ALWAYS AS ((`gross_amount_yuan` - `refund_amount_yuan`)) STORED COMMENT '实际营收/净回款',
  `source_workbook` varchar(255) NOT NULL COMMENT '来源工作簿名',
  `source_sheet` varchar(100) NOT NULL COMMENT '来源工作表',
  `source_row_no` int NOT NULL COMMENT '来源 Excel 行号',
  `import_batch_id` varchar(64) DEFAULT NULL COMMENT '导入批次ID',
  `source_row_hash` char(64) NOT NULL COMMENT '规范化事实哈希；用于幂等更新',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`monthly_revenue_id`),
  UNIQUE KEY `uk_revenue_monthly_source_hash` (`source_row_hash`),
  UNIQUE KEY `uq_revenue_monthly_month_level_scope` (`year_month`,`record_level`,`scope_channel_id`),
  KEY `idx_revenue_monthly_month_level` (`year_month`,`record_level`),
  KEY `idx_revenue_monthly_channel` (`channel_id`),
  KEY `idx_revenue_monthly_batch` (`import_batch_id`),
  CONSTRAINT `fk_revenue_monthly_channel_id` FOREIGN KEY (`channel_id`) REFERENCES `dim_channel` (`channel_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `chk_revenue_monthly_level_channel` CHECK (((`record_level` = _utf8mb4'total') AND (`channel_id` IS NULL)) OR ((`record_level` = _utf8mb4'channel') AND (`channel_id` IS NOT NULL)) OR ((`record_level` = _utf8mb4'structure') AND (`channel_id` IS NULL)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='公司级月度回款事实；total 为 KPI 权威值，channel 为分摊权重，structure 仅用于特殊渠道结构展示';

CREATE SQL SECURITY INVOKER VIEW `v_department_closure` AS
WITH RECURSIVE `department_tree` (`descendant_id`, `ancestor_id`, `depth`) AS (
  SELECT `department_id`, `department_id`, 0 FROM `dim_department`
  UNION ALL
  SELECT `tree`.`descendant_id`, `parent`.`parent_id`, `tree`.`depth` + 1
  FROM `department_tree` `tree`
  JOIN `dim_department` `parent` ON `parent`.`department_id` = `tree`.`ancestor_id`
  WHERE `parent`.`parent_id` IS NOT NULL AND `tree`.`depth` < 100
)
SELECT `descendant_id`, `ancestor_id`, `depth` FROM `department_tree`;

CREATE SQL SECURITY INVOKER VIEW `v_target_monthly_effective` AS
SELECT `target_row`.`target_id`,
       `target_row`.`year_month`,
       `target_row`.`department_id`,
       `target_row`.`staff_id`,
       `target_row`.`channel_id`,
       `target_row`.`target_amount_yuan`,
       `target_row`.`target_opening_count`,
       `target_row`.`target_order_count`
FROM `biz_target_monthly` `target_row`
WHERE `target_row`.`staff_id` IS NULL
  AND `target_row`.`department_id` IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM `biz_target_monthly` `ancestor_target`
    JOIN `v_department_closure` `closure`
      ON `closure`.`descendant_id` = `target_row`.`department_id`
     AND `closure`.`ancestor_id` = `ancestor_target`.`department_id`
     AND `closure`.`depth` > 0
    WHERE `ancestor_target`.`year_month` = `target_row`.`year_month`
      AND `ancestor_target`.`staff_id` IS NULL
  );

CREATE SQL SECURITY INVOKER VIEW `v_revenue_monthly_effective_override` AS
SELECT `override_row`.`override_id`, `override_row`.`year_month`, `override_row`.`department_id`,
       `override_row`.`channel_id`, `override_row`.`recovered_amount_yuan`,
       `override_row`.`actual_opening_count`, `override_row`.`order_count`,
       `override_row`.`created_at`, `override_row`.`updated_at`
FROM `fact_revenue_monthly_override` `override_row`
WHERE NOT EXISTS (
  SELECT 1
  FROM `fact_revenue_monthly_override` `ancestor_override`
  JOIN `v_department_closure` `closure`
    ON `closure`.`descendant_id` = `override_row`.`department_id`
   AND `closure`.`ancestor_id` = `ancestor_override`.`department_id`
   AND `closure`.`depth` > 0
  WHERE `ancestor_override`.`year_month` = `override_row`.`year_month`
);

CREATE SQL SECURITY INVOKER VIEW `v_revenue_company_monthly_allocated` AS
WITH `monthly_totals` AS (
  SELECT MIN(`monthly_revenue_id`) AS `source_id`,
         `year_month`,
         SUM(`gross_amount_yuan`) AS `total_gross_amount_yuan`,
         SUM(`refund_amount_yuan`) AS `total_refund_amount_yuan`,
         MAX(`source_workbook`) AS `source_workbook`,
         MAX(`source_sheet`) AS `source_sheet`,
         MIN(`source_row_no`) AS `source_row_no`
  FROM `fact_revenue_channel_monthly`
  WHERE `record_level` = 'total'
  GROUP BY `year_month`
),
`monthly_channels` AS (
  SELECT MIN(`monthly_revenue_id`) AS `source_id`,
         `year_month`,
         `channel_id`,
         MAX(`source_name_raw`) AS `source_name_raw`,
         MAX(`source_workbook`) AS `source_workbook`,
         MAX(`source_sheet`) AS `source_sheet`,
         MIN(`source_row_no`) AS `source_row_no`,
         SUM(`gross_amount_yuan`) AS `original_gross_amount_yuan`,
         SUM(`refund_amount_yuan`) AS `original_refund_amount_yuan`
  FROM `fact_revenue_channel_monthly`
  WHERE `record_level` = 'channel'
    AND `channel_id` IS NOT NULL
  GROUP BY `year_month`, `channel_id`
),
`effective_monthly_channels` AS (
  SELECT `channel_row`.`source_id`,
         `channel_row`.`year_month`,
         `channel_row`.`channel_id`,
         `channel_row`.`source_name_raw`,
         `channel_row`.`source_workbook`,
         `channel_row`.`source_sheet`,
         `channel_row`.`source_row_no`,
         `channel_row`.`original_gross_amount_yuan`,
         `channel_row`.`original_refund_amount_yuan`
  FROM `monthly_channels` `channel_row`

  UNION ALL

  SELECT `total_row`.`source_id`,
         `total_row`.`year_month`,
         NULL AS `channel_id`,
         '未归属' AS `source_name_raw`,
         `total_row`.`source_workbook`,
         `total_row`.`source_sheet`,
         `total_row`.`source_row_no`,
         `total_row`.`total_gross_amount_yuan` AS `original_gross_amount_yuan`,
         `total_row`.`total_refund_amount_yuan` AS `original_refund_amount_yuan`
  FROM `monthly_totals` `total_row`
  WHERE NOT EXISTS (
      SELECT 1
      FROM `monthly_channels` `channel_row`
      WHERE `channel_row`.`year_month` = `total_row`.`year_month`
    )
),
`weighted_channels` AS (
  SELECT `channel_row`.*,
         `total_row`.`total_gross_amount_yuan`,
         `total_row`.`total_refund_amount_yuan`,
         SUM(`channel_row`.`original_gross_amount_yuan`) OVER (
           PARTITION BY `channel_row`.`year_month`
         ) AS `channel_gross_amount_yuan`,
         SUM(`channel_row`.`original_refund_amount_yuan`) OVER (
           PARTITION BY `channel_row`.`year_month`
         ) AS `channel_refund_amount_yuan`,
         ROW_NUMBER() OVER (
           PARTITION BY `channel_row`.`year_month`
           ORDER BY `channel_row`.`channel_id`, `channel_row`.`source_id`
         ) AS `channel_rank`,
         COUNT(*) OVER (
           PARTITION BY `channel_row`.`year_month`
         ) AS `channel_count`
  FROM `effective_monthly_channels` `channel_row`
  JOIN `monthly_totals` `total_row` ON `total_row`.`year_month` = `channel_row`.`year_month`
),
`rounded_channels` AS (
  SELECT `weighted`.*,
         CAST(ROUND(
           CASE
             WHEN `weighted`.`channel_gross_amount_yuan` <> 0
               THEN `weighted`.`total_gross_amount_yuan`
                    * `weighted`.`original_gross_amount_yuan`
                    / `weighted`.`channel_gross_amount_yuan`
             WHEN `weighted`.`channel_refund_amount_yuan` <> 0
               THEN `weighted`.`total_gross_amount_yuan`
                    * `weighted`.`original_refund_amount_yuan`
                    / `weighted`.`channel_refund_amount_yuan`
             ELSE 0
           END,
           2
         ) AS DECIMAL(18,2)) AS `rounded_gross_amount_yuan`,
         CAST(ROUND(
           CASE
             WHEN `weighted`.`channel_refund_amount_yuan` <> 0
               THEN `weighted`.`total_refund_amount_yuan`
                    * `weighted`.`original_refund_amount_yuan`
                    / `weighted`.`channel_refund_amount_yuan`
             WHEN `weighted`.`channel_gross_amount_yuan` <> 0
               THEN `weighted`.`total_refund_amount_yuan`
                    * `weighted`.`original_gross_amount_yuan`
                    / `weighted`.`channel_gross_amount_yuan`
             ELSE 0
           END,
           2
         ) AS DECIMAL(18,2)) AS `rounded_refund_amount_yuan`
  FROM `weighted_channels` `weighted`
),
`allocated_channels` AS (
  SELECT `rounded`.*,
         CAST(CASE
           WHEN `rounded`.`channel_rank` = `rounded`.`channel_count` THEN
             `rounded`.`total_gross_amount_yuan`
             - SUM(CASE
                 WHEN `rounded`.`channel_rank` < `rounded`.`channel_count`
                   THEN `rounded`.`rounded_gross_amount_yuan`
                 ELSE 0
               END) OVER (PARTITION BY `rounded`.`year_month`)
           ELSE `rounded`.`rounded_gross_amount_yuan`
         END AS DECIMAL(18,2)) AS `allocated_gross_amount_yuan`,
         CAST(CASE
           WHEN `rounded`.`channel_rank` = `rounded`.`channel_count` THEN
             `rounded`.`total_refund_amount_yuan`
             - SUM(CASE
                 WHEN `rounded`.`channel_rank` < `rounded`.`channel_count`
                   THEN `rounded`.`rounded_refund_amount_yuan`
                 ELSE 0
               END) OVER (PARTITION BY `rounded`.`year_month`)
           ELSE `rounded`.`rounded_refund_amount_yuan`
         END AS DECIMAL(18,2)) AS `allocated_refund_amount_yuan`
  FROM `rounded_channels` `rounded`
)
SELECT `allocated`.`source_id`,
       `allocated`.`year_month`,
       STR_TO_DATE(CONCAT(`allocated`.`year_month`, '-01'), '%Y-%m-%d') AS `stat_date`,
       `allocated`.`channel_id`,
       COALESCE(`channel_department`.`department_id`, `channel_department_alias`.`department_id`) AS `department_id`,
       `allocated`.`allocated_gross_amount_yuan` AS `gross_amount_yuan`,
       `allocated`.`allocated_refund_amount_yuan` AS `refund_amount_yuan`,
       CAST(
         `allocated`.`allocated_gross_amount_yuan` - `allocated`.`allocated_refund_amount_yuan`
         AS DECIMAL(18,2)
       ) AS `net_amount_yuan`,
       `allocated`.`source_name_raw`,
       `allocated`.`source_workbook`,
       `allocated`.`source_sheet`,
       `allocated`.`source_row_no`
FROM `allocated_channels` `allocated`
LEFT JOIN `dim_channel` `channel_row` ON `channel_row`.`channel_id` = `allocated`.`channel_id`
LEFT JOIN `dim_department` `channel_department`
  ON `channel_department`.`department_code` = CASE `channel_row`.`channel_key`
    WHEN 'online' THEN 'online-sales'
    WHEN 'south' THEN 'south-sales'
    WHEN 'east' THEN 'east-sales'
    WHEN 'agent' THEN 'agent-sales'
    ELSE NULL
  END
LEFT JOIN `dim_department` `channel_department_alias`
  ON `channel_department_alias`.`department_code` = CASE `channel_row`.`channel_key`
    WHEN 'south' THEN 'south-region'
    WHEN 'east' THEN 'east-region'
    ELSE NULL
  END;

CREATE SQL SECURITY INVOKER VIEW `v_revenue_gross_canonical` AS
WITH `monthly_source_years` AS (
  SELECT DISTINCT CAST(LEFT(`year_month`, 4) AS UNSIGNED) AS `source_year`
  FROM `v_revenue_company_monthly_allocated`
),
`order_source_years` AS (
  SELECT DISTINCT YEAR(`stat_date`) AS `source_year`
  FROM `fact_revenue_order`
  WHERE `stat_date` IS NOT NULL
)
SELECT `monthly_row`.`source_id`,
       'company_monthly' AS `source_kind`,
       `monthly_row`.`stat_date`,
       `monthly_row`.`department_id`,
       `monthly_row`.`channel_id`,
       NULL AS `staff_id`,
       NULL AS `version_id`,
       'company_monthly' AS `order_type`,
       `monthly_row`.`gross_amount_yuan` AS `recovered_amount_yuan`,
       0 AS `actual_opening_count`,
       0 AS `order_count`
FROM `v_revenue_company_monthly_allocated` `monthly_row`

UNION ALL

SELECT `order_row`.`order_id` AS `source_id`,
       'order' AS `source_kind`,
       `order_row`.`stat_date`,
       COALESCE(
         `staff`.`department_id`,
         `channel_department`.`department_id`,
         `channel_department_alias`.`department_id`
       ) AS `department_id`,
       COALESCE(`order_row`.`channel_id`, `staff_channel`.`channel_id`) AS `channel_id`,
       `order_row`.`staff_id`,
       `order_row`.`version_id`,
       `order_row`.`order_type`,
       `order_row`.`sales_amount_yuan` AS `recovered_amount_yuan`,
       0 AS `actual_opening_count`,
       1 AS `order_count`
FROM `fact_revenue_order` `order_row`
LEFT JOIN `dim_staff` `staff` ON `staff`.`staff_id` = `order_row`.`staff_id`
LEFT JOIN `dim_channel` `staff_channel` ON `staff_channel`.`channel_key` = `staff`.`channel_key`
LEFT JOIN `dim_channel` `channel_row` ON `channel_row`.`channel_id` = `order_row`.`channel_id`
LEFT JOIN `dim_department` `channel_department`
  ON `channel_department`.`department_code` = CASE COALESCE(`channel_row`.`channel_key`, `staff_channel`.`channel_key`)
    WHEN 'online' THEN 'online-sales'
    WHEN 'south' THEN 'south-sales'
    WHEN 'east' THEN 'east-sales'
    WHEN 'agent' THEN 'agent-sales'
    ELSE NULL
  END
LEFT JOIN `dim_department` `channel_department_alias`
  ON `channel_department_alias`.`department_code` = CASE COALESCE(`channel_row`.`channel_key`, `staff_channel`.`channel_key`)
    WHEN 'south' THEN 'south-region'
    WHEN 'east' THEN 'east-region'
    ELSE NULL
  END
LEFT JOIN `monthly_source_years` `monthly_year`
  ON `monthly_year`.`source_year` = YEAR(`order_row`.`stat_date`)
WHERE `order_row`.`stat_date` IS NOT NULL
  AND `monthly_year`.`source_year` IS NULL

UNION ALL

SELECT `daily_row`.`id` AS `source_id`,
       'daily' AS `source_kind`,
       `daily_row`.`stat_date`,
       COALESCE(`daily_row`.`department_id`, `staff`.`department_id`) AS `department_id`,
       `daily_row`.`channel_id`,
       `daily_row`.`staff_id`,
       `daily_row`.`version_id`,
       `daily_row`.`order_type`,
       `daily_row`.`recovered_amount_yuan`,
       `daily_row`.`actual_opening_count`,
       `daily_row`.`order_count`
FROM `fact_revenue_daily` `daily_row`
LEFT JOIN `dim_staff` `staff` ON `staff`.`staff_id` = `daily_row`.`staff_id`
LEFT JOIN `monthly_source_years` `monthly_year`
  ON `monthly_year`.`source_year` = YEAR(`daily_row`.`stat_date`)
LEFT JOIN `order_source_years` `order_year`
  ON `order_year`.`source_year` = YEAR(`daily_row`.`stat_date`)
WHERE `daily_row`.`order_type` <> 'manual_department'
  AND `monthly_year`.`source_year` IS NULL
  AND `order_year`.`source_year` IS NULL
  AND NOT EXISTS (
    SELECT 1
    FROM `v_revenue_monthly_effective_override` `override_row`
    JOIN `v_department_closure` `closure`
      ON `closure`.`descendant_id` = COALESCE(`daily_row`.`department_id`, `staff`.`department_id`)
     AND `closure`.`ancestor_id` = `override_row`.`department_id`
    WHERE `override_row`.`year_month` = DATE_FORMAT(`daily_row`.`stat_date`, '%Y-%m')
  )

UNION ALL

SELECT `override_row`.`override_id` AS `source_id`,
       'monthly_override' AS `source_kind`,
       STR_TO_DATE(CONCAT(`override_row`.`year_month`, '-01'), '%Y-%m-%d') AS `stat_date`,
       `override_row`.`department_id`,
       `override_row`.`channel_id`,
       NULL AS `staff_id`,
       NULL AS `version_id`,
       'manual_department' AS `order_type`,
       `override_row`.`recovered_amount_yuan`,
       `override_row`.`actual_opening_count`,
       `override_row`.`order_count`
FROM `v_revenue_monthly_effective_override` `override_row`
LEFT JOIN `monthly_source_years` `monthly_year`
  ON `monthly_year`.`source_year` = CAST(LEFT(`override_row`.`year_month`, 4) AS UNSIGNED)
LEFT JOIN `order_source_years` `order_year`
  ON `order_year`.`source_year` = CAST(LEFT(`override_row`.`year_month`, 4) AS UNSIGNED)
WHERE `monthly_year`.`source_year` IS NULL
  AND `order_year`.`source_year` IS NULL;

CREATE SQL SECURITY INVOKER VIEW `v_revenue_refund_canonical` AS
WITH `monthly_source_years` AS (
  SELECT DISTINCT CAST(LEFT(`year_month`, 4) AS UNSIGNED) AS `source_year`
  FROM `v_revenue_company_monthly_allocated`
),
`selected_source_refunds` AS (
  SELECT `monthly_row`.`year_month`,
         `monthly_row`.`channel_id`,
         `monthly_row`.`refund_amount_yuan`,
         'monthly' AS `source_kind`
  FROM `v_revenue_company_monthly_allocated` `monthly_row`

  UNION ALL

  SELECT DATE_FORMAT(`order_row`.`stat_date`, '%Y-%m') AS `year_month`,
         COALESCE(`order_row`.`channel_id`, `staff_channel`.`channel_id`) AS `channel_id`,
         SUM(`order_row`.`refund_amount_yuan`) AS `refund_amount_yuan`,
         'order' AS `source_kind`
  FROM `fact_revenue_order` `order_row`
  LEFT JOIN `dim_staff` `staff` ON `staff`.`staff_id` = `order_row`.`staff_id`
  LEFT JOIN `dim_channel` `staff_channel` ON `staff_channel`.`channel_key` = `staff`.`channel_key`
  LEFT JOIN `monthly_source_years` `monthly_year`
    ON `monthly_year`.`source_year` = YEAR(`order_row`.`stat_date`)
  WHERE `order_row`.`stat_date` IS NOT NULL
    AND `monthly_year`.`source_year` IS NULL
  GROUP BY DATE_FORMAT(`order_row`.`stat_date`, '%Y-%m'), COALESCE(`order_row`.`channel_id`, `staff_channel`.`channel_id`)
)
SELECT `cost_row`.`year_month`,
       `cost_row`.`channel_id`,
       `cost_row`.`refund_amount_yuan`,
       'cost' AS `source_kind`
FROM `biz_channel_cost_monthly` `cost_row`

UNION ALL

SELECT `source_row`.`year_month`,
       `source_row`.`channel_id`,
       `source_row`.`refund_amount_yuan`,
       `source_row`.`source_kind`
FROM `selected_source_refunds` `source_row`
WHERE NOT EXISTS (
  SELECT 1
  FROM `biz_channel_cost_monthly` `cost_row`
  WHERE `cost_row`.`year_month` = `source_row`.`year_month`
    AND `cost_row`.`channel_id` <=> `source_row`.`channel_id`
);

INSERT INTO `schema_migrations` (`version`, `description`)
VALUES ('20260714_database_integrity', '统一年度回款来源、月度事实完整性、渠道分摊、退款聚合、部门覆盖、自然唯一键及自增主键');

--
-- Dumping events for database 'ceo_dashboard'
--

--
-- Dumping routines for database 'ceo_dashboard'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-06 13:10:36
