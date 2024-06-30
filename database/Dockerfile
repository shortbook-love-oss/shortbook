# Ubuntu MariaDB 11.4.2
FROM mariadb:11.4.2

# Set OS timezone to UTC
# MariaDB timezone to match OS setting by default
ENV TZ=UTC

# Apply config that changed charaset to "utf8mb4_bin"
COPY ./database/mariadb.cnf /etc/mysql/mariadb.cnf

# for "docker run -P" command
EXPOSE 3306
