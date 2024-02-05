DROP TABLE IF EXISTS `permParking`;

CREATE TABLE `permParking` (
  `idperm` int NOT NULL AUTO_INCREMENT,
  `nivel` int DEFAULT NULL,
  `descriptor` varchar(15) DEFAULT NULL,
  PRIMARY KEY (`idperm`),
  UNIQUE KEY `nivel_UNIQUE` (`nivel`)
) ENGINE=InnoDB AUTO_INCREMENT=1;

INSERT INTO `permParking`
(`nivel`,
`descriptor`)
VALUES
(1,
'Usuario');

INSERT INTO `permParking`
(`nivel`,
`descriptor`)
VALUES
(10,
'Administrador');

DROP TABLE IF EXISTS `userParking`;
CREATE TABLE `userParking` (
  `iduser` int NOT NULL AUTO_INCREMENT,
  `mail` varchar(30) DEFAULT NULL,
  `pass` char(60) DEFAULT NULL,
  `nivel` int DEFAULT NULL,
  PRIMARY KEY (`iduser`),
  UNIQUE KEY `mail_UNIQUE` (`mail`),
  KEY `fk_userParking_perm_idx` (`nivel`),
  CONSTRAINT `fk_userParking_perm` FOREIGN KEY (`nivel`) REFERENCES `permParking` (`nivel`)
) ENGINE=InnoDB AUTO_INCREMENT=1;

INSERT INTO `userParking`
(`mail`,
`pass`,
`nivel`)
VALUES
('admin@wit.la',
'$2a$12$.RUbsTcGPqOXPUaSjOw/.ON9ZSo629LN.3uPPH3Lsp9lVJ11AokO6',
10);

DROP TABLE IF EXISTS `empParking`;
CREATE TABLE `empParking` (
  `idemp` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(20) DEFAULT NULL,
  `contacto` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`idemp`)
) ENGINE=InnoDB AUTO_INCREMENT=1;

INSERT INTO `empParking`
(`nombre`,
`contacto`)
VALUES
('TurBus',
'contacto@turbus.cl');

DROP TABLE IF EXISTS `wlParking`;
CREATE TABLE `wlParking` (
  `idwl` int NOT NULL AUTO_INCREMENT,
  `patente` varchar(20) DEFAULT NULL,
  `empresa` int DEFAULT NULL,
  PRIMARY KEY (`idwl`),
  UNIQUE KEY `patente_UNIQUE` (`patente`),
  KEY `fk_wlParking_emp_idx` (`empresa`),
  CONSTRAINT `fk_wlParking_emp` FOREIGN KEY (`empresa`) REFERENCES `empParking` (`idemp`)
) ENGINE=InnoDB AUTO_INCREMENT=1;