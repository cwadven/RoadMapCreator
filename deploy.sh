cd /var/www/roadmap/web/project/roadmapcreator && yarn build 2>&1
. /var/www/roadmap/venv/bin/activate && python /var/www/roadmap/manage.py collectstatic --noinput
. /var/www/roadmap/venv/bin/activate && python /var/www/roadmap/manage.py migrate --noinput
systemctl restart nginx
systemctl restart uwsgi
