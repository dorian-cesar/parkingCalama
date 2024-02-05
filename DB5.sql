DROP TABLE IF EXISTS `userParking`;
CREATE TABLE `userParking` (
  `iduser` int NOT NULL AUTO_INCREMENT,
  `mail` varchar(40) NOT NULL,
  `pass` char(60) NOT NULL,
  `nivel` int DEFAULT '1',
  PRIMARY KEY (`iduser`),
  KEY `fk_userParking_perm_idx` (`nivel`),
  CONSTRAINT `fk_userParking_perm` FOREIGN KEY (`nivel`) REFERENCES `permParking` (`idperm`)
) ENGINE=InnoDB AUTO_INCREMENT=1;

# adminpass
INSERT INTO `userParking`
(`mail`,
`pass`,
`nivel`)
VALUES
('admin@wit.la',
'$2a$12$.RUbsTcGPqOXPUaSjOw/.ON9ZSo629LN.3uPPH3Lsp9lVJ11AokO6',
2);

# userpass
INSERT INTO `userParking`
(`mail`,
`pass`,
`nivel`)
VALUES
('user@wit.la',
'$2y$10$Py7NSuqdyapAr1ys.aCYjOLuDWBiGE66F5dsDimBowxnScMWRuiga',
1);

