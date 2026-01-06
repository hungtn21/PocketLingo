-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: pocket-lingo-quynhtrankhanh1111-039a.l.aivencloud.com    Database: defaultdb
-- ------------------------------------------------------
-- Server version	8.0.35

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '980f7d42-bed2-11f0-a83d-d2e9998643a2:1-1508';

--
-- Table structure for table `auth_group`
--

DROP TABLE IF EXISTS `auth_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_group` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_group`
--

LOCK TABLES `auth_group` WRITE;
/*!40000 ALTER TABLE `auth_group` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_group` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_group_permissions`
--

DROP TABLE IF EXISTS `auth_group_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_group_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `group_id` int NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_group_permissions_group_id_permission_id_0cd325b0_uniq` (`group_id`,`permission_id`),
  KEY `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` (`permission_id`),
  CONSTRAINT `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `auth_group_permissions_group_id_b120cbf9_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_group_permissions`
--

LOCK TABLES `auth_group_permissions` WRITE;
/*!40000 ALTER TABLE `auth_group_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_group_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_permission`
--

DROP TABLE IF EXISTS `auth_permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_permission` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `content_type_id` int NOT NULL,
  `codename` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_permission_content_type_id_codename_01ab375a_uniq` (`content_type_id`,`codename`),
  CONSTRAINT `auth_permission_content_type_id_2f476e4b_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=77 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_permission`
--

LOCK TABLES `auth_permission` WRITE;
/*!40000 ALTER TABLE `auth_permission` DISABLE KEYS */;
INSERT INTO `auth_permission` VALUES (1,'Can add log entry',1,'add_logentry'),(2,'Can change log entry',1,'change_logentry'),(3,'Can delete log entry',1,'delete_logentry'),(4,'Can view log entry',1,'view_logentry'),(5,'Can add permission',2,'add_permission'),(6,'Can change permission',2,'change_permission'),(7,'Can delete permission',2,'delete_permission'),(8,'Can view permission',2,'view_permission'),(9,'Can add group',3,'add_group'),(10,'Can change group',3,'change_group'),(11,'Can delete group',3,'delete_group'),(12,'Can view group',3,'view_group'),(13,'Can add user',4,'add_user'),(14,'Can change user',4,'change_user'),(15,'Can delete user',4,'delete_user'),(16,'Can view user',4,'view_user'),(17,'Can add content type',5,'add_contenttype'),(18,'Can change content type',5,'change_contenttype'),(19,'Can delete content type',5,'delete_contenttype'),(20,'Can view content type',5,'view_contenttype'),(21,'Can add session',6,'add_session'),(22,'Can change session',6,'change_session'),(23,'Can delete session',6,'delete_session'),(24,'Can view session',6,'view_session'),(25,'Can add user',7,'add_user'),(26,'Can change user',7,'change_user'),(27,'Can delete user',7,'delete_user'),(28,'Can view user',7,'view_user'),(29,'Can add course',8,'add_course'),(30,'Can change course',8,'change_course'),(31,'Can delete course',8,'delete_course'),(32,'Can view course',8,'view_course'),(33,'Can add lesson',9,'add_lesson'),(34,'Can change lesson',9,'change_lesson'),(35,'Can delete lesson',9,'delete_lesson'),(36,'Can view lesson',9,'view_lesson'),(37,'Can add flashcard',10,'add_flashcard'),(38,'Can change flashcard',10,'change_flashcard'),(39,'Can delete flashcard',10,'delete_flashcard'),(40,'Can view flashcard',10,'view_flashcard'),(41,'Can add notification',11,'add_notification'),(42,'Can change notification',11,'change_notification'),(43,'Can delete notification',11,'delete_notification'),(44,'Can view notification',11,'view_notification'),(45,'Can add quiz',12,'add_quiz'),(46,'Can change quiz',12,'change_quiz'),(47,'Can delete quiz',12,'delete_quiz'),(48,'Can view quiz',12,'view_quiz'),(49,'Can add question',13,'add_question'),(50,'Can change question',13,'change_question'),(51,'Can delete question',13,'delete_question'),(52,'Can view question',13,'view_question'),(53,'Can add quiz attempt',14,'add_quizattempt'),(54,'Can change quiz attempt',14,'change_quizattempt'),(55,'Can delete quiz attempt',14,'delete_quizattempt'),(56,'Can view quiz attempt',14,'view_quizattempt'),(57,'Can add user course',15,'add_usercourse'),(58,'Can change user course',15,'change_usercourse'),(59,'Can delete user course',15,'delete_usercourse'),(60,'Can view user course',15,'view_usercourse'),(61,'Can add user flashcard',16,'add_userflashcard'),(62,'Can change user flashcard',16,'change_userflashcard'),(63,'Can delete user flashcard',16,'delete_userflashcard'),(64,'Can view user flashcard',16,'view_userflashcard'),(65,'Can add user lesson',17,'add_userlesson'),(66,'Can change user lesson',17,'change_userlesson'),(67,'Can delete user lesson',17,'delete_userlesson'),(68,'Can view user lesson',17,'view_userlesson'),(69,'Can add django job',18,'add_djangojob'),(70,'Can change django job',18,'change_djangojob'),(71,'Can delete django job',18,'delete_djangojob'),(72,'Can view django job',18,'view_djangojob'),(73,'Can add django job execution',19,'add_djangojobexecution'),(74,'Can change django job execution',19,'change_djangojobexecution'),(75,'Can delete django job execution',19,'delete_djangojobexecution'),(76,'Can view django job execution',19,'view_djangojobexecution');
/*!40000 ALTER TABLE `auth_permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_user`
--

DROP TABLE IF EXISTS `auth_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `password` varchar(128) NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `username` varchar(150) NOT NULL,
  `first_name` varchar(150) NOT NULL,
  `last_name` varchar(150) NOT NULL,
  `email` varchar(254) NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `date_joined` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_user`
--

LOCK TABLES `auth_user` WRITE;
/*!40000 ALTER TABLE `auth_user` DISABLE KEYS */;
INSERT INTO `auth_user` VALUES (1,'pbkdf2_sha256$1000000$CmiRhSuU826f68xrRvcFnl$C87LqQB04Kg/ue9DLmhI0TVjnbUMBfUkZmb04LpvQMc=','2025-11-23 18:05:35.997118',1,'admin','','','quynhtrankhanh1111@gmail.com',1,1,'2025-11-11 07:59:05.544084'),(2,'pbkdf2_sha256$1000000$fKyeChLF7yoXZND94N0Lgj$NxQJ9UOWapXJYDDqOf2MbB8KIdQX3Toa3pNLOZVXiBQ=',NULL,1,'huyen','','','',1,1,'2025-11-13 18:20:01.897283'),(3,'pbkdf2_sha256$1000000$fykAAsFus5LuvZ8j55d9sj$9EweSHU4mcNHn2HTDj6kNEvLn9HMU5HCTMWyQFggN7g=','2025-11-16 08:04:16.292739',1,'admin1','','','admin1@gmail.com',1,1,'2025-11-16 08:03:45.170017'),(4,'pbkdf2_sha256$1000000$c5HRdtJiZbxn9f7FCGAwWw$M1qEQCx4aS5e1B4wwYjm4pomIZ3/VSKinUUroSYboSk=','2025-12-17 06:39:54.610599',1,'admin2','','','admin22@gmail.com',1,1,'2025-11-23 18:13:01.021014');
/*!40000 ALTER TABLE `auth_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_user_groups`
--

DROP TABLE IF EXISTS `auth_user_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_user_groups` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `group_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_user_groups_user_id_group_id_94350c0c_uniq` (`user_id`,`group_id`),
  KEY `auth_user_groups_group_id_97559544_fk_auth_group_id` (`group_id`),
  CONSTRAINT `auth_user_groups_group_id_97559544_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`),
  CONSTRAINT `auth_user_groups_user_id_6a12ed8b_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_user_groups`
--

LOCK TABLES `auth_user_groups` WRITE;
/*!40000 ALTER TABLE `auth_user_groups` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_user_groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_user_user_permissions`
--

DROP TABLE IF EXISTS `auth_user_user_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_user_user_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_user_user_permissions_user_id_permission_id_14a6b632_uniq` (`user_id`,`permission_id`),
  KEY `auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm` (`permission_id`),
  CONSTRAINT `auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `auth_user_user_permissions_user_id_a95ead1b_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_user_user_permissions`
--

LOCK TABLES `auth_user_user_permissions` WRITE;
/*!40000 ALTER TABLE `auth_user_user_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_user_user_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `courses` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` longtext NOT NULL,
  `description` longtext NOT NULL,
  `language` varchar(10) NOT NULL,
  `level` varchar(10) NOT NULL,
  `image_url` longtext,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `created_by_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `courses_created_by_id_a7702746_fk_auth_user_id` (`created_by_id`),
  CONSTRAINT `courses_created_by_id_a7702746_fk_auth_user_id` FOREIGN KEY (`created_by_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES (1,'Japanese Basics 1','Khóa học sơ cấp giúp bạn nắm các mẫu ngữ pháp và từ vựng cơ bản.','Japanese','Sơ cấp','https://trungtamtiengnhat.org/images/2017/09/25/Hoc-tieng-Nhat-3.jpg','2025-11-16 07:57:02.000000','2025-11-16 10:20:41.009102',NULL),(2,'Japanese Basics 2','Tiếp tục mở rộng kiến thức tiếng Nhật sơ cấp.','Japanese','Sơ cấp','https://www.kcpinternational.com/wp-content/uploads/2014/04/kanaweb.jpg','2025-11-16 07:57:02.000000','2025-11-16 07:57:02.000000',NULL),(3,'Japanese Conversation Starter','Rèn luyện hội thoại đơn giản cho người mới bắt đầu.','Japanese','Sơ cấp','https://www.tofugu.com/images/learn-japanese/reading-hiragana-dc667116.jpg','2025-11-16 07:57:02.000000','2025-11-16 07:57:02.000000',NULL),(4,'JLPT N5 Preparation','Khóa học luyện thi JLPT N5 dành cho người mới bắt đầu.','Japanese','Sơ cấp','https://play-lh.googleusercontent.com/ZWlN94w07NdVTrmJrRMeW5vzr1IaUaK0_Ib60VeSWjjLgQ4hi52Q9IUzwAyPcwZu6g','2025-11-16 07:57:02.000000','2025-11-16 07:57:02.000000',NULL),(5,'JLPT N4 Grammar Master','Tổng hợp ngữ pháp JLPT N4 kèm bài tập.','Japanese','Trung cấp','https://res.cloudinary.com/dkm6us88f/image/upload/v1766502594/ygj6m6e2qskvmqc6lrua.png','2025-11-16 07:57:02.000000','2025-12-23 15:09:58.989404',NULL),(6,'English for Beginners','Học các cấu trúc cơ bản và từ vựng thông dụng.','English','Sơ cấp','https://cdn2.fptshop.com.vn/unsafe/Uploads/images/tin-tuc/176193/Originals/phan-mem-hoc-tieng-anh-tren-may-tinh-1.jpg','2025-11-16 07:57:02.000000','2025-11-16 10:19:27.202479',NULL),(7,'English Speaking Practice','Khóa luyện nói tiếng Anh giao tiếp hàng ngày.','English','Trung cấp','https://cdn2.fptshop.com.vn/unsafe/Uploads/images/tin-tuc/176193/Originals/phan-mem-hoc-tieng-anh-tren-may-tinh-1.jpg','2025-11-16 07:57:02.000000','2025-11-16 10:19:44.935493',NULL),(8,'English Reading Skills','Cải thiện kỹ năng đọc hiểu tiếng Anh.','English','Trung cấp','https://cdn2.fptshop.com.vn/unsafe/Uploads/images/tin-tuc/176193/Originals/phan-mem-hoc-tieng-anh-tren-may-tinh-1.jpg','2025-11-16 07:57:02.000000','2025-11-16 10:19:36.128761',NULL),(9,'TOEIC 500+ Target','Ôn luyện chiến lược và dạng bài TOEIC hướng đến 500+.','English','Trung cấp','https://img.freepik.com/free-vector/hand-drawn-english-book-background_23-2149483336.jpg?semt=ais_hybrid&w=740&q=80','2025-11-16 07:57:02.000000','2025-11-16 07:57:02.000000',NULL),(10,'TOEIC 700+ Intensive','Lộ trình tăng tốc đạt TOEIC 700+.','English','Cao cấp','https://www.youstudy.com/gallery/blog/post/7-tips-to-learn-english-quickly-and-easily.jpg','2025-11-16 07:57:02.000000','2025-11-16 07:57:02.000000',NULL),(11,'Tiếng Việt cho người nước ngoài - Sơ cấp','Khóa học tiếng Việt căn bản dành cho người mới.','Vietnamese','Sơ cấp','https://play-lh.googleusercontent.com/0rjcyfERiHPWEdvHLJwjyFoCGt3BCTtUflTay0zfby6tOr62L_96-A4fIHeH-tcYeHo','2025-11-16 07:57:02.000000','2025-11-16 07:57:02.000000',NULL),(12,'Tiếng Việt giao tiếp','Khóa học luyện nói tiếng Việt hàng ngày.','Vietnamese','Trung cấp','https://cdn.prod.website-files.com/65f19583d0cb62aa48c1849b/65f19583d0cb62aa48c19213_About%20Vietnamese.png','2025-11-16 07:57:02.000000','2025-11-16 07:57:02.000000',NULL),(13,'Ngữ pháp tiếng Việt nâng cao','Tổng hợp cấu trúc nâng cao trong tiếng Việt.','Vietnamese','Cao cấp','https://res.cloudinary.com/dkm6us88f/image/upload/v1766511243/xatsguthwpqfoghk8wj3.jpg','2025-11-16 07:57:02.000000','2025-12-23 17:34:07.291462',NULL),(14,'Japanese Business Language','Tiếng Nhật thương mại cho môi trường công sở.','Japanese','Cao cấp','https://osakaywca.ac.jp/manage/wp-content/themes/ywca/assets/img/course/course-15.jpg','2025-11-16 07:57:02.000000','2025-11-16 07:57:02.000000',NULL),(15,'Japanese Listening Practice','Rèn luyện kỹ năng nghe tiếng Nhật qua hội thoại thực tế.','Japanese','Trung cấp','https://3d-universal.com/en/wp-content/uploads/2025/11/ChatGPT-Image-Nov-11-2025-07_36_36-PM.png','2025-11-16 07:57:02.000000','2025-11-16 07:57:02.000000',NULL),(16,'Advanced Japanese Writing','Luyện viết tiếng Nhật nâng cao, bài luận và email công việc.','Japanese','Cao cấp','https://trungtamtiengnhat.org/images/2017/09/25/Hoc-tieng-Nhat-3.jpg','2025-11-16 07:57:02.000000','2025-11-16 10:20:29.320770',NULL),(17,'English Business Communication','Tiếng Anh giao tiếp công sở dành cho người đi làm.','English','Trung cấp','https://cdn2.fptshop.com.vn/unsafe/Uploads/images/tin-tuc/176193/Originals/phan-mem-hoc-tieng-anh-tren-may-tinh-1.jpg','2025-11-16 07:57:02.000000','2025-11-16 10:19:17.948971',NULL),(18,'Advanced English Writing','Phát triển kỹ năng viết tiếng Anh nâng cao.','English','Cao cấp','https://cdn2.fptshop.com.vn/unsafe/Uploads/images/tin-tuc/176193/Originals/phan-mem-hoc-tieng-anh-tren-may-tinh-1.jpg','2025-11-16 07:57:02.000000','2025-11-16 10:18:59.550199',NULL),(19,'Vietnamese Culture & Language','Giúp người nước ngoài hiểu văn hóa Việt Nam thông qua ngôn ngữ.','Vietnamese','Trung cấp','https://lh6.googleusercontent.com/eT_v_eiD9K-SHyAbZ_SOAS4WRjsctELd43MAr-5b9OnMt1Uemd3ZIHu_XbT1_LrN7q85PZrLd2nbBEafVbary52bKa3_BunpxrNoUWvAvHRn_JRiBZO3k2qqLxvrlTHO0Ob5MQYt','2025-11-16 07:57:02.000000','2025-11-16 07:57:02.000000',NULL),(20,'Tiếng Nhật 7','Tiếng','Japanese','Trung cấp','https://play-lh.googleusercontent.com/gjYg_4qXAi4vnW11gbk0xLJfLVdX_BDFW8qrA6S67LQhf7Nl0Xt7KBH8PzVOs-vBHryf','2025-11-16 09:50:05.096213','2025-11-16 09:50:05.097214',3),(21,'Chinh phục IELTS Reading 6.5+ (Vocabulary)','Khóa học cung cấp từ vựng được sử dụng trong các bài đọc IELTS, hướng tới mục tiêu đạt band 6.5+ ở bài thi Reading. Khóa học phù hợp với người đã đạt tối thiểu band 5.0 ở bài thi Reading.','English','Sơ cấp','https://gdcenglish.edu.vn/wp-content/uploads/2023/04/IELTS-Mock-Test-Reading.png','2025-11-30 07:16:34.826366','2025-12-18 02:14:17.609177',4),(37,'Tiếng Anh dành cho IT','Khóa học tiếng Anh cơ bản chuyên ngành IT cho người mới bắt đầu','English','Sơ cấp','https://res.cloudinary.com/dkm6us88f/image/upload/v1766422808/mb5bl4khe9m5epsj7od7.webp','2025-12-22 17:00:11.024633','2025-12-22 17:00:11.024633',NULL),(39,'Tiếng Anh dành cho sinh viên NCKH (IT)','Khóa học cung cấp các từ vựng thường gặp trong các bài báo khoa học ở lĩnh vực CNTT','English','Trung cấp','https://res.cloudinary.com/dkm6us88f/image/upload/v1767161219/yzwzhzaadwh0r2pz3tud.webp','2025-12-31 06:07:04.879398','2025-12-31 06:07:04.879450',NULL);
/*!40000 ALTER TABLE `courses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_admin_log`
--

DROP TABLE IF EXISTS `django_admin_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_admin_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `action_time` datetime(6) NOT NULL,
  `object_id` longtext,
  `object_repr` varchar(200) NOT NULL,
  `action_flag` smallint unsigned NOT NULL,
  `change_message` longtext NOT NULL,
  `content_type_id` int DEFAULT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `django_admin_log_content_type_id_c4bce8eb_fk_django_co` (`content_type_id`),
  KEY `django_admin_log_user_id_c564eba6_fk_auth_user_id` (`user_id`),
  CONSTRAINT `django_admin_log_content_type_id_c4bce8eb_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`),
  CONSTRAINT `django_admin_log_user_id_c564eba6_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`),
  CONSTRAINT `django_admin_log_chk_1` CHECK ((`action_flag` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_admin_log`
--

LOCK TABLES `django_admin_log` WRITE;
/*!40000 ALTER TABLE `django_admin_log` DISABLE KEYS */;
INSERT INTO `django_admin_log` VALUES (1,'2025-11-16 09:50:05.155937','20','Tiếng Nhật 7',1,'[{\"added\": {}}]',8,3),(2,'2025-11-16 10:18:48.989398','18','Advanced English Writing',2,'[{\"changed\": {\"fields\": [\"Image url\"]}}]',8,3),(3,'2025-11-16 10:18:59.604784','18','Advanced English Writing',2,'[]',8,3),(4,'2025-11-16 10:19:18.015861','17','English Business Communication',2,'[{\"changed\": {\"fields\": [\"Image url\"]}}]',8,3),(5,'2025-11-16 10:19:27.260077','6','English for Beginners',2,'[{\"changed\": {\"fields\": [\"Image url\"]}}]',8,3),(6,'2025-11-16 10:19:36.187534','8','English Reading Skills',2,'[{\"changed\": {\"fields\": [\"Image url\"]}}]',8,3),(7,'2025-11-16 10:19:44.998067','7','English Speaking Practice',2,'[{\"changed\": {\"fields\": [\"Image url\"]}}]',8,3),(8,'2025-11-16 10:20:29.376877','16','Advanced Japanese Writing',2,'[{\"changed\": {\"fields\": [\"Image url\"]}}]',8,3),(9,'2025-11-16 10:20:41.060111','1','Japanese Basics 1',2,'[{\"changed\": {\"fields\": [\"Image url\"]}}]',8,3),(10,'2025-11-17 04:45:58.898260','11','UserCourse object (11)',2,'[{\"changed\": {\"fields\": [\"Status\"]}}]',15,3),(11,'2025-11-17 04:46:22.024820','11','UserCourse object (11)',2,'[{\"changed\": {\"fields\": [\"Status\", \"Reason\"]}}]',15,3),(12,'2025-11-17 05:29:33.520573','12','UserCourse object (12)',2,'[{\"changed\": {\"fields\": [\"Status\", \"Reason\"]}}]',15,3),(13,'2025-11-17 12:01:47.965410','14','UserCourse object (14)',2,'[{\"changed\": {\"fields\": [\"Status\"]}}]',15,3),(14,'2025-11-17 12:03:00.505408','14','UserCourse object (14)',2,'[{\"changed\": {\"fields\": [\"Status\"]}}]',15,3),(15,'2025-11-17 12:13:13.788565','14','UserCourse object (14)',2,'[{\"changed\": {\"fields\": [\"Status\"]}}]',15,3),(16,'2025-11-17 14:17:59.564191','17','UserCourse object (17)',2,'[{\"changed\": {\"fields\": [\"Status\"]}}]',15,1),(17,'2025-11-17 14:18:24.611892','17','UserCourse object (17)',2,'[{\"changed\": {\"fields\": [\"Status\"]}}]',15,1),(18,'2025-11-17 14:19:44.497497','17','UserCourse object (17)',2,'[{\"changed\": {\"fields\": [\"Status\"]}}]',15,1),(19,'2025-11-23 18:07:21.532606','20','UserCourse object (20)',2,'[{\"changed\": {\"fields\": [\"Status\"]}}]',15,1),(20,'2025-11-23 18:13:28.739476','19','UserCourse object (19)',2,'[{\"changed\": {\"fields\": [\"Status\"]}}]',15,4),(21,'2025-11-23 18:15:04.927072','21','UserCourse object (21)',2,'[{\"changed\": {\"fields\": [\"Status\"]}}]',15,4),(22,'2025-11-30 07:16:34.872438','21','Chinh phục IELTS Reading 6.5+ (Vocabulary)',1,'[{\"added\": {}}]',8,4),(23,'2025-11-30 07:18:50.991986','6','Chinh phục IELTS Reading 6.5+ (Vocabulary) - Environment & Climate Change',1,'[{\"added\": {}}]',9,4),(24,'2025-11-30 07:19:36.971330','7','Chinh phục IELTS Reading 6.5+ (Vocabulary) - Technology & Innovation Vocabulary',1,'[{\"added\": {}}]',9,4),(25,'2025-11-30 07:20:06.261317','8','Chinh phục IELTS Reading 6.5+ (Vocabulary) - Education & Learning Systems',1,'[{\"added\": {}}]',9,4),(26,'2025-11-30 07:20:31.331237','9','Chinh phục IELTS Reading 6.5+ (Vocabulary) - Society, Culture & Global Issues',1,'[{\"added\": {}}]',9,4),(27,'2025-11-30 07:20:54.489459','10','Chinh phục IELTS Reading 6.5+ (Vocabulary) - Science, Health & Research',1,'[{\"added\": {}}]',9,4),(28,'2025-11-30 07:22:02.891543','28','UserCourse object (28)',2,'[{\"changed\": {\"fields\": [\"Status\"]}}]',15,4),(29,'2025-12-10 09:16:11.623445','31','UserCourse object (31)',2,'[{\"changed\": {\"fields\": [\"Status\"]}}]',15,4),(30,'2025-12-11 15:33:25.905780','32','UserCourse object (32)',2,'[{\"changed\": {\"fields\": [\"Status\"]}}]',15,4),(31,'2025-12-16 09:49:25.919833','33','UserCourse object (33)',2,'[{\"changed\": {\"fields\": [\"Status\"]}}]',15,4),(32,'2025-12-16 17:23:07.484852','37','UserCourse object (37)',2,'[{\"changed\": {\"fields\": [\"Status\"]}}]',15,4),(33,'2025-12-16 17:23:20.089766','36','UserCourse object (36)',2,'[{\"changed\": {\"fields\": [\"Status\"]}}]',15,4),(34,'2025-12-16 17:23:32.425145','35','UserCourse object (35)',2,'[{\"changed\": {\"fields\": [\"Status\"]}}]',15,4),(35,'2025-12-16 17:23:44.532030','34','UserCourse object (34)',2,'[{\"changed\": {\"fields\": [\"Status\"]}}]',15,4),(36,'2025-12-16 17:24:15.774849','18','UserCourse object (18)',2,'[{\"changed\": {\"fields\": [\"Status\"]}}]',15,4),(37,'2025-12-16 18:05:58.935407','38','UserCourse object (38)',2,'[{\"changed\": {\"fields\": [\"Status\"]}}]',15,4),(38,'2025-12-17 06:40:29.696980','39','UserCourse object (39)',2,'[{\"changed\": {\"fields\": [\"Status\"]}}]',15,4);
/*!40000 ALTER TABLE `django_admin_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_apscheduler_djangojob`
--

DROP TABLE IF EXISTS `django_apscheduler_djangojob`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_apscheduler_djangojob` (
  `id` varchar(255) NOT NULL,
  `next_run_time` datetime(6) DEFAULT NULL,
  `job_state` longblob NOT NULL,
  PRIMARY KEY (`id`),
  KEY `django_apscheduler_djangojob_next_run_time_2f022619` (`next_run_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_apscheduler_djangojob`
--

LOCK TABLES `django_apscheduler_djangojob` WRITE;
/*!40000 ALTER TABLE `django_apscheduler_djangojob` DISABLE KEYS */;
/*!40000 ALTER TABLE `django_apscheduler_djangojob` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_apscheduler_djangojobexecution`
--

DROP TABLE IF EXISTS `django_apscheduler_djangojobexecution`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_apscheduler_djangojobexecution` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `status` varchar(50) NOT NULL,
  `run_time` datetime(6) NOT NULL,
  `duration` decimal(15,2) DEFAULT NULL,
  `finished` decimal(15,2) DEFAULT NULL,
  `exception` varchar(1000) DEFAULT NULL,
  `traceback` longtext,
  `job_id` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_job_executions` (`job_id`,`run_time`),
  KEY `django_apscheduler_djangojobexecution_run_time_16edd96b` (`run_time`),
  CONSTRAINT `django_apscheduler_djangojobexecution_job_id_daf5090a_fk` FOREIGN KEY (`job_id`) REFERENCES `django_apscheduler_djangojob` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_apscheduler_djangojobexecution`
--

LOCK TABLES `django_apscheduler_djangojobexecution` WRITE;
/*!40000 ALTER TABLE `django_apscheduler_djangojobexecution` DISABLE KEYS */;
/*!40000 ALTER TABLE `django_apscheduler_djangojobexecution` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_content_type`
--

DROP TABLE IF EXISTS `django_content_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_content_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `app_label` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `django_content_type_app_label_model_76bd3d3b_uniq` (`app_label`,`model`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_content_type`
--

LOCK TABLES `django_content_type` WRITE;
/*!40000 ALTER TABLE `django_content_type` DISABLE KEYS */;
INSERT INTO `django_content_type` VALUES (1,'admin','logentry'),(8,'api','course'),(10,'api','flashcard'),(9,'api','lesson'),(11,'api','notification'),(13,'api','question'),(12,'api','quiz'),(14,'api','quizattempt'),(7,'api','user'),(15,'api','usercourse'),(16,'api','userflashcard'),(17,'api','userlesson'),(3,'auth','group'),(2,'auth','permission'),(4,'auth','user'),(5,'contenttypes','contenttype'),(18,'django_apscheduler','djangojob'),(19,'django_apscheduler','djangojobexecution'),(6,'sessions','session');
/*!40000 ALTER TABLE `django_content_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_migrations`
--

DROP TABLE IF EXISTS `django_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_migrations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `app` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `applied` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_migrations`
--

LOCK TABLES `django_migrations` WRITE;
/*!40000 ALTER TABLE `django_migrations` DISABLE KEYS */;
INSERT INTO `django_migrations` VALUES (1,'contenttypes','0001_initial','2025-11-11 07:55:11.886160'),(2,'auth','0001_initial','2025-11-11 07:55:13.822413'),(3,'admin','0001_initial','2025-11-11 07:55:14.359091'),(4,'admin','0002_logentry_remove_auto_add','2025-11-11 07:55:14.424513'),(5,'admin','0003_logentry_add_action_flag_choices','2025-11-11 07:55:14.486457'),(6,'contenttypes','0002_remove_content_type_name','2025-11-11 07:55:14.994325'),(7,'auth','0002_alter_permission_name_max_length','2025-11-11 07:55:15.158540'),(8,'auth','0003_alter_user_email_max_length','2025-11-11 07:55:15.386837'),(9,'auth','0004_alter_user_username_opts','2025-11-11 07:55:15.502977'),(10,'auth','0005_alter_user_last_login_null','2025-11-11 07:55:16.013020'),(11,'auth','0006_require_contenttypes_0002','2025-11-11 07:55:16.231632'),(12,'auth','0007_alter_validators_add_error_messages','2025-11-11 07:55:16.294486'),(13,'auth','0008_alter_user_username_max_length','2025-11-11 07:55:16.478895'),(14,'auth','0009_alter_user_last_name_max_length','2025-11-11 07:55:16.662802'),(15,'auth','0010_alter_group_name_max_length','2025-11-11 07:55:16.815281'),(16,'auth','0011_update_proxy_permissions','2025-11-11 07:55:17.046635'),(17,'auth','0012_alter_user_first_name_max_length','2025-11-11 07:55:17.238999'),(18,'sessions','0001_initial','2025-11-11 07:55:17.520396'),(19,'api','0001_initial','2025-11-14 08:57:53.364802'),(20,'api','0002_alter_usercourse_user','2025-11-17 04:44:27.761729'),(21,'api','0003_alter_quizattempt_user','2025-11-30 15:06:51.204037'),(22,'api','0004_remove_old_fk_constraint','2025-11-30 15:11:51.878864'),(23,'api','0005_remove_user_lessons_old_fk','2025-11-30 16:41:21.422022'),(24,'api','0006_remove_all_auth_user_fk','2025-11-30 16:42:45.748402'),(25,'api','0007_add_flashcard_completed','2025-12-11 15:18:17.024011'),(26,'api','0008_remove_userflashcard_user_flashc_user_id_b49250_idx_and_more','2025-12-15 05:54:42.193384'),(27,'api','0009_add_notification_settings','2025-12-17 07:27:58.413459'),(28,'api','0009_add_userlesson_milestone_xp_awarded','2025-12-22 16:23:24.087003'),(29,'api','0010_add_usercourse_completion_xp_awarded','2025-12-22 16:35:24.013459'),(30,'django_apscheduler','0001_initial','2025-12-23 02:47:04.285394'),(31,'django_apscheduler','0002_auto_20180412_0758','2025-12-23 02:47:04.461245'),(32,'django_apscheduler','0003_auto_20200716_1632','2025-12-23 02:47:04.566788'),(33,'django_apscheduler','0004_auto_20200717_1043','2025-12-23 02:47:05.476002'),(34,'django_apscheduler','0005_migrate_name_to_id','2025-12-23 02:47:05.801542'),(35,'django_apscheduler','0006_remove_djangojob_name','2025-12-23 02:47:05.968904'),(36,'django_apscheduler','0007_auto_20200717_1404','2025-12-23 02:47:06.141516'),(37,'django_apscheduler','0008_remove_djangojobexecution_started','2025-12-23 02:47:06.301312'),(38,'django_apscheduler','0009_djangojobexecution_unique_job_executions','2025-12-23 02:47:06.450641'),(39,'api','0011_add_userflashcard_bookmark','2025-12-23 16:50:30.905354'),(40,'api','0012_remove_bookmark_fields','2025-12-23 17:08:04.917429'),(41,'api','0013_add_usercourse_reviewed_at','2025-12-24 07:27:48.145502');
/*!40000 ALTER TABLE `django_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_session`
--

DROP TABLE IF EXISTS `django_session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_session` (
  `session_key` varchar(40) NOT NULL,
  `session_data` longtext NOT NULL,
  `expire_date` datetime(6) NOT NULL,
  PRIMARY KEY (`session_key`),
  KEY `django_session_expire_date_a5c62663` (`expire_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_session`
--

LOCK TABLES `django_session` WRITE;
/*!40000 ALTER TABLE `django_session` DISABLE KEYS */;
INSERT INTO `django_session` VALUES ('2budcv7lzhlsf93jwmxb1lf06vxa229o','.eJxVjEEOwiAQAP-yZ0MWulDo0btvICxLpWrapLQn499Nkx70OjOZN8S0bzXuraxxEhhAw-WXccrPMh9CHmm-Lyov87ZOrI5Enbap2yLldT3bv0FNrcIApsviRy_WOLKavGhPtidnJSCOLES9F-w6DK5H1hxIbEiMhUcxGAx8vrdHNuc:1vIlXs:bd2d2kvCD5K7NYrzsRKH7QvMvoV0nfbeJod_gvATXbE','2025-11-25 10:24:16.916201'),('5a3v27wr41arc1tix7iyyl9f4f0853r4','.eJxVjEEOwiAQRe_C2pAZoAgu3XsGwgAjVUOT0q6Md7dNutDtf-_9twhxXWpYe5nDmMVFGHH63SimZ2k7yI_Y7pNMU1vmkeSuyIN2eZtyeV0P9--gxl63GqAgmSGBd5YdsNdnw1olbRKQZrReW0bSyKAKuBTJZDSW1YC8ySg-X8dINzQ:1vPbcZ:DccU66O11JVGVK6GktGXZsQwFaIHTac2laZyHACYz8c','2025-12-14 07:13:23.971503'),('62o5ok7bgamlikupnqqja4qpe6jcnwpf','.eJxVjEEOwiAQRe_C2pAZoAgu3XsGwgAjVUOT0q6Md7dNutDtf-_9twhxXWpYe5nDmMVFGHH63SimZ2k7yI_Y7pNMU1vmkeSuyIN2eZtyeV0P9--gxl63GqAgmSGBd5YdsNdnw1olbRKQZrReW0bSyKAKuBTJZDSW1YC8ySg-X8dINzQ:1vNEaA:vBVCnxfd0pB67d_Rl0mdr-JY1c4G3YgNW25Q72NkylY','2025-12-07 18:13:06.304663'),('9ysw4idhoy1u46krypufzht2hg84o22o','.eJxVjEEOwiAQRe_C2pCBDgVcuvcMDcOAVA0kpV0Z765NutDtf-_9l5jCtpZp62mZZhZnocTpd6MQH6nugO-h3pqMra7LTHJX5EG7vDZOz8vh_h2U0Mu31kNklx0bPaJR6Fg5NBZHwx4gEyNaxzAM4EcLpMgjGx8IEmXW4LV4fwC3Rzbn:1vNESu:o9vMcVPqftwHlnX6zFmwVVa_JwbDqb_xMl8cbE0XlWg','2025-12-07 18:05:36.056533'),('e8pzvayhhbga5szl12jpd7yaolqwr2f4','.eJxVjEEOwiAQRe_C2pAZoAgu3XsGwgAjVUOT0q6Md7dNutDtf-_9twhxXWpYe5nDmMVFGHH63SimZ2k7yI_Y7pNMU1vmkeSuyIN2eZtyeV0P9--gxl63GqAgmSGBd5YdsNdnw1olbRKQZrReW0bSyKAKuBTJZDSW1YC8ySg-X8dINzQ:1vVlCU:DKBOXVLkphF2VrJcS19xAV0HXyVsSyGHc81iGstBR0s','2025-12-31 06:39:54.708565'),('jslqzhlkmh9hct9om3poa199u2ys1r9f','.eJyrVopPLC3JiC8tTi2Kz0xRslIyUdJBFktKTM5OzQNJpGQl5qXn6yXn55UUZSbpgZToQWWL9XzzU1JznKBqUQzISCzOAOpWqgUAGdwmUA:1vYJve:zzM0UKjYmm0g4z0F78rvqojBE2KZm0M5Qd4b1FepW8Y','2026-01-07 08:09:06.390224'),('mksp23osw6ptssfozcxplyb8g78na5dp','.eJxVjEEOwiAQRe_C2pAZoAgu3XsGwgAjVUOT0q6Md7dNutDtf-_9twhxXWpYe5nDmMVFGHH63SimZ2k7yI_Y7pNMU1vmkeSuyIN2eZtyeV0P9--gxl63GqAgmSGBd5YdsNdnw1olbRKQZrReW0bSyKAKuBTJZDSW1YC8ySg-X8dINzQ:1vNYmM:XGUmwENjJFd-BBkWq3ITkRRC1xPW4SHYlahMDQo90bU','2025-12-08 15:47:02.427795'),('ny4zugmtd1qr6f3ln2vonze0ji0d4rj5','.eJyrVopPLC3JiC8tTi2Kz0xRslIyUdJBFktKTM5OzQNJpGQl5qXn6yXn55UUZSbpgZToQWWL9XzzU1JznKBqUQzISCzOULJSUqoFABncJlA:1vYwk8:8OWBtSZjb7DwsmXLCCgStYYj5LxUDKyZNjTDuFIkWJc','2026-01-09 01:35:48.258394'),('r9tc2q3oe7icfxq9x885dtsr8fddu2ea','.eJxVjEEOwiAQRe_C2pAZoAgu3XsGwgAjVUOT0q6Md7dNutDtf-_9twhxXWpYe5nDmMVFGHH63SimZ2k7yI_Y7pNMU1vmkeSuyIN2eZtyeV0P9--gxl63GqAgmSGBd5YdsNdnw1olbRKQZrReW0bSyKAKuBTJZDSW1YC8ySg-X8dINzQ:1vNYwn:bA0NrQ3NrGV6hAZtEP0tzwMRfVCydHdVYTUuFPWlhpw','2025-12-08 15:57:49.277361'),('s4kdzqdi6zn470oc1gg51idexzwkwlek','.eJxVjEEOwiAQRe_C2hAoAzgu3fcMZGBAqoYmpV0Z765NutDtf-_9lwi0rTVsPS9hYnERRpx-t0jpkdsO-E7tNss0t3WZotwVedAux5nz83q4fweVev3WiiFqY5KDFH1y9mwHB7qYDAYjZe8KQkHHiLkA-6iBvE1YYFDs2Sjx_gDa3je6:1vKXk8:LQxb_RFAk6fGkamz2qzLKpOy-4hSX2kwHRHlZ_4L4Xk','2025-11-30 08:04:16.344844'),('sl5518cynkl09dkyex69ypmyy39aakyf','.eJyrVopPLC3JiC8tTi2Kz0xRslIyUdJBFktKTM5OzQNJpGQl5qXn6yXn55UUZSbpgZToQWWL9XzzU1JznKBqUQzISCzOULJSUqoFABncJlA:1vTGHe:cw2UU0aPsLdJ12rBjbOMpL72aiZVc6yPSX9_zBOX8uE','2025-12-24 09:14:54.927942'),('vd3zekd4t1tep902ptr08lg4s5eww00p','.eJxVjEEOwiAQAP-yZ0MWulDo0btvICxLpWrapLQn499Nkx70OjOZN8S0bzXuraxxEhhAw-WXccrPMh9CHmm-Lyov87ZOrI5Enbap2yLldT3bv0FNrcIApsviRy_WOLKavGhPtidnJSCOLES9F-w6DK5H1hxIbEiMhUcxGAx8vrdHNuc:1vIjI5:6VvWXVEw3usrowa4JtgtcSgbkLmCQ4Kf_txyqR1rxlE','2025-11-25 07:59:49.425438'),('yv7n14bfz5eqj53crrpm49boon7y0j7d','.eJyrVopPLC3JiC8tTi2Kz0xRslIyUdJBFktKTM5OzQNJpGQl5qXn6yXn55UUZSbpgZToQWWL9XzzU1JznKBqUQzISCzOAOpWqgUAGdwmUA:1vTigf:zxJptAJkS5I08wMXH26UIhNhGWgagNyAMkNhnfib71A','2025-12-25 15:34:37.904100');
/*!40000 ALTER TABLE `django_session` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `flashcards`
--

DROP TABLE IF EXISTS `flashcards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flashcards` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `word` longtext NOT NULL,
  `meaning` longtext NOT NULL,
  `example` longtext,
  `image_url` longtext,
  `created_at` datetime(6) NOT NULL,
  `lesson_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `flashcards_lesson_id_0f4722fb_fk_lessons_id` (`lesson_id`),
  CONSTRAINT `flashcards_lesson_id_0f4722fb_fk_lessons_id` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=96 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `flashcards`
--

LOCK TABLES `flashcards` WRITE;
/*!40000 ALTER TABLE `flashcards` DISABLE KEYS */;
INSERT INTO `flashcards` VALUES (1,'Agenda','Chương trình nghị sự','Please check the agenda...','https://i.imgur.com/example.png','2025-11-16 17:46:09.000000',1),(2,'Colleague','Đồng nghiệp','I will discuss this matter with my colleagues.',NULL,'2025-11-16 17:46:09.000000',1),(3,'Deadline','Hạn chót','The deadline for the report is next Monday.',NULL,'2025-11-16 17:46:09.000000',1),(4,'Department','Phòng ban','Ms. Yui works in the Human Resources department.',NULL,'2025-11-16 17:46:09.000000',1),(5,'Memo (Memorandum)','Thông báo nội bộ','A memo was sent to all staff...',NULL,'2025-11-16 17:46:09.000000',1),(6,'Overtime','Làm thêm giờ','Employees will be paid for working overtime.',NULL,'2025-11-16 17:46:09.000000',1),(7,'Budget','Ngân sách','We need to reduce our travel budget.',NULL,'2025-11-16 17:46:09.000000',1),(8,'Presentation','Bài thuyết trình','He gave an excellent presentation...',NULL,'2025-11-16 17:46:09.000000',1),(9,'Conference','Hội nghị','The annual conference will be held in Berlin.','https://i.imgur.com/example.png','2025-11-16 17:46:09.000000',1),(10,'Schedule','Lịch trình','Her schedule is very busy this week.',NULL,'2025-11-16 17:46:09.000000',1),(11,'In (time)','Vào (tháng, năm, mùa, buổi)','The meeting is in July...','https://res.cloudinary.com/dkm6us88f/image/upload/v1765992004/s8qfy4imhtc5qqdmawix.png','2025-11-16 17:46:35.000000',2),(12,'On (time)','Vào (ngày, thứ)','The report is due on Friday...',NULL,'2025-11-16 17:46:35.000000',2),(13,'At (time)','Vào (giờ, thời điểm cụ thể)','The seminar starts at 10:00 AM...',NULL,'2025-11-16 17:46:35.000000',2),(14,'For (duration)','Trong (khoảng thời gian)','He has worked here for three years.',NULL,'2025-11-16 17:46:35.000000',2),(15,'During (period)','Trong suốt (kỳ, sự kiện)','Please remain silent during the presentation.',NULL,'2025-11-16 17:46:35.000000',2),(16,'By (deadline)','Trước (hạn chót)','You must submit the application by October 31st.',NULL,'2025-11-16 17:46:35.000000',2),(17,'Responsible for','Chịu trách nhiệm cho','She is responsible for managing the team.',NULL,'2025-11-16 17:46:35.000000',2),(18,'Interested in','Quan tâm đến','Are you interested in applying for the position?',NULL,'2025-11-16 17:46:35.000000',2),(19,'Depend on','Phụ thuộc vào','The success of the project depends on teamwork.',NULL,'2025-11-16 17:46:35.000000',2),(21,'Leaning against','Tựa vào','A man is leaning against a vehicle.','https://i.imgur.com/example.png','2025-11-16 17:47:34.000000',5),(22,'Potted plant','Cây trồng trong chậu','There are potted plants on the balcony.',NULL,'2025-11-16 17:47:34.000000',5),(23,'Stack','Chồng, đống (danh từ/động từ)','Boxes are stacked in the warehouse...',NULL,'2025-11-16 17:47:34.000000',5),(24,'Pavement','Vỉa hè','Some people are walking on the pavement.',NULL,'2025-11-16 17:47:34.000000',5),(25,'Adjusting','Điều chỉnh','The man is adjusting his glasses.',NULL,'2025-11-16 17:47:34.000000',5),(26,'Arranging','Sắp xếp','She is arranging flowers in a vase.','https://i.imgur.com/example.png','2025-11-16 17:47:34.000000',5),(27,'Examine','Kiểm tra, xem xét kỹ','The mechanic is examining the car engine.',NULL,'2025-11-16 17:47:34.000000',5),(28,'Stock (verb)','Trữ hàng, lấp đầy','The shelves are being stocked with merchandise.',NULL,'2025-11-16 17:47:34.000000',5),(29,'Unattended','Không có người trông coi','A suitcase was left unattended in the lobby.',NULL,'2025-11-16 17:47:34.000000',5),(30,'Water (verb)','Tưới (cây)','A woman is watering the plants.',NULL,'2025-11-16 17:47:34.000000',5),(31,'Artificial Intelligence','Trí tuệ nhân tạo','Artificial Intelligence is widely used in healthcare and finance.',NULL,'2025-12-22 15:50:27.912752',14),(32,'Machine Learning','Học máy','Machine learning helps systems improve performance without explicit programming.',NULL,'2025-12-22 15:50:46.081084',14),(33,'Automation','Tự động hóa','Automation reduces human error and increases productivity.',NULL,'2025-12-22 15:51:03.551199',14),(34,'Digital Transformation','Chuyển đổi số','Digital transformation is essential for companies to stay competitive.',NULL,'2025-12-22 15:51:35.022387',14),(35,'Big Data','Dữ liệu lớn','Big data enables companies to analyze customer behavior more accurately.',NULL,'2025-12-22 15:51:56.312053',14),(36,'Vます + ながら','Vừa A vừa B (hai hành động cùng lúc, cùng chủ ngữ)','音楽を聞きながら勉強します。\r\n→ Tôi vừa nghe nhạc vừa học bài.',NULL,'2025-12-23 15:12:27.654425',15),(37,'Vます / Aい / Aな + そうです','Có vẻ là… (phán đoán qua bề ngoài)','雨が降りそうです。\r\n(Có vẻ sắp mưa)',NULL,'2025-12-23 15:14:21.881697',15),(38,'Vて + しまいます','Làm xong / lỡ làm (nuối tiếc)','財布を忘れてしまいました。\r\n(Lỡ quên ví mất rồi)',NULL,'2025-12-23 15:14:51.791464',15),(39,'Vる / Vない + ようになります','Trở nên / bắt đầu có khả năng','日本語が話せるようになりました。\r\n(Đã nói được tiếng Nhật)',NULL,'2025-12-23 15:15:17.709724',15),(40,'Vる / Vない + ようにします','Cố gắng / quyết tâm làm gì','毎日運動するようにします。\r\n(Tôi sẽ cố gắng tập thể dục mỗi ngày)',NULL,'2025-12-23 15:15:41.633014',15),(41,'Vる / Nの + ために','Để / vì mục đích','日本で働くために、日本語を勉強しています。\r\n(Học tiếng Nhật để làm việc ở Nhật)',NULL,'2025-12-23 15:16:03.458521',15),(42,'普通形 + し、～し','Vừa… vừa… (liệt kê lý do)','この店は安いし、おいしいし、人気があります。\r\n(Quán này vừa rẻ vừa ngon)',NULL,'2025-12-23 15:16:33.308427',15),(43,'Vば / Aば + Aほど','Càng… càng…','日本語は勉強すればするほど面白くなります。\r\n(Càng học tiếng Nhật càng thú vị)',NULL,'2025-12-23 15:17:04.581164',15),(44,'～てあげます／～てもらいます','Cho / được làm gì (liên quan đến quan hệ người)','友だちに宿題を手伝ってもらいました。\r\n(Được bạn giúp bài tập)',NULL,'2025-12-23 15:17:26.471673',15),(45,'普通形 + かもしれません','Có lẽ / có thể là','明日は雨が降るかもしれません。\r\n(Có lẽ ngày mai sẽ mưa)',NULL,'2025-12-23 15:17:49.973290',15),(46,'algorithm','Thuật toán','This algorithm sorts numbers efficiently.',NULL,'2025-12-23 16:53:04.659321',16),(47,'variable','Biến','The variable stores the user\'s age.',NULL,'2025-12-23 16:53:24.873667',16),(48,'function','Hàm','This function calculates the total prices.',NULL,'2025-12-23 16:53:46.010442',16),(49,'loop','Vòng lặp','A loop is used to repeat the process.',NULL,'2025-12-23 16:54:07.804578',16),(50,'bug','Lỗi','The developer fixed a critical bug.',NULL,'2025-12-23 16:54:28.239231',16),(51,'frontend','Phần giao diện người dùng','React is used for frontend development.','https://res.cloudinary.com/dkm6us88f/image/upload/v1766509180/nloon42rrbpepj83xb9v.png','2025-12-23 16:58:32.917867',17),(52,'backend','Phần xử lý logic và dữ liệu','Django is a backend framework.','https://res.cloudinary.com/dkm6us88f/image/upload/v1766509240/h8uaeobxv1sw8aa77pe1.jpg','2025-12-23 16:59:00.297616',17),(53,'API','Giao diện cho các hệ thống giao tiếp với nhau','The app fetches data via an API.','https://res.cloudinary.com/dkm6us88f/image/upload/v1766509312/ew9p0dwvqj7hspmytvf8.jpg','2025-12-23 17:01:51.880061',17),(54,'HTTP Request','Yêu cầu gửi từ client đến server','The browser sends an HTTP request.','https://res.cloudinary.com/dkm6us88f/image/upload/v1766509358/qjvgt77ewnznvzbb5kw8.jpg','2025-12-23 17:02:38.444104',17),(55,'Database','Cơ sở dữ liệu','User data is stored in the database.','https://res.cloudinary.com/dkm6us88f/image/upload/v1766509402/vhcsbbdtk4gahsmgp8wb.png','2025-12-23 17:03:21.697527',17),(56,'Framework','Bộ khung hỗ trợ phát triển phần mềm','Spring is a popular Java framework.','https://res.cloudinary.com/dkm6us88f/image/upload/v1766509749/fi20s6jaijsn0w8yru0j.png','2025-12-23 17:09:07.772160',18),(57,'Library','Thư viện mã nguồn','NumPy is a Python library.','https://res.cloudinary.com/dkm6us88f/image/upload/v1766509783/t1roatzrjf5z9eksfhbj.png','2025-12-23 17:09:43.362895',18),(58,'Version Control','Quản lý phiên bản code','Git is used for version control.',NULL,'2025-12-23 17:09:57.138524',18),(59,'Repository','Kho chứa mã nguồn','The project is on GitHub repository.','https://res.cloudinary.com/dkm6us88f/image/upload/v1766509828/yofigtnujyhdtbbchjhx.jpg','2025-12-23 17:10:27.955306',18),(60,'Deploy','Triển khai ứng dụng','The app was deployed to the server.',NULL,'2025-12-23 17:10:45.348016',18),(61,'Server','Máy chủ cung cấp dịch vụ','The server handles client requests.',NULL,'2025-12-23 17:13:48.579951',19),(62,'Client','Thiết bị gửi yêu cầu','Thiết bị gửi yêu cầu',NULL,'2025-12-23 17:14:00.589886',19),(63,'IP Address','Địa chỉ mạng','Each device has a unique IP address.',NULL,'2025-12-23 17:14:14.101061',19),(64,'Protocol','Giao','HTTP is a protocol.',NULL,'2025-12-23 17:14:27.242653',19),(65,'Cloud Computing','Điện toán đám mây','AWS provides cloud services.',NULL,'2025-12-23 17:14:39.624545',19),(66,'Machine Learning','Học máy','ML models learn from data.',NULL,'2025-12-23 17:19:16.864221',20),(67,'Dataset','Tập dữ liệu','The dataset contains 10,000 samples.',NULL,'2025-12-23 17:19:28.537071',20),(68,'Model','Mô hình','The model predicts user behavior.',NULL,'2025-12-23 17:19:40.693264',20),(69,'Training','Quá trình huấn luyện','Training takes several hours',NULL,'2025-12-23 17:19:54.616363',20),(70,'Accuracy','Độ chính xác','The model achieved 95% accuracy.',NULL,'2025-12-23 17:20:06.193889',20),(71,'～ため（に）','理由・原因を表す','雨が降ったため、試合は中止になりました。',NULL,'2025-12-23 17:23:21.470295',13),(72,'～おかげで','良い結果の理由','先生のおかげで、日本語が上達しました。',NULL,'2025-12-23 17:23:34.730895',13),(73,'～せいで','悪い結果の理由','雨のせいで、電車が遅れました。',NULL,'2025-12-23 17:23:46.656272',13),(74,'～によって','原因・手段・違い','人によって考え方が違います。',NULL,'2025-12-23 17:23:58.971129',13),(75,'～からこそ','強調した理由','大変だったからこそ、成長できました。',NULL,'2025-12-23 17:24:09.742620',13),(76,'～のに','期待と違う結果','勉強したのに、試験に落ちました。',NULL,'2025-12-23 17:26:48.521788',21),(77,'～ても','条件に関係ない結果','雨が降っても、行きます。',NULL,'2025-12-23 17:26:59.088079',21),(78,'～一方で','対照的な二つの事柄','給料は高い一方で、仕事は大変です。',NULL,'2025-12-23 17:27:10.484969',21),(79,'～ながら（も）','同時・逆の内容','体が痛いながらも、働いています。',NULL,'2025-12-23 17:27:32.679171',21),(80,'～とはいえ','一部認めつつ反論','便利とはいえ、値段が高いです。',NULL,'2025-12-23 17:27:43.603659',21),(81,'～ようだ','見た感じの判断','雨が降りそうなようです。',NULL,'2025-12-23 17:30:28.364591',22),(82,'～らしい','伝聞・一般的な情報','あの店はおいしいらしいです。',NULL,'2025-12-23 17:30:40.255964',22),(83,'～に違いない','強い確信','彼は犯人に違いない。',NULL,'2025-12-23 17:30:52.277500',22),(84,'～はずだ','論理的な結論','もう着いているはずです。',NULL,'2025-12-23 17:31:03.728126',22),(85,'～かもしれない','可能性','明日は雨かもしれません。',NULL,'2025-12-23 17:31:22.576489',22),(86,'Câu ghép đẳng lập','Các vế có quan hệ ngang hàng','Trời mưa, và đường trơn.',NULL,'2025-12-23 17:34:50.812974',23),(87,'Câu ghép chính – phụ','Một vế bổ sung, giải thích cho vế chính','Tôi nghỉ học vì bị ốm.',NULL,'2025-12-23 17:35:04.610074',23),(88,'Quan hệ điều kiện – kết quả','nếu… thì…, hễ… thì…','Nếu chăm chỉ, thì sẽ tiến bộ.',NULL,'2025-12-23 17:35:19.566523',23),(89,'Quan hệ nhượng bộ','mặc dù… nhưng…','Mặc dù khó, nhưng tôi vẫn làm.',NULL,'2025-12-23 17:35:32.307705',23),(90,'Quan hệ tăng tiến – giảm tiến','không những… mà còn…','Cô ấy không những thông minh mà còn chăm chỉ.',NULL,'2025-12-23 17:35:44.489511',23),(91,'Cloud computing','Điện toán đám mây','',NULL,'2025-12-31 06:19:39.816289',7),(92,'Virtual reality (VR)','Thực tế ảo','',NULL,'2025-12-31 06:20:00.713088',7),(93,'Big data','Dữ liệu lớn','',NULL,'2025-12-31 06:20:17.762560',7),(94,'Blockchain','Blockchain -Sổ kỹ thuật số phi tập trung ghi lại các giao dịch trên nhiều máy tính','',NULL,'2025-12-31 06:21:02.967513',7),(95,'Internet of Things (IoT)','Internet vạn vật','',NULL,'2025-12-31 06:21:28.850910',7);
/*!40000 ALTER TABLE `flashcards` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lessons`
--

DROP TABLE IF EXISTS `lessons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lessons` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` longtext NOT NULL,
  `description` longtext,
  `order_index` int NOT NULL,
  `status` varchar(8) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `course_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `lessons_course_id_96ce8d06_fk_courses_id` (`course_id`),
  CONSTRAINT `lessons_course_id_96ce8d06_fk_courses_id` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lessons`
--

LOCK TABLES `lessons` WRITE;
/*!40000 ALTER TABLE `lessons` DISABLE KEYS */;
INSERT INTO `lessons` VALUES (1,'Bài 1: Từ vựng chủ đề Văn phòng','Các danh từ, động từ và cụm từ phổ biến trong môi trường công sở...',1,'active','2025-11-16 17:45:19.000000','2025-12-17 16:10:49.330712',9),(2,'Bài 2: Ngữ pháp Part 5 - Giới từ (Prepositions)','Ôn tập các giới từ chỉ thời gian, địa điểm và các cụm giới từ....',2,'active','2025-11-16 17:46:29.000000','2025-12-17 17:23:30.885240',9),(3,'Bài 3: Listening Part 1 - Cụm từ mô tả Tranh ảnh','Học các cụm động từ và danh từ phổ biến dùng để mô tả hành động...',3,'active','2025-11-16 17:46:49.000000','2025-11-16 17:46:49.000000',9),(4,'Bài 3: Listening Part 1 - Cụm từ mô tả Tranh ảnh','Học các cụm động từ và danh từ phổ biến dùng để mô tả hành động...',3,'active','2025-11-16 17:46:52.000000','2025-11-16 17:46:52.000000',9),(5,'Bài 3: Listening Part 1 - Cụm từ mô tả Tranh ảnh','Học các cụm động từ và danh từ phổ biến dùng để mô tả hành động...',3,'active','2025-11-16 17:47:06.000000','2025-11-16 17:47:06.000000',9),(6,'Environment & Climate Change','Bài học giới thiệu các từ vựng học thuật thường gặp trong các chủ đề môi trường.',1,'active','2025-11-30 07:18:50.932610','2025-12-19 02:57:00.542833',21),(7,'Technology & Innovation Vocabulary','Tập trung vào nhóm từ vựng về công nghệ, khoa học và đổi mới.',2,'active','2025-11-30 07:19:36.914216','2025-12-19 06:01:51.087975',21),(13,'Bài 1：理由・原因を表す表現','Bài 1',1,'active','2025-12-19 05:57:34.396506','2025-12-23 17:23:05.024847',20),(14,'AI and the future of Digital transformation','In this lesson, you will learn some new words used to describe AI and Digital transformation',3,'active','2025-12-22 15:43:29.780712','2025-12-31 06:22:37.125675',21),(15,'第1課','第1課',1,'active','2025-12-23 15:08:03.805965','2025-12-23 15:08:03.805984',5),(16,'Programming Basics','Các thuật ngữ cơ bản về lập trình',1,'active','2025-12-23 16:52:29.079526','2025-12-23 16:52:29.079572',37),(17,'Web development','Các thuật ngữ liên quan đến phát triển web.',2,'active','2025-12-23 16:58:00.700263','2025-12-23 16:58:00.700293',37),(18,'Software development','Các từ vựng liên quan đến phát triển phần mềm',3,'active','2025-12-23 17:07:59.389957','2025-12-23 17:07:59.389984',37),(19,'Networking & System','Từ vựng liên quan đến mạng và hệ thống',4,'active','2025-12-23 17:13:29.581138','2025-12-23 17:13:29.581176',37),(20,'AI & Data','Từ vựng liên quan đến AI và Data',5,'active','2025-12-23 17:18:53.636012','2025-12-23 17:18:53.636059',37),(21,'Bài 2：逆接・対比の表現','逆接・対比の表現',2,'active','2025-12-23 17:26:31.604601','2025-12-23 17:26:31.604639',20),(22,'Bài 3：推量・判断の表現','推量・判断の表現',3,'active','2025-12-23 17:30:13.278567','2025-12-23 17:30:13.278653',20),(23,'Câu ghép & Quan hệ logic phức hợp','Ngữ pháp liên quan đến câu ghép',1,'active','2025-12-23 17:34:32.593601','2025-12-23 17:34:32.593682',13),(24,'Security','Bài học giới thiệu các từ vựng liên quan đến Bảo mật',6,'active','2025-12-24 04:10:22.716705','2025-12-24 04:10:22.716705',37),(25,'1','',1,'active','2025-12-24 04:16:41.709292','2025-12-24 04:16:41.709313',12),(26,'1','',1,'active','2025-12-24 04:16:42.463648','2025-12-24 04:16:42.463668',12);
/*!40000 ALTER TABLE `lessons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `description` longtext NOT NULL,
  `status` varchar(6) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `notifications_user_id_468e288d_fk_auth_user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=229 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (50,'Yêu cầu ghi danh của bạn vào khóa học \'Chinh phục IELTS Reading 6.5+ (Vocabulary)\' đã được duyệt.','read','2025-12-23 15:04:34.356538',16),(51,'Yêu cầu ghi danh của bạn vào khóa học \'Japanese Basics 2\' đã được duyệt.','read','2025-12-23 15:34:10.792575',16),(52,'Yêu cầu ghi danh của bạn vào khóa học \'Japanese Basics 2\' đã được duyệt.','read','2025-12-23 15:34:12.661176',16),(53,'Yêu cầu ghi danh của bạn vào khóa học \'Japanese Basics 1\' đã bị từ chối.','read','2025-12-23 15:34:24.940065',16),(54,'Yêu cầu ghi danh của bạn vào khóa học \'Japanese Basics 1\' đã được duyệt.','read','2025-12-23 16:11:57.730416',16),(55,'Yêu cầu ghi danh của bạn vào khóa học \'Japanese Basics 1\' đã được duyệt.','read','2025-12-23 16:11:59.750374',16),(56,'Yêu cầu ghi danh của bạn vào khóa học \'Tiếng Anh dành cho IT\' đã được duyệt.','read','2025-12-23 17:51:25.115042',12),(57,'Yêu cầu ghi danh của bạn vào khóa học \'Ngữ pháp tiếng Việt nâng cao\' đã được duyệt.','read','2025-12-23 17:51:28.219930',12),(60,'Yêu cầu ghi danh của bạn vào khóa học \'Japanese Basics 1\' đã được duyệt.','read','2025-12-23 18:16:22.861679',18),(61,'Yêu cầu ghi danh của bạn vào khóa học \'JLPT N4 Grammar Master\' đã bị từ chối.','read','2025-12-23 18:16:38.180048',18),(63,'Người dùng Lê Hải Nam (hainamlelele@gmail.com) đã gửi lại yêu cầu ghi danh vào khóa học \'JLPT N4 Grammar Master\'.','read','2025-12-23 18:16:55.775765',2),(64,'Người dùng Lê Hải Nam (hainamlelele@gmail.com) đã gửi lại yêu cầu ghi danh vào khóa học \'JLPT N4 Grammar Master\'.','read','2025-12-23 18:16:55.832102',3),(65,'Người dùng Lê Hải Nam (hainamlelele@gmail.com) đã gửi lại yêu cầu ghi danh vào khóa học \'JLPT N4 Grammar Master\'.','read','2025-12-23 18:16:55.889055',4),(66,'Người dùng Lê Hải Nam (hainamlelele@gmail.com) đã gửi lại yêu cầu ghi danh vào khóa học \'JLPT N4 Grammar Master\'.','read','2025-12-23 18:16:55.944978',13),(67,'Người dùng Lê Hải Nam (hainamlelele@gmail.com) đã gửi lại yêu cầu ghi danh vào khóa học \'JLPT N4 Grammar Master\'.','read','2025-12-23 18:16:55.999334',15),(70,'Người dùng Lê Hải Nam (hainamlelele@gmail.com) đã gửi yêu cầu ghi danh vào khóa học \'Japanese Basics 2\'.','read','2025-12-23 18:21:40.068810',2),(71,'Người dùng Lê Hải Nam (hainamlelele@gmail.com) đã gửi yêu cầu ghi danh vào khóa học \'Japanese Basics 2\'.','read','2025-12-23 18:21:40.124612',3),(72,'Người dùng Lê Hải Nam (hainamlelele@gmail.com) đã gửi yêu cầu ghi danh vào khóa học \'Japanese Basics 2\'.','read','2025-12-23 18:21:40.181829',4),(73,'Người dùng Lê Hải Nam (hainamlelele@gmail.com) đã gửi yêu cầu ghi danh vào khóa học \'Japanese Basics 2\'.','read','2025-12-23 18:21:40.237875',13),(74,'Người dùng Lê Hải Nam (hainamlelele@gmail.com) đã gửi yêu cầu ghi danh vào khóa học \'Japanese Basics 2\'.','read','2025-12-23 18:21:40.294127',15),(76,'Người dùng Lê Hải Nam (hainamlelele@gmail.com) đã gửi yêu cầu ghi danh vào khóa học \'Japanese Basics 2\'.','read','2025-12-23 18:21:45.105679',4),(77,'Yêu cầu ghi danh của bạn vào khóa học \'Japanese Basics 2\' đã được duyệt.','read','2025-12-23 18:29:04.689881',18),(78,'Người dùng Lê Hải Nam (hainamlelele@gmail.com) đã gửi yêu cầu ghi danh vào khóa học \'Japanese Conversation Starter\'.','read','2025-12-23 18:29:12.907393',2),(79,'Người dùng Lê Hải Nam (hainamlelele@gmail.com) đã gửi yêu cầu ghi danh vào khóa học \'Japanese Conversation Starter\'.','read','2025-12-23 18:29:12.964450',3),(80,'Người dùng Lê Hải Nam (hainamlelele@gmail.com) đã gửi yêu cầu ghi danh vào khóa học \'Japanese Conversation Starter\'.','read','2025-12-23 18:29:13.022086',4),(81,'Người dùng Lê Hải Nam (hainamlelele@gmail.com) đã gửi yêu cầu ghi danh vào khóa học \'Japanese Conversation Starter\'.','read','2025-12-23 18:29:13.079330',13),(82,'Người dùng Lê Hải Nam (hainamlelele@gmail.com) đã gửi yêu cầu ghi danh vào khóa học \'Japanese Conversation Starter\'.','read','2025-12-23 18:29:13.138754',15),(84,'Người dùng Lê Hải Nam (hainamlelele@gmail.com) đã gửi yêu cầu ghi danh vào khóa học \'Japanese Conversation Starter\'.','read','2025-12-23 18:29:14.273720',4),(86,'Yêu cầu ghi danh của bạn vào khóa học \'Japanese Conversation Starter\' đã được duyệt.','read','2025-12-23 18:32:20.611064',18),(87,'Người dùng Lê Hải Nam (hainamlelele@gmail.com) đã gửi yêu cầu ghi danh vào khóa học \'JLPT N5 Preparation\'.','read','2025-12-23 18:32:40.194386',2),(88,'Người dùng Lê Hải Nam (hainamlelele@gmail.com) đã gửi yêu cầu ghi danh vào khóa học \'JLPT N5 Preparation\'.','read','2025-12-23 18:32:40.251561',3),(89,'Người dùng Lê Hải Nam (hainamlelele@gmail.com) đã gửi yêu cầu ghi danh vào khóa học \'JLPT N5 Preparation\'.','read','2025-12-23 18:32:40.308238',4),(90,'Người dùng Lê Hải Nam (hainamlelele@gmail.com) đã gửi yêu cầu ghi danh vào khóa học \'JLPT N5 Preparation\'.','read','2025-12-23 18:32:40.362896',13),(91,'Người dùng Lê Hải Nam (hainamlelele@gmail.com) đã gửi yêu cầu ghi danh vào khóa học \'JLPT N5 Preparation\'.','read','2025-12-23 18:32:40.422450',15),(93,'Người dùng Lê Hải Nam (hainamlelele@gmail.com) đã gửi yêu cầu ghi danh vào khóa học \'JLPT N5 Preparation\'.','read','2025-12-23 18:32:41.520994',4),(94,'Người dùng Lê Hải Nam (hainamlelele@gmail.com) đã gửi yêu cầu ghi danh vào khóa học \'English for Beginners\'.','read','2025-12-23 18:33:19.148534',2),(95,'Người dùng Lê Hải Nam (hainamlelele@gmail.com) đã gửi yêu cầu ghi danh vào khóa học \'English for Beginners\'.','read','2025-12-23 18:33:19.204082',3),(96,'Người dùng Lê Hải Nam (hainamlelele@gmail.com) đã gửi yêu cầu ghi danh vào khóa học \'English for Beginners\'.','read','2025-12-23 18:33:19.261276',4),(103,'Người dùng Lê Hải Nam (hainamlelele@gmail.com) đã gửi yêu cầu ghi danh vào khóa học \'English Speaking Practice\'.','read','2025-12-23 18:34:15.164905',4),(131,'Yêu cầu ghi danh của bạn vào khóa học \'English Speaking Practice\' đã bị từ chối.','read','2025-12-23 18:52:39.669636',18),(132,'Yêu cầu ghi danh của bạn vào khóa học \'English for Beginners\' đã bị từ chối.','read','2025-12-23 18:57:03.838670',18),(133,'Yêu cầu ghi danh của bạn vào khóa học \'Tiếng Anh dành cho IT\' đã được duyệt.','unread','2025-12-24 04:14:05.197120',14),(134,'Yêu cầu ghi danh của bạn vào khóa học \'Tiếng Anh dành cho IT\' đã được duyệt.','unread','2025-12-24 04:14:05.846550',14),(136,'Yêu cầu ghi danh của bạn vào khóa học \'JLPT N5 Preparation\' đã được duyệt.','unread','2025-12-24 07:02:02.284293',18),(137,'Yêu cầu ghi danh của bạn vào khóa học \'JLPT N4 Grammar Master\' đã được duyệt.','unread','2025-12-24 07:04:48.832779',18),(138,'Người dùng Lê Hải Nam (hainamlelele@gmail.com) đã gửi yêu cầu ghi danh vào khóa học \'TOEIC 500+ Target\'.','unread','2025-12-24 07:05:07.565453',2),(139,'Người dùng Lê Hải Nam (hainamlelele@gmail.com) đã gửi yêu cầu ghi danh vào khóa học \'TOEIC 500+ Target\'.','unread','2025-12-24 07:05:07.741268',3),(140,'Người dùng Lê Hải Nam (hainamlelele@gmail.com) đã gửi yêu cầu ghi danh vào khóa học \'TOEIC 500+ Target\'.','read','2025-12-24 07:05:07.888395',4),(141,'Người dùng Lê Hải Nam (hainamlelele@gmail.com) đã gửi yêu cầu ghi danh vào khóa học \'TOEIC 500+ Target\'.','read','2025-12-24 07:05:07.980186',13),(142,'Người dùng Lê Hải Nam (hainamlelele@gmail.com) đã gửi yêu cầu ghi danh vào khóa học \'TOEIC 500+ Target\'.','unread','2025-12-24 07:05:08.218328',15),(143,'Người dùng Lê Hải Nam (hainamlelele@gmail.com) đã gửi yêu cầu ghi danh vào khóa học \'TOEIC 500+ Target\'.','unread','2025-12-24 07:05:08.312441',17),(144,'Người dùng Lê Hải Nam (hainamlelele@gmail.com) đã gửi yêu cầu ghi danh vào khóa học \'TOEIC 500+ Target\'.','unread','2025-12-24 07:05:09.620475',17),(146,'Bạn có 31 từ vựng cần ôn tập hôm nay. Bắt đầu ngay!','unread','2025-12-24 07:18:14.891939',12),(147,'Bạn có 5 từ vựng cần ôn tập hôm nay. Bắt đầu ngay!','unread','2025-12-24 07:18:21.641556',14),(148,'Bạn có 10 từ vựng cần ôn tập hôm nay. Bắt đầu ngay!','unread','2025-12-24 07:18:30.656603',16),(150,'Bạn có 31 từ vựng cần ôn tập hôm nay. Bắt đầu ngay!','unread','2025-12-24 07:19:37.252646',12),(151,'Bạn có 5 từ vựng cần ôn tập hôm nay. Bắt đầu ngay!','unread','2025-12-24 07:19:41.243292',14),(152,'Bạn có 10 từ vựng cần ôn tập hôm nay. Bắt đầu ngay!','read','2025-12-24 07:19:45.128244',16),(153,'Người dùng Trần Ngọc Hưng (hungngtran04@gmail.com) đã gửi yêu cầu ghi danh vào khóa học \'Tiếng Anh dành cho IT\'.','unread','2025-12-25 10:26:34.133294',2),(154,'Người dùng Trần Ngọc Hưng (hungngtran04@gmail.com) đã gửi yêu cầu ghi danh vào khóa học \'Tiếng Anh dành cho IT\'.','unread','2025-12-25 10:26:34.343731',3),(155,'Người dùng Trần Ngọc Hưng (hungngtran04@gmail.com) đã gửi yêu cầu ghi danh vào khóa học \'Tiếng Anh dành cho IT\'.','read','2025-12-25 10:26:34.552933',4),(156,'Người dùng Trần Ngọc Hưng (hungngtran04@gmail.com) đã gửi yêu cầu ghi danh vào khóa học \'Tiếng Anh dành cho IT\'.','read','2025-12-25 10:26:34.763144',13),(157,'Người dùng Trần Ngọc Hưng (hungngtran04@gmail.com) đã gửi yêu cầu ghi danh vào khóa học \'Tiếng Anh dành cho IT\'.','unread','2025-12-25 10:26:34.971985',15),(158,'Người dùng Trần Ngọc Hưng (hungngtran04@gmail.com) đã gửi yêu cầu ghi danh vào khóa học \'Tiếng Anh dành cho IT\'.','unread','2025-12-25 10:26:35.181026',17),(159,'Yêu cầu ghi danh của bạn vào khóa học \'Tiếng Anh dành cho IT\' đã được duyệt.','unread','2025-12-25 15:48:28.173367',8),(160,'Yêu cầu ghi danh của bạn vào khóa học \'Tiếng Anh dành cho IT\' đã được duyệt.','unread','2025-12-25 15:48:29.838740',8),(161,'Yêu cầu ghi danh của bạn vào khóa học \'TOEIC 500+ Target\' đã được duyệt.','unread','2025-12-25 16:32:15.452000',18),(163,'Bạn có 31 từ vựng cần ôn tập hôm nay. Bắt đầu ngay!','unread','2025-12-26 02:13:33.177485',12),(164,'Bạn có 10 từ vựng cần ôn tập hôm nay. Bắt đầu ngay!','unread','2025-12-26 02:13:37.102026',14),(165,'Bạn có 10 từ vựng cần ôn tập hôm nay. Bắt đầu ngay!','read','2025-12-26 02:13:40.314231',16),(166,'Người dùng Khánh Huyền (huyennana2004@gmail.com) đã gửi yêu cầu ghi danh vào khóa học \'English Speaking Practice\'.','unread','2025-12-26 06:21:43.342656',2),(167,'Người dùng Khánh Huyền (huyennana2004@gmail.com) đã gửi yêu cầu ghi danh vào khóa học \'English Speaking Practice\'.','unread','2025-12-26 06:21:43.552505',3),(168,'Người dùng Khánh Huyền (huyennana2004@gmail.com) đã gửi yêu cầu ghi danh vào khóa học \'English Speaking Practice\'.','read','2025-12-26 06:21:43.762994',4),(169,'Người dùng Khánh Huyền (huyennana2004@gmail.com) đã gửi yêu cầu ghi danh vào khóa học \'English Speaking Practice\'.','read','2025-12-26 06:21:43.973617',13),(170,'Người dùng Khánh Huyền (huyennana2004@gmail.com) đã gửi yêu cầu ghi danh vào khóa học \'English Speaking Practice\'.','unread','2025-12-26 06:21:44.187843',15),(171,'Người dùng Khánh Huyền (huyennana2004@gmail.com) đã gửi yêu cầu ghi danh vào khóa học \'English Speaking Practice\'.','unread','2025-12-26 06:21:44.397728',17),(172,'Người dùng Khánh Huyền (huyennana2004@gmail.com) đã gửi yêu cầu ghi danh vào khóa học \'English Speaking Practice\'.','read','2025-12-26 06:21:48.535134',13),(173,'Người dùng Tran Khanh Quynh (khanhquynh161204@gmail.com) đã gửi lại yêu cầu ghi danh vào khóa học \'Japanese Conversation Starter\'.','unread','2025-12-31 04:40:55.882798',2),(174,'Người dùng Tran Khanh Quynh (khanhquynh161204@gmail.com) đã gửi lại yêu cầu ghi danh vào khóa học \'Japanese Conversation Starter\'.','unread','2025-12-31 04:40:56.091338',3),(175,'Người dùng Tran Khanh Quynh (khanhquynh161204@gmail.com) đã gửi lại yêu cầu ghi danh vào khóa học \'Japanese Conversation Starter\'.','read','2025-12-31 04:40:56.300538',4),(176,'Người dùng Tran Khanh Quynh (khanhquynh161204@gmail.com) đã gửi lại yêu cầu ghi danh vào khóa học \'Japanese Conversation Starter\'.','read','2025-12-31 04:40:56.508614',13),(177,'Người dùng Tran Khanh Quynh (khanhquynh161204@gmail.com) đã gửi lại yêu cầu ghi danh vào khóa học \'Japanese Conversation Starter\'.','unread','2025-12-31 04:40:56.716901',15),(178,'Người dùng Tran Khanh Quynh (khanhquynh161204@gmail.com) đã gửi lại yêu cầu ghi danh vào khóa học \'Japanese Conversation Starter\'.','unread','2025-12-31 04:40:56.925099',17),(179,'Người dùng Tran Khanh Quynh (khanhquynh161204@gmail.com) đã gửi lại yêu cầu ghi danh vào khóa học \'Japanese Conversation Starter\'.','read','2025-12-31 04:41:00.953408',4),(180,'Người dùng Trương Lăng Hách (koxaliy994@emaxasp.com) đã gửi yêu cầu ghi danh vào khóa học \'Chinh phục IELTS Reading 6.5+ (Vocabulary)\'.','unread','2025-12-31 05:59:14.430676',2),(181,'Người dùng Trương Lăng Hách (koxaliy994@emaxasp.com) đã gửi yêu cầu ghi danh vào khóa học \'Chinh phục IELTS Reading 6.5+ (Vocabulary)\'.','unread','2025-12-31 05:59:14.635787',3),(182,'Người dùng Trương Lăng Hách (koxaliy994@emaxasp.com) đã gửi yêu cầu ghi danh vào khóa học \'Chinh phục IELTS Reading 6.5+ (Vocabulary)\'.','read','2025-12-31 05:59:14.840720',4),(183,'Người dùng Trương Lăng Hách (koxaliy994@emaxasp.com) đã gửi yêu cầu ghi danh vào khóa học \'Chinh phục IELTS Reading 6.5+ (Vocabulary)\'.','read','2025-12-31 05:59:15.045705',13),(184,'Người dùng Trương Lăng Hách (koxaliy994@emaxasp.com) đã gửi yêu cầu ghi danh vào khóa học \'Chinh phục IELTS Reading 6.5+ (Vocabulary)\'.','unread','2025-12-31 05:59:15.250411',15),(185,'Người dùng Trương Lăng Hách (koxaliy994@emaxasp.com) đã gửi yêu cầu ghi danh vào khóa học \'Chinh phục IELTS Reading 6.5+ (Vocabulary)\'.','unread','2025-12-31 05:59:15.454491',17),(186,'Người dùng Trương Lăng Hách (koxaliy994@emaxasp.com) đã gửi yêu cầu ghi danh vào khóa học \'Tiếng Nhật 7\'.','unread','2025-12-31 06:01:22.495967',2),(187,'Người dùng Trương Lăng Hách (koxaliy994@emaxasp.com) đã gửi yêu cầu ghi danh vào khóa học \'Tiếng Nhật 7\'.','unread','2025-12-31 06:01:22.695533',3),(188,'Người dùng Trương Lăng Hách (koxaliy994@emaxasp.com) đã gửi yêu cầu ghi danh vào khóa học \'Tiếng Nhật 7\'.','read','2025-12-31 06:01:22.898618',4),(189,'Người dùng Trương Lăng Hách (koxaliy994@emaxasp.com) đã gửi yêu cầu ghi danh vào khóa học \'Tiếng Nhật 7\'.','read','2025-12-31 06:01:23.099166',13),(190,'Người dùng Trương Lăng Hách (koxaliy994@emaxasp.com) đã gửi yêu cầu ghi danh vào khóa học \'Tiếng Nhật 7\'.','unread','2025-12-31 06:01:23.315422',15),(191,'Người dùng Trương Lăng Hách (koxaliy994@emaxasp.com) đã gửi yêu cầu ghi danh vào khóa học \'Tiếng Nhật 7\'.','unread','2025-12-31 06:01:23.516744',17),(192,'Người dùng Trương Lăng Hách (koxaliy994@emaxasp.com) đã gửi yêu cầu ghi danh vào khóa học \'Tiếng Nhật 7\'.','read','2025-12-31 06:01:27.712901',13),(193,'Yêu cầu ghi danh của bạn vào khóa học \'Tiếng Nhật 7\' đã được duyệt.','read','2025-12-31 06:01:52.561059',19),(195,'Yêu cầu ghi danh của bạn vào khóa học \'Japanese Conversation Starter\' đã bị từ chối.','read','2025-12-31 06:02:15.043658',16),(196,'Người dùng Trương Lăng Hách (koxaliy994@emaxasp.com) đã gửi yêu cầu ghi danh vào khóa học \'Tiếng Anh dành cho IT\'.','unread','2025-12-31 06:37:14.092950',2),(197,'Người dùng Trương Lăng Hách (koxaliy994@emaxasp.com) đã gửi yêu cầu ghi danh vào khóa học \'Tiếng Anh dành cho IT\'.','unread','2025-12-31 06:37:14.290279',3),(198,'Người dùng Trương Lăng Hách (koxaliy994@emaxasp.com) đã gửi yêu cầu ghi danh vào khóa học \'Tiếng Anh dành cho IT\'.','unread','2025-12-31 06:37:14.488201',4),(199,'Người dùng Trương Lăng Hách (koxaliy994@emaxasp.com) đã gửi yêu cầu ghi danh vào khóa học \'Tiếng Anh dành cho IT\'.','unread','2025-12-31 06:37:14.684638',13),(200,'Người dùng Trương Lăng Hách (koxaliy994@emaxasp.com) đã gửi yêu cầu ghi danh vào khóa học \'Tiếng Anh dành cho IT\'.','unread','2025-12-31 06:37:14.882132',15),(201,'Người dùng Trương Lăng Hách (koxaliy994@emaxasp.com) đã gửi yêu cầu ghi danh vào khóa học \'Tiếng Anh dành cho IT\'.','unread','2025-12-31 06:37:15.078665',17),(202,'Người dùng Trương Lăng Hách (koxaliy994@emaxasp.com) đã gửi yêu cầu ghi danh vào khóa học \'Tiếng Anh dành cho IT\'.','read','2025-12-31 06:37:19.512412',13),(203,'Yêu cầu ghi danh của bạn vào khóa học \'Tiếng Anh dành cho IT\' đã được duyệt.','unread','2025-12-31 06:37:48.175547',19),(204,'Người dùng Test-1 (htcfwhlzbggkdumujd@fxavaj.com) đã gửi yêu cầu ghi danh vào khóa học \'Japanese Basics 1\'.','unread','2026-01-01 19:25:56.128798',2),(205,'Người dùng Test-1 (htcfwhlzbggkdumujd@fxavaj.com) đã gửi yêu cầu ghi danh vào khóa học \'Japanese Basics 1\'.','unread','2026-01-01 19:25:56.332426',3),(206,'Người dùng Test-1 (htcfwhlzbggkdumujd@fxavaj.com) đã gửi yêu cầu ghi danh vào khóa học \'Japanese Basics 1\'.','unread','2026-01-01 19:25:56.537145',4),(207,'Người dùng Test-1 (htcfwhlzbggkdumujd@fxavaj.com) đã gửi yêu cầu ghi danh vào khóa học \'Japanese Basics 1\'.','unread','2026-01-01 19:25:56.740655',13),(208,'Người dùng Test-1 (htcfwhlzbggkdumujd@fxavaj.com) đã gửi yêu cầu ghi danh vào khóa học \'Japanese Basics 1\'.','unread','2026-01-01 19:25:56.944104',15),(209,'Người dùng Test-1 (htcfwhlzbggkdumujd@fxavaj.com) đã gửi yêu cầu ghi danh vào khóa học \'Japanese Basics 1\'.','unread','2026-01-01 19:25:57.147763',17),(210,'Người dùng Vũ Minh Quân (saclong00@gmail.com) đã gửi yêu cầu ghi danh vào khóa học \'English for Beginners\'.','unread','2026-01-05 07:50:51.454577',2),(211,'Người dùng Vũ Minh Quân (saclong00@gmail.com) đã gửi yêu cầu ghi danh vào khóa học \'English for Beginners\'.','unread','2026-01-05 07:50:51.651761',3),(212,'Người dùng Vũ Minh Quân (saclong00@gmail.com) đã gửi yêu cầu ghi danh vào khóa học \'English for Beginners\'.','unread','2026-01-05 07:50:51.848385',4),(213,'Người dùng Vũ Minh Quân (saclong00@gmail.com) đã gửi yêu cầu ghi danh vào khóa học \'English for Beginners\'.','unread','2026-01-05 07:50:52.044893',13),(214,'Người dùng Vũ Minh Quân (saclong00@gmail.com) đã gửi yêu cầu ghi danh vào khóa học \'English for Beginners\'.','unread','2026-01-05 07:50:52.241456',15),(215,'Người dùng Vũ Minh Quân (saclong00@gmail.com) đã gửi yêu cầu ghi danh vào khóa học \'English for Beginners\'.','unread','2026-01-05 07:50:52.443012',17),(216,'Người dùng Vũ Minh Quân (saclong00@gmail.com) đã gửi yêu cầu ghi danh vào khóa học \'Japanese Basics 1\'.','unread','2026-01-05 07:53:58.019449',2),(217,'Người dùng Vũ Minh Quân (saclong00@gmail.com) đã gửi yêu cầu ghi danh vào khóa học \'Japanese Basics 1\'.','unread','2026-01-05 07:53:58.220478',3),(218,'Người dùng Vũ Minh Quân (saclong00@gmail.com) đã gửi yêu cầu ghi danh vào khóa học \'Japanese Basics 1\'.','unread','2026-01-05 07:53:58.421973',4),(219,'Người dùng Vũ Minh Quân (saclong00@gmail.com) đã gửi yêu cầu ghi danh vào khóa học \'Japanese Basics 1\'.','unread','2026-01-05 07:53:58.623147',13),(220,'Người dùng Vũ Minh Quân (saclong00@gmail.com) đã gửi yêu cầu ghi danh vào khóa học \'Japanese Basics 1\'.','unread','2026-01-05 07:53:58.825386',15),(221,'Người dùng Vũ Minh Quân (saclong00@gmail.com) đã gửi yêu cầu ghi danh vào khóa học \'Japanese Basics 1\'.','unread','2026-01-05 07:53:59.030107',17),(222,'Người dùng Vũ Minh Quân (saclong00@gmail.com) đã gửi yêu cầu ghi danh vào khóa học \'JLPT N4 Grammar Master\'.','unread','2026-01-05 07:54:34.675054',2),(223,'Người dùng Vũ Minh Quân (saclong00@gmail.com) đã gửi yêu cầu ghi danh vào khóa học \'JLPT N4 Grammar Master\'.','unread','2026-01-05 07:54:34.872013',3),(224,'Người dùng Vũ Minh Quân (saclong00@gmail.com) đã gửi yêu cầu ghi danh vào khóa học \'JLPT N4 Grammar Master\'.','unread','2026-01-05 07:54:35.067543',4),(225,'Người dùng Vũ Minh Quân (saclong00@gmail.com) đã gửi yêu cầu ghi danh vào khóa học \'JLPT N4 Grammar Master\'.','unread','2026-01-05 07:54:35.262211',13),(226,'Người dùng Vũ Minh Quân (saclong00@gmail.com) đã gửi yêu cầu ghi danh vào khóa học \'JLPT N4 Grammar Master\'.','unread','2026-01-05 07:54:35.457132',15),(227,'Người dùng Vũ Minh Quân (saclong00@gmail.com) đã gửi yêu cầu ghi danh vào khóa học \'JLPT N4 Grammar Master\'.','unread','2026-01-05 07:54:35.652569',17),(228,'Yêu cầu ghi danh của bạn vào khóa học \'JLPT N4 Grammar Master\' đã được duyệt.','read','2026-01-05 07:55:16.743408',21);
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `questions`
--

DROP TABLE IF EXISTS `questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `questions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `question_text` longtext NOT NULL,
  `question_type` varchar(20) NOT NULL,
  `order_index` int NOT NULL,
  `answer` json NOT NULL,
  `quiz_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `questions_quiz_id_5c84443f_fk_quizzes_id` (`quiz_id`),
  CONSTRAINT `questions_quiz_id_5c84443f_fk_quizzes_id` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=73 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `questions`
--

LOCK TABLES `questions` WRITE;
/*!40000 ALTER TABLE `questions` DISABLE KEYS */;
INSERT INTO `questions` VALUES (9,'Fill in the blank: \"Protecting species is essential for maintaining _________.\"','fill_in',8,'{\"accepted_answers\": [\"ecosystem balance\", \"Ecosystem balance\", \"the ecosystem balance\"]}',1),(10,'Fill in the blank: \"Solar and wind power are forms of _________ energy.\"','fill_in',9,'{\"accepted_answers\": [\"renewable energy\", \"Renewable energy\"]}',1),(12,'Agenda là gì?','multiple_choice',1,'{\"options\": [\"Chương trình nghị sự \", \"Một loại phòng họp\", \"Cà phê\", \"Sổ\"], \"correct_option\": 0}',2),(13,'Colleague là?','fill_in',2,'{\"accepted_answers\": [\"Đồng nghiệp\", \"đồng nghiệp\"]}',2),(14,'Chọn từ đúng','drag_drop',3,'{\"pairs\": [{\"left\": \"Colleague\", \"right\": \"Đồng nghiệp\"}, {\"left\": \"Deadline\", \"right\": \"Hạn chót\"}, {\"left\": \"Department\", \"right\": \"Phòng ban\"}]}',2),(16,'heheh','multiple_choice',4,'{\"options\": [\"A\", \"B\", \"C\", \"D\"], \"correct_option\": 0}',2),(17,'What is Artificial Intelligence (AI)?','multiple_choice',1,'{\"options\": [\"A type of computer hardware\", \"A technology that enables machines to simulate human intelligence\", \"A word processing software\", \"A data storage system\"], \"correct_option\": 1}',4),(18,'Match the definitions with the correct words','drag_drop',2,'{\"pairs\": [{\"left\": \"Digital Transformation\", \"right\": \"The process of applying digital technology to all areas of an organization.\"}, {\"left\": \"Automation\", \"right\": \"The use of technology to replace or support humans in their work.\"}, {\"left\": \"Artificial Intelligence\", \"right\": \"A technology that enables machines to simulate human intelligence.\"}]}',4),(19,'What is a \"cloud service\"?','multiple_choice',1,'{\"options\": [\"A type of physical computer used for data storage\", \"A system where data is stored on remote servers and accessed over the internet\", \"A network of computers used only for online shopping\", \"A portable device for accessing the internet\"], \"correct_option\": 1}',3),(23,'Chọn câu đúng ngữ pháp ～ながら:','multiple_choice',1,'{\"options\": [\"日本語を勉強するながら、音楽を聞きます。\", \"日本語を勉強しながら、音楽を聞きます。\", \"日本語を勉強しながら、雨が降っています。\", \"日本語を勉強ながら、音楽を聞きます。\"], \"correct_option\": 1}',8),(24,'「このケーキはおいしそうです」 có nghĩa là gì?','multiple_choice',2,'{\"options\": [\"Nghe nói cái bánh này ngon\", \"Cái bánh này đã ngon rồi\", \"Cái bánh này trông có vẻ ngon\", \"Cái bánh này sẽ ngon trong tương lai\"], \"correct_option\": 2}',8),(25,'Điền ngữ pháp đã học vào chỗ trống: \n日本で働く（　　　）日本語を勉強しています。','fill_in',3,'{\"accepted_answers\": [\"ために\"]}',8),(26,'Điền ngữ pháp đúng vào chỗ trống:\n勉強すればする（　　　）、日本語が上手になります。','fill_in',4,'{\"accepted_answers\": [\"ほど\"]}',8),(27,'「宿題をやってしまいました」 thể hiện ý nào sau đây?','multiple_choice',5,'{\"options\": [\"Sắp làm bài tập\", \"Đang làm bài tập\", \"Muốn làm bài tập\", \"Đã làm xong / lỡ làm (nuối tiếc)\"], \"correct_option\": 3}',8),(28,'What is an algorithm?','multiple_choice',1,'{\"options\": [\"A programming language\", \"A set of steps to solve a problem\", \"A type of variable\", \"A computer\"], \"correct_option\": 1}',9),(29,'Which term refers to a container for data?','fill_in',2,'{\"accepted_answers\": [\"Variable\", \"variable\"]}',9),(30,'Which one is used to repeat execution?','multiple_choice',3,'{\"options\": [\"Variable\", \"Bug\", \"Algorithm\", \"Loop\"], \"correct_option\": 3}',9),(31,'Chọn từ phù hợp','drag_drop',4,'{\"pairs\": [{\"left\": \"Loop\", \"right\": \"Vòng lặp\"}, {\"left\": \"Algorithm\", \"right\": \"Thuật toán\"}, {\"left\": \"Bug\", \"right\": \"Lỗi\"}]}',9),(32,'Which part handles user interface?','multiple_choice',1,'{\"options\": [\"Backend\", \"Database\", \"API\", \"Frontend\"], \"correct_option\": 3}',10),(33,'What is backend responsible for?','multiple_choice',2,'{\"options\": [\"Design\", \"Logic and data processing\", \"Animations\", \"Styling\"], \"correct_option\": 1}',10),(34,'What sends data from client to server?','fill_in',3,'{\"accepted_answers\": [\"HTTP Request\", \"http request\", \"Http request\"]}',10),(35,'API is mainly used for:','multiple_choice',4,'{\"options\": [\"Storing files\", \"Designing UI\", \"Communication between systems\", \"Writing code\"], \"correct_option\": 2}',10),(36,'Drag and drop the correct answer(s)','drag_drop',5,'{\"pairs\": [{\"left\": \"Frontend\", \"right\": \"The part of a web application that users interact with directly, such as buttons, forms, and user interfaces.\"}, {\"left\": \"Backend\", \"right\": \"The server-side of an application that handles business logic, authentication, and data processing.\"}, {\"left\": \"Database\", \"right\": \"A structured system used to store, manage, and retrieve data efficiently.\"}, {\"left\": \"API\", \"right\": \"A set of rules and endpoints that allows different software systems to communicate with each other.\"}, {\"left\": \"HTTP Request\", \"right\": \"A message sent from a client to a server to request data or perform an action, usually using methods like GET or POST.\"}]}',10),(37,'A framework is used to','multiple_choice',1,'{\"options\": [\"Store data\", \"Provide a structure for development\", \"Fix bugs\", \"Test software\"], \"correct_option\": 1}',11),(38,'Which one is a library?','multiple_choice',2,'{\"options\": [\"React\", \"Git\", \"Docker\", \"NumPy\"], \"correct_option\": 3}',11),(39,'Git is used for','multiple_choice',3,'{\"options\": [\"Deployment\", \"UI design\", \"Version control\", \"Testing\"], \"correct_option\": 2}',11),(40,'A repository is','multiple_choice',4,'{\"options\": [\"A server\", \"A code storage place\", \"A database\", \"A framework\"], \"correct_option\": 3}',11),(41,'What does deploy mean?','multiple_choice',5,'{\"options\": [\"Write code\", \"Fix bugs\", \"Release application to server\", \"Delete app\"], \"correct_option\": 3}',11),(42,'What provides services to clients?','fill_in',1,'{\"accepted_answers\": [\"Server\", \"server\"]}',12),(43,'A browser is a','fill_in',2,'{\"accepted_answers\": [\"client\", \"Client\"]}',12),(44,'What identifies a device on a network?','multiple_choice',3,'{\"options\": [\"Bug\", \"Function\", \"IP Address\", \"Loop\"], \"correct_option\": 2}',12),(45,'HTTP is a','multiple_choice',4,'{\"options\": [\"Server\", \"Protocol\", \"Client\", \"Cloud\"], \"correct_option\": 1}',12),(46,'AWS is related to','multiple_choice',5,'{\"options\": [\"Cloud computing\", \"Frontend\", \"Bug fixing\", \"Algorithm\"], \"correct_option\": 0}',12),(47,'Drag and drop to the correct answers','drag_drop',6,'{\"pairs\": [{\"left\": \"Máy chủ cung cấp dịch vụ\", \"right\": \"Server\"}, {\"left\": \"IP Address\", \"right\": \"Địa chỉ mạng\"}, {\"left\": \"Giao thức\", \"right\": \"Protocol\"}, {\"left\": \"Cloud Computing\", \"right\": \"Điện toán đám mây\"}]}',12),(48,'What is cloud computing?','fill_in',7,'{\"accepted_answers\": [\"Điện toán đám mây\", \"điện toán đám mây\"]}',12),(49,'Machine Learning allows systems to:','multiple_choice',1,'{\"options\": [\"Write code\", \"Learn from data\", \"Design UI\", \"Store files\"], \"correct_option\": 1}',13),(50,'What is a dataset?','multiple_choice',2,'{\"options\": [\"A model\", \"A server\", \"A collection of data\", \"A framework\"], \"correct_option\": 2}',13),(51,'What predicts outcomes?','multiple_choice',3,'{\"options\": [\"Dataset\", \"Accuracy\", \"Training\", \"Model\"], \"correct_option\": 3}',13),(52,'Training is the process of:','multiple_choice',4,'{\"options\": [\"Testing UI\", \"Deploying app\", \"Teaching a model using data\", \"Fixing bugs\"], \"correct_option\": 2}',13),(53,'Training is the process of:','multiple_choice',4,'{\"options\": [\"Testing UI\", \"Deploying app\", \"Teaching a model using data\", \"Fixing bugs\"], \"correct_option\": 2}',13),(54,'雨が降った＿＿＿、イベントは中止になりました。','fill_in',1,'{\"accepted_answers\": [\"ため\"]}',14),(55,'「良い結果の理由」を表すのはどれですか。','multiple_choice',2,'{\"options\": [\"～せいで\", \"～ため\", \"～おかげで\", \"～によって\"], \"correct_option\": 2}',14),(56,'先生（　　）合格できました。','fill_in',3,'{\"accepted_answers\": [\"おかげで\"]}',14),(57,'悪い結果を表す表現は？','multiple_choice',4,'{\"options\": [\"～からこそ\", \"～おかげで\", \"～せいで\", \"～によって\"], \"correct_option\": 3}',14),(58,'努力した＿＿＿、今の自分があります。','fill_in',5,'{\"accepted_answers\": [\"からこそ\"]}',14),(59,'正しい答えをドラッグ＆ドロップしてください。','drag_drop',1,'{\"pairs\": [{\"left\": \"～のに\", \"right\": \"期待と違う結果\"}, {\"left\": \"条件に関係ない結果\", \"right\": \"～ても\"}, {\"left\": \"同時・逆の内容\", \"right\": \"同時・逆の内容\"}, {\"left\": \"一部認めつつ反論\", \"right\": \"～とはいえ\"}, {\"left\": \"～一方で\", \"right\": \"対照的な二つの事柄\"}]}',15),(60,'雨が降っ＿＿＿、出かけます。','fill_in',2,'{\"accepted_answers\": [\"ても\"]}',15),(61,'正しい答えをドラッグ＆ドロップしてください。','drag_drop',3,'{\"pairs\": [{\"left\": \"忙しい＿＿＿、毎日日本語を勉強しています。\", \"right\": \"ながらも\"}, {\"left\": \"簡単＿＿＿、時間がかかります。\", \"right\": \"とはいえ\"}]}',15),(62,'一番「強い確信」を表すのは？','multiple_choice',1,'{\"options\": [\"～かもしれない\", \"～ようだ\", \"～らしい\", \"～に違いない\"], \"correct_option\": 3}',16),(63,'正しい答えをドラッグ＆ドロップしてください。','drag_drop',2,'{\"pairs\": [{\"left\": \"電気がついている。家にいる＿＿＿。\", \"right\": \"はずだ\"}, {\"left\": \"空が暗い。雨が降る＿＿＿。\", \"right\": \"ようだ\"}]}',16),(64,'噂・伝聞を表す表現は？','multiple_choice',3,'{\"options\": [\"～ようだ\", \"～らしい\", \"～はずだ\", \"～に違いない\"], \"correct_option\": 1}',16),(65,'可能性をやわらかく言う表現は？','multiple_choice',4,'{\"options\": [\"～に違いない\", \"～かもしれない\", \"～はずだ\", \"～らしい\"], \"correct_option\": 1}',16),(66,'________ trời mưa, ________ chúng tôi vẫn đi học.\n(2 đáp án cách nhau bằng dấu - (Ví dụ: Tôi - bạn))','fill_in',1,'{\"accepted_answers\": [\"Mặc dù - nhưng\"]}',17),(67,'Câu nào là câu ghép chính – phụ?','multiple_choice',2,'{\"options\": [\"Tôi ăn cơm và xem TV.\", \"Trời mưa, đường trơn.\", \"Tôi ở nhà vì trời mưa.\", \"Anh đến, tôi đi.\"], \"correct_option\": 2}',17),(68,'Chọn đáp án chính xác khi điền vào.','drag_drop',3,'{\"pairs\": [{\"left\": \"______ bạn cố gắng, ______ sẽ thành công.\", \"right\": \"Nếu - thì\"}, {\"left\": \"______ tôi đã cố gắng, ______ tôi không thành công.\", \"right\": \"Mặc dù - nhưng\"}]}',17),(69,'“Không những… mà còn…” biểu thị quan hệ nào?','multiple_choice',4,'{\"options\": [\"Nguyên nhân – kết quả\", \"Nhượng bộ\", \"Tăng tiến\", \"Điều kiện\"], \"correct_option\": 2}',17),(70,'The term \"_________ learning\" refers to the process where machines learn from data and improve their performance over time.','fill_in',6,'{\"accepted_answers\": [\"Machine\", \"Machines\"]}',3),(71,'The term \"_________ learning\" refers to the process where machines learn from data and improve their performance over time.','fill_in',6,'{\"accepted_answers\": [\"Machine\", \"Machines\"]}',3),(72,'Match the word with its definition','drag_drop',5,'{\"pairs\": [{\"left\": \"Big data\", \"right\": \"Large sets of data that can be analyzed to reveal patterns and trends\"}, {\"left\": \"Blockchain\", \"right\": \"A decentralized digital ledger that records transactions across multiple computers\"}, {\"left\": \"Internet of Things (IoT)\", \"right\": \"A system where physical devices are connected to the internet and exchange data\"}]}',3);
/*!40000 ALTER TABLE `questions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quiz_attempts`
--

DROP TABLE IF EXISTS `quiz_attempts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quiz_attempts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `quiz_answers` json NOT NULL,
  `status` varchar(6) NOT NULL,
  `score` decimal(7,2) NOT NULL,
  `started_at` datetime(6) NOT NULL,
  `submitted_at` datetime(6) DEFAULT NULL,
  `attempt_no` int NOT NULL,
  `quiz_id` bigint NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `quiz_attempts_quiz_id_548b40bf_fk_quizzes_id` (`quiz_id`),
  KEY `quiz_attempts_user_id_a0a25a5f_fk_auth_user_id` (`user_id`),
  CONSTRAINT `quiz_attempts_quiz_id_548b40bf_fk_quizzes_id` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quiz_attempts`
--

LOCK TABLES `quiz_attempts` WRITE;
/*!40000 ALTER TABLE `quiz_attempts` DISABLE KEYS */;
INSERT INTO `quiz_attempts` VALUES (4,'[{\"answer\": \"B\", \"question_id\": 1}]','passed',9.09,'2025-11-30 15:12:45.448764','2025-11-30 15:12:45.448764',1,1,14),(5,'[{\"answer\": \"B\", \"question_id\": 1}, {\"answer\": \"C\", \"question_id\": 2}, {\"answer\": \"C\", \"question_id\": 3}, {\"answer\": \"A\", \"question_id\": 4}, {\"answer\": \"B\", \"question_id\": 5}, {\"answer\": \"B\", \"question_id\": 6}, {\"answer\": \"B\", \"question_id\": 7}, {\"answer\": \"C\", \"question_id\": 8}, {\"answer\": \"a\", \"question_id\": 9}, {\"answer\": \"aa\", \"question_id\": 10}, {\"answer\": {\"Ecosystem\": \"Năng lượng tái tạo\", \"Pollution\": \"Hệ sinh thái\", \"Renewable energy\": \"Ô nhiễm\"}, \"question_id\": 11}]','passed',72.73,'2025-11-30 15:20:10.829192','2025-11-30 15:20:10.829192',2,1,14),(6,'[{\"answer\": \"B\", \"question_id\": 1}, {\"answer\": \"C\", \"question_id\": 2}, {\"answer\": \"C\", \"question_id\": 3}, {\"answer\": \"A\", \"question_id\": 4}, {\"answer\": \"B\", \"question_id\": 5}, {\"answer\": \"B\", \"question_id\": 6}, {\"answer\": \"B\", \"question_id\": 7}, {\"answer\": \"C\", \"question_id\": 8}, {\"answer\": \"a\", \"question_id\": 9}, {\"answer\": \"hi\", \"question_id\": 10}, {\"answer\": {\"Ecosystem\": \"Hệ sinh thái\", \"Pollution\": \"Ô nhiễm\", \"Renewable energy\": \"Năng lượng tái tạo\"}, \"question_id\": 11}]','passed',81.82,'2025-11-30 16:06:07.511234','2025-11-30 16:06:07.501463',3,1,14),(7,'[{\"answer\": \"B\", \"question_id\": 1}, {\"answer\": \"C\", \"question_id\": 2}, {\"answer\": \"C\", \"question_id\": 3}, {\"answer\": \"A\", \"question_id\": 4}, {\"answer\": \"B\", \"question_id\": 5}, {\"answer\": \"B\", \"question_id\": 6}, {\"answer\": \"B\", \"question_id\": 7}, {\"answer\": \"C\", \"question_id\": 8}, {\"answer\": \"a\", \"question_id\": 9}, {\"answer\": \"hi\", \"question_id\": 10}, {\"answer\": {\"Ecosystem\": \"Hệ sinh thái\", \"Pollution\": \"Ô nhiễm\", \"Renewable energy\": \"Năng lượng tái tạo\"}, \"question_id\": 11}]','passed',81.82,'2025-11-30 16:43:31.525260','2025-11-30 16:43:31.524231',4,1,14),(8,'[]','failed',0.00,'2025-12-04 16:39:41.689995','2025-12-04 16:39:41.684285',5,1,14),(9,'[{\"answer\": \"A\", \"question_id\": 1}, {\"answer\": \"C\", \"question_id\": 2}, {\"answer\": \"C\", \"question_id\": 3}]','failed',18.18,'2025-12-04 16:40:08.279038','2025-12-04 16:40:08.279038',6,1,14),(10,'[{\"answer\": \"B\", \"question_id\": 1}]','failed',9.09,'2025-12-04 17:00:25.651092','2025-12-04 17:00:25.650460',7,1,14),(11,'[{\"answer\": \"B\", \"question_id\": 1}, {\"answer\": \"C\", \"question_id\": 2}, {\"answer\": \"C\", \"question_id\": 3}, {\"answer\": \"A\", \"question_id\": 4}, {\"answer\": \"B\", \"question_id\": 5}, {\"answer\": \"B\", \"question_id\": 6}, {\"answer\": \"B\", \"question_id\": 7}, {\"answer\": \"C\", \"question_id\": 8}, {\"answer\": {\"Ecosystem\": \"Hệ sinh thái\", \"Pollution\": \"Ô nhiễm\", \"Renewable energy\": \"Năng lượng tái tạo\"}, \"question_id\": 11}]','passed',81.82,'2025-12-04 17:01:31.543406','2025-12-04 17:01:31.543406',8,1,14),(12,'[]','failed',0.00,'2025-12-04 17:05:55.414432','2025-12-04 17:05:55.414432',9,1,14),(13,'[]','failed',0.00,'2025-12-04 17:17:25.997774','2025-12-04 17:17:25.997774',10,1,14),(14,'[{\"answer\": \"B\", \"question_id\": 1}, {\"answer\": \"C\", \"question_id\": 2}, {\"answer\": \"C\", \"question_id\": 3}, {\"answer\": \"A\", \"question_id\": 4}, {\"answer\": \"B\", \"question_id\": 5}, {\"answer\": \"B\", \"question_id\": 6}, {\"answer\": \"D\", \"question_id\": 7}, {\"answer\": \"D\", \"question_id\": 8}, {\"answer\": \"hi\", \"question_id\": 9}, {\"answer\": \"hưng bi top\", \"question_id\": 10}, {\"answer\": {\"Ecosystem\": \"Năng lượng tái tạo\", \"Pollution\": \"Ô nhiễm\", \"Renewable energy\": \"Hệ sinh thái\"}, \"question_id\": 11}]','failed',54.55,'2025-12-16 18:07:12.333815','2025-12-16 18:07:12.326772',1,1,12),(15,'[{\"answer\": {\"Ecosystem\": \"Ô nhiễm\", \"Pollution\": \"Năng lượng tái tạo\", \"Renewable energy\": \"Hệ sinh thái\"}, \"question_id\": 11}, {\"answer\": \"B\", \"question_id\": 6}, {\"answer\": \"D\", \"question_id\": 8}]','failed',9.09,'2025-12-17 08:24:18.022599','2025-12-17 08:24:18.022599',1,1,8),(16,'[{\"answer\": \"B\", \"question_id\": 1}, {\"answer\": \"C\", \"question_id\": 2}, {\"answer\": \"C\", \"question_id\": 3}, {\"answer\": \"A\", \"question_id\": 4}, {\"answer\": \"B\", \"question_id\": 5}, {\"answer\": \"B\", \"question_id\": 6}, {\"answer\": \"B\", \"question_id\": 7}, {\"answer\": \"C\", \"question_id\": 8}, {\"answer\": \"ecosystem\", \"question_id\": 9}, {\"answer\": \"renewable\", \"question_id\": 10}, {\"answer\": {\"Ecosystem\": \"Hệ sinh thái\", \"Pollution\": \"Ô nhiễm\", \"Renewable energy\": \"Năng lượng tái tạo\"}, \"question_id\": 11}]','passed',81.82,'2025-12-17 08:26:49.662695','2025-12-17 08:26:49.662695',2,1,8),(17,'[{\"answer\": \"B\", \"question_id\": 1}, {\"answer\": \"D\", \"question_id\": 2}, {\"answer\": \"C\", \"question_id\": 3}, {\"answer\": \"D\", \"question_id\": 4}, {\"answer\": \"B\", \"question_id\": 5}, {\"answer\": \"B\", \"question_id\": 6}, {\"answer\": \"B\", \"question_id\": 7}, {\"answer\": \"C\", \"question_id\": 8}, {\"answer\": \"ecosystem\", \"question_id\": 9}, {\"answer\": \"renewable energy\", \"question_id\": 10}, {\"answer\": {\"Ecosystem\": \"Hệ sinh thái\", \"Pollution\": \"Năng lượng tái tạo\", \"Renewable energy\": \"Ô nhiễm\"}, \"question_id\": 11}]','failed',63.64,'2025-12-17 08:36:50.187973','2025-12-17 08:36:50.187973',3,1,8),(18,'[{\"answer\": \"B\", \"question_id\": 1}, {\"answer\": \"C\", \"question_id\": 2}, {\"answer\": \"C\", \"question_id\": 3}, {\"answer\": \"A\", \"question_id\": 4}, {\"answer\": \"B\", \"question_id\": 5}, {\"answer\": \"B\", \"question_id\": 6}, {\"answer\": \"B\", \"question_id\": 7}, {\"answer\": \"C\", \"question_id\": 8}, {\"answer\": \"ecosystem balance\", \"question_id\": 9}, {\"answer\": \"renewable energy\", \"question_id\": 10}, {\"answer\": {\"Ecosystem\": \"Hệ sinh thái\", \"Pollution\": \"Ô nhiễm\", \"Renewable energy\": \"Năng lượng tái tạo\"}, \"question_id\": 11}]','passed',100.00,'2025-12-17 08:42:33.084935','2025-12-17 08:42:33.084935',4,1,8),(19,'[{\"answer\": \"D\", \"question_id\": 12}, {\"answer\": \"hehe\", \"question_id\": 13}, {\"answer\": {\"Deadline\": \"Hạn chót\", \"Colleague\": \"Phòng ban\", \"Department\": \"Đồng nghiệp\"}, \"question_id\": 14}]','failed',0.00,'2025-12-17 20:15:27.504431','2025-12-17 20:15:27.503931',1,2,12),(20,'[{\"answer\": \"B\", \"question_id\": 1}, {\"answer\": \"C\", \"question_id\": 2}, {\"answer\": \"C\", \"question_id\": 3}, {\"answer\": \"A\", \"question_id\": 4}, {\"answer\": \"B\", \"question_id\": 5}, {\"answer\": \"B\", \"question_id\": 6}, {\"answer\": \"B\", \"question_id\": 7}, {\"answer\": \"B\", \"question_id\": 8}, {\"answer\": \"ecosystem balance\", \"question_id\": 9}, {\"answer\": \"renewable\", \"question_id\": 10}, {\"answer\": {\"Ecosystem\": \"Năng lượng tái tạo\", \"Pollution\": \"Ô nhiễm\", \"Renewable energy\": \"Hệ sinh thái\"}, \"question_id\": 11}]','failed',72.73,'2025-12-18 14:57:59.407880','2025-12-18 14:57:59.407880',5,1,8),(21,'[{\"answer\": \"B\", \"question_id\": 1}, {\"answer\": \"C\", \"question_id\": 2}, {\"answer\": \"C\", \"question_id\": 3}, {\"answer\": \"A\", \"question_id\": 4}, {\"answer\": \"B\", \"question_id\": 5}, {\"answer\": \"B\", \"question_id\": 6}, {\"answer\": \"B\", \"question_id\": 7}, {\"answer\": \"C\", \"question_id\": 8}, {\"answer\": \"ecosystem balance\", \"question_id\": 9}, {\"answer\": \"renewable\", \"question_id\": 10}, {\"answer\": {\"Ecosystem\": \"Hệ sinh thái\", \"Pollution\": \"Ô nhiễm\", \"Renewable energy\": \"Năng lượng tái tạo\"}, \"question_id\": 11}]','passed',90.91,'2025-12-18 14:58:54.865777','2025-12-18 14:58:54.865777',6,1,8),(22,'[{\"answer\": \"A\", \"question_id\": 12}, {\"answer\": \"kjjnjsz\", \"question_id\": 13}, {\"answer\": {\"Deadline\": \"Hạn chót\", \"Colleague\": \"Đồng nghiệp\", \"Department\": \"Phòng ban\"}, \"question_id\": 14}]','failed',66.67,'2025-12-22 12:01:32.132088','2025-12-22 12:01:32.131416',2,2,12),(23,'[{\"answer\": \"A\", \"question_id\": 12}, {\"answer\": \"đồng nghiệp\", \"question_id\": 13}, {\"answer\": {\"Deadline\": \"Hạn chót\", \"Colleague\": \"Đồng nghiệp\", \"Department\": \"Phòng ban\"}, \"question_id\": 14}, {\"answer\": \"A\", \"question_id\": 16}]','passed',100.00,'2025-12-22 12:09:44.591522','2025-12-22 12:09:44.590573',3,2,12),(24,'[{\"answer\": \"ecosystem balance\", \"question_id\": 9}]','failed',50.00,'2025-12-22 13:12:16.887128','2025-12-22 13:12:16.884347',2,1,12),(25,'[{\"answer\": \"B\", \"question_id\": 17}, {\"answer\": {\"Automation\": \"The use of technology to replace or support humans in their work.\", \"Digital Transformation\": \"The process of applying digital technology to all areas of an organization.\", \"Artificial Intelligence\": \"A technology that enables machines to simulate human intelligence.\"}, \"question_id\": 18}]','passed',100.00,'2025-12-22 16:06:16.279589','2025-12-22 16:06:16.277575',1,4,8),(26,'[{\"answer\": \"B\", \"question_id\": 17}, {\"answer\": {\"Automation\": \"The use of technology to replace or support humans in their work.\", \"Digital Transformation\": \"The process of applying digital technology to all areas of an organization.\", \"Artificial Intelligence\": \"A technology that enables machines to simulate human intelligence.\"}, \"question_id\": 18}]','passed',100.00,'2025-12-22 16:24:24.424937','2025-12-22 16:24:24.424937',1,4,14),(27,'[{\"answer\": \"B\", \"question_id\": 17}, {\"answer\": {\"Automation\": \"The process of applying digital technology to all areas of an organization.\", \"Digital Transformation\": \"The use of technology to replace or support humans in their work.\", \"Artificial Intelligence\": \"A technology that enables machines to simulate human intelligence.\"}, \"question_id\": 18}]','failed',50.00,'2025-12-22 16:25:43.342940','2025-12-22 16:25:43.342940',2,4,14),(28,'[{\"answer\": \"B\", \"question_id\": 17}, {\"answer\": {\"Automation\": \"The use of technology to replace or support humans in their work.\", \"Digital Transformation\": \"The process of applying digital technology to all areas of an organization.\", \"Artificial Intelligence\": \"A technology that enables machines to simulate human intelligence.\"}, \"question_id\": 18}]','passed',100.00,'2025-12-22 16:26:17.573026','2025-12-22 16:26:17.573026',3,4,14),(29,'[{\"answer\": \"A\", \"question_id\": 19}]','passed',100.00,'2025-12-22 16:35:51.727007','2025-12-22 16:35:51.726517',1,3,8),(30,'[{\"answer\": \"A\", \"question_id\": 19}]','passed',100.00,'2025-12-22 16:36:59.990256','2025-12-22 16:36:59.989816',2,3,8),(34,'[{\"answer\": \"B\", \"question_id\": 17}, {\"answer\": {\"Automation\": \"The use of technology to replace or support humans in their work.\", \"Digital Transformation\": \"The process of applying digital technology to all areas of an organization.\", \"Artificial Intelligence\": \"A technology that enables machines to simulate human intelligence.\"}, \"question_id\": 18}]','passed',100.00,'2025-12-23 10:04:10.294856','2025-12-23 10:04:10.293858',2,4,8),(35,'[{\"answer\": \"A\", \"question_id\": 23}, {\"answer\": \"C\", \"question_id\": 24}, {\"answer\": \"ために\", \"question_id\": 25}, {\"answer\": \"ほど\", \"question_id\": 26}, {\"answer\": \"B\", \"question_id\": 27}]','failed',60.00,'2025-12-23 15:33:13.418715','2025-12-23 15:33:13.417486',1,8,16),(36,'[{\"answer\": \"ecosystem balance\", \"question_id\": 9}, {\"answer\": \"renewable energy\", \"question_id\": 10}]','passed',100.00,'2025-12-23 17:28:00.946478','2025-12-23 17:28:00.943335',7,1,8),(37,'[{\"answer\": \"C\", \"question_id\": 23}, {\"answer\": \"C\", \"question_id\": 24}, {\"answer\": \"ために\", \"question_id\": 25}, {\"answer\": \"ほど\", \"question_id\": 26}, {\"answer\": \"D\", \"question_id\": 27}]','failed',60.00,'2025-12-23 17:52:57.517953','2025-12-23 17:52:57.516568',1,8,12),(38,'[{\"answer\": \"B\", \"question_id\": 23}, {\"answer\": \"C\", \"question_id\": 24}, {\"answer\": \"ために\", \"question_id\": 25}, {\"answer\": \"ほど\", \"question_id\": 26}, {\"answer\": \"D\", \"question_id\": 27}]','passed',100.00,'2025-12-23 17:54:58.912825','2025-12-23 17:54:58.912318',2,8,12),(39,'[{\"answer\": \"B\", \"question_id\": 28}, {\"answer\": \"block\", \"question_id\": 29}, {\"answer\": \"D\", \"question_id\": 30}, {\"answer\": {\"Bug\": \"Lỗi\", \"Loop\": \"Vòng lặp\", \"Algorithm\": \"Thuật toán\"}, \"question_id\": 31}]','passed',75.00,'2025-12-24 04:19:50.800989','2025-12-24 04:19:50.800989',1,9,14),(40,'[{\"answer\": \"B\", \"question_id\": 23}, {\"answer\": \"C\", \"question_id\": 24}, {\"answer\": \"ために\", \"question_id\": 25}, {\"answer\": \"ほど\", \"question_id\": 26}, {\"answer\": \"D\", \"question_id\": 27}]','passed',100.00,'2025-12-24 07:30:47.238292','2025-12-24 07:30:47.238292',1,8,8),(41,'[{\"answer\": \"D\", \"question_id\": 23}]','failed',0.00,'2025-12-26 06:33:48.007827','2025-12-26 06:33:48.007166',3,8,12),(42,'[{\"answer\": \"B\", \"question_id\": 23}, {\"answer\": \"A\", \"question_id\": 24}, {\"answer\": \"ために\", \"question_id\": 25}, {\"answer\": \"ほど\", \"question_id\": 26}]','failed',60.00,'2025-12-28 15:28:52.995197','2025-12-28 15:28:52.994196',2,8,8),(43,'[{\"answer\": \"B\", \"question_id\": 28}, {\"answer\": \"variable\", \"question_id\": 29}, {\"answer\": \"D\", \"question_id\": 30}, {\"answer\": {\"Bug\": \"Lỗi\", \"Loop\": \"Vòng lặp\", \"Algorithm\": \"Thuật toán\"}, \"question_id\": 31}]','passed',100.00,'2025-12-31 06:40:04.253476','2025-12-31 06:40:04.252779',1,9,19),(44,'[{\"answer\": \"D\", \"question_id\": 32}, {\"answer\": \"B\", \"question_id\": 33}, {\"answer\": \"API\", \"question_id\": 34}, {\"answer\": \"C\", \"question_id\": 35}, {\"answer\": {\"API\": \"A set of rules and endpoints that allows different software systems to communicate with each other.\", \"Backend\": \"The server-side of an application that handles business logic, authentication, and data processing.\", \"Database\": \"A structured system used to store, manage, and retrieve data efficiently.\", \"Frontend\": \"The part of a web application that users interact with directly, such as buttons, forms, and user interfaces.\", \"HTTP Request\": \"A message sent from a client to a server to request data or perform an action, usually using methods like GET or POST.\"}, \"question_id\": 36}]','passed',80.00,'2025-12-31 06:43:32.413090','2025-12-31 06:43:32.412513',1,10,19),(45,'[{\"answer\": \"A\", \"question_id\": 23}, {\"answer\": \"C\", \"question_id\": 24}, {\"answer\": \"hgghghg\", \"question_id\": 25}, {\"answer\": \"fhfhfgh\", \"question_id\": 26}, {\"answer\": \"D\", \"question_id\": 27}]','failed',40.00,'2026-01-05 07:57:46.053975','2026-01-05 07:57:46.053147',1,8,21);
/*!40000 ALTER TABLE `quiz_attempts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quizzes`
--

DROP TABLE IF EXISTS `quizzes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quizzes` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `time_limit` int DEFAULT NULL,
  `passed_score` int NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `lesson_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `quizzes_lesson__03d932_idx` (`lesson_id`),
  CONSTRAINT `quizzes_lesson_id_fece432b_fk_lessons_id` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quizzes`
--

LOCK TABLES `quizzes` WRITE;
/*!40000 ALTER TABLE `quizzes` DISABLE KEYS */;
INSERT INTO `quizzes` VALUES (1,1200,80,'2025-11-30 08:00:26.000000',6),(2,NULL,70,'2025-12-17 18:13:52.088841',1),(3,NULL,100,'2025-12-19 05:59:57.456726',7),(4,600,100,'2025-12-22 15:53:34.087362',14),(8,900,70,'2025-12-23 15:19:28.158551',15),(9,900,30,'2025-12-23 16:54:45.427522',16),(10,NULL,30,'2025-12-23 17:03:35.904541',17),(11,NULL,30,'2025-12-23 17:10:56.330281',18),(12,NULL,30,'2025-12-23 17:14:56.704926',19),(13,300,20,'2025-12-23 17:20:29.878546',20),(14,900,40,'2025-12-23 17:24:26.955012',13),(15,600,20,'2025-12-23 17:27:55.709869',21),(16,900,20,'2025-12-23 17:31:34.830042',22),(17,600,20,'2025-12-23 17:36:02.454338',23);
/*!40000 ALTER TABLE `quizzes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_courses`
--

DROP TABLE IF EXISTS `user_courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_courses` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `status` varchar(10) NOT NULL,
  `progress_percent` decimal(5,2) DEFAULT NULL,
  `requested_at` datetime(6) NOT NULL,
  `approved_at` datetime(6) DEFAULT NULL,
  `rating` double DEFAULT NULL,
  `comment` longtext,
  `reason` longtext,
  `course_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `completion_xp_awarded` tinyint(1) NOT NULL,
  `reviewed_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_courses_user_id_course_id_104ab824_uniq` (`user_id`,`course_id`),
  KEY `user_course_user_id_67e6bf_idx` (`user_id`),
  KEY `user_courses_course_id_b56d3497_fk_courses_id` (`course_id`),
  CONSTRAINT `user_courses_course_id_b56d3497_fk_courses_id` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`),
  CONSTRAINT `user_courses_user_id_031237d1_fk_users_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=84 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_courses`
--

LOCK TABLES `user_courses` WRITE;
/*!40000 ALTER TABLE `user_courses` DISABLE KEYS */;
INSERT INTO `user_courses` VALUES (1,'approved',0.00,'2025-11-16 13:49:31.000000','2025-11-16 13:49:31.000000',NULL,NULL,NULL,2,1,0,NULL),(2,'completed',100.00,'2025-11-16 13:49:31.000000','2025-11-16 13:49:31.000000',4.5,'Khóa học rất hữu ích, nội dung rõ ràng.',NULL,5,1,0,NULL),(3,'pending',NULL,'2025-11-16 13:49:31.000000',NULL,NULL,NULL,NULL,3,1,0,NULL),(4,'approved',10.50,'2025-11-16 13:49:31.000000','2025-11-16 13:49:31.000000',NULL,'Mới bắt đầu học được 2 bài.',NULL,7,1,0,NULL),(5,'rejected',NULL,'2025-11-16 13:49:31.000000',NULL,NULL,NULL,'Khóa học không phù hợp với trình độ hiện tại.',9,1,0,NULL),(6,'pending',NULL,'2025-11-16 13:49:31.000000',NULL,NULL,NULL,NULL,1,1,0,NULL),(7,'completed',100.00,'2025-11-16 13:49:31.000000','2025-11-16 13:49:31.000000',5,'Bài học thú vị và dễ hiểu.',NULL,8,1,0,NULL),(8,'approved',55.00,'2025-11-16 13:49:31.000000','2025-11-16 13:49:31.000000',NULL,'Đang trong quá trình hoàn thành.',NULL,14,1,0,NULL),(9,'rejected',NULL,'2025-11-16 13:49:31.000000',NULL,NULL,NULL,'Thông tin đăng ký không hợp lệ.',11,1,0,NULL),(10,'completed',100.00,'2025-11-16 13:49:31.000000','2025-11-16 13:49:31.000000',4,'Khóa học tốt, luyện thi hiệu quả.',NULL,4,1,0,NULL),(11,'pending',NULL,'2025-11-17 04:46:36.899766',NULL,NULL,'',NULL,20,8,0,NULL),(12,'pending',NULL,'2025-11-17 12:02:14.142149',NULL,NULL,'',NULL,1,8,0,NULL),(13,'pending',NULL,'2025-11-17 12:00:22.078254',NULL,NULL,NULL,NULL,2,8,0,NULL),(14,'approved',0.00,'2025-11-17 12:01:09.224116',NULL,NULL,'','',3,8,0,NULL),(15,'pending',NULL,'2025-11-17 12:16:08.003016',NULL,NULL,NULL,NULL,4,8,0,NULL),(16,'pending',NULL,'2025-11-17 13:26:47.330105',NULL,NULL,NULL,NULL,1,11,0,NULL),(17,'approved',NULL,'2025-11-17 14:17:02.870102',NULL,NULL,'','',1,4,0,NULL),(18,'approved',0.00,'2025-11-23 11:15:53.349650',NULL,NULL,'','',1,12,0,NULL),(19,'completed',100.00,'2025-11-23 17:41:06.469871',NULL,5,'Quá hay','',5,8,1,'2025-12-24 07:31:43.359753'),(20,'approved',20.00,'2025-11-23 17:58:55.866541',NULL,NULL,'','',9,12,0,NULL),(21,'approved',0.00,'2025-11-23 18:14:51.911152',NULL,NULL,'','',9,8,0,NULL),(22,'pending',NULL,'2025-11-24 16:18:38.175085',NULL,NULL,NULL,NULL,6,8,0,NULL),(23,'pending',NULL,'2025-11-24 16:18:52.987407',NULL,NULL,NULL,NULL,19,8,0,NULL),(24,'pending',NULL,'2025-11-26 09:11:45.948490',NULL,NULL,NULL,NULL,15,8,0,NULL),(25,'rejected',NULL,'2025-11-26 09:50:55.422272',NULL,NULL,NULL,'Ber',7,8,0,NULL),(26,'approved',NULL,'2025-11-26 09:53:51.342063','2025-12-19 00:30:06.782313',NULL,NULL,NULL,8,8,0,NULL),(27,'rejected',NULL,'2025-11-26 15:09:42.924079',NULL,NULL,NULL,'ghét nên từ chối ',17,8,0,NULL),(28,'approved',33.33,'2025-11-30 07:21:24.433739',NULL,NULL,'','',21,14,0,NULL),(29,'approved',NULL,'2025-11-30 16:45:32.466203','2025-12-18 02:52:04.556418',NULL,NULL,NULL,3,14,0,NULL),(30,'approved',NULL,'2025-12-04 16:39:17.112113','2025-12-18 02:47:24.654576',NULL,NULL,NULL,2,14,0,NULL),(31,'approved',0.00,'2025-12-10 09:10:05.177218',NULL,NULL,'','',1,9,0,NULL),(32,'approved',0.00,'2025-12-11 15:20:19.773433',NULL,NULL,'','',16,12,0,NULL),(33,'approved',100.00,'2025-12-16 09:23:53.170455',NULL,3,'Cung binh thuong','',5,12,0,NULL),(34,'approved',0.00,'2025-12-16 17:22:28.767201',NULL,NULL,'','',2,12,0,NULL),(35,'approved',NULL,'2025-12-16 17:22:34.759965',NULL,NULL,'','',3,12,0,NULL),(36,'approved',NULL,'2025-12-16 17:22:39.558815',NULL,NULL,'','',4,12,0,NULL),(37,'approved',0.00,'2025-12-16 17:22:43.938227',NULL,NULL,'','',6,12,0,NULL),(38,'approved',0.00,'2025-12-16 18:05:37.602053',NULL,NULL,'','',21,12,0,NULL),(39,'completed',100.00,'2025-12-17 06:39:37.651877',NULL,5,'Khóa học quá tuyệt vời, rất xứng đáng 5 sao!','',21,8,1,NULL),(40,'approved',0.00,'2025-12-19 05:24:08.313719','2025-12-19 05:50:49.463693',NULL,NULL,NULL,2,9,0,NULL),(41,'approved',NULL,'2025-12-19 05:24:59.362076','2025-12-19 05:52:56.306161',NULL,NULL,NULL,3,9,0,NULL),(42,'approved',NULL,'2025-12-19 07:13:21.026813','2025-12-19 07:34:13.394233',NULL,NULL,NULL,4,9,0,NULL),(43,'approved',NULL,'2025-12-19 05:53:16.826554','2025-12-19 06:50:29.924377',NULL,NULL,NULL,5,9,0,NULL),(44,'approved',0.00,'2025-12-19 05:29:48.913892','2025-12-19 05:46:41.965123',NULL,NULL,NULL,6,9,0,NULL),(45,'approved',NULL,'2025-12-19 05:54:05.854147','2025-12-19 06:31:32.441242',NULL,NULL,NULL,12,9,0,NULL),(46,'approved',NULL,'2025-12-19 06:32:07.458928','2025-12-19 06:43:07.570913',NULL,NULL,NULL,11,9,0,NULL),(47,'approved',NULL,'2025-12-19 06:35:21.433019','2025-12-19 06:36:45.237877',NULL,NULL,NULL,16,9,0,NULL),(48,'rejected',NULL,'2025-12-19 06:51:07.976309',NULL,NULL,NULL,'',17,9,0,NULL),(49,'rejected',NULL,'2025-12-19 06:56:39.221865',NULL,NULL,NULL,'',13,9,0,NULL),(50,'rejected',NULL,'2025-12-19 06:58:31.092181',NULL,NULL,NULL,'k',18,9,0,NULL),(51,'rejected',NULL,'2025-12-19 07:10:50.679271',NULL,NULL,NULL,'Khoong',21,9,0,NULL),(52,'approved',NULL,'2025-12-19 07:13:29.592912','2025-12-19 07:28:13.101734',NULL,NULL,NULL,20,9,0,NULL),(53,'rejected',NULL,'2025-12-19 07:28:05.568573',NULL,NULL,NULL,'khong',9,9,0,NULL),(54,'rejected',NULL,'2025-12-19 07:34:41.923274',NULL,NULL,NULL,'Khong',10,9,0,NULL),(55,'approved',0.00,'2025-12-23 16:11:44.205989','2025-12-23 16:11:59.584308',NULL,NULL,NULL,1,16,0,NULL),(56,'approved',NULL,'2025-12-21 16:08:53.686242','2025-12-23 15:34:12.509765',NULL,NULL,NULL,2,16,0,NULL),(57,'rejected',NULL,'2025-12-31 04:40:55.462889',NULL,NULL,NULL,'Bạn chưa đủ sức học cái này nha',3,16,0,NULL),(58,'rejected',NULL,'2025-12-21 16:53:51.071702',NULL,NULL,NULL,'Khong cho',4,16,0,NULL),(59,'approved',0.00,'2025-12-21 16:37:01.607105','2025-12-21 16:38:22.018297',NULL,NULL,NULL,5,16,0,NULL),(60,'rejected',NULL,'2025-12-21 16:22:24.485872',NULL,NULL,NULL,'Khong',6,16,0,NULL),(61,'approved',NULL,'2025-12-22 12:17:00.657159','2025-12-23 15:04:34.178935',NULL,NULL,NULL,21,16,0,NULL),(62,'approved',NULL,'2025-12-23 17:50:52.377004','2025-12-23 17:51:28.065317',NULL,NULL,NULL,13,12,0,NULL),(63,'approved',NULL,'2025-12-23 17:51:03.105153','2025-12-23 17:51:24.945075',NULL,NULL,NULL,37,12,0,NULL),(64,'approved',NULL,'2025-12-23 18:16:55.607780','2025-12-24 07:04:48.543763',NULL,NULL,NULL,5,18,0,NULL),(65,'approved',0.00,'2025-12-23 18:14:10.004745','2025-12-23 18:16:22.690361',NULL,NULL,NULL,1,18,0,NULL),(66,'approved',NULL,'2025-12-23 18:21:39.895337','2025-12-23 18:29:04.519282',NULL,NULL,NULL,2,18,0,NULL),(67,'approved',0.00,'2025-12-23 18:29:12.788033','2025-12-23 18:32:20.466231',NULL,NULL,NULL,3,18,0,NULL),(68,'approved',NULL,'2025-12-23 18:32:40.079347','2025-12-24 07:02:01.893486',NULL,NULL,NULL,4,18,0,NULL),(69,'rejected',NULL,'2025-12-23 18:33:19.036364',NULL,NULL,NULL,'k',6,18,0,NULL),(70,'rejected',NULL,'2025-12-23 18:41:21.512732',NULL,NULL,NULL,'khong cho',7,18,0,NULL),(71,'approved',0.00,'2025-12-23 18:43:42.923532','2025-12-23 18:44:19.903565',NULL,NULL,NULL,8,18,0,NULL),(72,'rejected',NULL,'2025-12-24 03:11:26.131478',NULL,NULL,NULL,'người Việt học tiếng Việt chi nữa',11,8,0,NULL),(73,'approved',16.67,'2025-12-24 04:13:22.308241','2025-12-24 04:14:05.676951',NULL,NULL,NULL,37,14,0,NULL),(74,'approved',NULL,'2025-12-24 07:05:07.327733','2025-12-25 16:32:14.840544',NULL,NULL,NULL,9,18,0,NULL),(75,'approved',NULL,'2025-12-25 10:26:33.709168','2025-12-25 15:48:29.227964',NULL,NULL,NULL,37,8,0,NULL),(76,'pending',NULL,'2025-12-26 06:21:42.921435',NULL,NULL,NULL,NULL,7,12,0,NULL),(77,'approved',0.00,'2025-12-31 05:59:14.021769','2025-12-31 06:01:56.183105',NULL,NULL,NULL,21,19,0,NULL),(78,'approved',NULL,'2025-12-31 06:01:22.098051','2025-12-31 06:01:51.970694',NULL,NULL,NULL,20,19,0,NULL),(79,'approved',33.33,'2025-12-31 06:37:13.698347','2025-12-31 06:37:47.584060',NULL,NULL,NULL,37,19,0,NULL),(80,'pending',NULL,'2026-01-01 19:25:55.718642',NULL,NULL,NULL,NULL,1,20,0,NULL),(81,'pending',NULL,'2026-01-05 07:50:51.059737',NULL,NULL,NULL,NULL,6,21,0,NULL),(82,'pending',NULL,'2026-01-05 07:53:57.615356',NULL,NULL,NULL,NULL,1,21,0,NULL),(83,'approved',0.00,'2026-01-05 07:54:34.285290','2026-01-05 07:55:16.138469',NULL,NULL,NULL,5,21,0,NULL);
/*!40000 ALTER TABLE `user_courses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_flashcards`
--

DROP TABLE IF EXISTS `user_flashcards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_flashcards` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `last_reviewed_at` datetime(6) DEFAULT NULL,
  `level` smallint unsigned NOT NULL,
  `next_review_date` date DEFAULT NULL,
  `flashcard_id` bigint NOT NULL,
  `user_id` int NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `times_reviewed` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_flashcards_user_id_flashcard_id_2a48fbd1_uniq` (`user_id`,`flashcard_id`),
  KEY `user_flashcards_flashcard_id_c6305558_fk_flashcards_id` (`flashcard_id`),
  KEY `user_flashc_user_id_c5e478_idx` (`user_id`,`next_review_date`),
  CONSTRAINT `user_flashcards_flashcard_id_c6305558_fk_flashcards_id` FOREIGN KEY (`flashcard_id`) REFERENCES `flashcards` (`id`),
  CONSTRAINT `user_flashcards_chk_1` CHECK ((`times_reviewed` >= 0)),
  CONSTRAINT `user_flashcards_level_ef5f38f0_check` CHECK ((`level` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=72 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_flashcards`
--

LOCK TABLES `user_flashcards` WRITE;
/*!40000 ALTER TABLE `user_flashcards` DISABLE KEYS */;
INSERT INTO `user_flashcards` VALUES (1,'2025-12-11 15:38:32.441584',2,'2025-12-14',10,12,'2025-12-15 05:54:41.480751',0),(2,'2025-12-11 15:35:51.896750',2,'2025-12-14',9,12,'2025-12-15 05:54:41.480751',0),(3,'2025-12-11 15:38:37.785673',2,'2025-12-14',8,12,'2025-12-15 05:54:41.480751',0),(4,'2025-12-11 15:40:22.592186',2,'2025-12-14',11,12,'2025-12-15 05:54:41.480751',0),(5,'2025-12-15 05:55:39.903941',0,'2025-12-15',1,12,'2025-12-15 05:55:40.093011',1),(6,'2025-12-15 05:55:40.403567',1,'2025-12-16',3,12,'2025-12-15 05:55:40.590622',1),(7,'2025-12-15 05:55:40.900634',1,'2025-12-16',4,12,'2025-12-15 05:55:41.090167',1),(8,'2025-12-15 05:55:41.398577',1,'2025-12-16',5,12,'2025-12-15 05:55:41.581829',1),(9,'2025-12-15 05:55:41.890232',1,'2025-12-16',6,12,'2025-12-15 05:55:42.074565',1),(10,'2025-12-15 05:55:42.382682',1,'2025-12-16',7,12,'2025-12-15 05:55:42.570462',1),(11,'2025-12-15 05:55:50.884093',1,'2025-12-16',2,12,'2025-12-15 05:55:51.065376',1),(12,'2025-12-15 08:49:13.822037',1,'2025-12-16',21,12,'2025-12-15 08:49:13.539897',1),(13,'2025-12-15 08:49:14.163897',1,'2025-12-16',23,12,'2025-12-15 08:49:14.337479',1),(14,'2025-12-15 08:49:15.072983',1,'2025-12-16',24,12,'2025-12-15 08:49:14.785975',1),(15,'2025-12-15 08:49:15.414437',1,'2025-12-16',25,12,'2025-12-15 08:49:15.670133',1),(16,'2025-12-15 08:49:15.972494',1,'2025-12-16',27,12,'2025-12-15 08:49:16.144264',1),(17,'2025-12-15 08:49:16.454836',1,'2025-12-16',28,12,'2025-12-15 08:49:16.642037',1),(18,'2025-12-15 08:49:16.981459',1,'2025-12-16',29,12,'2025-12-15 08:49:17.171324',1),(19,'2025-12-15 08:49:17.545427',1,'2025-12-16',30,12,'2025-12-15 08:49:17.763016',1),(20,'2025-12-15 08:49:31.880687',0,'2025-12-15',26,12,'2025-12-15 08:49:32.053821',1),(21,'2025-12-15 08:50:26.978165',1,'2025-12-16',22,12,'2025-12-15 08:50:27.227393',1),(22,'2026-01-05 16:33:57.814987',3,'2026-01-12',31,8,'2025-12-22 16:05:31.688629',3),(23,'2026-01-05 16:33:57.931720',3,'2026-01-12',32,8,'2025-12-22 16:05:32.137880',3),(24,'2026-01-05 16:33:57.698500',2,'2026-01-08',33,8,'2025-12-22 16:05:32.612602',3),(25,'2026-01-05 16:33:58.055917',3,'2026-01-12',34,8,'2025-12-22 16:05:33.058713',3),(26,'2026-01-05 16:33:58.175816',3,'2026-01-12',35,8,'2025-12-22 16:05:33.502715',3),(27,'2025-12-22 16:24:04.698098',1,'2025-12-23',31,14,'2025-12-22 16:24:04.863227',1),(28,'2025-12-22 16:24:05.133084',1,'2025-12-23',32,14,'2025-12-22 16:24:05.303076',1),(29,'2025-12-22 16:24:05.583050',1,'2025-12-23',33,14,'2025-12-22 16:24:05.755942',1),(30,'2025-12-22 16:24:06.035109',1,'2025-12-23',34,14,'2025-12-22 16:24:06.195294',1),(31,'2025-12-22 16:24:06.475676',1,'2025-12-23',35,14,'2025-12-22 16:24:06.642936',1),(32,'2025-12-23 15:32:27.357654',0,'2025-12-23',36,16,'2025-12-23 15:32:12.155905',1),(33,'2025-12-23 15:32:12.394977',1,'2025-12-24',37,16,'2025-12-23 15:32:12.534218',1),(34,'2025-12-23 15:32:27.694427',0,'2025-12-23',38,16,'2025-12-23 15:32:12.920610',1),(35,'2025-12-23 15:32:13.156324',1,'2025-12-24',39,16,'2025-12-23 15:32:13.301283',1),(36,'2025-12-23 15:32:28.029023',0,'2025-12-23',40,16,'2025-12-23 15:32:13.675472',1),(37,'2025-12-23 15:32:13.914627',1,'2025-12-24',41,16,'2025-12-23 15:32:14.058254',1),(38,'2025-12-23 15:32:28.367263',0,'2025-12-23',42,16,'2025-12-23 15:32:14.438793',1),(39,'2025-12-23 15:32:14.670178',1,'2025-12-24',43,16,'2025-12-23 15:32:14.808776',1),(40,'2025-12-23 15:32:15.043223',1,'2025-12-24',44,16,'2025-12-23 15:32:15.187894',1),(41,'2025-12-23 15:32:15.426455',1,'2025-12-24',45,16,'2025-12-23 15:32:15.567513',1),(42,'2025-12-23 17:52:15.690542',1,'2025-12-24',36,12,'2025-12-23 17:52:15.841391',1),(43,'2025-12-23 17:52:16.092608',1,'2025-12-24',37,12,'2025-12-23 17:52:16.241937',1),(44,'2025-12-23 17:52:16.484195',1,'2025-12-24',38,12,'2025-12-23 17:52:16.630243',1),(45,'2025-12-23 17:52:16.872831',1,'2025-12-24',39,12,'2025-12-23 17:52:17.017589',1),(46,'2025-12-23 17:52:17.262820',1,'2025-12-24',40,12,'2025-12-23 17:52:17.407454',1),(47,'2025-12-23 17:52:17.651104',1,'2025-12-24',41,12,'2025-12-23 17:52:17.801905',1),(48,'2025-12-23 17:52:18.045935',1,'2025-12-24',42,12,'2025-12-23 17:52:18.192285',1),(49,'2025-12-23 17:52:18.433574',1,'2025-12-24',43,12,'2025-12-23 17:52:18.580254',1),(50,'2025-12-23 17:52:18.821171',1,'2025-12-24',44,12,'2025-12-23 17:52:18.966753',1),(51,'2025-12-23 17:52:19.207764',1,'2025-12-24',45,12,'2025-12-23 17:52:19.353131',1),(52,'2025-12-24 04:19:04.306998',1,'2025-12-25',46,14,'2025-12-24 04:19:04.450299',1),(53,'2025-12-24 04:19:04.677072',1,'2025-12-25',47,14,'2025-12-24 04:19:04.824983',1),(54,'2025-12-24 04:19:05.056791',1,'2025-12-25',48,14,'2025-12-24 04:19:05.196711',1),(55,'2025-12-24 04:19:10.626823',1,'2025-12-25',49,14,'2025-12-24 04:19:05.569822',1),(56,'2025-12-24 04:19:10.956765',1,'2025-12-25',50,14,'2025-12-24 04:19:05.958712',1),(57,'2025-12-31 06:32:43.320079',1,'2026-01-01',31,19,'2025-12-31 06:32:43.945962',1),(58,'2025-12-31 06:32:44.986831',1,'2026-01-01',33,19,'2025-12-31 06:32:45.611919',1),(59,'2025-12-31 06:32:46.653698',1,'2026-01-01',34,19,'2025-12-31 06:32:47.278955',1),(60,'2025-12-31 06:32:48.321262',1,'2026-01-01',35,19,'2025-12-31 06:32:48.946789',1),(61,'2025-12-31 06:32:49.987700',1,'2026-01-01',32,19,'2025-12-31 06:32:50.613253',1),(62,'2025-12-31 06:33:23.952492',1,'2026-01-01',91,19,'2025-12-31 06:33:11.826811',1),(63,'2025-12-31 06:33:25.171590',1,'2026-01-01',92,19,'2025-12-31 06:33:13.485255',1),(64,'2025-12-31 06:33:26.390917',1,'2026-01-01',93,19,'2025-12-31 06:33:15.140577',1),(65,'2025-12-31 06:33:27.609515',1,'2026-01-01',94,19,'2025-12-31 06:33:16.794801',1),(66,'2025-12-31 06:33:28.829086',1,'2026-01-01',95,19,'2025-12-31 06:33:18.449057',1),(67,'2025-12-31 06:44:10.654532',1,'2026-01-01',51,19,'2025-12-31 06:44:11.235951',1),(68,'2025-12-31 06:44:12.205165',1,'2026-01-01',52,19,'2025-12-31 06:44:12.789796',1),(69,'2025-12-31 06:44:13.760185',1,'2026-01-01',53,19,'2025-12-31 06:44:14.340708',1),(70,'2025-12-31 06:44:15.309072',1,'2026-01-01',54,19,'2025-12-31 06:44:15.891090',1),(71,'2025-12-31 06:44:16.859605',1,'2026-01-01',55,19,'2025-12-31 06:44:17.441822',1);
/*!40000 ALTER TABLE `user_flashcards` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_lessons`
--

DROP TABLE IF EXISTS `user_lessons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_lessons` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `completed` tinyint(1) NOT NULL,
  `completed_at` datetime(6) DEFAULT NULL,
  `lesson_id` bigint NOT NULL,
  `user_id` int NOT NULL,
  `flashcard_completed` tinyint(1) NOT NULL,
  `flashcard_completed_at` datetime(6) DEFAULT NULL,
  `milestone_xp_awarded` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_lessons_user_id_lesson_id_5885bb35_uniq` (`user_id`,`lesson_id`),
  KEY `user_lesson_user_id_5f56f3_idx` (`user_id`),
  KEY `user_lessons_lesson_id_9cff6a7d_fk_lessons_id` (`lesson_id`),
  CONSTRAINT `user_lessons_lesson_id_9cff6a7d_fk_lessons_id` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_lessons`
--

LOCK TABLES `user_lessons` WRITE;
/*!40000 ALTER TABLE `user_lessons` DISABLE KEYS */;
INSERT INTO `user_lessons` VALUES (2,1,'2025-11-30 16:43:31.612096',6,14,0,NULL,0),(3,1,'2025-12-22 12:09:44.754224',1,12,1,'2025-12-15 05:55:43.191604',0),(4,0,NULL,5,12,1,'2025-12-15 08:49:18.391581',0),(5,1,'2025-12-17 08:26:49.869540',6,8,0,NULL,0),(6,1,'2025-12-22 16:06:16.441222',14,8,1,'2025-12-22 16:05:34.056697',1),(7,1,'2025-12-22 16:24:24.603046',14,14,1,'2025-12-22 16:24:07.204607',1),(8,1,'2025-12-22 16:35:51.976748',7,8,0,NULL,0),(12,0,NULL,15,16,1,'2025-12-23 15:32:16.045549',0),(13,1,'2025-12-23 17:54:59.150745',15,12,1,'2025-12-23 17:52:19.842341',1),(14,1,'2025-12-24 04:19:51.000806',16,14,1,'2025-12-24 04:19:06.426911',1),(15,1,'2025-12-24 07:30:47.978903',15,8,0,NULL,0),(16,0,NULL,14,19,1,'2025-12-31 06:32:52.697928',0),(17,0,NULL,7,19,1,'2025-12-31 06:33:20.517043',0),(18,1,'2025-12-31 06:40:05.056858',16,19,0,NULL,0),(19,1,'2025-12-31 06:43:33.202154',17,19,1,'2025-12-31 06:44:18.605205',0),(20,0,NULL,15,21,0,NULL,0);
/*!40000 ALTER TABLE `user_lessons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` longtext NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` longtext,
  `role` varchar(10) NOT NULL,
  `status` varchar(8) NOT NULL,
  `xp` bigint NOT NULL,
  `avatar_url` longtext,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `email_notifications_enabled` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Tran Ngoc Hung','a@example.com','','learner','active',120,'https://example.com/avatar_a.jpg','2025-11-16 07:54:57.000000','2025-11-16 07:54:57.000000',1),(2,'Tran Thi B','b@example.com','','admin','active',500,'https://example.com/avatar_b.jpg','2025-11-16 07:54:57.000000','2025-12-18 23:33:02.023259',1),(3,'Le Hong C','c@example.com','','superadmin','active',1500,'https://example.com/avatar_c.jpg','2025-11-16 07:54:57.000000','2025-11-16 07:54:57.000000',1),(4,'Trần Khánh Quỳnh','kq161204@gmail.com','pbkdf2_sha256$1000000$1PZIOHorj4Vki6pSEOpljL$OGyO+wVo0/mZeYd32Fk9rBhCzCfwf4h+JOW+6E1oKjw=','superadmin','active',0,'https://res.cloudinary.com/dkm6us88f/image/upload/v1767162342/sbzm8afudhxqdraupfjw.jpg','2025-11-16 17:54:07.261756','2025-12-31 06:25:43.309904',1),(8,'Trần Ngọc Hưng','hungngtran04@gmail.com','pbkdf2_sha256$1000000$B5iMUzOINMo7vNtlJe4mPA$L9VeSBT/pe2G1Sx8BJjNt+aL62rxBJ9m5TgQOzM9yH4=','learner','active',3065,'https://res.cloudinary.com/dkm6us88f/image/upload/v1766416660/oyvl83qtcuy7n3eds6dp.jpg','2025-11-17 03:13:52.391223','2026-01-05 16:33:58.231677',1),(9,'Trần Khánh Quỳnh','quynhtrankhanh1111@gmail.com','pbkdf2_sha256$1000000$QyvtsNiOgnTSVEHCzQw8Xh$ntsXFoc/ZZx3+PkS33pJTMPF2pZid+E7XeJgpRx+Cks=','learner','active',0,NULL,'2025-11-17 03:45:46.206084','2025-12-19 05:56:58.283330',1),(11,'Trần Ngọc Hưng','tnhworkmail@gmail.com','pbkdf2_sha256$1000000$yvIrNEq1Rlo8GKcSe4I4nm$e0DhRVxfy6mWmesEovXThgaCoydGumvJMoEqLzD2QvY=','learner','active',0,NULL,'2025-11-17 13:26:26.604309','2025-11-17 13:26:26.604309',1),(12,'Khánh Huyền','huyennana2004@gmail.com','pbkdf2_sha256$1000000$QfrEFJWEzRZakVofJnodH1$2PP1atl6TqipLsQon1f2UGZft2ttQ+AEzDcD3Sf9IkQ=','learner','active',440,'https://res.cloudinary.com/dkm6us88f/image/upload/v1765875971/sciorg7nmlkkkask21fk.jpg','2025-11-23 11:15:25.863368','2025-12-23 17:52:19.545689',1),(13,'Đinh Ngọc Khánh Huyền','huyendnk1808@gmail.com','pbkdf2_sha256$1000000$sKqTlwOtUJATFHbOSKgjUs$ARzv05DU4pG/RsspoQPdCMqgcu1ydTDwDTx2rc1lTKY=','admin','active',0,'https://res.cloudinary.com/dkm6us88f/image/upload/v1764001092/ysyuwffazmh15oeavotj.jpg','2025-11-23 18:03:07.149672','2025-12-18 05:57:26.188207',1),(14,'Trần Ngọc Hưng Sun','tran.ngoc.hung@sun-asterisk.com','pbkdf2_sha256$1000000$oy6AYpSF5bXnPLqlX0r2C8$PeW4O/G5gPQdW70d54NSWrvQtwD2KUsYuIzMQyFBFeY=','learner','active',570,NULL,'2025-11-30 07:10:42.146695','2025-12-24 04:19:11.238784',1),(15,'Trần Khánh Quỳnh','quynh.tk225762@sis.hust.edu.vn','pbkdf2_sha256$1000000$4d2BVb8ELgAW7pxm2pbQTJ$J+AJZymfqbavwnUGsbDuZisBW98Ksq8LYLNF+BWWvH0=','admin','active',0,NULL,'2025-12-19 00:15:23.210181','2025-12-19 00:15:23.210305',1),(16,'Tran Khanh Quynh','khanhquynh161204@gmail.com','pbkdf2_sha256$1000000$oSOYHZqwe4SvDVdGWdEymd$ri+WOuWf0zun439s6M20JRmEg4Lrm0EUN9hMshfWIL4=','learner','active',80,'https://res.cloudinary.com/dkm6us88f/image/upload/v1766401374/dz4xhwmjr0dnv6nfw2fy.png','2025-12-21 16:08:05.615861','2025-12-23 15:32:28.643246',1),(17,'Nguyễn Sơn Tùng','sontungflopquathighitenanhvao@gmail.com','pbkdf2_sha256$1000000$020q4Iqglo2E0QsV1OeaXi$aVNYOTaX1CzrasatUJL4BmbJh+lGvBZHdafMr2eeXO4=','admin','active',0,NULL,'2025-12-23 16:46:25.517068','2025-12-23 16:46:25.517093',1),(18,'Lê Hải Nam','hainamlelele@gmail.com','pbkdf2_sha256$1000000$eePaTQHczwpgu2meyhZiHR$1oq2Rd6ZODUoBL/n7nAfHmx0FtHPMFMEk1C7uuxQZSU=','learner','active',0,NULL,'2025-12-23 16:50:33.132573','2025-12-23 16:50:33.132601',1),(19,'Trương Lăng Hách','koxaliy994@emaxasp.com','pbkdf2_sha256$1000000$26HTXGt2vM80g31il4CH40$DzKmA2p/30b0GgYWPt21MDGkJekPUqzAGEouZt64okM=','learner','active',310,NULL,'2025-12-31 05:58:20.051875','2025-12-31 06:44:18.215656',1),(20,'Test-1','htcfwhlzbggkdumujd@fxavaj.com','pbkdf2_sha256$1000000$vUngerZhHRv3h0IPpTUUck$Pkj/smFn9mJf1ctoupt+9Mu5M9+42ExnGZUdiKkWIxg=','learner','active',0,NULL,'2026-01-01 19:24:28.327388','2026-01-01 19:24:28.327535',1),(21,'Vũ Minh Quân','saclong00@gmail.com','pbkdf2_sha256$1000000$K8QBEaMc2PB6VBuFTUgfZ0$omypTiINqCEu7nFRzFWfFfVpGiT1dO1WB/Gyu1sA4M8=','learner','active',0,NULL,'2026-01-05 07:49:33.073059','2026-01-05 07:49:33.073216',1);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'defaultdb'
--

--
-- Dumping routines for database 'defaultdb'
--
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-06 21:12:46
