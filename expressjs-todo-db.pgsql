--
-- PostgreSQL database dump
--

-- Dumped from database version 16.1
-- Dumped by pg_dump version 16.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: todos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.todos (
    name text,
    id uuid,
    done boolean,
    pk integer NOT NULL,
    userorder integer
);


ALTER TABLE public.todos OWNER TO postgres;

--
-- Name: todos_pk_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.todos_pk_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.todos_pk_seq OWNER TO postgres;

--
-- Name: todos_pk_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.todos_pk_seq OWNED BY public.todos.pk;


--
-- Name: todos pk; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.todos ALTER COLUMN pk SET DEFAULT nextval('public.todos_pk_seq'::regclass);


--
-- Data for Name: todos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.todos (name, id, done, pk, userorder) FROM stdin;
something	40763d8a-0b92-4958-9076-af26af5cb289	t	4	0
do a thing	3d9705b6-1a84-4f38-ab16-487981f00a30	f	3	1
fds	788ec4eb-9e69-4902-b89e-fba78a030182	f	12	5
pet a dog	ff5227b9-dea8-43f7-bf18-217e533f762b	t	6	2
buy food	96d13408-4cde-40bd-88a5-9bbdc8ae5718	f	7	3
asd	1cc0d1c1-7124-4910-bb8d-f75b52b11974	f	11	6
a completed task	4a4abb3b-bcb5-4208-87ff-15594f565da3	t	10	4
\.


--
-- Name: todos_pk_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.todos_pk_seq', 12, true);


--
-- Name: todos todos_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.todos
    ADD CONSTRAINT todos_id_key UNIQUE (id);


--
-- Name: todos todos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.todos
    ADD CONSTRAINT todos_pkey PRIMARY KEY (pk);


--
-- PostgreSQL database dump complete
--

