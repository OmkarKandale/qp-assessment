BEGIN;

CREATE TABLE IF NOT EXISTS grocery_items
(
    id serial NOT NULL,
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    price numeric(10, 2) NOT NULL,
    inventory integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT grocery_items_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS order_items
(
    id serial NOT NULL,
    order_id integer,
    grocery_item_id integer,
    quantity integer NOT NULL,
    price numeric(10, 2) NOT NULL,
    CONSTRAINT order_items_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS orders
(
    id serial NOT NULL,
    user_id integer,
    total_amount numeric(10, 2) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT orders_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS users
(
    id serial NOT NULL,
    email character varying(255) COLLATE pg_catalog."default" NOT NULL,
    password character varying(255) COLLATE pg_catalog."default" NOT NULL,
    role character varying(10) COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_email_key UNIQUE (email)
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'order_items_grocery_item_id_fkey') THEN
        ALTER TABLE order_items
            ADD CONSTRAINT order_items_grocery_item_id_fkey FOREIGN KEY (grocery_item_id)
            REFERENCES grocery_items (id) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE NO ACTION;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'order_items_order_id_fkey') THEN
        ALTER TABLE order_items
            ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id)
            REFERENCES orders (id) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE NO ACTION;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_user_id_fkey') THEN
        ALTER TABLE orders
            ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id)
            REFERENCES users (id) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE NO ACTION;
    END IF;
END $$;

END;
