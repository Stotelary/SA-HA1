# 404 Service - Servicio no encontrado... hasta ahora.

Este repositorio contiene el código fuente de un sitio web que está siendo desarrollado en el contexto del bootcamp de Desarrollo Web Full-Stack Java de Generation Chile. Está pensado como un servicio de E-commerce en que usuarios puedan contratar servicios de prestadores verificados, de manera fácil, rápida y segura. El proyecto está actualmente estructurado para ofrecer una página de inicio, una sección de servicios y un catálogo de productos.

## 📋 Descripción del Proyecto

El proyecto **404 Service** es una aplicación web que presenta información organizada en diferentes secciones.

### 🚀 Características Principales
* **Página de Inicio (`index.html`):** Punto de entrada principal al sitio web.
* **Catálogo (`catalogo.html`):** Sección dedicada a mostrar la totqalidad de productos ofertados. Dado que en la versión actual no hay backend implementado, estos datos están provistos desde un archivo Jason, creado para prueba.
* **Servicios (`servicio.html`):** Página informativa sobre cada servicio específico, incluyendo la funcionalidad de agendar. Actualmente solo está implementada para uno de los servicios.

## 🛠️ Tecnologías Utilizadas

* **HTML5**: Estructura semántica de las páginas.
* **CSS3**: Estilos y diseño visual (ubicados en `assets`).
* **JavaScript**: Lógica de interacción y manipulación del DOM.
* **Node.js / NPM**: Para la gestión de dependencias y entorno de desarrollo.

## 📂 Estructura del Proyecto

```text
SA-HA1/
├── assets/          # Recursos estáticos (Imágenes, CSS, JS)
├── data/            # Archivos de datos (probablemente JSON)
├── .vscode/         # Configuración del editor VS Code
├── catalogo.html    # Página del catálogo
├── index.html       # Página principal
├── servicio.html    # Página de servicios
├── package.json     # Configuración de dependencias y scripts
└── README.md        # Documentación del proyecto
```

# 🔧 Instalación y Uso
Este proyecto está desplegado en Github pages, por lo que puedes visualizarlo siguiendo [este enlace](https://stotelary.github.io/SA-HA1/#)
Si deseas visualizarlo o modificarlo en tu máquina local, sigue estos pasos:

Clonar el repositorio:

```Bash
git clone [https://github.com/Stotelary/SA-HA1.git](https://github.com/Stotelary/SA-HA1.git)
```

Navegar al directorio del proyecto:

```Bash
cd SA-HA1
```

## 🗂️ Ejecutar el proyecto:
Si tienes la extensión "Live Server" en VS Code, puedes abrir index.html y dar clic en "Go Live".

## 📚Sobre la base de datos
La base de datos contempla seis entidades (usuario, servicio, disponibilidad de servicio, imágenes de servicio, contratación y reseña), cuyos contenidos y relaciones se grafican a en el siguiente diagrama:

 ![Diagrama entidad-relación](https://i.imgur.com/EBhS9fA.png)

Y el script utilizado para crear las tablas en MySQL es el siguiente:
```
CREATE DATABASE 404_services
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE 404_services;

CREATE TABLE usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    direccion VARCHAR(100) NOT NULL,
    telefono VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    prestador BOOLEAN,-- PRESTADOR DE SERVICION O CLIENTE
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE servicio (
    id_servicio INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL, -- profesional
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    modalidad TINYINT NOT NULL,-- 1presencial 2online 3hibrido
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON DELETE CASCADE
);

CREATE TABLE servicio_disponibilidad (
    id_disponibilidad INT AUTO_INCREMENT PRIMARY KEY,
    id_servicio INT NOT NULL,
    dia_semana TINYINT NOT NULL, -- 1=Lunes ... 7=Domingo
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    FOREIGN KEY (id_servicio)
        REFERENCES servicio(id_servicio)
        ON DELETE CASCADE,
    CHECK (hora_inicio < hora_fin),
    UNIQUE (id_servicio, dia_semana, hora_inicio, hora_fin)
);

CREATE TABLE servicio_imagen (
    id_imagen INT AUTO_INCREMENT PRIMARY KEY,
    id_servicio INT NOT NULL,
    imagen_url VARCHAR(255) NOT NULL,
    orden INT NOT NULL,
    FOREIGN KEY (id_servicio)
        REFERENCES servicio(id_servicio)
        ON DELETE CASCADE,
    UNIQUE (id_servicio, orden)
);


CREATE TABLE contratacion (
    id_contratacion INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,   -- cliente
    id_servicio INT NOT NULL,
    fecha DATE NOT NULL,
    descripcion TEXT,
    estado VARCHAR(20) NOT NULL,
    -- PENDIENTE | REALIZADO | CANCELADO
    FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario),
    FOREIGN KEY (id_servicio)
        REFERENCES servicio(id_servicio),
    UNIQUE (id_usuario, id_servicio, fecha)
);

CREATE TABLE resena (
    id_resena INT AUTO_INCREMENT PRIMARY KEY,
    id_contratacion INT NOT NULL UNIQUE,
    calificacion TINYINT NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
    comentario TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_contratacion)
        REFERENCES contratacion(id_contratacion)
        ON DELETE CASCADE
);
```


# ✒️ Autores
## Equipo 6 "404 Syndicate":
* Ariel Norambuena ([perfil de GitHub](https://github.com/Stotelary))
* Bayron Benavides ([perfil de GitHub](https://github.com/BayronBA))
* Camila San Martín ([perfil de GitHub](https://github.com/Camimi-96))
* Cristian Delgadillo ([perfil de GitHub](https://github.com/cristiandelgadillo))
* Francesca Carcamo ([perfil de GitHub](https://github.com/Fraan97))
* Luis Gonzáles ([perfil de GitHub](https://github.com/hnxvxzls))
* Matías Pérez ([perfil de GitHub](https://github.com/Mbatiass))
