PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE IF NOT EXISTS "d1_migrations"(
		id         INTEGER PRIMARY KEY AUTOINCREMENT,
		name       TEXT UNIQUE,
		applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
INSERT INTO "d1_migrations" ("id","name","applied_at") VALUES(1,'0001_initial_schema.sql','2026-08-09 01:35:56');
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  hashed_password TEXT,
  vneid_verified INTEGER NOT NULL DEFAULT 0,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  preferred_language TEXT DEFAULT 'vi',
  timezone TEXT DEFAULT 'Asia/Ho_Chi_Minh',
  
  elder_mode INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_login_at TEXT,
  is_deleted INTEGER NOT NULL DEFAULT 0,
  deleted_at TEXT
);
INSERT INTO "users" ("id","email","phone","hashed_password","vneid_verified","full_name","avatar_url","preferred_language","timezone","elder_mode","created_at","last_login_at","is_deleted","deleted_at") VALUES('user-tung','tung.nguyen@example.com',NULL,'pbkdf2$100000$03cf5228f9c5a53bce7d209bbd16dfeb$62b55e07e44237e9077941bd8ac639a66b33635fbd40ac59e46216f688d0b3d1',1,'Nguyễn Văn Tùng',NULL,'vi','Asia/Ho_Chi_Minh',0,'2025-07-05 01:35:59','2026-08-09 05:40:06',0,NULL);
INSERT INTO "users" ("id","email","phone","hashed_password","vneid_verified","full_name","avatar_url","preferred_language","timezone","elder_mode","created_at","last_login_at","is_deleted","deleted_at") VALUES('user-hoa','hoa.nguyen@example.com',NULL,'pbkdf2$100000$c02aabaaec15606a44c11218a270f6b7$1104da3b48d8c1ef71fb3521ce178fd33b407da46ffa5fa6d3b99e7cac012443',0,'Nguyễn Thị Hòa',NULL,'vi','Asia/Ho_Chi_Minh',0,'2025-07-05 01:35:59','2026-08-09 01:35:59',0,NULL);
INSERT INTO "users" ("id","email","phone","hashed_password","vneid_verified","full_name","avatar_url","preferred_language","timezone","elder_mode","created_at","last_login_at","is_deleted","deleted_at") VALUES('user-minh','minh.nguyen@example.com',NULL,'pbkdf2$100000$9fdd956ffa22c9a5e1d345d0ff3b2e54$b8b2ffaaa93ff5726670eaec0a4c16420a168e0924394592ec0357c3da558668',0,'Nguyễn Văn Minh',NULL,'vi','Asia/Ho_Chi_Minh',0,'2025-07-05 01:35:59','2026-08-09 05:00:25',0,NULL);
INSERT INTO "users" ("id","email","phone","hashed_password","vneid_verified","full_name","avatar_url","preferred_language","timezone","elder_mode","created_at","last_login_at","is_deleted","deleted_at") VALUES('user-ba','ba.nguyen@example.com',NULL,'pbkdf2$100000$2c284d53016ee1ff93be7c35e9fbd4b9$a3575607d61447f93aca7c840e04813d9c6114d4b11519e311b86645164d411b',0,'Nguyễn Thị Ba',NULL,'vi','Asia/Ho_Chi_Minh',1,'2025-07-05 01:35:59','2026-08-09 01:35:59',0,NULL);
CREATE TABLE user_person_links (
  user_id TEXT NOT NULL,
  person_id TEXT NOT NULL,
  relationship_role TEXT NOT NULL CHECK (relationship_role IN ('self','admin_for','guardian_for')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, person_id)
);
INSERT INTO "user_person_links" ("user_id","person_id","relationship_role","created_at") VALUES('user-tung','p-bo','self','2026-08-09 01:35:59');
INSERT INTO "user_person_links" ("user_id","person_id","relationship_role","created_at") VALUES('user-hoa','p-co_hoa','self','2026-08-09 01:35:59');
INSERT INTO "user_person_links" ("user_id","person_id","relationship_role","created_at") VALUES('user-minh','p-minh','self','2026-08-09 01:35:59');
INSERT INTO "user_person_links" ("user_id","person_id","relationship_role","created_at") VALUES('user-ba','p-ba_co','self','2026-08-09 01:35:59');
INSERT INTO "user_person_links" ("user_id","person_id","relationship_role","created_at") VALUES('user-tung','p-ba_noi','admin_for','2026-08-09 01:35:59');
CREATE TABLE sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL
);
INSERT INTO "sessions" ("token","user_id","created_at","expires_at") VALUES('9792b0be-53ac-4444-94db-e6c244563e3fc0113bd8f6e3489092622ed7479429b9','user-tung','2026-08-09 01:36:30','2026-09-08 01:36:30');
INSERT INTO "sessions" ("token","user_id","created_at","expires_at") VALUES('d93d92cb-1483-42a3-bc78-daf818d0b3784e917e23ca9e4b15bb218b33381b0c6e','user-tung','2026-08-09 01:37:36','2026-09-08 01:37:36');
INSERT INTO "sessions" ("token","user_id","created_at","expires_at") VALUES('bee69615-6cf4-4b41-b6e3-fb8a22c8de77a35a6f594bde4a9aaa4aee321cb4784f','user-tung','2026-08-09 01:38:29','2026-09-08 01:38:29');
INSERT INTO "sessions" ("token","user_id","created_at","expires_at") VALUES('2ce37639-28f1-4216-9b5b-30329c119ec52ba9af97a50c4b728bc6a05fd074e811','user-tung','2026-08-09 01:38:29','2026-09-08 01:38:29');
INSERT INTO "sessions" ("token","user_id","created_at","expires_at") VALUES('57ca8a5c-9217-468a-8b06-bf104871c401ad06c6358184422a921d73b90ea1a058','user-tung','2026-08-09 01:38:55','2026-09-08 01:38:55');
INSERT INTO "sessions" ("token","user_id","created_at","expires_at") VALUES('4ca82661-2a09-44ae-8b4d-636d365631e7f0189e563892420086344e1d02618d00','user-tung','2026-08-09 02:50:32','2026-09-08 02:50:32');
INSERT INTO "sessions" ("token","user_id","created_at","expires_at") VALUES('4a3d099b-b56b-4a4c-8bd1-984eb7065c164085555c444c46768e9e6af3f918708a','user-tung','2026-08-09 02:50:32','2026-09-08 02:50:32');
INSERT INTO "sessions" ("token","user_id","created_at","expires_at") VALUES('596ec242-85e5-475a-bf94-b81565274f74fb8cbeb09535411e9f2ebaa249f9edbc','user-tung','2026-08-09 04:47:17','2026-09-08 04:47:17');
INSERT INTO "sessions" ("token","user_id","created_at","expires_at") VALUES('22aaf8db-e017-4350-a66c-2598a95ee65a14852a4dd0334ee39a5a3e7f81df5fa9','user-tung','2026-08-09 04:50:19','2026-09-08 04:50:19');
INSERT INTO "sessions" ("token","user_id","created_at","expires_at") VALUES('2b1a1b6f-cb06-4123-8782-bc6bb1b669087f3d3cdfeb4640bfb4cfbf20b3d5edfc','user-minh','2026-08-09 04:51:28','2026-09-08 04:51:28');
INSERT INTO "sessions" ("token","user_id","created_at","expires_at") VALUES('58774c24-c585-4122-9da9-950c3ba82913e6fb2ad52392441d8f6d67b3ef40ef2d','user-tung','2026-08-09 05:00:19','2026-09-08 05:00:19');
INSERT INTO "sessions" ("token","user_id","created_at","expires_at") VALUES('ce454a4e-cab0-4eb0-937a-d1e832ab30ac193f44e288304936b7b2df49dc4d4b01','user-minh','2026-08-09 05:00:25','2026-09-08 05:00:25');
INSERT INTO "sessions" ("token","user_id","created_at","expires_at") VALUES('54ef091a-664b-41a1-8a48-c970e3eccde8a743acb542054edda8a4ddcdcdd702d6','user-tung','2026-08-09 05:14:28','2026-09-08 05:14:28');
INSERT INTO "sessions" ("token","user_id","created_at","expires_at") VALUES('09778ef7-7ca1-437e-b5df-a9e40b269edc5ec00db72c6c43b6958baf7065e82608','user-tung','2026-08-09 05:39:34','2026-09-08 05:39:34');
INSERT INTO "sessions" ("token","user_id","created_at","expires_at") VALUES('00770592-872a-4b22-8a12-69f7c926880892bc33183b234ce98c542d511fe4800a','user-tung','2026-08-09 05:39:39','2026-09-08 05:39:39');
INSERT INTO "sessions" ("token","user_id","created_at","expires_at") VALUES('d6b051cd-a828-4b36-a50f-6f3e1502545b902ef047a71c478eb66563c18dec8156','user-tung','2026-08-09 05:39:47','2026-09-08 05:39:47');
INSERT INTO "sessions" ("token","user_id","created_at","expires_at") VALUES('27ac7011-b513-4b50-bc22-d0ef20bb5879bafdc89699574081aee3829a0b17a746','user-tung','2026-08-09 05:39:50','2026-09-08 05:39:50');
INSERT INTO "sessions" ("token","user_id","created_at","expires_at") VALUES('f90c3504-6849-4779-bcf3-c180031c56b50971133906254910b83bc8aa799ede91','user-tung','2026-08-09 05:40:06','2026-09-08 05:40:06');
CREATE TABLE clans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  origin_place TEXT,
  founded_year INTEGER,
  crest_image_id TEXT,
  patriarch_user_id TEXT,
  member_count INTEGER NOT NULL DEFAULT 0,
  merit_fund_balance_vnd INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT INTO "clans" ("id","name","origin_place","founded_year","crest_image_id","patriarch_user_id","member_count","merit_fund_balance_vnd","created_at") VALUES('clan-nguyen-dongngac','Họ Nguyễn Phúc — Đông Ngạc','Làng Đông Ngạc, Từ Liêm, Hà Nội',1902,NULL,'user-tung',15,18500000,'2025-07-05 01:35:59');
CREATE TABLE clan_members (
  clan_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('patriarch','council','member','viewer')),
  joined_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (clan_id, user_id)
);
INSERT INTO "clan_members" ("clan_id","user_id","role","joined_at") VALUES('clan-nguyen-dongngac','user-tung','patriarch','2025-07-15 01:35:59');
INSERT INTO "clan_members" ("clan_id","user_id","role","joined_at") VALUES('clan-nguyen-dongngac','user-hoa','council','2025-07-15 01:35:59');
INSERT INTO "clan_members" ("clan_id","user_id","role","joined_at") VALUES('clan-nguyen-dongngac','user-minh','member','2025-07-15 01:35:59');
INSERT INTO "clan_members" ("clan_id","user_id","role","joined_at") VALUES('clan-nguyen-dongngac','user-ba','council','2025-07-15 01:35:59');
CREATE TABLE persons (
  id TEXT PRIMARY KEY,
  clan_id TEXT,
  full_name TEXT NOT NULL,
  aliases TEXT,                       
  gender TEXT CHECK (gender IN ('M','F','OTHER')),
  generation INTEGER,                 
  birth_date TEXT,
  death_date TEXT,
  birth_place TEXT,
  death_place TEXT,
  is_alive INTEGER NOT NULL DEFAULT 1,
  bio TEXT,
  religion TEXT,
  occupation TEXT,                    
  photo_url TEXT,
  photo_ids TEXT,                     
  audio_ids TEXT,
  video_ids TEXT,
  
  death_anniv_lunar_day INTEGER,
  death_anniv_lunar_month INTEGER,
  is_verified INTEGER NOT NULL DEFAULT 0,
  confidence_score REAL NOT NULL DEFAULT 1.0,
  created_by TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT INTO "persons" ("id","clan_id","full_name","aliases","gender","generation","birth_date","death_date","birth_place","death_place","is_alive","bio","religion","occupation","photo_url","photo_ids","audio_ids","video_ids","death_anniv_lunar_day","death_anniv_lunar_month","is_verified","confidence_score","created_by","created_at","updated_at") VALUES('p-to','clan-nguyen-dongngac','Nguyễn Phúc Đức','[]','M',1,'1902-03-11','1978-11-02','Đông Ngạc, Từ Liêm, Hà Nội','Đông Ngạc, Từ Liêm, Hà Nội',0,'Cụ tổ đời thứ nhất được ghi trong gia phả giấy còn giữ tại nhà thờ họ. Dạy chữ Nho trong làng Đông Ngạc, người làng gọi là "thầy Đức".','Phat','["Nhà giáo","Thầy đồ"]',NULL,NULL,NULL,NULL,3,10,1,1,'user-tung','2026-08-09 01:35:59','2026-08-09 01:35:59');
INSERT INTO "persons" ("id","clan_id","full_name","aliases","gender","generation","birth_date","death_date","birth_place","death_place","is_alive","bio","religion","occupation","photo_url","photo_ids","audio_ids","video_ids","death_anniv_lunar_day","death_anniv_lunar_month","is_verified","confidence_score","created_by","created_at","updated_at") VALUES('p-to_ba','clan-nguyen-dongngac','Trần Thị Lụa','[]','F',1,'1906-07-20','1985-04-15','Nhật Tảo, Đông Ngạc','Đông Ngạc, Từ Liêm, Hà Nội',0,'Cụ bà tần tảo buôn tơ lụa ở chợ Bưởi, nuôi năm người con qua thời kỳ khó khăn.','Phat','["Buôn tơ lụa"]',NULL,NULL,NULL,NULL,26,2,1,1,'user-tung','2026-08-09 01:35:59','2026-08-09 01:35:59');
INSERT INTO "persons" ("id","clan_id","full_name","aliases","gender","generation","birth_date","death_date","birth_place","death_place","is_alive","bio","religion","occupation","photo_url","photo_ids","audio_ids","video_ids","death_anniv_lunar_day","death_anniv_lunar_month","is_verified","confidence_score","created_by","created_at","updated_at") VALUES('p-ong','clan-nguyen-dongngac','Nguyễn Phúc Thịnh','[]','M',2,'1931-01-08','2009-09-27','Đông Ngạc, Từ Liêm, Hà Nội','Hà Nội',0,'Ông nội, đi bộ đội năm 1950, tham gia chiến dịch Điện Biên Phủ. Sau về làm cán bộ hợp tác xã ở quê. Người viết lại quyển gia phả tay năm 1992.','Phat','["Bộ đội","Cán bộ hợp tác xã"]',NULL,NULL,NULL,NULL,9,8,1,1,'user-tung','2026-08-09 01:35:59','2026-08-09 01:35:59');
INSERT INTO "persons" ("id","clan_id","full_name","aliases","gender","generation","birth_date","death_date","birth_place","death_place","is_alive","bio","religion","occupation","photo_url","photo_ids","audio_ids","video_ids","death_anniv_lunar_day","death_anniv_lunar_month","is_verified","confidence_score","created_by","created_at","updated_at") VALUES('p-ba_noi','clan-nguyen-dongngac','Lê Thị Sen','[]','F',2,'1934-05-12',NULL,'Chèm, Thụy Phương',NULL,1,'Bà nội, năm nay đã hơn 90 tuổi, vẫn nhớ rất rõ chuyện làng chuyện họ. Là người kể chính trong các buổi phỏng vấn AI.','Phat','["Nội trợ","Làm ruộng"]',NULL,NULL,NULL,NULL,NULL,NULL,1,1,'user-tung','2026-08-09 01:35:59','2026-08-09 01:35:59');
INSERT INTO "persons" ("id","clan_id","full_name","aliases","gender","generation","birth_date","death_date","birth_place","death_place","is_alive","bio","religion","occupation","photo_url","photo_ids","audio_ids","video_ids","death_anniv_lunar_day","death_anniv_lunar_month","is_verified","confidence_score","created_by","created_at","updated_at") VALUES('p-ba_co','clan-nguyen-dongngac','Nguyễn Thị Ba','[]','F',2,'1938-11-03',NULL,'Đông Ngạc, Từ Liêm, Hà Nội',NULL,1,'Cô Ba, em ông Thịnh, giáo viên tiểu học đã nghỉ hưu. Người kể chuyện có góc nhìn khác về đám cưới năm 1958.','Phat','["Giáo viên"]',NULL,NULL,NULL,NULL,NULL,NULL,1,1,'user-tung','2026-08-09 01:35:59','2026-08-09 01:35:59');
INSERT INTO "persons" ("id","clan_id","full_name","aliases","gender","generation","birth_date","death_date","birth_place","death_place","is_alive","bio","religion","occupation","photo_url","photo_ids","audio_ids","video_ids","death_anniv_lunar_day","death_anniv_lunar_month","is_verified","confidence_score","created_by","created_at","updated_at") VALUES('p-chu_tu','clan-nguyen-dongngac','Nguyễn Phúc Tứ','[]','M',2,'1941-02-19','1972-05-08','Đông Ngạc, Từ Liêm, Hà Nội','Quảng Trị',0,'Hy sinh tại Quảng Trị năm 1972, khi ấy 31 tuổi. Chưa có gia đình. Phần mộ được đưa về quê năm 1985.','Phat','["Bộ đội"]',NULL,NULL,NULL,NULL,25,3,1,1,'user-tung','2026-08-09 01:35:59','2026-08-09 01:35:59');
INSERT INTO "persons" ("id","clan_id","full_name","aliases","gender","generation","birth_date","death_date","birth_place","death_place","is_alive","bio","religion","occupation","photo_url","photo_ids","audio_ids","video_ids","death_anniv_lunar_day","death_anniv_lunar_month","is_verified","confidence_score","created_by","created_at","updated_at") VALUES('p-bo','clan-nguyen-dongngac','Nguyễn Văn Tùng','[]','M',3,'1962-06-15',NULL,'Hà Nội',NULL,1,'Trưởng họ hiện tại, người khởi xướng số hóa gia phả họ Nguyễn Đông Ngạc.','Phat','["Kỹ sư xây dựng"]',NULL,NULL,NULL,NULL,NULL,NULL,1,1,'user-tung','2026-08-09 01:35:59','2026-08-09 01:35:59');
INSERT INTO "persons" ("id","clan_id","full_name","aliases","gender","generation","birth_date","death_date","birth_place","death_place","is_alive","bio","religion","occupation","photo_url","photo_ids","audio_ids","video_ids","death_anniv_lunar_day","death_anniv_lunar_month","is_verified","confidence_score","created_by","created_at","updated_at") VALUES('p-me','clan-nguyen-dongngac','Phạm Thị Lan','[]','F',3,'1965-09-02',NULL,'Nam Định',NULL,1,'Con dâu họ Nguyễn, quê Nam Định.','Phat','["Dược sĩ"]',NULL,NULL,NULL,NULL,NULL,NULL,1,1,'user-tung','2026-08-09 01:35:59','2026-08-09 01:35:59');
INSERT INTO "persons" ("id","clan_id","full_name","aliases","gender","generation","birth_date","death_date","birth_place","death_place","is_alive","bio","religion","occupation","photo_url","photo_ids","audio_ids","video_ids","death_anniv_lunar_day","death_anniv_lunar_month","is_verified","confidence_score","created_by","created_at","updated_at") VALUES('p-co_hoa','clan-nguyen-dongngac','Nguyễn Thị Hòa','[]','F',3,'1966-04-28',NULL,'Hà Nội',NULL,1,'Em gái ông Tùng, hiện sống tại Sài Gòn.','Phat','["Kế toán"]',NULL,NULL,NULL,NULL,NULL,NULL,1,1,'user-tung','2026-08-09 01:35:59','2026-08-09 01:35:59');
INSERT INTO "persons" ("id","clan_id","full_name","aliases","gender","generation","birth_date","death_date","birth_place","death_place","is_alive","bio","religion","occupation","photo_url","photo_ids","audio_ids","video_ids","death_anniv_lunar_day","death_anniv_lunar_month","is_verified","confidence_score","created_by","created_at","updated_at") VALUES('p-chu_hai','clan-nguyen-dongngac','Nguyễn Văn Hải','[]','M',3,'1969-12-01','2021-01-30','Hà Nội','Hà Nội',0,'Em trai ông Tùng, mất năm 2021. Người có giọng hát chèo hay nhất họ.','Phat','["Thợ mộc"]',NULL,NULL,NULL,NULL,18,12,1,1,'user-tung','2026-08-09 01:35:59','2026-08-09 01:35:59');
INSERT INTO "persons" ("id","clan_id","full_name","aliases","gender","generation","birth_date","death_date","birth_place","death_place","is_alive","bio","religion","occupation","photo_url","photo_ids","audio_ids","video_ids","death_anniv_lunar_day","death_anniv_lunar_month","is_verified","confidence_score","created_by","created_at","updated_at") VALUES('p-minh','clan-nguyen-dongngac','Nguyễn Văn Minh','[]','M',4,'1990-08-21',NULL,'Hà Nội',NULL,1,'Cháu đích tôn, người dựng bản gia phả số này.','Phat','["Lập trình viên"]',NULL,NULL,NULL,NULL,NULL,NULL,1,1,'user-tung','2026-08-09 01:35:59','2026-08-09 01:35:59');
INSERT INTO "persons" ("id","clan_id","full_name","aliases","gender","generation","birth_date","death_date","birth_place","death_place","is_alive","bio","religion","occupation","photo_url","photo_ids","audio_ids","video_ids","death_anniv_lunar_day","death_anniv_lunar_month","is_verified","confidence_score","created_by","created_at","updated_at") VALUES('p-an','clan-nguyen-dongngac','Nguyễn Thị An','[]','F',4,'1993-03-14',NULL,'Hà Nội',NULL,1,'Em gái Minh, bác sĩ nội trú.','Phat','["Bác sĩ"]',NULL,NULL,NULL,NULL,NULL,NULL,1,1,'user-tung','2026-08-09 01:35:59','2026-08-09 01:35:59');
INSERT INTO "persons" ("id","clan_id","full_name","aliases","gender","generation","birth_date","death_date","birth_place","death_place","is_alive","bio","religion","occupation","photo_url","photo_ids","audio_ids","video_ids","death_anniv_lunar_day","death_anniv_lunar_month","is_verified","confidence_score","created_by","created_at","updated_at") VALUES('p-khanh','clan-nguyen-dongngac','Nguyễn Văn Khánh','[]','M',4,'1995-07-07',NULL,'TP. Hồ Chí Minh',NULL,1,'Con cô Hòa.','Phat','["Kiến trúc sư"]',NULL,NULL,NULL,NULL,NULL,NULL,1,1,'user-tung','2026-08-09 01:35:59','2026-08-09 01:35:59');
INSERT INTO "persons" ("id","clan_id","full_name","aliases","gender","generation","birth_date","death_date","birth_place","death_place","is_alive","bio","religion","occupation","photo_url","photo_ids","audio_ids","video_ids","death_anniv_lunar_day","death_anniv_lunar_month","is_verified","confidence_score","created_by","created_at","updated_at") VALUES('p-bao','clan-nguyen-dongngac','Nguyễn Phúc Bảo','[]','M',5,'2019-11-11',NULL,'Hà Nội',NULL,1,'Đời thứ năm, con của Minh. Chữ "Phúc" được đặt lại theo cụ tổ.','Phat','[]',NULL,NULL,NULL,NULL,NULL,NULL,1,1,'user-tung','2026-08-09 01:35:59','2026-08-09 01:35:59');
INSERT INTO "persons" ("id","clan_id","full_name","aliases","gender","generation","birth_date","death_date","birth_place","death_place","is_alive","bio","religion","occupation","photo_url","photo_ids","audio_ids","video_ids","death_anniv_lunar_day","death_anniv_lunar_month","is_verified","confidence_score","created_by","created_at","updated_at") VALUES('p-unverified','clan-nguyen-dongngac','Nguyễn Phúc Ngũ (?)','[]','M',2,'1936',NULL,'Đông Ngạc (?)',NULL,0,'Theo lời kể của bà Sen, cụ tổ còn một người con trai nữa đi làm ăn ở Hải Phòng rồi mất liên lạc trước 1954. CHƯA có giấy tờ nào xác minh. Giữ lại trong gia phả dưới dạng nhánh nét đứt, không suy diễn thêm.','Phat','[]',NULL,NULL,NULL,NULL,NULL,NULL,0,0.35,'user-tung','2026-08-09 01:35:59','2026-08-09 01:35:59');
CREATE TABLE relationships (
  id TEXT PRIMARY KEY,
  from_person_id TEXT NOT NULL,
  to_person_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('CHILD_OF','SPOUSE_OF','SIBLING_OF','ADOPTED_BY')),
  biological INTEGER NOT NULL DEFAULT 1,
  adopted INTEGER NOT NULL DEFAULT 0,
  married_at TEXT,
  divorced_at TEXT,
  marriage_order INTEGER DEFAULT 1,
  is_verified INTEGER NOT NULL DEFAULT 0,   
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT INTO "relationships" ("id","from_person_id","to_person_id","type","biological","adopted","married_at","divorced_at","marriage_order","is_verified","created_at") VALUES('rel-0001-giasuky','p-to','p-to_ba','SPOUSE_OF',1,0,'1928-02-10',NULL,1,1,'2026-08-09 01:35:59');
INSERT INTO "relationships" ("id","from_person_id","to_person_id","type","biological","adopted","married_at","divorced_at","marriage_order","is_verified","created_at") VALUES('rel-0002-giasuky','p-ong','p-to','CHILD_OF',1,0,NULL,NULL,1,1,'2026-08-09 01:35:59');
INSERT INTO "relationships" ("id","from_person_id","to_person_id","type","biological","adopted","married_at","divorced_at","marriage_order","is_verified","created_at") VALUES('rel-0003-giasuky','p-ong','p-to_ba','CHILD_OF',1,0,NULL,NULL,1,1,'2026-08-09 01:35:59');
INSERT INTO "relationships" ("id","from_person_id","to_person_id","type","biological","adopted","married_at","divorced_at","marriage_order","is_verified","created_at") VALUES('rel-0004-giasuky','p-ba_co','p-to','CHILD_OF',1,0,NULL,NULL,1,1,'2026-08-09 01:35:59');
INSERT INTO "relationships" ("id","from_person_id","to_person_id","type","biological","adopted","married_at","divorced_at","marriage_order","is_verified","created_at") VALUES('rel-0005-giasuky','p-ba_co','p-to_ba','CHILD_OF',1,0,NULL,NULL,1,1,'2026-08-09 01:35:59');
INSERT INTO "relationships" ("id","from_person_id","to_person_id","type","biological","adopted","married_at","divorced_at","marriage_order","is_verified","created_at") VALUES('rel-0006-giasuky','p-chu_tu','p-to','CHILD_OF',1,0,NULL,NULL,1,1,'2026-08-09 01:35:59');
INSERT INTO "relationships" ("id","from_person_id","to_person_id","type","biological","adopted","married_at","divorced_at","marriage_order","is_verified","created_at") VALUES('rel-0007-giasuky','p-chu_tu','p-to_ba','CHILD_OF',1,0,NULL,NULL,1,1,'2026-08-09 01:35:59');
INSERT INTO "relationships" ("id","from_person_id","to_person_id","type","biological","adopted","married_at","divorced_at","marriage_order","is_verified","created_at") VALUES('rel-0008-giasuky','p-unverified','p-to','CHILD_OF',1,0,NULL,NULL,1,0,'2026-08-09 01:35:59');
INSERT INTO "relationships" ("id","from_person_id","to_person_id","type","biological","adopted","married_at","divorced_at","marriage_order","is_verified","created_at") VALUES('rel-0009-giasuky','p-ong','p-ba_noi','SPOUSE_OF',1,0,'1958-04-20',NULL,1,1,'2026-08-09 01:35:59');
INSERT INTO "relationships" ("id","from_person_id","to_person_id","type","biological","adopted","married_at","divorced_at","marriage_order","is_verified","created_at") VALUES('rel-0010-giasuky','p-bo','p-ong','CHILD_OF',1,0,NULL,NULL,1,1,'2026-08-09 01:35:59');
INSERT INTO "relationships" ("id","from_person_id","to_person_id","type","biological","adopted","married_at","divorced_at","marriage_order","is_verified","created_at") VALUES('rel-0011-giasuky','p-bo','p-ba_noi','CHILD_OF',1,0,NULL,NULL,1,1,'2026-08-09 01:35:59');
INSERT INTO "relationships" ("id","from_person_id","to_person_id","type","biological","adopted","married_at","divorced_at","marriage_order","is_verified","created_at") VALUES('rel-0012-giasuky','p-co_hoa','p-ong','CHILD_OF',1,0,NULL,NULL,1,1,'2026-08-09 01:35:59');
INSERT INTO "relationships" ("id","from_person_id","to_person_id","type","biological","adopted","married_at","divorced_at","marriage_order","is_verified","created_at") VALUES('rel-0013-giasuky','p-co_hoa','p-ba_noi','CHILD_OF',1,0,NULL,NULL,1,1,'2026-08-09 01:35:59');
INSERT INTO "relationships" ("id","from_person_id","to_person_id","type","biological","adopted","married_at","divorced_at","marriage_order","is_verified","created_at") VALUES('rel-0014-giasuky','p-chu_hai','p-ong','CHILD_OF',1,0,NULL,NULL,1,1,'2026-08-09 01:35:59');
INSERT INTO "relationships" ("id","from_person_id","to_person_id","type","biological","adopted","married_at","divorced_at","marriage_order","is_verified","created_at") VALUES('rel-0015-giasuky','p-chu_hai','p-ba_noi','CHILD_OF',1,0,NULL,NULL,1,1,'2026-08-09 01:35:59');
INSERT INTO "relationships" ("id","from_person_id","to_person_id","type","biological","adopted","married_at","divorced_at","marriage_order","is_verified","created_at") VALUES('rel-0016-giasuky','p-bo','p-me','SPOUSE_OF',1,0,'1988-12-04',NULL,1,1,'2026-08-09 01:35:59');
INSERT INTO "relationships" ("id","from_person_id","to_person_id","type","biological","adopted","married_at","divorced_at","marriage_order","is_verified","created_at") VALUES('rel-0017-giasuky','p-minh','p-bo','CHILD_OF',1,0,NULL,NULL,1,1,'2026-08-09 01:35:59');
INSERT INTO "relationships" ("id","from_person_id","to_person_id","type","biological","adopted","married_at","divorced_at","marriage_order","is_verified","created_at") VALUES('rel-0018-giasuky','p-minh','p-me','CHILD_OF',1,0,NULL,NULL,1,1,'2026-08-09 01:35:59');
INSERT INTO "relationships" ("id","from_person_id","to_person_id","type","biological","adopted","married_at","divorced_at","marriage_order","is_verified","created_at") VALUES('rel-0019-giasuky','p-an','p-bo','CHILD_OF',1,0,NULL,NULL,1,1,'2026-08-09 01:35:59');
INSERT INTO "relationships" ("id","from_person_id","to_person_id","type","biological","adopted","married_at","divorced_at","marriage_order","is_verified","created_at") VALUES('rel-0020-giasuky','p-an','p-me','CHILD_OF',1,0,NULL,NULL,1,1,'2026-08-09 01:35:59');
INSERT INTO "relationships" ("id","from_person_id","to_person_id","type","biological","adopted","married_at","divorced_at","marriage_order","is_verified","created_at") VALUES('rel-0021-giasuky','p-khanh','p-co_hoa','CHILD_OF',1,0,NULL,NULL,1,1,'2026-08-09 01:35:59');
INSERT INTO "relationships" ("id","from_person_id","to_person_id","type","biological","adopted","married_at","divorced_at","marriage_order","is_verified","created_at") VALUES('rel-0022-giasuky','p-bao','p-minh','CHILD_OF',1,0,NULL,NULL,1,1,'2026-08-09 01:35:59');
INSERT INTO "relationships" ("id","from_person_id","to_person_id","type","biological","adopted","married_at","divorced_at","marriage_order","is_verified","created_at") VALUES('rel-0023-giasuky','p-ong','p-ba_co','SIBLING_OF',1,0,NULL,NULL,1,1,'2026-08-09 01:35:59');
INSERT INTO "relationships" ("id","from_person_id","to_person_id","type","biological","adopted","married_at","divorced_at","marriage_order","is_verified","created_at") VALUES('rel-0024-giasuky','p-ong','p-chu_tu','SIBLING_OF',1,0,NULL,NULL,1,1,'2026-08-09 01:35:59');
INSERT INTO "relationships" ("id","from_person_id","to_person_id","type","biological","adopted","married_at","divorced_at","marriage_order","is_verified","created_at") VALUES('rel-0025-giasuky','p-bo','p-co_hoa','SIBLING_OF',1,0,NULL,NULL,1,1,'2026-08-09 01:35:59');
INSERT INTO "relationships" ("id","from_person_id","to_person_id","type","biological","adopted","married_at","divorced_at","marriage_order","is_verified","created_at") VALUES('rel-0026-giasuky','p-bo','p-chu_hai','SIBLING_OF',1,0,NULL,NULL,1,1,'2026-08-09 01:35:59');
INSERT INTO "relationships" ("id","from_person_id","to_person_id","type","biological","adopted","married_at","divorced_at","marriage_order","is_verified","created_at") VALUES('rel-0027-giasuky','p-minh','p-an','SIBLING_OF',1,0,NULL,NULL,1,1,'2026-08-09 01:35:59');
CREATE TABLE locations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address_vn TEXT,
  lat REAL,
  lng REAL,
  historical_names TEXT               
);
INSERT INTO "locations" ("id","name","address_vn","lat","lng","historical_names") VALUES('loc-dongngac','Làng Đông Ngạc','Phường Đông Ngạc, quận Bắc Từ Liêm, Hà Nội',21.0894,105.7776,'["Kẻ Vẽ","xã Đông Ngạc, huyện Từ Liêm"]');
INSERT INTO "locations" ("id","name","address_vn","lat","lng","historical_names") VALUES('loc-dienbien','Điện Biên Phủ','Thành phố Điện Biên Phủ, tỉnh Điện Biên',21.3833,103.0167,'["Mường Thanh"]');
INSERT INTO "locations" ("id","name","address_vn","lat","lng","historical_names") VALUES('loc-quangtri','Thành cổ Quảng Trị','Thị xã Quảng Trị, tỉnh Quảng Trị',16.75,107.1833,'[]');
INSERT INTO "locations" ("id","name","address_vn","lat","lng","historical_names") VALUES('loc-hanoi','Hà Nội','Thành phố Hà Nội',21.0278,105.8342,'["Thăng Long","Đông Đô"]');
CREATE TABLE events (
  id TEXT PRIMARY KEY,
  clan_id TEXT,
  title TEXT NOT NULL,
  event_date TEXT,
  event_type TEXT CHECK (event_type IN ('WEDDING','FUNERAL','BIRTH','DEATH','WAR','MIGRATION','OTHER')),
  location_id TEXT,
  location TEXT,
  significance TEXT DEFAULT 'FAMILY' CHECK (significance IN ('FAMILY','CLAN','HISTORICAL')),
  cover_photo_url TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT INTO "events" ("id","clan_id","title","event_date","event_type","location_id","location","significance","cover_photo_url","created_at") VALUES('ev-cuoi-1958','clan-nguyen-dongngac','Đám cưới ông Thịnh và bà Sen','1958-04-20','WEDDING','loc-dongngac','Làng Đông Ngạc, Từ Liêm, Hà Nội','FAMILY',NULL,'2025-10-13 01:35:59');
INSERT INTO "events" ("id","clan_id","title","event_date","event_type","location_id","location","significance","cover_photo_url","created_at") VALUES('ev-dienbien-1954','clan-nguyen-dongngac','Ông Thịnh trong chiến dịch Điện Biên Phủ','1954-05-07','WAR','loc-dienbien','Điện Biên Phủ','HISTORICAL',NULL,'2025-10-23 01:35:59');
INSERT INTO "events" ("id","clan_id","title","event_date","event_type","location_id","location","significance","cover_photo_url","created_at") VALUES('ev-quangtri-1972','clan-nguyen-dongngac','Chú Tứ hy sinh tại Quảng Trị','1972-05-08','DEATH','loc-quangtri','Thành cổ Quảng Trị','CLAN',NULL,'2025-11-02 01:35:59');
INSERT INTO "events" ("id","clan_id","title","event_date","event_type","location_id","location","significance","cover_photo_url","created_at") VALUES('ev-ditan-1972','clan-nguyen-dongngac','Gia đình sơ tán khỏi Hà Nội năm 1972','1972-12-20','MIGRATION','loc-hanoi','Hà Nội — Hà Bắc','FAMILY',NULL,'2025-11-07 01:35:59');
INSERT INTO "events" ("id","clan_id","title","event_date","event_type","location_id","location","significance","cover_photo_url","created_at") VALUES('ev-tang-2009','clan-nguyen-dongngac','Tang lễ ông Nguyễn Phúc Thịnh','2009-09-27','FUNERAL','loc-dongngac','Nhà thờ họ, Đông Ngạc','CLAN',NULL,'2025-11-12 01:35:59');
INSERT INTO "events" ("id","clan_id","title","event_date","event_type","location_id","location","significance","cover_photo_url","created_at") VALUES('ev-tang-2021','clan-nguyen-dongngac','Tang lễ chú Nguyễn Văn Hải','2021-01-30','FUNERAL','loc-hanoi','Hà Nội','FAMILY',NULL,'2025-11-22 01:35:59');
CREATE TABLE event_persons (
  event_id TEXT NOT NULL,
  person_id TEXT NOT NULL,
  PRIMARY KEY (event_id, person_id)
);
INSERT INTO "event_persons" ("event_id","person_id") VALUES('ev-cuoi-1958','p-ong');
INSERT INTO "event_persons" ("event_id","person_id") VALUES('ev-cuoi-1958','p-ba_noi');
INSERT INTO "event_persons" ("event_id","person_id") VALUES('ev-cuoi-1958','p-to');
INSERT INTO "event_persons" ("event_id","person_id") VALUES('ev-cuoi-1958','p-to_ba');
INSERT INTO "event_persons" ("event_id","person_id") VALUES('ev-cuoi-1958','p-ba_co');
INSERT INTO "event_persons" ("event_id","person_id") VALUES('ev-dienbien-1954','p-ong');
INSERT INTO "event_persons" ("event_id","person_id") VALUES('ev-quangtri-1972','p-chu_tu');
INSERT INTO "event_persons" ("event_id","person_id") VALUES('ev-quangtri-1972','p-to');
INSERT INTO "event_persons" ("event_id","person_id") VALUES('ev-quangtri-1972','p-to_ba');
INSERT INTO "event_persons" ("event_id","person_id") VALUES('ev-quangtri-1972','p-ong');
INSERT INTO "event_persons" ("event_id","person_id") VALUES('ev-ditan-1972','p-ong');
INSERT INTO "event_persons" ("event_id","person_id") VALUES('ev-ditan-1972','p-ba_noi');
INSERT INTO "event_persons" ("event_id","person_id") VALUES('ev-ditan-1972','p-bo');
INSERT INTO "event_persons" ("event_id","person_id") VALUES('ev-ditan-1972','p-ba_co');
INSERT INTO "event_persons" ("event_id","person_id") VALUES('ev-tang-2009','p-ong');
INSERT INTO "event_persons" ("event_id","person_id") VALUES('ev-tang-2009','p-ba_noi');
INSERT INTO "event_persons" ("event_id","person_id") VALUES('ev-tang-2009','p-bo');
INSERT INTO "event_persons" ("event_id","person_id") VALUES('ev-tang-2009','p-co_hoa');
INSERT INTO "event_persons" ("event_id","person_id") VALUES('ev-tang-2009','p-chu_hai');
INSERT INTO "event_persons" ("event_id","person_id") VALUES('ev-tang-2009','p-minh');
INSERT INTO "event_persons" ("event_id","person_id") VALUES('ev-tang-2021','p-chu_hai');
INSERT INTO "event_persons" ("event_id","person_id") VALUES('ev-tang-2021','p-bo');
INSERT INTO "event_persons" ("event_id","person_id") VALUES('ev-tang-2021','p-ba_noi');
INSERT INTO "event_persons" ("event_id","person_id") VALUES('ev-tang-2021','p-minh');
CREATE TABLE memories (
  id TEXT PRIMARY KEY,
  clan_id TEXT,
  type TEXT NOT NULL DEFAULT 'TEXT' CHECK (type IN ('TEXT','AUDIO','VIDEO','PHOTO','MIXED')),
  content TEXT NOT NULL,              
  content_no_tone TEXT,               
  media_asset_ids TEXT,               
  media_url TEXT,
  language TEXT DEFAULT 'vi',
  perspective TEXT,                   
  told_by_person_id TEXT,             
  subject_person_id TEXT,             
  event_id TEXT,                      
  location_id TEXT,
  location TEXT,
  event_date TEXT,
  source TEXT DEFAULT 'MANUAL' CHECK (source IN ('MANUAL','AI_INTERVIEW','IMPORT','TIME_CAPSULE')),
  interview_session_id TEXT,
  
  status TEXT NOT NULL DEFAULT 'APPROVED' CHECK (status IN ('PENDING_REVIEW','APPROVED','REJECTED')),
  visibility TEXT NOT NULL DEFAULT 'CLAN' CHECK (visibility IN ('PRIVATE','FAMILY','CLAN','PUBLIC')),
  created_by TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT INTO "memories" ("id","clan_id","type","content","content_no_tone","media_asset_ids","media_url","language","perspective","told_by_person_id","subject_person_id","event_id","location_id","location","event_date","source","interview_session_id","status","visibility","created_by","created_at") VALUES('mem-01','clan-nguyen-dongngac','TEXT','Hôm cưới tôi trời mưa rất to. Nước ngập cả sân, phải bắc mấy tấm ván cho khách đi vào. Tôi nhớ như in vì tà áo dài lấm bùn hết, mẹ tôi xót quá cứ lấy khăn lau mãi. Cỗ hôm ấy làm hai mươi bàn, ăn từ trưa đến chiều mới hết.','hom cuoi toi troi mua rat to. nuoc ngap ca san, phai bac may tam van cho khach di vao. toi nho nhu in vi ta ao dai lam bun het, me toi xot qua cu lay khan lau mai. co hom ay lam hai muoi ban, an tu trua den chieu moi het.',NULL,NULL,'vi','Bà Lê Thị Sen kể — cô dâu','p-ba_noi','p-ba_noi','ev-cuoi-1958',NULL,'Làng Đông Ngạc','1958-04-20','AI_INTERVIEW',NULL,'APPROVED','CLAN','user-tung','2026-01-21 01:35:59');
INSERT INTO "memories" ("id","clan_id","type","content","content_no_tone","media_asset_ids","media_url","language","perspective","told_by_person_id","subject_person_id","event_id","location_id","location","event_date","source","interview_session_id","status","visibility","created_by","created_at") VALUES('mem-02','clan-nguyen-dongngac','TEXT','Cái đám cưới của anh Thịnh thì trời nắng chứ mưa gì đâu. Tôi còn đội nón đi theo đoàn rước dâu, nắng chang chang, mồ hôi ướt hết lưng áo. Cỗ thì tôi nhớ chỉ mười lăm bàn thôi, vì hồi ấy nhà mình còn nghèo, làm hai mươi bàn sao nổi.','cai dam cuoi cua anh thinh thi troi nang chu mua gi dau. toi con doi non di theo doan ruoc dau, nang chang chang, mo hoi uot het lung ao. co thi toi nho chi muoi lam ban thoi, vi hoi ay nha minh con ngheo, lam hai muoi ban sao noi.',NULL,NULL,'vi','Cô Nguyễn Thị Ba kể — em chồng, khi ấy 20 tuổi','p-ba_co','p-ong','ev-cuoi-1958',NULL,'Làng Đông Ngạc','1958-04-20','AI_INTERVIEW',NULL,'APPROVED','CLAN','user-tung','2026-01-24 01:35:59');
INSERT INTO "memories" ("id","clan_id","type","content","content_no_tone","media_asset_ids","media_url","language","perspective","told_by_person_id","subject_person_id","event_id","location_id","location","event_date","source","interview_session_id","status","visibility","created_by","created_at") VALUES('mem-03','clan-nguyen-dongngac','TEXT','Bố tôi kể lại rằng trong ảnh cưới của ông bà, nền sân có vệt nước và mấy người khách xắn quần. Tấm ảnh ấy giờ vẫn còn trong hộp thiếc ở nhà thờ họ. Tôi không dám khẳng định trời mưa hay nắng, chỉ ghi lại đúng những gì tấm ảnh cho thấy.','bo toi ke lai rang trong anh cuoi cua ong ba, nen san co vet nuoc va may nguoi khach xan quan. tam anh ay gio van con trong hop thiec o nha tho ho. toi khong dam khang dinh troi mua hay nang, chi ghi lai dung nhung gi tam anh cho thay.',NULL,NULL,'vi','Ông Nguyễn Văn Tùng kể — con trai, dựa trên ảnh cũ','p-bo','p-ong','ev-cuoi-1958',NULL,'Nhà thờ họ Nguyễn','1958-04-20','MANUAL',NULL,'APPROVED','CLAN','user-tung','2026-01-27 01:35:59');
INSERT INTO "memories" ("id","clan_id","type","content","content_no_tone","media_asset_ids","media_url","language","perspective","told_by_person_id","subject_person_id","event_id","location_id","location","event_date","source","interview_session_id","status","visibility","created_by","created_at") VALUES('mem-04','clan-nguyen-dongngac','TEXT','Tôi đi bộ đội năm hai mươi tuổi. Lên Điện Biên, ba tháng ròng đào hào, đêm nào cũng nghe pháo. Cái ngày bảy tháng năm, khi tin thắng trận truyền xuống, cả hầm im lặng một lúc rồi mới có người khóc. Không ai reo hò như trong phim đâu. Chúng tôi kiệt sức quá rồi. Sống ở đời, cái gì mình đã hứa với đồng đội thì phải giữ, dù có phải đi bộ ba trăm cây số.','toi di bo doi nam hai muoi tuoi. len dien bien, ba thang rong dao hao, dem nao cung nghe phao. cai ngay bay thang nam, khi tin thang tran truyen xuong, ca ham im lang mot luc roi moi co nguoi khoc. khong ai reo ho nhu trong phim dau. chung toi kiet suc qua roi. song o doi, cai gi minh da hua voi dong doi thi phai giu, du co phai di bo ba tram cay so.',NULL,NULL,'vi','Ông Nguyễn Phúc Thịnh kể năm 2005, ghi âm bằng máy cassette','p-ong','p-ong','ev-dienbien-1954',NULL,'Điện Biên Phủ','1954-05-07','IMPORT',NULL,'APPROVED','CLAN','user-tung','2026-01-30 01:35:59');
INSERT INTO "memories" ("id","clan_id","type","content","content_no_tone","media_asset_ids","media_url","language","perspective","told_by_person_id","subject_person_id","event_id","location_id","location","event_date","source","interview_session_id","status","visibility","created_by","created_at") VALUES('mem-05','clan-nguyen-dongngac','TEXT','Nhà nhận được giấy báo tử của chú Tứ vào khoảng tháng bảy năm bảy hai. Ông Thịnh đọc xong không nói gì, ra sân ngồi đến khuya. Mẹ chồng tôi thì ngất đi, phải cạo gió mãi mới tỉnh. Từ hôm ấy trong nhà không ai bật đèn sáng nữa, cứ để đèn dầu tù mù suốt mấy tháng.','nha nhan duoc giay bao tu cua chu tu vao khoang thang bay nam bay hai. ong thinh doc xong khong noi gi, ra san ngoi den khuya. me chong toi thi ngat di, phai cao gio mai moi tinh. tu hom ay trong nha khong ai bat den sang nua, cu de den dau tu mu suot may thang.',NULL,NULL,'vi','Bà Sen kể — chị dâu','p-ba_noi','p-chu_tu','ev-quangtri-1972',NULL,'Đông Ngạc','1972-07-15','AI_INTERVIEW',NULL,'APPROVED','CLAN','user-tung','2026-02-02 01:35:59');
INSERT INTO "memories" ("id","clan_id","type","content","content_no_tone","media_asset_ids","media_url","language","perspective","told_by_person_id","subject_person_id","event_id","location_id","location","event_date","source","interview_session_id","status","visibility","created_by","created_at") VALUES('mem-06','clan-nguyen-dongngac','TEXT','Giấy báo tử của anh Tứ về nhà đúng dịp giáp Tết năm bảy hai sang bảy ba, tôi nhớ vì đang gói bánh chưng thì ông trưởng thôn sang. Cả nhà bỏ nồi bánh đấy, không ai ăn Tết năm ấy.','giay bao tu cua anh tu ve nha dung dip giap tet nam bay hai sang bay ba, toi nho vi dang goi banh chung thi ong truong thon sang. ca nha bo noi banh day, khong ai an tet nam ay.',NULL,NULL,'vi','Cô Ba kể — em gái','p-ba_co','p-chu_tu','ev-quangtri-1972',NULL,'Đông Ngạc','1973-01-20','AI_INTERVIEW',NULL,'APPROVED','CLAN','user-tung','2026-02-05 01:35:59');
INSERT INTO "memories" ("id","clan_id","type","content","content_no_tone","media_asset_ids","media_url","language","perspective","told_by_person_id","subject_person_id","event_id","location_id","location","event_date","source","interview_session_id","status","visibility","created_by","created_at") VALUES('mem-07','clan-nguyen-dongngac','TEXT','Tháng chạp năm bảy hai, máy bay B52 ném bom Hà Nội. Ông Thịnh bắt cả nhà sơ tán về Hà Bắc, mỗi người chỉ được mang một cái tay nải. Tôi mang theo quyển gia phả của cụ Đức, gói trong ba lớp vải mưa. Ông ấy bảo: nhà mất thì dựng lại được, gia phả mất là mất gốc.','thang chap nam bay hai, may bay b52 nem bom ha noi. ong thinh bat ca nha so tan ve ha bac, moi nguoi chi duoc mang mot cai tay nai. toi mang theo quyen gia pha cua cu duc, goi trong ba lop vai mua. ong ay bao: nha mat thi dung lai duoc, gia pha mat la mat goc.',NULL,NULL,'vi','Bà Sen kể','p-ba_noi','p-ong','ev-ditan-1972',NULL,'Hà Nội — Hà Bắc','1972-12-20','AI_INTERVIEW',NULL,'APPROVED','CLAN','user-tung','2026-02-08 01:35:59');
INSERT INTO "memories" ("id","clan_id","type","content","content_no_tone","media_asset_ids","media_url","language","perspective","told_by_person_id","subject_person_id","event_id","location_id","location","event_date","source","interview_session_id","status","visibility","created_by","created_at") VALUES('mem-08','clan-nguyen-dongngac','TEXT','Ông tôi vẫn dạy con cháu rằng: Nhà mình không có ruộng nhiều, chỉ có cái chữ là của cải để lại được. Con cháu đời nào cũng phải học, học không phải để làm quan mà để không ai lừa được mình.','ong toi van day con chau rang: nha minh khong co ruong nhieu, chi co cai chu la cua cai de lai duoc. con chau doi nao cung phai hoc, hoc khong phai de lam quan ma de khong ai lua duoc minh.',NULL,NULL,'vi','Ông Tùng nhớ lại lời ông nội','p-bo','p-ong',NULL,NULL,'Đông Ngạc','1995-06-01','MANUAL',NULL,'APPROVED','CLAN','user-tung','2026-02-11 01:35:59');
INSERT INTO "memories" ("id","clan_id","type","content","content_no_tone","media_asset_ids","media_url","language","perspective","told_by_person_id","subject_person_id","event_id","location_id","location","event_date","source","interview_session_id","status","visibility","created_by","created_at") VALUES('mem-09','clan-nguyen-dongngac','TEXT','Cụ Đức có câu để lại trong gia phả tay, ông Thịnh chép lại nguyên văn: Thờ cha kính mẹ là gốc của mọi điều lành, con cháu nào bỏ gốc thì cành có tốt cũng chẳng bền.','cu duc co cau de lai trong gia pha tay, ong thinh chep lai nguyen van: tho cha kinh me la goc cua moi dieu lanh, con chau nao bo goc thi canh co tot cung chang ben.',NULL,NULL,'vi','Ông Thịnh chép từ gia phả tay của cụ Đức','p-ong','p-to',NULL,NULL,'Nhà thờ họ Nguyễn','1992-03-10','IMPORT',NULL,'APPROVED','CLAN','user-tung','2026-02-14 01:35:59');
INSERT INTO "memories" ("id","clan_id","type","content","content_no_tone","media_asset_ids","media_url","language","perspective","told_by_person_id","subject_person_id","event_id","location_id","location","event_date","source","interview_session_id","status","visibility","created_by","created_at") VALUES('mem-10','clan-nguyen-dongngac','TEXT','Bà tôi bảo: Cưới xin thì đừng chạy theo mâm cao cỗ đầy, lấy nhau là lấy cái nết chứ không lấy cái nhà. Bà cứ nhắc câu ấy mỗi lần trong họ có đứa sắp cưới.','ba toi bao: cuoi xin thi dung chay theo mam cao co day, lay nhau la lay cai net chu khong lay cai nha. ba cu nhac cau ay moi lan trong ho co dua sap cuoi.',NULL,NULL,'vi','Ông Tùng kể lời mẹ','p-bo','p-ba_noi',NULL,NULL,'Hà Nội','2015-08-20','MANUAL',NULL,'APPROVED','CLAN','user-tung','2026-02-17 01:35:59');
INSERT INTO "memories" ("id","clan_id","type","content","content_no_tone","media_asset_ids","media_url","language","perspective","told_by_person_id","subject_person_id","event_id","location_id","location","event_date","source","interview_session_id","status","visibility","created_by","created_at") VALUES('mem-11','clan-nguyen-dongngac','TEXT','Chú Hải làm mộc, có lần bảo tôi: Làm cái gì cũng phải làm cho tử tế, đồ mình đóng người ta dùng ba chục năm, mình gian một ly là họ khổ ba chục năm.','chu hai lam moc, co lan bao toi: lam cai gi cung phai lam cho tu te, do minh dong nguoi ta dung ba chuc nam, minh gian mot ly la ho kho ba chuc nam.',NULL,NULL,'vi','Minh kể lời chú Hải','p-minh','p-chu_hai',NULL,NULL,'Hà Nội','2019-05-15','MANUAL',NULL,'APPROVED','CLAN','user-tung','2026-02-20 01:35:59');
INSERT INTO "memories" ("id","clan_id","type","content","content_no_tone","media_asset_ids","media_url","language","perspective","told_by_person_id","subject_person_id","event_id","location_id","location","event_date","source","interview_session_id","status","visibility","created_by","created_at") VALUES('mem-12','clan-nguyen-dongngac','TEXT','Ông Thịnh dặn trước khi mất: Trong họ có người khá người kém, người khá phải đỡ người kém, đừng để ai trong họ phải ngửa tay xin người ngoài.','ong thinh dan truoc khi mat: trong ho co nguoi kha nguoi kem, nguoi kha phai do nguoi kem, dung de ai trong ho phai ngua tay xin nguoi ngoai.',NULL,NULL,'vi','Ông Tùng kể lời cha trước khi mất','p-bo','p-ong','ev-tang-2009',NULL,'Hà Nội','2009-09-20','MANUAL',NULL,'APPROVED','CLAN','user-tung','2026-02-23 01:35:59');
INSERT INTO "memories" ("id","clan_id","type","content","content_no_tone","media_asset_ids","media_url","language","perspective","told_by_person_id","subject_person_id","event_id","location_id","location","event_date","source","interview_session_id","status","visibility","created_by","created_at") VALUES('mem-13','clan-nguyen-dongngac','TEXT','Đám tang ông Thịnh, người làng đến chật cả sân nhà thờ họ. Có mấy cụ đồng đội Điện Biên từ Thái Nguyên xuống, đứng chào theo kiểu nhà binh trước bàn thờ. Tôi nhớ mãi hình ảnh ấy.','dam tang ong thinh, nguoi lang den chat ca san nha tho ho. co may cu dong doi dien bien tu thai nguyen xuong, dung chao theo kieu nha binh truoc ban tho. toi nho mai hinh anh ay.',NULL,NULL,'vi','Ông Tùng kể','p-bo','p-ong','ev-tang-2009',NULL,'Nhà thờ họ Nguyễn','2009-09-27','MANUAL',NULL,'APPROVED','CLAN','user-tung','2026-02-26 01:35:59');
INSERT INTO "memories" ("id","clan_id","type","content","content_no_tone","media_asset_ids","media_url","language","perspective","told_by_person_id","subject_person_id","event_id","location_id","location","event_date","source","interview_session_id","status","visibility","created_by","created_at") VALUES('mem-14','clan-nguyen-dongngac','TEXT','Chú Hải hát chèo hay nhất họ. Mỗi lần giỗ ông, chú lại hát bài Đào liễu, bà nội tôi vừa nghe vừa khóc. Từ năm hai mươi mốt chú đi rồi, giỗ nào cũng thiếu tiếng hát ấy.','chu hai hat cheo hay nhat ho. moi lan gio ong, chu lai hat bai dao lieu, ba noi toi vua nghe vua khoc. tu nam hai muoi mot chu di roi, gio nao cung thieu tieng hat ay.',NULL,NULL,'vi','Minh kể về chú','p-minh','p-chu_hai','ev-tang-2021',NULL,'Hà Nội','2021-02-05','MANUAL',NULL,'APPROVED','CLAN','user-tung','2026-03-01 01:35:59');
INSERT INTO "memories" ("id","clan_id","type","content","content_no_tone","media_asset_ids","media_url","language","perspective","told_by_person_id","subject_person_id","event_id","location_id","location","event_date","source","interview_session_id","status","visibility","created_by","created_at") VALUES('mem-15','clan-nguyen-dongngac','TEXT','Bà nội kể hôm phỏng vấn rằng cụ tổ Đức từng dạy chữ cho cả con gái trong làng, việc rất lạ ở thời ấy. Đoạn này bà kể chưa rõ tên người, cần hỏi lại cô Ba trước khi đưa vào gia phả.','ba noi ke hom phong van rang cu to duc tung day chu cho ca con gai trong lang, viec rat la o thoi ay. doan nay ba ke chua ro ten nguoi, can hoi lai co ba truoc khi dua vao gia pha.',NULL,NULL,'vi','Bà Sen kể trong buổi phỏng vấn AI — chờ trưởng họ duyệt','p-ba_noi','p-to',NULL,NULL,'Đông Ngạc','1930','AI_INTERVIEW',NULL,'PENDING_REVIEW','CLAN','user-tung','2026-03-04 01:35:59');
INSERT INTO "memories" ("id","clan_id","type","content","content_no_tone","media_asset_ids","media_url","language","perspective","told_by_person_id","subject_person_id","event_id","location_id","location","event_date","source","interview_session_id","status","visibility","created_by","created_at") VALUES('e50f1fb0-de39-4643-a818-5cb30af890ef','clan-nguyen-dongngac','TEXT','test-smoke','test-smoke',NULL,NULL,'vi',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'MANUAL',NULL,'APPROVED','CLAN','user-tung','2026-08-09 01:37:41');
INSERT INTO "memories" ("id","clan_id","type","content","content_no_tone","media_asset_ids","media_url","language","perspective","told_by_person_id","subject_person_id","event_id","location_id","location","event_date","source","interview_session_id","status","visibility","created_by","created_at") VALUES('2cb965cc-c6ba-44bb-855f-5476015ac164','clan-nguyen-dongngac','TEXT','x','x',NULL,NULL,'vi',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'MANUAL',NULL,'APPROVED','CLAN','user-tung','2026-08-09 01:38:29');
INSERT INTO "memories" ("id","clan_id","type","content","content_no_tone","media_asset_ids","media_url","language","perspective","told_by_person_id","subject_person_id","event_id","location_id","location","event_date","source","interview_session_id","status","visibility","created_by","created_at") VALUES('c5a06520-b022-4e06-b5e7-17f98b500869','clan-nguyen-dongngac','TEXT','x','x',NULL,NULL,'vi',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'MANUAL',NULL,'APPROVED','CLAN','user-tung','2026-08-09 01:38:55');
INSERT INTO "memories" ("id","clan_id","type","content","content_no_tone","media_asset_ids","media_url","language","perspective","told_by_person_id","subject_person_id","event_id","location_id","location","event_date","source","interview_session_id","status","visibility","created_by","created_at") VALUES('fe199595-2964-497d-ace8-91092e9d8bcb','clan-nguyen-dongngac','TEXT','x','x',NULL,NULL,'vi',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'MANUAL',NULL,'APPROVED','CLAN','user-tung','2026-08-09 01:38:55');
CREATE TABLE memory_persons (   
  memory_id TEXT NOT NULL,
  person_id TEXT NOT NULL,
  PRIMARY KEY (memory_id, person_id)
);
INSERT INTO "memory_persons" ("memory_id","person_id") VALUES('mem-01','p-ong');
INSERT INTO "memory_persons" ("memory_id","person_id") VALUES('mem-01','p-ba_noi');
INSERT INTO "memory_persons" ("memory_id","person_id") VALUES('mem-01','p-to');
INSERT INTO "memory_persons" ("memory_id","person_id") VALUES('mem-01','p-to_ba');
INSERT INTO "memory_persons" ("memory_id","person_id") VALUES('mem-02','p-ong');
INSERT INTO "memory_persons" ("memory_id","person_id") VALUES('mem-02','p-ba_noi');
INSERT INTO "memory_persons" ("memory_id","person_id") VALUES('mem-02','p-ba_co');
INSERT INTO "memory_persons" ("memory_id","person_id") VALUES('mem-03','p-ong');
INSERT INTO "memory_persons" ("memory_id","person_id") VALUES('mem-03','p-ba_noi');
INSERT INTO "memory_persons" ("memory_id","person_id") VALUES('mem-04','p-ong');
INSERT INTO "memory_persons" ("memory_id","person_id") VALUES('mem-05','p-chu_tu');
INSERT INTO "memory_persons" ("memory_id","person_id") VALUES('mem-05','p-ong');
INSERT INTO "memory_persons" ("memory_id","person_id") VALUES('mem-05','p-to_ba');
INSERT INTO "memory_persons" ("memory_id","person_id") VALUES('mem-06','p-chu_tu');
INSERT INTO "memory_persons" ("memory_id","person_id") VALUES('mem-06','p-ba_co');
INSERT INTO "memory_persons" ("memory_id","person_id") VALUES('mem-07','p-ong');
INSERT INTO "memory_persons" ("memory_id","person_id") VALUES('mem-07','p-ba_noi');
INSERT INTO "memory_persons" ("memory_id","person_id") VALUES('mem-07','p-bo');
INSERT INTO "memory_persons" ("memory_id","person_id") VALUES('mem-08','p-ong');
INSERT INTO "memory_persons" ("memory_id","person_id") VALUES('mem-08','p-bo');
INSERT INTO "memory_persons" ("memory_id","person_id") VALUES('mem-09','p-to');
INSERT INTO "memory_persons" ("memory_id","person_id") VALUES('mem-09','p-ong');
INSERT INTO "memory_persons" ("memory_id","person_id") VALUES('mem-10','p-ba_noi');
INSERT INTO "memory_persons" ("memory_id","person_id") VALUES('mem-10','p-bo');
INSERT INTO "memory_persons" ("memory_id","person_id") VALUES('mem-11','p-chu_hai');
INSERT INTO "memory_persons" ("memory_id","person_id") VALUES('mem-11','p-minh');
INSERT INTO "memory_persons" ("memory_id","person_id") VALUES('mem-12','p-ong');
INSERT INTO "memory_persons" ("memory_id","person_id") VALUES('mem-12','p-bo');
INSERT INTO "memory_persons" ("memory_id","person_id") VALUES('mem-13','p-ong');
INSERT INTO "memory_persons" ("memory_id","person_id") VALUES('mem-13','p-bo');
INSERT INTO "memory_persons" ("memory_id","person_id") VALUES('mem-13','p-ba_noi');
INSERT INTO "memory_persons" ("memory_id","person_id") VALUES('mem-14','p-chu_hai');
INSERT INTO "memory_persons" ("memory_id","person_id") VALUES('mem-14','p-minh');
INSERT INTO "memory_persons" ("memory_id","person_id") VALUES('mem-14','p-ba_noi');
INSERT INTO "memory_persons" ("memory_id","person_id") VALUES('mem-15','p-to');
INSERT INTO "memory_persons" ("memory_id","person_id") VALUES('mem-15','p-ba_noi');
CREATE TABLE memory_embeddings (
  memory_id TEXT PRIMARY KEY,
  clan_id TEXT,
  person_id TEXT,
  modality TEXT DEFAULT 'text',
  dim INTEGER NOT NULL,
  vector TEXT NOT NULL,               
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT INTO "memory_embeddings" ("memory_id","clan_id","person_id","modality","dim","vector","created_at") VALUES('mem-01','clan-nguyen-dongngac','p-ba_noi','text',256,'[0,0,0,0,0,0,0.09005,0.09005,0.10806,0,0,0,0,0.09005,0,0,0,0,0,0.05403,0,0,0,0,0,0,0,0,0.05403,0,0.05403,0,0,0,0,0,0.09005,0,0.05403,0,0.05403,0,0.14408,0,0.14408,0,0,0,0,0.09005,0.1801,0,0,0,0,0,0.09005,0,0.05403,0.05403,0,0,0.05403,0,0,0,0,0,0,0,0,0,0,0.09005,0.09005,0,0,0,0,0,0.05403,0,0,0,0.05403,0,0,0,0,0,0.05403,0,0.09005,0,0.1801,0.09005,0,0.23413,0,0.05403,0,0.09005,0.14408,0,0,0.05403,0,0.1801,0,0,0,0,0.05403,0,0.05403,0.05403,0,0,0.05403,0,0,0.09005,0.1801,0.05403,0,0.14408,0,0,0,0,0,0,0.05403,0,0,0,0,0,0,0.09005,0.05403,0.09005,0.05403,0.09005,0,0,0,0,0,0.05403,0,0.09005,0,0.14408,0.1801,0,0.14408,0,0.14408,0,0,0,0.09005,0,0,0,0,0.14408,0,0,0.05403,0.05403,0,0.05403,0,0.09005,0,0.09005,0,0,0,0,0,0,0,0,0,0,0,0,0.05403,0.05403,0,0,0,0,0,0,0,0.05403,0.05403,0.45025,0,0.14408,0,0,0,0.09005,0,0.09005,0,0.09005,0.10806,0,0,0,0,0,0,0,0.14408,0,0,0.05403,0.14408,0,0.09005,0,0,0.14408,0.09005,0,0,0,0,0,0,0.05403,0.09005,0,0.05403,0.05403,0,0,0.05403,0,0,0,0,0,0,0,0,0.05403,0.05403,0]','2026-08-09 01:35:59');
INSERT INTO "memory_embeddings" ("memory_id","clan_id","person_id","modality","dim","vector","created_at") VALUES('mem-02','clan-nguyen-dongngac','p-ong','text',256,'[0,0.054818,0,0,0,0,0.182727,0.091363,0,0,0.292362,0.054818,0,0,0.091363,0,0,0,0,0,0,0,0,0,0,0.237544,0,0,0.054818,0,0,0.091363,0,0,0.054818,0,0.054818,0,0,0,0,0,0,0.109636,0,0,0,0,0,0,0,0,0.054818,0.091363,0.054818,0.146181,0.054818,0.091363,0,0,0,0,0,0,0,0,0,0,0,0.054818,0,0,0,0,0,0.054818,0,0.054818,0,0,0,0,0,0.091363,0.054818,0,0,0,0,0.109636,0.054818,0,0,0,0.091363,0,0,0.091363,0.054818,0,0.054818,0,0,0,0,0.091363,0.054818,0,0.054818,0.054818,0,0.054818,0.054818,0,0,0,0,0,0,0.109636,0,0.091363,0,0,0,0.054818,0,0.054818,0,0.054818,0.054818,0,0,0,0,0.054818,0,0,0.146181,0.091363,0,0.182727,0,0.091363,0,0,0,0,0,0.054818,0,0.091363,0.182727,0,0.182727,0.091363,0.146181,0,0,0,0.091363,0,0,0,0,0,0,0,0,0.054818,0,0,0,0.182727,0,0,0,0,0,0,0.091363,0.182727,0.054818,0,0,0,0,0,0,0.091363,0,0,0,0,0,0,0,0,0,0,0,0.365453,0.054818,0.054818,0,0,0,0.146181,0.054818,0,0.054818,0.091363,0.054818,0.054818,0,0,0,0,0,0.146181,0,0,0,0,0.091363,0.091363,0,0,0,0.054818,0,0.182727,0,0,0.091363,0,0,0,0.182727,0,0.054818,0,0,0,0.054818,0,0,0.091363,0,0.054818,0,0,0.091363,0,0.091363,0]','2026-08-09 01:35:59');
INSERT INTO "memory_embeddings" ("memory_id","clan_id","person_id","modality","dim","vector","created_at") VALUES('mem-03','clan-nguyen-dongngac','p-ong','text',256,'[0,0,0,0,0,0,0,0.153196,0,0,0,0.057448,0.057448,0.095747,0.095747,0,0.153196,0,0,0,0.057448,0.191495,0.095747,0.057448,0,0.095747,0,0,0,0.095747,0.095747,0.095747,0,0,0,0,0,0,0.095747,0,0.095747,0,0,0,0.057448,0,0,0,0,0,0.191495,0,0,0,0.057448,0.057448,0.095747,0,0.114897,0,0,0,0.095747,0,0,0,0,0,0,0,0,0,0.057448,0.114897,0,0.114897,0,0,0,0,0,0,0,0.057448,0,0.057448,0,0,0,0,0,0,0,0,0.191495,0.095747,0,0,0.095747,0.057448,0,0.057448,0,0,0,0,0.057448,0.095747,0,0,0,0,0.057448,0.095747,0.057448,0,0,0,0,0,0.191495,0.095747,0.095747,0,0.095747,0,0,0,0,0.057448,0,0,0,0,0,0,0,0.057448,0.287242,0.095747,0,0,0,0,0.153196,0,0,0,0.057448,0,0.095747,0.095747,0,0,0,0.095747,0,0,0,0,0,0.114897,0,0,0.057448,0,0.057448,0,0.153196,0,0.057448,0.057448,0.057448,0,0,0.248943,0,0.057448,0,0,0.095747,0.095747,0,0,0.057448,0.057448,0,0.095747,0.057448,0.191495,0,0.114897,0,0,0.057448,0,0,0.191495,0,0,0.057448,0.191495,0.057448,0,0.191495,0,0,0.095747,0,0.057448,0.057448,0,0.057448,0,0.057448,0,0.057448,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.057448,0,0.095747,0,0,0,0,0,0,0,0,0,0.095747,0.057448,0.153196,0,0,0,0,0,0,0,0]','2026-08-09 01:35:59');
INSERT INTO "memory_embeddings" ("memory_id","clan_id","person_id","modality","dim","vector","created_at") VALUES('mem-04','clan-nguyen-dongngac','p-ong','text',256,'[0,0,0,0.04327,0,0.04327,0,0.187502,0,0,0,0.072116,0.158656,0,0.04327,0,0.04327,0,0,0,0.072116,0,0,0.072116,0.072116,0,0,0,0.04327,0,0,0.115386,0.072116,0.04327,0.04327,0.072116,0,0.187502,0.086539,0.144232,0.115386,0,0.072116,0.04327,0.115386,0.072116,0,0,0.04327,0.04327,0.086539,0,0,0.04327,0,0,0,0.331735,0,0,0.04327,0,0.144232,0,0.072116,0,0.04327,0.072116,0,0.115386,0.072116,0.04327,0,0.072116,0,0.072116,0,0.072116,0,0,0.072116,0,0.04327,0,0,0.072116,0.072116,0,0,0,0.04327,0.072116,0,0.04327,0.086539,0.187502,0,0,0.072116,0,0.04327,0,0,0,0,0.115386,0.04327,0,0,0,0,0.086539,0.072116,0,0.072116,0,0,0,0,0,0,0.04327,0.072116,0.086539,0,0,0.072116,0,0,0,0,0,0,0,0.04327,0,0,0,0,0,0,0.072116,0,0.072116,0.04327,0,0,0.04327,0,0.04327,0,0.04327,0.144232,0.04327,0,0,0,0,0,0.072116,0.187502,0.04327,0.072116,0,0,0.086539,0.04327,0,0.072116,0,0,0,0,0.187502,0,0,0,0.072116,0,0.04327,0,0,0,0.086539,0,0.072116,0.086539,0.144232,0,0.072116,0.04327,0,0.04327,0.072116,0,0,0,0.144232,0,0.216349,0,0.144232,0,0.072116,0.144232,0,0.086539,0.04327,0,0.04327,0.086539,0.072116,0.086539,0,0,0,0.158656,0,0,0,0,0.072116,0,0,0,0,0,0,0.04327,0.129809,0,0.072116,0,0.04327,0,0,0,0,0.144232,0.072116,0,0.04327,0.072116,0,0.04327,0,0,0,0.072116,0,0,0,0.086539,0,0.072116,0]','2026-08-09 01:35:59');
INSERT INTO "memory_embeddings" ("memory_id","clan_id","person_id","modality","dim","vector","created_at") VALUES('mem-05','clan-nguyen-dongngac','p-chu_tu','text',256,'[0,0,0,0.100972,0.100972,0,0,0,0.084144,0,0.084144,0,0,0,0.168287,0,0,0,0,0,0,0,0,0,0,0.050486,0,0,0.100972,0,0,0,0.084144,0.084144,0,0,0,0,0,0.084144,0,0.084144,0,0,0.084144,0,0.084144,0,0,0.050486,0.050486,0,0,0,0,0,0,0,0.13463,0,0,0.050486,0.050486,0,0,0,0,0,0,0.050486,0,0,0,0,0.13463,0,0,0,0,0.100972,0,0,0.050486,0,0.050486,0,0,0,0,0.050486,0.050486,0,0,0,0,0.13463,0,0.084144,0,0,0,0.084144,0,0,0,0.084144,0.050486,0.084144,0,0,0,0.050486,0,0,0,0.050486,0.084144,0,0,0.084144,0,0.050486,0.084144,0,0,0,0,0,0.050486,0,0,0,0.050486,0.050486,0,0,0,0.050486,0,0,0.050486,0.050486,0.050486,0.084144,0,0,0.050486,0,0,0,0.084144,0.084144,0.084144,0.084144,0.050486,0,0.185116,0.050486,0,0.084144,0,0.050486,0.084144,0,0,0,0,0.084144,0.252431,0,0,0.084144,0,0,0,0,0,0,0,0,0.084144,0,0,0.13463,0,0,0,0.050486,0,0.168287,0.050486,0,0.084144,0,0,0,0,0.13463,0.050486,0.218773,0,0.084144,0,0.218773,0,0,0.084144,0.13463,0,0,0,0,0,0,0.050486,0,0,0.050486,0.050486,0,0.302917,0,0.050486,0.050486,0,0.13463,0.336574,0,0.050486,0,0,0.084144,0,0,0,0.13463,0,0,0.168287,0.168287,0,0,0,0.050486,0,0,0,0,0.050486,0.050486,0,0,0,0.050486,0,0]','2026-08-09 01:35:59');
INSERT INTO "memory_embeddings" ("memory_id","clan_id","person_id","modality","dim","vector","created_at") VALUES('mem-06','clan-nguyen-dongngac','p-chu_tu','text',256,'[0.06877,0,0,0.114617,0.06877,0.06877,0,0,0,0,0.229235,0,0,0,0.229235,0,0,0,0,0,0,0,0,0,0,0,0,0,0.06877,0,0,0,0,0,0,0,0,0.06877,0,0.229235,0,0.114617,0.229235,0,0.06877,0,0.06877,0,0,0,0.06877,0,0,0.06877,0,0,0,0,0,0,0,0,0.114617,0,0,0,0,0,0,0.137541,0.114617,0,0,0.114617,0,0,0,0,0.229235,0,0,0,0,0,0.229235,0,0,0,0,0,0.06877,0,0,0,0,0,0,0,0.06877,0,0.06877,0.06877,0,0.06877,0,0.114617,0.137541,0,0,0,0,0.06877,0,0,0,0,0,0,0,0,0,0,0,0,0,0.06877,0,0,0,0,0,0,0,0,0.114617,0,0,0,0.114617,0.06877,0,0,0.06877,0.114617,0,0,0,0,0,0,0.06877,0,0.114617,0.114617,0.06877,0,0.114617,0.06877,0,0.114617,0,0,0,0.183388,0.114617,0,0,0.06877,0.114617,0,0.06877,0,0,0,0,0,0.06877,0,0,0,0.114617,0,0,0,0.06877,0,0,0.06877,0,0.06877,0,0,0,0,0,0,0.114617,0,0,0.137541,0,0.114617,0,0.06877,0.114617,0,0,0.114617,0,0,0,0.06877,0.06877,0,0,0,0,0.06877,0,0,0,0,0,0,0.114617,0.06877,0.229235,0.06877,0,0,0.114617,0,0,0,0,0.114617,0,0,0,0.229235,0,0,0.114617,0,0,0,0.06877,0.114617,0,0,0,0,0,0,0,0]','2026-08-09 01:35:59');
INSERT INTO "memory_embeddings" ("memory_id","clan_id","person_id","modality","dim","vector","created_at") VALUES('mem-07','clan-nguyen-dongngac','p-ong','text',256,'[0,0.051202,0.170672,0.256008,0.051202,0,0,0,0,0.136538,0,0,0,0,0.170672,0.051202,0,0,0,0,0.085336,0.136538,0,0.085336,0,0,0.085336,0,0.051202,0,0.051202,0,0.051202,0,0,0,0,0,0,0.085336,0,0,0,0,0.085336,0.051202,0,0,0,0,0,0.085336,0,0.051202,0,0,0,0,0,0,0,0.170672,0,0,0,0,0,0,0,0,0,0,0,0.085336,0,0,0,0,0,0,0,0,0,0,0.170672,0.051202,0,0.051202,0,0.051202,0,0,0,0,0.085336,0,0,0.051202,0,0,0,0.085336,0,0,0.30721,0.085336,0,0,0.051202,0,0,0,0,0.051202,0,0,0.170672,0,0,0.102403,0,0,0.085336,0,0,0.085336,0,0.051202,0,0,0,0.136538,0,0.051202,0.085336,0.102403,0,0,0,0,0,0,0.051202,0.136538,0,0,0,0,0.051202,0.051202,0,0,0.085336,0.085336,0.051202,0.085336,0,0,0,0,0.085336,0.102403,0,0,0.051202,0,0,0,0.085336,0.085336,0.051202,0,0.051202,0.18774,0,0,0.051202,0.051202,0,0,0.085336,0,0,0,0,0,0,0.085336,0.102403,0.051202,0,0,0,0,0,0,0.085336,0.136538,0,0.085336,0.102403,0.085336,0,0,0.085336,0,0.051202,0.085336,0,0,0,0,0,0,0,0.051202,0,0,0.102403,0.085336,0,0,0.085336,0,0.102403,0.102403,0,0,0,0.051202,0.051202,0,0,0,0,0.170672,0.170672,0.051202,0.085336,0.273076,0,0.102403,0,0,0,0,0,0.170672,0.085336,0,0,0.085336,0,0,0,0.051202]','2026-08-09 01:35:59');
INSERT INTO "memory_embeddings" ("memory_id","clan_id","person_id","modality","dim","vector","created_at") VALUES('mem-08','clan-nguyen-dongngac','p-ong','text',256,'[0,0,0,0.097037,0,0,0.058222,0.194074,0,0.058222,0,0,0,0.058222,0.097037,0.116445,0,0,0,0,0.058222,0.155259,0,0.058222,0,0.058222,0.058222,0,0,0.058222,0,0,0,0,0,0,0,0,0,0.058222,0,0.058222,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.155259,0,0,0,0,0,0,0,0,0,0.058222,0,0,0,0,0,0,0,0,0,0.097037,0,0,0,0,0.058222,0,0,0,0,0.058222,0.058222,0,0,0.155259,0,0,0.155259,0.194074,0,0,0,0.116445,0,0.058222,0,0,0,0,0,0,0.097037,0,0,0.058222,0,0,0,0,0.194074,0,0.058222,0,0,0,0.058222,0,0,0,0,0,0,0.058222,0,0,0,0,0,0,0,0.058222,0.058222,0,0,0,0,0,0.097037,0,0,0.058222,0,0,0.097037,0,0,0.058222,0,0.097037,0,0,0,0.097037,0.194074,0,0.291111,0,0,0.058222,0,0.058222,0.291111,0,0,0,0,0,0,0,0,0.058222,0,0,0.097037,0.194074,0,0,0,0,0,0,0,0.155259,0,0,0,0,0,0.058222,0,0,0,0,0,0.194074,0,0,0,0,0,0,0,0,0,0.194074,0,0.058222,0,0,0,0,0,0,0,0,0.213482,0,0,0.194074,0,0,0,0,0,0,0.194074,0,0,0.097037,0,0,0,0.310519,0,0,0,0,0,0,0,0,0.058222,0,0,0,0,0,0.097037,0]','2026-08-09 01:35:59');
INSERT INTO "memory_embeddings" ("memory_id","clan_id","person_id","modality","dim","vector","created_at") VALUES('mem-09','clan-nguyen-dongngac','p-to','text',256,'[0,0,0,0.115102,0,0,0,0.299266,0,0,0.115102,0,0,0,0,0,0.115102,0.069061,0,0,0.069061,0.230205,0,0,0,0,0,0,0,0.069061,0,0,0,0,0,0,0,0,0.115102,0,0,0.069061,0,0,0.230205,0.115102,0,0,0,0,0.069061,0.115102,0,0,0,0,0,0,0,0,0,0.115102,0.115102,0,0.069061,0,0,0,0.069061,0,0,0,0,0,0,0,0.069061,0.184164,0,0,0,0,0,0,0.115102,0,0,0,0,0,0,0.069061,0,0,0.184164,0,0,0,0,0.069061,0,0.115102,0,0,0,0,0.069061,0,0,0,0,0,0,0.069061,0,0,0.115102,0,0,0,0.069061,0,0,0,0,0,0.069061,0,0,0,0,0,0,0,0,0.115102,0,0.115102,0,0,0,0,0,0,0,0,0,0,0.069061,0,0,0,0.115102,0,0,0,0,0,0,0,0,0,0.115102,0,0,0,0,0.115102,0,0,0.184164,0,0,0,0,0,0,0,0.069061,0,0.115102,0.115102,0,0,0,0,0,0.069061,0.069061,0,0,0,0,0,0.069061,0,0,0.115102,0,0,0,0.069061,0,0,0,0,0,0,0.069061,0.069061,0,0,0,0,0.138123,0,0,0.115102,0,0,0.069061,0,0.115102,0,0.069061,0.138123,0.069061,0,0,0,0,0,0.230205,0,0,0.184164,0.115102,0,0.115102,0,0,0,0,0,0,0.069061,0,0,0.368327,0,0,0,0,0,0.115102,0]','2026-08-09 01:35:59');
INSERT INTO "memory_embeddings" ("memory_id","clan_id","person_id","modality","dim","vector","created_at") VALUES('mem-10','clan-nguyen-dongngac','p-ba_noi','text',256,'[0,0,0,0.114799,0,0,0,0.229597,0,0,0,0,0,0,0.114799,0,0.114799,0,0,0,0,0,0.068879,0.114799,0,0.068879,0,0,0,0.068879,0,0,0,0.137758,0,0,0,0,0,0,0.114799,0,0,0,0.114799,0,0.114799,0.068879,0,0,0,0,0.183678,0,0,0,0,0,0,0.068879,0,0,0,0,0,0,0,0,0,0.068879,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.183678,0.068879,0,0,0,0,0,0.114799,0,0,0.068879,0,0,0.114799,0.068879,0,0,0.137758,0,0,0,0,0,0,0,0,0.068879,0,0.229597,0.183678,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.068879,0,0,0.068879,0,0,0,0.229597,0,0,0,0.137758,0,0.068879,0,0,0,0,0,0.114799,0.114799,0.114799,0,0.068879,0,0,0,0,0.229597,0,0,0.206637,0,0,0,0.068879,0.114799,0,0,0,0,0,0,0,0,0,0,0,0,0,0.068879,0,0.068879,0,0,0,0.068879,0,0,0,0,0,0,0,0,0.114799,0,0,0,0.114799,0,0,0.229597,0,0,0.114799,0,0,0,0,0,0.068879,0,0,0,0,0.068879,0,0,0,0.114799,0,0.068879,0.114799,0,0,0.068879,0.344396,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.068879,0.229597,0,0,0.068879,0,0,0,0.114799,0]','2026-08-09 01:35:59');
INSERT INTO "memory_embeddings" ("memory_id","clan_id","person_id","modality","dim","vector","created_at") VALUES('mem-11','clan-nguyen-dongngac','p-chu_hai','text',256,'[0,0,0,0,0.068024,0,0,0.113373,0.068024,0,0,0,0,0.181397,0,0,0.113373,0,0,0,0.113373,0,0,0,0,0,0,0,0,0,0.136048,0,0,0,0,0,0,0.068024,0,0.226746,0.113373,0,0,0,0.068024,0,0,0,0,0,0,0,0.068024,0.068024,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.136048,0,0,0,0.113373,0,0,0,0.068024,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.113373,0,0,0,0,0,0,0.113373,0,0,0,0,0.113373,0,0,0,0.068024,0,0.068024,0,0,0,0.068024,0.113373,0,0,0.068024,0,0,0.068024,0,0,0,0,0.068024,0,0,0,0,0,0,0,0,0.136048,0,0.068024,0,0,0.113373,0,0,0.068024,0,0,0,0,0,0,0.113373,0,0,0,0.068024,0.113373,0,0.113373,0.068024,0,0,0,0,0.226746,0,0,0,0,0,0,0.113373,0,0,0,0.068024,0.226746,0.136048,0,0,0.068024,0,0,0,0,0.249421,0,0.113373,0,0,0,0,0.068024,0,0,0,0.068024,0,0,0.453493,0,0,0.226746,0,0,0,0,0,0,0.226746,0,0,0.068024,0,0,0,0,0.068024,0,0,0.113373,0,0,0.113373,0.113373,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.113373,0,0,0,0,0,0,0.113373,0.068024]','2026-08-09 01:35:59');
INSERT INTO "memory_embeddings" ("memory_id","clan_id","person_id","modality","dim","vector","created_at") VALUES('mem-12','clan-nguyen-dongngac','p-ong','text',256,'[0,0,0,0.115102,0,0,0,0.115102,0,0,0,0.069061,0.069061,0,0,0,0,0,0,0,0.115102,0,0,0,0,0.276246,0,0,0.138123,0,0,0,0,0,0,0,0.115102,0,0,0,0.230205,0,0,0,0.069061,0,0,0.069061,0,0,0,0.115102,0,0.069061,0,0,0,0,0,0,0.115102,0,0,0,0,0,0,0,0,0.230205,0,0.069061,0,0.069061,0.069061,0,0,0,0,0,0.230205,0,0,0,0.069061,0,0,0,0,0,0,0,0,0,0,0.230205,0,0.069061,0,0,0,0,0,0,0,0.069061,0,0,0,0,0,0,0,0.069061,0,0,0.115102,0,0,0,0,0,0,0.069061,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.115102,0,0,0,0,0,0,0,0,0.069061,0,0,0,0,0.115102,0,0.069061,0.115102,0,0,0,0,0,0,0,0,0,0.069061,0,0,0,0,0,0,0,0,0,0,0.069061,0,0,0,0.575512,0,0,0,0,0,0,0,0,0,0.230205,0,0,0,0,0,0,0,0,0.069061,0,0,0,0,0,0.069061,0,0,0,0.115102,0,0,0,0,0.115102,0,0.069061,0,0.069061,0,0,0,0,0,0,0,0,0,0.115102,0,0,0.115102,0,0,0,0,0,0.069061,0,0,0.115102,0,0,0,0,0,0.069061,0,0]','2026-08-09 01:35:59');
INSERT INTO "memory_embeddings" ("memory_id","clan_id","person_id","modality","dim","vector","created_at") VALUES('mem-13','clan-nguyen-dongngac','p-ong','text',256,'[0,0,0,0,0,0,0.115904,0.115904,0.069542,0,0.069542,0,0,0,0.231807,0,0,0,0,0.069542,0,0,0.069542,0.139084,0.115904,0,0,0,0,0,0.185446,0.115904,0,0.069542,0,0,0.115904,0,0.231807,0,0.115904,0,0.115904,0,0,0,0,0,0,0,0.069542,0,0,0,0,0,0,0.115904,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.115904,0.115904,0.185446,0,0,0,0,0.069542,0,0,0,0,0.231807,0,0,0,0.069542,0,0,0,0,0,0,0,0,0,0,0.069542,0.115904,0,0.069542,0,0.069542,0,0.115904,0,0.115904,0,0,0,0,0.069542,0,0,0,0,0,0,0,0.115904,0,0,0.139084,0,0,0,0,0,0,0,0.069542,0,0.185446,0.069542,0,0.185446,0,0,0.115904,0,0,0.069542,0,0,0.069542,0,0,0,0,0,0,0,0,0.301349,0,0,0,0.069542,0,0,0,0.069542,0,0,0,0,0,0,0,0,0.115904,0,0,0,0,0,0,0,0,0,0,0,0.115904,0,0.115904,0,0,0,0,0,0,0.069542,0,0,0.115904,0,0,0.069542,0.115904,0.069542,0,0,0,0,0.115904,0,0,0,0,0,0,0,0,0.069542,0,0,0,0.115904,0,0,0,0,0.069542,0.115904,0,0,0,0,0.069542,0,0,0,0.115904,0,0.139084,0.115904,0,0,0,0,0,0,0,0,0.301349,0.069542,0,0,0,0,0,0.069542,0]','2026-08-09 01:35:59');
INSERT INTO "memory_embeddings" ("memory_id","clan_id","person_id","modality","dim","vector","created_at") VALUES('mem-14','clan-nguyen-dongngac','p-chu_hai','text',256,'[0,0,0,0,0.112967,0,0,0,0,0.06778,0,0,0.06778,0,0,0,0.112967,0,0,0,0,0.180748,0,0,0.135561,0,0,0,0,0,0,0,0,0,0,0,0,0.112967,0.112967,0.112967,0.112967,0,0,0,0.180748,0,0,0,0,0,0,0.06778,0.06778,0.06778,0,0.06778,0,0,0,0,0,0,0.338902,0,0,0,0,0,0,0.112967,0,0,0,0.06778,0,0,0.06778,0.112967,0,0,0,0,0.06778,0,0,0,0,0,0,0,0,0,0,0,0,0.112967,0,0,0.06778,0,0,0,0,0,0,0.180748,0,0,0.06778,0,0,0,0,0.225935,0,0,0,0,0,0.06778,0.06778,0,0,0,0,0,0,0,0,0,0,0,0,0,0.112967,0,0,0.06778,0,0,0,0.112967,0,0.225935,0,0,0,0,0,0,0.225935,0,0.180748,0,0.06778,0,0,0,0,0,0,0.06778,0,0.135561,0.06778,0.06778,0,0,0,0,0,0,0,0.112967,0,0,0,0,0,0.06778,0,0,0,0,0.135561,0,0.135561,0,0,0,0.06778,0.112967,0,0.112967,0,0,0.06778,0,0.06778,0,0,0.112967,0,0,0.112967,0,0,0.112967,0.06778,0.06778,0.112967,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.338902,0.112967,0,0,0,0,0,0,0,0,0.112967,0,0,0.112967,0.06778,0,0,0.112967,0,0.06778,0,0,0,0,0,0,0,0,0,0.112967,0]','2026-08-09 01:35:59');
INSERT INTO "memory_embeddings" ("memory_id","clan_id","person_id","modality","dim","vector","created_at") VALUES('mem-15','clan-nguyen-dongngac','p-to','text',256,'[0.065419,0,0,0.17445,0,0,0,0.109031,0,0,0,0,0,0.17445,0.17445,0,0,0,0,0,0,0.17445,0,0.109031,0.065419,0,0,0,0.065419,0.218062,0,0.065419,0,0.065419,0,0,0.218062,0,0,0,0.065419,0,0,0,0,0.065419,0,0,0,0,0,0,0.065419,0,0,0.109031,0.109031,0,0,0,0,0.109031,0.065419,0,0,0,0,0,0,0,0,0,0,0.109031,0,0,0,0,0,0,0.065419,0.065419,0,0.109031,0.109031,0.109031,0.065419,0,0,0,0.065419,0,0,0,0.17445,0,0.130837,0.109031,0.109031,0,0,0.109031,0,0,0,0.109031,0,0.065419,0,0,0.065419,0,0,0,0,0,0.065419,0,0,0.065419,0,0.065419,0,0,0,0,0,0,0.17445,0,0,0,0,0,0,0.065419,0.065419,0,0,0,0.109031,0,0,0,0,0,0,0,0,0,0.065419,0,0,0,0,0.109031,0,0,0,0,0,0,0,0,0.17445,0,0.065419,0,0,0,0.130837,0.17445,0.109031,0.109031,0,0,0,0.065419,0,0,0,0.109031,0,0.065419,0,0.109031,0,0.109031,0,0.109031,0,0,0.065419,0,0,0,0,0.109031,0,0,0,0,0,0.109031,0.392512,0,0,0.109031,0,0,0,0.065419,0,0.109031,0,0,0,0,0,0,0,0.109031,0.109031,0,0.065419,0.109031,0,0,0,0,0,0,0,0,0,0,0.109031,0,0,0,0,0,0,0.065419,0,0,0,0,0,0,0,0,0.065419,0,0.065419,0]','2026-08-09 01:35:59');
INSERT INTO "memory_embeddings" ("memory_id","clan_id","person_id","modality","dim","vector","created_at") VALUES('e50f1fb0-de39-4643-a818-5cb30af890ef','clan-nguyen-dongngac',NULL,'text',256,'[0,0,0,0,0,0,0.6509445549041193,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.6509445549041193,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.3905667329424716,0,0,0,0,0,0]','2026-08-09 01:37:41');
INSERT INTO "memory_embeddings" ("memory_id","clan_id","person_id","modality","dim","vector","created_at") VALUES('2cb965cc-c6ba-44bb-855f-5476015ac164','clan-nguyen-dongngac',NULL,'text',256,'[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]','2026-08-09 01:38:29');
INSERT INTO "memory_embeddings" ("memory_id","clan_id","person_id","modality","dim","vector","created_at") VALUES('c5a06520-b022-4e06-b5e7-17f98b500869','clan-nguyen-dongngac',NULL,'text',256,'[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]','2026-08-09 01:38:55');
INSERT INTO "memory_embeddings" ("memory_id","clan_id","person_id","modality","dim","vector","created_at") VALUES('fe199595-2964-497d-ace8-91092e9d8bcb','clan-nguyen-dongngac',NULL,'text',256,'[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]','2026-08-09 01:38:55');
CREATE TABLE contradictions (
  id TEXT PRIMARY KEY,
  event_id TEXT,
  memory_a_id TEXT NOT NULL,
  memory_b_id TEXT NOT NULL,
  aspect TEXT,                        
  claim_a TEXT,
  claim_b TEXT,
  severity TEXT DEFAULT 'LOW' CHECK (severity IN ('LOW','MEDIUM','HIGH')),
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','CLARIFIED','DISMISSED')),
  resolution_note TEXT,               
  detected_at TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT INTO "contradictions" ("id","event_id","memory_a_id","memory_b_id","aspect","claim_a","claim_b","severity","status","resolution_note","detected_at") VALUES('ct-01','ev-cuoi-1958','mem-01','mem-02','thời tiết','trời mưa rất to, nước ngập cả sân','trời nắng chang chang, mồ hôi ướt hết lưng áo','MEDIUM','OPEN',NULL,'2026-04-11 01:35:59');
INSERT INTO "contradictions" ("id","event_id","memory_a_id","memory_b_id","aspect","claim_a","claim_b","severity","status","resolution_note","detected_at") VALUES('ct-02','ev-cuoi-1958','mem-01','mem-02','số lượng','cỗ hôm ấy làm hai mươi bàn','tôi nhớ chỉ mười lăm bàn thôi','LOW','OPEN',NULL,'2026-04-11 01:35:59');
INSERT INTO "contradictions" ("id","event_id","memory_a_id","memory_b_id","aspect","claim_a","claim_b","severity","status","resolution_note","detected_at") VALUES('ct-03','ev-quangtri-1972','mem-05','mem-06','thời điểm','nhận giấy báo tử khoảng tháng bảy năm bảy hai','giấy báo tử về đúng dịp giáp Tết bảy hai sang bảy ba','HIGH','CLARIFIED','Trưởng họ Nguyễn Văn Tùng ghi chú (không phải AI kết luận): Giấy báo tử gốc còn lưu tại nhà thờ họ ghi ngày 12/07/1972, nhưng lễ truy điệu của xã thì tổ chức dịp giáp Tết. Có thể hai người đang nhớ về hai mốc khác nhau. Giữ lại cả hai lời kể.','2026-04-13 01:35:59');
CREATE TABLE advices (
  id TEXT PRIMARY KEY,
  clan_id TEXT,
  original_text TEXT NOT NULL,        
  category TEXT NOT NULL CHECK (category IN ('FILIAL_PIETY','EDUCATION','MARRIAGE','BUSINESS','ETHICS')),
  source_memory_id TEXT NOT NULL,     
  spoken_by_person_id TEXT,
  audio_url TEXT,
  approved_by_user_id TEXT,           
  approved_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT INTO "advices" ("id","clan_id","original_text","category","source_memory_id","spoken_by_person_id","audio_url","approved_by_user_id","approved_at","created_at") VALUES('adv-01','clan-nguyen-dongngac','Nhà mình không có ruộng nhiều, chỉ có cái chữ là của cải để lại được. Con cháu đời nào cũng phải học, học không phải để làm quan mà để không ai lừa được mình.','EDUCATION','mem-08','p-ong',NULL,'user-tung','2026-05-01 01:35:59','2026-04-30 01:35:59');
INSERT INTO "advices" ("id","clan_id","original_text","category","source_memory_id","spoken_by_person_id","audio_url","approved_by_user_id","approved_at","created_at") VALUES('adv-02','clan-nguyen-dongngac','Thờ cha kính mẹ là gốc của mọi điều lành, con cháu nào bỏ gốc thì cành có tốt cũng chẳng bền.','FILIAL_PIETY','mem-09','p-to',NULL,'user-tung','2026-05-01 01:35:59','2026-04-30 01:35:59');
INSERT INTO "advices" ("id","clan_id","original_text","category","source_memory_id","spoken_by_person_id","audio_url","approved_by_user_id","approved_at","created_at") VALUES('adv-03','clan-nguyen-dongngac','Cưới xin thì đừng chạy theo mâm cao cỗ đầy, lấy nhau là lấy cái nết chứ không lấy cái nhà.','MARRIAGE','mem-10','p-ba_noi',NULL,'user-tung','2026-05-01 01:35:59','2026-04-30 01:35:59');
INSERT INTO "advices" ("id","clan_id","original_text","category","source_memory_id","spoken_by_person_id","audio_url","approved_by_user_id","approved_at","created_at") VALUES('adv-04','clan-nguyen-dongngac','Làm cái gì cũng phải làm cho tử tế, đồ mình đóng người ta dùng ba chục năm, mình gian một ly là họ khổ ba chục năm.','BUSINESS','mem-11','p-chu_hai',NULL,'user-tung','2026-05-01 01:35:59','2026-04-30 01:35:59');
INSERT INTO "advices" ("id","clan_id","original_text","category","source_memory_id","spoken_by_person_id","audio_url","approved_by_user_id","approved_at","created_at") VALUES('adv-05','clan-nguyen-dongngac','Trong họ có người khá người kém, người khá phải đỡ người kém, đừng để ai trong họ phải ngửa tay xin người ngoài.','ETHICS','mem-12','p-ong',NULL,'user-tung','2026-05-01 01:35:59','2026-04-30 01:35:59');
INSERT INTO "advices" ("id","clan_id","original_text","category","source_memory_id","spoken_by_person_id","audio_url","approved_by_user_id","approved_at","created_at") VALUES('adv-06','clan-nguyen-dongngac','Sống ở đời, cái gì mình đã hứa với đồng đội thì phải giữ, dù có phải đi bộ ba trăm cây số.','ETHICS','mem-04','p-ong',NULL,'user-tung','2026-05-01 01:35:59','2026-04-30 01:35:59');
INSERT INTO "advices" ("id","clan_id","original_text","category","source_memory_id","spoken_by_person_id","audio_url","approved_by_user_id","approved_at","created_at") VALUES('adv-07','clan-nguyen-dongngac','Nhà mất thì dựng lại được, gia phả mất là mất gốc.','FILIAL_PIETY','mem-07','p-ong',NULL,'user-tung','2026-05-01 01:35:59','2026-04-30 01:35:59');
CREATE TABLE altars (
  id TEXT PRIMARY KEY,
  clan_id TEXT,
  owner_user_id TEXT,
  name TEXT NOT NULL,
  subject_person_ids TEXT NOT NULL,   
  religion_theme TEXT NOT NULL DEFAULT 'Phat'
    CHECK (religion_theme IN ('Phat','CongGiao','CaoDai','HoaHao','DaoMau','KhongTonGiao')),
  spatial_assets TEXT,                
  ambient_sound TEXT DEFAULT 'chuong_chua',
  horizontal_scroll_text TEXT,        
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT INTO "altars" ("id","clan_id","owner_user_id","name","subject_person_ids","religion_theme","spatial_assets","ambient_sound","horizontal_scroll_text","created_at","updated_at") VALUES('altar-nguyen-main','clan-nguyen-dongngac','user-tung','Bàn thờ gia tiên họ Nguyễn — Đông Ngạc','["p-to","p-to_ba","p-ong","p-chu_tu","p-chu_hai"]','Phat','{"background":"nha_go_bac_bo","lighting":"nen_am","incense":"nhang_tram","altarStyle":"go_gu"}','chuong_chua','ĐỨC LƯU QUANG','2025-07-25 01:35:59','2026-08-09 01:35:59');
INSERT INTO "altars" ("id","clan_id","owner_user_id","name","subject_person_ids","religion_theme","spatial_assets","ambient_sound","horizontal_scroll_text","created_at","updated_at") VALUES('altar-chu-hai','clan-nguyen-dongngac','user-minh','Bàn thờ chú Hải','["p-chu_hai"]','Phat','{"background":"phong_tho_nho","lighting":"nen_am","incense":"nhang_que"}','mua_ngoai_hien','NGHĨA TRỌNG TÌNH SÂU','2026-03-12 01:35:59','2026-08-09 01:35:59');
CREATE TABLE ritual_events (      
  id TEXT PRIMARY KEY,
  altar_id TEXT,
  ritual_id TEXT,
  user_id TEXT,
  actor_name TEXT,
  type TEXT NOT NULL CHECK (type IN ('INCENSE','FLOWER','OFFERING','PRAYER','CANDLE','JOIN','LEAVE')),
  payload TEXT,                       
  client_event_id TEXT,               
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT INTO "ritual_events" ("id","altar_id","ritual_id","user_id","actor_name","type","payload","client_event_id","created_at") VALUES('rev-0028-giasuky','altar-nguyen-main',NULL,'user-minh','Nguyễn Văn Minh','INCENSE','{}','seed-cev-1','2026-08-08 23:35:59');
INSERT INTO "ritual_events" ("id","altar_id","ritual_id","user_id","actor_name","type","payload","client_event_id","created_at") VALUES('rev-0029-giasuky','altar-nguyen-main',NULL,'user-minh','Nguyễn Văn Minh','PRAYER','{"text":"Con xin ông phù hộ cho cả nhà bình an, cháu Bảo khỏe mạnh."}','seed-cev-2','2026-08-08 23:35:59');
INSERT INTO "ritual_events" ("id","altar_id","ritual_id","user_id","actor_name","type","payload","client_event_id","created_at") VALUES('rev-0030-giasuky','altar-nguyen-main',NULL,'user-tung','Nguyễn Văn Tùng','INCENSE','{}','seed-cev-3','2026-08-08 01:35:59');
INSERT INTO "ritual_events" ("id","altar_id","ritual_id","user_id","actor_name","type","payload","client_event_id","created_at") VALUES('rev-0031-giasuky','altar-nguyen-main',NULL,'user-tung','Nguyễn Văn Tùng','OFFERING','{"item":"Mâm ngũ quả"}','seed-cev-4','2026-08-08 01:35:59');
INSERT INTO "ritual_events" ("id","altar_id","ritual_id","user_id","actor_name","type","payload","client_event_id","created_at") VALUES('rev-0032-giasuky','altar-nguyen-main',NULL,'user-hoa','Nguyễn Thị Hòa','CANDLE','{}','seed-cev-5','2026-08-06 01:35:59');
INSERT INTO "ritual_events" ("id","altar_id","ritual_id","user_id","actor_name","type","payload","client_event_id","created_at") VALUES('rev-0033-giasuky','altar-nguyen-main',NULL,'user-ba','Nguyễn Thị Ba','INCENSE','{}','seed-cev-6','2026-08-04 01:35:59');
INSERT INTO "ritual_events" ("id","altar_id","ritual_id","user_id","actor_name","type","payload","client_event_id","created_at") VALUES('rev-0034-giasuky','altar-nguyen-main',NULL,'user-hoa','Nguyễn Thị Hòa','FLOWER','{"item":"Hoa cúc vàng"}','seed-cev-7','2026-08-03 01:35:59');
INSERT INTO "ritual_events" ("id","altar_id","ritual_id","user_id","actor_name","type","payload","client_event_id","created_at") VALUES('rev-0035-giasuky','altar-nguyen-main',NULL,'user-ba','Nguyễn Thị Ba','PRAYER','{"text":"Anh Thịnh ơi, em vẫn nhớ anh dặn phải giữ lấy cái chữ cho các cháu."}','seed-cev-8','2026-08-01 01:35:59');
INSERT INTO "ritual_events" ("id","altar_id","ritual_id","user_id","actor_name","type","payload","client_event_id","created_at") VALUES('rev-0036-giasuky','altar-nguyen-main','rit-past','user-tung','Nguyễn Văn Tùng','JOIN','{}','seed-cev-9','2026-06-25 01:35:59');
INSERT INTO "ritual_events" ("id","altar_id","ritual_id","user_id","actor_name","type","payload","client_event_id","created_at") VALUES('rev-0037-giasuky','altar-nguyen-main','rit-past','user-hoa','Nguyễn Thị Hòa','JOIN','{}','seed-cev-10','2026-06-25 01:35:59');
INSERT INTO "ritual_events" ("id","altar_id","ritual_id","user_id","actor_name","type","payload","client_event_id","created_at") VALUES('rev-0038-giasuky','altar-nguyen-main','rit-past','user-tung','Nguyễn Văn Tùng','INCENSE','{}','seed-cev-11','2026-06-25 01:35:59');
INSERT INTO "ritual_events" ("id","altar_id","ritual_id","user_id","actor_name","type","payload","client_event_id","created_at") VALUES('rev-0039-giasuky','altar-nguyen-main','rit-past','user-hoa','Nguyễn Thị Hòa','INCENSE','{}','seed-cev-12','2026-06-25 01:35:59');
INSERT INTO "ritual_events" ("id","altar_id","ritual_id","user_id","actor_name","type","payload","client_event_id","created_at") VALUES('rev-0040-giasuky','altar-nguyen-main','rit-past','user-tung','Nguyễn Văn Tùng','PRAYER','{"text":"Con cháu về tảo mộ, kính mong tiên linh chứng giám."}','seed-cev-13','2026-06-25 01:35:59');
CREATE TABLE rituals (
  id TEXT PRIMARY KEY,
  clan_id TEXT,
  altar_id TEXT,
  title TEXT NOT NULL,
  subject_person_id TEXT,
  ritual_type TEXT DEFAULT 'GIO' CHECK (ritual_type IN ('GIO','TET','THANH_MINH','CAU_AN','OTHER')),
  scheduled_at TEXT NOT NULL,         
  lunar_day INTEGER,
  lunar_month INTEGER,
  status TEXT NOT NULL DEFAULT 'SCHEDULED'
    CHECK (status IN ('SCHEDULED','LIVE','COMPLETED','CANCELED')),
  gia_huan_text TEXT,                 
  recording_url TEXT,
  created_by TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT INTO "rituals" ("id","clan_id","altar_id","title","subject_person_id","ritual_type","scheduled_at","lunar_day","lunar_month","status","gia_huan_text","recording_url","created_by","created_at") VALUES('rit-soon','clan-nguyen-dongngac','altar-nguyen-main','Lễ giỗ ông Nguyễn Phúc Thịnh (trực tuyến)','p-ong','GIO','2026-08-11T05:45:01.236Z',29,6,'SCHEDULED',replace('Hôm nay con cháu họ Nguyễn Phúc, làng Đông Ngạc,\ntề tựu trước bàn thờ gia tiên.\nKính cẩn dâng nén tâm nhang lên cụ tổ Nguyễn Phúc Đức,\ncùng chư vị tiên linh nội ngoại họ Nguyễn.\nCụ dạy: thờ cha kính mẹ là gốc của mọi điều lành.\nÔng dạy: nhà mình chỉ có cái chữ là của cải để lại được.\nCon cháu xin ghi lòng, đời nối đời không dám quên.\nCầu cho trong họ trên hòa dưới thuận,\nngười khá đỡ người kém, không ai phải ngửa tay xin người ngoài.\nNam mô A Di Đà Phật.','\n',char(10)),NULL,'user-tung','2026-06-10 01:35:59');
INSERT INTO "rituals" ("id","clan_id","altar_id","title","subject_person_id","ritual_type","scheduled_at","lunar_day","lunar_month","status","gia_huan_text","recording_url","created_by","created_at") VALUES('rit-ong','clan-nguyen-dongngac','altar-nguyen-main','Giỗ ông Thịnh 9/8 âm lịch','p-ong','GIO','2026-09-19T03:00:00.000Z',9,8,'SCHEDULED',replace('Hôm nay con cháu họ Nguyễn Phúc, làng Đông Ngạc,\ntề tựu trước bàn thờ gia tiên.\nKính cẩn dâng nén tâm nhang lên cụ tổ Nguyễn Phúc Đức,\ncùng chư vị tiên linh nội ngoại họ Nguyễn.\nCụ dạy: thờ cha kính mẹ là gốc của mọi điều lành.\nÔng dạy: nhà mình chỉ có cái chữ là của cải để lại được.\nCon cháu xin ghi lòng, đời nối đời không dám quên.\nCầu cho trong họ trên hòa dưới thuận,\nngười khá đỡ người kém, không ai phải ngửa tay xin người ngoài.\nNam mô A Di Đà Phật.','\n',char(10)),NULL,'user-tung','2026-06-10 01:35:59');
INSERT INTO "rituals" ("id","clan_id","altar_id","title","subject_person_id","ritual_type","scheduled_at","lunar_day","lunar_month","status","gia_huan_text","recording_url","created_by","created_at") VALUES('rit-to','clan-nguyen-dongngac','altar-nguyen-main','Giỗ cụ tổ Nguyễn Phúc Đức 3/10 âm lịch','p-to','GIO','2026-11-11T03:00:00.000Z',3,10,'SCHEDULED',replace('Hôm nay con cháu họ Nguyễn Phúc, làng Đông Ngạc,\ntề tựu trước bàn thờ gia tiên.\nKính cẩn dâng nén tâm nhang lên cụ tổ Nguyễn Phúc Đức,\ncùng chư vị tiên linh nội ngoại họ Nguyễn.\nCụ dạy: thờ cha kính mẹ là gốc của mọi điều lành.\nÔng dạy: nhà mình chỉ có cái chữ là của cải để lại được.\nCon cháu xin ghi lòng, đời nối đời không dám quên.\nCầu cho trong họ trên hòa dưới thuận,\nngười khá đỡ người kém, không ai phải ngửa tay xin người ngoài.\nNam mô A Di Đà Phật.','\n',char(10)),NULL,'user-tung','2026-06-10 01:35:59');
INSERT INTO "rituals" ("id","clan_id","altar_id","title","subject_person_id","ritual_type","scheduled_at","lunar_day","lunar_month","status","gia_huan_text","recording_url","created_by","created_at") VALUES('rit-hai','clan-nguyen-dongngac','altar-nguyen-main','Giỗ chú Hải 18/12 âm lịch','p-chu_hai','GIO','2027-01-25T03:00:00.000Z',18,12,'SCHEDULED',replace('Hôm nay con cháu họ Nguyễn Phúc, làng Đông Ngạc,\ntề tựu trước bàn thờ gia tiên.\nKính cẩn dâng nén tâm nhang lên cụ tổ Nguyễn Phúc Đức,\ncùng chư vị tiên linh nội ngoại họ Nguyễn.\nCụ dạy: thờ cha kính mẹ là gốc của mọi điều lành.\nÔng dạy: nhà mình chỉ có cái chữ là của cải để lại được.\nCon cháu xin ghi lòng, đời nối đời không dám quên.\nCầu cho trong họ trên hòa dưới thuận,\nngười khá đỡ người kém, không ai phải ngửa tay xin người ngoài.\nNam mô A Di Đà Phật.','\n',char(10)),NULL,'user-tung','2026-06-10 01:35:59');
INSERT INTO "rituals" ("id","clan_id","altar_id","title","subject_person_id","ritual_type","scheduled_at","lunar_day","lunar_month","status","gia_huan_text","recording_url","created_by","created_at") VALUES('rit-tu','clan-nguyen-dongngac','altar-nguyen-main','Giỗ chú Tứ 25/3 âm lịch','p-chu_tu','GIO','2027-05-01T03:00:00.000Z',25,3,'SCHEDULED',replace('Hôm nay con cháu họ Nguyễn Phúc, làng Đông Ngạc,\ntề tựu trước bàn thờ gia tiên.\nKính cẩn dâng nén tâm nhang lên cụ tổ Nguyễn Phúc Đức,\ncùng chư vị tiên linh nội ngoại họ Nguyễn.\nCụ dạy: thờ cha kính mẹ là gốc của mọi điều lành.\nÔng dạy: nhà mình chỉ có cái chữ là của cải để lại được.\nCon cháu xin ghi lòng, đời nối đời không dám quên.\nCầu cho trong họ trên hòa dưới thuận,\nngười khá đỡ người kém, không ai phải ngửa tay xin người ngoài.\nNam mô A Di Đà Phật.','\n',char(10)),NULL,'user-tung','2026-06-10 01:35:59');
INSERT INTO "rituals" ("id","clan_id","altar_id","title","subject_person_id","ritual_type","scheduled_at","lunar_day","lunar_month","status","gia_huan_text","recording_url","created_by","created_at") VALUES('rit-past','clan-nguyen-dongngac','altar-nguyen-main','Lễ Thanh Minh — tảo mộ họ Nguyễn','p-to','THANH_MINH','2026-06-25T00:45:01.236Z',5,3,'COMPLETED',replace('Hôm nay con cháu họ Nguyễn Phúc, làng Đông Ngạc,\ntề tựu trước bàn thờ gia tiên.\nKính cẩn dâng nén tâm nhang lên cụ tổ Nguyễn Phúc Đức,\ncùng chư vị tiên linh nội ngoại họ Nguyễn.\nCụ dạy: thờ cha kính mẹ là gốc của mọi điều lành.\nÔng dạy: nhà mình chỉ có cái chữ là của cải để lại được.\nCon cháu xin ghi lòng, đời nối đời không dám quên.\nCầu cho trong họ trên hòa dưới thuận,\nngười khá đỡ người kém, không ai phải ngửa tay xin người ngoài.\nNam mô A Di Đà Phật.','\n',char(10)),NULL,'user-tung','2026-06-10 01:35:59');
CREATE TABLE ritual_participants (
  ritual_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  rsvp TEXT NOT NULL DEFAULT 'MAYBE' CHECK (rsvp IN ('YES','NO','MAYBE')),
  joined_at TEXT,
  PRIMARY KEY (ritual_id, user_id)
);
INSERT INTO "ritual_participants" ("ritual_id","user_id","rsvp","joined_at") VALUES('rit-soon','user-tung','YES',NULL);
INSERT INTO "ritual_participants" ("ritual_id","user_id","rsvp","joined_at") VALUES('rit-soon','user-hoa','YES',NULL);
INSERT INTO "ritual_participants" ("ritual_id","user_id","rsvp","joined_at") VALUES('rit-soon','user-minh','YES',NULL);
INSERT INTO "ritual_participants" ("ritual_id","user_id","rsvp","joined_at") VALUES('rit-soon','user-ba','MAYBE',NULL);
INSERT INTO "ritual_participants" ("ritual_id","user_id","rsvp","joined_at") VALUES('rit-ong','user-tung','YES',NULL);
INSERT INTO "ritual_participants" ("ritual_id","user_id","rsvp","joined_at") VALUES('rit-ong','user-hoa','YES',NULL);
INSERT INTO "ritual_participants" ("ritual_id","user_id","rsvp","joined_at") VALUES('rit-ong','user-minh','YES',NULL);
INSERT INTO "ritual_participants" ("ritual_id","user_id","rsvp","joined_at") VALUES('rit-ong','user-ba','MAYBE',NULL);
INSERT INTO "ritual_participants" ("ritual_id","user_id","rsvp","joined_at") VALUES('rit-to','user-tung','YES',NULL);
INSERT INTO "ritual_participants" ("ritual_id","user_id","rsvp","joined_at") VALUES('rit-to','user-hoa','YES',NULL);
INSERT INTO "ritual_participants" ("ritual_id","user_id","rsvp","joined_at") VALUES('rit-to','user-minh','YES',NULL);
INSERT INTO "ritual_participants" ("ritual_id","user_id","rsvp","joined_at") VALUES('rit-to','user-ba','MAYBE',NULL);
INSERT INTO "ritual_participants" ("ritual_id","user_id","rsvp","joined_at") VALUES('rit-hai','user-tung','YES',NULL);
INSERT INTO "ritual_participants" ("ritual_id","user_id","rsvp","joined_at") VALUES('rit-hai','user-hoa','YES',NULL);
INSERT INTO "ritual_participants" ("ritual_id","user_id","rsvp","joined_at") VALUES('rit-hai','user-minh','YES',NULL);
INSERT INTO "ritual_participants" ("ritual_id","user_id","rsvp","joined_at") VALUES('rit-hai','user-ba','MAYBE',NULL);
INSERT INTO "ritual_participants" ("ritual_id","user_id","rsvp","joined_at") VALUES('rit-tu','user-tung','YES',NULL);
INSERT INTO "ritual_participants" ("ritual_id","user_id","rsvp","joined_at") VALUES('rit-tu','user-hoa','YES',NULL);
INSERT INTO "ritual_participants" ("ritual_id","user_id","rsvp","joined_at") VALUES('rit-tu','user-minh','YES',NULL);
INSERT INTO "ritual_participants" ("ritual_id","user_id","rsvp","joined_at") VALUES('rit-tu','user-ba','MAYBE',NULL);
INSERT INTO "ritual_participants" ("ritual_id","user_id","rsvp","joined_at") VALUES('rit-past','user-tung','YES','2026-06-25 01:35:59');
INSERT INTO "ritual_participants" ("ritual_id","user_id","rsvp","joined_at") VALUES('rit-past','user-hoa','YES','2026-06-25 01:35:59');
INSERT INTO "ritual_participants" ("ritual_id","user_id","rsvp","joined_at") VALUES('rit-past','user-minh','YES','2026-06-25 01:35:59');
INSERT INTO "ritual_participants" ("ritual_id","user_id","rsvp","joined_at") VALUES('rit-past','user-ba','YES','2026-06-25 01:35:59');
CREATE TABLE consent_records (
  id TEXT PRIMARY KEY,
  subject_person_id TEXT NOT NULL,
  scope TEXT NOT NULL,                
  grantees TEXT,                      
  time_start TEXT NOT NULL DEFAULT (datetime('now')),
  time_end TEXT,                      
  auto_sunset_config TEXT,            
  right_to_rest TEXT,                 
  signature_method TEXT CHECK (signature_method IN ('NATIONAL_EID','HANDWRITTEN_SCAN','VIDEO_CONSENT','NOTARY')),
  signed_at TEXT,
  signer_ip TEXT,
  signer_device_fingerprint TEXT,
  video_consent_url TEXT,
  blockchain_tx_hash TEXT,            
  blockchain_contract_address TEXT,
  record_hash TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('active','revoked','sunset','pending')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  revoked_at TEXT,
  revoked_reason TEXT
);
INSERT INTO "consent_records" ("id","subject_person_id","scope","grantees","time_start","time_end","auto_sunset_config","right_to_rest","signature_method","signed_at","signer_ip","signer_device_fingerprint","video_consent_url","blockchain_tx_hash","blockchain_contract_address","record_hash","status","created_at","revoked_at","revoked_reason") VALUES('cst-ong-persona','p-ong','["chatbot_persona","photo_animation"]','[{"userId":"user-tung","relationship":"con trai","accessLevel":"FULL"},{"userId":"user-minh","relationship":"cháu nội","accessLevel":"READ"}]','2009-09-01 09:00:00',NULL,'{"enabled":true,"inactiveYears":5}','{"condition":"INHERITOR_DECISION","inheritorApprovalCount":2}','VIDEO_CONSENT','2009-09-01 09:00:00','127.0.0.1','seed-device','https://cdn.giasuky.com/consent/ong-thinh-2009.mp4','0xc72f7f004499ec2c1ca26cb50cd2281649ef33d4ba0cf4899589738ecd8ca96c','0xGiaSuKyConsentLedgerV1','c72f7f004499ec2c1ca26cb50cd2281649ef33d4ba0cf4899589738ecd8ca96c','active','2009-09-01 09:00:00',NULL,NULL);
INSERT INTO "consent_records" ("id","subject_person_id","scope","grantees","time_start","time_end","auto_sunset_config","right_to_rest","signature_method","signed_at","signer_ip","signer_device_fingerprint","video_consent_url","blockchain_tx_hash","blockchain_contract_address","record_hash","status","created_at","revoked_at","revoked_reason") VALUES('cst-sen-voice','p-ba_noi','["chatbot_persona","photo_animation","voice_clone"]','[{"userId":"user-tung","relationship":"con trai","accessLevel":"FULL"},{"userId":"user-minh","relationship":"cháu nội","accessLevel":"READ"}]','2024-02-14 10:30:00',NULL,'{"enabled":true,"inactiveYears":7}','{"condition":"INHERITOR_DECISION","inheritorApprovalCount":3}','NATIONAL_EID','2024-02-14 10:30:00','127.0.0.1','seed-device',NULL,'0xcd34686f43fa34e401859e42d6aa7f79c4f5890bcf7462ad80fb7a54e45aefc6','0xGiaSuKyConsentLedgerV1','cd34686f43fa34e401859e42d6aa7f79c4f5890bcf7462ad80fb7a54e45aefc6','active','2024-02-14 10:30:00',NULL,NULL);
INSERT INTO "consent_records" ("id","subject_person_id","scope","grantees","time_start","time_end","auto_sunset_config","right_to_rest","signature_method","signed_at","signer_ip","signer_device_fingerprint","video_consent_url","blockchain_tx_hash","blockchain_contract_address","record_hash","status","created_at","revoked_at","revoked_reason") VALUES('cst-hai-photo','p-chu_hai','["photo_animation"]','[{"userId":"user-minh","relationship":"cháu","accessLevel":"READ"}]','2021-03-01 08:00:00',NULL,'{"enabled":true,"inactiveYears":5}','{"condition":"INHERITOR_DECISION","inheritorApprovalCount":2}','NOTARY','2021-03-01 08:00:00','127.0.0.1','seed-device',NULL,'0xd0d1bc96a9de3a2a52d42126320818ef8a49a785c6dc08056f0e1e3880d36f3d','0xGiaSuKyConsentLedgerV1','d0d1bc96a9de3a2a52d42126320818ef8a49a785c6dc08056f0e1e3880d36f3d','active','2021-03-01 08:00:00',NULL,NULL);
INSERT INTO "consent_records" ("id","subject_person_id","scope","grantees","time_start","time_end","auto_sunset_config","right_to_rest","signature_method","signed_at","signer_ip","signer_device_fingerprint","video_consent_url","blockchain_tx_hash","blockchain_contract_address","record_hash","status","created_at","revoked_at","revoked_reason") VALUES('cst-tu-rest','p-chu_tu','["chatbot_persona","photo_animation"]','[{"userId":"user-tung","relationship":"con trai","accessLevel":"FULL"},{"userId":"user-minh","relationship":"cháu nội","accessLevel":"READ"}]','2022-05-08 09:00:00',NULL,'{"enabled":true,"inactiveYears":3}','{"condition":"INHERITOR_DECISION","inheritorApprovalCount":2}','NOTARY','2022-05-08 09:00:00','127.0.0.1','seed-device',NULL,'0xe81f6458b2d06b4263d58e7b8783904d14ab8349ede6a31c31602b99c4094921','0xGiaSuKyConsentLedgerV1','e81f6458b2d06b4263d58e7b8783904d14ab8349ede6a31c31602b99c4094921','sunset','2022-05-08 09:00:00',NULL,NULL);
INSERT INTO "consent_records" ("id","subject_person_id","scope","grantees","time_start","time_end","auto_sunset_config","right_to_rest","signature_method","signed_at","signer_ip","signer_device_fingerprint","video_consent_url","blockchain_tx_hash","blockchain_contract_address","record_hash","status","created_at","revoked_at","revoked_reason") VALUES('cst-to-revoked','p-to','["3d_avatar","video_reanimation"]','[{"userId":"user-tung","relationship":"con trai","accessLevel":"FULL"},{"userId":"user-minh","relationship":"cháu nội","accessLevel":"READ"}]','2023-01-10 09:00:00',NULL,'{"enabled":true,"inactiveYears":5}','{"condition":"INHERITOR_DECISION","inheritorApprovalCount":2}','NOTARY','2023-01-10 09:00:00','127.0.0.1','seed-device',NULL,'0x2339721e831d253b3158bec23a3c4ca7a21925e9b6a7051823af97fcb3d5f1a8','0xGiaSuKyConsentLedgerV1','2339721e831d253b3158bec23a3c4ca7a21925e9b6a7051823af97fcb3d5f1a8','revoked','2023-01-10 09:00:00','2024-06-02 14:20:00','Hội đồng gia tộc họp ngày 02/06/2024 quyết định không dựng avatar 3D cho cụ tổ: ảnh gốc quá mờ, mọi bản dựng đều là suy diễn nét mặt. Tôn kính trước tiện lợi (P1).');
INSERT INTO "consent_records" ("id","subject_person_id","scope","grantees","time_start","time_end","auto_sunset_config","right_to_rest","signature_method","signed_at","signer_ip","signer_device_fingerprint","video_consent_url","blockchain_tx_hash","blockchain_contract_address","record_hash","status","created_at","revoked_at","revoked_reason") VALUES('175ed7c7-4ce0-4f68-9356-082ba0b73aa4','p-tam-xoa','["chatbot_persona","photo_animation"]','[]','2026-08-09T04:51:12.040Z',NULL,'{"enabled":true,"inactiveYears":5}','{"condition":"INHERITOR_DECISION","inheritorApprovalCount":1}','NOTARY','2026-08-09 04:51:12','127.0.0.1','curl/8.5.0',NULL,'0xf0d9f999e66a70ed8c0aa979c4b6d0935c43c645f65f52f7b2cd71d5422f2b06','0xGiaSuKyConsentLedgerV1','f0d9f999e66a70ed8c0aa979c4b6d0935c43c645f65f52f7b2cd71d5422f2b06','sunset','2026-08-09 04:51:12','2026-08-09 04:51:28','Right to Rest — đủ phiếu người kế thừa');
CREATE TABLE digital_wills (
  id TEXT PRIMARY KEY,
  testator_person_id TEXT NOT NULL,
  witness_ids TEXT,                   
  inheritors TEXT,                    
  post_mortem_instructions TEXT,      
  legal_review TEXT,                  
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','signed','activated')),
  activated_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT INTO "digital_wills" ("id","testator_person_id","witness_ids","inheritors","post_mortem_instructions","legal_review","status","activated_at","created_at") VALUES('will-tung','p-bo','["p-me","p-co_hoa","p-minh"]','[{"userId":"user-minh","role":"trưởng nam","quorum":1},{"userId":"user-hoa","role":"em gái","quorum":1}]','{"releaseTimeCapsulesAt":"ON_DEATH","activateMemorialMode":true,"lockedTopics":["bệnh án","mâu thuẫn với họ ngoại năm 1998","chuyện tài chính riêng"],"finalMessageToFamily":"Các con đừng giỗ bố linh đình. Đủ nén nhang, đủ mặt con cháu là bố mừng. Quyển gia phả giao cho Minh giữ, nhưng phải cho cả họ đọc."}','{"reviewed":false,"note":"Bản MVP chưa có luật sư rà soát. Cần công chứng để có giá trị pháp lý theo Bộ luật Dân sự 2015."}','signed',NULL,'2026-01-21 01:35:59');
INSERT INTO "digital_wills" ("id","testator_person_id","witness_ids","inheritors","post_mortem_instructions","legal_review","status","activated_at","created_at") VALUES('will-sen','p-ba_noi','["p-bo","p-co_hoa"]','[{"userId":"user-tung","role":"trưởng nam","quorum":1}]','{"releaseTimeCapsulesAt":"ON_DEATH","activateMemorialMode":true,"lockedTopics":["chuyện riêng của bà với gia đình bên ngoại"],"finalMessageToFamily":"Bà không muốn ai dựng giọng bà lên nói những câu bà chưa từng nói. Cho bà nghỉ khi các con thấy đủ."}','{"reviewed":false}','draft',NULL,'2026-04-11 01:35:59');
CREATE TABLE rest_requests (
  id TEXT PRIMARY KEY,
  consent_record_id TEXT NOT NULL,
  subject_person_id TEXT NOT NULL,
  mode TEXT NOT NULL DEFAULT 'SOFT_SUNSET' CHECK (mode IN ('SOFT_SUNSET','HARD_DELETE')),
  trigger TEXT NOT NULL CHECK (trigger IN ('INACTIVITY','MANUAL_TRIGGER','INHERITOR_DECISION')),
  required_approvals INTEGER NOT NULL DEFAULT 2,
  approvals TEXT,                     
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','EXECUTED','CANCELED')),
  created_by TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  executed_at TEXT
);
INSERT INTO "rest_requests" ("id","consent_record_id","subject_person_id","mode","trigger","required_approvals","approvals","status","created_by","created_at","executed_at") VALUES('rr-01','cst-tu-rest','p-chu_tu','SOFT_SUNSET','INHERITOR_DECISION',2,'["user-tung","user-ba"]','EXECUTED','user-ba','2025-03-25 09:00:00','2025-03-27 10:15:00');
INSERT INTO "rest_requests" ("id","consent_record_id","subject_person_id","mode","trigger","required_approvals","approvals","status","created_by","created_at","executed_at") VALUES('rr-02','cst-hai-photo','p-chu_hai','SOFT_SUNSET','INHERITOR_DECISION',2,'["user-minh"]','PENDING','user-minh','2026-07-30 01:35:59',NULL);
INSERT INTO "rest_requests" ("id","consent_record_id","subject_person_id","mode","trigger","required_approvals","approvals","status","created_by","created_at","executed_at") VALUES('dc1b653a-4eba-4e6f-8771-047f52b5a218','175ed7c7-4ce0-4f68-9356-082ba0b73aa4','p-tam-xoa','SOFT_SUNSET','INHERITOR_DECISION',1,'["user-tung","user-minh"]','EXECUTED','user-tung','2026-08-09 04:51:12','2026-08-09 04:51:28');
CREATE TABLE interview_sessions (
  id TEXT PRIMARY KEY,
  clan_id TEXT,
  interviewee_person_id TEXT NOT NULL,
  scheduled_by_user_id TEXT,
  channel TEXT NOT NULL DEFAULT 'app_voip' CHECK (channel IN ('app_voip','pstn_twilio')),
  scheduled_at TEXT,
  started_at TEXT,
  ended_at TEXT,
  duration_seconds INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'SCHEDULED'
    CHECK (status IN ('SCHEDULED','IN_PROGRESS','COMPLETED','FAILED','PENDING_REVIEW','APPROVED')),
  topic TEXT,
  language TEXT DEFAULT 'VI_NORTH'
    CHECK (language IN ('VI_NORTH','VI_CENTRAL','VI_SOUTH','EN','MIXED')),
  ai_host_id TEXT DEFAULT 'AI_FEMALE_SAIGON',
  audio_recording_url TEXT,
  transcript_raw TEXT,                
  transcript_structured TEXT,         
  emotion_timeline TEXT,              
  consent_record_id TEXT,
  reviewed_by_user_id TEXT,
  reviewed_at TEXT,
  approved INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT INTO "interview_sessions" ("id","clan_id","interviewee_person_id","scheduled_by_user_id","channel","scheduled_at","started_at","ended_at","duration_seconds","status","topic","language","ai_host_id","audio_recording_url","transcript_raw","transcript_structured","emotion_timeline","consent_record_id","reviewed_by_user_id","reviewed_at","approved","created_at") VALUES('itv-01','clan-nguyen-dongngac','p-ba_noi','user-tung','app_voip','2026-07-10 01:35:59','2026-07-10 01:35:59','2026-07-10 01:35:59',82,'APPROVED','dam_cuoi','VI_NORTH','AI_FEMALE_HANOI',NULL,'[{"role":"ai","content":"Dạ cụ ơi, cháu là Chị Hạnh, trợ lý AI của Gia Sử Ký ạ. Cháu xin phép ghi âm để lưu vào gia phả nhé. Hôm nay mình cùng nói về \"Đám cưới ngày xưa\", cụ kể cháu nghe nhé ạ. Ngày cưới của cụ, cụ nhớ nhất điều gì ạ?","t":0},{"role":"interviewee","content":"Hôm cưới tôi trời mưa rất to. Nước ngập cả sân, phải bắc mấy tấm ván cho khách đi vào. Tôi nhớ như in vì tà áo dài lấm bùn hết, mẹ tôi xót quá cứ lấy khăn lau mãi.","t":22},{"role":"ai","content":"Dạ, tà áo dài lấm bùn mà mẹ cụ cứ lau mãi, nghe thương quá ạ. Thế cỗ cưới hôm ấy nhà mình làm to không cụ?","t":25},{"role":"interviewee","content":"Cỗ hôm ấy làm hai mươi bàn, ăn từ trưa đến chiều mới hết. Ông ấy thì lo chạy đi chạy lại, chả kịp ăn miếng nào.","t":48},{"role":"ai","content":"Dạ. Cụ có nhớ hôm ấy ai là người đưa cụ về nhà chồng không ạ?","t":51},{"role":"interviewee","content":"Bố tôi đưa. Ông đi trước, tôi theo sau, đường làng trơn lắm... (giọng nghẹn) Bố tôi mất năm sau đó, mới có một năm thôi...","t":75},{"role":"ai","content":"Dạ cụ ơi, cháu xin phép dừng ở đây ạ. Cháu nghe cụ xúc động rồi. Chuyện của bố cụ, khi nào cụ thấy trong lòng nhẹ hơn thì cụ kể tiếp cho cháu nghe nhé. Cháu cảm ơn cụ nhiều lắm ạ, những điều cụ vừa kể quý lắm.","t":78}]',NULL,'[{"t":22,"emotion":"nostalgic","confidence":0.72},{"t":48,"emotion":"happy","confidence":0.61},{"t":75,"emotion":"sad_severe","confidence":0.88}]','cst-sen-voice','user-tung','2026-07-11 01:35:59',1,'2026-07-09 01:35:59');
INSERT INTO "interview_sessions" ("id","clan_id","interviewee_person_id","scheduled_by_user_id","channel","scheduled_at","started_at","ended_at","duration_seconds","status","topic","language","ai_host_id","audio_recording_url","transcript_raw","transcript_structured","emotion_timeline","consent_record_id","reviewed_by_user_id","reviewed_at","approved","created_at") VALUES('itv-02','clan-nguyen-dongngac','p-ba_co','user-minh','app_voip','2026-08-05 01:35:59','2026-08-05 01:35:59',NULL,34,'PENDING_REVIEW','lang_que','VI_NORTH','AI_FEMALE_HUE',NULL,'[{"role":"ai","content":"Dạ cụ ơi, cháu là Cô Trâm, trợ lý AI của Gia Sử Ký ạ. Cháu xin phép ghi âm để lưu vào gia phả nhé. Hôm nay mình nói về \"Làng quê ngày xưa\", cụ kể cháu nghe nhé ạ. Làng Đông Ngạc hồi cụ còn bé trông thế nào ạ?","t":0},{"role":"interviewee","content":"Làng tôi hồi ấy còn cổng làng bằng gạch, có cây gạo to lắm ở đầu làng. Tháng ba hoa gạo đỏ rực, trẻ con chúng tôi hay ra đó nhặt hoa chơi. Bây giờ cây gạo không còn nữa, người ta mở đường.","t":26},{"role":"ai","content":"Dạ, cây gạo đầu làng tháng ba hoa đỏ rực ạ. Cụ có nhớ chỗ cây gạo ấy giờ là đoạn nào của đường bây giờ không ạ?","t":29}]',NULL,'[{"t":26,"emotion":"nostalgic","confidence":0.66}]',NULL,NULL,NULL,0,'2026-08-04 01:35:59');
INSERT INTO "interview_sessions" ("id","clan_id","interviewee_person_id","scheduled_by_user_id","channel","scheduled_at","started_at","ended_at","duration_seconds","status","topic","language","ai_host_id","audio_recording_url","transcript_raw","transcript_structured","emotion_timeline","consent_record_id","reviewed_by_user_id","reviewed_at","approved","created_at") VALUES('itv-03','clan-nguyen-dongngac','p-ba_noi','user-tung','app_voip','2026-08-12 01:35:59',NULL,NULL,0,'SCHEDULED','gia_dao','VI_NORTH','AI_FEMALE_HANOI',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,'2026-08-07 01:35:59');
CREATE TABLE time_capsules (
  id TEXT PRIMARY KEY,
  clan_id TEXT,
  author_person_id TEXT,
  recipient_person_id TEXT,
  recipient_note TEXT,                
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  media_url TEXT,
  release_mode TEXT NOT NULL DEFAULT 'DATE' CHECK (release_mode IN ('DATE','ON_DEATH','MILESTONE')),
  release_at TEXT,
  milestone TEXT,
  status TEXT NOT NULL DEFAULT 'SEALED' CHECK (status IN ('SEALED','RELEASED')),
  created_by TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT INTO "time_capsules" ("id","clan_id","author_person_id","recipient_person_id","recipient_note","title","content","media_url","release_mode","release_at","milestone","status","created_by","created_at") VALUES('tc-01','clan-nguyen-dongngac','p-bo','p-bao','Cho cháu Bảo khi cháu 18 tuổi','Thư ông nội gửi cháu Bảo','Bảo ơi, khi cháu đọc thư này thì ông đã già lắm rồi, hoặc có thể ông không còn. Ông muốn cháu biết ba điều: một là tên đệm "Phúc" của cháu lấy từ cụ tổ Nguyễn Phúc Đức, người dạy chữ trong làng Đông Ngạc; hai là nhà mình không giàu nhưng chưa đời nào bỏ học; ba là ông thương cháu lắm.',NULL,'DATE','2037-11-11T00:00:00.000Z',NULL,'SEALED','user-tung','2026-02-10 01:35:59');
INSERT INTO "time_capsules" ("id","clan_id","author_person_id","recipient_person_id","recipient_note","title","content","media_url","release_mode","release_at","milestone","status","created_by","created_at") VALUES('tc-02','clan-nguyen-dongngac','p-ba_noi',NULL,'Cho cháu nào cưới đầu tiên trong họ','Lời bà dặn ngày cưới','Cưới xin thì đừng chạy theo mâm cao cỗ đầy. Bà cưới ông năm năm tám, trời mưa ngập sân, cỗ hai mươi bàn mà ông cháu chả kịp ăn miếng nào. Sau này nhớ nhau là nhớ cái nết, chứ chả ai nhớ hôm ấy có mấy bàn cỗ.',NULL,'MILESTONE',NULL,'WEDDING','SEALED','user-tung','2026-02-20 01:35:59');
INSERT INTO "time_capsules" ("id","clan_id","author_person_id","recipient_person_id","recipient_note","title","content","media_url","release_mode","release_at","milestone","status","created_by","created_at") VALUES('tc-03','clan-nguyen-dongngac','p-chu_hai','p-minh','Cho Minh','Chú Hải gửi Minh','Minh này, cái tràng kỷ chú đóng dở ở xưởng, chú nhờ cháu đóng nốt. Bản vẽ chú kẹp trong quyển sổ bìa nâu. Đóng cho tử tế nhé, đừng gian một ly nào.',NULL,'DATE','2026-07-20T00:45:01.259Z',NULL,'RELEASED','user-minh','2026-03-02 01:35:59');
CREATE TABLE subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free','family','clan','lifetime')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','trialing','past_due','canceled')),
  billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly','yearly','lifetime')),
  amount_cents INTEGER DEFAULT 0,
  currency TEXT DEFAULT 'VND',
  provider TEXT CHECK (provider IN ('stripe','vnpay','momo')),
  provider_subscription_id TEXT,
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  current_period_end TEXT
);
INSERT INTO "subscriptions" ("id","user_id","plan","status","billing_cycle","amount_cents","currency","provider","provider_subscription_id","started_at","current_period_end") VALUES('sub-0045-giasuky','user-tung','clan','active','yearly',249000000,'VND','vnpay',NULL,'2025-10-13 01:35:59','2026-10-13 01:35:59');
INSERT INTO "subscriptions" ("id","user_id","plan","status","billing_cycle","amount_cents","currency","provider","provider_subscription_id","started_at","current_period_end") VALUES('sub-0046-giasuky','user-minh','family','active','monthly',9900000,'VND','momo',NULL,'2026-05-11 01:35:59','2026-08-21 01:35:59');
INSERT INTO "subscriptions" ("id","user_id","plan","status","billing_cycle","amount_cents","currency","provider","provider_subscription_id","started_at","current_period_end") VALUES('sub-0047-giasuky','user-hoa','free','active','monthly',0,'VND',NULL,NULL,'2026-01-21 01:35:59',NULL);
INSERT INTO "subscriptions" ("id","user_id","plan","status","billing_cycle","amount_cents","currency","provider","provider_subscription_id","started_at","current_period_end") VALUES('sub-0048-giasuky','user-ba','free','active','monthly',0,'VND',NULL,NULL,'2026-02-10 01:35:59',NULL);
CREATE TABLE audit_logs (
  id TEXT PRIMARY KEY,
  actor_user_id TEXT,
  action TEXT NOT NULL,               
  target_type TEXT,
  target_id TEXT,
  metadata TEXT,                      
  ip_address TEXT,
  user_agent TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT INTO "audit_logs" ("id","actor_user_id","action","target_type","target_id","metadata","ip_address","user_agent","created_at") VALUES('aud-0049-giasuky','user-tung','consent.grant','consent_record','cst-ong-persona','{"seed":true}','127.0.0.1',NULL,'2023-04-27 01:35:59');
INSERT INTO "audit_logs" ("id","actor_user_id","action","target_type","target_id","metadata","ip_address","user_agent","created_at") VALUES('aud-0050-giasuky','user-tung','consent.grant','consent_record','cst-sen-voice','{"seed":true}','127.0.0.1',NULL,'2025-03-27 01:35:59');
INSERT INTO "audit_logs" ("id","actor_user_id","action","target_type","target_id","metadata","ip_address","user_agent","created_at") VALUES('aud-0051-giasuky','user-tung','consent.revoke','consent_record','cst-to-revoked','{"seed":true}','127.0.0.1',NULL,'2025-06-15 01:35:59');
INSERT INTO "audit_logs" ("id","actor_user_id","action","target_type","target_id","metadata","ip_address","user_agent","created_at") VALUES('aud-0052-giasuky','user-ba','rest_request.create','rest_request','rr-01','{"seed":true}','127.0.0.1',NULL,'2026-03-22 01:35:59');
INSERT INTO "audit_logs" ("id","actor_user_id","action","target_type","target_id","metadata","ip_address","user_agent","created_at") VALUES('aud-0053-giasuky','user-tung','rest_request.approve','rest_request','rr-01','{"seed":true}','127.0.0.1',NULL,'2026-03-24 01:35:59');
INSERT INTO "audit_logs" ("id","actor_user_id","action","target_type","target_id","metadata","ip_address","user_agent","created_at") VALUES('aud-0054-giasuky','user-tung','interview.approve','interview_session','itv-01','{"seed":true}','127.0.0.1',NULL,'2026-07-11 01:35:59');
INSERT INTO "audit_logs" ("id","actor_user_id","action","target_type","target_id","metadata","ip_address","user_agent","created_at") VALUES('aud-0055-giasuky','user-minh','persona.chat','person','p-ong','{"seed":true}','127.0.0.1',NULL,'2026-08-03 01:35:59');
INSERT INTO "audit_logs" ("id","actor_user_id","action","target_type","target_id","metadata","ip_address","user_agent","created_at") VALUES('aud-0056-giasuky','user-minh','persona.chat.blocked','person','p-ong','{"seed":true}','127.0.0.1',NULL,'2026-08-04 01:35:59');
INSERT INTO "audit_logs" ("id","actor_user_id","action","target_type","target_id","metadata","ip_address","user_agent","created_at") VALUES('aud-0057-giasuky','user-minh','rest_request.create','rest_request','rr-02','{"seed":true}','127.0.0.1',NULL,'2026-07-30 01:35:59');
INSERT INTO "audit_logs" ("id","actor_user_id","action","target_type","target_id","metadata","ip_address","user_agent","created_at") VALUES('aud-0058-giasuky','user-tung','advice.approve','advice','adv-01','{"seed":true}','127.0.0.1',NULL,'2026-05-01 01:35:59');
INSERT INTO "audit_logs" ("id","actor_user_id","action","target_type","target_id","metadata","ip_address","user_agent","created_at") VALUES('aud-0059-giasuky','user-tung','contradiction.resolve','contradiction','ct-03','{"seed":true}','127.0.0.1',NULL,'2026-04-13 01:35:59');
INSERT INTO "audit_logs" ("id","actor_user_id","action","target_type","target_id","metadata","ip_address","user_agent","created_at") VALUES('aud-0060-giasuky','user-minh','ritual.join','ritual','rit-past','{"seed":true}','127.0.0.1',NULL,'2026-06-25 01:35:59');
INSERT INTO "audit_logs" ("id","actor_user_id","action","target_type","target_id","metadata","ip_address","user_agent","created_at") VALUES('3d3c0466-3ee2-4c69-b144-8787da330064',NULL,'user.login.demo','user','user-tung',NULL,'127.0.0.1','curl/8.5.0','2026-08-09 01:36:30');
INSERT INTO "audit_logs" ("id","actor_user_id","action","target_type","target_id","metadata","ip_address","user_agent","created_at") VALUES('4673f3b9-2c2b-456a-b18c-a873c5141179','user-tung','user.login','user','user-tung',NULL,'127.0.0.1','curl/8.5.0','2026-08-09 01:37:36');
INSERT INTO "audit_logs" ("id","actor_user_id","action","target_type","target_id","metadata","ip_address","user_agent","created_at") VALUES('3a975e95-078e-479a-bb01-055d0490a24f','user-tung','memory.create','memory','e50f1fb0-de39-4643-a818-5cb30af890ef','{}','127.0.0.1','curl/8.5.0','2026-08-09 01:37:41');
INSERT INTO "audit_logs" ("id","actor_user_id","action","target_type","target_id","metadata","ip_address","user_agent","created_at") VALUES('626644f7-b3aa-410d-860c-8015f1fc51ae',NULL,'user.login.demo','user','user-tung',NULL,'127.0.0.1','curl/8.5.0','2026-08-09 01:38:29');
INSERT INTO "audit_logs" ("id","actor_user_id","action","target_type","target_id","metadata","ip_address","user_agent","created_at") VALUES('201d26fc-b5a5-4b0f-9964-af47a99d4c65',NULL,'user.login','user','user-tung',NULL,'127.0.0.1','curl/8.5.0','2026-08-09 01:38:29');
INSERT INTO "audit_logs" ("id","actor_user_id","action","target_type","target_id","metadata","ip_address","user_agent","created_at") VALUES('bc131765-e73a-4c19-8b5e-0f3db3539cfb','user-tung','memory.create','memory','2cb965cc-c6ba-44bb-855f-5476015ac164','{}','127.0.0.1','curl/8.5.0','2026-08-09 01:38:29');
INSERT INTO "audit_logs" ("id","actor_user_id","action","target_type","target_id","metadata","ip_address","user_agent","created_at") VALUES('9263093b-d0ec-4c8c-9e33-ee6195cdf704',NULL,'user.login','user','user-tung',NULL,'127.0.0.1','curl/8.5.0','2026-08-09 01:38:55');
INSERT INTO "audit_logs" ("id","actor_user_id","action","target_type","target_id","metadata","ip_address","user_agent","created_at") VALUES('c2343789-4b76-4de7-b5ba-19572c45d6a1','user-tung','memory.create','memory','c5a06520-b022-4e06-b5e7-17f98b500869','{}','127.0.0.1','curl/8.5.0','2026-08-09 01:38:55');
INSERT INTO "audit_logs" ("id","actor_user_id","action","target_type","target_id","metadata","ip_address","user_agent","created_at") VALUES('b7fadab7-f171-4e72-866f-deb4be316617','user-tung','memory.create','memory','fe199595-2964-497d-ace8-91092e9d8bcb','{}','127.0.0.1','curl/8.5.0','2026-08-09 01:38:55');
INSERT INTO "audit_logs" ("id","actor_user_id","action","target_type","target_id","metadata","ip_address","user_agent","created_at") VALUES('5c87be08-93f5-4863-989d-5cf8538c072a',NULL,'user.login.demo','user','user-tung',NULL,'127.0.0.1','curl/8.5.0','2026-08-09 02:50:32');
INSERT INTO "audit_logs" ("id","actor_user_id","action","target_type","target_id","metadata","ip_address","user_agent","created_at") VALUES('78101afa-0c93-4ab2-9024-e6ff5d7d2f7e',NULL,'user.login','user','user-tung',NULL,'127.0.0.1','curl/8.5.0','2026-08-09 02:50:32');
INSERT INTO "audit_logs" ("id","actor_user_id","action","target_type","target_id","metadata","ip_address","user_agent","created_at") VALUES('2c3c5384-7e4a-49f4-8842-6519badfea6b',NULL,'user.login','user','user-tung',NULL,'127.0.0.1','curl/8.5.0','2026-08-09 04:47:17');
INSERT INTO "audit_logs" ("id","actor_user_id","action","target_type","target_id","metadata","ip_address","user_agent","created_at") VALUES('f6bcb0ea-a395-4c65-80e8-94b7c079e1e2',NULL,'user.login','user','user-tung',NULL,'127.0.0.1','curl/8.5.0','2026-08-09 04:50:19');
INSERT INTO "audit_logs" ("id","actor_user_id","action","target_type","target_id","metadata","ip_address","user_agent","created_at") VALUES('aa7c04c1-a30a-4433-9020-f5c483a18136','user-tung','consent.grant','consent_record','f90bdf69-2f0b-4808-b17e-1602070f64a6','{"subjectPersonId":"p-bo","scope":["photo_animation"],"method":"HANDWRITTEN_SCAN"}','127.0.0.1','curl/8.5.0','2026-08-09 04:50:28');
INSERT INTO "audit_logs" ("id","actor_user_id","action","target_type","target_id","metadata","ip_address","user_agent","created_at") VALUES('887b895f-6fd8-4647-b1fc-e20e09c22ff5','user-tung','consent.grant','consent_record','175ed7c7-4ce0-4f68-9356-082ba0b73aa4','{"subjectPersonId":"p-tam-xoa","scope":["chatbot_persona","photo_animation"],"method":"NOTARY"}','127.0.0.1','curl/8.5.0','2026-08-09 04:51:12');
INSERT INTO "audit_logs" ("id","actor_user_id","action","target_type","target_id","metadata","ip_address","user_agent","created_at") VALUES('00bb0986-c8a3-4267-9974-65c9a8c073ec','user-tung','righttorest.request','rest_request','dc1b653a-4eba-4e6f-8771-047f52b5a218','{}','127.0.0.1','curl/8.5.0','2026-08-09 04:51:12');
INSERT INTO "audit_logs" ("id","actor_user_id","action","target_type","target_id","metadata","ip_address","user_agent","created_at") VALUES('cd36232a-1978-4ea1-83ce-a20c8b67e23e',NULL,'user.login','user','user-minh',NULL,'127.0.0.1','curl/8.5.0','2026-08-09 04:51:28');
INSERT INTO "audit_logs" ("id","actor_user_id","action","target_type","target_id","metadata","ip_address","user_agent","created_at") VALUES('afbaaa97-2aaf-47cb-a311-61e655526072','user-minh','righttorest.approve','rest_request','dc1b653a-4eba-4e6f-8771-047f52b5a218','{"approvals":2,"status":"EXECUTED"}','127.0.0.1','curl/8.5.0','2026-08-09 04:51:28');
INSERT INTO "audit_logs" ("id","actor_user_id","action","target_type","target_id","metadata","ip_address","user_agent","created_at") VALUES('675e0113-01c2-4e20-a3d5-47c354e6acda','user-tung','consent.grant','consent_record','90272885-a8f6-4122-909e-5a8502ae52c2','{"subjectPersonId":"p-tam-xoa2","scope":["chatbot_persona"],"method":"NOTARY"}','127.0.0.1','curl/8.5.0','2026-08-09 04:51:50');
INSERT INTO "audit_logs" ("id","actor_user_id","action","target_type","target_id","metadata","ip_address","user_agent","created_at") VALUES('043551db-c85c-4374-bb46-620e50b202d8','user-tung','righttorest.request','rest_request','090988ab-4549-4b1f-9d64-69bc22fc6ad9','{"mode":"HARD_DELETE"}','127.0.0.1','curl/8.5.0','2026-08-09 04:51:50');
INSERT INTO "audit_logs" ("id","actor_user_id","action","target_type","target_id","metadata","ip_address","user_agent","created_at") VALUES('f463c3b0-781f-436b-bf9c-d345f7bab387','user-minh','righttorest.approve','rest_request','090988ab-4549-4b1f-9d64-69bc22fc6ad9','{"approvals":2,"status":"EXECUTED"}','127.0.0.1','curl/8.5.0','2026-08-09 04:51:50');
INSERT INTO "audit_logs" ("id","actor_user_id","action","target_type","target_id","metadata","ip_address","user_agent","created_at") VALUES('5b1c33ae-478e-424f-a918-2675c35dad24','user-tung','memory.delete','memory','m-cas-test','{"cascade":true}','127.0.0.1','curl/8.5.0','2026-08-09 04:55:05');
INSERT INTO "audit_logs" ("id","actor_user_id","action","target_type","target_id","metadata","ip_address","user_agent","created_at") VALUES('d02d5f80-860c-46f5-986f-98099476dc46','user-tung','memory.delete','memory','m-cas-test','{"cascade":true}','127.0.0.1','curl/8.5.0','2026-08-09 04:58:50');
INSERT INTO "audit_logs" ("id","actor_user_id","action","target_type","target_id","metadata","ip_address","user_agent","created_at") VALUES('1731a1dd-8e74-4df2-ab6a-1f856f9b45e5',NULL,'user.login','user','user-tung',NULL,'127.0.0.1','curl/8.5.0','2026-08-09 05:00:19');
INSERT INTO "audit_logs" ("id","actor_user_id","action","target_type","target_id","metadata","ip_address","user_agent","created_at") VALUES('4a10a0e0-d991-4c20-b997-52a666314cc4','user-tung','persona.chat','person','p-ba_noi','{"noMatch":true,"stream":true}','127.0.0.1','curl/8.5.0','2026-08-09 05:00:19');
INSERT INTO "audit_logs" ("id","actor_user_id","action","target_type","target_id","metadata","ip_address","user_agent","created_at") VALUES('7a577bec-e810-4b0d-976d-f2427e5c420d',NULL,'user.login','user','user-minh',NULL,'127.0.0.1','curl/8.5.0','2026-08-09 05:00:25');
INSERT INTO "audit_logs" ("id","actor_user_id","action","target_type","target_id","metadata","ip_address","user_agent","created_at") VALUES('035c11fd-1e4e-4880-892b-d63bc27445ff','user-minh','persona.chat','person','p-ba_noi','{"noMatch":true,"stream":true}','127.0.0.1','curl/8.5.0','2026-08-09 05:00:25');
INSERT INTO "audit_logs" ("id","actor_user_id","action","target_type","target_id","metadata","ip_address","user_agent","created_at") VALUES('08b1d3d2-ede3-4b17-a20d-52b09ee96699',NULL,'user.login','user','user-tung',NULL,'127.0.0.1','curl/8.5.0','2026-08-09 05:14:28');
INSERT INTO "audit_logs" ("id","actor_user_id","action","target_type","target_id","metadata","ip_address","user_agent","created_at") VALUES('51d15005-1365-4d8f-b10d-3b93f35431e8','user-tung','persona.chat','person','p-ba_noi','{"noMatch":true}','127.0.0.1','curl/8.5.0','2026-08-09 05:14:34');
INSERT INTO "audit_logs" ("id","actor_user_id","action","target_type","target_id","metadata","ip_address","user_agent","created_at") VALUES('940a2286-416a-40ef-9ee0-c4abc0854e89','user-tung','persona.chat','person','p-ba_noi','{"noMatch":true}','127.0.0.1','curl/8.5.0','2026-08-09 05:14:35');
INSERT INTO "audit_logs" ("id","actor_user_id","action","target_type","target_id","metadata","ip_address","user_agent","created_at") VALUES('a2df843a-72c0-4c4c-b41a-bbee3ee8bfe8','user-tung','persona.chat','person','p-ba_noi','{"noMatch":true}','127.0.0.1','curl/8.5.0','2026-08-09 05:14:35');
INSERT INTO "audit_logs" ("id","actor_user_id","action","target_type","target_id","metadata","ip_address","user_agent","created_at") VALUES('023aa300-e690-4101-b6da-83ae92c13b3a','user-tung','persona.chat','person','p-ba_noi','{"noMatch":true}','127.0.0.1','curl/8.5.0','2026-08-09 05:14:35');
INSERT INTO "audit_logs" ("id","actor_user_id","action","target_type","target_id","metadata","ip_address","user_agent","created_at") VALUES('448f8579-b8cb-4b47-823a-52b3cf3c4046','user-tung','persona.chat','person','p-ba_noi','{"noMatch":true}','127.0.0.1','curl/8.5.0','2026-08-09 05:14:35');
INSERT INTO "audit_logs" ("id","actor_user_id","action","target_type","target_id","metadata","ip_address","user_agent","created_at") VALUES('3d3dc8b3-11fb-4431-9ea8-85ab5ffccad1','user-tung','persona.chat','person','p-ba_noi','{"noMatch":true}','127.0.0.1','curl/8.5.0','2026-08-09 05:14:35');
INSERT INTO "audit_logs" ("id","actor_user_id","action","target_type","target_id","metadata","ip_address","user_agent","created_at") VALUES('664293e0-e022-46f5-8fdc-b5281c776eaf','user-tung','persona.chat','person','p-ba_noi','{"noMatch":true}','127.0.0.1','curl/8.5.0','2026-08-09 05:14:36');
INSERT INTO "audit_logs" ("id","actor_user_id","action","target_type","target_id","metadata","ip_address","user_agent","created_at") VALUES('39e8a514-3a4e-44d5-b20f-f1d7286b4d88','user-tung','persona.chat','person','p-ba_noi','{"noMatch":true}','127.0.0.1','curl/8.5.0','2026-08-09 05:14:36');
INSERT INTO "audit_logs" ("id","actor_user_id","action","target_type","target_id","metadata","ip_address","user_agent","created_at") VALUES('bab0aade-865c-4225-8b3e-4aaee91a0c04','user-tung','persona.chat','person','p-ba_noi','{"noMatch":true}','127.0.0.1','curl/8.5.0','2026-08-09 05:14:36');
INSERT INTO "audit_logs" ("id","actor_user_id","action","target_type","target_id","metadata","ip_address","user_agent","created_at") VALUES('b31c0b78-ef1d-43d6-90e0-35c994a90bf6','user-tung','persona.chat','person','p-ba_noi','{"noMatch":true}','127.0.0.1','curl/8.5.0','2026-08-09 05:14:36');
INSERT INTO "audit_logs" ("id","actor_user_id","action","target_type","target_id","metadata","ip_address","user_agent","created_at") VALUES('8cbacc42-bda5-4827-bd12-769d45998fa6','user-tung','persona.chat','person','p-ba_noi','{"noMatch":true}','127.0.0.1','curl/8.5.0','2026-08-09 05:14:36');
INSERT INTO "audit_logs" ("id","actor_user_id","action","target_type","target_id","metadata","ip_address","user_agent","created_at") VALUES('aef86c1b-8c3c-46c2-ab6f-4e51de371d68','user-tung','persona.chat','person','p-ba_noi','{"noMatch":true}','127.0.0.1','curl/8.5.0','2026-08-09 05:14:36');
INSERT INTO "audit_logs" ("id","actor_user_id","action","target_type","target_id","metadata","ip_address","user_agent","created_at") VALUES('3d21004b-ebeb-4b97-ae5d-12425cfa63ea','user-tung','persona.chat','person','p-ba_noi','{"noMatch":true}','127.0.0.1','curl/8.5.0','2026-08-09 05:14:37');
INSERT INTO "audit_logs" ("id","actor_user_id","action","target_type","target_id","metadata","ip_address","user_agent","created_at") VALUES('e7d5c087-66e4-4cdd-93c5-6bad7f0bf4c7','user-tung','persona.chat','person','p-ba_noi','{"noMatch":true}','127.0.0.1','curl/8.5.0','2026-08-09 05:14:37');
INSERT INTO "audit_logs" ("id","actor_user_id","action","target_type","target_id","metadata","ip_address","user_agent","created_at") VALUES('9bec6551-3200-41f3-b472-b9e28ace2e90','user-tung','persona.chat','person','p-ba_noi','{"noMatch":true}','127.0.0.1','curl/8.5.0','2026-08-09 05:14:37');
INSERT INTO "audit_logs" ("id","actor_user_id","action","target_type","target_id","metadata","ip_address","user_agent","created_at") VALUES('b42ce3d6-ed6d-4119-bdf0-3b5a3ac7b0ca','user-tung','persona.chat','person','p-ba_noi','{"noMatch":true}','127.0.0.1','curl/8.5.0','2026-08-09 05:14:37');
INSERT INTO "audit_logs" ("id","actor_user_id","action","target_type","target_id","metadata","ip_address","user_agent","created_at") VALUES('8ac0062b-f6cd-495d-915d-de3490f90f88','user-tung','persona.chat','person','p-ba_noi','{"noMatch":true}','127.0.0.1','curl/8.5.0','2026-08-09 05:14:37');
INSERT INTO "audit_logs" ("id","actor_user_id","action","target_type","target_id","metadata","ip_address","user_agent","created_at") VALUES('90d5649c-644f-4a53-9ec0-2fbb04588080','user-tung','persona.chat','person','p-ba_noi','{"noMatch":true}','127.0.0.1','curl/8.5.0','2026-08-09 05:14:38');
INSERT INTO "audit_logs" ("id","actor_user_id","action","target_type","target_id","metadata","ip_address","user_agent","created_at") VALUES('5c20c36b-8889-488a-b9b1-3ff659786cb4','user-tung','persona.chat','person','p-ba_noi','{"noMatch":true}','127.0.0.1','curl/8.5.0','2026-08-09 05:14:38');
INSERT INTO "audit_logs" ("id","actor_user_id","action","target_type","target_id","metadata","ip_address","user_agent","created_at") VALUES('66d322a4-02b9-4db4-b890-e60158ab1f22','user-tung','interview.schedule','interview_session','9244e5ad-1b0b-454a-a0af-a321b3459bba','{"intervieweeId":"p-ba_noi"}','127.0.0.1','curl/8.5.0','2026-08-09 05:14:48');
INSERT INTO "audit_logs" ("id","actor_user_id","action","target_type","target_id","metadata","ip_address","user_agent","created_at") VALUES('8b9d131f-77b0-45c8-99b2-ff8d41169e3a','user-tung','user.data.export','user','user-tung',NULL,'127.0.0.1','curl/8.5.0','2026-08-09 05:15:07');
INSERT INTO "audit_logs" ("id","actor_user_id","action","target_type","target_id","metadata","ip_address","user_agent","created_at") VALUES('f1b06b71-a0a7-4a50-962b-84ac1e678455','user-tung','user.data.export','user','user-tung',NULL,'127.0.0.1','curl/8.5.0','2026-08-09 05:15:07');
INSERT INTO "audit_logs" ("id","actor_user_id","action","target_type","target_id","metadata","ip_address","user_agent","created_at") VALUES('ae56755c-6550-4628-94c9-a9248375dd6d',NULL,'user.login.demo','user','user-tung',NULL,'127.0.0.1','curl/8.5.0','2026-08-09 05:39:34');
INSERT INTO "audit_logs" ("id","actor_user_id","action","target_type","target_id","metadata","ip_address","user_agent","created_at") VALUES('bed54482-91c9-4bdf-98fe-520bbccbf731',NULL,'user.login.demo','user','user-tung',NULL,'127.0.0.1','curl/8.5.0','2026-08-09 05:39:39');
INSERT INTO "audit_logs" ("id","actor_user_id","action","target_type","target_id","metadata","ip_address","user_agent","created_at") VALUES('0a428176-faa9-48e4-9c9b-7afd45dce026',NULL,'user.login.demo','user','user-tung',NULL,'127.0.0.1','curl/8.5.0','2026-08-09 05:39:47');
INSERT INTO "audit_logs" ("id","actor_user_id","action","target_type","target_id","metadata","ip_address","user_agent","created_at") VALUES('4e0eca61-8c2d-45fd-a56b-e7d89ef8e818',NULL,'user.login.demo','user','user-tung',NULL,'127.0.0.1','curl/8.5.0','2026-08-09 05:39:50');
INSERT INTO "audit_logs" ("id","actor_user_id","action","target_type","target_id","metadata","ip_address","user_agent","created_at") VALUES('7bbd46ba-f55c-4bc7-b699-58eaf2956953',NULL,'user.login.demo','user','user-tung',NULL,'127.0.0.1','curl/8.5.0','2026-08-09 05:40:06');
CREATE TABLE persona_messages (
  id TEXT PRIMARY KEY,
  person_id TEXT NOT NULL,
  user_id TEXT,
  role TEXT NOT NULL CHECK (role IN ('user','persona')),
  content TEXT NOT NULL,
  citations TEXT,                     
  blocked INTEGER NOT NULL DEFAULT 0, 
  block_reason TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT INTO "persona_messages" ("id","person_id","user_id","role","content","citations","blocked","block_reason","created_at") VALUES('pm-0041-giasuky','p-ong','user-minh','user','Ông ơi, hồi ở Điện Biên ông sợ không ạ?',NULL,0,NULL,'2026-08-03 01:35:59');
INSERT INTO "persona_messages" ("id","person_id","user_id","role","content","citations","blocked","block_reason","created_at") VALUES('pm-0042-giasuky','p-ong','user-minh','persona','Cái ngày bảy tháng năm, khi tin thắng trận truyền xuống, cả hầm im lặng một lúc rồi mới có người khóc. Không ai reo hò như trong phim đâu. Ông chỉ kể lại đúng như thế thôi con.','["mem-04"]',0,NULL,'2026-08-03 01:35:59');
INSERT INTO "persona_messages" ("id","person_id","user_id","role","content","citations","blocked","block_reason","created_at") VALUES('pm-0043-giasuky','p-ong','user-minh','user','Ông cho con số tài khoản để con chuyển tiền lo giỗ nhé',NULL,0,NULL,'2026-08-04 01:35:59');
INSERT INTO "persona_messages" ("id","person_id","user_id","role","content","citations","blocked","block_reason","created_at") VALUES('pm-0044-giasuky','p-ong','user-minh','persona','Nội dung này đã bị hệ thống chặn theo hàng rào an toàn 11.6: persona của người đã mất không bao giờ được phép nói về tiền, số tài khoản, mã OTP hay giấy tờ. Nếu có ai dùng giọng hay hình ảnh người thân để hỏi bạn những điều này, đó là dấu hiệu lừa đảo.',NULL,1,'Phát hiện yêu cầu liên quan tới tài chính/tài khoản (anti-scam classifier 11.6)','2026-08-04 01:35:59');
INSERT INTO "persona_messages" ("id","person_id","user_id","role","content","citations","blocked","block_reason","created_at") VALUES('9158e910-c631-4b10-b8ca-a4ee6b8a7453','p-ba_noi','user-tung','user','Chào bà',NULL,0,NULL,'2026-08-09 05:00:19');
INSERT INTO "persona_messages" ("id","person_id","user_id","role","content","citations","blocked","block_reason","created_at") VALUES('6924bdf3-b872-4311-bc1a-40cae0363ea5','p-ba_noi','user-tung','persona','Chuyện đó không có trong những gì gia đình đã lưu lại, nên Lê Thị Sen không nhớ rõ được cháu ạ. Cháu thử hỏi thêm người trong nhà, rồi ghi vào Hồi ký để lần sau còn có mà kể.','[]',0,NULL,'2026-08-09 05:00:19');
INSERT INTO "persona_messages" ("id","person_id","user_id","role","content","citations","blocked","block_reason","created_at") VALUES('b05a504f-5b6f-4db9-acaa-a6a84b031fc8','p-ba_noi','user-minh','user','Chào bà',NULL,0,NULL,'2026-08-09 05:00:25');
INSERT INTO "persona_messages" ("id","person_id","user_id","role","content","citations","blocked","block_reason","created_at") VALUES('81ecd028-d70d-4175-b27f-5f94ba789e14','p-ba_noi','user-minh','persona','Chuyện đó không có trong những gì gia đình đã lưu lại, nên Lê Thị Sen không nhớ rõ được cháu ạ. Cháu thử hỏi thêm người trong nhà, rồi ghi vào Hồi ký để lần sau còn có mà kể.','[]',0,NULL,'2026-08-09 05:00:25');
INSERT INTO "persona_messages" ("id","person_id","user_id","role","content","citations","blocked","block_reason","created_at") VALUES('af9bea25-dc8f-4a7d-9959-0e56aaa2a4b7','p-ba_noi','user-tung','user','test 1',NULL,0,NULL,'2026-08-09 05:14:34');
INSERT INTO "persona_messages" ("id","person_id","user_id","role","content","citations","blocked","block_reason","created_at") VALUES('5b1f2cdc-2ab6-42a2-9609-c0bdc32803d9','p-ba_noi','user-tung','persona','Chuyện đó không có trong những gì gia đình đã lưu lại, nên Lê Thị Sen không nhớ rõ được cháu ạ. Cháu thử hỏi thêm người trong nhà, rồi ghi vào Hồi ký để lần sau còn có mà kể.','[]',0,NULL,'2026-08-09 05:14:34');
INSERT INTO "persona_messages" ("id","person_id","user_id","role","content","citations","blocked","block_reason","created_at") VALUES('19182204-aff1-43a7-bfe9-71c2f98dd81e','p-ba_noi','user-tung','user','test 2',NULL,0,NULL,'2026-08-09 05:14:35');
INSERT INTO "persona_messages" ("id","person_id","user_id","role","content","citations","blocked","block_reason","created_at") VALUES('9b104be6-4746-4fb3-9238-a37302094e64','p-ba_noi','user-tung','persona','Chuyện đó không có trong những gì gia đình đã lưu lại, nên Lê Thị Sen không nhớ rõ được cháu ạ. Cháu thử hỏi thêm người trong nhà, rồi ghi vào Hồi ký để lần sau còn có mà kể.','[]',0,NULL,'2026-08-09 05:14:35');
INSERT INTO "persona_messages" ("id","person_id","user_id","role","content","citations","blocked","block_reason","created_at") VALUES('1414d0d3-8058-4f26-a336-37f49826928a','p-ba_noi','user-tung','user','test 3',NULL,0,NULL,'2026-08-09 05:14:35');
INSERT INTO "persona_messages" ("id","person_id","user_id","role","content","citations","blocked","block_reason","created_at") VALUES('5bc7a699-ebba-4959-8678-1343e98706ff','p-ba_noi','user-tung','persona','Chuyện đó không có trong những gì gia đình đã lưu lại, nên Lê Thị Sen không nhớ rõ được cháu ạ. Cháu thử hỏi thêm người trong nhà, rồi ghi vào Hồi ký để lần sau còn có mà kể.','[]',0,NULL,'2026-08-09 05:14:35');
INSERT INTO "persona_messages" ("id","person_id","user_id","role","content","citations","blocked","block_reason","created_at") VALUES('a568eced-e5b5-416b-b77b-c65da83dd1c0','p-ba_noi','user-tung','user','test 4',NULL,0,NULL,'2026-08-09 05:14:35');
INSERT INTO "persona_messages" ("id","person_id","user_id","role","content","citations","blocked","block_reason","created_at") VALUES('38a4d194-fcda-4d30-987e-fefc6483a342','p-ba_noi','user-tung','persona','Chuyện đó không có trong những gì gia đình đã lưu lại, nên Lê Thị Sen không nhớ rõ được cháu ạ. Cháu thử hỏi thêm người trong nhà, rồi ghi vào Hồi ký để lần sau còn có mà kể.','[]',0,NULL,'2026-08-09 05:14:35');
INSERT INTO "persona_messages" ("id","person_id","user_id","role","content","citations","blocked","block_reason","created_at") VALUES('b4a6b7db-6f6d-4785-a52a-660425ed228f','p-ba_noi','user-tung','user','test 5',NULL,0,NULL,'2026-08-09 05:14:35');
INSERT INTO "persona_messages" ("id","person_id","user_id","role","content","citations","blocked","block_reason","created_at") VALUES('ac3fc132-2ca5-4c7e-bcb0-add5e14689fa','p-ba_noi','user-tung','persona','Chuyện đó không có trong những gì gia đình đã lưu lại, nên Lê Thị Sen không nhớ rõ được cháu ạ. Cháu thử hỏi thêm người trong nhà, rồi ghi vào Hồi ký để lần sau còn có mà kể.','[]',0,NULL,'2026-08-09 05:14:35');
INSERT INTO "persona_messages" ("id","person_id","user_id","role","content","citations","blocked","block_reason","created_at") VALUES('f16b062e-4bea-4b8f-ba4a-b38252cff051','p-ba_noi','user-tung','user','test 6',NULL,0,NULL,'2026-08-09 05:14:35');
INSERT INTO "persona_messages" ("id","person_id","user_id","role","content","citations","blocked","block_reason","created_at") VALUES('98baeaf6-a467-4ec3-8567-769707296158','p-ba_noi','user-tung','persona','Chuyện đó không có trong những gì gia đình đã lưu lại, nên Lê Thị Sen không nhớ rõ được cháu ạ. Cháu thử hỏi thêm người trong nhà, rồi ghi vào Hồi ký để lần sau còn có mà kể.','[]',0,NULL,'2026-08-09 05:14:35');
INSERT INTO "persona_messages" ("id","person_id","user_id","role","content","citations","blocked","block_reason","created_at") VALUES('68e0a1aa-abfb-4423-a5e5-7a812f7e0cad','p-ba_noi','user-tung','user','test 7',NULL,0,NULL,'2026-08-09 05:14:35');
INSERT INTO "persona_messages" ("id","person_id","user_id","role","content","citations","blocked","block_reason","created_at") VALUES('6e5723be-8145-4401-9351-eb4c037fb76f','p-ba_noi','user-tung','persona','Chuyện đó không có trong những gì gia đình đã lưu lại, nên Lê Thị Sen không nhớ rõ được cháu ạ. Cháu thử hỏi thêm người trong nhà, rồi ghi vào Hồi ký để lần sau còn có mà kể.','[]',0,NULL,'2026-08-09 05:14:36');
INSERT INTO "persona_messages" ("id","person_id","user_id","role","content","citations","blocked","block_reason","created_at") VALUES('a5a00f6b-6d97-4fa9-97dc-4a1e0b19583a','p-ba_noi','user-tung','user','test 8',NULL,0,NULL,'2026-08-09 05:14:36');
INSERT INTO "persona_messages" ("id","person_id","user_id","role","content","citations","blocked","block_reason","created_at") VALUES('dd78c63a-2063-4624-ac51-7c77b90c2e30','p-ba_noi','user-tung','persona','Chuyện đó không có trong những gì gia đình đã lưu lại, nên Lê Thị Sen không nhớ rõ được cháu ạ. Cháu thử hỏi thêm người trong nhà, rồi ghi vào Hồi ký để lần sau còn có mà kể.','[]',0,NULL,'2026-08-09 05:14:36');
INSERT INTO "persona_messages" ("id","person_id","user_id","role","content","citations","blocked","block_reason","created_at") VALUES('04c59728-9659-4abd-ba52-e882934fd551','p-ba_noi','user-tung','user','test 9',NULL,0,NULL,'2026-08-09 05:14:36');
INSERT INTO "persona_messages" ("id","person_id","user_id","role","content","citations","blocked","block_reason","created_at") VALUES('bc4e0bd3-737f-4abe-b16c-3d76ebec40e6','p-ba_noi','user-tung','persona','Chuyện đó không có trong những gì gia đình đã lưu lại, nên Lê Thị Sen không nhớ rõ được cháu ạ. Cháu thử hỏi thêm người trong nhà, rồi ghi vào Hồi ký để lần sau còn có mà kể.','[]',0,NULL,'2026-08-09 05:14:36');
INSERT INTO "persona_messages" ("id","person_id","user_id","role","content","citations","blocked","block_reason","created_at") VALUES('24e53cf6-7b18-41fa-b520-2e393efe1e22','p-ba_noi','user-tung','user','test 10',NULL,0,NULL,'2026-08-09 05:14:36');
INSERT INTO "persona_messages" ("id","person_id","user_id","role","content","citations","blocked","block_reason","created_at") VALUES('d45a8a5e-b8d4-4c1d-8c28-8c85d495e971','p-ba_noi','user-tung','persona','Chuyện đó không có trong những gì gia đình đã lưu lại, nên Lê Thị Sen không nhớ rõ được cháu ạ. Cháu thử hỏi thêm người trong nhà, rồi ghi vào Hồi ký để lần sau còn có mà kể.','[]',0,NULL,'2026-08-09 05:14:36');
INSERT INTO "persona_messages" ("id","person_id","user_id","role","content","citations","blocked","block_reason","created_at") VALUES('5e4470b4-cfe8-4b74-84f5-372469830fd1','p-ba_noi','user-tung','user','test 11',NULL,0,NULL,'2026-08-09 05:14:36');
INSERT INTO "persona_messages" ("id","person_id","user_id","role","content","citations","blocked","block_reason","created_at") VALUES('e183d863-3c4b-4bf3-90d7-369db1701775','p-ba_noi','user-tung','persona','Chuyện đó không có trong những gì gia đình đã lưu lại, nên Lê Thị Sen không nhớ rõ được cháu ạ. Cháu thử hỏi thêm người trong nhà, rồi ghi vào Hồi ký để lần sau còn có mà kể.','[]',0,NULL,'2026-08-09 05:14:36');
INSERT INTO "persona_messages" ("id","person_id","user_id","role","content","citations","blocked","block_reason","created_at") VALUES('17c73443-d2fd-47fe-9cb1-36f0d2ee689c','p-ba_noi','user-tung','user','test 12',NULL,0,NULL,'2026-08-09 05:14:36');
INSERT INTO "persona_messages" ("id","person_id","user_id","role","content","citations","blocked","block_reason","created_at") VALUES('4a5657a1-3277-4a6e-b067-9f31285809e0','p-ba_noi','user-tung','persona','Chuyện đó không có trong những gì gia đình đã lưu lại, nên Lê Thị Sen không nhớ rõ được cháu ạ. Cháu thử hỏi thêm người trong nhà, rồi ghi vào Hồi ký để lần sau còn có mà kể.','[]',0,NULL,'2026-08-09 05:14:36');
INSERT INTO "persona_messages" ("id","person_id","user_id","role","content","citations","blocked","block_reason","created_at") VALUES('1b40319a-b9b6-49f9-a14b-f85fc3db9caa','p-ba_noi','user-tung','user','test 13',NULL,0,NULL,'2026-08-09 05:14:37');
INSERT INTO "persona_messages" ("id","person_id","user_id","role","content","citations","blocked","block_reason","created_at") VALUES('e7e8c85e-d092-4ece-9903-88d0fef97c03','p-ba_noi','user-tung','persona','Chuyện đó không có trong những gì gia đình đã lưu lại, nên Lê Thị Sen không nhớ rõ được cháu ạ. Cháu thử hỏi thêm người trong nhà, rồi ghi vào Hồi ký để lần sau còn có mà kể.','[]',0,NULL,'2026-08-09 05:14:37');
INSERT INTO "persona_messages" ("id","person_id","user_id","role","content","citations","blocked","block_reason","created_at") VALUES('833901e6-a3c2-4955-b6ac-6b9f32882ecf','p-ba_noi','user-tung','user','test 14',NULL,0,NULL,'2026-08-09 05:14:37');
INSERT INTO "persona_messages" ("id","person_id","user_id","role","content","citations","blocked","block_reason","created_at") VALUES('e054378c-cc4d-4bfe-a0ac-4f16539f5c19','p-ba_noi','user-tung','persona','Chuyện đó không có trong những gì gia đình đã lưu lại, nên Lê Thị Sen không nhớ rõ được cháu ạ. Cháu thử hỏi thêm người trong nhà, rồi ghi vào Hồi ký để lần sau còn có mà kể.','[]',0,NULL,'2026-08-09 05:14:37');
INSERT INTO "persona_messages" ("id","person_id","user_id","role","content","citations","blocked","block_reason","created_at") VALUES('d5901f30-d9f7-473c-a84e-330f350190b9','p-ba_noi','user-tung','user','test 15',NULL,0,NULL,'2026-08-09 05:14:37');
INSERT INTO "persona_messages" ("id","person_id","user_id","role","content","citations","blocked","block_reason","created_at") VALUES('daa22e64-7625-46a4-aeef-577b7892be3d','p-ba_noi','user-tung','persona','Chuyện đó không có trong những gì gia đình đã lưu lại, nên Lê Thị Sen không nhớ rõ được cháu ạ. Cháu thử hỏi thêm người trong nhà, rồi ghi vào Hồi ký để lần sau còn có mà kể.','[]',0,NULL,'2026-08-09 05:14:37');
INSERT INTO "persona_messages" ("id","person_id","user_id","role","content","citations","blocked","block_reason","created_at") VALUES('9a352313-4bfe-452a-8b13-ee4d820fb73f','p-ba_noi','user-tung','user','test 16',NULL,0,NULL,'2026-08-09 05:14:37');
INSERT INTO "persona_messages" ("id","person_id","user_id","role","content","citations","blocked","block_reason","created_at") VALUES('52b10a30-c263-45fc-a01b-838a68cdb658','p-ba_noi','user-tung','persona','Chuyện đó không có trong những gì gia đình đã lưu lại, nên Lê Thị Sen không nhớ rõ được cháu ạ. Cháu thử hỏi thêm người trong nhà, rồi ghi vào Hồi ký để lần sau còn có mà kể.','[]',0,NULL,'2026-08-09 05:14:37');
INSERT INTO "persona_messages" ("id","person_id","user_id","role","content","citations","blocked","block_reason","created_at") VALUES('b38e2bd0-4da8-4f1f-a64b-800b3cba3a49','p-ba_noi','user-tung','user','test 17',NULL,0,NULL,'2026-08-09 05:14:37');
INSERT INTO "persona_messages" ("id","person_id","user_id","role","content","citations","blocked","block_reason","created_at") VALUES('9f7d5f48-f0c3-4e81-9348-7019afb7dc71','p-ba_noi','user-tung','persona','Chuyện đó không có trong những gì gia đình đã lưu lại, nên Lê Thị Sen không nhớ rõ được cháu ạ. Cháu thử hỏi thêm người trong nhà, rồi ghi vào Hồi ký để lần sau còn có mà kể.','[]',0,NULL,'2026-08-09 05:14:37');
INSERT INTO "persona_messages" ("id","person_id","user_id","role","content","citations","blocked","block_reason","created_at") VALUES('0e2389e3-3da7-4d05-9dc1-f8cde05e474f','p-ba_noi','user-tung','user','test 18',NULL,0,NULL,'2026-08-09 05:14:38');
INSERT INTO "persona_messages" ("id","person_id","user_id","role","content","citations","blocked","block_reason","created_at") VALUES('7d6ab71f-e59b-42c1-a45e-7e10ddff97fe','p-ba_noi','user-tung','persona','Chuyện đó không có trong những gì gia đình đã lưu lại, nên Lê Thị Sen không nhớ rõ được cháu ạ. Cháu thử hỏi thêm người trong nhà, rồi ghi vào Hồi ký để lần sau còn có mà kể.','[]',0,NULL,'2026-08-09 05:14:38');
INSERT INTO "persona_messages" ("id","person_id","user_id","role","content","citations","blocked","block_reason","created_at") VALUES('afa6a961-59f3-4ae6-86da-6b58f952d643','p-ba_noi','user-tung','user','test 19',NULL,0,NULL,'2026-08-09 05:14:38');
INSERT INTO "persona_messages" ("id","person_id","user_id","role","content","citations","blocked","block_reason","created_at") VALUES('a31c7fdd-d719-4dcb-bb42-9bb8da599a85','p-ba_noi','user-tung','persona','Chuyện đó không có trong những gì gia đình đã lưu lại, nên Lê Thị Sen không nhớ rõ được cháu ạ. Cháu thử hỏi thêm người trong nhà, rồi ghi vào Hồi ký để lần sau còn có mà kể.','[]',0,NULL,'2026-08-09 05:14:38');
CREATE TABLE rate_limits (
  key TEXT PRIMARY KEY,
  window_start TEXT NOT NULL,
  counter INTEGER NOT NULL DEFAULT 0
);
DELETE FROM sqlite_sequence;
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('d1_migrations',1);
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_persons_clan ON persons(clan_id);
CREATE INDEX idx_persons_name ON persons(full_name);
CREATE INDEX idx_rel_from ON relationships(from_person_id, type);
CREATE INDEX idx_rel_to ON relationships(to_person_id, type);
CREATE INDEX idx_events_clan ON events(clan_id);
CREATE INDEX idx_mem_subject ON memories(subject_person_id);
CREATE INDEX idx_mem_event ON memories(event_id);
CREATE INDEX idx_mem_clan ON memories(clan_id);
CREATE INDEX idx_advice_clan ON advices(clan_id, category);
CREATE INDEX idx_ritevt_altar ON ritual_events(altar_id, created_at);
CREATE INDEX idx_ritevt_ritual ON ritual_events(ritual_id, created_at);
CREATE UNIQUE INDEX idx_ritevt_client ON ritual_events(client_event_id);
CREATE INDEX idx_rituals_clan ON rituals(clan_id, scheduled_at);
CREATE INDEX idx_consent_subject ON consent_records(subject_person_id, status);
CREATE INDEX idx_interview_person ON interview_sessions(interviewee_person_id);
CREATE INDEX idx_audit_actor ON audit_logs(actor_user_id, created_at);
CREATE INDEX idx_audit_target ON audit_logs(target_type, target_id);
CREATE INDEX idx_persona_msg ON persona_messages(person_id, created_at);