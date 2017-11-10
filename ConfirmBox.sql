CREATE DATABASE `confirmbox` /*!40100 DEFAULT CHARACTER SET utf8 */;

CREATE TABLE `confirm` (
  `en` int(11) NOT NULL,
  `task_id` int(11) NOT NULL,
  `cfm_seq` int(11) NOT NULL,
  `cfm_en` int(11) DEFAULT NULL,
  `cfm_title` text,
  `cfm_text` text,
  `cfm_yn` char(1) DEFAULT NULL,
  `cfm_opinion` text,
  PRIMARY KEY (`en`,`task_id`,`cfm_seq`),
  KEY `idx_confirm_cfm_en` (`cfm_en`)
);

CREATE TABLE `pushsets` (
  `en` int(11) NOT NULL,
  `task_id` int(11) NOT NULL,
  `push_yn` char(1) DEFAULT NULL,
  PRIMARY KEY (`en`,`task_id`)
);

CREATE TABLE `task` (
  `task_id` int(11) NOT NULL,
  `task_name` text,
  PRIMARY KEY (`task_id`)
);

CREATE TABLE `users` (
  `en` int(11) NOT NULL,
  `name` text,
  `pw` text,
  `device_token` varchar(256) DEFAULT NULL,
  PRIMARY KEY (`en`)
);