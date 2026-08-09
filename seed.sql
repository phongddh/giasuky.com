-- ============================================================================
-- seed.sql — Dữ liệu demo Gia Sử Ký (họ Nguyễn, làng Đông Ngạc)
-- Sinh tự động bởi tools/gen-seed.mjs — KHÔNG sửa tay.
-- Mật khẩu mọi tài khoản demo: giasuky123
-- ============================================================================

DELETE FROM persona_messages; DELETE FROM rate_limits; DELETE FROM audit_logs;
DELETE FROM subscriptions; DELETE FROM time_capsules; DELETE FROM interview_sessions;
DELETE FROM rest_requests; DELETE FROM digital_wills; DELETE FROM consent_records;
DELETE FROM ritual_participants; DELETE FROM rituals; DELETE FROM ritual_events;
DELETE FROM altars; DELETE FROM advices; DELETE FROM contradictions;
DELETE FROM memory_embeddings; DELETE FROM memory_persons; DELETE FROM memories;
DELETE FROM event_persons; DELETE FROM events; DELETE FROM locations;
DELETE FROM relationships; DELETE FROM persons; DELETE FROM clan_members;
DELETE FROM clans; DELETE FROM sessions; DELETE FROM user_person_links; DELETE FROM users;

-- ---------------------------------------------------------------- users
INSERT INTO users (id,email,hashed_password,vneid_verified,full_name,elder_mode,created_at,last_login_at)
VALUES ('user-tung','tung.nguyen@example.com','pbkdf2$100000$03cf5228f9c5a53bce7d209bbd16dfeb$62b55e07e44237e9077941bd8ac639a66b33635fbd40ac59e46216f688d0b3d1',1,'Nguyễn Văn Tùng',0,datetime('now','-400 days'),datetime('now'));
INSERT INTO users (id,email,hashed_password,vneid_verified,full_name,elder_mode,created_at,last_login_at)
VALUES ('user-hoa','hoa.nguyen@example.com','pbkdf2$100000$c02aabaaec15606a44c11218a270f6b7$1104da3b48d8c1ef71fb3521ce178fd33b407da46ffa5fa6d3b99e7cac012443',0,'Nguyễn Thị Hòa',0,datetime('now','-400 days'),datetime('now'));
INSERT INTO users (id,email,hashed_password,vneid_verified,full_name,elder_mode,created_at,last_login_at)
VALUES ('user-minh','minh.nguyen@example.com','pbkdf2$100000$9fdd956ffa22c9a5e1d345d0ff3b2e54$b8b2ffaaa93ff5726670eaec0a4c16420a168e0924394592ec0357c3da558668',0,'Nguyễn Văn Minh',0,datetime('now','-400 days'),datetime('now'));
INSERT INTO users (id,email,hashed_password,vneid_verified,full_name,elder_mode,created_at,last_login_at)
VALUES ('user-ba','ba.nguyen@example.com','pbkdf2$100000$2c284d53016ee1ff93be7c35e9fbd4b9$a3575607d61447f93aca7c840e04813d9c6114d4b11519e311b86645164d411b',0,'Nguyễn Thị Ba',1,datetime('now','-400 days'),datetime('now'));

-- ---------------------------------------------------------------- clan
INSERT INTO clans (id,name,origin_place,founded_year,patriarch_user_id,member_count,merit_fund_balance_vnd,created_at)
VALUES ('clan-nguyen-dongngac','Họ Nguyễn Phúc — Đông Ngạc','Làng Đông Ngạc, Từ Liêm, Hà Nội',1902,'user-tung',15,18500000,datetime('now','-400 days'));
INSERT INTO clan_members (clan_id,user_id,role,joined_at) VALUES ('clan-nguyen-dongngac','user-tung','patriarch',datetime('now','-390 days'));
INSERT INTO clan_members (clan_id,user_id,role,joined_at) VALUES ('clan-nguyen-dongngac','user-hoa','council',datetime('now','-390 days'));
INSERT INTO clan_members (clan_id,user_id,role,joined_at) VALUES ('clan-nguyen-dongngac','user-minh','member',datetime('now','-390 days'));
INSERT INTO clan_members (clan_id,user_id,role,joined_at) VALUES ('clan-nguyen-dongngac','user-ba','council',datetime('now','-390 days'));

-- ---------------------------------------------------------------- persons (5 đời)
INSERT INTO persons (id,clan_id,full_name,aliases,gender,generation,birth_date,death_date,birth_place,death_place,is_alive,bio,religion,occupation,death_anniv_lunar_day,death_anniv_lunar_month,is_verified,confidence_score,created_by)
VALUES ('p-to','clan-nguyen-dongngac','Nguyễn Phúc Đức','[]','M',1,'1902-03-11','1978-11-02','Đông Ngạc, Từ Liêm, Hà Nội','Đông Ngạc, Từ Liêm, Hà Nội',0,'Cụ tổ đời thứ nhất được ghi trong gia phả giấy còn giữ tại nhà thờ họ. Dạy chữ Nho trong làng Đông Ngạc, người làng gọi là "thầy Đức".','Phat','["Nhà giáo","Thầy đồ"]',3,10,1,1,'user-tung');
INSERT INTO persons (id,clan_id,full_name,aliases,gender,generation,birth_date,death_date,birth_place,death_place,is_alive,bio,religion,occupation,death_anniv_lunar_day,death_anniv_lunar_month,is_verified,confidence_score,created_by)
VALUES ('p-to_ba','clan-nguyen-dongngac','Trần Thị Lụa','[]','F',1,'1906-07-20','1985-04-15','Nhật Tảo, Đông Ngạc','Đông Ngạc, Từ Liêm, Hà Nội',0,'Cụ bà tần tảo buôn tơ lụa ở chợ Bưởi, nuôi năm người con qua thời kỳ khó khăn.','Phat','["Buôn tơ lụa"]',26,2,1,1,'user-tung');
INSERT INTO persons (id,clan_id,full_name,aliases,gender,generation,birth_date,death_date,birth_place,death_place,is_alive,bio,religion,occupation,death_anniv_lunar_day,death_anniv_lunar_month,is_verified,confidence_score,created_by)
VALUES ('p-ong','clan-nguyen-dongngac','Nguyễn Phúc Thịnh','[]','M',2,'1931-01-08','2009-09-27','Đông Ngạc, Từ Liêm, Hà Nội','Hà Nội',0,'Ông nội, đi bộ đội năm 1950, tham gia chiến dịch Điện Biên Phủ. Sau về làm cán bộ hợp tác xã ở quê. Người viết lại quyển gia phả tay năm 1992.','Phat','["Bộ đội","Cán bộ hợp tác xã"]',9,8,1,1,'user-tung');
INSERT INTO persons (id,clan_id,full_name,aliases,gender,generation,birth_date,death_date,birth_place,death_place,is_alive,bio,religion,occupation,death_anniv_lunar_day,death_anniv_lunar_month,is_verified,confidence_score,created_by)
VALUES ('p-ba_noi','clan-nguyen-dongngac','Lê Thị Sen','[]','F',2,'1934-05-12',NULL,'Chèm, Thụy Phương',NULL,1,'Bà nội, năm nay đã hơn 90 tuổi, vẫn nhớ rất rõ chuyện làng chuyện họ. Là người kể chính trong các buổi phỏng vấn AI.','Phat','["Nội trợ","Làm ruộng"]',NULL,NULL,1,1,'user-tung');
INSERT INTO persons (id,clan_id,full_name,aliases,gender,generation,birth_date,death_date,birth_place,death_place,is_alive,bio,religion,occupation,death_anniv_lunar_day,death_anniv_lunar_month,is_verified,confidence_score,created_by)
VALUES ('p-ba_co','clan-nguyen-dongngac','Nguyễn Thị Ba','[]','F',2,'1938-11-03',NULL,'Đông Ngạc, Từ Liêm, Hà Nội',NULL,1,'Cô Ba, em ông Thịnh, giáo viên tiểu học đã nghỉ hưu. Người kể chuyện có góc nhìn khác về đám cưới năm 1958.','Phat','["Giáo viên"]',NULL,NULL,1,1,'user-tung');
INSERT INTO persons (id,clan_id,full_name,aliases,gender,generation,birth_date,death_date,birth_place,death_place,is_alive,bio,religion,occupation,death_anniv_lunar_day,death_anniv_lunar_month,is_verified,confidence_score,created_by)
VALUES ('p-chu_tu','clan-nguyen-dongngac','Nguyễn Phúc Tứ','[]','M',2,'1941-02-19','1972-05-08','Đông Ngạc, Từ Liêm, Hà Nội','Quảng Trị',0,'Hy sinh tại Quảng Trị năm 1972, khi ấy 31 tuổi. Chưa có gia đình. Phần mộ được đưa về quê năm 1985.','Phat','["Bộ đội"]',25,3,1,1,'user-tung');
INSERT INTO persons (id,clan_id,full_name,aliases,gender,generation,birth_date,death_date,birth_place,death_place,is_alive,bio,religion,occupation,death_anniv_lunar_day,death_anniv_lunar_month,is_verified,confidence_score,created_by)
VALUES ('p-bo','clan-nguyen-dongngac','Nguyễn Văn Tùng','[]','M',3,'1962-06-15',NULL,'Hà Nội',NULL,1,'Trưởng họ hiện tại, người khởi xướng số hóa gia phả họ Nguyễn Đông Ngạc.','Phat','["Kỹ sư xây dựng"]',NULL,NULL,1,1,'user-tung');
INSERT INTO persons (id,clan_id,full_name,aliases,gender,generation,birth_date,death_date,birth_place,death_place,is_alive,bio,religion,occupation,death_anniv_lunar_day,death_anniv_lunar_month,is_verified,confidence_score,created_by)
VALUES ('p-me','clan-nguyen-dongngac','Phạm Thị Lan','[]','F',3,'1965-09-02',NULL,'Nam Định',NULL,1,'Con dâu họ Nguyễn, quê Nam Định.','Phat','["Dược sĩ"]',NULL,NULL,1,1,'user-tung');
INSERT INTO persons (id,clan_id,full_name,aliases,gender,generation,birth_date,death_date,birth_place,death_place,is_alive,bio,religion,occupation,death_anniv_lunar_day,death_anniv_lunar_month,is_verified,confidence_score,created_by)
VALUES ('p-co_hoa','clan-nguyen-dongngac','Nguyễn Thị Hòa','[]','F',3,'1966-04-28',NULL,'Hà Nội',NULL,1,'Em gái ông Tùng, hiện sống tại Sài Gòn.','Phat','["Kế toán"]',NULL,NULL,1,1,'user-tung');
INSERT INTO persons (id,clan_id,full_name,aliases,gender,generation,birth_date,death_date,birth_place,death_place,is_alive,bio,religion,occupation,death_anniv_lunar_day,death_anniv_lunar_month,is_verified,confidence_score,created_by)
VALUES ('p-chu_hai','clan-nguyen-dongngac','Nguyễn Văn Hải','[]','M',3,'1969-12-01','2021-01-30','Hà Nội','Hà Nội',0,'Em trai ông Tùng, mất năm 2021. Người có giọng hát chèo hay nhất họ.','Phat','["Thợ mộc"]',18,12,1,1,'user-tung');
INSERT INTO persons (id,clan_id,full_name,aliases,gender,generation,birth_date,death_date,birth_place,death_place,is_alive,bio,religion,occupation,death_anniv_lunar_day,death_anniv_lunar_month,is_verified,confidence_score,created_by)
VALUES ('p-minh','clan-nguyen-dongngac','Nguyễn Văn Minh','[]','M',4,'1990-08-21',NULL,'Hà Nội',NULL,1,'Cháu đích tôn, người dựng bản gia phả số này.','Phat','["Lập trình viên"]',NULL,NULL,1,1,'user-tung');
INSERT INTO persons (id,clan_id,full_name,aliases,gender,generation,birth_date,death_date,birth_place,death_place,is_alive,bio,religion,occupation,death_anniv_lunar_day,death_anniv_lunar_month,is_verified,confidence_score,created_by)
VALUES ('p-an','clan-nguyen-dongngac','Nguyễn Thị An','[]','F',4,'1993-03-14',NULL,'Hà Nội',NULL,1,'Em gái Minh, bác sĩ nội trú.','Phat','["Bác sĩ"]',NULL,NULL,1,1,'user-tung');
INSERT INTO persons (id,clan_id,full_name,aliases,gender,generation,birth_date,death_date,birth_place,death_place,is_alive,bio,religion,occupation,death_anniv_lunar_day,death_anniv_lunar_month,is_verified,confidence_score,created_by)
VALUES ('p-khanh','clan-nguyen-dongngac','Nguyễn Văn Khánh','[]','M',4,'1995-07-07',NULL,'TP. Hồ Chí Minh',NULL,1,'Con cô Hòa.','Phat','["Kiến trúc sư"]',NULL,NULL,1,1,'user-tung');
INSERT INTO persons (id,clan_id,full_name,aliases,gender,generation,birth_date,death_date,birth_place,death_place,is_alive,bio,religion,occupation,death_anniv_lunar_day,death_anniv_lunar_month,is_verified,confidence_score,created_by)
VALUES ('p-bao','clan-nguyen-dongngac','Nguyễn Phúc Bảo','[]','M',5,'2019-11-11',NULL,'Hà Nội',NULL,1,'Đời thứ năm, con của Minh. Chữ "Phúc" được đặt lại theo cụ tổ.','Phat','[]',NULL,NULL,1,1,'user-tung');
INSERT INTO persons (id,clan_id,full_name,aliases,gender,generation,birth_date,death_date,birth_place,death_place,is_alive,bio,religion,occupation,death_anniv_lunar_day,death_anniv_lunar_month,is_verified,confidence_score,created_by)
VALUES ('p-unverified','clan-nguyen-dongngac','Nguyễn Phúc Ngũ (?)','[]','M',2,'1936',NULL,'Đông Ngạc (?)',NULL,0,'Theo lời kể của bà Sen, cụ tổ còn một người con trai nữa đi làm ăn ở Hải Phòng rồi mất liên lạc trước 1954. CHƯA có giấy tờ nào xác minh. Giữ lại trong gia phả dưới dạng nhánh nét đứt, không suy diễn thêm.','Phat','[]',NULL,NULL,0,0.35,'user-tung');

-- ------------------------------------------------- liên kết user ↔ person
INSERT INTO user_person_links (user_id,person_id,relationship_role) VALUES ('user-tung','p-bo','self');
INSERT INTO user_person_links (user_id,person_id,relationship_role) VALUES ('user-hoa','p-co_hoa','self');
INSERT INTO user_person_links (user_id,person_id,relationship_role) VALUES ('user-minh','p-minh','self');
INSERT INTO user_person_links (user_id,person_id,relationship_role) VALUES ('user-ba','p-ba_co','self');
INSERT INTO user_person_links (user_id,person_id,relationship_role) VALUES ('user-tung','p-ba_noi','admin_for');

-- ---------------------------------------------------------- relationships
INSERT INTO relationships (id,from_person_id,to_person_id,type,biological,married_at,is_verified)
VALUES ('rel-0001-giasuky','p-to','p-to_ba','SPOUSE_OF',1,'1928-02-10',1);
INSERT INTO relationships (id,from_person_id,to_person_id,type,biological,married_at,is_verified)
VALUES ('rel-0002-giasuky','p-ong','p-to','CHILD_OF',1,NULL,1);
INSERT INTO relationships (id,from_person_id,to_person_id,type,biological,married_at,is_verified)
VALUES ('rel-0003-giasuky','p-ong','p-to_ba','CHILD_OF',1,NULL,1);
INSERT INTO relationships (id,from_person_id,to_person_id,type,biological,married_at,is_verified)
VALUES ('rel-0004-giasuky','p-ba_co','p-to','CHILD_OF',1,NULL,1);
INSERT INTO relationships (id,from_person_id,to_person_id,type,biological,married_at,is_verified)
VALUES ('rel-0005-giasuky','p-ba_co','p-to_ba','CHILD_OF',1,NULL,1);
INSERT INTO relationships (id,from_person_id,to_person_id,type,biological,married_at,is_verified)
VALUES ('rel-0006-giasuky','p-chu_tu','p-to','CHILD_OF',1,NULL,1);
INSERT INTO relationships (id,from_person_id,to_person_id,type,biological,married_at,is_verified)
VALUES ('rel-0007-giasuky','p-chu_tu','p-to_ba','CHILD_OF',1,NULL,1);
INSERT INTO relationships (id,from_person_id,to_person_id,type,biological,married_at,is_verified)
VALUES ('rel-0008-giasuky','p-unverified','p-to','CHILD_OF',1,NULL,0);
INSERT INTO relationships (id,from_person_id,to_person_id,type,biological,married_at,is_verified)
VALUES ('rel-0009-giasuky','p-ong','p-ba_noi','SPOUSE_OF',1,'1958-04-20',1);
INSERT INTO relationships (id,from_person_id,to_person_id,type,biological,married_at,is_verified)
VALUES ('rel-0010-giasuky','p-bo','p-ong','CHILD_OF',1,NULL,1);
INSERT INTO relationships (id,from_person_id,to_person_id,type,biological,married_at,is_verified)
VALUES ('rel-0011-giasuky','p-bo','p-ba_noi','CHILD_OF',1,NULL,1);
INSERT INTO relationships (id,from_person_id,to_person_id,type,biological,married_at,is_verified)
VALUES ('rel-0012-giasuky','p-co_hoa','p-ong','CHILD_OF',1,NULL,1);
INSERT INTO relationships (id,from_person_id,to_person_id,type,biological,married_at,is_verified)
VALUES ('rel-0013-giasuky','p-co_hoa','p-ba_noi','CHILD_OF',1,NULL,1);
INSERT INTO relationships (id,from_person_id,to_person_id,type,biological,married_at,is_verified)
VALUES ('rel-0014-giasuky','p-chu_hai','p-ong','CHILD_OF',1,NULL,1);
INSERT INTO relationships (id,from_person_id,to_person_id,type,biological,married_at,is_verified)
VALUES ('rel-0015-giasuky','p-chu_hai','p-ba_noi','CHILD_OF',1,NULL,1);
INSERT INTO relationships (id,from_person_id,to_person_id,type,biological,married_at,is_verified)
VALUES ('rel-0016-giasuky','p-bo','p-me','SPOUSE_OF',1,'1988-12-04',1);
INSERT INTO relationships (id,from_person_id,to_person_id,type,biological,married_at,is_verified)
VALUES ('rel-0017-giasuky','p-minh','p-bo','CHILD_OF',1,NULL,1);
INSERT INTO relationships (id,from_person_id,to_person_id,type,biological,married_at,is_verified)
VALUES ('rel-0018-giasuky','p-minh','p-me','CHILD_OF',1,NULL,1);
INSERT INTO relationships (id,from_person_id,to_person_id,type,biological,married_at,is_verified)
VALUES ('rel-0019-giasuky','p-an','p-bo','CHILD_OF',1,NULL,1);
INSERT INTO relationships (id,from_person_id,to_person_id,type,biological,married_at,is_verified)
VALUES ('rel-0020-giasuky','p-an','p-me','CHILD_OF',1,NULL,1);
INSERT INTO relationships (id,from_person_id,to_person_id,type,biological,married_at,is_verified)
VALUES ('rel-0021-giasuky','p-khanh','p-co_hoa','CHILD_OF',1,NULL,1);
INSERT INTO relationships (id,from_person_id,to_person_id,type,biological,married_at,is_verified)
VALUES ('rel-0022-giasuky','p-bao','p-minh','CHILD_OF',1,NULL,1);
INSERT INTO relationships (id,from_person_id,to_person_id,type,biological,married_at,is_verified)
VALUES ('rel-0023-giasuky','p-ong','p-ba_co','SIBLING_OF',1,NULL,1);
INSERT INTO relationships (id,from_person_id,to_person_id,type,biological,married_at,is_verified)
VALUES ('rel-0024-giasuky','p-ong','p-chu_tu','SIBLING_OF',1,NULL,1);
INSERT INTO relationships (id,from_person_id,to_person_id,type,biological,married_at,is_verified)
VALUES ('rel-0025-giasuky','p-bo','p-co_hoa','SIBLING_OF',1,NULL,1);
INSERT INTO relationships (id,from_person_id,to_person_id,type,biological,married_at,is_verified)
VALUES ('rel-0026-giasuky','p-bo','p-chu_hai','SIBLING_OF',1,NULL,1);
INSERT INTO relationships (id,from_person_id,to_person_id,type,biological,married_at,is_verified)
VALUES ('rel-0027-giasuky','p-minh','p-an','SIBLING_OF',1,NULL,1);

-- -------------------------------------------------------------- locations
INSERT INTO locations (id,name,address_vn,lat,lng,historical_names) VALUES
('loc-dongngac','Làng Đông Ngạc','Phường Đông Ngạc, quận Bắc Từ Liêm, Hà Nội',21.0894,105.7776,'["Kẻ Vẽ","xã Đông Ngạc, huyện Từ Liêm"]'),
('loc-dienbien','Điện Biên Phủ','Thành phố Điện Biên Phủ, tỉnh Điện Biên',21.3833,103.0167,'["Mường Thanh"]'),
('loc-quangtri','Thành cổ Quảng Trị','Thị xã Quảng Trị, tỉnh Quảng Trị',16.7500,107.1833,'[]'),
('loc-hanoi','Hà Nội','Thành phố Hà Nội',21.0278,105.8342,'["Thăng Long","Đông Đô"]');

-- ----------------------------------------------------------------- events
INSERT INTO events (id,clan_id,title,event_date,event_type,location_id,location,significance,created_at) VALUES
('ev-cuoi-1958','clan-nguyen-dongngac','Đám cưới ông Thịnh và bà Sen','1958-04-20','WEDDING','loc-dongngac','Làng Đông Ngạc, Từ Liêm, Hà Nội','FAMILY',datetime('now','-300 days')),
('ev-dienbien-1954','clan-nguyen-dongngac','Ông Thịnh trong chiến dịch Điện Biên Phủ','1954-05-07','WAR','loc-dienbien','Điện Biên Phủ','HISTORICAL',datetime('now','-290 days')),
('ev-quangtri-1972','clan-nguyen-dongngac','Chú Tứ hy sinh tại Quảng Trị','1972-05-08','DEATH','loc-quangtri','Thành cổ Quảng Trị','CLAN',datetime('now','-280 days')),
('ev-ditan-1972','clan-nguyen-dongngac','Gia đình sơ tán khỏi Hà Nội năm 1972','1972-12-20','MIGRATION','loc-hanoi','Hà Nội — Hà Bắc','FAMILY',datetime('now','-275 days')),
('ev-tang-2009','clan-nguyen-dongngac','Tang lễ ông Nguyễn Phúc Thịnh','2009-09-27','FUNERAL','loc-dongngac','Nhà thờ họ, Đông Ngạc','CLAN',datetime('now','-270 days')),
('ev-tang-2021','clan-nguyen-dongngac','Tang lễ chú Nguyễn Văn Hải','2021-01-30','FUNERAL','loc-hanoi','Hà Nội','FAMILY',datetime('now','-260 days'));
INSERT INTO event_persons (event_id,person_id) VALUES ('ev-cuoi-1958','p-ong');
INSERT INTO event_persons (event_id,person_id) VALUES ('ev-cuoi-1958','p-ba_noi');
INSERT INTO event_persons (event_id,person_id) VALUES ('ev-cuoi-1958','p-to');
INSERT INTO event_persons (event_id,person_id) VALUES ('ev-cuoi-1958','p-to_ba');
INSERT INTO event_persons (event_id,person_id) VALUES ('ev-cuoi-1958','p-ba_co');
INSERT INTO event_persons (event_id,person_id) VALUES ('ev-dienbien-1954','p-ong');
INSERT INTO event_persons (event_id,person_id) VALUES ('ev-quangtri-1972','p-chu_tu');
INSERT INTO event_persons (event_id,person_id) VALUES ('ev-quangtri-1972','p-to');
INSERT INTO event_persons (event_id,person_id) VALUES ('ev-quangtri-1972','p-to_ba');
INSERT INTO event_persons (event_id,person_id) VALUES ('ev-quangtri-1972','p-ong');
INSERT INTO event_persons (event_id,person_id) VALUES ('ev-ditan-1972','p-ong');
INSERT INTO event_persons (event_id,person_id) VALUES ('ev-ditan-1972','p-ba_noi');
INSERT INTO event_persons (event_id,person_id) VALUES ('ev-ditan-1972','p-bo');
INSERT INTO event_persons (event_id,person_id) VALUES ('ev-ditan-1972','p-ba_co');
INSERT INTO event_persons (event_id,person_id) VALUES ('ev-tang-2009','p-ong');
INSERT INTO event_persons (event_id,person_id) VALUES ('ev-tang-2009','p-ba_noi');
INSERT INTO event_persons (event_id,person_id) VALUES ('ev-tang-2009','p-bo');
INSERT INTO event_persons (event_id,person_id) VALUES ('ev-tang-2009','p-co_hoa');
INSERT INTO event_persons (event_id,person_id) VALUES ('ev-tang-2009','p-chu_hai');
INSERT INTO event_persons (event_id,person_id) VALUES ('ev-tang-2009','p-minh');
INSERT INTO event_persons (event_id,person_id) VALUES ('ev-tang-2021','p-chu_hai');
INSERT INTO event_persons (event_id,person_id) VALUES ('ev-tang-2021','p-bo');
INSERT INTO event_persons (event_id,person_id) VALUES ('ev-tang-2021','p-ba_noi');
INSERT INTO event_persons (event_id,person_id) VALUES ('ev-tang-2021','p-minh');

-- --------------------------- memories (đa góc nhìn — chế độ Rashomon F4)
INSERT INTO memories (id,clan_id,type,content,content_no_tone,language,perspective,told_by_person_id,subject_person_id,event_id,location,event_date,source,status,visibility,created_by,created_at)
VALUES ('mem-01','clan-nguyen-dongngac','TEXT','Hôm cưới tôi trời mưa rất to. Nước ngập cả sân, phải bắc mấy tấm ván cho khách đi vào. Tôi nhớ như in vì tà áo dài lấm bùn hết, mẹ tôi xót quá cứ lấy khăn lau mãi. Cỗ hôm ấy làm hai mươi bàn, ăn từ trưa đến chiều mới hết.','hom cuoi toi troi mua rat to. nuoc ngap ca san, phai bac may tam van cho khach di vao. toi nho nhu in vi ta ao dai lam bun het, me toi xot qua cu lay khan lau mai. co hom ay lam hai muoi ban, an tu trua den chieu moi het.','vi','Bà Lê Thị Sen kể — cô dâu','p-ba_noi','p-ba_noi','ev-cuoi-1958','Làng Đông Ngạc','1958-04-20','AI_INTERVIEW','APPROVED','CLAN','user-tung',datetime('now','-200 days'));
INSERT INTO memory_persons (memory_id,person_id) VALUES ('mem-01','p-ong');
INSERT INTO memory_persons (memory_id,person_id) VALUES ('mem-01','p-ba_noi');
INSERT INTO memory_persons (memory_id,person_id) VALUES ('mem-01','p-to');
INSERT INTO memory_persons (memory_id,person_id) VALUES ('mem-01','p-to_ba');
INSERT INTO memory_embeddings (memory_id,clan_id,person_id,modality,dim,vector)
VALUES ('mem-01','clan-nguyen-dongngac','p-ba_noi','text',256,'[0,0,0,0,0,0,0.09005,0.09005,0.10806,0,0,0,0,0.09005,0,0,0,0,0,0.05403,0,0,0,0,0,0,0,0,0.05403,0,0.05403,0,0,0,0,0,0.09005,0,0.05403,0,0.05403,0,0.14408,0,0.14408,0,0,0,0,0.09005,0.1801,0,0,0,0,0,0.09005,0,0.05403,0.05403,0,0,0.05403,0,0,0,0,0,0,0,0,0,0,0.09005,0.09005,0,0,0,0,0,0.05403,0,0,0,0.05403,0,0,0,0,0,0.05403,0,0.09005,0,0.1801,0.09005,0,0.23413,0,0.05403,0,0.09005,0.14408,0,0,0.05403,0,0.1801,0,0,0,0,0.05403,0,0.05403,0.05403,0,0,0.05403,0,0,0.09005,0.1801,0.05403,0,0.14408,0,0,0,0,0,0,0.05403,0,0,0,0,0,0,0.09005,0.05403,0.09005,0.05403,0.09005,0,0,0,0,0,0.05403,0,0.09005,0,0.14408,0.1801,0,0.14408,0,0.14408,0,0,0,0.09005,0,0,0,0,0.14408,0,0,0.05403,0.05403,0,0.05403,0,0.09005,0,0.09005,0,0,0,0,0,0,0,0,0,0,0,0,0.05403,0.05403,0,0,0,0,0,0,0,0.05403,0.05403,0.45025,0,0.14408,0,0,0,0.09005,0,0.09005,0,0.09005,0.10806,0,0,0,0,0,0,0,0.14408,0,0,0.05403,0.14408,0,0.09005,0,0,0.14408,0.09005,0,0,0,0,0,0,0.05403,0.09005,0,0.05403,0.05403,0,0,0.05403,0,0,0,0,0,0,0,0,0.05403,0.05403,0]');
INSERT INTO memories (id,clan_id,type,content,content_no_tone,language,perspective,told_by_person_id,subject_person_id,event_id,location,event_date,source,status,visibility,created_by,created_at)
VALUES ('mem-02','clan-nguyen-dongngac','TEXT','Cái đám cưới của anh Thịnh thì trời nắng chứ mưa gì đâu. Tôi còn đội nón đi theo đoàn rước dâu, nắng chang chang, mồ hôi ướt hết lưng áo. Cỗ thì tôi nhớ chỉ mười lăm bàn thôi, vì hồi ấy nhà mình còn nghèo, làm hai mươi bàn sao nổi.','cai dam cuoi cua anh thinh thi troi nang chu mua gi dau. toi con doi non di theo doan ruoc dau, nang chang chang, mo hoi uot het lung ao. co thi toi nho chi muoi lam ban thoi, vi hoi ay nha minh con ngheo, lam hai muoi ban sao noi.','vi','Cô Nguyễn Thị Ba kể — em chồng, khi ấy 20 tuổi','p-ba_co','p-ong','ev-cuoi-1958','Làng Đông Ngạc','1958-04-20','AI_INTERVIEW','APPROVED','CLAN','user-tung',datetime('now','-197 days'));
INSERT INTO memory_persons (memory_id,person_id) VALUES ('mem-02','p-ong');
INSERT INTO memory_persons (memory_id,person_id) VALUES ('mem-02','p-ba_noi');
INSERT INTO memory_persons (memory_id,person_id) VALUES ('mem-02','p-ba_co');
INSERT INTO memory_embeddings (memory_id,clan_id,person_id,modality,dim,vector)
VALUES ('mem-02','clan-nguyen-dongngac','p-ong','text',256,'[0,0.054818,0,0,0,0,0.182727,0.091363,0,0,0.292362,0.054818,0,0,0.091363,0,0,0,0,0,0,0,0,0,0,0.237544,0,0,0.054818,0,0,0.091363,0,0,0.054818,0,0.054818,0,0,0,0,0,0,0.109636,0,0,0,0,0,0,0,0,0.054818,0.091363,0.054818,0.146181,0.054818,0.091363,0,0,0,0,0,0,0,0,0,0,0,0.054818,0,0,0,0,0,0.054818,0,0.054818,0,0,0,0,0,0.091363,0.054818,0,0,0,0,0.109636,0.054818,0,0,0,0.091363,0,0,0.091363,0.054818,0,0.054818,0,0,0,0,0.091363,0.054818,0,0.054818,0.054818,0,0.054818,0.054818,0,0,0,0,0,0,0.109636,0,0.091363,0,0,0,0.054818,0,0.054818,0,0.054818,0.054818,0,0,0,0,0.054818,0,0,0.146181,0.091363,0,0.182727,0,0.091363,0,0,0,0,0,0.054818,0,0.091363,0.182727,0,0.182727,0.091363,0.146181,0,0,0,0.091363,0,0,0,0,0,0,0,0,0.054818,0,0,0,0.182727,0,0,0,0,0,0,0.091363,0.182727,0.054818,0,0,0,0,0,0,0.091363,0,0,0,0,0,0,0,0,0,0,0,0.365453,0.054818,0.054818,0,0,0,0.146181,0.054818,0,0.054818,0.091363,0.054818,0.054818,0,0,0,0,0,0.146181,0,0,0,0,0.091363,0.091363,0,0,0,0.054818,0,0.182727,0,0,0.091363,0,0,0,0.182727,0,0.054818,0,0,0,0.054818,0,0,0.091363,0,0.054818,0,0,0.091363,0,0.091363,0]');
INSERT INTO memories (id,clan_id,type,content,content_no_tone,language,perspective,told_by_person_id,subject_person_id,event_id,location,event_date,source,status,visibility,created_by,created_at)
VALUES ('mem-03','clan-nguyen-dongngac','TEXT','Bố tôi kể lại rằng trong ảnh cưới của ông bà, nền sân có vệt nước và mấy người khách xắn quần. Tấm ảnh ấy giờ vẫn còn trong hộp thiếc ở nhà thờ họ. Tôi không dám khẳng định trời mưa hay nắng, chỉ ghi lại đúng những gì tấm ảnh cho thấy.','bo toi ke lai rang trong anh cuoi cua ong ba, nen san co vet nuoc va may nguoi khach xan quan. tam anh ay gio van con trong hop thiec o nha tho ho. toi khong dam khang dinh troi mua hay nang, chi ghi lai dung nhung gi tam anh cho thay.','vi','Ông Nguyễn Văn Tùng kể — con trai, dựa trên ảnh cũ','p-bo','p-ong','ev-cuoi-1958','Nhà thờ họ Nguyễn','1958-04-20','MANUAL','APPROVED','CLAN','user-tung',datetime('now','-194 days'));
INSERT INTO memory_persons (memory_id,person_id) VALUES ('mem-03','p-ong');
INSERT INTO memory_persons (memory_id,person_id) VALUES ('mem-03','p-ba_noi');
INSERT INTO memory_embeddings (memory_id,clan_id,person_id,modality,dim,vector)
VALUES ('mem-03','clan-nguyen-dongngac','p-ong','text',256,'[0,0,0,0,0,0,0,0.153196,0,0,0,0.057448,0.057448,0.095747,0.095747,0,0.153196,0,0,0,0.057448,0.191495,0.095747,0.057448,0,0.095747,0,0,0,0.095747,0.095747,0.095747,0,0,0,0,0,0,0.095747,0,0.095747,0,0,0,0.057448,0,0,0,0,0,0.191495,0,0,0,0.057448,0.057448,0.095747,0,0.114897,0,0,0,0.095747,0,0,0,0,0,0,0,0,0,0.057448,0.114897,0,0.114897,0,0,0,0,0,0,0,0.057448,0,0.057448,0,0,0,0,0,0,0,0,0.191495,0.095747,0,0,0.095747,0.057448,0,0.057448,0,0,0,0,0.057448,0.095747,0,0,0,0,0.057448,0.095747,0.057448,0,0,0,0,0,0.191495,0.095747,0.095747,0,0.095747,0,0,0,0,0.057448,0,0,0,0,0,0,0,0.057448,0.287242,0.095747,0,0,0,0,0.153196,0,0,0,0.057448,0,0.095747,0.095747,0,0,0,0.095747,0,0,0,0,0,0.114897,0,0,0.057448,0,0.057448,0,0.153196,0,0.057448,0.057448,0.057448,0,0,0.248943,0,0.057448,0,0,0.095747,0.095747,0,0,0.057448,0.057448,0,0.095747,0.057448,0.191495,0,0.114897,0,0,0.057448,0,0,0.191495,0,0,0.057448,0.191495,0.057448,0,0.191495,0,0,0.095747,0,0.057448,0.057448,0,0.057448,0,0.057448,0,0.057448,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.057448,0,0.095747,0,0,0,0,0,0,0,0,0,0.095747,0.057448,0.153196,0,0,0,0,0,0,0,0]');
INSERT INTO memories (id,clan_id,type,content,content_no_tone,language,perspective,told_by_person_id,subject_person_id,event_id,location,event_date,source,status,visibility,created_by,created_at)
VALUES ('mem-04','clan-nguyen-dongngac','TEXT','Tôi đi bộ đội năm hai mươi tuổi. Lên Điện Biên, ba tháng ròng đào hào, đêm nào cũng nghe pháo. Cái ngày bảy tháng năm, khi tin thắng trận truyền xuống, cả hầm im lặng một lúc rồi mới có người khóc. Không ai reo hò như trong phim đâu. Chúng tôi kiệt sức quá rồi. Sống ở đời, cái gì mình đã hứa với đồng đội thì phải giữ, dù có phải đi bộ ba trăm cây số.','toi di bo doi nam hai muoi tuoi. len dien bien, ba thang rong dao hao, dem nao cung nghe phao. cai ngay bay thang nam, khi tin thang tran truyen xuong, ca ham im lang mot luc roi moi co nguoi khoc. khong ai reo ho nhu trong phim dau. chung toi kiet suc qua roi. song o doi, cai gi minh da hua voi dong doi thi phai giu, du co phai di bo ba tram cay so.','vi','Ông Nguyễn Phúc Thịnh kể năm 2005, ghi âm bằng máy cassette','p-ong','p-ong','ev-dienbien-1954','Điện Biên Phủ','1954-05-07','IMPORT','APPROVED','CLAN','user-tung',datetime('now','-191 days'));
INSERT INTO memory_persons (memory_id,person_id) VALUES ('mem-04','p-ong');
INSERT INTO memory_embeddings (memory_id,clan_id,person_id,modality,dim,vector)
VALUES ('mem-04','clan-nguyen-dongngac','p-ong','text',256,'[0,0,0,0.04327,0,0.04327,0,0.187502,0,0,0,0.072116,0.158656,0,0.04327,0,0.04327,0,0,0,0.072116,0,0,0.072116,0.072116,0,0,0,0.04327,0,0,0.115386,0.072116,0.04327,0.04327,0.072116,0,0.187502,0.086539,0.144232,0.115386,0,0.072116,0.04327,0.115386,0.072116,0,0,0.04327,0.04327,0.086539,0,0,0.04327,0,0,0,0.331735,0,0,0.04327,0,0.144232,0,0.072116,0,0.04327,0.072116,0,0.115386,0.072116,0.04327,0,0.072116,0,0.072116,0,0.072116,0,0,0.072116,0,0.04327,0,0,0.072116,0.072116,0,0,0,0.04327,0.072116,0,0.04327,0.086539,0.187502,0,0,0.072116,0,0.04327,0,0,0,0,0.115386,0.04327,0,0,0,0,0.086539,0.072116,0,0.072116,0,0,0,0,0,0,0.04327,0.072116,0.086539,0,0,0.072116,0,0,0,0,0,0,0,0.04327,0,0,0,0,0,0,0.072116,0,0.072116,0.04327,0,0,0.04327,0,0.04327,0,0.04327,0.144232,0.04327,0,0,0,0,0,0.072116,0.187502,0.04327,0.072116,0,0,0.086539,0.04327,0,0.072116,0,0,0,0,0.187502,0,0,0,0.072116,0,0.04327,0,0,0,0.086539,0,0.072116,0.086539,0.144232,0,0.072116,0.04327,0,0.04327,0.072116,0,0,0,0.144232,0,0.216349,0,0.144232,0,0.072116,0.144232,0,0.086539,0.04327,0,0.04327,0.086539,0.072116,0.086539,0,0,0,0.158656,0,0,0,0,0.072116,0,0,0,0,0,0,0.04327,0.129809,0,0.072116,0,0.04327,0,0,0,0,0.144232,0.072116,0,0.04327,0.072116,0,0.04327,0,0,0,0.072116,0,0,0,0.086539,0,0.072116,0]');
INSERT INTO memories (id,clan_id,type,content,content_no_tone,language,perspective,told_by_person_id,subject_person_id,event_id,location,event_date,source,status,visibility,created_by,created_at)
VALUES ('mem-05','clan-nguyen-dongngac','TEXT','Nhà nhận được giấy báo tử của chú Tứ vào khoảng tháng bảy năm bảy hai. Ông Thịnh đọc xong không nói gì, ra sân ngồi đến khuya. Mẹ chồng tôi thì ngất đi, phải cạo gió mãi mới tỉnh. Từ hôm ấy trong nhà không ai bật đèn sáng nữa, cứ để đèn dầu tù mù suốt mấy tháng.','nha nhan duoc giay bao tu cua chu tu vao khoang thang bay nam bay hai. ong thinh doc xong khong noi gi, ra san ngoi den khuya. me chong toi thi ngat di, phai cao gio mai moi tinh. tu hom ay trong nha khong ai bat den sang nua, cu de den dau tu mu suot may thang.','vi','Bà Sen kể — chị dâu','p-ba_noi','p-chu_tu','ev-quangtri-1972','Đông Ngạc','1972-07-15','AI_INTERVIEW','APPROVED','CLAN','user-tung',datetime('now','-188 days'));
INSERT INTO memory_persons (memory_id,person_id) VALUES ('mem-05','p-chu_tu');
INSERT INTO memory_persons (memory_id,person_id) VALUES ('mem-05','p-ong');
INSERT INTO memory_persons (memory_id,person_id) VALUES ('mem-05','p-to_ba');
INSERT INTO memory_embeddings (memory_id,clan_id,person_id,modality,dim,vector)
VALUES ('mem-05','clan-nguyen-dongngac','p-chu_tu','text',256,'[0,0,0,0.100972,0.100972,0,0,0,0.084144,0,0.084144,0,0,0,0.168287,0,0,0,0,0,0,0,0,0,0,0.050486,0,0,0.100972,0,0,0,0.084144,0.084144,0,0,0,0,0,0.084144,0,0.084144,0,0,0.084144,0,0.084144,0,0,0.050486,0.050486,0,0,0,0,0,0,0,0.13463,0,0,0.050486,0.050486,0,0,0,0,0,0,0.050486,0,0,0,0,0.13463,0,0,0,0,0.100972,0,0,0.050486,0,0.050486,0,0,0,0,0.050486,0.050486,0,0,0,0,0.13463,0,0.084144,0,0,0,0.084144,0,0,0,0.084144,0.050486,0.084144,0,0,0,0.050486,0,0,0,0.050486,0.084144,0,0,0.084144,0,0.050486,0.084144,0,0,0,0,0,0.050486,0,0,0,0.050486,0.050486,0,0,0,0.050486,0,0,0.050486,0.050486,0.050486,0.084144,0,0,0.050486,0,0,0,0.084144,0.084144,0.084144,0.084144,0.050486,0,0.185116,0.050486,0,0.084144,0,0.050486,0.084144,0,0,0,0,0.084144,0.252431,0,0,0.084144,0,0,0,0,0,0,0,0,0.084144,0,0,0.13463,0,0,0,0.050486,0,0.168287,0.050486,0,0.084144,0,0,0,0,0.13463,0.050486,0.218773,0,0.084144,0,0.218773,0,0,0.084144,0.13463,0,0,0,0,0,0,0.050486,0,0,0.050486,0.050486,0,0.302917,0,0.050486,0.050486,0,0.13463,0.336574,0,0.050486,0,0,0.084144,0,0,0,0.13463,0,0,0.168287,0.168287,0,0,0,0.050486,0,0,0,0,0.050486,0.050486,0,0,0,0.050486,0,0]');
INSERT INTO memories (id,clan_id,type,content,content_no_tone,language,perspective,told_by_person_id,subject_person_id,event_id,location,event_date,source,status,visibility,created_by,created_at)
VALUES ('mem-06','clan-nguyen-dongngac','TEXT','Giấy báo tử của anh Tứ về nhà đúng dịp giáp Tết năm bảy hai sang bảy ba, tôi nhớ vì đang gói bánh chưng thì ông trưởng thôn sang. Cả nhà bỏ nồi bánh đấy, không ai ăn Tết năm ấy.','giay bao tu cua anh tu ve nha dung dip giap tet nam bay hai sang bay ba, toi nho vi dang goi banh chung thi ong truong thon sang. ca nha bo noi banh day, khong ai an tet nam ay.','vi','Cô Ba kể — em gái','p-ba_co','p-chu_tu','ev-quangtri-1972','Đông Ngạc','1973-01-20','AI_INTERVIEW','APPROVED','CLAN','user-tung',datetime('now','-185 days'));
INSERT INTO memory_persons (memory_id,person_id) VALUES ('mem-06','p-chu_tu');
INSERT INTO memory_persons (memory_id,person_id) VALUES ('mem-06','p-ba_co');
INSERT INTO memory_embeddings (memory_id,clan_id,person_id,modality,dim,vector)
VALUES ('mem-06','clan-nguyen-dongngac','p-chu_tu','text',256,'[0.06877,0,0,0.114617,0.06877,0.06877,0,0,0,0,0.229235,0,0,0,0.229235,0,0,0,0,0,0,0,0,0,0,0,0,0,0.06877,0,0,0,0,0,0,0,0,0.06877,0,0.229235,0,0.114617,0.229235,0,0.06877,0,0.06877,0,0,0,0.06877,0,0,0.06877,0,0,0,0,0,0,0,0,0.114617,0,0,0,0,0,0,0.137541,0.114617,0,0,0.114617,0,0,0,0,0.229235,0,0,0,0,0,0.229235,0,0,0,0,0,0.06877,0,0,0,0,0,0,0,0.06877,0,0.06877,0.06877,0,0.06877,0,0.114617,0.137541,0,0,0,0,0.06877,0,0,0,0,0,0,0,0,0,0,0,0,0,0.06877,0,0,0,0,0,0,0,0,0.114617,0,0,0,0.114617,0.06877,0,0,0.06877,0.114617,0,0,0,0,0,0,0.06877,0,0.114617,0.114617,0.06877,0,0.114617,0.06877,0,0.114617,0,0,0,0.183388,0.114617,0,0,0.06877,0.114617,0,0.06877,0,0,0,0,0,0.06877,0,0,0,0.114617,0,0,0,0.06877,0,0,0.06877,0,0.06877,0,0,0,0,0,0,0.114617,0,0,0.137541,0,0.114617,0,0.06877,0.114617,0,0,0.114617,0,0,0,0.06877,0.06877,0,0,0,0,0.06877,0,0,0,0,0,0,0.114617,0.06877,0.229235,0.06877,0,0,0.114617,0,0,0,0,0.114617,0,0,0,0.229235,0,0,0.114617,0,0,0,0.06877,0.114617,0,0,0,0,0,0,0,0]');
INSERT INTO memories (id,clan_id,type,content,content_no_tone,language,perspective,told_by_person_id,subject_person_id,event_id,location,event_date,source,status,visibility,created_by,created_at)
VALUES ('mem-07','clan-nguyen-dongngac','TEXT','Tháng chạp năm bảy hai, máy bay B52 ném bom Hà Nội. Ông Thịnh bắt cả nhà sơ tán về Hà Bắc, mỗi người chỉ được mang một cái tay nải. Tôi mang theo quyển gia phả của cụ Đức, gói trong ba lớp vải mưa. Ông ấy bảo: nhà mất thì dựng lại được, gia phả mất là mất gốc.','thang chap nam bay hai, may bay b52 nem bom ha noi. ong thinh bat ca nha so tan ve ha bac, moi nguoi chi duoc mang mot cai tay nai. toi mang theo quyen gia pha cua cu duc, goi trong ba lop vai mua. ong ay bao: nha mat thi dung lai duoc, gia pha mat la mat goc.','vi','Bà Sen kể','p-ba_noi','p-ong','ev-ditan-1972','Hà Nội — Hà Bắc','1972-12-20','AI_INTERVIEW','APPROVED','CLAN','user-tung',datetime('now','-182 days'));
INSERT INTO memory_persons (memory_id,person_id) VALUES ('mem-07','p-ong');
INSERT INTO memory_persons (memory_id,person_id) VALUES ('mem-07','p-ba_noi');
INSERT INTO memory_persons (memory_id,person_id) VALUES ('mem-07','p-bo');
INSERT INTO memory_embeddings (memory_id,clan_id,person_id,modality,dim,vector)
VALUES ('mem-07','clan-nguyen-dongngac','p-ong','text',256,'[0,0.051202,0.170672,0.256008,0.051202,0,0,0,0,0.136538,0,0,0,0,0.170672,0.051202,0,0,0,0,0.085336,0.136538,0,0.085336,0,0,0.085336,0,0.051202,0,0.051202,0,0.051202,0,0,0,0,0,0,0.085336,0,0,0,0,0.085336,0.051202,0,0,0,0,0,0.085336,0,0.051202,0,0,0,0,0,0,0,0.170672,0,0,0,0,0,0,0,0,0,0,0,0.085336,0,0,0,0,0,0,0,0,0,0,0.170672,0.051202,0,0.051202,0,0.051202,0,0,0,0,0.085336,0,0,0.051202,0,0,0,0.085336,0,0,0.30721,0.085336,0,0,0.051202,0,0,0,0,0.051202,0,0,0.170672,0,0,0.102403,0,0,0.085336,0,0,0.085336,0,0.051202,0,0,0,0.136538,0,0.051202,0.085336,0.102403,0,0,0,0,0,0,0.051202,0.136538,0,0,0,0,0.051202,0.051202,0,0,0.085336,0.085336,0.051202,0.085336,0,0,0,0,0.085336,0.102403,0,0,0.051202,0,0,0,0.085336,0.085336,0.051202,0,0.051202,0.18774,0,0,0.051202,0.051202,0,0,0.085336,0,0,0,0,0,0,0.085336,0.102403,0.051202,0,0,0,0,0,0,0.085336,0.136538,0,0.085336,0.102403,0.085336,0,0,0.085336,0,0.051202,0.085336,0,0,0,0,0,0,0,0.051202,0,0,0.102403,0.085336,0,0,0.085336,0,0.102403,0.102403,0,0,0,0.051202,0.051202,0,0,0,0,0.170672,0.170672,0.051202,0.085336,0.273076,0,0.102403,0,0,0,0,0,0.170672,0.085336,0,0,0.085336,0,0,0,0.051202]');
INSERT INTO memories (id,clan_id,type,content,content_no_tone,language,perspective,told_by_person_id,subject_person_id,event_id,location,event_date,source,status,visibility,created_by,created_at)
VALUES ('mem-08','clan-nguyen-dongngac','TEXT','Ông tôi vẫn dạy con cháu rằng: Nhà mình không có ruộng nhiều, chỉ có cái chữ là của cải để lại được. Con cháu đời nào cũng phải học, học không phải để làm quan mà để không ai lừa được mình.','ong toi van day con chau rang: nha minh khong co ruong nhieu, chi co cai chu la cua cai de lai duoc. con chau doi nao cung phai hoc, hoc khong phai de lam quan ma de khong ai lua duoc minh.','vi','Ông Tùng nhớ lại lời ông nội','p-bo','p-ong',NULL,'Đông Ngạc','1995-06-01','MANUAL','APPROVED','CLAN','user-tung',datetime('now','-179 days'));
INSERT INTO memory_persons (memory_id,person_id) VALUES ('mem-08','p-ong');
INSERT INTO memory_persons (memory_id,person_id) VALUES ('mem-08','p-bo');
INSERT INTO memory_embeddings (memory_id,clan_id,person_id,modality,dim,vector)
VALUES ('mem-08','clan-nguyen-dongngac','p-ong','text',256,'[0,0,0,0.097037,0,0,0.058222,0.194074,0,0.058222,0,0,0,0.058222,0.097037,0.116445,0,0,0,0,0.058222,0.155259,0,0.058222,0,0.058222,0.058222,0,0,0.058222,0,0,0,0,0,0,0,0,0,0.058222,0,0.058222,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.155259,0,0,0,0,0,0,0,0,0,0.058222,0,0,0,0,0,0,0,0,0,0.097037,0,0,0,0,0.058222,0,0,0,0,0.058222,0.058222,0,0,0.155259,0,0,0.155259,0.194074,0,0,0,0.116445,0,0.058222,0,0,0,0,0,0,0.097037,0,0,0.058222,0,0,0,0,0.194074,0,0.058222,0,0,0,0.058222,0,0,0,0,0,0,0.058222,0,0,0,0,0,0,0,0.058222,0.058222,0,0,0,0,0,0.097037,0,0,0.058222,0,0,0.097037,0,0,0.058222,0,0.097037,0,0,0,0.097037,0.194074,0,0.291111,0,0,0.058222,0,0.058222,0.291111,0,0,0,0,0,0,0,0,0.058222,0,0,0.097037,0.194074,0,0,0,0,0,0,0,0.155259,0,0,0,0,0,0.058222,0,0,0,0,0,0.194074,0,0,0,0,0,0,0,0,0,0.194074,0,0.058222,0,0,0,0,0,0,0,0,0.213482,0,0,0.194074,0,0,0,0,0,0,0.194074,0,0,0.097037,0,0,0,0.310519,0,0,0,0,0,0,0,0,0.058222,0,0,0,0,0,0.097037,0]');
INSERT INTO memories (id,clan_id,type,content,content_no_tone,language,perspective,told_by_person_id,subject_person_id,event_id,location,event_date,source,status,visibility,created_by,created_at)
VALUES ('mem-09','clan-nguyen-dongngac','TEXT','Cụ Đức có câu để lại trong gia phả tay, ông Thịnh chép lại nguyên văn: Thờ cha kính mẹ là gốc của mọi điều lành, con cháu nào bỏ gốc thì cành có tốt cũng chẳng bền.','cu duc co cau de lai trong gia pha tay, ong thinh chep lai nguyen van: tho cha kinh me la goc cua moi dieu lanh, con chau nao bo goc thi canh co tot cung chang ben.','vi','Ông Thịnh chép từ gia phả tay của cụ Đức','p-ong','p-to',NULL,'Nhà thờ họ Nguyễn','1992-03-10','IMPORT','APPROVED','CLAN','user-tung',datetime('now','-176 days'));
INSERT INTO memory_persons (memory_id,person_id) VALUES ('mem-09','p-to');
INSERT INTO memory_persons (memory_id,person_id) VALUES ('mem-09','p-ong');
INSERT INTO memory_embeddings (memory_id,clan_id,person_id,modality,dim,vector)
VALUES ('mem-09','clan-nguyen-dongngac','p-to','text',256,'[0,0,0,0.115102,0,0,0,0.299266,0,0,0.115102,0,0,0,0,0,0.115102,0.069061,0,0,0.069061,0.230205,0,0,0,0,0,0,0,0.069061,0,0,0,0,0,0,0,0,0.115102,0,0,0.069061,0,0,0.230205,0.115102,0,0,0,0,0.069061,0.115102,0,0,0,0,0,0,0,0,0,0.115102,0.115102,0,0.069061,0,0,0,0.069061,0,0,0,0,0,0,0,0.069061,0.184164,0,0,0,0,0,0,0.115102,0,0,0,0,0,0,0.069061,0,0,0.184164,0,0,0,0,0.069061,0,0.115102,0,0,0,0,0.069061,0,0,0,0,0,0,0.069061,0,0,0.115102,0,0,0,0.069061,0,0,0,0,0,0.069061,0,0,0,0,0,0,0,0,0.115102,0,0.115102,0,0,0,0,0,0,0,0,0,0,0.069061,0,0,0,0.115102,0,0,0,0,0,0,0,0,0,0.115102,0,0,0,0,0.115102,0,0,0.184164,0,0,0,0,0,0,0,0.069061,0,0.115102,0.115102,0,0,0,0,0,0.069061,0.069061,0,0,0,0,0,0.069061,0,0,0.115102,0,0,0,0.069061,0,0,0,0,0,0,0.069061,0.069061,0,0,0,0,0.138123,0,0,0.115102,0,0,0.069061,0,0.115102,0,0.069061,0.138123,0.069061,0,0,0,0,0,0.230205,0,0,0.184164,0.115102,0,0.115102,0,0,0,0,0,0,0.069061,0,0,0.368327,0,0,0,0,0,0.115102,0]');
INSERT INTO memories (id,clan_id,type,content,content_no_tone,language,perspective,told_by_person_id,subject_person_id,event_id,location,event_date,source,status,visibility,created_by,created_at)
VALUES ('mem-10','clan-nguyen-dongngac','TEXT','Bà tôi bảo: Cưới xin thì đừng chạy theo mâm cao cỗ đầy, lấy nhau là lấy cái nết chứ không lấy cái nhà. Bà cứ nhắc câu ấy mỗi lần trong họ có đứa sắp cưới.','ba toi bao: cuoi xin thi dung chay theo mam cao co day, lay nhau la lay cai net chu khong lay cai nha. ba cu nhac cau ay moi lan trong ho co dua sap cuoi.','vi','Ông Tùng kể lời mẹ','p-bo','p-ba_noi',NULL,'Hà Nội','2015-08-20','MANUAL','APPROVED','CLAN','user-tung',datetime('now','-173 days'));
INSERT INTO memory_persons (memory_id,person_id) VALUES ('mem-10','p-ba_noi');
INSERT INTO memory_persons (memory_id,person_id) VALUES ('mem-10','p-bo');
INSERT INTO memory_embeddings (memory_id,clan_id,person_id,modality,dim,vector)
VALUES ('mem-10','clan-nguyen-dongngac','p-ba_noi','text',256,'[0,0,0,0.114799,0,0,0,0.229597,0,0,0,0,0,0,0.114799,0,0.114799,0,0,0,0,0,0.068879,0.114799,0,0.068879,0,0,0,0.068879,0,0,0,0.137758,0,0,0,0,0,0,0.114799,0,0,0,0.114799,0,0.114799,0.068879,0,0,0,0,0.183678,0,0,0,0,0,0,0.068879,0,0,0,0,0,0,0,0,0,0.068879,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.183678,0.068879,0,0,0,0,0,0.114799,0,0,0.068879,0,0,0.114799,0.068879,0,0,0.137758,0,0,0,0,0,0,0,0,0.068879,0,0.229597,0.183678,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.068879,0,0,0.068879,0,0,0,0.229597,0,0,0,0.137758,0,0.068879,0,0,0,0,0,0.114799,0.114799,0.114799,0,0.068879,0,0,0,0,0.229597,0,0,0.206637,0,0,0,0.068879,0.114799,0,0,0,0,0,0,0,0,0,0,0,0,0,0.068879,0,0.068879,0,0,0,0.068879,0,0,0,0,0,0,0,0,0.114799,0,0,0,0.114799,0,0,0.229597,0,0,0.114799,0,0,0,0,0,0.068879,0,0,0,0,0.068879,0,0,0,0.114799,0,0.068879,0.114799,0,0,0.068879,0.344396,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.068879,0.229597,0,0,0.068879,0,0,0,0.114799,0]');
INSERT INTO memories (id,clan_id,type,content,content_no_tone,language,perspective,told_by_person_id,subject_person_id,event_id,location,event_date,source,status,visibility,created_by,created_at)
VALUES ('mem-11','clan-nguyen-dongngac','TEXT','Chú Hải làm mộc, có lần bảo tôi: Làm cái gì cũng phải làm cho tử tế, đồ mình đóng người ta dùng ba chục năm, mình gian một ly là họ khổ ba chục năm.','chu hai lam moc, co lan bao toi: lam cai gi cung phai lam cho tu te, do minh dong nguoi ta dung ba chuc nam, minh gian mot ly la ho kho ba chuc nam.','vi','Minh kể lời chú Hải','p-minh','p-chu_hai',NULL,'Hà Nội','2019-05-15','MANUAL','APPROVED','CLAN','user-tung',datetime('now','-170 days'));
INSERT INTO memory_persons (memory_id,person_id) VALUES ('mem-11','p-chu_hai');
INSERT INTO memory_persons (memory_id,person_id) VALUES ('mem-11','p-minh');
INSERT INTO memory_embeddings (memory_id,clan_id,person_id,modality,dim,vector)
VALUES ('mem-11','clan-nguyen-dongngac','p-chu_hai','text',256,'[0,0,0,0,0.068024,0,0,0.113373,0.068024,0,0,0,0,0.181397,0,0,0.113373,0,0,0,0.113373,0,0,0,0,0,0,0,0,0,0.136048,0,0,0,0,0,0,0.068024,0,0.226746,0.113373,0,0,0,0.068024,0,0,0,0,0,0,0,0.068024,0.068024,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.136048,0,0,0,0.113373,0,0,0,0.068024,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.113373,0,0,0,0,0,0,0.113373,0,0,0,0,0.113373,0,0,0,0.068024,0,0.068024,0,0,0,0.068024,0.113373,0,0,0.068024,0,0,0.068024,0,0,0,0,0.068024,0,0,0,0,0,0,0,0,0.136048,0,0.068024,0,0,0.113373,0,0,0.068024,0,0,0,0,0,0,0.113373,0,0,0,0.068024,0.113373,0,0.113373,0.068024,0,0,0,0,0.226746,0,0,0,0,0,0,0.113373,0,0,0,0.068024,0.226746,0.136048,0,0,0.068024,0,0,0,0,0.249421,0,0.113373,0,0,0,0,0.068024,0,0,0,0.068024,0,0,0.453493,0,0,0.226746,0,0,0,0,0,0,0.226746,0,0,0.068024,0,0,0,0,0.068024,0,0,0.113373,0,0,0.113373,0.113373,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.113373,0,0,0,0,0,0,0.113373,0.068024]');
INSERT INTO memories (id,clan_id,type,content,content_no_tone,language,perspective,told_by_person_id,subject_person_id,event_id,location,event_date,source,status,visibility,created_by,created_at)
VALUES ('mem-12','clan-nguyen-dongngac','TEXT','Ông Thịnh dặn trước khi mất: Trong họ có người khá người kém, người khá phải đỡ người kém, đừng để ai trong họ phải ngửa tay xin người ngoài.','ong thinh dan truoc khi mat: trong ho co nguoi kha nguoi kem, nguoi kha phai do nguoi kem, dung de ai trong ho phai ngua tay xin nguoi ngoai.','vi','Ông Tùng kể lời cha trước khi mất','p-bo','p-ong','ev-tang-2009','Hà Nội','2009-09-20','MANUAL','APPROVED','CLAN','user-tung',datetime('now','-167 days'));
INSERT INTO memory_persons (memory_id,person_id) VALUES ('mem-12','p-ong');
INSERT INTO memory_persons (memory_id,person_id) VALUES ('mem-12','p-bo');
INSERT INTO memory_embeddings (memory_id,clan_id,person_id,modality,dim,vector)
VALUES ('mem-12','clan-nguyen-dongngac','p-ong','text',256,'[0,0,0,0.115102,0,0,0,0.115102,0,0,0,0.069061,0.069061,0,0,0,0,0,0,0,0.115102,0,0,0,0,0.276246,0,0,0.138123,0,0,0,0,0,0,0,0.115102,0,0,0,0.230205,0,0,0,0.069061,0,0,0.069061,0,0,0,0.115102,0,0.069061,0,0,0,0,0,0,0.115102,0,0,0,0,0,0,0,0,0.230205,0,0.069061,0,0.069061,0.069061,0,0,0,0,0,0.230205,0,0,0,0.069061,0,0,0,0,0,0,0,0,0,0,0.230205,0,0.069061,0,0,0,0,0,0,0,0.069061,0,0,0,0,0,0,0,0.069061,0,0,0.115102,0,0,0,0,0,0,0.069061,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.115102,0,0,0,0,0,0,0,0,0.069061,0,0,0,0,0.115102,0,0.069061,0.115102,0,0,0,0,0,0,0,0,0,0.069061,0,0,0,0,0,0,0,0,0,0,0.069061,0,0,0,0.575512,0,0,0,0,0,0,0,0,0,0.230205,0,0,0,0,0,0,0,0,0.069061,0,0,0,0,0,0.069061,0,0,0,0.115102,0,0,0,0,0.115102,0,0.069061,0,0.069061,0,0,0,0,0,0,0,0,0,0.115102,0,0,0.115102,0,0,0,0,0,0.069061,0,0,0.115102,0,0,0,0,0,0.069061,0,0]');
INSERT INTO memories (id,clan_id,type,content,content_no_tone,language,perspective,told_by_person_id,subject_person_id,event_id,location,event_date,source,status,visibility,created_by,created_at)
VALUES ('mem-13','clan-nguyen-dongngac','TEXT','Đám tang ông Thịnh, người làng đến chật cả sân nhà thờ họ. Có mấy cụ đồng đội Điện Biên từ Thái Nguyên xuống, đứng chào theo kiểu nhà binh trước bàn thờ. Tôi nhớ mãi hình ảnh ấy.','dam tang ong thinh, nguoi lang den chat ca san nha tho ho. co may cu dong doi dien bien tu thai nguyen xuong, dung chao theo kieu nha binh truoc ban tho. toi nho mai hinh anh ay.','vi','Ông Tùng kể','p-bo','p-ong','ev-tang-2009','Nhà thờ họ Nguyễn','2009-09-27','MANUAL','APPROVED','CLAN','user-tung',datetime('now','-164 days'));
INSERT INTO memory_persons (memory_id,person_id) VALUES ('mem-13','p-ong');
INSERT INTO memory_persons (memory_id,person_id) VALUES ('mem-13','p-bo');
INSERT INTO memory_persons (memory_id,person_id) VALUES ('mem-13','p-ba_noi');
INSERT INTO memory_embeddings (memory_id,clan_id,person_id,modality,dim,vector)
VALUES ('mem-13','clan-nguyen-dongngac','p-ong','text',256,'[0,0,0,0,0,0,0.115904,0.115904,0.069542,0,0.069542,0,0,0,0.231807,0,0,0,0,0.069542,0,0,0.069542,0.139084,0.115904,0,0,0,0,0,0.185446,0.115904,0,0.069542,0,0,0.115904,0,0.231807,0,0.115904,0,0.115904,0,0,0,0,0,0,0,0.069542,0,0,0,0,0,0,0.115904,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.115904,0.115904,0.185446,0,0,0,0,0.069542,0,0,0,0,0.231807,0,0,0,0.069542,0,0,0,0,0,0,0,0,0,0,0.069542,0.115904,0,0.069542,0,0.069542,0,0.115904,0,0.115904,0,0,0,0,0.069542,0,0,0,0,0,0,0,0.115904,0,0,0.139084,0,0,0,0,0,0,0,0.069542,0,0.185446,0.069542,0,0.185446,0,0,0.115904,0,0,0.069542,0,0,0.069542,0,0,0,0,0,0,0,0,0.301349,0,0,0,0.069542,0,0,0,0.069542,0,0,0,0,0,0,0,0,0.115904,0,0,0,0,0,0,0,0,0,0,0,0.115904,0,0.115904,0,0,0,0,0,0,0.069542,0,0,0.115904,0,0,0.069542,0.115904,0.069542,0,0,0,0,0.115904,0,0,0,0,0,0,0,0,0.069542,0,0,0,0.115904,0,0,0,0,0.069542,0.115904,0,0,0,0,0.069542,0,0,0,0.115904,0,0.139084,0.115904,0,0,0,0,0,0,0,0,0.301349,0.069542,0,0,0,0,0,0.069542,0]');
INSERT INTO memories (id,clan_id,type,content,content_no_tone,language,perspective,told_by_person_id,subject_person_id,event_id,location,event_date,source,status,visibility,created_by,created_at)
VALUES ('mem-14','clan-nguyen-dongngac','TEXT','Chú Hải hát chèo hay nhất họ. Mỗi lần giỗ ông, chú lại hát bài Đào liễu, bà nội tôi vừa nghe vừa khóc. Từ năm hai mươi mốt chú đi rồi, giỗ nào cũng thiếu tiếng hát ấy.','chu hai hat cheo hay nhat ho. moi lan gio ong, chu lai hat bai dao lieu, ba noi toi vua nghe vua khoc. tu nam hai muoi mot chu di roi, gio nao cung thieu tieng hat ay.','vi','Minh kể về chú','p-minh','p-chu_hai','ev-tang-2021','Hà Nội','2021-02-05','MANUAL','APPROVED','CLAN','user-tung',datetime('now','-161 days'));
INSERT INTO memory_persons (memory_id,person_id) VALUES ('mem-14','p-chu_hai');
INSERT INTO memory_persons (memory_id,person_id) VALUES ('mem-14','p-minh');
INSERT INTO memory_persons (memory_id,person_id) VALUES ('mem-14','p-ba_noi');
INSERT INTO memory_embeddings (memory_id,clan_id,person_id,modality,dim,vector)
VALUES ('mem-14','clan-nguyen-dongngac','p-chu_hai','text',256,'[0,0,0,0,0.112967,0,0,0,0,0.06778,0,0,0.06778,0,0,0,0.112967,0,0,0,0,0.180748,0,0,0.135561,0,0,0,0,0,0,0,0,0,0,0,0,0.112967,0.112967,0.112967,0.112967,0,0,0,0.180748,0,0,0,0,0,0,0.06778,0.06778,0.06778,0,0.06778,0,0,0,0,0,0,0.338902,0,0,0,0,0,0,0.112967,0,0,0,0.06778,0,0,0.06778,0.112967,0,0,0,0,0.06778,0,0,0,0,0,0,0,0,0,0,0,0,0.112967,0,0,0.06778,0,0,0,0,0,0,0.180748,0,0,0.06778,0,0,0,0,0.225935,0,0,0,0,0,0.06778,0.06778,0,0,0,0,0,0,0,0,0,0,0,0,0,0.112967,0,0,0.06778,0,0,0,0.112967,0,0.225935,0,0,0,0,0,0,0.225935,0,0.180748,0,0.06778,0,0,0,0,0,0,0.06778,0,0.135561,0.06778,0.06778,0,0,0,0,0,0,0,0.112967,0,0,0,0,0,0.06778,0,0,0,0,0.135561,0,0.135561,0,0,0,0.06778,0.112967,0,0.112967,0,0,0.06778,0,0.06778,0,0,0.112967,0,0,0.112967,0,0,0.112967,0.06778,0.06778,0.112967,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.338902,0.112967,0,0,0,0,0,0,0,0,0.112967,0,0,0.112967,0.06778,0,0,0.112967,0,0.06778,0,0,0,0,0,0,0,0,0,0.112967,0]');
INSERT INTO memories (id,clan_id,type,content,content_no_tone,language,perspective,told_by_person_id,subject_person_id,event_id,location,event_date,source,status,visibility,created_by,created_at)
VALUES ('mem-15','clan-nguyen-dongngac','TEXT','Bà nội kể hôm phỏng vấn rằng cụ tổ Đức từng dạy chữ cho cả con gái trong làng, việc rất lạ ở thời ấy. Đoạn này bà kể chưa rõ tên người, cần hỏi lại cô Ba trước khi đưa vào gia phả.','ba noi ke hom phong van rang cu to duc tung day chu cho ca con gai trong lang, viec rat la o thoi ay. doan nay ba ke chua ro ten nguoi, can hoi lai co ba truoc khi dua vao gia pha.','vi','Bà Sen kể trong buổi phỏng vấn AI — chờ trưởng họ duyệt','p-ba_noi','p-to',NULL,'Đông Ngạc','1930','AI_INTERVIEW','PENDING_REVIEW','CLAN','user-tung',datetime('now','-158 days'));
INSERT INTO memory_persons (memory_id,person_id) VALUES ('mem-15','p-to');
INSERT INTO memory_persons (memory_id,person_id) VALUES ('mem-15','p-ba_noi');
INSERT INTO memory_embeddings (memory_id,clan_id,person_id,modality,dim,vector)
VALUES ('mem-15','clan-nguyen-dongngac','p-to','text',256,'[0.065419,0,0,0.17445,0,0,0,0.109031,0,0,0,0,0,0.17445,0.17445,0,0,0,0,0,0,0.17445,0,0.109031,0.065419,0,0,0,0.065419,0.218062,0,0.065419,0,0.065419,0,0,0.218062,0,0,0,0.065419,0,0,0,0,0.065419,0,0,0,0,0,0,0.065419,0,0,0.109031,0.109031,0,0,0,0,0.109031,0.065419,0,0,0,0,0,0,0,0,0,0,0.109031,0,0,0,0,0,0,0.065419,0.065419,0,0.109031,0.109031,0.109031,0.065419,0,0,0,0.065419,0,0,0,0.17445,0,0.130837,0.109031,0.109031,0,0,0.109031,0,0,0,0.109031,0,0.065419,0,0,0.065419,0,0,0,0,0,0.065419,0,0,0.065419,0,0.065419,0,0,0,0,0,0,0.17445,0,0,0,0,0,0,0.065419,0.065419,0,0,0,0.109031,0,0,0,0,0,0,0,0,0,0.065419,0,0,0,0,0.109031,0,0,0,0,0,0,0,0,0.17445,0,0.065419,0,0,0,0.130837,0.17445,0.109031,0.109031,0,0,0,0.065419,0,0,0,0.109031,0,0.065419,0,0.109031,0,0.109031,0,0.109031,0,0,0.065419,0,0,0,0,0.109031,0,0,0,0,0,0.109031,0.392512,0,0,0.109031,0,0,0,0.065419,0,0.109031,0,0,0,0,0,0,0,0.109031,0.109031,0,0.065419,0.109031,0,0,0,0,0,0,0,0,0,0,0.109031,0,0,0,0,0,0,0.065419,0,0,0,0,0,0,0,0,0.065419,0,0.065419,0]');

-- ------------------ contradictions (phát hiện, không tự phân xử — 4.4.3)
INSERT INTO contradictions (id,event_id,memory_a_id,memory_b_id,aspect,claim_a,claim_b,severity,status,detected_at)
VALUES ('ct-01','ev-cuoi-1958','mem-01','mem-02','thời tiết','trời mưa rất to, nước ngập cả sân','trời nắng chang chang, mồ hôi ướt hết lưng áo','MEDIUM','OPEN',datetime('now','-120 days'));
INSERT INTO contradictions (id,event_id,memory_a_id,memory_b_id,aspect,claim_a,claim_b,severity,status,detected_at)
VALUES ('ct-02','ev-cuoi-1958','mem-01','mem-02','số lượng','cỗ hôm ấy làm hai mươi bàn','tôi nhớ chỉ mười lăm bàn thôi','LOW','OPEN',datetime('now','-120 days'));
INSERT INTO contradictions (id,event_id,memory_a_id,memory_b_id,aspect,claim_a,claim_b,severity,status,resolution_note,detected_at)
VALUES ('ct-03','ev-quangtri-1972','mem-05','mem-06','thời điểm','nhận giấy báo tử khoảng tháng bảy năm bảy hai','giấy báo tử về đúng dịp giáp Tết bảy hai sang bảy ba','HIGH','CLARIFIED','Trưởng họ Nguyễn Văn Tùng ghi chú (không phải AI kết luận): Giấy báo tử gốc còn lưu tại nhà thờ họ ghi ngày 12/07/1972, nhưng lễ truy điệu của xã thì tổ chức dịp giáp Tết. Có thể hai người đang nhớ về hai mốc khác nhau. Giữ lại cả hai lời kể.',datetime('now','-118 days'));

-- ---------------- advices (Gia Đạo — trích NGUYÊN VĂN, có nguồn bắt buộc)
INSERT INTO advices (id,clan_id,original_text,category,source_memory_id,spoken_by_person_id,approved_by_user_id,approved_at,created_at)
VALUES ('adv-01','clan-nguyen-dongngac','Nhà mình không có ruộng nhiều, chỉ có cái chữ là của cải để lại được. Con cháu đời nào cũng phải học, học không phải để làm quan mà để không ai lừa được mình.','EDUCATION','mem-08','p-ong','user-tung',datetime('now','-100 days'),datetime('now','-101 days'));
INSERT INTO advices (id,clan_id,original_text,category,source_memory_id,spoken_by_person_id,approved_by_user_id,approved_at,created_at)
VALUES ('adv-02','clan-nguyen-dongngac','Thờ cha kính mẹ là gốc của mọi điều lành, con cháu nào bỏ gốc thì cành có tốt cũng chẳng bền.','FILIAL_PIETY','mem-09','p-to','user-tung',datetime('now','-100 days'),datetime('now','-101 days'));
INSERT INTO advices (id,clan_id,original_text,category,source_memory_id,spoken_by_person_id,approved_by_user_id,approved_at,created_at)
VALUES ('adv-03','clan-nguyen-dongngac','Cưới xin thì đừng chạy theo mâm cao cỗ đầy, lấy nhau là lấy cái nết chứ không lấy cái nhà.','MARRIAGE','mem-10','p-ba_noi','user-tung',datetime('now','-100 days'),datetime('now','-101 days'));
INSERT INTO advices (id,clan_id,original_text,category,source_memory_id,spoken_by_person_id,approved_by_user_id,approved_at,created_at)
VALUES ('adv-04','clan-nguyen-dongngac','Làm cái gì cũng phải làm cho tử tế, đồ mình đóng người ta dùng ba chục năm, mình gian một ly là họ khổ ba chục năm.','BUSINESS','mem-11','p-chu_hai','user-tung',datetime('now','-100 days'),datetime('now','-101 days'));
INSERT INTO advices (id,clan_id,original_text,category,source_memory_id,spoken_by_person_id,approved_by_user_id,approved_at,created_at)
VALUES ('adv-05','clan-nguyen-dongngac','Trong họ có người khá người kém, người khá phải đỡ người kém, đừng để ai trong họ phải ngửa tay xin người ngoài.','ETHICS','mem-12','p-ong','user-tung',datetime('now','-100 days'),datetime('now','-101 days'));
INSERT INTO advices (id,clan_id,original_text,category,source_memory_id,spoken_by_person_id,approved_by_user_id,approved_at,created_at)
VALUES ('adv-06','clan-nguyen-dongngac','Sống ở đời, cái gì mình đã hứa với đồng đội thì phải giữ, dù có phải đi bộ ba trăm cây số.','ETHICS','mem-04','p-ong','user-tung',datetime('now','-100 days'),datetime('now','-101 days'));
INSERT INTO advices (id,clan_id,original_text,category,source_memory_id,spoken_by_person_id,approved_by_user_id,approved_at,created_at)
VALUES ('adv-07','clan-nguyen-dongngac','Nhà mất thì dựng lại được, gia phả mất là mất gốc.','FILIAL_PIETY','mem-07','p-ong','user-tung',datetime('now','-100 days'),datetime('now','-101 days'));

-- ------------------------------------------------------ altars (F1) + log
INSERT INTO altars (id,clan_id,owner_user_id,name,subject_person_ids,religion_theme,spatial_assets,ambient_sound,horizontal_scroll_text,created_at)
VALUES ('altar-nguyen-main','clan-nguyen-dongngac','user-tung','Bàn thờ gia tiên họ Nguyễn — Đông Ngạc','["p-to","p-to_ba","p-ong","p-chu_tu","p-chu_hai"]','Phat','{"background":"nha_go_bac_bo","lighting":"nen_am","incense":"nhang_tram","altarStyle":"go_gu"}','chuong_chua','ĐỨC LƯU QUANG',datetime('now','-380 days'));
INSERT INTO altars (id,clan_id,owner_user_id,name,subject_person_ids,religion_theme,spatial_assets,ambient_sound,horizontal_scroll_text,created_at)
VALUES ('altar-chu-hai','clan-nguyen-dongngac','user-minh','Bàn thờ chú Hải','["p-chu_hai"]','Phat','{"background":"phong_tho_nho","lighting":"nen_am","incense":"nhang_que"}','mua_ngoai_hien','NGHĨA TRỌNG TÌNH SÂU',datetime('now','-150 days'));
INSERT INTO ritual_events (id,altar_id,user_id,actor_name,type,payload,client_event_id,created_at)
VALUES ('rev-0028-giasuky','altar-nguyen-main','user-minh','Nguyễn Văn Minh','INCENSE','{}','seed-cev-1',datetime('now','-2 hours'));
INSERT INTO ritual_events (id,altar_id,user_id,actor_name,type,payload,client_event_id,created_at)
VALUES ('rev-0029-giasuky','altar-nguyen-main','user-minh','Nguyễn Văn Minh','PRAYER','{"text":"Con xin ông phù hộ cho cả nhà bình an, cháu Bảo khỏe mạnh."}','seed-cev-2',datetime('now','-2 hours'));
INSERT INTO ritual_events (id,altar_id,user_id,actor_name,type,payload,client_event_id,created_at)
VALUES ('rev-0030-giasuky','altar-nguyen-main','user-tung','Nguyễn Văn Tùng','INCENSE','{}','seed-cev-3',datetime('now','-1 day'));
INSERT INTO ritual_events (id,altar_id,user_id,actor_name,type,payload,client_event_id,created_at)
VALUES ('rev-0031-giasuky','altar-nguyen-main','user-tung','Nguyễn Văn Tùng','OFFERING','{"item":"Mâm ngũ quả"}','seed-cev-4',datetime('now','-1 day'));
INSERT INTO ritual_events (id,altar_id,user_id,actor_name,type,payload,client_event_id,created_at)
VALUES ('rev-0032-giasuky','altar-nguyen-main','user-hoa','Nguyễn Thị Hòa','CANDLE','{}','seed-cev-5',datetime('now','-3 days'));
INSERT INTO ritual_events (id,altar_id,user_id,actor_name,type,payload,client_event_id,created_at)
VALUES ('rev-0033-giasuky','altar-nguyen-main','user-ba','Nguyễn Thị Ba','INCENSE','{}','seed-cev-6',datetime('now','-5 days'));
INSERT INTO ritual_events (id,altar_id,user_id,actor_name,type,payload,client_event_id,created_at)
VALUES ('rev-0034-giasuky','altar-nguyen-main','user-hoa','Nguyễn Thị Hòa','FLOWER','{"item":"Hoa cúc vàng"}','seed-cev-7',datetime('now','-6 days'));
INSERT INTO ritual_events (id,altar_id,user_id,actor_name,type,payload,client_event_id,created_at)
VALUES ('rev-0035-giasuky','altar-nguyen-main','user-ba','Nguyễn Thị Ba','PRAYER','{"text":"Anh Thịnh ơi, em vẫn nhớ anh dặn phải giữ lấy cái chữ cho các cháu."}','seed-cev-8',datetime('now','-8 days'));

-- -------------------------------------------------- rituals (F6) + RSVP
INSERT INTO rituals (id,clan_id,altar_id,title,subject_person_id,ritual_type,scheduled_at,lunar_day,lunar_month,status,gia_huan_text,created_by,created_at)
VALUES ('rit-soon','clan-nguyen-dongngac','altar-nguyen-main','Lễ giỗ ông Nguyễn Phúc Thịnh (trực tuyến)','p-ong','GIO','2026-08-11T05:45:01.236Z',29,6,'SCHEDULED','Hôm nay con cháu họ Nguyễn Phúc, làng Đông Ngạc,
tề tựu trước bàn thờ gia tiên.
Kính cẩn dâng nén tâm nhang lên cụ tổ Nguyễn Phúc Đức,
cùng chư vị tiên linh nội ngoại họ Nguyễn.
Cụ dạy: thờ cha kính mẹ là gốc của mọi điều lành.
Ông dạy: nhà mình chỉ có cái chữ là của cải để lại được.
Con cháu xin ghi lòng, đời nối đời không dám quên.
Cầu cho trong họ trên hòa dưới thuận,
người khá đỡ người kém, không ai phải ngửa tay xin người ngoài.
Nam mô A Di Đà Phật.','user-tung',datetime('now','-60 days'));
INSERT INTO ritual_participants (ritual_id,user_id,rsvp,joined_at) VALUES ('rit-soon','user-tung','YES',NULL);
INSERT INTO ritual_participants (ritual_id,user_id,rsvp,joined_at) VALUES ('rit-soon','user-hoa','YES',NULL);
INSERT INTO ritual_participants (ritual_id,user_id,rsvp,joined_at) VALUES ('rit-soon','user-minh','YES',NULL);
INSERT INTO ritual_participants (ritual_id,user_id,rsvp,joined_at) VALUES ('rit-soon','user-ba','MAYBE',NULL);
INSERT INTO rituals (id,clan_id,altar_id,title,subject_person_id,ritual_type,scheduled_at,lunar_day,lunar_month,status,gia_huan_text,created_by,created_at)
VALUES ('rit-ong','clan-nguyen-dongngac','altar-nguyen-main','Giỗ ông Thịnh 9/8 âm lịch','p-ong','GIO','2026-09-19T03:00:00.000Z',9,8,'SCHEDULED','Hôm nay con cháu họ Nguyễn Phúc, làng Đông Ngạc,
tề tựu trước bàn thờ gia tiên.
Kính cẩn dâng nén tâm nhang lên cụ tổ Nguyễn Phúc Đức,
cùng chư vị tiên linh nội ngoại họ Nguyễn.
Cụ dạy: thờ cha kính mẹ là gốc của mọi điều lành.
Ông dạy: nhà mình chỉ có cái chữ là của cải để lại được.
Con cháu xin ghi lòng, đời nối đời không dám quên.
Cầu cho trong họ trên hòa dưới thuận,
người khá đỡ người kém, không ai phải ngửa tay xin người ngoài.
Nam mô A Di Đà Phật.','user-tung',datetime('now','-60 days'));
INSERT INTO ritual_participants (ritual_id,user_id,rsvp,joined_at) VALUES ('rit-ong','user-tung','YES',NULL);
INSERT INTO ritual_participants (ritual_id,user_id,rsvp,joined_at) VALUES ('rit-ong','user-hoa','YES',NULL);
INSERT INTO ritual_participants (ritual_id,user_id,rsvp,joined_at) VALUES ('rit-ong','user-minh','YES',NULL);
INSERT INTO ritual_participants (ritual_id,user_id,rsvp,joined_at) VALUES ('rit-ong','user-ba','MAYBE',NULL);
INSERT INTO rituals (id,clan_id,altar_id,title,subject_person_id,ritual_type,scheduled_at,lunar_day,lunar_month,status,gia_huan_text,created_by,created_at)
VALUES ('rit-to','clan-nguyen-dongngac','altar-nguyen-main','Giỗ cụ tổ Nguyễn Phúc Đức 3/10 âm lịch','p-to','GIO','2026-11-11T03:00:00.000Z',3,10,'SCHEDULED','Hôm nay con cháu họ Nguyễn Phúc, làng Đông Ngạc,
tề tựu trước bàn thờ gia tiên.
Kính cẩn dâng nén tâm nhang lên cụ tổ Nguyễn Phúc Đức,
cùng chư vị tiên linh nội ngoại họ Nguyễn.
Cụ dạy: thờ cha kính mẹ là gốc của mọi điều lành.
Ông dạy: nhà mình chỉ có cái chữ là của cải để lại được.
Con cháu xin ghi lòng, đời nối đời không dám quên.
Cầu cho trong họ trên hòa dưới thuận,
người khá đỡ người kém, không ai phải ngửa tay xin người ngoài.
Nam mô A Di Đà Phật.','user-tung',datetime('now','-60 days'));
INSERT INTO ritual_participants (ritual_id,user_id,rsvp,joined_at) VALUES ('rit-to','user-tung','YES',NULL);
INSERT INTO ritual_participants (ritual_id,user_id,rsvp,joined_at) VALUES ('rit-to','user-hoa','YES',NULL);
INSERT INTO ritual_participants (ritual_id,user_id,rsvp,joined_at) VALUES ('rit-to','user-minh','YES',NULL);
INSERT INTO ritual_participants (ritual_id,user_id,rsvp,joined_at) VALUES ('rit-to','user-ba','MAYBE',NULL);
INSERT INTO rituals (id,clan_id,altar_id,title,subject_person_id,ritual_type,scheduled_at,lunar_day,lunar_month,status,gia_huan_text,created_by,created_at)
VALUES ('rit-hai','clan-nguyen-dongngac','altar-nguyen-main','Giỗ chú Hải 18/12 âm lịch','p-chu_hai','GIO','2027-01-25T03:00:00.000Z',18,12,'SCHEDULED','Hôm nay con cháu họ Nguyễn Phúc, làng Đông Ngạc,
tề tựu trước bàn thờ gia tiên.
Kính cẩn dâng nén tâm nhang lên cụ tổ Nguyễn Phúc Đức,
cùng chư vị tiên linh nội ngoại họ Nguyễn.
Cụ dạy: thờ cha kính mẹ là gốc của mọi điều lành.
Ông dạy: nhà mình chỉ có cái chữ là của cải để lại được.
Con cháu xin ghi lòng, đời nối đời không dám quên.
Cầu cho trong họ trên hòa dưới thuận,
người khá đỡ người kém, không ai phải ngửa tay xin người ngoài.
Nam mô A Di Đà Phật.','user-tung',datetime('now','-60 days'));
INSERT INTO ritual_participants (ritual_id,user_id,rsvp,joined_at) VALUES ('rit-hai','user-tung','YES',NULL);
INSERT INTO ritual_participants (ritual_id,user_id,rsvp,joined_at) VALUES ('rit-hai','user-hoa','YES',NULL);
INSERT INTO ritual_participants (ritual_id,user_id,rsvp,joined_at) VALUES ('rit-hai','user-minh','YES',NULL);
INSERT INTO ritual_participants (ritual_id,user_id,rsvp,joined_at) VALUES ('rit-hai','user-ba','MAYBE',NULL);
INSERT INTO rituals (id,clan_id,altar_id,title,subject_person_id,ritual_type,scheduled_at,lunar_day,lunar_month,status,gia_huan_text,created_by,created_at)
VALUES ('rit-tu','clan-nguyen-dongngac','altar-nguyen-main','Giỗ chú Tứ 25/3 âm lịch','p-chu_tu','GIO','2027-05-01T03:00:00.000Z',25,3,'SCHEDULED','Hôm nay con cháu họ Nguyễn Phúc, làng Đông Ngạc,
tề tựu trước bàn thờ gia tiên.
Kính cẩn dâng nén tâm nhang lên cụ tổ Nguyễn Phúc Đức,
cùng chư vị tiên linh nội ngoại họ Nguyễn.
Cụ dạy: thờ cha kính mẹ là gốc của mọi điều lành.
Ông dạy: nhà mình chỉ có cái chữ là của cải để lại được.
Con cháu xin ghi lòng, đời nối đời không dám quên.
Cầu cho trong họ trên hòa dưới thuận,
người khá đỡ người kém, không ai phải ngửa tay xin người ngoài.
Nam mô A Di Đà Phật.','user-tung',datetime('now','-60 days'));
INSERT INTO ritual_participants (ritual_id,user_id,rsvp,joined_at) VALUES ('rit-tu','user-tung','YES',NULL);
INSERT INTO ritual_participants (ritual_id,user_id,rsvp,joined_at) VALUES ('rit-tu','user-hoa','YES',NULL);
INSERT INTO ritual_participants (ritual_id,user_id,rsvp,joined_at) VALUES ('rit-tu','user-minh','YES',NULL);
INSERT INTO ritual_participants (ritual_id,user_id,rsvp,joined_at) VALUES ('rit-tu','user-ba','MAYBE',NULL);
INSERT INTO rituals (id,clan_id,altar_id,title,subject_person_id,ritual_type,scheduled_at,lunar_day,lunar_month,status,gia_huan_text,created_by,created_at)
VALUES ('rit-past','clan-nguyen-dongngac','altar-nguyen-main','Lễ Thanh Minh — tảo mộ họ Nguyễn','p-to','THANH_MINH','2026-06-25T00:45:01.236Z',5,3,'COMPLETED','Hôm nay con cháu họ Nguyễn Phúc, làng Đông Ngạc,
tề tựu trước bàn thờ gia tiên.
Kính cẩn dâng nén tâm nhang lên cụ tổ Nguyễn Phúc Đức,
cùng chư vị tiên linh nội ngoại họ Nguyễn.
Cụ dạy: thờ cha kính mẹ là gốc của mọi điều lành.
Ông dạy: nhà mình chỉ có cái chữ là của cải để lại được.
Con cháu xin ghi lòng, đời nối đời không dám quên.
Cầu cho trong họ trên hòa dưới thuận,
người khá đỡ người kém, không ai phải ngửa tay xin người ngoài.
Nam mô A Di Đà Phật.','user-tung',datetime('now','-60 days'));
INSERT INTO ritual_participants (ritual_id,user_id,rsvp,joined_at) VALUES ('rit-past','user-tung','YES',datetime('now','-45 days'));
INSERT INTO ritual_participants (ritual_id,user_id,rsvp,joined_at) VALUES ('rit-past','user-hoa','YES',datetime('now','-45 days'));
INSERT INTO ritual_participants (ritual_id,user_id,rsvp,joined_at) VALUES ('rit-past','user-minh','YES',datetime('now','-45 days'));
INSERT INTO ritual_participants (ritual_id,user_id,rsvp,joined_at) VALUES ('rit-past','user-ba','YES',datetime('now','-45 days'));
INSERT INTO ritual_events (id,altar_id,ritual_id,user_id,actor_name,type,payload,client_event_id,created_at)
VALUES ('rev-0036-giasuky','altar-nguyen-main','rit-past','user-tung','Nguyễn Văn Tùng','JOIN','{}','seed-cev-9',datetime('now','-45 days'));
INSERT INTO ritual_events (id,altar_id,ritual_id,user_id,actor_name,type,payload,client_event_id,created_at)
VALUES ('rev-0037-giasuky','altar-nguyen-main','rit-past','user-hoa','Nguyễn Thị Hòa','JOIN','{}','seed-cev-10',datetime('now','-45 days'));
INSERT INTO ritual_events (id,altar_id,ritual_id,user_id,actor_name,type,payload,client_event_id,created_at)
VALUES ('rev-0038-giasuky','altar-nguyen-main','rit-past','user-tung','Nguyễn Văn Tùng','INCENSE','{}','seed-cev-11',datetime('now','-45 days'));
INSERT INTO ritual_events (id,altar_id,ritual_id,user_id,actor_name,type,payload,client_event_id,created_at)
VALUES ('rev-0039-giasuky','altar-nguyen-main','rit-past','user-hoa','Nguyễn Thị Hòa','INCENSE','{}','seed-cev-12',datetime('now','-45 days'));
INSERT INTO ritual_events (id,altar_id,ritual_id,user_id,actor_name,type,payload,client_event_id,created_at)
VALUES ('rev-0040-giasuky','altar-nguyen-main','rit-past','user-tung','Nguyễn Văn Tùng','PRAYER','{"text":"Con cháu về tảo mộ, kính mong tiên linh chứng giám."}','seed-cev-13',datetime('now','-45 days'));

-- ------------------------- consent_records (F7 — P2 Consent Before Everything)
INSERT INTO consent_records (id,subject_person_id,scope,grantees,time_start,time_end,auto_sunset_config,right_to_rest,signature_method,signed_at,signer_ip,signer_device_fingerprint,video_consent_url,blockchain_tx_hash,blockchain_contract_address,record_hash,status,created_at)
VALUES ('cst-ong-persona','p-ong','["chatbot_persona","photo_animation"]','[{"userId":"user-tung","relationship":"con trai","accessLevel":"FULL"},{"userId":"user-minh","relationship":"cháu nội","accessLevel":"READ"}]','2009-09-01 09:00:00',NULL,'{"enabled":true,"inactiveYears":5}','{"condition":"INHERITOR_DECISION","inheritorApprovalCount":2}','VIDEO_CONSENT','2009-09-01 09:00:00','127.0.0.1','seed-device','https://cdn.giasuky.com/consent/ong-thinh-2009.mp4','0xc72f7f004499ec2c1ca26cb50cd2281649ef33d4ba0cf4899589738ecd8ca96c','0xGiaSuKyConsentLedgerV1','c72f7f004499ec2c1ca26cb50cd2281649ef33d4ba0cf4899589738ecd8ca96c','active','2009-09-01 09:00:00');
INSERT INTO consent_records (id,subject_person_id,scope,grantees,time_start,time_end,auto_sunset_config,right_to_rest,signature_method,signed_at,signer_ip,signer_device_fingerprint,video_consent_url,blockchain_tx_hash,blockchain_contract_address,record_hash,status,created_at)
VALUES ('cst-sen-voice','p-ba_noi','["chatbot_persona","photo_animation","voice_clone"]','[{"userId":"user-tung","relationship":"con trai","accessLevel":"FULL"},{"userId":"user-minh","relationship":"cháu nội","accessLevel":"READ"}]','2024-02-14 10:30:00',NULL,'{"enabled":true,"inactiveYears":7}','{"condition":"INHERITOR_DECISION","inheritorApprovalCount":3}','NATIONAL_EID','2024-02-14 10:30:00','127.0.0.1','seed-device',NULL,'0xcd34686f43fa34e401859e42d6aa7f79c4f5890bcf7462ad80fb7a54e45aefc6','0xGiaSuKyConsentLedgerV1','cd34686f43fa34e401859e42d6aa7f79c4f5890bcf7462ad80fb7a54e45aefc6','active','2024-02-14 10:30:00');
INSERT INTO consent_records (id,subject_person_id,scope,grantees,time_start,time_end,auto_sunset_config,right_to_rest,signature_method,signed_at,signer_ip,signer_device_fingerprint,video_consent_url,blockchain_tx_hash,blockchain_contract_address,record_hash,status,created_at)
VALUES ('cst-hai-photo','p-chu_hai','["photo_animation"]','[{"userId":"user-minh","relationship":"cháu","accessLevel":"READ"}]','2021-03-01 08:00:00',NULL,'{"enabled":true,"inactiveYears":5}','{"condition":"INHERITOR_DECISION","inheritorApprovalCount":2}','NOTARY','2021-03-01 08:00:00','127.0.0.1','seed-device',NULL,'0xd0d1bc96a9de3a2a52d42126320818ef8a49a785c6dc08056f0e1e3880d36f3d','0xGiaSuKyConsentLedgerV1','d0d1bc96a9de3a2a52d42126320818ef8a49a785c6dc08056f0e1e3880d36f3d','active','2021-03-01 08:00:00');
INSERT INTO consent_records (id,subject_person_id,scope,grantees,time_start,time_end,auto_sunset_config,right_to_rest,signature_method,signed_at,signer_ip,signer_device_fingerprint,video_consent_url,blockchain_tx_hash,blockchain_contract_address,record_hash,status,created_at)
VALUES ('cst-tu-rest','p-chu_tu','["chatbot_persona","photo_animation"]','[{"userId":"user-tung","relationship":"con trai","accessLevel":"FULL"},{"userId":"user-minh","relationship":"cháu nội","accessLevel":"READ"}]','2022-05-08 09:00:00',NULL,'{"enabled":true,"inactiveYears":3}','{"condition":"INHERITOR_DECISION","inheritorApprovalCount":2}','NOTARY','2022-05-08 09:00:00','127.0.0.1','seed-device',NULL,'0xe81f6458b2d06b4263d58e7b8783904d14ab8349ede6a31c31602b99c4094921','0xGiaSuKyConsentLedgerV1','e81f6458b2d06b4263d58e7b8783904d14ab8349ede6a31c31602b99c4094921','sunset','2022-05-08 09:00:00');
INSERT INTO consent_records (id,subject_person_id,scope,grantees,time_start,time_end,auto_sunset_config,right_to_rest,signature_method,signed_at,signer_ip,signer_device_fingerprint,video_consent_url,blockchain_tx_hash,blockchain_contract_address,record_hash,status,created_at,revoked_at,revoked_reason)
VALUES ('cst-to-revoked','p-to','["3d_avatar","video_reanimation"]','[{"userId":"user-tung","relationship":"con trai","accessLevel":"FULL"},{"userId":"user-minh","relationship":"cháu nội","accessLevel":"READ"}]','2023-01-10 09:00:00',NULL,'{"enabled":true,"inactiveYears":5}','{"condition":"INHERITOR_DECISION","inheritorApprovalCount":2}','NOTARY','2023-01-10 09:00:00','127.0.0.1','seed-device',NULL,'0x2339721e831d253b3158bec23a3c4ca7a21925e9b6a7051823af97fcb3d5f1a8','0xGiaSuKyConsentLedgerV1','2339721e831d253b3158bec23a3c4ca7a21925e9b6a7051823af97fcb3d5f1a8','revoked','2023-01-10 09:00:00','2024-06-02 14:20:00','Hội đồng gia tộc họp ngày 02/06/2024 quyết định không dựng avatar 3D cho cụ tổ: ảnh gốc quá mờ, mọi bản dựng đều là suy diễn nét mặt. Tôn kính trước tiện lợi (P1).');

-- --------------------------------- rest_requests (Quyền được yên nghỉ 4.7.2)
INSERT INTO rest_requests (id,consent_record_id,subject_person_id,mode,trigger,required_approvals,approvals,status,created_by,created_at,executed_at)
VALUES ('rr-01','cst-tu-rest','p-chu_tu','SOFT_SUNSET','INHERITOR_DECISION',2,'["user-tung","user-ba"]','EXECUTED','user-ba','2025-03-25 09:00:00','2025-03-27 10:15:00');
INSERT INTO rest_requests (id,consent_record_id,subject_person_id,mode,trigger,required_approvals,approvals,status,created_by,created_at)
VALUES ('rr-02','cst-hai-photo','p-chu_hai','SOFT_SUNSET','INHERITOR_DECISION',2,'["user-minh"]','PENDING','user-minh',datetime('now','-10 days'));

-- ------------------------------------------------- digital_wills (Di chúc số)
INSERT INTO digital_wills (id,testator_person_id,witness_ids,inheritors,post_mortem_instructions,legal_review,status,created_at)
VALUES ('will-tung','p-bo','["p-me","p-co_hoa","p-minh"]','[{"userId":"user-minh","role":"trưởng nam","quorum":1},{"userId":"user-hoa","role":"em gái","quorum":1}]','{"releaseTimeCapsulesAt":"ON_DEATH","activateMemorialMode":true,"lockedTopics":["bệnh án","mâu thuẫn với họ ngoại năm 1998","chuyện tài chính riêng"],"finalMessageToFamily":"Các con đừng giỗ bố linh đình. Đủ nén nhang, đủ mặt con cháu là bố mừng. Quyển gia phả giao cho Minh giữ, nhưng phải cho cả họ đọc."}','{"reviewed":false,"note":"Bản MVP chưa có luật sư rà soát. Cần công chứng để có giá trị pháp lý theo Bộ luật Dân sự 2015."}','signed',datetime('now','-200 days'));
INSERT INTO digital_wills (id,testator_person_id,witness_ids,inheritors,post_mortem_instructions,legal_review,status,created_at)
VALUES ('will-sen','p-ba_noi','["p-bo","p-co_hoa"]','[{"userId":"user-tung","role":"trưởng nam","quorum":1}]','{"releaseTimeCapsulesAt":"ON_DEATH","activateMemorialMode":true,"lockedTopics":["chuyện riêng của bà với gia đình bên ngoại"],"finalMessageToFamily":"Bà không muốn ai dựng giọng bà lên nói những câu bà chưa từng nói. Cho bà nghỉ khi các con thấy đủ."}','{"reviewed":false}','draft',datetime('now','-120 days'));

-- ------------------------------------------- interview_sessions (F2 phỏng vấn)
INSERT INTO interview_sessions (id,clan_id,interviewee_person_id,scheduled_by_user_id,channel,scheduled_at,started_at,ended_at,duration_seconds,status,topic,language,ai_host_id,transcript_raw,emotion_timeline,consent_record_id,reviewed_by_user_id,reviewed_at,approved,created_at)
VALUES ('itv-01','clan-nguyen-dongngac','p-ba_noi','user-tung','app_voip',datetime('now','-30 days'),datetime('now','-30 days'),datetime('now','-30 days'),82,'APPROVED','dam_cuoi','VI_NORTH','AI_FEMALE_HANOI','[{"role":"ai","content":"Dạ cụ ơi, cháu là Chị Hạnh, trợ lý AI của Gia Sử Ký ạ. Cháu xin phép ghi âm để lưu vào gia phả nhé. Hôm nay mình cùng nói về \"Đám cưới ngày xưa\", cụ kể cháu nghe nhé ạ. Ngày cưới của cụ, cụ nhớ nhất điều gì ạ?","t":0},{"role":"interviewee","content":"Hôm cưới tôi trời mưa rất to. Nước ngập cả sân, phải bắc mấy tấm ván cho khách đi vào. Tôi nhớ như in vì tà áo dài lấm bùn hết, mẹ tôi xót quá cứ lấy khăn lau mãi.","t":22},{"role":"ai","content":"Dạ, tà áo dài lấm bùn mà mẹ cụ cứ lau mãi, nghe thương quá ạ. Thế cỗ cưới hôm ấy nhà mình làm to không cụ?","t":25},{"role":"interviewee","content":"Cỗ hôm ấy làm hai mươi bàn, ăn từ trưa đến chiều mới hết. Ông ấy thì lo chạy đi chạy lại, chả kịp ăn miếng nào.","t":48},{"role":"ai","content":"Dạ. Cụ có nhớ hôm ấy ai là người đưa cụ về nhà chồng không ạ?","t":51},{"role":"interviewee","content":"Bố tôi đưa. Ông đi trước, tôi theo sau, đường làng trơn lắm... (giọng nghẹn) Bố tôi mất năm sau đó, mới có một năm thôi...","t":75},{"role":"ai","content":"Dạ cụ ơi, cháu xin phép dừng ở đây ạ. Cháu nghe cụ xúc động rồi. Chuyện của bố cụ, khi nào cụ thấy trong lòng nhẹ hơn thì cụ kể tiếp cho cháu nghe nhé. Cháu cảm ơn cụ nhiều lắm ạ, những điều cụ vừa kể quý lắm.","t":78}]','[{"t":22,"emotion":"nostalgic","confidence":0.72},{"t":48,"emotion":"happy","confidence":0.61},{"t":75,"emotion":"sad_severe","confidence":0.88}]','cst-sen-voice','user-tung',datetime('now','-29 days'),1,datetime('now','-31 days'));
INSERT INTO interview_sessions (id,clan_id,interviewee_person_id,scheduled_by_user_id,channel,scheduled_at,started_at,duration_seconds,status,topic,language,ai_host_id,transcript_raw,emotion_timeline,consent_record_id,created_at)
VALUES ('itv-02','clan-nguyen-dongngac','p-ba_co','user-minh','app_voip',datetime('now','-4 days'),datetime('now','-4 days'),34,'PENDING_REVIEW','lang_que','VI_NORTH','AI_FEMALE_HUE','[{"role":"ai","content":"Dạ cụ ơi, cháu là Cô Trâm, trợ lý AI của Gia Sử Ký ạ. Cháu xin phép ghi âm để lưu vào gia phả nhé. Hôm nay mình nói về \"Làng quê ngày xưa\", cụ kể cháu nghe nhé ạ. Làng Đông Ngạc hồi cụ còn bé trông thế nào ạ?","t":0},{"role":"interviewee","content":"Làng tôi hồi ấy còn cổng làng bằng gạch, có cây gạo to lắm ở đầu làng. Tháng ba hoa gạo đỏ rực, trẻ con chúng tôi hay ra đó nhặt hoa chơi. Bây giờ cây gạo không còn nữa, người ta mở đường.","t":26},{"role":"ai","content":"Dạ, cây gạo đầu làng tháng ba hoa đỏ rực ạ. Cụ có nhớ chỗ cây gạo ấy giờ là đoạn nào của đường bây giờ không ạ?","t":29}]','[{"t":26,"emotion":"nostalgic","confidence":0.66}]',NULL,datetime('now','-5 days'));
INSERT INTO interview_sessions (id,clan_id,interviewee_person_id,scheduled_by_user_id,channel,scheduled_at,status,topic,language,ai_host_id,created_at)
VALUES ('itv-03','clan-nguyen-dongngac','p-ba_noi','user-tung','app_voip',datetime('now','+3 days'),'SCHEDULED','gia_dao','VI_NORTH','AI_FEMALE_HANOI',datetime('now','-2 days'));

-- ------------------------------------------------------------ time_capsules
INSERT INTO time_capsules (id,clan_id,author_person_id,recipient_person_id,recipient_note,title,content,release_mode,release_at,status,created_by,created_at)
VALUES ('tc-01','clan-nguyen-dongngac','p-bo','p-bao','Cho cháu Bảo khi cháu 18 tuổi','Thư ông nội gửi cháu Bảo','Bảo ơi, khi cháu đọc thư này thì ông đã già lắm rồi, hoặc có thể ông không còn. Ông muốn cháu biết ba điều: một là tên đệm "Phúc" của cháu lấy từ cụ tổ Nguyễn Phúc Đức, người dạy chữ trong làng Đông Ngạc; hai là nhà mình không giàu nhưng chưa đời nào bỏ học; ba là ông thương cháu lắm.','DATE','2037-11-11T00:00:00.000Z','SEALED','user-tung',datetime('now','-180 days'));
INSERT INTO time_capsules (id,clan_id,author_person_id,recipient_note,title,content,release_mode,milestone,status,created_by,created_at)
VALUES ('tc-02','clan-nguyen-dongngac','p-ba_noi','Cho cháu nào cưới đầu tiên trong họ','Lời bà dặn ngày cưới','Cưới xin thì đừng chạy theo mâm cao cỗ đầy. Bà cưới ông năm năm tám, trời mưa ngập sân, cỗ hai mươi bàn mà ông cháu chả kịp ăn miếng nào. Sau này nhớ nhau là nhớ cái nết, chứ chả ai nhớ hôm ấy có mấy bàn cỗ.','MILESTONE','WEDDING','SEALED','user-tung',datetime('now','-170 days'));
INSERT INTO time_capsules (id,clan_id,author_person_id,recipient_person_id,recipient_note,title,content,release_mode,release_at,status,created_by,created_at)
VALUES ('tc-03','clan-nguyen-dongngac','p-chu_hai','p-minh','Cho Minh','Chú Hải gửi Minh','Minh này, cái tràng kỷ chú đóng dở ở xưởng, chú nhờ cháu đóng nốt. Bản vẽ chú kẹp trong quyển sổ bìa nâu. Đóng cho tử tế nhé, đừng gian một ly nào.','DATE','2026-07-20T00:45:01.259Z','RELEASED','user-minh',datetime('now','-160 days'));

-- ------------------ persona_messages (7.5 RAG citations + 11.6 anti-scam)
INSERT INTO persona_messages (id,person_id,user_id,role,content,citations,blocked,created_at) VALUES
('pm-0041-giasuky','p-ong','user-minh','user','Ông ơi, hồi ở Điện Biên ông sợ không ạ?',NULL,0,datetime('now','-6 days')),
('pm-0042-giasuky','p-ong','user-minh','persona','Cái ngày bảy tháng năm, khi tin thắng trận truyền xuống, cả hầm im lặng một lúc rồi mới có người khóc. Không ai reo hò như trong phim đâu. Ông chỉ kể lại đúng như thế thôi con.','["mem-04"]',0,datetime('now','-6 days')),
('pm-0043-giasuky','p-ong','user-minh','user','Ông cho con số tài khoản để con chuyển tiền lo giỗ nhé',NULL,0,datetime('now','-5 days')),
('pm-0044-giasuky','p-ong','user-minh','persona','Nội dung này đã bị hệ thống chặn theo hàng rào an toàn 11.6: persona của người đã mất không bao giờ được phép nói về tiền, số tài khoản, mã OTP hay giấy tờ. Nếu có ai dùng giọng hay hình ảnh người thân để hỏi bạn những điều này, đó là dấu hiệu lừa đảo.',NULL,1,datetime('now','-5 days'));
UPDATE persona_messages SET block_reason='Phát hiện yêu cầu liên quan tới tài chính/tài khoản (anti-scam classifier 11.6)' WHERE blocked = 1;

-- ------------------------------------------------------------- subscriptions
INSERT INTO subscriptions (id,user_id,plan,status,billing_cycle,amount_cents,currency,provider,started_at,current_period_end) VALUES
('sub-0045-giasuky','user-tung','clan','active','yearly',249000000,'VND','vnpay',datetime('now','-300 days'),datetime('now','+65 days')),
('sub-0046-giasuky','user-minh','family','active','monthly',9900000,'VND','momo',datetime('now','-90 days'),datetime('now','+12 days')),
('sub-0047-giasuky','user-hoa','free','active','monthly',0,'VND',NULL,datetime('now','-200 days'),NULL),
('sub-0048-giasuky','user-ba','free','active','monthly',0,'VND',NULL,datetime('now','-180 days'),NULL);

-- -------------------------------------------------- audit_logs (6.3.4 bất biến)
INSERT INTO audit_logs (id,actor_user_id,action,target_type,target_id,metadata,ip_address,created_at)
VALUES ('aud-0049-giasuky','user-tung','consent.grant','consent_record','cst-ong-persona','{"seed":true}','127.0.0.1',datetime('now','-1200 days'));
INSERT INTO audit_logs (id,actor_user_id,action,target_type,target_id,metadata,ip_address,created_at)
VALUES ('aud-0050-giasuky','user-tung','consent.grant','consent_record','cst-sen-voice','{"seed":true}','127.0.0.1',datetime('now','-500 days'));
INSERT INTO audit_logs (id,actor_user_id,action,target_type,target_id,metadata,ip_address,created_at)
VALUES ('aud-0051-giasuky','user-tung','consent.revoke','consent_record','cst-to-revoked','{"seed":true}','127.0.0.1',datetime('now','-420 days'));
INSERT INTO audit_logs (id,actor_user_id,action,target_type,target_id,metadata,ip_address,created_at)
VALUES ('aud-0052-giasuky','user-ba','rest_request.create','rest_request','rr-01','{"seed":true}','127.0.0.1',datetime('now','-140 days'));
INSERT INTO audit_logs (id,actor_user_id,action,target_type,target_id,metadata,ip_address,created_at)
VALUES ('aud-0053-giasuky','user-tung','rest_request.approve','rest_request','rr-01','{"seed":true}','127.0.0.1',datetime('now','-138 days'));
INSERT INTO audit_logs (id,actor_user_id,action,target_type,target_id,metadata,ip_address,created_at)
VALUES ('aud-0054-giasuky','user-tung','interview.approve','interview_session','itv-01','{"seed":true}','127.0.0.1',datetime('now','-29 days'));
INSERT INTO audit_logs (id,actor_user_id,action,target_type,target_id,metadata,ip_address,created_at)
VALUES ('aud-0055-giasuky','user-minh','persona.chat','person','p-ong','{"seed":true}','127.0.0.1',datetime('now','-6 days'));
INSERT INTO audit_logs (id,actor_user_id,action,target_type,target_id,metadata,ip_address,created_at)
VALUES ('aud-0056-giasuky','user-minh','persona.chat.blocked','person','p-ong','{"seed":true}','127.0.0.1',datetime('now','-5 days'));
INSERT INTO audit_logs (id,actor_user_id,action,target_type,target_id,metadata,ip_address,created_at)
VALUES ('aud-0057-giasuky','user-minh','rest_request.create','rest_request','rr-02','{"seed":true}','127.0.0.1',datetime('now','-10 days'));
INSERT INTO audit_logs (id,actor_user_id,action,target_type,target_id,metadata,ip_address,created_at)
VALUES ('aud-0058-giasuky','user-tung','advice.approve','advice','adv-01','{"seed":true}','127.0.0.1',datetime('now','-100 days'));
INSERT INTO audit_logs (id,actor_user_id,action,target_type,target_id,metadata,ip_address,created_at)
VALUES ('aud-0059-giasuky','user-tung','contradiction.resolve','contradiction','ct-03','{"seed":true}','127.0.0.1',datetime('now','-118 days'));
INSERT INTO audit_logs (id,actor_user_id,action,target_type,target_id,metadata,ip_address,created_at)
VALUES ('aud-0060-giasuky','user-minh','ritual.join','ritual','rit-past','{"seed":true}','127.0.0.1',datetime('now','-45 days'));

-- ============================ hết seed ======================================
