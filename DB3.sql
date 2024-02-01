CREATE TABLE `movParking` (
  `idmov` int NOT NULL AUTO_INCREMENT,
  `fechaent` date DEFAULT NULL,
  `horaent` time DEFAULT NULL,
  `fechasal` date DEFAULT NULL,
  `horasal` time DEFAULT NULL,
  `patente` varchar(10) DEFAULT NULL,
  `empresa` int DEFAULT NULL,
  `tipo` varchar(15) DEFAULT NULL,
  `valor` int DEFAULT '0',
  PRIMARY KEY (`idmov`),
  KEY `fk_movParking_emp_idx` (`empresa`),
  CONSTRAINT `fk_movParking_emp` FOREIGN KEY (`empresa`) REFERENCES `empParking` (`idemp`)
) ENGINE=InnoDB AUTO_INCREMENT=1;


INSERT INTO `movParking`
(`fechaent`,
`horaent`,
`fechasal`,
`horasal`,
`patente`,
`empresa`,
`tipo`,
`valor`)
VALUES
('2024-01-30',
'10:00:00',
'2024-01-30',
'10:30:00',
'HKVX22',
1,
'Anden',
'1500');

INSERT INTO `movParking`
(`fechaent`,
`horaent`,
`fechasal`,
`horasal`,
`patente`,
`empresa`,
`tipo`,
`valor`)
VALUES
('2024-01-30',
'15:00:00',
'2024-01-30',
'18:00:00',
'LKCD16',
2,
'Parking',
'4500');

INSERT INTO `movParking`
(`fechaent`,
`horaent`,
`fechasal`,
`horasal`,
`patente`,
`empresa`,
`tipo`,
`valor`)
VALUES
('2024-02-01',
'12:00:00',
'2024-02-01',
'12:40:00',
'ZKHS34',
3,
'Anden',
'3000');
