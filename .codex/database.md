# Database Architecture — NextGen TMS Platform
> PostgreSQL via Supabase | 7 Tables | 3NF | ACID | RLS on all tables

## CODEX: Use Supabase MCP for ALL SQL. Run in exact order. Never ask user to run manually.

## EXECUTION ORDER
1. Extensions → 2. profiles → 3. carriers → 4. warehouses → 5. drivers
→ 6. routes → 7. shipments → 8. tracking_events → 9. triggers
→ 10. indexes → 11. RLS → 12. seed data → 13. verify

## STEP 1 — EXTENSIONS
```sql
create extension if not exists "uuid-ossp";
```

## STEP 2 — TABLES

### profiles
```sql
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null,
  email       text not null,
  avatar_url  text,
  role        text not null default 'dispatcher'
              check (role in ('admin','dispatcher','customer')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
```

### carriers
```sql
create table carriers (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  code            text not null unique,
  transport_mode  text not null
                  check (transport_mode in ('truck','rail','air','ocean','intermodal')),
  contact_name    text,
  contact_email   text,
  contact_phone   text,
  rating          numeric(2,1) default 3.0 check (rating >= 1.0 and rating <= 5.0),
  status          text not null default 'active'
                  check (status in ('active','inactive','suspended')),
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
```

### warehouses
```sql
create table warehouses (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  code          text not null unique,
  city          text not null,
  state         text not null,
  address       text,
  capacity_sqft numeric(10,2),
  status        text not null default 'active'
                check (status in ('active','inactive','maintenance')),
  manager_name  text,
  contact_phone text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
```

### drivers
```sql
create table drivers (
  id              uuid primary key default gen_random_uuid(),
  full_name       text not null,
  license_number  text not null unique,
  license_expiry  date not null,
  phone           text not null,
  email           text,
  carrier_id      uuid references carriers(id) on delete set null,
  vehicle_number  text,
  vehicle_type    text check (vehicle_type in ('truck','mini_truck','trailer','container')),
  status          text not null default 'available'
                  check (status in ('available','on_trip','off_duty','suspended')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
```

### routes
```sql
create table routes (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  origin_city       text not null,
  origin_state      text not null,
  destination_city  text not null,
  destination_state text not null,
  distance_km       numeric(10,2) not null check (distance_km > 0),
  estimated_hours   numeric(5,1) not null check (estimated_hours > 0),
  transport_mode    text not null
                    check (transport_mode in ('truck','rail','air','ocean','intermodal')),
  toll_charges      numeric(10,2) default 0,
  is_active         boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
```

### shipments
```sql
create table shipments (
  id                       uuid primary key default gen_random_uuid(),
  shipment_number          text not null unique,
  origin_city              text not null,
  origin_state             text not null,
  destination_city         text not null,
  destination_state        text not null,
  origin_warehouse_id      uuid references warehouses(id) on delete set null,
  destination_warehouse_id uuid references warehouses(id) on delete set null,
  cargo_type               text not null
                           check (cargo_type in ('general','perishable','hazardous','fragile','oversized','electronics')),
  weight_kg                numeric(10,2) not null check (weight_kg > 0),
  volume_cbm               numeric(10,2) check (volume_cbm > 0),
  status                   text not null default 'draft'
                           check (status in ('draft','confirmed','assigned','in_transit','delivered','delayed','cancelled')),
  carrier_id               uuid references carriers(id) on delete set null,
  driver_id                uuid references drivers(id) on delete set null,
  route_id                 uuid references routes(id) on delete set null,
  assigned_by              uuid references profiles(id) on delete set null,
  customer_id              uuid references profiles(id) on delete set null,
  scheduled_pickup         timestamptz,
  scheduled_delivery       timestamptz,
  actual_pickup            timestamptz,
  actual_delivery          timestamptz,
  distance_km              numeric(10,2) check (distance_km > 0),
  freight_cost             numeric(12,2) check (freight_cost >= 0),
  notes                    text,
  created_by               uuid references profiles(id) on delete set null,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);
```

### tracking_events
```sql
create table tracking_events (
  id           uuid primary key default gen_random_uuid(),
  shipment_id  uuid not null references shipments(id) on delete cascade,
  event_type   text not null
               check (event_type in ('status_change','location_update','note_added','carrier_assigned','delay_reported')),
  old_status   text,
  new_status   text,
  location     text,
  description  text not null,
  created_by   uuid references profiles(id) on delete set null,
  created_at   timestamptz not null default now()
);
```

## STEP 3 — TRIGGERS

```sql
-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role','dispatcher')
  );
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure handle_new_user();

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger profiles_updated_at   before update on profiles   for each row execute procedure update_updated_at();
create trigger carriers_updated_at   before update on carriers   for each row execute procedure update_updated_at();
create trigger warehouses_updated_at before update on warehouses for each row execute procedure update_updated_at();
create trigger drivers_updated_at    before update on drivers    for each row execute procedure update_updated_at();
create trigger routes_updated_at     before update on routes     for each row execute procedure update_updated_at();
create trigger shipments_updated_at  before update on shipments  for each row execute procedure update_updated_at();

-- Auto-log status changes
create or replace function log_shipment_status_change()
returns trigger language plpgsql as $$
begin
  if old.status is distinct from new.status then
    insert into tracking_events (shipment_id, event_type, old_status, new_status, description, created_by)
    values (new.id, 'status_change', old.status, new.status,
            'Status changed from ' || old.status || ' to ' || new.status, new.assigned_by);
  end if;
  return new;
end;
$$;
create trigger shipment_status_log after update on shipments for each row execute procedure log_shipment_status_change();
```

## STEP 4 — INDEXES

```sql
create index idx_profiles_role          on profiles(role);
create index idx_profiles_email         on profiles(email);
create index idx_carriers_status        on carriers(status);
create index idx_carriers_mode          on carriers(transport_mode);
create index idx_warehouses_status      on warehouses(status);
create index idx_warehouses_city        on warehouses(city);
create index idx_drivers_carrier_id     on drivers(carrier_id);
create index idx_drivers_status         on drivers(status);
create index idx_routes_active          on routes(is_active);
create index idx_routes_mode            on routes(transport_mode);
create index idx_shipments_status       on shipments(status);
create index idx_shipments_carrier_id   on shipments(carrier_id);
create index idx_shipments_driver_id    on shipments(driver_id);
create index idx_shipments_route_id     on shipments(route_id);
create index idx_shipments_customer_id  on shipments(customer_id);
create index idx_shipments_created_at   on shipments(created_at desc);
create index idx_shipments_number       on shipments(shipment_number);
create index idx_shipments_status_date  on shipments(status, created_at desc);
create index idx_shipments_origin_wh    on shipments(origin_warehouse_id);
create index idx_shipments_dest_wh      on shipments(destination_warehouse_id);
create index idx_tracking_shipment_id   on tracking_events(shipment_id);
create index idx_tracking_created_at    on tracking_events(created_at desc);
```

## STEP 5 — RLS

```sql
alter table profiles         enable row level security;
alter table carriers         enable row level security;
alter table warehouses       enable row level security;
alter table drivers          enable row level security;
alter table routes           enable row level security;
alter table shipments        enable row level security;
alter table tracking_events  enable row level security;

create or replace function get_my_role()
returns text language sql security definer stable as $$
  select role from public.profiles where id = auth.uid()
$$;

-- profiles
create policy "profiles: read own"      on profiles for select using (auth.uid() = id);
create policy "profiles: admin read all" on profiles for select using (get_my_role() = 'admin');
create policy "profiles: update own"    on profiles for update using (auth.uid() = id);

-- carriers, warehouses, drivers, routes — authenticated read, admin/dispatcher write
create policy "carriers: auth read"           on carriers   for select using (auth.role() = 'authenticated');
create policy "carriers: adm-dis insert"      on carriers   for insert with check (get_my_role() in ('admin','dispatcher'));
create policy "carriers: adm-dis update"      on carriers   for update using (get_my_role() in ('admin','dispatcher'));
create policy "carriers: admin delete"        on carriers   for delete using (get_my_role() = 'admin');

create policy "warehouses: auth read"         on warehouses for select using (auth.role() = 'authenticated');
create policy "warehouses: adm-dis insert"    on warehouses for insert with check (get_my_role() in ('admin','dispatcher'));
create policy "warehouses: adm-dis update"    on warehouses for update using (get_my_role() in ('admin','dispatcher'));
create policy "warehouses: admin delete"      on warehouses for delete using (get_my_role() = 'admin');

create policy "drivers: auth read"            on drivers    for select using (auth.role() = 'authenticated');
create policy "drivers: adm-dis insert"       on drivers    for insert with check (get_my_role() in ('admin','dispatcher'));
create policy "drivers: adm-dis update"       on drivers    for update using (get_my_role() in ('admin','dispatcher'));
create policy "drivers: admin delete"         on drivers    for delete using (get_my_role() = 'admin');

create policy "routes: auth read"             on routes     for select using (auth.role() = 'authenticated');
create policy "routes: adm-dis insert"        on routes     for insert with check (get_my_role() in ('admin','dispatcher'));
create policy "routes: adm-dis update"        on routes     for update using (get_my_role() in ('admin','dispatcher'));
create policy "routes: admin delete"          on routes     for delete using (get_my_role() = 'admin');

-- shipments
create policy "shipments: adm-dis read"    on shipments for select using (get_my_role() in ('admin','dispatcher'));
create policy "shipments: customer own"    on shipments for select using (get_my_role() = 'customer' and customer_id = auth.uid());
create policy "shipments: adm-dis insert"  on shipments for insert with check (get_my_role() in ('admin','dispatcher'));
create policy "shipments: adm-dis update"  on shipments for update using (get_my_role() in ('admin','dispatcher'));
create policy "shipments: admin delete"    on shipments for delete using (get_my_role() = 'admin');

-- tracking_events
create policy "tracking: adm-dis read"    on tracking_events for select using (get_my_role() in ('admin','dispatcher'));
create policy "tracking: customer own"    on tracking_events for select using (
  get_my_role() = 'customer' and
  exists (select 1 from shipments s where s.id = tracking_events.shipment_id and s.customer_id = auth.uid())
);
create policy "tracking: adm-dis insert"  on tracking_events for insert with check (get_my_role() in ('admin','dispatcher'));
```

## STEP 6 — SEED DATA

### Carriers
```sql
insert into carriers (name, code, transport_mode, contact_name, contact_email, contact_phone, rating, status, notes) values
('Blue Dart Express',           'BDE-001','air',        'Rajesh Sharma',   'rajesh@bluedart.com',   '+91-9876543201',4.8,'active',  'Premium air freight India + international'),
('GATI Kintetsu Express',       'GKE-002','truck',      'Priya Mehta',     'priya@gati.com',        '+91-9876543202',4.2,'active',  'Pan-India road freight'),
('VRL Logistics',               'VRL-003','truck',      'Suresh Patil',    'suresh@vrl.com',        '+91-9876543203',4.5,'active',  'Largest LTL network, 1000+ locations'),
('Container Corporation India', 'CCI-004','rail',       'Anita Joshi',     'anita@concorindia.com', '+91-9876543204',4.0,'active',  'Government rail freight'),
('Maersk India',                'MSK-005','ocean',      'David Fernandes', 'david@maersk.in',       '+91-9876543205',4.6,'active',  'International ocean freight'),
('Delhivery',                   'DLV-006','truck',      'Kavya Nair',      'kavya@delhivery.com',   '+91-9876543206',4.3,'active',  'Tech-enabled, strong e-commerce'),
('Safexpress',                  'SFX-007','truck',      'Arjun Singh',     'arjun@safexpress.com',  '+91-9876543207',3.9,'active',  'Priority express, temp controlled'),
('TCI Freight',                 'TCI-008','intermodal', 'Meena Gupta',     'meena@tcifreight.com',  '+91-9876543208',4.1,'active',  'Multimodal road + rail'),
('Snowman Logistics',           'SNW-009','truck',      'Vikram Desai',    'vikram@snowman.in',     '+91-9876543209',4.4,'active',  'Cold chain specialist'),
('All Cargo Logistics',         'ACL-010','ocean',      'Riya Shah',       'riya@allcargo.com',     '+91-9876543210',3.8,'inactive','LCL ocean — under review');
```

### Warehouses
```sql
insert into warehouses (name, code, city, state, address, capacity_sqft, status, manager_name, contact_phone) values
('Ahmedabad Central Depot',  'WH-AMD-01','Ahmedabad','Gujarat',    'GIDC Estate, Naroda',         85000, 'active',     'Rohit Patel',    '+91-9876541001'),
('Mumbai Port Warehouse',    'WH-MUM-01','Mumbai',   'Maharashtra','JNPT Road, Nhava Sheva',      120000,'active',     'Sneha Kulkarni', '+91-9876541002'),
('Delhi NCR Logistics Park', 'WH-DEL-01','Gurugram', 'Haryana',    'NH-48, Sector 37',            95000, 'active',     'Amit Sharma',    '+91-9876541003'),
('Bangalore Tech Hub',       'WH-BLR-01','Bangalore','Karnataka',  'Electronic City Phase 2',     60000, 'active',     'Divya Rao',      '+91-9876541004'),
('Chennai Port Facility',    'WH-CHN-01','Chennai',  'Tamil Nadu', 'Manali Industrial Area',      75000, 'active',     'Karthik Iyer',   '+91-9876541005'),
('Kolkata East Depot',       'WH-KOL-01','Kolkata',  'West Bengal','Dankuni Industrial Complex',  55000, 'maintenance','Suparna Das',    '+91-9876541006');
```

### Drivers
```sql
insert into drivers (full_name, license_number, license_expiry, phone, email, carrier_id, vehicle_number, vehicle_type, status) values
('Ramesh Kumar Yadav',  'GJ01-2019-123456','2027-06-30','+91-9876542001','ramesh@gati.com',  (select id from carriers where code='GKE-002'),'GJ-01-XX-1234','truck',     'available'),
('Sunil Verma',         'MH02-2020-234567','2026-12-31','+91-9876542002','sunil@vrl.com',    (select id from carriers where code='VRL-003'),'MH-02-YY-5678','trailer',   'on_trip'),
('Mohan Das Prajapati', 'RJ03-2018-345678','2026-09-30','+91-9876542003','mohan@vrl.com',    (select id from carriers where code='VRL-003'),'RJ-03-ZZ-9012','truck',     'available'),
('Kishore Naik',        'KA04-2021-456789','2028-03-31','+91-9876542004','kishore@dlv.com',  (select id from carriers where code='DLV-006'),'KA-04-AA-3456','mini_truck','available'),
('Prakash Tiwari',      'UP05-2019-567890','2027-08-31','+91-9876542005','prakash@sfx.com',  (select id from carriers where code='SFX-007'),'UP-05-BB-7890','truck',     'on_trip'),
('Dinesh Solanki',      'GJ06-2020-678901','2026-11-30','+91-9876542006','dinesh@tci.com',   (select id from carriers where code='TCI-008'),'GJ-06-CC-2345','container', 'available'),
('Anil Chauhan',        'HR07-2022-789012','2029-01-31','+91-9876542007','anil@dlv.com',     (select id from carriers where code='DLV-006'),'HR-07-DD-6789','mini_truck','off_duty'),
('Vijay Patil',         'MH08-2018-890123','2025-12-31','+91-9876542008','vijay@snw.com',    (select id from carriers where code='SNW-009'),'MH-08-EE-0123','truck',     'available');
```

### Routes
```sql
insert into routes (name, origin_city, origin_state, destination_city, destination_state, distance_km, estimated_hours, transport_mode, toll_charges, is_active) values
('Ahmedabad–Mumbai Express', 'Ahmedabad','Gujarat',     'Mumbai',    'Maharashtra',545,  8.5, 'truck',     1200,true),
('Surat–Delhi Highway',      'Surat',    'Gujarat',     'Delhi',     'Delhi',      1100,18.0, 'truck',     2800,true),
('Mumbai–Chennai Coast',     'Mumbai',   'Maharashtra', 'Chennai',   'Tamil Nadu', 1338,22.0, 'truck',     3200,true),
('Pune–Bangalore NH',        'Pune',     'Maharashtra', 'Bangalore', 'Karnataka',  840, 14.0, 'truck',     1800,true),
('Kolkata–Hyderabad Rail',   'Kolkata',  'West Bengal', 'Hyderabad', 'Telangana',  1490,26.0, 'rail',      0,   true),
('Delhi–Jaipur Express',     'Delhi',    'Delhi',       'Jaipur',    'Rajasthan',  282,  4.5, 'truck',     600, true),
('Mumbai–Singapore Ocean',   'Mumbai',   'Maharashtra', 'Singapore', 'Singapore',  0,  168.0, 'ocean',     0,   true),
('Chennai–Kochi Coastal',    'Chennai',  'Tamil Nadu',  'Kochi',     'Kerala',     720, 12.0, 'truck',     1500,true);
```

### Shipments
```sql
insert into shipments (shipment_number, origin_city, origin_state, destination_city, destination_state, origin_warehouse_id, destination_warehouse_id, cargo_type, weight_kg, volume_cbm, status, carrier_id, driver_id, route_id, scheduled_pickup, scheduled_delivery, distance_km, freight_cost, notes) values
('TMS-2026-001','Ahmedabad','Gujarat','Mumbai','Maharashtra',   (select id from warehouses where code='WH-AMD-01'),(select id from warehouses where code='WH-MUM-01'),'electronics',850,4.2,'delivered',(select id from carriers where code='BDE-001'),null,(select id from routes where name='Ahmedabad–Mumbai Express'),'2026-03-01 09:00+05:30','2026-03-02 18:00+05:30',545,12500,'Laptop shipment for Infosys Mumbai'),
('TMS-2026-002','Surat','Gujarat','Delhi','Delhi',              (select id from warehouses where code='WH-AMD-01'),null,'general',2400,12.0,'in_transit',(select id from carriers where code='VRL-003'),(select id from drivers where license_number='MH02-2020-234567'),(select id from routes where name='Surat–Delhi Highway'),'2026-03-10 07:00+05:30','2026-03-13 17:00+05:30',1100,18000,'Textile goods for export hub'),
('TMS-2026-003','Mumbai','Maharashtra','Chennai','Tamil Nadu',  (select id from warehouses where code='WH-MUM-01'),(select id from warehouses where code='WH-CHN-01'),'perishable',1200,8.5,'in_transit',(select id from carriers where code='SNW-009'),(select id from drivers where license_number='GJ01-2019-123456'),(select id from routes where name='Mumbai–Chennai Coast'),'2026-03-11 06:00+05:30','2026-03-12 14:00+05:30',1338,22000,'Cold chain pharma — keep 2-8°C'),
('TMS-2026-004','Pune','Maharashtra','Bangalore','Karnataka',   null,(select id from warehouses where code='WH-BLR-01'),'fragile',320,2.1,'assigned',(select id from carriers where code='DLV-006'),(select id from drivers where license_number='KA04-2021-456789'),(select id from routes where name='Pune–Bangalore NH'),'2026-03-14 08:00+05:30','2026-03-15 20:00+05:30',840,8500,'Medical equipment for Apollo Hospital'),
('TMS-2026-005','Kolkata','West Bengal','Hyderabad','Telangana',(select id from warehouses where code='WH-KOL-01'),null,'general',5600,28.0,'confirmed',(select id from carriers where code='TCI-008'),null,(select id from routes where name='Kolkata–Hyderabad Rail'),'2026-03-15 07:00+05:30','2026-03-18 18:00+05:30',1490,35000,'Construction materials for IT park'),
('TMS-2026-006','Ahmedabad','Gujarat','Jaipur','Rajasthan',     (select id from warehouses where code='WH-AMD-01'),null,'general',900,6.0,'draft',null,null,(select id from routes where name='Delhi–Jaipur Express'),'2026-03-16 09:00+05:30','2026-03-18 17:00+05:30',735,9200,'Auto parts for Maruti dealer'),
('TMS-2026-007','Chennai','Tamil Nadu','Kochi','Kerala',         (select id from warehouses where code='WH-CHN-01'),null,'hazardous',780,5.5,'delayed',(select id from carriers where code='SFX-007'),(select id from drivers where license_number='UP05-2019-567890'),(select id from routes where name='Chennai–Kochi Coastal'),'2026-03-09 08:00+05:30','2026-03-10 16:00+05:30',720,15000,'Industrial chemicals — permit issue at Kerala border'),
('TMS-2026-008','Ahmedabad','Gujarat','Kolkata','West Bengal',  (select id from warehouses where code='WH-AMD-01'),(select id from warehouses where code='WH-KOL-01'),'electronics',1450,7.8,'in_transit',(select id from carriers where code='GKE-002'),(select id from drivers where license_number='GJ06-2020-678901'),null,'2026-03-11 10:00+05:30','2026-03-14 16:00+05:30',1960,28000,'Solar panel components for NTPC'),
('TMS-2026-009','Mumbai','Maharashtra','Singapore','Singapore', (select id from warehouses where code='WH-MUM-01'),null,'general',8200,42.0,'confirmed',(select id from carriers where code='MSK-005'),null,(select id from routes where name='Mumbai–Singapore Ocean'),'2026-03-20 00:00+05:30','2026-03-27 00:00+05:30',null,95000,'Export container — apparel'),
('TMS-2026-010','Kolkata','West Bengal','Ahmedabad','Gujarat',  (select id from warehouses where code='WH-KOL-01'),(select id from warehouses where code='WH-AMD-01'),'general',3200,18.0,'delivered',(select id from carriers where code='VRL-003'),(select id from drivers where license_number='RJ03-2018-345678'),null,'2026-03-05 07:00+05:30','2026-03-08 19:00+05:30',1580,22000,'Finished garments for textile market'),
('TMS-2026-011','Pune','Maharashtra','Ahmedabad','Gujarat',     null,(select id from warehouses where code='WH-AMD-01'),'perishable',650,4.0,'cancelled',null,null,null,'2026-03-12 06:00+05:30','2026-03-12 22:00+05:30',280,6500,'Wine shipment — cancelled by customer'),
('TMS-2026-012','Hyderabad','Telangana','Bangalore','Karnataka',null,(select id from warehouses where code='WH-BLR-01'),'oversized',4800,35.0,'assigned',(select id from carriers where code='TCI-008'),(select id from drivers where license_number='MH08-2018-890123'),(select id from routes where name='Pune–Bangalore NH'),'2026-03-15 08:00+05:30','2026-03-16 18:00+05:30',570,32000,'Heavy machinery — special permit required');
```

### Tracking Events
```sql
insert into tracking_events (shipment_id, event_type, old_status, new_status, description) values
((select id from shipments where shipment_number='TMS-2026-002'),'status_change',  'confirmed', 'assigned',  'VRL Logistics assigned'),
((select id from shipments where shipment_number='TMS-2026-002'),'status_change',  'assigned',  'in_transit','Picked up from Surat warehouse at 07:15 IST'),
((select id from shipments where shipment_number='TMS-2026-002'),'location_update',null,        null,        'Vehicle at Vadodara toll — on schedule'),
((select id from shipments where shipment_number='TMS-2026-003'),'status_change',  'confirmed', 'assigned',  'Snowman cold chain assigned'),
((select id from shipments where shipment_number='TMS-2026-003'),'status_change',  'assigned',  'in_transit','Pharma pickup confirmed. Temperature at 4°C.'),
((select id from shipments where shipment_number='TMS-2026-007'),'status_change',  'assigned',  'in_transit','Departed Chennai depot'),
((select id from shipments where shipment_number='TMS-2026-007'),'status_change',  'in_transit','delayed',   'Held at Kerala border — hazmat permit required. ETA +24 hours.'),
((select id from shipments where shipment_number='TMS-2026-001'),'status_change',  'assigned',  'in_transit','Departed Ahmedabad airport'),
((select id from shipments where shipment_number='TMS-2026-001'),'status_change',  'in_transit','delivered', 'Delivered to Infosys Mumbai. POD signed by Rajan Nair.');
```

## DASHBOARD QUERIES
```sql
select count(*) from shipments;                              -- total
select count(*) from shipments where status='in_transit';   -- in transit
select count(*) from shipments where status='delivered';    -- delivered
select count(*) from carriers  where status='active';       -- active carriers
select count(*) from drivers   where status='available';    -- available drivers
select count(*) from shipments where status='delayed';      -- delayed alert
```

## VERIFICATION
```sql
select table_name from information_schema.tables where table_schema='public' order by table_name;
-- carriers, drivers, profiles, routes, shipments, tracking_events, warehouses

select tablename, rowsecurity from pg_tables where schemaname='public';
-- all 7 tables: rowsecurity = true

select count(*) from carriers;        -- 10
select count(*) from warehouses;      -- 6
select count(*) from drivers;         -- 8
select count(*) from routes;          -- 8
select count(*) from shipments;       -- 12
select count(*) from tracking_events; -- 9

select status, count(*) from shipments group by status order by status;
-- assigned(2), cancelled(1), confirmed(2), delayed(1), delivered(2), draft(1), in_transit(3)
```

---
*7 tables | 3NF | ACID | RLS enforced | NextGen TMS Platform*