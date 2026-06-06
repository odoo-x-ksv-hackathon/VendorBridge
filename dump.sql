--
-- PostgreSQL database dump
--

\restrict 2DojqPbwrHaguFfDX7iGxW4W80fRUS6WpHyeMwy0Kc8cPWBQxhyzdzgTmf8DrjC

-- Dumped from database version 16.14
-- Dumped by pg_dump version 16.14

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

--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, email, password, "refreshToken", "createdAt", "updatedAt") FROM stdin;
cmq1fdu870000msestuno1he7	bob@example.com	$2b$10$0DKB0Z5xNn6oiQyTkLvhd.q0iXamnQoGBZ3l9dUJCtF566Yac.2nS	\N	2026-06-05 21:17:36.968	2026-06-05 21:20:32.338
cmq1eeoqj0000mm1n9fhi5dct	shrek@example.com	$2b$10$uoueAoaOcbwmzaDInxoVn.CfIOXQjfoGca9mZt3dAm5VJCCsdTRRa	\N	2026-06-05 20:50:16.891	2026-06-05 21:45:10.213
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
2c1ca7c3-b6dd-42a5-bcd6-64a02a3adc10	49a71446479a5282e8e85028c0e8109608225820c6a7d338d5700fd4c2ae540d	2026-06-05 20:30:55.293039+00	20260605203055_add_user	\N	\N	2026-06-05 20:30:55.284915+00	1
\.


--
-- PostgreSQL database dump complete
--

\unrestrict 2DojqPbwrHaguFfDX7iGxW4W80fRUS6WpHyeMwy0Kc8cPWBQxhyzdzgTmf8DrjC

