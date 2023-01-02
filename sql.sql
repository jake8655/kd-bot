/* Create message table where messageId is stored */
create table message (id varchar(255) not null);

/* Create kd_ratio table where KD info of players is stored */
create table kd_ratio (identifier varchar(255) not null, kills int, deaths int, ratio float as (kills / greatest(deaths, 1)), primary key(identifier));

/* Add dummy data */
/* insert into kd_ratio (identifier, kills, deaths) values ('steam:11000010a1a1a1a', 10, 5); */
/* insert into kd_ratio (identifier, kills, deaths) values ('steam:11002022a2a1a2a', 59, 16); */
/* insert into kd_ratio (identifier, kills, deaths) values ('steam:11002022a2a1a2a', 531, 84); */
