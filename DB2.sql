DROP TABLE IF EXISTS `destParking`;
CREATE TABLE `destParking` (
  `iddest` int NOT NULL AUTO_INCREMENT,
  `ciudad` varchar(25) DEFAULT NULL,
  `valor` int DEFAULT NULL,
  PRIMARY KEY (`iddest`)
) ENGINE=InnoDB AUTO_INCREMENT=1;
