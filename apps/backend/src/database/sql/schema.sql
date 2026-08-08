-- Esquema SQL para Supabase (PostgreSQL)
-- Dominio: comercio de computacion y hardware.
-- Incluye: administradores, informacion del comercio, categorias,
-- publicaciones, imagenes de publicaciones y consultas de contacto.
--
-- RESET OPCIONAL
-- Ejecutar solo si necesitas eliminar por completo las tablas actuales.
-- drop table if exists publication_images cascade;
-- drop table if exists publications cascade;
-- drop table if exists inquiries cascade;
-- drop table if exists categories cascade;
-- drop table if exists commerce_profile cascade;
-- drop table if exists admin_users cascade;
-- drop function if exists set_updated_at();

create extension if not exists pgcrypto;

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
	new.updated_at = now();
	return new;
end;
$$;

create table if not exists admin_users (
	id uuid primary key default gen_random_uuid(),
	first_name varchar(80) not null,
	last_name varchar(80) not null,
	email varchar(255) not null unique,
	phone varchar(40),
	password_hash text not null,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create table if not exists commerce_profile (
	id bigserial primary key,
	business_name varchar(150) not null,
	description text not null,
	address varchar(200),
	phone varchar(40),
	instagram_url text,
	facebook_url text,
	website_url text,
	business_hours text,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create table if not exists categories (
	id bigserial primary key,
	name varchar(80) not null unique,
	description text,
	is_active boolean not null default true,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create table if not exists publications (
	id bigserial primary key,
	name varchar(140) not null,
	sku varchar(60) unique,
	brand varchar(80),
	category_id bigint not null references categories(id) on delete restrict,
	description text not null,
	price numeric(12, 2),
	is_price_visible boolean not null default true,
	availability_status varchar(20) not null default 'disponible'
		check (availability_status in ('disponible', 'sin_stock', 'pausado')),
	is_active boolean not null default true,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	unique (name, category_id)
);

alter table publications add column if not exists sku varchar(60);
alter table publications add column if not exists brand varchar(80);
create unique index if not exists idx_publications_sku on publications(sku) where sku is not null;

create table if not exists publication_images (
	id bigserial primary key,
	publication_id bigint not null references publications(id) on delete cascade,
	image_url text not null,
	alt_text varchar(160),
	is_cover boolean not null default false,
	created_at timestamptz not null default now(),
	unique (publication_id, image_url)
);

create table if not exists inquiries (
	id bigserial primary key,
	full_name varchar(120) not null,
	email varchar(255) not null,
	phone varchar(40),
	subject varchar(160) not null,
	message text not null,
	status varchar(20) not null default 'pendiente'
		check (status in ('pendiente', 'leida', 'respondida')),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create index if not exists idx_publications_category_id on publications(category_id);
create index if not exists idx_publications_is_active on publications(is_active);
create index if not exists idx_publications_name on publications(name);
create index if not exists idx_inquiries_status on inquiries(status);

drop trigger if exists trg_admin_users_updated_at on admin_users;
create trigger trg_admin_users_updated_at
before update on admin_users
for each row execute function set_updated_at();

drop trigger if exists trg_commerce_profile_updated_at on commerce_profile;
create trigger trg_commerce_profile_updated_at
before update on commerce_profile
for each row execute function set_updated_at();

drop trigger if exists trg_categories_updated_at on categories;
create trigger trg_categories_updated_at
before update on categories
for each row execute function set_updated_at();

drop trigger if exists trg_publications_updated_at on publications;
create trigger trg_publications_updated_at
before update on publications
for each row execute function set_updated_at();

drop trigger if exists trg_inquiries_updated_at on inquiries;
create trigger trg_inquiries_updated_at
before update on inquiries
for each row execute function set_updated_at();
