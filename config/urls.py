import debug_toolbar
from django.contrib import admin
from django.urls import path, include
from django.conf.urls import url

from django.conf import settings
from django.conf.urls.static import static

from django.views.generic import TemplateView

from web.views import home

routes = settings.REACT_ROUTES

urlpatterns = [
    url(r'^(%s)?$' % '|'.join(routes), TemplateView.as_view(template_name="index.html"), name='index'),
    path('', home, name='home'),
    path('admin', admin.site.urls),

    # 회원
    path('api/accounts', include('accounts.urls')),
    path('api/roadmap', include('roadmap.urls')),

    path('__debug__/', include(debug_toolbar.urls)),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)