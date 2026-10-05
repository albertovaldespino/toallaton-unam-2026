-- Ejecutar en la base existente toallaton-unam-2026. No crea otra base ni borra registros.
BEGIN;
CREATE TABLE IF NOT EXISTS sites (id TEXT PRIMARY KEY, name TEXT NOT NULL, short_name TEXT NOT NULL, latitude DOUBLE PRECISION NOT NULL CHECK(latitude BETWEEN -90 AND 90), longitude DOUBLE PRECISION NOT NULL CHECK(longitude BETWEEN -180 AND 180), state TEXT NOT NULL, city TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS donations (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), sequence BIGINT GENERATED ALWAYS AS IDENTITY UNIQUE, site_id TEXT NOT NULL REFERENCES sites(id), site_name TEXT NOT NULL, quantity INTEGER NOT NULL CHECK(quantity > 0), donor TEXT, notes TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ);
CREATE INDEX IF NOT EXISTS donations_site_idx ON donations(site_id);

INSERT INTO sites (id,name,short_name,latitude,longitude,state,city) VALUES ('cmu','Centro Médico Universitario','Centro Médico UNAM',19.3328,-99.1881,'Ciudad de México','Coyoacán') ON CONFLICT (id) DO NOTHING;
INSERT INTO sites (id,name,short_name,latitude,longitude,state,city) VALUES ('fad','Facultad de Artes y Diseño','Artes y Diseño',19.2675,-99.1216,'Ciudad de México','Xochimilco') ON CONFLICT (id) DO NOTHING;
INSERT INTO sites (id,name,short_name,latitude,longitude,state,city) VALUES ('zaragoza','FES Zaragoza','FES Zaragoza',19.3827,-99.0355,'Ciudad de México','Iztapalapa') ON CONFLICT (id) DO NOTHING;
INSERT INTO sites (id,name,short_name,latitude,longitude,state,city) VALUES ('prepa3','Escuela Nacional Preparatoria No. 3','Prepa 3',19.4838,-99.0958,'Ciudad de México','Gustavo A. Madero') ON CONFLICT (id) DO NOTHING;
INSERT INTO sites (id,name,short_name,latitude,longitude,state,city) VALUES ('aragon','FES Aragón','FES Aragón',19.4755,-99.0442,'Estado de México','Nezahualcóyotl') ON CONFLICT (id) DO NOTHING;
INSERT INTO sites (id,name,short_name,latitude,longitude,state,city) VALUES ('cuautitlan','FES Cuautitlán','FES Cuautitlán',19.6913,-99.1893,'Estado de México','Cuautitlán Izcalli') ON CONFLICT (id) DO NOTHING;
INSERT INTO sites (id,name,short_name,latitude,longitude,state,city) VALUES ('acatlan','FES Acatlán','FES Acatlán',19.4829,-99.2457,'Estado de México','Naucalpan') ON CONFLICT (id) DO NOTHING;
INSERT INTO sites (id,name,short_name,latitude,longitude,state,city) VALUES ('oriente','CCH Oriente','CCH Oriente',19.3833,-99.0599,'Ciudad de México','Iztapalapa') ON CONFLICT (id) DO NOTHING;
INSERT INTO sites (id,name,short_name,latitude,longitude,state,city) VALUES ('iztacala','FES Iztacala','FES Iztacala',19.5265,-99.1849,'Estado de México','Tlalnepantla') ON CONFLICT (id) DO NOTHING;
INSERT INTO sites (id,name,short_name,latitude,longitude,state,city) VALUES ('azcapotzalco','CCH Azcapotzalco','CCH Azcapotzalco',19.4904,-99.2076,'Ciudad de México','Azcapotzalco') ON CONFLICT (id) DO NOTHING;
INSERT INTO sites (id,name,short_name,latitude,longitude,state,city) VALUES ('naucalpan','CCH Naucalpan','CCH Naucalpan',19.4732,-99.2354,'Estado de México','Naucalpan') ON CONFLICT (id) DO NOTHING;
INSERT INTO sites (id,name,short_name,latitude,longitude,state,city) VALUES ('sur','CCH Sur','CCH Sur',19.3105,-99.2045,'Ciudad de México','Coyoacán') ON CONFLICT (id) DO NOTHING;
INSERT INTO sites (id,name,short_name,latitude,longitude,state,city) VALUES ('prepa4','Escuela Nacional Preparatoria No. 4','Prepa 4',19.4034,-99.1925,'Ciudad de México','Miguel Hidalgo') ON CONFLICT (id) DO NOTHING;
INSERT INTO sites (id,name,short_name,latitude,longitude,state,city) VALUES ('morelia','ENES Morelia','ENES Morelia',19.6495,-101.2229,'Michoacán','Morelia') ON CONFLICT (id) DO NOTHING;
INSERT INTO sites (id,name,short_name,latitude,longitude,state,city) VALUES ('merida','ENES Mérida','ENES Mérida',21.046,-89.674,'Yucatán','Mérida') ON CONFLICT (id) DO NOTHING;
INSERT INTO sites (id,name,short_name,latitude,longitude,state,city) VALUES ('musica','Facultad de Música','Facultad de Música',19.3515,-99.1471,'Ciudad de México','Coyoacán') ON CONFLICT (id) DO NOTHING;
INSERT INTO sites (id,name,short_name,latitude,longitude,state,city) VALUES ('prepa6','Escuela Nacional Preparatoria No. 6 Antonio Caso','Prepa 6',19.3495,-99.1527,'Ciudad de México','Coyoacán') ON CONFLICT (id) DO NOTHING;
COMMIT;
SELECT count(*) AS sedes_disponibles FROM sites;
