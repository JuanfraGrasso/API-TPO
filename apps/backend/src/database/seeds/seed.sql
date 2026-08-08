-- Seed inicial para Supabase.
-- Dominio: tienda de hardware y perifericos.
-- Carga: comercio, admin, categorias, 20 publicaciones, imagenes y consultas.
--
-- RESET OPCIONAL DE DATOS
-- Ejecutar antes de resembrar si ya cargaste una version anterior.
-- delete from publication_images;
-- delete from publications;
-- delete from inquiries;
-- delete from categories;
-- delete from commerce_profile;
-- delete from admin_users;

insert into commerce_profile (
	business_name,
	description,
	address,
	phone,
	instagram_url,
	facebook_url,
	website_url,
	business_hours
)
values (
	'HardPoint Computacion',
	'Tienda especializada en componentes de PC, perifericos, gabinetes y soluciones gamer para armado y actualizacion de equipos.',
	'Av. Tecnologia 742, Ciudad',
	'+54 11 5555-9090',
	'https://instagram.com/hardpointpc',
	'https://facebook.com/hardpointpc',
	'https://hardpointpc.example.com',
	'Lun a Vie 10:00 a 19:00 - Sab 10:00 a 14:00'
)
on conflict do nothing;

insert into admin_users (first_name, last_name, email, phone, password_hash)
values (
	'Admin',
	'Principal',
	'admin@hardpoint.com',
	'+54 11 4444-1111',
	'$2b$10$F6X1eM9.1LKxA8q4nR0.7eLJvNNf9B3xj9Jq4vL9Qf3jK2lHjW7xq'
)
on conflict (email) do nothing;

insert into categories (name, description)
values
	('Procesadores', 'CPUs para equipos de escritorio orientados a gaming y productividad.'),
	('Placas de Video', 'GPUs para gaming, render y aceleracion grafica.'),
	('Memorias RAM', 'Modulos DDR4 y DDR5 para actualizacion de equipos.'),
	('Almacenamiento', 'SSD NVMe, SSD SATA y discos rigidos.'),
	('Gabinetes', 'Gabinetes ATX y Micro ATX con enfoque gamer y airflow.'),
	('Perifericos', 'Teclados, mouse, auriculares y accesorios de PC.')
on conflict (name) do update set
	description = excluded.description,
	is_active = true;

with publication_seed(name, sku, brand, category_name, description, price, availability_status) as (
	values
		('AMD Ryzen 5 5600', 'CPU-AMD-5600', 'AMD', 'Procesadores', 'Procesador de 6 nucleos y 12 hilos ideal para gaming en 1080p y tareas multitarea.', 189999.00, 'disponible'),
		('Intel Core i5-12400F', 'CPU-INT-12400F', 'Intel', 'Procesadores', 'CPU de 6 nucleos de gran rendimiento para PCs gamer de gama media.', 214500.00, 'disponible'),
		('AMD Ryzen 7 5700X', 'CPU-AMD-5700X', 'AMD', 'Procesadores', 'Procesador de 8 nucleos orientado a streaming, gaming y productividad.', 279900.00, 'disponible'),

		('NVIDIA GeForce RTX 4060 8GB', 'GPU-RTX-4060', 'NVIDIA', 'Placas de Video', 'Placa de video ideal para jugar en 1080p con ray tracing y DLSS.', 549999.00, 'disponible'),
		('AMD Radeon RX 7600 8GB', 'GPU-RX-7600', 'AMD', 'Placas de Video', 'GPU para equipos gamer con excelente rendimiento en 1080p.', 489500.00, 'disponible'),
		('NVIDIA GeForce RTX 4070 Super 12GB', 'GPU-RTX-4070S', 'NVIDIA', 'Placas de Video', 'GPU de alto rendimiento para 1440p y trabajo creativo.', 1049900.00, 'sin_stock'),

		('Memoria Kingston Fury Beast 16GB DDR4 3200', 'RAM-KF-16-3200', 'Kingston', 'Memorias RAM', 'Modulo DDR4 de 16GB con disipador, ideal para actualizaciones gamer.', 52999.00, 'disponible'),
		('Memoria Corsair Vengeance 32GB DDR5 5600', 'RAM-COR-32-5600', 'Corsair', 'Memorias RAM', 'Kit DDR5 2x16GB para equipos de nueva generacion.', 164999.00, 'disponible'),
		('Memoria Crucial 8GB DDR4 2666', 'RAM-CRU-8-2666', 'Crucial', 'Memorias RAM', 'Modulo economico para PCs de oficina o upgrades basicos.', 28999.00, 'pausado'),

		('SSD NVMe WD Black SN770 1TB', 'SSD-WD-1TB-SN770', 'Western Digital', 'Almacenamiento', 'Unidad NVMe PCIe Gen4 de 1TB con gran velocidad de lectura.', 118900.00, 'disponible'),
		('SSD SATA Kingston A400 480GB', 'SSD-KIN-A400-480', 'Kingston', 'Almacenamiento', 'SSD SATA para revivir notebooks y PCs de escritorio.', 46999.00, 'disponible'),
		('Disco Rigido Seagate Barracuda 2TB', 'HDD-SEA-2TB', 'Seagate', 'Almacenamiento', 'Disco rigido para almacenamiento masivo de juegos y archivos.', 76900.00, 'disponible'),
		('SSD NVMe Samsung 990 Pro 2TB', 'SSD-SAM-990PRO-2TB', 'Samsung', 'Almacenamiento', 'Unidad premium de alto rendimiento para gaming y edicion.', 259999.00, 'sin_stock'),

		('Gabinete Corsair 4000D Airflow', 'CASE-COR-4000D', 'Corsair', 'Gabinetes', 'Gabinete ATX con excelente flujo de aire y panel lateral templado.', 154999.00, 'disponible'),
		('Gabinete Cooler Master Q300L', 'CASE-CM-Q300L', 'Cooler Master', 'Gabinetes', 'Gabinete Micro ATX compacto con panel frontal perforado.', 89999.00, 'disponible'),
		('Gabinete NZXT H5 Flow', 'CASE-NZXT-H5', 'NZXT', 'Gabinetes', 'Gabinete gamer minimalista con gran ventilacion.', 167500.00, 'disponible'),

		('Teclado Mecanico Redragon Kumara K552', 'PER-K552', 'Redragon', 'Perifericos', 'Teclado mecanico compacto con switches blue y retroiluminacion.', 64999.00, 'disponible'),
		('Mouse Logitech G203 Lightsync', 'PER-G203', 'Logitech', 'Perifericos', 'Mouse gamer ligero con sensor preciso y RGB.', 35999.00, 'disponible'),
		('Auriculares HyperX Cloud Stinger 2', 'PER-HX-STINGER2', 'HyperX', 'Perifericos', 'Headset comodo para sesiones largas de juego y videollamadas.', 78999.00, 'disponible'),
		('Monitor LG UltraGear 24 144Hz', 'PER-LG-24-144', 'LG', 'Perifericos', 'Monitor Full HD de 24 pulgadas con tasa de refresco de 144Hz.', 289999.00, 'disponible')
)
insert into publications (
	name,
	sku,
	brand,
	category_id,
	description,
	price,
	availability_status,
	is_active,
	is_price_visible
)
select
	p.name,
	p.sku,
	p.brand,
	c.id,
	p.description,
	p.price,
	p.availability_status,
	true,
	true
from publication_seed p
join categories c on c.name = p.category_name
on conflict (name, category_id) do update set
	sku = excluded.sku,
	brand = excluded.brand,
	description = excluded.description,
	price = excluded.price,
	availability_status = excluded.availability_status,
	is_active = true;

insert into publication_images (publication_id, image_url, alt_text, is_cover)
select
	pub.id,
	'https://placehold.co/800x600?text=' || replace(pub.name, ' ', '+'),
	pub.name,
	true
from publications pub
on conflict (publication_id, image_url) do nothing;

insert into inquiries (full_name, email, phone, subject, message, status)
values
	('Carla Ruiz', 'carla.ruiz@example.com', '+54 11 3000-1111', 'Consulta por armado de PC', 'Queria saber si pueden recomendar una PC gamer para jugar y estudiar.', 'pendiente'),
	('Martin Lopez', 'martin.lopez@example.com', null, 'Pedido de placas de video', 'Necesito cotizacion por cantidad para RTX 4060 y RX 7600.', 'leida'),
	('Ana Gomez', 'ana.gomez@example.com', '+54 11 4000-2222', 'Consulta por stock', 'Cuando vuelve a ingresar la RTX 4070 Super?', 'respondida');
