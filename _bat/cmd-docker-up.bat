@echo off
cd ..
call npm run build
docker compose down
docker compose up --detach --build
docker compose logs -f
cmd /k


