Sustentable - Relevamiento Operaciones (Portainer)

Archivos principales:
- index.html + app.js: interfaz editable de tickets.
- server.py: API, guardado y exportación/importación Excel.
- seed.xlsx: planilla inicial que se carga la primera vez.
- Dockerfile: imagen Python con openpyxl.

Columnas soportadas:
- Item
- Ticket
- Aplicación
- Detalle
- Fecha estimada de resolución
- Horas estimadas desarrollo
- Estado (abierto / cerrado)

Subir a GitHub (desde tu PC):
1. Creá un repo vacío en https://github.com/new (sin README ni .gitignore).
2. En PowerShell:

   cd C:\Users\ARIEL-ROSETI\Downloads\sustentable
   git remote add origin https://github.com/TU-USUARIO/sustentable-tickets.git
   git push -u origin main

Despliegue en Portainer desde GitHub:
1. En Portainer: Stacks > Add stack.
2. Name: sustentable-tickets
3. Build method: Repository
4. Repository URL: https://github.com/TU-USUARIO/sustentable-tickets
5. Repository reference: main
6. Compose path: portainer-stack.yml
7. Deploy the stack
8. Abrilo en http://IP-DE-TU-SERVIDOR:8090

Despliegue en Portainer (Web editor, sin Git):
1. Subí esta carpeta al servidor.
2. En Portainer: Stacks > Add stack.
3. Usá el contenido de portainer-stack.yml o este compose:

services:
  sustentable-tickets:
    build: .
    container_name: sustentable-tickets
    restart: unless-stopped
    ports:
      - "8090:8000"
    volumes:
      - sustentable-data:/data

volumes:
  sustentable-data:

4. Deploy the stack.
5. Abrilo en http://IP-DE-TU-SERVIDOR:8090

Funciones de la app:
- Editar todas las columnas en la web.
- Guardar cambios en el volumen /data.
- Exportar a Excel.
- Importar Excel con las mismas columnas.
- Filtrar por Tickets abiertos / Tickets cerrados.

Notas:
- Si el puerto 8090 está ocupado, cambialo por otro, por ejemplo "8091:8000".
- Los datos quedan en el volumen sustentable-data.
