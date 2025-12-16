# 🚀 GHID DOCKER - O SINGURĂ COMANDĂ!

## ✅ PORNIRE COMPLETĂ (Prima dată sau după modificări)

```bash
docker-compose up --build
```

**Asta e tot!** O singură comandă pornește întreaga aplicație! 🎉

---

## 📊 CE SE ÎNTÂMPLĂ AUTOMAT:

1. ✅ **PostgreSQL** pornește și se inițializează
2. ✅ **Migrations** rulează automat (dacă există în `/backend/migrations`)
3. ✅ **Backend** așteaptă până PostgreSQL e gata 100%
4. ✅ **Frontend** așteaptă backend-ul
5. ✅ **Nginx** pornește ultimul și rutează tot
6. ✅ **Auto-restart** dacă vreun container cade

**Timpul de pornire**: ~30-60 secunde prima dată (build), ~10-20 secunde după

---

## 🎯 COMENZI UTILE

### **Pornire (după primul build)**
```bash
docker-compose up
```
Nu mai trebuie `--build` dacă nu ai modificat codul.

---

### **Pornire în background (detached mode)**
```bash
docker-compose up -d
```
Rulează în fundal, fără output în terminal.

---

### **Oprire**
```bash
docker-compose down
```
Oprește toate containerele.

---

### **Oprire + Ștergere Volume (Database Reset)**
```bash
docker-compose down -v
```
⚠️ **ATENȚIE**: Șterge și datele din PostgreSQL!

---

### **Rebuild forțat (dacă ceva nu merge)**
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up
```

---

### **Vezi logs în timp real**
```bash
# Toate serviciile
docker-compose logs -f

# Doar backend
docker-compose logs -f backend

# Doar postgres
docker-compose logs -f postgres
```

---

### **Verifică status containere**
```bash
docker-compose ps
```

---

### **Restart un singur serviciu**
```bash
docker-compose restart backend
docker-compose restart frontend
docker-compose restart postgres
```

---

## 🌐 ACCESARE APLICAȚIE

După pornire, aplicația e disponibilă la:

- **Frontend (Next.js)**: http://localhost:3000
- **Backend (Express API)**: http://localhost:5000
- **Nginx (Proxy)**: http://localhost:80
- **PostgreSQL**: localhost:5432

---

## 🔍 DEBUG & TROUBLESHOOTING

### **1. Backend nu se conectează la PostgreSQL**

```bash
# Verifică dacă postgres e healthy
docker-compose ps

# Dacă postgres nu e healthy, vezi logs
docker-compose logs postgres
```

**Soluție**: Așteaptă 5-10 secunde și reîncearcă. Healthcheck-ul ar trebui să rezolve automat.

---

### **2. Port deja ocupat (5000, 3000, 80)**

```bash
# Windows - vezi ce folosește portul
netstat -ano | findstr :5000
netstat -ano | findstr :3000

# Oprește procesul sau schimbă portul în docker-compose.yml
```

---

### **3. Build fail sau erori de dependențe**

```bash
# Rebuild fără cache
docker-compose build --no-cache backend
docker-compose build --no-cache frontend

# Sau toate
docker-compose build --no-cache
```

---

### **4. Database nu are schema/migrations**

Verifică dacă fișierul SQL e în `backend/migrations/`:
```bash
ls backend/migrations/
```

Dacă nu există, containerul postgres va porni gol. Rulează manual:
```bash
docker-compose exec backend node migrate.js
# sau conectează-te direct
docker-compose exec postgres psql -U postgres -d cvisor_db -f /docker-entrypoint-initdb.d/001_init.sql
```

---

### **5. Frontend nu găsește backend**

Verifică environment variables în `docker-compose.yml`:
```yaml
environment:
  - NEXT_PUBLIC_API_URL=http://localhost:5000
  - API_URL=http://backend:5000
```

Prima e pentru browser, a doua pentru server-side rendering.

---

## 🧹 CURĂȚARE COMPLETĂ

Dacă vrei să cureți totul și să începi fresh:

```bash
# Oprește tot
docker-compose down -v

# Șterge imagini
docker-compose rm -f

# Șterge volumes orfani
docker volume prune

# Pornește fresh
docker-compose up --build
```

---

## 📦 STRUCTURA NETWORK

Toate containerele comunică prin network-ul `cvisor-network`:

```
cvisor-network (bridge)
├── cvisor_postgres   (postgres:5432)
├── cvisor_backend    (backend:5000)
├── cvisor_frontend   (frontend:3000)
└── cvisor_nginx      (nginx:80)
```

**Avantaje**:
- ✅ Izolare de alte containere Docker
- ✅ DNS automat (backend găsește postgres prin nume)
- ✅ Securitate mai bună

---

## 🎯 WORKFLOW DEVELOPMENT

### **Modifici Backend:**
```bash
# Oprește backend
docker-compose stop backend

# Rebuild și restart
docker-compose up -d --build backend

# Sau, pentru development rapid
docker-compose restart backend
```

### **Modifici Frontend:**
```bash
docker-compose stop frontend
docker-compose up -d --build frontend
```

### **Modifici Database Schema:**
```bash
# Adaugă migration în backend/migrations/
# Apoi
docker-compose down
docker-compose up --build
```

---

## ✅ CHECKLIST ÎNAINTE DE DEPLOY

- [ ] `.env` configurat corect (PostgreSQL credentials)
- [ ] `backend/.env` configurat (JWT_SECRET, EMAIL, etc.)
- [ ] Migrations în `backend/migrations/`
- [ ] Dockerfile-urile sunt pentru production (nu dev mode)
- [ ] Ports 80, 443, 5000, 3000, 5432 disponibile
- [ ] Docker și docker-compose instalate

---

## 📝 EXEMPLE DE COMENZI COMPLETE

### **Pornire normală (prima dată)**
```bash
cd C:\Users\fmrac\OneDrive\CVisor
docker-compose up --build
```

### **Pornire în background**
```bash
cd C:\Users\fmrac\OneDrive\CVisor
docker-compose up -d --build
```

### **Oprire și clean**
```bash
docker-compose down
```

### **Restart complet**
```bash
docker-compose down
docker-compose up --build
```

---

## 🎉 SUCCES!

După `docker-compose up --build`, aplicația va fi disponibilă în 30-60 secunde!

**Acces direct**:
- http://localhost:3000 → Frontend
- http://localhost:5000/hello → Backend health check
- http://localhost:80 → Nginx (routing complet)

---

**Autor**: Claude Code Docker Setup
**Data**: 12 Decembrie 2025
**Versiune Docker**: 3.8
