FROM php:8.5-apache

ARG CIVICRM_VERSION
ARG CIVICRM_SHA256

ENV APACHE_DOCUMENT_ROOT=/var/www/civicrm

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
      curl \
      default-mysql-client \
      libcurl4-openssl-dev \
      libfreetype6-dev \
      libicu-dev \
      libjpeg62-turbo-dev \
      libonig-dev \
      libpng-dev \
      libxml2-dev \
      libzip-dev \
      unzip \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    # One compiler process keeps the local VM's memory use predictable during the first build. \
    && (docker-php-ext-install -j1 bcmath curl gd intl mbstring mysqli pdo_mysql soap zip > /tmp/php-ext-build.log 2>&1 \
      || { tail -n 120 /tmp/php-ext-build.log; exit 1; }) \
    && a2enmod expires headers rewrite \
    && rm -rf /var/lib/apt/lists/*

RUN curl --fail --location --retry 3 --output /tmp/civicrm.tar.gz \
      "https://download.civicrm.org/civicrm-${CIVICRM_VERSION}-standalone.tar.gz" \
    && echo "${CIVICRM_SHA256}  /tmp/civicrm.tar.gz" | sha256sum --check - \
    && mkdir -p /var/www/civicrm \
    && tar --extract --gzip --file /tmp/civicrm.tar.gz --strip-components=1 --directory /var/www/civicrm \
    && rm /tmp/civicrm.tar.gz \
    && chown -R www-data:www-data /var/www/civicrm

COPY apache-vhost.conf /etc/apache2/sites-available/000-default.conf

WORKDIR /var/www/civicrm
