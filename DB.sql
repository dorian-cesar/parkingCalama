CREATE TABLE `userParking` (
  `iduser` int NOT NULL AUTO_INCREMENT,
  `mail` varchar(30) DEFAULT NULL,
  `pass` char(60) DEFAULT NULL,
  `nivel` int DEFAULT NULL,
  PRIMARY KEY (`iduser`),
  UNIQUE KEY `mail_UNIQUE` (`mail`)
) ENGINE=InnoDB AUTO_INCREMENT=1;

INSERT INTO `userParking`
(`mail`,
`pass`,
`nivel`)
VALUES
('admin@wit.la',
'$2a$12$.RUbsTcGPqOXPUaSjOw/.ON9ZSo629LN.3uPPH3Lsp9lVJ11AokO6',
10);

CREATE TABLE `empParking` (
  `idemp` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(20) DEFAULT NULL,
  `representante` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`idemp`)
) ENGINE=InnoDB AUTO_INCREMENT=1;

INSERT INTO `empParking`
(`nombre`,
`representante`)
VALUES
('Wit',
'Administrador');

CREATE TABLE `wlParking` (
  `idwl` int NOT NULL AUTO_INCREMENT,
  `patente` varchar(20) DEFAULT NULL,
  `empresa` int DEFAULT NULL,
  PRIMARY KEY (`idwl`),
  UNIQUE KEY `patente_UNIQUE` (`patente`),
  KEY `fk_wlParking_emp_idx` (`empresa`),
  CONSTRAINT `fk_wlParking_emp` FOREIGN KEY (`empresa`) REFERENCES `empParking` (`idemp`)
) ENGINE=InnoDB AUTO_INCREMENT=1;
