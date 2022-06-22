
CREATE TABLE `zoom_users` (
	`id` VARCHAR(200) unsigned NOT NULL,
	`first_name` VARCHAR(200) CHARACTER SET utf8 COLLATE utf8_general_ci,
	`last_name` VARCHAR(200) CHARACTER SET utf8 COLLATE utf8_general_ci,
	`email` VARCHAR(200) CHARACTER SET utf8 COLLATE utf8_general_ci,
	`type` INT(7) DEFAULT '2',
	`user_id` VARCHAR(200) CHARACTER SET utf8 COLLATE utf8_general_ci,
	PRIMARY KEY (`id`,`email`,`user_id`)
);