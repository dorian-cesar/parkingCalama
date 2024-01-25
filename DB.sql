CREATE TABLE `userParking` (
  `iduser` int NOT NULL,
  `mail` varchar(30) DEFAULT NULL,
  `pass` char(60) DEFAULT NULL,
  `nivel` int DEFAULT NULL,
  PRIMARY KEY (`iduser`),
  UNIQUE KEY `mail_UNIQUE` (`mail`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO masgps.userParking (mail, pass, nivel) VALUES ('admin@wit.la', '$2a$12$.RUbsTcGPqOXPUaSjOw/.ON9ZSo629LN.3uPPH3Lsp9lVJ11AokO6', 10);