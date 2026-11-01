--
-- PostgreSQL database dump
--

\restrict lPvfljcbH86XnSPFuvKyPhm6W8hWILbiCgpHOhvxD0gdD69gfSdu2X75PBWYUZB

-- Dumped from database version 17.9 (Debian 17.9-1.pgdg13+1)
-- Dumped by pg_dump version 17.9 (Debian 17.9-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE ONLY public.yorumlar DROP CONSTRAINT yorumlar_user_id_fkey;
ALTER TABLE ONLY public.yorumlar DROP CONSTRAINT yorumlar_urun_id_fkey;
ALTER TABLE ONLY public.urunler DROP CONSTRAINT urunler_kategori_id_fkey;
ALTER TABLE ONLY public.stok_uyarilari DROP CONSTRAINT stok_uyarilari_urun_id_fkey;
ALTER TABLE ONLY public.siparisler DROP CONSTRAINT siparisler_user_id_fkey;
ALTER TABLE ONLY public.siparis_kalemleri DROP CONSTRAINT siparis_kalemleri_urun_id_fkey;
ALTER TABLE ONLY public.siparis_kalemleri DROP CONSTRAINT siparis_kalemleri_siparis_id_fkey;
ALTER TABLE ONLY public.kargo_takip DROP CONSTRAINT kargo_takip_siparis_id_fkey;
ALTER TABLE ONLY public.iadeler DROP CONSTRAINT iadeler_user_id_fkey;
ALTER TABLE ONLY public.iadeler DROP CONSTRAINT iadeler_siparis_id_fkey;
ALTER TABLE ONLY public.favoriler DROP CONSTRAINT favoriler_user_id_fkey;
ALTER TABLE ONLY public.favoriler DROP CONSTRAINT favoriler_urun_id_fkey;
ALTER TABLE ONLY public.agent_konusmalar DROP CONSTRAINT agent_konusmalar_user_id_fkey;
DROP INDEX public.ix_users_email;
DROP INDEX public.ix_system_settings_id;
DROP INDEX public.ix_system_settings_grup;
DROP INDEX public.ix_system_settings_anahtar;
DROP INDEX public.ix_kategoriler_slug;
ALTER TABLE ONLY public.yorumlar DROP CONSTRAINT yorumlar_pkey;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
ALTER TABLE ONLY public.urunler DROP CONSTRAINT urunler_pkey;
ALTER TABLE ONLY public.yorumlar DROP CONSTRAINT uq_user_urun_yorum;
ALTER TABLE ONLY public.favoriler DROP CONSTRAINT uq_user_urun_favori;
ALTER TABLE ONLY public.siparisler DROP CONSTRAINT uq_siparis_no;
ALTER TABLE ONLY public.system_settings DROP CONSTRAINT system_settings_pkey;
ALTER TABLE ONLY public.stok_uyarilari DROP CONSTRAINT stok_uyarilari_pkey;
ALTER TABLE ONLY public.siparisler DROP CONSTRAINT siparisler_pkey;
ALTER TABLE ONLY public.siparis_kalemleri DROP CONSTRAINT siparis_kalemleri_pkey;
ALTER TABLE ONLY public.kuponlar DROP CONSTRAINT kuponlar_pkey;
ALTER TABLE ONLY public.kuponlar DROP CONSTRAINT kuponlar_kod_key;
ALTER TABLE ONLY public.kategoriler DROP CONSTRAINT kategoriler_pkey;
ALTER TABLE ONLY public.kargo_takip DROP CONSTRAINT kargo_takip_pkey;
ALTER TABLE ONLY public.iadeler DROP CONSTRAINT iadeler_pkey;
ALTER TABLE ONLY public.iadeler DROP CONSTRAINT iadeler_iade_no_key;
ALTER TABLE ONLY public.favoriler DROP CONSTRAINT favoriler_pkey;
ALTER TABLE ONLY public.briefing_gecmisi DROP CONSTRAINT briefing_gecmisi_tarih_key;
ALTER TABLE ONLY public.briefing_gecmisi DROP CONSTRAINT briefing_gecmisi_pkey;
ALTER TABLE ONLY public.analitik_ozet DROP CONSTRAINT analitik_ozet_pkey;
ALTER TABLE ONLY public.alembic_version DROP CONSTRAINT alembic_version_pkc;
ALTER TABLE ONLY public.agent_konusmalar DROP CONSTRAINT agent_konusmalar_session_id_key;
ALTER TABLE ONLY public.agent_konusmalar DROP CONSTRAINT agent_konusmalar_pkey;
ALTER TABLE public.yorumlar ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.urunler ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.system_settings ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.stok_uyarilari ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.siparisler ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.siparis_kalemleri ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.kuponlar ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.kategoriler ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.kargo_takip ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.iadeler ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.favoriler ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.briefing_gecmisi ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.analitik_ozet ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.agent_konusmalar ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE public.yorumlar_id_seq;
DROP TABLE public.yorumlar;
DROP SEQUENCE public.users_id_seq;
DROP TABLE public.users;
DROP SEQUENCE public.urunler_id_seq;
DROP TABLE public.urunler;
DROP SEQUENCE public.system_settings_id_seq;
DROP TABLE public.system_settings;
DROP SEQUENCE public.stok_uyarilari_id_seq;
DROP TABLE public.stok_uyarilari;
DROP SEQUENCE public.siparisler_id_seq;
DROP TABLE public.siparisler;
DROP SEQUENCE public.siparis_kalemleri_id_seq;
DROP TABLE public.siparis_kalemleri;
DROP SEQUENCE public.kuponlar_id_seq;
DROP TABLE public.kuponlar;
DROP SEQUENCE public.kategoriler_id_seq;
DROP TABLE public.kategoriler;
DROP SEQUENCE public.kargo_takip_id_seq;
DROP TABLE public.kargo_takip;
DROP SEQUENCE public.iadeler_id_seq;
DROP TABLE public.iadeler;
DROP SEQUENCE public.favoriler_id_seq;
DROP TABLE public.favoriler;
DROP SEQUENCE public.briefing_gecmisi_id_seq;
DROP TABLE public.briefing_gecmisi;
DROP SEQUENCE public.analitik_ozet_id_seq;
DROP TABLE public.analitik_ozet;
DROP TABLE public.alembic_version;
DROP SEQUENCE public.agent_konusmalar_id_seq;
DROP TABLE public.agent_konusmalar;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: agent_konusmalar; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.agent_konusmalar (
    id integer NOT NULL,
    user_id integer,
    session_id character varying(100) NOT NULL,
    mesajlar json NOT NULL,
    kanal character varying(20) NOT NULL,
    olusturulma timestamp with time zone DEFAULT now() NOT NULL,
    son_aktif timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: agent_konusmalar_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.agent_konusmalar_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: agent_konusmalar_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.agent_konusmalar_id_seq OWNED BY public.agent_konusmalar.id;


--
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);


--
-- Name: analitik_ozet; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.analitik_ozet (
    id integer NOT NULL,
    periyot character varying(20) NOT NULL,
    donem_baslangic timestamp with time zone NOT NULL,
    donem_bitis timestamp with time zone NOT NULL,
    toplam_satis numeric(12,2) NOT NULL,
    siparis_sayisi integer NOT NULL,
    yeni_musteri integer NOT NULL,
    iade_orani numeric(5,2) NOT NULL,
    top_kategoriler json,
    top_urunler json,
    hesaplanma timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: analitik_ozet_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.analitik_ozet_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: analitik_ozet_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.analitik_ozet_id_seq OWNED BY public.analitik_ozet.id;


--
-- Name: briefing_gecmisi; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.briefing_gecmisi (
    id integer NOT NULL,
    tarih date NOT NULL,
    icerik json NOT NULL,
    gonderildi boolean NOT NULL,
    olusturulma timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: briefing_gecmisi_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.briefing_gecmisi_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: briefing_gecmisi_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.briefing_gecmisi_id_seq OWNED BY public.briefing_gecmisi.id;


--
-- Name: favoriler; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.favoriler (
    id integer NOT NULL,
    user_id integer NOT NULL,
    urun_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: favoriler_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.favoriler_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: favoriler_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.favoriler_id_seq OWNED BY public.favoriler.id;


--
-- Name: iadeler; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.iadeler (
    id integer NOT NULL,
    iade_no character varying(20) NOT NULL,
    siparis_id integer NOT NULL,
    user_id integer NOT NULL,
    sebep_kategori character varying(50) NOT NULL,
    sebep_aciklama text NOT NULL,
    iade_tutari numeric(10,2) NOT NULL,
    durum character varying(20) NOT NULL,
    admin_notu text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: iadeler_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.iadeler_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: iadeler_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.iadeler_id_seq OWNED BY public.iadeler.id;


--
-- Name: kargo_takip; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.kargo_takip (
    id integer NOT NULL,
    siparis_id integer NOT NULL,
    firma character varying(50),
    takip_no character varying(100),
    durum character varying(50),
    son_konum text,
    gecikme_var boolean NOT NULL,
    guncelleme timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: kargo_takip_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.kargo_takip_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: kargo_takip_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.kargo_takip_id_seq OWNED BY public.kargo_takip.id;


--
-- Name: kategoriler; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.kategoriler (
    id integer NOT NULL,
    isim character varying(100) NOT NULL,
    slug character varying(100) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: kategoriler_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.kategoriler_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: kategoriler_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.kategoriler_id_seq OWNED BY public.kategoriler.id;


--
-- Name: kuponlar; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.kuponlar (
    id integer NOT NULL,
    kod character varying(50) NOT NULL,
    indirim_tipi character varying(10) NOT NULL,
    deger numeric(10,2) NOT NULL,
    min_tutar numeric(10,2) NOT NULL,
    max_kullanim integer NOT NULL,
    kullanim_sayisi integer NOT NULL,
    aktif boolean NOT NULL,
    bitis_tarihi timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: kuponlar_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.kuponlar_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: kuponlar_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.kuponlar_id_seq OWNED BY public.kuponlar.id;


--
-- Name: siparis_kalemleri; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.siparis_kalemleri (
    id integer NOT NULL,
    siparis_id integer NOT NULL,
    urun_id integer NOT NULL,
    adet integer NOT NULL,
    birim_fiyat numeric(10,2) NOT NULL
);


--
-- Name: siparis_kalemleri_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.siparis_kalemleri_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: siparis_kalemleri_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.siparis_kalemleri_id_seq OWNED BY public.siparis_kalemleri.id;


--
-- Name: siparisler; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.siparisler (
    id integer NOT NULL,
    user_id integer NOT NULL,
    toplam_tutar numeric(10,2) NOT NULL,
    durum character varying(20) NOT NULL,
    adres text NOT NULL,
    notlar text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    siparis_no character varying(20) NOT NULL,
    kupon_kodu character varying(50),
    kargo_no character varying(100)
);


--
-- Name: siparisler_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.siparisler_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: siparisler_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.siparisler_id_seq OWNED BY public.siparisler.id;


--
-- Name: stok_uyarilari; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stok_uyarilari (
    id integer NOT NULL,
    urun_id integer NOT NULL,
    esik integer NOT NULL,
    mevcut_stok integer NOT NULL,
    oneri text,
    durum character varying(20) NOT NULL,
    tetiklenme timestamp with time zone DEFAULT now() NOT NULL,
    kapatilma timestamp with time zone
);


--
-- Name: stok_uyarilari_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.stok_uyarilari_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: stok_uyarilari_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.stok_uyarilari_id_seq OWNED BY public.stok_uyarilari.id;


--
-- Name: system_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.system_settings (
    id integer NOT NULL,
    anahtar character varying(100) NOT NULL,
    deger text NOT NULL,
    grup character varying(50) NOT NULL,
    aciklama character varying(255),
    hassas character varying(10) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: system_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.system_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: system_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.system_settings_id_seq OWNED BY public.system_settings.id;


--
-- Name: urunler; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.urunler (
    id integer NOT NULL,
    isim character varying(255) NOT NULL,
    aciklama text,
    fiyat numeric(10,2) NOT NULL,
    stok integer NOT NULL,
    kategori_id integer,
    resim_url character varying(500),
    aktif boolean NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    ozellikler json,
    stok_esigi integer NOT NULL
);


--
-- Name: urunler_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.urunler_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: urunler_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.urunler_id_seq OWNED BY public.urunler.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    rol character varying(10) NOT NULL,
    isim character varying(100) NOT NULL,
    telefon character varying(20),
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: yorumlar; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.yorumlar (
    id integer NOT NULL,
    user_id integer NOT NULL,
    urun_id integer NOT NULL,
    puan integer NOT NULL,
    yorum text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: yorumlar_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.yorumlar_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: yorumlar_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.yorumlar_id_seq OWNED BY public.yorumlar.id;


--
-- Name: agent_konusmalar id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agent_konusmalar ALTER COLUMN id SET DEFAULT nextval('public.agent_konusmalar_id_seq'::regclass);


--
-- Name: analitik_ozet id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analitik_ozet ALTER COLUMN id SET DEFAULT nextval('public.analitik_ozet_id_seq'::regclass);


--
-- Name: briefing_gecmisi id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.briefing_gecmisi ALTER COLUMN id SET DEFAULT nextval('public.briefing_gecmisi_id_seq'::regclass);


--
-- Name: favoriler id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favoriler ALTER COLUMN id SET DEFAULT nextval('public.favoriler_id_seq'::regclass);


--
-- Name: iadeler id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.iadeler ALTER COLUMN id SET DEFAULT nextval('public.iadeler_id_seq'::regclass);


--
-- Name: kargo_takip id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kargo_takip ALTER COLUMN id SET DEFAULT nextval('public.kargo_takip_id_seq'::regclass);


--
-- Name: kategoriler id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kategoriler ALTER COLUMN id SET DEFAULT nextval('public.kategoriler_id_seq'::regclass);


--
-- Name: kuponlar id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kuponlar ALTER COLUMN id SET DEFAULT nextval('public.kuponlar_id_seq'::regclass);


--
-- Name: siparis_kalemleri id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.siparis_kalemleri ALTER COLUMN id SET DEFAULT nextval('public.siparis_kalemleri_id_seq'::regclass);


--
-- Name: siparisler id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.siparisler ALTER COLUMN id SET DEFAULT nextval('public.siparisler_id_seq'::regclass);


--
-- Name: stok_uyarilari id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stok_uyarilari ALTER COLUMN id SET DEFAULT nextval('public.stok_uyarilari_id_seq'::regclass);


--
-- Name: system_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_settings ALTER COLUMN id SET DEFAULT nextval('public.system_settings_id_seq'::regclass);


--
-- Name: urunler id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.urunler ALTER COLUMN id SET DEFAULT nextval('public.urunler_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: yorumlar id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.yorumlar ALTER COLUMN id SET DEFAULT nextval('public.yorumlar_id_seq'::regclass);


--
-- Data for Name: agent_konusmalar; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.agent_konusmalar (id, user_id, session_id, mesajlar, kanal, olusturulma, son_aktif) FROM stdin;
1	\N	2c94529a-6fd4-4a21-b1b9-0547c8d27931	[]	web	2026-05-16 18:05:18.493601+00	2026-05-16 18:05:18.493601+00
4	\N	ff80055c-6077-4f46-b788-5f6ef499b405	[{"role": "user", "content": "Merhaba"}, {"role": "model", "content": "Merhaba! Size nas\\u0131l yard\\u0131mc\\u0131 olabilirim? Herhangi bir \\u00fcr\\u00fcn aray\\u0131\\u015f\\u0131n\\u0131z var m\\u0131?"}, {"role": "user", "content": "Telefon sat\\u0131n almak istiyorum"}, {"role": "model", "content": "Elbette! Stoklar\\u0131m\\u0131zda \\u015fu anda birka\\u00e7 telefon modeli mevcut:\\n\\n- **Samsung Galaxy S24**: 45,999.99 TL\\n- **iPhone 15 Pro Max 256GB**: 74,999.99 TL\\n- **Samsung Galaxy S24 Ultra**: 69,999.99 TL\\n- **Xiaomi 14 Pro**: 34,999.99 TL\\n- **Google Pixel 8 Pro**: 39,999.99 TL\\n\\nBu modellere ilgiliniz varsa daha fazla bilgi verebilirim!"}]	web	2026-05-22 21:09:18.854966+00	2026-05-22 21:09:29.452815+00
5	\N	41b0aaed-a040-4b28-9364-6027bf5bdc03	[{"role": "user", "content": "Merhaba"}, {"role": "model", "content": "Merhaba! Size nas\\u0131l yard\\u0131mc\\u0131 olabilirim? Herhangi bir \\u00fcr\\u00fcn hakk\\u0131nda bilgi almak ister misiniz?"}, {"role": "user", "content": "Telefon sat\\u0131n almak istiyorum"}, {"role": "model", "content": "Size birka\\u00e7 telefon \\u00f6nerisinde bulunabilirim:\\n\\n1. **Samsung Galaxy S24** - 45,999.99 TL\\n2. **Samsung Galaxy S24 Ultra** - 69,999.99 TL\\n3. **iPhone 15 Pro Max 256GB** - 74,999.99 TL\\n4. **Xiaomi 14 Pro** - 34,999.99 TL\\n5. **Google Pixel 8 Pro** - 39,999.99 TL\\n\\nBu telefonlardan herhangi biriyle ilgileniyorsan\\u0131z, daha fazla bilgi verebilirim!"}]	web	2026-05-22 21:32:00.905741+00	2026-05-22 21:32:11.484272+00
2	\N	79e2f369-8dd2-412b-8073-5e70b9121ba7	[{"role": "user", "content": "Merhaba"}, {"role": "model", "content": "Bir hata olu\\u015ftu, l\\u00fctfen tekrar deneyin."}, {"role": "user", "content": "Selam"}, {"role": "model", "content": "Bir hata olu\\u015ftu, l\\u00fctfen tekrar deneyin."}, {"role": "user", "content": "Merhaba"}, {"role": "model", "content": "Bir hata olu\\u015ftu, l\\u00fctfen tekrar deneyin."}, {"role": "user", "content": "Merhab"}, {"role": "model", "content": "Merhaba! Size nas\\u0131l yard\\u0131mc\\u0131 olabilirim? Hangi \\u00fcr\\u00fcnlerle ilgileniyorsunuz?"}, {"role": "user", "content": "Telefon"}, {"role": "model", "content": "Hangi telefon modelini ar\\u0131yorsunuz? Stoklar\\u0131m\\u0131zda birka\\u00e7 se\\u00e7enek var:\\n\\n- **Samsung Galaxy S24**: 45,999.99 TL\\n- **Samsung Galaxy S24 Ultra**: 69,999.99 TL\\n- **Xiaomi 14 Pro**: 34,999.99 TL\\n- **Google Pixel 8 Pro**: 39,999.99 TL\\n- **iPhone 15 Pro Max 256GB**: 74,999.99 TL\\n\\nYard\\u0131mc\\u0131 olmam\\u0131 istedi\\u011finiz bir model var m\\u0131?"}, {"role": "user", "content": "Merhaba"}, {"role": "model", "content": "Merhaba! Size nas\\u0131l yard\\u0131mc\\u0131 olabilirim? Telefon ar\\u0131yorsan\\u0131z, stoklar\\u0131m\\u0131zda bulunan baz\\u0131 modeller \\u015funlard\\u0131r:\\n\\n- **Samsung Galaxy S24**: 45,999.99 TL\\n- **Samsung Galaxy S24 Ultra**: 69,999.99 TL\\n- **Xiaomi 14 Pro**: 34,999.99 TL\\n- **Google Pixel 8 Pro**: 39,999.99 TL\\n- **iPhone 15 Pro Max 256GB**: 74,999.99 TL\\n\\nHangi model hakk\\u0131nda daha fazla bilgi istersiniz?"}, {"role": "user", "content": "Merhaba"}, {"role": "model", "content": "Merhaba! Size nas\\u0131l yard\\u0131mc\\u0131 olabilirim? Telefon, elektronik ya da ba\\u015fka bir \\u00fcr\\u00fcnle ilgili bilgi mi almak istersiniz? Stoklar\\u0131m\\u0131zda bulunan \\u00fcr\\u00fcnlerden baz\\u0131lar\\u0131:\\n\\n- **Samsung Galaxy S24**: 45,999.99 TL\\n- **iPhone 15 Pro Max 256GB**: 74,999.99 TL\\n- **Xiaomi 14 Pro**: 34,999.99 TL\\n\\nHangi \\u00fcr\\u00fcn hakk\\u0131nda daha fazla bilgi istersiniz?"}, {"role": "user", "content": "Telefon ar\\u0131yorum"}, {"role": "model", "content": "Elbette! \\u0130\\u015fte stoklar\\u0131m\\u0131zda bulunan baz\\u0131 telefon modelleri:\\n\\n- **Samsung Galaxy S24**: 45,999.99 TL\\n- **Samsung Galaxy S24 Ultra**: 69,999.99 TL\\n- **Xiaomi 14 Pro**: 34,999.99 TL\\n- **Google Pixel 8 Pro**: 39,999.99 TL\\n- **iPhone 15 Pro Max 256GB**: 74,999.99 TL\\n\\nHangi model hakk\\u0131nda daha fazla bilgi almak istersiniz?"}]	web	2026-05-22 20:31:25.475558+00	2026-05-22 20:44:11.377044+00
6	\N	b4381f68-571d-4e69-a679-fcfb33a4fe48	[{"role": "user", "content": "Merhaba"}, {"role": "model", "content": "Merhaba! Size nas\\u0131l yard\\u0131mc\\u0131 olabilirim? Herhangi bir \\u00fcr\\u00fcn hakk\\u0131nda bilgi almak ister misiniz?"}, {"role": "user", "content": "Telefon sat\\u0131n almak istiyorum"}, {"role": "model", "content": "Elbette! Stoklar\\u0131m\\u0131zda bulunan telefonlar:\\n\\n1. **Samsung Galaxy S24:** 45,999.99 TL\\n2. **iPhone 15 Pro Max 256GB:** 74,999.99 TL\\n3. **Samsung Galaxy S24 Ultra:** 69,999.99 TL\\n4. **Xiaomi 14 Pro:** 34,999.99 TL\\n5. **Google Pixel 8 Pro:** 39,999.99 TL\\n\\nHangisi hakk\\u0131nda daha fazla bilgi almak istersiniz?"}]	web	2026-05-22 21:43:52.217093+00	2026-05-22 21:44:00.956518+00
3	\N	5126b018-cf7e-4219-aa12-932cae6a53f4	[{"role": "user", "content": "Merhaba"}, {"role": "model", "content": "Merhaba! Size nas\\u0131l yard\\u0131mc\\u0131 olabilirim? Herhangi bir \\u00fcr\\u00fcn ar\\u0131yorsan\\u0131z, yard\\u0131mc\\u0131 olmaktan mutluluk duyar\\u0131m."}, {"role": "user", "content": "Telefon sat\\u0131n almak istiyorum"}, {"role": "model", "content": "Elbette! Stoklar\\u0131m\\u0131zda \\u015fu anda birka\\u00e7 telefon mevcut:\\n\\n1. **Samsung Galaxy S24** - 45,999.99 TL\\n2. **iPhone 15 Pro Max 256GB** - 74,999.99 TL\\n3. **Samsung Galaxy S24 Ultra** - 69,999.99 TL\\n4. **Xiaomi 14 Pro** - 34,999.99 TL\\n5. **Google Pixel 8 Pro** - 39,999.99 TL\\n\\n\\u0130lgilendi\\u011finiz bir model var m\\u0131?"}]	web	2026-05-22 20:54:13.258091+00	2026-05-22 20:54:24.101542+00
\.


--
-- Data for Name: alembic_version; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.alembic_version (version_num) FROM stdin;
0f89976b7166
\.


--
-- Data for Name: analitik_ozet; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.analitik_ozet (id, periyot, donem_baslangic, donem_bitis, toplam_satis, siparis_sayisi, yeni_musteri, iade_orani, top_kategoriler, top_urunler, hesaplanma) FROM stdin;
1	gunluk	2026-05-18 20:50:00.027865+00	2026-05-19 20:50:00.027865+00	0.00	0	3	0.00	\N	\N	2026-05-19 20:50:00.071522+00
2	gunluk	2026-05-21 20:50:00.004186+00	2026-05-22 20:50:00.004186+00	0.00	0	0	0.00	\N	\N	2026-05-22 20:50:00.006861+00
3	gunluk	2026-05-31 20:50:00.007068+00	2026-06-01 20:50:00.007068+00	0.00	0	0	0.00	\N	\N	2026-06-01 20:50:00.032206+00
4	aylik	2026-05-04 15:20:28.715036+00	2026-06-03 15:20:28.715036+00	33599.93	4	7	200.00	\N	\N	2026-06-03 15:20:29.021469+00
5	aylik	2026-05-04 15:20:36.525119+00	2026-06-03 15:20:36.525119+00	33599.93	4	7	200.00	\N	\N	2026-06-03 15:20:35.406687+00
\.


--
-- Data for Name: briefing_gecmisi; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.briefing_gecmisi (id, tarih, icerik, gonderildi, olusturulma) FROM stdin;
\.


--
-- Data for Name: favoriler; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.favoriler (id, user_id, urun_id, created_at) FROM stdin;
1	1	91	2026-05-20 12:36:33.052297+00
3	3	69	2026-05-20 12:37:11.969156+00
4	3	67	2026-05-20 12:37:13.022353+00
5	3	89	2026-05-20 12:37:37.773393+00
7	3	92	2026-05-22 21:06:59.551198+00
\.


--
-- Data for Name: iadeler; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.iadeler (id, iade_no, siparis_id, user_id, sebep_kategori, sebep_aciklama, iade_tutari, durum, admin_notu, created_at, updated_at) FROM stdin;
1	IA-591A30F4	7	1	vazgecme	idae etmek istiyorum	45999.99	onaylandi	\N	2026-05-05 08:57:45.439381+00	2026-05-05 08:58:02.011064+00
2	IA-C1CDFF38	9	3	vazgecme	iade etmek istiyorum	91999.98	onaylandi	\N	2026-05-05 08:59:27.237521+00	2026-05-05 08:59:39.535944+00
3	IA-CF59681C	9	3	yanlis_urun	iade etmek istiyorum	91999.98	onaylandi	\N	2026-05-05 09:00:07.462342+00	2026-05-05 09:03:28.185482+00
4	IA-AD01A8EA	7	1	beden_uyumsuz	Urun kutusundan hasarli cikti, ekranda cizikler var.	45999.99	onaylandi	Iade talebiniz incelendi ve onaylanmistir. Tutariniz 3 is gunu icinde hesabiniza yatacaktir.	2026-05-05 09:12:57.172836+00	2026-05-05 09:14:02.46936+00
5	IA-3F65AA56	9	3	beden_uyumsuz	Ürün büyük geldi	91999.98	onaylandi	\N	2026-05-22 20:53:26.920444+00	2026-05-22 20:53:52.177969+00
6	IA-596C6E79	11	3	beden_uyumsuz	Numarası büyük geldi	4799.99	onaylandi	\N	2026-05-22 21:08:23.485778+00	2026-05-22 21:08:47.794847+00
7	IA-70EA4D4B	13	8	beden_uyumsuz	Ayakkabı numarası büyük geldi	4799.99	onaylandi	\N	2026-05-22 21:35:55.858921+00	2026-05-22 21:36:25.962512+00
8	IA-73A62878	14	10	beden_uyumsuz	Ayakkabı numarası büyük geldi	9599.98	onaylandi	\N	2026-05-22 21:47:11.226351+00	2026-05-22 21:47:34.416046+00
\.


--
-- Data for Name: kargo_takip; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.kargo_takip (id, siparis_id, firma, takip_no, durum, son_konum, gecikme_var, guncelleme) FROM stdin;
\.


--
-- Data for Name: kategoriler; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.kategoriler (id, isim, slug, created_at) FROM stdin;
1	Elektronik	elektronik	2026-04-29 16:55:43.109357+00
2	Akıllı Telefonlar	akilli-telefonlar	2026-04-29 20:39:47.486118+00
3	Bilgisayar & Tablet	bilgisayar-tablet	2026-04-29 20:39:47.521433+00
4	TV & Görüntü	tv-goruntu	2026-04-29 20:39:47.561195+00
5	Kulaklık & Ses Sistemleri	kulaklik-ses-sistemleri	2026-04-29 20:39:47.588701+00
6	Giyim & Moda	giyim-moda	2026-04-29 20:39:47.607414+00
7	Ev & Yaşam	ev-yasam	2026-04-29 20:39:47.626791+00
8	Kişisel Bakım	kisisel-bakim	2026-04-29 20:39:47.647992+00
9	Spor & Outdoor	spor-outdoor	2026-04-29 20:39:47.667311+00
10	test	test	2026-05-19 17:19:23.755321+00
\.


--
-- Data for Name: kuponlar; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.kuponlar (id, kod, indirim_tipi, deger, min_tutar, max_kullanim, kullanim_sayisi, aktif, bitis_tarihi, created_at) FROM stdin;
\.


--
-- Data for Name: siparis_kalemleri; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.siparis_kalemleri (id, siparis_id, urun_id, adet, birim_fiyat) FROM stdin;
1	1	1	1	1.00
2	2	2	2	45999.99
3	3	2	1	45999.99
4	4	2	1	45999.99
5	5	2	1	45999.99
6	6	2	1	45999.99
7	7	2	1	45999.99
8	8	2	1	45999.99
9	9	2	2	45999.99
10	10	2	3	45999.99
11	11	92	1	4799.99
12	12	92	3	4799.99
13	13	92	1	4799.99
14	14	92	2	4799.99
\.


--
-- Data for Name: siparisler; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.siparisler (id, user_id, toplam_tutar, durum, adres, notlar, created_at, updated_at, siparis_no, kupon_kodu, kargo_no) FROM stdin;
1	1	1.00	bekliyor	Örnek Mahallesi, Test Sokak No:1 Kadıköy/İstanbul		2026-04-29 17:28:58.665642+00	2026-04-29 17:29:18.685898+00	LS-FB4810D4	\N	\N
3	1	45999.99	bekliyor	Ataturk Mahallesi Cumhuriyet Cad No 42 Daire 7 Kadikoy Istanbul		2026-04-29 18:39:17.990009+00	2026-04-29 18:39:17.990009+00	LS-E0398B3C	\N	\N
4	2	45999.99	bekliyor	Ataturk Mahallesi Cumhuriyet Cad No 42 Daire 7 Kadikoy Istanbul		2026-04-29 18:40:36.600909+00	2026-04-29 18:40:36.600909+00	LS-2E30C2E0	\N	\N
5	2	45999.99	iptal	Test Address		2026-04-29 18:41:15.3851+00	2026-04-29 19:15:27.46687+00	LS-5082BF93	\N	\N
6	1	45999.99	iptal	Ataturk Mahallesi Cumhuriyet Cad No 42 Daire 7 Kadikoy Istanbul		2026-04-29 18:46:41.890342+00	2026-04-29 19:15:48.649181+00	LS-0F358B1E	\N	\N
2	1	91999.98	teslim_edildi	Ataturk Mahallesi Cumhuriyet Cad No 42 Daire 7 Kadikoy Istanbul		2026-04-29 18:38:06.957169+00	2026-04-29 19:15:56.779899+00	LS-F4C23816	\N	\N
9	3	91999.98	onaylandi	test adrte	\N	2026-04-29 19:03:08.065599+00	2026-04-29 19:32:38.901577+00	LS-BA6CDE77	\N	\N
7	1	45999.99	teslim_edildi	This is a very long address intended to test the maximum length validation of the address field on the backend. It is definitely more than fifty characters long and should help us see if there is any upper limit.		2026-04-29 18:47:36.669848+00	2026-04-29 20:24:24.274692+00	LS-253DFB3A	\N	\N
8	1	45999.99	bekliyor	1234567890		2026-04-29 18:47:55.901376+00	2026-04-29 20:24:33.715505+00	LS-1D983633	\N	\N
10	3	137999.97	kargolandi	test test test	\N	2026-04-29 19:03:47.373576+00	2026-05-22 20:49:31.40054+00	LS-DF014B66	\N	\N
11	3	4799.99	kargolandi	İnönü üniversitesi mühendislik fakültesi	\N	2026-05-22 20:52:37.293489+00	2026-05-22 21:04:02.811814+00	LS-0B7EBBA3	\N	\N
12	3	14399.97	bekliyor	İnönü Üniversitesi Mühendislik Fakültesi	\N	2026-05-22 21:07:31.58493+00	2026-05-22 21:07:31.58493+00	LS-E394C227	\N	\N
13	8	4799.99	kargolandi	İnönü Üniversitesi Mühendislik Fakültesi	\N	2026-05-22 21:31:19.105442+00	2026-05-22 21:33:52.210518+00	LS-700C0A10	\N	\N
14	10	9599.98	kargolandi	İnönü üniversitesi Mühendislik Fakültesi	\N	2026-05-22 21:44:33.264005+00	2026-05-22 21:46:27.955354+00	LS-B150D0D9	\N	\N
\.


--
-- Data for Name: stok_uyarilari; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.stok_uyarilari (id, urun_id, esik, mevcut_stok, oneri, durum, tetiklenme, kapatilma) FROM stdin;
20	41	10	8	Samsung 65" Neo QLED 4K Smart TV için mevcut stok 8, kritik eşik 10. Hızla 20 adet sipariş geçilmeli.	acik	2026-06-03 15:26:43.894434+00	\N
21	84	10	8	iRobot Roomba j9+ Robot Süpürge için mevcut stok 8 adet, kritik eşik 10. Hemen 20 adet sipariş geçilmeli.	acik	2026-06-03 15:26:43.894434+00	\N
22	54	10	8	iRobot Roomba j9+ Robot Süpürge çok satılıyor, mevcut stok 8 adet. Hemen 20 adet sipariş geçilmeli.	acik	2026-06-03 15:26:43.894434+00	\N
23	71	10	8	Samsung 65" Neo QLED 4K Smart TV için mevcut stok 8, kritik eşik 10. Hemen 10 adet sipariş geçilmeli.	acik	2026-06-03 15:26:43.894434+00	\N
18	24	10	8	iRobot Roomba j9+ Robot Süpürge için mevcut stok 8, kritik eşik 10. Hemen 20 adet sipariş geçilmeli.	kapatildi	2026-06-03 15:26:43.894434+00	2026-06-03 15:28:09.056311+00
19	11	10	8	Samsung 65" Neo QLED 4K Smart TV için mevcut stok 8 adet, kritik eşik 10. Hızla 20 adet sipariş geçilmeli.	kapatildi	2026-06-03 15:26:43.894434+00	2026-06-03 15:28:14.310138+00
\.


--
-- Data for Name: system_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.system_settings (id, anahtar, deger, grup, aciklama, hassas, created_at, updated_at) FROM stdin;
1	kargo_firma		kargo	Aktif kargo firması (yurtici / aras / ptt / mng)	hayir	2026-06-03 15:24:04.685856+00	2026-06-03 15:24:04.685856+00
2	kargo_kullanici_adi		kargo	Kargo entegrasyon kullanıcı adı	hayir	2026-06-03 15:24:04.685856+00	2026-06-03 15:24:04.685856+00
3	kargo_sifre		kargo	Kargo entegrasyon şifresi	evet	2026-06-03 15:24:04.685856+00	2026-06-03 15:24:04.685856+00
4	kargo_musteri_kodu		kargo	Firmaya özel müşteri kodu	hayir	2026-06-03 15:24:04.685856+00	2026-06-03 15:24:04.685856+00
5	kargo_api_url		kargo	Kargo API base URL (opsiyonel, varsayılan kullanılır)	hayir	2026-06-03 15:24:04.685856+00	2026-06-03 15:24:04.685856+00
6	smtp_host		mail	SMTP sunucu adresi (Örn: smtp.gmail.com)	hayir	2026-06-03 15:24:04.685856+00	2026-06-03 15:24:04.685856+00
7	smtp_port	587	mail	SMTP port numarası (587 veya 465)	hayir	2026-06-03 15:24:04.685856+00	2026-06-03 15:24:04.685856+00
8	smtp_kullanici		mail	SMTP kullanıcı adı / e-posta adresi	hayir	2026-06-03 15:24:04.685856+00	2026-06-03 15:24:04.685856+00
9	smtp_sifre		mail	SMTP şifresi veya uygulama parolası	evet	2026-06-03 15:24:04.685856+00	2026-06-03 15:24:04.685856+00
10	smtp_gonderen_ad		mail	Gönderen adı (Örn: LocalShop Mağaza)	hayir	2026-06-03 15:24:04.685856+00	2026-06-03 15:24:04.685856+00
11	smtp_gonderen_email		mail	Gönderen e-posta adresi	hayir	2026-06-03 15:24:04.685856+00	2026-06-03 15:24:04.685856+00
12	whatsapp_token		whatsapp	Meta WhatsApp Business API erişim token'ı	evet	2026-06-03 15:24:04.685856+00	2026-06-03 15:24:04.685856+00
13	whatsapp_phone_id		whatsapp	WhatsApp Business telefon numarası ID'si	hayir	2026-06-03 15:24:04.685856+00	2026-06-03 15:24:04.685856+00
14	whatsapp_verify_token		whatsapp	Webhook doğrulama token'ı (kendi belirlediğiniz gizli kelime)	evet	2026-06-03 15:24:04.685856+00	2026-06-03 15:24:04.685856+00
\.


--
-- Data for Name: urunler; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.urunler (id, isim, aciklama, fiyat, stok, kategori_id, resim_url, aktif, created_at, ozellikler, stok_esigi) FROM stdin;
1	test	test	1.00	0	1	\N	f	2026-04-29 16:56:34.996452+00	\N	10
85	Philips Airfryer XXL HD9285	7.3L kapasite (5 kişilik), Rapid Air teknolojisi, %90 daha az yağ, dijital dokunmatik ekran, 7 ön ayarlı program, bulaşık makinesine uygun.	6999.99	22	7	https://images.unsplash.com/photo-1648398798875-a03ae2cff0d3?w=600	f	2026-05-09 13:17:05.674723+00	{"Marka": "Philips", "Kapasite": "7.3 L", "Renk": "Siyah"}	10
2	Samsung Galaxy S24	Son nesil ak	45999.99	12	1	\N	t	2026-04-29 17:10:32.716702+00	\N	10
74	Apple AirPods Pro 2 (USB-C)	Apple AirPods Pro 2 (USB-C), müzik dinleme deneyiminizi bir üst seviyeye taşıyor. Gelişmiş aktif gürültü engelleme özelliği ile dış dünyadan tamamen koparken, şeffaf mod ile çevrenizle bağlantınızı koruyabilirsiniz. Uzun pil ömrü ve konforlu tasarımı sayesinde, her anınızda yanınızda olacak bu kablosuz kulaklıkları kaçırmayın! Hemen sahip olun, müzik keyfinizi sınırsız kılın!	9499.99	50	5	https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600	t	2026-05-09 13:17:05.512338+00	{"Marka": "Apple", "Ba\\u011flant\\u0131 Tipi": "Bluetooth", "G\\u00fcr\\u00fclt\\u00fc Engelleme": "Var", "Renk": "Beyaz"}	10
23	Nespresso Vertuo Next Kahve Makinesi	Centrifusion teknolojisi, 5 farklı fincan boyutu (espresso'dan carafe'a), tek tuşla kullanım, 30 saniyede ısınma, %54 geri dönüştürülmüş plastik.	5499.99	30	7	https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600	t	2026-04-29 20:39:48.073041+00	\N	10
24	iRobot Roomba j9+ Robot Süpürge	PrecisionVision navigasyon, otomatik çöp boşaltma istasyonu, 3 aşamalı temizlik, evcil hayvan tüyü uzmanı, akıllı haritalama.	29999.99	8	7	https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=600	t	2026-04-29 20:39:48.090741+00	\N	10
25	Philips Airfryer XXL HD9285	7.3L kapasite (5 kişilik), Rapid Air teknolojisi, %90 daha az yağ, dijital dokunmatik ekran, 7 ön ayarlı program, bulaşık makinesine uygun.	6999.99	22	7	https://images.unsplash.com/photo-1648398798875-a03ae2cff0d3?w=600	t	2026-04-29 20:39:48.106242+00	\N	10
26	Dyson Airwrap Complete Long	Coanda etkisi ile saç şekillendirme, 6 farklı başlık, akıllı ısı kontrolü, uzun saçlar için optimize edilmiş, 1300W motor.	17999.99	12	8	https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600	t	2026-04-29 20:39:48.123571+00	\N	10
27	Oral-B iO Series 9 Elektrikli Diş Fırçası	Manyetik iO teknolojisi, 3D izleme sensörü, renkli OLED ekran, 7 temizlik modu, AI fırçalama koçu, seyahat çantası dahil.	5499.99	25	8	https://images.unsplash.com/photo-1559591937-abc1f8f90c9d?w=600	t	2026-04-29 20:39:48.14034+00	\N	10
28	Philips OneBlade Pro QP6551	360° esnek başlık, hassas tarak sistemi (14 kademe), ıslak ve kuru kullanım, 120 dakika pil ömrü, LED gösterge.	2299.99	35	8	https://images.unsplash.com/photo-1621607505099-7125e08c1e96?w=600	t	2026-04-29 20:39:48.158008+00	\N	10
29	Apple Watch Ultra 2	49mm titanyum kasa, 3000 nit ekran, çift frekanslı GPS, 100m su direnci, 36 saat pil ömrü, Action Button. En dayanıklı Apple Watch.	29999.99	20	9	https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600	t	2026-04-29 20:39:48.17363+00	\N	10
3	iPhone 15 Pro Max 256GB	Apple A17 Pro çip, 48MP kamera sistemi, titanyum tasarım, USB-C, 6.7 inç Super Retina XDR OLED ekran. iOS 17 ile en gelişmiş iPhone deneyimi.	74999.99	25	2	https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600	t	2026-04-29 20:39:47.686124+00	\N	10
4	Samsung Galaxy S24 Ultra	Snapdragon 8 Gen 3 işlemci, 200MP kamera, S Pen desteği, 6.8 inç Dynamic AMOLED 2X ekran, Galaxy AI yapay zekâ özellikleri.	69999.99	30	2	https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600	t	2026-04-29 20:39:47.713203+00	\N	10
5	Xiaomi 14 Pro	Leica optik kamera sistemi, Snapdragon 8 Gen 3, 120W hızlı şarj, 6.73 inç LTPO AMOLED ekran, 50MP ana kamera.	34999.99	40	2	https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600	t	2026-04-29 20:39:47.735224+00	\N	10
6	Google Pixel 8 Pro	Google Tensor G3 çip, 50MP ana kamera, 7 yıl Android güncelleme garantisi, AI fotoğraf düzenleme, 6.7 inç LTPO OLED ekran.	39999.99	15	2	https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600	t	2026-04-29 20:39:47.755721+00	\N	10
7	MacBook Air M3 15 inç	Apple M3 çip, 8 çekirdekli CPU, 10 çekirdekli GPU, 16GB RAM, 512GB SSD, 18 saat pil ömrü. Fanless tasarım, MagSafe şarj.	54999.99	20	3	https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600	t	2026-04-29 20:39:47.778587+00	\N	10
8	iPad Pro M4 11 inç	Apple M4 çip, Ultra Retina XDR Tandem OLED ekran, Apple Pencil Pro desteği, 256GB SSD, Face ID, Wi-Fi 6E.	44999.99	18	3	https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600	t	2026-04-29 20:39:47.800523+00	\N	10
9	ASUS ROG Strix G16 Gaming Laptop	Intel Core i9-14900HX, NVIDIA RTX 4070 8GB, 32GB DDR5 RAM, 1TB NVMe SSD, 16 inç 240Hz QHD+ ekran. RGB klavye, Dolby Atmos.	89999.99	10	3	https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600	t	2026-04-29 20:39:47.821402+00	\N	10
10	Lenovo ThinkPad X1 Carbon Gen 12	Intel Core Ultra 7, 16GB LPDDR5x, 512GB SSD, 14 inç 2.8K OLED ekran, MIL-STD-810H dayanıklılık, 1.08 kg ağırlık.	62999.99	12	3	https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600	t	2026-04-29 20:39:47.842118+00	\N	10
11	Samsung 65" Neo QLED 4K Smart TV	QN85D serisi, Neural Quantum 4K işlemci, Dolby Atmos, 120Hz, Gaming Hub, SmartThings entegrasyonu, Slim One Connect.	49999.99	8	4	https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600	t	2026-04-29 20:39:47.862235+00	\N	10
12	LG 55" OLED C4 4K Smart TV	OLED evo, α9 AI Gen7 işlemci, Dolby Vision & Atmos, 120Hz VRR, webOS 24, 4x HDMI 2.1, Ultra İnce Tasarım.	42999.99	10	4	https://images.unsplash.com/photo-1461151304267-38535e780c79?w=600	t	2026-04-29 20:39:47.882075+00	\N	10
13	Sony PlayStation 5 Slim	825GB SSD, DualSense kablosuz kumanda, 4K 120fps oyun desteği, Ray Tracing, PS VR2 uyumlu, %30 daha kompakt tasarım.	18999.99	35	4	https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600	t	2026-04-29 20:39:47.900743+00	\N	10
14	Apple AirPods Pro 2 (USB-C)	H2 çip, Aktif Gürültü Engelleme, Adaptif Ses, Kişiselleştirilmiş Spatial Audio, 6 saat pil, MagSafe şarj kutusu.	9499.99	50	5	https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600	t	2026-04-29 20:39:47.919169+00	\N	10
15	Sony WH-1000XM5	Endüstri lideri gürültü engelleme, 30 saat pil ömrü, LDAC Hi-Res Audio, Speak-to-Chat, çoklu cihaz bağlantısı, katlanır tasarım.	11999.99	30	5	https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600	t	2026-04-29 20:39:47.935386+00	\N	10
16	JBL Charge 5 Bluetooth Hoparlör	IP67 su ve toz geçirmez, 20 saat pil ömrü, JBL Pro Sound, Powerbank özelliği, PartyBoost ile çoklu hoparlör bağlantısı.	4999.99	45	5	https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600	t	2026-04-29 20:39:47.951657+00	\N	10
17	Marshall Stanmore III	Bluetooth 5.2, dinamik geniş sahne, bas ve tiz ayarı, vintage rock tasarım, RCA ve 3.5mm giriş, Marshall uygulaması desteği.	12499.99	15	5	https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600	t	2026-04-29 20:39:47.968535+00	\N	10
18	Nike Air Force 1 '07	Efsanevi beyaz deri sneaker, Air yastıklama teknolojisi, dayanıklı kauçuk taban, klasik basketball DNA, her kombine uyumlu.	3799.99	60	6	https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600	t	2026-04-29 20:39:47.985733+00	\N	10
19	Levi's 501 Original Fit Jean	1873'ten beri ikonik düz kesim, %100 pamuk denim, düğmeli kapama, orta bel, zaman geçtikçe güzelleşen yıkama. Klasik indigo mavi.	2499.99	80	6	https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=600	t	2026-04-29 20:39:48.001989+00	\N	10
20	The North Face 1996 Retro Nuptse Ceket	700 fill power kaz tüyü dolgulu, su itici DryVent dış yüzey, ikonik puffer tasarım, -20°C'ye kadar sıcaklık. Siyah renk.	8999.99	25	6	https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600	t	2026-04-29 20:39:48.019472+00	\N	10
21	Ray-Ban Wayfarer Classic Güneş Gözlüğü	Polarize G-15 cam lens, asetat çerçeve, UV400 koruma, ikonik 1956 tasarımı, İtalya yapımı. Siyah/yeşil cam.	3299.99	40	6	https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600	t	2026-04-29 20:39:48.036892+00	\N	10
22	Dyson V15 Detect Kablosuz Süpürge	Lazer toz algılama, LCD ekranda parçacık analizi, 60 dakika çalışma süresi, HEPA filtreleme, Click-in batarya.	24999.99	15	7	https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600	t	2026-04-29 20:39:48.055246+00	\N	10
30	Garmin Fenix 8 AMOLED	1.4 inç AMOLED ekran, solar şarj, çoklu uydu desteği, 100m dalış direnci, gelişmiş antrenman metrikleri, TopoActive haritalar.	24999.99	10	9	https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600	t	2026-04-29 20:39:48.188732+00	\N	10
31	Nike Dri-FIT ADV Running Tişört	Gelişmiş nem yönetimi, hafif ve nefes alabilir kumaş, reflektif detaylar, düz kesim, gece koşuları için görünürlük. Siyah/Gümüş.	1299.99	100	9	https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600	t	2026-04-29 20:39:48.208243+00	\N	10
33	iPhone 15 Pro Max 256GB	Apple A17 Pro çip, 48MP kamera sistemi, titanyum tasarım, USB-C, 6.7 inç Super Retina XDR OLED ekran. iOS 17 ile en gelişmiş iPhone deneyimi.	74999.99	25	\N	https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600	t	2026-05-09 13:13:30.463861+00	{"Marka": "Apple", "Dahili Haf\\u0131za": "256 GB", "Renk": "Nat\\u00fcrel Titanyum", "RAM Kapasitesi": "8 GB"}	10
34	Samsung Galaxy S24 Ultra	Snapdragon 8 Gen 3 işlemci, 200MP kamera, S Pen desteği, 6.8 inç Dynamic AMOLED 2X ekran, Galaxy AI yapay zekâ özellikleri.	69999.99	30	\N	https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600	t	2026-05-09 13:13:30.499559+00	{"Marka": "Samsung", "Dahili Haf\\u0131za": "512 GB", "Renk": "Titanyum Siyah", "RAM Kapasitesi": "12 GB"}	10
35	Xiaomi 14 Pro	Leica optik kamera sistemi, Snapdragon 8 Gen 3, 120W hızlı şarj, 6.73 inç LTPO AMOLED ekran, 50MP ana kamera.	34999.99	40	\N	https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600	t	2026-05-09 13:13:30.51488+00	{"Marka": "Xiaomi", "Dahili Haf\\u0131za": "512 GB", "Renk": "Beyaz", "RAM Kapasitesi": "16 GB"}	10
36	Google Pixel 8 Pro	Google Tensor G3 çip, 50MP ana kamera, 7 yıl Android güncelleme garantisi, AI fotoğraf düzenleme, 6.7 inç LTPO OLED ekran.	39999.99	15	\N	https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600	t	2026-05-09 13:13:30.527748+00	{"Marka": "Google", "Dahili Haf\\u0131za": "128 GB", "Renk": "Mavi", "RAM Kapasitesi": "12 GB"}	10
37	MacBook Air M3 15 inç	Apple M3 çip, 8 çekirdekli CPU, 10 çekirdekli GPU, 16GB RAM, 512GB SSD, 18 saat pil ömrü. Fanless tasarım, MagSafe şarj.	54999.99	20	\N	https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600	t	2026-05-09 13:13:30.540985+00	{"Marka": "Apple", "\\u0130\\u015flemci": "Apple M3", "RAM": "16 GB", "SSD Kapasitesi": "512 GB", "Ekran Boyutu": "15 in\\u00e7"}	10
38	iPad Pro M4 11 inç	Apple M4 çip, Ultra Retina XDR Tandem OLED ekran, Apple Pencil Pro desteği, 256GB SSD, Face ID, Wi-Fi 6E.	44999.99	18	\N	https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600	t	2026-05-09 13:13:30.55276+00	{"Marka": "Apple", "\\u0130\\u015fletim Sistemi": "iPadOS", "Haf\\u0131za": "256 GB", "Ekran Boyutu": "11 in\\u00e7"}	10
39	ASUS ROG Strix G16 Gaming Laptop	Intel Core i9-14900HX, NVIDIA RTX 4070 8GB, 32GB DDR5 RAM, 1TB NVMe SSD, 16 inç 240Hz QHD+ ekran. RGB klavye, Dolby Atmos.	89999.99	10	\N	https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600	t	2026-05-09 13:13:30.564572+00	{"Marka": "ASUS", "\\u0130\\u015flemci": "Intel Core i9", "RAM": "32 GB", "SSD Kapasitesi": "1 TB", "Ekran Kart\\u0131": "Nvidia GeForce RTX 4070"}	10
40	Lenovo ThinkPad X1 Carbon Gen 12	Intel Core Ultra 7, 16GB LPDDR5x, 512GB SSD, 14 inç 2.8K OLED ekran, MIL-STD-810H dayanıklılık, 1.08 kg ağırlık.	62999.99	12	\N	https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600	t	2026-05-09 13:13:30.576642+00	{"Marka": "Lenovo", "\\u0130\\u015flemci": "Intel Core Ultra 7", "RAM": "16 GB", "SSD Kapasitesi": "512 GB", "Ekran Boyutu": "14 in\\u00e7"}	10
41	Samsung 65" Neo QLED 4K Smart TV	QN85D serisi, Neural Quantum 4K işlemci, Dolby Atmos, 120Hz, Gaming Hub, SmartThings entegrasyonu, Slim One Connect.	49999.99	8	\N	https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600	t	2026-05-09 13:13:30.587996+00	{"Marka": "Samsung", "\\u00c7\\u00f6z\\u00fcn\\u00fcrl\\u00fck": "4K Ultra HD", "Ekran Boyutu": "65 in\\u00e7", "G\\u00f6r\\u00fcnt\\u00fc Teknolojisi": "QLED"}	10
42	LG 55" OLED C4 4K Smart TV	OLED evo, α9 AI Gen7 işlemci, Dolby Vision & Atmos, 120Hz VRR, webOS 24, 4x HDMI 2.1, Ultra İnce Tasarım.	42999.99	10	\N	https://images.unsplash.com/photo-1461151304267-38535e780c79?w=600	t	2026-05-09 13:13:30.598838+00	{"Marka": "LG", "\\u00c7\\u00f6z\\u00fcn\\u00fcrl\\u00fck": "4K Ultra HD", "Ekran Boyutu": "55 in\\u00e7", "G\\u00f6r\\u00fcnt\\u00fc Teknolojisi": "OLED"}	10
43	Sony PlayStation 5 Slim	825GB SSD, DualSense kablosuz kumanda, 4K 120fps oyun desteği, Ray Tracing, PS VR2 uyumlu, %30 daha kompakt tasarım.	18999.99	35	\N	https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600	t	2026-05-09 13:13:30.608279+00	{"Marka": "Sony", "Depolama Kapasitesi": "825 GB", "Renk": "Beyaz"}	10
44	Apple AirPods Pro 2 (USB-C)	H2 çip, Aktif Gürültü Engelleme, Adaptif Ses, Kişiselleştirilmiş Spatial Audio, 6 saat pil, MagSafe şarj kutusu.	9499.99	50	\N	https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600	t	2026-05-09 13:13:30.619981+00	{"Marka": "Apple", "Ba\\u011flant\\u0131 Tipi": "Bluetooth", "G\\u00fcr\\u00fclt\\u00fc Engelleme": "Var", "Renk": "Beyaz"}	10
45	Sony WH-1000XM5	Endüstri lideri gürültü engelleme, 30 saat pil ömrü, LDAC Hi-Res Audio, Speak-to-Chat, çoklu cihaz bağlantısı, katlanır tasarım.	11999.99	30	\N	https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600	t	2026-05-09 13:13:30.62924+00	{"Marka": "Sony", "Ba\\u011flant\\u0131 Tipi": "Bluetooth", "Kullan\\u0131m Tipi": "Kulak\\u00fcst\\u00fc", "G\\u00fcr\\u00fclt\\u00fc Engelleme": "Var"}	10
46	JBL Charge 5 Bluetooth Hoparlör	IP67 su ve toz geçirmez, 20 saat pil ömrü, JBL Pro Sound, Powerbank özelliği, PartyBoost ile çoklu hoparlör bağlantısı.	4999.99	45	\N	https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600	t	2026-05-09 13:13:30.641367+00	{"Marka": "JBL", "Ba\\u011flant\\u0131 Tipi": "Bluetooth", "Su Ge\\u00e7irmezlik": "Var", "Renk": "Siyah"}	10
47	Marshall Stanmore III	Bluetooth 5.2, dinamik geniş sahne, bas ve tiz ayarı, vintage rock tasarım, RCA ve 3.5mm giriş, Marshall uygulaması desteği.	12499.99	15	\N	https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600	t	2026-05-09 13:13:30.653466+00	{"Marka": "Marshall", "Ba\\u011flant\\u0131 Tipi": "Bluetooth", "Renk": "Siyah"}	10
48	Nike Air Force 1 '07	Efsanevi beyaz deri sneaker, Air yastıklama teknolojisi, dayanıklı kauçuk taban, klasik basketball DNA, her kombine uyumlu.	3799.99	60	\N	https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600	t	2026-05-09 13:13:30.663701+00	{"Marka": "Nike", "Renk": "Beyaz", "Beden": "42", "Cinsiyet": "Unisex"}	10
32	Under Armour HOVR Phantom 3	UA HOVR yastıklama, UA Flow taban, Bluetooth adım ve mesafe takibi, IntelliKnit üst, MapMyRun uyumlu. Hafif ve esnek koşu ayakkabısı.	4799.99	35	9	https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600	t	2026-04-29 20:39:48.223475+00	\N	10
49	Levi's 501 Original Fit Jean	1873'ten beri ikonik düz kesim, %100 pamuk denim, düğmeli kapama, orta bel, zaman geçtikçe güzelleşen yıkama. Klasik indigo mavi.	2499.99	80	\N	https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=600	t	2026-05-09 13:13:30.677574+00	{"Marka": "Levi's", "Renk": "Mavi", "Beden": "32/32", "Cinsiyet": "Erkek", "Kal\\u0131p": "Regular"}	10
50	The North Face 1996 Retro Nuptse Ceket	700 fill power kaz tüyü dolgulu, su itici DryVent dış yüzey, ikonik puffer tasarım, -20°C'ye kadar sıcaklık. Siyah renk.	8999.99	25	\N	https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600	t	2026-05-09 13:13:30.688781+00	{"Marka": "The North Face", "Renk": "Siyah", "Beden": "L", "Cinsiyet": "Erkek"}	10
51	Ray-Ban Wayfarer Classic Güneş Gözlüğü	Polarize G-15 cam lens, asetat çerçeve, UV400 koruma, ikonik 1956 tasarımı, İtalya yapımı. Siyah/yeşil cam.	3299.99	40	\N	https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600	t	2026-05-09 13:13:30.699257+00	{"Marka": "Ray-Ban", "Renk": "Siyah", "Cinsiyet": "Unisex"}	10
52	Dyson V15 Detect Kablosuz Süpürge	Lazer toz algılama, LCD ekranda parçacık analizi, 60 dakika çalışma süresi, HEPA filtreleme, Click-in batarya.	24999.99	15	\N	https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600	t	2026-05-09 13:13:30.714691+00	{"Marka": "Dyson", "Kullan\\u0131m Tipi": "\\u015earjl\\u0131", "G\\u00fc\\u00e7": "240 W"}	10
55	Philips Airfryer XXL HD9285	7.3L kapasite (5 kişilik), Rapid Air teknolojisi, %90 daha az yağ, dijital dokunmatik ekran, 7 ön ayarlı program, bulaşık makinesine uygun.	6999.99	22	\N	https://images.unsplash.com/photo-1648398798875-a03ae2cff0d3?w=600	t	2026-05-09 13:13:30.755651+00	{"Marka": "Philips", "Kapasite": "7.3 L", "Renk": "Siyah"}	10
58	Philips OneBlade Pro QP6551	360° esnek başlık, hassas tarak sistemi (14 kademe), ıslak ve kuru kullanım, 120 dakika pil ömrü, LED gösterge.	2299.99	35	\N	https://images.unsplash.com/photo-1621607505099-7125e08c1e96?w=600	t	2026-05-09 13:13:30.795479+00	{"Marka": "Philips", "Kullan\\u0131m B\\u00f6lgesi": "Y\\u00fcz, V\\u00fccut", "\\u015earj S\\u00fcresi": "1 Saat"}	10
66	Google Pixel 8 Pro	Google Tensor G3 çip, 50MP ana kamera, 7 yıl Android güncelleme garantisi, AI fotoğraf düzenleme, 6.7 inç LTPO OLED ekran.	39999.99	15	2	https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600	t	2026-05-09 13:17:05.400774+00	{"Marka": "Google", "Dahili Haf\\u0131za": "128 GB", "Renk": "Mavi", "RAM Kapasitesi": "12 GB"}	10
61	Nike Dri-FIT ADV Running Tişört	Gelişmiş nem yönetimi, hafif ve nefes alabilir kumaş, reflektif detaylar, düz kesim, gece koşuları için görünürlük. Siyah/Gümüş.	1299.99	100	\N	https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600	t	2026-05-09 13:13:30.83926+00	{"Marka": "Nike", "Renk": "Siyah", "Beden": "M", "Cinsiyet": "Erkek"}	10
63	iPhone 15 Pro Max 256GB	Apple A17 Pro çip, 48MP kamera sistemi, titanyum tasarım, USB-C, 6.7 inç Super Retina XDR OLED ekran. iOS 17 ile en gelişmiş iPhone deneyimi.	74999.99	25	2	https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600	t	2026-05-09 13:17:05.301191+00	{"Marka": "Apple", "Dahili Haf\\u0131za": "256 GB", "Renk": "Nat\\u00fcrel Titanyum", "RAM Kapasitesi": "8 GB"}	10
69	ASUS ROG Strix G16 Gaming Laptop	Intel Core i9-14900HX, NVIDIA RTX 4070 8GB, 32GB DDR5 RAM, 1TB NVMe SSD, 16 inç 240Hz QHD+ ekran. RGB klavye, Dolby Atmos.	89999.99	10	3	https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600	t	2026-05-09 13:17:05.44272+00	{"Marka": "ASUS", "\\u0130\\u015flemci": "Intel Core i9", "RAM": "32 GB", "SSD Kapasitesi": "1 TB", "Ekran Kart\\u0131": "Nvidia GeForce RTX 4070"}	10
72	LG 55" OLED C4 4K Smart TV	OLED evo, α9 AI Gen7 işlemci, Dolby Vision & Atmos, 120Hz VRR, webOS 24, 4x HDMI 2.1, Ultra İnce Tasarım.	42999.99	10	4	https://images.unsplash.com/photo-1461151304267-38535e780c79?w=600	t	2026-05-09 13:17:05.482365+00	{"Marka": "LG", "\\u00c7\\u00f6z\\u00fcn\\u00fcrl\\u00fck": "4K Ultra HD", "Ekran Boyutu": "55 in\\u00e7", "G\\u00f6r\\u00fcnt\\u00fc Teknolojisi": "OLED"}	10
75	Sony WH-1000XM5	Endüstri lideri gürültü engelleme, 30 saat pil ömrü, LDAC Hi-Res Audio, Speak-to-Chat, çoklu cihaz bağlantısı, katlanır tasarım.	11999.99	30	5	https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600	t	2026-05-09 13:17:05.528558+00	{"Marka": "Sony", "Ba\\u011flant\\u0131 Tipi": "Bluetooth", "Kullan\\u0131m Tipi": "Kulak\\u00fcst\\u00fc", "G\\u00fcr\\u00fclt\\u00fc Engelleme": "Var"}	10
78	Nike Air Force 1 '07	Efsanevi beyaz deri sneaker, Air yastıklama teknolojisi, dayanıklı kauçuk taban, klasik basketball DNA, her kombine uyumlu.	3799.99	60	6	https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600	t	2026-05-09 13:17:05.572994+00	{"Marka": "Nike", "Renk": "Beyaz", "Beden": "42", "Cinsiyet": "Unisex"}	10
87	Oral-B iO Series 9 Elektrikli Diş Fırçası	Manyetik iO teknolojisi, 3D izleme sensörü, renkli OLED ekran, 7 temizlik modu, AI fırçalama koçu, seyahat çantası dahil.	5499.99	25	8	https://images.unsplash.com/photo-1559591937-abc1f8f90c9d?w=600	f	2026-05-09 13:17:05.700966+00	{"Marka": "Oral-B", "Renk": "Siyah", "T\\u00fcr\\u00fc": "\\u015earjl\\u0131 Di\\u015f F\\u0131r\\u00e7as\\u0131"}	10
90	Garmin Fenix 8 AMOLED	Garmin Fenix 8 AMOLED ile maceralarınıza yeni bir boyut kazandırın! Şık tasarımı ve yüksek çözünürlüklü AMOLED ekranı sayesinde her durumda mükemmel bir görünüm sunar. Gelişmiş özellikleriyle spor ve doğa tutkunlarının vazgeçilmezi olan bu akıllı saat, zorlu koşullarda bile yanınızdadır. Sizi bekleyen heyecan dolu anlar için Garmin Fenix 8’i hemen keşfedin!	24999.99	10	9	https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600	t	2026-05-09 13:17:05.740507+00	{"Marka": "Garmin", "Ekran Tipi": "AMOLED", "GPS": "Var"}	10
81	Ray-Ban Wayfarer Classic Güneş Gözlüğü	Polarize G-15 cam lens, asetat çerçeve, UV400 koruma, ikonik 1956 tasarımı, İtalya yapımı. Siyah/yeşil cam.	3299.99	40	6	https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600	t	2026-05-09 13:17:05.617261+00	{"Marka": "Ray-Ban", "Renk": "Siyah", "Cinsiyet": "Unisex"}	10
84	iRobot Roomba j9+ Robot Süpürge	PrecisionVision navigasyon, otomatik çöp boşaltma istasyonu, 3 aşamalı temizlik, evcil hayvan tüyü uzmanı, akıllı haritalama.	29999.99	8	7	https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=600	t	2026-05-09 13:17:05.660934+00	{"Marka": "iRobot", "Haritalama": "Lazer (Lidar)", "\\u015earj S\\u00fcresi": "3 Saat"}	10
53	Nespresso Vertuo Next Kahve Makinesi	Centrifusion teknolojisi, 5 farklı fincan boyutu (espresso'dan carafe'a), tek tuşla kullanım, 30 saniyede ısınma, %54 geri dönüştürülmüş plastik.	5499.99	30	\N	https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600	t	2026-05-09 13:13:30.728793+00	{"Marka": "Nespresso", "Renk": "Siyah", "T\\u00fcr\\u00fc": "Kaps\\u00fcll\\u00fc"}	10
56	Dyson Airwrap Complete Long	Coanda etkisi ile saç şekillendirme, 6 farklı başlık, akıllı ısı kontrolü, uzun saçlar için optimize edilmiş, 1300W motor.	17999.99	12	\N	https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600	t	2026-05-09 13:13:30.769584+00	{"Marka": "Dyson", "Renk": "Nikel/Bak\\u0131r", "T\\u00fcr\\u00fc": "Sa\\u00e7 \\u015eekillendirici"}	10
59	Apple Watch Ultra 2	49mm titanyum kasa, 3000 nit ekran, çift frekanslı GPS, 100m su direnci, 36 saat pil ömrü, Action Button. En dayanıklı Apple Watch.	29999.99	20	\N	https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600	t	2026-05-09 13:13:30.809356+00	{"Marka": "Apple", "Kasa \\u00c7ap\\u0131": "49 mm", "Kasa Materyali": "Titanyum", "Renk": "Nat\\u00fcrel"}	10
62	Under Armour HOVR Phantom 3	UA HOVR yastıklama, UA Flow taban, Bluetooth adım ve mesafe takibi, IntelliKnit üst, MapMyRun uyumlu. Hafif ve esnek koşu ayakkabısı.	4799.99	35	\N	https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600	t	2026-05-09 13:13:30.852258+00	{"Marka": "Under Armour", "Renk": "Beyaz", "Beden": "43", "Cinsiyet": "Erkek"}	10
64	Samsung Galaxy S24 Ultra	Snapdragon 8 Gen 3 işlemci, 200MP kamera, S Pen desteği, 6.8 inç Dynamic AMOLED 2X ekran, Galaxy AI yapay zekâ özellikleri.	69999.99	30	2	https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600	t	2026-05-09 13:17:05.373174+00	{"Marka": "Samsung", "Dahili Haf\\u0131za": "512 GB", "Renk": "Titanyum Siyah", "RAM Kapasitesi": "12 GB"}	10
67	MacBook Air M3 15 inç	Apple M3 çip, 8 çekirdekli CPU, 10 çekirdekli GPU, 16GB RAM, 512GB SSD, 18 saat pil ömrü. Fanless tasarım, MagSafe şarj.	54999.99	20	3	https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600	t	2026-05-09 13:17:05.414879+00	{"Marka": "Apple", "\\u0130\\u015flemci": "Apple M3", "RAM": "16 GB", "SSD Kapasitesi": "512 GB", "Ekran Boyutu": "15 in\\u00e7"}	10
70	Lenovo ThinkPad X1 Carbon Gen 12	Intel Core Ultra 7, 16GB LPDDR5x, 512GB SSD, 14 inç 2.8K OLED ekran, MIL-STD-810H dayanıklılık, 1.08 kg ağırlık.	62999.99	12	3	https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600	t	2026-05-09 13:17:05.454495+00	{"Marka": "Lenovo", "\\u0130\\u015flemci": "Intel Core Ultra 7", "RAM": "16 GB", "SSD Kapasitesi": "512 GB", "Ekran Boyutu": "14 in\\u00e7"}	10
73	Sony PlayStation 5 Slim	825GB SSD, DualSense kablosuz kumanda, 4K 120fps oyun desteği, Ray Tracing, PS VR2 uyumlu, %30 daha kompakt tasarım.	18999.99	35	4	https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600	t	2026-05-09 13:17:05.496689+00	{"Marka": "Sony", "Depolama Kapasitesi": "825 GB", "Renk": "Beyaz"}	10
76	JBL Charge 5 Bluetooth Hoparlör	IP67 su ve toz geçirmez, 20 saat pil ömrü, JBL Pro Sound, Powerbank özelliği, PartyBoost ile çoklu hoparlör bağlantısı.	4999.99	45	5	https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600	t	2026-05-09 13:17:05.543969+00	{"Marka": "JBL", "Ba\\u011flant\\u0131 Tipi": "Bluetooth", "Su Ge\\u00e7irmezlik": "Var", "Renk": "Siyah"}	10
82	Dyson V15 Detect Kablosuz Süpürge	Lazer toz algılama, LCD ekranda parçacık analizi, 60 dakika çalışma süresi, HEPA filtreleme, Click-in batarya.	24999.99	15	7	https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600	t	2026-05-09 13:17:05.631431+00	{"Marka": "Dyson", "Kullan\\u0131m Tipi": "\\u015earjl\\u0131", "G\\u00fc\\u00e7": "240 W"}	10
91	Nike Dri-FIT ADV Running Tişört	Gelişmiş nem yönetimi, hafif ve nefes alabilir kumaş, reflektif detaylar, düz kesim, gece koşuları için görünürlük. Siyah/Gümüş.	1299.99	100	9	https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600	t	2026-05-09 13:17:05.75575+00	{"Marka": "Nike", "Renk": "Siyah", "Beden": "M", "Cinsiyet": "Erkek"}	10
54	iRobot Roomba j9+ Robot Süpürge	PrecisionVision navigasyon, otomatik çöp boşaltma istasyonu, 3 aşamalı temizlik, evcil hayvan tüyü uzmanı, akıllı haritalama.	29999.99	8	\N	https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=600	t	2026-05-09 13:13:30.742197+00	{"Marka": "iRobot", "Haritalama": "Lazer (Lidar)", "\\u015earj S\\u00fcresi": "3 Saat"}	10
57	Oral-B iO Series 9 Elektrikli Diş Fırçası	Manyetik iO teknolojisi, 3D izleme sensörü, renkli OLED ekran, 7 temizlik modu, AI fırçalama koçu, seyahat çantası dahil.	5499.99	25	\N	https://images.unsplash.com/photo-1559591937-abc1f8f90c9d?w=600	t	2026-05-09 13:13:30.782103+00	{"Marka": "Oral-B", "Renk": "Siyah", "T\\u00fcr\\u00fc": "\\u015earjl\\u0131 Di\\u015f F\\u0131r\\u00e7as\\u0131"}	10
60	Garmin Fenix 8 AMOLED	1.4 inç AMOLED ekran, solar şarj, çoklu uydu desteği, 100m dalış direnci, gelişmiş antrenman metrikleri, TopoActive haritalar.	24999.99	10	\N	https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600	t	2026-05-09 13:13:30.824866+00	{"Marka": "Garmin", "Ekran Tipi": "AMOLED", "GPS": "Var"}	10
65	Xiaomi 14 Pro	Leica optik kamera sistemi, Snapdragon 8 Gen 3, 120W hızlı şarj, 6.73 inç LTPO AMOLED ekran, 50MP ana kamera.	34999.99	40	2	https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600	t	2026-05-09 13:17:05.386614+00	{"Marka": "Xiaomi", "Dahili Haf\\u0131za": "512 GB", "Renk": "Beyaz", "RAM Kapasitesi": "16 GB"}	10
68	iPad Pro M4 11 inç	Apple M4 çip, Ultra Retina XDR Tandem OLED ekran, Apple Pencil Pro desteği, 256GB SSD, Face ID, Wi-Fi 6E.	44999.99	18	3	https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600	t	2026-05-09 13:17:05.429238+00	{"Marka": "Apple", "\\u0130\\u015fletim Sistemi": "iPadOS", "Haf\\u0131za": "256 GB", "Ekran Boyutu": "11 in\\u00e7"}	10
71	Samsung 65" Neo QLED 4K Smart TV	QN85D serisi, Neural Quantum 4K işlemci, Dolby Atmos, 120Hz, Gaming Hub, SmartThings entegrasyonu, Slim One Connect.	49999.99	8	4	https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600	t	2026-05-09 13:17:05.467707+00	{"Marka": "Samsung", "\\u00c7\\u00f6z\\u00fcn\\u00fcrl\\u00fck": "4K Ultra HD", "Ekran Boyutu": "65 in\\u00e7", "G\\u00f6r\\u00fcnt\\u00fc Teknolojisi": "QLED"}	10
77	Marshall Stanmore III	Bluetooth 5.2, dinamik geniş sahne, bas ve tiz ayarı, vintage rock tasarım, RCA ve 3.5mm giriş, Marshall uygulaması desteği.	12499.99	15	5	https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600	t	2026-05-09 13:17:05.559084+00	{"Marka": "Marshall", "Ba\\u011flant\\u0131 Tipi": "Bluetooth", "Renk": "Siyah"}	10
80	The North Face 1996 Retro Nuptse Ceket	700 fill power kaz tüyü dolgulu, su itici DryVent dış yüzey, ikonik puffer tasarım, -20°C'ye kadar sıcaklık. Siyah renk.	8999.99	25	6	https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600	t	2026-05-09 13:17:05.603291+00	{"Marka": "The North Face", "Renk": "Siyah", "Beden": "L", "Cinsiyet": "Erkek"}	10
88	Philips OneBlade Pro QP6551	360° esnek başlık, hassas tarak sistemi (14 kademe), ıslak ve kuru kullanım, 120 dakika pil ömrü, LED gösterge.	2299.99	35	8	https://images.unsplash.com/photo-1621607505099-7125e08c1e96?w=600	f	2026-05-09 13:17:05.713319+00	{"Marka": "Philips", "Kullan\\u0131m B\\u00f6lgesi": "Y\\u00fcz, V\\u00fccut", "\\u015earj S\\u00fcresi": "1 Saat"}	10
79	Levi's 501 Original Fit Jean	Levi's 501 Original Fit Jean, zamansız tasarımı ve konforlu kesimiyle gardırobunuzun vazgeçilmezi olmaya aday. Her türlü kombinle uyum sağlayan bu klasik jean, hem şıklığı hem de rahatlığı bir arada sunuyor. Kaliteli denim dokusu sayesinde uzun ömürlü kullanım sunarken, hem günlük hem de özel anlarda stilinizi tamamlayacak. Şimdi keşfedin ve farkı yaşayın!	2499.99	80	6	https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=600	t	2026-05-09 13:17:05.588947+00	{"Marka": "Levi's", "Renk": "Mavi", "Beden": "32/32", "Cinsiyet": "Erkek", "Kal\\u0131p": "Regular"}	10
83	Nespresso Vertuo Next Kahve Makinesi	Centrifusion teknolojisi, 5 farklı fincan boyutu (espresso'dan carafe'a), tek tuşla kullanım, 30 saniyede ısınma, %54 geri dönüştürülmüş plastik.	5499.99	30	7	https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600	t	2026-05-09 13:17:05.647232+00	{"Marka": "Nespresso", "Renk": "Siyah", "T\\u00fcr\\u00fc": "Kaps\\u00fcll\\u00fc"}	10
89	Apple Watch Ultra 2	49mm titanyum kasa, 3000 nit ekran, çift frekanslı GPS, 100m su direnci, 36 saat pil ömrü, Action Button. En dayanıklı Apple Watch.	29999.99	20	9	https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600	t	2026-05-09 13:17:05.725631+00	{"Marka": "Apple", "Kasa \\u00c7ap\\u0131": "49 mm", "Kasa Materyali": "Titanyum", "Renk": "Nat\\u00fcrel"}	10
86	Dyson Airwrap Complete Long	Dyson Airwrap Complete Long, saç şekillendirme rutininizi devrim niteliğinde değiştirecek bir ürün! Gelişmiş teknolojisi sayesinde, saçınıza zarar vermeden etkileyici stiller elde etmenizi sağlar. Farklı başlık seçenekleriyle her saç tipine ve stiline uyum sağlar; böylece her gün yeni bir görünüm yaratabilirsiniz. Şimdi saçlarınıza hak ettiği bakımı sunma zamanı!	17999.99	12	8	https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600	t	2026-05-09 13:17:05.688215+00	{"Marka": "Dyson", "Renk": "Nikel/Bak\\u0131r", "T\\u00fcr\\u00fc": "Sa\\u00e7 \\u015eekillendirici"}	10
92	Under Armour HOVR Phantom 3	Under Armour HOVR Phantom 3 ile adımlarınızı hafifletin! Yüksek performans ve şıklığı bir araya getiren bu spor ayakkabılar, koşu sırasında mükemmel bir destek sunar. Konforlu yapısı ve modern tasarımıyla her adımda kendinizi özel hissedeceksiniz. Şimdi sahip olun, hareket özgürlüğünüzü keşfedin!	4799.99	32	9	https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600	t	2026-05-09 13:17:05.769947+00	{"Marka": "Under Armour", "Renk": "Beyaz", "Beden": "43", "Cinsiyet": "Erkek"}	10
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, password_hash, rol, isim, telefon, created_at) FROM stdin;
1	test@gmail.com	$2b$12$MnXNh4.l5U.8V96pVmHyA.iCxwl41PLvnqRveMCOHo8pURhyAV3iq	admin	test	\N	2026-04-29 16:39:18.888257+00
2	debug@gmail.com	$2b$12$iQX35YVycS3HRkty9G6LreTYjdcVpfOKmldqaYKTxKbmeoRnosg2u	musteri	Debug User	\N	2026-04-29 18:39:58.792412+00
3	noname@gmail.com	$2b$12$nKowwJQDQetpKqLAWijXE.mcpwxdHWU/DCqOwa5vdE8RyTepp0uum	musteri	No Name	\N	2026-04-29 18:43:30.726917+00
4	t@gmail.com	$2b$12$GidHCejUTehFDLUZRi4RWeDF8A342GPoLHD32DjMrbjV/b/eDUkVO	musteri	tt	\N	2026-05-19 17:15:42.717171+00
6	admin@admin.com	$2b$12$9ZMu8RkJi6WzxFS.PsFVi.mW0mjiglEONPwClSZyYGFSusfZwwfH2	musteri	Admin Admin	\N	2026-05-19 18:18:14.841994+00
5	admin@localshop.com	$2b$12$Ngdx2YmYUtQbFKLWqC8CRO5bosmZ7pGDCsu1chzQOcAOUJ7HOfhq6	admin	Admin Admin	\N	2026-05-19 18:15:53.259228+00
7	kullanici@gmail.com	$2b$12$cD9uXHVT5pgqfNwpw3fUselV4VlPTVeTbFXIW4PPRIMyPbaiMjb2C	musteri	kullanıcı adı	\N	2026-05-22 21:27:24.058187+00
8	kullanicitest@gmail.com	$2b$12$Cz97o9zB2Dvb0.lSfYXuAOsedfqCbZ/NiDYiAdWRXv.IropZEK01.	musteri	kullanıcı kullanıcı	\N	2026-05-22 21:30:30.965146+00
9	testkullanici@gmail.com	$2b$12$3mdH2zYfmkviKCf0jVrFceh4H2NI.jMrs2qIjz3iFulb9Yy037EzW	musteri	kullanıcı adı	\N	2026-05-22 21:40:03.942128+00
10	testtest@gmail.com	$2b$12$x3HiQs4XFyvlMGgpxDBVOe/ZumZ2JDNWlPlYo.yfA1HbRmhw6buL2	musteri	kullanici ad	\N	2026-05-22 21:43:10.917822+00
\.


--
-- Data for Name: yorumlar; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.yorumlar (id, user_id, urun_id, puan, yorum, created_at) FROM stdin;
\.


--
-- Name: agent_konusmalar_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.agent_konusmalar_id_seq', 6, true);


--
-- Name: analitik_ozet_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.analitik_ozet_id_seq', 5, true);


--
-- Name: briefing_gecmisi_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.briefing_gecmisi_id_seq', 1, false);


--
-- Name: favoriler_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.favoriler_id_seq', 8, true);


--
-- Name: iadeler_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.iadeler_id_seq', 8, true);


--
-- Name: kargo_takip_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.kargo_takip_id_seq', 1, false);


--
-- Name: kategoriler_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.kategoriler_id_seq', 10, true);


--
-- Name: kuponlar_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.kuponlar_id_seq', 1, false);


--
-- Name: siparis_kalemleri_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.siparis_kalemleri_id_seq', 14, true);


--
-- Name: siparisler_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.siparisler_id_seq', 14, true);


--
-- Name: stok_uyarilari_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.stok_uyarilari_id_seq', 23, true);


--
-- Name: system_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.system_settings_id_seq', 14, true);


--
-- Name: urunler_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.urunler_id_seq', 92, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 10, true);


--
-- Name: yorumlar_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.yorumlar_id_seq', 1, false);


--
-- Name: agent_konusmalar agent_konusmalar_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agent_konusmalar
    ADD CONSTRAINT agent_konusmalar_pkey PRIMARY KEY (id);


--
-- Name: agent_konusmalar agent_konusmalar_session_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agent_konusmalar
    ADD CONSTRAINT agent_konusmalar_session_id_key UNIQUE (session_id);


--
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- Name: analitik_ozet analitik_ozet_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analitik_ozet
    ADD CONSTRAINT analitik_ozet_pkey PRIMARY KEY (id);


--
-- Name: briefing_gecmisi briefing_gecmisi_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.briefing_gecmisi
    ADD CONSTRAINT briefing_gecmisi_pkey PRIMARY KEY (id);


--
-- Name: briefing_gecmisi briefing_gecmisi_tarih_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.briefing_gecmisi
    ADD CONSTRAINT briefing_gecmisi_tarih_key UNIQUE (tarih);


--
-- Name: favoriler favoriler_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favoriler
    ADD CONSTRAINT favoriler_pkey PRIMARY KEY (id);


--
-- Name: iadeler iadeler_iade_no_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.iadeler
    ADD CONSTRAINT iadeler_iade_no_key UNIQUE (iade_no);


--
-- Name: iadeler iadeler_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.iadeler
    ADD CONSTRAINT iadeler_pkey PRIMARY KEY (id);


--
-- Name: kargo_takip kargo_takip_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kargo_takip
    ADD CONSTRAINT kargo_takip_pkey PRIMARY KEY (id);


--
-- Name: kategoriler kategoriler_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kategoriler
    ADD CONSTRAINT kategoriler_pkey PRIMARY KEY (id);


--
-- Name: kuponlar kuponlar_kod_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kuponlar
    ADD CONSTRAINT kuponlar_kod_key UNIQUE (kod);


--
-- Name: kuponlar kuponlar_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kuponlar
    ADD CONSTRAINT kuponlar_pkey PRIMARY KEY (id);


--
-- Name: siparis_kalemleri siparis_kalemleri_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.siparis_kalemleri
    ADD CONSTRAINT siparis_kalemleri_pkey PRIMARY KEY (id);


--
-- Name: siparisler siparisler_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.siparisler
    ADD CONSTRAINT siparisler_pkey PRIMARY KEY (id);


--
-- Name: stok_uyarilari stok_uyarilari_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stok_uyarilari
    ADD CONSTRAINT stok_uyarilari_pkey PRIMARY KEY (id);


--
-- Name: system_settings system_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_pkey PRIMARY KEY (id);


--
-- Name: siparisler uq_siparis_no; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.siparisler
    ADD CONSTRAINT uq_siparis_no UNIQUE (siparis_no);


--
-- Name: favoriler uq_user_urun_favori; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favoriler
    ADD CONSTRAINT uq_user_urun_favori UNIQUE (user_id, urun_id);


--
-- Name: yorumlar uq_user_urun_yorum; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.yorumlar
    ADD CONSTRAINT uq_user_urun_yorum UNIQUE (user_id, urun_id);


--
-- Name: urunler urunler_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.urunler
    ADD CONSTRAINT urunler_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: yorumlar yorumlar_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.yorumlar
    ADD CONSTRAINT yorumlar_pkey PRIMARY KEY (id);


--
-- Name: ix_kategoriler_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_kategoriler_slug ON public.kategoriler USING btree (slug);


--
-- Name: ix_system_settings_anahtar; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_system_settings_anahtar ON public.system_settings USING btree (anahtar);


--
-- Name: ix_system_settings_grup; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_system_settings_grup ON public.system_settings USING btree (grup);


--
-- Name: ix_system_settings_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_system_settings_id ON public.system_settings USING btree (id);


--
-- Name: ix_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_users_email ON public.users USING btree (email);


--
-- Name: agent_konusmalar agent_konusmalar_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agent_konusmalar
    ADD CONSTRAINT agent_konusmalar_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: favoriler favoriler_urun_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favoriler
    ADD CONSTRAINT favoriler_urun_id_fkey FOREIGN KEY (urun_id) REFERENCES public.urunler(id);


--
-- Name: favoriler favoriler_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favoriler
    ADD CONSTRAINT favoriler_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: iadeler iadeler_siparis_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.iadeler
    ADD CONSTRAINT iadeler_siparis_id_fkey FOREIGN KEY (siparis_id) REFERENCES public.siparisler(id);


--
-- Name: iadeler iadeler_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.iadeler
    ADD CONSTRAINT iadeler_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: kargo_takip kargo_takip_siparis_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kargo_takip
    ADD CONSTRAINT kargo_takip_siparis_id_fkey FOREIGN KEY (siparis_id) REFERENCES public.siparisler(id);


--
-- Name: siparis_kalemleri siparis_kalemleri_siparis_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.siparis_kalemleri
    ADD CONSTRAINT siparis_kalemleri_siparis_id_fkey FOREIGN KEY (siparis_id) REFERENCES public.siparisler(id);


--
-- Name: siparis_kalemleri siparis_kalemleri_urun_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.siparis_kalemleri
    ADD CONSTRAINT siparis_kalemleri_urun_id_fkey FOREIGN KEY (urun_id) REFERENCES public.urunler(id);


--
-- Name: siparisler siparisler_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.siparisler
    ADD CONSTRAINT siparisler_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: stok_uyarilari stok_uyarilari_urun_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stok_uyarilari
    ADD CONSTRAINT stok_uyarilari_urun_id_fkey FOREIGN KEY (urun_id) REFERENCES public.urunler(id);


--
-- Name: urunler urunler_kategori_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.urunler
    ADD CONSTRAINT urunler_kategori_id_fkey FOREIGN KEY (kategori_id) REFERENCES public.kategoriler(id);


--
-- Name: yorumlar yorumlar_urun_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.yorumlar
    ADD CONSTRAINT yorumlar_urun_id_fkey FOREIGN KEY (urun_id) REFERENCES public.urunler(id);


--
-- Name: yorumlar yorumlar_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.yorumlar
    ADD CONSTRAINT yorumlar_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict lPvfljcbH86XnSPFuvKyPhm6W8hWILbiCgpHOhvxD0gdD69gfSdu2X75PBWYUZB

