create table
  public.mensagens (
    id uuid not null default uuid_generate_v4 (),
    mensagem text null,
    room_name text null,
    constraint mensagens_pkey primary key (id)
  ) tablespace pg_default;