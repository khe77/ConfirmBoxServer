create database confirmbox;

use confirmbox;


create table users(
en integer primary key auto_increment,
name text,
pw varchar(20)
);

create table confirm(
en integer primary key auto_increment,
cfm_seq integer primary key auto_increment,
cfm_yn char(1),
cfm_text text
);

create table pushsets(
en integer primary key auto_increment,
pushset_id integer primary key,
pushset_yn char(1)
);

create table pushset(
pushset_id integer primary key,
pushset_name text
);



