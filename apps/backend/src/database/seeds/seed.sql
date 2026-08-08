-- Seed inicial para Supabase.
-- Carga: comercio, admin, categorias, 20 publicaciones, imagenes y consultas.

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
	'Mercadito Centro',
	'Comercio de cercania con productos para el hogar, almacen y regalos.',
	'Av. Principal 123, Ciudad',
	'+54 11 5555-1234',
	'https://instagram.com/mercaditocentro',
	'https://facebook.com/mercaditocentro',
	'https://mercaditocentro.example.com',
	'Lun a Sab 09:00 a 20:00'
)
on conflict do nothing;

insert into admin_users (first_name, last_name, email, phone, password_hash)
values (
	'Admin',
	'Principal',
	'admin@mercadito.com',
	'+54 11 4444-1111',
	'$2b$10$F6X1eM9.1LKxA8q4nR0.7eLJvNNf9B3xj9Jq4vL9Qf3jK2lHjW7xq'
)
on conflict (email) do nothing;

insert into categories (name, description)
values
	('Almacen', 'Productos de almacen y despensa.'),
	('Bebidas', 'Bebidas sin alcohol y jugos.'),
	('Limpieza', 'Articulos para limpieza del hogar.'),
	('Cuidado Personal', 'Higiene y cuidado diario.'),
	('Regaleria', 'Regalos y detalles para ocasiones especiales.'),
	('Mascotas', 'Productos basicos para mascotas.')
on conflict (name) do update set
	description = excluded.description,
	is_active = true;

with publication_seed(name, category_name, description, price, availability_status) as (
	values
		('Yerba Mate Tradicional 1kg', 'Almacen', 'Yerba mate sabor tradicional.', 5200.00, 'disponible'),
		('Arroz Largo Fino 1kg', 'Almacen', 'Arroz largo fino seleccion premium.', 1800.00, 'disponible'),
		('Fideos Spaghetti 500g', 'Almacen', 'Pasta seca de trigo candeal.', 1400.00, 'disponible'),
		('Aceite de Girasol 900ml', 'Almacen', 'Aceite ideal para cocina diaria.', 2600.00, 'disponible'),
		('Salsa de Tomate 340g', 'Almacen', 'Salsa lista para tus comidas.', 1200.00, 'disponible'),

		('Agua Mineral 2.25L', 'Bebidas', 'Agua mineral sin gas.', 1500.00, 'disponible'),
		('Gaseosa Cola 2.25L', 'Bebidas', 'Bebida gaseosa sabor cola.', 2300.00, 'disponible'),
		('Jugo Naranja 1L', 'Bebidas', 'Jugo de naranja listo para servir.', 1900.00, 'disponible'),
		('Soda 1.5L', 'Bebidas', 'Soda de mesa para comidas.', 1300.00, 'sin_stock'),

		('Detergente Limon 750ml', 'Limpieza', 'Detergente concentrado para vajilla.', 2100.00, 'disponible'),
		('Lavandina 1L', 'Limpieza', 'Desinfectante para superficies.', 1100.00, 'disponible'),
		('Esponja Multiuso x2', 'Limpieza', 'Pack de esponjas para cocina.', 950.00, 'disponible'),
		('Limpiador de Pisos 900ml', 'Limpieza', 'Fragancia fresca para pisos.', 2400.00, 'disponible'),

		('Shampoo Neutro 400ml', 'Cuidado Personal', 'Shampoo para uso diario.', 3200.00, 'disponible'),
		('Jabon Liquido Manos 250ml', 'Cuidado Personal', 'Higiene suave para manos.', 1700.00, 'disponible'),
		('Desodorante Aerosol 150ml', 'Cuidado Personal', 'Proteccion prolongada.', 2900.00, 'pausado'),

		('Taza Ceramica Estampada', 'Regaleria', 'Taza de ceramica con diseno.', 4500.00, 'disponible'),
		('Vela Aromatica', 'Regaleria', 'Vela decorativa aroma vainilla.', 2800.00, 'disponible'),

		('Alimento Balanceado Perro 3kg', 'Mascotas', 'Alimento completo para perro adulto.', 9800.00, 'disponible'),
		('Arena Sanitaria Gato 4kg', 'Mascotas', 'Arena aglomerante para gatos.', 7600.00, 'disponible')
)
insert into publications (
	name,
	category_id,
	description,
	price,
	availability_status,
	is_active,
	is_price_visible
)
select
	p.name,
	c.id,
	p.description,
	p.price,
	p.availability_status,
	true,
	true
from publication_seed p
join categories c on c.name = p.category_name
on conflict (name, category_id) do update set
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
	('Carla Ruiz', 'carla.ruiz@example.com', '+54 11 3000-1111', 'Consulta por horarios', 'Queria saber si abren los domingos.', 'pendiente'),
	('Martin Lopez', 'martin.lopez@example.com', null, 'Pedido mayorista', 'Necesito cotizacion para compra por cantidad.', 'leida'),
	('Ana Gomez', 'ana.gomez@example.com', '+54 11 4000-2222', 'Producto sin stock', 'Cuando vuelve la soda 1.5L?', 'respondida');
