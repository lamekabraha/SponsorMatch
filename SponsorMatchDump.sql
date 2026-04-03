-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: sponsor_match
-- ------------------------------------------------------
-- Server version	8.0.45

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

--
-- Table structure for table `account`
--

DROP TABLE IF EXISTS `account`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `account` (
  `AccountId` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(45) NOT NULL,
  `AccountTypeId` int DEFAULT NULL,
  `IndustrySector` varchar(100) DEFAULT NULL,
  `CompanyLogo` varchar(500) DEFAULT NULL,
  `CompanyCover` varchar(500) DEFAULT NULL,
  `Description` varchar(255) DEFAULT NULL,
  `ContactName` varchar(100) DEFAULT NULL,
  `ContactEmail` varchar(45) DEFAULT NULL,
  `ContactPhone` varchar(45) DEFAULT NULL,
  `AdditionalAdmins` varchar(500) DEFAULT NULL,
  `Website` varchar(255) DEFAULT NULL,
  `Instagram` varchar(255) DEFAULT NULL,
  `Facebook` varchar(255) DEFAULT NULL,
  `Linkedin` varchar(255) DEFAULT NULL,
  `Twitter` varchar(255) DEFAULT NULL,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`AccountId`),
  UNIQUE KEY `ContactEmail` (`ContactEmail`),
  UNIQUE KEY `CompanyCover_UNIQUE` (`CompanyCover`),
  UNIQUE KEY `CompanyLogo_UNIQUE` (`CompanyLogo`),
  UNIQUE KEY `Description_UNIQUE` (`Description`),
  KEY `FkAccountTypeId_idx` (`AccountTypeId`),
  CONSTRAINT `FkAccountTypeId` FOREIGN KEY (`AccountTypeId`) REFERENCES `account_type` (`AccountTypeId`)
) ENGINE=InnoDB AUTO_INCREMENT=104 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account`
--

LOCK TABLES `account` WRITE;
/*!40000 ALTER TABLE `account` DISABLE KEYS */;
INSERT INTO `account` VALUES (26,'Community Sports Foundation',2,'sports','accounts/26/logo/logo.png','http://localhost:3000/api/storage/accounts/26/cover/cover.png',NULL,'Sarah Mitchell','sarah.mitchell@communitysports.org','0161 555 0123','john@communitysports.org, admin@communitysports.org','google.com','Instagram.com','Facebook.com','https://www.linkedin.com/','https://www.youtube.com/','2026-02-19 13:57:03','2026-03-25 21:39:37'),(101,'The Riverside Group',2,'Health & Wellbeing','logo_riverside.png','cover_riverside.png',NULL,'Sarah Jenkins','sarah@riversidegroup.org','0161 555 1234',NULL,'google.com','Instagram.com','Facebook.com','https://www.linkedin.com/','https://www.youtube.com/','2026-03-12 03:19:57','2026-03-24 13:25:54'),(102,'GreenSpark Training Ltd',1,'Education & Training','logo_greenspark.png','cover_greenspark.png',NULL,'Marcus Chen','marcus@greenspark.co.uk','0121 555 5678',NULL,'google.com','Instagram.com','Facebook.com','https://www.linkedin.com/','https://www.youtube.com/','2026-03-12 03:19:57','2026-03-24 13:25:54'),(103,'business',1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-03-24 13:59:40','2026-03-24 13:59:40');
/*!40000 ALTER TABLE `account` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `account_type`
--

DROP TABLE IF EXISTS `account_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `account_type` (
  `AccountTypeId` int NOT NULL AUTO_INCREMENT,
  `AccountType` varchar(45) NOT NULL,
  PRIMARY KEY (`AccountTypeId`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account_type`
--

LOCK TABLES `account_type` WRITE;
/*!40000 ALTER TABLE `account_type` DISABLE KEYS */;
INSERT INTO `account_type` VALUES (1,'Business'),(2,'VCSE/Charity');
/*!40000 ALTER TABLE `account_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `benefit`
--

DROP TABLE IF EXISTS `benefit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `benefit` (
  `BenefitId` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(45) DEFAULT NULL,
  `Description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`BenefitId`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `benefit`
--

LOCK TABLES `benefit` WRITE;
/*!40000 ALTER TABLE `benefit` DISABLE KEYS */;
INSERT INTO `benefit` VALUES (17,'Logo placement at events/venues','Your logo displayed at events and on venue materials'),(18,'Community engagement opportunities','Direct engagement with community groups and beneficiaries'),(19,'Brand visibility in local area','Local marketing and visibility opportunities'),(20,'PR & media coverage','Press releases and media mentions'),(21,'Social media recognition','Recognition across social channels'),(22,'Employee volunteering at events','Staff volunteering opportunities at your events'),(23,'Speaking opportunities at events','Speaking slots at events and conferences'),(24,'Impact reporting & measurement','Regular impact reports and metrics');
/*!40000 ALTER TABLE `benefit` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `business`
--

DROP TABLE IF EXISTS `business`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `business` (
  `BusinessId` int NOT NULL AUTO_INCREMENT,
  `AccountId` int DEFAULT NULL,
  `IndustryId` int DEFAULT NULL,
  `PartnershipPref` varchar(255) DEFAULT NULL,
  `AnnualBudget (£)` int DEFAULT NULL,
  PRIMARY KEY (`BusinessId`),
  KEY `fkAccountBusiness_idx` (`AccountId`),
  KEY `fk_business_industry_idx` (`IndustryId`),
  CONSTRAINT `fk_business_industry` FOREIGN KEY (`IndustryId`) REFERENCES `industry_type` (`IndustryId`),
  CONSTRAINT `fkAccountBusiness` FOREIGN KEY (`AccountId`) REFERENCES `account` (`AccountId`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `business`
--

LOCK TABLES `business` WRITE;
/*!40000 ALTER TABLE `business` DISABLE KEYS */;
INSERT INTO `business` VALUES (5,102,11,'Education and youth skills',25000);
/*!40000 ALTER TABLE `business` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `business_benefit_pref`
--

DROP TABLE IF EXISTS `business_benefit_pref`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `business_benefit_pref` (
  `BenefitPrefId` int NOT NULL AUTO_INCREMENT,
  `BusinessId` int DEFAULT NULL,
  `BenefitId` int DEFAULT NULL,
  PRIMARY KEY (`BenefitPrefId`),
  KEY `fk_benefit-pref_business_idx` (`BusinessId`),
  KEY `fk_benefit-pref_benefit_idx` (`BenefitId`),
  CONSTRAINT `fk_benefit-pref_benefit` FOREIGN KEY (`BenefitId`) REFERENCES `benefit` (`BenefitId`),
  CONSTRAINT `fk_benefit-pref_business` FOREIGN KEY (`BusinessId`) REFERENCES `business` (`BusinessId`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `business_benefit_pref`
--

LOCK TABLES `business_benefit_pref` WRITE;
/*!40000 ALTER TABLE `business_benefit_pref` DISABLE KEYS */;
INSERT INTO `business_benefit_pref` VALUES (1,5,17),(2,5,19),(3,5,21),(4,5,24);
/*!40000 ALTER TABLE `business_benefit_pref` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `campaign`
--

DROP TABLE IF EXISTS `campaign`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `campaign` (
  `CampaignId` int NOT NULL AUTO_INCREMENT,
  `AccountId` int DEFAULT NULL,
  `CampaignName` varchar(45) DEFAULT NULL,
  `CampaignTypeId` int DEFAULT NULL,
  `CoverImage` text,
  `AdditionalImagePath` varchar(255) DEFAULT NULL,
  `GoalAmount` decimal(10,0) DEFAULT NULL,
  `Status` enum('open','closed') DEFAULT NULL,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`CampaignId`),
  KEY `fk_campaign_account_idx` (`AccountId`),
  KEY `fk_campaign_campaign-type_idx` (`CampaignTypeId`),
  CONSTRAINT `fk_campaign_account` FOREIGN KEY (`AccountId`) REFERENCES `account` (`AccountId`),
  CONSTRAINT `fk_campaign_campaign-type` FOREIGN KEY (`CampaignTypeId`) REFERENCES `campaign_type` (`CampaignTypeId`)
) ENGINE=InnoDB AUTO_INCREMENT=209 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `campaign`
--

LOCK TABLES `campaign` WRITE;
/*!40000 ALTER TABLE `campaign` DISABLE KEYS */;
INSERT INTO `campaign` VALUES (204,26,'Community Sports Hub 2026',9,'accounts/26/Campaign/207/Cover.jpg','accounts/26/Campaign/207/AdditionalImages',15000,'open','2026-03-12 04:00:09','2026-03-26 11:45:19'),(205,26,'Youth Coaching Programme',9,'accounts/26/Campaign/207/Cover.jpg','accounts/26/Campaign/207/AdditionalImages',8000,'closed','2026-03-12 04:00:09','2026-03-26 11:45:19'),(206,26,'Riverside Wellbeing Project',10,'accounts/26/Campaign/207/Cover.jpg','accounts/26/Campaign/207/AdditionalImages',12000,'open','2026-03-12 04:00:09','2026-03-26 11:45:19'),(207,26,'Under 18 Football Club',9,'accounts/26/Campaign/207/Cover.jpg','accounts/26/Campaign/207/AdditionalImages',5000,'open','2026-03-24 15:10:11','2026-03-24 15:10:11'),(208,26,'Under 18 Football Club',9,'accounts/26/Campaign/208/Cover.jpg','accounts/26/Campaign/208/AdditionalImages',5000,'open','2026-03-24 15:10:13','2026-03-24 15:10:13');
/*!40000 ALTER TABLE `campaign` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `campaign_benefit`
--

DROP TABLE IF EXISTS `campaign_benefit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `campaign_benefit` (
  `BenefitId` int NOT NULL AUTO_INCREMENT,
  `Benefit` varchar(255) NOT NULL,
  PRIMARY KEY (`BenefitId`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `campaign_benefit`
--

LOCK TABLES `campaign_benefit` WRITE;
/*!40000 ALTER TABLE `campaign_benefit` DISABLE KEYS */;
INSERT INTO `campaign_benefit` VALUES (1,'Logo placement at events/venues'),(2,'Community engegement opportunities'),(3,'Brand visibility in local area'),(4,'PR & media coverage'),(5,'Social media recognition'),(6,'Employee volunteering at events'),(7,'Speaking opportunities at events'),(8,'Impact reporting & measurement');
/*!40000 ALTER TABLE `campaign_benefit` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `campaign_type`
--

DROP TABLE IF EXISTS `campaign_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `campaign_type` (
  `CampaignTypeId` int NOT NULL AUTO_INCREMENT,
  `Type` varchar(45) DEFAULT NULL,
  `Description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`CampaignTypeId`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `campaign_type`
--

LOCK TABLES `campaign_type` WRITE;
/*!40000 ALTER TABLE `campaign_type` DISABLE KEYS */;
INSERT INTO `campaign_type` VALUES (1,'Tangible Asset Sponsorship','Sponsoring specific physical items, such as equipment for wellbeing groups or a new kitchen for a community café.'),(2,'Operational Costs / Core Funding','Supporting essential running costs, including staff salaries, volunteer expenses, or rent, allowing VCSEs to focus on delivery.'),(3,'Social Prescribing & Wellbeing','Funding weekly support groups or outreach activities that improve mental health and reduce isolation.'),(4,'Employment & Green Skills','Supporting vocational training, employability programmes, or workshops focused on sustainability and future jobs.'),(5,'Capital Appeal / New Build','Funding major one-off capital projects, such as building a community garden or expanding a training facility.'),(6,'Crisis Intervention & Outreach','Providing urgent support for vulnerable groups or rapid-response community services.'),(7,'Youth Mentorship & Coaching','Connecting young people with business leaders for career guidance and skill development.'),(8,'Community Event / Local Activations','Sponsoring a one-off community sports day, wellbeing café series, or networking event.'),(9,'Sports and Athletic Coaching','Weekly coaching sessions for diverse youth and adults, including football, basketball, and fitness training in local urban parks and indoor centres.'),(10,'Community Recreation','Funding community-run football leagues, walking groups, or fitness classes to improve physical health and wellbeing.');
/*!40000 ALTER TABLE `campaign_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `donation`
--

DROP TABLE IF EXISTS `donation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `donation` (
  `DonationId` int NOT NULL AUTO_INCREMENT,
  `CampaignId` int DEFAULT NULL,
  `InteractionId` int DEFAULT NULL,
  `PackageId` int DEFAULT NULL,
  `Donor` int DEFAULT NULL,
  `Amount` decimal(10,0) DEFAULT NULL,
  `DonationDate` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `PaymentStatus` enum('complete','incomplete') DEFAULT NULL,
  `TransactionRef` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`DonationId`),
  UNIQUE KEY `TransactionRef_UNIQUE` (`TransactionRef`),
  KEY `fk_donation_campaign_idx` (`CampaignId`),
  KEY `fk_donation_iteraction_idx` (`InteractionId`),
  KEY `fk_donation_package_idx` (`PackageId`),
  KEY `fk_donation_account_idx` (`Donor`),
  CONSTRAINT `fk_donation_account` FOREIGN KEY (`Donor`) REFERENCES `account` (`AccountId`),
  CONSTRAINT `fk_donation_camapign` FOREIGN KEY (`CampaignId`) REFERENCES `campaign` (`CampaignId`),
  CONSTRAINT `fk_donation_iteraction` FOREIGN KEY (`InteractionId`) REFERENCES `engagement` (`InteractionId`),
  CONSTRAINT `fk_donation_package` FOREIGN KEY (`PackageId`) REFERENCES `package` (`PackageId`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `donation`
--

LOCK TABLES `donation` WRITE;
/*!40000 ALTER TABLE `donation` DISABLE KEYS */;
INSERT INTO `donation` VALUES (1,204,2,9,102,500,'2026-03-12 04:00:09','complete','TXN-SEED-001'),(2,206,2,9,102,700,'2026-03-12 04:00:09','complete','TXN-SEED-002');
/*!40000 ALTER TABLE `donation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `engagement`
--

DROP TABLE IF EXISTS `engagement`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `engagement` (
  `InteractionId` int NOT NULL AUTO_INCREMENT,
  `BusinessId` int DEFAULT NULL,
  `CampaignId` int DEFAULT NULL,
  `PackageId` int DEFAULT NULL,
  `SwipeType` enum('favourite','pass') DEFAULT NULL,
  `Status` enum('viewed','liked','matched') DEFAULT NULL,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`InteractionId`),
  KEY `idx_business_campaign` (`BusinessId`,`CampaignId`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='if campaign liked, packageId returns what the business selected, else defaults to null';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `engagement`
--

LOCK TABLES `engagement` WRITE;
/*!40000 ALTER TABLE `engagement` DISABLE KEYS */;
INSERT INTO `engagement` VALUES (2,5,204,9,'favourite','liked','2026-03-12 04:00:09');
/*!40000 ALTER TABLE `engagement` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `following`
--

DROP TABLE IF EXISTS `following`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `following` (
  `FollowingId` int NOT NULL AUTO_INCREMENT,
  `AccountId` int NOT NULL,
  `FollowId` int NOT NULL,
  PRIMARY KEY (`FollowingId`),
  UNIQUE KEY `uq_account_follow` (`AccountId`,`FollowId`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `following`
--

LOCK TABLES `following` WRITE;
/*!40000 ALTER TABLE `following` DISABLE KEYS */;
INSERT INTO `following` VALUES (1,102,26);
/*!40000 ALTER TABLE `following` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `industry_type`
--

DROP TABLE IF EXISTS `industry_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `industry_type` (
  `IndustryId` int NOT NULL AUTO_INCREMENT,
  `IndustryType` varchar(45) DEFAULT NULL,
  `IndustryTypeDesc` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`IndustryId`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `industry_type`
--

LOCK TABLES `industry_type` WRITE;
/*!40000 ALTER TABLE `industry_type` DISABLE KEYS */;
INSERT INTO `industry_type` VALUES (11,'Education & Training','Schools, training providers, skills development'),(12,'Health & Wellbeing','Healthcare, mental health, fitness'),(13,'Sports','Grassroots sports, clubs, leagues'),(14,'Environmental','Conservation, sustainability, green initiatives'),(15,'Technology','Digital inclusion, tech for good'),(16,'Arts & Culture','Community arts, heritage, events'),(17,'Social Care','Care services, support for vulnerable groups'),(18,'Youth Development','Youth clubs, mentoring, employability'),(19,'Corporate','General corporate / multi-sector'),(20,'Other','Other sectors');
/*!40000 ALTER TABLE `industry_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `location`
--

DROP TABLE IF EXISTS `location`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `location` (
  `LocationId` int NOT NULL AUTO_INCREMENT,
  `AccountId` int NOT NULL,
  `SiteName` varchar(45) DEFAULT NULL,
  `Address` varchar(100) NOT NULL,
  PRIMARY KEY (`LocationId`),
  KEY `FkAccountId_idx` (`AccountId`),
  CONSTRAINT `FkAccountId` FOREIGN KEY (`AccountId`) REFERENCES `account` (`AccountId`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `location`
--

LOCK TABLES `location` WRITE;
/*!40000 ALTER TABLE `location` DISABLE KEYS */;
INSERT INTO `location` VALUES (26,26,NULL,'42 High Street, Manchester M1 4BT');
/*!40000 ALTER TABLE `location` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `package`
--

DROP TABLE IF EXISTS `package`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `package` (
  `PackageId` int NOT NULL AUTO_INCREMENT,
  `CampaignId` int DEFAULT NULL,
  `PackageType` int DEFAULT NULL,
  `Title` varchar(45) DEFAULT NULL,
  `Price` decimal(10,0) DEFAULT NULL,
  PRIMARY KEY (`PackageId`),
  KEY `fk_package_campaign_idx` (`CampaignId`),
  KEY `fk_package_package-type_idx` (`PackageType`),
  CONSTRAINT `fk_package_campaign` FOREIGN KEY (`CampaignId`) REFERENCES `campaign` (`CampaignId`),
  CONSTRAINT `fk_package_package-type` FOREIGN KEY (`PackageType`) REFERENCES `package_type` (`PackageTypeId`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `package`
--

LOCK TABLES `package` WRITE;
/*!40000 ALTER TABLE `package` DISABLE KEYS */;
INSERT INTO `package` VALUES (9,204,5,'Bronze Supporter',250),(10,204,6,'Silver Partner',750),(11,204,7,'Gold Champion',2000),(12,205,5,'Coach Sponsor',500),(13,205,6,'Programme Partner',1500),(14,206,5,'Wellbeing Friend',300),(15,206,7,'Wellbeing Champion',1000);
/*!40000 ALTER TABLE `package` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `package_benefit`
--

DROP TABLE IF EXISTS `package_benefit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `package_benefit` (
  `PackageBenefitID` int NOT NULL AUTO_INCREMENT,
  `PackageId` int DEFAULT NULL,
  `BenefitId` int DEFAULT NULL,
  PRIMARY KEY (`PackageBenefitID`),
  KEY `fk_package-benefit__package_idx` (`PackageId`),
  KEY `fk_package-benefit_benefit_idx` (`BenefitId`),
  CONSTRAINT `fk_package-benefit_benefit` FOREIGN KEY (`BenefitId`) REFERENCES `benefit` (`BenefitId`),
  CONSTRAINT `fk_package-benefit_package` FOREIGN KEY (`PackageId`) REFERENCES `package` (`PackageId`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `package_benefit`
--

LOCK TABLES `package_benefit` WRITE;
/*!40000 ALTER TABLE `package_benefit` DISABLE KEYS */;
INSERT INTO `package_benefit` VALUES (13,9,17),(14,9,19),(15,9,21),(16,10,17),(17,10,19),(18,10,20),(19,10,21),(20,11,17),(21,11,18),(22,11,19),(23,11,20),(24,11,21),(25,11,24),(26,12,17),(27,12,19),(28,12,21),(29,13,17),(30,13,18),(31,13,19),(32,13,20),(33,13,24),(34,14,17),(35,14,19),(36,14,21),(37,15,17),(38,15,18),(39,15,19),(40,15,20),(41,15,24);
/*!40000 ALTER TABLE `package_benefit` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `package_type`
--

DROP TABLE IF EXISTS `package_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `package_type` (
  `PackageTypeId` int NOT NULL AUTO_INCREMENT,
  `PackageType` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`PackageTypeId`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `package_type`
--

LOCK TABLES `package_type` WRITE;
/*!40000 ALTER TABLE `package_type` DISABLE KEYS */;
INSERT INTO `package_type` VALUES (5,'Bronze'),(6,'Silver'),(7,'Gold'),(8,'Platinum');
/*!40000 ALTER TABLE `package_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_gateway`
--

DROP TABLE IF EXISTS `payment_gateway`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_gateway` (
  `GatewayId` int NOT NULL AUTO_INCREMENT,
  `DonationId` int DEFAULT NULL,
  `ExternalProcessor` varchar(45) DEFAULT NULL,
  `ProcessorFee` decimal(10,0) DEFAULT NULL,
  `PayoutDate` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`GatewayId`),
  KEY `fk_pay_don_idx` (`DonationId`),
  CONSTRAINT `fk_pay_don` FOREIGN KEY (`DonationId`) REFERENCES `donation` (`DonationId`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_gateway`
--

LOCK TABLES `payment_gateway` WRITE;
/*!40000 ALTER TABLE `payment_gateway` DISABLE KEYS */;
INSERT INTO `payment_gateway` VALUES (2,1,'Stripe',15,'2026-03-12 04:00:09');
/*!40000 ALTER TABLE `payment_gateway` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `UserId` int NOT NULL AUTO_INCREMENT,
  `AccountId` int NOT NULL,
  `FirstName` varchar(45) NOT NULL,
  `LastName` varchar(45) NOT NULL,
  `Email` varchar(45) NOT NULL,
  `HashedPassword` varchar(255) NOT NULL,
  `Verified` tinyint(1) NOT NULL DEFAULT '0',
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`UserId`),
  UNIQUE KEY `Email` (`Email`),
  KEY `AccountId_idx` (`AccountId`),
  CONSTRAINT `AccountId` FOREIGN KEY (`AccountId`) REFERENCES `account` (`AccountId`)
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Updated table description';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (18,26,'Sarah','Mitchell','sarah.mitchell@communitysports.org','$2a$10$2/QyTpy7PdPCrT6IAs4GJe/qk0vDpYheBFBYRrfDeNCghD8oOPx9.',1,'2026-02-19 13:57:03','2026-03-24 10:49:56'),(50,26,'Sarah','Jenkins','sarah@riversidegroup.org','$2a$10$2/QyTpy7PdPCrT6IAs4GJe/qk0vDpYheBFBYRrfDeNCghD8oOPx9.',1,'2026-03-12 03:20:31','2026-03-24 10:49:56'),(51,102,'Marcus','Chen','marcus@greenspark.co.uk','$2a$10$2/QyTpy7PdPCrT6IAs4GJe/qk0vDpYheBFBYRrfDeNCghD8oOPx9.',1,'2026-03-12 03:20:31','2026-03-24 10:49:56'),(52,103,'james','doe','jame@email.com','$2b$10$ggACSArn6MKpUUI5A/2j1eRggoK2v1.2K6ZVcOT6CItPc.A8RgJW6',1,'2026-03-24 13:59:41','2026-03-24 13:59:41');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vcse`
--

DROP TABLE IF EXISTS `vcse`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vcse` (
  `VcseId` int NOT NULL AUTO_INCREMENT,
  `AccountId` int DEFAULT NULL,
  `VcseTypeId` int DEFAULT NULL,
  `VerificationDoc` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`VcseId`),
  KEY `fkAccountVcse_idx` (`AccountId`),
  KEY `fk_account_vcse-type_idx` (`VcseTypeId`),
  CONSTRAINT `fk_account_vcse-type` FOREIGN KEY (`VcseTypeId`) REFERENCES `vcse_type` (`VcseTypeId`),
  CONSTRAINT `fkAccountVcse` FOREIGN KEY (`AccountId`) REFERENCES `account` (`AccountId`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vcse`
--

LOCK TABLES `vcse` WRITE;
/*!40000 ALTER TABLE `vcse` DISABLE KEYS */;
INSERT INTO `vcse` VALUES (17,26,NULL,'http://localhost:3000/api/storage/accounts/26/verification/verification.png'),(18,26,NULL,'http://localhost:3000/api/storage/accounts/26/verification/verification.png');
/*!40000 ALTER TABLE `vcse` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vcse_type`
--

DROP TABLE IF EXISTS `vcse_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vcse_type` (
  `VcseTypeId` int NOT NULL AUTO_INCREMENT,
  `VcseType` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`VcseTypeId`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vcse_type`
--

LOCK TABLES `vcse_type` WRITE;
/*!40000 ALTER TABLE `vcse_type` DISABLE KEYS */;
INSERT INTO `vcse_type` VALUES (1,'Grassroot Sports Clubs'),(2,'Community Development Groups'),(3,'Voluntary Associations & Networks'),(4,'Youth Development Organisations'),(5,'Education & Skills Training'),(6,'Environmental Initiatives'),(7,'Health & Wellbeing'),(8,'Equality & Diversity');
/*!40000 ALTER TABLE `vcse_type` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-26 11:58:25
